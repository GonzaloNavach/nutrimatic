import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getSubscriptionPeriodEnd,
  getSubscriptionPriceId,
} from "@/lib/stripe/client";
import type { SubscriptionStatus } from "@/lib/subscription/types";

function toIso(unix: number | null | undefined): string | null {
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
}

export async function upsertSubscriptionFromStripe(
  sub: Stripe.Subscription,
  userId?: string
) {
  const supabase = createServiceClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let resolvedUserId = userId ?? sub.metadata.supabase_user_id;

  if (!resolvedUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    resolvedUserId = profile?.id;
  }

  if (!resolvedUserId) {
    console.error("[stripe] No user for customer", customerId);
    return;
  }

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", resolvedUserId);

  const periodEnd = getSubscriptionPeriodEnd(sub);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: resolvedUserId,
      stripe_subscription_id: sub.id,
      stripe_price_id: getSubscriptionPriceId(sub),
      status: sub.status as SubscriptionStatus,
      current_period_end: toIso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[stripe] upsert subscription", error.message);
  }
}

export async function markSubscriptionCanceled(stripeSubscriptionId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[stripe] cancel subscription", error.message);
  }
}
