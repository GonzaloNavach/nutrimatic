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
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Sin cliente de Stripe" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getAppUrl()}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
