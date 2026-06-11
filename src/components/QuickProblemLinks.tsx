import Link from "next/link";

type QuickProblem = {
  label: string;
  image: string;
  href: string;
};

function searchHref(params: Record<string, string>) {
  return `/especialistas?${new URLSearchParams({ ...params, sourceSection: "home_quick_problems" }).toString()}`;
}

const oficios = "/assets/oficios";

const quickProblems: QuickProblem[] = [
  { label: "Filtración", image: `${oficios}/gasfiteria/gasfiteria-trabajo-01.jpg`, href: searchHref({ categoria: "hogar", especialidad: "gasfiteria", q: "filtracion" }) },
  { label: "Calefont", image: `${oficios}/calefont/calefont-revision-01.jpg`, href: searchHref({ categoria: "hogar", especialidad: "gasfiteria", q: "calefont" }) },
  { label: "Electricidad", image: `${oficios}/electricidad/electricidad-luminaria-01.jpg`, href: searchHref({ categoria: "hogar", especialidad: "electricidad" }) },
  { label: "Aire acondicionado", image: `${oficios}/climatizacion/aire-acondicionado-mantencion-01.jpg`, href: searchHref({ categoria: "climatizacion", especialidad: "aire-acondicionado-calefaccion" }) },
  { label: "Jardín", image: `${oficios}/jardineria/jardineria-pasto-01.jpg`, href: searchHref({ categoria: "hogar", especialidad: "jardineria-piscinas" }) },
  { label: "Portón", image: `${oficios}/cerrajeria/cerrajeria-puerta-01.jpg`, href: searchHref({ categoria: "comunidades", especialidad: "edificios-condominios", q: "porton" }) },
  { label: "Cámaras", image: `${oficios}/electricidad/electricidad-medidor-01.jpg`, href: searchHref({ categoria: "seguridad", especialidad: "camaras-alarmas-control-acceso" }) },
  { label: "Pintura", image: `${oficios}/pintura/pintura-cielo-01.jpg`, href: searchHref({ categoria: "construccion", especialidad: "remodelaciones", q: "pintura" }) },
  { label: "Piscina", image: `${oficios}/piscinas/piscina-mantencion-01.jpg`, href: searchHref({ categoria: "hogar", especialidad: "jardineria-piscinas", q: "piscina" }) },
  { label: "Riego", image: `${oficios}/agro/agro-campo-01.jpg`, href: searchHref({ categoria: "agricultura", especialidad: "riego-tecnificado" }) },
  { label: "Emergencia", image: `${oficios}/cerrajeria/cerrajeria-cerradura-01.jpg`, href: searchHref({ categoria: "emergencias", especialidad: "urgencias-hogar-empresa" }) },
  { label: "Mantención empresa", image: `${oficios}/industria/industria-mantencion-01.jpg`, href: searchHref({ categoria: "empresas", especialidad: "mantencion-comercial" }) },
];

/** Accesos rápidos por problema: chips con foto real del oficio → /especialistas filtrado. */
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
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white py-1 pl-1.5 pr-4 text-sm font-black text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand-dark active:scale-[0.98]"
            data-event="home_quick_problem"
          >
            <img
              src={problem.image}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-line transition duration-200 group-hover:ring-brand/40"
            />
            {problem.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
