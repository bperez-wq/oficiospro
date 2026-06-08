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
  freeInitialVisitEnabled: boolean;
  initialVisitCredits: number;
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
  freeInitialVisitEnabled: true,
  initialVisitCredits: 0,
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
