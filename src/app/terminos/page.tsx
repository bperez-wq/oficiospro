import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Terminos y condiciones OficiosPro",
  description: "Consulta las condiciones generales de uso de OficiosPro para clientes, especialistas, empresas, créditos y solicitudes.",
  path: "/terminos",
  keywords: ["terminos OficiosPro", "condiciones de uso"],
});

export default function TerminosPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow="Términos" title="Términos de uso OficiosPro" subtitle="Condiciones iniciales para clientes, empresas y especialistas que usan la plataforma." />
      <section className="panel grid gap-5 text-sm font-semibold leading-7 text-muted">
        <p>OficiosPro conecta solicitudes de servicios con especialistas y empresas técnicas. La disponibilidad, precios en créditos y tiempos de atención pueden variar según zona, agenda y validación operacional.</p>
        <p>Las solicitudes enviadas por formularios quedan sujetas a revisión. Una solicitud no implica confirmación automática del servicio ni obligación de prestación hasta que las partes coordinen los detalles.</p>
        <p>Los especialistas deben entregar información veraz sobre identidad, certificaciones, experiencia, cobertura y servicios ofrecidos. OficiosPro puede revisar, aprobar, pausar o rechazar perfiles para proteger la confianza de la red.</p>
        <p>Para consultas sobre estos términos, escribe a bperez@oficiospro.cl.</p>
      </section>
    </main>
  );
}
