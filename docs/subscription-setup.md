# Suscripción mensual (Supabase Auth + Stripe)

Gate de acceso a Nutrimatic con cuenta + plan mensual.

## Qué hace

1. Registro / login con Supabase Auth.
2. Checkout Stripe (suscripción recurrente).
3. Webhook Stripe → tabla `subscriptions`.
4. Middleware: sin sesión → `/login`; sin plan activo → `/pricing`.

Con **AUTH_GATE=off** o sin variables de Supabase, la app sigue abierta (dev local).

## Setup rápido

### 1. Proyecto Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pegá y ejecutá `supabase/migrations/001_subscriptions.sql`.
3. Authentication → Providers → Email (habilitado).
4. Authentication → URL configuration:
   - Site URL: `http://localhost:3010`
   - Redirect URLs: `http://localhost:3010/auth/callback`

Copiá **Project URL**, **anon key** y **service_role key**.

### 2. Stripe

1. [Dashboard](https://dashboard.stripe.com) → Productos → crear producto “Nutrimatic” con precio **recurring monthly**.
2. Copiá el `price_...` (Price ID).
3. Developers → API keys → Secret key (`sk_test_...`).
4. Webhooks (local con Stripe CLI):

```powershell
stripe listen --forward-to localhost:3010/api/stripe/webhook
```

Copiá el `whsec_...` que imprime el CLI.

Eventos a escuchar en producción:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

También creá un **Customer portal** en Stripe (Settings → Billing → Customer portal) con cancelación habilitada.

### 3. Variables de entorno

```powershell
copy .env.example .env.local
```

Completá los valores. Reiniciá `npm run dev`.

### 4. Probar flujo

1. Abrí `/signup` → creá cuenta.
2. Te manda a `/pricing` → **Suscribirme**.
3. Usá tarjeta de test Stripe: `4242 4242 4242 4242`.
4. Webhook actualiza `subscriptions.status` a `active` o `trialing`.
5. Entrás a `/`.

## Rutas

| Ruta | Rol |
|------|-----|
| `/login`, `/signup` | Auth |
| `/pricing` | Plan + checkout + portal |
| `/auth/callback` | OAuth / email confirm |
| `/api/stripe/checkout` | Crea sesión Checkout |
| `/api/stripe/portal` | Portal de cliente |
| `/api/stripe/webhook` | Sync Stripe → DB |
| `/preview/*` | Previews UI (sin gate) |

## Estados con acceso

- `active`
- `trialing`

El resto (`inactive`, `canceled`, `past_due`, …) van a `/pricing`.

## Archivos clave

```
src/middleware.ts
src/lib/supabase/*
src/lib/stripe/*
src/lib/subscription/*
supabase/migrations/001_subscriptions.sql
```
