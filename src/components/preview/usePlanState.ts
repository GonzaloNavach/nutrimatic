"use client";

import { useMealColumns } from "@/hooks/useMealColumns";
import {
  buildAdequacyRows,
  calculateDayTotals,
  calculateMealTotals,
  DEFAULT_REQUIREMENTS,
} from "@/lib/nutrition/calculate";
import { createDefaultMeals, createSamplePlan } from "@/lib/nutrition/meals";
import type { Food, MealBlock, Requirements } from "@/lib/nutrition/types";
import { useMemo, useState } from "react";

export function usePlanState(foods: Food[]) {
  const [meals, setMeals] = useState<MealBlock[]>(() => createSamplePlan(foods));
  const [requirements, setRequirements] = useState<Requirements>(
    DEFAULT_REQUIREMENTS
  );

  const columns = useMealColumns();

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

  const updateMeal = (nextMeal: MealBlock) => {
    setMeals((prev) =>
      prev.map((item) => (item.id === nextMeal.id ? nextMeal : item))
    );
  };

  const clearPlan = () => setMeals(createDefaultMeals());
  const loadExample = () => setMeals(createSamplePlan(foods));

  const coveredCount = adequacyRows.filter((r) => r.status === "ok").length;
  const lowCount = adequacyRows.filter((r) => r.status === "low").length;
  const highCount = adequacyRows.filter((r) => r.status === "high").length;
  const tracked = adequacyRows.filter((r) => r.percent !== null).length;
  const coveragePct =
    tracked > 0 ? Math.round((coveredCount / tracked) * 100) : 0;

  return {
    meals,
    setMeals,
    requirements,
    setRequirements,
    columns,
    foodMap,
    mealTotals,
    dayTotals,
    adequacyRows,
    updateMeal,
    clearPlan,
    loadExample,
    coveredCount,
    lowCount,
    highCount,
    coveragePct,
  };
}
