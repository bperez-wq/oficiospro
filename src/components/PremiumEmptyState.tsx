import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Estado vacío / 404 premium reutilizable: icono, título fuerte, texto corto
 * y CTAs accionables. Consistente con los empty states de Bolsa y /especialistas.
 */
export function PremiumEmptyState({
  icon = "🧭",
  eyebrow,
  title,
  text,
  actions,
}: {
  icon?: string;
  eyebrow?: string;
  title: string;
  text: string;
  actions: { label: string; href: string; primary?: boolean; dataEvent?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-line bg-white p-8 text-center shadow-soft md:p-12">
      <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative grid justify-items-center gap-4">
        <span aria-hidden className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-3xl">{icon}</span>
        {eyebrow ? <p className="eyebrow mb-0">{eyebrow}</p> : null}
        <h1 className="max-w-xl text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h1>
        <p className="max-w-md text-sm font-bold leading-6 text-muted md:text-base">{text}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} className={action.primary ? "btn-primary" : "btn-secondary"} data-event={action.dataEvent}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
