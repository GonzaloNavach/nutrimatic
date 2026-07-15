"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MealColumnDef } from "@/lib/nutrition/mealColumns";
import { Plus, RotateCcw } from "lucide-react";

interface ColumnAddMenuProps {
  hiddenColumns: MealColumnDef[];
  onShow: (id: MealColumnDef["id"]) => void;
  onReset: () => void;
}

/** “+” anclado a la tabla: agregar columnas ocultas o restablecer. */
export function ColumnAddMenu({
  hiddenColumns,
  onShow,
  onReset,
}: ColumnAddMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-md border border-dashed border-border/80 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground"
          aria-label="Agregar columnas"
          title="Agregar columnas"
        >
          <Plus className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
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
                  <span className="ml-1 text-muted-foreground">
                    ({col.unit})
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface HiddenColumnsBarProps {
  hiddenColumns: MealColumnDef[];
  onShow: (id: MealColumnDef["id"]) => void;
}

const CHIP_LIMIT = 8;

/** Chips de columnas ocultas (compacto si hay muchas). */
export function HiddenColumnsBar({
  hiddenColumns,
  onShow,
}: HiddenColumnsBarProps) {
  if (hiddenColumns.length === 0) return null;

  const showChips = hiddenColumns.length <= CHIP_LIMIT;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        {hiddenColumns.length} ocultas
      </span>
      {showChips ? (
        hiddenColumns.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onShow(col.id)}
            className="inline-flex items-center rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-foreground transition-colors hover:border-foreground/25 hover:bg-muted"
            title={`Mostrar ${col.label}`}
          >
            <Plus className="mr-1 size-3 text-muted-foreground" />
            {col.label}
            {col.unit ? (
              <span className="ml-1 text-muted-foreground">({col.unit})</span>
            ) : null}
          </button>
        ))
      ) : (
        <span className="text-xs text-muted-foreground">
          · usá <span className="font-medium text-foreground">+</span> en la
          tabla para agregar
        </span>
      )}
    </div>
  );
}
