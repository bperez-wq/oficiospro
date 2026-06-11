import Link from "next/link";

type QuickProblem = {
  label: string;
  icon: string;
  href: string;
};

function searchHref(params: Record<string, string>) {
  return `/especialistas?${new URLSearchParams({ ...params, sourceSection: "home_quick_problems" }).toString()}`;
}

const quickProblems: QuickProblem[] = [
  { label: "Filtración", icon: "💧", href: searchHref({ categoria: "hogar", especialidad: "gasfiteria", q: "filtracion" }) },
  { label: "Calefont", icon: "🔥", href: searchHref({ categoria: "hogar", especialidad: "gasfiteria", q: "calefont" }) },
  { label: "Electricidad", icon: "⚡", href: searchHref({ categoria: "hogar", especialidad: "electricidad" }) },
  { label: "Aire acondicionado", icon: "❄️", href: searchHref({ categoria: "climatizacion", especialidad: "aire-acondicionado-calefaccion" }) },
  { label: "Jardín", icon: "🌿", href: searchHref({ categoria: "hogar", especialidad: "jardineria-piscinas" }) },
  { label: "Portón", icon: "🚪", href: searchHref({ categoria: "comunidades", especialidad: "edificios-condominios", q: "porton" }) },
  { label: "Cámaras", icon: "📷", href: searchHref({ categoria: "seguridad", especialidad: "camaras-alarmas-control-acceso" }) },
  { label: "Pintura", icon: "🖌️", href: searchHref({ categoria: "construccion", especialidad: "remodelaciones", q: "pintura" }) },
  { label: "Piscina", icon: "🏊", href: searchHref({ categoria: "hogar", especialidad: "jardineria-piscinas", q: "piscina" }) },
  { label: "Riego", icon: "🚿", href: searchHref({ categoria: "agricultura", especialidad: "riego-tecnificado" }) },
  { label: "Emergencia", icon: "🚨", href: searchHref({ categoria: "emergencias", especialidad: "urgencias-hogar-empresa" }) },
  { label: "Mantención empresa", icon: "🏢", href: searchHref({ categoria: "empresas", especialidad: "mantencion-comercial" }) },
];

/** Accesos rápidos por problema: chips compactos que llevan a /especialistas filtrado. */
export function QuickProblemLinks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:py-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-black text-ink md:text-2xl">¿Qué necesitas resolver?</h2>
        <Link href="/especialistas?sourceSection=home_quick_problems" className="shrink-0 text-sm font-black text-brand-dark transition hover:text-brand">
          Ver todo →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickProblems.map((problem) => (
          <Link
            key={problem.label}
            href={problem.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand-dark active:scale-[0.98]"
            data-event="home_quick_problem"
          >
            <span aria-hidden className="text-base">{problem.icon}</span>
            {problem.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
