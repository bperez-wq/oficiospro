import { defaultCommercialConfig, type CommercialPricingConfig } from "@/data/commercialConfig";
import {
  calculateCustomerPriceWithPlatformCommission,
  commissionRuleFromCommercialConfig,
} from "@/lib/finance/specialistPayoutCalculator";

export type CreditCalculationParams = {
  specialistExpectedPayoutCLP: number;
  categoryId?: string;
  serviceId?: string;
  communeName?: string;
  emergency?: boolean;
  config?: CommercialPricingConfig;
};

export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? Math.round(amount) : 0);
}

export function normalizeCLPInput(value: string | number) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d]/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
}

export function estimateClientPriceCLP({
  specialistExpectedPayoutCLP,
  emergency = false,
  config = defaultCommercialConfig,
}: CreditCalculationParams) {
  const payout = clampPayout(normalizeCLPInput(specialistExpectedPayoutCLP), config);
  if (!payout) return 0;
  const calculation = calculateCustomerPriceWithPlatformCommission({
    specialistTargetAmountCLP: payout,
    taxType: "boleta_honorarios",
    commissionRule: commissionRuleFromCommercialConfig(config),
    accountantReviewed: true,
    siiValidated: true,
    emergencyMultiplier: emergency ? config.emergencyMultiplier : 1,
  });
  return calculation.customerGrossPriceCLP;
}

export function calculateClientCreditsFromSpecialistPayout(params: CreditCalculationParams) {
  const config = params.config ?? defaultCommercialConfig;
  const payout = clampPayout(normalizeCLPInput(params.specialistExpectedPayoutCLP), config);
  if (!payout) return 0;
  const calculation = calculateCustomerPriceWithPlatformCommission({
    specialistTargetAmountCLP: payout,
    taxType: "boleta_honorarios",
    commissionRule: commissionRuleFromCommercialConfig(config),
    accountantReviewed: true,
    siiValidated: true,
    emergencyMultiplier: params.emergency ? config.emergencyMultiplier : 1,
  });
  return Math.max(config.minimumClientCredits, calculation.totalCreditsEstimate);
}

export function estimatePlatformMarginCLP(params: CreditCalculationParams) {
  const config = params.config ?? defaultCommercialConfig;
  const payout = clampPayout(normalizeCLPInput(params.specialistExpectedPayoutCLP), config);
  if (!payout) return 0;
  const calculation = calculateCustomerPriceWithPlatformCommission({
    specialistTargetAmountCLP: payout,
    taxType: "boleta_honorarios",
    commissionRule: commissionRuleFromCommercialConfig(config),
    accountantReviewed: true,
    siiValidated: true,
    emergencyMultiplier: params.emergency ? config.emergencyMultiplier : 1,
  });
  return calculation.platformCommissionGrossCLP;
}

export function applyEmergencyMultiplier(amount: number, config: CommercialPricingConfig = defaultCommercialConfig) {
  return Math.ceil(amount * config.emergencyMultiplier);
}

export function roundCredits(credits: number, step: number) {
  const safeStep = Math.max(1, Math.round(step || 1));
  return Math.ceil(credits / safeStep) * safeStep;
}

export function getCertificationRequirement(categoryId: string | undefined, serviceId: string | undefined, config: CommercialPricingConfig = defaultCommercialConfig) {
  if (serviceId && config.certificationRequiredByCategory[serviceId]) return true;
  if (categoryId && config.certificationRequiredByCategory[categoryId]) return true;
  return false;
}

function clampPayout(amount: number, config: CommercialPricingConfig) {
  if (!amount) return 0;
  return Math.min(Math.max(amount, config.minimumSpecialistPayoutCLP), config.maximumSpecialistPayoutCLP);
}
