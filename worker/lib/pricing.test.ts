import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateWorkerClientCredits, normalizeMoney, workerPricingConfig } from "./pricing";

test("normalizeMoney descarta negativos y no-numeros", () => {
  assert.equal(normalizeMoney("1500"), 1500);
  assert.equal(normalizeMoney(-10), 0);
  assert.equal(normalizeMoney("abc"), 0);
  assert.equal(normalizeMoney(1234.6), 1235);
});

test("calculateWorkerClientCredits respeta el minimo de creditos", () => {
  // Un payout muy bajo igual debe entregar el minimo configurado.
  assert.equal(calculateWorkerClientCredits(0, false), workerPricingConfig.minimumClientCredits);
});

test("calculateWorkerClientCredits redondea hacia arriba al paso configurado", () => {
  const credits = calculateWorkerClientCredits(30000, false);
  assert.equal(credits % workerPricingConfig.creditRoundingStep, 0, "debe ser multiplo del paso");
  assert.ok(credits >= workerPricingConfig.minimumClientCredits);
});

test("el modo emergencia incrementa los creditos cobrados al cliente", () => {
  const normal = calculateWorkerClientCredits(50000, false);
  const emergency = calculateWorkerClientCredits(50000, true);
  assert.ok(emergency > normal, `normal=${normal} emergency=${emergency}`);
});

test("el precio base aplica margen + fees + fee fijo sobre el payout", () => {
  const payout = 50000;
  const credits = calculateWorkerClientCredits(payout, false);
  // El cliente siempre paga mas creditos que el payout/valorCredito (hay margen).
  const payoutInCredits = payout / workerPricingConfig.customerCreditValueCLP;
  assert.ok(credits > payoutInCredits, `credits=${credits} payoutInCredits=${payoutInCredits}`);
});

// GUARD DE INCONSISTENCIA CONOCIDA (no es un bug del test):
// El worker usa un modelo de margen variable (platformFeePercent 0.18 + fees)
// mientras src/config/taxConfig + src/lib/finance usan comision fija 9.5%.
// Este test FIJA el valor actual del worker para que cualquier cambio sea
// deliberado y para dejar rastro de la divergencia a reconciliar.
test("[guard] config de pricing del worker conserva sus valores actuales", () => {
  assert.equal(workerPricingConfig.platformFeePercent, 0.18);
  assert.equal(workerPricingConfig.paymentFeePercent, 0.035);
  assert.equal(workerPricingConfig.riskBufferPercent, 0.04);
  assert.equal(workerPricingConfig.customerCreditValueCLP, 1000);
  assert.equal(workerPricingConfig.minimumClientCredits, 12);
});
