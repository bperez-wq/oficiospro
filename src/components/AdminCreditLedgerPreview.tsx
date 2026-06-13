import { demoCreditLedgerEvents } from "@/lib/creditLedger";
import {
  calculateAvailableCredits,
  calculateOutstandingLiability,
  calculatePlatformFeeEstimate,
  calculateRedeemedCredits,
  calculateReservedCredits,
} from "@/lib/creditLedger";
import { formatCLP } from "@/lib/pricing";
import { shouldShowDemoData } from "@/lib/demoData";

export function AdminCreditLedgerPreview() {
  const events = shouldShowDemoData() ? demoCreditLedgerEvents : [];
  const purchased = events.filter((event) => event.type === "credit_purchased").reduce((sum, event) => sum + event.credits, 0);
  const available = calculateAvailableCredits(events);
  const reserved = calculateReservedCredits(events);
  const redeemed = calculateRedeemedCredits(events);
  const payoutPending = events.filter((event) => event.type === "credit_redeemed").reduce((sum, event) => sum + (event.specialistPayoutCLP ?? 0), 0);
  const estimatedMargin = events
    .filter((event) => event.type === "credit_redeemed")
    .reduce((sum, event) => sum + calculatePlatformFeeEstimate({ credits: event.credits, specialistPayoutCLP: event.specialistPayoutCLP ?? 0 }), 0);
  const pendingDocuments = events.filter((event) => event.taxDocumentStatus === "boleta_pending" || event.taxDocumentStatus === "invoice_pending").length;

  return (
    <article className="rounded-[24px] border border-brand/15 bg-brand-soft p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Ledger interno</p>
          <h3 className="text-xl font-black text-ink">Vista preliminar de créditos, margen y documentos.</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
            El cliente ve créditos. El admin revisa CLP, payout especialista, margen estimado y documentación tributaria pendiente.
          </p>
        </div>
        <span className="chip bg-white text-brand-dark">No público</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Créditos comprados" value={`${purchased}`} />
        <Metric label="Créditos disponibles" value={`${available}`} />
        <Metric label="Créditos reservados" value={`${reserved}`} />
        <Metric label="Créditos usados" value={`${redeemed}`} />
        <Metric label="Payout pendiente" value={formatCLP(payoutPending)} />
        <Metric label="Margen estimado" value={formatCLP(estimatedMargin)} />
        <Metric label="Documentos pendientes" value={`${pendingDocuments}`} />
        <Metric label="Saldo no utilizado" value={`${calculateOutstandingLiability(events)} créditos`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-xl text-ink">{value}</strong>
    </div>
  );
}
