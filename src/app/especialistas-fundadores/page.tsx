import Link from "next/link";
import { AcquisitionPageViewTracker, AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import {
  founderNoPromiseMessages,
  founderProgramBenefits,
  founderRegistrationHref,
  founderReferralHref,
} from "@/data/specialistAcquisition";
import { seoWorkerAcquisitionPages } from "@/data/seoRoutes";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Especialistas Fundadores OficiosPro | Crea tu perfil",
  description: "Programa para especialistas de oficios que quieren crear un perfil fundador, ordenar sus servicios y aparecer por comuna cuando sean aprobados.",
  path: "/especialistas-fundadores",
  keywords: ["especialistas fundadores", "oficios chile", "registro especialista", "perfil profesional oficio"],
});

const founderContext = { source: "campana_local" as const, campaign: "founder_specialists", landingPage: "/especialistas-fundadores" };
const tradeLinks = seoWorkerAcquisitionPages.slice(0, 6);

export default function FounderSpecialistsPage() {
  const registerHref = founderRegistrationHref(founderContext);
  const referralHref = founderReferralHref();

  return (
    <main className="section grid gap-8">
      <AcquisitionPageViewTracker source="campana_local" context={founderContext} />
      <PlatformNav />
      <AppHero
        eyebrow="Especialistas Fundadores OficiosPro"
        title="Crea un perfil profesional para que tu oficio sea mas visible."
        subtitle="Estamos formando la primera red de especialistas fundadores por comuna. Postular no tiene costo inicial; cada perfil se revisa antes de publicarse."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <DashboardMetricCard label="Costo inicial" value="$0" detail="Postulacion al piloto" tone="brand" />
        <DashboardMetricCard label="Perfil" value="Multiservicio" detail="Oficio, comuna y evidencia" />
        <DashboardMetricCard label="Revision" value="48h" detail="SLA operacional objetivo" />
        <DashboardMetricCard label="Promesa" value="Honesta" detail="Sin ingresos garantizados" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Por que entrar ahora</p>
          <h2 className="text-3xl font-black leading-tight text-ink">OficiosPro te ayuda a presentarte mejor, no a depender de mensajes sueltos.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {founderProgramBenefits.map((benefit) => (
              <span key={benefit} className="rounded-2xl bg-brand-soft/80 p-4 text-sm font-black leading-6 text-brand-dark">
                {benefit}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <AcquisitionTrackingLink href={registerHref} className="btn-primary" sourceButton="Crear perfil fundador" context={founderContext}>
              Crear perfil fundador
            </AcquisitionTrackingLink>
            <AcquisitionTrackingLink href={referralHref} className="btn-secondary" sourceButton="Referir a un especialista" context={{ source: "referido_especialista", campaign: "founder_specialist_referrals" }}>
              Referir a un especialista
            </AcquisitionTrackingLink>
          </div>
        </MarketplaceCard>

        <MarketplaceCard hover={false}>
          <p className="eyebrow">Que no prometemos</p>
          <h2 className="text-2xl font-black text-ink">Apertura controlada y sin humo.</h2>
          <div className="mt-4 grid gap-3">
            {founderNoPromiseMessages.map((message) => (
              <span key={message} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black leading-6 text-amber-900">
                {message}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-muted">
            El objetivo es ordenar perfil, servicios, precios esperados y cobertura para activar oportunidades reales cuando exista demanda compatible.
          </p>
        </MarketplaceCard>
      </section>

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Por oficio y comuna</p>
            <h2 className="text-3xl font-black leading-tight text-ink">Tambien estamos captando por oficios especificos.</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">
              Estas paginas explican que buscamos por rubro y llevan el source correcto al formulario de registro.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tradeLinks.map((page) => (
              <Link key={page.slug} href={`/trabajos/${page.slug}`} className="rounded-2xl border border-line bg-slate-50 p-4 transition hover:border-brand hover:bg-brand-soft">
                <strong className="block text-ink">{page.shortTitle}</strong>
                <span className="mt-1 block text-xs font-bold leading-5 text-muted">{page.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["1", "Postulas", "Completas identidad, oficio, comuna, servicios, tarifa esperada y antecedentes opcionales."],
          ["2", "Revisamos", "Operaciones revisa calidad minima, cobertura, formalizacion y datos de contacto."],
          ["3", "Activamos", "Si el perfil cumple, queda aprobado o publicado con badge fundador cuando corresponda."],
        ].map(([step, title, text]) => (
          <MarketplaceCard key={step} hover={false}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
            <h2 className="mt-4 text-2xl font-black text-ink">{title}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">{text}</p>
          </MarketplaceCard>
        ))}
      </section>
    </main>
  );
}

