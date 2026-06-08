"use client";

import { leadMessageForResult, type LeadSubmissionPayload, type LeadSubmitResult } from "@/lib/leads";

const localLeadBackupKey = "oficiospro.leadSubmissions.localBackup";

const endpointByType: Record<LeadSubmissionPayload["leadType"], string> = {
  customer_request: "/api/jobs/request",
  specialist_application: "/api/specialists/apply",
  company_request: "/api/companies/request",
  booking_request: "/api/bookings/request",
  contact_message: "/api/contact",
  club_hogar_interest: "/api/leads",
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
  const params = new URLSearchParams(window.location.search);
  return {
    sourcePage: window.location.pathname,
    utmSource: params.get("utm_source") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
  };
}

export async function submitLead(payload: LeadSubmissionPayload, endpoint = endpointByType[payload.leadType]) {
  const body: LeadSubmissionPayload = {
    ...pageSource(),
    ...payload,
    consentContact: payload.consentContact ?? true,
    consentTerms: payload.consentTerms ?? true,
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
