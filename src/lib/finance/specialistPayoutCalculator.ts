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
    platformFeePercent: config.platformFeePercent,
    paymentFeePercent: config.paymentFeePercent,
    riskBufferPercent: config.riskBufferPercent,
    fixedServiceFeeCLP: config.fixedServiceFeeCLP,
    minimumMarginCLP: config.minimumHomeMarginCLP,
    creditValueCLP: config.customerCreditValueCLP,
    creditRoundingStep: config.creditRoundingStep,
  };
}

export function calculateCustomerPriceFromSpecialistTarget(input: SpecialistPayoutCalculationInput) {
  return calculatePayoutFromTarget(input);
}

export function calculatePayoutFromTarget(input: SpecialistPayoutCalculationInput): SpecialistPayoutCalculationResult {
  const taxConfig = input.taxConfig ?? chileTaxConfig2026;
  const rule = input.commissionRule;
  const specialistTargetAmountCLP = money(input.specialistTargetAmountCLP);
  const materialsCLP = money(input.includeMaterialsCLP ?? 0);
  const emergencyMultiplier = input.emergencyMultiplier && input.emergencyMultiplier > 0 ? input.emergencyMultiplier : 1;
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
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: 0,
      platformCommissionCLP: 0,
      paymentFeeCLP: 0,
      riskBufferCLP: 0,
      fixedServiceFeeCLP: 0,
      materialsCLP,
      customerChargeCLP: 0,
      customerCredits: 0,
      marginCLP: 0,
      rateSnapshot: {
        taxConfigId: taxConfig.id,
        ivaRate: taxConfig.ivaRate,
        honorariosRetentionRate: taxConfig.honorariosRetentionRate,
      },
      warnings: buildCalculationWarnings(input.taxType, taxConfig, blockReasons),
    };
  }
  const variableBase = document.specialistDocumentGrossCLP + materialsCLP;
  const platformCommissionCLP = Math.max(
    roundTaxCLP(variableBase * rule.platformFeePercent, taxConfig),
    money(rule.minimumMarginCLP),
  );
  const paymentFeeCLP = roundTaxCLP(variableBase * rule.paymentFeePercent, taxConfig);
  const riskBufferCLP = roundTaxCLP(variableBase * rule.riskBufferPercent, taxConfig);
  const fixedServiceFeeCLP = money(rule.fixedServiceFeeCLP);
  const subtotal = variableBase + platformCommissionCLP + paymentFeeCLP + riskBufferCLP + fixedServiceFeeCLP;
  const customerChargeCLP = money(subtotal * emergencyMultiplier);
  const customerCredits = roundCredits(customerChargeCLP / Math.max(1, rule.creditValueCLP), rule.creditRoundingStep);

  return {
    taxType: input.taxType,
    requiredDocumentType: requiredDocumentForTaxType(input.taxType),
    payoutAllowed: blockReasons.length === 0,
    blockReasons,
    specialistTargetAmountCLP,
    specialistDocumentGrossCLP: document.specialistDocumentGrossCLP,
    specialistDocumentNetCLP: document.specialistDocumentNetCLP,
    ivaAmountCLP: document.ivaAmountCLP,
    withholdingAmountCLP: document.withholdingAmountCLP,
    specialistLiquidPayoutCLP: document.specialistLiquidPayoutCLP,
    platformCommissionCLP,
    paymentFeeCLP,
    riskBufferCLP,
    fixedServiceFeeCLP,
    materialsCLP,
    customerChargeCLP,
    customerCredits,
    marginCLP: Math.max(0, customerChargeCLP - document.specialistDocumentGrossCLP - materialsCLP - paymentFeeCLP),
    rateSnapshot: {
      taxConfigId: taxConfig.id,
      ivaRate: taxConfig.ivaRate,
      honorariosRetentionRate: taxConfig.honorariosRetentionRate,
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
  const denominator =
    1 +
    commissionRule.platformFeePercent +
    commissionRule.paymentFeePercent +
    commissionRule.riskBufferPercent;
  const estimatedDocumentGross = Math.max(
    0,
    roundTaxCLP((charge - commissionRule.fixedServiceFeeCLP) / Math.max(1, denominator), taxConfig),
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
    reasons.push("missing_tax_profile", "missing_document_capability");
    return reasons;
  }
  if (!accountantReviewed) reasons.push("pending_accountant_review");
  if (!siiValidated) reasons.push("pending_sii_validation");
  return reasons;
}

function buildCalculationWarnings(taxType: SpecialistFormalizationTaxType, taxConfig: TaxConfigVersion, blockReasons: PayoutBlockReason[]) {
  const warnings = [
    "Calculo referencial. No constituye asesoria tributaria, legal ni contable.",
    "OficiosPro debe validar tasas, documentos y glosas con contador/SII antes de operar pagos reales.",
  ];
  if (taxType === "unknown") warnings.push("Sin tipo tributario confirmado, la liquidacion queda bloqueada.");
  if (blockReasons.includes("pending_accountant_review")) warnings.push("Falta revision contable antes de liberar pagos reales.");
  if (blockReasons.includes("pending_sii_validation")) warnings.push("Falta validacion SII o capacidad de emitir documento.");
  if (taxConfig.accountantValidationRequired) warnings.push("La configuracion tributaria vigente esta marcada como pendiente de validacion profesional.");
  return warnings;
}

export function money(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function roundCredits(credits: number, step = 1) {
  const safeStep = Math.max(1, Math.round(step));
  return Math.ceil(Math.max(0, credits) / safeStep) * safeStep;
}
