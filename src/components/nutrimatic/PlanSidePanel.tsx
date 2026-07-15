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
    <Card className="xl:sticky xl:top-6 xl:flex xl:max-h-[calc(100vh-5rem)] xl:flex-col">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b px-4 pt-4 pb-3">
          <TabsList className="w-full">
            <TabsTrigger value="requirements">Requerimientos</TabsTrigger>
            <TabsTrigger value="adequacy">Adecuación</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <TabsContent
            value="requirements"
            className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <RequirementsPanel
                embedded
                value={requirements}
                onChange={onRequirementsChange}
              />
            </div>
            <div className="shrink-0 border-t p-4">
              <Button
                type="button"
                className="w-full"
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
            className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 py-3 data-[state=inactive]:hidden"
          >
            <AdequacyPanel embedded rows={adequacyRows} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
