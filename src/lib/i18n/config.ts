/**
 * Configuración base de internacionalización (i18n).
 *
 * Prototipo global: el sitio nace en español (Chile) y suma idiomas para medir
 * dónde hay tracción antes de invertir en operación local (oferta, pagos, legal).
 *
 * La moneda se declara como referencia futura: NO se muestran precios convertidos
 * en esta etapa porque no hay tipo de cambio real ni operación en esos países.
 */
export const locales = ["es", "en", "pt", "fr", "de", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const localeMeta: Record<Locale, { label: string; flag: string; intl: string; currency: string }> = {
  es: { label: "Español", flag: "🇪🇸", intl: "es-CL", currency: "CLP" },
  en: { label: "English", flag: "🇬🇧", intl: "en-US", currency: "USD" },
  pt: { label: "Português", flag: "🇧🇷", intl: "pt-BR", currency: "BRL" },
  fr: { label: "Français", flag: "🇫🇷", intl: "fr-FR", currency: "EUR" },
  de: { label: "Deutsch", flag: "🇩🇪", intl: "de-DE", currency: "EUR" },
  it: { label: "Italiano", flag: "🇮🇹", intl: "it-IT", currency: "EUR" },
};

/**
 * Valor de referencia de 1 crédito por región/idioma (informativo, no habilita pagos
 * internacionales). Chile mantiene CLP; resto usa los valores indicados por Benjamín
 * (US$1,1 por defecto, EUR1,0 en Europa). Editable; el cobro real sigue siendo CLP.
 */
export const creditPricing: Record<Locale, { currency: string; value: number }> = {
  es: { currency: "CLP", value: 1000 },
  en: { currency: "USD", value: 1.1 },
  pt: { currency: "USD", value: 1.1 },
  fr: { currency: "EUR", value: 1.0 },
  de: { currency: "EUR", value: 1.0 },
  it: { currency: "EUR", value: 1.0 },
};

/** Devuelve "1 crédito" formateado en la moneda del idioma activo, ej. "US$1,10" / "€1,00" / "$1.000". */
export function creditUnitLabel(locale: Locale): string {
  const pricing = creditPricing[locale] ?? creditPricing[defaultLocale];
  return new Intl.NumberFormat(localeMeta[locale]?.intl ?? localeMeta[defaultLocale].intl, {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: pricing.value < 10 ? 2 : 0,
  }).format(pricing.value);
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Normaliza un código de idioma (ej. "en-GB", "PT_br") a un Locale soportado. */
export function resolveLocale(input?: string | null): Locale {
  if (!input) return defaultLocale;
  const base = input.toLowerCase().replace("_", "-").split("-")[0];
  return isLocale(base) ? base : defaultLocale;
}
