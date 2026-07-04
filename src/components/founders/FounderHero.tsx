import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import type { AcquisitionContext } from "@/data/specialistAcquisition";

const trustChips = ["Sin costo inicial", "Revision en 48 h", "Perfil por comuna", "Solicitudes con seguimiento"];

export function FounderHero({
  registerHref,
  context,
}: {
  registerHref: string;
  context: AcquisitionContext;
}) {
  return (
    <section className="enterprise-shell relative overflow-hidden p-7 md:p-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow-pill inline-flex items-center gap-2 border-white/20 bg-white/10 text-white">
            <span aria-hidden className="pulse-dot text-sun" />
            Programa fundador · red en formación
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-tight md:text-6xl">
            Conviertete en especialista fundador de OficiosPro
          </h1>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-white/80">
            Construye tu Pasaporte Profesional OficiosPro: un perfil que muestra tu oficio, tu zona y tu trabajo bien hecho, con reputacion verificada desde el primer grupo de especialistas.
          </p>
          <p className="mt-3 max-w-xl text-sm font-black text-sun">
            Toma 3 minutos. Revision manual en 48 h. No necesitas pagar para postular.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AcquisitionTrackingLink
              href={registerHref}
              className="btn-sun"
              sourceButton="Hero - Empezar ahora"
              sourceComponent="FounderHero"
              context={context}
            >
              Empezar ahora
            </AcquisitionTrackingLink>
            <AcquisitionTrackingLink
              href={registerHref}
              className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20"
              sourceButton="Hero - Construir mi perfil sin costo"
              sourceComponent="FounderHero"
              context={context}
            >
              Construir mi perfil sin costo
            </AcquisitionTrackingLink>
            <a href="#proceso" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
              Ver como funciona
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {trustChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 text-sm font-bold text-white/90"
              >
                <CheckDot />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-card shadow-lift">
            <img
              src="/assets/oficios/perfiles/daniel-contreras.jpg"
              alt="Especialista fundador de OficiosPro"
              className="h-[420px] w-full object-cover"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white">
              <CheckDot />
              Verificado
            </span>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-lg font-black">Daniel C. · Gasfiteria</p>
              <p className="text-sm font-semibold text-white/80">Perfil fundador con respaldo</p>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-3 w-60 rounded-card border border-line bg-white p-4 shadow-lift md:-right-6">
            <p className="text-xs font-black uppercase tracking-wide text-brand">Postulacion guiada</p>
            <p className="mt-1 text-sm font-black leading-snug text-ink">
              3 minutos para iniciar tu perfil
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="h-1.5 flex-1 rounded-full bg-sun" />
              <span className="h-1.5 flex-1 rounded-full bg-brand" />
              <span className="h-1.5 flex-1 rounded-full bg-line" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckDot() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
