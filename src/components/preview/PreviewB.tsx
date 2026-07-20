"use client";

import { AdequacyPanel } from "@/components/nutrimatic/AdequacyPanel";
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
import { RequirementsPanel } from "@/components/nutrimatic/RequirementsPanel";
import { ThemeToggle } from "@/components/nutrimatic/ThemeToggle";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { usePlanState } from "@/components/preview/usePlanState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Food } from "@/lib/nutrition/types";
import { formatNumber } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useMemo } from "react";

export function PreviewB({ foods }: { foods: Food[] }) {
  const plan = usePlanState(foods);

  const energySegments = useMemo(
    () =>
      buildMealSegments(
        plan.meals,
        plan.mealTotals.map((t) => t.energy)
      ),
    [plan.meals, plan.mealTotals]
  );
  const proteinSegments = useMemo(
    () =>
      buildMealSegments(
        plan.meals,
        plan.mealTotals.map((t) => t.proteinTotal)
      ),
    [plan.meals, plan.mealTotals]
  );
  const carbSegments = useMemo(
    () =>
      buildMealSegments(
        plan.meals,
        plan.mealTotals.map((t) => t.carbs)
      ),
    [plan.meals, plan.mealTotals]
  );

  return (
    <div data-preview="b" className="min-h-screen bg-background">
      <PreviewChrome
        option="b"
        blurb="B · Evolutiva — plan + panel sticky de metas/adecuación."
      />

      <div className="border-b bg-card/80">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Plan del paciente
            </h1>
            <p className="text-xs text-muted-foreground">
              Cobertura {plan.coveragePct}% · {plan.lowCount} bajos ·{" "}
              {plan.highCount} altos · S/{" "}
              {formatNumber(plan.dayTotals.cost, 2)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={plan.clearPlan}
            >
              <RotateCcw className="size-4" />
              Limpiar
            </Button>
            <ThemeToggle />
            <AppMenu onLoadExample={plan.loadExample} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-screen-2xl gap-0 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-3">
            <NutrientIntakeBar
              title="Energía"
              unit="kcal"
              provided={plan.dayTotals.energy}
              required={plan.requirements.energy}
              segments={energySegments}
              decimals={0}
            />
            <NutrientIntakeBar
              title="Proteína"
              unit="g"
              provided={plan.dayTotals.proteinTotal}
              required={plan.requirements.proteinTotal}
              segments={proteinSegments}
              decimals={1}
            />
            <NutrientIntakeBar
              title="Carbohidratos"
              unit="g"
              provided={plan.dayTotals.carbs}
              required={plan.requirements.carbs}
              segments={carbSegments}
              decimals={1}
            />
          </div>
          <MealContributionLegend meals={plan.meals} />

          <ColumnLayoutToolbar
            columnsLocked={plan.columns.columnsLocked}
            tipSeen={plan.columns.tipSeen}
            onToggleLock={plan.columns.toggleColumnsLock}
            onResetColumns={plan.columns.resetColumns}
          />
          {plan.columns.columnsEditable ? (
            <HiddenColumnsBar
              hiddenColumns={plan.columns.hiddenColumns}
              onShow={plan.columns.showColumn}
            />
          ) : null}

          <div className="space-y-3">
            {plan.meals.map((meal) => (
              <MealBlockCard
                key={meal.id}
                meal={meal}
                foods={foods}
                foodMap={plan.foodMap}
                visibleColumns={plan.columns.visibleColumns}
                hiddenColumns={plan.columns.hiddenColumns}
                columnsEditable={plan.columns.columnsEditable}
                onHideColumn={plan.columns.hideColumn}
                onShowColumn={plan.columns.showColumn}
                onChange={plan.updateMeal}
              />
            ))}
          </div>
        </div>

        <aside className="preview-b-aside border-t bg-muted/30 lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)] lg:overflow-x-hidden lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div className="min-w-0 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paciente · metas
            </p>
            <Tabs defaultValue="adequacy">
              <TabsList className="mb-3 w-full">
                <TabsTrigger value="adequacy" className="flex-1">
                  Adecuación
                </TabsTrigger>
                <TabsTrigger value="requirements" className="flex-1">
                  Requerimientos
                </TabsTrigger>
              </TabsList>
              <TabsContent value="adequacy" className="mt-0 min-w-0">
                <AdequacyPanel embedded dense rows={plan.adequacyRows} />
              </TabsContent>
              <TabsContent value="requirements" className="mt-0 min-w-0">
                <RequirementsPanel
                  embedded
                  value={plan.requirements}
                  onChange={plan.setRequirements}
                />
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      </div>
    </div>
  );
}
