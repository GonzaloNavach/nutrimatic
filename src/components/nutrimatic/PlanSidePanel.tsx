"use client";

import { AdequacyPanel } from "@/components/nutrimatic/AdequacyPanel";
import { RequirementsPanel } from "@/components/nutrimatic/RequirementsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdequacyRow, Requirements } from "@/lib/nutrition/types";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface PlanSidePanelProps {
  requirements: Requirements;
  onRequirementsChange: (value: Requirements) => void;
  adequacyRows: AdequacyRow[];
}

export function PlanSidePanel({
  requirements,
  onRequirementsChange,
  adequacyRows,
}: PlanSidePanelProps) {
  const [tab, setTab] = useState("requirements");

  return (
    <Card>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-0">
        <div className="border-b px-4 pt-4 pb-3">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="requirements">Requerimientos</TabsTrigger>
            <TabsTrigger value="adequacy">Adecuación</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex flex-col p-0">
          <TabsContent
            value="requirements"
            className="mt-0 flex flex-col data-[state=inactive]:hidden"
          >
            <div className="px-4 py-3">
              <RequirementsPanel
                embedded
                value={requirements}
                onChange={onRequirementsChange}
              />
            </div>
            <div className="border-t p-4">
              <Button
                type="button"
                className="w-full sm:w-auto"
                size="lg"
                onClick={() => setTab("adequacy")}
              >
                Ver adecuación nutricional
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="adequacy"
            className="mt-0 px-4 py-3 data-[state=inactive]:hidden"
          >
            <AdequacyPanel embedded rows={adequacyRows} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
