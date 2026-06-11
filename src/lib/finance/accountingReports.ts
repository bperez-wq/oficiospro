/**
 * Reportes contables y tributarios para admin/contabilidad.
 *
 * Genera estructuras tipadas + CSV (sin dependencias externas). La integración
 * con SII/DTE/ERP NO está implementada: la arquitectura queda preparada vía
 * AccountingExport y tax_documents (ver docs/accounting-reporting-spec.md).
 */

import { buildReconciliationAlerts } from "@/lib/finance/taxDocuments";
import {
  financeId,
  nowIso,
  type AccountingExport,
  type AccountingExportType,
  type FinanceState,
  type ReconciliationAlert,
} from "@/lib/finance/types";

/* ------------------------------------------------------------------ */
/* Utilidades                                                           */
/* ------------------------------------------------------------------ */

/** Filtra registros por periodo contable YYYY-MM usando un campo de fecha ISO. */
function inPeriod(dateIso: string | undefined, period: string) {
  return Boolean(dateIso && dateIso.startsWith(period));
}

export function toCSV(rows: Array<Record<string, string | number | undefined>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | undefined) => {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(";"), ...rows.map((row) => headers.map((header) => escape(row[header])).join(";"))].join("\n");
}

/* ------------------------------------------------------------------ */
/* A. Ventas OP SpA                                                     */
/* ------------------------------------------------------------------ */

export function salesReport(state: FinanceState, period: string) {
  const approved = state.paymentIntents.filter((item) => item.status === "approved" && inPeriod(item.createdAt, period));
  const byType = (type: string) => approved.filter((item) => item.type === type);
  const sum = (items: { amountCLP: number }[]) => items.reduce((total, item) => total + item.amountCLP, 0);
  const sumIva = (items: { ivaAmountCLP?: number }[]) => items.reduce((total, item) => total + (item.ivaAmountCLP ?? 0), 0);
  const issuedDocs = state.taxDocuments.filter((item) => item.issuerType === "op_spa" && item.status === "issued" && inPeriod(item.issuedAt, period));

  return {
    period,
    creditPackSalesCLP: sum(byType("credit_pack")),
    subscriptionSalesCLP: sum(byType("subscription_plan")),
    additionalChargesCLP: sum([...byType("additional_charge"), ...byType("visit_fee"), ...byType("quote_acceptance"), ...byType("service_reservation")]),
    totalSalesCLP: sum(approved),
    estimatedIvaDebitCLP: sumIva(approved),
    documentsIssued: issuedDocs.length,
    documentsPending: approved.filter((item) => item.documentStatus === "pending").length,
    rows: approved.map((item) => ({
      paymentId: item.id,
      fecha: item.createdAt.slice(0, 10),
      tipo: item.type,
      cliente: item.buyerName ?? item.userId,
      rut: item.buyerRut ?? "",
      montoCLP: item.amountCLP,
      netoCLP: item.netAmountCLP ?? 0,
      ivaCLP: item.ivaAmountCLP ?? 0,
      creditos: item.credits,
      estadoDocumento: item.documentStatus,
    })),
  };
}

/* ------------------------------------------------------------------ */
/* B. Uso de créditos                                                   */
/* ------------------------------------------------------------------ */

export function creditMovementsReport(state: FinanceState, period: string) {
  const entries = state.ledger.filter((item) => inPeriod(item.createdAt, period));
  const sumType = (...types: string[]) =>
    entries.filter((item) => types.includes(item.type)).reduce((total, item) => total + Math.abs(item.amountCredits), 0);

  return {
    period,
    issued: sumType("credits_purchased", "subscription_credits_issued", "referral_bonus"),
    used: sumType("credits_released"),
    reserved: sumType("credits_reserved"),
    expired: sumType("credits_expired"),
    refunded: sumType("credits_refunded"),
    discounts: sumType("service_discount"),
    /** Pasivo estimado: créditos vivos en wallets (deuda de servicio con clientes). */
    outstandingLiabilityCredits: state.wallets.reduce((total, wallet) => total + wallet.availableCredits + wallet.reservedCredits, 0),
    rows: entries.map((item) => ({
      id: item.id,
      fecha: item.createdAt.slice(0, 10),
      usuario: item.userId,
      tipo: item.type,
      creditos: item.amountCredits,
      saldoPosterior: item.balanceAfter,
      pagoRelacionado: item.relatedPaymentId ?? "",
      solicitudRelacionada: item.relatedServiceRequestId ?? "",
      descripcion: item.description,
    })),
  };
}

/* ------------------------------------------------------------------ */
/* C. Especialistas y payouts                                           */
/* ------------------------------------------------------------------ */

export function payoutsReport(state: FinanceState, period: string) {
  const payouts = state.payouts.filter((item) => inPeriod(item.createdAt, period) || inPeriod(item.paidAt, period));
  const sum = (selector: (p: (typeof payouts)[number]) => number, filter?: (p: (typeof payouts)[number]) => boolean) =>
    payouts.filter(filter ?? (() => true)).reduce((total, item) => total + selector(item), 0);

  return {
    period,
    completedServices: payouts.length,
    grossPayoutCLP: sum((item) => item.specialistPayoutCLP),
    platformCommissionCLP: sum((item) => item.platformCommissionCLP),
    withholdingCLP: sum((item) => item.withholdingAmountCLP),
    netPayableCLP: sum((item) => item.netPayoutCLP),
    paidCLP: sum((item) => item.netPayoutCLP, (item) => item.payoutStatus === "paid"),
    pendingPayouts: payouts.filter((item) => item.payoutStatus === "pending" || item.payoutStatus === "ready_to_pay").length,
    blockedPayouts: payouts.filter((item) => item.payoutStatus === "blocked").length,
    pendingDocuments: payouts.filter((item) => item.specialistDocumentStatus === "pending").length,
    rows: payouts.map((item) => ({
      payoutId: item.id,
      especialista: item.specialistId,
      solicitud: item.serviceRequestId,
      brutoCLP: item.grossServiceCLP,
      comisionCLP: item.platformCommissionCLP,
      payoutCLP: item.specialistPayoutCLP,
      retencionCLP: item.withholdingAmountCLP,
      netoCLP: item.netPayoutCLP,
      documentoRequerido: item.requiredDocumentType,
      estadoDocumento: item.specialistDocumentStatus,
      estadoPago: item.payoutStatus,
      pagadoEl: item.paidAt?.slice(0, 10) ?? "",
    })),
  };
}

/* ------------------------------------------------------------------ */
/* D. Comisiones                                                        */
/* ------------------------------------------------------------------ */

export function commissionsReport(state: FinanceState, period: string) {
  const commissions = state.commissions.filter((item) => inPeriod(item.createdAt, period));
  const requestById = new Map(state.serviceRequests.map((item) => [item.id, item]));
  const groupSum = (key: (c: (typeof commissions)[number]) => string) => {
    const map = new Map<string, number>();
    for (const item of commissions) map.set(key(item), (map.get(key(item)) ?? 0) + item.commissionCLP);
    return [...map.entries()].map(([group, totalCLP]) => ({ group, totalCLP })).sort((a, b) => b.totalCLP - a.totalCLP);
  };

  return {
    period,
    totalCommissionCLP: commissions.reduce((total, item) => total + item.commissionCLP, 0),
    totalIvaCLP: commissions.reduce((total, item) => total + item.ivaAmount, 0),
    byCategory: groupSum((item) => requestById.get(item.serviceRequestId)?.categoryId ?? "sin-categoria"),
    bySpecialist: groupSum((item) => item.specialistId),
    rows: commissions.map((item) => ({
      id: item.id,
      solicitud: item.serviceRequestId,
      especialista: item.specialistId,
      cliente: item.customerId,
      comisionCLP: item.commissionCLP,
      comisionCreditos: item.commissionCredits,
      tasa: item.commissionRate,
      ivaCLP: item.ivaAmount,
      fecha: item.createdAt.slice(0, 10),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* E. Documentos tributarios                                            */
/* ------------------------------------------------------------------ */

export function taxDocumentsReport(state: FinanceState, period: string) {
  const documents = state.taxDocuments.filter((item) => inPeriod(item.issuedAt ?? "", period) || item.status === "pending");
  return {
    period,
    issued: documents.filter((item) => item.status === "issued" || item.status === "received").length,
    pending: documents.filter((item) => item.status === "pending").length,
    creditNotes: documents.filter((item) => item.documentType === "nota_credito").length,
    rows: documents.map((item) => ({
      id: item.id,
      emisor: item.issuerType,
      rutEmisor: item.issuerRut,
      rutReceptor: item.receiverRut,
      tipo: item.documentType,
      folio: item.folio ?? "",
      montoCLP: item.amountCLP,
      netoCLP: item.netAmountCLP,
      ivaCLP: item.ivaAmountCLP,
      retencionCLP: item.retentionAmountCLP,
      estado: item.status,
      emitidoEl: item.issuedAt?.slice(0, 10) ?? "",
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Generadores                                                          */
/* ------------------------------------------------------------------ */

export type AccountingReportResult = {
  export: AccountingExport;
  csv: string;
  summary: Record<string, number | string>;
};

export function generateAccountingReport(state: FinanceState, period: string, type: AccountingExportType): AccountingReportResult {
  let rows: Array<Record<string, string | number | undefined>> = [];
  let summary: Record<string, number | string> = { period };

  if (type === "sales") {
    const report = salesReport(state, period);
    rows = report.rows;
    summary = { period, totalSalesCLP: report.totalSalesCLP, estimatedIvaDebitCLP: report.estimatedIvaDebitCLP, documentsPending: report.documentsPending };
  } else if (type === "credit_movements") {
    const report = creditMovementsReport(state, period);
    rows = report.rows;
    summary = { period, issued: report.issued, used: report.used, reserved: report.reserved, outstandingLiabilityCredits: report.outstandingLiabilityCredits };
  } else if (type === "payouts") {
    const report = payoutsReport(state, period);
    rows = report.rows;
    summary = { period, netPayableCLP: report.netPayableCLP, blockedPayouts: report.blockedPayouts, pendingDocuments: report.pendingDocuments };
  } else if (type === "commissions") {
    const report = commissionsReport(state, period);
    rows = report.rows;
    summary = { period, totalCommissionCLP: report.totalCommissionCLP, totalIvaCLP: report.totalIvaCLP };
  } else {
    const report = taxDocumentsReport(state, period);
    rows = report.rows;
    summary = { period, issued: report.issued, pending: report.pending, creditNotes: report.creditNotes };
  }

  return {
    export: { id: financeId("exp"), period, type, status: "ready", generatedAt: nowIso(), rowCount: rows.length },
    csv: toCSV(rows),
    summary,
  };
}

/** Reporte tributario consolidado del periodo (base para contador / futuro F29). */
export function generateTaxReport(state: FinanceState, period: string) {
  const sales = salesReport(state, period);
  const payouts = payoutsReport(state, period);
  const documents = taxDocumentsReport(state, period);
  return {
    period,
    ivaDebitEstimatedCLP: sales.estimatedIvaDebitCLP,
    honorariosRetentionToDeclareCLP: payouts.withholdingCLP,
    salesTotalCLP: sales.totalSalesCLP,
    specialistCostsCLP: payouts.grossPayoutCLP,
    grossMarginCLP: sales.totalSalesCLP - payouts.grossPayoutCLP,
    documentsPending: documents.pending,
    creditNotesIssued: documents.creditNotes,
    note: "Cifras estimadas para revisión del contador. No constituye declaración de impuestos.",
  };
}

export function reconciliationReport(state: FinanceState): { alerts: ReconciliationAlert[]; critical: number; warnings: number } {
  const alerts = buildReconciliationAlerts(state);
  return {
    alerts,
    critical: alerts.filter((item) => item.severity === "critical").length,
    warnings: alerts.filter((item) => item.severity === "warning").length,
  };
}
