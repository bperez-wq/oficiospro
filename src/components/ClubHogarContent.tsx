"use client";

import Link from "next/link";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { CreditExplainer } from "@/components/CreditExplainer";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, VisualRail } from "@/components/DesignSystem";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { TransactionList } from "@/components/Lists";
import { PlanActionCard } from "@/components/PlanActionCard";
import { VisualFaqAccordion } from "@/components/VisualFaqAccordion";
import { Reveal } from "@/components/Reveal";
import { defaultCommercialConfig } from "@/data/commercialConfig";
import { defaultTransactions, workStories } from "@/data/mock";
import { formatCLP, subscriptionPlans } from "@/data/marketplace";
import { shouldShowDemoData } from "@/lib/demoData";
import { clubHogarContent } from "@/data/i18nContent/clubHogarContent";
import { useI18n } from "@/lib/i18n/I18nProvider";

// Créditos + imagen por servicio del comparador (el label se traduce por índice).
const comparisonMeta: { credits: number; image: string }[] = [
  { credits: 25, image: "/assets/oficios/calefont/calefont-mantencion-01.jpg" },
  { credits: 18, image: "/assets/oficios/gasfiteria/gasfiteria-red-exterior-01.jpg" },
  { credits: 12, image: "/assets/oficios/electricidad/electricidad-luminaria-01.jpg" },
  { credits: 18, image: "/assets/oficios/jardineria/jardineria-plantacion-01.jpg" },
];

export function ClubHogarContent() {
  const { locale, t } = useI18n();
  const c = clubHogarContent[locale] ?? clubHogarContent.es;
  const discount = defaultCommercialConfig.subscriberDiscountCredits;
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");
  const featuredPlan = clientPlans.find((plan) => plan.id === "plus") ?? clientPlans[0];
  const visibleTransactions = shouldShowDemoData() ? defaultTransactions : [];
  const comparison = comparisonMeta.map((meta, index) => ({ ...meta, service: c.comparisonServices[index] ?? "" }));

  const simMonths: [string, number][] = [
    [c.simMonths[0], featuredPlan.monthlyCredits],
    [c.simMonths[1], featuredPlan.monthlyCredits * 3],
    [c.simMonths[2], featuredPlan.monthlyCredits * 6],
    [c.simMonths[3], featuredPlan.monthlyCredits * 12],
  ];

  return (
    <>
      <PremiumPhotoHero
        eyebrow={t("pages.clubHogar.eyebrow")}
        title={t("pages.clubHogar.title")}
        subtitle={t("pages.clubHogar.subtitle")}
        image="/assets/hero-hogar.webp"
        tone="brand"
        chips={[`${featuredPlan.monthlyCredits} créditos al mes`, `Acumulables hasta ${featuredPlan.accumulatesMonths} meses`, `−${discount} créditos por servicio`, "Pago protegido al finalizar"]}
        footnote="Los créditos y descuentos mostrados corresponden a la configuración vigente de los planes."
        aside={
          <div className="relative">
            <div className="rounded-card bg-white p-6 text-ink shadow-lift">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-muted">Plan destacado</p>
                <span className="rounded-full bg-sun-soft px-3 py-1 text-[11px] font-black text-sun-dark">{featuredPlan.name}</span>
              </div>
              <strong className="mt-2 block text-4xl font-black">{formatCLP(featuredPlan.priceCLP)}<span className="text-base font-black text-muted">/mes</span></strong>
              <div className="mt-4 rounded-2xl bg-brand-soft p-4">
                <span className="text-sm font-black text-brand-dark">Créditos mensuales</span>
                <strong className="block text-3xl font-black text-ink">{featuredPlan.monthlyCredits}</strong>
                <span className="text-xs font-bold text-muted">Acumulables hasta {featuredPlan.accumulatesMonths} meses</span>
              </div>
              <a href="#planes" className="btn-primary mt-5 w-full">Comparar planes</a>
              <p className="mt-3 text-xs font-bold leading-5 text-muted">Compara con calma: el detalle de cada plan está más abajo, sin letra chica.</p>
            </div>
          </div>
        }
      >
        <ConversionButton type="consulta_general" sourceButton="Usar créditos Club Hogar" className="btn-sun shine">
          {c.heroUseCredits}
        </ConversionButton>
        <ConversionButton type="lead_cliente" sourceButton="Crear cuenta Club Hogar" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
          {c.heroCreateAccount}
        </ConversionButton>
        <CreditsHelpTrigger className="text-sm font-black text-white underline underline-offset-2 hover:opacity-80">
          {c.heroCreditsHelp}
        </CreditsHelpTrigger>
      </PremiumPhotoHero>

      <VisualRail eyebrow={c.railEyebrow} title={c.railTitle} text={c.railText}>
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardMetricCard label={c.railMonthlyLabel} value={`${featuredPlan.monthlyCredits} cr`} detail={featuredPlan.name} tone="brand" />
          <DashboardMetricCard label={c.railAccumLabel} value={c.railAccumValue} detail={c.railAccumDetail} />
          <DashboardMetricCard label={c.railSavingLabel} value={`${discount} cr`} detail={c.railSavingDetail} />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <img src="/assets/oficios/calefont/calefont-mantencion-01.jpg" alt={c.railImageAlt} loading="lazy" className="h-44 w-full object-cover" />
        </div>
      </VisualRail>

      <Reveal delay={0}>
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[28px] border border-line bg-slate-50/80 p-6 shadow-sm">
            <span className="chip bg-slate-200/70 text-muted">{c.noSubChip}</span>
            <h2 className="mt-3 text-2xl font-black text-ink">{c.noSubTitle}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">{c.noSubText}</p>
            <div className="mt-4 grid gap-2">
              {comparison.map(({ service, credits, image }) => (
                <div key={service} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-black">
                  <span className="flex min-w-0 items-center gap-2.5 text-ink">
                    <img src={image} alt={service} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <span className="truncate">{service}</span>
                  </span>
                  <span className="shrink-0 text-muted">{credits} cr</span>
                </div>
              ))}
            </div>
            <Link href="/checkout" className="btn-secondary mt-5 w-full" data-event="club_buy_credits">
              {c.buyCredits}
            </Link>
          </article>
          <article className="rounded-[28px] border-2 border-brand bg-gradient-to-b from-brand-soft/60 to-white p-6 shadow-card">
            <span className="chip bg-brand text-white">{c.withClubChip}</span>
            <h2 className="mt-3 text-2xl font-black text-ink">{c.withClubTitle.replace("{n}", String(discount))}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">{c.withClubText}</p>
            <div className="mt-4 grid gap-2">
              {comparison.map(({ service, credits, image }) => (
                <div key={service} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-black shadow-sm">
                  <span className="flex min-w-0 items-center gap-2.5 text-ink">
                    <img src={image} alt={service} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <span className="truncate">{service}</span>
                  </span>
                  <span className="shrink-0 text-brand-dark">
                    {credits - discount} cr
                    <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">−{discount}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-900">
              <span>Ahorro en estos {comparison.length} ejemplos</span>
              <span className="rounded-full bg-white px-3 py-1 text-emerald-700">−{discount * comparison.length} créditos</span>
            </p>
            <ConversionButton type="lead_cliente" sourceButton="Elegir plan comparador Club Hogar" className="btn-primary shine mt-4 w-full">
              {c.choosePlan}
            </ConversionButton>
          </article>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="grid gap-5 md:grid-cols-3" id="planes">
          {clientPlans.map((plan) => (
            <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "plus"} />
          ))}
        </section>
      </Reveal>

      <CreditExplainer
        availableCredits={featuredPlan.monthlyCredits}
        monthlyCredits={featuredPlan.monthlyCredits}
        baseServiceCredits={12}
        clubServiceCredits={10}
      />

      <Reveal delay={140}>
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="panel">
            <p className="eyebrow">{c.simEyebrow}</p>
            <h2 className="text-3xl font-black">{c.simTitle.replace("{plan}", featuredPlan.name).replace("{n}", String(featuredPlan.monthlyCredits))}</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">{c.simText.replace("{price}", formatCLP(featuredPlan.priceCLP))}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {simMonths.map(([label, credits], index) => {
                const maxCredits = simMonths[simMonths.length - 1][1];
                const percent = Math.max(14, Math.round((credits / maxCredits) * 100));
                return (
                  <div key={label} className="rounded-2xl bg-brand-soft p-4">
                    <div aria-hidden className="flex h-24 items-end overflow-hidden rounded-xl bg-white/70 p-1.5">
                      <div
                        className="op-grow w-full rounded-lg bg-gradient-to-t from-brand-dark to-brand"
                        style={{ height: `${percent}%`, animationDelay: `${index * 120}ms` }}
                      />
                    </div>
                    <span className="mt-3 block text-sm font-black text-muted">{label}</span>
                    <strong className="block text-2xl font-black">{credits} {c.creditsUnit}</strong>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 rounded-2xl bg-sun-soft p-4 text-sm font-black text-sun-dark">{c.simNote}</p>
          </article>
          <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
            <img src="/assets/oficios/gasfiteria/gasfiteria-griferia-01.jpg" alt="Gasfíter reparando la grifería del baño" loading="lazy" className="h-72 w-full object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-black">{c.includesTitle}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {c.includesItems.map((item) => (
                  <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>
      </Reveal>

      <Reveal delay={210}>
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel">
            <p className="eyebrow">{c.casesEyebrow}</p>
            <h2 className="mb-5 text-3xl font-black">{c.casesTitle}</h2>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {c.caseRanges.map(({ credits, text }) => (
                <span key={credits} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-ink">
                  {credits}
                  <small className="mt-1 block text-xs font-bold text-muted">{text}</small>
                </span>
              ))}
            </div>
            <p className="mb-3 text-xs font-bold text-muted">{c.casesNote}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {workStories.map((work) => (
                <article key={work.title} className="flex gap-4 rounded-2xl border border-line bg-slate-50 p-3">
                  <img src={work.image} alt={work.title} className="h-20 w-24 rounded-xl object-cover" />
                  <div>
                    <strong>{work.title}</strong>
                    <span className="block text-sm font-bold text-muted">
                      {work.commune} · {work.credits} {c.creditsUnit}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </article>
          <article className="panel">
            <p className="eyebrow">{c.historyEyebrow}</p>
            <h2 className="mb-5 text-3xl font-black">{c.historyTitle}</h2>
            <p className="mb-5 text-sm font-bold leading-6 text-muted">{c.historyText}</p>
            <TransactionList transactions={visibleTransactions} />
          </article>
        </section>
      </Reveal>

      <Reveal delay={280}>
        <section>
          <div className="mb-6 max-w-3xl">
            <p className="eyebrow">{c.faqEyebrow}</p>
            <h2 className="text-3xl font-black text-ink">{c.faqTitle}</h2>
          </div>
          <VisualFaqAccordion items={c.faq} />
        </section>
      </Reveal>

      <StickyMobileCTA>
        <a className="btn-primary min-h-11 flex-1 px-3 text-sm" href="#planes">
          {c.choosePlan}
        </a>
        <Link className="btn-secondary min-h-11 flex-1 px-3 text-sm" href="/checkout">
          {c.buyCredits}
        </Link>
      </StickyMobileCTA>
    </>
  );
}
