/**
 * Documentos tributarios y ciclo de vida de pagos.
 *
 * Reglas duras implementadas:
 * - Todo pago aprobado debe tener documento emitido o estado pendiente trazable (regla 10).
 * - No se duplican créditos si el webhook llega dos veces (regla 7): idempotencia por providerPaymentId/eventId.
 * - Un reembolso exige nota de crédito (documentStatus = credit_note_required).
 */

import { OP_SPA, resolveClientDocumentType, splitNetAndIva } from "@/lib/finance/taxModel";
import {
  financeId,
  nowIso,
  type DocumentIssueStatus,
  type FinancePaymentIntent,
  type FinanceState,
  type PaymentIntentType,
  type PaymentProvider,
  type ReconciliationAlert,
  type SpecialistPayout,
  type TaxDocument,
  type TaxDocumentType,
  type UserRole,
  type WebhookEventRecord,
} from "@/lib/finance/types";

/* ------------------------------------------------------------------ */
/* Ciclo de vida del payment intent                                     */
/* ------------------------------------------------------------------ */

export function createPaymentIntent({
  provider,
  type,
  userId,
  userRole,
  amountCLP,
  credits,
  buyerRut,
  buyerName,
  buyerEmail,
  externalReference,
  metadata = {},
}: {
  provider: PaymentProvider;
  type: PaymentIntentType;
  userId: string;
  userRole: UserRole;
  amountCLP: number;
  credits: number;
  buyerRut?: string;
  buyerName?: string;
  buyerEmail?: string;
  externalReference?: string;
  metadata?: Record<string, unknown>;
}): FinancePaymentIntent {
  const { netAmountCLP, ivaAmountCLP } = splitNetAndIva(amountCLP);
  return {
    id: financeId("pi"),
    provider,
    type,
    userId,
    userRole,
    amountCLP: Math.max(0, Math.round(amountCLP)),
    netAmountCLP,
    ivaAmountCLP,
    credits: Math.max(0, Math.round(credits)),
    currency: "CLP",
    status: "pending",
    documentStatus: "pending",
    buyerRut,
    buyerName,
    buyerEmail,
    externalReference,
    metadata,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/**
 * Confirma un pago aprobado por el proveedor. Idempotente: si el intent ya está
 * aprobado con el mismo providerPaymentId, devuelve el mismo objeto sin duplicar.
 */
export function confirmPayment(
  intent: FinancePaymentIntent,
  { providerPaymentId }: { providerPaymentId: string },
): { intent: FinancePaymentIntent; alreadyConfirmed: boolean } {
  if (intent.status === "approved" && intent.providerPaymentId === providerPaymentId) {
    return { intent, alreadyConfirmed: true };
  }
  return {
    intent: { ...intent, status: "approved", providerPaymentId, updatedAt: nowIso() },
    alreadyConfirmed: false,
  };
}

export function markPaymentRefunded(intent: FinancePaymentIntent): FinancePaymentIntent {
  return {
    ...intent,
    status: "refunded",
    documentStatus: intent.documentStatus === "issued" ? "credit_note_required" : "cancelled",
    updatedAt: nowIso(),
  };
}

/* ------------------------------------------------------------------ */
/* Emisión de documentos                                                */
/* ------------------------------------------------------------------ */

/** Documento de OP SpA al cliente por compra de créditos, suscripción o adicional. */
export function createClientTaxDocument({
  intent,
  hasCompanyBilling = false,
  folio,
}: {
  intent: FinancePaymentIntent;
  hasCompanyBilling?: boolean;
  folio?: string;
}): TaxDocument {
  const documentType = resolveClientDocumentType(intent.userRole, hasCompanyBilling);
  const { netAmountCLP, ivaAmountCLP } = splitNetAndIva(intent.amountCLP);
  return {
    id: financeId("doc"),
    issuerType: "op_spa",
    issuerRut: OP_SPA.rut,
    receiverRut: intent.buyerRut ?? "",
    receiverName: intent.buyerName ?? intent.userId,
    documentType,
    folio,
    amountCLP: intent.amountCLP,
    netAmountCLP,
    ivaAmountCLP,
    retentionAmountCLP: 0,
    relatedPaymentId: intent.id,
    status: folio ? "issued" : "pending",
    issuedAt: folio ? nowIso() : undefined,
    metadata: { paymentType: intent.type },
  };
}

/** Documento del especialista a OP SpA que respalda la liquidación. */
export function createSpecialistTaxDocument({
  payout,
  specialistRut,
  specialistLegalName,
  folio,
}: {
  payout: SpecialistPayout;
  specialistRut: string;
  specialistLegalName: string;
  folio?: string;
}): TaxDocument {
  const documentType: TaxDocumentType =
    payout.requiredDocumentType === "none" ? "comprobante_interno" : payout.requiredDocumentType;
  const isAfecta = documentType === "factura_afecta";
  const { netAmountCLP, ivaAmountCLP } = isAfecta
    ? splitNetAndIva(payout.specialistPayoutCLP)
    : { netAmountCLP: payout.specialistPayoutCLP, ivaAmountCLP: 0 };
  return {
    id: financeId("doc"),
    issuerType: "specialist",
    issuerRut: specialistRut,
    receiverRut: OP_SPA.rut,
    receiverName: OP_SPA.legalName,
    documentType,
    folio,
    amountCLP: payout.specialistPayoutCLP,
    netAmountCLP,
    ivaAmountCLP,
    retentionAmountCLP: payout.withholdingAmountCLP,
    relatedServiceRequestId: payout.serviceRequestId,
    relatedPayoutId: payout.id,
    status: folio ? "received" : "pending",
    issuedAt: folio ? nowIso() : undefined,
    metadata: { specialistLegalName },
  };
}

/** Nota de crédito por reembolso de un documento emitido. */
export function createCreditNote(original: TaxDocument, reason: string): TaxDocument {
  return {
    ...original,
    id: financeId("nc"),
    documentType: "nota_credito",
    folio: undefined,
    status: "pending",
    issuedAt: undefined,
    metadata: { ...original.metadata, creditNoteFor: original.id, reason },
  };
}

export function documentStatusForIntent(intent: FinancePaymentIntent, documents: TaxDocument[]): DocumentIssueStatus {
  const doc = documents.find((item) => item.relatedPaymentId === intent.id && item.documentType !== "nota_credito");
  if (!doc) return intent.amountCLP > 0 ? "pending" : "not_required";
  if (intent.status === "refunded") return "credit_note_required";
  if (doc.status === "issued" || doc.status === "received") return "issued";
  if (doc.status === "cancelled") return "cancelled";
  return "pending";
}

/* ------------------------------------------------------------------ */
/* Conciliación e idempotencia                                          */
/* ------------------------------------------------------------------ */

/**
 * Registra un evento de webhook. Devuelve duplicate=true si el providerEventId
 * (o el providerPaymentId para eventos de pago) ya fue procesado.
 */
export function reconcileWebhookEvent(
  events: WebhookEventRecord[],
  incoming: { provider: PaymentProvider; providerEventId: string; providerPaymentId?: string; type: string },
): { events: WebhookEventRecord[]; record: WebhookEventRecord } {
  const duplicate = events.some(
    (item) =>
      item.provider === incoming.provider &&
      (item.providerEventId === incoming.providerEventId ||
        (Boolean(incoming.providerPaymentId) && item.providerPaymentId === incoming.providerPaymentId && item.type === incoming.type)),
  );
  const record: WebhookEventRecord = {
    id: financeId("wh"),
    provider: incoming.provider,
    providerEventId: incoming.providerEventId,
    providerPaymentId: incoming.providerPaymentId,
    type: incoming.type,
    duplicate,
    processedAt: duplicate ? undefined : nowIso(),
    receivedAt: nowIso(),
  };
  return { events: [...events, record], record };
}

/** Compara un pago informado por el proveedor contra el intent local. */
export function reconcileProviderPayment(
  intent: FinancePaymentIntent | undefined,
  provider: { providerPaymentId: string; amountCLP: number; status: string },
): { matched: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!intent) {
    issues.push(`Pago ${provider.providerPaymentId} sin payment_intent local`);
    return { matched: false, issues };
  }
  if (intent.amountCLP !== provider.amountCLP) {
    issues.push(`Monto proveedor (${provider.amountCLP}) distinto al intent (${intent.amountCLP})`);
  }
  if (provider.status === "approved" && intent.status !== "approved") {
    issues.push("Proveedor aprobado pero intent local no confirmado");
  }
  return { matched: issues.length === 0, issues };
}

/** Genera alertas de conciliación sobre el estado financiero completo. */
export function buildReconciliationAlerts(state: FinanceState): ReconciliationAlert[] {
  const alerts: ReconciliationAlert[] = [];
  const push = (type: ReconciliationAlert["type"], severity: ReconciliationAlert["severity"], detail: string, relatedId?: string) =>
    alerts.push({ id: financeId("alert"), type, severity, detail, relatedId, createdAt: nowIso() });

  for (const intent of state.paymentIntents) {
    if (intent.status === "approved" && documentStatusForIntent(intent, state.taxDocuments) === "pending") {
      push("payment_without_document", "warning", `Pago aprobado ${intent.id} sin documento emitido`, intent.id);
    }
    if (intent.status === "refunded" && documentStatusForIntent(intent, state.taxDocuments) === "credit_note_required") {
      push("refund_without_credit_note", "critical", `Reembolso ${intent.id} requiere nota de crédito`, intent.id);
    }
  }
  for (const doc of state.taxDocuments) {
    if (doc.issuerType === "op_spa" && doc.relatedPaymentId && !state.paymentIntents.some((item) => item.id === doc.relatedPaymentId)) {
      push("document_without_payment", "critical", `Documento ${doc.id} sin pago asociado`, doc.id);
    }
  }
  for (const entry of state.ledger) {
    if (entry.type === "credits_purchased" && entry.relatedPaymentId && !state.paymentIntents.some((item) => item.id === entry.relatedPaymentId && item.status === "approved")) {
      push("credits_issued_without_payment", "critical", `Créditos emitidos (${entry.id}) sin pago aprobado`, entry.id);
    }
  }
  const seenProviderIds = new Map<string, number>();
  for (const intent of state.paymentIntents) {
    if (!intent.providerPaymentId) continue;
    seenProviderIds.set(intent.providerPaymentId, (seenProviderIds.get(intent.providerPaymentId) ?? 0) + 1);
  }
  for (const [providerId, count] of seenProviderIds) {
    if (count > 1) push("duplicated_payment", "critical", `providerPaymentId ${providerId} aparece en ${count} intents`);
  }
  for (const event of state.webhookEvents) {
    if (event.duplicate) push("duplicated_webhook", "info", `Webhook duplicado ignorado: ${event.providerEventId}`, event.id);
  }
  for (const payout of state.payouts) {
    if (payout.payoutStatus === "paid" && payout.requiredDocumentType !== "none" && payout.specialistDocumentStatus !== "validated") {
      push("payout_without_document", "critical", `Payout ${payout.id} pagado sin documento validado`, payout.id);
    }
  }
  return alerts;
}
