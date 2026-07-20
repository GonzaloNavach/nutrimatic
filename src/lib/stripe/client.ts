import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Falta STRIPE_SECRET_KEY");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: Stripe.API_VERSION,
      typescript: true,
    });
  }
  return stripeSingleton;
}

/** Periodo actual vive en el item (API Stripe reciente). */
export function getSubscriptionPeriodEnd(sub: Stripe.Subscription): number | null {
  const item = sub.items.data[0];
  return item?.current_period_end ?? null;
}

export function getSubscriptionPriceId(sub: Stripe.Subscription): string | null {
  const price = sub.items.data[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}
