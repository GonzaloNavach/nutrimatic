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
import type { AdequacyRow, Food, MealItem } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

type Phase = "metas" | "cubrir" | "resumen";

const MACRO_KEYS = [
  "energy",
  "proteinTotal",
  "fatTotal",
  "carbs",
  "fiber",
  "calcium",
  "iron",
  "vitaminC",
] as const;

export function PreviewD({ foods }: { foods: Food[] }) {
  const plan = usePlanState(foods);
  const [phase, setPhase] = useState<Phase>("cubrir");
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [targetMealId, setTargetMealId] = useState(plan.meals[0]?.id ?? "");
  const [draftGrams, setDraftGrams] = useState(100);
  const [draftFood, setDraftFood] = useState<Food | null>(null);

  const openGaps = useMemo(
    () =>
      plan.adequacyRows
        .filter((r) => r.percent !== null && r.status === "low")
        .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0)),
    [plan.adequacyRows]
  );

  const focusRow: AdequacyRow | undefined = plan.adequacyRows.find(
    (r) => r.key === focusKey
  );

  const addFoodToMeal = () => {
    if (!draftFood || !targetMealId) return;
    plan.setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== targetMealId) return meal;
        const empty = meal.items.find((i) => !i.foodId);
        if (empty) {
          return {
            ...meal,
            items: meal.items.map((i) =>
              i.id === empty.id
                ? { ...i, foodId: draftFood.id, grams: draftGrams }
                : i
            ),
          };
        }
        const item: MealItem = {
          ...createItem(),
          foodId: draftFood.id,
          grams: draftGrams,
        };
        return { ...meal, items: [...meal.items, item] };
      })
    );
    setDraftFood(null);
  };

  return (
    <div
      data-preview="d"
      className="min-h-screen bg-[#f3f0ea] text-[#1c1917]"
      style={{
        fontFamily:
          '"Segoe UI", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <PreviewChrome
        option="d"
        blurb="D · Solo concepto — los gaps guían el plan; sin layout tipo hoja."
      />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
              <Target className="size-3.5" />
              Misión de cobertura
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Cerrar lo que falta
            </h1>
            <p className="mt-2 max-w-lg text-sm text-stone-600">
              No empezás por la tabla de desayuno. Empezás por los nutrientes
              bajo meta, elegís una comida y sumás alimento hasta equilibrar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-stone-300 bg-white"
              onClick={plan.clearPlan}
            >
              <RotateCcw className="size-4" />
              Limpiar plan
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#0f766e] text-white hover:bg-[#0d9488]"
              onClick={plan.loadExample}
            >
              Ejemplo
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-1 rounded-full border border-stone-300 bg-white p-1">
          {(
            [
              ["metas", "1. Metas"],
              ["cubrir", "2. Cubrir"],
              ["resumen", "3. Resumen"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPhase(id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                phase === id
                  ? "bg-[#1c1917] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {phase === "metas" ? (
          <section className="rounded-3xl border border-stone-300 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Requerimientos del paciente</h2>
            <p className="mt-1 text-sm text-stone-500">
              Definí metas antes de armar el día. Después pasá a Cubrir.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MACRO_KEYS.map((key) => {
                const row = plan.adequacyRows.find((r) => r.key === key);
                return (
                  <label key={key} className="space-y-1 text-xs text-stone-500">
                    {row?.label ?? key} ({row?.unit ?? ""})
                    <Input
                      type="number"
                      min={0}
                      value={plan.requirements[key] || ""}
                      className="border-stone-300 bg-[#fafaf9]"
                      onChange={(e) =>
                        plan.setRequirements({
                          ...plan.requirements,
                          [key]: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </label>
                );
              })}
            </div>
            <Button
              type="button"
              className="mt-6 bg-[#0f766e] text-white hover:bg-[#0d9488]"
              onClick={() => setPhase("cubrir")}
            >
              Ir a cubrir gaps
              <ArrowRight className="size-4" />
            </Button>
          </section>
        ) : null}

        {phase === "cubrir" ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Bajo meta ({openGaps.length})
                </h2>
                <p className="text-sm tabular-nums text-stone-500">
                  Cobertura {plan.coveragePct}%
                </p>
              </div>

              {openGaps.length === 0 ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                  <CheckCircle2 className="mb-2 size-6" />
                  <p className="font-semibold">Sin gaps bajos</p>
                  <p className="mt-1 text-sm opacity-80">
                    Podés revisar el resumen o ajustar exceso en otros
                    nutrientes.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-emerald-800 text-white"
                    onClick={() => setPhase("resumen")}
                  >
                    Ver resumen
                  </Button>
                </div>
              ) : (
                openGaps.map((row) => {
                  const selected = focusKey === row.key;
                  return (
                    <button
                      key={row.key}
                      type="button"
                      onClick={() => setFocusKey(row.key)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
                        selected
                          ? "border-[#0f766e] bg-[#0f766e] text-white"
                          : "border-stone-300 bg-white hover:border-stone-400"
                      )}
                    >
                      <CircleDashed
                        className={cn(
                          "size-5 shrink-0",
                          selected ? "text-white/80" : "text-amber-600"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{row.label}</p>
                        <p
                          className={cn(
                            "text-sm tabular-nums",
                            selected ? "text-white/75" : "text-stone-500"
                          )}
                        >
                          {formatNumber(row.provided, 1)} de{" "}
                          {formatNumber(row.recommended, 1)} {row.unit} (
                          {formatNumber(row.percent ?? 0, 0)}%)
                        </p>
                      </div>
                      <ArrowRight
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-white" : "text-stone-400"
                        )}
                      />
                    </button>
                  );
                })
              )}
            </section>

            <aside className="rounded-3xl border border-stone-300 bg-white p-4 lg:sticky lg:top-[60px] lg:self-start">
              {focusRow ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e]">
                    Acción
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    Subir {focusRow.label}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    Faltan aprox.{" "}
                    <span className="font-medium text-stone-800">
                      {formatNumber(
                        Math.max(0, focusRow.recommended - focusRow.provided),
                        1
                      )}{" "}
                      {focusRow.unit}
                    </span>
                  </p>

                  <label className="mt-4 block text-xs font-medium text-stone-500">
                    Comida destino
                    <select
                      className="mt-1 w-full rounded-md border border-stone-300 bg-[#fafaf9] px-3 py-2 text-sm"
                      value={targetMealId}
                      onChange={(e) => setTargetMealId(e.target.value)}
                    >
                      {plan.meals.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-stone-500">
                      Alimento
                    </p>
                    <FoodCategoryPicker
                      foods={foods}
                      value={draftFood}
                      onSelect={setDraftFood}
                    />
                    <label className="block text-xs font-medium text-stone-500">
                      Gramos
                      <Input
                        type="number"
                        min={1}
                        value={draftGrams}
                        className="mt-1 border-stone-300"
                        onChange={(e) =>
                          setDraftGrams(Number(e.target.value) || 0)
                        }
                      />
                    </label>
                    {draftFood ? (
                      <p className="text-xs text-stone-500">
                        Aporte aprox.:{" "}
                        {formatNumber(
                          calculateItemTotals(draftFood, draftGrams).energy,
                          0
                        )}{" "}
                        kcal
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      className="w-full bg-[#0f766e] text-white hover:bg-[#0d9488]"
                      disabled={!draftFood}
                      onClick={addFoodToMeal}
                    >
                      Sumar al plan
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-stone-500">
                  Elegí un nutriente bajo meta para sumar un alimento.
                </div>
              )}
            </aside>
          </div>
        ) : null}

        {phase === "resumen" ? (
          <section className="space-y-4">
            <div className="rounded-3xl border border-stone-300 bg-white p-5">
              <h2 className="text-lg font-semibold">Resumen del día</h2>
              <p className="mt-1 text-sm text-stone-500">
                {plan.coveragePct}% en rango · {plan.lowCount} bajos ·{" "}
                {plan.highCount} altos · S/{" "}
                {formatNumber(plan.dayTotals.cost, 2)}
              </p>
              <div className="mt-4 divide-y divide-stone-200">
                {plan.meals.map((meal) => {
                  const totals = calculateMealTotals(meal.items, plan.foodMap);
                  const lines = meal.items.filter((i) => i.foodId);
                  return (
                    <div key={meal.id} className="py-3">
                      <div className="flex justify-between gap-2">
                        <p className="font-medium">{meal.label}</p>
                        <p className="text-sm tabular-nums text-stone-500">
                          {formatNumber(totals.energy, 0)} kcal
                        </p>
                      </div>
                      <ul className="mt-1 space-y-0.5 text-sm text-stone-600">
                        {lines.length === 0 ? (
                          <li className="text-stone-400">Sin alimentos</li>
                        ) : (
                          lines.map((item) => {
                            const food = plan.foodMap.get(item.foodId!);
                            return (
                              <li key={item.id}>
                                {food?.name ?? "—"} · {item.grams} g
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-300 bg-white p-5">
              <h3 className="font-semibold">Adecuación</h3>
              <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
                {plan.adequacyRows
                  .filter((r) => r.percent !== null)
                  .map((row) => (
                    <li
                      key={row.key}
                      className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2"
                    >
                      <span>{row.label}</span>
                      <span
                        className={cn(
                          "tabular-nums text-xs font-medium",
                          row.status === "ok" && "text-emerald-700",
                          row.status === "low" && "text-amber-700",
                          row.status === "high" && "text-rose-700"
                        )}
                      >
                        {formatNumber(row.percent ?? 0, 0)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
