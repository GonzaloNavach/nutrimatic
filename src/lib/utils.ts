import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
