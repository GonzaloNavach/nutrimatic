"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MealColumnDef } from "@/lib/nutrition/mealColumns";
import { Columns3, RotateCcw } from "lucide-react";

interface ColumnPickerProps {
  hiddenColumns: MealColumnDef[];
  onShow: (id: MealColumnDef["id"]) => void;
  onReset: () => void;
}

export function ColumnPicker({
  hiddenColumns,
  onShow,
  onReset,
}: ColumnPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Columns3 className="size-4" />
          Columnas
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Agregar columnas</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={onReset}
          >
            <RotateCcw className="size-3.5" />
            Restablecer
          </Button>
        </div>
        {hiddenColumns.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Todas las columnas están visibles.
          </p>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {hiddenColumns.map((col) => (
              <button
                key={col.id}
                type="button"
                className="flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => onShow(col.id)}
              >
                {col.label}
                {col.unit ? (
                  <span className="ml-1 text-muted-foreground">({col.unit})</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
