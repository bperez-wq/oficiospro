import Link from "next/link";
import { categories, companyDashboard, specialists } from "@/data/mock";
import { SpecialistCard } from "@/components/SpecialistCard";

export default function HomePage() {
  const featured = specialists.slice(0, 3);

  return (
    <main>
      <section className="section grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="eyebrow">Técnicos verificados para hogar y empresas</p>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Encuentra técnicos verificados para tu hogar o empresa en minutos.
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-muted">
            Reserva especialistas confiables en gasfitería, electricidad, climatización, jardinería y mantención. Paga con
            créditos, revisa calificaciones y recibe atención rápida desde una sola plataforma.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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
        </div>
        <div className="relative">
          <img src="/assets/hero-hogar.webp" alt="Técnico verificado resolviendo una mantención en un hogar" className="h-[520px] w-full rounded-panel object-cover shadow-soft" />
          <FloatingCard className="left-[-16px] top-10" label="Gasfíter disponible" value="30 créditos" />
          <FloatingCard className="right-[-10px] top-32" label="Calificación" value="4,9/5" />
          <FloatingCard className="bottom-10 left-10" label="Respuesta" value="35 min" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-5 md:grid-cols-5">
        {["4,9/5 satisfacción", "Técnicos verificados", "Respuesta rápida", "Créditos acumulables", "Pago seguro"].map((item) => (
          <article key={item} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <strong>{item.split(" ")[0]}</strong>
            <span className="block text-sm font-bold text-muted">{item.split(" ").slice(1).join(" ")}</span>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="section-title">De buscar un técnico a cerrar el trabajo, en cuatro pasos.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["1", "Busca por especialidad y comuna", "Filtra según ubicación, oficio y disponibilidad."],
            ["2", "Compara confianza y créditos", "Revisa reputación, trabajos completados y tarifa en créditos."],
            ["3", "Reserva y paga con créditos", "El pago queda protegido hasta finalizar el trabajo."],
            ["4", "Evalúa el servicio", "Tu evaluación alimenta la reputación de la red."],
          ].map(([step, title, text]) => (
            <article key={step} className="panel">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-brand text-white">{step}</span>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Especialistas disponibles</p>
            <h2 className="section-title">Técnicos recomendados</h2>
          </div>
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

      <section className="bg-enterprise py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1fr]">
          <div>
            <p className="eyebrow text-teal-200">OficiosPro Empresas</p>
            <h2 className="text-4xl font-black leading-tight md:text-5xl">Centraliza tus mantenciones y paga con créditos corporativos.</h2>
            <p className="mt-4 text-white/70">
              Accede a técnicos verificados para oficinas, restaurantes, bodegas, locales comerciales, plantas productivas y comunidades.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/empresas">
                Ver planes empresa
              </Link>
              <Link className="btn-secondary" href="/dashboard-empresa">
                Dashboard demo
              </Link>
            </div>
          </div>
          <div className="rounded-panel border border-white/10 bg-white/10 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Metric label="Créditos disponibles" value={companyDashboard.creditsAvailable.toString()} />
              <Metric label="Respuesta promedio" value={companyDashboard.responseTime} />
              <Metric label="Usados este mes" value={companyDashboard.creditsUsed.toString()} />
              <Metric label="Sucursales activas" value={companyDashboard.activeBranches.toString()} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow">Categorías</p>
          <h2 className="section-title">Una red para problemas cotidianos y operación crítica.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <article key={category.id} className="panel">
              <h3 className="text-xl font-black">{category.name}</h3>
              <p className="mt-2 text-muted">{category.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function FloatingCard({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={`absolute rounded-2xl bg-white p-4 shadow-soft ${className}`}>
      <span className="block text-sm font-black text-muted">{label}</span>
      <strong className="text-2xl font-black">{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white p-5 text-ink">
      <span className="font-bold text-muted">{label}</span>
      <strong className="mt-2 block text-4xl font-black">{value}</strong>
    </article>
  );
}
