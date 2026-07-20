"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { hasSubscriptionAccess, type SubscriptionStatus } from "@/lib/subscription/types";

type Props = {
  email: string | null;
  status: SubscriptionStatus | null;
  periodEnd: string | null;
  mpConfigured: boolean;
  pricePen: string;
};

function statusLabel(status: SubscriptionStatus | null): string {
  switch (status) {
    case "active":
      return "Activa";
    case "trialing":
      return "Prueba";
    case "past_due":
      return "Pago pendiente";
    case "canceled":
      return "Cancelada";
    case "inactive":
    case null:
      return "Sin suscripción";
    default:
      return status;
  }
}

export function PricingActions({
  email,
  status,
  periodEnd,
  mpConfigured,
  pricePen,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const [loading, setLoading] = useState<"checkout" | "logout" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = hasSubscriptionAccess(status);

  async function startCheckout() {
    setError(null);
    setLoading("checkout");
    try {
      const res = await fetch("/api/mercadopago/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo iniciar el pago");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de checkout");
      setLoading(null);
    }
  }

  async function logout() {
    setLoading("logout");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {checkout === "success" ? (
        <p className="rounded-md bg-secondary/20 px-3 py-2 text-sm text-foreground">
          Pago recibido. Si aún no ves acceso, esperá unos segundos y recargá.
        </p>
      ) : null}
      {checkout === "pending" ? (
        <p className="text-sm text-muted-foreground">
          Pago pendiente. Cuando Mercado Pago lo confirme, el acceso se activa solo.
        </p>
      ) : null}
      {checkout === "failure" || checkout === "cancel" ? (
        <p className="text-sm text-muted-foreground">Pago no completado.</p>
      ) : null}

      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        <p>
          <span className="text-muted-foreground">Cuenta: </span>
          {email ?? "—"}
        </p>
        <p className="mt-1">
          <span className="text-muted-foreground">Estado: </span>
          {statusLabel(status)}
        </p>
        {periodEnd ? (
          <p className="mt-1">
            <span className="text-muted-foreground">Periodo hasta: </span>
            {new Date(periodEnd).toLocaleDateString("es")}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!mpConfigured ? (
        <p className="text-sm text-muted-foreground">
          Mercado Pago aún no está configurado. Completá{" "}
          <code className="text-xs">MP_ACCESS_TOKEN</code> y{" "}
          <code className="text-xs">MP_PRICE_PEN</code> en{" "}
          <code className="text-xs">.env.local</code>.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {hasAccess ? (
          <Button
            type="button"
            className="flex-1"
            onClick={() => router.push("/")}
          >
            Ir a la app
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            disabled={!mpConfigured || loading !== null}
            onClick={startCheckout}
          >
            {loading === "checkout"
              ? "Redirigiendo…"
              : `Pagar S/ ${pricePen} con Yape`}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          disabled={loading !== null}
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
