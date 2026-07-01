"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CREDIT_EXAMPLES,
  CREDIT_VALUE_CLP,
  COMMISSION_SHORT_LABEL,
  PAYOUT_EXAMPLE_CREDITS,
  SUBSCRIBER_DISCOUNT_CREDITS,
  computeSpecialistPayout,
  creditsToCLP,
  creditsToCLPLabel,
  formatCLP,
} from "@/lib/credits/creditInfo";

/**
 * Reusable, presentational explanation of how credits work. No state of its own,
 * so it can be embedded in a modal, a page, or reused by the mobile app.
 */
export function CreditsExplainerContent() {
  const payout = computeSpecialistPayout(creditsToCLP(PAYOUT_EXAMPLE_CREDITS));
  return (
    <div className="grid gap-6">
      <section>
        <p className="eyebrow">Lo basico</p>
        <h3 className="text-xl font-black text-ink">Que es un crédito</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Un crédito es la unidad para pagar servicios en OficiosPro.
          <strong className="text-ink"> 1 crédito = {formatCLP(CREDIT_VALUE_CLP)}</strong>. Compras créditos y
          los usas para pagar a los especialistas, sin manejar efectivo.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-slate-50 p-4">
        <h3 className="text-lg font-black text-ink">Por que usamos créditos</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Los créditos funcionan como una <strong className="text-ink">cuenta de ahorro para las emergencias del
          hogar</strong>: vas acumulando saldo y lo usas cuando lo necesitas, sin tener que cotizar y juntar plata
          a última hora cuando se rompe el calefont o se tapa una cañería.
        </p>
        <ul className="mt-3 grid gap-1.5 text-sm font-bold text-ink">
          <li>- Los usas cuando quieras: no vencen al instante, quedan disponibles.</li>
          <li>- Listo para emergencias: ya tienes saldo para resolver al toque.</li>
          <li>- Precio claro por adelantado: sabes cuanto cuesta antes de reservar.</li>
          <li>- Pago en un solo lugar, con respaldo y protección OficiosPro.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-black text-ink">Ejemplos referenciales</h3>
        <p className="mt-1 text-xs font-bold text-muted">
          Valores aproximados para dar una idea. El precio final lo define el especialista segun el trabajo y la comuna.
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase text-muted">
              <tr>
                <th className="px-3 py-2">Servicio</th>
                <th className="px-3 py-2">Créditos</th>
                <th className="px-3 py-2">Aprox.</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_EXAMPLES.map((ex) => (
                <tr key={ex.service} className="border-t border-line">
                  <td className="px-3 py-2 font-bold text-ink">{ex.service}</td>
                  <td className="px-3 py-2 font-black text-brand-dark">{ex.credits} cr</td>
                  <td className="px-3 py-2 font-bold text-muted">{creditsToCLPLabel(ex.credits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-4">
        <h3 className="text-lg font-black text-ink">Pago protegido</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Cuando reservas, tus créditos quedan <strong className="text-ink">retenidos</strong>, no se entregan de
          inmediato. Se liberan al especialista <strong className="text-ink">solo cuando confirmas</strong> el avance
          o el cierre del trabajo. Si algo no resulta, tus créditos siguen protegidos.
        </p>
        <ol className="mt-3 grid gap-2 text-sm font-bold text-ink">
          <li>1. Reservas el servicio y tus créditos quedan retenidos.</li>
          <li>2. El especialista realiza el trabajo.</li>
          <li>3. Confirmas el avance o cierre y recien ahi se liberan.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-black text-ink">Que recibe el especialista</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          OficiosPro cobra una comisión de servicio de <strong className="text-ink">{COMMISSION_SHORT_LABEL}</strong>,
          que financia la plataforma, el soporte y el pago protegido. El resto es para el especialista.
        </p>
        <div className="mt-3 grid gap-1 rounded-2xl border border-line bg-white p-4 text-sm font-bold">
          <Row label={`Trabajo de ${PAYOUT_EXAMPLE_CREDITS} créditos`} value={formatCLP(payout.grossCLP)} strong />
          <Row label={`Comisión OficiosPro (${COMMISSION_SHORT_LABEL})`} value={`- ${formatCLP(payout.commissionTotalCLP)}`} muted />
          <div className="my-1 border-t border-line" />
          <Row label="Recibe el especialista" value={formatCLP(payout.specialistCLP)} highlight />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-black text-ink">Con Club Hogar ahorras</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Los socios de Club Hogar pagan <strong className="text-ink">{SUBSCRIBER_DISCOUNT_CREDITS} créditos menos</strong>
          {" "}por solicitud en los servicios incluidos.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value, strong, muted, highlight }: { label: string; value: string; strong?: boolean; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
      <span className={highlight ? "text-base font-black text-brand-dark" : strong ? "font-black text-ink" : muted ? "text-muted" : "text-ink"}>{value}</span>
    </div>
  );
}

/** Modal wrapper around the explanation. */
export function CreditsExplainerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Como funcionan los creditos" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-card sm:my-auto sm:max-h-[85vh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">OficiosPro</p>
            <h2 className="text-2xl font-black text-ink">Como funcionan los créditos</h2>
          </div>
          <button className="rounded-full border border-line px-3 py-1.5 text-sm font-black text-muted hover:text-ink" type="button" onClick={onClose} aria-label="Cerrar">
            Cerrar
          </button>
        </div>
        <CreditsExplainerContent />
      </div>
    </div>
  );
}

/** A trigger (button or link) that opens the explanation modal. */
export function CreditsHelpTrigger({ children, className }: { children?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className ?? "text-sm font-black text-brand-dark underline-offset-2 hover:underline"} onClick={() => setOpen(true)}>
        {children ?? "Como funcionan los creditos"}
      </button>
      <CreditsExplainerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * Floating hero badge ("Precio desde / 30 creditos") that opens the explainer
 * modal on click. Positioned by the `className` passed in (absolute utilities).
 */
export function CreditsHeroBadge({
  className,
  label = "Precio desde",
  value = "30 créditos",
}: {
  className?: string;
  label?: string;
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`absolute rounded-[22px] border border-line bg-white/95 p-4 text-left shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft ${className ?? ""}`}
        aria-label="Como funcionan los creditos"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase text-muted">
          <span className="h-2 w-2 rounded-full bg-brand" />
          {label}
        </span>
        <strong className="mt-1 block text-2xl font-black text-ink">{value}</strong>
        <span className="mt-1 block text-[11px] font-black text-brand-dark">Ver como funciona &rarr;</span>
      </button>
      <CreditsExplainerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * Inline credit price with CLP hint and an info trigger. Drop-in for any place
 * that shows a price in credits.
 */
export function CreditPriceTag({
  credits,
  prefix,
  showClp = true,
  showHelp = true,
  className,
}: {
  credits: number;
  prefix?: string;
  showClp?: boolean;
  showHelp?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const clp = creditsToCLPLabel(credits);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-1 ${className ?? ""}`}>
      <span className="font-black text-ink">{prefix ? `${prefix} ` : ""}{credits} créditos</span>
      {showClp ? <span className="text-xs font-bold text-muted" title={`1 crédito = ${formatCLP(CREDIT_VALUE_CLP)}`}>({clp})</span> : null}
      {showHelp ? (
        <>
          {/* Ícono visual de 16px con área táctil ampliada a 44px (padding + margen
              negativo para no alterar el layout). WCAG 2.5.5 objetivo táctil. */}
          <button
            type="button"
            className="grid place-items-center p-[14px] -m-[14px] text-brand"
            onClick={() => setOpen(true)}
            aria-label="Cómo funcionan los créditos"
            title="1 crédito = $1.000. Pagas los servicios con créditos y tu dinero queda protegido hasta que confirmes el trabajo."
          >
            <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full border border-brand/40 text-[10px] font-black leading-none">
              i
            </span>
          </button>
          <CreditsExplainerModal open={open} onClose={() => setOpen(false)} />
        </>
      ) : null}
    </span>
  );
}
