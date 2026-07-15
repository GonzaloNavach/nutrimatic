"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { HiddenColumnsBar } from "@/components/nutrimatic/ColumnPicker";
import { MealBlockCard } from "@/components/nutrimatic/MealBlockCard";
import { PlanSidePanel } from "@/components/nutrimatic/PlanSidePanel";
import { Button } from "@/components/ui/button";
import { useMealColumns } from "@/hooks/useMealColumns";
import {
  buildAdequacyRows,
  calculateDayTotals,
  DEFAULT_REQUIREMENTS,
} from "@/lib/nutrition/calculate";
import { createDefaultMeals, createSamplePlan } from "@/lib/nutrition/meals";
import type { Food, MealBlock, Requirements } from "@/lib/nutrition/types";
import { formatNumber } from "@/lib/utils";
import { Apple, Flame, RotateCcw, Salad, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

interface CalculatorAppProps {
  foods: Food[];
}

export function CalculatorApp({ foods }: CalculatorAppProps) {
  const [meals, setMeals] = useState<MealBlock[]>(() => createSamplePlan(foods));
  const [requirements, setRequirements] = useState<Requirements>(
    DEFAULT_REQUIREMENTS
  );

  const {
    visibleColumns,
    hiddenColumns,
    showColumn,
    hideColumn,
    resetColumns,
  } = useMealColumns();

  const foodMap = useMemo(
    () => new Map(foods.map((food) => [food.id, food])),
    [foods]
  );

  const dayTotals = useMemo(
    () => calculateDayTotals(meals, foodMap),
    [meals, foodMap]
  );

  const adequacyRows = useMemo(
    () => buildAdequacyRows(dayTotals, requirements),
    [dayTotals, requirements]
  );

  const energyAdequacy = adequacyRows.find((row) => row.key === "energy");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-section py-6">
        <div className="content-section space-y-6">
          <PageHeader
            title="Nutrimatic"
            description="Calculador de planes nutricionales — TPCA 2023 (INS)"
            actions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMeals(createSamplePlan(foods))}
                >
                  <Sparkles className="size-4" />
                  Cargar ejemplo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMeals(createDefaultMeals())}
                >
                  <RotateCcw className="size-4" />
                  Limpiar
                </Button>
              </>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Energía del día"
              value={`${formatNumber(dayTotals.energy, 0)} kcal`}
              subtitle={
                energyAdequacy?.percent
                  ? `${formatNumber(energyAdequacy.percent, 1)}% del objetivo`
                  : undefined
              }
              icon={Flame}
            />
            <KpiCard
              title="Proteína total"
              value={`${formatNumber(dayTotals.proteinTotal, 1)} g`}
              icon={Salad}
            />
            <KpiCard
              title="Carbohidratos"
              value={`${formatNumber(dayTotals.carbs, 1)} g`}
              icon={Apple}
            />
            <KpiCard
              title="Peso neto total"
              value={`${formatNumber(dayTotals.grams, 0)} g`}
              subtitle={`Costo S/ ${formatNumber(dayTotals.cost, 2)}`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
            <div className="space-y-4">
              <HiddenColumnsBar
                hiddenColumns={hiddenColumns}
                onShow={showColumn}
              />
              {meals.map((meal) => (
                <MealBlockCard
                  key={meal.id}
                  meal={meal}
                  foods={foods}
                  foodMap={foodMap}
                  visibleColumns={visibleColumns}
                  hiddenColumns={hiddenColumns}
                  onHideColumn={hideColumn}
                  onShowColumn={showColumn}
                  onResetColumns={resetColumns}
                  onChange={(nextMeal) =>
                    setMeals((prev) =>
                      prev.map((item) =>
                        item.id === nextMeal.id ? nextMeal : item
                      )
                    )
                  }
                />
              ))}
            </div>

            <PlanSidePanel
              requirements={requirements}
              onRequirementsChange={setRequirements}
              adequacyRows={adequacyRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
