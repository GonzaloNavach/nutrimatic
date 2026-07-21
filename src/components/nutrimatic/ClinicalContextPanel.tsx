"use client";

import type { ClinicalContext, ClinicalFlag } from "@/lib/nutrition/clinicalContext";
import type { LabEvaluation } from "@/lib/nutrition/clinicalLabs";
import { cn, formatNumber } from "@/lib/utils";
import { AlertTriangle, Info, Stethoscope } from "lucide-react";

interface ClinicalContextPanelProps {
  context: ClinicalContext;
  calcNotes?: string[];
  className?: string;
  compact?: boolean;
}

export function ClinicalContextPanel({
  context,
  calcNotes = [],
  className,
  compact = false,
}: ClinicalContextPanelProps) {
  const hasAnthro =
    context.waistRisk != null ||
    context.icc != null ||
    context.waistHeightRatio != null;
  const hasContent =
    hasAnthro ||
    context.flags.length > 0 ||
    context.planGuidance.length > 0 ||
    calcNotes.length > 0;

  if (!hasContent) return null;

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-4",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Stethoscope className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-300" />
        <div className="min-w-0">
          <h4 className="text-sm font-semibold tracking-tight">
            Contexto clínico
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {context.clinicalReasonLabel}
            {!compact && context.labEvaluations.length > 0
              ? ` · ${context.labEvaluations.length} valor(es) de lab`
              : ""}
          </p>
        </div>
      </div>

      {hasAnthro ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {context.waistRisk ? (
            <AnthroChip
              label="Circunferencia abdominal"
              value={context.waistRisk.label}
              tone={waistTone(context.waistRisk.level)}
              detail={context.waistRisk.detail}
            />
          ) : null}
          {context.icc != null && context.iccLabel ? (
            <AnthroChip
              label="ICC"
              value={context.iccLabel}
              tone="warning"
              detail={`ICC = ${formatNumber(context.icc, 3)}`}
            />
          ) : null}
          {context.waistHeightRatio != null && context.waistHeightLabel ? (
            <AnthroChip
              label="WHtR"
              value={context.waistHeightLabel}
              tone={
                context.waistHeightRatio >= 0.5 ? "warning" : "neutral"
              }
              detail={`WHtR = ${formatNumber(context.waistHeightRatio, 3)}`}
            />
          ) : null}
        </div>
      ) : null}

      {context.flags.length > 0 ? (
        <ul className="space-y-2">
          {context.flags.map((flag) => (
            <FlagRow key={flag.id} flag={flag} />
          ))}
        </ul>
      ) : null}

      {!compact && context.labEvaluations.length > 0 ? (
        <LabTable evaluations={context.labEvaluations} />
      ) : null}

      {context.planGuidance.length > 0 ? (
        <div className="rounded-md border bg-background/60 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Guía para el plan
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-foreground/90">
            {context.planGuidance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {calcNotes.length > 0 && !compact ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            Detalle del cálculo ({calcNotes.length})
          </summary>
          <ul className="mt-2 list-disc space-y-0.5 pl-4">
            {calcNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function waistTone(level: "low" | "high" | "very_high") {
  if (level === "very_high") return "alert" as const;
  if (level === "high") return "warning" as const;
  return "neutral" as const;
}

function AnthroChip({
  label,
  value,
  tone,
  detail,
}: {
  label: string;
  value: string;
  tone: "neutral" | "warning" | "alert";
  detail: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2.5 py-2",
        tone === "alert" &&
          "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100",
        tone === "warning" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
        tone === "neutral" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
      <p className="mt-0.5 text-[11px] opacity-80">{detail}</p>
    </div>
  );
}

function FlagRow({ flag }: { flag: ClinicalFlag }) {
  const Icon = flag.severity === "info" ? Info : AlertTriangle;
  return (
    <li
      className={cn(
        "flex gap-2 rounded-md border px-2.5 py-2 text-xs",
        flag.severity === "alert" &&
          "border-rose-500/25 bg-rose-500/5 text-rose-950 dark:text-rose-100",
        flag.severity === "warning" &&
          "border-amber-500/25 bg-amber-500/5 text-amber-950 dark:text-amber-100",
        flag.severity === "info" &&
          "border-border bg-muted/30 text-foreground"
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
      <div>
        <p className="font-medium">{flag.title}</p>
        {flag.detail ? (
          <p className="mt-0.5 text-muted-foreground">{flag.detail}</p>
        ) : null}
      </div>
    </li>
  );
}

function LabTable({ evaluations }: { evaluations: LabEvaluation[] }) {
  return (
    <div className="overflow-x-auto rounded-md border bg-background/60">
      <table className="w-full min-w-[320px] text-left text-xs">
        <thead>
          <tr className="border-b bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-2 py-1.5 font-semibold">Analito</th>
            <th className="px-2 py-1.5 font-semibold">Valor</th>
            <th className="px-2 py-1.5 font-semibold">Interpretación</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="px-2 py-1.5 font-medium">{row.label}</td>
              <td className="px-2 py-1.5 tabular-nums">{row.valueDisplay}</td>
              <td
                className={cn(
                  "px-2 py-1.5",
                  row.severity === "high" && "text-rose-700 dark:text-rose-300",
                  row.severity === "borderline" &&
                    "text-amber-800 dark:text-amber-200",
                  row.severity === "low" && "text-sky-800 dark:text-sky-200"
                )}
              >
                {row.interpretation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
