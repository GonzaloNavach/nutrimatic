/** Contexto clínico derivado del perfil (alertas, guía de plan). */

import {
  classifyIcc,
  classifyWaistHeightRatio,
  classifyWaistRisk,
  computeWaistHeightRatio,
  computeWaistHipRatio,
  type WaistRiskResult,
} from "./clinicalAnthropometry";
import {
  evaluateLabPanel,
  hasGlycemicConcern,
  hasHypertensionConcern,
  hasLipidConcern,
  hasRenalConcern,
  type LabEvaluation,
} from "./clinicalLabs";
import {
  CLINICAL_REASON_LABELS,
  type ClinicalPlanReason,
  type PatientProfile,
  type Sex,
} from "./patientProfile";
import type { Requirements } from "./types";

export type ClinicalFlagSeverity = "info" | "warning" | "alert";

export interface ClinicalFlag {
  id: string;
  severity: ClinicalFlagSeverity;
  title: string;
  detail: string;
}

export interface ClinicalContext {
  clinicalReason: ClinicalPlanReason;
  clinicalReasonLabel: string;
  waistRisk: WaistRiskResult | null;
  icc: number | null;
  iccLabel: string | null;
  waistHeightRatio: number | null;
  waistHeightLabel: string | null;
  labEvaluations: LabEvaluation[];
  flags: ClinicalFlag[];
  planGuidance: string[];
}

function pushFlag(
  flags: ClinicalFlag[],
  id: string,
  severity: ClinicalFlagSeverity,
  title: string,
  detail: string
) {
  flags.push({ id, severity, title, detail });
}

export function buildClinicalContext(profile: PatientProfile): ClinicalContext {
  const flags: ClinicalFlag[] = [];
  const planGuidance: string[] = [];
  const sex = profile.sex as Sex | "";

  let waistRisk: WaistRiskResult | null = null;
  if (
    profile.waistCm != null &&
    profile.waistCm > 0 &&
    sex &&
    profile.ageYears != null
  ) {
    waistRisk = classifyWaistRisk(sex, profile.ageYears, profile.waistCm);
    if (waistRisk.level === "very_high") {
      pushFlag(
        flags,
        "waist-very-high",
        "alert",
        waistRisk.label,
        waistRisk.detail
      );
      planGuidance.push(
        "Grasa central elevada: priorizar calidad de grasas, fibra y patrón mediterráneo."
      );
    } else if (waistRisk.level === "high") {
      pushFlag(
        flags,
        "waist-high",
        "warning",
        waistRisk.label,
        waistRisk.detail
      );
    }
  }

  const icc = computeWaistHipRatio(profile.waistCm, profile.hipCm);
  let iccLabel: string | null = null;
  if (icc != null && sex) {
    iccLabel = classifyIcc(sex, icc).label;
    if (classifyIcc(sex, icc).category !== "normal") {
      pushFlag(flags, "icc", "warning", iccLabel, `ICC = ${icc}`);
    }
  }

  const whr = computeWaistHeightRatio(profile.waistCm, profile.heightCm);
  let waistHeightLabel: string | null = null;
  if (whr != null) {
    const whrClass = classifyWaistHeightRatio(whr);
    waistHeightLabel = whrClass.label;
    if (whrClass.elevated) {
      pushFlag(flags, "whtr", "warning", whrClass.label, `WHtR = ${whr}`);
    }
  }

  const labEvaluations =
    profile.sex && profile.ageYears ? evaluateLabPanel(profile) : [];

  for (const lab of labEvaluations) {
    if (lab.severity === "normal" || !lab.planHint) continue;
    const severity: ClinicalFlagSeverity =
      lab.severity === "high" ? "alert" : "warning";
    pushFlag(
      flags,
      `lab-${lab.id}`,
      severity,
      `${lab.label}: ${lab.interpretation}`,
      lab.planHint
    );
    if (lab.planHint) planGuidance.push(lab.planHint);
  }

  const reason = profile.clinicalReason;
  if (reason === "glycemic_control" && !hasGlycemicConcern(labEvaluations)) {
    planGuidance.push(
      "Motivo glucémico: distribuir carbohidratos y priorizar bajo índice glicémico aunque no haya lab cargado."
    );
  }
  if (reason === "lipid_control" && !hasLipidConcern(labEvaluations)) {
    planGuidance.push(
      "Motivo lipídico: moderar grasa saturada y reforzar fibra soluble."
    );
  }
  if (reason === "renal_support" && !hasRenalConcern(labEvaluations)) {
    planGuidance.push(
      "Motivo renal: moderar proteína y revisar potasio/fósforo según función renal."
    );
  }
  if (reason === "metabolic_control") {
    planGuidance.push(
      "Control metabólico: combinar moderación calórica (si aplica), fibra y calidad de grasas."
    );
  }
  if (reason === "sports_performance") {
    planGuidance.push(
      "Rendimiento: asegurar carbohidratos alrededor del entrenamiento y proteína adecuada."
    );
  }

  if (
    reason !== "weight_loss" &&
    reason !== "weight_gain" &&
    profile.goal !== "maintain"
  ) {
    pushFlag(
      flags,
      "goal-mismatch",
      "info",
      "Ajuste energético activo",
      `Motivo «${CLINICAL_REASON_LABELS[reason]}» con ${profile.goal === "deficit" ? "déficit" : "superávit"} — verificá coherencia clínica.`
    );
  }

  return {
    clinicalReason: reason,
    clinicalReasonLabel: CLINICAL_REASON_LABELS[reason],
    waistRisk,
    icc,
    iccLabel,
    waistHeightRatio: whr,
    waistHeightLabel,
    labEvaluations,
    flags,
    planGuidance: [...new Set(planGuidance)],
  };
}

export interface ClinicalRequirementAdjustments {
  requirements: Requirements;
  notes: string[];
}

/** Ajustes numéricos a metas según laboratorio y contexto. */
export function applyClinicalRequirementAdjustments(
  base: Requirements,
  profile: PatientProfile,
  weightKg: number | null
): ClinicalRequirementAdjustments {
  const notes: string[] = [];
  let req = { ...base };
  const evaluations = evaluateLabPanel(profile);

  const glycemic = hasGlycemicConcern(evaluations);
  const lipid = hasLipidConcern(evaluations);
  const renal = hasRenalConcern(evaluations);
  const htn =
    hasHypertensionConcern(evaluations) ||
    profile.clinicalReason === "metabolic_control";

  let fatPct = 0.3;
  let proteinGPerKg = weightKg && weightKg > 0 ? req.proteinTotal / weightKg : 0.8;

  if (lipid || profile.clinicalReason === "lipid_control") {
    fatPct = 0.25;
    notes.push("Grasa total ajustada al 25% de kcal (perfil lipídico).");
  }

  if (glycemic || profile.clinicalReason === "glycemic_control") {
    notes.push("Carbohidratos −10% sobre reparto estándar (control glucémico).");
    req.fiber = Math.max(req.fiber, 28);
    notes.push(`Fibra mínima elevada a ${req.fiber} g/día.`);
  }

  if (renal || profile.clinicalReason === "renal_support") {
    const cap = 0.8;
    if (weightKg != null && weightKg > 0) {
      const capped = cap * weightKg;
      if (req.proteinTotal > capped) {
        req.proteinTotal = Math.round(capped * 10) / 10;
        notes.push(`Proteína limitada a ${cap} g/kg (soporte renal).`);
      }
    }
  }

  if (htn) {
    const sodiumCap = 2000;
    if (req.sodium > sodiumCap) {
      req.sodium = sodiumCap;
      notes.push(`Sodio limitado a ${sodiumCap} mg/día (HTA / control metabólico).`);
    }
  }

  if (fatPct !== 0.3 && req.energy > 0) {
    const protein = req.proteinTotal;
    const fat = (req.energy * fatPct) / 9;
    let carbs = Math.max(0, (req.energy - protein * 4 - fat * 9) / 4);
    if (glycemic || profile.clinicalReason === "glycemic_control") {
      carbs *= 0.9;
    }
    req.fatTotal = Math.round(fat * 10) / 10;
    req.carbs = Math.round(carbs * 10) / 10;
  } else if (
    (glycemic || profile.clinicalReason === "glycemic_control") &&
    req.energy > 0
  ) {
    req.carbs = Math.round(req.carbs * 0.9 * 10) / 10;
  }

  if (
    profile.clinicalReason === "muscle_gain" ||
    profile.clinicalReason === "sports_performance"
  ) {
    if (weightKg != null && weightKg > 0 && proteinGPerKg < 1.2) {
      req.proteinTotal = Math.round(1.2 * weightKg * 10) / 10;
      notes.push("Proteína elevada a 1,2 g/kg (rendimiento / masa muscular).");
    }
  }

  return { requirements: req, notes };
}
