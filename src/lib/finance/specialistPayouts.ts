/**
 * Liquidaciones a especialistas.
 *
 * Reglas duras:
 * - No se paga a un especialista sin documento tributario requerido (regla 6).
 * - El payout siempre referencia la solicitud y la comisión calculada.
 * - La retención de honorarios se calcula sobre el bruto del documento del especialista.
 */

import { calculatePlatformCommission, creditsToCLP } from "@/lib/finance/commission";
import {
  HONORARIOS_RETENTION_RATE,
  resolveRequiredSpecialistDocument,
  retentionAppliesFor,
  specialistReadyForPayouts,
} from "@/lib/finance/taxModel";
import {
  financeId,
  nowIso,
  type FinanceServiceRequest,
  type SpecialistPayout,
  type SpecialistTaxProfile,
} from "@/lib/finance/types";

export type PayoutCalculation = {
  grossServiceCredits: number;
  grossServiceCLP: number;
  platformCommissionCLP: number;
  specialistPayoutCLP: number;
  withholdingAmountCLP: number;
  netPayoutCLP: number;
};

/**
 * Calcula el payout del especialista para un servicio cerrado.
 * specialistPayoutCLP = bruto − comisión. La retención aplica solo a honorarios.
 */
export function calculateSpecialistPayout({
  finalCredits,
  categoryId,
  taxProfile,
}: {
  finalCredits: number;
  categoryId?: string;
  taxProfile?: Pick<SpecialistTaxProfile, "taxType" | "retentionApplies">;
}): PayoutCalculation {
  const commission = calculatePlatformCommission({ finalCredits, categoryId });
  const grossServiceCLP = commission.grossServiceCLP;
  const specialistPayoutCLP = Math.max(0, grossServiceCLP - commission.commissionCLP);
  const withholding = taxProfile && retentionAppliesFor(taxProfile)
    ? Math.round(specialistPayoutCLP * HONORARIOS_RETENTION_RATE)
    : 0;
  return {
    grossServiceCredits: Math.max(0, Math.round(finalCredits)),
    grossServiceCLP,
    platformCommissionCLP: commission.commissionCLP,
    specialistPayoutCLP,
    withholdingAmountCLP: withholding,
    netPayoutCLP: Math.max(0, specialistPayoutCLP - withholding),
  };
}

/**
 * Crea la liquidación de un servicio completado.
 * Nace `pending` + documento `pending`; si el perfil tributario no está listo, nace `blocked`.
 */
export function createSpecialistPayout({
  request,
  taxProfile,
}: {
  request: FinanceServiceRequest;
  taxProfile?: SpecialistTaxProfile;
}): SpecialistPayout {
  const finalCredits = request.finalCredits ?? request.reservedCredits;
  const calc = calculateSpecialistPayout({ finalCredits, categoryId: request.categoryId, taxProfile });
  const readiness = specialistReadyForPayouts(taxProfile);
  const requiredDocumentType = taxProfile
    ? resolveRequiredSpecialistDocument(taxProfile.taxType)
    : "none";

  return {
    id: financeId("payout"),
    specialistId: request.specialistId,
    serviceRequestId: request.id,
    grossServiceCredits: calc.grossServiceCredits,
    grossServiceCLP: calc.grossServiceCLP,
    platformCommissionCLP: calc.platformCommissionCLP,
    specialistPayoutCLP: calc.specialistPayoutCLP,
    withholdingAmountCLP: calc.withholdingAmountCLP,
    netPayoutCLP: calc.netPayoutCLP,
    requiredDocumentType,
    specialistDocumentStatus: "pending",
    payoutStatus: readiness.ready && requiredDocumentType !== "none" ? "pending" : "blocked",
    blockedReason: readiness.ready
      ? requiredDocumentType === "none"
        ? "Especialista sin documento tributario posible (formalización pendiente)"
        : undefined
      : readiness.reason,
    createdAt: nowIso(),
  };
}

/** Marca el documento requerido (mensaje para dashboard del especialista). */
export function requireSpecialistTaxDocument(payout: SpecialistPayout): string {
  const labels: Record<SpecialistPayout["requiredDocumentType"], string> = {
    boleta_honorarios: "boleta de honorarios electrónica",
    factura_afecta: "factura afecta",
    factura_exenta: "factura exenta",
    none: "documento tributario (requiere formalización)",
  };
  return `Para liberar el pago de ${payout.netPayoutCLP.toLocaleString("es-CL")} CLP debes emitir ${labels[payout.requiredDocumentType]} a OP SpA por ${payout.specialistPayoutCLP.toLocaleString("es-CL")} CLP.`;
}

/** El especialista (o admin) registró el documento: queda en revisión. */
export function markSpecialistDocumentReceived(payout: SpecialistPayout, taxDocumentId: string): SpecialistPayout {
  if (payout.specialistDocumentStatus === "validated") return payout;
  return { ...payout, specialistDocumentStatus: "received", relatedTaxDocumentId: taxDocumentId };
}

/** Admin valida el documento → payout pasa a ready_to_pay (regla 6: nunca sin documento). */
export function markSpecialistPayoutReady(payout: SpecialistPayout): SpecialistPayout {
  if (payout.payoutStatus === "paid") return payout;
  if (payout.requiredDocumentType !== "none" && payout.specialistDocumentStatus !== "received" && payout.specialistDocumentStatus !== "validated") {
    return { ...payout, payoutStatus: "blocked", blockedReason: "Documento tributario pendiente" };
  }
  return {
    ...payout,
    specialistDocumentStatus: "validated",
    payoutStatus: "ready_to_pay",
    blockedReason: undefined,
  };
}

export function markSpecialistPayoutPaid(payout: SpecialistPayout): SpecialistPayout {
  if (payout.payoutStatus !== "ready_to_pay") {
    return { ...payout, payoutStatus: "blocked", blockedReason: "Intento de pago sin validación previa" };
  }
  return { ...payout, payoutStatus: "paid", paidAt: nowIso() };
}

export function blockSpecialistPayout(payout: SpecialistPayout, reason: string): SpecialistPayout {
  if (payout.payoutStatus === "paid") return payout;
  return { ...payout, payoutStatus: "blocked", blockedReason: reason };
}

/** Resumen del estado tributario para el dashboard del especialista. */
export function specialistTaxStatusSummary({
  taxProfile,
  payouts,
}: {
  taxProfile?: SpecialistTaxProfile;
  payouts: SpecialistPayout[];
}): { status: "datos_pendientes" | "documento_pendiente" | "pago_bloqueado" | "listo"; label: string; detail: string } {
  const readiness = specialistReadyForPayouts(taxProfile);
  if (!readiness.ready) {
    return {
      status: "datos_pendientes",
      label: "Datos tributarios pendientes",
      detail: readiness.reason ?? "Completa tus datos tributarios para poder recibir pagos.",
    };
  }
  const blocked = payouts.filter((item) => item.payoutStatus === "blocked");
  if (blocked.length) {
    return {
      status: "pago_bloqueado",
      label: "Pago bloqueado por documento faltante",
      detail: blocked[0].blockedReason ?? "Hay liquidaciones bloqueadas a la espera de tu documento.",
    };
  }
  const pendingDocs = payouts.filter(
    (item) => item.payoutStatus === "pending" && item.specialistDocumentStatus === "pending",
  );
  if (pendingDocs.length) {
    return {
      status: "documento_pendiente",
      label: "Documento pendiente",
      detail: requireSpecialistTaxDocument(pendingDocs[0]),
    };
  }
  return {
    status: "listo",
    label: "Listo para recibir pagos",
    detail: "Tus datos tributarios están verificados y no tienes documentos pendientes.",
  };
}

/** CLP estimado para un payout dado en créditos (referencia para UI). */
export function estimatePayoutCLP(credits: number) {
  return creditsToCLP(credits);
}
