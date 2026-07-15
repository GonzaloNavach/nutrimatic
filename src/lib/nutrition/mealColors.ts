/** Colores fijos por índice de comida (Desayuno → Adicional 8 p.m.). */
export const MEAL_SEGMENT_COLORS = [
  "#0d9488", // teal — Desayuno
  "#38bdf8", // sky — Adicional 10 a.m.
  "#f59e0b", // amber — Almuerzo
  "#a78bfa", // violet — Adicional 4 p.m.
  "#f43f5e", // rose — Cena
  "#64748b", // slate — Adicional 8 p.m.
] as const;

export function mealColorAt(index: number): string {
  return MEAL_SEGMENT_COLORS[index % MEAL_SEGMENT_COLORS.length]!;
}
