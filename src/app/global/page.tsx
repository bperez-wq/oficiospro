import type { Metadata } from "next";
import { PlatformNav } from "@/components/PlatformNav";
import { GlobalWaitlist } from "@/components/GlobalWaitlist";

// Mercado en exploración: noindex por defecto para no prometer cobertura ni generar
// SEO indexable de mercados donde todavía no operamos.
export const metadata: Metadata = {
  title: "OficiosPro Global | Lista de espera por país y ciudad",
  description:
    "Estamos evaluando dónde lanzar OficiosPro. Déjanos tu interés como cliente o especialista por país y ciudad. No hay disponibilidad garantizada todavía.",
  robots: { index: false, follow: true },
};

export default function GlobalPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <GlobalWaitlist />
    </main>
  );
}
