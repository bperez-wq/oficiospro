import readline from "node:readline";

const baseUrl = (process.env.TEST_BASE_URL ?? "https://www.oficiospro.cl").replace(/\/$/, "");
const adminToken = validateAdminToken(process.env.ADMIN_TOKEN || process.env.TEST_ADMIN_TOKEN || (await promptSecret("ADMIN_TOKEN: ")));

const safePerson = {
  fullName: "Juan Perez",
  email: "juan.perez@example.com",
  phone: "+56 9 1234 5678",
};

const createRequests = [
  {
    label: "crear lead cliente",
    method: "POST",
    endpoint: "/api/leads",
    body: {
      leadType: "customer_request",
      ...safePerson,
      service: "Gasfiteria",
      problemDescription: "Prueba end-to-end CRM sin datos reales sensibles.",
      urgency: "esta_semana",
      regionCode: "13",
      regionName: "Region Metropolitana",
      communeName: "Providencia",
      sourceComponent: "scripts/test-crm-end-to-end.mjs",
      sourceButton: "crm_e2e_customer_lead",
    },
  },
  {
    label: "crear lead empresa",
    method: "POST",
    endpoint: "/api/companies/request",
    body: {
      ...safePerson,
      companyName: "Empresa de Prueba OficiosPro SpA",
      service: "Mantencion multisede",
      problemDescription: "Prueba end-to-end CRM empresa sin datos reales sensibles.",
      regionCode: "13",
      regionName: "Region Metropolitana",
      communeName: "Las Condes",
      sourceComponent: "scripts/test-crm-end-to-end.mjs",
      sourceButton: "crm_e2e_company_lead",
    },
  },
  {
    label: "crear postulacion especialista",
    method: "POST",
    endpoint: "/api/specialists/apply",
    body: {
      ...safePerson,
      applicantType: "specialist",
      trade: "Electricidad",
      service: "Mantencion electrica",
      regionCode: "13",
      regionName: "Region Metropolitana",
      communeName: "Nunoa",
      sourceComponent: "scripts/test-crm-end-to-end.mjs",
      sourceButton: "crm_e2e_specialist_application",
      payload: {
        services: [
          {
            serviceTypeId: "electricidad",
            serviceName: "Mantencion electrica",
            serviceDescription: "Servicio de prueba para verificar CRM.",
            specialistExpectedPayoutCLP: 25000,
            calculatedClientCredits: 32,
            duration: "2 horas",
            emergencyAvailable: false,
          },
        ],
        certifications: [],
        portfolioPhotos: [],
        hasNoFormalCertifications: true,
      },
    },
  },
  {
    label: "crear cotizacion virtual",
    method: "POST",
    endpoint: "/api/quotes/virtual/create",
    body: {
      customerName: safePerson.fullName,
      customerEmail: safePerson.email,
      customerPhone: safePerson.phone,
      customerId: "crm-e2e-customer",
      specialistId: "crm-e2e-specialist",
      specialistName: "Especialista de Prueba",
      categoryId: "hogar",
      specialty: "Gasfiteria",
      serviceName: "Revision de fuga de agua",
      problemTitle: "Fuga de agua de prueba",
      description: "Cotizacion virtual de prueba para verificar CRM con D1.",
      commune: "Providencia",
      region: "Region Metropolitana",
      urgency: "normal",
      sourceComponent: "scripts/test-crm-end-to-end.mjs",
    },
  },
];

const adminRequests = [
  { label: "consultar admin leads", method: "GET", endpoint: "/api/admin/leads" },
  { label: "sync leads", method: "POST", endpoint: "/api/admin/crm/sync-leads" },
  { label: "sync specialists", method: "POST", endpoint: "/api/admin/crm/sync-specialists" },
  { label: "sync virtual quotes", method: "POST", endpoint: "/api/admin/crm/sync-virtual-quotes" },
  { label: "consultar crm overview", method: "GET", endpoint: "/api/admin/crm/overview" },
  { label: "consultar crm opportunities", method: "GET", endpoint: "/api/admin/crm/opportunities" },
  { label: "consultar crm tasks", method: "GET", endpoint: "/api/admin/crm/tasks" },
  { label: "consultar crm work queue", method: "GET", endpoint: "/api/admin/crm/work-queue" },
  { label: "consultar crm reports", method: "GET", endpoint: "/api/admin/crm/reports" },
];

let failures = 0;

console.log(`Testing CRM end-to-end against ${baseUrl}`);
console.log("");

if (process.env.ADMIN_LOGIN_EMAIL && process.env.ADMIN_LOGIN_SECRET) {
  await requestJson(
    {
      label: "validar login admin real",
      method: "POST",
      endpoint: "/api/auth/admin-login",
      body: {
        email: process.env.ADMIN_LOGIN_EMAIL,
        password: process.env.ADMIN_LOGIN_SECRET,
      },
    },
    "",
    { countFailure: false },
  );
}

const preflight = await requestJson({ label: "validar token admin", method: "GET", endpoint: "/api/admin/leads?limit=1" }, adminToken, { countFailure: false });
if (!preflight.ok) {
  console.error("");
  console.error("ADMIN_TOKEN no fue aceptado. No se crearan datos de prueba.");
  if (preflight.error === "unauthorized") {
    console.error("Si Cloudflare tiene ADMIN_API_TOKEN, usa ese mismo valor o actualiza ADMIN_API_TOKEN y ADMIN_TOKEN con el mismo secreto.");
  }
  process.exit(1);
}

console.log("");

for (const item of createRequests) {
  await requestJson(item);
}

for (const item of adminRequests) {
  await requestJson(item, adminToken);
}

console.log("");
if (failures) {
  console.error(`CRM E2E finished with ${failures} failing request(s).`);
  process.exit(1);
}

console.log("CRM E2E finished successfully.");

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
    return { ok, status: response.status, error: data.error ?? "" };
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
    return { ok: false, status: "network", error: errorMessage };
  }
}

function formatSummary({ label, endpoint, status, ok, data }) {
  return [
    label.padEnd(32),
    endpoint.padEnd(38),
    `status=${String(status).padEnd(7)}`,
    `ok=${String(Boolean(ok)).padEnd(5)}`,
    `stored=${String(Boolean(data.stored)).padEnd(5)}`,
    `id=${data.id ?? "-"}`,
    data.error ? `error=${data.error}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function validateAdminToken(value) {
  const token = String(value ?? "").trim();
  const normalized = token.toLowerCase();
  const placeholderSignals = ["el_mismo_token", "valor_real", "admin_api_token", "tu_token", "pega_", "xxxx", "token_real"];
  if (!token || placeholderSignals.some((signal) => normalized.includes(signal))) {
    console.error("ADMIN_TOKEN debe ser el valor real del secreto, no un texto de ejemplo.");
    console.error("Ejemplo PowerShell: $env:ADMIN_TOKEN=\"pega_aqui_el_valor_real\"");
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
    function onKeypress(_text, key) {
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
      if (typeof _text === "string") value += _text;
    }

    process.stdin.on("keypress", onKeypress);
  });
}
