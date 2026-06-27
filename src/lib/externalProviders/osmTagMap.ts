// Maps OficiosPro trade categories to OpenStreetMap craft/shop tags so we can
// surface nearby real businesses (open data) when own coverage is low.
// OSM tagging reference: https://wiki.openstreetmap.org/wiki/Key:craft

export type OsmFilter = { key: "craft" | "shop" | "office"; value?: string };

// Keyed by OficiosPro trade category id (see src/data/tradeTaxonomy.ts).
const CATEGORY_FILTERS: Record<string, OsmFilter[]> = {
  hogar: [
    { key: "craft", value: "handicraft|carpenter|plumber|electrician" },
    { key: "shop", value: "hardware|doityourself|trade" },
  ],
  gasfiteria: [
    { key: "craft", value: "plumber" },
    { key: "shop", value: "hardware|doityourself|trade" },
  ],
  electricidad: [
    { key: "craft", value: "electrician" },
    { key: "shop", value: "electrical|hardware|trade" },
  ],
  "climatizacion-refrigeracion": [
    { key: "craft", value: "hvac|heating_engineer|electrician" },
    { key: "shop", value: "appliance|electrical|hardware" },
  ],
  "jardineria-exterior": [
    { key: "craft", value: "gardener" },
    { key: "shop", value: "garden_centre|trade" },
  ],
  "construccion-obra": [
    { key: "craft", value: "builder|plasterer|bricklayer" },
    { key: "shop", value: "trade|hardware|doityourself" },
  ],
  terminaciones: [
    { key: "craft", value: "painter|plasterer|tiler" },
    { key: "shop", value: "paint|trade|hardware" },
  ],
  "muebleria-carpinteria": [
    { key: "craft", value: "carpenter|cabinet_maker|joiner" },
    { key: "shop", value: "furniture|doityourself" },
  ],
  metalmecanica: [
    { key: "craft", value: "metal_construction|blacksmith|welder|locksmith" },
    { key: "shop", value: "trade|hardware" },
  ],
  "comunidades-edificios": [
    { key: "craft", value: "plumber|electrician|painter" },
    { key: "shop", value: "trade|hardware" },
  ],
  "empresas-comercios": [
    { key: "craft", value: "electrician|plumber|metal_construction" },
    { key: "shop", value: "trade|hardware" },
  ],
  industria: [
    { key: "craft", value: "metal_construction|electrician|welder" },
    { key: "shop", value: "trade" },
  ],
  "agroindustria-campos": [
    { key: "craft", value: "agricultural_engines|metal_construction" },
    { key: "shop", value: "agrarian|trade|hardware" },
  ],
  "seguridad-tecnologia": [
    { key: "craft", value: "electronics_repair|locksmith" },
    { key: "shop", value: "computer|electronics|security|trade" },
  ],
  emergencias: [
    { key: "craft", value: "plumber|electrician|locksmith" },
    { key: "shop", value: "hardware" },
  ],
};

// Light keyword fallback when the trade is a free-text query, not a category id.
const KEYWORD_FILTERS: Array<{ match: RegExp; filters: OsmFilter[] }> = [
  { match: /gas|fiter|caner|plomer|agua|caldera|calefon/i, filters: CATEGORY_FILTERS.gasfiteria },
  { match: /electr/i, filters: CATEGORY_FILTERS.electricidad },
  { match: /clima|refriger|aire|split|frio/i, filters: CATEGORY_FILTERS["climatizacion-refrigeracion"] },
  { match: /jardin|paisaj|piscina|riego|poda/i, filters: CATEGORY_FILTERS["jardineria-exterior"] },
  { match: /construc|obra|albanil|ceramic|estuco/i, filters: CATEGORY_FILTERS["construccion-obra"] },
  { match: /pintur|termina|yeso|cer.mic/i, filters: CATEGORY_FILTERS.terminaciones },
  { match: /mueble|carpinter|madera/i, filters: CATEGORY_FILTERS["muebleria-carpinteria"] },
  { match: /metal|soldad|cerraj|reja|porton/i, filters: CATEGORY_FILTERS.metalmecanica },
  { match: /segur|alarma|camara|domotic|tecnolog/i, filters: CATEGORY_FILTERS["seguridad-tecnologia"] },
];

const DEFAULT_FILTERS: OsmFilter[] = [
  { key: "craft" }, // any craft business
  { key: "shop", value: "hardware|doityourself|trade|electrical|paint|garden_centre|appliance|tool_hire|tiles|furniture" },
  { key: "office", value: "company|contractor" },
];

/** Resolve OSM filters for a trade (category id or free-text query). */
export function osmFiltersForTrade(trade: string): OsmFilter[] {
  const key = (trade || "").trim().toLowerCase();
  if (CATEGORY_FILTERS[key]) return CATEGORY_FILTERS[key];
  for (const entry of KEYWORD_FILTERS) {
    if (entry.match.test(key)) return entry.filters;
  }
  return DEFAULT_FILTERS;
}

/** Human label for an OSM craft/shop tag value, for display. */
export function labelForOsmTag(craft?: string, shop?: string, office?: string): string | undefined {
  const raw = craft || shop || office;
  if (!raw) return undefined;
  const dict: Record<string, string> = {
    plumber: "Gasfiteria",
    electrician: "Electricidad",
    carpenter: "Carpinteria",
    cabinet_maker: "Muebleria",
    joiner: "Carpinteria",
    painter: "Pintura",
    plasterer: "Estuco y terminaciones",
    tiler: "Ceramicas",
    gardener: "Jardineria",
    hvac: "Climatizacion",
    heating_engineer: "Calefaccion",
    metal_construction: "Metalmecanica",
    blacksmith: "Herreria",
    welder: "Soldadura",
    locksmith: "Cerrajeria",
    builder: "Construccion",
    bricklayer: "Albanileria",
    electronics_repair: "Reparacion electronica",
    handicraft: "Oficios varios",
    hardware: "Ferreteria",
    doityourself: "Materiales y ferreteria",
    trade: "Suministros",
    furniture: "Muebleria",
    garden_centre: "Vivero y jardin",
    paint: "Pinturas",
    appliance: "Electrodomesticos",
    electrical: "Materiales electricos",
    tool_hire: "Arriendo de herramientas",
    tiles: "Ceramicas y revestimientos",
    company: "Empresa local",
    contractor: "Contratista",
  };
  return dict[raw] ?? raw.replace(/_/g, " ");
}
