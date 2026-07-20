"use client";

import { FoodCategoryPicker } from "@/components/nutrimatic/FoodCategoryPicker";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { usePlanState } from "@/components/preview/usePlanState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateItemTotals,
  calculateMealTotals,
} from "@/lib/nutrition/calculate";
import { createItem } from "@/lib/nutrition/meals";
import type { AdequacyRow, Food, MealBlock, MealItem } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function CoverageRing({
  pct,
  label,
}: {
  pct: number;
  label: string;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-36">
        <svg viewBox="0 0 128 128" className="size-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-[#243044]"
          />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="text-[#ff6b4a] transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-white">
            {clamped}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            OK
          </span>
        </div>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function GapChip({ row }: { row: AdequacyRow }) {
  if (row.percent === null) return null;
  const tone =
    row.status === "ok"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : row.status === "low"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
        : "border-rose-500/30 bg-rose-500/10 text-rose-100";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
        tone
      )}
    >
      <span className="font-medium">{row.label}</span>
      <span className="tabular-nums text-xs opacity-90">
        {formatNumber(row.provided, 0)}/{formatNumber(row.recommended, 0)}{" "}
        {row.unit} · {formatNumber(row.percent, 0)}%
      </span>
    </div>
  );
}

function CompactMeal({
  meal,
  foods,
  foodMap,
  onChange,
  active,
  onFocus,
}: {
  meal: MealBlock;
  foods: Food[];
  foodMap: Map<number, Food>;
  onChange: (meal: MealBlock) => void;
  active: boolean;
  onFocus: () => void;
}) {
  const totals = calculateMealTotals(meal.items, foodMap);

  const updateItem = (itemId: string, patch: Partial<MealItem>) => {
    onChange({
      ...meal,
      items: meal.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      ),
    });
  };

  const removeItem = (itemId: string) => {
    const next = meal.items.filter((i) => i.id !== itemId);
    onChange({
      ...meal,
      items: next.length ? next : [createItem()],
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-colors",
        active
          ? "border-[#ff6b4a]/60 bg-[#1a2332]"
          : "border-white/10 bg-[#141b27] hover:border-white/20"
      )}
    >
      <button
        type="button"
        onClick={onFocus}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="font-medium text-white">{meal.label}</span>
        <span className="text-xs tabular-nums text-white/55">
          {formatNumber(totals.energy, 0)} kcal ·{" "}
          {formatNumber(totals.proteinTotal, 0)} g prot
        </span>
      </button>

      {active ? (
        <div className="space-y-3 border-t border-white/10 px-4 py-3">
          {meal.items.map((item) => {
            const food = item.foodId ? foodMap.get(item.foodId) : undefined;
            const itemTotals = calculateItemTotals(food, item.grams);
            return (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl bg-black/25 p-3 sm:grid-cols-[minmax(0,1fr)_88px_auto]"
              >
                <FoodCategoryPicker
                  foods={foods}
                  value={food ?? null}
                  onSelect={(f) => updateItem(item.id, { foodId: f.id })}
                />
                <Input
                  type="number"
                  min={0}
                  value={item.grams || ""}
                  placeholder="g"
                  className="border-white/10 bg-[#0d121a] text-white"
                  onChange={(e) =>
                    updateItem(item.id, {
                      grams: Number(e.target.value) || 0,
                    })
                  }
                />
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="text-xs tabular-nums text-white/45">
                    {formatNumber(itemTotals.energy, 0)} kcal
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-white/50 hover:text-white"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
            onClick={() =>
              onChange({ ...meal, items: [...meal.items, createItem()] })
            }
          >
            <Plus className="size-4" />
            Alimento
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function PreviewC({ foods }: { foods: Food[] }) {
  const plan = usePlanState(foods);
  const [activeMealId, setActiveMealId] = useState(plan.meals[0]?.id ?? "");

  const priorityGaps = useMemo(() => {
    return plan.adequacyRows
      .filter((r) => r.percent !== null && r.status !== "ok")
      .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0))
      .slice(0, 8);
  }, [plan.adequacyRows]);

  const okRows = useMemo(
    () => plan.adequacyRows.filter((r) => r.status === "ok").slice(0, 4),
    [plan.adequacyRows]
  );

  return (
    <div
      data-preview="c"
      className="min-h-screen bg-[#0b1018] text-[#e8edf5]"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <PreviewChrome
        option="c"
        blurb="C · Command center — cobertura primero, comidas compactas."
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff6b4a]">
              Sesión del día
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cubrir el paciente
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/55">
              Primero ves qué falta. Después ajustás comidas. Sin scrollear una
              hoja interminable.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={plan.clearPlan}
            >
              <RotateCcw className="size-4" />
              Limpiar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#ff6b4a] text-black hover:bg-[#ff8266]"
              onClick={plan.loadExample}
            >
              Cargar ejemplo
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#121926] p-5">
            <CoverageRing
              pct={plan.coveragePct}
              label={`${plan.coveredCount} nutrientes en rango`}
            />
            <div className="grid w-full grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl bg-black/30 px-2 py-3">
                <p className="text-lg font-semibold tabular-nums text-amber-200">
                  {plan.lowCount}
                </p>
                <p className="text-white/45">bajos</p>
              </div>
              <div className="rounded-xl bg-black/30 px-2 py-3">
                <p className="text-lg font-semibold tabular-nums text-rose-200">
                  {plan.highCount}
                </p>
                <p className="text-white/45">altos</p>
              </div>
            </div>
            <div className="w-full space-y-1 text-xs text-white/45">
              <p>
                Energía{" "}
                <span className="float-right tabular-nums text-white/80">
                  {formatNumber(plan.dayTotals.energy, 0)} /{" "}
                  {formatNumber(plan.requirements.energy, 0)} kcal
                </span>
              </p>
              <p>
                Proteína{" "}
                <span className="float-right tabular-nums text-white/80">
                  {formatNumber(plan.dayTotals.proteinTotal, 0)} /{" "}
                  {formatNumber(plan.requirements.proteinTotal, 0)} g
                </span>
              </p>
              <p>
                Costo{" "}
                <span className="float-right tabular-nums text-white/80">
                  S/ {formatNumber(plan.dayTotals.cost, 2)}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">
                Prioridad · cerrar gaps
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {priorityGaps.length === 0 ? (
                  <p className="text-sm text-emerald-300/90 sm:col-span-2">
                    Todos los nutrientes rastreados están en rango.
                  </p>
                ) : (
                  priorityGaps.map((row) => <GapChip key={row.key} row={row} />)
                )}
              </div>
              {okRows.length > 0 ? (
                <p className="mt-3 text-xs text-white/35">
                  En rango: {okRows.map((r) => r.label).join(" · ")}
                  {plan.coveredCount > okRows.length
                    ? ` +${plan.coveredCount - okRows.length}`
                    : ""}
                </p>
              ) : null}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">
                  Comidas
                </h2>
                <p className="text-xs text-white/35">
                  Tocá una para editar alimentos
                </p>
              </div>
              <div className="space-y-2">
                {plan.meals.map((meal) => (
                  <CompactMeal
                    key={meal.id}
                    meal={meal}
                    foods={foods}
                    foodMap={plan.foodMap}
                    active={activeMealId === meal.id}
                    onFocus={() => setActiveMealId(meal.id)}
                    onChange={plan.updateMeal}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#121926] p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">
                Requerimientos (macros clave)
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["energy", "Energía", "kcal"],
                    ["proteinTotal", "Proteína", "g"],
                    ["carbs", "Carbs", "g"],
                    ["fatTotal", "Grasa", "g"],
                  ] as const
                ).map(([key, label, unit]) => (
                  <label key={key} className="space-y-1 text-xs text-white/50">
                    {label} ({unit})
                    <Input
                      type="number"
                      min={0}
                      value={plan.requirements[key] || ""}
                      className="border-white/10 bg-[#0d121a] text-white"
                      onChange={(e) =>
                        plan.setRequirements({
                          ...plan.requirements,
                          [key]: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-white/30">
                Micros completos siguen en la adecuación del anillo / gaps.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
