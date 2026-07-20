# Mercado Pago (Yape) — Nutrimatic

Pago mensual en soles con Yape vía Checkout Pro. Al aprobarse el pago, el webhook activa `subscriptions.status = active` por 30 días.

## Flujo

1. Usuario se registra / inicia sesión (Supabase).
2. `/pricing` → **Pagar con Yape**.
3. Mercado Pago Checkout (Yape u otros medios PE).
4. Webhook `payment.approved` → acceso inmediato.
5. Redirect a `/pricing?checkout=success`.

## Variables

```env
MP_ACCESS_TOKEN=APP_USR-...   # o TEST-... en sandbox
MP_PRICE_PEN=49.90
MP_SUBSCRIPTION_DAYS=30
NEXT_PUBLIC_APP_URL=http://localhost:3010
# En local, MP no puede pegarle a localhost: usá ngrok/cloudflared
# MP_WEBHOOK_PUBLIC_URL=https://xxxx.ngrok-free.app/api/mercadopago/webhook
```

También necesitás Supabase configurado (ver `subscription-setup.md`).

## Obtener Access Token

1. [developers.mercadopago.com.pe](https://www.mercadopago.com.pe/developers/panel/app)
2. Crear aplicación **Nutrimatic**
3. Credenciales de **prueba** primero → `MP_ACCESS_TOKEN`
4. Webhooks: URL pública → `/api/mercadopago/webhook` (topic Payments)

## Local con webhook

```powershell
# Ejemplo cloudflared
cloudflared tunnel --url http://localhost:3010
```

Poné la URL HTTPS en `MP_WEBHOOK_PUBLIC_URL` y en el panel de MP.

Sin túnel: el pago puede aprobarse igual; al volver a success podés recargar tras unos segundos si configuraste notification_url pública, o activar a mano en SQL:

```sql
update public.subscriptions
set status = 'active',
    current_period_end = now() + interval '30 days'
where user_id = '<uuid>';
```

## Activar el gate

Cuando MP esté OK:

```env
AUTH_GATE=on
# o borrá AUTH_GATE=off
```

## Archivos

```
src/lib/mercadopago/*
src/app/api/mercadopago/checkout/route.ts
src/app/api/mercadopago/webhook/route.ts
src/components/auth/PricingActions.tsx
```
