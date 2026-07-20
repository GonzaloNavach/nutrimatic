import { Suspense } from "react";
import Link from "next/link";
import { PricingActions } from "@/components/auth/PricingActions";
import { isMercadoPagoConfigured } from "@/lib/mercadopago/client";
import { isAuthConfigured } from "@/lib/subscription/config";
import type { SubscriptionStatus } from "@/lib/subscription/types";
import { createClient } from "@/lib/supabase/server";

export default async function PricingPage() {
  const authOn = isAuthConfigured();
  let email: string | null = null;
  let status: SubscriptionStatus | null = null;
  let periodEnd: string | null = null;
  const pricePen = process.env.MP_PRICE_PEN ?? "49.90";

  if (authOn) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <PricingLayout pricePen={pricePen}>
          <p className="text-sm text-muted-foreground">
            Para suscribirte, primero{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              iniciá sesión
            </Link>{" "}
            o{" "}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              creá una cuenta
            </Link>
            .
          </p>
        </PricingLayout>
      );
    }

    email = user.email ?? null;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    status = (sub?.status as SubscriptionStatus | undefined) ?? "inactive";
    periodEnd = sub?.current_period_end ?? null;
  }

  return (
    <PricingLayout pricePen={pricePen}>
      {authOn ? (
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
          <PricingActions
            email={email}
            status={status}
            periodEnd={periodEnd}
            mpConfigured={isMercadoPagoConfigured()}
            pricePen={pricePen}
          />
        </Suspense>
      ) : (
        <p className="text-sm text-muted-foreground">
          Auth no configurado. Agregá las variables de Supabase en{" "}
          <code className="text-xs">.env.local</code>.
        </p>
      )}
    </PricingLayout>
  );
}

function PricingLayout({
  children,
  pricePen,
}: {
  children: React.ReactNode;
  pricePen: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,216,104,0.12),_transparent_55%),linear-gradient(180deg,var(--color-background),var(--color-muted))]"
      />
      <div className="relative w-full max-w-lg space-y-6">
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-primary">
            Nutrimatic
          </p>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">
            Plan mensual
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acceso completo al planificador de comidas para nutricionistas.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-6 border-b border-border pb-6">
            <p className="text-3xl font-semibold tracking-tight">
              S/ {pricePen}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                / mes
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Plan de comidas de un día con metas nutricionales</li>
              <li>Base de alimentos y adecuación en tiempo real</li>
              <li>Pago con Yape vía Mercado Pago · acceso automático</li>
            </ul>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
