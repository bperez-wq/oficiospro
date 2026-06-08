import { defaultCommercialConfig, type CommercialPricingConfig } from "@/data/commercialConfig";

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
  categoryId,
  communeName,
  emergency = false,
  config = defaultCommercialConfig,
}: CreditCalculationParams) {
  const payout = clampPayout(normalizeCLPInput(specialistExpectedPayoutCLP), config);
  const variableFees = payout * (config.platformFeePercent + config.paymentFeePercent + config.riskBufferPercent);
  const categoryMultiplier = categoryId ? config.categoryMultipliers[categoryId] ?? 1 : 1;
  const communeMultiplier = communeName ? config.communeMultipliers[communeName] ?? 1 : 1;
  const baseAmount = (payout + variableFees + config.fixedServiceFeeCLP) * categoryMultiplier * communeMultiplier;
  return Math.round(emergency ? applyEmergencyMultiplier(baseAmount, config) : baseAmount);
}

export function calculateClientCreditsFromSpecialistPayout(params: CreditCalculationParams) {
  const config = params.config ?? defaultCommercialConfig;
  const estimatedClientPrice = estimateClientPriceCLP({ ...params, config });
  const rawCredits = estimatedClientPrice / config.customerCreditValueCLP;
  return Math.max(config.minimumClientCredits, roundCredits(rawCredits, config.creditRoundingStep));
}

export function estimatePlatformMarginCLP(params: CreditCalculationParams) {
  const config = params.config ?? defaultCommercialConfig;
  const clientCredits = calculateClientCreditsFromSpecialistPayout({ ...params, config });
  const clientPriceCLP = clientCredits * config.customerCreditValueCLP;
  return clientPriceCLP - clampPayout(normalizeCLPInput(params.specialistExpectedPayoutCLP), config);
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
