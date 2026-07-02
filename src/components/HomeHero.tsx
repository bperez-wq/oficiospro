"use client";

import Link from "next/link";
import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { HeroSearchPanel } from "@/components/HeroSearchPanel";
import { useI18n } from "@/lib/i18n/I18nProvider";

const founderHeroContext = { source: "campana_local" as const, campaign: "founder_specialists_home_hero", landingPage: "/" };

const chipStyles = ["chip-sun", "chip-brand", "chip-emerald", "chip-brand"];
const chipIcons = ["*", "✓", "✓", "●"];

/**
 * Columna izquierda del hero de Home, traducida vía i18n. Mantiene la estructura,
 * clases y tracking originales; solo el copy pasa por t()/tList().
 */
export function HomeHero() {
  const { t, tList } = useI18n();
  const chips = tList("home.chips");

  return (
    <div className="animate-fade-up">
      <span className="eyebrow-pill">
        <span className="h-2 w-2 rounded-full bg-brand" />
        {t("home.heroEyebrow")}
      </span>
      <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">
        {t("home.heroTitlePrefix")}
        <span className="gradient-text">{t("home.heroTitleHighlight")}</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">{t("home.heroSubtitle")}</p>
      <HeroSearchPanel />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-3xl border border-line bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft">
          <span className="text-xs font-black uppercase tracking-wide text-brand">{t("home.clientTag")}</span>
          <Link href="/especialistas" className="btn-primary w-full" data-event="browse_specialists_home_hero">
            {t("home.clientCta")}
          </Link>
          <span className="text-[13px] font-semibold leading-5 text-muted">{t("home.clientHint")}</span>
        </div>
        <div className="flex flex-col gap-2 rounded-3xl border border-sun/30 bg-sun-soft/50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
          <span className="text-xs font-black uppercase tracking-wide text-sun-dark">{t("home.specialistTag")}</span>
          <AcquisitionTrackingLink
            href="/especialistas-fundadores?source=home_hero&intent=offer_services"
            className="btn-sun w-full"
            eventType="click_offer_services"
            sourceButton="Ofrecer mis servicios home hero"
            context={founderHeroContext}
          >
            {t("home.specialistCta")}
          </AcquisitionTrackingLink>
          <span className="text-[13px] font-semibold leading-5 text-muted">{t("home.specialistHint")}</span>
        </div>
      </div>
      <CreditsHelpTrigger className="mt-4 inline-block text-sm font-black text-brand-dark transition hover:text-brand">
        {t("home.creditsHelp")}
      </CreditsHelpTrigger>
      <div className="mt-7 flex flex-wrap gap-2.5">
        {chips.map((label, index) => (
          <span key={label} className={`${chipStyles[index] ?? "chip-brand"} px-3.5 py-2 text-[13px]`}>
            <span aria-hidden>{chipIcons[index] ?? "✓"}</span> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
