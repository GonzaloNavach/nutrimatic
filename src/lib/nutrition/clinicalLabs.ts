/** Evaluación de pruebas químicas / vitales para contexto clínico. */

import type { PatientLabPanel, PatientProfile, Sex } from "./patientProfile";

export type LabSeverity = "normal" | "borderline" | "high" | "low";

export interface LabEvaluation {
  id: keyof PatientLabPanel | "blood_pressure";
  label: string;
  valueDisplay: string;
  severity: LabSeverity;
  interpretation: string;
  planHint: string;
}

function fmt(value: number, decimals = 1): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals);
}

function evalGlucose(value: number): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value >= 126) {
    return {
      severity: "high",
      interpretation: "Diabetes (ayuno)",
      planHint: "Priorizar control de carbohidratos y fibra; distribución horaria.",
    };
  }
  if (value >= 100) {
    return {
      severity: "borderline",
      interpretation: "Prediabetes (ayuno)",
      planHint: "Moderar carbohidratos simples y reforzar fibra.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal (ayuno)",
    planHint: "",
  };
}

function evalHbA1c(value: number): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value >= 6.5) {
    return {
      severity: "high",
      interpretation: "Diabetes (HbA1c)",
      planHint: "Ajustar carbohidratos totales y calidad glucémica del plan.",
    };
  }
  if (value >= 5.7) {
    return {
      severity: "borderline",
      interpretation: "Prediabetes (HbA1c)",
      planHint: "Vigilar carbohidratos y horarios de comida.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

function evalLdl(value: number): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value >= 160) {
    return {
      severity: "high",
      interpretation: "LDL alto",
      planHint: "Reducir grasa saturada; aumentar fibra soluble.",
    };
  }
  if (value >= 130) {
    return {
      severity: "borderline",
      interpretation: "LDL límite-alto",
      planHint: "Moderar grasa saturada y reforzar fibra.",
    };
  }
  return {
    severity: "normal",
    interpretation: "LDL aceptable",
    planHint: "",
  };
}

function evalHdl(value: number, sex: Sex): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  const low = sex === "male" ? 40 : 50;
  if (value < low) {
    return {
      severity: "low",
      interpretation: "HDL bajo",
      planHint: "Actividad física y grasas insaturadas; controlar carbohidratos refinados.",
    };
  }
  return {
    severity: "normal",
    interpretation: "HDL adecuado",
    planHint: "",
  };
}

function evalTriglycerides(
  value: number
): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value >= 200) {
    return {
      severity: "high",
      interpretation: "Triglicéridos altos",
      planHint: "Limitar azúcares, alcohol y exceso calórico; reforzar omega-3/fibra.",
    };
  }
  if (value >= 150) {
    return {
      severity: "borderline",
      interpretation: "Triglicéridos límite",
      planHint: "Moderar azúcares simples y alcohol.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

function evalCreatinine(
  value: number,
  sex: Sex
): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  const high = sex === "male" ? 1.3 : 1.1;
  if (value > high) {
    return {
      severity: "high",
      interpretation: "Creatinina elevada",
      planHint: "Revisar proteína total; considerar restricción moderada y potasio según nefrología.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Creatinina en rango",
    planHint: "",
  };
}

function evalUricAcid(
  value: number,
  sex: Sex
): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  const high = sex === "male" ? 7 : 6;
  if (value > high) {
    return {
      severity: "high",
      interpretation: "Ácido úrico elevado",
      planHint: "Moderar purinas, fructosa y alcohol.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

function evalTotalCholesterol(
  value: number
): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value >= 240) {
    return {
      severity: "high",
      interpretation: "Colesterol total alto",
      planHint: "Perfil lipídico global: grasa saturada y fibra.",
    };
  }
  if (value >= 200) {
    return {
      severity: "borderline",
      interpretation: "Colesterol total límite",
      planHint: "Vigilar grasa saturada y fibra.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Deseable",
    planHint: "",
  };
}

function evalAlt(value: number): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value > 40) {
    return {
      severity: "high",
      interpretation: "ALT elevada",
      planHint: "Evitar exceso calórico y alcohol; priorizar patrón mediterráneo.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

function evalHemoglobin(
  value: number,
  sex: Sex
): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  const low = sex === "male" ? 13 : 12;
  if (value < low) {
    return {
      severity: "low",
      interpretation: "Hemoglobina baja",
      planHint: "Reforzar hierro biodisponible y vitamina C en comidas.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

function evalTsh(value: number): Omit<LabEvaluation, "id" | "label" | "valueDisplay"> {
  if (value > 4.5) {
    return {
      severity: "high",
      interpretation: "TSH elevada",
      planHint: "Descartar hipotiroidismo; coordinar con médico tratante.",
    };
  }
  if (value < 0.4) {
    return {
      severity: "low",
      interpretation: "TSH suprimida",
      planHint: "Descartar hipertiroidismo; coordinar con médico tratante.",
    };
  }
  return {
    severity: "normal",
    interpretation: "Normal",
    planHint: "",
  };
}

export function evaluateLabPanel(profile: PatientProfile): LabEvaluation[] {
  const sex = profile.sex as Sex;
  const out: LabEvaluation[] = [];
  const { lab } = profile;

  const push = (
    id: keyof PatientLabPanel,
    label: string,
    unit: string,
    value: number | null,
    evalFn: (v: number) => Omit<LabEvaluation, "id" | "label" | "valueDisplay">
  ) => {
    if (value == null || value <= 0) return;
    out.push({
      id,
      label,
      valueDisplay: `${fmt(value)} ${unit}`,
      ...evalFn(value),
    });
  };

  push("fastingGlucose", "Glucosa ayuno", "mg/dL", lab.fastingGlucose.value, evalGlucose);
  push("hba1c", "HbA1c", "%", lab.hba1c.value, evalHbA1c);
  push("totalCholesterol", "Colesterol total", "mg/dL", lab.totalCholesterol.value, evalTotalCholesterol);
  push("ldl", "LDL", "mg/dL", lab.ldl.value, evalLdl);
  push("hdl", "HDL", "mg/dL", lab.hdl.value, (v) => evalHdl(v, sex));
  push("triglycerides", "Triglicéridos", "mg/dL", lab.triglycerides.value, evalTriglycerides);
  push("creatinine", "Creatinina", "mg/dL", lab.creatinine.value, (v) =>
    evalCreatinine(v, sex)
  );
  push("uricAcid", "Ácido úrico", "mg/dL", lab.uricAcid.value, (v) =>
    evalUricAcid(v, sex)
  );
  push("alt", "ALT (GPT)", "U/L", lab.alt.value, evalAlt);
  push("hemoglobin", "Hemoglobina", "g/dL", lab.hemoglobin.value, (v) =>
    evalHemoglobin(v, sex)
  );
  push("tsh", "TSH", "µUI/mL", lab.tsh.value, evalTsh);

  if (
    profile.systolicBp != null &&
    profile.systolicBp > 0 &&
    profile.diastolicBp != null &&
    profile.diastolicBp > 0
  ) {
    const sys = profile.systolicBp;
    const dia = profile.diastolicBp;
    let severity: LabSeverity = "normal";
    let interpretation = "Presión normal";
    let planHint = "";
    if (sys >= 140 || dia >= 90) {
      severity = "high";
      interpretation = "Hipertensión (≥140/90)";
      planHint = "Limitar sodio del plan (~2000 mg/día) y reforzar potasio/magnesio dietético.";
    } else if (sys >= 130 || dia >= 80) {
      severity = "borderline";
      interpretation = "Presión elevada (130–139 / 80–89)";
      planHint = "Moderar sodio y priorizar patrón DASH/Mediterráneo.";
    }
    out.push({
      id: "blood_pressure",
      label: "Presión arterial",
      valueDisplay: `${sys}/${dia} mmHg`,
      severity,
      interpretation,
      planHint,
    });
  }

  return out;
}

export function hasGlycemicConcern(evaluations: LabEvaluation[]): boolean {
  return evaluations.some(
    (e) =>
      (e.id === "fastingGlucose" || e.id === "hba1c") &&
      (e.severity === "high" || e.severity === "borderline")
  );
}

export function hasLipidConcern(evaluations: LabEvaluation[]): boolean {
  return evaluations.some(
    (e) =>
      (e.id === "ldl" ||
        e.id === "triglycerides" ||
        e.id === "totalCholesterol" ||
        e.id === "hdl") &&
      (e.severity === "high" || e.severity === "borderline" || e.severity === "low")
  );
}

export function hasRenalConcern(evaluations: LabEvaluation[]): boolean {
  return evaluations.some(
    (e) => e.id === "creatinine" && e.severity === "high"
  );
}

export function hasHypertensionConcern(evaluations: LabEvaluation[]): boolean {
  return evaluations.some(
    (e) =>
      e.id === "blood_pressure" &&
      (e.severity === "high" || e.severity === "borderline")
  );
}
