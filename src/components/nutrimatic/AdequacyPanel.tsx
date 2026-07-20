"use client";

import {
  CollapsibleCategoryGroups,
  toggleExpandedId,
} from "@/components/nutrimatic/CollapsibleCategoryGroups";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_OPEN_NUTRIENT_GROUPS,
  groupForRequirementKey,
  REQUIREMENT_NUTRIENT_GROUPS,
  type NutrientGroupId,
} from "@/lib/nutrition/nutrientGroups";
import type { AdequacyRow } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

interface AdequacyPanelProps {
  rows: AdequacyRow[];
  embedded?: boolean;
  /** Compact stacked rows — no horizontal scroll (for narrow sidebars). */
  dense?: boolean;
}

const statusStyles = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
  low: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800",
  high: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/50 dark:border-rose-800",
  na: "text-muted-foreground bg-muted border-border",
} as const;

function statusLabel(status: AdequacyRow["status"]) {
  if (status === "ok") return "OK";
  if (status === "low") return "Bajo";
  if (status === "high") return "Alto";
  return "N/A";
}

function AdequacyRowsTable({ rows }: { rows: AdequacyRow[] }) {
  return (
    <div className="overflow-x-auto py-1">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="dash-col-header py-2 pr-3">Nutriente</th>
            <th className="dash-col-header py-2 pr-3 text-right">
              Recomendado
            </th>
            <th className="dash-col-header py-2 pr-3 text-right">Aportado</th>
            <th className="dash-col-header py-2 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-border/60">
              <td className="py-2.5 pr-3 font-medium">{row.label}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                {row.recommended > 0
                  ? `${formatNumber(row.recommended, 1)} ${row.unit}`
                  : "—"}
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums">
                {formatNumber(row.provided, 1)} {row.unit}
              </td>
              <td className="py-2.5 text-right">
                {row.percent !== null ? (
                  <Badge
                    variant="outline"
                    className={cn("tabular-nums", statusStyles[row.status])}
                  >
                    {formatNumber(row.percent, 1)}% · {statusLabel(row.status)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdequacyRowsDense({ rows }: { rows: AdequacyRow[] }) {
  return (
    <ul className="space-y-2 py-1">
      {rows.map((row) => (
        <li
          key={row.key}
          className="rounded-lg border border-border/70 bg-card/40 px-3 py-2"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{row.label}</p>
            {row.percent !== null ? (
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 tabular-nums text-[11px]",
                  statusStyles[row.status]
                )}
              >
                {formatNumber(row.percent, 0)}% · {statusLabel(row.status)}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {formatNumber(row.provided, 1)}
            {row.recommended > 0
              ? ` / ${formatNumber(row.recommended, 1)}`
              : ""}{" "}
            {row.unit}
          </p>
        </li>
      ))}
    </ul>
  );
}

function AdequacyGrouped({
  rows,
  dense = false,
}: {
  rows: AdequacyRow[];
  dense?: boolean;
}) {
  const alertGroupIds = useMemo(() => {
    const ids = new Set<NutrientGroupId>();
    for (const row of rows) {
      if (row.status === "low" || row.status === "high") {
        const groupId = groupForRequirementKey(row.key);
        if (groupId) ids.add(groupId);
      }
    }
    return ids;
  }, [rows]);

  const [expanded, setExpanded] = useState(() => {
    const initial = new Set<string>(DEFAULT_OPEN_NUTRIENT_GROUPS);
    for (const id of alertGroupIds) initial.add(id);
    return initial;
  });

  useEffect(() => {
    if (alertGroupIds.size === 0) return;
    setExpanded((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of alertGroupIds) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [alertGroupIds]);

  const groups = useMemo(() => {
    return REQUIREMENT_NUTRIENT_GROUPS.map((group) => {
      const items = rows.filter(
        (row) => groupForRequirementKey(row.key) === group.id
      );
      const alertCount = items.filter(
        (row) => row.status === "low" || row.status === "high"
      ).length;
      return {
        id: group.id,
        label: group.label,
        count: items.length,
        trailing:
          alertCount > 0 ? (
            <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs tabular-nums text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              {alertCount} alerta{alertCount !== 1 ? "s" : ""}
            </span>
          ) : undefined,
        children: dense ? (
          <AdequacyRowsDense rows={items} />
        ) : (
          <AdequacyRowsTable rows={items} />
        ),
      };
    }).filter((g) => g.count > 0);
  }, [rows, dense]);

  return (
    <CollapsibleCategoryGroups
      groups={groups}
      expanded={expanded}
      onToggle={(id) => setExpanded((prev) => toggleExpandedId(prev, id))}
      className="p-0"
    />
  );
}

export function AdequacyPanel({
  rows,
  embedded = false,
  dense = false,
}: AdequacyPanelProps) {
  if (embedded) {
    return (
      <div className="min-w-0">
        <h3 className="mb-3 text-base font-semibold">
          Porcentaje de adecuación
        </h3>
        <AdequacyGrouped rows={rows} dense={dense} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Porcentaje de adecuación</CardTitle>
      </CardHeader>
      <CardContent>
        <AdequacyGrouped rows={rows} dense={dense} />
      </CardContent>
    </Card>
  );
}
