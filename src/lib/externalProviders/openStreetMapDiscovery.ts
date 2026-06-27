// OpenStreetMap discovery source (live, free, key-less).
//
// Uses open data only: Nominatim to resolve the commune to a bounding box, then
// Overpass to list nearby trade businesses. No API key, CORS-enabled, so it runs
// straight from the browser without any Worker change. Everything is best-effort:
// any failure or empty result simply renders nothing (never breaks /especialistas).
//
// We show results live and store NOTHING automatically. Attribution to
// OpenStreetMap contributors is always displayed (ODbL).

import {
  DISABLED_RESULT,
  type DiscoveryResult,
  type ExternalProviderPreview,
  type ExternalProviderSearchInput,
  type ExternalProviderSource,
} from "./types";
import { labelForOsmTag, osmFiltersForTrade } from "./osmTagMap";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const ATTRIBUTION = "Datos de OpenStreetMap";
const DEFAULT_LIMIT = 6;
const GEOCODE_TIMEOUT_MS = 7000;
const OVERPASS_TIMEOUT_MS = 18000;

type BBox = { south: number; north: number; west: number; east: number };

const geocodeCache = new Map<string, BBox | null>();
const resultCache = new Map<string, DiscoveryResult>();

/** Enabled by default; set NEXT_PUBLIC_OSM_DISCOVERY_ENABLED="false" to turn off. */
export function isOsmDiscoveryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OSM_DISCOVERY_ENABLED !== "false";
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocodeCommune(commune: string, region?: string): Promise<BBox | null> {
  const key = `${commune}|${region ?? ""}`.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;

  const params = new URLSearchParams({ format: "jsonv2", country: "Chile", city: commune, limit: "1" });
  if (region) params.set("state", region);
  const response = await fetchWithTimeout(`${NOMINATIM_URL}?${params.toString()}`, GEOCODE_TIMEOUT_MS, {
    headers: { Accept: "application/json" },
  });
  let bbox: BBox | null = null;
  if (response && response.ok) {
    const data = (await response.json().catch(() => null)) as Array<{ boundingbox?: string[] }> | null;
    const bb = data?.[0]?.boundingbox;
    if (bb && bb.length === 4) {
      bbox = { south: Number(bb[0]), north: Number(bb[1]), west: Number(bb[2]), east: Number(bb[3]) };
      if (![bbox.south, bbox.north, bbox.west, bbox.east].every(Number.isFinite)) bbox = null;
    }
  }
  geocodeCache.set(key, bbox);
  return bbox;
}

function buildOverpassQuery(bbox: BBox, trade: string): string {
  const bb = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const lines: string[] = [];
  for (const f of osmFiltersForTrade(trade)) {
    const selector = f.value ? `["${f.key}"~"${f.value}"]` : `["${f.key}"]`;
    lines.push(`  node${selector}(${bb});`);
    lines.push(`  way${selector}(${bb});`);
  }
  return `[out:json][timeout:20];\n(\n${lines.join("\n")}\n);\nout center 30;`;
}

function normalizeOsmElement(el: Record<string, unknown>, input: ExternalProviderSearchInput): ExternalProviderPreview | null {
  const tags = (el.tags ?? {}) as Record<string, string>;
  const name = (tags.name ?? tags["operator"] ?? "").trim();
  if (!name) return null; // skip unnamed nodes
  const type = String(el.type ?? "node");
  const id = String(el.id ?? "");
  if (!id) return null;
  const externalPlaceId = `${type}/${id}`;
  return {
    source: "osm",
    externalPlaceId,
    name,
    category: labelForOsmTag(tags.craft, tags.shop, tags.office),
    commune: input.commune,
    region: input.region,
    rating: undefined, // OSM has no ratings; never invent them
    userRatingsTotal: undefined,
    mapsUrl: `https://www.openstreetmap.org/${type}/${id}`,
    verified: false,
  };
}

async function runSearch(input: ExternalProviderSearchInput): Promise<DiscoveryResult> {
  if (!isOsmDiscoveryEnabled()) return DISABLED_RESULT;
  if (typeof window === "undefined") return DISABLED_RESULT;
  const trade = (input.trade ?? "").trim();
  const commune = (input.commune ?? "").trim();
  if (!commune) return { status: "ok", providers: [], attribution: ATTRIBUTION };

  const cacheKey = `${trade}|${commune}|${input.region ?? ""}`.toLowerCase();
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const bbox = await geocodeCommune(commune, input.region);
  if (!bbox) {
    const empty: DiscoveryResult = { status: "ok", providers: [], attribution: ATTRIBUTION };
    resultCache.set(cacheKey, empty);
    return empty;
  }

  const query = buildOverpassQuery(bbox, trade);
  const response = await fetchWithTimeout(OVERPASS_URL, OVERPASS_TIMEOUT_MS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!response || !response.ok) {
    return { status: "error", providers: [], attribution: ATTRIBUTION, error: "overpass_unavailable" };
  }
  const data = (await response.json().catch(() => null)) as { elements?: Record<string, unknown>[] } | null;
  const elements = Array.isArray(data?.elements) ? (data!.elements as Record<string, unknown>[]) : [];

  const seen = new Set<string>();
  const providers: ExternalProviderPreview[] = [];
  for (const el of elements) {
    const preview = normalizeOsmElement(el, input);
    if (!preview) continue;
    const dedupeKey = preview.name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    providers.push(preview);
    if (providers.length >= (input.limit ?? DEFAULT_LIMIT)) break;
  }
  const result: DiscoveryResult = { status: "ok", providers, attribution: ATTRIBUTION };
  resultCache.set(cacheKey, result);
  return result;
}

export const OpenStreetMapSource: ExternalProviderSource = {
  id: "osm",
  isEnabled() {
    return isOsmDiscoveryEnabled();
  },
  async search(input: ExternalProviderSearchInput): Promise<DiscoveryResult> {
    try {
      return await runSearch(input);
    } catch {
      return { status: "error", providers: [], attribution: ATTRIBUTION, error: "osm_failed" };
    }
  },
  async getDetails(): Promise<ExternalProviderPreview | null> {
    return null; // details are shown live in the list; no separate lookup needed
  },
  buildExternalUrl(externalPlaceId: string): string {
    return `https://www.openstreetmap.org/${externalPlaceId}`;
  },
};

export function searchOsmProviders(input: ExternalProviderSearchInput) {
  return OpenStreetMapSource.search(input);
}
