"use client";

import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { companyUseCases } from "@/data/mock";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Columna izquierda del bloque Empresas de Home, traducida por i18n. */
export function HomeEnterpriseIntro() {
  const { t } = useI18n();
  return (
    <div>
      <p className="eyebrow text-teal-200">{t("homeEnterprise.eyebrow")}</p>
      <h2 className="text-4xl font-black leading-tight md:text-5xl">{t("homeEnterprise.title")}</h2>
      <p className="mt-5 text-lg font-semibold leading-8 text-white/75">{t("homeEnterprise.lead")}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {companyUseCases.map((item) => (
          <span key={item} className="chip bg-white/10 text-white">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <ConversionButton type="contacto_empresa" sourceButton="Solicitar cuenta empresa home" className="btn-primary">
          {t("homeEnterprise.cta")}
        </ConversionButton>
        <Link href="/empresas" className="btn-secondary border-white/20 bg-white/10 text-white hover:border-white/40" data-event="home_business_solutions">
          {t("homeEnterprise.secondary")}
        </Link>
      </div>
    </div>
  );
}
