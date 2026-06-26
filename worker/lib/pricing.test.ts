import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateWorkerClientCredits, normalizeMoney, platformCommissionCLP, workerPricingConfig } from "./pricing";

test("normalizeMoney descarta negativos y no-numeros", () => {
  assert.equal(normalizeMoney("1500"), 1500);
  assert.equal(normalizeMoney(-10), 0);
  assert.equal(normalizeMoney("abc"), 0);
  assert.equal(normalizeMoney(1234.6), 1235);
});

test("la comision aplica el minimo de $3.000 + IVA en montos bajos", () => {
  // 10.000 x 9,5% = 950 -> bajo el minimo, se usa 3.000 neto.
  // 3.000 x 1,19 = 3.570 con IVA.
  assert.equal(platformCommissionCLP(10000), 3570);
});

test("la comision usa 9,5% + IVA cuando supera el minimo", () => {
  // 50.000 x 9,5% = 4.750 neto -> 4.750 x 1,19 = 5.652,5 -> 5.653.
  assert.equal(platformCommissionCLP(50000), 5653);
});

test("calculateWorkerClientCredits: ejemplos de referencia en creditos", () => {
  // payout 25.000 -> comision minima 3.570 -> cliente 28.570 -> 29 creditos.
  assert.equal(calculateWorkerClientCredits(25000, false), 29);
  // payout 10.000 -> comision minima -> 13.570 -> 14 creditos.
  assert.equal(calculateWorkerClientCredits(10000, false), 14);
  // payout 50.000 -> 55.653 -> 56 creditos.
  assert.equal(calculateWorkerClientCredits(50000, false), 56);
});

test("el modo emergencia incrementa los creditos cobrados al cliente", () => {
  const normal = calculateWorkerClientCredits(25000, false);
  const emergency = calculateWorkerClientCredits(25000, true);
  assert.ok(emergency > normal, `normal=${normal} emergency=${emergency}`);
});

test("el cliente siempre paga el payout mas la comision (con piso)", () => {
  // Incluso con payout 0, hay comision minima -> al menos ceil(3.570/1.000) = 4 creditos.
  assert.equal(calculateWorkerClientCredits(0, false), 4);
});

test("[guard] config de pricing del worker = modelo OficiosPro (9,5% + IVA, min $3.000)", () => {
  assert.equal(workerPricingConfig.commissionRate, 0.095);
  assert.equal(workerPricingConfig.ivaRate, 0.19);
  assert.equal(workerPricingConfig.minimumCommissionCLP, 3000);
  assert.equal(workerPricingConfig.customerCreditValueCLP, 1000);
});
