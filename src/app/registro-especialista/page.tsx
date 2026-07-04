import { PlatformNav } from "@/components/PlatformNav";
import { TranslatedAppHero } from "@/components/TranslatedAppHero";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { SpecialistRegisterForm } from "@/components/Forms";
import { SpecialistOpportunityTeaser } from "@/components/SpecialistOpportunityTeaser";
import { Reveal } from "@/components/Reveal";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

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
      <TranslatedAppHero pageKey="registroEspecialista" />
      <SpecialistOpportunityTeaser />
      <Reveal>
        <section className="grid gap-3 md:grid-cols-4">
          <DashboardMetricCard label="Piloto" value="Fundador" detail="Primera red por comuna" />
          <DashboardMetricCard label="Costo inicial" value="$0" detail="Postulacion sin cobro" tone="brand" />
          <DashboardMetricCard label="Perfil" value="Multiservicio" detail="Un perfil, varios servicios" />
          <DashboardMetricCard label="Reputación" value="Acumulable" detail="Trabajos y calificaciones" />
        </section>
      </Reveal>
      <Reveal delay={80}>
        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Por que postular</p>
          <h2 className="text-3xl font-black text-ink">Tu Pasaporte Profesional: para que te encuentren y te prefieran.</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Aparece por oficio, comuna y especialidades cuando tu perfil sea aprobado.",
              "Declara tu tarifa esperada en CLP; OficiosPro calcula los créditos visibles para clientes.",
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
              ["1", "Completa identidad y contacto", "Apenas registras tu contacto, tu intento queda guardado. No pierdes el avance si cierras la página."],
              ["2", "Define comuna, radio y servicios", "Indica dónde trabajas y qué ofreces. Puedes ajustar tu cobertura más adelante."],
              ["3", "Declara cómo documentas tus servicios", "Cuéntanos cómo respaldas tu trabajo. No necesitas tenerlo todo listo hoy."],
              ["4", "Agrega referencias o portafolio (opcional)", "Documentos y certificaciones pueden completarse después, cuando apliquen a tu oficio."],
              ["5", "Una persona del equipo revisa y te contacta", "Revisión humana antes de publicar. Te escribimos para confirmar datos y resolver dudas."],
            ].map(([step, text, detail]) => (
              <article key={step} className="rounded-2xl border border-line bg-slate-50 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
                <strong className="mt-3 block text-ink">{text}</strong>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">{detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-950">
              Tu postulación la revisa una persona real, no un proceso automático. No prometemos empleo ni ingresos: confirmamos tus datos y te sumamos a la red por comuna cuando tu perfil queda aprobado.
            </p>
          </div>
        </MarketplaceCard>
        </section>
      </Reveal>
      <section id="registro-form" className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
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
    </main>
  );
}
