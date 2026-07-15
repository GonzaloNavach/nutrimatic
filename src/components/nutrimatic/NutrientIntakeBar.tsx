"use client";

import { Card, CardContent } from "@/components/ui/card";
import { mealColorAt } from "@/lib/nutrition/mealColors";
import type { MealBlock } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";

export interface MealSegment {
  mealId: string;
  label: string;
  value: number;
  color: string;
}

interface NutrientIntakeBarProps {
  title: string;
  unit: string;
  provided: number;
  required: number;
  segments: MealSegment[];
  decimals?: number;
  className?: string;
}

/** Barra apilada por comida + marcador de requerimiento. */
export function NutrientIntakeBar({
  title,
  unit,
  provided,
  required,
  segments,
  decimals = 0,
  className,
}: NutrientIntakeBarProps) {
  const scaleMax = Math.max(provided, required, 0);
  const percent =
    required > 0 ? (provided / required) * 100 : null;
  const markerPct =
    required > 0 && scaleMax > 0 ? (required / scaleMax) * 100 : null;
  const grayPct =
    required > provided && scaleMax > 0
      ? ((required - provided) / scaleMax) * 100
      : 0;

  const visibleSegments = segments.filter((s) => s.value > 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="dash-metric-label">{title}</p>
            <p className="mt-1 text-lg font-bold tracking-tight tabular-nums">
              {formatNumber(provided, decimals)}
              {required > 0 ? (
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}
                  / {formatNumber(required, decimals)} {unit}
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}
                  {unit}
                </span>
              )}
            </p>
            {percent !== null ? (
              <p className="dash-hint mt-0.5">
                {formatNumber(percent, 1)}% del objetivo
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="relative h-3 w-full rounded-full bg-muted"
          role="img"
          aria-label={
            required > 0
              ? `${title}: ${formatNumber(provided, decimals)} de ${formatNumber(required, decimals)} ${unit}`
              : `${title}: ${formatNumber(provided, decimals)} ${unit}`
          }
        >
          <div className="flex h-full w-full overflow-hidden rounded-full">
            {scaleMax > 0
              ? visibleSegments.map((seg) => (
                  <div
                    key={seg.mealId}
                    className="h-full min-w-0 transition-[width]"
                    style={{
                      width: `${(seg.value / scaleMax) * 100}%`,
                      backgroundColor: seg.color,
                    }}
                    title={`${seg.label}: ${formatNumber(seg.value, decimals)} ${unit}`}
                  />
                ))
              : null}
            {grayPct > 0 ? (
              <div
                className="h-full bg-border"
                style={{ width: `${grayPct}%` }}
                title="Pendiente para el requerimiento"
              />
            ) : null}
          </div>

          {markerPct !== null ? (
            <div
              className="pointer-events-none absolute inset-y-[-3px] w-0.5 rounded-full bg-foreground shadow-sm"
              style={{ left: `calc(${markerPct}% - 1px)` }}
              title={`Requerimiento: ${formatNumber(required, decimals)} ${unit}`}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface MealContributionLegendProps {
  meals: MealBlock[];
}

export function MealContributionLegend({ meals }: MealContributionLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border/60 bg-card px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Comidas</span>
      {meals.map((meal, index) => (
        <div
          key={meal.id}
          className="inline-flex items-center gap-1.5 text-xs text-foreground"
        >
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: mealColorAt(index) }}
            aria-hidden
          />
          <span className="truncate">{meal.label}</span>
        </div>
      ))}
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-block h-3 w-0.5 rounded-full bg-foreground" />
        Meta
      </div>
    </div>
  );
}

export function buildMealSegments(
  meals: MealBlock[],
  values: number[]
): MealSegment[] {
  return meals.map((meal, index) => ({
    mealId: meal.id,
    label: meal.label,
    value: values[index] ?? 0,
    color: mealColorAt(index),
  }));
}
