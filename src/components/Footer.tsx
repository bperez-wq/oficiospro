"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getMockSession, type MockSession } from "@/lib/storage";

type FooterLink = { href: string; label: string };
type FooterGroup = { titleIndex: number; title: string; links: FooterLink[] };

// Dashboard interno por rol — solo se muestra al usuario con sesión de ese rol.
const dashboardByRole: Record<MockSession["role"], FooterLink> = {
  client: { href: "/dashboard-cliente", label: "Dashboard cliente" },
  specialist: { href: "/dashboard-especialista", label: "Dashboard especialista" },
  company: { href: "/dashboard-empresa", label: "Dashboard empresa" },
  admin: { href: "/admin", label: "Panel admin" },
};

// Títulos por índice estable (alineados con footer.groupTitles del i18n):
// 0 Producto · 1 Plataforma · 2 Operación · 3 Confianza
function buildGroups(session: MockSession | null): FooterGroup[] {
  const productGroup: FooterGroup = {
    titleIndex: 0,
    title: "Producto",
    links: [
      { href: "/especialistas", label: "Especialistas" },
      { href: "/especialistas-fundadores", label: "Especialistas fundadores" },
      { href: "/club-hogar", label: "Club Hogar" },
      { href: "/empresas", label: "Empresas" },
      { href: "/#recomienda-gana", label: "Recomienda y gana" },
      { href: "/impacto", label: "Impacto" },
    ],
  };

  const operationGroup: FooterGroup = {
    titleIndex: 2,
    title: "Operación",
    links: [
      { href: "/registro-cliente", label: "Registro cliente" },
      { href: "/registro-especialista", label: "Registro especialista" },
      { href: "/referidos/especialistas", label: "Referidos especialistas" },
      { href: "/instituciones", label: "Instituciones" },
    ],
  };

  const trustGroup: FooterGroup = {
    titleIndex: 3,
    title: "Confianza",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/faq", label: "FAQ" },
      { href: "/terminos", label: "Términos" },
      { href: "/privacidad", label: "Privacidad" },
      { href: "/impacto", label: "Impacto" },
    ],
  };

  // "Plataforma" (destinos internos) solo para usuarios con sesión: se muestra el
  // dashboard de su rol. Un visitante anónimo nunca ve dashboards ni Admin.
  const platformLinks: FooterLink[] = session ? [dashboardByRole[session.role]] : [];
  const groups: FooterGroup[] = [productGroup];
  if (platformLinks.length) {
    groups.push({ titleIndex: 1, title: "Plataforma", links: platformLinks });
  }
  groups.push(operationGroup, trustGroup);
  return groups;
}

export function Footer() {
  const { t, tList } = useI18n();
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    setSession(getMockSession());
    function refresh() {
      setSession(getMockSession());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const groups = buildGroups(session);
  return (
    <footer className="border-t border-white/10 bg-enterprise px-5 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <Link href="/" className="flex items-center font-black" aria-label="Ir al inicio de OficiosPro">
            <BrandLogo variant="white" size="lg" />
          </Link>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">
            {t("footer.tagline")}
          </p>
          <p className="mt-4 max-w-xl text-lg font-black leading-7 text-white">
            {t("footer.empower")}
          </p>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/70">
            {t("footer.empowerSub")}
          </p>
          <p className="mt-4 max-w-xl text-sm font-black leading-6 text-white">
            Contacto: bperez@oficiospro.cl
          </p>
          <CreditsHelpTrigger className="mt-3 text-sm font-black text-white underline underline-offset-2 hover:text-white/80">
            {t("footer.creditsHelp")}
          </CreditsHelpTrigger>
          <div className="mt-6 flex flex-wrap gap-2">
            {tList("footer.chips").map((item) => (
              <span key={item} className="chip bg-white/10 text-white">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/global" className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white hover:text-ink">
              🌐 {t("footer.globalCta")}
            </Link>
            <LanguageSwitcher compact />
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="font-black">{tList("footer.groupTitles")[group.titleIndex] ?? group.title}</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/70">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
