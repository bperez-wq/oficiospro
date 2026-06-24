import readline from "node:readline";

const baseUrl = (process.env.APP_BASE_URL || process.env.TEST_BASE_URL || "https://www.oficiospro.cl").replace(/\/$/, "");
const adminToken = validateAdminToken(process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || process.env.TEST_ADMIN_TOKEN || (await promptSecret("ADMIN_TOKEN: ")));
const testRunId =
  process.env.SPECIALIST_INTAKE_TEST_RUN_ID ||
  `specialist_intake_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;

const safePerson = {
  fullName: "Juan Perez",
  email: "juan.perez@example.com",
  phone: "+56 9 1234 5678",
};

const testMarker = {
  source: "e2e_test",
  sourcePage: "/registro-especialista",
  sourceComponent: "scripts/test-specialist-intake-capture.mjs",
  sourceButton: "e2e_specialist_registration_attempt",
  testRunId,
  isTest: true,
};

let failures = 0;

console.log(`Testing specialist intake capture against ${baseUrl}`);
console.log(`testRunId=${testRunId}`);
console.log("Este script valida ADMIN_TOKEN antes de crear un lead de prueba marcado como e2e_test/isTest/example.com.");
console.log("");

const preflight = await requestJson({ label: "validar token admin", method: "GET", endpoint: "/api/admin/leads?limit=1" }, adminToken, { countFailure: false });
if (!preflight.ok) {
  console.error("");
  console.error("ADMIN_TOKEN no fue aceptado. No se creara ningun intento de postulacion de prueba.");
  process.exit(1);
}

const createResult = await requestJson({
  label: "crear intento especialista",
  method: "POST",
  endpoint: "/api/specialists/apply",
  body: {
    ...safePerson,
    ...testMarker,
    leadType: "specialist_application",
    applicantType: "specialist",
    trade: "Gasfiteria",
    service: "Gasfiteria",
    regionCode: "13",
    regionName: "Region Metropolitana",
    communeName: "Nunoa",
    problemDescription: "Intento de registro especialista E2E sin datos reales sensibles.",
    payload: {
      ...testMarker,
      specialistLeadKind: "registration_attempt",
      leadSubtype: "registration_attempt",
      draftProfileStatus: "contact_entered",
      founderStatus: "lead_capturado",
      scenario: "specialist_registration_attempt",
      services: [],
      certifications: [],
      portfolioPhotos: [],
      hasNoFormalCertifications: true,
      crm: {
        ...testMarker,
        specialistLeadKind: "registration_attempt",
        draftProfileStatus: "contact_entered",
        founderStatus: "lead_capturado",
      },
    },
  },
});

const leadId = createResult.id;
const adminResult = await requestJson({ label: "buscar intento en admin", method: "GET", endpoint: "/api/admin/leads?leadType=specialist_application&limit=50" }, adminToken);
const found = leadId ? containsLeadId(adminResult.data, leadId) : containsTestRunId(adminResult.data, testRunId);
if (!found) failures += 1;
console.log(
  formatSummary({
    label: "verificar visibilidad admin",
    endpoint: "/api/admin/leads",
    status: adminResult.status,
    ok: found,
    data: { stored: found, id: leadId || "-", error: found ? "" : "lead_not_visible_in_admin" },
  }),
);

console.log("");
if (failures) {
  console.error(`Specialist intake E2E finished with ${failures} failing request(s).`);
  process.exit(1);
}

console.log("Specialist intake E2E finished successfully.");

async function requestJson({ label, method, endpoint, body }, token = "", options = {}) {
  const headers = body ? { "Content-Type": "application/json" } : {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["x-admin-token"] = token;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && data.ok !== false;
    if (!ok && options.countFailure !== false) failures += 1;
    console.log(formatSummary({ label, endpoint, status: response.status, ok, data }));
    return { ok, status: response.status, data, id: data.id ?? "", error: data.error ?? "" };
  } catch (error) {
    if (options.countFailure !== false) failures += 1;
    const errorMessage = error instanceof Error ? error.message : "network_error";
    console.log(
      formatSummary({
        label,
        endpoint,
        status: "network",
        ok: false,
        data: { error: errorMessage },
      }),
    );
    return { ok: false, status: "network", data: {}, id: "", error: errorMessage };
  }
}

function formatSummary({ label, endpoint, status, ok, data }) {
  return [
    label.padEnd(32),
    endpoint.padEnd(42),
    `status=${String(status).padEnd(7)}`,
    `ok=${String(Boolean(ok)).padEnd(5)}`,
    `stored=${String(Boolean(data.stored)).padEnd(5)}`,
    `id=${data.id ?? "-"}`,
    data.error ? `error=${data.error}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function containsLeadId(data, leadId) {
  return Array.isArray(data?.leads) && data.leads.some((lead) => lead?.id === leadId);
}

function containsTestRunId(data, value) {
  return JSON.stringify(data ?? {}).includes(value);
}

function validateAdminToken(value) {
  const token = String(value ?? "").trim();
  const normalized = token.toLowerCase();
  const placeholderSignals = ["el_mismo_token", "valor_real", "admin_api_token", "tu_token", "pega_", "xxxx", "token_real"];
  if (!token || placeholderSignals.some((signal) => normalized.includes(signal))) {
    console.error("ADMIN_TOKEN debe ser el valor real del secreto, no un texto de ejemplo.");
    console.error('Ejemplo PowerShell: $env:ADMIN_TOKEN="pega_aqui_el_valor_real"');
    process.exit(1);
  }
  return token;
}

async function promptSecret(prompt) {
  if (!process.stdin.isTTY) {
    console.error("ADMIN_TOKEN is required. Set it with $env:ADMIN_TOKEN or ADMIN_TOKEN=...");
    process.exit(1);
  }

  process.stdout.write(prompt);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  let value = "";
  return new Promise((resolve) => {
    function onKeypress(text, key) {
      if (key?.name === "return" || key?.name === "enter") {
        process.stdin.setRawMode(false);
        process.stdin.off("keypress", onKeypress);
        process.stdout.write("\n");
        resolve(value.trim());
        return;
      }
      if (key?.name === "backspace") {
        value = value.slice(0, -1);
        return;
      }
      if (key?.ctrl && key.name === "c") {
        process.stdin.setRawMode(false);
        process.stdin.off("keypress", onKeypress);
        process.stdout.write("\n");
        process.exit(130);
      }
      if (typeof text === "string") value += text;
    }

    process.stdin.on("keypress", onKeypress);
  });
}
