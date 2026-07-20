import { NextResponse, type NextRequest } from "next/server";
import { isAuthGateEnabled } from "@/lib/subscription/config";
import { hasSubscriptionAccess, type SubscriptionStatus } from "@/lib/subscription/types";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/pricing",
  "/auth",
  "/api/stripe/webhook",
  "/api/mercadopago/webhook",
  "/preview",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthGateEnabled()) {
    return NextResponse.next();
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (isPublicPath(pathname)) {
    // Ya logueado con acceso → no hace falta ver login/signup
    if (
      user &&
      supabase &&
      (pathname === "/login" || pathname === "/signup")
    ) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (hasSubscriptionAccess(sub?.status as SubscriptionStatus | undefined)) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Checkout: sesión sí, suscripción no (aún).
  if (
    pathname.startsWith("/api/stripe/checkout") ||
    pathname.startsWith("/api/stripe/portal") ||
    pathname.startsWith("/api/mercadopago/checkout")
  ) {
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!supabase) {
    return supabaseResponse;
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!hasSubscriptionAccess(sub?.status as SubscriptionStatus | undefined)) {
    const url = request.nextUrl.clone();
    url.pathname = "/pricing";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Excluir assets estáticos y favicon.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
