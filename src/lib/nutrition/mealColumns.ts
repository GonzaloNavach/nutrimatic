import type { Food, NutrientTotals } from "./types";

export type MealColumnId =
  | "food"
  | "code"
  | "grams"
  | "energy"
  | "water"
  | "proteinTotal"
  | "fatTotal"
  | "carbs"
  | "carbsAvailable"
  | "fiber"
  | "ash"
  | "calcium"
  | "phosphorus"
  | "zinc"
  | "iron"
  | "sodium"
  | "potassium"
  | "vitaminA"
  | "thiamin"
  | "riboflavin"
  | "niacin"
  | "vitaminC"
  | "folicAcid"
  | "cost";

export interface MealColumnDef {
  id: MealColumnId;
  label: string;
  unit: string;
  locked?: boolean;
  decimals?: number;
}

export const MEAL_COLUMNS: MealColumnDef[] = [
  { id: "food", label: "Alimento", unit: "", locked: true },
  { id: "code", label: "Código", unit: "" },
  { id: "grams", label: "Gramos", unit: "g", locked: true },
  { id: "energy", label: "Energía", unit: "kcal", decimals: 0 },
  { id: "water", label: "Agua", unit: "g", decimals: 1 },
  { id: "proteinTotal", label: "Proteínas", unit: "g", decimals: 1 },
  { id: "fatTotal", label: "Grasa total", unit: "g", decimals: 1 },
  { id: "carbs", label: "Carbohidratos", unit: "g", decimals: 1 },
  { id: "carbsAvailable", label: "Carb. disponibles", unit: "g", decimals: 1 },
  { id: "fiber", label: "Fibra", unit: "g", decimals: 1 },
  { id: "ash", label: "Cenizas", unit: "g", decimals: 1 },
  { id: "calcium", label: "Calcio", unit: "mg", decimals: 1 },
  { id: "phosphorus", label: "Fósforo", unit: "mg", decimals: 1 },
  { id: "zinc", label: "Zinc", unit: "mg", decimals: 2 },
  { id: "iron", label: "Hierro", unit: "mg", decimals: 2 },
  { id: "sodium", label: "Sodio", unit: "mg", decimals: 1 },
  { id: "potassium", label: "Potasio", unit: "mg", decimals: 1 },
  { id: "vitaminA", label: "Vit. A", unit: "µg", decimals: 1 },
  { id: "thiamin", label: "Tiamina", unit: "mg", decimals: 2 },
  { id: "riboflavin", label: "Riboflavina", unit: "mg", decimals: 2 },
  { id: "niacin", label: "Niacina", unit: "mg", decimals: 2 },
  { id: "vitaminC", label: "Vit. C", unit: "mg", decimals: 1 },
  { id: "folicAcid", label: "Ác. fólico", unit: "µg", decimals: 1 },
  { id: "cost", label: "Costo", unit: "S/", decimals: 2 },
];

export const DEFAULT_VISIBLE_COLUMNS: MealColumnId[] = [
  "food",
  "grams",
  "energy",
];

export const MEAL_COLUMNS_STORAGE_KEY = "nutrimatic-meal-columns";
export const MEAL_COLUMNS_LOCK_KEY = "nutrimatic-meal-columns-locked";
export const MEAL_COLUMNS_TIP_KEY = "nutrimatic-meal-columns-tip-seen";

export function getColumnValue(
  columnId: MealColumnId,
  totals: NutrientTotals,
  food: Food | null
): string | number {
  if (columnId === "food") return food?.name ?? "—";
  if (columnId === "code") return food?.code ?? "—";
  if (columnId === "grams") return totals.grams;
  return totals[columnId as keyof NutrientTotals] ?? 0;
}
