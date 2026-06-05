# OficiosPro Payments Architecture

OficiosPro keeps the public app as a Next.js static export and adds a Cloudflare Worker backend for secure payment operations. The frontend never receives Mercado Pago credentials. It only calls relative `/api/*` endpoints served by the Worker.

## Runtime

- Frontend: Next.js `output: "export"` served from `/out`.
- Backend: Cloudflare Worker in `worker/index.ts`.
- Deploy: `npx wrangler deploy --assets ./out`.
- Secrets: configured in Cloudflare Workers & Pages, not committed.

## Required Cloudflare Variables

```bash
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=
APP_BASE_URL=https://oficiospro.cl
```

`MERCADOPAGO_ACCESS_TOKEN` and `MERCADOPAGO_WEBHOOK_SECRET` must be Worker secrets. `APP_BASE_URL` can be a normal environment variable.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/payments/create-checkout` | Creates a Mercado Pago Checkout Pro preference for one-time payments or credit packs. |
| `POST` | `/api/payments/create-subscription` | Creates a Mercado Pago preapproval for monthly Club Hogar or Empresas plans. |
| `POST` | `/api/payments/webhook` | Receives Mercado Pago webhooks, verifies signature when secret exists, and returns an idempotency key. |
| `GET` | `/api/payments/status` | Checks payment or subscription status against Mercado Pago when credentials exist. |
| `POST` | `/api/credits/add` | Adds credits to a wallet after an approved payment, subscription renewal, referral, or admin adjustment. |
| `POST` | `/api/credits/use` | Holds, captures, refunds, or expires credits for service requests. |
| `GET` | `/api/credits/wallet` | Returns the current wallet structure for a user. |
| `POST` | `/api/admin/payments/reconcile` | Reconciles payment, subscription, credit, and payout summaries. |

## Mercado Pago Flow

1. User selects a plan on the landing or Club Hogar page.
2. The capture modal collects name, email, WhatsApp, RUT and commune.
3. The user reaches `/checkout?plan=PLAN_ID`.
4. The frontend calls `/api/payments/create-subscription`.
5. The Worker sends the preapproval request to Mercado Pago using the access token.
6. Mercado Pago returns an `init_point`; the browser is redirected there.
7. Mercado Pago sends updates to `/api/payments/webhook`.
8. Approved payments activate the subscription and add monthly credits.
9. Renewals add more credits.
10. Admin reviews payments, failed subscriptions, high balances and specialist payouts.

For one-time credit packs, the checkout page calls `/api/payments/create-checkout` and creates a Checkout Pro preference.

## Webhook Idempotency

The Worker computes an idempotency key from topic/type and `data.id`:

```text
{topic}:{dataId}
```

In production this key must be persisted in Supabase, D1, KV, or another durable store before issuing credits. The current implementation returns the key and action model so the database layer can be connected without changing the public routes.

Mercado Pago webhook signature validation uses `x-signature`, `x-request-id`, `data.id` and `MERCADOPAGO_WEBHOOK_SECRET`. If the secret is configured and the signature is invalid, the Worker returns `401`.

## Credit Model

`credit_wallets`

- `user_id`
- `current_balance`
- `expiring_credits`
- `updated_at`

`credit_transactions`

- `id`
- `user_id`
- `type`
- `amount`
- `expires_at`
- `related_payment_id`
- `related_service_request_id`
- `created_at`

Transaction types:

- `subscription_credit`
- `purchase_credit`
- `referral_bonus`
- `service_hold`
- `service_capture`
- `refund`
- `expiration`
- `admin_adjustment`

Rules:

- Credits expire after 24 months by default.
- Service prices must use even credit values.
- Booking a service holds credits.
- Completing a service captures credits.
- Cancelling a service refunds held credits.

## Data Tables Prepared For Supabase

- `users`
- `companies`
- `specialists`
- `plans`
- `subscriptions`
- `payments`
- `credit_wallets`
- `credit_transactions`
- `service_requests`
- `specialist_payouts`
- `webhook_events`

## Specialist Payouts

The first version does not do automatic split payments. Admin sees pending payouts and marks them paid after manual transfer.

Example:

- Service: 12 credits.
- Credit value: CLP 1,000.
- Customer charge: CLP 12,000.
- Specialist payout: CLP 7,000.
- OficiosPro margin: CLP 5,000.

## Production Checklist

- Create Mercado Pago application.
- Configure Checkout Pro and subscriptions.
- Add `MERCADOPAGO_ACCESS_TOKEN` as Worker secret.
- Add `MERCADOPAGO_WEBHOOK_SECRET` as Worker secret.
- Set webhook URL: `https://oficiospro.cl/api/payments/webhook`.
- Persist webhook idempotency keys before issuing credits.
- Persist payments, subscriptions, wallets and payouts in Supabase or Cloudflare D1.
- Add operational alerts for rejected payments, chargebacks and failed renewals.
