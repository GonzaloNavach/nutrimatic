import { NextResponse } from "next/server";
import {
  getMonthlyPricePen,
  getPreferenceClient,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago/client";
import { getAppUrl } from "@/lib/subscription/config";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Mercado Pago no configurado" },
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

  const appUrl = getAppUrl();
  const amount = getMonthlyPricePen();
  const preference = getPreferenceClient();

  const result = await preference.create({
    body: {
      items: [
        {
          id: "nutrimatic-monthly",
          title: "Nutrimatic — plan mensual",
          quantity: 1,
          unit_price: amount,
          currency_id: "PEN",
        },
      ],
      payer: {
        email: user.email ?? undefined,
      },
      // Yape y otros medios locales PE
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      back_urls: {
        success: `${appUrl}/pricing?checkout=success`,
        failure: `${appUrl}/pricing?checkout=failure`,
        pending: `${appUrl}/pricing?checkout=pending`,
      },
      auto_return: "approved",
      external_reference: user.id,
      metadata: {
        supabase_user_id: user.id,
      },
      notification_url: process.env.MP_WEBHOOK_PUBLIC_URL
        ? process.env.MP_WEBHOOK_PUBLIC_URL
        : `${appUrl}/api/mercadopago/webhook`,
      statement_descriptor: "NUTRIMATIC",
    },
  });

  const url = result.init_point ?? result.sandbox_init_point;
  if (!url) {
    return NextResponse.json(
      { error: "No se pudo crear la preferencia de pago" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url,
    preferenceId: result.id,
  });
}
