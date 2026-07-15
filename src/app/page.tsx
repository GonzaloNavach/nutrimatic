import { CalculatorApp } from "@/components/nutrimatic/CalculatorApp";
import foodsData from "@/data/foods.json";
import type { Food } from "@/lib/nutrition/types";

export default function HomePage() {
  return <CalculatorApp foods={foodsData as Food[]} />;
}
