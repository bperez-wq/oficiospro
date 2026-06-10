"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const items = [
  { href: "/dashboard-cliente", label: "Cliente" },
  { href: "/especialistas", label: "Especialistas" },
  { href: "/club-hogar", label: "Club Hogar" },
  { href: "/empresas", label: "Empresas" },
  { href: "/impacto", label: "Impacto" },
  { href: "/dashboard-empresa", label: "Dashboard Empresa" },
  { href: "/dashboard-especialista", label: "Especialista" },
  { href: "/agenda-especialista", label: "Agenda especialista" },
  { href: "/admin", label: "Admin" },
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto rounded-3xl border border-line bg-white/90 p-2 shadow-soft">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "whitespace-nowrap rounded-2xl bg-brand px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-brand-dark" : "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-black text-muted transition hover:bg-brand-soft hover:text-brand-dark"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
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
    <section className="surface-grid overflow-hidden rounded-[28px] border border-line bg-white p-7 shadow-soft md:p-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-muted">{subtitle}</p>
        </div>
        {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
