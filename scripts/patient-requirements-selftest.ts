import { patchLabValue } from "../src/lib/nutrition/patientProfile";
import { calculatePatientRequirements } from "../src/lib/nutrition/patientRequirements";
import {
  DEFAULT_PATIENT_PROFILE,
  type PatientProfile,
} from "../src/lib/nutrition/patientProfile";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const woman: PatientProfile = {
  ...DEFAULT_PATIENT_PROFILE,
  sex: "female",
  ageYears: 28,
  weightKg: 58,
  heightCm: 160,
  waistCm: 82,
  hipCm: 98,
  activity: "moderate",
  clinicalReason: "general_health",
  goal: "maintain",
};

const r = calculatePatientRequirements(woman);
assert(r.ok, "should calculate");
assert(
  r.requirements.energy > 1500 && r.requirements.energy < 2800,
  `energy ${r.requirements.energy}`
);
assert(r.requirements.vitaminA === 700, `vitA ${r.requirements.vitaminA}`);
assert(r.requirements.iron === 29.4, `iron ${r.requirements.iron}`);
assert(r.requirements.folicAcid === 400, "folate");
assert(r.meta.bmrFormula === "schofield", "default formula");
assert(
  r.meta.clinicalContext.waistRisk?.level === "high",
  "waist 82 female = high risk"
);
assert(r.meta.clinicalContext.icc != null, "icc computed");

const preg = calculatePatientRequirements({
  ...woman,
  physioState: "pregnancy",
  pregnancyTrimester: 2,
});
assert(preg.ok, "preg ok");
assert(preg.requirements.energy > r.requirements.energy, "preg +kcal");
assert(preg.requirements.folicAcid === 600, "preg folate");
assert(preg.requirements.iron === 27, "preg iron");

const noWeight = calculatePatientRequirements({
  ...woman,
  weightKg: null,
});
assert(noWeight.ok, "table fallback");
assert(noWeight.meta.energySource === "cenan_table", "cenan source");

const incomplete = calculatePatientRequirements({
  ...woman,
  sex: "",
  weightKg: null,
});
assert(!incomplete.ok, "incomplete fails");

const mifflin = calculatePatientRequirements({
  ...woman,
  bmrFormula: "mifflin",
});
assert(mifflin.ok, "mifflin ok");
assert(mifflin.meta.bmrFormula === "mifflin", "mifflin formula");
assert(
  mifflin.requirements.energy !== r.requirements.energy,
  "mifflin differs from schofield"
);

const glycemic = calculatePatientRequirements({
  ...woman,
  clinicalReason: "glycemic_control",
  lab: patchLabValue(woman.lab, "hba1c", { value: 6.8 }),
});
assert(glycemic.ok, "glycemic ok");
assert(glycemic.requirements.fiber >= 28, "fiber raised for glycemic");
assert(
  glycemic.requirements.carbs < r.requirements.carbs,
  "carbs reduced for glycemic"
);
assert(
  glycemic.meta.notes.some((n) => n.includes("glucémico")),
  "glycemic note"
);

const htn = calculatePatientRequirements({
  ...woman,
  systolicBp: 148,
  diastolicBp: 92,
});
assert(htn.ok, "htn ok");
assert(htn.requirements.sodium <= 2000, `sodium capped ${htn.requirements.sodium}`);

const lipid = calculatePatientRequirements({
  ...woman,
  clinicalReason: "lipid_control",
  lab: patchLabValue(woman.lab, "ldl", { value: 165 }),
});
assert(lipid.ok, "lipid ok");
assert(
  lipid.requirements.fatTotal < r.requirements.fatTotal,
  "fat reduced for lipid"
);

const renal = calculatePatientRequirements({
  ...woman,
  clinicalReason: "renal_support",
  weightKg: 58,
  lab: patchLabValue(woman.lab, "creatinine", { value: 1.4 }),
});
assert(renal.ok, "renal ok");
assert(renal.requirements.proteinTotal <= 46.4, "protein capped renal");

const kcalKg = calculatePatientRequirements({
  ...woman,
  bmrFormula: "kcal_per_kg",
  kcalPerKg: 30,
});
assert(kcalKg.ok, "kcal/kg ok");
assert(kcalKg.meta.energySource === "kcal_per_kg", "kcal/kg source");
assert(kcalKg.requirements.energy === 1740, `kcal/kg energy ${kcalKg.requirements.energy}`);

console.log("patient-requirements-selftest OK");
console.log({
  energy: r.requirements.energy,
  bmr: r.meta.bmr,
  pal: r.meta.pal,
  waistRisk: r.meta.clinicalContext.waistRisk?.level,
  glycemicCarbs: glycemic.requirements.carbs,
  htnSodium: htn.requirements.sodium,
});
