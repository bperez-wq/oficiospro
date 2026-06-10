import type { CreditLedgerEntry, CreditLedgerEntryType, CreditWallet, UserRole } from "@/lib/payments/types";

type LedgerOperation = {
  userId?: string;
  userRole?: UserRole;
  credits: number;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  description: string;
};

export function emptyCreditWallet(userId = "cliente@oficiospro.cl"): CreditWallet {
  return {
    userId,
    availableCredits: 0,
    reservedCredits: 0,
    expiringCredits: 0,
    lifetimePurchased: 0,
    lifetimeUsed: 0,
  };
}

export function issueCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = normalizeCredits(input.credits);
  const next = {
    ...wallet,
    userId: input.userId ?? wallet.userId,
    availableCredits: wallet.availableCredits + credits,
    expiringCredits: wallet.expiringCredits + credits,
    lifetimePurchased: wallet.lifetimePurchased + credits,
  };
  return result(next, "credits_purchased", credits, input);
}

export function issueSubscriptionCredits(wallet: CreditWallet, input: LedgerOperation) {
  const issued = issueCredits(wallet, input);
  return { wallet: issued.wallet, entry: { ...issued.entry, type: "subscription_credits_issued" as const } };
}

export function reserveCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = Math.min(normalizeCredits(input.credits), wallet.availableCredits);
  const next = {
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    reservedCredits: wallet.reservedCredits + credits,
  };
  return result(next, "credits_reserved", -credits, input);
}

export function releaseReservedCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = Math.min(normalizeCredits(input.credits), wallet.reservedCredits);
  const next = {
    ...wallet,
    availableCredits: wallet.availableCredits + credits,
    reservedCredits: wallet.reservedCredits - credits,
  };
  return result(next, "credits_released", credits, input);
}

export function captureReservedCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = Math.min(normalizeCredits(input.credits), wallet.reservedCredits);
  const next = {
    ...wallet,
    reservedCredits: wallet.reservedCredits - credits,
    lifetimeUsed: wallet.lifetimeUsed + credits,
  };
  return result(next, "credits_released", -credits, input);
}

export function refundCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = normalizeCredits(input.credits);
  const next = {
    ...wallet,
    availableCredits: wallet.availableCredits + credits,
  };
  return result(next, "credits_refunded", credits, input);
}

export function expireCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = Math.min(normalizeCredits(input.credits), wallet.availableCredits);
  const next = {
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    expiringCredits: Math.max(0, wallet.expiringCredits - credits),
  };
  return result(next, "credits_expired", -credits, input);
}

export function adminAdjustCredits(wallet: CreditWallet, input: LedgerOperation) {
  const credits = Math.round(Number(input.credits) || 0);
  const next = {
    ...wallet,
    availableCredits: Math.max(0, wallet.availableCredits + credits),
    lifetimePurchased: credits > 0 ? wallet.lifetimePurchased + credits : wallet.lifetimePurchased,
  };
  return result(next, "admin_adjustment", credits, input);
}

export function applyClubHogarDiscount(credits: number, isSubscriber: boolean) {
  return Math.max(0, credits - (isSubscriber ? 2 : 0));
}

function result(wallet: CreditWallet, type: CreditLedgerEntryType, amountCredits: number, input: LedgerOperation) {
  return {
    wallet,
    entry: ledgerEntry({
      userId: input.userId ?? wallet.userId,
      userRole: input.userRole ?? "client",
      type,
      amountCredits,
      balanceAfter: wallet.availableCredits,
      relatedPaymentId: input.relatedPaymentId,
      relatedServiceRequestId: input.relatedServiceRequestId,
      description: input.description,
    }),
  };
}

function ledgerEntry(input: Omit<CreditLedgerEntry, "id" | "createdAt">): CreditLedgerEntry {
  return {
    ...input,
    id: `cle-op-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
}

function normalizeCredits(value: number) {
  return Math.max(0, Math.round(Number(value) || 0));
}
