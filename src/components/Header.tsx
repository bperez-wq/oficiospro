"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CartButton, CartDrawer } from "@/components/CartDrawer";
import { ConversionButton } from "@/components/ConversionModal";
import { LoginEntryModal } from "@/components/LoginEntryModal";
import { clearMockSession, getMockSession, type MockSession } from "@/lib/storage";

const quickSuggestions = ["Calefont", "Filtracion", "Electricista SEC", "Camaras", "Riego", "Piscina", "Porton"];

const categoryGroups = [
  {
    title: "Hogar",
    href: "/especialistas?categoria=hogar",
    items: [
      ["Gasfiteria", "/especialistas?categoria=hogar&especialidad=gasfiteria"],
      ["Electricidad", "/especialistas?categoria=hogar&especialidad=electricidad"],
      ["Calefont", "/especialistas?categoria=hogar&q=calefont"],
      ["Filtraciones", "/especialistas?categoria=hogar&q=filtracion"],
      ["Cerrajeria", "/especialistas?categoria=hogar&q=cerrajero"],
      ["Pintura", "/especialistas?categoria=hogar&q=pintura"],
      ["Jardineria", "/especialistas?categoria=hogar&q=jardineria"],
      ["Piscinas", "/especialistas?categoria=hogar&q=piscina"],
      ["Reparaciones menores", "/especialistas?categoria=hogar&q=reparaciones"],
    ],
  },
  {
    title: "Comunidades y edificios",
    href: "/especialistas?categoria=comunidades",
    items: [
      ["Salas de bombas", "/especialistas?categoria=comunidades&q=bombas"],
      ["Portones", "/especialistas?categoria=comunidades&q=portones"],
      ["Camaras", "/especialistas?categoria=comunidades&q=camaras"],
      ["Calderas", "/especialistas?categoria=comunidades&q=calderas"],
      ["Piscinas", "/especialistas?categoria=comunidades&q=piscinas"],
      ["Electricidad comun", "/especialistas?categoria=comunidades&q=electricidad"],
      ["Mantencion preventiva", "/especialistas?categoria=comunidades&q=mantencion"],
    ],
  },
  {
    title: "Empresas e industria",
    href: "/especialistas?categoria=empresas",
    items: [
      ["Mantencion comercial", "/especialistas?categoria=empresas&especialidad=mantencion-comercial"],
      ["Refrigeracion comercial", "/especialistas?categoria=empresas&q=refrigeracion"],
      ["Seguridad electronica", "/especialistas?categoria=empresas&q=seguridad"],
      ["Limpieza", "/especialistas?categoria=empresas&q=limpieza"],
      ["Mantencion industrial", "/especialistas?categoria=industria&especialidad=mantencion-industrial"],
      ["Soldadura", "/especialistas?categoria=industria&q=soldadura"],
      ["Bombas y motores", "/especialistas?categoria=industria&q=bombas"],
      ["Tableros / PLC", "/especialistas?categoria=industria&q=plc"],
    ],
  },
  {
    title: "Agroindustria y campos",
    href: "/especialistas?categoria=agricultura",
    items: [
      ["Riego tecnificado", "/especialistas?categoria=agricultura&especialidad=riego-tecnificado"],
      ["Maquinaria agricola", "/especialistas?categoria=agricultura&especialidad=maquinaria-agricola"],
      ["Packing y frio", "/especialistas?categoria=agroindustria&especialidad=packing-frio"],
      ["Bombas de riego", "/especialistas?categoria=agricultura&q=bombas%20de%20riego"],
      ["Contratistas agricolas", "/especialistas?categoria=agricultura&q=contratistas"],
      ["Poda y cosecha", "/especialistas?categoria=agricultura&q=poda%20cosecha"],
      ["Lineas de proceso", "/especialistas?categoria=agroindustria&q=lineas%20de%20proceso"],
    ],
  },
  {
    title: "Emergencias",
    href: "/especialistas?categoria=emergencias",
    items: [
      ["Fuga de agua", "/especialistas?categoria=emergencias&q=fuga%20de%20agua"],
      ["Corte electrico", "/especialistas?categoria=emergencias&q=corte%20electrico"],
      ["Calefont detenido", "/especialistas?categoria=emergencias&q=calefont%20detenido"],
      ["Cerrajero", "/especialistas?categoria=emergencias&q=cerrajero"],
      ["Porton detenido", "/especialistas?categoria=emergencias&q=porton%20detenido"],
      ["Destape urgente", "/especialistas?categoria=emergencias&q=destape"],
      ["Refrigeracion critica", "/especialistas?categoria=emergencias&q=refrigeracion%20critica"],
    ],
  },
] as const;

const adminQuickLinks = [
  { href: "/admin", label: "Panel admin" },
  { href: "/admin#especialistas-pendientes", label: "Especialistas" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin#configuracion-comercial", label: "Creditos" },
  { href: "/admin#seguridad", label: "Seguridad" },
];

const roleMenu: Record<MockSession["role"], Array<{ href?: string; label: string; cart?: boolean }>> = {
  client: [
    { href: "/dashboard-cliente", label: "Mi dashboard" },
    { href: "/checkout", label: "Mis creditos" },
    { href: "/dashboard-cliente", label: "Mis solicitudes" },
    { label: "Mi carrito", cart: true },
    { href: "/registro-cliente", label: "Mi perfil" },
  ],
  specialist: [
    { href: "/dashboard-especialista", label: "Dashboard especialista" },
    { href: "/registro-especialista", label: "Mis servicios" },
    { href: "/agenda-especialista", label: "Mi agenda" },
    { href: "/dashboard-especialista", label: "Mis solicitudes" },
    { href: "/especialistas", label: "Mi perfil publico" },
  ],
  company: [
    { href: "/dashboard-empresa", label: "Dashboard empresa" },
    { href: "/checkout?plan=empresa", label: "Creditos empresa" },
    { href: "/dashboard-empresa", label: "Solicitudes" },
    { href: "/empresas", label: "Usuarios/sucursales" },
  ],
  admin: [
    { href: "/admin", label: "Panel admin" },
    { href: "/admin#especialistas-pendientes", label: "Especialistas" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin#configuracion-comercial", label: "Creditos" },
    { href: "/admin#seguridad", label: "Seguridad" },
  ],
};

export function Header() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();

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
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  function closeMenus() {
    setCategoryOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      {isAdmin ? (
        <div className="border-b border-teal-900/20 bg-ink text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black uppercase text-teal-950">Administrador</span>
              <span className="text-sm font-bold text-white/85">{session.email ?? "admin@oficiospro.cl"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {adminQuickLinks.map((item) => (
                <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href.split("#")[0]) ? "page" : undefined} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white/80 transition hover:bg-white hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 md:px-5">
        <Link href="/" className="flex shrink-0 items-center font-black" aria-label="Ir al inicio de OficiosPro" onClick={closeMenus}>
          <BrandLogo variant="primary" size="md" />
        </Link>

        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <HeaderSearch />
          <nav className="flex shrink-0 items-center gap-1 text-sm font-black text-muted">
            <NavLink href="/especialistas" label="Especialistas" pathname={pathname} />
            <div className="relative" onMouseEnter={() => setCategoryOpen(true)} onMouseLeave={() => setCategoryOpen(false)}>
              <button
                className={categoryOpen ? "rounded-full bg-brand px-4 py-2 text-white shadow-sm" : "rounded-full px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark"}
                type="button"
                aria-expanded={categoryOpen}
                onClick={() => setCategoryOpen((current) => !current)}
              >
                Categorias
              </button>
              <MegaCategoryMenu open={categoryOpen} onClose={() => setCategoryOpen(false)} />
            </div>
            <NavLink href="/club-hogar" label="Club Hogar" pathname={pathname} />
            <NavLink href="/empresas" label="Empresas" pathname={pathname} />
            <ConversionButton type="registro_especialista" sourceButton="Trabaja con nosotros header" className="rounded-full px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark">
              Trabaja con nosotros
            </ConversionButton>
            <NavLink href="/soporte" label="Soporte" pathname={pathname} />
          </nav>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-2xl border border-line bg-white px-3 py-2 text-sm font-black text-muted shadow-sm transition hover:border-brand hover:text-brand lg:hidden" type="button" onClick={() => setMobileSearchOpen((current) => !current)}>
            Buscar
          </button>
          <CartButton onOpen={() => setCartOpen(true)} />
          <div className="hidden md:block">
            {session ? (
              <UserAccountMenu
                session={session}
                open={userMenuOpen}
                pathname={pathname}
                onToggle={() => setUserMenuOpen((current) => !current)}
                onOpenCart={() => setCartOpen(true)}
                onLogout={logout}
              />
            ) : (
              <button className="rounded-2xl px-4 py-3 text-sm font-black text-muted transition hover:bg-slate-100 hover:text-brand" type="button" onClick={() => setLoginOpen(true)}>
                Iniciar sesion
              </button>
            )}
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white text-lg font-black text-ink shadow-sm transition hover:border-brand hover:bg-brand-soft lg:hidden" type="button" onClick={() => setMobileOpen((current) => !current)} aria-label="Abrir menu">
            =
          </button>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-line bg-white px-4 py-3 lg:hidden">
          <HeaderSearch compact onSubmit={() => setMobileSearchOpen(false)} />
        </div>
      ) : null}

      {mobileOpen ? (
        <MobileMenu
          session={session}
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
          onLogin={() => setLoginOpen(true)}
          onOpenCart={() => setCartOpen(true)}
          onLogout={logout}
        />
      ) : null}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginEntryModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={(nextSession) => {
          setSession(nextSession);
          setLoginOpen(false);
        }}
      />
    </header>
  );
}

function HeaderSearch({ compact = false, onSubmit }: { compact?: boolean; onSubmit?: () => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    window.location.href = `/especialistas?q=${encodeURIComponent(trimmed)}`;
    onSubmit?.();
  }

  function applySuggestion(suggestion: string) {
    window.location.href = `/especialistas?q=${encodeURIComponent(suggestion)}`;
    onSubmit?.();
  }

  return (
    <form className={`relative min-w-0 ${compact ? "w-full" : "w-[min(34vw,420px)]"}`} onSubmit={submit}>
      <label className="sr-only" htmlFor={compact ? "header-mobile-search" : "header-search"}>Buscar servicio</label>
      <div className="flex overflow-hidden rounded-2xl border border-line bg-slate-50 shadow-sm transition focus-within:border-brand focus-within:bg-white">
        <input
          id={compact ? "header-mobile-search" : "header-search"}
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-bold text-ink outline-none"
          placeholder="Busca oficio, problema o comuna"
        />
        <button className="bg-brand px-4 text-sm font-black text-white transition hover:bg-brand-dark" type="submit" aria-label="Buscar">
          Buscar
        </button>
      </div>
      {focused ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] rounded-2xl border border-line bg-white p-3 shadow-card">
          <p className="px-2 text-xs font-black uppercase text-muted">Busquedas rapidas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <button key={suggestion} className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-muted transition hover:bg-brand-soft hover:text-brand-dark" type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applySuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}

function MegaCategoryMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="absolute left-1/2 top-[calc(100%+14px)] z-[90] w-[min(1120px,calc(100vw-40px))] -translate-x-1/2 rounded-[28px] border border-line bg-white p-5 shadow-card">
      <div className="grid gap-4 xl:grid-cols-5">
        {categoryGroups.map((group) => (
          <section key={group.title} className="rounded-2xl bg-slate-50 p-4">
            <Link href={group.href} className="block text-sm font-black text-ink transition hover:text-brand" onClick={onClose}>
              {group.title}
            </Link>
            <div className="mt-3 grid gap-1">
              {group.items.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl px-2 py-2 text-sm font-bold text-muted transition hover:bg-white hover:text-brand-dark" onClick={onClose}>
                  {label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function UserAccountMenu({
  session,
  open,
  pathname,
  onToggle,
  onOpenCart,
  onLogout,
}: {
  session: MockSession;
  open: boolean;
  pathname: string;
  onToggle: () => void;
  onOpenCart: () => void;
  onLogout: () => void;
}) {
  const initials = initialsForName(session.name);
  const firstName = session.name.split(" ")[0] || "Cuenta";
  const items = roleMenu[session.role];

  return (
    <div className="relative">
      <button className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2 text-sm font-black text-ink shadow-sm transition hover:border-brand hover:bg-brand-soft" type="button" aria-expanded={open} onClick={onToggle}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs text-white">{initials}</span>
        <span>{firstName}</span>
        <span className="text-muted">v</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[95] w-72 rounded-[24px] border border-line bg-white p-3 shadow-card">
          <div className="rounded-2xl bg-brand-soft p-3">
            <strong className="block text-ink">{session.name}</strong>
            <span className="text-xs font-bold text-brand-dark">{session.email}</span>
          </div>
          <div className="mt-2 grid gap-1">
            {items.map((item) =>
              item.cart ? (
                <button key={item.label} className="rounded-xl px-3 py-2 text-left text-sm font-black text-muted transition hover:bg-slate-50 hover:text-brand" type="button" onClick={onOpenCart}>
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href!} aria-current={isActivePath(pathname, item.href!.split("#")[0]) ? "page" : undefined} className="rounded-xl px-3 py-2 text-sm font-black text-muted transition hover:bg-slate-50 hover:text-brand">
                  {item.label}
                </Link>
              ),
            )}
          </div>
          <button className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-left text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={onLogout}>
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MobileMenu({
  session,
  pathname,
  onClose,
  onLogin,
  onOpenCart,
  onLogout,
}: {
  session: MockSession | null;
  pathname: string;
  onClose: () => void;
  onLogin: () => void;
  onOpenCart: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-line bg-white px-4 py-4 shadow-soft lg:hidden">
      <div className="grid gap-3">
        <MobileLink href="/especialistas" label="Especialistas" pathname={pathname} onClick={onClose} />
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <strong className="text-sm font-black text-ink">Categorias</strong>
          <div className="mt-2 grid gap-2">
            {categoryGroups.map((group) => (
              <details key={group.title} className="rounded-xl bg-white p-3">
                <summary className="cursor-pointer text-sm font-black text-brand-dark">{group.title}</summary>
                <div className="mt-2 grid gap-1">
                  <Link href={group.href} className="rounded-lg px-2 py-2 text-sm font-black text-ink" onClick={onClose}>
                    Ver todo
                  </Link>
                  {group.items.map(([label, href]) => (
                    <Link key={href} href={href} className="rounded-lg px-2 py-2 text-sm font-bold text-muted" onClick={onClose}>
                      {label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
        <MobileLink href="/club-hogar" label="Club Hogar" pathname={pathname} onClick={onClose} />
        <MobileLink href="/empresas" label="Empresas" pathname={pathname} onClick={onClose} />
        <MobileLink href="/registro-especialista" label="Trabaja con nosotros" pathname={pathname} onClick={onClose} />
        <MobileLink href="/soporte" label="Soporte" pathname={pathname} onClick={onClose} />
        <button className="btn-secondary" type="button" onClick={onOpenCart}>
          Mi carrito
        </button>
        {session ? (
          <div className="grid gap-2 rounded-2xl border border-brand/15 bg-brand-soft p-3">
            <span className="text-sm font-black text-brand-dark">{session.name}</span>
            {(roleMenu[session.role] ?? []).map((item) =>
              item.cart ? (
                <button key={item.label} className="rounded-xl bg-white px-3 py-2 text-left text-sm font-black text-muted" type="button" onClick={onOpenCart}>
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href!} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-muted" onClick={onClose}>
                  {item.label}
                </Link>
              ),
            )}
            <button className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-left text-sm font-black text-rose-700" type="button" onClick={onLogout}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <button className="btn-primary" type="button" onClick={onLogin}>
            Iniciar sesion
          </button>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActivePath(pathname, href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={active ? "rounded-full bg-brand px-4 py-2 text-white shadow-sm transition hover:bg-brand-dark" : "rounded-full px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark"}>
      {label}
    </Link>
  );
}

function MobileLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick: () => void }) {
  const active = isActivePath(pathname, href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={active ? "rounded-2xl bg-brand px-4 py-3 text-sm font-black text-white" : "rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-muted"} onClick={onClick}>
      {label}
    </Link>
  );
}

function initialsForName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OP";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
