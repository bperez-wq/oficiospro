"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CartButton, CartDrawer } from "@/components/CartDrawer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginEntryModal } from "@/components/LoginEntryModal";
import { getClientMenuGroups } from "@/data/tradeTaxonomy";
import { trackEvent } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { clearMockSession, getMockSession, type MockSession } from "@/lib/storage";

const quickSuggestions = ["Calefont", "Filtracion", "Electricista SEC", "Camaras", "Riego", "Piscina", "Porton"];

const categoryGroups = getClientMenuGroups();

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
    { label: "Mi bolsa", cart: true },
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

  /* Permite abrir la Bolsa desde cualquier componente (ej: al cotizar/reservar una card). */
  useEffect(() => {
    function openBag() {
      setCartOpen(true);
    }
    window.addEventListener("oficiospro-open-bag", openBag);
    return () => window.removeEventListener("oficiospro-open-bag", openBag);
  }, []);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const categoryCloseTimerRef = useRef<number | null>(null);
  const [categoryMenuStyle, setCategoryMenuStyle] = useState<CSSProperties>({});
  const pathname = usePathname();
  const { t } = useI18n();

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

  useEffect(() => {
    if (!categoryOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!categoryMenuRef.current?.contains(event.target as Node)) closeCategoryMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCategoryMenu();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryOpen]);

  useEffect(() => {
    if (!categoryOpen) return;

    updateCategoryMenuPosition();
    window.addEventListener("resize", updateCategoryMenuPosition);
    window.addEventListener("scroll", updateCategoryMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateCategoryMenuPosition);
      window.removeEventListener("scroll", updateCategoryMenuPosition, true);
    };
  }, [categoryOpen]);

  useEffect(() => {
    return () => {
      if (categoryCloseTimerRef.current) window.clearTimeout(categoryCloseTimerRef.current);
    };
  }, []);

  function logout() {
    clearMockSession();
    setSession(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  function closeMenus() {
    closeCategoryMenu();
    setUserMenuOpen(false);
    setMobileOpen(false);
  }

  function openCategoryMenu() {
    if (categoryCloseTimerRef.current) window.clearTimeout(categoryCloseTimerRef.current);
    categoryCloseTimerRef.current = null;
    updateCategoryMenuPosition();
    setCategoryOpen(true);
  }

  function scheduleCategoryClose() {
    if (categoryCloseTimerRef.current) window.clearTimeout(categoryCloseTimerRef.current);
    categoryCloseTimerRef.current = window.setTimeout(() => {
      setCategoryOpen(false);
      categoryCloseTimerRef.current = null;
    }, 200);
  }

  function closeCategoryMenu() {
    if (categoryCloseTimerRef.current) window.clearTimeout(categoryCloseTimerRef.current);
    categoryCloseTimerRef.current = null;
    setCategoryOpen(false);
  }

  function toggleCategoryMenu() {
    if (categoryOpen) {
      closeCategoryMenu();
      return;
    }
    openCategoryMenu();
  }

  function updateCategoryMenuPosition() {
    const trigger = categoryTriggerRef.current;
    if (!trigger || typeof window === "undefined") return;

    const rect = trigger.getBoundingClientRect();
    const margin = 16;
    const width = Math.min(1120, Math.max(320, window.innerWidth - margin * 2));
    const left = Math.min(Math.max(window.innerWidth / 2, margin + width / 2), window.innerWidth - margin - width / 2);
    const top = Math.min(rect.bottom + 12, window.innerHeight - margin);
    const maxHeight = Math.max(280, window.innerHeight - top - margin);

    setCategoryMenuStyle({
      left,
      top,
      width,
      maxHeight,
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      {isAdmin ? (
        <div className="border-b border-teal-900/20 bg-ink text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black uppercase text-teal-950">Administrador</span>
              <span className="text-sm font-bold text-white/85">{session.email ?? "Administrador OficiosPro"}</span>
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
          <div className="hidden min-w-0 flex-1 xl:flex">
            <HeaderSearch />
          </div>
          <nav className="flex shrink-0 items-center gap-0.5 text-sm font-black text-muted xl:gap-1">
            <NavLink href="/especialistas" label={t("nav.specialists")} pathname={pathname} />
            <div ref={categoryMenuRef} className="relative" onMouseEnter={openCategoryMenu} onMouseLeave={scheduleCategoryClose}>
              <button
                ref={categoryTriggerRef}
                className={categoryOpen ? "rounded-full bg-brand px-4 py-2 text-white shadow-sm" : "rounded-full px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark"}
                type="button"
                aria-haspopup="menu"
                aria-expanded={categoryOpen}
                aria-controls="header-category-menu"
                onClick={toggleCategoryMenu}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeCategoryMenu();
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleCategoryMenu();
                  }
                }}
              >
                {t("nav.categories")}
              </button>
              <MegaCategoryMenu open={categoryOpen} onClose={closeCategoryMenu} style={categoryMenuStyle} />
            </div>
            <NavLink href="/club-hogar" label={t("nav.club")} pathname={pathname} />
            <NavLink href="/empresas" label={t("nav.companies")} pathname={pathname} />
            <NavLink href="/#recomienda-gana" label={t("nav.refer")} pathname={pathname} />
            <Link
              href="/especialistas-fundadores?source=header&intent=offer_services"
              className="rounded-full px-4 py-2 transition hover:bg-brand-soft hover:text-brand-dark"
              onClick={() => {
                void trackEvent({
                  eventName: "click_offer_services",
                  source: "header",
                  campaign: "founder_specialists_header",
                  sourceComponent: "Header",
                  sourceButton: "Trabaja con nosotros",
                  metadata: { cta: "header_work_with_us", path: pathname },
                });
              }}
            >
              {t("nav.work")}
            </Link>
            <NavLink href="/soporte" label={t("nav.support")} pathname={pathname} />
          </nav>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-2xl border border-line bg-white px-3 py-2 text-sm font-black text-muted shadow-sm transition hover:border-brand hover:text-brand lg:hidden" type="button" onClick={() => setMobileSearchOpen((current) => !current)}>
            {t("nav.search")}
          </button>
          <LanguageSwitcher className="hidden lg:inline-flex" compact />
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
                {t("nav.login")}
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
  const { t } = useI18n();

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
          placeholder={t("nav.searchPlaceholder")}
        />
        <button className="bg-brand px-4 text-sm font-black text-white transition hover:bg-brand-dark" type="submit" aria-label={t("nav.search")}>
          {t("nav.search")}
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

function MegaCategoryMenu({ open, onClose, style }: { open: boolean; onClose: () => void; style?: CSSProperties }) {
  if (!open) return null;

  return (
    <div
      id="header-category-menu"
      className="fixed z-[90] -translate-x-1/2 overflow-y-auto overscroll-contain pt-3"
      style={{ left: "50%", top: "5rem", width: "min(1120px, calc(100vw - 32px))", maxHeight: "calc(100vh - 6rem)", ...style }}
      role="menu"
    >
      <div className="rounded-[28px] border border-line bg-white p-5 shadow-card">
        <div className="grid gap-4 xl:grid-cols-5">
          {categoryGroups.map((group) => (
            <section key={group.title} className="rounded-2xl bg-slate-50 p-4">
              <Link href={group.href} role="menuitem" className="block rounded-xl px-2 py-2 text-sm font-black text-ink transition hover:bg-white hover:text-brand" onClick={onClose}>
                {group.title}
              </Link>
              <div className="mt-2 grid gap-1">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} role="menuitem" className="rounded-xl px-2 py-2 text-sm font-bold text-muted transition hover:bg-white hover:text-brand-dark focus:bg-white focus:text-brand-dark focus:outline-none" onClick={onClose}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
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
  const { t } = useI18n();
  return (
    <div className="border-t border-line bg-white px-4 py-4 shadow-soft lg:hidden">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-3">
          <span className="text-sm font-black text-muted">{t("lang.choose")}</span>
          <LanguageSwitcher compact />
        </div>
        <MobileLink href="/especialistas" label={t("nav.specialists")} pathname={pathname} onClick={onClose} />
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <strong className="text-sm font-black text-ink">{t("nav.categories")}</strong>
          <div className="mt-2 grid gap-2">
            {categoryGroups.map((group) => (
              <details key={group.title} className="rounded-xl bg-white p-3">
                <summary className="cursor-pointer text-sm font-black text-brand-dark">{group.title}</summary>
                <div className="mt-2 grid gap-1">
                  <Link href={group.href} className="rounded-lg px-2 py-2 text-sm font-black text-ink" onClick={onClose}>
                    Ver todo
                  </Link>
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-lg px-2 py-2 text-sm font-bold text-muted" onClick={onClose}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
        <MobileLink href="/club-hogar" label={t("nav.club")} pathname={pathname} onClick={onClose} />
        <MobileLink href="/empresas" label={t("nav.companies")} pathname={pathname} onClick={onClose} />
        <MobileLink href="/global" label={t("nav.global")} pathname={pathname} onClick={onClose} />
        <MobileLink href="/#recomienda-gana" label={t("nav.refer")} pathname={pathname} onClick={onClose} />
        <MobileLink
          href="/especialistas-fundadores?source=header&intent=offer_services"
          label={t("nav.work")}
          pathname={pathname}
          onClick={() => {
            void trackEvent({
              eventName: "click_offer_services",
              source: "header_mobile",
              campaign: "founder_specialists_header",
              sourceComponent: "HeaderMobile",
              sourceButton: "Trabaja con nosotros",
              metadata: { cta: "mobile_header_work_with_us", path: pathname },
            });
            onClose();
          }}
        />
        <MobileLink href="/soporte" label={t("nav.support")} pathname={pathname} onClick={onClose} />
        <button className="btn-secondary" type="button" onClick={onOpenCart}>
          Mi bolsa
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
            {t("nav.login")}
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
