import { PreviewA } from "@/components/preview/PreviewA";
import foodsData from "@/data/foods.json";
import type { Food } from "@/lib/nutrition/types";

export default function PreviewAPage() {
  return <PreviewA foods={foodsData as Food[]} />;
}
