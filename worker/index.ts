type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  run(): Promise<unknown>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type Env = {
  ASSETS: AssetsBinding;
  DB?: D1Database;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_PUBLIC_KEY?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  TRANSBANK_COMMERCE_CODE?: string;
  TRANSBANK_API_KEY?: string;
  TRANSBANK_ENV?: string;
  APP_BASE_URL?: string;
  ADMIN_API_TOKEN?: string;
  ADMIN_TOKEN?: string;
  ADMIN_LOGIN_EMAIL?: string;
  ADMIN_LOGIN_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
  EMAIL_PROVIDER_API_KEY?: string;
  NOTIFICATION_TO_EMAIL?: string;
  NOTIFICATION_CC_EMAIL?: string;
  FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
  LEADS_TO_EMAIL?: string;
  LEADS_FROM_EMAIL?: string;
  LEADS_REPLY_TO_EMAIL?: string;
  CRM_AUTO_SYNC?: string;
};

type Plan = {
  id: string;
  name: string;
  audience: "cliente" | "empresa";
  priceCLP: number;
  monthlyCredits: number;
  accumulatesMonths: number;
};

type PaymentProvider = "mercado_pago" | "transbank_webpay" | "manual_bank_transfer" | "internal_adjustment";

type PaymentIntent = {
  id: string;
  provider: PaymentProvider;
  externalPaymentId?: string;
  userId: string;
  userRole: "client" | "company" | "specialist" | "admin";
  amountCLP: number;
  credits: number;
  currency: "CLP";
  type: "credit_pack" | "subscription_plan" | "service_reservation" | "visit_fee" | "quote_acceptance" | "additional_charge";
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type CreditPack = {
  id: string;
  credits: number;
  amountCLP: number;
  title: string;
};

type CheckoutRequest = {
  planId?: string;
  email?: string;
  name?: string;
  rut?: string;
  whatsapp?: string;
  commune?: string;
  provider?: PaymentProvider;
  creditPackId?: string;
  creditsPack?: number;
  userId?: string;
  cart?: unknown[];
};

type LeadType =
  | "customer_request"
  | "specialist_application"
  | "company_request"
  | "booking_request"
  | "contact_message"
  | "club_hogar_interest"
  | "payment_interest";

type LeadPayload = {
  leadType?: LeadType;
  fullName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  applicantType?: string;
  service?: string;
  trade?: string;
  problemDescription?: string;
  urgency?: string;
  regionCode?: string;
  regionName?: string;
  communeCode?: string;
  communeName?: string;
  specialistId?: string;
  specialistName?: string;
  requestedDate?: string;
  requestedTime?: string;
  creditsEstimate?: number;
  sourcePage?: string;
  sourceComponent?: string;
  sourceButton?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  referralCode?: string;
  consentContact?: boolean;
  consentTerms?: boolean;
  honeypot?: string;
  website?: string;
  companySite?: string;
  formStartedAt?: string;
  formElapsedMs?: number;
  payload?: Record<string, unknown>;
};

type WorkerPricingConfig = {
  customerCreditValueCLP: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  riskBufferPercent: number;
  fixedServiceFeeCLP: number;
  emergencyMultiplier: number;
  minimumClientCredits: number;
  creditRoundingStep: number;
};

const workerPricingConfig: WorkerPricingConfig = {
  customerCreditValueCLP: 1000,
  platformFeePercent: 0.18,
  paymentFeePercent: 0.035,
  riskBufferPercent: 0.04,
  fixedServiceFeeCLP: 2500,
  emergencyMultiplier: 1.35,
  minimumClientCredits: 12,
  creditRoundingStep: 2,
};

type LeadRecord = Omit<LeadPayload, "leadType" | "honeypot" | "payload"> & {
    leadType: LeadType;
    id: string;
    createdAt: string;
    status: string;
    priority: string;
    payloadJson: string;
    userAgent: string;
    emailSent: number;
    emailError: string;
  };

const mercadoPagoApi = "https://api.mercadopago.com";
const legacySpecialistEmailSubject = "Nueva postulación de especialista en OficiosPro";
const maxJsonBodyBytes = 32_000;
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();
const processedWebhookEvents = new Set<string>();
const adminSessionCookieName = "oficiospro_admin_session";

class SafeHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

const plans: Plan[] = [
  { id: "basico", name: "Club Hogar Basico", audience: "cliente", priceCLP: 35000, monthlyCredits: 35, accumulatesMonths: 24 },
  { id: "plus", name: "Club Hogar Plus", audience: "cliente", priceCLP: 59000, monthlyCredits: 65, accumulatesMonths: 24 },
  { id: "familiar", name: "Club Hogar Familiar", audience: "cliente", priceCLP: 89000, monthlyCredits: 105, accumulatesMonths: 24 },
  { id: "pyme", name: "Empresa Pyme", audience: "empresa", priceCLP: 49990, monthlyCredits: 50, accumulatesMonths: 24 },
  { id: "empresa", name: "Empresa", audience: "empresa", priceCLP: 149990, monthlyCredits: 200, accumulatesMonths: 24 },
  { id: "corporativo", name: "Corporativo", audience: "empresa", priceCLP: 499990, monthlyCredits: 650, accumulatesMonths: 24 },
];

const creditPacks: CreditPack[] = [
  { id: "credits-20", credits: 20, amountCLP: 20000, title: "20 creditos OficiosPro" },
  { id: "credits-50", credits: 50, amountCLP: 50000, title: "50 creditos OficiosPro" },
  { id: "credits-100", credits: 100, amountCLP: 100000, title: "100 creditos OficiosPro" },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

      try {
        if ((url.pathname === "/api/auth/admin-login" || url.pathname === "/api/admin/auth/login") && request.method === "POST") {
          return withCors(await loginAdmin(request, env));
        }
        if (url.pathname === "/api/leads" && request.method === "POST") {
          return withCors(await createLead(request, env));
        }
        if (url.pathname === "/api/jobs/request" && request.method === "POST") {
          return withCors(await createLead(request, env, "customer_request"));
        }
        if (url.pathname === "/api/specialists/apply" && request.method === "POST") {
          return withCors(await createLead(request, env, "specialist_application"));
        }
        if (url.pathname === "/api/customers/register-interest" && request.method === "POST") {
          return withCors(await createLead(request, env, "club_hogar_interest"));
        }
        if ((url.pathname === "/api/companies/request" || url.pathname === "/api/companies/lead") && request.method === "POST") {
          return withCors(await createLead(request, env, "company_request"));
        }
        if ((url.pathname === "/api/bookings/request" || url.pathname === "/api/service-requests/create") && request.method === "POST") {
          return withCors(await createLead(request, env, "booking_request"));
        }
        if (url.pathname === "/api/conversion-events/create" && request.method === "POST") {
          return withCors(await createConversionEvent(request, env));
        }
        if (url.pathname === "/api/quotes/virtual/create" && request.method === "POST") {
          return withCors(await createVirtualQuoteRequest(request, env));
        }
        if (url.pathname === "/api/contact" && request.method === "POST") {
          return withCors(await createLead(request, env, "contact_message"));
        }
        if (url.pathname === "/api/specialists" && request.method === "GET") {
          return withCors(await listPublicSpecialists(request, env));
        }
        if (url.pathname === "/api/admin/leads" && request.method === "GET") {
          return withCors(await listAdminLeads(request, env));
        }
        const crmRoute = matchAdminCrmRoute(url.pathname, request.method);
        if (crmRoute) {
          return withCors(await handleAdminCrmRoute(request, env, crmRoute));
        }
        if (url.pathname === "/api/admin/specialist-applications" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "specialist_applications"));
        }
        if (url.pathname === "/api/admin/specialists" && request.method === "GET") {
          return withCors(await listAdminSpecialists(request, env));
        }
        if (url.pathname === "/api/admin/customer-leads" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "customer_leads"));
        }
        if (url.pathname === "/api/admin/company-leads" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "company_leads"));
        }
        if (url.pathname === "/api/admin/service-requests" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "service_requests"));
        }
        if (url.pathname === "/api/admin/virtual-quotes" && request.method === "GET") {
          return withCors(await listAdminVirtualQuotes(request, env));
        }
        if (url.pathname === "/api/admin/payments" && request.method === "GET") {
          return withCors(await listAdminOperationalTable(request, env, "payment_intents", "paymentIntents"));
        }
        if (url.pathname === "/api/admin/credits" && request.method === "GET") {
          return withCors(await listAdminOperationalTable(request, env, "credit_wallets", "wallets"));
        }
        if (url.pathname === "/api/admin/payouts" && request.method === "GET") {
          return withCors(await listAdminOperationalTable(request, env, "specialist_payouts", "payouts"));
        }
        if (url.pathname === "/api/admin/security" && request.method === "GET") {
          return withCors(await listAdminSecurityEvents(request, env));
        }
        if (url.pathname === "/api/admin/conversion-events" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "conversion_events"));
        }
        const statusMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
        if (statusMatch && request.method === "PATCH") {
          return withCors(await updateAdminLeadStatus(request, env, statusMatch[1]));
        }
        const statusAliasMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/update-status$/);
        if (statusAliasMatch && (request.method === "POST" || request.method === "PATCH")) {
          return withCors(await updateAdminLeadStatus(request, env, statusAliasMatch[1]));
        }
        const specialistActionMatch = url.pathname.match(/^\/api\/admin\/specialist-applications\/([^/]+)\/(approve|reject|request-more-info)$/);
        if (specialistActionMatch && request.method === "POST") {
          return withCors(await updateSpecialistApplicationStatus(request, env, specialistActionMatch[1], specialistActionMatch[2]));
        }
        const adminSpecialistActionMatch = url.pathname.match(/^\/api\/admin\/specialists\/([^/]+)\/(approve|reject|publish|suspend|request-more-info)$/);
        if (adminSpecialistActionMatch && request.method === "POST") {
          return withCors(await updateAdminSpecialistStatus(request, env, adminSpecialistActionMatch[1], adminSpecialistActionMatch[2]));
        }
        const adminVirtualQuoteStatusMatch = url.pathname.match(/^\/api\/admin\/virtual-quotes\/([^/]+)\/update-status$/);
        if (adminVirtualQuoteStatusMatch && (request.method === "POST" || request.method === "PATCH")) {
          return withCors(await updateVirtualQuoteStatus(request, env, adminVirtualQuoteStatusMatch[1], "admin"));
        }
        const virtualQuoteDetailMatch = url.pathname.match(/^\/api\/quotes\/virtual\/([^/]+)$/);
        if (virtualQuoteDetailMatch && request.method === "GET") {
          return withCors(await getVirtualQuoteRequest(env, virtualQuoteDetailMatch[1]));
        }
        const virtualQuoteActionMatch = url.pathname.match(/^\/api\/quotes\/virtual\/([^/]+)\/(message|offer|approve|reject|request-more-info)$/);
        if (virtualQuoteActionMatch && request.method === "POST") {
          return withCors(await handleVirtualQuoteAction(request, env, virtualQuoteActionMatch[1], virtualQuoteActionMatch[2]));
        }
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
          const auth = await requireAdmin(request, env);
          if (auth) return withCors(auth);
          return withCors(await addCredits(request, env));
        }
        if (url.pathname === "/api/credits/use" && request.method === "POST") {
          const auth = await requireAdmin(request, env);
          if (auth) return withCors(auth);
          return withCors(await useCredits(request, env));
        }
        if (url.pathname === "/api/credits/wallet" && request.method === "GET") {
          return withCors(await getWallet(url, env));
        }
        if (url.pathname === "/api/admin/payments/reconcile" && request.method === "POST") {
          const auth = await requireAdmin(request, env);
          if (auth) return withCors(auth);
          return withCors(await reconcilePayments(request));
        }

        return withCors(json({ ok: false, error: "endpoint_not_found" }, 404));
      } catch (error) {
        const safeError = error instanceof SafeHttpError ? error : null;
        return withCors(
          json(
            {
              ok: false,
              error: safeError?.code ?? "internal_error",
            },
            safeError?.status ?? 500,
          ),
        );
      }
    }

    if (/^\/especialistas\/[^/]+\/?$/.test(url.pathname)) {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = "/especialistas/perfil-publico";
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return withSecurityHeaders(assetResponse);
    return withSecurityHeaders(assetResponse);
  },
};

async function loginAdmin(request: Request, env: Env) {
  const body = await readJsonBody<{ email?: string; password?: string }>(request);
  const email = sanitizeEmail(body.email);
  const password = sanitizeText(body.password, 400) ?? "";
  await enforceRateLimit(request, "admin_login", { email, limit: 8, windowMs: 60 * 60 * 1000 });

  const configuredEmail = sanitizeEmail(env.ADMIN_LOGIN_EMAIL);
  const configuredSecret = env.ADMIN_LOGIN_SECRET ?? "";
  const sessionSecret = env.ADMIN_SESSION_SECRET ?? env.ADMIN_TOKEN ?? env.ADMIN_API_TOKEN ?? "";

  if (!configuredEmail || !configuredSecret || !sessionSecret) {
    return json({ ok: false, error: "admin_login_not_configured" }, 503);
  }
  if (!email || !password) return json({ ok: false, error: "missing_credentials" }, 400);
  if (!timingSafeEqual(email, configuredEmail) || !timingSafeEqual(password, configuredSecret)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 8 * 60 * 60 * 1000);
  const cookie = await createAdminSessionCookie(
    {
      role: "admin",
      email: configuredEmail,
      iat: Math.floor(issuedAt.getTime() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    sessionSecret,
  );
  const response = json({
    ok: true,
    role: "admin",
    email: configuredEmail,
    name: "Administrador OficiosPro",
    expiresAt: expiresAt.toISOString(),
  });
  response.headers.append("Set-Cookie", cookie);
  return response;
}

async function createLead(request: Request, env: Env, forcedType?: LeadType) {
  const body = await readLeadPayload(request);
  if (body.honeypot || body.website || body.companySite) return json({ ok: false, error: "spam_rejected" }, 400);

  const leadType = forcedType ?? body.leadType;
  if (!leadType || !isLeadType(leadType)) return json({ ok: false, error: "invalid_lead_type" }, 400);
  await enforceRateLimit(request, `lead:${leadType}`, { email: body.email, phone: body.phone, limit: leadType === "specialist_application" ? 5 : 10, windowMs: 60 * 60 * 1000 });
  validateLeadPayload(body, leadType);
  const suspiciousFastSubmit = typeof body.formElapsedMs === "number" && body.formElapsedMs > 0 && body.formElapsedMs < 2000;
  const normalizedBody = suspiciousFastSubmit
    ? {
        ...body,
        payload: {
          ...(body.payload ?? {}),
          spamSignals: ["fast_submit_under_2s"],
        },
      }
    : body;

  const lead = normalizeLead(normalizedBody, leadType, request.headers.get("user-agent") ?? "");
  const stored = Boolean(env.DB);
  if (env.DB) {
    await insertLead(env.DB, lead);
    await insertOperationalRecord(env.DB, lead);
  }

  const emailResult = await notifyLead(env, lead);
  if (env.DB && (emailResult.sent || emailResult.error)) {
    await env.DB.prepare("UPDATE lead_submissions SET email_sent = ?, email_error = ? WHERE id = ?")
      .bind(emailResult.sent ? 1 : 0, emailResult.error ?? null, lead.id)
      .run();
    await bestEffortEmailDeliveryLog(env.DB, {
      template: `lead_${lead.leadType}`,
      recipient: env.NOTIFICATION_TO_EMAIL ?? env.LEADS_TO_EMAIL ?? "bperez@oficiospro.cl",
      relatedEntityType: "lead_submission",
      relatedEntityId: lead.id,
      status: emailResult.sent ? "sent" : "failed",
      error: emailResult.error,
    });
    if (emailResult.error === "email_pending_configuration") {
      await insertConversionEventRecord(env.DB, {
        type: "email_pending_configuration",
        source: lead.leadType,
        page: lead.sourcePage ?? "",
        payloadJson: JSON.stringify({ leadId: lead.id, leadType: lead.leadType }),
      });
    }
  }

  return json({
    ok: true,
    id: lead.id,
    stored,
    emailSent: emailResult.sent,
    emailError: emailResult.error ?? undefined,
    error: stored ? undefined : "database_not_configured",
  });
}

async function listAdminLeads(request: Request, env: Env) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const status = sanitizeText(url.searchParams.get("status") ?? "", 40);
  const leadType = sanitizeText(url.searchParams.get("leadType") ?? "", 40);
  const regionCode = sanitizeText(url.searchParams.get("regionCode") ?? "", 40);
  const communeCode = sanitizeText(url.searchParams.get("communeCode") ?? "", 40);
  const communeName = sanitizeText(url.searchParams.get("communeName") ?? "", 120);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);

  let query = "SELECT * FROM lead_submissions";
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }
  if (leadType) {
    conditions.push("lead_type = ?");
    values.push(leadType);
  }
  if (regionCode) {
    conditions.push("region_code = ?");
    values.push(regionCode);
  }
  if (communeCode) {
    conditions.push("commune_code = ?");
    values.push(communeCode);
  }
  if (communeName) {
    conditions.push("commune_name = ?");
    values.push(communeName);
  }
  if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;
  query += " ORDER BY created_at DESC LIMIT ?";
  values.push(limit);

  const result = await env.DB.prepare(query).bind(...values).all();
  return json({ ok: true, leads: result.results ?? [] });
}

async function updateAdminLeadStatus(request: Request, env: Env, leadId: string) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const body = (await request.json().catch(() => ({}))) as { status?: string; priority?: string };
  const status = sanitizeText(body.status ?? "", 40);
  const priority = sanitizeText(body.priority ?? "", 30);
  if (!status && !priority) return json({ ok: false, error: "missing_status_or_priority" }, 400);

  const current = await env.DB.prepare("SELECT id FROM lead_submissions WHERE id = ?").bind(leadId).first();
  if (!current) return json({ ok: false, error: "lead_not_found" }, 404);

  if (status && priority) {
    await env.DB.prepare("UPDATE lead_submissions SET status = ?, priority = ? WHERE id = ?").bind(status, priority, leadId).run();
  } else if (status) {
    await env.DB.prepare("UPDATE lead_submissions SET status = ? WHERE id = ?").bind(status, leadId).run();
  } else {
    await env.DB.prepare("UPDATE lead_submissions SET priority = ? WHERE id = ?").bind(priority, leadId).run();
  }

  return json({ ok: true, id: leadId, status: status || undefined, priority: priority || undefined });
}

async function listAdminTable(request: Request, env: Env, table: "specialist_applications" | "customer_leads" | "company_leads" | "service_requests" | "conversion_events") {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const status = sanitizeText(url.searchParams.get("status") ?? "", 40);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  const orderColumn = "createdAt";
  const values: unknown[] = [];
  let query = `SELECT * FROM ${table}`;
  if (status && table !== "conversion_events") {
    query += " WHERE status = ?";
    values.push(status);
  }
  query += ` ORDER BY ${orderColumn} DESC LIMIT ?`;
  values.push(limit);
  const result = await env.DB.prepare(query).bind(...values).all();
  const key = tableToResponseKey(table);
  return json({ ok: true, [key]: result.results ?? [] });
}

async function listAdminOperationalTable(request: Request, env: Env, table: "payment_intents" | "credit_wallets" | "specialist_payouts", responseKey: string) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const status = sanitizeText(url.searchParams.get("status") ?? "", 40);
  const q = sanitizeText(url.searchParams.get("q") ?? "", 120);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const values: unknown[] = [];
  const filters: string[] = [];

  if (status && table !== "credit_wallets") {
    filters.push("status = ?");
    values.push(status);
  }
  if (q) {
    if (table === "payment_intents") filters.push("(id LIKE ? OR userId LIKE ? OR externalPaymentId LIKE ?)");
    if (table === "credit_wallets") filters.push("(id LIKE ? OR userId LIKE ?)");
    if (table === "specialist_payouts") filters.push("(id LIKE ? OR specialistId LIKE ? OR serviceRequestId LIKE ?)");
    const pattern = `%${q}%`;
    values.push(...(table === "credit_wallets" ? [pattern, pattern] : [pattern, pattern, pattern]));
  }

  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const orderColumn = table === "credit_wallets" ? "updatedAt" : "createdAt";
  try {
    const result = await env.DB.prepare(`SELECT * FROM ${table}${where} ORDER BY ${orderColumn} DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
    return json({ ok: true, [responseKey]: result.results ?? [], limit, offset });
  } catch {
    return json({ ok: false, error: "operational_tables_not_ready" }, 503);
  }
}

async function listAdminSecurityEvents(request: Request, env: Env) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  try {
    const [webhooks, audits, rateLimits] = await Promise.all([
      env.DB.prepare("SELECT * FROM webhook_events ORDER BY receivedAt DESC LIMIT ?").bind(limit).all(),
      env.DB.prepare("SELECT * FROM admin_audit_log ORDER BY createdAt DESC LIMIT ?").bind(limit).all(),
      env.DB.prepare("SELECT * FROM rate_limit_events ORDER BY createdAt DESC LIMIT ?").bind(limit).all(),
    ]);
    return json({
      ok: true,
      securityEvents: [...(webhooks.results ?? []), ...(audits.results ?? []), ...(rateLimits.results ?? [])],
      webhookEvents: webhooks.results ?? [],
      auditLog: audits.results ?? [],
      rateLimitEvents: rateLimits.results ?? [],
      limit,
    });
  } catch {
    return json({ ok: false, error: "operational_tables_not_ready" }, 503);
  }
}

async function updateSpecialistApplicationStatus(request: Request, env: Env, id: string, action: string) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const status = action === "approve" ? "published" : action === "reject" ? "rejected" : "more_info";
  const current = await env.DB.prepare("SELECT * FROM specialist_applications WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!current) return json({ ok: false, error: "specialist_application_not_found" }, 404);
  if (action === "approve") {
    const missing = specialistWorkerMissingRequirements(current);
    if (missing.length) return json({ ok: false, error: "specialist_publication_incomplete", missing }, 422);
  }

  const updatedAt = new Date().toISOString();
  await env.DB.prepare("UPDATE specialist_applications SET status = ?, publicationStatus = ?, approvedAt = COALESCE(approvedAt, ?), publishedAt = CASE WHEN ? = 'published' THEN COALESCE(publishedAt, ?) ELSE publishedAt END, updatedAt = ? WHERE id = ?")
    .bind(status, status, updatedAt, status, updatedAt, updatedAt, id)
    .run();
  const leadId = String(current.leadSubmissionId || id);
  await env.DB.prepare("UPDATE lead_submissions SET status = ? WHERE id = ?").bind(status, leadId).run();
  await insertConversionEventRecord(env.DB, {
    type: `specialist_${status}`,
    source: "admin",
    page: "/admin",
    payloadJson: JSON.stringify({ specialistApplicationId: id, leadId }),
  });

  return json({ ok: true, id, status });
}

async function listAdminSpecialists(request: Request, env: Env) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const status = sanitizeText(url.searchParams.get("status") ?? "", 40);
  const q = sanitizeText(url.searchParams.get("q") ?? "", 120);
  const commune = sanitizeText(url.searchParams.get("commune") ?? "", 120);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const values: unknown[] = [];
  const filters: string[] = [];

  if (status) {
    filters.push("(status = ? OR publicationStatus = ?)");
    values.push(status, status);
  }
  if (q) {
    filters.push("(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR serviceTypes LIKE ? OR specialties LIKE ?)");
    const pattern = `%${q}%`;
    values.push(pattern, pattern, pattern, pattern, pattern);
  }
  if (commune) {
    filters.push("comuna LIKE ?");
    values.push(`%${commune}%`);
  }

  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await env.DB.prepare(`SELECT * FROM specialist_applications${where} ORDER BY updatedAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, specialists: result.results ?? [], limit, offset });
}

async function updateAdminSpecialistStatus(request: Request, env: Env, id: string, action: string) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const current = await env.DB.prepare("SELECT * FROM specialist_applications WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!current) return json({ ok: false, error: "specialist_application_not_found" }, 404);

  const now = new Date().toISOString();
  const next = specialistStatusForAdminAction(action);
  if (action === "publish") {
    const missing = specialistWorkerMissingRequirements(current);
    if (missing.length) return json({ ok: false, error: "specialist_publication_incomplete", missing }, 422);
  }

  await env.DB.prepare(
    `UPDATE specialist_applications
     SET status = ?, publicationStatus = ?, approvedAt = CASE WHEN ? = 'approved' THEN COALESCE(approvedAt, ?) ELSE approvedAt END,
         publishedAt = CASE WHEN ? = 'published' THEN COALESCE(publishedAt, ?) ELSE publishedAt END,
         suspendedAt = CASE WHEN ? = 'suspended' THEN ? ELSE suspendedAt END,
         updatedAt = ?
     WHERE id = ?`,
  )
    .bind(next.status, next.publicationStatus, next.status, now, next.publicationStatus, now, next.publicationStatus, now, now, id)
    .run();

  await bestEffortAdminAudit(env.DB, request, {
    action: `specialist_${action}`,
    entityType: "specialist_application",
    entityId: id,
    beforeJson: JSON.stringify(redactSensitive(current)),
    afterJson: JSON.stringify({ status: next.status, publicationStatus: next.publicationStatus }),
  });

  return json({ ok: true, id, status: next.status, publicationStatus: next.publicationStatus });
}

function specialistStatusForAdminAction(action: string) {
  if (action === "approve") return { status: "approved", publicationStatus: "approved" };
  if (action === "publish") return { status: "published", publicationStatus: "published" };
  if (action === "suspend") return { status: "suspended", publicationStatus: "suspended" };
  if (action === "reject") return { status: "rejected", publicationStatus: "rejected" };
  return { status: "more_info", publicationStatus: "more_info" };
}

async function createConversionEvent(request: Request, env: Env) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  await enforceRateLimit(request, "conversion_event", { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!env.DB) return json({ ok: true, stored: false, error: "database_not_configured" });

  const event = {
    type: sanitizeText(body.type, 120) ?? "conversion_event",
    source: sanitizeText(body.source ?? body.sourceButton ?? body.sourceComponent, 200) ?? "",
    page: sanitizeText(body.page, 240) ?? "",
    payloadJson: JSON.stringify(sanitizePayloadObject(body.payload ?? body.data ?? {})),
  };
  const id = await insertConversionEventRecord(env.DB, event);
  return json({ ok: true, id, stored: true });
}

async function createVirtualQuoteRequest(request: Request, env: Env) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  await enforceRateLimit(request, "virtual_quote:create", { email: textFrom(body.customerEmail), phone: textFrom(body.customerPhone), limit: 8, windowMs: 60 * 60 * 1000 });
  if (!env.DB) return json({ ok: false, stored: false, error: "database_not_configured" }, 503);

  const description = sanitizeText(body.description, 3000);
  const commune = sanitizeText(body.commune, 140);
  if (!description || !commune) throw new SafeHttpError(400, "validation_error");

  const now = new Date().toISOString();
  const id = `vq_${crypto.randomUUID()}`;
  const status = "pendiente_revision";
  const payloadJson = JSON.stringify(redactSensitive(sanitizePayloadObject(body)));
  try {
    await env.DB
      .prepare(
        `INSERT INTO virtual_quote_requests (
          id, customerId, customerName, customerEmail, customerPhone, specialistId, specialistName, serviceId, cartItemId,
          categoryId, specialty, serviceName, problemTitle, description, locationDetail, commune, region, urgency, status,
          attachmentCount, videoReference, additionalComments, payloadJson, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        sanitizeText(body.customerId, 160) ?? null,
        sanitizeText(body.customerName, 180) ?? null,
        sanitizeEmail(textFrom(body.customerEmail)) ?? null,
        sanitizeText(body.customerPhone, 60) ?? null,
        sanitizeText(body.specialistId, 140) ?? null,
        sanitizeText(body.specialistName, 180) ?? null,
        sanitizeText(body.serviceId, 140) ?? null,
        sanitizeText(body.cartItemId, 220) ?? null,
        sanitizeText(body.categoryId, 120) ?? null,
        sanitizeText(body.specialty, 180) ?? null,
        sanitizeText(body.serviceName, 220) ?? null,
        sanitizeText(body.problemTitle, 220) ?? null,
        description,
        sanitizeText(body.locationDetail, 400) ?? null,
        commune,
        sanitizeText(body.region, 140) ?? null,
        sanitizeText(body.urgency, 40) || "flexible",
        status,
        numberFrom(body.attachmentCount),
        sanitizeText(body.videoReference, 400) ?? null,
        sanitizeText(body.additionalComments, 1200) ?? null,
        payloadJson,
        now,
        now,
      )
      .run();

    await insertVirtualQuoteMessage(env.DB, id, "customer", sanitizeText(body.customerId, 160) ?? "", description);
    await insertConversionEventRecord(env.DB, {
      type: "virtual_quote_created",
      source: "bolsa",
      page: "/bolsa",
      payloadJson: JSON.stringify({ id, specialistId: sanitizeText(body.specialistId, 140), serviceId: sanitizeText(body.serviceId, 140), commune }),
    });
  } catch (error) {
    const message = String(error);
    if (message.includes("no such table") || message.includes("no such column")) {
      return json({ ok: false, stored: false, error: "virtual_quote_schema_not_ready" }, 503);
    }
    throw error;
  }
  return json({ ok: true, id, status, stored: true });
}

async function getVirtualQuoteRequest(env: Env, id: string) {
  if (!env.DB) return json({ ok: false, stored: false, error: "database_not_configured" }, 503);
  const quote = await env.DB.prepare("SELECT * FROM virtual_quote_requests WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!quote) return json({ ok: false, error: "virtual_quote_not_found" }, 404);
  const messages = await env.DB.prepare("SELECT * FROM virtual_quote_messages WHERE quoteRequestId = ? ORDER BY createdAt DESC").bind(id).all();
  const offers = await env.DB.prepare("SELECT * FROM virtual_quote_offers WHERE quoteRequestId = ? ORDER BY createdAt DESC").bind(id).all();
  return json({ ok: true, quote, messages: messages.results ?? [], offers: offers.results ?? [], stored: true });
}

async function listAdminVirtualQuotes(request: Request, env: Env) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  const url = new URL(request.url);
  const q = sanitizeText(url.searchParams.get("q") ?? "", 180);
  const status = sanitizeText(url.searchParams.get("status") ?? "", 60);
  const commune = sanitizeText(url.searchParams.get("commune") ?? "", 140);
  const specialist = sanitizeText(url.searchParams.get("specialist") ?? "", 160);
  const urgency = sanitizeText(url.searchParams.get("urgency") ?? "", 60);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const values: unknown[] = [];
  const filters: string[] = [];
  if (q) {
    filters.push("(id LIKE ? OR customerName LIKE ? OR customerEmail LIKE ? OR serviceName LIKE ? OR description LIKE ?)");
    values.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status) {
    filters.push("status = ?");
    values.push(status);
  }
  if (commune) {
    filters.push("commune LIKE ?");
    values.push(`%${commune}%`);
  }
  if (specialist) {
    filters.push("(specialistId LIKE ? OR specialistName LIKE ?)");
    values.push(`%${specialist}%`, `%${specialist}%`);
  }
  if (urgency) {
    filters.push("urgency = ?");
    values.push(urgency);
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await env.DB.prepare(`SELECT * FROM virtual_quote_requests${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, virtualQuotes: result.results ?? [], limit, offset });
}

async function handleVirtualQuoteAction(request: Request, env: Env, id: string, action: string) {
  if (!env.DB) return json({ ok: false, stored: false, error: "database_not_configured" }, 503);
  if (action === "message") {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const message = sanitizeText(body.message, 2000);
    if (!message) throw new SafeHttpError(400, "missing_required_fields");
    await insertVirtualQuoteMessage(env.DB, id, sanitizeText(body.senderRole, 40) || "customer", sanitizeText(body.senderId, 160) ?? "", message);
    return json({ ok: true, id, stored: true });
  }
  if (action === "offer") return createVirtualQuoteOffer(request, env, id);
  if (action === "approve") return updateVirtualQuoteStatus(request, env, id, "aprobada_cliente");
  if (action === "reject") return updateVirtualQuoteStatus(request, env, id, "rechazada_cliente");
  if (action === "request-more-info") return updateVirtualQuoteStatus(request, env, id, "necesita_mas_info");
  return json({ ok: false, error: "invalid_virtual_quote_action" }, 400);
}

async function createVirtualQuoteOffer(request: Request, env: Env, id: string) {
  if (!env.DB) return json({ ok: false, stored: false, error: "database_not_configured" }, 503);
  const body = await readJsonBody<Record<string, unknown>>(request);
  const pricingMode = sanitizeText(body.pricingMode, 60) || "fixed";
  const now = new Date().toISOString();
  const offerId = `vqo_${crypto.randomUUID()}`;
  await env.DB
    .prepare(
      `INSERT INTO virtual_quote_offers (
        id, quoteRequestId, specialistId, pricingMode, creditPrice, minCredits, maxCredits, estimatedDuration,
        materialsIncluded, materialsExcluded, conditions, requiresVisit, comment, status, expiresAt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      offerId,
      id,
      sanitizeText(body.specialistId, 140),
      pricingMode,
      numberFrom(body.creditPrice),
      numberFrom(body.minCredits),
      numberFrom(body.maxCredits),
      sanitizeText(body.estimatedDuration, 180),
      sanitizeText(body.materialsIncluded, 1000),
      sanitizeText(body.materialsExcluded, 1000),
      sanitizeText(body.conditions, 1200),
      body.requiresVisit ? 1 : 0,
      sanitizeText(body.comment, 1500),
      pricingMode === "visit_then_quote" ? "visita_recomendada" : "cotizacion_enviada",
      sanitizeText(body.expiresAt, 80),
      now,
    )
    .run();
  const status = pricingMode === "visit_then_quote" ? "visita_recomendada" : "cotizacion_enviada";
  await env.DB.prepare("UPDATE virtual_quote_requests SET status = ?, updatedAt = ? WHERE id = ?").bind(status, now, id).run();
  await insertVirtualQuoteMessage(env.DB, id, "specialist", sanitizeText(body.specialistId, 140) ?? "", sanitizeText(body.comment, 1500) || "Propuesta enviada.");
  return json({ ok: true, id, offerId, status, stored: true });
}

async function updateVirtualQuoteStatus(request: Request, env: Env, id: string, statusOrSource: string) {
  if (!env.DB) return json({ ok: false, stored: false, error: "database_not_configured" }, 503);
  const body = request.method === "GET" ? {} : await readJsonBody<Record<string, unknown>>(request).catch(() => ({}));
  const status = statusOrSource === "admin" ? sanitizeText(body.status, 80) : statusOrSource;
  if (!status) throw new SafeHttpError(400, "missing_status");
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE virtual_quote_requests SET status = ?, updatedAt = ? WHERE id = ?").bind(status, now, id).run();
  const message = sanitizeText(body.message, 1200);
  if (message) await insertVirtualQuoteMessage(env.DB, id, statusOrSource === "admin" ? "admin" : "customer", sanitizeText(body.senderId, 160) ?? "", message);
  return json({ ok: true, id, status, stored: true });
}

async function insertVirtualQuoteMessage(db: D1Database, quoteRequestId: string, senderRole: string, senderId: string, message: string) {
  await db
    .prepare("INSERT INTO virtual_quote_messages (id, quoteRequestId, senderRole, senderId, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(`vqm_${crypto.randomUUID()}`, quoteRequestId, senderRole, senderId, message, new Date().toISOString())
    .run();
}

async function listPublicSpecialists(request: Request, env: Env) {
  if (!env.DB) return json({ ok: true, specialists: [], stored: false, error: "database_not_configured" });
  const url = new URL(request.url);
  const category = sanitizeText(url.searchParams.get("category") ?? "", 80);
  const specialty = sanitizeText(url.searchParams.get("specialty") ?? "", 120);
  const region = sanitizeText(url.searchParams.get("region") ?? url.searchParams.get("regionCode") ?? "", 120);
  const commune = sanitizeText(url.searchParams.get("commune") ?? url.searchParams.get("communeName") ?? "", 120);
  const status = sanitizeText(url.searchParams.get("status") ?? "published", 40) || "published";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 100), 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const values: unknown[] = [status];
  const filters = ["publicationStatus = ?", "status NOT IN ('deleted', 'suspended', 'unpublished', 'rejected')"];

  if (category) {
    filters.push("(serviceTypes LIKE ? OR payloadJson LIKE ?)");
    values.push(`%${category}%`, `%${category}%`);
  }
  if (specialty) {
    filters.push("(specialties LIKE ? OR servicesOffered LIKE ? OR payloadJson LIKE ?)");
    values.push(`%${specialty}%`, `%${specialty}%`, `%${specialty}%`);
  }
  if (region) {
    filters.push("(region LIKE ? OR payloadJson LIKE ?)");
    values.push(`%${region}%`, `%${region}%`);
  }
  if (commune) {
    filters.push("(comuna LIKE ? OR payloadJson LIKE ?)");
    values.push(`%${commune}%`, `%${commune}%`);
  }

  const query = `SELECT * FROM specialist_applications WHERE ${filters.join(" AND ")} ORDER BY updatedAt DESC LIMIT ? OFFSET ?`;
  const result = await env.DB.prepare(query).bind(...values, limit, offset).all();
  return json({ ok: true, specialists: (result.results ?? []).map(toPublicSpecialist), stored: true, limit, offset });
}

async function authorizeAdmin(request: Request, env: Env) {
  return requireAdmin(request, env);
}

type AdminCrmRoute = {
  resource: "overview" | "work-queue" | "reports" | "opportunities" | "tasks" | "notes" | "activity" | "contacts" | "companies" | "sync-leads" | "sync-specialists" | "sync-virtual-quotes" | "cleanup-test-data";
  method: string;
  id?: string;
};

function matchAdminCrmRoute(pathname: string, method: string): AdminCrmRoute | null {
  const base = "/api/admin/crm";
  if (!pathname.startsWith(base)) return null;
  const rest = pathname.slice(base.length).replace(/^\/+/, "");
  if (!rest) return { resource: "overview", method };
  const parts = rest.split("/");
  const resource = parts[0] as AdminCrmRoute["resource"];
  if (!["overview", "work-queue", "reports", "opportunities", "tasks", "notes", "activity", "contacts", "companies", "sync-leads", "sync-specialists", "sync-virtual-quotes", "cleanup-test-data"].includes(resource)) return null;
  return { resource, method, id: parts[1] ? decodeURIComponent(parts[1]) : undefined };
}

async function handleAdminCrmRoute(request: Request, env: Env, route: AdminCrmRoute) {
  const auth = await authorizeAdmin(request, env);
  if (auth) return auth;
  if (!env.DB) return json({ ok: false, error: "database_not_configured" }, 503);

  try {
    if (route.resource === "overview" && route.method === "GET") return listCrmOverview(request, env.DB);
    if (route.resource === "work-queue" && route.method === "GET") return listCrmWorkQueue(request, env.DB);
    if (route.resource === "reports" && route.method === "GET") return listCrmReports(request, env.DB);
    if (route.resource === "opportunities" && route.method === "GET" && !route.id) return listCrmOpportunities(request, env.DB);
    if (route.resource === "opportunities" && route.method === "POST" && !route.id) return createCrmOpportunity(request, env.DB);
    if (route.resource === "opportunities" && route.method === "GET" && route.id) return getCrmOpportunity(request, env.DB, route.id);
    if (route.resource === "opportunities" && route.method === "PATCH" && route.id) return patchCrmOpportunity(request, env.DB, route.id);
    if (route.resource === "tasks" && route.method === "GET" && !route.id) return listCrmTasks(request, env.DB);
    if (route.resource === "tasks" && route.method === "POST" && !route.id) return createCrmTask(request, env.DB);
    if (route.resource === "tasks" && route.method === "PATCH" && route.id) return patchCrmTask(request, env.DB, route.id);
    if (route.resource === "notes" && route.method === "GET") return listCrmNotes(request, env.DB);
    if (route.resource === "notes" && route.method === "POST") return createCrmNote(request, env.DB);
    if (route.resource === "activity" && route.method === "GET") return listCrmActivity(request, env.DB);
    if (route.resource === "contacts" && route.method === "GET") return listCrmContacts(request, env.DB);
    if (route.resource === "companies" && route.method === "GET") return listCrmCompanies(request, env.DB);
    if (route.resource === "sync-leads" && route.method === "POST") return syncCrmLeads(request, env.DB);
    if (route.resource === "sync-specialists" && route.method === "POST") return syncCrmSpecialists(request, env.DB);
    if (route.resource === "sync-virtual-quotes" && route.method === "POST") return syncCrmVirtualQuotes(request, env.DB);
    if (route.resource === "cleanup-test-data" && route.method === "POST") return cleanupCrmTestData(request, env.DB);
    return json({ ok: false, error: "endpoint_not_found" }, 404);
  } catch (error) {
    const message = String(error);
    if (message.includes("no such table")) return json({ ok: false, error: "crm_tables_not_ready" }, 503);
    if (message.includes("no such column")) return json({ ok: false, error: "crm_schema_not_ready" }, 503);
    throw error;
  }
}

async function listCrmOverview(request: Request, db: D1Database) {
  const now = new Date().toISOString();
  const [
    newLeads,
    pendingSpecialists,
    pendingVirtualQuotes,
    overdueTasks,
    newCompanies,
    paymentIssues,
    openOpportunities,
    pipelineRows,
    savedViews,
  ] = await Promise.all([
    countCrm(db, "crm_opportunities", "pipeline = ? AND stage = ? AND status != ?", ["clientes", "nuevo", "closed"]),
    countCrm(db, "crm_opportunities", "pipeline = ? AND status != ?", ["especialistas", "closed"]),
    countCrm(db, "crm_opportunities", "pipeline = ? AND status != ?", ["cotizaciones_virtuales", "closed"]),
    countCrm(db, "crm_tasks", "status IN ('pending', 'in_progress') AND dueAt IS NOT NULL AND dueAt < ?", [now]),
    countCrm(db, "crm_companies", "status IN ('new', 'nuevo')", []),
    countCrm(db, "crm_opportunities", "pipeline = ? AND status != ?", ["pagos_creditos", "closed"]),
    countCrm(db, "crm_opportunities", "status != ?", ["closed"]),
    db.prepare("SELECT pipeline, COUNT(*) AS count FROM crm_opportunities WHERE status != 'closed' GROUP BY pipeline ORDER BY count DESC").all(),
    db.prepare("SELECT * FROM crm_saved_views ORDER BY name ASC").all(),
  ]);

  await crmActivity(db, request, { entityType: "crm", entityId: "overview", action: "crm_overview_viewed" });
  return json({
    ok: true,
    overview: {
      newLeads,
      pendingSpecialists,
      pendingVirtualQuotes,
      overdueTasks,
      newCompanies,
      paymentIssues,
      openOpportunities,
      opportunitiesByPipeline: pipelineRows.results ?? [],
      savedViews: savedViews.results ?? [],
    },
  });
}

async function listCrmWorkQueue(request: Request, db: D1Database) {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndIso = todayEnd.toISOString();
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") ?? 20), 1), 100);
  const [overdueTasks, dueTodayTasks, pendingQuotes, pendingSpecialists, newLeads, paymentIssues] = await Promise.all([
    db.prepare("SELECT * FROM crm_tasks WHERE status IN ('pending', 'in_progress') AND dueAt IS NOT NULL AND dueAt < ? ORDER BY dueAt ASC LIMIT ?").bind(nowIso, limit).all(),
    db.prepare("SELECT * FROM crm_tasks WHERE status IN ('pending', 'in_progress') AND dueAt IS NOT NULL AND dueAt >= ? AND dueAt <= ? ORDER BY dueAt ASC LIMIT ?").bind(nowIso, todayEndIso, limit).all(),
    db.prepare("SELECT * FROM crm_opportunities WHERE pipeline = ? AND status != ? ORDER BY updatedAt DESC LIMIT ?").bind("cotizaciones_virtuales", "closed", limit).all(),
    db.prepare("SELECT * FROM crm_opportunities WHERE pipeline = ? AND status != ? ORDER BY updatedAt DESC LIMIT ?").bind("especialistas", "closed", limit).all(),
    db.prepare("SELECT * FROM crm_opportunities WHERE pipeline = ? AND stage = ? AND status != ? ORDER BY createdAt DESC LIMIT ?").bind("clientes", "nuevo", "closed", limit).all(),
    db.prepare("SELECT * FROM crm_opportunities WHERE pipeline = ? AND status != ? ORDER BY updatedAt DESC LIMIT ?").bind("pagos_creditos", "closed", limit).all(),
  ]);
  const queue = [
    ...(overdueTasks.results ?? []).map((item) => ({ ...item, queueType: "overdue_task", recommendedAction: "Resolver tarea vencida" })),
    ...(pendingQuotes.results ?? []).map((item) => ({ ...item, queueType: "pending_quote", recommendedAction: "Revisar cotizacion virtual" })),
    ...(pendingSpecialists.results ?? []).map((item) => ({ ...item, queueType: "pending_specialist", recommendedAction: "Avanzar revision especialista" })),
    ...(newLeads.results ?? []).map((item) => ({ ...item, queueType: "new_lead", recommendedAction: "Contactar lead nuevo" })),
    ...(paymentIssues.results ?? []).map((item) => ({ ...item, queueType: "payment_issue", recommendedAction: "Revisar pago o creditos" })),
    ...(dueTodayTasks.results ?? []).map((item) => ({ ...item, queueType: "due_today_task", recommendedAction: "Completar tarea de hoy" })),
  ].slice(0, limit);
  await crmActivity(db, request, { entityType: "crm", entityId: "work-queue", action: "crm_work_queue_viewed" });
  return json({
    ok: true,
    queue,
    workQueue: queue,
    overdueTasks: overdueTasks.results ?? [],
    dueTodayTasks: dueTodayTasks.results ?? [],
    pendingQuotes: pendingQuotes.results ?? [],
    pendingSpecialists: pendingSpecialists.results ?? [],
    newLeads: newLeads.results ?? [],
    paymentIssues: paymentIssues.results ?? [],
    recommendedActions: queue.map((item) => ({ id: String((item as Record<string, unknown>).id ?? ""), action: String((item as Record<string, unknown>).recommendedAction ?? "") })),
  });
}

async function listCrmReports(request: Request, db: D1Database) {
  const [
    leadsByDay,
    opportunitiesByPipeline,
    tasksByStatus,
    quotesByStatus,
    specialistsByStage,
    openOpportunities,
    wonLostSummary,
  ] = await Promise.all([
    db.prepare("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM lead_submissions GROUP BY day ORDER BY day DESC LIMIT 30").all(),
    db.prepare("SELECT pipeline, stage, COUNT(*) AS count FROM crm_opportunities GROUP BY pipeline, stage ORDER BY count DESC").all(),
    db.prepare("SELECT status, COUNT(*) AS count FROM crm_tasks GROUP BY status ORDER BY count DESC").all(),
    db.prepare("SELECT status, COUNT(*) AS count FROM virtual_quote_requests GROUP BY status ORDER BY count DESC").all(),
    db.prepare("SELECT stage, COUNT(*) AS count FROM crm_opportunities WHERE pipeline = ? GROUP BY stage ORDER BY count DESC").bind("especialistas").all(),
    countCrm(db, "crm_opportunities", "status != ?", ["closed"]),
    db.prepare("SELECT status, COUNT(*) AS count FROM crm_opportunities WHERE status IN ('closed', 'open') GROUP BY status").all(),
  ]);
  await crmActivity(db, request, { entityType: "crm", entityId: "reports", action: "crm_reports_viewed" });
  return json({
    ok: true,
    reports: {
      leadsByDay: leadsByDay.results ?? [],
      opportunitiesByPipeline: opportunitiesByPipeline.results ?? [],
      tasksByStatus: tasksByStatus.results ?? [],
      quotesByStatus: quotesByStatus.results ?? [],
      specialistsByStage: specialistsByStage.results ?? [],
      responseTimeMetrics: { averageFirstResponseHours: null, source: "pending_instrumentation" },
      openOpportunities,
      wonLostSummary: wonLostSummary.results ?? [],
    },
  });
}

async function cleanupCrmTestData(request: Request, db: D1Database) {
  const hasJsonBody = (request.headers.get("content-type") ?? "").toLowerCase().includes("application/json");
  const body = hasJsonBody ? await readJsonBody<Record<string, unknown>>(request) : {};
  const dryRun = Boolean(body.dryRun);
  const deletions: Record<string, number> = {};

  for (const item of crmTestCleanupTargets()) {
    deletions[item.table] = await cleanupDelete(db, item.table, item.where, dryRun);
  }

  const total = Object.values(deletions).reduce((sum, count) => sum + count, 0);
  await crmActivity(db, request, {
    entityType: "crm",
    entityId: "cleanup-test-data",
    action: dryRun ? "crm_cleanup_test_data_preview" : "crm_cleanup_test_data",
    metadata: { total, deletions, dryRun },
  });

  return json({ ok: true, dryRun, deleted: deletions, total });
}

function crmTestCleanupTargets() {
  const lead = leadSubmissionTestWhere();
  const customerLead = customerLeadTestWhere();
  const companyLead = companyLeadTestWhere();
  const specialist = specialistApplicationTestWhere();
  const serviceRequest = serviceRequestTestWhere();
  const virtualQuote = virtualQuoteTestWhere();
  const contact = crmContactTestWhere();
  const company = crmCompanyTestWhere();
  const opportunity = crmOpportunityTestWhere();

  return [
    { table: "crm_notes", where: `entityId IN (SELECT id FROM crm_opportunities WHERE ${opportunity}) OR entityId IN (SELECT id FROM crm_contacts WHERE ${contact}) OR COALESCE(body, '') LIKE '%e2e_test%' OR COALESCE(body, '') LIKE '%testRunId%'` },
    { table: "crm_activity_log", where: `entityId IN (SELECT id FROM crm_opportunities WHERE ${opportunity}) OR entityId IN (SELECT id FROM crm_contacts WHERE ${contact}) OR COALESCE(metadataJson, '') LIKE '%e2e_test%' OR COALESCE(metadataJson, '') LIKE '%testRunId%'` },
    { table: "crm_status_history", where: `entityId IN (SELECT id FROM crm_opportunities WHERE ${opportunity}) OR entityId IN (SELECT id FROM crm_tasks WHERE ${crmTaskTestWhere()})` },
    { table: "crm_tasks", where: crmTaskTestWhere() },
    { table: "crm_opportunities", where: opportunity },
    { table: "crm_contacts", where: contact },
    { table: "crm_companies", where: company },
    { table: "virtual_quote_messages", where: `quoteRequestId IN (SELECT id FROM virtual_quote_requests WHERE ${virtualQuote})` },
    { table: "virtual_quote_offers", where: `quoteRequestId IN (SELECT id FROM virtual_quote_requests WHERE ${virtualQuote})` },
    { table: "virtual_quote_attachments", where: `quoteRequestId IN (SELECT id FROM virtual_quote_requests WHERE ${virtualQuote})` },
    { table: "virtual_quote_requests", where: virtualQuote },
    { table: "service_requests", where: serviceRequest },
    { table: "customer_leads", where: customerLead },
    { table: "company_leads", where: companyLead },
    { table: "specialist_applications", where: specialist },
    { table: "lead_submissions", where: lead },
    { table: "conversion_events", where: `COALESCE(source, '') LIKE '%e2e_test%' OR COALESCE(payloadJson, '') LIKE '%e2e_test%' OR COALESCE(payloadJson, '') LIKE '%testRunId%' OR COALESCE(type, '') LIKE '%script_test%'` },
  ];
}

async function cleanupDelete(db: D1Database, table: string, where: string, dryRun: boolean) {
  const count = await countCrm(db, table, where, []);
  if (!dryRun && count > 0) await db.prepare(`DELETE FROM ${table} WHERE ${where}`).run();
  return count;
}

function crmOpportunityTestWhere() {
  return [
    `sourceEntityId IN (SELECT id FROM lead_submissions WHERE ${leadSubmissionTestWhere()})`,
    `sourceEntityId IN (SELECT id FROM specialist_applications WHERE ${specialistApplicationTestWhere()})`,
    `sourceEntityId IN (SELECT id FROM company_leads WHERE ${companyLeadTestWhere()})`,
    `serviceRequestId IN (SELECT id FROM service_requests WHERE ${serviceRequestTestWhere()})`,
    `virtualQuoteId IN (SELECT id FROM virtual_quote_requests WHERE ${virtualQuoteTestWhere()})`,
    `contactId IN (SELECT id FROM crm_contacts WHERE ${crmContactTestWhere()})`,
    `companyId IN (SELECT id FROM crm_companies WHERE ${crmCompanyTestWhere()})`,
    `COALESCE(sourceEntityId, '') LIKE '%e2e_%'`,
  ].join(" OR ");
}

function crmTaskTestWhere() {
  return [
    `opportunityId IN (SELECT id FROM crm_opportunities WHERE ${crmOpportunityTestWhere()})`,
    `contactId IN (SELECT id FROM crm_contacts WHERE ${crmContactTestWhere()})`,
    `COALESCE(description, '') LIKE '%e2e_test%'`,
    `COALESCE(description, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function crmContactTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(source, '') LIKE '%e2e_test%'`,
    `COALESCE(tags, '') LIKE '%e2e_test%'`,
    `COALESCE(tags, '') LIKE '%testRunId:%'`,
  ].join(" OR ");
}

function crmCompanyTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(source, '') LIKE '%e2e_test%'`,
  ].join(" OR ");
}

function leadSubmissionTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(source_page, '') LIKE '%e2e_test%'`,
    `COALESCE(source_component, '') LIKE '%scripts/test-%'`,
    `COALESCE(source_button, '') LIKE '%crm_e2e%'`,
    `COALESCE(utm_source, '') = 'e2e_test'`,
    `COALESCE(payload_json, '') LIKE '%"isTest":true%'`,
    `COALESCE(payload_json, '') LIKE '%e2e_test%'`,
    `COALESCE(payload_json, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function customerLeadTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(source, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%"isTest":true%'`,
    `COALESCE(payloadJson, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function companyLeadTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(payloadJson, '') LIKE '%"isTest":true%'`,
    `COALESCE(payloadJson, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function specialistApplicationTestWhere() {
  return [
    `LOWER(COALESCE(email, '')) LIKE '%example.com%'`,
    `COALESCE(source, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%"isTest":true%'`,
    `COALESCE(payloadJson, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function serviceRequestTestWhere() {
  return [
    `LOWER(COALESCE(customerEmail, '')) LIKE '%example.com%'`,
    `COALESCE(payloadJson, '') LIKE '%"isTest":true%'`,
    `COALESCE(payloadJson, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

function virtualQuoteTestWhere() {
  return [
    `LOWER(COALESCE(customerEmail, '')) LIKE '%example.com%'`,
    `COALESCE(customerId, '') LIKE '%crm-e2e%'`,
    `COALESCE(payloadJson, '') LIKE '%"isTest":true%'`,
    `COALESCE(payloadJson, '') LIKE '%e2e_test%'`,
    `COALESCE(payloadJson, '') LIKE '%testRunId%'`,
  ].join(" OR ");
}

async function listCrmOpportunities(request: Request, db: D1Database) {
  const url = new URL(request.url);
  const { limit, offset } = crmPagination(url);
  const filters: string[] = [];
  const values: unknown[] = [];
  addCrmFilter(filters, values, "pipeline", url.searchParams.get("pipeline"));
  addCrmFilter(filters, values, "stage", url.searchParams.get("stage"));
  addCrmFilter(filters, values, "status", url.searchParams.get("status"));
  addCrmFilter(filters, values, "assignedTo", url.searchParams.get("assignedTo"));
  addCrmFilter(filters, values, "type", url.searchParams.get("type"));
  const search = sanitizeText(url.searchParams.get("search") ?? url.searchParams.get("q") ?? "", 120);
  if (search) {
    filters.push("(title LIKE ? OR assignedTo LIKE ? OR sourceEntityId LIKE ?)");
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const dateFrom = sanitizeText(url.searchParams.get("dateFrom") ?? "", 40);
  const dateTo = sanitizeText(url.searchParams.get("dateTo") ?? "", 40);
  if (dateFrom) {
    filters.push("createdAt >= ?");
    values.push(dateFrom);
  }
  if (dateTo) {
    filters.push("createdAt <= ?");
    values.push(dateTo);
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM crm_opportunities${where} ORDER BY updatedAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, opportunities: result.results ?? [], limit, offset });
}

async function createCrmOpportunity(request: Request, db: D1Database) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  const now = new Date().toISOString();
  const id = sanitizeText(body.id, 120) ?? `crm_opp_${crypto.randomUUID()}`;
  const title = sanitizeText(body.title, 180);
  if (!title) return json({ ok: false, error: "missing_title" }, 400);
  const type = crmOpportunityType(body.type);
  const pipeline = sanitizeText(body.pipeline, 80) ?? defaultPipelineForOpportunityType(type);
  const stage = sanitizeText(body.stage, 80) ?? defaultStageForPipeline(pipeline);
  const status = sanitizeText(body.status, 40) ?? "open";

  await db
    .prepare(
      `INSERT INTO crm_opportunities (
        id, contactId, companyId, specialistId, serviceRequestId, virtualQuoteId, title, type, pipeline, stage,
        priority, estimatedCredits, estimatedAmountCLP, assignedTo, nextActionAt, status, sourceEntityType, sourceEntityId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      sanitizeText(body.contactId, 120) ?? null,
      sanitizeText(body.companyId, 120) ?? null,
      sanitizeText(body.specialistId, 120) ?? null,
      sanitizeText(body.serviceRequestId, 120) ?? null,
      sanitizeText(body.virtualQuoteId, 120) ?? null,
      title,
      type,
      pipeline,
      stage,
      sanitizeText(body.priority, 20) ?? "media",
      numberFrom(body.estimatedCredits),
      numberFrom(body.estimatedAmountCLP),
      sanitizeText(body.assignedTo, 120) ?? null,
      sanitizeText(body.nextActionAt, 60) ?? null,
      status,
      sanitizeText(body.sourceEntityType, 80) ?? "admin",
      sanitizeText(body.sourceEntityId, 120) ?? id,
      now,
      now,
    )
    .run();
  await crmActivity(db, request, { entityType: "opportunity", entityId: id, action: "opportunity_created", metadata: { pipeline, stage, type } });
  return json({ ok: true, id });
}

async function getCrmOpportunity(request: Request, db: D1Database, id: string) {
  const opportunity = await db.prepare("SELECT * FROM crm_opportunities WHERE id = ?").bind(id).first();
  if (!opportunity) return json({ ok: false, error: "opportunity_not_found" }, 404);
  const [tasks, notes, activity, statusHistory] = await Promise.all([
    db.prepare("SELECT * FROM crm_tasks WHERE opportunityId = ? ORDER BY dueAt ASC, createdAt DESC").bind(id).all(),
    db.prepare("SELECT * FROM crm_notes WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC").bind("opportunity", id).all(),
    db.prepare("SELECT * FROM crm_activity_log WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC LIMIT 100").bind("opportunity", id).all(),
    db.prepare("SELECT * FROM crm_status_history WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC").bind("opportunity", id).all(),
  ]);
  await crmActivity(db, request, { entityType: "opportunity", entityId: id, action: "opportunity_viewed" });
  return json({ ok: true, opportunity, tasks: tasks.results ?? [], notes: notes.results ?? [], activity: activity.results ?? [], statusHistory: statusHistory.results ?? [] });
}

async function patchCrmOpportunity(request: Request, db: D1Database, id: string) {
  const current = await db.prepare("SELECT * FROM crm_opportunities WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!current) return json({ ok: false, error: "opportunity_not_found" }, 404);
  const body = await readJsonBody<Record<string, unknown>>(request);
  const allowed = ["stage", "priority", "assignedTo", "nextActionAt", "status", "pipeline"] as const;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      sets.push(`${field} = ?`);
      values.push(sanitizeText(body[field], field === "assignedTo" ? 120 : 80) ?? null);
    }
  }
  if (!sets.length) return json({ ok: false, error: "missing_update_fields" }, 400);
  sets.push("updatedAt = ?");
  values.push(new Date().toISOString(), id);
  await db.prepare(`UPDATE crm_opportunities SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
  const nextStatus = sanitizeText(body.status, 80) ?? sanitizeText(body.stage, 80);
  const previousStatus = String(current.status ?? current.stage ?? "");
  if (nextStatus && nextStatus !== previousStatus) {
    await crmStatusHistory(db, request, { entityType: "opportunity", entityId: id, fromStatus: previousStatus, toStatus: nextStatus, reason: sanitizeText(body.reason, 240) });
  }
  await crmActivity(db, request, { entityType: "opportunity", entityId: id, action: "opportunity_updated", metadata: redactSensitive(body) });
  return json({ ok: true, id });
}

async function listCrmTasks(request: Request, db: D1Database) {
  const url = new URL(request.url);
  const { limit, offset } = crmPagination(url);
  const filters: string[] = [];
  const values: unknown[] = [];
  addCrmFilter(filters, values, "status", url.searchParams.get("status"));
  addCrmFilter(filters, values, "assignedTo", url.searchParams.get("assignedTo"));
  addCrmFilter(filters, values, "priority", url.searchParams.get("priority"));
  addCrmFilter(filters, values, "opportunityId", url.searchParams.get("opportunityId"));
  const due = sanitizeText(url.searchParams.get("due") ?? "", 40);
  if (due === "overdue") {
    filters.push("status IN ('pending', 'in_progress') AND dueAt IS NOT NULL AND dueAt < ?");
    values.push(new Date().toISOString());
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM crm_tasks${where} ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, dueAt ASC, createdAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, tasks: result.results ?? [], limit, offset });
}

async function createCrmTask(request: Request, db: D1Database) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  const title = sanitizeText(body.title, 180);
  if (!title) return json({ ok: false, error: "missing_title" }, 400);
  const id = sanitizeText(body.id, 120) ?? `crm_task_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO crm_tasks (
        id, opportunityId, contactId, specialistId, title, description, taskType, status, priority, assignedTo, dueAt, completedAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      sanitizeText(body.opportunityId, 120) ?? null,
      sanitizeText(body.contactId, 120) ?? null,
      sanitizeText(body.specialistId, 120) ?? null,
      title,
      sanitizeText(body.description, 1200) ?? null,
      crmTaskType(body.taskType),
      sanitizeText(body.status, 40) ?? "pending",
      sanitizeText(body.priority, 20) ?? "media",
      sanitizeText(body.assignedTo, 120) ?? null,
      sanitizeText(body.dueAt, 60) ?? null,
      sanitizeText(body.completedAt, 60) ?? null,
      now,
      now,
    )
    .run();
  await crmActivity(db, request, { entityType: "task", entityId: id, action: "task_created", metadata: { opportunityId: sanitizeText(body.opportunityId, 120) } });
  return json({ ok: true, id });
}

async function patchCrmTask(request: Request, db: D1Database, id: string) {
  const current = await db.prepare("SELECT * FROM crm_tasks WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!current) return json({ ok: false, error: "task_not_found" }, 404);
  const body = await readJsonBody<Record<string, unknown>>(request);
  const fields = ["title", "description", "taskType", "status", "priority", "assignedTo", "dueAt", "completedAt"] as const;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      sets.push(`${field} = ?`);
      values.push(field === "taskType" ? crmTaskType(body[field]) : sanitizeText(body[field], field === "description" ? 1200 : 180) ?? null);
    }
  }
  if (body.status === "done" && !body.completedAt) {
    sets.push("completedAt = ?");
    values.push(new Date().toISOString());
  }
  if (!sets.length) return json({ ok: false, error: "missing_update_fields" }, 400);
  sets.push("updatedAt = ?");
  values.push(new Date().toISOString(), id);
  await db.prepare(`UPDATE crm_tasks SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
  const nextStatus = sanitizeText(body.status, 40);
  if (nextStatus && nextStatus !== String(current.status ?? "")) {
    await crmStatusHistory(db, request, { entityType: "task", entityId: id, fromStatus: String(current.status ?? ""), toStatus: nextStatus, reason: sanitizeText(body.reason, 240) });
  }
  await crmActivity(db, request, { entityType: "task", entityId: id, action: nextStatus === "done" ? "task_completed" : "task_updated", metadata: redactSensitive(body) });
  return json({ ok: true, id });
}

async function listCrmNotes(request: Request, db: D1Database) {
  const url = new URL(request.url);
  const { limit, offset } = crmPagination(url);
  const entityType = sanitizeText(url.searchParams.get("entityType") ?? "", 80);
  const entityId = sanitizeText(url.searchParams.get("entityId") ?? "", 120);
  const filters: string[] = [];
  const values: unknown[] = [];
  if (entityType) {
    filters.push("entityType = ?");
    values.push(entityType);
  }
  if (entityId) {
    filters.push("entityId = ?");
    values.push(entityId);
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM crm_notes${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, notes: result.results ?? [], limit, offset });
}

async function createCrmNote(request: Request, db: D1Database) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  const entityType = sanitizeText(body.entityType, 80);
  const entityId = sanitizeText(body.entityId, 120);
  const bodyText = sanitizeText(body.body, 4000);
  if (!entityType || !entityId || !bodyText) return json({ ok: false, error: "missing_note_fields" }, 400);
  const id = `crm_note_${crypto.randomUUID()}`;
  const author = sanitizeText(body.author, 120) ?? "admin";
  await db.prepare("INSERT INTO crm_notes (id, entityType, entityId, author, body, visibility, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, entityType, entityId, author, bodyText, "internal", new Date().toISOString())
    .run();
  await crmActivity(db, request, { entityType, entityId, action: "note_created", metadata: { noteId: id } });
  return json({ ok: true, id });
}

async function listCrmActivity(request: Request, db: D1Database) {
  const url = new URL(request.url);
  const { limit, offset } = crmPagination(url);
  const entityType = sanitizeText(url.searchParams.get("entityType") ?? "", 80);
  const entityId = sanitizeText(url.searchParams.get("entityId") ?? "", 120);
  const filters: string[] = [];
  const values: unknown[] = [];
  if (entityType) {
    filters.push("entityType = ?");
    values.push(entityType);
  }
  if (entityId) {
    filters.push("entityId = ?");
    values.push(entityId);
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM crm_activity_log${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  return json({ ok: true, activity: result.results ?? [], limit, offset });
}

async function listCrmContacts(request: Request, db: D1Database) {
  return listCrmDirectory(request, db, "crm_contacts", "contacts", ["name", "email", "phone", "commune", "region", "contactType", "status"]);
}

async function listCrmCompanies(request: Request, db: D1Database) {
  return listCrmDirectory(request, db, "crm_companies", "companies", ["companyName", "rut", "contactName", "email", "phone", "commune", "region", "status"]);
}

async function listCrmDirectory(request: Request, db: D1Database, table: "crm_contacts" | "crm_companies", key: "contacts" | "companies", searchColumns: string[]) {
  const url = new URL(request.url);
  const { limit, offset } = crmPagination(url);
  const filters: string[] = [];
  const values: unknown[] = [];
  const showTestData = url.searchParams.get("showTestData") === "true";
  if (!showTestData) filters.push(`NOT (${table === "crm_contacts" ? crmContactTestWhere() : crmCompanyTestWhere()})`);
  addCrmFilter(filters, values, "status", url.searchParams.get("status"));
  const q = sanitizeText(url.searchParams.get("search") ?? url.searchParams.get("q") ?? "", 120);
  if (q) {
    filters.push(`(${searchColumns.map((column) => `${column} LIKE ?`).join(" OR ")})`);
    values.push(...searchColumns.map(() => `%${q}%`));
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM ${table}${where} ORDER BY updatedAt DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all();
  const rows = (result.results ?? []).map((row) => ({ ...row, isTest: isCrmTestRecord(row as Record<string, unknown>) }));
  return json({ ok: true, [key]: rows, limit, offset, showTestData });
}

async function syncCrmLeads(request: Request, db: D1Database) {
  const rows = await db.prepare("SELECT * FROM lead_submissions ORDER BY created_at DESC LIMIT 500").all<Record<string, unknown>>();
  let contacts = 0;
  let companies = 0;
  let opportunities = 0;
  for (const row of rows.results ?? []) {
    const id = String(row.id ?? "");
    if (!id) continue;
    const leadType = String(row.lead_type ?? "customer_request");
    const companyId = row.company_name ? `crm_company_lead_${id}` : null;
    const now = new Date().toISOString();
    const contactId = await upsertCrmContact(db, {
      id: crmContactIdFor("lead", row, id),
      name: String(row.full_name ?? row.company_name ?? "Contacto OficiosPro"),
      email: String(row.email ?? ""),
      phone: String(row.phone ?? ""),
      contactType: leadType === "specialist_application" ? "specialist" : row.company_name ? "company_contact" : "customer",
      source: sourceFromRow(row),
      commune: String(row.commune_name ?? row.commune_code ?? ""),
      region: String(row.region_name ?? row.region_code ?? ""),
      tags: crmTagsFromRow(row),
      status: String(row.status ?? "new"),
      createdAt: String(row.created_at ?? now),
      updatedAt: now,
    });
    contacts += 1;
    if (companyId) {
      await db.prepare("INSERT OR IGNORE INTO crm_companies (id, companyName, rut, industry, contactName, email, phone, commune, region, status, source, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(companyId, row.company_name, null, null, row.full_name ?? null, row.email ?? null, row.phone ?? null, row.commune_name ?? row.commune_code ?? null, row.region_name ?? row.region_code ?? null, "new", sourceFromRow(row), row.created_at ?? now, now)
        .run();
      companies += 1;
    }
    const oppType = opportunityTypeFromLeadType(leadType);
    const pipeline = defaultPipelineForOpportunityType(oppType);
    const stage = stageFromLead(leadType, String(row.status ?? "nuevo"));
    await insertCrmOpportunityIfMissing(db, {
      id: `crm_opp_lead_${id}`,
      contactId,
      companyId,
      specialistId: row.specialist_id ? String(row.specialist_id) : null,
      serviceRequestId: ["booking_request", "customer_request"].includes(leadType) ? id : null,
      virtualQuoteId: null,
      title: String(row.service ?? row.trade ?? row.company_name ?? row.full_name ?? "Lead OficiosPro"),
      type: oppType,
      pipeline,
      stage,
      priority: priorityFor(String(row.urgency ?? "")) === "alta" ? "alta" : "media",
      estimatedCredits: numberFrom(row.credits_estimate),
      estimatedAmountCLP: numberFrom(row.credits_estimate) * 1000,
      assignedTo: null,
      nextActionAt: null,
      status: ["cerrado", "convertido", "perdido"].includes(String(row.status ?? "")) ? "closed" : "open",
      sourceEntityType: "lead_submission",
      sourceEntityId: id,
      createdAt: String(row.created_at ?? now),
      updatedAt: now,
    });
    opportunities += 1;
  }
  await crmActivity(db, request, { entityType: "crm", entityId: "sync-leads", action: "crm_sync_leads", metadata: { contacts, companies, opportunities } });
  return json({ ok: true, synced: { contacts, companies, opportunities } });
}

async function syncCrmSpecialists(request: Request, db: D1Database) {
  const rows = await db.prepare("SELECT * FROM specialist_applications ORDER BY createdAt DESC LIMIT 500").all<Record<string, unknown>>();
  let contacts = 0;
  let opportunities = 0;
  for (const row of rows.results ?? []) {
    const id = String(row.id ?? "");
    if (!id) continue;
    const now = new Date().toISOString();
    const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || String(row.email ?? "Especialista OficiosPro");
    const contactId = await upsertCrmContact(db, {
      id: crmContactIdFor("specialist", row, id),
      name,
      email: String(row.email ?? ""),
      phone: String(row.whatsapp ?? ""),
      rut: String(row.rut ?? ""),
      contactType: "specialist",
      source: isCrmTestRecord(row) ? "e2e_test" : String(row.source ?? "specialist_application"),
      commune: String(row.comuna ?? ""),
      region: String(row.region ?? ""),
      tags: crmTagsFromRow(row),
      status: String(row.status ?? row.publicationStatus ?? "pending"),
      createdAt: String(row.createdAt ?? now),
      updatedAt: now,
    });
    contacts += 1;
    await insertCrmOpportunityIfMissing(db, {
      id: `crm_opp_specialist_${id}`,
      contactId,
      companyId: null,
      specialistId: id,
      serviceRequestId: null,
      virtualQuoteId: null,
      title: `Onboarding especialista: ${name}`,
      type: "specialist_onboarding",
      pipeline: "especialistas",
      stage: stageFromSpecialist(String(row.status ?? ""), String(row.publicationStatus ?? "")),
      priority: "media",
      estimatedCredits: numberFrom(row.credits),
      estimatedAmountCLP: numberFrom(row.providerChargeCLP),
      assignedTo: null,
      nextActionAt: null,
      status: ["rejected", "published", "suspended"].includes(String(row.publicationStatus ?? row.status ?? "")) ? "closed" : "open",
      sourceEntityType: "specialist_application",
      sourceEntityId: id,
      createdAt: String(row.createdAt ?? now),
      updatedAt: now,
    });
    opportunities += 1;
  }
  await crmActivity(db, request, { entityType: "crm", entityId: "sync-specialists", action: "crm_sync_specialists", metadata: { contacts, opportunities } });
  return json({ ok: true, synced: { contacts, opportunities } });
}

async function syncCrmVirtualQuotes(request: Request, db: D1Database) {
  const rows = await db.prepare("SELECT * FROM virtual_quote_requests ORDER BY createdAt DESC LIMIT 500").all<Record<string, unknown>>();
  let contacts = 0;
  let opportunities = 0;
  for (const row of rows.results ?? []) {
    const id = String(row.id ?? "");
    if (!id) continue;
    const now = new Date().toISOString();
    const contactId = await upsertCrmContact(db, {
      id: crmContactIdFor("virtual_quote", row, id),
      name: String(row.customerName ?? "Cliente cotizacion virtual"),
      email: String(row.customerEmail ?? ""),
      phone: String(row.customerPhone ?? ""),
      contactType: "customer",
      source: isCrmTestRecord(row) ? "e2e_test" : "virtual_quote",
      commune: String(row.commune ?? ""),
      region: String(row.region ?? ""),
      tags: crmTagsFromRow(row),
      status: String(row.status ?? "pendiente_revision"),
      createdAt: String(row.createdAt ?? now),
      updatedAt: now,
    });
    contacts += 1;
    const status = String(row.status ?? "pendiente_revision");
    await insertCrmOpportunityIfMissing(db, {
      id: `crm_opp_virtual_quote_${id}`,
      contactId,
      companyId: null,
      specialistId: row.specialistId ? String(row.specialistId) : null,
      serviceRequestId: null,
      virtualQuoteId: id,
      title: String(row.problemTitle ?? row.serviceName ?? "Cotizacion virtual"),
      type: "quote_followup",
      pipeline: "cotizaciones_virtuales",
      stage: stageFromVirtualQuote(status),
      priority: String(row.urgency ?? "").includes("hoy") ? "alta" : "media",
      estimatedCredits: 0,
      estimatedAmountCLP: 0,
      assignedTo: null,
      nextActionAt: null,
      status: ["rechazada_cliente", "convertida_a_reserva", "expirada"].includes(status) ? "closed" : "open",
      sourceEntityType: "virtual_quote_request",
      sourceEntityId: id,
      createdAt: String(row.createdAt ?? now),
      updatedAt: now,
    });
    opportunities += 1;
  }
  await crmActivity(db, request, { entityType: "crm", entityId: "sync-virtual-quotes", action: "crm_sync_virtual_quotes", metadata: { contacts, opportunities } });
  return json({ ok: true, synced: { contacts, opportunities } });
}

async function countCrm(db: D1Database, table: string, where: string, values: unknown[]) {
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM ${table}${where ? ` WHERE ${where}` : ""}`).bind(...values).first<{ count?: number }>();
  return Number(row?.count ?? 0);
}

function crmPagination(url: URL) {
  return {
    limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100),
    offset: Math.max(Number(url.searchParams.get("offset") ?? 0), 0),
  };
}

function addCrmFilter(filters: string[], values: unknown[], column: string, value: unknown) {
  const text = sanitizeText(value, 120);
  if (!text) return;
  filters.push(`${column} = ?`);
  values.push(text);
}

function crmOpportunityType(value: unknown): "customer_request" | "company_request" | "club_hogar" | "specialist_onboarding" | "payment_issue" | "quote_followup" {
  const text = sanitizeText(value, 80);
  if (text === "company_request" || text === "club_hogar" || text === "specialist_onboarding" || text === "payment_issue" || text === "quote_followup") return text;
  return "customer_request";
}

function crmTaskType(value: unknown) {
  const text = sanitizeText(value, 80);
  if (["call", "whatsapp", "email", "review", "approve", "collect_docs", "followup", "payment_check", "quote_review"].includes(text ?? "")) return text;
  return "followup";
}

function defaultPipelineForOpportunityType(type: string) {
  if (type === "company_request") return "empresas";
  if (type === "club_hogar") return "clientes";
  if (type === "specialist_onboarding") return "especialistas";
  if (type === "payment_issue") return "pagos_creditos";
  if (type === "quote_followup") return "cotizaciones_virtuales";
  return "clientes";
}

function defaultStageForPipeline(pipeline: string) {
  if (pipeline === "especialistas") return "postulacion_recibida";
  if (pipeline === "empresas") return "nuevo";
  if (pipeline === "pagos_creditos") return "pendiente";
  if (pipeline === "cotizaciones_virtuales") return "recibido";
  return "nuevo";
}

function opportunityTypeFromLeadType(leadType: string): "customer_request" | "company_request" | "club_hogar" | "specialist_onboarding" | "payment_issue" | "quote_followup" {
  if (leadType === "company_request") return "company_request";
  if (leadType === "club_hogar_interest") return "club_hogar";
  if (leadType === "specialist_application") return "specialist_onboarding";
  if (leadType === "payment_interest") return "payment_issue";
  return "customer_request";
}

function stageFromLead(leadType: string, status: string) {
  const normalized = status.toLowerCase();
  if (leadType === "specialist_application") return stageFromSpecialist(normalized, normalized);
  if (leadType === "company_request") {
    if (normalized.includes("contact")) return "contactado";
    if (normalized.includes("convert")) return "ganado";
    if (normalized.includes("perd")) return "perdido";
    return "nuevo";
  }
  if (normalized.includes("contact")) return "contactado";
  if (normalized.includes("cotiz")) return "cotizacion_enviada";
  if (normalized.includes("cerr") || normalized.includes("convert")) return "completado";
  if (normalized.includes("perd") || normalized.includes("reject")) return "perdido";
  return "nuevo";
}

function stageFromSpecialist(status: string, publicationStatus: string) {
  const value = `${status} ${publicationStatus}`.toLowerCase();
  if (value.includes("published")) return "publicado";
  if (value.includes("approved")) return "aprobado";
  if (value.includes("reject")) return "rechazado";
  if (value.includes("more") || value.includes("info")) return "falta_informacion";
  if (value.includes("review")) return "revision_inicial";
  if (value.includes("valid")) return "validacion";
  return "postulacion_recibida";
}

function stageFromVirtualQuote(status: string) {
  if (status === "necesita_mas_info") return "falta_info";
  if (status === "cotizacion_enviada") return "propuesta_enviada";
  if (status === "aprobada_cliente") return "aprobado_cliente";
  if (status === "rechazada_cliente") return "rechazado_cliente";
  if (status === "convertida_a_reserva") return "convertido_checkout";
  return "recibido";
}

function sourceFromRow(row: Record<string, unknown>) {
  if (isCrmTestRecord(row)) return "e2e_test";
  return [row.source_page, row.source_component, row.source_button].filter(Boolean).join(" / ") || "lead_submission";
}

async function upsertCrmContact(db: D1Database, input: Record<string, unknown>) {
  const normalizedEmail = sanitizeEmail(input.email);
  const normalizedPhone = normalizeChileanPhone(input.phone);
  const normalizedRut = normalizeRut(input.rut);
  const fallbackId = sanitizeText(input.id, 160) ?? `crm_contact_${crypto.randomUUID()}`;
  const existing = await findExistingCrmContact(db, { email: normalizedEmail, phone: normalizedPhone, rut: normalizedRut });
  const id = existing?.id ? String(existing.id) : fallbackId;
  const tags = mergeCrmTags(sanitizeText(existing?.tags, 600), sanitizeText(input.tags, 600), isCrmTestRecord(input) ? ["Test", "e2e_test", ...testRunTags(input)] : []);

  await db
    .prepare(
      `INSERT INTO crm_contacts (id, name, email, phone, rut, contactType, source, commune, region, addressSummary, tags, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email, phone = excluded.phone, rut = excluded.rut,
       contactType = excluded.contactType, source = excluded.source, commune = excluded.commune, region = excluded.region,
       addressSummary = excluded.addressSummary, tags = excluded.tags, status = excluded.status, updatedAt = excluded.updatedAt`,
    )
    .bind(
      id,
      sanitizeText(input.name, 180) ?? "Contacto OficiosPro",
      normalizedEmail ?? null,
      normalizedPhone ?? null,
      normalizedRut ?? null,
      sanitizeText(input.contactType, 40) ?? "customer",
      isCrmTestRecord(input) ? "e2e_test" : sanitizeText(input.source, 180) ?? null,
      sanitizeText(input.commune, 120) ?? null,
      sanitizeText(input.region, 120) ?? null,
      sanitizeText(input.addressSummary, 240) ?? null,
      tags || null,
      sanitizeText(input.status, 40) ?? "new",
      existing?.createdAt ?? input.createdAt,
      input.updatedAt,
    )
    .run();
  return id;
}

async function findExistingCrmContact(db: D1Database, input: { email?: string | null; phone?: string | null; rut?: string | null }) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (input.email) {
    clauses.push("LOWER(email) = ?");
    values.push(input.email);
  }
  if (input.phone) {
    clauses.push("phone = ?");
    values.push(input.phone);
  }
  if (input.rut) {
    clauses.push("rut = ?");
    values.push(input.rut);
  }
  if (!clauses.length) return null;
  return db.prepare(`SELECT * FROM crm_contacts WHERE ${clauses.join(" OR ")} ORDER BY updatedAt DESC LIMIT 1`).bind(...values).first<Record<string, unknown>>();
}

function crmContactIdFor(prefix: string, row: Record<string, unknown>, fallback: string) {
  const email = sanitizeEmail(row.email ?? row.customerEmail);
  if (email) return `crm_contact_email_${stableCrmKey(email)}`;
  const phone = normalizeChileanPhone(row.phone ?? row.whatsapp ?? row.customerPhone);
  if (phone) return `crm_contact_phone_${stableCrmKey(phone)}`;
  const rut = normalizeRut(row.rut ?? row.customerRut);
  if (rut) return `crm_contact_rut_${stableCrmKey(rut)}`;
  return `crm_contact_${prefix}_${stableCrmKey(fallback)}`;
}

function stableCrmKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || crypto.randomUUID();
}

function normalizeChileanPhone(value: unknown) {
  const raw = sanitizeText(value, 60);
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("56")) return `+${digits}`;
  if (digits.startsWith("9") && digits.length === 9) return `+56${digits}`;
  if (digits.length === 8) return `+569${digits}`;
  return `+${digits}`;
}

function normalizeRut(value: unknown) {
  const raw = sanitizeText(value, 30);
  if (!raw) return null;
  const normalized = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  return normalized.length >= 2 ? normalized : null;
}

function crmTagsFromRow(row: Record<string, unknown>) {
  if (!isCrmTestRecord(row)) return "";
  return mergeCrmTags("", "", ["Test", "e2e_test", ...testRunTags(row)]);
}

function mergeCrmTags(...groups: Array<string | string[] | null | undefined>) {
  const tags = groups.flatMap((group) => {
    if (!group) return [];
    if (Array.isArray(group)) return group;
    return group.split(",").map((tag) => tag.trim());
  }).filter(Boolean);
  return Array.from(new Set(tags)).join(", ");
}

function testRunTags(row: Record<string, unknown>) {
  const id = testRunIdFromRecord(row);
  return id ? [`testRunId:${id}`] : [];
}

function testRunIdFromRecord(row: Record<string, unknown>) {
  const direct = sanitizeText(row.testRunId, 120);
  if (direct) return direct;
  const payload = payloadRecord(row.payloadJson ?? row.payload_json);
  return sanitizeText(payload.testRunId, 120) ?? "";
}

function isCrmTestRecord(row: Record<string, unknown>) {
  const payload = payloadRecord(row.payloadJson ?? row.payload_json);
  return Boolean(
    row.isTest === true ||
      payload.isTest === true ||
      sanitizeText(row.source, 180) === "e2e_test" ||
      sanitizeText(payload.source, 180) === "e2e_test" ||
      sanitizeText(row.utm_source, 120) === "e2e_test" ||
      sanitizeText(row.source_page, 180) === "e2e_test" ||
      sanitizeText(row.tags, 600)?.includes("e2e_test") ||
      testRunIdFromRecord(row) ||
      sanitizeEmail(row.email ?? row.customerEmail)?.endsWith("example.com"),
  );
}

function payloadRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim()) return {};
  const parsed = safeJson(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
}

async function insertCrmOpportunityIfMissing(db: D1Database, input: Record<string, unknown>) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO crm_opportunities (
        id, contactId, companyId, specialistId, serviceRequestId, virtualQuoteId, title, type, pipeline, stage,
        priority, estimatedCredits, estimatedAmountCLP, assignedTo, nextActionAt, status, sourceEntityType, sourceEntityId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.contactId ?? null,
      input.companyId ?? null,
      input.specialistId ?? null,
      input.serviceRequestId ?? null,
      input.virtualQuoteId ?? null,
      sanitizeText(input.title, 180) ?? "Oportunidad OficiosPro",
      input.type,
      input.pipeline,
      input.stage,
      input.priority ?? "media",
      input.estimatedCredits ?? 0,
      input.estimatedAmountCLP ?? 0,
      input.assignedTo ?? null,
      input.nextActionAt ?? null,
      input.status ?? "open",
      input.sourceEntityType,
      input.sourceEntityId,
      input.createdAt,
      input.updatedAt,
    )
    .run();
}

async function crmActivity(db: D1Database, request: Request, input: { entityType: string; entityId: string; action: string; metadata?: unknown }) {
  await db
    .prepare("INSERT INTO crm_activity_log (id, entityType, entityId, action, actor, metadataJson, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(`crm_act_${crypto.randomUUID()}`, input.entityType, input.entityId, input.action, adminActor(request), JSON.stringify(redactSensitive(input.metadata ?? {})), new Date().toISOString())
    .run();
}

async function crmStatusHistory(db: D1Database, request: Request, input: { entityType: string; entityId: string; fromStatus?: string; toStatus: string; reason?: string }) {
  await db
    .prepare("INSERT INTO crm_status_history (id, entityType, entityId, fromStatus, toStatus, reason, actor, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(`crm_status_${crypto.randomUUID()}`, input.entityType, input.entityId, input.fromStatus ?? null, input.toStatus, input.reason ?? null, adminActor(request), new Date().toISOString())
    .run();
}

function adminActor(request: Request) {
  const actor = request.headers.get("x-admin-actor");
  return sanitizeText(actor, 120) ?? "admin_token";
}

async function requireAdmin(request: Request, env: Env) {
  const configuredToken = adminApiToken(env);
  const sessionSecret = adminSessionSecret(env);
  if (!configuredToken && !sessionSecret) return json({ ok: false, error: "admin_token_not_configured" }, 503);

  const token = adminTokenFromRequest(request);
  if (configuredToken && token && timingSafeEqual(token, configuredToken)) return null;
  if (sessionSecret && await verifyAdminSessionCookie(request, sessionSecret)) return null;

  return json({ ok: false, error: "unauthorized" }, 401);
}

function adminApiToken(env: Env) {
  return env.ADMIN_API_TOKEN ?? env.ADMIN_TOKEN ?? "";
}

function adminSessionSecret(env: Env) {
  return env.ADMIN_SESSION_SECRET ?? env.ADMIN_TOKEN ?? env.ADMIN_API_TOKEN ?? "";
}

function adminTokenFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  return bearer || request.headers.get("x-admin-token")?.trim() || "";
}

async function createAdminSessionCookie(session: { role: "admin"; email: string; iat: number; exp: number }, secret: string) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = await hmacSha256Hex(payload, secret);
  const maxAge = Math.max(session.exp - Math.floor(Date.now() / 1000), 0);
  return `${adminSessionCookieName}=${payload}.${signature}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

async function verifyAdminSessionCookie(request: Request, secret: string) {
  const raw = cookieValue(request, adminSessionCookieName);
  if (!raw) return false;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  const expected = await hmacSha256Hex(payload, secret);
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const session = safeJson(base64UrlDecode(payload)) as { role?: string; exp?: number } | null;
    if (!session || session.role !== "admin") return false;
    if (!session.exp || session.exp <= Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const prefix = `${name}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length) ?? "";
}

async function hmacSha256Hex(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(value: string) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

async function readLeadPayload(request: Request) {
  return readJsonBody<LeadPayload>(request);
}

async function readJsonBody<T = Record<string, unknown>>(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) throw new SafeHttpError(415, "unsupported_content_type");
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxJsonBodyBytes) throw new SafeHttpError(413, "payload_too_large");
  const text = await request.text();
  if (text.length > maxJsonBodyBytes) throw new SafeHttpError(413, "payload_too_large");
  const payload = safeJson(text);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new SafeHttpError(400, "invalid_json");
  return payload as T;
}

async function enforceRateLimit(
  request: Request,
  scope: string,
  options: { email?: string; phone?: string; limit: number; windowMs: number },
) {
  const ip = clientIp(request);
  const keys = [
    `${scope}:ip:${ip}`,
    options.email ? `${scope}:email:${sanitizeEmail(options.email) ?? "invalid"}` : "",
    options.phone ? `${scope}:phone:${sanitizeText(options.phone, 40) ?? "invalid"}` : "",
  ].filter(Boolean);
  const now = Date.now();
  for (const key of keys) {
    const current = memoryRateLimits.get(key);
    const next = !current || current.resetAt <= now ? { count: 1, resetAt: now + options.windowMs } : { count: current.count + 1, resetAt: current.resetAt };
    memoryRateLimits.set(key, next);
    if (next.count > options.limit) throw new SafeHttpError(429, "rate_limited");
  }
}

function validateLeadPayload(body: LeadPayload, leadType: LeadType) {
  if (body.email && !isValidEmail(body.email)) throw new SafeHttpError(400, "invalid_email");
  if (body.phone && !isValidPhone(body.phone)) throw new SafeHttpError(400, "invalid_phone");

  const nested = normalizeNestedRecord(body.payload ?? {});
  const rut = textFrom(nested.rut) || textFrom(nested.companyRut);
  if (rut && !isValidRutFormat(rut)) throw new SafeHttpError(400, "invalid_rut");
  if (body.creditsEstimate !== undefined && (!Number.isFinite(Number(body.creditsEstimate)) || Number(body.creditsEstimate) < 0)) {
    throw new SafeHttpError(400, "invalid_credits");
  }

  const fullName = textFrom(body.fullName);
  const service = textFrom(body.service) || textFrom(body.trade) || textFrom(nested.requestedService);
  const commune = textFrom(body.communeName) || textFrom(body.communeCode) || textFrom(nested.communeName);
  const contact = Boolean(body.email || body.phone);

  if (leadType === "specialist_application" && (!fullName || !contact || !service || !commune)) throw new SafeHttpError(400, "missing_required_fields");
  if (leadType === "company_request" && (!textFrom(body.companyName) || !contact || !commune)) throw new SafeHttpError(400, "missing_required_fields");
  if (leadType === "booking_request" && (!fullName || !contact || !service || !commune)) throw new SafeHttpError(400, "missing_required_fields");
  if ((leadType === "club_hogar_interest" || leadType === "payment_interest") && (!fullName || !contact || !commune)) throw new SafeHttpError(400, "missing_required_fields");
  if (leadType === "contact_message" && (!fullName || !contact)) throw new SafeHttpError(400, "missing_required_fields");
  if (leadType === "customer_request" && !service && !textFrom(body.problemDescription)) throw new SafeHttpError(400, "missing_required_fields");
}

function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function isLeadType(value: string): value is LeadType {
  return [
    "customer_request",
    "specialist_application",
    "company_request",
    "booking_request",
    "contact_message",
    "club_hogar_interest",
    "payment_interest",
  ].includes(value);
}

function normalizeLead(body: LeadPayload, leadType: LeadType, userAgent: string): LeadRecord {
  const payload = normalizeNestedPayload(body.payload ?? {}, leadType);
  return {
    id: `lead_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    leadType,
    status: leadType === "specialist_application" ? "postulado" : "nuevo",
    priority: priorityFor(body.urgency),
    fullName: sanitizeText(body.fullName, 160),
    email: sanitizeEmail(body.email),
    phone: sanitizeText(body.phone, 60),
    companyName: sanitizeText(body.companyName, 180),
    applicantType: sanitizeText(body.applicantType, 80),
    service: sanitizeText(body.service, 180),
    trade: sanitizeText(body.trade, 180),
    problemDescription: sanitizeText(body.problemDescription, 4000),
    urgency: sanitizeText(body.urgency, 80),
    regionCode: sanitizeText(body.regionCode, 40),
    regionName: sanitizeText(body.regionName, 120),
    communeCode: sanitizeText(body.communeCode, 40),
    communeName: sanitizeText(body.communeName, 120),
    specialistId: sanitizeText(body.specialistId, 120),
    specialistName: sanitizeText(body.specialistName, 180),
    requestedDate: sanitizeText(body.requestedDate, 40),
    requestedTime: sanitizeText(body.requestedTime, 40),
    creditsEstimate: Number.isFinite(Number(body.creditsEstimate)) ? Number(body.creditsEstimate) : undefined,
    sourcePage: sanitizeText(body.sourcePage, 240),
    sourceComponent: sanitizeText(body.sourceComponent, 160),
    sourceButton: sanitizeText(body.sourceButton, 160),
    utmSource: sanitizeText(body.utmSource, 120),
    utmCampaign: sanitizeText(body.utmCampaign, 160),
    utmMedium: sanitizeText(body.utmMedium, 120),
    referralCode: sanitizeText(body.referralCode, 120),
    consentContact: Boolean(body.consentContact),
    consentTerms: Boolean(body.consentTerms),
    payloadJson: JSON.stringify(payload),
    userAgent: sanitizeText(userAgent, 500) ?? "",
    emailSent: 0,
    emailError: "",
  };
}

function normalizeNestedPayload(payload: Record<string, unknown>, leadType: LeadType) {
  const cleanedPayload = normalizeNestedRecord(sanitizePayloadObject(payload));
  if (leadType !== "specialist_application") return cleanedPayload;

  const services = Array.isArray(cleanedPayload.services) ? cleanedPayload.services.map(normalizeSpecialistServicePayload) : [];
  const hasNoFormalCertifications = Boolean(cleanedPayload.hasNoFormalCertifications);
  const certifications = Array.isArray(cleanedPayload.certifications) ? cleanedPayload.certifications.filter((item) => typeof item === "string") : [];
  return {
    ...cleanedPayload,
    services,
    hasNoFormalCertifications,
    certifications,
    status: "postulado",
    reviewStatus: "pendiente_revision",
    certificationStatus: hasNoFormalCertifications || certifications.length === 0 ? "sin_certificacion_declarada" : "certificacion_declarada_pendiente_revision",
  };
}

function normalizeSpecialistServicePayload(service: unknown) {
  const item = service && typeof service === "object" ? (service as Record<string, unknown>) : {};
  const specialistExpectedPayoutCLP = normalizeMoney(item.specialistExpectedPayoutCLP);
  const emergencyAvailable = Boolean(item.emergencyAvailable);
  const calculatedClientCredits = calculateWorkerClientCredits(specialistExpectedPayoutCLP, emergencyAvailable);
  return {
    serviceTypeId: sanitizeText(item.serviceTypeId, 120),
    serviceName: sanitizeText(item.serviceName, 180),
    serviceDescription: sanitizeText(item.serviceDescription, 1200),
    specialty: sanitizeText(item.specialty, 180),
    specialistExpectedPayoutCLP,
    estimatedDurationMinutes: Number.isFinite(Number(item.estimatedDurationMinutes)) ? Number(item.estimatedDurationMinutes) : undefined,
    duration: sanitizeText(item.duration, 120),
    materialsIncluded: sanitizeText(item.materialsIncluded, 1000),
    conditions: sanitizeText(item.conditions, 1000),
    emergencyAvailable,
    serviceCommunes: sanitizeText(item.serviceCommunes, 1000),
    pricingStatus: "pending_review",
    calculatedClientCredits,
    estimatedClientPriceCLP: calculatedClientCredits * workerPricingConfig.customerCreditValueCLP,
  };
}

function sanitizeIdentityVerificationForStorage(value: unknown) {
  const identity = normalizeNestedRecord(value);
  const hasDocumentNames = Boolean(textFrom(identity.idFrontName) || textFrom(identity.idBackName) || textFrom(identity.selfieName));
  return {
    profilePhotoUrl: safePrivateOrPublicAssetUrl(identity.profilePhotoUrl, false),
    idFrontUrl: safePrivateOrPublicAssetUrl(identity.idFrontUrl, true),
    idBackUrl: safePrivateOrPublicAssetUrl(identity.idBackUrl, true),
    selfieUrl: safePrivateOrPublicAssetUrl(identity.selfieUrl, true),
    profilePhotoName: sanitizeText(identity.profilePhotoName, 160) ?? "",
    idFrontName: sanitizeText(identity.idFrontName, 160) ?? "",
    idBackName: sanitizeText(identity.idBackName, 160) ?? "",
    selfieName: sanitizeText(identity.selfieName, 160) ?? "",
    verificationStatus: "pending",
    reviewedBy: null,
    reviewedAt: null,
    notes: "",
    secureStorageConfigured: false,
    identityStorageStatus: hasDocumentNames ? "pending_secure_storage" : "not_submitted",
  };
}

function safePrivateOrPublicAssetUrl(value: unknown, privateDocument: boolean) {
  const text = sanitizeText(value, 500) ?? "";
  if (!text || text.startsWith("blob:") || text.startsWith("data:")) return "";
  if (privateDocument) return text.startsWith("r2://") || text.startsWith("supabase-private://") ? text : "";
  return text.startsWith("/") || text.startsWith("https://") ? text : "";
}

function normalizeMoney(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

function calculateWorkerClientCredits(specialistExpectedPayoutCLP: number, emergencyAvailable: boolean) {
  const basePrice =
    specialistExpectedPayoutCLP +
    specialistExpectedPayoutCLP * (workerPricingConfig.platformFeePercent + workerPricingConfig.paymentFeePercent + workerPricingConfig.riskBufferPercent) +
    workerPricingConfig.fixedServiceFeeCLP;
  const adjustedPrice = emergencyAvailable ? basePrice * workerPricingConfig.emergencyMultiplier : basePrice;
  const rawCredits = adjustedPrice / workerPricingConfig.customerCreditValueCLP;
  const roundedCredits = Math.ceil(rawCredits / workerPricingConfig.creditRoundingStep) * workerPricingConfig.creditRoundingStep;
  return Math.max(workerPricingConfig.minimumClientCredits, roundedCredits);
}

async function insertLead(db: D1Database, lead: LeadRecord) {
  await db
    .prepare(
      `INSERT INTO lead_submissions (
        id, created_at, lead_type, status, priority, full_name, email, phone, company_name, applicant_type,
        service, trade, problem_description, urgency, region_code, region_name, commune_code, commune_name,
        specialist_id, specialist_name, requested_date, requested_time, credits_estimate, source_page,
        source_component, source_button, utm_source, utm_campaign, utm_medium, referral_code,
        consent_contact, consent_terms, payload_json, user_agent, email_sent, email_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      lead.id,
      lead.createdAt,
      lead.leadType,
      lead.status,
      lead.priority,
      lead.fullName ?? null,
      lead.email ?? null,
      lead.phone ?? null,
      lead.companyName ?? null,
      lead.applicantType ?? null,
      lead.service ?? null,
      lead.trade ?? null,
      lead.problemDescription ?? null,
      lead.urgency ?? null,
      lead.regionCode ?? null,
      lead.regionName ?? null,
      lead.communeCode ?? null,
      lead.communeName ?? null,
      lead.specialistId ?? null,
      lead.specialistName ?? null,
      lead.requestedDate ?? null,
      lead.requestedTime ?? null,
      lead.creditsEstimate ?? null,
      lead.sourcePage ?? null,
      lead.sourceComponent ?? null,
      lead.sourceButton ?? null,
      lead.utmSource ?? null,
      lead.utmCampaign ?? null,
      lead.utmMedium ?? null,
      lead.referralCode ?? null,
      lead.consentContact ? 1 : 0,
      lead.consentTerms ? 1 : 0,
      lead.payloadJson,
      lead.userAgent,
      lead.emailSent,
      lead.emailError || null,
    )
    .run();
}

async function insertOperationalRecord(db: D1Database, lead: LeadRecord) {
  if (lead.leadType === "specialist_application") return insertSpecialistApplication(db, lead);
  if (lead.leadType === "company_request") return insertCompanyLead(db, lead);
  if (lead.leadType === "booking_request") return insertServiceRequest(db, lead);
  if (["customer_request", "club_hogar_interest", "contact_message", "payment_interest"].includes(lead.leadType)) return insertCustomerLead(db, lead);
}

async function insertSpecialistApplication(db: D1Database, lead: LeadRecord) {
  const payload = leadPayload(lead);
  const services = asArray(payload.services);
  const firstService = asRecord(services[0]);
  const names = splitName(lead.fullName ?? textFrom(payload.fullName));
  const referencesJson = JSON.stringify(payload.references ?? payload.referencesText ?? []);
  const portfolioJson = JSON.stringify(payload.portfolio ?? payload.portfolioPhotos ?? payload.portfolioUrl ?? []);
  const certificationsJson = JSON.stringify({
    certifications: asArray(payload.certifications),
    hasNoFormalCertifications: Boolean(payload.hasNoFormalCertifications),
    otherCertificationText: textFrom(payload.otherCertificationText),
  });
  await db
    .prepare(
      `INSERT OR REPLACE INTO specialist_applications (
        id, slug, firstName, lastName, rut, email, whatsapp, region, comuna, address, serviceTypes, specialties,
        servicesOffered, priceMode, credits, providerChargeCLP, coverageRadiusKm, referencesJson,
        portfolioJson, certificationsJson, identityVerificationJson, payloadJson, source, leadSubmissionId, publicationStatus, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      lead.id,
      specialistWorkerSlug(lead.fullName ?? textFrom(payload.fullName), lead.service || textFrom(firstService.specialty), lead.communeName || textFrom(payload.communeName), lead.id),
      textFrom(payload.firstNames) || names.firstName,
      textFrom(payload.lastNames) || names.lastName,
      textFrom(payload.rut),
      lead.email ?? textFrom(payload.email),
      lead.phone ?? textFrom(payload.phone),
      lead.regionName || lead.regionCode || textFrom(payload.regionName),
      lead.communeName || lead.communeCode || textFrom(payload.communeName),
      textFrom(payload.address),
      services.map((item) => textFrom(asRecord(item).serviceName) || textFrom(asRecord(item).serviceTypeId)).filter(Boolean).join(", ") || lead.trade || lead.service,
      services.map((item) => textFrom(asRecord(item).specialty)).filter(Boolean).join(", ") || lead.service,
      JSON.stringify(services),
      textFrom(firstService.pricingMode),
      numberFrom(firstService.calculatedClientCredits),
      numberFrom(firstService.specialistExpectedPayoutCLP),
      numberFrom(payload.coverageRadiusKm),
      referencesJson,
      portfolioJson,
      certificationsJson,
      JSON.stringify(sanitizeIdentityVerificationForStorage(payload.identityVerification)),
      lead.payloadJson,
      sourceForLead(lead),
      lead.id,
      "pending_review",
      "pending",
      lead.createdAt,
      lead.createdAt,
    )
    .run();
}

async function insertCustomerLead(db: D1Database, lead: LeadRecord) {
  const payload = leadPayload(lead);
  const names = splitName(lead.fullName ?? textFrom(payload.fullName));
  await db
    .prepare(
      `INSERT OR REPLACE INTO customer_leads (
        id, firstName, lastName, rut, email, whatsapp, region, comuna, address, requestedService,
        comments, source, payloadJson, leadSubmissionId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      lead.id,
      textFrom(payload.firstNames) || names.firstName,
      textFrom(payload.lastNames) || names.lastName,
      textFrom(payload.rut),
      lead.email ?? textFrom(payload.email),
      lead.phone ?? textFrom(payload.phone),
      lead.regionName || lead.regionCode || textFrom(payload.regionName),
      lead.communeName || lead.communeCode || textFrom(payload.communeName),
      textFrom(payload.address),
      lead.service || lead.trade || textFrom(payload.requestedService),
      lead.problemDescription || textFrom(payload.comments),
      sourceForLead(lead),
      lead.payloadJson,
      lead.id,
      "pending",
      lead.createdAt,
    )
    .run();
}

async function insertCompanyLead(db: D1Database, lead: LeadRecord) {
  const payload = leadPayload(lead);
  const names = splitName(lead.fullName ?? textFrom(payload.fullName));
  await db
    .prepare(
      `INSERT OR REPLACE INTO company_leads (
        id, companyName, companyRut, contactFirstName, contactLastName, email, whatsapp, region, comuna,
        branches, requestedServices, comments, payloadJson, leadSubmissionId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      lead.id,
      lead.companyName ?? textFrom(payload.companyName) ?? textFrom(payload.businessName),
      textFrom(payload.companyRut),
      textFrom(payload.firstNames) || names.firstName,
      textFrom(payload.lastNames) || names.lastName,
      lead.email ?? textFrom(payload.email),
      lead.phone ?? textFrom(payload.phone),
      lead.regionName || lead.regionCode || textFrom(payload.regionName),
      lead.communeName || lead.communeCode || textFrom(payload.communeName),
      numberFrom(payload.branches),
      lead.service || textFrom(payload.requestedServices),
      lead.problemDescription || textFrom(payload.comments),
      lead.payloadJson,
      lead.id,
      "pending",
      lead.createdAt,
    )
    .run();
}

async function insertServiceRequest(db: D1Database, lead: LeadRecord) {
  const payload = leadPayload(lead);
  await db
    .prepare(
      `INSERT OR REPLACE INTO service_requests (
        id, customerName, customerEmail, customerWhatsapp, customerRut, comuna, specialistId, serviceId,
        serviceDescription, urgency, creditsEstimated, comments, payloadJson, leadSubmissionId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      lead.id,
      lead.fullName ?? textFrom(payload.customerName),
      lead.email ?? textFrom(payload.customerEmail),
      lead.phone ?? textFrom(payload.customerWhatsapp),
      textFrom(payload.rut),
      lead.communeName || lead.communeCode || textFrom(payload.communeName),
      lead.specialistId ?? textFrom(payload.specialistId),
      textFrom(payload.servicePricingId) || textFrom(payload.serviceId),
      lead.service || lead.trade || textFrom(payload.serviceDescription),
      lead.urgency ?? textFrom(payload.urgency),
      lead.creditsEstimate ?? numberFrom(payload.creditsEstimated),
      lead.problemDescription || textFrom(payload.comments),
      lead.payloadJson,
      lead.id,
      "pending",
      lead.createdAt,
    )
    .run();
}

async function insertConversionEventRecord(db: D1Database, event: { type: string; source?: string; page?: string; payloadJson?: string }) {
  const id = `evt_${crypto.randomUUID()}`;
  await db
    .prepare("INSERT INTO conversion_events (id, type, source, page, payloadJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, event.type, event.source ?? "", event.page ?? "", event.payloadJson ?? "{}", new Date().toISOString())
    .run();
  return id;
}

async function notifyLead(env: Env, lead: LeadRecord) {
  const apiKey = env.EMAIL_PROVIDER_API_KEY ?? env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "email_pending_configuration" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL ?? env.LEADS_FROM_EMAIL ?? "OficiosPro <notificaciones@oficiospro.cl>",
        to: [env.NOTIFICATION_TO_EMAIL ?? env.LEADS_TO_EMAIL ?? "bperez@oficiospro.cl"],
        cc: env.NOTIFICATION_CC_EMAIL ? [env.NOTIFICATION_CC_EMAIL] : undefined,
        reply_to: lead.email || env.LEADS_REPLY_TO_EMAIL || undefined,
        subject: subjectForLead(lead),
        html: leadEmailHtml(lead, env),
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { sent: false, error: `resend_${response.status}:${detail.slice(0, 300)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "email_error" };
  }
}

function subjectForLead(lead: LeadRecord) {
  if (lead.leadType === "specialist_application") return "Nuevo especialista postulado - OficiosPro";
  if (lead.leadType === "booking_request") return "Nueva solicitud de servicio - OficiosPro";
  if (lead.leadType === "company_request") return "Nuevo lead empresa - OficiosPro";
  if (lead.leadType === "club_hogar_interest" || lead.leadType === "payment_interest") return "Nuevo lead Club Hogar - OficiosPro";
  return "Nuevo lead OficiosPro";
}

function leadEmailHtml(lead: LeadRecord, env: Env) {
  const payload = safeJson(lead.payloadJson) as Record<string, any> | null;
  const firstService = Array.isArray(payload?.services) ? payload?.services[0] : null;
  const declaredCertifications = Array.isArray(payload?.certifications) ? payload.certifications.join(", ") : "";
  const serviceSummary = Array.isArray(payload?.services)
    ? payload.services
        .map((service: Record<string, unknown>) =>
          [service.serviceName, service.specialistExpectedPayoutCLP ? `$${service.specialistExpectedPayoutCLP}` : "", service.duration, service.calculatedClientCredits ? `${service.calculatedClientCredits} creditos internos` : ""]
            .filter(Boolean)
            .join(" · "),
        )
        .join(" | ")
    : "";
  const rows: Array<[string, string | number | undefined]> = [
    ["ID", lead.id],
    ["Tipo", lead.leadType],
    ["Nombre", lead.fullName],
    ["Teléfono", lead.phone],
    ["Email", lead.email],
    ["Empresa", lead.companyName],
    ["Servicio/oficio", lead.service || lead.trade],
    ["Región", lead.regionName || lead.regionCode],
    ["Comuna", lead.communeName || lead.communeCode],
    ["Descripción", lead.problemDescription],
    ["Urgencia", lead.urgency],
    ["Especialista", lead.specialistName || lead.specialistId],
    ["Fecha/hora", [lead.requestedDate, lead.requestedTime].filter(Boolean).join(" ")],
    ["Créditos", String(lead.creditsEstimate ?? "")],
    ["Tarifa esperada CLP", firstService?.specialistExpectedPayoutCLP ? `$${firstService.specialistExpectedPayoutCLP}` : ""],
    ["Creditos calculados internos", firstService?.calculatedClientCredits],
    ["Certificaciones declaradas", declaredCertifications || (payload?.hasNoFormalCertifications ? "No tiene certificaciones formales" : "")],
    ["Sin certificaciones formales", payload?.hasNoFormalCertifications ? "Si" : ""],
    ["Servicios postulados", serviceSummary],
    ["Disponibilidad", payload?.availability],
    ["Comentarios", payload?.notes],
    ["Estado revision", payload?.reviewStatus ?? lead.status],
    ["Fuente", [lead.sourcePage, lead.sourceComponent, lead.sourceButton].filter(Boolean).join(" · ")],
  ];
  const table = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(String(label ?? ""))}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(String(value ?? ""))}</td></tr>`)
    .join("");
  const title = subjectForLead(lead);
  const adminUrl = `${(env.APP_BASE_URL ?? "https://oficiospro.cl").replace(/\/$/, "")}/admin/leads`;
  return `<div style="font-family:Arial,sans-serif;color:#0f172a"><!-- ${escapeHtml(legacySpecialistEmailSubject)} --><h1>${escapeHtml(title)}</h1><p>Revisar en admin con ID <strong>${escapeHtml(lead.id)}</strong>: <a href="${escapeHtml(adminUrl)}">${escapeHtml(adminUrl)}</a></p><table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:760px">${table}</table></div>`;
}

function priorityFor(urgency?: string) {
  const value = (urgency ?? "").toLowerCase();
  if (value.includes("hoy") || value.includes("urg")) return "alta";
  return "normal";
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maxLength) || undefined;
}

function sanitizeEmail(value: unknown) {
  const text = sanitizeText(value, 180);
  if (!text) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text.toLowerCase() : undefined;
}

function isValidEmail(value: unknown) {
  return Boolean(sanitizeEmail(value));
}

function isValidPhone(value: unknown) {
  const text = sanitizeText(value, 40);
  return Boolean(text && /^[+0-9()\s-]{8,24}$/.test(text));
}

function isValidRutFormat(value: string) {
  return /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$/.test(value.trim());
}

function sanitizePayloadObject(value: unknown, depth = 0): unknown {
  if (depth > 6) return undefined;
  if (typeof value === "string") return sanitizeText(value, 4000) ?? "";
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean" || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizePayloadObject(item, depth + 1));
  if (typeof value !== "object") return undefined;

  const dangerousKeys = new Set(["role", "isadmin", "admin", "token", "authorization", "password", "admin_token", "admin_api_token"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !dangerousKeys.has(key.toLowerCase()))
      .slice(0, 80)
      .map(([key, item]) => [sanitizeText(key, 80) ?? "field", sanitizePayloadObject(item, depth + 1)]),
  );
}

function redactSensitive(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\b(\d{1,2})\.?\d{3}\.?\d{3}-?[\dkK]\b/g, "$1.***.***-*")
      .replace(/\b([^@\s])[^@\s]*@([^@\s]+\.[^@\s]+)\b/g, "$1***@$2")
      .replace(/(\+?56\s?9\s?)\d{4}\s?(\d{4})/g, "$1**** $2")
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
  }
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      /token|secret|password|authorization|rut|phone|whatsapp|email|cedula|selfie|idfront|idback/i.test(key) ? "[REDACTED]" : redactSensitive(item),
    ]),
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function createCheckout(request: Request, env: Env) {
  const body = await readJsonBody<CheckoutRequest>(request);
  await enforceRateLimit(request, "payments:create-checkout", { email: body.email, phone: body.whatsapp, limit: 10, windowMs: 60 * 60 * 1000 });
  validateCheckoutRequest(body, "checkout");
  const provider = normalizePaymentProvider(body.provider);
  if (provider !== "mercado_pago") return providerPreparing(provider);
  const pack = findCreditPack(body.creditPackId, body.creditsPack);
  const isCreditsPurchase = Boolean(pack);
  const plan = isCreditsPurchase ? findPlan(body.planId) : findPlanStrict(body.planId);
  const paymentIntent = createWorkerPaymentIntent({
    provider,
    userId: body.userId ?? body.email ?? "cliente-oficiospro",
    userRole: plan.audience === "empresa" ? "company" : "client",
    amountCLP: pack?.amountCLP ?? plan.priceCLP,
    credits: pack?.credits ?? plan.monthlyCredits,
    type: isCreditsPurchase ? "credit_pack" : "subscription_plan",
    metadata: {
      planId: plan.id,
      creditPackId: pack?.id ?? null,
      paymentContext: sanitizeText(String((body as Record<string, unknown>).paymentContext ?? ""), 80),
    },
  });
  await bestEffortPersistPaymentIntent(env, paymentIntent);
  const itemTitle = pack?.title ?? plan.name;
  const itemPrice = paymentIntent.amountCLP;
  const itemDescription = isCreditsPurchase
    ? "Compra puntual de creditos para reservar servicios tecnicos"
    : `${plan.monthlyCredits} creditos OficiosPro acumulables por ${plan.accumulatesMonths} meses`;
  const baseUrl = getBaseUrl(request, env);

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return paymentsPreparing(plan, "checkout", pack ?? undefined, paymentIntent);
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
    external_reference: paymentIntent.id,
    metadata: {
      payment_intent_id: paymentIntent.id,
      plan_id: plan.id,
      credits_per_month: isCreditsPurchase ? 0 : plan.monthlyCredits,
      credit_pack_id: pack?.id ?? "",
      credits_pack: pack?.credits ?? 0,
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
  await bestEffortUpdatePaymentExternalId(env, paymentIntent.id, textFrom(response.id));
  return json({
    ok: true,
    provider: "mercado_pago",
    type: "checkout",
    plan,
    paymentIntent,
    preferenceId: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    status: "created",
  });
}

async function createSubscription(request: Request, env: Env) {
  const body = await readJsonBody<CheckoutRequest>(request);
  await enforceRateLimit(request, "payments:create-subscription", { email: body.email, phone: body.whatsapp, limit: 10, windowMs: 60 * 60 * 1000 });
  validateCheckoutRequest(body, "subscription");
  const provider = normalizePaymentProvider(body.provider);
  if (provider !== "mercado_pago") return providerPreparing(provider);
  const plan = findPlanStrict(body.planId);
  const baseUrl = getBaseUrl(request, env);
  const paymentIntent = createWorkerPaymentIntent({
    provider,
    userId: body.userId ?? body.email ?? "cliente-oficiospro",
    userRole: plan.audience === "empresa" ? "company" : "client",
    amountCLP: plan.priceCLP,
    credits: plan.monthlyCredits,
    type: "subscription_plan",
    metadata: { planId: plan.id, planName: plan.name },
  });
  await bestEffortPersistPaymentIntent(env, paymentIntent);

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return paymentsPreparing(plan, "subscription", undefined, paymentIntent);
  }

  const startDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const preapproval = {
    reason: `${plan.name} OficiosPro`,
    external_reference: paymentIntent.id,
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
      payment_intent_id: paymentIntent.id,
      plan_id: plan.id,
      credits_per_month: plan.monthlyCredits,
      rut: body.rut ?? "",
      whatsapp: body.whatsapp ?? "",
      commune: body.commune ?? "",
    },
  };

  const response = await mercadoPagoFetch(env, "/preapproval", preapproval);
  await bestEffortUpdatePaymentExternalId(env, paymentIntent.id, textFrom(response.id));
  return json({
    ok: true,
    provider: "mercado_pago",
    type: "subscription",
    plan,
    paymentIntent,
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
  const eventId = `mercado_pago:${topic}:${dataId ?? "sin-id"}`;
  const hasWebhookSecret = Boolean(env.MERCADOPAGO_WEBHOOK_SECRET);
  const memoryDuplicate = processedWebhookEvents.has(eventId);
  if (!memoryDuplicate) processedWebhookEvents.add(eventId);
  const durableWebhook = await bestEffortRecordWebhookEvent(env, {
    eventId,
    topic,
    dataId: dataId ? String(dataId) : "",
    verified,
    payload,
    memoryDuplicate,
  });
  const duplicate = durableWebhook?.duplicate ?? memoryDuplicate;

  return json({
    ok: true,
    received: true,
    verified,
    security: hasWebhookSecret ? "signature_checked" : "webhook_secret_not_configured",
    canApprovePayment: hasWebhookSecret && !duplicate,
    duplicate,
    eventId,
    topic,
    dataId,
    action: duplicate ? "already_processed" : hasWebhookSecret ? inferWebhookAction(topic, payload) : "store_event_for_reconciliation",
    idempotencyKey: eventId,
    creditOperation: hasWebhookSecret && !duplicate ? inferCreditOperation(topic, payload) : "none",
  });
}

async function paymentStatus(url: URL, env: Env) {
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type") ?? "payment";

  if (!id) return json({ ok: false, error: "missing_payment_id" }, 400);
  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return json({ ok: true, status: "preparing", provider: "mercado_pago", id, type });
  }

  const endpoint = type === "subscription" ? `/preapproval/${id}` : `/v1/payments/${id}`;
  const response = await mercadoPagoGet(env, endpoint);
  return json({ ok: true, provider: "mercado_pago", type, data: response });
}

async function addCredits(request: Request, env: Env) {
  const body = await readJsonBody<{ userId?: string; amount?: number; reason?: string; relatedPaymentId?: string }>(request);
  const amount = normalizeCredits(body.amount);
  const userId = sanitizeText(body.userId, 160) ?? "current-user";
  if (env.DB) {
    const wallet = await bestEffortApplyCreditLedger(env.DB, {
      userId,
      amountCredits: amount,
      type: "admin_adjustment",
      relatedPaymentId: body.relatedPaymentId,
      description: body.reason ?? "Ajuste administrativo de creditos",
      idempotencyKey: `admin-add:${body.relatedPaymentId ?? crypto.randomUUID()}:${amount}`,
    });
    if (wallet) return json({ ok: true, wallet, stored: true });
  }
  return json({
    ok: true,
    stored: false,
    wallet: {
      userId,
      added: amount,
      currentBalance: amount,
      availableCredits: amount,
      reservedCredits: 0,
      expiringCreditsTotal: amount,
      lifetimePurchased: amount,
      lifetimeUsed: 0,
      expiringCredits: [{ amount, expiresAt: addMonths(new Date(), 24).toISOString() }],
      updatedAt: new Date().toISOString(),
    },
    transaction: creditTransaction("subscription_credit", amount, body.relatedPaymentId, body.reason),
  });
}

async function useCredits(request: Request, env: Env) {
  const body = await readJsonBody<{ userId?: string; amount?: number; action?: "hold" | "capture" | "refund"; relatedServiceRequestId?: string }>(request);
  const amount = normalizeCredits(body.amount);
  const type = body.action === "refund" ? "refund" : body.action === "capture" ? "service_capture" : "service_hold";
  const userId = sanitizeText(body.userId, 160) ?? "current-user";
  if (env.DB) {
    const signedAmount = type === "refund" ? amount : -amount;
    const wallet = await bestEffortApplyCreditLedger(env.DB, {
      userId,
      amountCredits: signedAmount,
      type,
      relatedServiceRequestId: body.relatedServiceRequestId,
      description: body.relatedServiceRequestId ?? "Movimiento de creditos",
      idempotencyKey: `${type}:${body.relatedServiceRequestId ?? crypto.randomUUID()}:${amount}`,
    });
    if (wallet) return json({ ok: true, wallet, stored: true });
  }
  return json({
    ok: true,
    stored: false,
    wallet: {
      userId,
      used: type === "refund" ? 0 : amount,
      returned: type === "refund" ? amount : 0,
      currentBalance: 0,
      availableCredits: type === "refund" ? amount : 0,
      reservedCredits: body.action === "hold" ? amount : 0,
      expiringCreditsTotal: 0,
      lifetimePurchased: 0,
      lifetimeUsed: body.action === "capture" ? amount : 0,
      updatedAt: new Date().toISOString(),
    },
    transaction: {
      ...creditTransaction(type, type === "refund" ? amount : -amount, undefined, body.relatedServiceRequestId),
      relatedServiceRequestId: body.relatedServiceRequestId ?? null,
    },
  });
}

async function getWallet(url: URL, env: Env) {
  const userId = url.searchParams.get("userId") ?? "current-user";
  if (env.DB) {
    const wallet = await bestEffortReadCreditWallet(env.DB, userId);
    if (wallet) return json({ ok: true, wallet, stored: true });
  }
  return json({
    ok: true,
    stored: false,
    wallet: {
      userId,
      currentBalance: 0,
      availableCredits: 0,
      reservedCredits: 0,
      expiringCreditsTotal: 0,
      lifetimePurchased: 0,
      lifetimeUsed: 0,
      expiringCredits: [],
      updatedAt: new Date().toISOString(),
    },
  });
}

async function reconcilePayments(request: Request) {
  const body = await readJsonBody<{ from?: string; to?: string }>(request);
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

function findPlanStrict(planId?: string | null) {
  const plan = plans.find((item) => item.id === planId);
  if (!plan) throw new SafeHttpError(400, "invalid_plan");
  return plan;
}

function findCreditPack(creditPackId?: string | null, creditsPack?: number | string | null) {
  if (creditPackId) {
    const pack = creditPacks.find((item) => item.id === creditPackId);
    if (!pack) throw new SafeHttpError(400, "invalid_credit_pack");
    return pack;
  }
  if (creditsPack === undefined || creditsPack === null || creditsPack === "") return null;
  const credits = Number(creditsPack);
  const pack = creditPacks.find((item) => item.credits === credits);
  if (!pack) throw new SafeHttpError(400, "invalid_credit_pack");
  return pack;
}

function normalizePaymentProvider(provider?: string | null): PaymentProvider {
  if (!provider || provider === "mercadopago") return "mercado_pago";
  if (provider === "mercado_pago" || provider === "transbank_webpay" || provider === "manual_bank_transfer" || provider === "internal_adjustment") {
    return provider;
  }
  throw new SafeHttpError(400, "invalid_payment_provider");
}

function createWorkerPaymentIntent({
  provider,
  userId,
  userRole,
  amountCLP,
  credits,
  type,
  metadata,
}: {
  provider: PaymentProvider;
  userId: string;
  userRole: PaymentIntent["userRole"];
  amountCLP: number;
  credits: number;
  type: PaymentIntent["type"];
  metadata: Record<string, unknown>;
}): PaymentIntent {
  const now = new Date().toISOString();
  return {
    id: `pi-op-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    provider,
    userId: sanitizeText(userId, 140) ?? "cliente-oficiospro",
    userRole,
    amountCLP: Math.max(0, Math.round(amountCLP)),
    credits: Math.max(0, Math.round(credits)),
    currency: "CLP",
    type,
    status: "pending",
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

async function bestEffortPersistPaymentIntent(env: Env, intent: PaymentIntent) {
  if (!env.DB) return;
  try {
    await env.DB
      .prepare(
        `INSERT OR REPLACE INTO payment_intents (
          id, provider, externalPaymentId, userId, userRole, amountCLP, credits, currency, type, status, idempotencyKey, metadataJson, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        intent.id,
        intent.provider,
        intent.externalPaymentId ?? null,
        intent.userId,
        intent.userRole,
        intent.amountCLP,
        intent.credits,
        intent.currency,
        intent.type,
        intent.status,
        intent.id,
        JSON.stringify(redactSensitive(intent.metadata)),
        intent.createdAt,
        intent.updatedAt,
      )
      .run();
  } catch {
    // Payment creation must keep working while the operational migration is being rolled out.
  }
}

async function bestEffortUpdatePaymentExternalId(env: Env, paymentIntentId: string, externalId?: string) {
  if (!env.DB || !externalId) return;
  try {
    await env.DB.prepare("UPDATE payment_intents SET externalPaymentId = ?, updatedAt = ? WHERE id = ?").bind(String(externalId), new Date().toISOString(), paymentIntentId).run();
  } catch {
    // Best effort only.
  }
}

async function bestEffortRecordWebhookEvent(
  env: Env,
  input: { eventId: string; topic: string; dataId: string; verified: boolean; payload: unknown; memoryDuplicate: boolean },
) {
  if (!env.DB) return null;
  try {
    const existing = await env.DB.prepare("SELECT id FROM webhook_events WHERE provider = ? AND providerEventId = ?").bind("mercado_pago", input.eventId).first();
    const duplicate = Boolean(existing) || input.memoryDuplicate;
    await env.DB
      .prepare(
        `INSERT OR IGNORE INTO webhook_events (
          id, provider, providerEventId, topic, dataId, verified, duplicate, processed, payloadJson, receivedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        `wh_${crypto.randomUUID()}`,
        "mercado_pago",
        input.eventId,
        input.topic,
        input.dataId,
        input.verified ? 1 : 0,
        duplicate ? 1 : 0,
        0,
        JSON.stringify(redactSensitive(input.payload)),
        new Date().toISOString(),
      )
      .run();
    return { duplicate };
  } catch {
    return null;
  }
}

async function bestEffortReadCreditWallet(db: D1Database, userId: string) {
  try {
    const row = await db.prepare("SELECT * FROM credit_wallets WHERE userId = ?").bind(userId).first<Record<string, unknown>>();
    return row ? publicWalletFromRow(row) : null;
  } catch {
    return null;
  }
}

async function bestEffortApplyCreditLedger(
  db: D1Database,
  input: {
    userId: string;
    amountCredits: number;
    type: string;
    relatedPaymentId?: string;
    relatedServiceRequestId?: string;
    description?: string;
    idempotencyKey: string;
  },
) {
  try {
    const now = new Date().toISOString();
    await db
      .prepare("INSERT OR IGNORE INTO users (id, role, email, name, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(input.userId, "customer", isValidEmail(input.userId) ? input.userId : null, input.userId, "active", now, now)
      .run();

    const current =
      (await db.prepare("SELECT * FROM credit_wallets WHERE userId = ?").bind(input.userId).first<Record<string, unknown>>()) ?? {
        availableCredits: 0,
        reservedCredits: 0,
        expiringCredits: 0,
        lifetimePurchased: 0,
        lifetimeUsed: 0,
      };
    let available = numberFrom(current.availableCredits) + input.amountCredits;
    let reserved = numberFrom(current.reservedCredits);
    let lifetimePurchased = numberFrom(current.lifetimePurchased);
    let lifetimeUsed = numberFrom(current.lifetimeUsed);

    if (input.type === "service_hold") {
      available = Math.max(0, numberFrom(current.availableCredits) + input.amountCredits);
      reserved = numberFrom(current.reservedCredits) + Math.abs(input.amountCredits);
    } else if (input.type === "service_capture") {
      reserved = Math.max(0, numberFrom(current.reservedCredits) - Math.abs(input.amountCredits));
      lifetimeUsed += Math.abs(input.amountCredits);
    } else if (input.amountCredits > 0) {
      lifetimePurchased += input.amountCredits;
    }

    await db
      .prepare(
        `INSERT INTO credit_wallets (id, userId, availableCredits, reservedCredits, expiringCredits, lifetimePurchased, lifetimeUsed, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(userId) DO UPDATE SET availableCredits = excluded.availableCredits, reservedCredits = excluded.reservedCredits,
         expiringCredits = excluded.expiringCredits, lifetimePurchased = excluded.lifetimePurchased, lifetimeUsed = excluded.lifetimeUsed, updatedAt = excluded.updatedAt`,
      )
      .bind(`wallet_${input.userId}`, input.userId, Math.max(0, available), Math.max(0, reserved), numberFrom(current.expiringCredits), lifetimePurchased, lifetimeUsed, now)
      .run();

    await db
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger_entries (
          id, userId, userRole, type, amountCredits, balanceAfter, relatedPaymentId, relatedServiceRequestId, description, idempotencyKey, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        `cle_${crypto.randomUUID()}`,
        input.userId,
        "customer",
        input.type,
        input.amountCredits,
        Math.max(0, available),
        input.relatedPaymentId ?? null,
        input.relatedServiceRequestId ?? null,
        input.description ?? "",
        input.idempotencyKey,
        now,
      )
      .run();

    const row = await db.prepare("SELECT * FROM credit_wallets WHERE userId = ?").bind(input.userId).first<Record<string, unknown>>();
    return row ? publicWalletFromRow(row) : null;
  } catch {
    return null;
  }
}

function publicWalletFromRow(row: Record<string, unknown>) {
  const availableCredits = numberFrom(row.availableCredits);
  const reservedCredits = numberFrom(row.reservedCredits);
  return {
    ...row,
    currentBalance: availableCredits,
    availableCredits,
    reservedCredits,
    heldCredits: reservedCredits,
    expiringCreditsTotal: numberFrom(row.expiringCredits),
    expiringCredits: [],
    lifetimePurchased: numberFrom(row.lifetimePurchased),
    lifetimeUsed: numberFrom(row.lifetimeUsed),
  };
}

async function bestEffortAdminAudit(
  db: D1Database,
  request: Request,
  input: { action: string; entityType: string; entityId?: string; beforeJson?: string; afterJson?: string },
) {
  try {
    await db
      .prepare("INSERT INTO admin_audit_log (id, adminId, action, entityType, entityId, beforeJson, afterJson, ip, userAgent, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(
        `audit_${crypto.randomUUID()}`,
        "admin_token",
        input.action,
        input.entityType,
        input.entityId ?? null,
        input.beforeJson ?? null,
        input.afterJson ?? null,
        clientIp(request),
        request.headers.get("user-agent") ?? "",
        new Date().toISOString(),
      )
      .run();
  } catch {
    // Best effort only.
  }
}

async function bestEffortEmailDeliveryLog(
  db: D1Database,
  input: { template: string; recipient?: string; relatedEntityType?: string; relatedEntityId?: string; status: string; error?: string },
) {
  try {
    await db
      .prepare("INSERT INTO email_delivery_log (id, template, recipient, relatedEntityType, relatedEntityId, provider, status, error, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(
        `email_${crypto.randomUUID()}`,
        input.template,
        input.recipient ?? "",
        input.relatedEntityType ?? "",
        input.relatedEntityId ?? "",
        "resend",
        input.status,
        input.error ?? null,
        new Date().toISOString(),
      )
      .run();
  } catch {
    // Best effort only.
  }
}

function validateCheckoutRequest(body: CheckoutRequest, mode: "checkout" | "subscription") {
  normalizePaymentProvider(body.provider);
  const hasCreditPack = Boolean(body.creditPackId || body.creditsPack !== undefined);
  if (mode === "subscription" || !hasCreditPack) {
    if (!body.planId || !plans.some((plan) => plan.id === body.planId)) throw new SafeHttpError(400, "invalid_plan");
  }
  if (mode === "subscription" && !body.email) throw new SafeHttpError(400, "missing_required_fields");
  if (body.email && !isValidEmail(body.email)) throw new SafeHttpError(400, "invalid_email");
  if (body.whatsapp && !isValidPhone(body.whatsapp)) throw new SafeHttpError(400, "invalid_phone");
  if (body.rut && !isValidRutFormat(body.rut)) throw new SafeHttpError(400, "invalid_rut");
  if (mode === "checkout" && hasCreditPack) findCreditPack(body.creditPackId, body.creditsPack);
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

function paymentsPreparing(plan: Plan, type: "checkout" | "subscription", pack?: CreditPack, paymentIntent?: PaymentIntent) {
  return json({
    ok: false,
    provider: "mercado_pago",
    type,
    status: "preparing",
    code: "payments_not_configured",
    message: "Pago en preparacion",
    plan,
    paymentIntent,
    creditsPack: pack?.credits ?? null,
    creditPackId: pack?.id ?? null,
  });
}

function providerPreparing(provider: PaymentProvider) {
  return json({
    ok: false,
    provider,
    status: "preparing",
    code: provider === "transbank_webpay" ? "provider_pending_credentials" : "provider_not_available",
    message: provider === "transbank_webpay" ? "Transbank preparado, pendiente credenciales." : "Proveedor no disponible para checkout publico.",
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
    throw new Error(`Mercado Pago ${response.status}: ${JSON.stringify(redactSensitive(payload))}`);
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
    throw new Error(`Mercado Pago ${response.status}: ${JSON.stringify(redactSensitive(payload))}`);
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
  if (!Number.isFinite(value) || value <= 0) throw new SafeHttpError(400, "credit_amount_invalid");
  if (value % 2 !== 0) throw new SafeHttpError(400, "credits_must_be_even");
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

function tableToResponseKey(table: string) {
  if (table === "specialist_applications") return "specialistApplications";
  if (table === "customer_leads") return "customerLeads";
  if (table === "company_leads") return "companyLeads";
  if (table === "service_requests") return "serviceRequests";
  return "conversionEvents";
}

function leadPayload(lead: LeadRecord) {
  return normalizeNestedRecord(safeJson(lead.payloadJson));
}

function normalizeNestedRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textFrom(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberFrom(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) ?? "" };
}

function sourceForLead(lead: LeadRecord) {
  return [lead.sourcePage, lead.sourceComponent, lead.sourceButton].filter(Boolean).join(" · ");
}

function specialistWorkerSlug(name: string, specialty: string, commune: string, fallback: string) {
  return [name, specialty, commune].filter(Boolean).join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;
}

function specialistWorkerMissingRequirements(row: Record<string, unknown>) {
  const identity = normalizeNestedRecord(safeJson(String(row.identityVerificationJson ?? "{}")));
  const references = String(row.referencesJson ?? "");
  const services = String(row.servicesOffered ?? "");
  const missing = [
    textFrom(identity.profilePhotoUrl) ? "" : "Foto pública",
    textFrom(identity.idFrontUrl) ? "" : "Cédula frontal",
    textFrom(identity.idBackUrl) ? "" : "Cédula reverso",
    textFrom(identity.selfieUrl) ? "" : "Selfie de verificación",
    textFrom(identity.verificationStatus) === "approved" ? "" : "Identidad aprobada",
    references.split(" - ").length >= 3 || references.includes("\\n") ? "" : "3 referencias completas",
    services ? "" : "Servicios declarados",
    row.comuna ? "" : "Comuna y cobertura",
    Number(row.credits ?? 0) > 0 || row.priceMode === "quote_required" ? "" : "Precios o modalidad de cotización",
  ].filter(Boolean);
  return missing;
}

function toPublicSpecialist(row: Record<string, any>) {
  const payload = normalizeNestedRecord(safeJson(String(row.payloadJson ?? "{}")));
  const services = asArray(safeJson(String(row.servicesOffered ?? "[]"))).map((service) => asRecord(service));
  const firstService = services[0] ?? {};
  const fullName = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || "Especialista OficiosPro";
  const serviceName = textFrom(firstService.serviceName) || textFrom(row.specialties) || "Servicio verificado";
  const serviceTypeId = textFrom(firstService.serviceTypeId) || textFrom(payload.primaryTrade) || "hogar";
  const credits = numberFrom(firstService.calculatedClientCredits) || numberFrom(row.credits) || 20;
  const commune = textFrom(row.comuna) || "Chile";
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return {
    id: String(row.slug ?? row.id),
    slug: String(row.slug ?? row.id),
    publicationStatus: String(row.publicationStatus ?? row.status ?? "published") as any,
    name: fullName,
    initials: initials || "OP",
    category: textFrom(row.serviceTypes) || serviceName,
    serviceType: textFrom(row.serviceTypes) || serviceName,
    serviceTypeId,
    specialty: serviceName,
    specialties: textFrom(row.specialties).split(",").map((item) => item.trim()).filter(Boolean),
    servicesOffered: services.map((service) => textFrom(service.serviceName)).filter(Boolean),
    description: "Especialista aprobado por OficiosPro.",
    zone: commune,
    commune,
    region: textFrom(row.region),
    rating: 4.8,
    reviews: 0,
    credits,
    responseTime: "24",
    distance: 0,
    verified: true,
    availability: "today",
    badges: ["Verificado OficiosPro"],
    coverageRadiusKm: numberFrom(row.coverageRadiusKm) || 18,
    servicePricing: services.map((service, index) => ({
      id: textFrom(service.serviceTypeId) || `${row.id}-service-${index}`,
      name: textFrom(service.serviceName) || serviceName,
      pricingMode: textFrom(service.pricingMode) || "fixed",
      fixedCredits: numberFrom(service.calculatedClientCredits) || credits,
      minCredits: numberFrom(service.calculatedClientCredits) || credits,
      visitCredits: numberFrom(service.calculatedClientCredits) || credits,
      description: textFrom(service.serviceDescription),
      minHours: numberFrom(service.minHours) || undefined,
      maxHours: numberFrom(service.maxHours) || undefined,
      emergency: Boolean(service.emergencyAvailable),
    })),
  };
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
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,x-admin-token,x-signature,x-request-id");
  return withSecurityHeaders(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
}

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=(self)");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.mercadopago.com https://*.mercadopago.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com",
      "frame-src https://www.mercadopago.com https://*.mercadopago.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.mercadopago.com https://*.mercadopago.com",
    ].join("; "),
  );
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
