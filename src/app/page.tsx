import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { AnalyticsPageView } from "@/components/AnalyticsTracker";
import { ConversionButton } from "@/components/ConversionModal";
import { FeaturedSpecialistsStrip } from "@/components/FeaturedSpecialistsStrip";
import { HomeClubHogarBlock } from "@/components/HomeClubHogarBlock";
import { HomeEnterpriseIntro } from "@/components/HomeEnterpriseIntro";
import { HomeHero } from "@/components/HomeHero";
import { HomeReferralBlock } from "@/components/HomeReferralBlock";
import { HomeRoleCtas } from "@/components/HomeRoleCtas";
import { TranslatedSectionHeader } from "@/components/TranslatedSectionHeader";
import { HomeBusinessUseCases } from "@/components/HomeBusinessUseCases";
import { HomeCategoryAccordion } from "@/components/HomeCategoryAccordion";
import { HomeCreditPreview } from "@/components/HomeCreditPreview";
import { CreditsHeroBadge, CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { CommunityReferralBanner } from "@/components/CommunityReferralBanner";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { QuickProblemLinks } from "@/components/QuickProblemLinks";
import { WorkProofGallery } from "@/components/WorkProofGallery";
import { companyDashboard, specialists, testimonials, workStories } from "@/data/mock";
import { heroCollageImages } from "@/data/visualAssets";
import { LocalSeoPanel, NationalCoveragePanel, SpecialtyCatalogPreview, ValidationAndRankPanel } from "@/components/MarketplaceOverview";
import { PlanActionCard } from "@/components/PlanActionCard";
import { PostulationToast } from "@/components/PostulationToast";
import { SpecialistCard } from "@/components/SpecialistCard";
import { SpecialistQuickLeadForm } from "@/components/SpecialistQuickLeadForm";
import { founderRegistrationHref } from "@/data/specialistAcquisition";
import { subscriptionPlans } from "@/data/marketplace";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = buildPublicRouteMetadata({
  title: "OficiosPro Chile | Especialistas verificados para hogar y empresas",
  description:
    "Encuentra especialistas verificados para hogar, empresas y comunidades con creditos, reputacion, disponibilidad y pago protegido.",
  path: "/",
  image: "/brand/logo-worker-tile.svg",
  keywords: ["OficiosPro", "especialistas verificados", "oficios Chile", "servicios hogar"],
});

export default function HomePage() {
  const featured = specialists.filter((specialist) => specialist.top).slice(0, 3);
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  return (
    <main>
      <AnalyticsPageView eventName="home_view" metadata={{ funnel: "specialist_acquisition" }} />
      <AnalyticsPageView eventName="specialist_home_cta_viewed" metadata={{ funnel: "specialist_acquisition", ctas: ["home_hero", "purpose", "role_card"] }} />
      <PostulationToast />
      <section className="relative isolate overflow-hidden border-b border-line bg-gradient-to-b from-mint/70 via-white to-white">
        <div className="hero-aura pointer-events-none absolute inset-0 -z-10 opacity-80" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 md:py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <HomeHero />

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-brand-soft via-mint to-accent-soft" />
            <div className="surface-grid absolute inset-0 rounded-[34px] opacity-40" />
            <div className="absolute inset-x-6 bottom-6 top-6 grid grid-cols-2 grid-rows-2 gap-3">
              {heroCollageImages.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="h-full w-full rounded-[24px] object-cover object-center shadow-card"
                />
              ))}
            </div>
            <FloatingCard className="left-0 top-6 animate-float" label="Ejemplo piloto" value="4,9★" accent="sun" />
            <FloatingCard className="right-0 top-20 animate-float [animation-delay:1.5s]" label="Respuesta referencial" value="35 min" accent="accent" />
            <CreditsHeroBadge className="bottom-16 left-4 animate-float [animation-delay:0.8s]" />
            <div className="absolute bottom-4 right-4 w-48 rounded-[20px] border border-line bg-white/95 p-3 shadow-card backdrop-blur">
              <p className="text-[11px] font-black uppercase text-muted">Tecnicos cercanos</p>
              <div className="mt-2 flex -space-x-2.5">
                {specialists.slice(0, 4).map((specialist) => (
                  <span key={specialist.id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-dark text-[11px] font-black text-white shadow-sm">
                    {specialist.initials}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs font-bold leading-4 text-muted">Fundadores en revision antes de publicar.</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSpecialistsStrip specialists={specialists} />

      <PilotLaunchStrip />

      <QuickProblemLinks />

      <Reveal delay={0}>
        <CommunityReferralBanner />
      </Reveal>

      <Reveal delay={0}>
      <section className="mx-auto grid max-w-7xl gap-3 px-5 md:grid-cols-5">
        {[
          ["4,9/5", "ejemplo piloto"],
          [specialists.length.toString(), "perfiles referenciales"],
          ["35 min", "respuesta referencial"],
          ["Créditos", "acumulables mes a mes"],
          ["Pago seguro", "al finalizar"],
        ].map(([value, label]) => (
          <article key={label} className="stat-tile">
            <strong className="block text-2xl font-black">{value}</strong>
            <span className="text-sm font-bold text-muted">{label}</span>
          </article>
        ))}
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="section-compact">
        <TranslatedSectionHeader sectionKey="flow" />
        <HowItWorksFlow />
      </section>
      </Reveal>

      <Reveal delay={0}>
      <section className="section-compact">
        <div className="rounded-[32px] bg-slate-50 p-5 md:p-8">
          <TranslatedSectionHeader sectionKey="proof" />
          <WorkProofGallery stories={workStories} />
        </div>
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="section-compact" id="club-hogar">
        <HomeClubHogarBlock />
      </section>
      </Reveal>

      <Reveal delay={0}>
      <section className="section-compact">
        <HomeCreditPreview />
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="bg-enterprise py-20 text-white" id="empresas">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <HomeEnterpriseIntro />
          <DashboardPreview />
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-5">
          <HomeBusinessUseCases />
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3">
          {enterprisePlans.map((plan) => (
            <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "empresa"} />
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={0}>
      <section className="section">
        <div className="mb-12 grid gap-6 rounded-[32px] border border-brand/15 bg-brand-soft p-6 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="eyebrow">Propósito OficiosPro</p>
            <h2 className="section-title">El buen trabajo técnico merece visibilidad.</h2>
          </div>
          <div className="grid gap-4">
            <p className="text-lg font-semibold leading-8 text-ink">
              OficiosPro ordena reputación, disponibilidad y pagos protegidos para que clientes y especialistas decidan con más confianza.
            </p>
            <AcquisitionTrackingLink href="/especialistas-fundadores?source=home_purpose&intent=offer_services" className="btn-sun justify-self-start" eventType="click_offer_services" sourceButton="Ofrecer mis servicios proposito" context={{ source: "campana_local", campaign: "founder_specialists_home_purpose", landingPage: "/" }}>
              Ofrecer mis servicios
            </AcquisitionTrackingLink>
          </div>
        </div>
        <TranslatedSectionHeader sectionKey="trust" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.author} className="panel card-hover">
              <p className="text-lg font-semibold leading-8 text-ink">“{testimonial.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft font-black text-brand-dark">
                  {testimonial.author.split(" ").map((part) => part[0]).join("")}
                </span>
                <div>
                  <strong>{testimonial.author}</strong>
                  <span className="block text-sm font-bold text-muted">{testimonial.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="section-compact" id="especialistas">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <TranslatedSectionHeader sectionKey="specialists" />
          <Link href="/especialistas" className="btn-secondary" data-event="browse_specialists_featured">
            Ver todos
          </Link>
        </div>
        <div className="mb-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <SpecialistQuickLeadForm
            title="Quieres ofrecer tus servicios en OficiosPro?"
            text="Deja tus datos basicos y te ayudamos a preparar tu perfil fundador sin costo inicial."
            context={{ source: "campana_local", campaign: "founder_specialists_home_section", landingPage: "/" }}
            sourceComponent="HomeSpecialistsSection"
            sourceButton="Captura rapida home especialistas"
            leadKind="specialist_lead"
            compact
          />
          <div className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
            <p className="eyebrow">Etapa fundador abierta</p>
            <h3 className="text-2xl font-black leading-tight text-ink">No necesitas tener todo resuelto para empezar.</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Perfil sin costo inicial", "Revision en 48 h", "Puedes ofrecer mas de un servicio", "Categorias nuevas en formacion"].map((item) => (
                <span key={item} className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-black text-brand-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={0}>
      <section className="section-compact">
        <HomeReferralBlock />
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="section-compact">
        <HomeRoleCtas />
      </section>
      </Reveal>

      <Reveal delay={0}>
      <section className="section-compact">
        <TranslatedSectionHeader sectionKey="categories" />
        <HomeCategoryAccordion />
      </section>
      </Reveal>

      <Reveal delay={80}>
      <section className="section-compact grid gap-3">
        <h2 className="mb-2 text-xl font-black text-ink md:text-2xl">Más sobre la red OficiosPro</h2>
        <CollapsiblePanel title="Cobertura nacional" detail="Regiones y comunas donde opera la red.">
          <NationalCoveragePanel />
        </CollapsiblePanel>
        <CollapsiblePanel title="Catálogo de especialidades" detail="Todos los oficios y servicios disponibles.">
          <SpecialtyCatalogPreview />
        </CollapsiblePanel>
        <CollapsiblePanel title="Validación y ranking" detail="Cómo verificamos y ordenamos a los especialistas.">
          <ValidationAndRankPanel />
        </CollapsiblePanel>
        <CollapsiblePanel title="Búsquedas locales" detail="Servicios más buscados por comuna.">
          <LocalSeoPanel />
        </CollapsiblePanel>
      </section>
      </Reveal>
    </main>
  );
}

function PilotLaunchStrip() {
  const founderContext = { source: "campana_local" as const, campaign: "founder_specialists_home_pilot", landingPage: "/" };
  return (
    <section className="section-compact">
      <div className="grid gap-5 rounded-[32px] border border-brand/15 bg-white p-5 shadow-soft md:grid-cols-[1fr_1.2fr] md:p-7">
        <div>
          <p className="eyebrow">Etapa piloto</p>
          <h2 className="text-3xl font-black leading-tight text-ink">Estamos sumando especialistas fundadores por comuna.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            OficiosPro esta en apertura controlada. Si aun no hay match exacto para tu servicio o zona, puedes dejar tu solicitud y el equipo la revisara manualmente.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Clientes", "Solicita contacto cuando no encuentres un especialista disponible."],
            ["Especialistas", "Crea tu perfil fundador sin costo inicial y queda en revision."],
            ["Operaciones", "Leads y postulaciones se revisan desde el panel interno."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-line bg-slate-50 p-4">
              <strong className="block text-ink">{title}</strong>
              <span className="mt-2 block text-sm font-bold leading-6 text-muted">{text}</span>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Link className="btn-primary" href="/piloto">
            Ver etapa piloto
          </Link>
          <AcquisitionTrackingLink href={founderRegistrationHref(founderContext)} className="btn-secondary" sourceButton="Crear perfil fundador piloto home" context={founderContext}>
            Crear perfil fundador
          </AcquisitionTrackingLink>
          <Link className="btn-secondary" href="/especialistas-fundadores">
            Ver programa fundador
          </Link>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  label,
  value,
  className,
  accent = "brand",
}: {
  label: string;
  value: string;
  className: string;
  accent?: "brand" | "accent" | "sun";
}) {
  const dot = accent === "sun" ? "bg-sun" : accent === "accent" ? "bg-accent" : "bg-brand";
  return (
    <div className={`absolute rounded-[22px] border border-line bg-white/95 p-4 shadow-card backdrop-blur ${className}`}>
      <span className="flex items-center gap-2 text-xs font-black uppercase text-muted">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <strong className="mt-1 block text-2xl font-black text-ink">{value}</strong>
    </div>
  );
}

function CollapsiblePanel({ title, detail, children }: { title: string; detail: string; children: ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-[24px] border border-line bg-white shadow-sm transition duration-200 open:border-brand/30 open:shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <strong className="block text-lg font-black text-ink">{title}</strong>
          <span className="block truncate text-sm font-bold text-muted">{detail}</span>
        </span>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-300 group-open:rotate-180 group-open:border-brand group-open:text-brand-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-line p-5">{children}</div>
    </details>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/10 p-5 shadow-card">
      <div className="rounded-[24px] bg-white p-5 text-ink">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="text-xs font-black uppercase text-muted">Dashboard empresa</p>
            <h3 className="text-2xl font-black">Operación activa</h3>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">SLA 2.4 h</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric label="Créditos disponibles" value={companyDashboard.creditsAvailable.toString()} />
          <Metric label="Usados este mes" value={companyDashboard.creditsUsed.toString()} />
          <Metric label="Sucursales activas" value={companyDashboard.activeBranches.toString()} />
          <Metric label="Proveedores frecuentes" value={companyDashboard.suppliers.toString()} />
        </div>
        <div className="mt-5 grid gap-3">
          {companyDashboard.services.slice(0, 3).map((service) => (
            <div key={`${service.service}-${service.branch}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <strong>{service.service}</strong>
                <span className="block text-sm font-bold text-muted">{service.branch}</span>
              </div>
              <span className="font-black text-brand">{service.credits} cr</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-3xl font-black">{value}</strong>
    </article>
  );
}

// CTA migrado a HomeRoleCtas (i18n).
