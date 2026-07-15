import type { Food, MealBlock, MealItem } from "./types";

export const MEAL_LABELS = [
  "Desayuno",
  "Adicional 10 a.m.",
  "Almuerzo",
  "Adicional 4 p.m.",
  "Cena",
  "Adicional 8 p.m.",
] as const;

export function createItem(): MealItem {
  return {
    id: crypto.randomUUID(),
    foodId: null,
    grams: 0,
  };
}

export function createMealBlock(label: string): MealBlock {
  return {
    id: crypto.randomUUID(),
    label,
    items: [createItem()],
  };
}

export function createDefaultMeals(): MealBlock[] {
  return MEAL_LABELS.map((label) => createMealBlock(label));
}

function resolveFoodId(
  foods: Food[],
  code: string,
  fallbackName?: string
): number | null {
  const byCode = foods.find((f) => f.code === code);
  if (byCode) return byCode.id;
  if (fallbackName) {
    const byName = foods.find((f) =>
      f.name.toLowerCase().includes(fallbackName.toLowerCase())
    );
    if (byName) return byName.id;
  }
  return null;
}

/** Plan de ejemplo inspirado en Composic, usando códigos TPCA 2023 */
export function createSamplePlan(foods: Food[]): MealBlock[] {
  const entry = (code: string, grams: number, fallbackName?: string) => {
    const foodId = resolveFoodId(foods, code, fallbackName);
    return foodId ? { foodId, grams } : null;
  };

  const sample: Array<{
    label: string;
    entries: Array<{ foodId: number; grams: number }>;
  }> = [
    {
      label: "Desayuno",
      entries: [
        entry("A7", 30, "avena hojuela cruda"),
        entry("K4", 5, "miel de abeja"),
        entry("C42", 120, "manzana nacional"),
        entry("C72", 120, "plátano guineo"),
        entry("G17", 100, "yogurt"),
      ].filter(Boolean) as Array<{ foodId: number; grams: number }>,
    },
    { label: "Adicional 10 a.m.", entries: [] },
    {
      label: "Almuerzo",
      entries: [
        entry("T52", 60, "lentejas chicas"),
        entry("F26", 150, "pollo"),
        entry("U34", 80, "yuca amarilla"),
        entry("D3", 10, "aceite vegetal"),
        entry("B85", 80, "zanahoria"),
        entry("B79", 60, "tomate"),
        entry("B26", 30, "cebolla"),
        entry("A3", 100, "arroz blanco"),
      ].filter(Boolean) as Array<{ foodId: number; grams: number }>,
    },
    {
      label: "Adicional 4 p.m.",
      entries: [
        entry("G14", 150, "queso fresco"),
        entry("C72", 30, "plátano"),
      ].filter(Boolean) as Array<{ foodId: number; grams: number }>,
    },
    {
      label: "Cena",
      entries: [
        entry("F26", 100, "pollo"),
        entry("T47", 40, "habas"),
        entry("D3", 10, "aceite"),
        entry("B79", 100, "tomate"),
        entry("B85", 80, "zanahoria"),
        entry("B26", 40, "cebolla"),
        entry("U34", 30, "yuca"),
      ].filter(Boolean) as Array<{ foodId: number; grams: number }>,
    },
    { label: "Adicional 8 p.m.", entries: [] },
  ];

  return sample.map(({ label, entries }) => ({
    id: crypto.randomUUID(),
    label,
    items:
      entries.length > 0
        ? entries.map(({ foodId, grams }) => ({
            id: crypto.randomUUID(),
            foodId,
            grams,
          }))
        : [createItem()],
  }));
}
