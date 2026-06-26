// Modelo de pricing del worker extraido de worker/index.ts (verbatim).
//
// NOTA IMPORTANTE: este modelo (margen variable platformFee + paymentFee +
// riskBuffer + fee fijo) coexiste con el modelo nuevo de comision fija 9.5%
// en src/lib/finance + src/config/taxConfig. Ver pricing-consistency.test.ts
// para el guard que documenta esa divergencia pendiente de reconciliar.

export type WorkerPricingConfig = {
  customerCreditValueCLP: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  riskBufferPercent: number;
  fixedServiceFeeCLP: number;
  emergencyMultiplier: number;
  minimumClientCredits: number;
  creditRoundingStep: number;
};

export const workerPricingConfig: WorkerPricingConfig = {
  customerCreditValueCLP: 1000,
  platformFeePercent: 0.18,
  paymentFeePercent: 0.035,
  riskBufferPercent: 0.04,
  fixedServiceFeeCLP: 2500,
  emergencyMultiplier: 1.35,
  minimumClientCredits: 12,
  creditRoundingStep: 2,
};

export function normalizeMoney(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

export function calculateWorkerClientCredits(specialistExpectedPayoutCLP: number, emergencyAvailable: boolean) {
  const basePrice =
    specialistExpectedPayoutCLP +
    specialistExpectedPayoutCLP * (workerPricingConfig.platformFeePercent + workerPricingConfig.paymentFeePercent + workerPricingConfig.riskBufferPercent) +
    workerPricingConfig.fixedServiceFeeCLP;
  const adjustedPrice = emergencyAvailable ? basePrice * workerPricingConfig.emergencyMultiplier : basePrice;
  const rawCredits = adjustedPrice / workerPricingConfig.customerCreditValueCLP;
  const roundedCredits = Math.ceil(rawCredits / workerPricingConfig.creditRoundingStep) * workerPricingConfig.creditRoundingStep;
  return Math.max(workerPricingConfig.minimumClientCredits, roundedCredits);
}
