import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Privacidad OficiosPro | Uso de datos y formularios",
  description: "Conoce como OficiosPro trata datos de contacto, postulaciones, solicitudes, documentos y comunicaciones operativas.",
  path: "/privacidad",
  keywords: ["privacidad OficiosPro", "datos personales", "formularios"],
});

export default function PrivacidadPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow="Privacidad" title="Política de privacidad" subtitle="Cómo OficiosPro trata los datos enviados por clientes, empresas y especialistas." />
      <section className="panel grid gap-5 text-sm font-semibold leading-7 text-muted">
        <p>Usamos los datos de contacto, ubicación referencial, servicio requerido y antecedentes operacionales solo para revisar solicitudes, coordinar servicios y mejorar la experiencia de OficiosPro.</p>
        <p>No publicamos datos privados de clientes ni direcciones exactas. Los datos de especialistas se muestran públicamente solo cuando son parte del perfil profesional aprobado.</p>
        <p>Los formularios pueden guardar una copia local temporal en el navegador para continuidad de la experiencia, pero la fuente operacional debe ser el registro seguro en Cloudflare D1 cuando esté configurado.</p>
        <p>Para solicitar revisión o eliminación de información, escribe a bperez@oficiospro.cl.</p>
      </section>
    </main>
  );
}
