import Link from "next/link";
import { FormalizationAndPayoutPanel } from "@/components/FormalizationAndPayoutPanel";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { MarketplaceCard } from "@/components/DesignSystem";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Formalizacion especialista OficiosPro | Documentos y cobro",
  description: "Conoce el flujo referencial de documentos, formalizacion y liquidaciones para especialistas OficiosPro. Validacion contable y SII requerida.",
  path: "/formalizacion",
  keywords: ["formalizacion especialista", "boleta honorarios", "factura especialista", "liquidacion OficiosPro"],
});

export default function FormalizacionPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Especialistas OficiosPro"
        title="Formalizacion clara antes de cobrar servicios."
        subtitle="OficiosPro ordena el flujo para que el cliente pague con créditos y el especialista emita su documento a OP SpA antes de liberar liquidaciones."
      />
      <section className="rounded-[28px] border border-brand/15 bg-white p-6 shadow-soft">
        <p className="eyebrow">Tranquilo</p>
        <h2 className="text-2xl font-black text-ink">No necesitas saber de impuestos para empezar.</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-muted">
          La formalizacion es asistida: puedes crear tu perfil y postular aunque todavia no emitas boletas o facturas. Te guiamos con los documentos y datos tributarios antes de activar pagos. Inscribirte no tiene costo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Sin costo inicial", "Formalizacion asistida", "Puedes postular sin todo resuelto"].map((item) => (
            <span key={item} className="chip-brand px-3.5 py-2">{item}</span>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-6 shadow-soft">
        <p className="eyebrow">Comisión OficiosPro</p>
        <h2 className="text-3xl font-black text-ink">9,5% + IVA sobre la base configurada del servicio.</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-brand-dark">
          OficiosPro aplica una comisión estandar de plataforma de 9,5% + IVA. Esta comisión financia tecnologia, soporte, operación, pago protegido y gestion administrativa.
        </p>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-brand-dark">
          El calculo final puede variar segun tipo de documento, retencion, IVA, materiales, urgencia y validacion contable.
        </p>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        {[
          ["1", "El cliente compra creditos", "OficiosPro documenta la compra o suscripcion segun corresponda."],
          ["2", "El servicio se ejecuta", "Los créditos quedan retenidos hasta que el trabajo avance o cierre."],
          ["3", "Especialista documenta a OP SpA", "Boleta de honorarios o factura segun situacion tributaria validada."],
        ].map(([step, title, text]) => (
          <MarketplaceCard key={step} hover={false}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-black text-white">{step}</span>
            <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">{text}</p>
          </MarketplaceCard>
        ))}
      </section>
      <FormalizationAndPayoutPanel variant="public" initialTaxType="boleta_honorarios" initialTargetCLP={35000} />
      <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
        <p className="eyebrow">Importante</p>
        <h2 className="text-2xl font-black text-ink">La calculadora es referencial.</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-muted">
          Las tasas, glosas, documentos y momentos de emision deben validarse con contador y SII antes de operar pagos reales. OficiosPro no libera pagos sin documento revisado. Calculo referencial sujeto a validacion contable.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/registro-especialista">
            Ofrecer mis servicios
          </Link>
          <Link className="btn-secondary" href="/soporte">
            Ver soporte
          </Link>
        </div>
      </section>
      <ContactTrustStrip />
    </main>
  );
}
