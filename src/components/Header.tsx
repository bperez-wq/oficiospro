"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ConversionButton } from "@/components/ConversionModal";
import { clearMockSession, getMockSession, type MockSession } from "@/lib/storage";

const navItems = [
  { href: "/especialistas", label: "Especialistas" },
  { href: "/club-hogar", label: "Club Hogar" },
  { href: "/empresas", label: "Empresas" },
];

const adminQuickLinks = [
  { href: "/admin", label: "Admin" },
  { href: "/admin#especialistas-pendientes", label: "Especialistas pendientes" },
  { href: "/admin#leads", label: "Leads" },
  { href: "/admin#configuracion-comercial", label: "Configuración comercial" },
  { href: "/", label: "Ver sitio público" },
];

export function Header() {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    setSession(getMockSession());

    function refreshSession() {
      setSession(getMockSession());
    }

    window.addEventListener("storage", refreshSession);
    window.addEventListener("focus", refreshSession);
    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("focus", refreshSession);
    };
  }, []);

  const isAdmin = session?.role === "admin";

  function logout() {
    clearMockSession();
    setSession(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      {isAdmin ? (
        <div className="border-b border-teal-900/20 bg-ink text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black uppercase text-teal-950">Administrador</span>
              <span className="text-sm font-bold text-white/85">{session.email ?? "admin@oficiospro.cl"}</span>
              <Link href="/admin" className="rounded-full bg-white px-4 py-2 text-xs font-black text-ink transition hover:bg-teal-100">
                Panel admin
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {adminQuickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white/80 transition hover:bg-white hover:text-ink">
                  {item.label}
                </Link>
              ))}
              <button className="rounded-full border border-white/25 px-3 py-2 text-xs font-black text-white transition hover:bg-white hover:text-ink" type="button" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center font-black" aria-label="Ir al inicio de OficiosPro">
          <BrandLogo variant="primary" size="md" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-black text-muted lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </Link>
          ))}
          <ConversionButton type="registro_especialista" sourceButton="Trabaja con nosotros" className="transition hover:text-brand">
            Trabaja con nosotros
          </ConversionButton>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin ? (
            <Link href="/admin" className="rounded-2xl px-4 py-3 text-sm font-black text-brand transition hover:bg-brand-soft">
              Panel admin
            </Link>
          ) : (
            <Link href="/login" className="rounded-2xl px-4 py-3 text-sm font-black text-muted transition hover:bg-slate-100 hover:text-brand">
              Ingresar
            </Link>
          )}
          <ConversionButton type="busqueda_rapida" sourceButton="Ver técnicos" className="btn-primary">
            Ver técnicos
          </ConversionButton>
        </div>

        <ConversionButton type="busqueda_rapida" sourceButton="Ver técnicos mobile" className="btn-primary px-4 md:hidden">
          Técnicos
        </ConversionButton>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-line/70 bg-white px-5 py-3 text-sm font-black text-muted lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full bg-slate-50 px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark">
            {item.label}
          </Link>
        ))}
        {isAdmin ? (
          <Link href="/admin" className="whitespace-nowrap rounded-full bg-brand-soft px-4 py-2 text-brand-dark transition hover:bg-brand hover:text-white">
            Panel admin
          </Link>
        ) : (
          <ConversionButton type="registro_especialista" sourceButton="Trabaja con nosotros mobile" className="whitespace-nowrap rounded-full bg-slate-50 px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark">
            Trabaja con nosotros
          </ConversionButton>
        )}
      </nav>
    </header>
  );
}
