import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let client: MercadoPagoConfig | null = null;

export function isMercadoPagoConfigured(): boolean {
  return Boolean(
    process.env.MP_ACCESS_TOKEN &&
      process.env.NEXT_PUBLIC_APP_URL &&
      process.env.MP_PRICE_PEN
  );
}

export function getMercadoPago() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Falta MP_ACCESS_TOKEN");
  }
  if (!client) {
    client = new MercadoPagoConfig({ accessToken: token });
  }
  return client;
}

export function getPreferenceClient() {
  return new Preference(getMercadoPago());
}

export function getPaymentClient() {
  return new Payment(getMercadoPago());
}

/** Precio mensual en soles (ej. 49.90). */
export function getMonthlyPricePen(): number {
  const raw = process.env.MP_PRICE_PEN ?? "49.90";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("MP_PRICE_PEN inválido");
  }
  return n;
}

export function getSubscriptionDays(): number {
  const raw = process.env.MP_SUBSCRIPTION_DAYS ?? "30";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 30;
}
