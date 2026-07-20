"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, LogOut, Menu, Sparkles } from "lucide-react";
import { useState } from "react";

interface AppMenuProps {
  onLoadExample: () => void;
}

/** Menú hamburguesa: cargar ejemplo y espacio para más opciones. */
export function AppMenu({ onLoadExample }: AppMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function logout() {
    setOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // sin auth configurado
    }
    router.push(authConfigured ? "/login" : "/");
    router.refresh();
  }

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
        {authConfigured ? (
          <>
            <Link
              href="/pricing"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <CreditCard className="size-4 text-muted-foreground" />
              Suscripción
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
              onClick={logout}
            >
              <LogOut className="size-4 text-muted-foreground" />
              Cerrar sesión
            </button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
