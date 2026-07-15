"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="dash-metric-label">{title}</p>
            <p className="dash-metric mt-1">
              {typeof value === "number" ? formatNumber(value, 0) : value}
            </p>
            {subtitle ? (
              <p className="dash-hint mt-1 truncate">{subtitle}</p>
            ) : null}
          </div>
          {Icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
