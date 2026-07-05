"use client";

import Link from "next/link";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Hero premium traducido de /especialistas (textos i18n, foto real de oficio). */
export function SpecialistsHero() {
  const { t } = useI18n();
  return (
    <PremiumPhotoHero
      eyebrow={t("specialistsPage.eyebrow")}
      title={t("specialistsPage.title")}
      subtitle={t("specialistsPage.subtitle")}
      image="/assets/oficios/gasfiteria/gasfiteria-griferia-01.jpg"
      tone="brand"
      chips={["Filtra por oficio y comuna", "Reputación visible", "Explora sin registrarte"]}
      footnote="Red en formación: verás perfiles referenciales junto a los primeros especialistas fundadores publicados."
    >
      <ConversionButton type="lead_cliente" sourceButton="Crear cuenta desde especialistas" className="btn-sun shine">
        {t("specialistsPage.createAccount")}
      </ConversionButton>
      <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/dashboard-cliente">
        {t("specialistsPage.viewCredits")}
      </Link>
    </PremiumPhotoHero>
  );
}
