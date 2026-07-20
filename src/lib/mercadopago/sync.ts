import { createServiceClient } from "@/lib/supabase/admin";
import { getSubscriptionDays } from "@/lib/mercadopago/client";

export async function activateSubscriptionFromMpPayment(params: {
  userId: string;
  paymentId: string;
  amount?: number | null;
}) {
  const supabase = createServiceClient();
  const days = getSubscriptionDays();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + days);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_subscription_id: `mp_${params.paymentId}`,
      stripe_price_id: params.amount != null ? `pen_${params.amount}` : "mp_monthly",
      status: "active",
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[mp] activate subscription", error.message);
    throw error;
  }
}
