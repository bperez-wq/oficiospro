import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import Link from "next/link";

const passportPoints = [
  "Muestra tus servicios, comunas y fotos de trabajos",
  "Suma referencias y respaldo verificable",
  "Mientras más completo tu perfil, más confianza generas",
];

/* Bloque "el especialista es el corazón": fotos reales del banco de oficios
 * (referenciales, nunca presentadas como perfiles publicados) + CTA pasaporte. */
export function SpecialistHeartSection() {
  const context = { source: "campana_local" as const, campaign: "founder_specialists_home_heart", landingPage: "/" };

  return (
    <section className="overflow-hidden rounded-[32px] border border-brand/15 bg-brand-soft">
      <div className="grid gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-10">
        <div>
          <p className="eyebrow">Para quienes hacen el trabajo en terreno</p>
          <h2 className="section-title">Tu oficio merece verse, valorarse y brillar.</h2>
          <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-ink">
            OficiosPro existe para que buenos especialistas sean encontrados. Construye tu Pasaporte
            Profesional: tu trabajo, tu zona y tu respaldo en un solo lugar.
          </p>
          <ul className="mt-5 grid gap-2.5">
            {passportPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 rounded-2xl bg-white/80 p-3 text-sm font-bold leading-6 text-ink">
                <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-black text-white">✓</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <AcquisitionTrackingLink
              href="/especialistas-fundadores?source=home_heart&intent=offer_services"
              className="btn-primary shine"
              eventType="click_offer_services"
              sourceButton="Construir mi perfil - corazon home"
              context={context}
            >
              Construir mi perfil
            </AcquisitionTrackingLink>
            <Link className="btn-secondary" href="/especialistas-fundadores#beneficios">
              Ver programa fundador
            </Link>
          </div>
          <p className="mt-4 text-xs font-bold text-muted">
            Primero buenos perfiles, después más oportunidades. Sin costo inicial y con revisión humana.
          </p>
        </div>

        <figure className="relative">
          <div className="grid h-full grid-cols-2 gap-3">
            <img
              src="/assets/oficios/perfiles/daniel-contreras.jpg"
              alt="Especialista de gasfitería en terreno"
              loading="lazy"
              className="h-full min-h-52 w-full rounded-3xl object-cover"
            />
            <div className="grid gap-3">
              <img
                src="/assets/oficios/equipo/equipo-mujeres-planos-01.jpg"
                alt="Especialistas revisando planos en obra"
                loading="lazy"
                className="h-full min-h-24 w-full rounded-3xl object-cover"
              />
              <img
                src="/assets/oficios/industria/industria-soldadura-01.jpg"
                alt="Soldador trabajando con protección facial"
                loading="lazy"
                className="h-full min-h-24 w-full rounded-3xl object-cover"
              />
            </div>
          </div>
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
            Oficios reales · fotos referenciales
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
