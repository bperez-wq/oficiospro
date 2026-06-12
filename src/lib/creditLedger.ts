import { defaultCommercialConfig } from "@/data/commercialConfig";
import type { CreditLedgerEvent } from "@/data/financeModel";

type BaseLedgerInput = {
  userId?: string;
  bookingId?: string;
  specialistId?: string;
  specialistName?: string;
  serviceName?: string;
  credits: number;
  amountCLP?: number;
  specialistPayoutCLP?: number;
  platformFeeCLP?: number;
  note?: string;
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

function event(type: CreditLedgerEvent["type"], input: BaseLedgerInput): CreditLedgerEvent {
  return {
    id: id(type),
    type,
    createdAt: now(),
    credits: Math.max(0, Math.round(input.credits)),
    userId: input.userId,
    bookingId: input.bookingId,
    specialistId: input.specialistId,
    specialistName: input.specialistName,
    serviceName: input.serviceName,
    amountCLP: input.amountCLP,
    specialistPayoutCLP: input.specialistPayoutCLP,
    platformFeeCLP: input.platformFeeCLP,
    note: input.note,
  };
}

export function createCreditPurchaseEvent(input: BaseLedgerInput) {
  return event("credit_purchased", {
    ...input,
    amountCLP: input.amountCLP ?? input.credits * defaultCommercialConfig.customerCreditValueCLP,
  });
}

export function reserveCreditsForBooking(input: BaseLedgerInput) {
  return event("credit_reserved", input);
}

export function redeemCreditsForCompletedJob(input: BaseLedgerInput) {
  return event("credit_redeemed", input);
}

export function releaseReservedCredits(input: BaseLedgerInput) {
  return event("credit_released", input);
}

export function refundCredits(input: BaseLedgerInput) {
  return event("credit_refunded", input);
}

export function expireCredits(input: BaseLedgerInput) {
  return event("credit_expired", input);
}

export function calculateAvailableCredits(events: CreditLedgerEvent[]) {
  return events.reduce((balance, item) => {
    if (item.type === "credit_purchased" || item.type === "credit_refunded" || item.type === "credit_released") return balance + item.credits;
    if (item.type === "credit_reserved" || item.type === "credit_expired") return balance - item.credits;
    return balance;
  }, 0);
}

export function calculateReservedCredits(events: CreditLedgerEvent[]) {
  return events.reduce((balance, item) => {
    if (item.type === "credit_reserved") return balance + item.credits;
    if (item.type === "credit_released" || item.type === "credit_redeemed") return balance - item.credits;
    return balance;
  }, 0);
}

export function calculateRedeemedCredits(events: CreditLedgerEvent[]) {
  return events.filter((item) => item.type === "credit_redeemed").reduce((sum, item) => sum + item.credits, 0);
}

export function calculateOutstandingLiability(events: CreditLedgerEvent[]) {
  return Math.max(0, calculateAvailableCredits(events) + calculateReservedCredits(events));
}

export function calculatePlatformFeeEstimate({
  credits,
  specialistPayoutCLP,
  creditValueCLP = defaultCommercialConfig.customerCreditValueCLP,
}: {
  credits: number;
  specialistPayoutCLP: number;
  creditValueCLP?: number;
}) {
  return Math.max(0, credits * creditValueCLP - specialistPayoutCLP);
}

export function calculateSpecialistPayoutEstimate({
  credits,
  platformFeeCLP,
  creditValueCLP = defaultCommercialConfig.customerCreditValueCLP,
}: {
  credits: number;
  platformFeeCLP: number;
  creditValueCLP?: number;
}) {
  return Math.max(0, credits * creditValueCLP - platformFeeCLP);
}

export const demoCreditLedgerEvents: CreditLedgerEvent[] = [
  {
    id: "ledger-demo-001",
    type: "credit_purchased",
    userId: "cliente-demo",
    credits: 80,
    amountCLP: 80000,
    createdAt: "2026-06-01T10:00:00.000Z",
    note: "Compra de créditos Club Hogar.",
  },
  {
    id: "ledger-demo-002",
    type: "credit_reserved",
    userId: "cliente-demo",
    bookingId: "booking-demo-001",
    specialistId: "victor-araya",
    specialistName: "Víctor Mendoza",
    serviceName: "Reparación sanitaria",
    credits: 18,
    createdAt: "2026-06-03T14:30:00.000Z",
    note: "Créditos retenidos hasta cerrar el servicio.",
  },
  {
    id: "ledger-demo-003",
    type: "credit_redeemed",
    userId: "cliente-demo",
    bookingId: "booking-demo-001",
    specialistId: "victor-araya",
    specialistName: "Víctor Mendoza",
    serviceName: "Reparación sanitaria",
    credits: 18,
    specialistPayoutCLP: 13500,
    platformFeeCLP: 4500,
    taxDocumentStatus: "boleta_pending",
    createdAt: "2026-06-04T18:00:00.000Z",
    note: "Servicio completado con documento pendiente.",
  },
];
