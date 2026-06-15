import { chileTaxConfig2026, roundTaxCLP, type TaxConfigVersion } from "../../config/taxConfig";
import { defaultCommercialConfig, type CommercialPricingConfig } from "../../data/commercialConfig";
import {
  requiredDocumentForTaxType,
  type CommissionRule,
  type PayoutBlockReason,
  type SpecialistFormalizationTaxType,
  type SpecialistPayoutCalculationInput,
  type SpecialistPayoutCalculationResult,
} from "../../data/specialistFormalization";

export function commissionRuleFromCommercialConfig(config: CommercialPricingConfig = defaultCommercialConfig): CommissionRule {
  return {
    creditValueCLP: config.customerCreditValueCLP,
    creditRoundingStep: config.creditRoundingStep,
  };
}

export function calculatePlatformCommission({
  specialistDocumentGrossCLP,
  specialistDocumentNetCLP,
  materialsCLP = 0,
  additionalApprovedCLP = 0,
  surchargeCLP = 0,
  discountCLP = 0,
  manualCommissionBaseCLP,
  taxConfig = chileTaxConfig2026,
}: {
  specialistDocumentGrossCLP: number;
  specialistDocumentNetCLP: number;
  materialsCLP?: number;
  additionalApprovedCLP?: number;
  surchargeCLP?: number;
  discountCLP?: number;
  manualCommissionBaseCLP?: number;
  taxConfig?: TaxConfigVersion;
}) {
  const commissionConfig = taxConfig.platformCommission;
  const platformCommissionBaseCLP = resolveCommissionBase({
    mode: commissionConfig.commissionBaseMode,
    specialistDocumentGrossCLP,
    specialistDocumentNetCLP,
    materialsCLP,
    additionalApprovedCLP,
    surchargeCLP,
    discountCLP,
    manualCommissionBaseCLP,
  });
  const rawNet = roundTaxCLP(platformCommissionBaseCLP * commissionConfig.standardRate, taxConfig);
  const minApplied = Math.max(rawNet, money(commissionConfig.minimumCommissionCLP));
  const platformCommissionNetCLP = commissionConfig.maximumCommissionCLP === null
    ? minApplied
    : Math.min(minApplied, money(commissionConfig.maximumCommissionCLP));
  const platformCommissionIvaCLP = commissionConfig.ivaApplies
    ? roundTaxCLP(platformCommissionNetCLP * taxConfig.ivaRate, taxConfig)
    : 0;

  return {
    platformCommissionBaseCLP,
    platformCommissionBaseMode: commissionConfig.commissionBaseMode,
    platformCommissionRate: commissionConfig.standardRate,
    platformCommissionNetCLP,
    platformCommissionIvaCLP,
    platformCommissionGrossCLP: platformCommissionNetCLP + platformCommissionIvaCLP,
    platformCommissionLabel: commissionConfig.label,
  };
}

export function calculateCustomerPriceFromSpecialistTarget(input: SpecialistPayoutCalculationInput) {
  return calculatePayoutFromTarget(input);
}

export function calculateCustomerPriceWithPlatformCommission(input: SpecialistPayoutCalculationInput) {
  return calculatePayoutFromTarget(input);
}

export function calculatePayoutFromTarget(input: SpecialistPayoutCalculationInput): SpecialistPayoutCalculationResult {
  const taxConfig = input.taxConfig ?? chileTaxConfig2026;
  const rule = input.commissionRule;
  const specialistTargetAmountCLP = money(input.specialistTargetAmountCLP);
  const materialsCLP = money(input.includeMaterialsCLP ?? 0);
  const additionalApprovedCLP = money(rule.additionalApprovedCLP ?? 0);
  const surchargeCLP = money(rule.surchargeCLP ?? 0);
  const discountCLP = money(rule.discountCLP ?? 0);
  const emergencyMultiplier = input.emergencyMultiplier && input.emergencyMultiplier > 0
    ? input.emergencyMultiplier
    : 1;
  const document = calculateSpecialistDocument(input.taxType, specialistTargetAmountCLP, taxConfig);
  const blockReasons = resolveBlockReasons(input.taxType, input.accountantReviewed, input.siiValidated);
  if (input.taxType === "unknown") {
    return {
      taxType: input.taxType,
      requiredDocumentType: requiredDocumentForTaxType(input.taxType),
      payoutAllowed: false,
      blockReasons,
      specialistTargetAmountCLP,
      specialistDocumentGrossCLP: 0,
      specialistDocumentNetCLP: 0,
      ivaAmountCLP: 0,
      specialistIvaAmountCLP: 0,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: 0,
      platformCommissionBaseCLP: 0,
      platformCommissionBaseMode: taxConfig.platformCommission.commissionBaseMode,
      platformCommissionRate: taxConfig.platformCommission.standardRate,
      platformCommissionNetCLP: 0,
      platformCommissionIvaCLP: 0,
      platformCommissionGrossCLP: 0,
      platformCommissionLabel: taxConfig.platformCommission.label,
      platformCommissionCLP: 0,
      additionalApprovedCLP,
      surchargeCLP,
      discountCLP,
      materialsCLP,
      customerGrossPriceCLP: 0,
      totalCreditsEstimate: 0,
      customerChargeCLP: 0,
      customerCredits: 0,
      marginCLP: 0,
      rateSnapshot: {
        taxConfigId: taxConfig.id,
        ivaRate: taxConfig.ivaRate,
        honorariosRetentionRate: taxConfig.honorariosRetentionRate,
        platformCommissionRate: taxConfig.platformCommission.standardRate,
        platformCommissionIvaApplies: taxConfig.platformCommission.ivaApplies,
      },
      warnings: buildCalculationWarnings(input.taxType, taxConfig, blockReasons),
    };
  }
  const commission = calculatePlatformCommission({
    specialistDocumentGrossCLP: document.specialistDocumentGrossCLP,
    specialistDocumentNetCLP: document.specialistDocumentNetCLP,
    materialsCLP,
    additionalApprovedCLP,
    surchargeCLP,
    discountCLP,
    manualCommissionBaseCLP: rule.manualCommissionBaseCLP,
    taxConfig,
  });
  const subtotal =
    document.specialistDocumentGrossCLP +
    commission.platformCommissionGrossCLP +
    materialsCLP +
    additionalApprovedCLP +
    surchargeCLP -
    discountCLP;
  const customerGrossPriceCLP = money(subtotal * emergencyMultiplier);
  const totalCreditsEstimate = roundCredits(customerGrossPriceCLP / Math.max(1, rule.creditValueCLP), rule.creditRoundingStep);

  return {
    taxType: input.taxType,
    requiredDocumentType: requiredDocumentForTaxType(input.taxType),
    payoutAllowed: blockReasons.length === 0,
    blockReasons,
    specialistTargetAmountCLP,
    specialistDocumentGrossCLP: document.specialistDocumentGrossCLP,
    specialistDocumentNetCLP: document.specialistDocumentNetCLP,
    ivaAmountCLP: document.ivaAmountCLP,
    specialistIvaAmountCLP: document.ivaAmountCLP,
    withholdingAmountCLP: document.withholdingAmountCLP,
    specialistLiquidPayoutCLP: document.specialistLiquidPayoutCLP,
    platformCommissionBaseCLP: commission.platformCommissionBaseCLP,
    platformCommissionBaseMode: commission.platformCommissionBaseMode,
    platformCommissionRate: commission.platformCommissionRate,
    platformCommissionNetCLP: commission.platformCommissionNetCLP,
    platformCommissionIvaCLP: commission.platformCommissionIvaCLP,
    platformCommissionGrossCLP: commission.platformCommissionGrossCLP,
    platformCommissionLabel: commission.platformCommissionLabel,
    platformCommissionCLP: commission.platformCommissionGrossCLP,
    additionalApprovedCLP,
    surchargeCLP,
    discountCLP,
    materialsCLP,
    customerGrossPriceCLP,
    totalCreditsEstimate,
    customerChargeCLP: customerGrossPriceCLP,
    customerCredits: totalCreditsEstimate,
    marginCLP: commission.platformCommissionGrossCLP,
    rateSnapshot: {
      taxConfigId: taxConfig.id,
      ivaRate: taxConfig.ivaRate,
      honorariosRetentionRate: taxConfig.honorariosRetentionRate,
      platformCommissionRate: taxConfig.platformCommission.standardRate,
      platformCommissionIvaApplies: taxConfig.platformCommission.ivaApplies,
    },
    warnings: buildCalculationWarnings(input.taxType, taxConfig, blockReasons),
  };
}

export function calculateSpecialistLiquidFromCustomerPrice({
  customerChargeCLP,
  taxType,
  commissionRule,
  taxConfig = chileTaxConfig2026,
  accountantReviewed = false,
  siiValidated = false,
}: {
  customerChargeCLP: number;
  taxType: SpecialistFormalizationTaxType;
  commissionRule: CommissionRule;
  taxConfig?: TaxConfigVersion;
  accountantReviewed?: boolean;
  siiValidated?: boolean;
}) {
  const charge = money(customerChargeCLP);
  const commissionRate = taxConfig.platformCommission.standardRate * (taxConfig.platformCommission.ivaApplies ? 1 + taxConfig.ivaRate : 1);
  const denominator = 1 + commissionRate;
  const estimatedDocumentGross = Math.max(
    0,
    roundTaxCLP(charge / Math.max(1, denominator), taxConfig),
  );
  const target = targetFromDocumentGross(taxType, estimatedDocumentGross, taxConfig);
  return calculatePayoutFromTarget({
    specialistTargetAmountCLP: target,
    taxType,
    commissionRule,
    taxConfig,
    accountantReviewed,
    siiValidated,
  });
}

function calculateSpecialistDocument(taxType: SpecialistFormalizationTaxType, specialistTargetAmountCLP: number, taxConfig: TaxConfigVersion) {
  if (taxType === "boleta_honorarios") {
    const gross = taxConfig.honorariosRetentionRate >= 1
      ? specialistTargetAmountCLP
      : roundTaxCLP(specialistTargetAmountCLP / Math.max(0.01, 1 - taxConfig.honorariosRetentionRate), taxConfig);
    const withholding = roundTaxCLP(gross * taxConfig.honorariosRetentionRate, taxConfig);
    return {
      specialistDocumentGrossCLP: gross,
      specialistDocumentNetCLP: gross,
      ivaAmountCLP: 0,
      withholdingAmountCLP: withholding,
      specialistLiquidPayoutCLP: Math.max(0, gross - withholding),
    };
  }

  if (taxType === "factura_afecta") {
    const net = specialistTargetAmountCLP;
    const iva = roundTaxCLP(net * taxConfig.ivaRate, taxConfig);
    return {
      specialistDocumentGrossCLP: net + iva,
      specialistDocumentNetCLP: net,
      ivaAmountCLP: iva,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: net + iva,
    };
  }

  if (taxType === "factura_exenta") {
    return {
      specialistDocumentGrossCLP: specialistTargetAmountCLP,
      specialistDocumentNetCLP: specialistTargetAmountCLP,
      ivaAmountCLP: 0,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: specialistTargetAmountCLP,
    };
  }

  return {
    specialistDocumentGrossCLP: 0,
    specialistDocumentNetCLP: 0,
    ivaAmountCLP: 0,
    withholdingAmountCLP: 0,
    specialistLiquidPayoutCLP: 0,
  };
}

function targetFromDocumentGross(taxType: SpecialistFormalizationTaxType, grossCLP: number, taxConfig: TaxConfigVersion) {
  if (taxType === "boleta_honorarios") return money(grossCLP * (1 - taxConfig.honorariosRetentionRate));
  if (taxType === "factura_afecta") return money(grossCLP / (1 + taxConfig.ivaRate));
  if (taxType === "factura_exenta") return money(grossCLP);
  return 0;
}

function resolveBlockReasons(
  taxType: SpecialistFormalizationTaxType,
  accountantReviewed = false,
  siiValidated = false,
): PayoutBlockReason[] {
  const reasons: PayoutBlockReason[] = [];
  if (taxType === "unknown") {
    reasons.push("formalization_required");
    return reasons;
  }
  if (!accountantReviewed) reasons.push("pending_accountant_review");
  if (!siiValidated) reasons.push("pending_sii_validation");
  return reasons;
}

function buildCalculationWarnings(taxType: SpecialistFormalizationTaxType, taxConfig: TaxConfigVersion, blockReasons: PayoutBlockReason[]) {
  const warnings = [
    "Calculo referencial sujeto a validacion contable/SII. No constituye asesoria tributaria, legal ni contable.",
    "OficiosPro debe validar tasas, documentos y glosas con contador/SII antes de operar pagos reales.",
  ];
  if (taxType === "unknown") warnings.push("Sin tipo tributario confirmado, la liquidacion queda bloqueada.");
  if (blockReasons.includes("pending_accountant_review")) warnings.push("Falta revision contable antes de liberar pagos reales.");
  if (blockReasons.includes("pending_sii_validation")) warnings.push("Falta validacion SII o capacidad de emitir documento.");
  if (taxConfig.accountantValidationRequired) warnings.push("La configuracion tributaria vigente esta marcada como pendiente de validacion profesional.");
  return warnings;
}

export function calculateFeeReceiptScenario(input: Omit<SpecialistPayoutCalculationInput, "taxType">) {
  return calculatePayoutFromTarget({ ...input, taxType: "boleta_honorarios" });
}

export function calculateInvoiceAfectaScenario(input: Omit<SpecialistPayoutCalculationInput, "taxType">) {
  return calculatePayoutFromTarget({ ...input, taxType: "factura_afecta" });
}

export function calculateExemptInvoiceScenario(input: Omit<SpecialistPayoutCalculationInput, "taxType">) {
  return calculatePayoutFromTarget({ ...input, taxType: "factura_exenta" });
}

export function calculateUnknownTaxScenario(input: Omit<SpecialistPayoutCalculationInput, "taxType">) {
  return calculatePayoutFromTarget({ ...input, taxType: "unknown" });
}

function resolveCommissionBase({
  mode,
  specialistDocumentGrossCLP,
  specialistDocumentNetCLP,
  materialsCLP,
  additionalApprovedCLP,
  surchargeCLP,
  discountCLP,
  manualCommissionBaseCLP,
}: {
  mode: TaxConfigVersion["platformCommission"]["commissionBaseMode"];
  specialistDocumentGrossCLP: number;
  specialistDocumentNetCLP: number;
  materialsCLP: number;
  additionalApprovedCLP: number;
  surchargeCLP: number;
  discountCLP: number;
  manualCommissionBaseCLP?: number;
}) {
  if (mode === "specialist_net") return money(specialistDocumentNetCLP);
  if (mode === "customer_net_before_commission") {
    return money(specialistDocumentGrossCLP + materialsCLP + additionalApprovedCLP + surchargeCLP - discountCLP);
  }
  if (mode === "manual") return money(manualCommissionBaseCLP ?? specialistDocumentGrossCLP);
  return money(specialistDocumentGrossCLP);
}

export function money(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function roundCredits(credits: number, step = 1) {
  const safeStep = Math.max(1, Math.round(step));
  return Math.ceil(Math.max(0, credits) / safeStep) * safeStep;
}
