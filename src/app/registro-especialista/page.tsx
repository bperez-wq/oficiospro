import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { SpecialistRegisterForm } from "@/components/Forms";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { SpecialistAssistantWidget } from "@/components/SpecialistAssistantWidget";

export const metadata = buildPublicRouteMetadata({
  title: "Registro especialista OficiosPro | Crea tu perfil",
  description: "Postula como especialista verificado, declara tus servicios, cobertura, tarifa esperada y documentos de validacion cuando aplique.",
  path: "/registro-especialista",
  keywords: ["registro especialista", "postular oficio", "trabajar en OficiosPro"],
});

export default function SpecialistRegisterPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Especialista fundador"
        title="Haz visible tu oficio en OficiosPro."
        subtitle="Crea tu perfil fundador sin costo inicial, declara tus servicios y queda en revision para sumarte a la primera red de especialistas verificados por comuna."
      />
      <section className="grid gap-3 md:grid-cols-4">
        <DashboardMetricCard label="Piloto" value="Fundador" detail="Primera red por comuna" />
        <DashboardMetricCard label="Costo inicial" value="$0" detail="Postulacion sin cobro" tone="brand" />
        <DashboardMetricCard label="Perfil" value="Multiservicio" detail="Un perfil, varios servicios" />
        <DashboardMetricCard label="Reputación" value="Acumulable" detail="Trabajos y calificaciones" />
      </section>
      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Por que postular</p>
          <h2 className="text-3xl font-black text-ink">Un perfil profesional para que te encuentren mejor.</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Aparece por oficio, comuna y especialidades cuando tu perfil sea aprobado.",
              "Declara tu tarifa esperada en CLP; OficiosPro calcula los creditos visibles para clientes.",
              "Suma trabajos, referencias y evidencia visual sin mezclar tus documentos privados.",
              "Recibe solicitudes del piloto con seguimiento operacional del equipo OficiosPro.",
            ].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">
                {item}
              </span>
            ))}
          </div>
        </MarketplaceCard>
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Como funciona la postulacion</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["1", "Completa identidad y contacto"],
              ["2", "Define comuna, radio y servicios"],
              ["3", "Declara como documentas tus servicios"],
              ["4", "Agrega referencias o portafolio si ya los tienes"],
              ["5", "OficiosPro revisa y te contacta antes de publicar"],
            ].map(([step, text]) => (
              <article key={step} className="rounded-2xl border border-line bg-slate-50 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
                <strong className="mt-3 block text-ink">{text}</strong>
              </article>
            ))}
          </div>
        </MarketplaceCard>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <SpecialistRegisterForm />
        <MarketplaceCard className="overflow-hidden p-0" hover={false}>
          <div className="relative">
            <img src="/assets/oficios/carpinteria/carpinteria-maestro-01.jpg" alt="Maestro carpintero trabajando en su taller" className="h-64 w-full object-cover" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/60 to-transparent" />
            <span className="absolute bottom-3 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-brand-dark shadow-soft backdrop-blur">
              Especialista fundador
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1.5">
            {[
              ["/assets/oficios/perfiles/gasfiter-mujer-01.jpg", "Gasfíter revisando la conexión de un lavamanos"],
              ["/assets/oficios/equipo/equipo-mujeres-planos-01.jpg", "Equipo de especialistas revisando planos en obra"],
              ["/assets/oficios/industria/industria-soldadura-01.jpg", "Soldador trabajando con protección facial"],
            ].map(([src, alt]) => (
              <img key={src} src={src} alt={alt} loading="lazy" className="h-20 w-full rounded-xl object-cover" />
            ))}
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-black">Crea tu perfil fundador sin costo inicial.</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">Foto destacada, servicios, zona, referencias opcionales, agenda y reputacion acumulable. No prometemos empleo ni ingresos garantizados.</p>
            <div className="mt-5 grid gap-2">
              {["Postulacion revisada", "Perfil publico profesional", "Documentacion privada", "Pagos trazables", "Reputacion acumulable", "Soporte OficiosPro"].map((item) => (
                <span key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </MarketplaceCard>
      </section>
      <ContactTrustStrip />
      <SpecialistAssistantWidget />
    </main>
  );
}
