"use client";

import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { HomeBusinessUseCases } from "@/components/HomeBusinessUseCases";
import { CompanyRequestForm } from "@/components/Forms";
import { PlanActionCard } from "@/components/PlanActionCard";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { Reveal } from "@/components/Reveal";
import { companyDashboard, companyUseCases } from "@/data/mock";
import { subscriptionPlans } from "@/data/marketplace";
import { empresasContent } from "@/data/i18nContent/empresasContent";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function EmpresasContent() {
  const { locale, t } = useI18n();
  const c = empresasContent[locale] ?? empresasContent.es;
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  return (
    <>
      <PremiumPhotoHero
        eyebrow={t("pages.empresas.eyebrow")}
        title={t("pages.empresas.title")}
        subtitle={t("pages.empresas.subtitle")}
        image="/assets/oficios/industria/industria-tablero-01.jpg"
        tone="enterprise"
        chips={["Centros de costo por sucursal", "Historial y trazabilidad", "Facturación consolidada", "Piloto con acompañamiento"]}
        footnote="Estamos en apertura controlada: las cuentas empresa se coordinan con contacto operacional del equipo OficiosPro."
        aside={
          <div className="rounded-card border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="rounded-[20px] bg-white p-5 text-ink">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <p className="text-xs font-black uppercase text-muted">{c.dashboardTitle}</p>
                <span className="rounded-full bg-sun-soft px-3 py-1 text-[11px] font-black text-sun-dark">{c.dashboardExample}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <span className="text-[11px] font-black uppercase text-muted">{c.mCredits}</span>
                  <strong className="block text-2xl font-black">{companyDashboard.creditsAvailable}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <span className="text-[11px] font-black uppercase text-muted">{c.mUsed}</span>
                  <strong className="block text-2xl font-black">{companyDashboard.creditsUsed}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5">
                  <span className="text-[11px] font-black uppercase text-muted">{c.mBranches}</span>
                  <strong className="block text-2xl font-black">{companyDashboard.activeBranches}</strong>
                </div>
                <div className="rounded-2xl bg-brand-soft p-3.5">
                  <span className="text-[11px] font-black uppercase text-brand-dark">{c.mResponse}</span>
                  <strong className="block text-2xl font-black text-brand-dark">{companyDashboard.responseTime}</strong>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ConversionButton type="contacto_empresa" sourceButton="Solicitar cuenta empresa" className="btn-sun shine">
          {c.heroRequestAccount}
        </ConversionButton>
        <ConversionButton type="contacto_empresa" sourceButton="Hablar con ventas empresa" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
          {c.heroTalkSales}
        </ConversionButton>
      </PremiumPhotoHero>

      <Reveal delay={0}>
        <section>
          <div className="mb-6 max-w-3xl">
            <p className="eyebrow">{c.casesEyebrow}</p>
            <h2 className="section-title">{c.casesTitle}</h2>
          </div>
          <HomeBusinessUseCases />
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="enterprise-shell relative overflow-hidden p-6 md:p-8">
          <img
            src="/assets/oficios/industria/industria-tablero-01.jpg"
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-enterprise via-enterprise/85 to-enterprise/40" />
          <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="eyebrow text-teal-200">{c.continuityEyebrow}</p>
              <h2 className="text-4xl font-black leading-tight">{c.continuityTitle}</h2>
              <p className="mt-4 font-semibold leading-7 text-white/75">{c.continuityText}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {companyUseCases.map((item) => (
                  <span key={item} className="chip bg-white/10 text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] bg-white p-5 text-ink">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-ink">{c.dashboardTitle}</p>
                <span className="rounded-full bg-sun-soft px-3 py-1 text-[11px] font-black text-sun-dark">{c.dashboardExample}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <DashboardMetricCard label={c.mCredits} value={companyDashboard.creditsAvailable.toString()} />
                <DashboardMetricCard label={c.mUsed} value={companyDashboard.creditsUsed.toString()} />
                <DashboardMetricCard label={c.mResponse} value={companyDashboard.responseTime} tone="brand" />
                <DashboardMetricCard label={c.mBranches} value={companyDashboard.activeBranches.toString()} />
              </div>
              <CreditsHelpTrigger className="mt-3 inline-block text-xs font-black text-brand-dark underline underline-offset-2 hover:opacity-80">
                {c.creditsHelp}
              </CreditsHelpTrigger>
              <div className="mt-5 grid gap-3">
                {companyDashboard.services.map((service) => (
                  <article key={`${service.service}-${service.branch}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div>
                      <strong>{service.service}</strong>
                      <span className="block text-sm font-bold text-muted">
                        {service.branch} · {service.status}
                      </span>
                    </div>
                    <strong className="text-brand">{service.credits} cr</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={140}>
        <section>
          <div className="mb-8 max-w-3xl">
            <p className="eyebrow">{c.plansEyebrow}</p>
            <h2 className="section-title">{c.plansTitle}</h2>
            <p className="section-lead">{c.plansLead}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {enterprisePlans.map((plan) => (
              <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "empresa"} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={210}>
        <section className="grid gap-5 md:grid-cols-3">
          {c.features.map((feature) => (
            <MarketplaceCard key={feature.title}>
              <h3 className="text-xl font-black">{feature.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{feature.text}</p>
            </MarketplaceCard>
          ))}
        </section>
      </Reveal>

      <Reveal delay={280}>
        <section id="empresa-form" className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <CompanyRequestForm />
          <article className="panel">
            <p className="eyebrow">{c.formEyebrow}</p>
            <h2 className="text-3xl font-black">{c.formTitle}</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">{c.formText}</p>
            <img src="/assets/club-empresas.webp" alt={c.formImgAlt} className="mt-6 h-72 w-full rounded-2xl object-cover" />
          </article>
        </section>
      </Reveal>

      <ContactTrustStrip />
    </>
  );
}
