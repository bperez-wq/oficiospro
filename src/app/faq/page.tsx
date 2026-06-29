import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { Reveal } from "@/components/Reveal";

export const metadata = buildPublicRouteMetadata({
  title: "Preguntas frecuentes OficiosPro",
  description: "Resuelve dudas sobre creditos, reservas, especialistas verificados, Club Hogar, empresas y postulaciones en OficiosPro.",
  path: "/faq",
  keywords: ["FAQ OficiosPro", "preguntas frecuentes", "creditos OficiosPro"],
});

const creditQuestions = [
  ["Créditos", "¿Qué es 1 crédito?", "Un crédito es la unidad con la que se cobran los servicios dentro de OficiosPro. Cada servicio muestra su precio en créditos antes de reservar, así sabes el valor por adelantado y sin sorpresas."],
  ["Créditos", "¿Cómo se compran los créditos?", "Puedes adquirir créditos en paquetes desde el checkout, o acumularlos mes a mes con un plan como Club Hogar. El valor en pesos se muestra siempre antes de pagar."],
  ["Créditos", "¿Cómo se usan?", "Al reservar un servicio, los créditos correspondientes se retienen. Se liberan al especialista cuando el trabajo avanza o queda cerrado. Cualquier adicional requiere tu aprobación antes de cobrarse."],
  ["Créditos", "¿Qué pasa si el trabajo no se completa?", "Los créditos quedan protegidos: no se liberan al especialista si el servicio no se realiza. OficiosPro revisa cada caso de forma manual mientras se resuelve."],
  ["Créditos", "¿Hay reembolsos o disputas?", "Sí. Si hay un problema con el servicio, puedes abrir una disputa y el equipo OficiosPro la revisa. Mientras se resuelve, los créditos retenidos permanecen protegidos."],
  ["Créditos", "¿Los créditos se acumulan o vencen?", "Se acumulan mes a mes hasta un tope equivalente a 10 meses de tu plan (por ejemplo, 400 créditos en un plan de 40 mensuales). Dentro de ese tope se mantienen disponibles; al llegar al tope dejan de sumar, así que conviene usarlos al menos un par de veces al año."],
  ["Club Hogar", "¿Qué ventaja dan los créditos en Club Hogar?", "Club Hogar te permite acumular créditos mensuales y acceder a un valor preferente en créditos por servicio frente al precio normal, manteniendo la misma protección de pago."],
  ["Empresas", "¿Cómo funcionan los créditos para empresas?", "Las empresas pueden operar con planes y créditos según su volumen de mantenciones y sedes. Un ejecutivo revisa el caso para proponer la cobertura adecuada."],
];

const generalQuestions = [
  ["Clientes", "¿La reserva queda confirmada automáticamente?", "No. La solicitud queda pendiente de confirmación para que OficiosPro y el especialista revisen horario, comuna y detalle del trabajo. Te contactamos antes de cualquier cobro."],
  ["Clientes", "¿Qué significa pago protegido?", "Significa que tus créditos se retienen con trazabilidad y solo se liberan cuando el servicio avanza, evitando acuerdos poco claros fuera de la plataforma."],
  ["Empresas", "¿Puedo solicitar cobertura para varias sedes?", "Sí. Las empresas pueden indicar sucursales, comuna principal y tipo de mantención para evaluar un plan operativo."],
  ["Especialistas", "¿Qué revisa OficiosPro para verificar un perfil?", "Identidad, referencias, portafolio, cobertura, certificaciones cuando correspondan y claridad de servicios ofrecidos. La revisión la hace una persona del equipo."],
  ["Especialistas", "¿La agenda ya bloquea horarios reales?", "La agenda actual permite visualizar y bloquear disponibilidad de forma local, preparada para conectarse al backend definitivo."],
];

export default function FaqPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow="FAQ" title="Preguntas frecuentes" subtitle="Respuestas iniciales para clientes, empresas y especialistas OficiosPro." />
      <Reveal delay={0}>
        <section className="grid gap-4">
          <div>
            <p className="eyebrow">Sistema de créditos</p>
            <h2 className="text-3xl font-black text-ink">Cómo funcionan los créditos</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
              Qué es un crédito, cómo se compran, cómo se usan y qué protección tienes ante problemas, disputas o trabajos no completados.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {creditQuestions.map(([segment, question, answer]) => (
              <article key={question} className="panel">
                <p className="eyebrow">{segment}</p>
                <h3 className="text-xl font-black">{question}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">{answer}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
      <Reveal delay={80}>
        <section className="grid gap-4">
          <div>
            <p className="eyebrow">General</p>
            <h2 className="text-3xl font-black text-ink">Otras preguntas frecuentes</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {generalQuestions.map(([segment, question, answer]) => (
              <article key={question} className="panel">
                <p className="eyebrow">{segment}</p>
                <h3 className="text-xl font-black">{question}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">{answer}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  );
}
