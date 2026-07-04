import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { MarketplaceCard } from "@/components/DesignSystem";
import { CompanyRequestForm } from "@/components/Forms";
import { ConversionButton } from "@/components/ConversionModal";
import { Reveal } from "@/components/Reveal";
import { seoCommunityServices } from "@/data/seoRoutes";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "OficiosPro Comunidades | Mantención para edificios y condominios",
  description:
    "Red técnica externa para la continuidad operacional de comunidades: solicitudes centralizadas, especialistas revisados y seguimiento del equipo OficiosPro.",
  path: "/comunidades",
  image: "/assets/club-empresas.webp",
  keywords: ["mantención edificios", "comunidades", "condominios", "administradores de edificios", "servicios técnicos comunidad"],
});

const communityPains = [
  ["Portón que falla de noche", "Cada incidente significa llamadas, cotizaciones sueltas y proveedores sin historial."],
  ["Sala de bombas sin mantención al día", "La comunidad depende de un solo contacto y no queda registro de lo que se hizo."],
  ["Luminarias, filtraciones y áreas comunes", "Trabajos menores se acumulan porque coordinar cada uno cuesta más que el arreglo."],
  ["Rendición al comité", "Sin historial ordenado, justificar gastos y decisiones toma horas de la administración."],
];

const availableToday = [
  "Solicitudes centralizadas con seguimiento del equipo OficiosPro.",
  "Especialistas revisados antes de publicarse, con reputación acumulable.",
  "Cada solicitud queda registrada con su estado y próximo paso.",
  "Acompañamiento operacional durante el piloto, comuna por comuna.",
];

const inConstruction = [
  "Historial de mantenciones por comunidad y por equipo.",
  "Reportes para el comité y facturación consolidada.",
  "SLA formal por tipo de servicio.",
  "Mantención preventiva programada.",
];

export default function ComunidadesPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Comunidades y edificios"
        title="Una red técnica externa para la continuidad de tu comunidad."
        subtitle="Para administradores, comités y condominios: centraliza solicitudes técnicas con especialistas revisados y seguimiento del equipo OficiosPro, en apertura controlada por comuna."
      >
        <Link className="btn-primary shine" href="#solicitud-comunidad">
          Dejar solicitud de comunidad
        </Link>
        <ConversionButton type="contacto_empresa" sourceButton="Hablar con el equipo comunidades" className="btn-secondary">
          Hablar con el equipo
        </ConversionButton>
      </AppHero>

      <Reveal delay={0}>
        <section>
          <div className="mb-6 max-w-3xl">
            <p className="eyebrow">El problema de siempre</p>
            <h2 className="section-title">La mantención de una comunidad no puede depender de la agenda de un solo maestro.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {communityPains.map(([title, text]) => (
              <MarketplaceCard key={title}>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">{text}</p>
              </MarketplaceCard>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-xs font-black uppercase text-emerald-800">Disponible hoy en el piloto</p>
            <ul className="mt-4 grid gap-2 text-sm font-bold text-emerald-950">
              {availableToday.map((item) => (
                <li key={item} className="rounded-2xl bg-white p-3">{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[28px] border border-line bg-slate-50 p-6">
            <p className="text-xs font-black uppercase text-muted">En construcción</p>
            <ul className="mt-4 grid gap-2 text-sm font-bold text-muted">
              {inConstruction.map((item) => (
                <li key={item} className="rounded-2xl bg-white p-3">{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold leading-5 text-muted">
              Activamos cada capacidad cuando podemos operarla de verdad. Sin fechas comprometidas ni promesas de cobertura nacional.
            </p>
          </article>
        </section>
      </Reveal>

      <Reveal delay={140}>
        <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-7">
          <div className="mb-5 max-w-3xl">
            <p className="eyebrow">Necesidades frecuentes</p>
            <h2 className="text-2xl font-black text-ink">Servicios que las comunidades más nos piden</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {seoCommunityServices.map((service) => (
              <Link
                key={service.slug}
                href={`/comunidades/${service.slug}`}
                className="rounded-2xl border border-line bg-slate-50 p-4 transition hover:border-brand hover:bg-brand-soft"
              >
                <strong className="block text-ink">{service.shortTitle}</strong>
                <span className="mt-1 block text-xs font-bold leading-5 text-muted">{service.description}</span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-muted">
            ¿Otra necesidad? Déjala en la solicitud: el equipo revisa cobertura real antes de comprometer visita.
          </p>
        </section>
      </Reveal>

      <Reveal delay={210}>
        <section id="solicitud-comunidad" className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <CompanyRequestForm />
          <MarketplaceCard hover={false}>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="text-2xl font-black text-ink">Piloto con acompañamiento, no autoservicio a ciegas.</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["1", "Dejas la solicitud con los datos de tu comunidad."],
                ["2", "El equipo OficiosPro revisa cobertura por comuna y te contacta."],
                ["3", "Coordinamos diagnóstico y presupuesto con especialistas revisados."],
                ["4", "Cada trabajo queda registrado con estado y seguimiento."],
              ].map(([step, text]) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
                  <p className="text-sm font-bold leading-6 text-ink">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold leading-5 text-muted">
              OficiosPro está en apertura controlada: no prometemos SLA formal todavía y la cobertura depende de la comuna. Preferimos decirlo antes que fallarle a tu comité.
            </p>
            <Link className="btn-secondary mt-5 w-full" href="/empresas">
              Ver planes y créditos para empresas
            </Link>
          </MarketplaceCard>
        </section>
      </Reveal>

      <ContactTrustStrip />
    </main>
  );
}
