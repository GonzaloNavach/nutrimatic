import { PreviewD } from "@/components/preview/PreviewD";
import foodsData from "@/data/foods.json";
import type { Food } from "@/lib/nutrition/types";

export default function PreviewDPage() {
  return <PreviewD foods={foodsData as Food[]} />;
}
