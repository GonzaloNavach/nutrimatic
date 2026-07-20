import { PreviewC } from "@/components/preview/PreviewC";
import foodsData from "@/data/foods.json";
import type { Food } from "@/lib/nutrition/types";

export default function PreviewCPage() {
  return <PreviewC foods={foodsData as Food[]} />;
}
