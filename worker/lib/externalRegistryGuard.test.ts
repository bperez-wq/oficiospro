import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertRealSecImportAllowed,
  externalRegistryActionError,
  isExternalRegistryPath,
  isTruthyFlag,
} from "./externalRegistryGuard";

test("external registry paths are detectable for X-Robots-Tag", () => {
  assert.equal(isExternalRegistryPath("/registro-publico-externo/sec"), true);
  assert.equal(isExternalRegistryPath("/especialistas"), false);
});

test("unclaimed external targets block booking and quotation", () => {
  assert.equal(
    externalRegistryActionError("booking", { specialistId: "sec-prototype-001" }),
    "external_registry_booking_blocked_unclaimed_profile",
  );
  assert.equal(
    externalRegistryActionError("quotation", { profileStatus: "UNCLAIMED_PUBLIC_REFERENCE" }),
    "external_registry_quotation_blocked_unclaimed_profile",
  );
  assert.equal(externalRegistryActionError("booking", { specialistId: "victor-araya" }), null);
});

test("ALLOW_REAL_SEC_IMPORT must be explicitly true", () => {
  assert.equal(isTruthyFlag("true"), true);
  assert.equal(isTruthyFlag("false"), false);
  assert.throws(() => assertRealSecImportAllowed(false), /real_sec_import_blocked_pending_legal_review/);
});
