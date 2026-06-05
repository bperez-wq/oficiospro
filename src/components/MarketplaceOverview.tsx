import { chileCommunes, chileRegions } from "@/data/chileCommunes";
import { allSpecialties, marketplaceCategories, nationalCoverageStats, seoSearchExamples, specialistRanks, validationRequirements } from "@/data/marketplace";
import { specialists } from "@/data/mock";

const mapPins = [
  { label: "Santiago", top: "49%", left: "51%" },
  { label: "Curicó", top: "58%", left: "49%" },
  { label: "Concepción", top: "66%", left: "48%" },
  { label: "Puerto Varas", top: "78%", left: "45%" },
  { label: "Antofagasta", top: "22%", left: "56%" },
  { label: "Punta Arenas", top: "93%", left: "39%" },
];

export function NationalCoveragePanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="enterprise-shell p-6">
        <p className="eyebrow text-teal-200">Cobertura nacional</p>
        <h2 className="text-4xl font-black leading-tight">Preparado para operar en las 346 comunas de Chile.</h2>
        <p className="mt-4 font-semibold leading-7 text-white/75">
          La plataforma ya cuenta con regiones, provincias y comunas como dataset local para búsqueda, SEO y futura asignación por cobertura.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <MetricDark label="Regiones" value={nationalCoverageStats.regions.toString()} />
          <MetricDark label="Provincias" value={nationalCoverageStats.provinces.toString()} />
          <MetricDark label="Comunas" value={nationalCoverageStats.communes.toString()} />
          <MetricDark label="Especialidades" value={nationalCoverageStats.specialties.toString()} />
        </div>
      </article>
      <article className="panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Mapa operativo</p>
            <h3 className="text-3xl font-black">Búsqueda por cercanía y radio de cobertura.</h3>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">10.000 especialistas objetivo</span>
        </div>
        <div className="relative mt-6 h-[360px] overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-brand-soft to-white">
          <div className="absolute left-[42%] top-[8%] h-[88%] w-[18%] rounded-[50%] bg-brand/15 blur-sm" />
          {mapPins.map((pin) => (
            <span
              key={pin.label}
              className="absolute rounded-full bg-brand px-3 py-2 text-xs font-black text-white shadow-lg shadow-brand/25"
              style={{ top: pin.top, left: pin.left }}
            >
              {pin.label}
            </span>
          ))}
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-soft">
            <p className="text-sm font-bold text-muted">
              Clientes y especialistas usan latitud/longitud. Cada especialista define radio de cobertura configurable.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export function SpecialtyCatalogPreview() {
  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <p className="eyebrow">Catálogo nacional</p>
        <h2 className="section-title">Más de 100 especialidades agrupadas para crecer por categoría.</h2>
        <p className="section-lead">
          El catálogo está listo para indexación, filtros, márgenes por categoría y rutas locales futuras de la plataforma.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {marketplaceCategories.map((category) => (
          <article key={category.id} className="panel card-hover">
            <span className="chip bg-brand-soft text-brand-dark">{category.specialties.length} especialidades</span>
            <h3 className="mt-4 text-xl font-black">{category.name}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{category.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ValidationAndRankPanel() {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="panel">
        <p className="eyebrow">Validación de especialistas</p>
        <h2 className="text-3xl font-black">Confianza operacional antes de publicar perfiles.</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {validationRequirements.map((item) => (
            <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
              {item}
            </span>
          ))}
        </div>
      </article>
      <article className="panel">
        <p className="eyebrow">Ranking</p>
        <h2 className="text-3xl font-black">De Fundador a Platino.</h2>
        <div className="mt-5 grid gap-3">
          {specialistRanks.map((rank) => (
            <article key={rank.rank} className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{rank.rank}</strong>
                <span className="text-sm font-black text-brand">
                  {rank.minJobs}+ trabajos · {rank.minRating || "nuevo"} rating
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{rank.benefits}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}

export function LocalSeoPanel() {
  return (
    <section className="panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">SEO local</p>
          <h2 className="text-3xl font-black">Búsquedas listas para intención local.</h2>
          <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">
            La estructura separa especialidad, comuna, región y provincia para crear landings locales cuando activemos generación programática.
          </p>
        </div>
        <span className="chip bg-brand-soft text-brand-dark">{allSpecialties.length * chileCommunes.length} combinaciones potenciales</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {seoSearchExamples.map((item) => (
          <article key={item.query} className="rounded-2xl border border-line bg-slate-50 p-4">
            <span className="text-xs font-black uppercase text-brand">{item.query}</span>
            <h3 className="mt-3 font-black">{item.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminMarketplaceControls() {
  const regionsPreview = chileRegions.slice(0, 6);

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <article className="panel">
        <p className="eyebrow">Administración nacional</p>
        <h2 className="text-3xl font-black">Gestión preparada para escala.</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Gestión de comunas",
            "Gestión de categorías",
            "Gestión de especialistas",
            "Validación de referencias",
            "Gestión de créditos",
            "Configuración de márgenes",
            "Mapas y métricas",
            "Cobertura por radio",
          ].map((item) => (
            <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
              {item}
            </span>
          ))}
        </div>
      </article>
      <article className="panel">
        <p className="eyebrow">Regiones activas</p>
        <h2 className="text-3xl font-black">Dataset territorial</h2>
        <div className="mt-5 grid gap-2">
          {regionsPreview.map((region) => (
            <span key={region.id} className="rounded-2xl border border-line bg-slate-50 p-3 text-sm font-black">
              {region.name}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-muted">
          Muestra parcial. Total: {nationalCoverageStats.regions} regiones, {nationalCoverageStats.provinces} provincias y {nationalCoverageStats.communes} comunas.
        </p>
      </article>
    </section>
  );
}

export function SpecialistScaleMetrics() {
  const verified = specialists.filter((specialist) => specialist.validation?.rut === "approved").length;
  const top = specialists.filter((specialist) => specialist.rank === "Oro" || specialist.rank === "Platino").length;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Metric label="Especialistas" value={specialists.length.toString()} />
      <Metric label="Validados" value={verified.toString()} />
      <Metric label="Oro o Platino" value={top.toString()} />
      <Metric label="Meta nacional" value={nationalCoverageStats.targetSpecialists.toLocaleString("es-CL")} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="stat-tile">
      <span className="text-sm font-bold text-muted">{label}</span>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}

function MetricDark({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white/10 p-4">
      <span className="text-xs font-black uppercase text-white/70">{label}</span>
      <strong className="mt-1 block text-3xl font-black">{value}</strong>
    </article>
  );
}
