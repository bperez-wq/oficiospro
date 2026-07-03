import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculatePayoutFromTarget,
  calculateSpecialistLiquidFromCustomerPrice,
  commissionRuleFromCommercialConfig,
  money,
  roundCredits,
} from "./specialistPayoutCalculator";
import { chileTaxConfig2026 } from "../../config/taxConfig";

// Estos tests importan el CODIGO REAL (no una reimplementacion). Si la logica
// de pricing cambia de forma incompatible, estas aserciones deben fallar.

const rule = commissionRuleFromCommercialConfig();

test("money() nunca devuelve negativos ni NaN", () => {
  assert.equal(money(-500), 0);
  assert.equal(money(Number.NaN), 0);
  assert.equal(money(1234.6), 1235);
});

test("roundCredits() redondea hacia arriba al paso configurado", () => {
  assert.equal(roundCredits(10.1, 2), 12);
  assert.equal(roundCredits(0, 2), 0);
  assert.equal(roundCredits(7, 1), 7);
});

test("boleta_honorarios validada permite pago y conserva el liquido objetivo", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 25000,
    taxType: "boleta_honorarios",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  assert.equal(r.payoutAllowed, true);
  assert.equal(r.blockReasons.length, 0);
  // El liquido al especialista debe quedar muy cerca del objetivo declarado.
  assert.ok(Math.abs(r.specialistLiquidPayoutCLP - 25000) <= 2, `liquido=${r.specialistLiquidPayoutCLP}`);
  // El documento bruto (con retencion bruteada) es mayor al liquido.
  assert.ok(r.specialistDocumentGrossCLP > 25000);
  assert.ok(r.withholdingAmountCLP > 0);
  // La comisión de plataforma es positiva y el precio al cliente la incluye.
  assert.ok(r.platformCommissionGrossCLP > 0);
  assert.equal(
    r.customerGrossPriceCLP,
    r.specialistDocumentGrossCLP + r.platformCommissionGrossCLP,
  );
  assert.ok(r.totalCreditsEstimate > 0);
});

test("factura_afecta agrega IVA del especialista", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 80000,
    taxType: "factura_afecta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  assert.ok(r.specialistIvaAmountCLP > 0);
  assert.equal(r.specialistDocumentGrossCLP, r.specialistDocumentNetCLP + r.specialistIvaAmountCLP);
  assert.ok(r.customerGrossPriceCLP > r.specialistDocumentGrossCLP);
});

test("factura_exenta no lleva IVA del especialista pero la comisión si", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 50000,
    taxType: "factura_exenta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  assert.equal(r.specialistIvaAmountCLP, 0);
  assert.ok(r.platformCommissionIvaCLP > 0, "la comisión de plataforma debe llevar IVA");
});

test("tipo tributario desconocido bloquea el pago y no fija precio", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 50000,
    taxType: "unknown",
    commissionRule: rule,
    accountantReviewed: false,
    siiValidated: false,
  });
  assert.equal(r.payoutAllowed, false);
  assert.ok(r.blockReasons.includes("formalization_required"));
  assert.equal(r.customerGrossPriceCLP, 0);
  assert.equal(r.platformCommissionGrossCLP, 0);
});

test("falta de revision contable o SII bloquea aunque el calculo exista", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 30000,
    taxType: "boleta_honorarios",
    commissionRule: rule,
    accountantReviewed: false,
    siiValidated: false,
  });
  assert.equal(r.payoutAllowed, false);
  assert.ok(r.blockReasons.includes("pending_accountant_review"));
  assert.ok(r.blockReasons.includes("pending_sii_validation"));
  // El calculo referencial igual se entrega para mostrar al equipo.
  assert.ok(r.customerGrossPriceCLP > 0);
});

test("multiplicador de emergencia incrementa el precio al cliente", () => {
  const base = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 40000,
    taxType: "factura_afecta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  const emergency = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 40000,
    taxType: "factura_afecta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
    emergencyMultiplier: 1.35,
  });
  assert.ok(emergency.customerGrossPriceCLP > base.customerGrossPriceCLP);
});

test("ida y vuelta: liquido desde precio cliente reconstruye un objetivo coherente", () => {
  const forward = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 60000,
    taxType: "factura_afecta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  const back = calculateSpecialistLiquidFromCustomerPrice({
    customerChargeCLP: forward.customerGrossPriceCLP,
    taxType: "factura_afecta",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  // Tolerancia por redondeos de IVA/comisión.
  const diff = Math.abs(back.customerGrossPriceCLP - forward.customerGrossPriceCLP);
  assert.ok(diff <= forward.customerGrossPriceCLP * 0.02, `diff=${diff}`);
});

test("el snapshot de tasas refleja la config tributaria vigente", () => {
  const r = calculatePayoutFromTarget({
    specialistTargetAmountCLP: 25000,
    taxType: "boleta_honorarios",
    commissionRule: rule,
    accountantReviewed: true,
    siiValidated: true,
  });
  assert.equal(r.rateSnapshot.taxConfigId, chileTaxConfig2026.id);
  assert.equal(r.rateSnapshot.ivaRate, chileTaxConfig2026.ivaRate);
  assert.equal(r.platformCommissionRate, chileTaxConfig2026.platformCommission.standardRate);
});
