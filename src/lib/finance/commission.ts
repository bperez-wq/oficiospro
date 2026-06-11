/**
 * Cálculo de comisión/margen de plataforma.
 *
 * Reglas:
 * - El frontend nunca define montos finales: todo se calcula desde
 *   defaultCommercialConfig (catálogo interno) y estos helpers.
 * - La comisión se expresa en CLP y créditos, con trazabilidad por solicitud.
 */

import { defaultCommercialConfig, type CommercialPricingConfig } from "@/data/commercialConfig";
import { splitNetAndIva } from "@/lib/finance/taxModel";
import { financeId, nowIso, type FinanceServiceRequest, type PlatformCommission } from "@/lib/finance/types";

export function creditsToCLP(credits: number, config: CommercialPricingConfig = defaultCommercialConfig) {
  return Math.max(0, Math.round(credits)) * config.customerCreditValueCLP;
}

export type CommissionBreakdown = {
  grossServiceCLP: number;
  commissionRate: number;
  commissionCLP: number;
  commissionCredits: number;
  /** IVA débito estimado sobre el margen (VALIDAR tratamiento con contador). */
  ivaAmount: number;
  minimumMarginApplied: boolean;
};

/**
 * Comisión de plataforma para un servicio cerrado en `finalCredits`.
 * Aplica platformFeePercent + multiplicador de categoría y respeta el margen mínimo por segmento.
 */
export function calculatePlatformCommission({
  finalCredits,
  categoryId,
  config = defaultCommercialConfig,
}: {
  finalCredits: number;
  categoryId?: string;
  config?: CommercialPricingConfig;
}): CommissionBreakdown {
  const grossServiceCLP = creditsToCLP(finalCredits, config);
  const categoryMultiplier = (categoryId && config.categoryMultipliers[categoryId]) || 1;
  const commissionRate = Math.min(0.9, config.platformFeePercent * categoryMultiplier);
  const rawCommission = Math.round(grossServiceCLP * commissionRate);

  const minimumMargin = minimumMarginFor(categoryId, config);
  const commissionCLP = Math.min(grossServiceCLP, Math.max(rawCommission, minimumMargin));
  const { ivaAmountCLP } = splitNetAndIva(commissionCLP);

  return {
    grossServiceCLP,
    commissionRate,
    commissionCLP,
    commissionCredits: Math.round(commissionCLP / config.customerCreditValueCLP),
    ivaAmount: ivaAmountCLP,
    minimumMarginApplied: commissionCLP > rawCommission,
  };
}

export function minimumMarginFor(categoryId: string | undefined, config: CommercialPricingConfig = defaultCommercialConfig) {
  switch (categoryId) {
    case "industria":
      return config.minimumIndustrialMarginCLP;
    case "agroindustria":
    case "agricultura":
      return config.minimumAgriculturalMarginCLP;
    case "empresas":
      return config.minimumCompanyMarginCLP;
    default:
      return config.minimumHomeMarginCLP;
  }
}

/** Comisión sobre adicionales/materiales aprobados. */
export function calculateAdditionalCommission({
  additionalCredits,
  kind,
  config = defaultCommercialConfig,
}: {
  additionalCredits: number;
  kind: "materials" | "labor" | "urgency";
  config?: CommercialPricingConfig;
}) {
  const grossCLP = creditsToCLP(additionalCredits, config);
  const rate =
    kind === "materials"
      ? config.materialCommissionPercent
      : kind === "labor"
        ? config.additionalLaborCommissionPercent
        : config.platformFeePercent;
  const commissionCLP = Math.round(grossCLP * rate);
  return { grossCLP, rate, commissionCLP };
}

/** Crea el registro de comisión de plataforma para una solicitud completada. */
export function createPlatformCommissionRecord(
  request: Pick<FinanceServiceRequest, "id" | "specialistId" | "customerId" | "categoryId">,
  breakdown: CommissionBreakdown,
): PlatformCommission {
  return {
    id: financeId("comm"),
    serviceRequestId: request.id,
    specialistId: request.specialistId,
    customerId: request.customerId,
    commissionCLP: breakdown.commissionCLP,
    commissionCredits: breakdown.commissionCredits,
    commissionRate: breakdown.commissionRate,
    ivaAmount: breakdown.ivaAmount,
    documentStatus: "not_required",
    createdAt: nowIso(),
  };
}
