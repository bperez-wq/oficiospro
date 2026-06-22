import fs from "node:fs";
import path from "node:path";

export const businessHealthEndpoints = {
  conversionEvents: "/api/admin/conversion-events?limit=1000",
  specialists: "/api/admin/specialists?limit=500",
  opportunities: "/api/admin/crm/opportunities?limit=500",
  tasks: "/api/admin/crm/tasks?limit=500",
  overview: "/api/admin/crm/overview",
};

export async function loadBusinessHealthSnapshot({ rootDir }) {
  const liveSnapshot = await maybeLoadLiveSnapshot();
  if (liveSnapshot) return liveSnapshot;

  const explicitInput = process.env.BUSINESS_HEALTH_INPUT;
  const fallbackInput = path.join(rootDir, "reports", "business-health", "input", "latest.json");
  const inputPath = explicitInput ? path.resolve(explicitInput) : fallbackInput;

  if (fs.existsSync(inputPath)) {
    const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    if (parsed.metrics) {
      return {
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        windowDays: Number(parsed.windowDays || 7),
        metrics: parsed.metrics,
        sources: parsed.sources || [path.relative(rootDir, inputPath)],
        notes: parsed.notes || [],
      };
    }
    return deriveSnapshotFromExport(parsed, path.relative(rootDir, inputPath));
  }

  const exportFiles = [
    ["conversionEvents", path.join(rootDir, "reports", "business-health", "input", "conversion-events.json")],
    ["specialists", path.join(rootDir, "reports", "business-health", "input", "specialists.json")],
    ["opportunities", path.join(rootDir, "reports", "business-health", "input", "opportunities.json")],
    ["tasks", path.join(rootDir, "reports", "business-health", "input", "tasks.json")],
    ["overview", path.join(rootDir, "reports", "business-health", "input", "overview.json")],
  ];
  const data = {};
  const sources = [];
  for (const [key, filePath] of exportFiles) {
    if (!fs.existsSync(filePath)) continue;
    data[key] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    sources.push(path.relative(rootDir, filePath));
  }
  if (sources.length) return deriveSnapshotFromExport(data, sources.join(", "));

  return emptySnapshot([
    "No local export or live admin source was found.",
    "Set BUSINESS_HEALTH_BASE_URL (or APP_BASE_URL) and ADMIN_TOKEN to read existing admin endpoints.",
    "All conclusions with missing evidence are marked as insufficient_data.",
  ]);
}

export async function collectLiveBusinessHealthSnapshot({ baseUrl, adminToken }) {
  if (!baseUrl || !adminToken) {
    throw new Error("BUSINESS_HEALTH_BASE_URL/APP_BASE_URL and ADMIN_TOKEN/ADMIN_API_TOKEN are required.");
  }

  const entries = await Promise.all(
    Object.entries(businessHealthEndpoints).map(async ([key, endpoint]) => [key, await fetchAdminJson(baseUrl, endpoint, adminToken)]),
  );
  const liveData = Object.fromEntries(entries);
  const origin = new URL(baseUrl).origin;
  const snapshot = deriveSnapshotFromExport(liveData, `${origin} admin endpoints`);
  return {
    ...snapshot,
    sources: [`${origin} admin endpoints`],
    notes: [
      "Live admin endpoints were read with ADMIN_TOKEN.",
      "Only aggregate metrics are written; raw rows and personal data are not persisted.",
    ],
  };
}

export function safeInputSnapshot(snapshot) {
  return {
    generatedAt: snapshot.generatedAt,
    windowDays: Number(snapshot.windowDays || 7),
    metrics: snapshot.metrics || {},
    sources: snapshot.sources || [],
    notes: [
      ...(snapshot.notes || []),
      "This file is safe to use as business-health input because it contains aggregate metrics only.",
    ],
  };
}

async function maybeLoadLiveSnapshot() {
  const baseUrl = process.env.BUSINESS_HEALTH_BASE_URL || process.env.APP_BASE_URL || process.env.TEST_BASE_URL || "";
  const adminToken = process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || "";
  const wantsLive = process.env.BUSINESS_HEALTH_SOURCE === "live" || Boolean(baseUrl || adminToken);

  if (!wantsLive) return null;

  if (!baseUrl || !adminToken) {
    if (process.env.BUSINESS_HEALTH_REQUIRE_LIVE === "true") {
      throw new Error("BUSINESS_HEALTH_REQUIRE_LIVE requires BUSINESS_HEALTH_BASE_URL/APP_BASE_URL and ADMIN_TOKEN.");
    }
    return emptySnapshot([
      "Live source was requested but BUSINESS_HEALTH_BASE_URL/APP_BASE_URL or ADMIN_TOKEN is missing.",
      "No admin token is printed or stored in the report.",
    ]);
  }

  return collectLiveBusinessHealthSnapshot({ baseUrl, adminToken });
}

async function fetchAdminJson(baseUrl, endpoint, adminToken) {
  const response = await fetch(new URL(endpoint, normalizeBaseUrl(baseUrl)), {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "x-admin-token": adminToken,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(`admin_endpoint_failed:${endpoint}:status_${response.status}:${data.error || "unknown_error"}`);
  }
  return data;
}

function deriveSnapshotFromExport(raw, sourceLabel) {
  const events = collectionFrom(raw, "conversionEvents", "events");
  const specialists = collectionFrom(raw, "specialists", "specialistApplications");
  const opportunities = collectionFrom(raw, "opportunities");
  const overview = nestedObjectFrom(raw.overview, "overview") || raw.overview || {};
  const eventCount = (names) => events.filter((event) => names.includes(eventName(event))).length;
  const founderLandingViews = eventCount(["founder_landing_view"]);
  const specialistApplicationStarts = eventCount(["specialist_application_started"]);
  const specialistApplicationsCompleted = Math.max(eventCount(["specialist_application_submitted"]), specialists.length);
  const onboardingLosses = eventCount(["specialist_application_abandoned", "specialist_application_failed", "specialist_application_step_error"]);
  const publishedSpecialists = specialists.filter(isPublishedSpecialist).length;
  const approvedSpecialists = specialists.filter(isApprovedSpecialist).length;
  const completeProfiles = specialists.filter(hasCompleteProfile).length;
  const searchesPerformed = eventCount(["search_performed", "click_search_specialist"]);
  const requestsSent = number(overview.newLeads) + opportunities.filter((row) => ["clientes", "empresas", "comunidades"].includes(String(row.pipeline || ""))).length;
  const b2bRequests = opportunities.filter((row) => ["empresas", "comunidades", "b2b"].includes(String(row.pipeline || "")) || String(row.type || "").includes("company")).length;
  const specialistsWithoutRequests = specialists.filter((row) => isPublishedSpecialist(row) && number(row.requestCount || row.requestsCount) === 0).length;
  const errors = eventCount(["specialist_application_failed", "lead_submit_failed", "checkout_failed", "payment_failed"]);

  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    sources: [sourceLabel],
    metrics: {
      founderLandingViews,
      offerServicesClicks: eventCount(["click_offer_services", "founder_cta_click"]),
      specialistApplicationStarts,
      specialistApplicationsCompleted,
      approvedSpecialists,
      publishedSpecialists,
      coverageByTradeCommune: uniqueCoverage(specialists),
      specialistsWithCompleteProfileRate: ratio(completeProfiles, specialists.length),
      specialistApplicationSubmitRate: ratio(specialistApplicationsCompleted, founderLandingViews),
      onboardingFrictionRate: ratio(onboardingLosses, specialistApplicationStarts),
      leadQualityRate: ratio(completeProfiles, specialistApplicationsCompleted),
      specialistsPageViews: eventCount(["specialists_page_view", "page_view_especialistas"]),
      searchesPerformed,
      profilesViewed: eventCount(["specialist_profile_view", "profile_view"]),
      specialistsAddedToBag: eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"]),
      quotesStarted: eventCount(["virtual_quote_started", "quote_started"]),
      requestsSent,
      servicesCompleted: number(overview.completedServices),
      bagToRequestRate: ratio(requestsSent, eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"])),
      demandWithoutSupplyCount: number(overview.supplyGapRequests),
      specialistsWithoutRequestsRate: ratio(specialistsWithoutRequests, publishedSpecialists),
      searchToRequestRate: ratio(requestsSent, searchesPerformed),
      requestToServiceRate: ratio(number(overview.completedServices), requestsSent),
      supplyGapRequests: number(overview.supplyGapRequests),
      gmvCLP: number(overview.gmvCLP),
      platformCommissionNetCLP: number(overview.platformCommissionNetCLP),
      takeRate: ratio(number(overview.platformCommissionNetCLP), number(overview.gmvCLP)),
      creditsSold: number(overview.creditsSold),
      creditsUsed: number(overview.creditsUsed),
      clubRevenueCLP: number(overview.clubRevenueCLP),
      businessRevenueCLP: number(overview.businessRevenueCLP),
      b2bDemandShare: ratio(b2bRequests, requestsSent),
      validatedProfileRate: ratio(approvedSpecialists, specialists.length),
      errorCount: errors,
      complaintsCount: number(overview.complaintsCount),
      cancellationsCount: number(overview.cancellationsCount),
      blockedPaymentsCount: number(overview.paymentIssues),
      pendingDocumentsCount: number(overview.pendingDocumentsCount),
      fraudAlertsCount: number(overview.fraudAlertsCount),
    },
  };
}

function emptySnapshot(notes) {
  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    metrics: {},
    sources: [],
    notes,
  };
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function collectionFrom(raw, ...keys) {
  for (const key of keys) {
    const direct = raw?.[key];
    if (Array.isArray(direct)) return direct;
    for (const nestedKey of keys) {
      const nested = direct?.[nestedKey];
      if (Array.isArray(nested)) return nested;
    }
  }
  return Array.isArray(raw) ? raw : [];
}

function nestedObjectFrom(value, key) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const nested = value[key];
  if (nested && !Array.isArray(nested) && typeof nested === "object") return nested;
  return null;
}

function eventName(row) {
  return String(row.eventName || row.name || row.type || row.event || "");
}

function ratio(numerator, denominator) {
  const top = number(numerator);
  const bottom = number(denominator);
  if (!bottom) return undefined;
  return top / bottom;
}

function number(value) {
  const next = Number(value || 0);
  return Number.isFinite(next) ? next : 0;
}

function isApprovedSpecialist(row) {
  const status = String(row.status || row.applicationStatus || "").toLowerCase();
  return ["approved", "aprobado", "published", "publicado", "active", "activo"].includes(status);
}

function isPublishedSpecialist(row) {
  const status = String(row.status || row.publicationStatus || "").toLowerCase();
  return Boolean(row.publishedAt || row.isPublished || ["published", "publicado", "active", "activo"].includes(status));
}

function hasCompleteProfile(row) {
  const score = number(row.profileCompletion || row.completionScore || row.profileCompletionScore);
  if (score >= 80) return true;
  return Boolean(row.name && row.phone && row.commune && (row.trade || row.primaryTrade || row.profession));
}

function uniqueCoverage(rows) {
  const keys = new Set();
  for (const row of rows) {
    const trade = String(row.trade || row.primaryTrade || row.profession || "");
    const commune = String(row.commune || "");
    if (trade && commune) keys.add(`${trade}:${commune}`);
  }
  return keys.size;
}
