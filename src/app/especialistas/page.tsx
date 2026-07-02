import { Suspense } from "react";
import { PlatformNav } from "@/components/PlatformNav";
import { SpecialistsHero } from "@/components/SpecialistsHero";
import { SpecialistsExplorer } from "@/components/SpecialistsExplorer";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Especialistas verificados por oficio y comuna",
  description: "Busca especialistas verificados por categoria, comuna, disponibilidad, reputacion y precio en créditos dentro de OficiosPro.",
  path: "/especialistas",
  keywords: ["especialistas verificados", "oficios por comuna", "gasfiter", "electricista"],
});

export default function SpecialistsPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <SpecialistsHero />
      <Suspense fallback={<div className="rounded-[28px] border border-line bg-white p-6 shadow-soft text-sm font-black text-muted">Cargando especialistas...</div>}>
        <SpecialistsExplorer />
      </Suspense>
    </main>
  );
}
