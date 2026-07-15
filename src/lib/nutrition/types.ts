export interface Food {
  id: number;
  code: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  energy: number;
  energyKj?: number;
  water: number;
  protein?: number;
  proteinAnimal: number;
  proteinVegetal: number;
  fat?: number;
  fatAnimal: number;
  fatVegetal: number;
  carbs: number;
  carbsAvailable?: number;
  fiber: number;
  ash?: number;
  calcium: number;
  phosphorus: number;
  zinc?: number;
  iron: number;
  sodium: number;
  potassium: number;
  betaCarotene?: number;
  vitaminA?: number;
  retinol: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminC: number;
  folicAcid?: number;
  cost: number;
  source?: string;
}

export interface MealItem {
  id: string;
  foodId: number | null;
  grams: number;
}

export interface NutrientTotals {
  grams: number;
  energy: number;
  water: number;
  proteinTotal: number;
  proteinAnimal: number;
  proteinVegetal: number;
  fatTotal: number;
  fatAnimal: number;
  fatVegetal: number;
  carbs: number;
  carbsAvailable: number;
  fiber: number;
  ash: number;
  calcium: number;
  phosphorus: number;
  zinc: number;
  iron: number;
  sodium: number;
  potassium: number;
  vitaminA: number;
  retinol: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminC: number;
  folicAcid: number;
  cost: number;
}

export interface Requirements {
  energy: number;
  proteinTotal: number;
  proteinAnimal: number;
  proteinVegetal: number;
  fatTotal: number;
  carbs: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  zinc: number;
  iron: number;
  sodium: number;
  potassium: number;
  vitaminA: number;
  retinol: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminC: number;
  folicAcid: number;
}

export interface MealBlock {
  id: string;
  label: string;
  items: MealItem[];
}

export type AdequacyStatus = "ok" | "low" | "high" | "na";

export interface AdequacyRow {
  key: keyof Requirements;
  label: string;
  unit: string;
  recommended: number;
  provided: number;
  percent: number | null;
  status: AdequacyStatus;
}
