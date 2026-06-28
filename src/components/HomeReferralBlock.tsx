"use client";

import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Bloque Referidos de Home, traducido por i18n. */
export function HomeReferralBlock() {
  const { t } = useI18n();
  return (
    <div className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-soft md:grid-cols-[1fr_auto] md:items-center md:p-10">
      <div>
        <p className="eyebrow">{t("homeReferral.eyebrow")}</p>
        <h2 className="section-title">{t("homeReferral.title")}</h2>
        <p className="section-lead">{t("homeReferral.lead")}</p>
      </div>
      <ConversionButton type="referido" sourceButton="Referidos home" className="btn-primary">
        {t("homeReferral.cta")}
      </ConversionButton>
    </div>
  );
}
