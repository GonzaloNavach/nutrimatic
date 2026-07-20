import { PreviewB } from "@/components/preview/PreviewB";
import foodsData from "@/data/foods.json";
import type { Food } from "@/lib/nutrition/types";

export default function PreviewBPage() {
  return <PreviewB foods={foodsData as Food[]} />;
}
