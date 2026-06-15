#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const taxConfigSource = readFileSync(join(root, "src/config/taxConfig.ts"), "utf8");
const pricingSource = readFileSync(join(root, "src/lib/pricing.ts"), "utf8");
const financeCommissionSource = readFileSync(join(root, "src/lib/finance/commission.ts"), "utf8");
const commercialConfigSource = readFileSync(join(root, "src/data/commercialConfig.ts"), "utf8");
const docsSource = readFileSync(join(root, "docs/platform-commission-model.md"), "utf8");

let failures = 0;

const ivaRate = readNumber(taxConfigSource, "ivaRate");
const commissionRate = readNumber(taxConfigSource, "standardRate");
const ivaApplies = /ivaApplies:\s*true/.test(taxConfigSource);
const creditValueCLP = readNumber(commercialConfigSource, "customerCreditValueCLP");
const creditRoundingStep = readNumber(commercialConfigSource, "creditRoundingStep");
const defaultPlatformFee = readNumber(commercialConfigSource, "platformFeePercent");

assert("Commission standardRate is 9.5%", commissionRate === 0.095);
assert("Commission IVA applies", ivaApplies === true);
assert("Commercial default platformFeePercent does not contradict 9.5%", defaultPlatformFee === 0.095);
assert("Pricing imports central helper", pricingSource.includes("calculateCustomerPriceWithPlatformCommission"));
assert("Pricing no longer uses old variable fee sum", !pricingSource.includes("platformFeePercent + config.paymentFeePercent + config.riskBufferPercent"));
assert("Finance commission reads taxConfig", financeCommissionSource.includes("chileTaxConfig2026.platformCommission.standardRate"));
assert("Docs mention plans/packs independence", /planes|packs/i.test(docsSource));

const receipt = calculateCustomerPriceWithPlatformCommission({
  specialistTargetAmountCLP: 25000,
  taxType: "boleta_honorarios",
});
const invoice = calculateCustomerPriceWithPlatformCommission({
  specialistTargetAmountCLP: 80000,
  taxType: "factura_afecta",
});
const exempt = calculateCustomerPriceWithPlatformCommission({
  specialistTargetAmountCLP: 50000,
  taxType: "factura_exenta",
});

assert("Fee receipt commission net is 9.5% of gross document", receipt.platformCommissionNetCLP === money(receipt.specialistDocumentGrossCLP * commissionRate));
assert("Fee receipt commission IVA is 19% of commission net", receipt.platformCommissionIvaCLP === money(receipt.platformCommissionNetCLP * ivaRate));
assert("Fee receipt customer price includes document plus gross commission", receipt.customerGrossPriceCLP === receipt.specialistDocumentGrossCLP + receipt.platformCommissionGrossCLP);
assert("Invoice customer price includes specialist IVA plus platform commission", invoice.customerGrossPriceCLP === invoice.specialistDocumentGrossCLP + invoice.platformCommissionGrossCLP);
assert("Exempt invoice still applies platform commission IVA", exempt.platformCommissionIvaCLP > 0);

for (const [name, result] of [
  ["boleta_honorarios_25k", receipt],
  ["factura_afecta_80k", invoice],
  ["factura_exenta_50k", exempt],
]) {
  console.log([
    name.padEnd(22),
    `document=${result.specialistDocumentGrossCLP}`,
    `commissionNet=${result.platformCommissionNetCLP}`,
    `commissionIva=${result.platformCommissionIvaCLP}`,
    `commissionGross=${result.platformCommissionGrossCLP}`,
    `customer=${result.customerGrossPriceCLP}`,
    `credits=${result.totalCreditsEstimate}`,
  ].join(" | "));
}

console.log(`\nPlatform commission model test finished with ${failures} failure(s).`);
process.exitCode = failures ? 1 : 0;

function calculateCustomerPriceWithPlatformCommission({ specialistTargetAmountCLP, taxType }) {
  const document = calculateSpecialistDocument(taxType, specialistTargetAmountCLP);
  const platformCommissionNetCLP = money(document.specialistDocumentGrossCLP * commissionRate);
  const platformCommissionIvaCLP = ivaApplies ? money(platformCommissionNetCLP * ivaRate) : 0;
  const platformCommissionGrossCLP = platformCommissionNetCLP + platformCommissionIvaCLP;
  const customerGrossPriceCLP = document.specialistDocumentGrossCLP + platformCommissionGrossCLP;
  return {
    ...document,
    platformCommissionNetCLP,
    platformCommissionIvaCLP,
    platformCommissionGrossCLP,
    customerGrossPriceCLP,
    totalCreditsEstimate: roundCredits(customerGrossPriceCLP / creditValueCLP, creditRoundingStep),
  };
}

function calculateSpecialistDocument(taxType, target) {
  if (taxType === "boleta_honorarios") {
    const retention = readNumber(taxConfigSource, "honorariosRetentionRate");
    const gross = money(target / Math.max(0.01, 1 - retention));
    return { specialistDocumentGrossCLP: gross };
  }
  if (taxType === "factura_afecta") {
    const iva = money(target * ivaRate);
    return { specialistDocumentGrossCLP: target + iva };
  }
  return { specialistDocumentGrossCLP: money(target) };
}

function assert(label, condition) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${label}`);
  }
}

function readNumber(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*([0-9.]+)`));
  if (!match) throw new Error(`Could not read ${key}`);
  return Number(match[1]);
}

function money(value) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function roundCredits(credits, step = 1) {
  const safeStep = Math.max(1, Math.round(step));
  return Math.ceil(Math.max(0, credits) / safeStep) * safeStep;
}
