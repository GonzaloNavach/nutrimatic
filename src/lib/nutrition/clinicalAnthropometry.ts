/** Antropometría clínica: CA, ICC, riesgo cardiovascular (INS Perú). */

import type { Sex } from "./patientProfile";

export type WaistRiskLevel = "low" | "high" | "very_high";

export interface WaistRiskResult {
  level: WaistRiskLevel;
  label: string;
  detail: string;
}

/** Criterios INS adultos (≥19 años). */
export function classifyWaistRisk(
  sex: Sex,
  ageYears: number,
  waistCm: number
): WaistRiskResult {
  if (ageYears >= 12 && ageYears < 19) {
    return {
      level: waistCm >= (sex === "male" ? 94 : 80) ? "high" : "low",
      label: "Referencia adolescente (aprox.)",
      detail:
        "Percentiles INS no cargados; se usa umbral adulto como referencia orientativa.",
    };
  }

  if (sex === "male") {
    if (waistCm >= 102) {
      return {
        level: "very_high",
        label: "Riesgo CV muy alto",
        detail: "CA ≥102 cm (varón, INS).",
      };
    }
    if (waistCm >= 94) {
      return {
        level: "high",
        label: "Riesgo CV alto",
        detail: "CA 94–101 cm (varón, INS).",
      };
    }
    return {
      level: "low",
      label: "Riesgo CV bajo",
      detail: "CA <94 cm (varón, INS).",
    };
  }

  if (waistCm >= 88) {
    return {
      level: "very_high",
      label: "Riesgo CV muy alto",
      detail: "CA ≥88 cm (mujer, INS).",
    };
  }
  if (waistCm >= 80) {
    return {
      level: "high",
      label: "Riesgo CV alto",
      detail: "CA 80–87 cm (mujer, INS).",
    };
  }
  return {
    level: "low",
    label: "Riesgo CV bajo",
    detail: "CA <80 cm (mujer, INS).",
  };
}

export function computeWaistHipRatio(
  waistCm: number | null | undefined,
  hipCm: number | null | undefined
): number | null {
  if (waistCm == null || waistCm <= 0) return null;
  if (hipCm == null || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 1000) / 1000;
}

/** Puntos de corte ICC población peruana (sobrepeso / obesidad). */
export function classifyIcc(
  sex: Sex,
  icc: number
): { category: "normal" | "overweight" | "obesity"; label: string } {
  const overweight = sex === "male" ? 0.52 : 0.54;
  const obesity = sex === "male" ? 0.57 : 0.59;

  if (icc >= obesity) {
    return { category: "obesity", label: "Obesidad (ICC peruano)" };
  }
  if (icc >= overweight) {
    return { category: "overweight", label: "Sobrepeso (ICC peruano)" };
  }
  return { category: "normal", label: "Normal (ICC peruano)" };
}

export function computeWaistHeightRatio(
  waistCm: number | null | undefined,
  heightCm: number | null | undefined
): number | null {
  if (waistCm == null || waistCm <= 0) return null;
  if (heightCm == null || heightCm <= 0) return null;
  return Math.round((waistCm / heightCm) * 1000) / 1000;
}

/** WHtR ≥0.5 suele indicar riesgo central (referencia clínica general). */
export function classifyWaistHeightRatio(whr: number): {
  elevated: boolean;
  label: string;
} {
  if (whr >= 0.6) {
    return { elevated: true, label: "Riesgo central elevado (WHtR ≥0,6)" };
  }
  if (whr >= 0.5) {
    return { elevated: true, label: "Riesgo central moderado (WHtR ≥0,5)" };
  }
  return { elevated: false, label: "WHtR bajo riesgo (<0,5)" };
}
