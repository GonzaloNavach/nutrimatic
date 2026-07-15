/**
 * Calcula Requirements a partir del perfil del paciente.
 * Energía: Schofield (FAO/WHO) × PAL × objetivo (+ gestación/lactancia).
 * Fallback: tablas CENAN poblacionales si falta peso.
 * Micros: tablas CENAN/INS.
 */

import {
  LACTATION_KCAL_ADDON,
  lookupCenanPopulationEnergy,
  PREGNANCY_KCAL_ADDON,
} from "./cenanEnergyTables";
import { lookupCenanMicronutrients } from "./cenanMicronutrients";
import type {
  ActivityLevel,
  EnergyGoal,
  PatientProfile,
  Sex,
} from "./patientProfile";
import type { Requirements } from "./types";

export const EMPTY_REQUIREMENTS: Requirements = {
  energy: 0,
  proteinTotal: 0,
  proteinAnimal: 0,
  proteinVegetal: 0,
  fatTotal: 0,
  carbs: 0,
  fiber: 0,
  calcium: 0,
  phosphorus: 0,
  zinc: 0,
  iron: 0,
  sodium: 0,
  potassium: 0,
  vitaminA: 0,
  retinol: 0,
  thiamin: 0,
  riboflavin: 0,
  niacin: 0,
  vitaminC: 0,
  folicAcid: 0,
};

/** PAL clínicos alineados a rangos FAO 2004 / UI ligera-moderada-intensa. */
export const PAL_BY_ACTIVITY: Record<ActivityLevel, number> = {
  light: 1.55,
  moderate: 1.75,
  intense: 2.0,
};

const GOAL_FACTOR: Record<EnergyGoal, number> = {
  maintain: 1,
  deficit: 0.85,
  surplus: 1.1,
};

export type EnergyCalcSource = "schofield" | "cenan_table";

export interface RequirementCalcMeta {
  bmr: number | null;
  pal: number | null;
  teeBeforeAdjust: number | null;
  energySource: EnergyCalcSource;
  imc: number | null;
  notes: string[];
  errors: string[];
}

export interface RequirementCalculation {
  ok: boolean;
  requirements: Requirements;
  meta: RequirementCalcMeta;
}

/**
 * TMB Schofield 1985 (kcal/día), peso en kg.
 * FAO/WHO/UNU — base metodológica usada en lineamientos CENAN.
 */
export function schofieldBmr(
  sex: Sex,
  ageYears: number,
  weightKg: number
): number {
  const w = weightKg;
  const male = sex === "male";

  if (ageYears < 3) {
    return male ? 60.9 * w - 54 : 61.0 * w - 51;
  }
  if (ageYears < 10) {
    return male ? 22.7 * w + 495 : 22.5 * w + 499;
  }
  if (ageYears < 18) {
    return male ? 17.686 * w + 658.2 : 13.384 * w + 692.6;
  }
  if (ageYears < 30) {
    return male ? 15.057 * w + 692.2 : 14.818 * w + 486.6;
  }
  if (ageYears < 60) {
    return male ? 11.472 * w + 873.1 : 8.126 * w + 845.6;
  }
  return male ? 11.711 * w + 587.7 : 9.082 * w + 658.5;
}

function proteinGPerKg(
  age: number,
  physio: PatientProfile["physioState"],
  sex: Sex
): number {
  if (physio === "pregnancy" && sex === "female") return 1.1;
  if (physio === "lactation" && sex === "female") return 1.1;
  if (age < 18) return 0.95;
  return 0.8;
}

function buildMacros(
  energyKcal: number,
  weightKg: number | null,
  age: number,
  physio: PatientProfile["physioState"],
  sex: Sex
): Pick<
  Requirements,
  "proteinTotal" | "fatTotal" | "carbs" | "fiber"
> {
  const gPerKg = proteinGPerKg(age, physio, sex);
  let protein =
    weightKg != null && weightKg > 0
      ? gPerKg * weightKg
      : (energyKcal * 0.15) / 4;

  const proteinMinFromEnergy = (energyKcal * 0.1) / 4;
  protein = Math.max(protein, proteinMinFromEnergy);

  const fat = (energyKcal * 0.3) / 9;
  const carbs = Math.max(0, (energyKcal - protein * 4 - fat * 9) / 4);
  const fiber = Math.max(20, (14 * energyKcal) / 1000);

  return {
    proteinTotal: round1(protein),
    fatTotal: round1(fat),
    carbs: round1(carbs),
    fiber: round1(fiber),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round0(n: number): number {
  return Math.round(n);
}

export function canCalculateRequirements(profile: PatientProfile): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!profile.sex) missing.push("sexo");
  if (profile.ageYears == null || profile.ageYears <= 0) missing.push("edad");
  const hasWeight =
    profile.weightKg != null && profile.weightKg > 0;
  const canUseTable =
    profile.ageYears != null &&
    profile.ageYears >= 12 &&
    Boolean(profile.sex);
  if (!hasWeight && !canUseTable) {
    missing.push("peso (o edad ≥12 para tabla CENAN)");
  }
  return { ready: missing.length === 0, missing };
}

export function calculatePatientRequirements(
  profile: PatientProfile
): RequirementCalculation {
  const notes: string[] = [];
  const errors: string[] = [];
  const gate = canCalculateRequirements(profile);
  if (!gate.ready) {
    return {
      ok: false,
      requirements: EMPTY_REQUIREMENTS,
      meta: {
        bmr: null,
        pal: null,
        teeBeforeAdjust: null,
        energySource: "schofield",
        imc: null,
        notes,
        errors: [`Faltan: ${gate.missing.join(", ")}`],
      },
    };
  }

  const sex = profile.sex as Sex;
  const age = profile.ageYears as number;
  const weight = profile.weightKg;
  const height = profile.heightCm;
  const pal = PAL_BY_ACTIVITY[profile.activity];
  const goalFactor = GOAL_FACTOR[profile.goal];

  let imc: number | null = null;
  if (weight != null && weight > 0 && height != null && height > 0) {
    const m = height / 100;
    imc = Math.round((weight / (m * m)) * 10) / 10;
  }

  let bmr: number | null = null;
  let teeBeforeAdjust: number | null = null;
  let energySource: EnergyCalcSource = "schofield";
  let energy = 0;

  if (weight != null && weight > 0) {
    bmr = schofieldBmr(sex, age, weight);
    teeBeforeAdjust = bmr * pal;
    energy = teeBeforeAdjust;

    if (profile.physioState === "pregnancy" && sex === "female") {
      const add = PREGNANCY_KCAL_ADDON[profile.pregnancyTrimester];
      energy += add;
      notes.push(`+${add} kcal gestación T${profile.pregnancyTrimester} (CENAN).`);
    } else if (profile.physioState === "lactation" && sex === "female") {
      energy += LACTATION_KCAL_ADDON;
      notes.push(`+${LACTATION_KCAL_ADDON} kcal lactancia (aprox. CENAN/guías).`);
    }

    if (profile.goal !== "maintain") {
      if (
        profile.physioState === "pregnancy" ||
        profile.physioState === "lactation"
      ) {
        notes.push(
          "Objetivo déficit/superávit no aplicado en gestación/lactancia."
        );
      } else {
        energy *= goalFactor;
        notes.push(
          profile.goal === "deficit"
            ? "Objetivo déficit −15% sobre GET."
            : "Objetivo superávit +10% sobre GET."
        );
      }
    }

    energySource = "schofield";
    notes.push("Energía: TMB Schofield × PAL (FAO/WHO).");
  } else {
    const table = lookupCenanPopulationEnergy({
      sex,
      ageYears: age,
      activity: profile.activity,
      residence: profile.residence,
      physioState: profile.physioState,
      pregnancyTrimester: profile.pregnancyTrimester,
      lactationSemester: profile.lactationSemester,
    });
    if (!table) {
      errors.push(
        "Sin peso y sin fila CENAN para esa edad; ingresá peso (kg)."
      );
      return {
        ok: false,
        requirements: EMPTY_REQUIREMENTS,
        meta: {
          bmr: null,
          pal,
          teeBeforeAdjust: null,
          energySource: "cenan_table",
          imc,
          notes,
          errors,
        },
      };
    }
    energy = table.kcal;
    energySource = "cenan_table";
    notes.push(table.note);
    notes.push(
      "Sin peso: no se aplicó factor de objetivo sobre la tabla (solo actividad/área)."
    );
    if (profile.goal === "deficit") {
      energy *= 0.85;
      notes.push("Se aplicó −15% de objetivo sobre kcal de tabla.");
    } else if (profile.goal === "surplus") {
      energy *= 1.1;
      notes.push("Se aplicó +10% de objetivo sobre kcal de tabla.");
    }
  }

  if (age < 12) {
    notes.push(
      "Menores de 12: cálculo experimental; revisá metas con tablas pediátricas."
    );
  }

  const micros = lookupCenanMicronutrients({
    sex,
    ageYears: age,
    bioavailability: profile.bioavailability,
    physioState: profile.physioState,
    pregnancyTrimester: profile.pregnancyTrimester,
    lactationSemester: profile.lactationSemester,
  });
  notes.push(...micros.notes);
  notes.push("Micros: tablas CENAN/INS (Alimentación Saludable).");

  const macros = buildMacros(
    energy,
    weight,
    age,
    profile.physioState,
    sex
  );

  const requirements: Requirements = {
    ...EMPTY_REQUIREMENTS,
    energy: round0(energy),
    ...macros,
    calcium: micros.calcium,
    phosphorus: micros.phosphorus,
    zinc: micros.zinc,
    iron: micros.iron,
    sodium: micros.sodium,
    potassium: micros.potassium,
    vitaminA: micros.vitaminA,
    thiamin: micros.thiamin,
    riboflavin: micros.riboflavin,
    niacin: micros.niacin,
    vitaminC: micros.vitaminC,
    folicAcid: micros.folicAcid,
  };

  return {
    ok: true,
    requirements,
    meta: {
      bmr: bmr != null ? round0(bmr) : null,
      pal,
      teeBeforeAdjust:
        teeBeforeAdjust != null ? round0(teeBeforeAdjust) : null,
      energySource,
      imc,
      notes,
      errors,
    },
  };
}
