import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Piloto OficiosPro | Primeras comunas y especialistas",
  description: "Revisa el piloto de OficiosPro para activar especialistas verificados, leads reales, creditos y cobertura controlada.",
  path: "/piloto",
  keywords: ["piloto OficiosPro", "especialistas fundadores", "cobertura inicial"],
});

const pilotSteps = [
  ["1", "Especialistas fundadores crean perfil sin costo inicial."],
  ["2", "OficiosPro revisa datos, servicios, comuna y antecedentes."],
  ["3", "Clientes dejan solicitudes reales por zona y servicio."],
  ["4", "El equipo conecta oportunidades y aprende antes de escalar."],
];

const pilotAudiences = [
  ["Clientes", "Puedes buscar, comparar y dejar una solicitud si aun no hay especialista exacto en tu zona."],
  ["Especialistas", "Puedes crear tu perfil fundador para quedar en revision y aparecer cuando la red se active en tu comuna."],
  ["Empresas", "Puedes pedir contacto para mantenciones piloto con seguimiento operacional."],
];

export default function PilotPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="overflow-hidden rounded-[34px] border border-line bg-white shadow-card">
        <div className="surface-grid grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow">Piloto fundador</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">Abrimos OficiosPro de forma controlada.</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">
              Estamos validando la red con especialistas fundadores, clientes reales y seguimiento humano. Preferimos capturar bien la demanda antes de prometer cobertura masiva.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/especialistas">
                Buscar especialistas
              </Link>
              <ConversionButton type="registro_especialista" sourceButton="Crear perfil fundador piloto" className="btn-sun">
                Crear perfil fundador
              </ConversionButton>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardMetricCard label="Etapa" value="Piloto" detail="Apertura controlada" tone="brand" />
            <DashboardMetricCard label="Supply" value="Fundadores" detail="Postulaciones revisadas" />
            <DashboardMetricCard label="Clientes" value="Solicitudes" detail="Contacto y seguimiento" />
            <DashboardMetricCard label="Escala" value="Pendiente" detail="No listo para masivo" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {pilotAudiences.map(([title, text]) => (
          <MarketplaceCard key={title} hover={false}>
            <p className="eyebrow">{title}</p>
            <h2 className="text-2xl font-black text-ink">{title === "Especialistas" ? "Perfil fundador" : title === "Empresas" ? "Cuenta piloto" : "Solicitud real"}</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-muted">{text}</p>
          </MarketplaceCard>
        ))}
      </section>

      <section className="rounded-[32px] border border-brand/15 bg-brand-soft p-6 md:p-8">
        <p className="eyebrow">Como funciona</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {pilotSteps.map(([step, text]) => (
            <article key={step} className="rounded-2xl border border-white/70 bg-white p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
              <strong className="mt-3 block leading-6 text-ink">{text}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
