import { PlatformNav } from "@/components/PlatformNav";
import { ClubHogarContent } from "@/components/ClubHogarContent";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Club Hogar OficiosPro | Créditos para mantenciones",
  description: "Club Hogar entrega créditos recurrentes para ordenar mantenciones, reparaciones y solicitudes técnicas con especialistas verificados.",
  path: "/club-hogar",
  image: "/assets/hero-hogar.webp",
  keywords: ["Club Hogar", "creditos mantencion", "servicios hogar"],
});

export default function ClubHogarPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <ClubHogarContent />
    </main>
  );
}
