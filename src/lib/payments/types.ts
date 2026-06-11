import type { PricingMode } from "@/data/flexiblePricing";

export type PaymentProvider = "mercado_pago" | "transbank_webpay" | "manual_bank_transfer" | "internal_adjustment";

export type PaymentIntentType =
  | "credit_pack"
  | "subscription_plan"
  | "service_reservation"
  | "visit_fee"
  | "quote_acceptance"
  | "additional_charge";

export type PaymentIntentStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

export type UserRole = "client" | "specialist" | "company" | "admin";

export type PaymentIntent = {
  id: string;
  provider: PaymentProvider;
  externalPaymentId?: string;
  userId: string;
  userRole: UserRole;
  amountCLP: number;
  credits: number;
  currency: "CLP";
  type: PaymentIntentType;
  status: PaymentIntentStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CreditLedgerEntryType =
  | "credits_purchased"
  | "subscription_credits_issued"
  | "credits_reserved"
  | "credits_released"
  | "credits_refunded"
  | "credits_expired"
  | "admin_adjustment"
  | "referral_bonus";

export type CreditLedgerEntry = {
  id: string;
  userId: string;
  userRole: UserRole;
  type: CreditLedgerEntryType;
  amountCredits: number;
  balanceAfter: number;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  description: string;
  createdAt: string;
};

export type CartItemType =
  | "credit_pack"
  | "subscription_plan"
  | "service_request"
  | "quote_request"
  | "visit"
  | "additional_charge";

export type CartItem = {
  id: string;
  type: CartItemType;
  title: string;
  credits?: number;
  amountCLP?: number;
  priceCLP?: number;
  planId?: string;
  specialistId?: string;
  specialistName?: string;
  serviceId?: string;
  serviceName?: string;
  pricingMode?: PricingMode | string;
  createdAt: string;
  /* Campos opcionales para la página /bolsa (compatibles con ítems existentes). */
  specialistSlug?: string;
  specialistImage?: string;
  specialistRating?: number;
  specialistLevel?: string;
  specialistCommune?: string;
  specialistDistance?: number;
  sourceSection?: string;
};

export type CreditWallet = {
  userId: string;
  availableCredits: number;
  reservedCredits: number;
  expiringCredits: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
};

export type CreditPack = {
  id: string;
  credits: number;
  amountCLP: number;
  title: string;
  description: string;
};

export type ProviderTransactionStatus = {
  provider: PaymentProvider;
  externalPaymentId?: string;
  status: PaymentIntentStatus | "unknown";
  raw?: Record<string, unknown>;
};
