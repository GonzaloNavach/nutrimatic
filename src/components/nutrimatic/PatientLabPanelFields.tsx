"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  patchLabValue,
  type PatientLabPanel,
  type PatientProfile,
} from "@/lib/nutrition/patientProfile";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [color-scheme:light] dark:[color-scheme:dark]";

const LAB_FIELDS: Array<{
  key: keyof PatientLabPanel;
  label: string;
  unit: string;
  step: string;
  max?: number;
}> = [
  { key: "fastingGlucose", label: "Glucosa ayuno", unit: "mg/dL", step: "1", max: 600 },
  { key: "hba1c", label: "HbA1c", unit: "%", step: "0.1", max: 20 },
  { key: "totalCholesterol", label: "Colesterol total", unit: "mg/dL", step: "1", max: 500 },
  { key: "ldl", label: "LDL", unit: "mg/dL", step: "1", max: 400 },
  { key: "hdl", label: "HDL", unit: "mg/dL", step: "1", max: 150 },
  { key: "triglycerides", label: "Triglicéridos", unit: "mg/dL", step: "1", max: 1000 },
  { key: "creatinine", label: "Creatinina", unit: "mg/dL", step: "0.01", max: 20 },
  { key: "uricAcid", label: "Ácido úrico", unit: "mg/dL", step: "0.1", max: 20 },
  { key: "alt", label: "ALT (GPT)", unit: "U/L", step: "1", max: 500 },
  { key: "hemoglobin", label: "Hemoglobina", unit: "g/dL", step: "0.1", max: 25 },
  { key: "tsh", label: "TSH", unit: "µUI/mL", step: "0.01", max: 100 },
];

interface PatientLabPanelFieldsProps {
  profile: PatientProfile;
  onProfileChange: (profile: PatientProfile) => void;
}

export function PatientLabPanelFields({
  profile,
  onProfileChange,
}: PatientLabPanelFieldsProps) {
  function patchLab(
    key: keyof PatientLabPanel,
    partial: { value?: number | null; date?: string | null }
  ) {
    onProfileChange({
      ...profile,
      lab: patchLabValue(profile.lab, key, partial),
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LAB_FIELDS.map((field) => {
        const entry = profile.lab[field.key];
        return (
          <div
            key={field.key}
            className="space-y-1.5 rounded-md border bg-background/40 p-2.5"
          >
            <Label htmlFor={`lab-${field.key}`}>
              {field.label}{" "}
              <span className="font-normal text-muted-foreground">
                ({field.unit})
              </span>
            </Label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                id={`lab-${field.key}`}
                type="number"
                min={0}
                max={field.max}
                step={field.step}
                placeholder="—"
                value={entry.value ?? ""}
                onChange={(e) =>
                  patchLab(field.key, {
                    value: e.target.value
                      ? Number.parseFloat(e.target.value)
                      : null,
                  })
                }
              />
              <Input
                id={`lab-${field.key}-date`}
                type="date"
                className={selectClass}
                title="Fecha del examen"
                value={entry.date ?? ""}
                onChange={(e) =>
                  patchLab(field.key, {
                    date: e.target.value || null,
                  })
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
