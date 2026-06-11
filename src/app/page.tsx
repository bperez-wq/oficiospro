import Link from "next/link";
import type { ReactNode } from "react";
import { ConversionButton } from "@/components/ConversionModal";
import { FeaturedSpecialistsStrip } from "@/components/FeaturedSpecialistsStrip";
import { HeroSearchPanel } from "@/components/HeroSearchPanel";
import { HomeBusinessUseCases } from "@/components/HomeBusinessUseCases";
import { HomeCategoryAccordion } from "@/components/HomeCategoryAccordion";
import { HomeCreditPreview } from "@/components/HomeCreditPreview";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { QuickProblemLinks } from "@/components/QuickProblemLinks";
import { heroCollageImages } from "@/data/visualAssets";
import { WorkProofGallery } from "@/components/WorkProofGallery";
import { companyDashboard, companyUseCases, specialists, testimonials, workStories } from "@/data/mock";
import { LocalSeoPanel, NationalCoveragePanel, SpecialtyCatalogPreview, ValidationAndRankPanel } from "@/components/MarketplaceOverview";
import { PlanActionCard } from "@/components/PlanActionCard";
import { PostulationToast } from "@/components/PostulationToast";
import { SpecialistCard } from "@/components/SpecialistCard";
import { subscriptionPlans } from "@/data/marketplace";

export default function HomePage() {
  const featured = specialists.filter((specialist) => specialist.top).slice(0, 3);
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  return (
    <main>
      <PostulationToast />
      <section className="relative isolate overflow-hidden border-b border-line bg-gradient-to-b from-mint/70 via-white to-white">
        <div className="hero-aura pointer-events-none absolute inset-0 -z-10 opacity-80" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 md:py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="animate-fade-up">
            <span className="eyebrow-pill">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Empoderamos el oficio. Empoderamos al trabajador.
            </span>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">
              Especialistas verificados para tu <span className="gradient-text">hogar, empresa o campo</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">
              Explora sin registrarte, compara reputación y reserva o cotiza pagando con créditos.
            </p>
            <HeroSearchPanel />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href="/especialistas" className="btn-primary" data-event="browse_specialists_home_hero">
                Buscar especialista
              </Link>
              <ConversionButton type="registro_especialista" sourceButton="Postular como especialista hero" className="btn-sun">
                Postular como especialista
              </ConversionButton>
              <Link href="#club-hogar" className="text-sm font-black text-brand-dark transition hover:text-brand" data-event="home_hero_credits_link">
                ¿Cómo funcionan los créditos? →
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                ["★", "4,9 promedio", "chip-sun"],
                ["✓", "Pago protegido", "chip-brand"],
                ["✓", "Técnicos verificados", "chip-emerald"],
                ["◎", "Cobertura nacional", "chip-brand"],
              ].map(([icon, label, cls]) => (
                <span key={label} className={`${cls} px-3.5 py-2 text-[13px]`}>
                  <span aria-hidden>{icon}</span> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-brand-soft via-mint to-accent-soft" />
            <div className="surface-grid absolute inset-0 rounded-[34px] opacity-40" />
            <div className="absolute inset-x-6 bottom-6 top-6 grid grid-cols-2 grid-rows-2 gap-3">
              {heroCollageImages.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  loading={index === 0 ? undefined : "lazy"}
                  className="h-full w-full rounded-[24px] object-cover shadow-card"
                />
              ))}
            </div>
            <FloatingCard className="left-0 top-8 animate-float" label="Calificación promedio" value="4,9★" accent="sun" />
            <FloatingCard className="right-0 top-24 animate-float [animation-delay:1.5s]" label="Disponible ahora" value="35 min" accent="accent" />
            <FloatingCard className="bottom-16 left-6 animate-float [animation-delay:0.8s]" label="Precio desde" value="30 créditos" accent="brand" />
            <FloatingCard className="bottom-40 right-2 animate-float [animation-delay:1.1s]" label="Especialista a" value="3,8 km" accent="accent" />
            <div className="absolute bottom-8 right-6 w-64 rounded-[24px] border border-line bg-white/95 p-4 shadow-card backdrop-blur">
              <p className="text-xs font-black uppercase text-muted">Técnicos cercanos</p>
              <div className="mt-3 flex -space-x-3">
                {specialists.slice(0, 5).map((specialist) => (
                  <span key={specialist.id} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white shadow-sm">
                    {specialist.initials}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-muted">Especialistas con trabajos reales y reputación verificada.</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSpecialistsStrip specialists={specialists} />

      <QuickProblemLinks />

      <section className="mx-auto grid max-w-7xl gap-3 px-5 md:grid-cols-5">
        {[
          ["4,9/5", "satisfacción"],
          [specialists.length.toString(), "especialistas verificados"],
          ["35 min", "respuesta rápida"],
          ["Créditos", "acumulables mes a mes"],
          ["Pago seguro", "al finalizar"],
        ].map(([value, label]) => (
          <article key={label} className="stat-tile">
            <strong className="block text-2xl font-black">{value}</strong>
            <span className="text-sm font-bold text-muted">{label}</span>
          </article>
        ))}
      </section>

      <section className="section-compact">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="De buscar a cerrar el trabajo, sin perseguir presupuestos."
          text="Disponibilidad, reputación y créditos ordenados para decidir rápido."
        />
        <HowItWorksFlow />
      </section>

      <section className="section-compact">
        <div className="rounded-[32px] bg-slate-50 p-5 md:p-8">
          <SectionHeader eyebrow="Trabajos realizados" title="Evidencia visual antes de reservar." text="La confianza mejora cuando puedes ver trabajos, comunas, créditos usados y calificaciones." />
          <WorkProofGallery stories={workStories} />
        </div>
      </section>

      <section className="section-compact" id="club-hogar">
        <div className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <p className="eyebrow">Club Hogar</p>
            <h2 className="section-title">La suscripción para tener tranquilidad acumulada.</h2>
            <p className="section-lead">
              Acumula créditos mensuales para resolver problemas de gasfitería, electricidad, jardín, climatización o mantenciones cuando los necesites.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Créditos acumulables", "Garantía OficiosPro", "Atención prioritaria", "Historial de servicios"].map((item) => (
                <span key={item} className="chip bg-brand-soft text-brand-dark">
                  {item}
                </span>
              ))}
            </div>
            <ConversionButton type="lead_cliente" sourceButton="Conocer planes" className="btn-primary mt-7">
              Conocer planes
            </ConversionButton>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[["Mes 1", "45 créditos"], ["Mes 2", "90 créditos"], ["Mes 3", "135 créditos"]].map(([label, value]) => (
              <article key={label} className="rounded-[24px] border border-line bg-slate-50 p-5">
                <span className="font-black text-muted">{label}</span>
                <strong className="mt-2 block text-3xl font-black">{value}</strong>
                <p className="mt-3 text-sm font-semibold text-muted">Úsalos en visitas, diagnósticos o mantenciones.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-compact">
        <HomeCreditPreview />
      </section>

      <section className="bg-enterprise py-20 text-white" id="empresas">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-teal-200">OficiosPro Empresas</p>
            <h2 className="text-4xl font-black leading-tight md:text-5xl">Centraliza tus mantenciones y paga con créditos corporativos.</h2>
            <p className="mt-5 text-lg font-semibold leading-8 text-white/75">
              Una red bajo demanda para oficinas, restaurantes, bodegas, comunidades y plantas productivas que necesitan continuidad operacional.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {companyUseCases.map((item) => (
                <span key={item} className="chip bg-white/10 text-white">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <ConversionButton type="contacto_empresa" sourceButton="Solicitar cuenta empresa home" className="btn-primary">
                Solicitar cuenta empresa
              </ConversionButton>
              <Link href="/empresas" className="btn-secondary border-white/20 bg-white/10 text-white hover:border-white/40" data-event="home_business_solutions">
                Soluciones para empresas
              </Link>
            </div>
          </div>
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
            <ConversionButton type="registro_especialista" sourceButton="Quiero inscribir mi oficio propósito" className="btn-sun justify-self-start">
              Quiero inscribir mi oficio
            </ConversionButton>
          </div>
        </div>
        <SectionHeader eyebrow="Confianza antes que precio" title="Los mejores especialistas brillan por evidencia, no por promesas." text="OficiosPro muestra reputación, comentarios reales, trabajos completados y certificaciones para que el precio en créditos no sea la única variable." />
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

      <section className="section-compact" id="especialistas">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="Especialistas disponibles" title="Perfiles que se ganan la confianza con reputación." text="Certificaciones, trabajos completados, tiempo de respuesta y precio desde créditos." />
          <Link href="/especialistas" className="btn-secondary" data-event="browse_specialists_featured">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      </section>

      <section className="section-compact">
        <div className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-soft md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="eyebrow">Referidos OficiosPro</p>
            <h2 className="section-title">Invita clientes o especialistas y gana beneficios.</h2>
            <p className="section-lead">
              Clientes pueden ganar créditos y especialistas pueden sumar reputación o badge Fundador cuando sus referidos se activan.
            </p>
          </div>
          <ConversionButton type="referido" sourceButton="Referidos home" className="btn-primary">
            Invitar referido
          </ConversionButton>
        </div>
      </section>

      <section className="section-compact">
        <div className="grid gap-5 md:grid-cols-3">
          <CTA title="Soy cliente" text="Busca técnicos, compara reputación y reserva con créditos." type="lead_cliente" label="Crear cuenta" />
          <CTA title="Soy empresa" text="Centraliza mantenciones, sucursales, reportes y facturación." type="contacto_empresa" label="Solicitar cuenta" />
          <CTA
            title="Soy especialista"
            text="Crea tu perfil, muestra trabajos y construye reputación real."
            type="registro_especialista"
            label="Postular como especialista"
            secondaryHref="/agenda-especialista"
            secondaryLabel="Ver cómo funcionará mi agenda"
          />
        </div>
      </section>

      <section className="section-compact">
        <SectionHeader eyebrow="Categorías" title="Una red para problemas cotidianos y operación crítica." text="Explora por rubro: cada grupo despliega sus especialidades." />
        <HomeCategoryAccordion />
      </section>

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
    </main>
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

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-10 max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <p className="section-lead">{text}</p>
    </div>
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

function CTA({
  title,
  text,
  type,
  label,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  text: string;
  type: "lead_cliente" | "contacto_empresa" | "registro_especialista";
  label: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <article className="panel card-hover">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-muted">{text}</p>
      <ConversionButton className="btn-primary mt-5 w-full" type={type} sourceButton={label}>
        {label}
      </ConversionButton>
      {secondaryHref && secondaryLabel ? (
        <Link className="btn-secondary mt-3 w-full" href={secondaryHref} data-event="home_specialist_agenda_preview">
          {secondaryLabel}
        </Link>
      ) : null}
    </article>
  );
}
