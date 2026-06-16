import { DashboardMetricCard } from "@/components/DesignSystem";

const metrics = [
  { label: "Revision operativa", value: "48 h", detail: "SLA objetivo del piloto" },
  { label: "Postulacion inicial", value: "3 pasos", detail: "Guiada y sin friccion" },
  { label: "Costo de entrada", value: "$0", detail: "Para fundadores del piloto" },
];

const profiles = [
  { img: "gasfiter-mujer-01.jpg", name: "Valentina R.", trade: "Gasfiteria", zone: "Maipu", tags: ["Urgencias", "Certificada"] },
  { img: "electricista-mujer-01.jpg", name: "Carla L.", trade: "Electricidad", zone: "Nunoa", tags: ["SEC", "Domicilio"] },
  { img: "climatizacion-mujer-01.jpg", name: "Daniela P.", trade: "Climatizacion", zone: "La Florida", tags: ["Aire", "Mantencion"] },
  { img: "carlos-navarro.jpg", name: "Carlos N.", trade: "Electricidad", zone: "La Cisterna", tags: ["Tableros", "Domicilio"] },
];

export function FounderSocialProof() {
  return (
    <section className="grid gap-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Confianza visible</p>
        <h2 className="section-title">El estandar fundador, en numeros</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone="brand" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((profile) => (
          <article key={profile.name} className="overflow-hidden rounded-card border border-line bg-white shadow-soft card-hover">
            <div className="relative">
              <img
                src={`/assets/oficios/perfiles/${profile.img}`}
                alt={`Especialista de ${profile.trade}`}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verificado
              </span>
            </div>
            <div className="p-4">
              <p className="text-base font-black text-ink">{profile.name}</p>
              <p className="text-sm font-bold text-muted">{profile.trade}</p>
              <p className="mt-2 text-xs font-black text-slate-600">
                <span className="text-sun-dark">★</span> Perfil fundador · {profile.zone}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="text-xs font-bold text-muted">
        Perfiles del set del proyecto. Se reemplazan por fundadores reales al publicar.
      </p>
    </section>
  );
}
