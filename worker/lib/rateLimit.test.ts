import assert from "node:assert/strict";
import { test } from "node:test";

import { createMemoryRateLimitStore, hitRateLimit, rateLimitKeys } from "./rateLimit";

test("hitRateLimit permite hasta el limite y bloquea al superarlo", () => {
  const store = createMemoryRateLimitStore();
  const limit = 3;
  const window = 1000;
  // 3 golpes permitidos (count 1,2,3 -> no supera), el 4to bloquea.
  assert.equal(hitRateLimit(store, "k", limit, window, 0), false);
  assert.equal(hitRateLimit(store, "k", limit, window, 0), false);
  assert.equal(hitRateLimit(store, "k", limit, window, 0), false);
  assert.equal(hitRateLimit(store, "k", limit, window, 0), true);
});

test("hitRateLimit reinicia el contador cuando la ventana expira", () => {
  const store = createMemoryRateLimitStore();
  assert.equal(hitRateLimit(store, "k", 1, 1000, 0), false);
  assert.equal(hitRateLimit(store, "k", 1, 1000, 0), true); // segundo golpe en la ventana
  // pasada la ventana (now >= resetAt), vuelve a permitir
  assert.equal(hitRateLimit(store, "k", 1, 1000, 1000), false);
});

test("hitRateLimit cuenta cada clave de forma independiente", () => {
  const store = createMemoryRateLimitStore();
  assert.equal(hitRateLimit(store, "a", 1, 1000, 0), false);
  assert.equal(hitRateLimit(store, "a", 1, 1000, 0), true);
  // otra clave no se ve afectada por el bloqueo de "a"
  assert.equal(hitRateLimit(store, "b", 1, 1000, 0), false);
});

test("rateLimitKeys arma claves por ip/email/telefono y omite las vacias", () => {
  assert.deepEqual(rateLimitKeys("lead", { ip: "1.2.3.4", email: "a@b.cl", phone: "+56 9 1" }), [
    "lead:ip:1.2.3.4",
    "lead:email:a@b.cl",
    "lead:phone:+56 9 1",
  ]);
  assert.deepEqual(rateLimitKeys("lead", { ip: "1.2.3.4" }), ["lead:ip:1.2.3.4"]);
});
