import type { Locale } from "@/lib/i18n/config";

/**
 * Market Lab: catálogo de mercados en exploración (países/ciudades/oficios).
 *
 * Inspirado en expansión local-first (estilo Ebury): motor global común, adaptación local,
 * activación solo donde haya tracción. NO implica operación real: cada mercado declara su `status`
 * y por defecto es `noindex` y `paymentStatus: disabled`.
 *
 * No tocar Worker/D1/pagos. No mostrar perfiles demo como reales.
 */
export type MarketStatus =
  | "research"
  | "landing_live"
  | "collecting_supply"
  | "collecting_demand"
  | "pilot_ready"
  | "paused";

export type SeoStatus = "noindex" | "draft" | "approved";
export type PaymentStatus = "disabled" | "research_only" | "future";

export type TradeSlug = "plumbing" | "electrical" | "hvac" | "painting" | "carpentry" | "gardening";

export type Market = {
  countryCode: string;
  countrySlug: string;
  countryName: string;
  citySlug: string;
  cityName: string;
  locale: Locale;
  currency: string;
  neighborhoodLabel: string;
  trades: TradeSlug[];
  status: MarketStatus;
  seoStatus: SeoStatus;
  paymentStatus: PaymentStatus;
  contactChannel: string;
  trustNote: string;
  demoProfilePolicy: "referential_only" | "none";
};

/** Etiqueta de oficio por idioma (fuente de verdad para mostrar el oficio localizado). */
export const tradeCatalog: Record<TradeSlug, Record<Locale, string>> = {
  plumbing: { es: "Gasfitería", en: "Plumbing", pt: "Encanamento", fr: "Plomberie", de: "Sanitär", it: "Idraulica" },
  electrical: { es: "Electricidad", en: "Electrical", pt: "Elétrica", fr: "Électricité", de: "Elektrik", it: "Elettricità" },
  hvac: { es: "Climatización", en: "HVAC", pt: "Climatização", fr: "Climatisation", de: "Klimatechnik", it: "Climatizzazione" },
  painting: { es: "Pintura", en: "Painting", pt: "Pintura", fr: "Peinture", de: "Malerarbeiten", it: "Pittura" },
  carpentry: { es: "Carpintería", en: "Carpentry", pt: "Carpintaria", fr: "Menuiserie", de: "Tischlerei", it: "Falegnameria" },
  gardening: { es: "Jardinería", en: "Gardening", pt: "Jardinagem", fr: "Jardinage", de: "Gartenarbeit", it: "Giardinaggio" },
};

export function tradeLabel(slug: TradeSlug, locale: Locale): string {
  return tradeCatalog[slug]?.[locale] ?? tradeCatalog[slug]?.es ?? slug;
}

const baseTrades: TradeSlug[] = ["plumbing", "electrical", "hvac", "painting"];

export const markets: Market[] = [
  {
    countryCode: "CL", countrySlug: "chile", countryName: "Chile", citySlug: "santiago", cityName: "Santiago",
    locale: "es", currency: "CLP", neighborhoodLabel: "comuna", trades: ["plumbing", "electrical", "hvac", "gardening"],
    status: "collecting_demand", seoStatus: "noindex", paymentStatus: "research_only",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Mercado base del piloto OficiosPro.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "PE", countrySlug: "peru", countryName: "Perú", citySlug: "lima", cityName: "Lima",
    locale: "es", currency: "PEN", neighborhoodLabel: "distrito", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "CO", countrySlug: "colombia", countryName: "Colombia", citySlug: "bogota", cityName: "Bogotá",
    locale: "es", currency: "COP", neighborhoodLabel: "barrio", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "MX", countrySlug: "mexico", countryName: "México", citySlug: "cdmx", cityName: "Ciudad de México",
    locale: "es", currency: "MXN", neighborhoodLabel: "colonia", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "ES", countrySlug: "espana", countryName: "España", citySlug: "madrid", cityName: "Madrid",
    locale: "es", currency: "EUR", neighborhoodLabel: "barrio", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "BR", countrySlug: "brasil", countryName: "Brasil", citySlug: "sao-paulo", cityName: "São Paulo",
    locale: "pt", currency: "BRL", neighborhoodLabel: "bairro", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interesse de clientes e especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "PT", countrySlug: "portugal", countryName: "Portugal", citySlug: "lisboa", cityName: "Lisboa",
    locale: "pt", currency: "EUR", neighborhoodLabel: "freguesia", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interesse de clientes e especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "AR", countrySlug: "argentina", countryName: "Argentina", citySlug: "buenos-aires", cityName: "Buenos Aires",
    locale: "es", currency: "ARS", neighborhoodLabel: "barrio", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "UY", countrySlug: "uruguay", countryName: "Uruguay", citySlug: "montevideo", cityName: "Montevideo",
    locale: "es", currency: "UYU", neighborhoodLabel: "barrio", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Explorando interés de clientes y especialistas.", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "US", countrySlug: "estados-unidos", countryName: "Estados Unidos", citySlug: "miami", cityName: "Miami",
    locale: "en", currency: "USD", neighborhoodLabel: "neighborhood", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Exploring interest from customers and specialists (Hispanic market).", demoProfilePolicy: "referential_only",
  },
  {
    countryCode: "AE", countrySlug: "uae", countryName: "Emiratos Árabes Unidos", citySlug: "dubai", cityName: "Dubai",
    locale: "en", currency: "AED", neighborhoodLabel: "community", trades: baseTrades,
    status: "research", seoStatus: "noindex", paymentStatus: "disabled",
    contactChannel: "bperez@oficiospro.cl", trustNote: "Exploring interest from customers and specialists.", demoProfilePolicy: "referential_only",
  },
];

export function getMarket(countrySlug: string, citySlug: string): Market | undefined {
  return markets.find((m) => m.countrySlug === countrySlug && m.citySlug === citySlug);
}

export function getMarketByCountry(countrySlug: string): Market | undefined {
  return markets.find((m) => m.countrySlug === countrySlug);
}

/** Todas las combinaciones país/ciudad/oficio para generateStaticParams. */
export function marketLabParams(): { country: string; city: string; trade: string }[] {
  return markets.flatMap((m) => m.trades.map((trade) => ({ country: m.countrySlug, city: m.citySlug, trade })));
}

export function isTradeSlug(value: string): value is TradeSlug {
  return value in tradeCatalog;
}
