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

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Normaliza un código de idioma (ej. "en-GB", "PT_br") a un Locale soportado. */
export function resolveLocale(input?: string | null): Locale {
  if (!input) return defaultLocale;
  const base = input.toLowerCase().replace("_", "-").split("-")[0];
  return isLocale(base) ? base : defaultLocale;
}
