import type { ReactNode } from "react";
import { MarketplaceCard } from "@/components/DesignSystem";

type Value = {
  icon: ReactNode;
  tone: string;
  title: string;
  text: string;
};

const values: Value[] = [
  {
    tone: "bg-brand-soft text-brand-dark",
    title: "Sin costo inicial",
    text: "Crear tu perfil fundador y postular es gratis. No cobramos por inscribirte en esta etapa piloto.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.2c0 1.6-2 1.8-2 3" strokeLinecap="round" />
        <path d="M12 17h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tone: "bg-sun-soft text-sun-dark",
    title: "Perfil por comuna",
    text: "Ordenamos tu oficio, zona y servicios para que aparezcas donde podamos revisar cobertura real.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    tone: "bg-emerald-50 text-emerald-700",
    title: "Múltiples servicios",
    text: "Un solo perfil para todos tus servicios y especialidades, con tu reputación reunida en un mismo lugar.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="15" width="7" height="5" rx="1.5" />
        <rect x="14" y="15" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    tone: "bg-brand-soft text-brand-dark",
    title: "Formalización asistida",
    text: "Te guiamos con datos tributarios y documentos de cobro antes de activar pagos o publicaciones.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    tone: "bg-emerald-50 text-emerald-700",
    title: "Solicitudes con seguimiento",
    text: "Cada solicitud queda registrada para que operaciones pueda revisar origen, comuna y próximo paso.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2Z" />
      </svg>
    ),
  },
  {
    tone: "bg-sun-soft text-sun-dark",
    title: "Categorías en formación",
    text: "Aunque tu rubro recién esté abriendo cobertura, puedes postular y el equipo revisa demanda por comuna.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function FounderValueCards() {
  return (
    <section className="grid gap-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Por que ahora</p>
        <h2 className="section-title">Una oportunidad temprana para profesionalizar tu oficio</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-muted">Sin costo inicial, con revision humana y sin prometer ingresos garantizados.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {values.map((value) => (
          <MarketplaceCard key={value.title} className="p-7">
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${value.tone}`}>{value.icon}</span>
            <h3 className="mt-5 text-xl font-black text-ink">{value.title}</h3>
            <p className="mt-2 text-base font-semibold leading-7 text-muted">{value.text}</p>
          </MarketplaceCard>
        ))}
      </div>
      <div className="rounded-[24px] border border-line bg-slate-50 p-5">
        <p className="text-sm font-black text-ink">Oficios que ya estamos sumando</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {exampleTrades.map((trade) => (
            <span key={trade} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink">
              {trade}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-muted">
          ¿No ves el tuyo? Igual puedes postular: las categorías nuevas se abren según demanda por comuna.
        </p>
      </div>
    </section>
  );
}

const exampleTrades = [
  "Gasfitería",
  "Electricidad",
  "Construcción",
  "Terminaciones",
  "Carpintería",
  "Metalmecánica",
  "Riego",
  "Piscinas",
  "Climatización",
  "Mantención industrial",
];
