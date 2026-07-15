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

export interface PatientProfile {
  sex: Sex | "";
  ageYears: number | null;
  weightKg: number | null;
  heightCm: number | null;
  activity: ActivityLevel;
  goal: EnergyGoal;
  physioState: PhysiologicalState;
  pregnancyTrimester: PregnancyTrimester;
  lactationSemester: LactationSemester;
  bioavailability: Bioavailability;
  residence: ResidenceArea;
}

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  sex: "",
  ageYears: null,
  weightKg: null,
  heightCm: null,
  activity: "moderate",
  goal: "maintain",
  physioState: "none",
  pregnancyTrimester: 2,
  lactationSemester: 1,
  bioavailability: "moderate",
  residence: "urban",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  light: "Ligera",
  moderate: "Moderada",
  intense: "Intensa",
};

export const GOAL_LABELS: Record<EnergyGoal, string> = {
  maintain: "Mantener peso",
  deficit: "Déficit (−15%)",
  surplus: "Superávit (+10%)",
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
  if (parts.length === 0) return null;
  parts.push(ACTIVITY_LABELS[profile.activity]);
  if (profile.physioState === "pregnancy") {
    parts.push(`Gest. T${profile.pregnancyTrimester}`);
  } else if (profile.physioState === "lactation") {
    parts.push("Lactancia");
  }
  return parts.join(" · ");
}
