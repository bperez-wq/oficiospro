import Link from "next/link";
import { categories, companyDashboard, companyPlans, companyUseCases, homeBenefits, specialists, testimonials, workStories } from "@/data/mock";
import { LocalSeoPanel, NationalCoveragePanel, SpecialtyCatalogPreview, ValidationAndRankPanel } from "@/components/MarketplaceOverview";
import { SpecialistCard } from "@/components/SpecialistCard";

export default function HomePage() {
  const featured = specialists.filter((specialist) => specialist.top).slice(0, 3);

  return (
    <main>
      <section className="overflow-hidden border-b border-line bg-white">
        <div className="section grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow">Servicios técnicos verificados</p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">
              Encuentra especialistas verificados para tu hogar o empresa en minutos.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-muted">
              Reserva especialistas confiables en gasfitería, electricidad, climatización, jardinería y mantención. Paga con créditos,
              revisa calificaciones y recibe atención rápida desde una sola plataforma.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn-primary" href="/especialistas">
                Ver técnicos disponibles
              </Link>
              <Link className="btn-secondary" href="/club-hogar">
                Conocer Club Hogar
              </Link>
              <Link className="btn-ghost" href="/empresas">
                Soluciones para empresas
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {homeBenefits.slice(0, 3).map((benefit) => (
                <span key={benefit} className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm font-black text-ink">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute inset-0 rounded-[32px] bg-brand-soft" />
            <img
              src="/assets/hero-hogar.webp"
              alt="Especialista verificado resolviendo una mantención en un hogar"
              className="absolute inset-x-6 bottom-0 h-[500px] w-[calc(100%-3rem)] rounded-[28px] object-cover shadow-card"
            />
            <FloatingCard className="left-0 top-8" label="Calificación promedio" value="4,9/5" />
            <FloatingCard className="right-0 top-24" label="Disponible ahora" value="35 min" />
            <FloatingCard className="bottom-16 left-6" label="Precio desde" value="30 créditos" />
            <div className="absolute bottom-8 right-6 w-64 rounded-[24px] border border-line bg-white p-4 shadow-card">
              <p className="text-xs font-black uppercase text-muted">Técnicos cercanos</p>
              <div className="mt-3 flex -space-x-3">
                {specialists.slice(0, 5).map((specialist) => (
                  <span key={specialist.id} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-brand text-xs font-black text-white">
                    {specialist.initials}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-muted">Especialistas con trabajos reales y reputación verificada.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 grid max-w-7xl gap-3 px-5 md:grid-cols-5">
        {[
          ["4,9/5", "satisfacción"],
          ["12", "especialistas mock"],
          ["35 min", "respuesta rápida"],
          ["24 meses", "créditos acumulables"],
          ["Pago seguro", "al finalizar"],
        ].map(([value, label]) => (
          <article key={label} className="stat-tile">
            <strong className="block text-2xl font-black">{value}</strong>
            <span className="text-sm font-bold text-muted">{label}</span>
          </article>
        ))}
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="De buscar un especialista a cerrar el trabajo, sin perseguir presupuestos."
          text="OficiosPro ordena disponibilidad, reputación y créditos para que la decisión sea rápida y confiable."
        />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["1", "Busca por especialidad y comuna", "Filtra según ubicación, oficio y disponibilidad real."],
            ["2", "Compara reputación y créditos", "Revisa calificación, trabajos completados y precio en créditos."],
            ["3", "Reserva con pago protegido", "Los créditos quedan retenidos hasta finalizar el trabajo."],
            ["4", "Evalúa el resultado", "La reputación crece con comentarios y trabajos reales."],
          ].map(([step, title, text]) => (
            <article key={step} className="panel card-hover">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand text-lg font-black text-white">{step}</span>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-compact">
        <div className="rounded-[32px] bg-slate-50 p-5 md:p-8">
          <SectionHeader eyebrow="Trabajos realizados" title="Evidencia visual antes de reservar." text="La confianza mejora cuando puedes ver trabajos, comunas, créditos usados y calificaciones." />
          <div className="grid gap-5 md:grid-cols-4">
            {workStories.map((work) => (
              <article key={work.title} className="overflow-hidden rounded-[24px] border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card">
                <img src={work.image} alt={work.title} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <strong className="text-lg">{work.title}</strong>
                  <span className="mt-1 block text-sm font-bold text-muted">{work.commune}</span>
                  <div className="mt-4 flex items-center justify-between text-sm font-black">
                    <span>{work.credits} créditos</span>
                    <span className="text-gold">{work.rating.toFixed(1)}/5</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="especialistas">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="Especialistas disponibles" title="Perfiles que se ganan la confianza con reputación." text="Foto protagonista, certificaciones, trabajos completados, tiempo de respuesta y precio desde créditos." />
          <Link className="btn-secondary" href="/especialistas">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
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
              {["Créditos hasta 24 meses", "Garantía OficiosPro", "Atención prioritaria", "Historial de servicios"].map((item) => (
                <span key={item} className="chip bg-brand-soft text-brand-dark">
                  {item}
                </span>
              ))}
            </div>
            <Link className="btn-primary mt-7" href="/club-hogar">
              Conocer planes
            </Link>
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
            <Link className="btn-primary mt-7" href="/empresas">
              Ver soluciones empresas
            </Link>
          </div>
          <DashboardPreview />
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3">
          {companyPlans.map((plan) => (
            <article key={plan.name} className={`rounded-[24px] border p-6 ${plan.highlight ? "border-white bg-white text-ink" : "border-white/15 bg-white/10"}`}>
              <h3 className="text-xl font-black">{plan.name}</h3>
              <strong className="my-3 block text-3xl font-black">{plan.price}</strong>
              <p className={plan.highlight ? "text-sm font-semibold leading-6 text-muted" : "text-sm font-semibold leading-6 text-white/70"}>{plan.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
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

      <section className="section-compact">
        <div className="grid gap-5 md:grid-cols-3">
          <CTA title="Soy cliente" text="Busca técnicos, compara reputación y reserva con créditos." href="/registro-cliente" label="Crear cuenta" />
          <CTA title="Soy empresa" text="Centraliza mantenciones, sucursales, reportes y facturación." href="/empresas" label="Solicitar cuenta" />
          <CTA title="Soy especialista" text="Crea tu perfil, muestra trabajos y construye reputación real." href="/registro-especialista" label="Postular" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Categorías" title="Una red para problemas cotidianos y operación crítica." text="La plataforma parte con los servicios de mayor confianza y frecuencia para hogares y empresas." />
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <article key={category.id} className="panel card-hover">
              <h3 className="text-xl font-black">{category.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section grid gap-10">
        <NationalCoveragePanel />
        <SpecialtyCatalogPreview />
        <ValidationAndRankPanel />
        <LocalSeoPanel />
      </section>
    </main>
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

function FloatingCard({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={`absolute rounded-[22px] border border-line bg-white p-4 shadow-card ${className}`}>
      <span className="block text-xs font-black uppercase text-muted">{label}</span>
      <strong className="text-2xl font-black text-ink">{value}</strong>
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

function CTA({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <article className="panel card-hover">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-muted">{text}</p>
      <Link className="btn-primary mt-5 w-full" href={href}>
        {label}
      </Link>
    </article>
  );
}
