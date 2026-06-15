import type { TaxConfigVersion } from "../config/taxConfig";

export type SpecialistFormalizationTaxType =
  | "factura_afecta"
  | "boleta_honorarios"
  | "factura_exenta"
  | "unknown";

export type FormalizationStatus =
  | "not_started"
  | "collecting_data"
  | "pending_secure_storage"
  | "pending_accountant_review"
  | "pending_sii_validation"
  | "verified"
  | "blocked";

export type PayoutBlockReason =
  | "missing_tax_profile"
  | "missing_document_capability"
  | "missing_secure_storage"
  | "missing_tax_document"
  | "pending_accountant_review"
  | "pending_sii_validation"
  | "manual_admin_review";

export type RequiredSpecialistDocumentKind =
  | "factura_afecta"
  | "boleta_honorarios"
  | "factura_exenta"
  | "none";

export type CommissionRule = {
  platformFeePercent: number;
  paymentFeePercent: number;
  riskBufferPercent: number;
  fixedServiceFeeCLP: number;
  minimumMarginCLP: number;
  creditValueCLP: number;
  creditRoundingStep: number;
};

export type SpecialistPayoutCalculationInput = {
  specialistTargetAmountCLP: number;
  taxType: SpecialistFormalizationTaxType;
  commissionRule: CommissionRule;
  taxConfig?: TaxConfigVersion;
  includeMaterialsCLP?: number;
  emergencyMultiplier?: number;
  accountantReviewed?: boolean;
  siiValidated?: boolean;
};

export type SpecialistPayoutCalculationResult = {
  taxType: SpecialistFormalizationTaxType;
  requiredDocumentType: RequiredSpecialistDocumentKind;
  payoutAllowed: boolean;
  blockReasons: PayoutBlockReason[];
  specialistTargetAmountCLP: number;
  specialistDocumentGrossCLP: number;
  specialistDocumentNetCLP: number;
  ivaAmountCLP: number;
  withholdingAmountCLP: number;
  specialistLiquidPayoutCLP: number;
  platformCommissionCLP: number;
  paymentFeeCLP: number;
  riskBufferCLP: number;
  fixedServiceFeeCLP: number;
  materialsCLP: number;
  customerChargeCLP: number;
  customerCredits: number;
  marginCLP: number;
  rateSnapshot: {
    taxConfigId: string;
    ivaRate: number;
    honorariosRetentionRate: number;
  };
  warnings: string[];
};

export const OP_SPA_DOCUMENT_RECEIVER = {
  legalName: "OP SpA",
  tradeName: "OficiosPro.cl",
  rut: "RUT OP SpA por configurar",
  email: "contabilidad@oficiospro.cl",
  address: "Direccion tributaria OP SpA por configurar",
  activity: "Giro OP SpA por validar",
  validationRequired: true,
} as const;

export const specialistTaxTypeLabels: Record<SpecialistFormalizationTaxType, string> = {
  factura_afecta: "Emito factura afecta",
  boleta_honorarios: "Emito boleta de honorarios",
  factura_exenta: "Emito factura exenta",
  unknown: "No se como documentar aun",
};

export const requiredDocumentLabels: Record<RequiredSpecialistDocumentKind, string> = {
  factura_afecta: "Factura afecta emitida a OP SpA",
  boleta_honorarios: "Boleta de honorarios emitida a OP SpA",
  factura_exenta: "Factura exenta emitida a OP SpA",
  none: "Formalizacion pendiente antes de pagar",
};

export function requiredDocumentForTaxType(taxType: SpecialistFormalizationTaxType): RequiredSpecialistDocumentKind {
  if (taxType === "factura_afecta") return "factura_afecta";
  if (taxType === "boleta_honorarios") return "boleta_honorarios";
  if (taxType === "factura_exenta") return "factura_exenta";
  return "none";
}

export function formalizationStatusLabel(status: FormalizationStatus) {
  const labels: Record<FormalizationStatus, string> = {
    not_started: "Sin iniciar",
    collecting_data: "Recopilando datos",
    pending_secure_storage: "Pendiente storage seguro",
    pending_accountant_review: "Pendiente contador",
    pending_sii_validation: "Pendiente validacion SII",
    verified: "Verificado",
    blocked: "Bloqueado",
  };
  return labels[status];
}
