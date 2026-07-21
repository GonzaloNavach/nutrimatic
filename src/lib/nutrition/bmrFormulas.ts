/** Fórmulas de TMB / estimación energética (kcal/día). */

import type { BmrFormula, Sex } from "./patientProfile";

export const BMR_FORMULA_LABELS: Record<BmrFormula, string> = {
  schofield: "Schofield (FAO/WHO · default CENAN)",
  mifflin: "Mifflin-St Jeor",
  harris_benedict: "Harris-Benedict revisada",
  owen: "Owen",
  kcal_per_kg: "kcal/kg corporal (total)",
};

/** TMB Schofield 1985 (kcal/día), peso en kg. */
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

export function mifflinStJeorBmr(
  sex: Sex,
  ageYears: number,
  weightKg: number,
  heightCm: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

export function harrisBenedictBmr(
  sex: Sex,
  ageYears: number,
  weightKg: number,
  heightCm: number
): number {
  if (sex === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears;
}

export function owenBmr(sex: Sex, weightKg: number): number {
  return sex === "male" ? 879 + 10.2 * weightKg : 795 + 7.18 * weightKg;
}

export function computeBmr(
  formula: BmrFormula,
  sex: Sex,
  ageYears: number,
  weightKg: number,
  heightCm: number | null
): { bmr: number | null; error?: string } {
  if (formula === "kcal_per_kg") {
    return { bmr: null };
  }

  if (formula === "owen") {
    return { bmr: owenBmr(sex, weightKg) };
  }

  if (formula === "schofield") {
    return { bmr: schofieldBmr(sex, ageYears, weightKg) };
  }

  if (heightCm == null || heightCm <= 0) {
    return {
      bmr: null,
      error: "Esta fórmula requiere talla (cm).",
    };
  }

  if (formula === "mifflin") {
    return { bmr: mifflinStJeorBmr(sex, ageYears, weightKg, heightCm) };
  }

  return {
    bmr: harrisBenedictBmr(sex, ageYears, weightKg, heightCm),
  };
}

export function computeKcalPerKgTotal(
  weightKg: number,
  kcalPerKg: number
): number {
  return weightKg * kcalPerKg;
}
