"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AppMenu } from "@/components/nutrimatic/AppMenu";
import {
  ColumnLayoutToolbar,
  HiddenColumnsBar,
} from "@/components/nutrimatic/ColumnPicker";
import { MealBlockCard } from "@/components/nutrimatic/MealBlockCard";
import {
  buildMealSegments,
  MealContributionLegend,
  NutrientIntakeBar,
} from "@/components/nutrimatic/NutrientIntakeBar";
import { ThemeToggle } from "@/components/nutrimatic/ThemeToggle";
import { PlanSidePanel } from "@/components/nutrimatic/PlanSidePanel";
import { Button } from "@/components/ui/button";
import { useMealColumns } from "@/hooks/useMealColumns";
import {
  buildAdequacyRows,
  calculateDayTotals,
  calculateMealTotals,
  DEFAULT_REQUIREMENTS,
} from "@/lib/nutrition/calculate";
import { createDefaultMeals, createSamplePlan } from "@/lib/nutrition/meals";
import type { Food, MealBlock, Requirements } from "@/lib/nutrition/types";
import { formatNumber } from "@/lib/utils";
import { RotateCcw, Scale } from "lucide-react";
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
    columnsLocked,
    tipSeen,
    columnsEditable,
    showColumn,
    hideColumn,
    resetColumns,
    toggleColumnsLock,
  } = useMealColumns();

  const foodMap = useMemo(
    () => new Map(foods.map((food) => [food.id, food])),
    [foods]
  );

  const mealTotals = useMemo(
    () => meals.map((meal) => calculateMealTotals(meal.items, foodMap)),
    [meals, foodMap]
  );

  const dayTotals = useMemo(
    () => calculateDayTotals(meals, foodMap),
    [meals, foodMap]
  );

  const adequacyRows = useMemo(
    () => buildAdequacyRows(dayTotals, requirements),
    [dayTotals, requirements]
  );

  const energySegments = useMemo(
    () =>
      buildMealSegments(
        meals,
        mealTotals.map((t) => t.energy)
      ),
    [meals, mealTotals]
  );
  const proteinSegments = useMemo(
    () =>
      buildMealSegments(
        meals,
        mealTotals.map((t) => t.proteinTotal)
      ),
    [meals, mealTotals]
  );
  const carbSegments = useMemo(
    () =>
      buildMealSegments(
        meals,
        mealTotals.map((t) => t.carbs)
      ),
    [meals, mealTotals]
  );

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
                  onClick={() => setMeals(createDefaultMeals())}
                >
                  <RotateCcw className="size-4" />
                  Limpiar
                </Button>
                <ThemeToggle />
                <AppMenu
                  onLoadExample={() => setMeals(createSamplePlan(foods))}
                />
              </>
            }
          />

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <NutrientIntakeBar
                title="Energía"
                unit="kcal"
                provided={dayTotals.energy}
                required={requirements.energy}
                segments={energySegments}
                decimals={0}
              />
              <NutrientIntakeBar
                title="Proteína"
                unit="g"
                provided={dayTotals.proteinTotal}
                required={requirements.proteinTotal}
                segments={proteinSegments}
                decimals={1}
              />
              <NutrientIntakeBar
                title="Carbohidratos"
                unit="g"
                provided={dayTotals.carbs}
                required={requirements.carbs}
                segments={carbSegments}
                decimals={1}
              />
              <KpiCard
                title="Peso neto total"
                value={`${formatNumber(dayTotals.grams, 0)} g`}
                subtitle={`Costo S/ ${formatNumber(dayTotals.cost, 2)}`}
                icon={Scale}
              />
            </div>
            <MealContributionLegend meals={meals} />
          </div>

          <div className="space-y-4">
            <ColumnLayoutToolbar
              columnsLocked={columnsLocked}
              tipSeen={tipSeen}
              onToggleLock={toggleColumnsLock}
              onResetColumns={resetColumns}
            />
            {columnsEditable ? (
              <HiddenColumnsBar
                hiddenColumns={hiddenColumns}
                onShow={showColumn}
              />
            ) : null}
            {meals.map((meal) => (
              <MealBlockCard
                key={meal.id}
                meal={meal}
                foods={foods}
                foodMap={foodMap}
                visibleColumns={visibleColumns}
                hiddenColumns={hiddenColumns}
                columnsEditable={columnsEditable}
                onHideColumn={hideColumn}
                onShowColumn={showColumn}
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
  );
}
