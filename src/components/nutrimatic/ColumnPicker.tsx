"use client";

import {
  CollapsibleCategoryGroups,
  toggleExpandedId,
} from "@/components/nutrimatic/CollapsibleCategoryGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MealColumnDef } from "@/lib/nutrition/mealColumns";
import {
  COLUMN_NUTRIENT_GROUP,
  DEFAULT_OPEN_NUTRIENT_GROUPS,
  NUTRIENT_GROUPS,
} from "@/lib/nutrition/nutrientGroups";
import { cn } from "@/lib/utils";
import { Lock, LockOpen, Plus, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ColumnAddMenuProps {
  hiddenColumns: MealColumnDef[];
  onShow: (id: MealColumnDef["id"]) => void;
}

/** “+” anclado a la tabla: agregar columnas ocultas por categoría. */
export function ColumnAddMenu({ hiddenColumns, onShow }: ColumnAddMenuProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(
    () => new Set<string>(DEFAULT_OPEN_NUTRIENT_GROUPS)
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hiddenColumns.filter((col) => {
      if (!q) return true;
      return (
        col.label.toLowerCase().includes(q) ||
        col.id.toLowerCase().includes(q) ||
        col.unit.toLowerCase().includes(q)
      );
    });
  }, [hiddenColumns, query]);

  const groups = useMemo(() => {
    return NUTRIENT_GROUPS.map((group) => {
      const items = filtered.filter(
        (col) => COLUMN_NUTRIENT_GROUP[col.id] === group.id
      );
      return {
        id: group.id,
        label: group.label,
        count: items.length,
        children: items.map((col) => (
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
        )),
      };
    }).filter((g) => g.count > 0);
  }, [filtered, onShow]);

  const total = filtered.length;

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setQuery("");
        else setExpanded(new Set<string>(DEFAULT_OPEN_NUTRIENT_GROUPS));
      }}
    >
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
      <PopoverContent align="end" className="w-[min(100vw-2rem,360px)] p-0">
        <div className="border-b p-2">
          <p className="mb-2 px-1 text-sm font-medium">Agregar columnas</p>
          {hiddenColumns.length === 0 ? (
            <p className="px-1 pb-1 text-xs text-muted-foreground">
              Todas las columnas están visibles.
            </p>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  placeholder="Filtrar nutrientes…"
                  className="pl-8"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {query ? (
                <p className="mt-1.5 px-1 text-xs text-muted-foreground">
                  {total} columna{total !== 1 ? "s" : ""} en {groups.length}{" "}
                  categoría{groups.length !== 1 ? "s" : ""}
                </p>
              ) : null}
            </>
          )}
        </div>
        {hiddenColumns.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            <CollapsibleCategoryGroups
              groups={groups}
              expanded={expanded}
              onToggle={(id) =>
                setExpanded((prev) => toggleExpandedId(prev, id))
              }
              emptyMessage="Sin columnas que coincidan"
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

interface ColumnLayoutToolbarProps {
  columnsLocked: boolean;
  tipSeen: boolean;
  onToggleLock: () => void;
  onResetColumns: () => void;
}

/** Candado global + reset a columnas base + tip de primera vez. */
export function ColumnLayoutToolbar({
  columnsLocked,
  tipSeen,
  onToggleLock,
  onResetColumns,
}: ColumnLayoutToolbarProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={columnsLocked ? "outline" : "secondary"}
          size="sm"
          onClick={onToggleLock}
          aria-pressed={!columnsLocked}
          aria-label={
            columnsLocked
              ? "Activar editar columnas"
              : "Desactivar editar columnas"
          }
          title={
            columnsLocked
              ? "Activar editar columnas"
              : "Bloquear (modo lectura)"
          }
        >
          {columnsLocked ? (
            <Lock className="size-4" />
          ) : (
            <LockOpen className="size-4" />
          )}
          Editar columnas
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetColumns}
          title="Volver a Alimento, Código, Gramos y Energía"
        >
          <RotateCcw className="size-4" />
          Resetear columnas
        </Button>
      </div>
      {columnsLocked && !tipSeen ? (
        <p
          className={cn(
            "rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
          )}
        >
          Tocá el candado para agregar o quitar columnas de nutrientes.
        </p>
      ) : null}
    </div>
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
