"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdequacyRow } from "@/lib/nutrition/types";
import { cn, formatNumber } from "@/lib/utils";

interface AdequacyPanelProps {
  rows: AdequacyRow[];
  embedded?: boolean;
}

const statusStyles = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-200",
  low: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-rose-700 bg-rose-50 border-rose-200",
  na: "text-muted-foreground bg-muted border-border",
} as const;

function statusLabel(status: AdequacyRow["status"]) {
  if (status === "ok") return "OK";
  if (status === "low") return "Bajo";
  if (status === "high") return "Alto";
  return "N/A";
}

function AdequacyTable({ rows }: { rows: AdequacyRow[] }) {
  return (
    <div className="overflow-x-auto">
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

export function AdequacyPanel({ rows, embedded = false }: AdequacyPanelProps) {
  if (embedded) {
    return (
      <div>
        <h3 className="mb-3 text-base font-semibold">Porcentaje de adecuación</h3>
        <AdequacyTable rows={rows} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Porcentaje de adecuación</CardTitle>
      </CardHeader>
      <CardContent>
        <AdequacyTable rows={rows} />
      </CardContent>
    </Card>
  );
}
