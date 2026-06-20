"use client";

export const analyticsEventNames = [
  "page_view",
  "home_view",
  "specialist_home_cta_viewed",
  "click_search_specialist",
  "click_offer_services",
  "founder_landing_view",
  "founder_cta_click",
  "specialist_application_started",
  "specialist_application_step_started",
  "specialist_application_step_completed",
  "specialist_application_step_error",
  "specialist_application_submitted",
  "specialist_application_failed",
  "specialist_application_abandoned",
  "specialist_formalization_help_requested",
  "specialist_custom_trade_requested",
  "quick_lead_started",
  "quick_lead_submitted",
  "draft_profile_created",
  "draft_profile_completed",
  "whatsapp_contact_clicked",
  "campaign_link_copied",
  "referral_lead_submitted",
  "job_page_quick_lead_submitted",
  "founder_sticky_cta_clicked",
  "search_performed",
  "lead_submitted",
  "referral_link_created",
  "institution_contact_submitted",
  "specialist_assistant_opened",
  "specialist_assistant_question_asked",
  "specialist_assistant_answer_served",
  "specialist_assistant_escalated",
  "specialist_assistant_clicked_register",
  "specialist_assistant_clicked_email",
  "specialist_assistant_clicked_formalization",
  "assistant_opened",
  "assistant_question_asked",
  "assistant_intent_detected",
  "assistant_action_clicked",
  "assistant_escalated",
  "assistant_find_service_clicked",
  "assistant_offer_services_clicked",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number] | (string & {});

export type AnalyticsMetadata = Record<string, unknown>;

export type AttributionContext = {
  path: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  source: string;
  medium: string;
  campaign: string;
  referralCode: string;
  anonymousId: string;
  sessionId: string;
  timestamp: string;
};

export type AnalyticsEventInput = {
  eventName: AnalyticsEventName;
  source?: string;
  medium?: string;
  campaign?: string;
  sourceComponent?: string;
  sourceButton?: string;
  metadata?: AnalyticsMetadata;
};

const anonymousIdKey = "oficiospro.analytics.anonymousId";
const sessionIdKey = "oficiospro.analytics.sessionId";
const attributionStorageKey = "oficiospro.analytics.attribution";
const sensitiveMetadataKeys = new Set([
  "rut",
  "password",
  "token",
  "authorization",
  "admin_token",
  "admin_api_token",
  "secret",
  "idfront",
  "idback",
  "selfie",
  "document",
  "identityverification",
  "identitydocuments",
]);

export function analyticsContext() {
  return getAttributionContext();
}

export function getAttributionContext(): AttributionContext {
  if (typeof window === "undefined") {
    return {
      path: "",
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      source: "",
      medium: "",
      campaign: "",
      referralCode: "",
      anonymousId: "",
      sessionId: "",
      timestamp: new Date().toISOString(),
    };
  }

  const params = new URLSearchParams(window.location.search);
  const stored = readStoredAttribution();
  const current = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? params.get("utmContent") ?? "",
    source: params.get("source") ?? "",
    campaign: params.get("campaign") ?? "",
    referralCode: params.get("referralCode") ?? params.get("ref") ?? "",
  };
  const hasFreshAttribution = Object.values(current).some(Boolean);
  const merged = {
    utmSource: current.utmSource || stored.utmSource || "",
    utmMedium: current.utmMedium || stored.utmMedium || "",
    utmCampaign: current.utmCampaign || stored.utmCampaign || "",
    utmContent: current.utmContent || stored.utmContent || "",
    source: current.source || current.utmSource || stored.source || stored.utmSource || "direct",
    campaign: current.campaign || current.utmCampaign || stored.campaign || stored.utmCampaign || "",
    referralCode: current.referralCode || stored.referralCode || "",
  };
  if (hasFreshAttribution) writeStoredAttribution(merged);

  return {
    path: window.location.pathname,
    referrer: document.referrer || "",
    ...merged,
    medium: merged.utmMedium,
    anonymousId: stableBrowserId(anonymousIdKey, "anon"),
    sessionId: stableBrowserId(sessionIdKey, "sess", true),
    timestamp: new Date().toISOString(),
  };
}

export async function trackEvent(input: AnalyticsEventInput) {
  if (typeof window === "undefined") return { ok: false, stored: false, error: "server_context" };

  const context = analyticsContext();
  const body = {
    type: input.eventName,
    eventName: input.eventName,
    source: input.source ?? context.source ?? "direct",
    medium: input.medium ?? context.medium ?? "",
    campaign: input.campaign ?? context.campaign ?? "",
    page: context.path,
    path: context.path,
    referrer: context.referrer,
    utmSource: context.utmSource,
    utmMedium: context.utmMedium,
    utmCampaign: context.utmCampaign,
    utmContent: context.utmContent,
    referralCode: context.referralCode,
    anonymousId: context.anonymousId,
    sessionId: context.sessionId,
    timestamp: context.timestamp,
    sourceComponent: input.sourceComponent,
    sourceButton: input.sourceButton,
    payload: sanitizeAnalyticsMetadata({
      ...input.metadata,
      path: context.path,
      referrer: context.referrer,
      utmSource: context.utmSource,
      utmMedium: context.utmMedium,
      utmCampaign: context.utmCampaign,
      utmContent: context.utmContent,
      source: input.source ?? context.source,
      medium: input.medium ?? context.medium,
      campaign: input.campaign ?? context.campaign,
      referralCode: context.referralCode,
      anonymousId: context.anonymousId,
      sessionId: context.sessionId,
      timestamp: context.timestamp,
      sourceComponent: input.sourceComponent,
      sourceButton: input.sourceButton,
    }),
  };

  try {
    const response = await fetch("/api/conversion-events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: string; stored?: boolean; error?: string };
    return { ok: Boolean(data.ok) && response.ok, id: data.id, stored: Boolean(data.stored), error: data.error };
  } catch (error) {
    return { ok: false, stored: false, error: error instanceof Error ? error.message : "network_error" };
  }
}

export function trackPageView(eventName: AnalyticsEventName, metadata: AnalyticsMetadata = {}) {
  return trackEvent({ eventName, metadata });
}

export function sanitizeAnalyticsMetadata(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (typeof value === "string") return redactSensitiveText(value).slice(0, 500);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean" || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeAnalyticsMetadata(item, depth + 1));
  if (typeof value !== "object") return undefined;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !sensitiveMetadataKeys.has(key.toLowerCase().replace(/[^a-z0-9_]/g, "")))
      .slice(0, 40)
      .map(([key, item]) => [key.slice(0, 60), sanitizeAnalyticsMetadata(item, depth + 1)]),
  );
}

function readStoredAttribution() {
  try {
    return JSON.parse(window.sessionStorage.getItem(attributionStorageKey) ?? "{}") as Partial<AttributionContext>;
  } catch {
    return {};
  }
}

function writeStoredAttribution(context: Pick<AttributionContext, "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "source" | "campaign" | "referralCode">) {
  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(context));
  } catch {
    // Attribution storage is helpful for funnels, but analytics must still work without it.
  }
}

function stableBrowserId(key: string, prefix: string, session = false) {
  const storage = session ? window.sessionStorage : window.localStorage;
  const current = storage.getItem(key);
  if (current) return current;
  const id = `${prefix}_${crypto.randomUUID()}`;
  storage.setItem(key, id);
  return id;
}

function redactSensitiveText(value: string) {
  return value
    .replace(/\b(\d{1,2})\.?\d{3}\.?\d{3}-?[\dkK]\b/g, "$1.***.***-*")
    .replace(/\b([^@\s])[^@\s]*@([^@\s]+\.[^@\s]+)\b/g, "$1***@$2")
    .replace(/(cedula|selfie|documento|password|token|secret)[=:]\S+/gi, "$1=[redacted]");
}
