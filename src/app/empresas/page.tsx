import { PlatformNav } from "@/components/PlatformNav";
import { EmpresasContent } from "@/components/EmpresasContent";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "OficiosPro Empresas | Servicios técnicos con creditos",
  description: "Centraliza solicitudes técnicas, créditos empresa, historial y especialistas verificados para oficinas, locales y operaciones.",
  path: "/empresas",
  image: "/assets/club-empresas.webp",
  keywords: ["servicios técnicos empresas", "mantencion oficinas", "creditos empresa"],
});

export default function EmpresasPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <EmpresasContent />
    </main>
  );
}
