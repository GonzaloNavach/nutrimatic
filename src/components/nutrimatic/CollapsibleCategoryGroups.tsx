"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface CollapsibleCategoryGroup {
  id: string;
  label: string;
  count: number;
  /** Badge extra a la derecha del count (ej. alertas). */
  trailing?: ReactNode;
  children: ReactNode;
}

interface CollapsibleCategoryGroupsProps {
  groups: CollapsibleCategoryGroup[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Shell de categorías plegables (mismo patrón visual que el selector de alimentos).
 */
export function CollapsibleCategoryGroups({
  groups,
  expanded,
  onToggle,
  emptyMessage = "Sin resultados",
  className,
}: CollapsibleCategoryGroupsProps) {
  if (groups.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("p-1", className)}>
      {groups.map((group) => {
        const isExpanded = expanded.has(group.id);
        return (
          <div key={group.id} className="mb-0.5">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium hover:bg-muted"
              onClick={() => onToggle(group.id)}
              aria-expanded={isExpanded}
            >
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
              <span className="min-w-0 flex-1 leading-snug">{group.label}</span>
              {group.trailing}
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                {group.count}
              </span>
            </button>
            {isExpanded ? (
              <div className="ml-2 border-l border-border pl-1">
                {group.children}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function toggleExpandedId<T extends string>(
  prev: Set<T>,
  id: T
): Set<T> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
