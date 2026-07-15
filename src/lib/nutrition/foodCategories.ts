export interface FoodCategory {
  id: string;
  label: string;
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  { id: "cereales", label: "Cereales y derivados" },
  { id: "verduras", label: "Verduras, hortalizas y derivados" },
  { id: "frutas", label: "Frutas y derivados" },
  { id: "grasas", label: "Grasas, aceites y oleaginosas" },
  { id: "pescados", label: "Pescados y mariscos" },
  { id: "carnes", label: "Carnes y derivados" },
  { id: "lacteos", label: "Leches y derivados" },
  { id: "bebidas", label: "Bebidas (alcohólicas y analcohólicas)" },
  { id: "huevos", label: "Huevos y derivados" },
  { id: "azucarados", label: "Productos azucarados" },
  { id: "miscelaneos", label: "Misceláneos" },
  { id: "infantiles", label: "Alimentos infantiles" },
  { id: "leguminosas", label: "Leguminosas y derivados" },
  { id: "tuberculos", label: "Tubérculos, raíces y derivados" },
  { id: "preparados", label: "Alimentos preparados" },
];

export const AUTO_EXPAND_MAX_PRODUCTS = 5;

export function foodMatchesQuery(
  food: { id: number; code?: string; name: string },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (food.code?.toLowerCase().includes(q)) return true;
  if (/^\d+$/.test(q)) return String(food.id).includes(q);
  return food.name.toLowerCase().includes(q);
}
