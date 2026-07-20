import { NextResponse } from "next/server";
import { getAppUrl, isStripeConfigured } from "@/lib/subscription/config";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe no configurado" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID!;
  const appUrl = getAppUrl();

  let customerId = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const trialDays = process.env.STRIPE_TRIAL_DAYS
    ? Number(process.env.STRIPE_TRIAL_DAYS)
    : 0;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pricing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
      ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "No se pudo crear la sesión de checkout" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
