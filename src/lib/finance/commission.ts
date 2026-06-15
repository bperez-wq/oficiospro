/**
 * Calculo de Comision OficiosPro.
 *
 * Regla activa:
 * - 9,5% neto segun src/config/taxConfig.ts
 * - IVA sobre la comision si taxConfig.platformCommission.ivaApplies = true
 *
 * Cuando exista documento especialista, preferir
 * calculateCustomerPriceWithPlatformCommission() porque calcula sobre la base
 * tributaria real del documento. Este helper mantiene compatibilidad con el
 * ledger financiero legacy que parte desde creditos finales.
 */

import { chileTaxConfig2026, roundTaxCLP } from "@/config/taxConfig";
import { defaultCommercialConfig, type CommercialPricingConfig } from "@/data/commercialConfig";
import { financeId, nowIso, type FinanceServiceRequest, type PlatformCommission } from "@/lib/finance/types";

export function creditsToCLP(credits: number, config: CommercialPricingConfig = defaultCommercialConfig) {
  return Math.max(0, Math.round(credits)) * config.customerCreditValueCLP;
}

export type CommissionBreakdown = {
  grossServiceCLP: number;
  commissionRate: number;
  commissionCLP: number;
  commissionCredits: number;
  ivaAmount: number;
  minimumMarginApplied: boolean;
};

export function calculatePlatformCommission({
  finalCredits,
  config = defaultCommercialConfig,
}: {
  finalCredits: number;
  categoryId?: string;
  config?: CommercialPricingConfig;
}): CommissionBreakdown {
  const grossServiceCLP = creditsToCLP(finalCredits, config);
  const commissionRate = chileTaxConfig2026.platformCommission.standardRate;
  const commissionNetCLP = roundTaxCLP(grossServiceCLP * commissionRate, chileTaxConfig2026);
  const ivaAmount = chileTaxConfig2026.platformCommission.ivaApplies
    ? roundTaxCLP(commissionNetCLP * chileTaxConfig2026.ivaRate, chileTaxConfig2026)
    : 0;
  const commissionCLP = Math.min(grossServiceCLP, commissionNetCLP + ivaAmount);

  return {
    grossServiceCLP,
    commissionRate,
    commissionCLP,
    commissionCredits: Math.round(commissionCLP / config.customerCreditValueCLP),
    ivaAmount,
    minimumMarginApplied: false,
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

export function calculateAdditionalCommission({
  additionalCredits,
  config = defaultCommercialConfig,
}: {
  additionalCredits: number;
  kind: "materials" | "labor" | "urgency";
  config?: CommercialPricingConfig;
}) {
  const grossCLP = creditsToCLP(additionalCredits, config);
  const rate = chileTaxConfig2026.platformCommission.standardRate;
  const commissionNetCLP = roundTaxCLP(grossCLP * rate, chileTaxConfig2026);
  const ivaCLP = chileTaxConfig2026.platformCommission.ivaApplies
    ? roundTaxCLP(commissionNetCLP * chileTaxConfig2026.ivaRate, chileTaxConfig2026)
    : 0;
  const commissionCLP = commissionNetCLP + ivaCLP;
  return { grossCLP, rate, commissionCLP };
}

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
