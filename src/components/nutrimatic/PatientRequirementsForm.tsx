"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACTIVITY_LABELS,
  BIOAVAILABILITY_LABELS,
  DEFAULT_PATIENT_PROFILE,
  GOAL_LABELS,
  RESIDENCE_LABELS,
  type ActivityLevel,
  type Bioavailability,
  type EnergyGoal,
  type LactationSemester,
  type PatientProfile,
  type PhysiologicalState,
  type PregnancyTrimester,
  type ResidenceArea,
  type Sex,
} from "@/lib/nutrition/patientProfile";
import {
  calculatePatientRequirements,
  canCalculateRequirements,
  type RequirementCalcMeta,
} from "@/lib/nutrition/patientRequirements";
import type { Requirements } from "@/lib/nutrition/types";
import { cn } from "@/lib/utils";
import { Calculator, ChevronDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [color-scheme:light] dark:[color-scheme:dark]";

interface PatientRequirementsFormProps {
  onApply: (requirements: Requirements, meta: RequirementCalcMeta) => void;
  className?: string;
}

export function PatientRequirementsForm({
  onApply,
  className,
}: PatientRequirementsFormProps) {
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [lastMeta, setLastMeta] = useState<RequirementCalcMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gate = useMemo(() => canCalculateRequirements(profile), [profile]);

  function patch(partial: Partial<PatientProfile>) {
    setProfile((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function handleCalculate() {
    const result = calculatePatientRequirements(profile);
    if (!result.ok) {
      setError(result.meta.errors[0] ?? "No se pudo calcular.");
      setLastMeta(result.meta);
      return;
    }
    setError(null);
    setLastMeta(result.meta);
    onApply(result.requirements, result.meta);
  }

  return (
    <div className={cn("space-y-4 rounded-lg border bg-muted/20 p-3", className)}>
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Paciente</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Completá lo básico y calculá. Los requerimientos quedan editables.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Sexo" htmlFor="pat-sex">
          <select
            id="pat-sex"
            className={selectClass}
            value={profile.sex}
            onChange={(e) =>
              patch({ sex: e.target.value as Sex | "" })
            }
          >
            <option value="">Seleccionar…</option>
            <option value="female">Mujer</option>
            <option value="male">Hombre</option>
          </select>
        </Field>

        <Field label="Edad (años)" htmlFor="pat-age">
          <Input
            id="pat-age"
            type="number"
            min={1}
            max={120}
            step={1}
            value={profile.ageYears ?? ""}
            onChange={(e) =>
              patch({
                ageYears: e.target.value
                  ? Number.parseInt(e.target.value, 10)
                  : null,
              })
            }
          />
        </Field>

        <Field label="Peso (kg)" htmlFor="pat-weight">
          <Input
            id="pat-weight"
            type="number"
            min={1}
            max={400}
            step="0.1"
            value={profile.weightKg ?? ""}
            onChange={(e) =>
              patch({
                weightKg: e.target.value
                  ? Number.parseFloat(e.target.value)
                  : null,
              })
            }
          />
        </Field>

        <Field label="Talla (cm)" htmlFor="pat-height">
          <Input
            id="pat-height"
            type="number"
            min={40}
            max={250}
            step={1}
            value={profile.heightCm ?? ""}
            onChange={(e) =>
              patch({
                heightCm: e.target.value
                  ? Number.parseFloat(e.target.value)
                  : null,
              })
            }
          />
        </Field>

        <Field label="Actividad" htmlFor="pat-activity">
          <select
            id="pat-activity"
            className={selectClass}
            value={profile.activity}
            onChange={(e) =>
              patch({ activity: e.target.value as ActivityLevel })
            }
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
              <option key={key} value={key}>
                {ACTIVITY_LABELS[key]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Objetivo" htmlFor="pat-goal">
          <select
            id="pat-goal"
            className={selectClass}
            value={profile.goal}
            onChange={(e) => patch({ goal: e.target.value as EnergyGoal })}
          >
            {(Object.keys(GOAL_LABELS) as EnergyGoal[]).map((key) => (
              <option key={key} value={key}>
                {GOAL_LABELS[key]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-md border bg-background/60">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={advancedOpen}
        >
          <span className="flex-1">Opciones avanzadas</span>
          <span className="text-xs font-normal text-muted-foreground">
            opcionales
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              advancedOpen && "rotate-180"
            )}
          />
        </button>
        {advancedOpen ? (
          <div className="grid gap-3 border-t px-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Estado fisiológico" htmlFor="pat-physio">
              <select
                id="pat-physio"
                className={selectClass}
                value={profile.physioState}
                onChange={(e) =>
                  patch({
                    physioState: e.target.value as PhysiologicalState,
                  })
                }
              >
                <option value="none">Ninguno</option>
                <option value="pregnancy">Gestación</option>
                <option value="lactation">Lactancia</option>
              </select>
            </Field>

            {profile.physioState === "pregnancy" ? (
              <Field label="Trimestre" htmlFor="pat-trim">
                <select
                  id="pat-trim"
                  className={selectClass}
                  value={profile.pregnancyTrimester}
                  onChange={(e) =>
                    patch({
                      pregnancyTrimester: Number.parseInt(
                        e.target.value,
                        10
                      ) as PregnancyTrimester,
                    })
                  }
                >
                  <option value={1}>I</option>
                  <option value={2}>II</option>
                  <option value={3}>III</option>
                </select>
              </Field>
            ) : null}

            {profile.physioState === "lactation" ? (
              <Field label="Semestre lactancia" htmlFor="pat-lac">
                <select
                  id="pat-lac"
                  className={selectClass}
                  value={profile.lactationSemester}
                  onChange={(e) =>
                    patch({
                      lactationSemester: Number.parseInt(
                        e.target.value,
                        10
                      ) as LactationSemester,
                    })
                  }
                >
                  <option value={1}>I (0–3 meses)</option>
                  <option value={2}>II (3–6+ meses)</option>
                </select>
              </Field>
            ) : null}

            <Field label="Biodisp. Fe/Zn" htmlFor="pat-bio">
              <select
                id="pat-bio"
                className={selectClass}
                value={profile.bioavailability}
                onChange={(e) =>
                  patch({
                    bioavailability: e.target.value as Bioavailability,
                  })
                }
              >
                {(Object.keys(BIOAVAILABILITY_LABELS) as Bioavailability[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {BIOAVAILABILITY_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Área (tabla CENAN)" htmlFor="pat-area">
              <select
                id="pat-area"
                className={selectClass}
                value={profile.residence}
                onChange={(e) =>
                  patch({ residence: e.target.value as ResidenceArea })
                }
              >
                {(Object.keys(RESIDENCE_LABELS) as ResidenceArea[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {RESIDENCE_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleCalculate}
          disabled={!gate.ready}
        >
          <Calculator className="size-4" />
          Calcular requerimientos
        </Button>
        {!gate.ready ? (
          <p className="text-xs text-muted-foreground">
            Faltan: {gate.missing.join(", ")}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {lastMeta && lastMeta.errors.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {lastMeta.energySource === "schofield" ? (
            <>
              TMB {lastMeta.bmr} kcal · PAL {lastMeta.pal} · GET≈
              {lastMeta.teeBeforeAdjust} kcal
              {lastMeta.imc != null ? ` · IMC ${lastMeta.imc}` : ""}
            </>
          ) : (
            <>Energía desde tabla CENAN (sin peso)</>
          )}
          <span className="mx-1">·</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
            Calculado · editable
          </span>
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
