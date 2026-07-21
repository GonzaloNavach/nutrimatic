/** Datos del paciente para calcular requerimientos (editables). */

export type Sex = "male" | "female";
export type ActivityLevel = "light" | "moderate" | "intense";
export type EnergyGoal = "maintain" | "deficit" | "surplus";
export type PhysiologicalState = "none" | "pregnancy" | "lactation";
export type PregnancyTrimester = 1 | 2 | 3;
/** Semestre de lactancia alineado a tablas CENAN puérpera (I / II). */
export type LactationSemester = 1 | 2;
export type Bioavailability = "high" | "moderate" | "low";
export type ResidenceArea = "urban" | "rural" | "national";

/** Motivo clínico del plan — no siempre es bajar/subir peso. */
export type ClinicalPlanReason =
  | "general_health"
  | "weight_loss"
  | "weight_gain"
  | "muscle_gain"
  | "metabolic_control"
  | "glycemic_control"
  | "lipid_control"
  | "renal_support"
  | "sports_performance";

export type BmrFormula =
  | "schofield"
  | "mifflin"
  | "harris_benedict"
  | "owen"
  | "kcal_per_kg";

export interface LabValue {
  value: number | null;
  /** ISO date YYYY-MM-DD */
  date: string | null;
}

export interface PatientLabPanel {
  fastingGlucose: LabValue;
  hba1c: LabValue;
  totalCholesterol: LabValue;
  ldl: LabValue;
  hdl: LabValue;
  triglycerides: LabValue;
  creatinine: LabValue;
  uricAcid: LabValue;
  alt: LabValue;
  hemoglobin: LabValue;
  tsh: LabValue;
}

export interface PatientProfile {
  sex: Sex | "";
  ageYears: number | null;
  weightKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  activity: ActivityLevel;
  /** Motivo clínico del plan */
  clinicalReason: ClinicalPlanReason;
  /** Ajuste energético sobre GET (mantener / déficit / superávit) */
  goal: EnergyGoal;
  bmrFormula: BmrFormula;
  /** Solo si bmrFormula === kcal_per_kg */
  kcalPerKg: number;
  physioState: PhysiologicalState;
  pregnancyTrimester: PregnancyTrimester;
  lactationSemester: LactationSemester;
  bioavailability: Bioavailability;
  residence: ResidenceArea;
  lab: PatientLabPanel;
}

const emptyLabValue = (): LabValue => ({ value: null, date: null });

export const DEFAULT_LAB_PANEL: PatientLabPanel = {
  fastingGlucose: emptyLabValue(),
  hba1c: emptyLabValue(),
  totalCholesterol: emptyLabValue(),
  ldl: emptyLabValue(),
  hdl: emptyLabValue(),
  triglycerides: emptyLabValue(),
  creatinine: emptyLabValue(),
  uricAcid: emptyLabValue(),
  alt: emptyLabValue(),
  hemoglobin: emptyLabValue(),
  tsh: emptyLabValue(),
};

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  sex: "",
  ageYears: null,
  weightKg: null,
  heightCm: null,
  waistCm: null,
  hipCm: null,
  systolicBp: null,
  diastolicBp: null,
  activity: "moderate",
  clinicalReason: "general_health",
  goal: "maintain",
  bmrFormula: "schofield",
  kcalPerKg: 30,
  physioState: "none",
  pregnancyTrimester: 2,
  lactationSemester: 1,
  bioavailability: "moderate",
  residence: "urban",
  lab: DEFAULT_LAB_PANEL,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  light: "Ligera",
  moderate: "Moderada",
  intense: "Intensa",
};

export const GOAL_LABELS: Record<EnergyGoal, string> = {
  maintain: "Mantener (0%)",
  deficit: "Déficit (−15%)",
  surplus: "Superávit (+10%)",
};

export const CLINICAL_REASON_LABELS: Record<ClinicalPlanReason, string> = {
  general_health: "Salud general / mantenimiento",
  weight_loss: "Pérdida de peso",
  weight_gain: "Ganancia de peso",
  muscle_gain: "Ganancia muscular",
  metabolic_control: "Control metabólico (síndrome metabólico)",
  glycemic_control: "Control glucémico (DM / prediabetes)",
  lipid_control: "Control lipídico (dislipidemia)",
  renal_support: "Soporte renal",
  sports_performance: "Rendimiento deportivo",
};

export const BIOAVAILABILITY_LABELS: Record<Bioavailability, string> = {
  high: "Alta (15%)",
  moderate: "Moderada (10%)",
  low: "Baja (5%)",
};

export const RESIDENCE_LABELS: Record<ResidenceArea, string> = {
  urban: "Urbano",
  rural: "Rural",
  national: "Nacional",
};

/** Sugiere ajuste energético según motivo clínico. */
export function suggestedEnergyGoal(
  reason: ClinicalPlanReason
): EnergyGoal {
  switch (reason) {
    case "weight_loss":
      return "deficit";
    case "weight_gain":
    case "muscle_gain":
    case "sports_performance":
      return "surplus";
    default:
      return "maintain";
  }
}

export function formatPatientSummary(profile: PatientProfile): string | null {
  const parts: string[] = [];
  if (profile.sex === "female") parts.push("Mujer");
  else if (profile.sex === "male") parts.push("Hombre");
  if (profile.ageYears != null && profile.ageYears > 0) {
    parts.push(`${profile.ageYears} a`);
  }
  if (profile.weightKg != null && profile.weightKg > 0) {
    parts.push(`${profile.weightKg} kg`);
  }
  if (profile.heightCm != null && profile.heightCm > 0) {
    parts.push(`${profile.heightCm} cm`);
  }
  if (profile.waistCm != null && profile.waistCm > 0) {
    parts.push(`CA ${profile.waistCm} cm`);
  }
  if (parts.length === 0) return null;
  parts.push(CLINICAL_REASON_LABELS[profile.clinicalReason]);
  if (profile.physioState === "pregnancy") {
    parts.push(`Gest. T${profile.pregnancyTrimester}`);
  } else if (profile.physioState === "lactation") {
    parts.push("Lactancia");
  }
  return parts.join(" · ");
}

/** IMC = kg / m²; null si faltan peso o talla. */
export function computeImc(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): number | null {
  if (weightKg == null || weightKg <= 0) return null;
  if (heightCm == null || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function imcCategoryLabel(imc: number): string {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

export function patchLabValue(
  panel: PatientLabPanel,
  key: keyof PatientLabPanel,
  partial: Partial<LabValue>
): PatientLabPanel {
  return {
    ...panel,
    [key]: { ...panel[key], ...partial },
  };
}
