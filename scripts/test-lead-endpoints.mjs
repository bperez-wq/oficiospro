const baseUrl = (process.env.TEST_BASE_URL ?? "http://localhost:8787").replace(/\/$/, "");
const testRunId = process.env.LEAD_E2E_TEST_RUN_ID || `lead_e2e_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;

const safePerson = {
  fullName: "Juan Pérez",
  email: "juan.perez@example.com",
  phone: "+56 9 1234 5678",
};

const testMarker = {
  source: "e2e_test",
  sourcePage: "e2e_test",
  sourceComponent: "scripts/test-lead-endpoints.mjs",
  utmSource: "e2e_test",
  isTest: true,
  testRunId,
};

const requests = [
  {
    endpoint: "/api/leads",
    body: {
      leadType: "contact_message",
      ...safePerson,
      ...testMarker,
      service: "Consulta general",
      problemDescription: "Prueba operacional de captura desde script.",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Providencia",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/leads",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/contact",
    body: {
      ...safePerson,
      ...testMarker,
      applicantType: "Hogar",
      service: "Contacto",
      problemDescription: "Mensaje de prueba para contacto.",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/contact",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/specialists/apply",
    body: {
      ...safePerson,
      ...testMarker,
      applicantType: "specialist",
      trade: "Electricidad",
      service: "Mantención eléctrica",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Ñuñoa",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/specialists/apply",
      payload: {
        source: "e2e_test",
        isTest: true,
        testRunId,
        services: [
          {
            serviceTypeId: "electricidad",
            serviceName: "Mantención eléctrica",
            serviceDescription: "Revisión preventiva sin datos sensibles.",
            specialistExpectedPayoutCLP: 25000,
            duration: "2 horas",
            emergencyAvailable: false,
          },
        ],
        hasNoFormalCertifications: true,
        certifications: [],
      },
    },
  },
  {
    endpoint: "/api/jobs/request",
    body: {
      ...safePerson,
      ...testMarker,
      service: "Gasfitería",
      problemDescription: "Prueba de solicitud de trabajo del hogar.",
      urgency: "Esta semana",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Las Condes",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/jobs/request",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/customers/register-interest",
    body: {
      ...safePerson,
      ...testMarker,
      service: "Club Hogar Plus",
      problemDescription: "Prueba operacional de lead cliente.",
      regionCode: "13",
      regionName: "RegiÃ³n Metropolitana",
      communeName: "Vitacura",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/customers/register-interest",
      payload: { source: "e2e_test", isTest: true, testRunId, rut: "12.345.678-9", address: "Direccion de prueba 123" },
    },
  },
  {
    endpoint: "/api/companies/lead",
    body: {
      ...safePerson,
      ...testMarker,
      companyName: "Empresa de Prueba SpA",
      service: "Mantención multisede",
      problemDescription: "Prueba operacional de solicitud empresa.",
      regionCode: "05",
      regionName: "Valparaíso",
      communeName: "Valparaíso",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/companies/lead",
      payload: { source: "e2e_test", isTest: true, testRunId, companyRut: "76.123.456-7", branches: 2 },
    },
  },
  {
    endpoint: "/api/companies/request",
    body: {
      ...safePerson,
      ...testMarker,
      companyName: "Empresa Legacy SpA",
      service: "MantenciÃ³n multisede",
      problemDescription: "Prueba operacional de alias empresa.",
      regionCode: "13",
      regionName: "RegiÃ³n Metropolitana",
      communeName: "Providencia",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/companies/request",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/service-requests/create",
    body: {
      ...safePerson,
      ...testMarker,
      service: "Climatización",
      problemDescription: "Prueba de reserva sin bloquear agenda real.",
      requestedDate: "2026-06-15",
      requestedTime: "10:00",
      creditsEstimate: 18,
      specialistId: "test-specialist",
      specialistName: "Especialista de Prueba",
      regionCode: "08",
      regionName: "Biobío",
      communeName: "Concepción",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/service-requests/create",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/bookings/request",
    body: {
      ...safePerson,
      ...testMarker,
      service: "ClimatizaciÃ³n",
      problemDescription: "Prueba operacional de alias reserva.",
      requestedDate: "2026-06-15",
      requestedTime: "11:00",
      creditsEstimate: 18,
      specialistId: "test-specialist",
      specialistName: "Especialista de Prueba",
      regionCode: "08",
      regionName: "BiobÃ­o",
      communeName: "ConcepciÃ³n",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/bookings/request",
      payload: { source: "e2e_test", isTest: true, testRunId },
    },
  },
  {
    endpoint: "/api/conversion-events/create",
    body: {
      type: "script_test_conversion",
      source: "e2e_test",
      page: "/prueba",
      payload: { safe: true, source: "e2e_test", isTest: true, testRunId },
    },
  },
];

async function run() {
  console.log(`Testing lead endpoints against ${baseUrl}`);
  console.log(`Test run id: ${testRunId}`);
  console.log("Los registros creados quedan marcados como e2e_test/isTest/example.com para limpieza segura.");
  console.log("");

  for (const request of requests) {
    await testEndpoint(request.endpoint, request.body);
  }
}

async function testEndpoint(endpoint, body) {
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    const summary = {
      endpoint,
      status: response.status,
      ok: response.ok && Boolean(data.ok),
      id: data.id ?? "",
      stored: Boolean(data.stored),
      emailSent: Boolean(data.emailSent),
      error: data.error ?? data.emailError ?? "",
    };
    console.log(formatSummary(summary));
  } catch (error) {
    console.log(
      formatSummary({
        endpoint,
        status: "network",
        ok: false,
        id: "",
        stored: false,
        emailSent: false,
        error: error instanceof Error ? error.message : "network_error",
      }),
    );
  }
}

function formatSummary(summary) {
  return [
    summary.endpoint.padEnd(24),
    `status=${String(summary.status).padEnd(7)}`,
    `ok=${String(summary.ok).padEnd(5)}`,
    `id=${summary.id || "-"}`,
    `stored=${String(summary.stored).padEnd(5)}`,
    `emailSent=${String(summary.emailSent).padEnd(5)}`,
    summary.error ? `error=${summary.error}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
