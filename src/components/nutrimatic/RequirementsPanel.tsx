"use client";

import {
  CollapsibleCategoryGroups,
  toggleExpandedId,
} from "@/components/nutrimatic/CollapsibleCategoryGroups";
import { PatientRequirementsForm } from "@/components/nutrimatic/PatientRequirementsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_OPEN_NUTRIENT_GROUPS,
  REQUIREMENT_NUTRIENT_GROUP,
  REQUIREMENT_NUTRIENT_GROUPS,
  type RequirementPanelKey,
} from "@/lib/nutrition/nutrientGroups";
import type { Requirements } from "@/lib/nutrition/types";
import { useMemo, useState } from "react";

interface RequirementsPanelProps {
  value: Requirements;
  onChange: (value: Requirements) => void;
  embedded?: boolean;
}

const fields: Array<{
  key: RequirementPanelKey;
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
  const [expanded, setExpanded] = useState(
    () => new Set<string>(DEFAULT_OPEN_NUTRIENT_GROUPS)
  );

  const groups = useMemo(() => {
    return REQUIREMENT_NUTRIENT_GROUPS.map((group) => {
      const items = fields.filter(
        (field) => REQUIREMENT_NUTRIENT_GROUP[field.key] === group.id
      );
      return {
        id: group.id,
        label: group.label,
        count: items.length,
        children: (
          <div className="grid gap-3 py-1 sm:grid-cols-2">
            {items.map((field) => (
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
        ),
      };
    });
  }, [value, onChange]);

  return (
    <div className="space-y-4">
      <PatientRequirementsForm
        onApply={(next) => {
          onChange(next);
        }}
      />
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Metas diarias (editables)
        </p>
        <CollapsibleCategoryGroups
          groups={groups}
          expanded={expanded}
          onToggle={(id) => setExpanded((prev) => toggleExpandedId(prev, id))}
          className="p-0"
        />
      </div>
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
