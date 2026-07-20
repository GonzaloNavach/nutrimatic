import { NextResponse } from "next/server";
import { getPaymentClient, isMercadoPagoConfigured } from "@/lib/mercadopago/client";
import { activateSubscriptionFromMpPayment } from "@/lib/mercadopago/sync";

export const runtime = "nodejs";

type MpTopicQuery = {
  id?: string;
  topic?: string;
  type?: string;
  "data.id"?: string;
};

async function resolvePaymentId(
  request: Request,
  body: Record<string, unknown>
): Promise<string | null> {
  const url = new URL(request.url);
  const q = Object.fromEntries(url.searchParams.entries()) as MpTopicQuery;

  // Formato nuevo: ?type=payment&data.id=123
  if (q["data.id"] && (q.type === "payment" || q.topic === "payment")) {
    return q["data.id"];
  }

  // Formato clásico: ?topic=payment&id=123
  if (q.id && (q.topic === "payment" || q.type === "payment")) {
    return q.id;
  }

  // Body JSON (algunos envíos)
  const data = body.data as { id?: string | number } | undefined;
  const action = typeof body.action === "string" ? body.action : "";
  if (
    data?.id != null &&
    (body.type === "payment" || action.includes("payment"))
  ) {
    return String(data.id);
  }

  if (body.id != null && body.topic === "payment") {
    return String(body.id);
  }

  return null;
}

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "MP no configurado" }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const paymentId = await resolvePaymentId(request, body);
  if (!paymentId) {
    // MP a veces manda otros topics; ACK para no reintentar eterno
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const payment = await getPaymentClient().get({ id: paymentId });
    const status = payment.status;
    if (status !== "approved") {
      return NextResponse.json({ received: true, status });
    }

    const userId =
      payment.external_reference ||
      (payment.metadata as { supabase_user_id?: string } | undefined)
        ?.supabase_user_id;

    if (!userId) {
      console.error("[mp webhook] payment sin external_reference", paymentId);
      return NextResponse.json({ error: "Sin user id" }, { status: 400 });
    }

    await activateSubscriptionFromMpPayment({
      userId,
      paymentId: String(payment.id ?? paymentId),
      amount: payment.transaction_amount,
    });

    return NextResponse.json({ received: true, activated: true });
  } catch (err) {
    console.error("[mp webhook]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** MP a veces valida con GET. */
export async function GET(request: Request) {
  return POST(request);
}
