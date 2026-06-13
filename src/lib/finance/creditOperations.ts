/**
 * Operaciones de créditos de la capa financiera.
 *
 * Reutiliza la lógica existente de src/lib/payments/ledger.ts (no la reemplaza)
 * y agrega las reglas financieras:
 * - quote_required / virtual_diagnosis no retienen créditos completos (solo lo cotizado/aceptado).
 * - visit_then_quote retiene solo los créditos de visita.
 * - Los adicionales requieren aprobación previa del cliente.
 * - Nunca se libera más crédito que el reservado.
 * - Todo movimiento queda en el ledger.
 */

import { defaultCommercialConfig } from "@/data/commercialConfig";
import {
  financeId,
  nowIso,
  type FinanceCreditWallet,
  type FinanceLedgerEntry,
  type FinanceLedgerEntryType,
} from "@/lib/finance/types";

type OperationInput = {
  userId: string;
  credits: number;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  relatedSubscriptionId?: string;
  description: string;
};

type OperationResult = { wallet: FinanceCreditWallet; entry: FinanceLedgerEntry };

export function emptyFinanceWallet(userId: string): FinanceCreditWallet {
  return {
    userId,
    availableCredits: 0,
    reservedCredits: 0,
    expiringCredits: 0,
    lifetimePurchased: 0,
    lifetimeUsed: 0,
    lifetimeRefunded: 0,
  };
}

function clean(credits: number) {
  return Math.max(0, Math.round(Number(credits) || 0));
}

function entry(type: FinanceLedgerEntryType, amountCredits: number, wallet: FinanceCreditWallet, input: OperationInput): FinanceLedgerEntry {
  return {
    id: financeId("fle"),
    userId: input.userId,
    type,
    amountCredits,
    balanceAfter: wallet.availableCredits,
    relatedPaymentId: input.relatedPaymentId,
    relatedServiceRequestId: input.relatedServiceRequestId,
    relatedSubscriptionId: input.relatedSubscriptionId,
    description: input.description,
    createdAt: nowIso(),
  };
}

function withMovement(wallet: FinanceCreditWallet): FinanceCreditWallet {
  return { ...wallet, lastMovementAt: nowIso() };
}

/** Emite créditos comprados (post pago aprobado). */
export function issueCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const credits = clean(input.credits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits + credits,
    expiringCredits: wallet.expiringCredits + credits,
    lifetimePurchased: wallet.lifetimePurchased + credits,
  });
  return { wallet: next, entry: entry("credits_purchased", credits, next, input) };
}

/** Emite créditos recurrentes de Club Hogar. */
export function issueSubscriptionCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const issued = issueCredits(wallet, input);
  return { wallet: issued.wallet, entry: { ...issued.entry, type: "subscription_credits_issued" } };
}

/**
 * Retiene créditos para una solicitud según el modo de precio:
 * - fixed / hourly / quote aceptada: retiene los créditos solicitados.
 * - visit_then_quote: retiene solo visitCredits.
 * - quote_required / virtual_diagnosis (sin cotización aceptada): retiene 0 hasta aceptar.
 */
export function reserveCreditsForService(
  wallet: FinanceCreditWallet,
  input: OperationInput & {
    pricingMode: string;
    visitCredits?: number;
    quoteAccepted?: boolean;
  },
): OperationResult & { reservedCredits: number } {
  let toReserve = clean(input.credits);
  if (input.pricingMode === "visit_then_quote") {
    toReserve = clean(input.visitCredits ?? defaultCommercialConfig.initialVisitFeeCredits);
  } else if ((input.pricingMode === "quote_required" || input.pricingMode === "virtual_diagnosis") && !input.quoteAccepted) {
    toReserve = 0;
  }
  const credits = Math.min(toReserve, wallet.availableCredits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    reservedCredits: wallet.reservedCredits + credits,
  });
  return { wallet: next, entry: entry("credits_reserved", -credits, next, input), reservedCredits: credits };
}

/** Adicional aprobado por el cliente: retiene créditos extra (regla 5). */
export function reserveApprovedAdditional(
  wallet: FinanceCreditWallet,
  input: OperationInput & { approvedByCustomer: boolean },
): OperationResult {
  if (!input.approvedByCustomer) {
    return { wallet, entry: entry("credits_reserved", 0, wallet, { ...input, description: `RECHAZADO sin aprobación: ${input.description}` }) };
  }
  const credits = Math.min(clean(input.credits), wallet.availableCredits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    reservedCredits: wallet.reservedCredits + credits,
  });
  return { wallet: next, entry: entry("credits_reserved", -credits, next, input) };
}

/**
 * Cierre de servicio confirmado por el cliente: captura los créditos retenidos
 * (pasan a usados) y libera el excedente si el cierre fue por menos créditos.
 * Nunca opera sobre más créditos que los reservados (regla 8).
 */
export function releaseCreditsAfterCompletion(
  wallet: FinanceCreditWallet,
  input: OperationInput & { finalCredits?: number },
): { wallet: FinanceCreditWallet; entries: FinanceLedgerEntry[]; capturedCredits: number } {
  const reserved = Math.min(clean(input.credits), wallet.reservedCredits);
  const finalCredits = Math.min(clean(input.finalCredits ?? reserved), reserved);
  const surplus = reserved - finalCredits;
  const entries: FinanceLedgerEntry[] = [];

  let next = withMovement({
    ...wallet,
    reservedCredits: wallet.reservedCredits - finalCredits,
    lifetimeUsed: wallet.lifetimeUsed + finalCredits,
  });
  entries.push(entry("credits_released", -finalCredits, next, { ...input, description: `Captura por servicio completado: ${input.description}` }));

  if (surplus > 0) {
    next = withMovement({
      ...next,
      reservedCredits: next.reservedCredits - surplus,
      availableCredits: next.availableCredits + surplus,
    });
    entries.push(entry("credits_released", surplus, next, { ...input, description: `Excedente devuelto a wallet: ${input.description}` }));
  }
  return { wallet: next, entries, capturedCredits: finalCredits };
}

/** Cancelación: devuelve los créditos retenidos a disponibles (sin captura). */
export function releaseReservedCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const credits = Math.min(clean(input.credits), wallet.reservedCredits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits + credits,
    reservedCredits: wallet.reservedCredits - credits,
  });
  return { wallet: next, entry: entry("credits_released", credits, next, input) };
}

/** Reembolso de créditos (requiere nota de crédito si hubo documento; ver taxDocuments). */
export function refundCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const credits = Math.min(clean(input.credits), wallet.availableCredits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    lifetimeRefunded: wallet.lifetimeRefunded + credits,
  });
  return { wallet: next, entry: entry("credits_refunded", -credits, next, input) };
}

/** Expiración de créditos vencidos. */
export function expireCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const credits = Math.min(clean(input.credits), wallet.availableCredits);
  const next = withMovement({
    ...wallet,
    availableCredits: wallet.availableCredits - credits,
    expiringCredits: Math.max(0, wallet.expiringCredits - credits),
  });
  return { wallet: next, entry: entry("credits_expired", -credits, next, input) };
}

/** Descuento Club Hogar (2 créditos por solicitud) registrado como movimiento trazable. */
export function applySubscriberDiscount(
  wallet: FinanceCreditWallet,
  input: OperationInput,
): OperationResult {
  const credits = clean(Math.min(input.credits, defaultCommercialConfig.subscriberDiscountCredits));
  const next = withMovement(wallet);
  return {
    wallet: next,
    entry: entry("service_discount", credits, next, {
      ...input,
      description: input.description || `Descuento Club Hogar de ${credits} créditos`,
    }),
  };
}

/** Ajuste manual de admin, siempre con descripción obligatoria. */
export function adminAdjustCredits(wallet: FinanceCreditWallet, input: OperationInput): OperationResult {
  const credits = Math.round(Number(input.credits) || 0);
  const next = withMovement({
    ...wallet,
    availableCredits: Math.max(0, wallet.availableCredits + credits),
  });
  return { wallet: next, entry: entry("admin_adjustment", credits, next, input) };
}
