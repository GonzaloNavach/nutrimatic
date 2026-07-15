/**
 * Energía poblacional CENAN/INS (fallback cuando falta peso).
 * Fuente: alimentacionsaludable.ins.gob.pe — Informe técnico energía población peruana.
 */

import type {
  ActivityLevel,
  LactationSemester,
  PhysiologicalState,
  PregnancyTrimester,
  ResidenceArea,
  Sex,
} from "./patientProfile";

type LigeroRow = { light: number; notLight: number };

function activityToLigero(activity: ActivityLevel): "light" | "notLight" {
  return activity === "light" ? "light" : "notLight";
}

function pickArea(
  area: ResidenceArea,
  urban: LigeroRow,
  rural: LigeroRow,
  national: number,
  activity: ActivityLevel
): number {
  const key = activityToLigero(activity);
  if (area === "national") return national;
  if (area === "rural") return rural[key];
  return urban[key];
}

/** Adultos 18–59 */
const ADULT_MALE: Record<"young" | "adult", { urban: LigeroRow; rural: LigeroRow; national: number }> = {
  young: {
    urban: { light: 2488, notLight: 2969 },
    rural: { light: 2584, notLight: 3053 },
    national: 2689,
  },
  adult: {
    urban: { light: 2416, notLight: 2883 },
    rural: { light: 2523, notLight: 2981 },
    national: 2634,
  },
};

const ADULT_FEMALE: Record<"young" | "adult", { urban: LigeroRow; rural: LigeroRow; national: number }> = {
  young: {
    urban: { light: 1948, notLight: 2325 },
    rural: { light: 2024, notLight: 2393 },
    national: 2045,
  },
  adult: {
    urban: { light: 1950, notLight: 2327 },
    rural: { light: 2056, notLight: 2429 },
    national: 2080,
  },
};

/** Adolescentes: edad → urbano/rural ligera/no ligera + nacional */
const ADOLESCENT_ENERGY: Record<
  Sex,
  Record<number, { urban: LigeroRow; rural: LigeroRow; national: number }>
> = {
  male: {
    12: { urban: { light: 2057, notLight: 2443 }, rural: { light: 1890, notLight: 2289 }, national: 2139 },
    13: { urban: { light: 2251, notLight: 2673 }, rural: { light: 2061, notLight: 2496 }, national: 2338 },
    14: { urban: { light: 2396, notLight: 2846 }, rural: { light: 2277, notLight: 2759 }, national: 2515 },
    15: { urban: { light: 2531, notLight: 3008 }, rural: { light: 2417, notLight: 2929 }, national: 2660 },
    16: { urban: { light: 2592, notLight: 3081 }, rural: { light: 2521, notLight: 3057 }, national: 2739 },
    17: { urban: { light: 2670, notLight: 3176 }, rural: { light: 2581, notLight: 3132 }, national: 2817 },
  },
  female: {
    12: { urban: { light: 1872, notLight: 2179 }, rural: { light: 1784, notLight: 2117 }, national: 1894 },
    13: { urban: { light: 1929, notLight: 2247 }, rural: { light: 1885, notLight: 2239 }, national: 1966 },
    14: { urban: { light: 1973, notLight: 2298 }, rural: { light: 1941, notLight: 2305 }, national: 2015 },
    15: { urban: { light: 2013, notLight: 2346 }, rural: { light: 1973, notLight: 2345 }, national: 2053 },
    16: { urban: { light: 2033, notLight: 2371 }, rural: { light: 1995, notLight: 2372 }, national: 2075 },
    17: { urban: { light: 2038, notLight: 2377 }, rural: { light: 2011, notLight: 2393 }, national: 2083 },
  },
};

/** Gestante: valores urbanos/rurales por trimestre (joven / adulto). */
const PREGNANCY_ENERGY: Record<
  "young" | "adult",
  Record<PregnancyTrimester, { urban: LigeroRow; rural: LigeroRow; national: number }>
> = {
  young: {
    1: { urban: { light: 2033, notLight: 2410 }, rural: { light: 2109, notLight: 2478 }, national: 2130 },
    2: { urban: { light: 2233, notLight: 2610 }, rural: { light: 2309, notLight: 2678 }, national: 2330 },
    3: { urban: { light: 2423, notLight: 2800 }, rural: { light: 2499, notLight: 2868 }, national: 2520 },
  },
  adult: {
    1: { urban: { light: 1950, notLight: 2327 }, rural: { light: 2056, notLight: 2429 }, national: 2080 },
    2: { urban: { light: 2235, notLight: 2612 }, rural: { light: 2341, notLight: 2714 }, national: 2365 },
    3: { urban: { light: 2425, notLight: 2802 }, rural: { light: 2531, notLight: 2904 }, national: 2555 },
  },
};

const LACTATION_ENERGY: Record<
  "young" | "adult",
  Record<LactationSemester, { urban: LigeroRow; rural: LigeroRow; national: number }>
> = {
  young: {
    1: { urban: { light: 2453, notLight: 2830 }, rural: { light: 2529, notLight: 2898 }, national: 2550 },
    2: { urban: { light: 2408, notLight: 2785 }, rural: { light: 2484, notLight: 2853 }, national: 2505 },
  },
  adult: {
    1: { urban: { light: 2370, notLight: 2747 }, rural: { light: 2476, notLight: 2849 }, national: 2500 },
    2: { urban: { light: 2325, notLight: 2702 }, rural: { light: 2431, notLight: 2804 }, national: 2455 },
  },
};

function adultBand(age: number): "young" | "adult" {
  return age < 30 ? "young" : "adult";
}

/** Adiciones CENAN sobre GET basal si se usa Schofield (kcal/día). */
export const PREGNANCY_KCAL_ADDON: Record<PregnancyTrimester, number> = {
  1: 85,
  2: 285,
  3: 475,
};

/** Aprox. lactancia: diferencia típica CENAN vs no lactante (~500 kcal). */
export const LACTATION_KCAL_ADDON = 500;

export function lookupCenanPopulationEnergy(input: {
  sex: Sex;
  ageYears: number;
  activity: ActivityLevel;
  residence: ResidenceArea;
  physioState: PhysiologicalState;
  pregnancyTrimester: PregnancyTrimester;
  lactationSemester: LactationSemester;
}): { kcal: number; note: string } | null {
  const {
    sex,
    ageYears: age,
    activity,
    residence,
    physioState,
    pregnancyTrimester,
    lactationSemester,
  } = input;

  if (physioState === "pregnancy" && sex === "female" && age >= 18) {
    const band = adultBand(Math.min(age, 50));
    const row = PREGNANCY_ENERGY[band][pregnancyTrimester];
    return {
      kcal: pickArea(residence, row.urban, row.rural, row.national, activity),
      note: `Energía CENAN gestante T${pregnancyTrimester} (tabla poblacional).`,
    };
  }

  if (physioState === "lactation" && sex === "female" && age >= 18) {
    const band = adultBand(Math.min(age, 50));
    const row = LACTATION_ENERGY[band][lactationSemester];
    return {
      kcal: pickArea(residence, row.urban, row.rural, row.national, activity),
      note: `Energía CENAN lactancia semestre ${lactationSemester} (tabla poblacional).`,
    };
  }

  if (age >= 12 && age <= 17) {
    const row = ADOLESCENT_ENERGY[sex][age];
    if (!row) return null;
    return {
      kcal: pickArea(residence, row.urban, row.rural, row.national, activity),
      note: "Energía CENAN adolescente (tabla poblacional).",
    };
  }

  if (age >= 18 && age <= 59) {
    const band = adultBand(age);
    const table = sex === "male" ? ADULT_MALE : ADULT_FEMALE;
    const row = table[band];
    return {
      kcal: pickArea(residence, row.urban, row.rural, row.national, activity),
      note: "Energía CENAN adulto (tabla poblacional).",
    };
  }

  // 60+: no hay fila pública separada en el scrape; usar adulto 30–59
  if (age >= 60) {
    const table = sex === "male" ? ADULT_MALE : ADULT_FEMALE;
    const row = table.adult;
    return {
      kcal: pickArea(residence, row.urban, row.rural, row.national, activity),
      note: "Energía CENAN: adulto 30–59 como aproximación para ≥60.",
    };
  }

  return null;
}
