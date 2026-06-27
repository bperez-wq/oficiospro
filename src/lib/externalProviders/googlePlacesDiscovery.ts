// Google Places discovery source.
//
// IMPORTANT: the Places API key is SERVER-SIDE only. This module never calls
// Google directly from the client (that would leak the key). It calls an
// OficiosPro Worker endpoint that holds the key and returns a normalized,
// live preview. Until that endpoint + the public flag are enabled, every
// method returns a "disabled" result so the UI never breaks.

import {
  DISABLED_RESULT,
  type DiscoveryResult,
  type ExternalProviderPreview,
  type ExternalProviderSearchInput,
  type ExternalProviderSource,
} from "./types";

const ATTRIBUTION = "Datos de Google Maps";
const SEARCH_ENDPOINT = "/api/external-providers/search"; // Worker endpoint (handoff Codex).
const DEFAULT_LIMIT = 4;
const REQUEST_TIMEOUT_MS = 8000;

/** Enabled only when the public flag is explicitly turned on. Default: off. */
export function isExternalDiscoveryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EXTERNAL_PROVIDERS_ENABLED === "true";
}

/** Official, key-less Google Maps deep link for a place id. */
export function buildGoogleMapsUrl(externalPlaceId: string): string {
  const id = encodeURIComponent(externalPlaceId);
  return `https://www.google.com/maps/search/?api=1&query=place&query_place_id=${id}`;
}

/** Map a raw endpoint row into our minimal preview. Tolerant of shape changes. */
export function normalizeExternalProviderPreview(raw: Record<string, unknown>): ExternalProviderPreview | null {
  const externalPlaceId = String(raw.externalPlaceId ?? raw.placeId ?? raw.place_id ?? "").trim();
  const name = String(raw.name ?? raw.displayName ?? "").trim();
  if (!externalPlaceId || !name) return null;
  const ratingValue = Number(raw.rating);
  const totalValue = Number(raw.userRatingsTotal ?? raw.user_ratings_total);
  return {
    source: "google_places",
    externalPlaceId,
    name,
    category: raw.category ? String(raw.category) : undefined,
    commune: raw.commune ? String(raw.commune) : undefined,
    region: raw.region ? String(raw.region) : undefined,
    rating: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : undefined,
    userRatingsTotal: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : undefined,
    mapsUrl: typeof raw.mapsUrl === "string" && raw.mapsUrl ? raw.mapsUrl : buildGoogleMapsUrl(externalPlaceId),
    verified: false,
  };
}

async function callEndpoint(params: Record<string, string | number | undefined>): Promise<Record<string, unknown> | null> {
  const url = new URL(SEARCH_ENDPOINT, typeof window !== "undefined" ? window.location.origin : "https://oficiospro.cl");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && `${value}`.length > 0) url.searchParams.set(key, String(value));
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json().catch(() => null)) as Record<string, unknown> | null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const GooglePlacesSource: ExternalProviderSource = {
  id: "google_places",

  isEnabled() {
    return isExternalDiscoveryEnabled();
  },

  async search(input: ExternalProviderSearchInput): Promise<DiscoveryResult> {
    if (!this.isEnabled()) return DISABLED_RESULT;
    const data = await callEndpoint({
      trade: input.trade,
      commune: input.commune,
      region: input.region,
      lat: input.lat,
      lng: input.lng,
      q: input.query,
      limit: input.limit ?? DEFAULT_LIMIT,
    });
    if (!data) return { status: "error", providers: [], attribution: ATTRIBUTION, error: "endpoint_unavailable" };
    const rows = Array.isArray(data.providers) ? (data.providers as Record<string, unknown>[]) : [];
    const providers = rows
      .map(normalizeExternalProviderPreview)
      .filter((item): item is ExternalProviderPreview => item !== null)
      .slice(0, input.limit ?? DEFAULT_LIMIT);
    return { status: "ok", providers, attribution: ATTRIBUTION };
  },

  async getDetails(externalPlaceId: string): Promise<ExternalProviderPreview | null> {
    if (!this.isEnabled()) return null;
    const data = await callEndpoint({ placeId: externalPlaceId });
    if (!data) return null;
    return normalizeExternalProviderPreview(data);
  },

  buildExternalUrl(externalPlaceId: string): string {
    return buildGoogleMapsUrl(externalPlaceId);
  },
};

// Convenience wrappers matching the requested helper names.
export function searchExternalProviders(input: ExternalProviderSearchInput) {
  return GooglePlacesSource.search(input);
}
export function fetchPlacePreview(externalPlaceId: string) {
  return GooglePlacesSource.getDetails(externalPlaceId);
}
