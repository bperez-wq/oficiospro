"use client";

import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";

const monthCredits = [45, 90, 135];

/** Bloque Club Hogar de Home, traducido por i18n. Mantiene estructura y clases originales. */
export function HomeClubHogarBlock() {
  const { t, tList } = useI18n();
  const monthLabels = tList("homeClub.monthLabels");
  return (
    <div className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
      <div>
        <p className="eyebrow">{t("homeClub.eyebrow")}</p>
        <h2 className="section-title">{t("homeClub.title")}</h2>
        <p className="section-lead">{t("homeClub.lead")}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {tList("homeClub.chips").map((item) => (
            <span key={item} className="chip bg-brand-soft text-brand-dark">
              {item}
            </span>
          ))}
        </div>
        <ConversionButton type="lead_cliente" sourceButton="Conocer planes" className="btn-primary mt-7">
          {t("homeClub.cta")}
        </ConversionButton>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {monthCredits.map((credits, index) => (
          <article key={credits} className="rounded-[24px] border border-line bg-slate-50 p-5">
            <span className="font-black text-muted">{monthLabels[index] ?? `Mes ${index + 1}`}</span>
            <strong className="mt-2 block text-3xl font-black">
              {credits} {t("homeClub.creditsWord")}
            </strong>
            <p className="mt-3 text-sm font-semibold text-muted">{t("homeClub.monthHint")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
