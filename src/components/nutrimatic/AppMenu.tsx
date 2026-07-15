"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";

interface AppMenuProps {
  onLoadExample: () => void;
}

/** Menú hamburguesa: cargar ejemplo y espacio para más opciones. */
export function AppMenu({ onLoadExample }: AppMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Más opciones"
          title="Más opciones"
        >
          <Menu className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
          onClick={() => {
            onLoadExample();
            setOpen(false);
          }}
        >
          <Sparkles className="size-4 text-muted-foreground" />
          Cargar ejemplo
        </button>
      </PopoverContent>
    </Popover>
  );
}
