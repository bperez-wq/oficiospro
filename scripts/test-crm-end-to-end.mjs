import readline from "node:readline";

const baseUrl = (process.env.TEST_BASE_URL ?? "https://www.oficiospro.cl").replace(/\/$/, "");
const adminToken = process.env.ADMIN_TOKEN || process.env.TEST_ADMIN_TOKEN || (await promptSecret("ADMIN_TOKEN: "));

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

async function requestJson({ label, method, endpoint, body }, token = "") {
  const headers = body ? { "Content-Type": "application/json" } : {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && data.ok !== false;
    if (!ok) failures += 1;
    console.log(formatSummary({ label, endpoint, status: response.status, ok, data }));
  } catch (error) {
    failures += 1;
    console.log(
      formatSummary({
        label,
        endpoint,
        status: "network",
        ok: false,
        data: { error: error instanceof Error ? error.message : "network_error" },
      }),
    );
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
