import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="dash-page-title">{title}</h1>
        {description ? (
          <p className="dash-page-desc mt-0.5">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}
