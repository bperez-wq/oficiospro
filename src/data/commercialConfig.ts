export type CommercialPricingConfig = {
  customerCreditValueCLP: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  riskBufferPercent: number;
  fixedServiceFeeCLP: number;
  emergencyMultiplier: number;
  minimumClientCredits: number;
  creditRoundingStep: number;
  minimumSpecialistPayoutCLP: number;
  maximumSpecialistPayoutCLP: number;
  minimumHomeMarginCLP: number;
  minimumCompanyMarginCLP: number;
  minimumAgriculturalMarginCLP: number;
  minimumIndustrialMarginCLP: number;
  subscriberDiscountCredits: number;
  subscriberDiscountAppliesTo: {
    fixed: boolean;
    visit: boolean;
    baseRequest: boolean;
    additionals: boolean;
  };
  freeInitialVisitEnabled: boolean;
  initialVisitCredits: number;
  initialVisitFeeCredits: number;
  materialCommissionPercent: number;
  additionalLaborCommissionPercent: number;
  quoteExpirationDays: number;
  maxAdditionalsPerRequest: number;
  adminApprovalCreditThreshold: number;
  categoryMultipliers: Record<string, number>;
  communeMultipliers: Record<string, number>;
  certificationRequiredByCategory: Record<string, boolean>;
};

// Configuracion interna inicial. En produccion, margenes y reglas sensibles deben venir del Worker/env o de un panel admin privado.
export const defaultCommercialConfig: CommercialPricingConfig = {
  customerCreditValueCLP: 1000,
  platformFeePercent: 0.18,
  paymentFeePercent: 0.035,
  riskBufferPercent: 0.04,
  fixedServiceFeeCLP: 2500,
  emergencyMultiplier: 1.35,
  minimumClientCredits: 12,
  creditRoundingStep: 2,
  minimumSpecialistPayoutCLP: 5000,
  maximumSpecialistPayoutCLP: 500000,
  minimumHomeMarginCLP: 5000,
  minimumCompanyMarginCLP: 10000,
  minimumAgriculturalMarginCLP: 12000,
  minimumIndustrialMarginCLP: 15000,
  subscriberDiscountCredits: 2,
  subscriberDiscountAppliesTo: {
    fixed: true,
    visit: true,
    baseRequest: true,
    additionals: false,
  },
  freeInitialVisitEnabled: true,
  initialVisitCredits: 0,
  initialVisitFeeCredits: 6,
  materialCommissionPercent: 0.08,
  additionalLaborCommissionPercent: 0.12,
  quoteExpirationDays: 7,
  maxAdditionalsPerRequest: 3,
  adminApprovalCreditThreshold: 80,
  categoryMultipliers: {
    hogar: 1,
    gasfiteria: 1.05,
    electricidad: 1.08,
    "climatizacion-refrigeracion": 1.12,
    empresas: 1.18,
    industria: 1.25,
    agroindustria: 1.2,
    emergencias: 1.35,
  },
  communeMultipliers: {
    "Las Condes": 1.08,
    Vitacura: 1.08,
    Providencia: 1.04,
    Santiago: 1,
    Valparaiso: 1,
    Concepcion: 1,
  },
  certificationRequiredByCategory: {
    electricidad: true,
    gasfiteria: true,
    "climatizacion-refrigeracion": true,
    industria: true,
    agroindustria: false,
    hogar: false,
    empresas: false,
  },
};
