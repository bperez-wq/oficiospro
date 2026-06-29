"use client";

import type { ReactNode } from "react";
import { AppHero } from "@/components/PlatformNav";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** AppHero traducido por i18n. `pageKey` referencia `pages.<key>` (eyebrow/title/subtitle). */
export function TranslatedAppHero({ pageKey, children }: { pageKey: string; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <AppHero eyebrow={t(`pages.${pageKey}.eyebrow`)} title={t(`pages.${pageKey}.title`)} subtitle={t(`pages.${pageKey}.subtitle`)}>
      {children}
    </AppHero>
  );
}
