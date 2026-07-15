"use client";

import { Input } from "@/components/ui/input";
import type { Food } from "@/lib/nutrition/types";
import {
  AUTO_EXPAND_MAX_PRODUCTS,
  FOOD_CATEGORIES,
  foodMatchesQuery,
} from "@/lib/nutrition/foodCategories";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface FoodCategoryPickerProps {
  foods: Food[];
  value: Food | null;
  onSelect: (food: Food) => void;
}

export function FoodCategoryPicker({
  foods,
  value,
  onSelect,
}: FoodCategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const foodsByCategory = useMemo(() => {
    const map = new Map<string, Food[]>();
    for (const cat of FOOD_CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const food of foods) {
      const catId = food.categoryId || "miscelaneos";
      const list = map.get(catId);
      if (list) list.push(food);
      else {
        const fallback = map.get("otros")!;
        fallback.push(food);
      }
    }
    return map;
  }, [foods]);

  const filteredGroups = useMemo(() => {
    return FOOD_CATEGORIES.map((cat) => ({
      category: cat,
      foods: (foodsByCategory.get(cat.id) ?? []).filter((f) =>
        foodMatchesQuery(f, query)
      ),
    })).filter((g) => g.foods.length > 0);
  }, [foodsByCategory, query]);

  const totalFiltered = filteredGroups.reduce(
    (sum, g) => sum + g.foods.length,
    0
  );

  useEffect(() => {
    if (!open) return;
    if (totalFiltered > 0 && totalFiltered <= AUTO_EXPAND_MAX_PRODUCTS) {
      setExpanded(
        new Set(filteredGroups.map((g) => g.category.id))
      );
    }
  }, [query, open, totalFiltered]); // eslint-disable-line react-hooks/exhaustive-deps -- expand on filter size only

  const toggleCategory = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayLabel = value ? value.name : "Seleccionar alimento…";

  return (
    <div className="relative min-w-[180px]">
      <button
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs",
          "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30"
            aria-label="Cerrar selector"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-40 mt-1 flex w-[min(100vw-2rem,420px)] flex-col rounded-md border bg-popover shadow-lg">
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  placeholder="Filtrar por nombre o código…"
                  className="pl-8"
                  autoFocus
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {query ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {totalFiltered} producto{totalFiltered !== 1 ? "s" : ""}{" "}
                  en {filteredGroups.length} categoría
                  {filteredGroups.length !== 1 ? "s" : ""}
                </p>
              ) : null}
            </div>

            <div className="max-h-72 overflow-y-auto p-1">
              {filteredGroups.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Sin resultados
                </p>
              ) : (
                filteredGroups.map(({ category, foods: catFoods }) => {
                  const isExpanded = expanded.has(category.id);
                  return (
                    <div key={category.id} className="mb-0.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium hover:bg-muted"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                        <span className="min-w-0 flex-1 leading-snug">
                          {category.label}
                        </span>
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                          {catFoods.length}
                        </span>
                      </button>
                      {isExpanded ? (
                        <div className="ml-2 border-l border-border pl-1">
                          {catFoods.map((food) => (
                            <button
                              key={food.id}
                              type="button"
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                                value?.id === food.id && "bg-primary/10"
                              )}
                              onClick={() => {
                                onSelect(food);
                                setOpen(false);
                                setQuery("");
                              }}
                            >
                              <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                                {food.code}
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {food.name}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {food.energy}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
