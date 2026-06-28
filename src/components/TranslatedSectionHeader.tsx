"use client";

import { SectionHeader } from "@/components/SectionHeader";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * SectionHeader traducido por i18n. `sectionKey` referencia `homeSections.<key>` en el diccionario.
 * Permite traducir encabezados de secciones que viven en server components (Home) sin convertir
 * toda la página a client.
 */
export function TranslatedSectionHeader({ sectionKey, align }: { sectionKey: string; align?: "left" | "center" }) {
  const { t } = useI18n();
  const text = t(`homeSections.${sectionKey}.text`);
  return (
    <SectionHeader
      eyebrow={t(`homeSections.${sectionKey}.eyebrow`)}
      title={t(`homeSections.${sectionKey}.title`)}
      text={text}
      align={align}
    />
  );
}
