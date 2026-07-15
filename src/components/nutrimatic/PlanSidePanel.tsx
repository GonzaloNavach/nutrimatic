"use client";

import { AdequacyPanel } from "@/components/nutrimatic/AdequacyPanel";
import { RequirementsPanel } from "@/components/nutrimatic/RequirementsPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdequacyRow, Requirements } from "@/lib/nutrition/types";
import type { ReactNode } from "react";
import { useState } from "react";

interface PlanWorkspaceProps {
  requirements: Requirements;
  onRequirementsChange: (value: Requirements) => void;
  adequacyRows: AdequacyRow[];
  /** Contenido del plan de alimentos (comidas + columnas). */
  planContent: ReactNode;
}

/**
 * Un solo bloque: Requerimientos | Plan | Adecuación.
 * Default: Requerimientos.
 */
export function PlanWorkspace({
  requirements,
  onRequirementsChange,
  adequacyRows,
  planContent,
}: PlanWorkspaceProps) {
  const [tab, setTab] = useState("requirements");

  return (
    <Card>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-0">
        <div className="border-b px-4 pt-4 pb-3">
          <TabsList className="w-full max-w-lg">
            <TabsTrigger value="requirements">Requerimientos</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="adequacy">Adecuación</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex flex-col p-0">
          <TabsContent
            value="requirements"
            className="mt-0 px-4 py-3 data-[state=inactive]:hidden"
          >
            <RequirementsPanel
              embedded
              value={requirements}
              onChange={onRequirementsChange}
            />
          </TabsContent>

          <TabsContent
            value="plan"
            className="mt-0 space-y-4 px-4 py-3 data-[state=inactive]:hidden"
          >
            {planContent}
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

/** @deprecated Use PlanWorkspace */
export const PlanSidePanel = PlanWorkspace;
