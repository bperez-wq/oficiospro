import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index";

const env = {
  ASSETS: {
    fetch: async () => new Response("not found", { status: 404 }),
  },
  ADMIN_TOKEN: "test-admin-token",
};

test("conversion events API accepts trailing slash", async () => {
  const response = await worker.fetch(
    new Request("https://www.oficiospro.cl/api/conversion-events/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "routing_test", payload: { source: "unit_test" } }),
    }),
    env,
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 200);
  assert.equal(data.error, "database_not_configured");
});

test("health check returns safe Worker readiness metadata", async () => {
  const response = await worker.fetch(new Request("https://www.oficiospro.cl/api/health"), env);
  const data = (await response.json()) as { ok?: boolean; service?: string; dbConfigured?: boolean; assetsConfigured?: boolean };

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.service, "oficiospro-web");
  assert.equal(data.dbConfigured, false);
  assert.equal(data.assetsConfigured, true);
});

test("CRM work queue API accepts trailing slash", async () => {
  const response = await worker.fetch(
    new Request("https://www.oficiospro.cl/api/admin/crm/work-queue/", {
      headers: {
        Authorization: "Bearer test-admin-token",
        "x-admin-token": "test-admin-token",
      },
    }),
    env,
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 503);
  assert.equal(data.error, "database_not_configured");
});

test("external public registry pages receive X-Robots-Tag noindex", async () => {
  const response = await worker.fetch(new Request("https://www.oficiospro.cl/registro-publico-externo/sec/sec-prototype-001"), env);

  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
});

test("booking API rejects unclaimed external registry targets", async () => {
  const response = await worker.fetch(
    new Request("https://www.oficiospro.cl/api/bookings/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Cliente Test",
        email: "cliente@example.com",
        service: "Electricidad",
        communeName: "Las Condes",
        specialistId: "sec-prototype-001",
        profileStatus: "UNCLAIMED_PUBLIC_REFERENCE",
      }),
    }),
    env,
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 403);
  assert.equal(data.error, "external_registry_booking_blocked_unclaimed_profile");
});

test("virtual quote API rejects unclaimed external registry targets", async () => {
  const response = await worker.fetch(
    new Request("https://www.oficiospro.cl/api/quotes/virtual/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Necesito revisar tablero",
        commune: "Las Condes",
        specialistId: "sec-prototype-001",
      }),
    }),
    env,
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 403);
  assert.equal(data.error, "external_registry_quotation_blocked_unclaimed_profile");
});

test("real SEC import endpoint is blocked when ALLOW_REAL_SEC_IMPORT is false", async () => {
  const response = await worker.fetch(
    new Request("https://www.oficiospro.cl/api/admin/external-registry/sec/import", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-admin-token",
        "x-admin-token": "test-admin-token",
      },
    }),
    env,
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 403);
  assert.equal(data.error, "real_sec_import_blocked_pending_legal_review");
});
