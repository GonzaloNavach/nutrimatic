"use client";

import {
  DEFAULT_VISIBLE_COLUMNS,
  MEAL_COLUMNS,
  MEAL_COLUMNS_LOCK_KEY,
  MEAL_COLUMNS_STORAGE_KEY,
  MEAL_COLUMNS_TIP_KEY,
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

function loadBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1" || raw === "true";
  } catch {
    return fallback;
  }
}

export function useMealColumns() {
  const [visibleIds, setVisibleIds] = useState<MealColumnId[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  /** true = candado cerrado: no se editan columnas. */
  const [columnsLocked, setColumnsLocked] = useState(true);
  const [tipSeen, setTipSeen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVisibleIds(loadStoredColumns());
    setColumnsLocked(loadBool(MEAL_COLUMNS_LOCK_KEY, true));
    setTipSeen(loadBool(MEAL_COLUMNS_TIP_KEY, false));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(MEAL_COLUMNS_STORAGE_KEY, JSON.stringify(visibleIds));
  }, [visibleIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(MEAL_COLUMNS_LOCK_KEY, columnsLocked ? "1" : "0");
  }, [columnsLocked, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(MEAL_COLUMNS_TIP_KEY, tipSeen ? "1" : "0");
  }, [tipSeen, hydrated]);

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

  const toggleColumnsLock = useCallback(() => {
    setColumnsLocked((prev) => {
      const next = !prev;
      if (!next) setTipSeen(true);
      return next;
    });
  }, []);

  return {
    visibleColumns,
    hiddenColumns,
    columnsLocked,
    tipSeen,
    columnsEditable: !columnsLocked,
    showColumn,
    hideColumn,
    resetColumns,
    toggleColumnsLock,
  };
}
