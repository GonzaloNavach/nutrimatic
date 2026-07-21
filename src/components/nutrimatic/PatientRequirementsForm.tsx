"use client";

import { ClinicalContextPanel } from "@/components/nutrimatic/ClinicalContextPanel";
import { PatientLabPanelFields } from "@/components/nutrimatic/PatientLabPanelFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildClinicalContext } from "@/lib/nutrition/clinicalContext";
import { BMR_FORMULA_LABELS } from "@/lib/nutrition/bmrFormulas";
import {
  classifyWaistRisk,
  computeWaistHeightRatio,
  computeWaistHipRatio,
  classifyIcc,
  classifyWaistHeightRatio,
} from "@/lib/nutrition/clinicalAnthropometry";
import {
  ACTIVITY_LABELS,
  BIOAVAILABILITY_LABELS,
  CLINICAL_REASON_LABELS,
  GOAL_LABELS,
  RESIDENCE_LABELS,
  computeImc,
  imcCategoryLabel,
  suggestedEnergyGoal,
  type ActivityLevel,
  type Bioavailability,
  type BmrFormula,
  type ClinicalPlanReason,
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
import { cn, formatNumber } from "@/lib/utils";
import { Calculator, ChevronDown, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [color-scheme:light] dark:[color-scheme:dark]";

interface PatientRequirementsFormProps {
  profile: PatientProfile;
  onProfileChange: (profile: PatientProfile) => void;
  onApply: (requirements: Requirements, meta: RequirementCalcMeta) => void;
  onSkipManual: () => void;
  className?: string;
}

export function PatientRequirementsForm({
  profile,
  onProfileChange,
  onApply,
  onSkipManual,
  className,
}: PatientRequirementsFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate = useMemo(() => canCalculateRequirements(profile), [profile]);
  const imc = useMemo(
    () => computeImc(profile.weightKg, profile.heightCm),
    [profile.weightKg, profile.heightCm]
  );
  const liveContext = useMemo(() => buildClinicalContext(profile), [profile]);
  const suggestedGoal = useMemo(
    () => suggestedEnergyGoal(profile.clinicalReason),
    [profile.clinicalReason]
  );
  const goalMismatch = profile.goal !== suggestedGoal;

  const waistRisk = useMemo(() => {
    if (
      !profile.sex ||
      profile.ageYears == null ||
      profile.waistCm == null ||
      profile.waistCm <= 0
    ) {
      return null;
    }
    return classifyWaistRisk(
      profile.sex as Sex,
      profile.ageYears,
      profile.waistCm
    );
  }, [profile.sex, profile.ageYears, profile.waistCm]);

  const icc = useMemo(
    () => computeWaistHipRatio(profile.waistCm, profile.hipCm),
    [profile.waistCm, profile.hipCm]
  );

  const whtr = useMemo(
    () => computeWaistHeightRatio(profile.waistCm, profile.heightCm),
    [profile.waistCm, profile.heightCm]
  );

  function patch(partial: Partial<PatientProfile>) {
    onProfileChange({ ...profile, ...partial });
    setError(null);
  }

  function applySuggestedGoal() {
    patch({ goal: suggestedGoal });
  }

  function handleCalculate() {
    const result = calculatePatientRequirements(profile);
    if (!result.ok) {
      setError(result.meta.errors[0] ?? "No se pudo calcular.");
      return;
    }
    setError(null);
    onApply(result.requirements, result.meta);
  }

  return (
    <div className={cn("space-y-4 rounded-lg border bg-muted/20 p-4", className)}>
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Paciente</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Antropometría, motivo clínico, laboratorio y fórmula energética.
        </p>
      </div>

      <div className="space-y-4">
        <FieldGroup title="Identidad">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Sexo" htmlFor="pat-sex">
              <select
                id="pat-sex"
                className={selectClass}
                value={profile.sex}
                onChange={(e) => patch({ sex: e.target.value as Sex | "" })}
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
          </div>
        </FieldGroup>

        <FieldGroup title="Antropometría">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
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

              <Field label="Circunferencia abdominal (cm)" htmlFor="pat-waist">
                <Input
                  id="pat-waist"
                  type="number"
                  min={30}
                  max={200}
                  step="0.1"
                  value={profile.waistCm ?? ""}
                  onChange={(e) =>
                    patch({
                      waistCm: e.target.value
                        ? Number.parseFloat(e.target.value)
                        : null,
                    })
                  }
                />
              </Field>

              <Field label="Circunferencia cadera (cm)" htmlFor="pat-hip">
                <Input
                  id="pat-hip"
                  type="number"
                  min={30}
                  max={200}
                  step="0.1"
                  value={profile.hipCm ?? ""}
                  onChange={(e) =>
                    patch({
                      hipCm: e.target.value
                        ? Number.parseFloat(e.target.value)
                        : null,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ImcBand imc={imc} />
              {waistRisk ? (
                <MetricBand
                  label="Riesgo CV (CA · INS)"
                  value={waistRisk.label}
                  detail={waistRisk.detail}
                  tone={
                    waistRisk.level === "very_high"
                      ? "alert"
                      : waistRisk.level === "high"
                        ? "warning"
                        : "ok"
                  }
                />
              ) : (
                <MetricBand
                  label="Riesgo CV (CA · INS)"
                  value="—"
                  detail="Ingresá circunferencia abdominal"
                  tone="empty"
                />
              )}
            </div>

            {(icc != null || whtr != null) && profile.sex ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {icc != null ? (
                  <span className="rounded-md bg-muted px-2 py-1">
                    ICC {icc} · {classifyIcc(profile.sex as Sex, icc).label}
                  </span>
                ) : null}
                {whtr != null ? (
                  <span className="rounded-md bg-muted px-2 py-1">
                    WHtR {whtr} · {classifyWaistHeightRatio(whtr).label}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </FieldGroup>

        <FieldGroup title="Motivo y energía">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Motivo del plan" htmlFor="pat-reason">
              <select
                id="pat-reason"
                className={selectClass}
                value={profile.clinicalReason}
                onChange={(e) =>
                  patch({
                    clinicalReason: e.target.value as ClinicalPlanReason,
                  })
                }
              >
                {(
                  Object.keys(CLINICAL_REASON_LABELS) as ClinicalPlanReason[]
                ).map((key) => (
                  <option key={key} value={key}>
                    {CLINICAL_REASON_LABELS[key]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ajuste energético" htmlFor="pat-goal">
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

            <Field label="Actividad física" htmlFor="pat-activity">
              <select
                id="pat-activity"
                className={selectClass}
                value={profile.activity}
                onChange={(e) =>
                  patch({ activity: e.target.value as ActivityLevel })
                }
              >
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {ACTIVITY_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="PA sistólica" htmlFor="pat-sys">
                <Input
                  id="pat-sys"
                  type="number"
                  min={70}
                  max={250}
                  step={1}
                  placeholder="mmHg"
                  value={profile.systolicBp ?? ""}
                  onChange={(e) =>
                    patch({
                      systolicBp: e.target.value
                        ? Number.parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                />
              </Field>
              <Field label="PA diastólica" htmlFor="pat-dia">
                <Input
                  id="pat-dia"
                  type="number"
                  min={40}
                  max={150}
                  step={1}
                  placeholder="mmHg"
                  value={profile.diastolicBp ?? ""}
                  onChange={(e) =>
                    patch({
                      diastolicBp: e.target.value
                        ? Number.parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                />
              </Field>
            </div>
          </div>

          {goalMismatch ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Sugerido para este motivo:{" "}
                <strong>{GOAL_LABELS[suggestedGoal]}</strong>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={applySuggestedGoal}
              >
                <Sparkles className="size-3" />
                Aplicar
              </Button>
            </div>
          ) : null}
        </FieldGroup>
      </div>

      <CollapsibleSection
        title="Pruebas químicas"
        subtitle="opcional · valor + fecha"
        open={labOpen}
        onToggle={() => setLabOpen((o) => !o)}
      >
        <PatientLabPanelFields profile={profile} onProfileChange={onProfileChange} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Opciones avanzadas"
        subtitle="fórmula TMB, gestación, CENAN"
        open={advancedOpen}
        onToggle={() => setAdvancedOpen((o) => !o)}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fórmula energética" htmlFor="pat-formula">
            <select
              id="pat-formula"
              className={selectClass}
              value={profile.bmrFormula}
              onChange={(e) =>
                patch({ bmrFormula: e.target.value as BmrFormula })
              }
            >
              {(Object.keys(BMR_FORMULA_LABELS) as BmrFormula[]).map((key) => (
                <option key={key} value={key}>
                  {BMR_FORMULA_LABELS[key]}
                </option>
              ))}
            </select>
          </Field>

          {profile.bmrFormula === "kcal_per_kg" ? (
            <Field label="kcal/kg corporal" htmlFor="pat-kpkg">
              <Input
                id="pat-kpkg"
                type="number"
                min={1}
                max={60}
                step="0.5"
                value={profile.kcalPerKg}
                onChange={(e) =>
                  patch({
                    kcalPerKg: Number.parseFloat(e.target.value) || 30,
                  })
                }
              />
            </Field>
          ) : null}

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
      </CollapsibleSection>

      {liveContext.flags.length > 0 || liveContext.planGuidance.length > 0 ? (
        <ClinicalContextPanel context={liveContext} compact />
      ) : null}

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
        <Button type="button" size="sm" variant="ghost" onClick={onSkipManual}>
          Editar metas a mano
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
    </div>
  );
}

function imcBandTone(imc: number): string {
  if (imc < 18.5) {
    return "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100";
  }
  if (imc < 25) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
  }
  if (imc < 30) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100";
}

function ImcBand({ imc }: { imc: number | null }) {
  if (imc == null) {
    return (
      <MetricBand
        label="IMC"
        value="—"
        detail="Completá peso y talla"
        tone="empty"
      />
    );
  }

  return (
    <div
      id="pat-imc"
      aria-live="polite"
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
        imcBandTone(imc)
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          IMC
        </p>
        <p className="mt-0.5 text-sm font-medium">{imcCategoryLabel(imc)}</p>
      </div>
      <span className="text-2xl font-semibold tabular-nums tracking-tight">
        {formatNumber(imc, 1)}
      </span>
    </div>
  );
}

function metricToneClass(tone: "ok" | "warning" | "alert" | "empty"): string {
  if (tone === "empty") {
    return "border-dashed border-input bg-muted/20 text-muted-foreground";
  }
  if (tone === "alert") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100";
  }
  if (tone === "warning") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
  }
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
}

function MetricBand({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "ok" | "warning" | "alert" | "empty";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        metricToneClass(tone)
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
      <p className="mt-0.5 text-[11px] opacity-80">{detail}</p>
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border bg-background/60">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="flex-1">{title}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {subtitle}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? <div className="border-t px-3 py-3">{children}</div> : null}
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
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
