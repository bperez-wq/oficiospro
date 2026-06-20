"use client";

import { analyticsContext, getAttributionContext, sanitizeAnalyticsMetadata } from "@/lib/analytics";
import { leadMessageForResult, type LeadSubmissionPayload, type LeadSubmitResult } from "@/lib/leads";

const localLeadBackupKey = "oficiospro.leadSubmissions.localBackup";
const leadClientLoadedAt = Date.now();

const endpointByType: Record<LeadSubmissionPayload["leadType"], string> = {
  customer_request: "/api/jobs/request",
  specialist_application: "/api/specialists/apply",
  company_request: "/api/companies/lead",
  booking_request: "/api/service-requests/create",
  contact_message: "/api/contact",
  club_hogar_interest: "/api/customers/register-interest",
  payment_interest: "/api/leads",
};

function readLocalBackups() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(localLeadBackupKey) ?? "[]") as unknown[];
  } catch {
    return [];
  }
}

function backupLead(payload: LeadSubmissionPayload, result?: Partial<LeadSubmitResult>) {
  if (typeof window === "undefined") return;
  const backup = {
    ...payload,
    localCreatedAt: new Date().toISOString(),
    remoteId: result?.id ?? null,
    remoteOk: Boolean(result?.ok),
    remoteError: result?.error ?? null,
  };
  try {
    window.localStorage.setItem(localLeadBackupKey, JSON.stringify([backup, ...readLocalBackups()].slice(0, 50)));
  } catch {
    // Lead submission must not fail just because the browser cannot persist the local backup.
  }
}

function pageSource() {
  if (typeof window === "undefined") return {};
  const context = getAttributionContext();
  return {
    sourcePage: window.location.pathname,
    source: context.source || undefined,
    campaign: context.campaign || undefined,
    utmSource: context.utmSource || undefined,
    utmCampaign: context.utmCampaign || undefined,
    utmMedium: context.utmMedium || undefined,
    utmContent: context.utmContent || undefined,
    referralCode: context.referralCode || undefined,
  };
}

export async function submitLead(payload: LeadSubmissionPayload, endpoint = endpointByType[payload.leadType]) {
  const sourceContext = pageSource();
  const body: LeadSubmissionPayload = {
    ...sourceContext,
    ...payload,
    consentContact: payload.consentContact ?? true,
    consentTerms: payload.consentTerms ?? true,
    formStartedAt: new Date(leadClientLoadedAt).toISOString(),
    formElapsedMs: Date.now() - leadClientLoadedAt,
    payload: {
      attribution: sourceContext,
      ...(payload.payload ?? {}),
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as Partial<LeadSubmitResult>;
    const normalizedError = data.error ?? (!response.ok ? `http_${response.status}` : undefined);
    const result: LeadSubmitResult = {
      ok: Boolean(data.ok) && response.ok,
      id: data.id,
      stored: Boolean(data.stored),
      emailSent: Boolean(data.emailSent),
      emailError: data.emailError,
      error: normalizedError,
      message: leadMessageForResult({ ok: Boolean(data.ok) && response.ok, emailSent: Boolean(data.emailSent), error: normalizedError }),
    };
    backupLead(body, result);
    return result;
  } catch (error) {
    const result: LeadSubmitResult = {
      ok: false,
      error: error instanceof Error ? error.message : "network_error",
      message: leadMessageForResult({ ok: false }),
    };
    backupLead(body, result);
    return result;
  }
}

export async function submitConversionEvent(event: { type: string; source?: string; medium?: string; campaign?: string; sourceButton?: string; sourceComponent?: string; page?: string; data?: Record<string, unknown>; payload?: Record<string, unknown> }) {
  const context = analyticsContext();
  const body = {
    ...pageSource(),
    path: context.path,
    referrer: context.referrer,
    medium: context.medium,
    campaign: event.campaign ?? context.campaign,
    utmContent: context.utmContent,
    referralCode: context.referralCode,
    anonymousId: context.anonymousId,
    sessionId: context.sessionId,
    timestamp: context.timestamp,
    ...event,
    eventName: event.type,
    page: event.page ?? context.path,
    payload: sanitizeAnalyticsMetadata({
      ...(event.payload ?? event.data ?? {}),
      path: context.path,
      referrer: context.referrer,
      utmSource: context.utmSource,
      utmMedium: context.utmMedium,
      utmCampaign: context.utmCampaign,
      utmContent: context.utmContent,
      source: event.source ?? context.source,
      medium: event.medium ?? context.medium,
      campaign: event.campaign ?? context.campaign,
      referralCode: context.referralCode,
      anonymousId: context.anonymousId,
      sessionId: context.sessionId,
      timestamp: context.timestamp,
      sourceButton: event.sourceButton,
      sourceComponent: event.sourceComponent,
    }),
  };

  try {
    const response = await fetch("/api/conversion-events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: string; stored?: boolean; error?: string };
    return { ok: Boolean(data.ok) && response.ok, id: data.id, stored: Boolean(data.stored), error: data.error };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "network_error" };
  }
}
