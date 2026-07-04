import Link from "next/link";
import { AcquisitionPageViewTracker, AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { PlatformNav } from "@/components/PlatformNav";
import { FounderHero } from "@/components/founders/FounderHero";
import { FounderValueCards } from "@/components/founders/FounderValueCards";
import { FounderTimeline } from "@/components/founders/FounderTimeline";
import { FounderSocialProof } from "@/components/founders/FounderSocialProof";
import { FounderWizard } from "@/components/founders/FounderWizard";
import { FounderFinalCta } from "@/components/founders/FounderFinalCta";
import { FounderStickyCta } from "@/components/founders/FounderStickyCta";
import { SpecialistQuickLeadForm } from "@/components/SpecialistQuickLeadForm";
import {
  founderNoPromiseMessages,
  founderReferralHref,
} from "@/data/specialistAcquisition";
import { seoWorkerAcquisitionPages } from "@/data/seoRoutes";
import { AnswerBlockFromTopic } from "@/components/seo/AnswerBlock";
import { getAnswerTopicsForPage } from "@/data/answerEngineTopics";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { Reveal } from "@/components/Reveal";

export const metadata = buildPublicRouteMetadata({
  title: "Especialistas Fundadores OficiosPro | Crea tu perfil",
  description: "Programa para especialistas de oficios que quieren crear un perfil fundador, ordenar sus servicios y aparecer por comuna cuando sean aprobados.",
  path: "/especialistas-fundadores",
  keywords: ["especialistas fundadores", "oficios chile", "registro especialista", "perfil profesional oficio"],
});

const founderContext = { source: "campana_local" as const, campaign: "founder_specialists", landingPage: "/especialistas-fundadores" };
const tradeLinks = seoWorkerAcquisitionPages.slice(0, 6);
const popularFounderTrades = [
  "Gasfiteria",
  "Electricidad",
  "Construccion",
  "Terminaciones",
  "Carpinteria",
  "Metalmecanica",
  "Riego tecnificado",
  "Piscinas",
  "Climatizacion",
  "Mantencion industrial",
  "Aseo técnico",
  "Control de plagas",
];

export default function FounderSpecialistsPage() {
  const registerHref = "/registro-especialista?source=founder_landing&intent=offer_services";
  const referralHref = founderReferralHref();

  return (
    <main className="section grid gap-10">
      <AcquisitionPageViewTracker eventType="founder_landing_view" source="campana_local" context={founderContext} />
      <PlatformNav />

      <FounderHero registerHref={registerHref} context={founderContext} />
      <FounderStickyCta href={registerHref} />

      <Reveal delay={0}>
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <SpecialistQuickLeadForm
          title="Tienes un oficio? Te ayudamos a crear tu perfil."
          text="Si aun no quieres completar todo el registro, deja tus datos basicos y operaciones te orienta."
          context={founderContext}
          sourceComponent="FounderSpecialistsPage"
          sourceButton="Captura rapida fundadores"
          leadKind="founder_lead"
        />
        <div className="rounded-[28px] border border-line bg-slate-50 p-6">
          <p className="eyebrow">Categorias en formacion</p>
          <h2 className="text-2xl font-black leading-tight text-ink">Postula aunque tu categoria aun este creciendo.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-muted">
            Estamos priorizando especialistas por comuna. Puedes ofrecer mas de un servicio y pedir ayuda si no sabes que documento tributario corresponde.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {popularFounderTrades.map((trade, index) => (
              <span key={`popular-founder-trade-${index}-${trade}`} className="rounded-full border border-brand/15 bg-white px-3 py-1.5 text-xs font-black text-brand-dark">
                {trade}
              </span>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      <div id="beneficios">
        <FounderValueCards />
      </div>

      <Reveal delay={70}>
      <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-5 shadow-sm md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <p className="text-sm font-black uppercase text-brand-dark">Perfil fundador sin costo inicial</p>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-brand-dark/80">
            Toma 3 minutos. Revision en 48 h. Si falta informacion, el equipo OficiosPro te contacta antes de publicar.
          </p>
        </div>
        <AcquisitionTrackingLink
          href={registerHref}
          className="btn-primary shine mt-4 md:mt-0"
          sourceButton="CTA beneficios - Crear perfil sin costo"
          sourceComponent="FounderBenefitsCta"
          context={founderContext}
        >
          Crear perfil sin costo
        </AcquisitionTrackingLink>
      </section>
      </Reveal>

      <FounderTimeline />

      <FounderSocialProof />

      <FounderWizard context={founderContext} />

      <Reveal delay={140}>
      <section id="referidos" className="rounded-[32px] border border-line bg-white p-7 shadow-soft md:p-8">
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
      </Reveal>

      {getAnswerTopicsForPage("/especialistas-fundadores").slice(0, 1).map((topic) => (
        <AnswerBlockFromTopic key={topic.id} topic={topic} ctaLabel="Ver programa fundador" />
      ))}

      <Reveal delay={160}>
      <section className="rounded-[32px] border border-line bg-white p-7 shadow-soft md:p-8">
        <p className="eyebrow">Hacia dónde va OficiosPro</p>
        <h2 className="text-3xl font-black leading-tight text-ink">Tu Pasaporte Profesional es el primer paso de un respaldo mayor.</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-muted">
          Construimos por etapas y activamos cada beneficio solo cuando podemos operarlo de verdad. Sin fechas comprometidas y sin promesas de ingresos.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-black uppercase text-emerald-800">Disponible hoy</p>
            <ul className="mt-3 grid gap-2 text-sm font-bold text-emerald-950">
              <li>Perfil profesional por comuna y oficio.</li>
              <li>Revisión humana antes de publicar.</li>
              <li>Solicitudes con seguimiento del equipo.</li>
              <li>Reputación acumulable por trabajo.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-brand/15 bg-brand-soft p-5">
            <p className="text-xs font-black uppercase text-brand-dark">En construcción</p>
            <ul className="mt-3 grid gap-2 text-sm font-bold text-brand-dark">
              <li>Evidencia por trabajo (antes y después).</li>
              <li>Pago protegido de punta a punta.</li>
              <li>Carpeta documental privada y segura.</li>
              <li>Formalización asistida paso a paso.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-line bg-slate-50 p-5">
            <p className="text-xs font-black uppercase text-muted">Más adelante</p>
            <ul className="mt-3 grid gap-2 text-sm font-bold text-muted">
              <li>Capacitaciones y certificaciones por oficio.</li>
              <li>Beneficios y convenios, solo con partners reales.</li>
              <li>Acceso a mejores oportunidades según tu historial.</li>
            </ul>
          </article>
        </div>
        <p className="mt-4 text-xs font-semibold leading-5 text-muted">
          Nada de esta hoja de ruta es una promesa contractual: cada etapa se activa cuando la operación y los acuerdos existen de verdad.
        </p>
      </section>
      </Reveal>

      <FounderFinalCta registerHref={registerHref} referralHref={referralHref} context={founderContext} />

      <footer className="grid gap-3 border-t border-line pt-6">
        <div className="flex flex-wrap gap-2">
          {founderNoPromiseMessages.map((message) => (
            <span key={message} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
              {message}
            </span>
          ))}
        </div>
        <p className="max-w-3xl text-xs font-semibold leading-5 text-muted">
          La participacion en el programa fundador esta sujeta a revision operativa para mantener el estandar de confianza de OficiosPro.
        </p>
      </footer>
    </main>
  );
}
