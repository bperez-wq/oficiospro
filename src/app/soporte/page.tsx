import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";
import { VisualFaqAccordion, type FaqItem } from "@/components/VisualFaqAccordion";

const supportTopics = ["Créditos", "Reservas", "Pagos", "Adicionales", "Documentos", "Cuenta"];

const supportBlocks: { icon: string; title: string; detail: string; faqs: FaqItem[] }[] = [
  {
    icon: "🏠",
    title: "Soy cliente",
    detail: "Reservas, créditos y pago protegido",
    faqs: [
      {
        question: "¿Cómo reservo un especialista?",
        answer: "Busca en /especialistas, compara perfiles y aprieta Reservar o Cotizar: tu selección queda en la Bolsa y desde ahí confirmas con tus datos.",
      },
      {
        question: "¿Cómo funcionan los créditos?",
        answer: "Compras créditos o te suscribes a Club Hogar. Al reservar quedan retenidos (pago protegido) y se liberan cuando confirmas el avance del trabajo.",
      },
      {
        question: "¿Cómo apruebo adicionales?",
        answer: "Si aparecen materiales o trabajo extra, el especialista los propone y tú los apruebas antes de que se retengan créditos adicionales.",
      },
      {
        question: "¿Qué pasa si el especialista no llega?",
        answer: "Tus créditos retenidos no se liberan: se devuelven a tu saldo y puedes reagendar o elegir otro perfil. Avísanos para revisar el caso.",
      },
    ],
  },
  {
    icon: "🛠️",
    title: "Soy especialista",
    detail: "Postulación, perfil y pagos",
    faqs: [
      {
        question: "¿Cómo postulo?",
        answer: "Completa el registro con tus datos, oficio y servicios. Tu perfil se revisa antes de publicarse; los documentos de identidad no son públicos.",
      },
      {
        question: "¿Cómo funciona mi reputación?",
        answer: "Cada trabajo cerrado suma calificación, trabajos completados y nivel (Fundador a Platino). Eso define tu posición en las búsquedas.",
      },
      {
        question: "¿Puedo ofrecer varios servicios?",
        answer: "Sí: puedes aparecer en varias búsquedas, pero tendrás un solo perfil con toda tu reputación.",
      },
      {
        question: "¿Cómo recibo mis pagos?",
        answer: "Para pagarte servicios completados necesitamos que emitas boleta de honorarios o factura a OP SpA, según tu situación tributaria. El estado se ve en tu dashboard.",
      },
    ],
  },
  {
    icon: "🏢",
    title: "Soy empresa o comunidad",
    detail: "Cuenta corporativa y facturación",
    faqs: [
      {
        question: "¿Cómo solicito mantenciones?",
        answer: "Con una cuenta empresa centralizas solicitudes por sucursal, pagas con créditos corporativos y mantienes trazabilidad de cada servicio.",
      },
      {
        question: "¿Cómo funciona la facturación?",
        answer: "OficiosPro emite factura a nombre de tu empresa (razón social, RUT y giro) por créditos y suscripciones. Los datos se piden en el checkout.",
      },
      {
        question: "¿Qué incluye el SLA?",
        answer: "Los planes empresa incluyen priorización de respuesta, proveedores recurrentes y reportes mensuales de consumo por centro de costo.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="overflow-hidden rounded-[32px] border border-line bg-white shadow-card">
        <div className="surface-grid p-6 md:p-10">
          <p className="eyebrow">Soporte</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">¿En qué te ayudamos?</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">
            Ayuda para reservar, usar créditos, postular como especialista o coordinar mantenciones de empresas y comunidades.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {supportTopics.map((topic) => (
              <span key={topic} className="chip bg-brand-soft text-brand-dark">
                {topic}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <ConversionButton type="consulta_general" sourceButton="Contactar soporte" className="btn-primary">
              Contactar soporte
            </ConversionButton>
            <ConversionButton type="consulta_general" sourceButton="Quiero que me contacten soporte" className="btn-secondary">
              Quiero que me contacten
            </ConversionButton>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-5 lg:grid-cols-3">
        {supportBlocks.map((block) => (
          <article key={block.title} className="rounded-[28px] border border-line bg-white p-5 shadow-soft md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-xl">{block.icon}</span>
              <div>
                <h2 className="text-xl font-black text-ink">{block.title}</h2>
                <p className="text-sm font-bold text-muted">{block.detail}</p>
              </div>
            </div>
            <VisualFaqAccordion items={block.faqs} openFirst={false} />
          </article>
        ))}
      </section>

      <section className="grid gap-5 rounded-[28px] border border-brand/15 bg-brand-soft p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="eyebrow">Ayuda operativa</p>
          <h2 className="text-3xl font-black text-ink">Si no encuentras tu caso, lo revisamos contigo.</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
            Soporte centralizado para clientes, especialistas, empresas y comunidades, sin exponer datos sensibles.
          </p>
        </div>
        <ConversionButton type="consulta_general" sourceButton="Soporte final CTA" className="btn-primary">
          Pedir ayuda
        </ConversionButton>
      </section>
    </main>
  );
}
