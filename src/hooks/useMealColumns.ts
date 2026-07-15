"use client";

import {
  DEFAULT_VISIBLE_COLUMNS,
  MEAL_COLUMNS,
  MEAL_COLUMNS_STORAGE_KEY,
  type MealColumnId,
} from "@/lib/nutrition/mealColumns";
import { useCallback, useEffect, useState } from "react";

function loadStoredColumns(): MealColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_COLUMNS;
  try {
    const raw = localStorage.getItem(MEAL_COLUMNS_STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBLE_COLUMNS;
    const parsed = JSON.parse(raw) as MealColumnId[];
    const valid = new Set(MEAL_COLUMNS.map((c) => c.id));
    const filtered = parsed.filter((id) => valid.has(id));
    if (!filtered.includes("food")) filtered.unshift("food");
    if (!filtered.includes("grams")) filtered.splice(1, 0, "grams");
    return filtered.length > 0 ? filtered : DEFAULT_VISIBLE_COLUMNS;
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
}

export function useMealColumns() {
  const [visibleIds, setVisibleIds] = useState<MealColumnId[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVisibleIds(loadStoredColumns());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(MEAL_COLUMNS_STORAGE_KEY, JSON.stringify(visibleIds));
  }, [visibleIds, hydrated]);

  const visibleColumns = MEAL_COLUMNS.filter((c) => visibleIds.includes(c.id));

  const hiddenColumns = MEAL_COLUMNS.filter(
    (c) => !visibleIds.includes(c.id) && !c.locked
  );

  const showColumn = useCallback((id: MealColumnId) => {
    setVisibleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const hideColumn = useCallback((id: MealColumnId) => {
    const def = MEAL_COLUMNS.find((c) => c.id === id);
    if (def?.locked) return;
    setVisibleIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const resetColumns = useCallback(() => {
    setVisibleIds([...DEFAULT_VISIBLE_COLUMNS]);
  }, []);

  return {
    visibleColumns,
    hiddenColumns,
    showColumn,
    hideColumn,
    resetColumns,
  };
}
