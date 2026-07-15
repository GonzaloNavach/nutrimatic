import type { MealColumnId } from "./mealColumns";

/** Grupos compartidos: columnas, requerimientos y adecuación. */
export type NutrientGroupId = "macros" | "minerals" | "vitamins" | "otros";

export interface NutrientGroupDef {
  id: NutrientGroupId;
  label: string;
  /** Abierto por defecto (Energía y macros). */
  defaultOpen?: boolean;
}

export const NUTRIENT_GROUPS: NutrientGroupDef[] = [
  { id: "macros", label: "Energía y macros", defaultOpen: true },
  { id: "minerals", label: "Minerales" },
  { id: "vitamins", label: "Vitaminas" },
  { id: "otros", label: "Otros" },
];

/** Grupos visibles en requerimientos / adecuación (sin "Otros"). */
export const REQUIREMENT_NUTRIENT_GROUPS: NutrientGroupDef[] =
  NUTRIENT_GROUPS.filter((g) => g.id !== "otros");

export const DEFAULT_OPEN_NUTRIENT_GROUPS: NutrientGroupId[] = NUTRIENT_GROUPS.filter(
  (g) => g.defaultOpen
).map((g) => g.id);

export const COLUMN_NUTRIENT_GROUP: Record<MealColumnId, NutrientGroupId> = {
  food: "otros",
  code: "otros",
  grams: "otros",
  energy: "macros",
  water: "macros",
  proteinTotal: "macros",
  fatTotal: "macros",
  carbs: "macros",
  carbsAvailable: "macros",
  fiber: "macros",
  ash: "otros",
  calcium: "minerals",
  phosphorus: "minerals",
  zinc: "minerals",
  iron: "minerals",
  sodium: "minerals",
  potassium: "minerals",
  vitaminA: "vitamins",
  thiamin: "vitamins",
  riboflavin: "vitamins",
  niacin: "vitamins",
  vitaminC: "vitamins",
  folicAcid: "vitamins",
  cost: "otros",
};

/** Keys usados en paneles de req/adecuación (no todo Requirements). */
export type RequirementPanelKey =
  | "energy"
  | "proteinTotal"
  | "fatTotal"
  | "carbs"
  | "fiber"
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
  | "folicAcid";

export const REQUIREMENT_NUTRIENT_GROUP: Record<
  RequirementPanelKey,
  NutrientGroupId
> = {
  energy: "macros",
  proteinTotal: "macros",
  fatTotal: "macros",
  carbs: "macros",
  fiber: "macros",
  calcium: "minerals",
  phosphorus: "minerals",
  zinc: "minerals",
  iron: "minerals",
  sodium: "minerals",
  potassium: "minerals",
  vitaminA: "vitamins",
  thiamin: "vitamins",
  riboflavin: "vitamins",
  niacin: "vitamins",
  vitaminC: "vitamins",
  folicAcid: "vitamins",
};

export function nutrientGroupLabel(id: NutrientGroupId): string {
  return NUTRIENT_GROUPS.find((g) => g.id === id)?.label ?? id;
}

export function groupForRequirementKey(
  key: string
): NutrientGroupId | null {
  if (key in REQUIREMENT_NUTRIENT_GROUP) {
    return REQUIREMENT_NUTRIENT_GROUP[key as RequirementPanelKey];
  }
  return null;
}
