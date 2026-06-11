import Link from "next/link";

type CategoryGroup = {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: { label: string; category: string; specialty: string; q?: string }[];
};

function categoryHref(category: string, specialty: string, q?: string) {
  const params = new URLSearchParams({ categoria: category, especialidad: specialty, sourceSection: "home_category_accordion" });
  if (q) params.set("q", q);
  return `/especialistas?${params.toString()}`;
}

const groups: CategoryGroup[] = [
  {
    id: "hogar",
    icon: "🏠",
    title: "Hogar",
    description: "Gasfitería, electricidad, calefont, filtraciones, pintura, jardín y arreglos generales.",
    items: [
      { label: "Gasfitería", category: "hogar", specialty: "gasfiteria" },
      { label: "Electricidad", category: "hogar", specialty: "electricidad" },
      { label: "Jardinería y piscinas", category: "hogar", specialty: "jardineria-piscinas" },
      { label: "Climatización", category: "climatizacion", specialty: "aire-acondicionado-calefaccion" },
      { label: "Remodelaciones y pintura", category: "construccion", specialty: "remodelaciones" },
      { label: "Limpieza y mantención", category: "limpieza", specialty: "limpieza-mantencion" },
      { label: "Seguridad y cámaras", category: "seguridad", specialty: "camaras-alarmas-control-acceso" },
    ],
  },
  {
    id: "comunidades",
    icon: "🏘️",
    title: "Comunidades",
    description: "Edificios y condominios: bombas, portones, calderas, piscinas y mantención preventiva.",
    items: [
      { label: "Edificios y condominios", category: "comunidades", specialty: "edificios-condominios" },
      { label: "Portones y accesos", category: "comunidades", specialty: "edificios-condominios", q: "porton" },
      { label: "Bombas y calderas", category: "comunidades", specialty: "edificios-condominios", q: "bomba" },
      { label: "Piscinas comunes", category: "hogar", specialty: "jardineria-piscinas", q: "piscina" },
    ],
  },
  {
    id: "empresas",
    icon: "🏢",
    title: "Empresas",
    description: "Locales, oficinas, restaurantes, bodegas y sucursales con mantención continua.",
    items: [
      { label: "Mantención comercial", category: "empresas", specialty: "mantencion-comercial" },
      { label: "Climatización y frío comercial", category: "climatizacion", specialty: "aire-acondicionado-calefaccion" },
      { label: "Seguridad y control de acceso", category: "seguridad", specialty: "camaras-alarmas-control-acceso" },
      { label: "Limpieza profesional", category: "limpieza", specialty: "limpieza-mantencion" },
    ],
  },
  {
    id: "industria",
    icon: "🏭",
    title: "Industria",
    description: "Motores, bombas, tableros, soldadura, hidráulica y mantenimiento preventivo de planta.",
    items: [
      { label: "Mantención industrial", category: "industria", specialty: "mantencion-industrial" },
      { label: "Tableros y potencia", category: "industria", specialty: "mantencion-industrial", q: "tablero" },
      { label: "Soldadura y estructuras", category: "industria", specialty: "mantencion-industrial", q: "soldadura" },
    ],
  },
  {
    id: "agro",
    icon: "🌾",
    title: "Agroindustria y campos",
    description: "Packing, frío alimentario, riego tecnificado, maquinaria y labores de temporada.",
    items: [
      { label: "Packing y frío", category: "agroindustria", specialty: "packing-frio" },
      { label: "Riego tecnificado", category: "agricultura", specialty: "riego-tecnificado" },
      { label: "Maquinaria agrícola", category: "agricultura", specialty: "riego-tecnificado", q: "maquinaria" },
    ],
  },
  {
    id: "emergencias",
    icon: "🚨",
    title: "Emergencias",
    description: "Urgencias para hogar, comunidades y empresas, con respuesta rápida.",
    items: [{ label: "Urgencias hogar y empresa", category: "emergencias", specialty: "urgencias-hogar-empresa" }],
  },
];

/**
 * Categorías completas en accordion (nativo <details>: sin JS, indexable para SEO
 * y accesible). Reemplaza las grillas largas de categorías en la Home.
 */
export function HomeCategoryAccordion() {
  return (
    <div className="grid gap-3">
      {groups.map((group, index) => (
        <details
          key={group.id}
          className="group overflow-hidden rounded-[24px] border border-line bg-white shadow-sm transition duration-200 open:border-brand/30 open:shadow-card"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl">
              {group.icon}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-lg font-black text-ink">{group.title}</strong>
              <span className="block truncate text-sm font-bold text-muted">{group.description}</span>
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
          <div className="flex flex-wrap gap-2 border-t border-line bg-slate-50/60 p-5">
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={categoryHref(item.category, item.specialty, item.q)}
                className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
                data-event="home_category_accordion_link"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      ))}
      <Link href="/especialistas?sourceSection=home_category_accordion" className="btn-secondary mt-2 justify-self-center">
        Ver todas las categorías
      </Link>
    </div>
  );
}
