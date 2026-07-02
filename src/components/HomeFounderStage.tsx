"use client";

import Link from "next/link";
import { SpecialistQuickLeadForm } from "@/components/SpecialistQuickLeadForm";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Bloque de captación de especialistas de Home (formulario rápido + etapa fundador), traducido. */
export function HomeFounderStage() {
  const { t, tList } = useI18n();
  return (
    <div className="mb-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <SpecialistQuickLeadForm
        title={t("homeSpecialists.quickLeadTitle")}
        text={t("homeSpecialists.quickLeadText")}
        context={{ source: "campana_local", campaign: "founder_specialists_home_section", landingPage: "/" }}
        sourceComponent="HomeSpecialistsSection"
        sourceButton="Captura rapida home especialistas"
        leadKind="specialist_lead"
        compact
      />
      <div className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <p className="eyebrow">{t("homeSpecialists.founderEyebrow")}</p>
        <h3 className="text-2xl font-black leading-tight text-ink">{t("homeSpecialists.founderTitle")}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {tList("homeSpecialists.founderChips").map((item) => (
            <span key={item} className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-black text-brand-dark">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Enlace "Ver todos" del encabezado de especialistas, traducido. */
export function ViewAllSpecialistsLink() {
  const { t } = useI18n();
  return (
    <Link href="/especialistas" className="btn-secondary" data-event="browse_specialists_featured">
      {t("homeSpecialists.viewAll")}
    </Link>
  );
}
