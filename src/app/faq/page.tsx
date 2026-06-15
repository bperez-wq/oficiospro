import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Preguntas frecuentes OficiosPro",
  description: "Resuelve dudas sobre creditos, reservas, especialistas verificados, Club Hogar, empresas y postulaciones en OficiosPro.",
  path: "/faq",
  keywords: ["FAQ OficiosPro", "preguntas frecuentes", "creditos OficiosPro"],
});

const questions = [
  ["Clientes", "¿La reserva queda confirmada automáticamente?", "No. La solicitud queda pendiente de confirmación para que OficiosPro y el especialista revisen horario, comuna y detalle del trabajo."],
  ["Clientes", "¿Qué significa pago protegido?", "El flujo está diseñado para que los créditos se usen con trazabilidad y respaldo, evitando acuerdos poco claros fuera de la plataforma."],
  ["Empresas", "¿Puedo solicitar cobertura para varias sedes?", "Sí. Las empresas pueden indicar sucursales, comuna principal y tipo de mantención para evaluar un plan operativo."],
  ["Especialistas", "¿Qué revisa OficiosPro para verificar un perfil?", "Identidad, referencias, portafolio, cobertura, certificaciones cuando correspondan y claridad de servicios ofrecidos."],
  ["Especialistas", "¿La agenda ya bloquea horarios reales?", "La agenda actual permite visualizar y bloquear disponibilidad de forma local, preparada para conectarse al backend definitivo."],
];

export default function FaqPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow="FAQ" title="Preguntas frecuentes" subtitle="Respuestas iniciales para clientes, empresas y especialistas OficiosPro." />
      <section className="grid gap-4 md:grid-cols-2">
        {questions.map(([segment, question, answer]) => (
          <article key={question} className="panel">
            <p className="eyebrow">{segment}</p>
            <h2 className="text-2xl font-black">{question}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
