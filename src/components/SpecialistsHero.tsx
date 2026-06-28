"use client";

import Link from "next/link";
import { AppHero } from "@/components/PlatformNav";
import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Hero traducido de /especialistas (AppHero vive en server; este wrapper aporta i18n). */
export function SpecialistsHero() {
  const { t } = useI18n();
  return (
    <AppHero eyebrow={t("specialistsPage.eyebrow")} title={t("specialistsPage.title")} subtitle={t("specialistsPage.subtitle")}>
      <Link className="btn-secondary" href="/dashboard-cliente">
        {t("specialistsPage.viewCredits")}
      </Link>
      <ConversionButton type="lead_cliente" sourceButton="Crear cuenta desde especialistas" className="btn-primary">
        {t("specialistsPage.createAccount")}
      </ConversionButton>
    </AppHero>
  );
}
