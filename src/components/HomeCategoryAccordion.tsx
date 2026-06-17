import Link from "next/link";
import { getClientMenuGroups } from "@/data/tradeTaxonomy";

type CategoryGroup = {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: { label: string; href: string }[];
};

const iconByTitle: Record<string, string> = {
  Hogar: "OP",
  "Construccion y terminaciones": "CT",
  Comunidades: "CO",
  Empresas: "EM",
  "Industria y campo": "IC",
};

const descriptionByTitle: Record<string, string> = {
  Hogar: "Gasfiteria, electricidad, climatizacion, exterior y arreglos frecuentes con cobertura inicial.",
  "Construccion y terminaciones": "Terminaciones, pintura, remodelaciones y trabajos de obra que ya podemos captar responsablemente.",
  Comunidades: "Edificios y condominios: portones, bombas, accesos, electricidad comun y mantencion preventiva.",
  Empresas: "Locales, oficinas, restaurantes, bodegas y sucursales con mantencion continua o piloto.",
  "Industria y campo": "Industria, agroindustria, riego y mantencion operativa con red en formacion controlada.",
};

const groups: CategoryGroup[] = getClientMenuGroups().map((group) => ({
  id: group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  icon: iconByTitle[group.title] ?? "OP",
  title: group.title,
  description: descriptionByTitle[group.title] ?? "Categorias de oficios con cobertura activa, piloto o captacion controlada.",
  items: group.items.map((item) => ({
    label: item.label,
    href: item.href.includes("?") ? `${item.href}&sourceSection=home_category_accordion` : `${item.href}?sourceSection=home_category_accordion`,
  })),
}));

/**
 * Categorias completas en accordion (nativo <details>: sin JS, indexable para SEO
 * y accesible). Reemplaza las grillas largas de categorias en la Home.
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
            <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-sm font-black text-brand-dark">
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
                key={item.href}
                href={item.href}
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
        Ver todas las categorias
      </Link>
    </div>
  );
}
