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
  APP_BASE_URL?: string;
  ADMIN_API_TOKEN?: string;
  ADMIN_TOKEN?: string;
  EMAIL_PROVIDER_API_KEY?: string;
  NOTIFICATION_TO_EMAIL?: string;
  NOTIFICATION_CC_EMAIL?: string;
  FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
  LEADS_TO_EMAIL?: string;
  LEADS_FROM_EMAIL?: string;
  LEADS_REPLY_TO_EMAIL?: string;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

      try {
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
        if (url.pathname === "/api/contact" && request.method === "POST") {
          return withCors(await createLead(request, env, "contact_message"));
        }
        if (url.pathname === "/api/specialists" && request.method === "GET") {
          return withCors(await listPublicSpecialists(env));
        }
        if (url.pathname === "/api/admin/leads" && request.method === "GET") {
          return withCors(await listAdminLeads(request, env));
        }
        if (url.pathname === "/api/admin/specialist-applications" && request.method === "GET") {
          return withCors(await listAdminTable(request, env, "specialist_applications"));
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
          const auth = requireAdmin(request, env);
          if (auth) return withCors(auth);
          return withCors(await addCredits(request));
        }
        if (url.pathname === "/api/credits/use" && request.method === "POST") {
          const auth = requireAdmin(request, env);
          if (auth) return withCors(auth);
          return withCors(await useCredits(request));
        }
        if (url.pathname === "/api/credits/wallet" && request.method === "GET") {
          return withCors(await getWallet(url));
        }
        if (url.pathname === "/api/admin/payments/reconcile" && request.method === "POST") {
          const auth = requireAdmin(request, env);
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
  const auth = authorizeAdmin(request, env);
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
  const auth = authorizeAdmin(request, env);
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
  const auth = authorizeAdmin(request, env);
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

async function updateSpecialistApplicationStatus(request: Request, env: Env, id: string, action: string) {
  const auth = authorizeAdmin(request, env);
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

async function listPublicSpecialists(env: Env) {
  if (!env.DB) return json({ ok: true, specialists: [], stored: false, error: "database_not_configured" });
  const result = await env.DB.prepare("SELECT * FROM specialist_applications WHERE publicationStatus = 'published' AND status NOT IN ('deleted', 'suspended', 'unpublished', 'rejected') ORDER BY updatedAt DESC LIMIT 100").all();
  return json({ ok: true, specialists: (result.results ?? []).map(toPublicSpecialist), stored: true });
}

function authorizeAdmin(request: Request, env: Env) {
  return requireAdmin(request, env);
}

function requireAdmin(request: Request, env: Env) {
  const configuredToken = env.ADMIN_API_TOKEN ?? env.ADMIN_TOKEN;
  if (!configuredToken) return json({ ok: false, error: "admin_token_not_configured" }, 503);
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (!token || !timingSafeEqual(token, configuredToken)) return json({ ok: false, error: "unauthorized" }, 401);
  return null;
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
  const plan = findPlanStrict(body.planId);
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
  const body = await readJsonBody<CheckoutRequest>(request);
  await enforceRateLimit(request, "payments:create-subscription", { email: body.email, phone: body.whatsapp, limit: 10, windowMs: 60 * 60 * 1000 });
  validateCheckoutRequest(body, "subscription");
  const plan = findPlanStrict(body.planId);
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
  const hasWebhookSecret = Boolean(env.MERCADOPAGO_WEBHOOK_SECRET);

  return json({
    ok: true,
    received: true,
    verified,
    security: hasWebhookSecret ? "signature_checked" : "webhook_secret_not_configured",
    eventId,
    topic,
    dataId,
    action: hasWebhookSecret ? inferWebhookAction(topic, payload) : "store_event_for_reconciliation",
    idempotencyKey: eventId,
    creditOperation: hasWebhookSecret ? inferCreditOperation(topic, payload) : "none",
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
  const body = await readJsonBody<{ userId?: string; amount?: number; reason?: string; relatedPaymentId?: string }>(request);
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
  const body = await readJsonBody<{ userId?: string; amount?: number; action?: "hold" | "capture" | "refund"; relatedServiceRequestId?: string }>(request);
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

function validateCheckoutRequest(body: CheckoutRequest, mode: "checkout" | "subscription") {
  if (!body.planId || !plans.some((plan) => plan.id === body.planId)) throw new SafeHttpError(400, "invalid_plan");
  if (mode === "subscription" && !body.email) throw new SafeHttpError(400, "missing_required_fields");
  if (body.email && !isValidEmail(body.email)) throw new SafeHttpError(400, "invalid_email");
  if (body.whatsapp && !isValidPhone(body.whatsapp)) throw new SafeHttpError(400, "invalid_phone");
  if (body.rut && !isValidRutFormat(body.rut)) throw new SafeHttpError(400, "invalid_rut");
  if (mode === "checkout" && body.creditsPack !== undefined) {
    const creditsPack = Number(body.creditsPack);
    if (!Number.isFinite(creditsPack) || creditsPack <= 0 || creditsPack > 1000 || creditsPack % 2 !== 0) {
      throw new SafeHttpError(400, "invalid_credits_pack");
    }
  }
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
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,x-signature,x-request-id");
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
