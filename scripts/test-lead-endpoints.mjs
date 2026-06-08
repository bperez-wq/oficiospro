const baseUrl = (process.env.TEST_BASE_URL ?? "http://localhost:8787").replace(/\/$/, "");

const safePerson = {
  fullName: "Juan Pérez",
  email: "juan.perez@example.com",
  phone: "+56 9 1234 5678",
};

const requests = [
  {
    endpoint: "/api/leads",
    body: {
      leadType: "contact_message",
      ...safePerson,
      service: "Consulta general",
      problemDescription: "Prueba operacional de captura desde script.",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Providencia",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/leads",
    },
  },
  {
    endpoint: "/api/contact",
    body: {
      ...safePerson,
      applicantType: "Hogar",
      service: "Contacto",
      problemDescription: "Mensaje de prueba para contacto.",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/contact",
    },
  },
  {
    endpoint: "/api/specialists/apply",
    body: {
      ...safePerson,
      applicantType: "specialist",
      trade: "Electricidad",
      service: "Mantención eléctrica",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Ñuñoa",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/specialists/apply",
      payload: {
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
      service: "Gasfitería",
      problemDescription: "Prueba de solicitud de trabajo del hogar.",
      urgency: "Esta semana",
      regionCode: "13",
      regionName: "Región Metropolitana",
      communeName: "Las Condes",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/jobs/request",
    },
  },
  {
    endpoint: "/api/companies/request",
    body: {
      ...safePerson,
      companyName: "Empresa de Prueba SpA",
      service: "Mantención multisede",
      problemDescription: "Prueba operacional de solicitud empresa.",
      regionCode: "05",
      regionName: "Valparaíso",
      communeName: "Valparaíso",
      sourceComponent: "scripts/test-lead-endpoints.mjs",
      sourceButton: "POST /api/companies/request",
    },
  },
  {
    endpoint: "/api/bookings/request",
    body: {
      ...safePerson,
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
      sourceButton: "POST /api/bookings/request",
    },
  },
];

async function run() {
  console.log(`Testing lead endpoints against ${baseUrl}`);
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
