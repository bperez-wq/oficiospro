"use client";

import { useMemo, useState } from "react";
import { DashboardMetricCard } from "@/components/DesignSystem";
import { formatCLP } from "@/data/marketplace";
import { shouldShowDemoData } from "@/lib/demoData";
import {
  applySubscriberDiscount,
  blockSpecialistPayout,
  buildReconciliationAlerts,
  confirmPayment,
  createClientTaxDocument,
  createPaymentIntent,
  createPlatformCommissionRecord,
  calculatePlatformCommission,
  createSpecialistPayout,
  createSpecialistTaxDocument,
  emptyFinanceState,
  emptyFinanceWallet,
  generateAccountingReport,
  generateTaxReport,
  issueCredits,
  issueSubscriptionCredits,
  markPaymentRefunded,
  markSpecialistDocumentReceived,
  markSpecialistPayoutPaid,
  markSpecialistPayoutReady,
  nowIso,
  reconcileWebhookEvent,
  releaseCreditsAfterCompletion,
  reserveCreditsForService,
  adminAdjustCredits,
  type AccountingExportType,
  type FinanceState,
  type SpecialistPayout,
} from "@/lib/finance";

type FinanceTab = "pagos" | "creditos" | "suscripciones" | "comisiones" | "liquidaciones" | "documentos" | "reportes" | "alertas";

const financeTabs: { id: FinanceTab; label: string }[] = [
  { id: "pagos", label: "Pagos" },
  { id: "creditos", label: "Créditos" },
  { id: "suscripciones", label: "Suscripciones" },
  { id: "comisiones", label: "Comisiones" },
  { id: "liquidaciones", label: "Liquidaciones" },
  { id: "documentos", label: "Documentos tributarios" },
  { id: "reportes", label: "Reportes contables" },
  { id: "alertas", label: "Alertas" },
];

const currentPeriod = new Date().toISOString().slice(0, 7);

/**
 * Estado financiero inicial del panel, construido con las funciones reales de
 * src/lib/finance para reflejar el flujo completo del periodo en curso.
 * Pendiente de migrar a storage durable (D1/Supabase) en Fase 2.
 */
function buildInitialFinanceState(): FinanceState {
  const state = emptyFinanceState();

  /* 1. Compra de créditos documentada */
  let purchase = createPaymentIntent({
    provider: "mercado_pago",
    type: "credit_pack",
    userId: "paula.valdes@cliente.cl",
    userRole: "client",
    amountCLP: 80000,
    credits: 80,
    buyerRut: "12.345.678-9",
    buyerName: "Paula Valdés",
    buyerEmail: "paula.valdes@cliente.cl",
  });
  purchase = confirmPayment(purchase, { providerPaymentId: "mp-90011" }).intent;
  const purchaseDoc = createClientTaxDocument({ intent: purchase, folio: "BA-1042" });
  purchase = { ...purchase, documentStatus: "issued", relatedTaxDocumentId: purchaseDoc.id };

  let wallet = emptyFinanceWallet(purchase.userId);
  const issued = issueCredits(wallet, {
    userId: purchase.userId,
    credits: purchase.credits,
    relatedPaymentId: purchase.id,
    description: "Compra de 80 créditos",
  });
  wallet = issued.wallet;
  state.ledger.push(issued.entry);

  /* 2. Suscripción Club Hogar */
  let subscriptionIntent = createPaymentIntent({
    provider: "mercado_pago",
    type: "subscription_plan",
    userId: purchase.userId,
    userRole: "client",
    amountCLP: 24990,
    credits: 45,
    buyerRut: purchase.buyerRut,
    buyerName: purchase.buyerName,
  });
  subscriptionIntent = confirmPayment(subscriptionIntent, { providerPaymentId: "mp-90012" }).intent;
  const subscriptionDoc = createClientTaxDocument({ intent: subscriptionIntent, folio: "BA-1043" });
  subscriptionIntent = { ...subscriptionIntent, documentStatus: "issued", relatedTaxDocumentId: subscriptionDoc.id };
  const subIssued = issueSubscriptionCredits(wallet, {
    userId: purchase.userId,
    credits: 45,
    relatedPaymentId: subscriptionIntent.id,
    relatedSubscriptionId: "sub-club-001",
    description: "Créditos mensuales Club Hogar",
  });
  wallet = subIssued.wallet;
  state.ledger.push(subIssued.entry);
  state.subscriptions.push({
    id: "sub-club-001",
    userId: purchase.userId,
    planId: "plus",
    monthlyCredits: 45,
    status: "active",
    billingCycle: "monthly",
    lastBillingAt: nowIso(),
    documentStatus: "issued",
    paymentProvider: "mercado_pago",
  });

  /* 3. Reserva con pago protegido + descuento Club Hogar */
  const request = {
    id: "sr-2026-0144",
    customerId: purchase.userId,
    specialistId: "victor-araya",
    serviceId: "gasfiteria-reparacion",
    serviceName: "Reparación de filtración",
    categoryId: "gasfiteria",
    specialty: "Gasfitería",
    pricingMode: "fixed",
    reservedCredits: 0,
    status: "completed" as const,
    taxTreatment: "platform_total_model_a" as const,
    createdAt: nowIso(),
    completedAt: nowIso(),
  };
  const discount = applySubscriberDiscount(wallet, {
    userId: purchase.userId,
    credits: 2,
    relatedServiceRequestId: request.id,
    description: "Descuento Club Hogar aplicado a la solicitud",
  });
  wallet = discount.wallet;
  state.ledger.push(discount.entry);
  const reservation = reserveCreditsForService(wallet, {
    userId: purchase.userId,
    credits: 28,
    pricingMode: "fixed",
    relatedServiceRequestId: request.id,
    description: "Créditos retenidos por pago protegido",
  });
  wallet = reservation.wallet;
  state.ledger.push(reservation.entry);
  request.reservedCredits = reservation.reservedCredits;

  /* 4. Cierre confirmado, comisión y payout */
  const completion = releaseCreditsAfterCompletion(wallet, {
    userId: purchase.userId,
    credits: request.reservedCredits,
    finalCredits: request.reservedCredits,
    relatedServiceRequestId: request.id,
    description: request.serviceName,
  });
  wallet = completion.wallet;
  state.ledger.push(...completion.entries);

  const finishedRequest = { ...request, finalCredits: completion.capturedCredits };
  const commissionBreakdown = calculatePlatformCommission({ finalCredits: completion.capturedCredits, categoryId: request.categoryId });
  const commission = createPlatformCommissionRecord(finishedRequest, commissionBreakdown);

  const taxProfile = {
    specialistId: "victor-araya",
    rut: "16.789.123-4",
    legalName: "Víctor Mendoza Fuentes",
    taxType: "persona_natural_honorarios" as const,
    canIssueFeeReceipt: true,
    canIssueInvoice: false,
    ivaStatus: "no_aplica" as const,
    retentionApplies: true,
    bankAccount: { bank: "BancoEstado", accountType: "CuentaRUT", accountNumber: "16789123" },
    verifiedByAdmin: true,
    verifiedAt: nowIso(),
  };
  let payout = createSpecialistPayout({ request: finishedRequest, taxProfile });
  const payoutDoc = createSpecialistTaxDocument({
    payout,
    specialistRut: taxProfile.rut,
    specialistLegalName: taxProfile.legalName,
    folio: "BHE-2210",
  });
  payout = markSpecialistPayoutReady(markSpecialistDocumentReceived(payout, payoutDoc.id));

  /* 5. Segundo payout bloqueado por formalización pendiente */
  const pendingProfile = {
    specialistId: "carolina-mendez",
    rut: "",
    legalName: "",
    taxType: "pendiente_formalizacion" as const,
    canIssueFeeReceipt: false,
    canIssueInvoice: false,
    ivaStatus: "por_definir" as const,
    retentionApplies: false,
    verifiedByAdmin: false,
  };
  const blockedPayout = createSpecialistPayout({
    request: {
      ...finishedRequest,
      id: "sr-2026-0151",
      specialistId: "carolina-mendez",
      serviceName: "Normalización de tablero",
      categoryId: "electricidad",
      finalCredits: 36,
    },
    taxProfile: pendingProfile,
  });

  /* 6. Pago aprobado aún sin documento (alerta) + webhook duplicado */
  let pendingDocIntent = createPaymentIntent({
    provider: "mercado_pago",
    type: "credit_pack",
    userId: "martin.leiva@empresa.cl",
    userRole: "company",
    amountCLP: 150000,
    credits: 150,
    buyerRut: "76.222.333-4",
    buyerName: "Operaciones Retail SpA",
  });
  pendingDocIntent = confirmPayment(pendingDocIntent, { providerPaymentId: "mp-90044" }).intent;

  let webhookEvents = reconcileWebhookEvent(state.webhookEvents, {
    provider: "mercado_pago",
    providerEventId: "evt-771",
    providerPaymentId: "mp-90044",
    type: "payment.approved",
  }).events;
  webhookEvents = reconcileWebhookEvent(webhookEvents, {
    provider: "mercado_pago",
    providerEventId: "evt-771",
    providerPaymentId: "mp-90044",
    type: "payment.approved",
  }).events;

  /* 7. Reembolso que exige nota de crédito */
  let refundIntent = createPaymentIntent({
    provider: "mercado_pago",
    type: "credit_pack",
    userId: "jorge.soto@cliente.cl",
    userRole: "client",
    amountCLP: 30000,
    credits: 30,
    buyerRut: "9.876.543-2",
    buyerName: "Jorge Soto",
  });
  refundIntent = confirmPayment(refundIntent, { providerPaymentId: "mp-90031" }).intent;
  const refundDoc = createClientTaxDocument({ intent: refundIntent, folio: "BA-1031" });
  refundIntent = markPaymentRefunded({ ...refundIntent, documentStatus: "issued", relatedTaxDocumentId: refundDoc.id });

  state.paymentIntents.push(purchase, subscriptionIntent, pendingDocIntent, refundIntent);
  state.wallets.push(wallet);
  state.serviceRequests.push(finishedRequest, { ...finishedRequest, id: "sr-2026-0151", specialistId: "carolina-mendez", serviceName: "Normalización de tablero", categoryId: "electricidad" });
  state.taxProfiles.push(taxProfile, pendingProfile);
  state.payouts.push(payout, blockedPayout);
  state.commissions.push(commission);
  state.taxDocuments.push(purchaseDoc, subscriptionDoc, payoutDoc, refundDoc);
  state.webhookEvents = webhookEvents;
  return state;
}

export function AdminFinancePanel() {
  const [tab, setTab] = useState<FinanceTab>("pagos");
  const [state, setState] = useState<FinanceState>(() => (shouldShowDemoData() ? buildInitialFinanceState() : emptyFinanceState()));
  const [feedback, setFeedback] = useState("");
  const [adjustment, setAdjustment] = useState({ userId: "", credits: 0, reason: "" });

  const alerts = useMemo(() => buildReconciliationAlerts(state), [state]);
  const taxSummary = useMemo(() => generateTaxReport(state, currentPeriod), [state]);
  const approvedThisMonth = state.paymentIntents.filter((item) => item.status === "approved" && item.createdAt.startsWith(currentPeriod));
  const issuedCredits = state.ledger
    .filter((item) => item.type === "credits_purchased" || item.type === "subscription_credits_issued")
    .reduce((total, item) => total + Math.abs(item.amountCredits), 0);
  const reservedCredits = state.wallets.reduce((total, item) => total + item.reservedCredits, 0);
  const pendingPayouts = state.payouts.filter((item) => item.payoutStatus !== "paid");
  const pendingDocs = state.payouts.filter((item) => item.specialistDocumentStatus === "pending");
  const failedWebhooks = state.webhookEvents.filter((item) => item.duplicate);

  function updatePayout(payoutId: string, updater: (payout: SpecialistPayout) => SpecialistPayout, message: string) {
    setState((current) => ({
      ...current,
      payouts: current.payouts.map((item) => (item.id === payoutId ? updater(item) : item)),
    }));
    setFeedback(message);
  }

  function exportReport(type: AccountingExportType) {
    const report = generateAccountingReport(state, currentPeriod, type);
    setState((current) => ({ ...current, exports: [report.export, ...current.exports] }));
    if (typeof window !== "undefined" && report.csv) {
      const blob = new Blob([report.csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `oficiospro-${type}-${currentPeriod}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    setFeedback(`Reporte ${type} generado (${report.export.rowCount} filas).`);
  }

  function registerAdjustment() {
    if (!adjustment.userId || !adjustment.credits || !adjustment.reason) {
      setFeedback("Para registrar un ajuste manual indica usuario, créditos y motivo.");
      return;
    }
    setState((current) => {
      const wallet = current.wallets.find((item) => item.userId === adjustment.userId) ?? emptyFinanceWallet(adjustment.userId);
      const result = adminAdjustCredits(wallet, {
        userId: adjustment.userId,
        credits: adjustment.credits,
        description: `Ajuste manual admin: ${adjustment.reason}`,
      });
      return {
        ...current,
        wallets: [result.wallet, ...current.wallets.filter((item) => item.userId !== adjustment.userId)],
        ledger: [result.entry, ...current.ledger],
      };
    });
    setFeedback(`Ajuste de ${adjustment.credits} créditos registrado en el ledger.`);
    setAdjustment({ userId: "", credits: 0, reason: "" });
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard label="Pagos aprobados del mes" value={approvedThisMonth.length.toString()} detail={formatCLP(approvedThisMonth.reduce((total, item) => total + item.amountCLP, 0))} tone="brand" />
        <DashboardMetricCard label="Créditos emitidos" value={issuedCredits.toString()} detail={`${reservedCredits} retenidos por pago protegido`} />
        <DashboardMetricCard label="Comisión OficiosPro" value={formatCLP(state.commissions.reduce((total, item) => total + item.commissionCLP, 0))} detail={`Comisión registrada ${formatCLP(taxSummary.grossMarginCLP)}`} />
        <DashboardMetricCard label="Payouts pendientes" value={pendingPayouts.length.toString()} detail={`${pendingDocs.length} documentos pendientes · ${alerts.length} alertas`} />
      </div>

      <div className="flex flex-wrap gap-2">
        {financeTabs.map((item) => (
          <button
            key={item.id}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${tab === item.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-slate-100 text-muted hover:bg-brand-soft hover:text-brand-dark"}`}
            type="button"
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === "alertas" && alerts.length ? <span className="ml-1.5 rounded-full bg-white/80 px-1.5 text-[11px] text-rose-600">{alerts.length}</span> : null}
          </button>
        ))}
      </div>

      {feedback ? <p className="rounded-2xl border border-brand/20 bg-brand-soft p-4 text-sm font-black text-brand-dark">{feedback}</p> : null}

      {tab === "pagos" ? (
        <FinanceTable
          title="Payment intents"
          headers={["Pago", "Cliente", "Tipo", "Monto", "Estado", "Documento"]}
          rows={state.paymentIntents.map((item) => [
            item.providerPaymentId ?? item.id,
            item.buyerName ?? item.userId,
            item.type,
            formatCLP(item.amountCLP),
            item.status,
            item.documentStatus,
          ])}
          footnote="Cada pago aprobado debe terminar con documento emitido o nota de crédito. Conciliación contra Mercado Pago en la pestaña Alertas."
        />
      ) : null}

      {tab === "creditos" ? (
        <div className="grid gap-4">
          <FinanceTable
            title="Ledger de créditos"
            headers={["Movimiento", "Usuario", "Tipo", "Créditos", "Saldo", "Referencia"]}
            rows={state.ledger.map((item) => [
              item.createdAt.slice(0, 10),
              item.userId,
              item.type,
              item.amountCredits.toString(),
              item.balanceAfter.toString(),
              item.relatedServiceRequestId ?? item.relatedPaymentId ?? "—",
            ])}
            footnote="Todo movimiento de créditos queda en el ledger con saldo posterior y referencia a pago o solicitud."
          />
          <div className="rounded-[24px] border border-line bg-white p-5">
            <p className="eyebrow">Ajuste manual</p>
            <h3 className="text-xl font-black">Registrar ajuste de créditos</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="field">
                Usuario
                <input value={adjustment.userId} onChange={(event) => setAdjustment({ ...adjustment, userId: event.target.value })} placeholder="email del usuario" />
              </label>
              <label className="field">
                Créditos (+/−)
                <input type="number" value={adjustment.credits || ""} onChange={(event) => setAdjustment({ ...adjustment, credits: Number(event.target.value) })} />
              </label>
              <label className="field">
                Motivo
                <input value={adjustment.reason} onChange={(event) => setAdjustment({ ...adjustment, reason: event.target.value })} placeholder="obligatorio para auditoría" />
              </label>
            </div>
            <button className="btn-secondary mt-4" type="button" onClick={registerAdjustment}>
              Registrar ajuste en ledger
            </button>
          </div>
        </div>
      ) : null}

      {tab === "suscripciones" ? (
        <FinanceTable
          title="Suscripciones Club Hogar"
          headers={["Suscripción", "Usuario", "Plan", "Créditos/mes", "Estado", "Documento"]}
          rows={state.subscriptions.map((item) => [item.id, item.userId, item.planId, item.monthlyCredits.toString(), item.status, item.documentStatus])}
          footnote="Cada cobro mensual debe generar documento al cliente y emisión de créditos en el ledger."
        />
      ) : null}

      {tab === "comisiones" ? (
        <FinanceTable
          title="Comisiones de plataforma"
          headers={["Comisión", "Solicitud", "Especialista", "Tasa", "Comisión CLP", "IVA estimado"]}
          rows={state.commissions.map((item) => [
            item.id,
            item.serviceRequestId,
            item.specialistId,
            `${Math.round(item.commissionRate * 100)}%`,
            formatCLP(item.commissionCLP),
            formatCLP(item.ivaAmount),
          ])}
          footnote="La Comisión OficiosPro estándar es 9,5% + IVA en el modelo de formalización. Tratamiento tributario final por validar con contador."
        />
      ) : null}

      {tab === "liquidaciones" ? (
        <div className="grid gap-4">
          {state.payouts.map((payout) => (
            <article key={payout.id} className="rounded-[24px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong className="block text-lg font-black">{payout.specialistId}</strong>
                  <span className="text-sm font-bold text-muted">{payout.serviceRequestId} · {payout.grossServiceCredits} créditos</span>
                </div>
                <span className={`chip ${payout.payoutStatus === "paid" ? "bg-emerald-50 text-emerald-700" : payout.payoutStatus === "blocked" ? "bg-rose-50 text-rose-700" : "bg-sun-soft text-sun-dark"}`}>
                  {payout.payoutStatus === "paid" ? "Pagado" : payout.payoutStatus === "blocked" ? "Bloqueado" : payout.payoutStatus === "ready_to_pay" ? "Listo para pagar" : "Pendiente"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm font-bold text-muted sm:grid-cols-2 lg:grid-cols-5">
                <span>Bruto: {formatCLP(payout.grossServiceCLP)}</span>
                <span>Comisión: {formatCLP(payout.platformCommissionCLP)}</span>
                <span>Retención: {formatCLP(payout.withholdingAmountCLP)}</span>
                <span className="text-ink">Neto a pagar: {formatCLP(payout.netPayoutCLP)}</span>
                <span>Documento: {payout.requiredDocumentType.replace(/_/g, " ")} ({payout.specialistDocumentStatus})</span>
              </div>
              {payout.blockedReason ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{payout.blockedReason}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {payout.specialistDocumentStatus === "pending" && payout.requiredDocumentType !== "none" ? (
                  <button className="btn-secondary min-h-11 px-4 text-sm" type="button" onClick={() => updatePayout(payout.id, (item) => markSpecialistDocumentReceived(item, `doc-manual-${payout.id}`), "Documento marcado como recibido.")}>
                    Marcar documento recibido
                  </button>
                ) : null}
                {payout.payoutStatus === "pending" && payout.specialistDocumentStatus === "received" ? (
                  <button className="btn-secondary min-h-11 px-4 text-sm" type="button" onClick={() => updatePayout(payout.id, markSpecialistPayoutReady, "Payout validado y listo para pagar.")}>
                    Aprobar payout
                  </button>
                ) : null}
                {payout.payoutStatus === "ready_to_pay" ? (
                  <button className="btn-primary min-h-11 px-4 text-sm" type="button" onClick={() => updatePayout(payout.id, markSpecialistPayoutPaid, "Payout marcado como pagado.")}>
                    Marcar pagado
                  </button>
                ) : null}
                {payout.payoutStatus !== "paid" && payout.payoutStatus !== "blocked" ? (
                  <button className="min-h-11 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50" type="button" onClick={() => updatePayout(payout.id, (item) => blockSpecialistPayout(item, "Bloqueado manualmente por admin"), "Payout bloqueado.")}>
                    Bloquear payout
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "documentos" ? (
        <FinanceTable
          title="Documentos tributarios"
          headers={["Documento", "Emisor", "Tipo", "Folio", "Monto", "Retención", "Estado"]}
          rows={state.taxDocuments.map((item) => [
            item.id,
            item.issuerType === "op_spa" ? "OP SpA" : item.issuerRut,
            item.documentType.replace(/_/g, " "),
            item.folio ?? "pendiente",
            formatCLP(item.amountCLP),
            formatCLP(item.retentionAmountCLP),
            item.status,
          ])}
          footnote="Boletas/facturas de OP SpA al cliente y documentos de especialistas a OP SpA. La emisión electrónica (DTE) se integra en Fase 3."
        />
      ) : null}

      {tab === "reportes" ? (
        <div className="rounded-[24px] border border-line bg-white p-5">
          <p className="eyebrow">Cierre {currentPeriod}</p>
          <h3 className="text-xl font-black">Reportes contables del periodo</h3>
          <div className="mt-4 grid gap-2 text-sm font-bold text-muted sm:grid-cols-2 lg:grid-cols-4">
            <span>Ventas: {formatCLP(taxSummary.salesTotalCLP)}</span>
            <span>IVA débito estimado: {formatCLP(taxSummary.ivaDebitEstimatedCLP)}</span>
            <span>Retenciones honorarios: {formatCLP(taxSummary.honorariosRetentionToDeclareCLP)}</span>
            <span className="text-ink">Comisión registrada: {formatCLP(taxSummary.grossMarginCLP)}</span>
          </div>
          <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-muted">{taxSummary.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["sales", "credit_movements", "payouts", "commissions", "tax_documents"] as AccountingExportType[]).map((type) => (
              <button key={type} className="btn-secondary min-h-11 px-4 text-sm" type="button" onClick={() => exportReport(type)}>
                Exportar {type.replace(/_/g, " ")} (CSV)
              </button>
            ))}
          </div>
          {state.exports.length ? (
            <p className="mt-4 text-sm font-bold text-muted">
              Último export: {state.exports[0].type} · {state.exports[0].rowCount} filas · {state.exports[0].generatedAt.slice(0, 16).replace("T", " ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "alertas" ? (
        <div className="grid gap-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <article key={alert.id} className={`rounded-2xl border p-4 ${alert.severity === "critical" ? "border-rose-200 bg-rose-50" : alert.severity === "warning" ? "border-sun/40 bg-sun-soft" : "border-line bg-slate-50"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm font-black text-ink">{alert.type.replace(/_/g, " ")}</strong>
                  <span className="text-xs font-black uppercase text-muted">{alert.severity}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-muted">{alert.detail}</p>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-line bg-white p-5 text-sm font-bold text-muted">Sin alertas de conciliación en el periodo.</p>
          )}
          <p className="text-xs font-bold text-muted">Webhooks duplicados ignorados: {failedWebhooks.length}. La idempotencia se valida por providerEventId y providerPaymentId.</p>
        </div>
      ) : null}
    </section>
  );
}

function FinanceTable({ title, headers, rows, footnote }: { title: string; headers: string[]; rows: string[][]; footnote?: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white">
      <div className="border-b border-line p-5">
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-black uppercase text-muted">
              {headers.map((header) => (
                <th key={header} className="px-5 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-line/60 font-bold text-ink">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? <p className="border-t border-line bg-slate-50 px-5 py-3 text-xs font-bold text-muted">{footnote}</p> : null}
    </div>
  );
}
