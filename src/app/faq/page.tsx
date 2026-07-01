import { PlatformNav } from "@/components/PlatformNav";
import { TranslatedAppHero } from "@/components/TranslatedAppHero";
import { FaqContent } from "@/components/FaqContent";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Preguntas frecuentes OficiosPro",
  description: "Resuelve dudas sobre créditos, reservas, especialistas verificados, Club Hogar, empresas y postulaciones en OficiosPro.",
  path: "/faq",
  keywords: ["FAQ OficiosPro", "preguntas frecuentes", "creditos OficiosPro"],
});

export default function FaqPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <TranslatedAppHero pageKey="faq" />
      <FaqContent />
    </main>
  );
}
