// Geo layer for the "near you" map: returns nearby trade businesses from
// OpenStreetMap WITH coordinates so they can be plotted on a map. Open data
// (ODbL), free, no API key, CORS-enabled (runs from the browser).
//
// Best-effort: any failure returns an empty list so the map degrades gracefully.

import { labelForOsmTag, osmFiltersForTrade } from "./osmTagMap";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_TIMEOUT_MS = 18000;

export type OsmGeoPoint = {
  id: string;
  name: string;
  category?: string;
  lat: number;
  lng: number;
  mapsUrl: string;
};

export type OsmAroundInput = {
  lat: number;
  lng: number;
  /** Search radius in meters. */
  radius?: number;
  /** Optional trade (category id or free text) to focus the tags. */
  trade?: string;
  limit?: number;
};

const cache = new Map<string, OsmGeoPoint[]>();

function buildAroundQuery({ lat, lng, radius = 4000, trade = "" }: OsmAroundInput): string {
  const around = `around:${radius},${lat},${lng}`;
  const lines: string[] = [];
  for (const f of osmFiltersForTrade(trade)) {
    const selector = f.value ? `["${f.key}"~"${f.value}"]` : `["${f.key}"]`;
    lines.push(`  node${selector}(${around});`);
    lines.push(`  way${selector}(${around});`);
  }
  return `[out:json][timeout:20];\n(\n${lines.join("\n")}\n);\nout center 60;`;
}

function pointFromElement(el: Record<string, unknown>): OsmGeoPoint | null {
  const tags = (el.tags ?? {}) as Record<string, string>;
  const name = (tags.name ?? tags.operator ?? "").trim();
  if (!name) return null;
  const type = String(el.type ?? "node");
  const id = String(el.id ?? "");
  if (!id) return null;
  const center = (el.center ?? {}) as { lat?: number; lon?: number };
  const lat = typeof el.lat === "number" ? (el.lat as number) : center.lat;
  const lng = typeof el.lon === "number" ? (el.lon as number) : center.lon;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    id: `${type}/${id}`,
    name,
    category: labelForOsmTag(tags.craft, tags.shop, tags.office),
    lat,
    lng,
    mapsUrl: `https://www.openstreetmap.org/${type}/${id}`,
  };
}

/** Fetch nearby trade businesses (with coordinates) around a point. */
export async function fetchOsmPointsAround(input: OsmAroundInput): Promise<OsmGeoPoint[]> {
  if (typeof window === "undefined") return [];
  const { lat, lng } = input;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  const limit = input.limit ?? 24;
  const cacheKey = `${lat.toFixed(3)}|${lng.toFixed(3)}|${input.radius ?? 4000}|${input.trade ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(buildAroundQuery(input))}`,
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const data = (await response.json().catch(() => null)) as { elements?: Record<string, unknown>[] } | null;
    const elements = Array.isArray(data?.elements) ? (data!.elements as Record<string, unknown>[]) : [];
    const seen = new Set<string>();
    const points: OsmGeoPoint[] = [];
    for (const el of elements) {
      const point = pointFromElement(el);
      if (!point) continue;
      const key = point.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(point);
    }
    cache.set(cacheKey, points);
    return points.slice(0, limit);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
