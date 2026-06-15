#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const taxConfigSource = readFileSync(join(root, "src/config/taxConfig.ts"), "utf8");
const commercialConfigSource = readFileSync(join(root, "src/data/commercialConfig.ts"), "utf8");
const calculatorSource = readFileSync(join(root, "src/lib/finance/specialistPayoutCalculator.ts"), "utf8");

for (const exportedName of [
  "calculatePlatformCommission",
  "calculatePayoutFromTarget",
  "calculateFeeReceiptScenario",
  "calculateInvoiceAfectaScenario",
  "calculateExemptInvoiceScenario",
  "calculateUnknownTaxScenario",
  "calculateCustomerPriceFromSpecialistTarget",
  "calculateSpecialistLiquidFromCustomerPrice",
]) {
  if (!calculatorSource.includes(`function ${exportedName}`)) fail(`Missing calculator export: ${exportedName}`);
}

const taxConfig = {
  id: readString(taxConfigSource, "id"),
  ivaRate: readNumber(taxConfigSource, "ivaRate"),
  honorariosRetentionRate: readNumber(taxConfigSource, "honorariosRetentionRate"),
  platformCommission: {
    standardRate: readNumber(taxConfigSource, "standardRate"),
    ivaApplies: /ivaApplies:\s*true/.test(taxConfigSource),
    minimumCommissionCLP: readNumber(taxConfigSource, "minimumCommissionCLP"),
    commissionBaseMode: readString(taxConfigSource, "commissionBaseMode"),
    label: readString(taxConfigSource, "label"),
  },
};

const rule = {
  creditValueCLP: readNumber(commercialConfigSource, "customerCreditValueCLP"),
  creditRoundingStep: readNumber(commercialConfigSource, "creditRoundingStep"),
};

let failures = 0;

const feeReceipt = calculatePayoutFromTarget({ target: 25000, taxType: "boleta_honorarios", accountantReviewed: true, siiValidated: true });
assert("A liquid target stays close to 25000", Math.abs(feeReceipt.specialistLiquidPayoutCLP - 25000) <= 1);
assert("A gross fee receipt is above liquid", feeReceipt.specialistDocumentGrossCLP > 25000);
assert("A withholding is positive", feeReceipt.withholdingAmountCLP > 0);
assert("A platformCommissionRate comes from config", feeReceipt.platformCommissionRate === taxConfig.platformCommission.standardRate);
assert("A commission net is positive", feeReceipt.platformCommissionNetCLP > 0);
assert("A commission IVA is positive", feeReceipt.platformCommissionIvaCLP > 0);
assert("A commission gross equals net plus IVA", feeReceipt.platformCommissionGrossCLP === feeReceipt.platformCommissionNetCLP + feeReceipt.platformCommissionIvaCLP);
assert("A customer gross price is above gross fee receipt", feeReceipt.customerGrossPriceCLP > feeReceipt.specialistDocumentGrossCLP);
assert("A credits estimate is positive", feeReceipt.totalCreditsEstimate > 0);
assert("A expected fee receipt gross near reference", between(feeReceipt.specialistDocumentGrossCLP, 29400, 29600));
assert("A expected commission gross near reference", between(feeReceipt.platformCommissionGrossCLP, 3300, 3400));
assert("A expected customer price near reference", between(feeReceipt.customerGrossPriceCLP, 32700, 32950));

const invoice = calculatePayoutFromTarget({ target: 80000, taxType: "factura_afecta", accountantReviewed: true, siiValidated: true });
assert("B specialist IVA is positive", invoice.specialistIvaAmountCLP > 0);
assert("B commission IVA is positive", invoice.platformCommissionIvaCLP > 0);
assert("B customer gross is above specialist document", invoice.customerGrossPriceCLP > invoice.specialistDocumentGrossCLP);

const exempt = calculatePayoutFromTarget({ target: 50000, taxType: "factura_exenta", accountantReviewed: true, siiValidated: true });
assert("C specialist IVA is zero", exempt.specialistIvaAmountCLP === 0);
assert("C commission IVA is positive when commission is affected", exempt.platformCommissionIvaCLP > 0);
assert("C payout allowed with validation", exempt.payoutAllowed === true);

const unknown = calculatePayoutFromTarget({ target: 50000, taxType: "unknown", accountantReviewed: false, siiValidated: false });
assert("D payout blocked", unknown.payoutAllowed === false);
assert("D commission is not definitive", unknown.platformCommissionGrossCLP === 0);
assert("D block reason formalization_required", unknown.blockReasons.includes("formalization_required"));

for (const [name, result] of [
  ["boleta honorarios 25k", feeReceipt],
  ["factura afecta 80k", invoice],
  ["factura exenta", exempt],
  ["unknown", unknown],
]) printResult(name, result);

console.log(`\nCalculator smoke test finished with ${failures} failure(s).`);
console.log("Commission rate, IVA and credit conversion are read from config and remain referential until accountant/SII validation.");
process.exitCode = failures ? 1 : 0;

function calculatePayoutFromTarget({ target, taxType, accountantReviewed, siiValidated }) {
  const document = calculateSpecialistDocument(taxType, money(target), taxConfig);
  const blockReasons = [];
  if (taxType === "unknown") blockReasons.push("formalization_required");
  if (taxType === "unknown") {
    return {
      taxType,
      requiredDocumentType: "none",
      payoutAllowed: false,
      blockReasons,
      specialistDocumentGrossCLP: 0,
      specialistDocumentNetCLP: 0,
      specialistIvaAmountCLP: 0,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: 0,
      platformCommissionBaseCLP: 0,
      platformCommissionRate: taxConfig.platformCommission.standardRate,
      platformCommissionNetCLP: 0,
      platformCommissionIvaCLP: 0,
      platformCommissionGrossCLP: 0,
      customerGrossPriceCLP: 0,
      totalCreditsEstimate: 0,
    };
  }
  if (!accountantReviewed) blockReasons.push("pending_accountant_review");
  if (!siiValidated) blockReasons.push("pending_sii_validation");
  const commission = calculatePlatformCommission(document);
  const customerGrossPriceCLP = money(document.specialistDocumentGrossCLP + commission.platformCommissionGrossCLP);
  return {
    taxType,
    requiredDocumentType: taxType,
    payoutAllowed: blockReasons.length === 0,
    blockReasons,
    ...document,
    platformCommissionBaseCLP: commission.platformCommissionBaseCLP,
    platformCommissionRate: taxConfig.platformCommission.standardRate,
    platformCommissionNetCLP: commission.platformCommissionNetCLP,
    platformCommissionIvaCLP: commission.platformCommissionIvaCLP,
    platformCommissionGrossCLP: commission.platformCommissionGrossCLP,
    customerGrossPriceCLP,
    totalCreditsEstimate: roundCredits(customerGrossPriceCLP / rule.creditValueCLP, rule.creditRoundingStep),
  };
}

function calculatePlatformCommission(document) {
  const platformCommissionBaseCLP = taxConfig.platformCommission.commissionBaseMode === "specialist_net"
    ? document.specialistDocumentNetCLP
    : document.specialistDocumentGrossCLP;
  const platformCommissionNetCLP = Math.max(
    money(platformCommissionBaseCLP * taxConfig.platformCommission.standardRate),
    taxConfig.platformCommission.minimumCommissionCLP,
  );
  const platformCommissionIvaCLP = taxConfig.platformCommission.ivaApplies
    ? money(platformCommissionNetCLP * taxConfig.ivaRate)
    : 0;
  return {
    platformCommissionBaseCLP,
    platformCommissionNetCLP,
    platformCommissionIvaCLP,
    platformCommissionGrossCLP: platformCommissionNetCLP + platformCommissionIvaCLP,
  };
}

function calculateSpecialistDocument(taxType, target, config) {
  if (taxType === "boleta_honorarios") {
    const gross = money(target / Math.max(0.01, 1 - config.honorariosRetentionRate));
    const withholding = money(gross * config.honorariosRetentionRate);
    return {
      specialistDocumentGrossCLP: gross,
      specialistDocumentNetCLP: gross,
      specialistIvaAmountCLP: 0,
      ivaAmountCLP: 0,
      withholdingAmountCLP: withholding,
      specialistLiquidPayoutCLP: Math.max(0, gross - withholding),
    };
  }
  if (taxType === "factura_afecta") {
    const iva = money(target * config.ivaRate);
    return {
      specialistDocumentGrossCLP: target + iva,
      specialistDocumentNetCLP: target,
      specialistIvaAmountCLP: iva,
      ivaAmountCLP: iva,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: target + iva,
    };
  }
  if (taxType === "factura_exenta") {
    return {
      specialistDocumentGrossCLP: target,
      specialistDocumentNetCLP: target,
      specialistIvaAmountCLP: 0,
      ivaAmountCLP: 0,
      withholdingAmountCLP: 0,
      specialistLiquidPayoutCLP: target,
    };
  }
  return {
    specialistDocumentGrossCLP: 0,
    specialistDocumentNetCLP: 0,
    specialistIvaAmountCLP: 0,
    ivaAmountCLP: 0,
    withholdingAmountCLP: 0,
    specialistLiquidPayoutCLP: 0,
  };
}

function printResult(name, result) {
  console.log(
    [
      name.padEnd(22),
      `allowed=${result.payoutAllowed}`,
      `base=${result.platformCommissionBaseCLP}`,
      `rate=${result.platformCommissionRate}`,
      `commissionNet=${result.platformCommissionNetCLP}`,
      `commissionIva=${result.platformCommissionIvaCLP}`,
      `commissionGross=${result.platformCommissionGrossCLP}`,
      `customerGross=${result.customerGrossPriceCLP}`,
      `credits=${result.totalCreditsEstimate}`,
    ].join(" | "),
  );
}

function assert(label, condition) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${label}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function between(value, min, max) {
  return value >= min && value <= max;
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
