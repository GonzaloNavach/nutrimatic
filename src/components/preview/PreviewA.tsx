"use client";

import { CalculatorApp } from "@/components/nutrimatic/CalculatorApp";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import type { Food } from "@/lib/nutrition/types";

export function PreviewA({ foods }: { foods: Food[] }) {
  return (
    <div data-preview="a">
      <PreviewChrome
        option="a"
        blurb="A · Casi actual — mismo app, solo envuelto para comparar."
      />
      <CalculatorApp foods={foods} />
    </div>
  );
}
