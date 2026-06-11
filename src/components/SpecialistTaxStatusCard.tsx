"use client";

import { useMemo } from "react";
import { formatCLP } from "@/data/marketplace";
import {
  createSpecialistPayout,
  nowIso,
  specialistTaxStatusSummary,
  type FinanceServiceRequest,
  type SpecialistPayout,
  type SpecialistTaxProfile,
} from "@/lib/finance";

const statusStyles: Record<string, string> = {
  datos_pendientes: "border-sun/40 bg-sun-soft text-sun-dark",
  documento_pendiente: "border-accent/30 bg-accent-soft text-accent-dark",
  pago_bloqueado: "border-rose-200 bg-rose-50 text-rose-700",
  listo: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/**
 * Estado tributario y de pagos del especialista.
 * Mientras no exista perfil tributario durable, recibe el perfil por props;
 * sin props muestra el flujo de un servicio recién completado.
 */
export function SpecialistTaxStatusCard({
  taxProfile,
  payouts,
}: {
  taxProfile?: SpecialistTaxProfile;
  payouts?: SpecialistPayout[];
}) {
  const resolved = useMemo(() => {
    if (taxProfile || payouts) return { taxProfile, payouts: payouts ?? [] };
    const profile: SpecialistTaxProfile = {
      specialistId: "especialista-actual",
      rut: "16.789.123-4",
      legalName: "Especialista OficiosPro",
      taxType: "persona_natural_honorarios",
      canIssueFeeReceipt: true,
      canIssueInvoice: false,
      ivaStatus: "no_aplica",
      retentionApplies: true,
      bankAccount: { bank: "BancoEstado", accountType: "CuentaRUT", accountNumber: "16789123" },
      verifiedByAdmin: true,
      verifiedAt: nowIso(),
    };
    const request: FinanceServiceRequest = {
      id: "sr-actual",
      customerId: "cliente",
      specialistId: profile.specialistId,
      serviceId: "servicio",
      serviceName: "Servicio completado",
      pricingMode: "fixed",
      reservedCredits: 28,
      finalCredits: 28,
      status: "completed",
      taxTreatment: "platform_total_model_a",
      createdAt: nowIso(),
      completedAt: nowIso(),
    };
    return { taxProfile: profile, payouts: [createSpecialistPayout({ request, taxProfile: profile })] };
  }, [taxProfile, payouts]);

  const summary = specialistTaxStatusSummary(resolved);
  const pendingPayout = resolved.payouts.find((item) => item.payoutStatus !== "paid");

  return (
    <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <p className="eyebrow">Pagos y documentos</p>
      <h2 className="text-2xl font-black">Tu estado para recibir pagos</h2>
      <div className={`mt-4 rounded-2xl border p-4 ${statusStyles[summary.status]}`}>
        <strong className="block text-base font-black">{summary.label}</strong>
        <p className="mt-1 text-sm font-bold">{summary.detail}</p>
      </div>
      {pendingPayout ? (
        <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted sm:grid-cols-2">
          <span>Servicio: {pendingPayout.grossServiceCredits} créditos</span>
          <span>Comisión plataforma: {formatCLP(pendingPayout.platformCommissionCLP)}</span>
          <span>Retención estimada: {formatCLP(pendingPayout.withholdingAmountCLP)}</span>
          <span className="text-ink">Te pagaremos: {formatCLP(pendingPayout.netPayoutCLP)}</span>
        </div>
      ) : null}
      <p className="mt-4 rounded-2xl border border-brand/15 bg-brand-soft p-4 text-sm font-bold leading-6 text-brand-dark">
        Para pagarte servicios completados, necesitaremos que emitas boleta de honorarios o factura a OP SpA, según tu situación tributaria.
      </p>
    </article>
  );
}
