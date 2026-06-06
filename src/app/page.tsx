import { ConversionButton } from "@/components/ConversionModal";
import { HeroSearchPanel } from "@/components/HeroSearchPanel";
import { companyDashboard, companyUseCases, homeBenefits, specialists, testimonials, workStories } from "@/data/mock";
import { LocalSeoPanel, NationalCoveragePanel, SpecialtyCatalogPreview, ValidationAndRankPanel } from "@/components/MarketplaceOverview";
import { PlanActionCard } from "@/components/PlanActionCard";
import { SpecialistCard } from "@/components/SpecialistCard";
import { serviceTypes, subscriptionPlans } from "@/data/marketplace";

export default function HomePage() {
  const featured = specialists.filter((specialist) => specialist.top).slice(0, 3);
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  return (
    <main>
      <section className="overflow-hidden border-b border-line bg-white">
        <div className="section grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow">Empoderamos el oficio. Empoderamos al trabajador.</p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">
              Encuentra especialistas verificados para tu hogar, empresa o campo en minutos.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-muted">
              Reserva especialistas confiables en gasfitería, electricidad, climatización, jardinería, mantención, agricultura e industria. Paga con créditos,
              revisa reputación real y recibe atención rápida desde una sola plataforma.
            </p>
            <HeroSearchPanel />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ConversionButton type="busqueda_rapida" sourceButton="Ver técnicos disponibles" className="btn-primary">
                Ver técnicos disponibles
              </ConversionButton>
              <ConversionButton type="lead_cliente" sourceButton="Conocer Club Hogar" className="btn-secondary">
                Conocer Club Hogar
              </ConversionButton>
              <ConversionButton type="contacto_empresa" sourceButton="Soluciones para empresas" className="btn-ghost">
                Soluciones para empresas
              </ConversionButton>
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
            <FloatingCard className="right-6 bottom-40" label="Especialista a" value="3,8 km" />
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
          [specialists.length.toString(), "especialistas verificados"],
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
        <div className="mb-12 grid gap-6 rounded-[32px] border border-brand/15 bg-brand-soft p-6 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="eyebrow">Propósito OficiosPro</p>
            <h2 className="section-title">Empoderamos el oficio. Empoderamos al trabajador.</h2>
          </div>
          <div className="grid gap-4">
            <p className="text-lg font-semibold leading-8 text-ink">
              OficiosPro ayuda a que los especialistas confiables sean encontrados, evaluados y recomendados. Cada trabajo bien hecho construye reputación,
              visibilidad y mejores oportunidades.
            </p>
            <div className="flex flex-wrap gap-2">
              {["El lugar donde los buenos trabajadores brillan", "Reputación con cada trabajo", "Oficios profesionales y visibles"].map((item) => (
                <span key={item} className="chip bg-white text-brand-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
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

      <section className="section">
        <SectionHeader
          eyebrow="Cobertura especializada"
          title="OficiosPro también para agricultura, campos e industria."
          text="Además del hogar, la red está preparada para contratistas agrícolas, riego, maquinaria, packing, frío alimentario, comunidades y mantención industrial."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Contratistas agrícolas", "Cuadrillas de poda, cosecha, raleo, amarra, desbrote y packing temporal."],
            ["Riego agrícola", "Riego tecnificado, bombas, fertirriego, telemetría, filtros y tableros de riego."],
            ["Maquinaria agrícola", "Mecánicos, operadores, calibración, GPS agrícola e implementos."],
            ["Packing y frío", "Líneas de fruta, cámaras frigoríficas, túneles de frío y frío alimentario."],
            ["Mantención industrial", "PLC, soldadura, hidráulica, neumática, bombas, motores y predictivo."],
            ["Comunidades y empresas", "Salas de bombas, portones, cámaras, calderas, piscinas y espacios comunes."],
          ].map(([title, text]) => (
            <article key={title} className="panel card-hover">
              <span className="chip bg-brand-soft text-brand-dark">Disponible por comuna</span>
              <h3 className="mt-4 text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="especialistas">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow="Especialistas disponibles" title="Perfiles que se ganan la confianza con reputación." text="Foto protagonista, certificaciones, trabajos completados, tiempo de respuesta y precio desde créditos." />
          <ConversionButton type="consulta_general" sourceButton="Ver todos especialistas" className="btn-secondary">
            Ver todos
          </ConversionButton>
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
            <ConversionButton type="contacto_empresa" sourceButton="Ver soluciones empresas" className="btn-primary mt-7">
              Ver soluciones empresas
            </ConversionButton>
          </div>
          <DashboardPreview />
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3">
          {enterprisePlans.map((plan) => (
            <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "empresa"} />
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
          <CTA title="Soy especialista" text="Crea tu perfil, muestra trabajos y construye reputación real." type="registro_especialista" label="Postular" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Categorías" title="Una red para problemas cotidianos y operación crítica." text="La plataforma parte con los servicios de mayor confianza y frecuencia para hogares y empresas." />
        <div className="grid gap-4 md:grid-cols-4">
          {serviceTypes.map((category) => (
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

function CTA({ title, text, type, label }: { title: string; text: string; type: "lead_cliente" | "contacto_empresa" | "registro_especialista"; label: string }) {
  return (
    <article className="panel card-hover">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-muted">{text}</p>
      <ConversionButton className="btn-primary mt-5 w-full" type={type} sourceButton={label}>
        {label}
      </ConversionButton>
    </article>
  );
}
