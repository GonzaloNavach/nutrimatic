"use client";

import {
  CollapsibleCategoryGroups,
  toggleExpandedId,
} from "@/components/nutrimatic/CollapsibleCategoryGroups";
import { ClinicalContextPanel } from "@/components/nutrimatic/ClinicalContextPanel";
import { PatientRequirementsForm } from "@/components/nutrimatic/PatientRequirementsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_OPEN_NUTRIENT_GROUPS,
  REQUIREMENT_NUTRIENT_GROUP,
  REQUIREMENT_NUTRIENT_GROUPS,
  type RequirementPanelKey,
} from "@/lib/nutrition/nutrientGroups";
import {
  DEFAULT_PATIENT_PROFILE,
  formatPatientSummary,
  type PatientProfile,
} from "@/lib/nutrition/patientProfile";
import type { RequirementCalcMeta } from "@/lib/nutrition/patientRequirements";
import type { Requirements } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

interface RequirementsPanelProps {
  value: Requirements;
  onChange: (value: Requirements) => void;
  embedded?: boolean;
}

type ReqStep = "patient" | "targets";

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
  const [step, setStep] = useState<ReqStep>("patient");
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [calcMeta, setCalcMeta] = useState<RequirementCalcMeta | null>(null);
  const [source, setSource] = useState<"calculated" | "manual" | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [expanded, setExpanded] = useState(
    () => new Set<string>(DEFAULT_OPEN_NUTRIENT_GROUPS)
  );

  const summary = useMemo(() => formatPatientSummary(profile), [profile]);

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

  if (step === "patient") {
    return (
      <PatientRequirementsForm
        profile={profile}
        onProfileChange={setProfile}
        onApply={(next, meta) => {
          onChange(next);
          setCalcMeta(meta);
          setSource("calculated");
          setAdjustOpen(false);
          setStep("targets");
        }}
        onSkipManual={() => {
          setCalcMeta(null);
          setSource("manual");
          setAdjustOpen(true);
          setStep("targets");
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => setStep("patient")}
        >
          <ArrowLeft className="size-4" />
          Atrás
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              Metas del día
            </h3>
            {source === "calculated" ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                Calculado
              </span>
            ) : (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                Manual
              </span>
            )}
          </div>
          {summary ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{summary}</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sin perfil completo — editá los valores o volvé atrás.
            </p>
          )}
        </div>
      </div>

      <RequirementsKpiReadonly value={value} meta={calcMeta} />

      {calcMeta?.clinicalContext ? (
        <ClinicalContextPanel
          context={calcMeta.clinicalContext}
          calcNotes={calcMeta.notes}
        />
      ) : null}

      <div className="rounded-md border">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
          onClick={() => setAdjustOpen((o) => !o)}
          aria-expanded={adjustOpen}
        >
          <span className="flex-1">Ajustar valores</span>
          <span className="text-xs font-normal text-muted-foreground">
            editables
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              adjustOpen && "rotate-180"
            )}
          />
        </button>
        {adjustOpen ? (
          <div className="border-t px-3 py-3">
            <CollapsibleCategoryGroups
              groups={groups}
              expanded={expanded}
              onToggle={(id) =>
                setExpanded((prev) => toggleExpandedId(prev, id))
              }
              className="p-0"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RequirementsKpiReadonly({
  value,
  meta,
}: {
  value: Requirements;
  meta: RequirementCalcMeta | null;
}) {
  const tiles: Array<{ label: string; display: string }> = [
    {
      label: "Energía",
      display:
        value.energy > 0 ? `${formatNumber(value.energy, 0)} kcal` : "—",
    },
    {
      label: "Proteína",
      display:
        value.proteinTotal > 0
          ? `${formatNumber(value.proteinTotal, 1)} g`
          : "—",
    },
    {
      label: "Carbohidratos",
      display: value.carbs > 0 ? `${formatNumber(value.carbs, 1)} g` : "—",
    },
    {
      label: "Grasa",
      display:
        value.fatTotal > 0 ? `${formatNumber(value.fatTotal, 1)} g` : "—",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Resumen de metas
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-lg border bg-muted/15 px-3 py-2.5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
              {tile.display}
            </p>
          </div>
        ))}
      </div>
      {meta && meta.errors.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {meta.energySource === "formula" ? (
            <>
              {meta.bmrFormulaLabel}
              {meta.bmr != null ? ` · TMB ${meta.bmr} kcal` : ""}
              {meta.pal != null ? ` · PAL ${meta.pal}` : ""}
              {meta.teeBeforeAdjust != null
                ? ` · GET≈${meta.teeBeforeAdjust} kcal`
                : ""}
              {meta.imc != null ? ` · IMC ${meta.imc}` : ""}
            </>
          ) : meta.energySource === "kcal_per_kg" ? (
            <>
              {meta.bmrFormulaLabel}
              {meta.teeBeforeAdjust != null
                ? ` · GET≈${meta.teeBeforeAdjust} kcal`
                : ""}
              {meta.imc != null ? ` · IMC ${meta.imc}` : ""}
            </>
          ) : (
            <>Energía desde tabla CENAN · {meta.bmrFormulaLabel}</>
          )}
        </p>
      ) : null}
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
