"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ColumnAddMenu } from "@/components/nutrimatic/ColumnPicker";
import { FoodCategoryPicker } from "@/components/nutrimatic/FoodCategoryPicker";
import {
  calculateItemTotals,
  calculateMealTotals,
  fiberDisplay,
  gramsFromNutrientTarget,
  isInvertibleColumn,
  nutrientPer100,
} from "@/lib/nutrition/calculate";
import { createItem } from "@/lib/nutrition/meals";
import {
  getColumnValue,
  type MealColumnDef,
  type MealColumnId,
} from "@/lib/nutrition/mealColumns";
import type { Food, MealBlock, MealItem } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";

interface MealBlockCardProps {
  meal: MealBlock;
  foodMap: Map<number, Food>;
  foods: Food[];
  visibleColumns: MealColumnDef[];
  hiddenColumns: MealColumnDef[];
  columnsEditable: boolean;
  onHideColumn: (id: MealColumnDef["id"]) => void;
  onShowColumn: (id: MealColumnDef["id"]) => void;
  onChange: (meal: MealBlock) => void;
}

function formatReadOnlyCell(
  column: MealColumnDef,
  totals: ReturnType<typeof calculateItemTotals>,
  food: Food | undefined,
  grams: number
): string {
  if (column.id === "food") return food?.name ?? "—";
  if (column.id === "code") return food?.code ?? "—";
  if (column.id === "grams") return grams > 0 ? formatNumber(grams, 0) : "—";
  const raw = getColumnValue(column.id, totals, food ?? null);
  if (typeof raw === "number") {
    return formatNumber(raw, column.decimals ?? 1);
  }
  return String(raw);
}

function NutrientCellInput({
  columnId,
  decimals,
  displayValue,
  disabled,
  title,
  onCommit,
}: {
  columnId: MealColumnId;
  decimals: number;
  displayValue: number;
  disabled: boolean;
  title?: string;
  onCommit: (raw: string) => void;
}) {
  return (
    <Input
      type="number"
      min={0}
      step={decimals > 0 ? String(10 ** -decimals) : 1}
      placeholder="0"
      disabled={disabled}
      title={title}
      className="ml-auto w-[4.75rem] text-right disabled:opacity-50"
      value={displayValue > 0 ? Number(displayValue.toFixed(decimals)) : ""}
      onChange={(e) => onCommit(e.target.value)}
      aria-label={columnId}
    />
  );
}

export function MealBlockCard({
  meal,
  foodMap,
  foods,
  visibleColumns,
  hiddenColumns,
  columnsEditable,
  onHideColumn,
  onShowColumn,
  onChange,
}: MealBlockCardProps) {
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
    const nextItems = meal.items.filter((item) => item.id !== itemId);
    onChange({
      ...meal,
      items: nextItems.length > 0 ? nextItems : [createItem()],
    });
  };

  const addItem = () => {
    onChange({ ...meal, items: [...meal.items, createItem()] });
  };

  const setGramsFromNutrient = (
    itemId: string,
    food: Food,
    columnId: MealColumnId,
    raw: string,
    currentGrams: number
  ) => {
    const target = Number.parseFloat(raw);
    if (!Number.isFinite(target)) {
      updateItem(itemId, { grams: 0 });
      return;
    }
    const grams = gramsFromNutrientTarget(
      food,
      columnId,
      target,
      currentGrams
    );
    if (grams == null) return;
    updateItem(itemId, { grams });
  };

  const dataColumns = visibleColumns.filter((c) => c.id !== "food");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{meal.label}</CardTitle>
          <Badge variant="outline">
            {formatNumber(totals.energy, 0)} kcal
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="table-scroll-container -mx-1 px-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="dash-col-header min-w-[200px] py-2 pr-2 text-left">
                  <span className="inline-flex items-center gap-1">
                    Alimento
                  </span>
                </th>
                {dataColumns.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      "dash-col-header py-2 px-2 text-right whitespace-nowrap",
                      col.id === "grams" && "text-right"
                    )}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      {col.label}
                      {col.unit ? (
                        <span className="font-normal normal-case text-muted-foreground/80">
                          ({col.unit})
                        </span>
                      ) : null}
                      {!col.locked && columnsEditable ? (
                        <button
                          type="button"
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Ocultar ${col.label}`}
                          title={`Ocultar ${col.label}`}
                          onClick={() => onHideColumn(col.id)}
                        >
                          <X className="size-3.5" />
                        </button>
                      ) : null}
                    </span>
                  </th>
                ))}
                {columnsEditable ? (
                  <th className="dash-col-header sticky right-10 z-10 w-10 bg-card py-2 px-1 text-center">
                    <ColumnAddMenu
                      hiddenColumns={hiddenColumns}
                      onShow={onShowColumn}
                    />
                  </th>
                ) : null}
                <th
                  className={cn(
                    "dash-col-header sticky right-0 z-10 w-10 bg-card py-2",
                    !columnsEditable && "right-0"
                  )}
                />
              </tr>
            </thead>
            <tbody>
              {meal.items.map((item) => {
                const food = item.foodId
                  ? foodMap.get(item.foodId)
                  : undefined;
                const rowTotals = calculateItemTotals(food, item.grams);
                return (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="py-2 pr-2 align-top">
                      <FoodCategoryPicker
                        foods={foods}
                        value={food ?? null}
                        onSelect={(selected) =>
                          updateItem(item.id, { foodId: selected.id })
                        }
                      />
                    </td>
                    {dataColumns.map((col) => {
                      if (col.id === "grams") {
                        return (
                          <td
                            key={col.id}
                            className="py-2 px-2 align-top text-right tabular-nums"
                          >
                            <Input
                              type="number"
                              min={0}
                              step={0.1}
                              placeholder="0"
                              className="ml-auto w-20 text-right"
                              value={item.grams || ""}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  grams:
                                    Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </td>
                        );
                      }

                      if (col.id === "code") {
                        return (
                          <td
                            key={col.id}
                            className="py-2 px-2 align-top text-right tabular-nums text-muted-foreground"
                          >
                            {food?.code ?? "—"}
                          </td>
                        );
                      }

                      if (isInvertibleColumn(col.id) && food) {
                        const per100 = nutrientPer100(food, col.id) ?? 0;
                        const canEdit = per100 > 0;
                        const raw = getColumnValue(
                          col.id,
                          rowTotals,
                          food
                        );
                        const display =
                          typeof raw === "number" ? raw : 0;
                        const decimals = col.decimals ?? 1;

                        return (
                          <td
                            key={col.id}
                            className="py-2 px-2 align-top text-right tabular-nums"
                          >
                            <NutrientCellInput
                              columnId={col.id}
                              decimals={decimals}
                              displayValue={display}
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? `Editar ${col.label}: ajusta los gramos`
                                  : "Sin dato en TPCA para invertir"
                              }
                              onCommit={(value) =>
                                setGramsFromNutrient(
                                  item.id,
                                  food,
                                  col.id,
                                  value,
                                  item.grams
                                )
                              }
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.id}
                          className="py-2 px-2 align-top text-right tabular-nums text-muted-foreground"
                        >
                          {formatReadOnlyCell(
                            col,
                            rowTotals,
                            food,
                            item.grams
                          )}
                        </td>
                      );
                    })}
                    {columnsEditable ? (
                      <td className="sticky right-10 z-10 bg-card py-2" />
                    ) : null}
                    <td className="sticky right-0 z-10 bg-card py-2 align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                        aria-label="Quitar alimento"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="size-4" />
            Agregar alimento
          </Button>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tabular-nums">
            <span>{formatNumber(totals.grams, 0)} g</span>
            <span>Prot {formatNumber(totals.proteinTotal, 1)} g</span>
            <span>Carb {formatNumber(totals.carbs, 1)} g</span>
            <span>Fibra {fiberDisplay(totals.fiber)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
