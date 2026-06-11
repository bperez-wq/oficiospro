/**
 * Tipos del sistema financiero, tributario y contable de OficiosPro (OP SpA).
 *
 * Estos tipos extienden la base existente en src/lib/payments/types.ts sin reemplazarla:
 * el checkout y Mercado Pago siguen usando PaymentIntent base; aquí se agrega la capa
 * tributaria/contable (documentos, payouts, comisiones, conciliación y reportes).
 *
 * NOTA OPERACIONAL: mientras no exista storage durable (D1/Supabase), estas estructuras
 * se usan en memoria y en los paneles internos. La migración a storage durable está
 * descrita en docs/financial-tax-model-chile.md (Fase 2).
 */

import type {
  PaymentIntent,
  PaymentIntentStatus,
  PaymentIntentType,
  PaymentProvider,
  UserRole,
} from "@/lib/payments/types";

export type { PaymentIntentStatus, PaymentIntentType, PaymentProvider, UserRole };

/* ------------------------------------------------------------------ */
/* A. Payment intents (capa tributaria sobre PaymentIntent existente)  */
/* ------------------------------------------------------------------ */

export type DocumentIssueStatus =
  | "not_required"
  | "pending"
  | "issued"
  | "cancelled"
  | "credit_note_required";

export type FinancePaymentIntent = PaymentIntent & {
  providerPaymentId?: string;
  externalReference?: string;
  buyerRut?: string;
  buyerName?: string;
  buyerEmail?: string;
  /** Monto neto (sin IVA) estimado del documento asociado. */
  netAmountCLP?: number;
  /** IVA estimado del documento asociado. */
  ivaAmountCLP?: number;
  documentStatus: DocumentIssueStatus;
  relatedTaxDocumentId?: string;
};

/* ------------------------------------------------------------------ */
/* B/C. Wallet y ledger de créditos                                     */
/* ------------------------------------------------------------------ */

export type FinanceCreditWallet = {
  userId: string;
  availableCredits: number;
  reservedCredits: number;
  expiringCredits: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
  lifetimeRefunded: number;
  lastMovementAt?: string;
};

export type FinanceLedgerEntryType =
  | "credits_purchased"
  | "subscription_credits_issued"
  | "credits_reserved"
  | "credits_released"
  | "credits_refunded"
  | "credits_expired"
  | "admin_adjustment"
  | "referral_bonus"
  | "service_discount";

export type FinanceLedgerEntry = {
  id: string;
  userId: string;
  type: FinanceLedgerEntryType;
  amountCredits: number;
  balanceAfter: number;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  relatedSubscriptionId?: string;
  description: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* D. Service requests (vista financiera)                              */
/* ------------------------------------------------------------------ */

export type ServiceRequestStatus =
  | "requested"
  | "pending_specialist_acceptance"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

/** Tratamiento tributario aplicado a la solicitud (modelo A recomendado). */
export type ServiceTaxTreatment =
  | "platform_total_model_a"
  | "commission_only_model_b"
  | "b2b_invoice_model_c"
  | "pending_review";

export type FinanceServiceRequest = {
  id: string;
  customerId: string;
  specialistId: string;
  serviceId: string;
  serviceName: string;
  categoryId?: string;
  specialty?: string;
  pricingMode: "fixed" | "hourly" | "quote_required" | "visit_then_quote" | string;
  quotedCredits?: number;
  reservedCredits: number;
  finalCredits?: number;
  status: ServiceRequestStatus;
  taxTreatment: ServiceTaxTreatment;
  createdAt: string;
  completedAt?: string;
};

/* ------------------------------------------------------------------ */
/* E. Perfil tributario del especialista                                */
/* ------------------------------------------------------------------ */

export type SpecialistTaxType =
  | "persona_natural_honorarios"
  | "empresa_factura_afecta"
  | "empresa_factura_exenta"
  | "pendiente_formalizacion";

export type SpecialistTaxProfile = {
  specialistId: string;
  rut: string;
  legalName: string;
  taxType: SpecialistTaxType;
  siiActivity?: string;
  canIssueFeeReceipt: boolean;
  canIssueInvoice: boolean;
  ivaStatus: "afecto" | "exento" | "no_aplica" | "por_definir";
  retentionApplies: boolean;
  bankAccount?: {
    bank: string;
    accountType: string;
    accountNumber: string;
    holderRut?: string;
  };
  verifiedByAdmin: boolean;
  verifiedAt?: string;
};

/* ------------------------------------------------------------------ */
/* F. Liquidaciones a especialistas                                     */
/* ------------------------------------------------------------------ */

export type RequiredSpecialistDocument = "boleta_honorarios" | "factura_afecta" | "factura_exenta" | "none";

export type SpecialistDocumentStatus = "pending" | "received" | "validated" | "rejected";

export type PayoutStatus = "pending" | "ready_to_pay" | "paid" | "blocked";

export type SpecialistPayout = {
  id: string;
  specialistId: string;
  serviceRequestId: string;
  grossServiceCredits: number;
  grossServiceCLP: number;
  platformCommissionCLP: number;
  specialistPayoutCLP: number;
  /** Retención (ej. boleta de honorarios) que OP SpA debe enterar al SII. */
  withholdingAmountCLP: number;
  netPayoutCLP: number;
  requiredDocumentType: RequiredSpecialistDocument;
  specialistDocumentStatus: SpecialistDocumentStatus;
  relatedTaxDocumentId?: string;
  payoutStatus: PayoutStatus;
  blockedReason?: string;
  createdAt: string;
  paidAt?: string;
};

/* ------------------------------------------------------------------ */
/* G. Comisiones de plataforma                                          */
/* ------------------------------------------------------------------ */

export type PlatformCommission = {
  id: string;
  serviceRequestId: string;
  specialistId: string;
  customerId: string;
  commissionCLP: number;
  commissionCredits: number;
  commissionRate: number;
  /** IVA débito asociado al margen, si el tratamiento lo requiere (validar con contador). */
  ivaAmount: number;
  documentStatus: DocumentIssueStatus;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* H. Documentos tributarios                                            */
/* ------------------------------------------------------------------ */

export type TaxDocumentIssuerType = "op_spa" | "specialist";

export type TaxDocumentType =
  | "boleta_afecta"
  | "factura_afecta"
  | "factura_exenta"
  | "boleta_honorarios"
  | "nota_credito"
  | "comprobante_interno";

export type TaxDocumentStatus = "pending" | "issued" | "received" | "rejected" | "cancelled";

export type TaxDocument = {
  id: string;
  issuerType: TaxDocumentIssuerType;
  issuerRut: string;
  receiverRut: string;
  receiverName: string;
  documentType: TaxDocumentType;
  /** Folio del DTE; en fase piloto puede ser folio manual o referencia interna. */
  folio?: string;
  amountCLP: number;
  netAmountCLP: number;
  ivaAmountCLP: number;
  retentionAmountCLP: number;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  relatedPayoutId?: string;
  status: TaxDocumentStatus;
  issuedAt?: string;
  metadata?: Record<string, unknown>;
};

/* ------------------------------------------------------------------ */
/* I. Suscripciones (vista financiera)                                  */
/* ------------------------------------------------------------------ */

export type FinanceSubscription = {
  id: string;
  userId: string;
  planId: string;
  monthlyCredits: number;
  status: "active" | "paused" | "cancelled" | "failed_payment" | "past_due" | "pending";
  billingCycle: "monthly";
  lastBillingAt?: string;
  nextBillingAt?: string;
  documentStatus: DocumentIssueStatus;
  paymentProvider: PaymentProvider;
};

/* ------------------------------------------------------------------ */
/* J. Exportaciones contables                                           */
/* ------------------------------------------------------------------ */

export type AccountingExportType = "sales" | "payouts" | "commissions" | "credit_movements" | "tax_documents";

export type AccountingExport = {
  id: string;
  /** Periodo contable, formato YYYY-MM. */
  period: string;
  type: AccountingExportType;
  status: "generating" | "ready" | "failed";
  generatedAt: string;
  fileUrl?: string;
  rowCount?: number;
};

/* ------------------------------------------------------------------ */
/* Conciliación                                                         */
/* ------------------------------------------------------------------ */

export type ReconciliationAlertType =
  | "payment_without_document"
  | "document_without_payment"
  | "credits_issued_without_payment"
  | "duplicated_payment"
  | "duplicated_webhook"
  | "payout_without_document"
  | "refund_without_credit_note";

export type ReconciliationAlert = {
  id: string;
  type: ReconciliationAlertType;
  severity: "info" | "warning" | "critical";
  relatedId?: string;
  detail: string;
  createdAt: string;
};

export type WebhookEventRecord = {
  id: string;
  provider: PaymentProvider;
  providerEventId: string;
  providerPaymentId?: string;
  type: string;
  processedAt?: string;
  duplicate: boolean;
  receivedAt: string;
};

/** Estado financiero agregado, base para el panel admin y los reportes. */
export type FinanceState = {
  paymentIntents: FinancePaymentIntent[];
  wallets: FinanceCreditWallet[];
  ledger: FinanceLedgerEntry[];
  serviceRequests: FinanceServiceRequest[];
  taxProfiles: SpecialistTaxProfile[];
  payouts: SpecialistPayout[];
  commissions: PlatformCommission[];
  taxDocuments: TaxDocument[];
  subscriptions: FinanceSubscription[];
  webhookEvents: WebhookEventRecord[];
  exports: AccountingExport[];
};

export function emptyFinanceState(): FinanceState {
  return {
    paymentIntents: [],
    wallets: [],
    ledger: [],
    serviceRequests: [],
    taxProfiles: [],
    payouts: [],
    commissions: [],
    taxDocuments: [],
    subscriptions: [],
    webhookEvents: [],
    exports: [],
  };
}

export function financeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}
