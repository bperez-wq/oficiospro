type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_PUBLIC_KEY?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  APP_BASE_URL?: string;
};

type Plan = {
  id: string;
  name: string;
  audience: "cliente" | "empresa";
  priceCLP: number;
  monthlyCredits: number;
  accumulatesMonths: number;
};

type CheckoutRequest = {
  planId?: string;
  email?: string;
  name?: string;
  rut?: string;
  whatsapp?: string;
  commune?: string;
  creditsPack?: number;
  userId?: string;
};

const mercadoPagoApi = "https://api.mercadopago.com";

const plans: Plan[] = [
  { id: "basico", name: "Club Hogar Basico", audience: "cliente", priceCLP: 35000, monthlyCredits: 35, accumulatesMonths: 24 },
  { id: "plus", name: "Club Hogar Plus", audience: "cliente", priceCLP: 59000, monthlyCredits: 65, accumulatesMonths: 24 },
  { id: "familiar", name: "Club Hogar Familiar", audience: "cliente", priceCLP: 89000, monthlyCredits: 105, accumulatesMonths: 24 },
  { id: "pyme", name: "Empresa Pyme", audience: "empresa", priceCLP: 49990, monthlyCredits: 50, accumulatesMonths: 24 },
  { id: "empresa", name: "Empresa", audience: "empresa", priceCLP: 149990, monthlyCredits: 200, accumulatesMonths: 24 },
  { id: "corporativo", name: "Corporativo", audience: "empresa", priceCLP: 499990, monthlyCredits: 650, accumulatesMonths: 24 },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

      try {
        if (url.pathname === "/api/payments/create-checkout" && request.method === "POST") {
          return withCors(await createCheckout(request, env));
        }
        if (url.pathname === "/api/payments/create-subscription" && request.method === "POST") {
          return withCors(await createSubscription(request, env));
        }
        if (url.pathname === "/api/payments/webhook" && request.method === "POST") {
          return withCors(await processWebhook(request, env));
        }
        if (url.pathname === "/api/payments/status" && request.method === "GET") {
          return withCors(await paymentStatus(url, env));
        }
        if (url.pathname === "/api/credits/add" && request.method === "POST") {
          return withCors(await addCredits(request));
        }
        if (url.pathname === "/api/credits/use" && request.method === "POST") {
          return withCors(await useCredits(request));
        }
        if (url.pathname === "/api/credits/wallet" && request.method === "GET") {
          return withCors(await getWallet(url));
        }
        if (url.pathname === "/api/admin/payments/reconcile" && request.method === "POST") {
          return withCors(await reconcilePayments(request));
        }

        return withCors(json({ ok: false, error: "endpoint_not_found" }, 404));
      } catch (error) {
        return withCors(
          json(
            {
              ok: false,
              error: "internal_error",
              message: error instanceof Error ? error.message : "Error inesperado",
            },
            500,
          ),
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};

async function createCheckout(request: Request, env: Env) {
  const body = (await request.json()) as CheckoutRequest;
  const plan = findPlan(body.planId);
  const creditsPack = Number(body.creditsPack ?? 0);
  const isCreditsPurchase = creditsPack > 0;
  const itemTitle = isCreditsPurchase ? `${creditsPack} creditos OficiosPro` : plan.name;
  const itemPrice = isCreditsPurchase ? creditsPack * 1000 : plan.priceCLP;
  const itemDescription = isCreditsPurchase
    ? "Compra puntual de creditos para reservar servicios tecnicos"
    : `${plan.monthlyCredits} creditos OficiosPro acumulables por ${plan.accumulatesMonths} meses`;
  const baseUrl = getBaseUrl(request, env);

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return paymentsPreparing(plan, "checkout", isCreditsPurchase ? creditsPack : undefined);
  }

  const preference = {
    items: [
      {
        id: plan.id,
        title: itemTitle,
        description: itemDescription,
        quantity: 1,
        currency_id: "CLP",
        unit_price: itemPrice,
      },
    ],
    payer: buildPayer(body),
    external_reference: externalReference(isCreditsPurchase ? "credits" : "plan", plan.id, body.userId),
    metadata: {
      plan_id: plan.id,
      credits_per_month: isCreditsPurchase ? 0 : plan.monthlyCredits,
      credits_pack: isCreditsPurchase ? creditsPack : 0,
      rut: body.rut ?? "",
      whatsapp: body.whatsapp ?? "",
      commune: body.commune ?? "",
    },
    back_urls: {
      success: `${baseUrl}/dashboard-cliente/?payment=success&plan=${plan.id}`,
      pending: `${baseUrl}/checkout/?payment=pending&plan=${plan.id}`,
      failure: `${baseUrl}/checkout/?payment=failure&plan=${plan.id}`,
    },
    auto_return: "approved",
    notification_url: `${baseUrl}/api/payments/webhook`,
  };

  const response = await mercadoPagoFetch(env, "/checkout/preferences", preference);
  return json({
    ok: true,
    provider: "mercadopago",
    type: "checkout",
    plan,
    preferenceId: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    status: "created",
  });
}

async function createSubscription(request: Request, env: Env) {
  const body = (await request.json()) as CheckoutRequest;
  const plan = findPlan(body.planId);
  const baseUrl = getBaseUrl(request, env);

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return paymentsPreparing(plan, "subscription");
  }

  const startDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const preapproval = {
    reason: `${plan.name} OficiosPro`,
    external_reference: externalReference("subscription", plan.id, body.userId),
    payer_email: body.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      start_date: startDate,
      transaction_amount: plan.priceCLP,
      currency_id: "CLP",
    },
    back_url: `${baseUrl}/dashboard-${plan.audience === "empresa" ? "empresa" : "cliente"}/?subscription=authorized&plan=${plan.id}`,
    notification_url: `${baseUrl}/api/payments/webhook`,
    metadata: {
      plan_id: plan.id,
      credits_per_month: plan.monthlyCredits,
      rut: body.rut ?? "",
      whatsapp: body.whatsapp ?? "",
      commune: body.commune ?? "",
    },
  };

  const response = await mercadoPagoFetch(env, "/preapproval", preapproval);
  return json({
    ok: true,
    provider: "mercadopago",
    type: "subscription",
    plan,
    preapprovalId: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    status: response.status ?? "pending",
    nextBillingDate: response.next_payment_date ?? null,
  });
}

async function processWebhook(request: Request, env: Env) {
  const url = new URL(request.url);
  const bodyText = await request.text();
  const payload = safeJson(bodyText);
  const verified = await verifyMercadoPagoSignature(request, url, env);

  if (env.MERCADOPAGO_WEBHOOK_SECRET && !verified) {
    return json({ ok: false, error: "invalid_signature" }, 401);
  }

  const dataId =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    payload?.data?.id ??
    payload?.id ??
    payload?.resource?.split("/")?.pop() ??
    null;
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? payload?.type ?? payload?.topic ?? "unknown";
  const eventId = `${topic}:${dataId ?? "sin-id"}`;

  return json({
    ok: true,
    received: true,
    verified,
    eventId,
    topic,
    dataId,
    action: inferWebhookAction(topic, payload),
    idempotencyKey: eventId,
    creditOperation: inferCreditOperation(topic, payload),
  });
}

async function paymentStatus(url: URL, env: Env) {
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type") ?? "payment";

  if (!id) return json({ ok: false, error: "missing_payment_id" }, 400);
  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return json({ ok: true, status: "preparing", provider: "mercadopago", id, type });
  }

  const endpoint = type === "subscription" ? `/preapproval/${id}` : `/v1/payments/${id}`;
  const response = await mercadoPagoGet(env, endpoint);
  return json({ ok: true, provider: "mercadopago", type, data: response });
}

async function addCredits(request: Request) {
  const body = (await request.json()) as { userId?: string; amount?: number; reason?: string; relatedPaymentId?: string };
  const amount = normalizeCredits(body.amount);
  return json({
    ok: true,
    wallet: {
      userId: body.userId ?? "current-user",
      added: amount,
      currentBalance: amount,
      expiringCredits: [{ amount, expiresAt: addMonths(new Date(), 24).toISOString() }],
      updatedAt: new Date().toISOString(),
    },
    transaction: creditTransaction("subscription_credit", amount, body.relatedPaymentId, body.reason),
  });
}

async function useCredits(request: Request) {
  const body = (await request.json()) as { userId?: string; amount?: number; action?: "hold" | "capture" | "refund"; relatedServiceRequestId?: string };
  const amount = normalizeCredits(body.amount);
  const type = body.action === "refund" ? "refund" : body.action === "capture" ? "service_capture" : "service_hold";
  return json({
    ok: true,
    wallet: {
      userId: body.userId ?? "current-user",
      used: type === "refund" ? 0 : amount,
      returned: type === "refund" ? amount : 0,
      currentBalance: 0,
      updatedAt: new Date().toISOString(),
    },
    transaction: {
      ...creditTransaction(type, type === "refund" ? amount : -amount, undefined, body.relatedServiceRequestId),
      relatedServiceRequestId: body.relatedServiceRequestId ?? null,
    },
  });
}

async function getWallet(url: URL) {
  const userId = url.searchParams.get("userId") ?? "current-user";
  return json({
    ok: true,
    wallet: {
      userId,
      currentBalance: 0,
      expiringCredits: [],
      updatedAt: new Date().toISOString(),
    },
  });
}

async function reconcilePayments(request: Request) {
  const body = ((await request.json().catch(() => ({}))) as { from?: string; to?: string });
  return json({
    ok: true,
    reconciledAt: new Date().toISOString(),
    period: {
      from: body.from ?? null,
      to: body.to ?? null,
    },
    summary: {
      reviewedPayments: 0,
      approvedPayments: 0,
      failedPayments: 0,
      issuedCredits: 0,
      pendingPayouts: 0,
    },
  });
}

function findPlan(planId?: string | null) {
  return plans.find((plan) => plan.id === planId) ?? plans[1];
}

function buildPayer(body: CheckoutRequest) {
  const [firstName, ...rest] = (body.name ?? "").trim().split(" ").filter(Boolean);
  return {
    name: firstName ?? "",
    surname: rest.join(" "),
    email: body.email,
    phone: { number: body.whatsapp ?? "" },
    identification: { type: "RUT", number: body.rut ?? "" },
  };
}

function externalReference(type: string, planId: string, userId?: string) {
  return `oficiospro:${type}:${planId}:${userId ?? crypto.randomUUID()}`;
}

function paymentsPreparing(plan: Plan, type: "checkout" | "subscription", creditsPack?: number) {
  return json({
    ok: false,
    provider: "mercadopago",
    type,
    status: "preparing",
    code: "payments_not_configured",
    message: "Pago en preparacion",
    plan,
    creditsPack: creditsPack ?? null,
  });
}

async function mercadoPagoFetch(env: Env, endpoint: string, body: unknown) {
  const response = await fetch(`${mercadoPagoApi}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(`Mercado Pago ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function mercadoPagoGet(env: Env, endpoint: string) {
  const response = await fetch(`${mercadoPagoApi}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(`Mercado Pago ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function verifyMercadoPagoSignature(request: Request, url: URL, env: Env) {
  const secret = env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const signatureHeader = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  const ts = parts.ts;
  const signature = parts.v1;
  const dataId = (url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "").toLowerCase();
  if (!ts || !signature) return false;

  const manifest = `${dataId ? `id:${dataId};` : ""}${requestId ? `request-id:${requestId};` : ""}ts:${ts};`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

function inferWebhookAction(topic: string, payload: Record<string, any> | null) {
  const action = payload?.action ?? payload?.status ?? topic;
  if (String(action).includes("approved") || String(action).includes("authorized")) return "activate_subscription_and_issue_credits";
  if (String(action).includes("cancelled")) return "cancel_subscription";
  if (String(action).includes("rejected") || String(action).includes("failed")) return "mark_payment_failed";
  if (String(action).includes("chargeback")) return "review_chargeback";
  return "store_event_for_reconciliation";
}

function inferCreditOperation(topic: string, payload: Record<string, any> | null) {
  const action = inferWebhookAction(topic, payload);
  if (action === "activate_subscription_and_issue_credits") return "add_subscription_credits";
  if (action === "cancel_subscription") return "stop_future_credits";
  if (action === "review_chargeback") return "admin_review_required";
  return "none";
}

function creditTransaction(type: string, amount: number, relatedPaymentId?: string, detail?: string) {
  return {
    id: `ctx_${crypto.randomUUID()}`,
    type,
    amount,
    detail: detail ?? null,
    expiresAt: amount > 0 ? addMonths(new Date(), 24).toISOString() : null,
    relatedPaymentId: relatedPaymentId ?? null,
    createdAt: new Date().toISOString(),
  };
}

function normalizeCredits(amount?: number) {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value) || value <= 0) throw new Error("credit_amount_invalid");
  if (value % 2 !== 0) throw new Error("credits_must_be_even");
  return value;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getBaseUrl(request: Request, env: Env) {
  if (env.APP_BASE_URL) return env.APP_BASE_URL.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,x-signature,x-request-id");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
