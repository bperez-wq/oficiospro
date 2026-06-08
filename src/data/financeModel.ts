export const creditLedgerEventTypes = [
  "credit_purchased",
  "credit_reserved",
  "credit_redeemed",
  "credit_released",
  "credit_refunded",
  "credit_expired",
  "specialist_payout_pending",
  "specialist_payout_paid",
  "platform_fee_recognized",
  "invoice_pending",
  "invoice_issued",
  "boleta_pending",
  "boleta_received",
] as const;

export type CreditLedgerEventType = (typeof creditLedgerEventTypes)[number];

export const subscriptionStatusTypes = ["active", "paused", "cancelled", "failed_payment", "past_due"] as const;
export type SubscriptionStatusType = (typeof subscriptionStatusTypes)[number];

export const payoutStatusTypes = ["specialist_payout_pending", "specialist_payout_paid", "specialist_payout_on_hold", "specialist_payout_review"] as const;
export type PayoutStatusType = (typeof payoutStatusTypes)[number];

export const taxDocumentStatusTypes = ["invoice_pending", "invoice_issued", "boleta_pending", "boleta_received", "not_required", "under_review"] as const;
export type TaxDocumentStatusType = (typeof taxDocumentStatusTypes)[number];

export const leadRevenueStageTypes = ["lead_captured", "qualified", "quoted", "credits_reserved", "service_completed", "revenue_recognized", "closed_lost"] as const;
export type LeadRevenueStageType = (typeof leadRevenueStageTypes)[number];

export type CreditLedgerEvent = {
  id: string;
  type: CreditLedgerEventType;
  userId?: string;
  bookingId?: string;
  specialistId?: string;
  specialistName?: string;
  serviceName?: string;
  credits: number;
  amountCLP?: number;
  specialistPayoutCLP?: number;
  platformFeeCLP?: number;
  taxDocumentStatus?: TaxDocumentStatusType;
  note?: string;
  createdAt: string;
};

export const financeModelNotes = {
  customerFacingUnit: "credits",
  internalPricingUnit: "CLP",
  accountingReview: "Final accounting, tax treatment, invoicing and boleta/factura flows must be validated with a qualified accountant.",
};
