import Link from "next/link";
import type { ReactNode } from "react";

const items = [
  { href: "/dashboard-cliente", label: "Cliente" },
  { href: "/especialistas", label: "Técnicos" },
  { href: "/club-hogar", label: "Club Hogar" },
  { href: "/empresas", label: "Empresas" },
  { href: "/dashboard-empresa", label: "Dashboard Empresa" },
  { href: "/dashboard-especialista", label: "Especialista" },
  { href: "/admin", label: "Admin" },
];

export function PlatformNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white/80 p-2 shadow-soft">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-black text-muted transition hover:bg-brand-soft hover:text-brand-dark"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <section className="grid gap-6 rounded-panel border border-line bg-white/90 p-7 shadow-soft lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">{subtitle}</p>
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </section>
  );
}
