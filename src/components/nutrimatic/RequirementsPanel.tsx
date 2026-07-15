"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Requirements } from "@/lib/nutrition/types";

interface RequirementsPanelProps {
  value: Requirements;
  onChange: (value: Requirements) => void;
  embedded?: boolean;
}

const fields: Array<{
  key: keyof Requirements;
  label: string;
  unit: string;
}> = [
  { key: "energy", label: "Energía", unit: "kcal" },
  { key: "proteinTotal", label: "Proteína total", unit: "g" },
  { key: "fatTotal", label: "Grasa total", unit: "g" },
  { key: "carbs", label: "Carbohidratos", unit: "g" },
  { key: "fiber", label: "Fibra", unit: "g" },
  { key: "calcium", label: "Calcio", unit: "mg" },
  { key: "phosphorus", label: "Fósforo", unit: "mg" },
  { key: "zinc", label: "Zinc", unit: "mg" },
  { key: "iron", label: "Hierro", unit: "mg" },
  { key: "sodium", label: "Sodio", unit: "mg" },
  { key: "potassium", label: "Potasio", unit: "mg" },
  { key: "vitaminA", label: "Vitamina A", unit: "µg" },
  { key: "thiamin", label: "Tiamina", unit: "mg" },
  { key: "riboflavin", label: "Riboflavina", unit: "mg" },
  { key: "niacin", label: "Niacina", unit: "mg" },
  { key: "vitaminC", label: "Vitamina C", unit: "mg" },
  { key: "folicAcid", label: "Ácido fólico", unit: "µg" },
];

function RequirementsForm({
  value,
  onChange,
}: Omit<RequirementsPanelProps, "embedded">) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`req-${field.key}`}>
            {field.label} ({field.unit})
          </Label>
          <Input
            id={`req-${field.key}`}
            type="number"
            min={0}
            step="any"
            value={value[field.key] || ""}
            onChange={(e) =>
              onChange({
                ...value,
                [field.key]: Number.parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

export function RequirementsPanel({
  value,
  onChange,
  embedded = false,
}: RequirementsPanelProps) {
  if (embedded) {
    return <RequirementsForm value={value} onChange={onChange} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Requerimientos diarios</CardTitle>
      </CardHeader>
      <CardContent>
        <RequirementsForm value={value} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
