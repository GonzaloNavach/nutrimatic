/**
 * Micronutrientes CENAN/INS (tablas públicas alimentación saludable).
 * Hierro/zinc según % biodisponibilidad dietética.
 * Gestante: Fe dietético blank en CENAN → usamos 27 mg (RDA clínica IOM) + aviso.
 */

import type {
  Bioavailability,
  LactationSemester,
  PhysiologicalState,
  PregnancyTrimester,
  Sex,
} from "./patientProfile";

export interface MicroTargets {
  calcium: number;
  phosphorus: number;
  zinc: number;
  iron: number;
  sodium: number; // mg
  potassium: number; // mg
  vitaminA: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminC: number;
  folicAcid: number;
  notes: string[];
}

type BioKey = Bioavailability;

const BIO_INDEX: Record<BioKey, 0 | 1 | 2> = {
  high: 0,
  moderate: 1,
  low: 2,
};

function pick3(values: [number, number, number], bio: BioKey): number {
  return values[BIO_INDEX[bio]];
}

function gToMg(g: number): number {
  return Math.round(g * 1000);
}

/** Adolescentes 12–17 — vitaminas + minerales base (Zn e Fe por bio). */
function adolescentMicros(
  sex: Sex,
  age: number,
  bio: BioKey
): Omit<MicroTargets, "notes"> {
  const male = sex === "male";
  if (age <= 13) {
    const iron = male
      ? pick3([9.7, 14.6, 29.2], bio)
      : pick3([21.8, 32.7, 65.4], bio); // post-menarquia (mayor)
    return {
      calcium: 1300,
      phosphorus: 1250,
      zinc: male
        ? pick3([5.1, 8.6, 17.1], bio)
        : pick3([4.3, 7.2, 14.4], bio),
      iron,
      sodium: gToMg(1.5),
      potassium: gToMg(4.5),
      vitaminA: 600,
      thiamin: 0.9,
      riboflavin: 0.9,
      niacin: 12,
      vitaminC: 45,
      folicAcid: 300,
    };
  }
  if (age === 14) {
    return {
      calcium: 1300,
      phosphorus: 1250,
      zinc: male
        ? pick3([5.1, 8.6, 17.1], bio)
        : pick3([4.3, 7.2, 14.4], bio),
      iron: male
        ? pick3([9.7, 14.6, 29.2], bio)
        : pick3([21.8, 32.7, 65.4], bio),
      sodium: gToMg(1.5),
      potassium: gToMg(4.7),
      vitaminA: male ? 900 : 700,
      thiamin: male ? 1.2 : 1.0,
      riboflavin: male ? 1.3 : 1.0,
      niacin: male ? 16 : 14,
      vitaminC: male ? 75 : 65,
      folicAcid: 400,
    };
  }
  // 15–17
  return {
    calcium: 1300,
    phosphorus: 1250,
    zinc: male
      ? pick3([5.1, 8.6, 17.1], bio)
      : pick3([4.3, 7.2, 14.4], bio),
    iron: male
      ? pick3([12.5, 18.8, 37.6], bio)
      : pick3([20.7, 31, 62], bio),
    sodium: gToMg(1.5),
    potassium: gToMg(4.7),
    vitaminA: male ? 900 : 700,
    thiamin: male ? 1.2 : 1.0,
    riboflavin: male ? 1.3 : 1.0,
    niacin: male ? 16 : 14,
    vitaminC: male ? 75 : 65,
    folicAcid: 400,
  };
}

/** Adultos 18–59+ (60+ usa fila 50–59). */
function adultMicros(
  sex: Sex,
  age: number,
  bio: BioKey
): Omit<MicroTargets, "notes"> {
  const male = sex === "male";
  const senior = age >= 50;
  const na = senior ? 1.3 : 1.5;

  if (male) {
    return {
      calcium: 1000,
      phosphorus: 700,
      zinc: pick3([4.2, 7, 14], bio),
      iron: pick3([9.1, 13.7, 27.4], bio),
      sodium: gToMg(na),
      potassium: gToMg(4.7),
      vitaminA: 900,
      thiamin: 1.2,
      riboflavin: 1.3,
      niacin: age >= 30 && age <= 49 ? 14 : 16,
      vitaminC: 90,
      folicAcid: 400,
    };
  }

  // Mujeres: 50–59 Fe post-menopausia más bajo; Ca 1200 desde 50
  return {
    calcium: senior ? 1200 : 1000,
    phosphorus: 700,
    zinc: pick3([3, 4.9, 9.8], bio),
    iron: senior
      ? pick3([7.5, 11.3, 22.6], bio)
      : pick3([19.6, 29.4, 58.8], bio),
    sodium: gToMg(na),
    potassium: gToMg(4.7),
    vitaminA: 700,
    thiamin: 1.1,
    riboflavin: 1.1,
    niacin: 14,
    vitaminC: 75,
    folicAcid: 400,
  };
}

function pregnancyVitaminOverlay(
  age: number
): Pick<
  MicroTargets,
  | "vitaminA"
  | "thiamin"
  | "riboflavin"
  | "niacin"
  | "vitaminC"
  | "folicAcid"
  | "calcium"
  | "phosphorus"
  | "sodium"
  | "potassium"
> {
  const teen = age < 19;
  return {
    vitaminA: teen ? 750 : 770,
    thiamin: 1.4,
    riboflavin: 1.4,
    niacin: 18,
    vitaminC: teen ? 80 : 85,
    folicAcid: 600,
    calcium: teen ? 1300 : 1000,
    phosphorus: teen ? 1250 : 700,
    sodium: gToMg(1.5),
    potassium: gToMg(4.7),
  };
}

function lactationVitaminOverlay(
  age: number
): ReturnType<typeof pregnancyVitaminOverlay> {
  const teen = age < 19;
  return {
    vitaminA: teen ? 1200 : 1300,
    thiamin: 1.4,
    riboflavin: 1.6,
    niacin: 17,
    vitaminC: teen ? 115 : 120,
    folicAcid: 500,
    calcium: teen ? 1300 : 1000,
    phosphorus: teen ? 1250 : 700,
    sodium: gToMg(1.5),
    potassium: gToMg(5.1),
  };
}

function pregnancyZinc(trimester: PregnancyTrimester, bio: BioKey): number {
  const row: Record<PregnancyTrimester, [number, number, number]> = {
    1: [3.4, 5.5, 11],
    2: [4.2, 7, 14],
    3: [6, 10, 20],
  };
  return pick3(row[trimester], bio);
}

function lactationZinc(semester: LactationSemester, bio: BioKey): number {
  // I ≈ 0–3 m; II ≈ 3–6+ (CENAN tiene 3 bandas; simplificamos a 2)
  const row: Record<LactationSemester, [number, number, number]> = {
    1: [5.8, 9.5, 19],
    2: [5.3, 8.8, 17.5],
  };
  return pick3(row[semester], bio);
}

function lactationIron(age: number, bio: BioKey): number {
  // Misma fila <18 y 19–50 en CENAN
  void age;
  return pick3([10, 15, 30], bio);
}

export function lookupCenanMicronutrients(input: {
  sex: Sex;
  ageYears: number;
  bioavailability: Bioavailability;
  physioState: PhysiologicalState;
  pregnancyTrimester: PregnancyTrimester;
  lactationSemester: LactationSemester;
}): MicroTargets {
  const { sex, ageYears: age, bioavailability: bio, physioState } = input;
  const notes: string[] = [];

  let base: Omit<MicroTargets, "notes">;
  if (age < 12) {
    notes.push(
      "Edad < 12: micros aproximados con tablas de adolescentes 12–13."
    );
    base = adolescentMicros(sex, 12, bio);
  } else if (age < 18) {
    base = adolescentMicros(sex, age, bio);
  } else {
    base = adultMicros(sex, age, bio);
  }

  if (physioState === "pregnancy") {
    if (sex !== "female") {
      notes.push("Gestación solo aplica a sexo femenino; se ignoró el estado.");
    } else {
      const vit = pregnancyVitaminOverlay(age);
      base = {
        ...base,
        ...vit,
        zinc: pregnancyZinc(input.pregnancyTrimester, bio),
        // CENAN no publica Fe dietético gestante (suplementación)
        iron: 27,
      };
      notes.push(
        "Fe gestante: meta dietética 27 mg (CENAN indica suplementación; celda dietética vacía)."
      );
      notes.push(
        `Zinc gestante según trimestre ${input.pregnancyTrimester} y biodisponibilidad.`
      );
    }
  } else if (physioState === "lactation") {
    if (sex !== "female") {
      notes.push("Lactancia solo aplica a sexo femenino; se ignoró el estado.");
    } else {
      const vit = lactationVitaminOverlay(age);
      base = {
        ...base,
        ...vit,
        zinc: lactationZinc(input.lactationSemester, bio),
        iron: lactationIron(age, bio),
      };
    }
  }

  return { ...base, notes };
}
