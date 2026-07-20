/**
 * Auth/billing gate. Sin env de Supabase, el middleware deja pasar
 * (dev local sin cuentas). Con gate explícitamente desactivado: AUTH_GATE=off.
 */
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isAuthGateEnabled(): boolean {
  if (process.env.AUTH_GATE === "off") return false;
  return isAuthConfigured();
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ID &&
      process.env.NEXT_PUBLIC_APP_URL
  );
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3010";
}
