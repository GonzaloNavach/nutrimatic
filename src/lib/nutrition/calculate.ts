import type {
  AdequacyRow,
  AdequacyStatus,
  Food,
  MealBlock,
  MealItem,
  NutrientTotals,
  Requirements,
} from "./types";
import type { MealColumnId } from "./mealColumns";

export const EMPTY_TOTALS: NutrientTotals = {
  grams: 0,
  energy: 0,
  water: 0,
  proteinTotal: 0,
  proteinAnimal: 0,
  proteinVegetal: 0,
  fatTotal: 0,
  fatAnimal: 0,
  fatVegetal: 0,
  carbs: 0,
  carbsAvailable: 0,
  fiber: 0,
  ash: 0,
  calcium: 0,
  phosphorus: 0,
  zinc: 0,
  iron: 0,
  sodium: 0,
  potassium: 0,
  vitaminA: 0,
  retinol: 0,
  thiamin: 0,
  riboflavin: 0,
  niacin: 0,
  vitaminC: 0,
  folicAcid: 0,
  cost: 0,
};

import { EMPTY_REQUIREMENTS } from "./patientRequirements";

/** Sin metas hasta calcular desde el perfil del paciente (o editar a mano). */
export const DEFAULT_REQUIREMENTS: Requirements = { ...EMPTY_REQUIREMENTS };

function scale(per100: number, grams: number): number {
  return (grams * per100) / 100;
}

function foodProteinPer100(food: Food): number {
  if (food.protein != null && food.protein > 0) return food.protein;
  return food.proteinAnimal + food.proteinVegetal;
}

function foodFatPer100(food: Food): number {
  if (food.fat != null && food.fat > 0) return food.fat;
  return food.fatAnimal + food.fatVegetal;
}

/** Densidad por 100 g del alimento para una columna (null = no invertible). */
export function nutrientPer100(
  food: Food,
  columnId: MealColumnId
): number | null {
  switch (columnId) {
    case "energy":
      return food.energy;
    case "water":
      return food.water;
    case "proteinTotal":
      return foodProteinPer100(food);
    case "fatTotal":
      return foodFatPer100(food);
    case "carbs":
      return food.carbs;
    case "carbsAvailable":
      return food.carbsAvailable ?? 0;
    case "fiber":
      return food.fiber;
    case "ash":
      return food.ash ?? 0;
    case "calcium":
      return food.calcium;
    case "phosphorus":
      return food.phosphorus;
    case "zinc":
      return food.zinc ?? 0;
    case "iron":
      return food.iron;
    case "sodium":
      return food.sodium;
    case "potassium":
      return food.potassium;
    case "vitaminA":
      return food.vitaminA ?? food.retinol;
    case "thiamin":
      return food.thiamin;
    case "riboflavin":
      return food.riboflavin;
    case "niacin":
      return food.niacin;
    case "vitaminC":
      return food.vitaminC;
    case "folicAcid":
      return food.folicAcid ?? 0;
    case "cost":
      return food.cost;
    case "food":
    case "code":
    case "grams":
      return null;
    default:
      return null;
  }
}

/**
 * Resuelve gramos para alcanzar un objetivo de nutriente/costo.
 * Usa 0.1 g de precisión para que las flechas del input puedan avanzar.
 * Retorna null si el alimento no tiene densidad > 0 en ese campo.
 */
export function gramsFromNutrientTarget(
  food: Food,
  columnId: MealColumnId,
  target: number,
  currentGrams = 0
): number | null {
  const per100 = nutrientPer100(food, columnId);
  if (per100 == null || per100 <= 0) return null;
  if (!Number.isFinite(target) || target <= 0) return 0;

  const roundTenths = (g: number) => Math.max(0, Math.round(g * 10) / 10);
  let grams = roundTenths((target * 100) / per100);

  // Si el redondeo deja la misma porción, la flecha no se notaría: empujar ±0.1 g.
  const currentValue = scale(per100, currentGrams);
  if (grams === roundTenths(currentGrams)) {
    if (target > currentValue + 1e-9) grams = roundTenths(currentGrams + 0.1);
    else if (target < currentValue - 1e-9)
      grams = roundTenths(currentGrams - 0.1);
  }

  return grams;
}

export function isInvertibleColumn(columnId: MealColumnId): boolean {
  return (
    columnId !== "food" &&
    columnId !== "code" &&
    columnId !== "grams"
  );
}

export function calculateItemTotals(
  food: Food | undefined,
  grams: number
): NutrientTotals {
  if (!food || grams <= 0) return { ...EMPTY_TOTALS };

  const proteinPer100 = foodProteinPer100(food);
  const fatPer100 = foodFatPer100(food);
  const proteinAnimal = scale(food.proteinAnimal, grams);
  const proteinVegetal = scale(food.proteinVegetal, grams);
  const fatAnimal = scale(food.fatAnimal, grams);
  const fatVegetal = scale(food.fatVegetal, grams);

  return {
    grams,
    energy: scale(food.energy, grams),
    water: scale(food.water, grams),
    proteinAnimal,
    proteinVegetal,
    proteinTotal:
      proteinAnimal + proteinVegetal > 0
        ? proteinAnimal + proteinVegetal
        : scale(proteinPer100, grams),
    fatAnimal,
    fatVegetal,
    fatTotal:
      fatAnimal + fatVegetal > 0
        ? fatAnimal + fatVegetal
        : scale(fatPer100, grams),
    carbs: scale(food.carbs, grams),
    carbsAvailable: scale(food.carbsAvailable ?? 0, grams),
    fiber: scale(food.fiber, grams),
    ash: scale(food.ash ?? 0, grams),
    calcium: scale(food.calcium, grams),
    phosphorus: scale(food.phosphorus, grams),
    zinc: scale(food.zinc ?? 0, grams),
    iron: scale(food.iron, grams),
    sodium: scale(food.sodium, grams),
    potassium: scale(food.potassium, grams),
    vitaminA: scale(food.vitaminA ?? food.retinol, grams),
    retinol: scale(food.retinol, grams),
    thiamin: scale(food.thiamin, grams),
    riboflavin: scale(food.riboflavin, grams),
    niacin: scale(food.niacin, grams),
    vitaminC: scale(food.vitaminC, grams),
    folicAcid: scale(food.folicAcid ?? 0, grams),
    cost: scale(food.cost, grams),
  };
}

export function sumTotals(items: NutrientTotals[]): NutrientTotals {
  return items.reduce(
    (acc, item) => ({
      grams: acc.grams + item.grams,
      energy: acc.energy + item.energy,
      water: acc.water + item.water,
      proteinTotal: acc.proteinTotal + item.proteinTotal,
      proteinAnimal: acc.proteinAnimal + item.proteinAnimal,
      proteinVegetal: acc.proteinVegetal + item.proteinVegetal,
      fatTotal: acc.fatTotal + item.fatTotal,
      fatAnimal: acc.fatAnimal + item.fatAnimal,
      fatVegetal: acc.fatVegetal + item.fatVegetal,
      carbs: acc.carbs + item.carbs,
      carbsAvailable: acc.carbsAvailable + item.carbsAvailable,
      fiber: acc.fiber + item.fiber,
      ash: acc.ash + item.ash,
      calcium: acc.calcium + item.calcium,
      phosphorus: acc.phosphorus + item.phosphorus,
      zinc: acc.zinc + item.zinc,
      iron: acc.iron + item.iron,
      sodium: acc.sodium + item.sodium,
      potassium: acc.potassium + item.potassium,
      vitaminA: acc.vitaminA + item.vitaminA,
      retinol: acc.retinol + item.retinol,
      thiamin: acc.thiamin + item.thiamin,
      riboflavin: acc.riboflavin + item.riboflavin,
      niacin: acc.niacin + item.niacin,
      vitaminC: acc.vitaminC + item.vitaminC,
      folicAcid: acc.folicAcid + item.folicAcid,
      cost: acc.cost + item.cost,
    }),
    { ...EMPTY_TOTALS }
  );
}

export function calculateMealTotals(
  items: MealItem[],
  foodMap: Map<number, Food>
): NutrientTotals {
  const rows = items.map((item) =>
    calculateItemTotals(
      item.foodId ? foodMap.get(item.foodId) : undefined,
      item.grams
    )
  );
  return sumTotals(rows);
}

export function calculateDayTotals(
  meals: MealBlock[],
  foodMap: Map<number, Food>
): NutrientTotals {
  return sumTotals(meals.map((meal) => calculateMealTotals(meal.items, foodMap)));
}

function adequacyStatus(percent: number | null): AdequacyStatus {
  if (percent === null) return "na";
  if (percent < 90) return "low";
  if (percent > 110) return "high";
  return "ok";
}

export function buildAdequacyRows(
  provided: NutrientTotals,
  requirements: Requirements
): AdequacyRow[] {
  const rows: Array<Omit<AdequacyRow, "percent" | "status">> = [
    { key: "energy", label: "Energía", unit: "kcal", recommended: requirements.energy, provided: provided.energy },
    { key: "proteinTotal", label: "Proteína total", unit: "g", recommended: requirements.proteinTotal, provided: provided.proteinTotal },
    { key: "fatTotal", label: "Grasa total", unit: "g", recommended: requirements.fatTotal, provided: provided.fatTotal },
    { key: "carbs", label: "Carbohidratos", unit: "g", recommended: requirements.carbs, provided: provided.carbs },
    { key: "fiber", label: "Fibra", unit: "g", recommended: requirements.fiber, provided: provided.fiber },
    { key: "calcium", label: "Calcio", unit: "mg", recommended: requirements.calcium, provided: provided.calcium },
    { key: "phosphorus", label: "Fósforo", unit: "mg", recommended: requirements.phosphorus, provided: provided.phosphorus },
    { key: "zinc", label: "Zinc", unit: "mg", recommended: requirements.zinc, provided: provided.zinc },
    { key: "iron", label: "Hierro", unit: "mg", recommended: requirements.iron, provided: provided.iron },
    { key: "sodium", label: "Sodio", unit: "mg", recommended: requirements.sodium, provided: provided.sodium },
    { key: "potassium", label: "Potasio", unit: "mg", recommended: requirements.potassium, provided: provided.potassium },
    { key: "vitaminA", label: "Vitamina A", unit: "µg", recommended: requirements.vitaminA, provided: provided.vitaminA },
    { key: "thiamin", label: "Tiamina", unit: "mg", recommended: requirements.thiamin, provided: provided.thiamin },
    { key: "riboflavin", label: "Riboflavina", unit: "mg", recommended: requirements.riboflavin, provided: provided.riboflavin },
    { key: "niacin", label: "Niacina", unit: "mg", recommended: requirements.niacin, provided: provided.niacin },
    { key: "vitaminC", label: "Vitamina C", unit: "mg", recommended: requirements.vitaminC, provided: provided.vitaminC },
    { key: "folicAcid", label: "Ácido fólico", unit: "µg", recommended: requirements.folicAcid, provided: provided.folicAcid },
  ];

  return rows.map((row) => {
    const percent =
      row.recommended > 0 ? (row.provided / row.recommended) * 100 : null;
    return {
      ...row,
      percent,
      status: adequacyStatus(percent),
    };
  });
}

export function fiberDisplay(totalFiber: number): string {
  if (totalFiber > 10) return "EXCESO";
  return totalFiber.toFixed(1);
}
