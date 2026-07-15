import { calculatePatientRequirements } from "../src/lib/nutrition/patientRequirements";
import type { PatientProfile } from "../src/lib/nutrition/patientProfile";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const woman: PatientProfile = {
  sex: "female",
  ageYears: 28,
  weightKg: 58,
  heightCm: 160,
  activity: "moderate",
  goal: "maintain",
  physioState: "none",
  pregnancyTrimester: 2,
  lactationSemester: 1,
  bioavailability: "moderate",
  residence: "urban",
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

console.log("patient-requirements-selftest OK");
console.log({
  energy: r.requirements.energy,
  bmr: r.meta.bmr,
  pal: r.meta.pal,
  pregEnergy: preg.requirements.energy,
  tableEnergy: noWeight.requirements.energy,
});
