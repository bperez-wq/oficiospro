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
