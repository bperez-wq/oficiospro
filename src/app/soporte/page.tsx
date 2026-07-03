import type { ReactNode } from "react";
import { ConversionButton } from "@/components/ConversionModal";
import { EmptyState } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { VisualFaqAccordion, type FaqItem } from "@/components/VisualFaqAccordion";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { Reveal } from "@/components/Reveal";

export const metadata = buildPublicRouteMetadata({
  title: "Soporte OficiosPro | Ayuda para clientes y especialistas",
  description: "Encuentra ayuda para reservas, créditos, postulaciones, especialistas, empresas y solicitudes operativas en OficiosPro.",
  path: "/soporte",
  keywords: ["soporte OficiosPro", "ayuda reservas", "ayuda especialistas"],
});

const supportTopics = ["Créditos", "Reservas", "Pagos", "Adicionales", "Documentos", "Cuenta"];

const supportBlocks: { icon: ReactNode; image: string; imageAlt: string; title: string; detail: string; faqs: FaqItem[] }[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9h14v-9" />
      </svg>
    ),
    image: "/assets/oficios/pintura/pintura-interior-01.jpg",
    imageAlt: "Pintor realizando un trabajo de interior en un hogar",
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
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    image: "/assets/oficios/carpinteria/carpinteria-taller-01.jpg",
    imageAlt: "Carpintero trabajando en su taller",
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
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" />
      </svg>
    ),
    image: "/assets/oficios/electricidad/electricidad-medidor-01.jpg",
    imageAlt: "Técnico revisando un medidor en una instalación comercial",
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
      <Reveal delay={0}>
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
            <ConversionButton type="consulta_general" sourceButton="Contactar soporte" className="btn-primary shine">
              Contactar soporte
            </ConversionButton>
            <ConversionButton type="consulta_general" sourceButton="Quiero que me contacten soporte" className="btn-secondary">
              Quiero que me contacten
            </ConversionButton>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal delay={70}>
      <section className="grid gap-5 rounded-[28px] border border-brand/15 bg-brand-soft p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div>
          <p className="eyebrow">Etapa piloto</p>
          <h2 className="text-3xl font-black text-ink">La operación se revisa con seguimiento humano.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-brand-dark">
            Estamos sumando especialistas fundadores y clientes reales de forma controlada. Si algo aun no esta automatizado, el equipo OficiosPro toma el caso y responde por el canal indicado.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Clientes", "Solicitudes sin match exacto se revisan manualmente."],
            ["Especialistas", "Postulaciones quedan en revision antes de publicar."],
            ["Empresas", "Cuentas piloto se coordinan con contacto operacional."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-white/70 bg-white p-4">
              <strong className="block text-ink">{title}</strong>
              <span className="mt-2 block text-sm font-bold leading-6 text-muted">{text}</span>
            </article>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal delay={140}>
      <section className="grid items-start gap-5 lg:grid-cols-3">
        {supportBlocks.map((block) => (
          <article key={block.title} className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
            <div className="relative h-24">
              <img src={block.image} alt={block.imageAlt} loading="lazy" className="h-full w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 to-ink/10" />
              <span aria-hidden className="absolute bottom-3 left-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/95 text-brand-dark shadow-soft backdrop-blur">{block.icon}</span>
            </div>
            <div className="p-5 md:p-6">
              <div className="mb-4">
                <h2 className="text-xl font-black text-ink">{block.title}</h2>
                <p className="text-sm font-bold text-muted">{block.detail}</p>
              </div>
              <VisualFaqAccordion items={block.faqs} openFirst={false} />
            </div>
          </article>
        ))}
      </section>
      </Reveal>

      <EmptyState
        eyebrow="Ayuda operativa"
        title="Si no encuentras tu caso, lo revisamos contigo."
        text="Soporte centralizado para clientes, especialistas, empresas y comunidades, sin exponer datos sensibles. En piloto preferimos tomar el caso antes de prometer una respuesta automatica."
        action={
          <ConversionButton type="consulta_general" sourceButton="Soporte final CTA" className="btn-primary">
            Pedir ayuda
          </ConversionButton>
        }
      />
    </main>
  );
}
