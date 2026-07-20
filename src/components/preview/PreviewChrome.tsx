"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "a", href: "/preview/a", label: "A", title: "Casi actual" },
  { id: "b", href: "/preview/b", label: "B", title: "Evolutiva" },
  { id: "c", href: "/preview/c", label: "C", title: "Rediseño fuerte" },
  { id: "d", href: "/preview/d", label: "D", title: "Solo concepto" },
] as const;

export function PreviewChrome({
  option,
  blurb,
}: {
  option: "a" | "b" | "c" | "d" | "hub";
  blurb: string;
}) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#111]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
            Preview UI · no afecta /original
          </p>
          <p className="truncate text-sm text-white/85">{blurb}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/preview"
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              pathname === "/preview"
                ? "bg-white text-black"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            )}
          >
            Índice
          </Link>
          {OPTIONS.map((opt) => (
            <Link
              key={opt.id}
              href={opt.href}
              title={opt.title}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                option === opt.id || pathname === opt.href
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              {opt.label} · {opt.title}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-md bg-emerald-400/90 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-emerald-300"
          >
            Original /
          </Link>
        </nav>
      </div>
    </div>
  );
}
