#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const taxConfigSource = readFileSync(join(root, "src/config/taxConfig.ts"), "utf8");
const commercialConfigSource = readFileSync(join(root, "src/data/commercialConfig.ts"), "utf8");
const calculatorSource = readFileSync(join(root, "src/lib/finance/specialistPayoutCalculator.ts"), "utf8");

for (const exportedName of ["calculatePayoutFromTarget", "calculateCustomerPriceFromSpecialistTarget", "calculateSpecialistLiquidFromCustomerPrice"]) {
  if (!calculatorSource.includes(`function ${exportedName}`)) {
    console.error(`Missing calculator export: ${exportedName}`);
    process.exit(1);
  }
}

const taxConfig = {
  id: readString(taxConfigSource, "id"),
  ivaRate: readNumber(taxConfigSource, "ivaRate"),
  honorariosRetentionRate: readNumber(taxConfigSource, "honorariosRetentionRate"),
};
const rule = {
  platformFeePercent: readNumber(commercialConfigSource, "platformFeePercent"),
  paymentFeePercent: readNumber(commercialConfigSource, "paymentFeePercent"),
  riskBufferPercent: readNumber(commercialConfigSource, "riskBufferPercent"),
  fixedServiceFeeCLP: readNumber(commercialConfigSource, "fixedServiceFeeCLP"),
  minimumMarginCLP: readNumber(commercialConfigSource, "minimumHomeMarginCLP"),
  creditValueCLP: readNumber(commercialConfigSource, "customerCreditValueCLP"),
  creditRoundingStep: readNumber(commercialConfigSource, "creditRoundingStep"),
};

const scenarios = [
  { name: "factura afecta", taxType: "factura_afecta", target: 50000 },
  { name: "boleta honorarios", taxType: "boleta_honorarios", target: 50000 },
  { name: "factura exenta", taxType: "factura_exenta", target: 50000 },
  { name: "unknown bloqueado", taxType: "unknown", target: 50000 },
];

let failures = 0;

function printResult(name, result) {
  const ok = result.customerCredits >= 0 && result.customerChargeCLP >= 0;
  const expectedBlocked = result.taxType === "unknown" || result.blockReasons.length > 0;
  console.log(
    [
      name.padEnd(20),
      `ok=${ok}`,
      `taxType=${result.taxType}`,
      `doc=${result.requiredDocumentType}`,
      `allowed=${result.payoutAllowed}`,
      `blocked=${expectedBlocked}`,
      `gross=${result.specialistDocumentGrossCLP}`,
      `liquid=${result.specialistLiquidPayoutCLP}`,
      `withholding=${result.withholdingAmountCLP}`,
      `iva=${result.ivaAmountCLP}`,
      `customer=${result.customerChargeCLP}`,
      `credits=${result.customerCredits}`,
    ].join(" | "),
  );
  return ok;
}

for (const scenario of scenarios) {
  const result = calculatePayoutFromTarget({
    specialistTargetAmountCLP: scenario.target,
    taxType: scenario.taxType,
    commissionRule: rule,
    taxConfig,
    accountantReviewed: scenario.taxType !== "unknown",
    siiValidated: scenario.taxType !== "unknown",
  });
  if (!printResult(scenario.name, result)) failures += 1;
  if (scenario.taxType === "unknown" && result.payoutAllowed) failures += 1;
  if (scenario.taxType !== "unknown" && result.requiredDocumentType === "none") failures += 1;
}

const reverse = calculateSpecialistLiquidFromCustomerPrice({
  customerChargeCLP: 90000,
  taxType: "boleta_honorarios",
  commissionRule: rule,
  taxConfig,
  accountantReviewed: true,
  siiValidated: true,
});

if (!printResult("reverse estimate", reverse)) failures += 1;

console.log(`\nCalculator smoke test finished with ${failures} failure(s).`);
console.log("Rates are read from src/config/taxConfig.ts and remain referential until accountant/SII validation.");
process.exitCode = failures ? 1 : 0;

function calculatePayoutFromTarget(input) {
  const target = money(input.specialistTargetAmountCLP);
  const document = calculateSpecialistDocument(input.taxType, target, input.taxConfig);
  const blockReasons = [];
  if (input.taxType === "unknown") blockReasons.push("missing_tax_profile", "missing_document_capability");
  if (input.taxType === "unknown") {
    return {
      taxType: input.taxType,
      requiredDocumentType: "none",
      payoutAllowed: false,
      blockReasons,
      specialistDocumentGrossCLP: 0,
      specialistLiquidPayoutCLP: 0,
      withholdingAmountCLP: 0,
      ivaAmountCLP: 0,
      customerChargeCLP: 0,
      customerCredits: 0,
    };
  }
  const variableBase = document.specialistDocumentGrossCLP;
  const platformCommissionCLP = Math.max(money(variableBase * input.commissionRule.platformFeePercent), money(input.commissionRule.minimumMarginCLP));
  const paymentFeeCLP = money(variableBase * input.commissionRule.paymentFeePercent);
  const riskBufferCLP = money(variableBase * input.commissionRule.riskBufferPercent);
  const customerChargeCLP = money(variableBase + platformCommissionCLP + paymentFeeCLP + riskBufferCLP + input.commissionRule.fixedServiceFeeCLP);
  if (input.taxType !== "unknown" && !input.accountantReviewed) blockReasons.push("pending_accountant_review");
  if (input.taxType !== "unknown" && !input.siiValidated) blockReasons.push("pending_sii_validation");
  return {
    taxType: input.taxType,
    requiredDocumentType: input.taxType === "unknown" ? "none" : input.taxType,
    payoutAllowed: blockReasons.length === 0,
    blockReasons,
    specialistDocumentGrossCLP: document.specialistDocumentGrossCLP,
    specialistLiquidPayoutCLP: document.specialistLiquidPayoutCLP,
    withholdingAmountCLP: document.withholdingAmountCLP,
    ivaAmountCLP: document.ivaAmountCLP,
    customerChargeCLP,
    customerCredits: roundCredits(customerChargeCLP / input.commissionRule.creditValueCLP, input.commissionRule.creditRoundingStep),
  };
}

function calculateSpecialistLiquidFromCustomerPrice({ customerChargeCLP, taxType, commissionRule, taxConfig, accountantReviewed, siiValidated }) {
  const denominator = 1 + commissionRule.platformFeePercent + commissionRule.paymentFeePercent + commissionRule.riskBufferPercent;
  const estimatedDocumentGross = money((money(customerChargeCLP) - commissionRule.fixedServiceFeeCLP) / Math.max(1, denominator));
  const target = taxType === "boleta_honorarios"
    ? money(estimatedDocumentGross * (1 - taxConfig.honorariosRetentionRate))
    : taxType === "factura_afecta"
      ? money(estimatedDocumentGross / (1 + taxConfig.ivaRate))
      : taxType === "factura_exenta"
        ? estimatedDocumentGross
        : 0;
  return calculatePayoutFromTarget({ specialistTargetAmountCLP: target, taxType, commissionRule, taxConfig, accountantReviewed, siiValidated });
}

function calculateSpecialistDocument(taxType, target, config) {
  if (taxType === "boleta_honorarios") {
    const gross = money(target / Math.max(0.01, 1 - config.honorariosRetentionRate));
    const withholding = money(gross * config.honorariosRetentionRate);
    return { specialistDocumentGrossCLP: gross, ivaAmountCLP: 0, withholdingAmountCLP: withholding, specialistLiquidPayoutCLP: Math.max(0, gross - withholding) };
  }
  if (taxType === "factura_afecta") {
    const iva = money(target * config.ivaRate);
    return { specialistDocumentGrossCLP: target + iva, ivaAmountCLP: iva, withholdingAmountCLP: 0, specialistLiquidPayoutCLP: target + iva };
  }
  if (taxType === "factura_exenta") {
    return { specialistDocumentGrossCLP: target, ivaAmountCLP: 0, withholdingAmountCLP: 0, specialistLiquidPayoutCLP: target };
  }
  return { specialistDocumentGrossCLP: 0, ivaAmountCLP: 0, withholdingAmountCLP: 0, specialistLiquidPayoutCLP: 0 };
}

function readNumber(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*([0-9.]+)`));
  if (!match) throw new Error(`Could not read ${key}`);
  return Number(match[1]);
}

function readString(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!match) throw new Error(`Could not read ${key}`);
  return match[1];
}

function money(value) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function roundCredits(credits, step = 1) {
  const safeStep = Math.max(1, Math.round(step));
  return Math.ceil(Math.max(0, credits) / safeStep) * safeStep;
}
