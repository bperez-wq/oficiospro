"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

/** Renderiza una cadena traducida (span) por su clave i18n. Útil dentro de server components. */
export function TranslatedText({ k, className }: { k: string; className?: string }) {
  const { t } = useI18n();
  return <span className={className}>{t(k)}</span>;
}
