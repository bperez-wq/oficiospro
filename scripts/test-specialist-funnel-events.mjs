const baseUrl = (process.env.APP_BASE_URL || process.env.TEST_BASE_URL || "https://www.oficiospro.cl").replace(/\/$/, "");
const adminToken = process.env.ADMIN_TOKEN || process.env.TEST_ADMIN_TOKEN || "";
const testRunId =
  process.env.SPECIALIST_FUNNEL_TEST_RUN_ID ||
  `specialist_funnel_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;

const sourceComponent = "scripts/test-specialist-funnel-events.mjs";
const testAttribution = {
  source: "e2e_test",
  medium: "script",
  campaign: "specialist_funnel_e2e",
  utmSource: "e2e_test",
  utmMedium: "script",
  utmCampaign: "specialist_funnel_e2e",
  utmContent: testRunId,
  referralCode: `test_${testRunId}`,
  testRunId,
  isTest: true,
};

const eventSteps = [
  { label: "evento click_offer_services", type: "click_offer_services", page: "/", sourceButton: "E2E Home CTA" },
  { label: "evento founder_landing_view", type: "founder_landing_view", page: "/especialistas-fundadores", sourceButton: "E2E landing view" },
  { label: "evento specialist_application_started", type: "specialist_application_started", page: "/registro-especialista", sourceButton: "E2E form start", step: 1, stepName: "Identidad" },
  { label: "evento step_started servicios", type: "specialist_application_step_started", page: "/registro-especialista", sourceButton: "E2E step servicios", step: 3, stepName: "Servicios" },
  { label: "evento specialist_application_step_completed", type: "specialist_application_step_completed", page: "/registro-especialista", sourceButton: "E2E step completed", step: 3, stepName: "Servicios" },
  { label: "evento specialist_custom_trade_requested", type: "specialist_custom_trade_requested", page: "/registro-especialista", sourceButton: "E2E custom trade", step: 3, stepName: "Servicios" },
  { label: "evento step_started formalizacion", type: "specialist_application_step_started", page: "/registro-especialista", sourceButton: "E2E step formalizacion", step: 4, stepName: "Formalizacion" },
  { label: "evento specialist_formalization_help_requested", type: "specialist_formalization_help_requested", page: "/registro-especialista", sourceButton: "E2E formalization help", step: 4, stepName: "Formalizacion" },
];

const specialistLead = {
  leadType: "specialist_application",
  fullName: "Juan Perez",
  email: `juan.perez+${testRunId}@example.com`,
  phone: "+56 9 1234 5678",
  applicantType: "specialist",
  trade: "Electricidad",
  service: "Mantencion electrica",
  regionCode: "13",
  regionName: "Region Metropolitana",
  communeName: "Nunoa",
  sourcePage: "/registro-especialista",
  sourceComponent,
  sourceButton: "E2E specialist application",
  consentContact: true,
  consentTerms: true,
  ...testAttribution,
  payload: {
    ...testAttribution,
    scenario: "specialist_funnel_e2e",
    fullName: "Juan Perez",
    primaryTradeId: "electricidad",
    primaryTrade: "Electricidad",
    tradeSegment: "hogar",
    tradeCoverageStatus: "active",
    selectedSpecialties: ["mantencion_electrica"],
    customTradeRequest: "oficio e2e no listado",
    needsFormalizationHelp: true,
    services: [
      {
        serviceTypeId: "electricidad",
        serviceName: "Mantencion electrica",
        serviceDescription: "Servicio de prueba para verificar funnel especialista.",
        specialty: "mantencion_electrica",
        specialistExpectedPayoutCLP: 25000,
        duration: "2 horas",
        emergencyAvailable: false,
        serviceCommunes: "Nunoa, Providencia",
      },
    ],
    certifications: [],
    portfolioPhotos: [],
    hasNoFormalCertifications: true,
    taxProfile: { taxType: "unknown", status: "pending_formalization" },
    sourcePage: "/registro-especialista",
    sourceComponent,
  },
};

const results = [];

console.log(`Testing specialist funnel events against ${baseUrl}`);
console.log(`testRunId=${testRunId}`);
console.log("This script creates marked e2e_test records only after ADMIN_TOKEN is accepted.\n");

if (!adminToken) {
  console.error("ADMIN_TOKEN is required. In PowerShell: $env:ADMIN_TOKEN=\"pega_el_token_real\"");
  process.exit(1);
}

const tokenCheck = await request("validar token admin", "GET", "/api/admin/conversion-events?limit=1", undefined, true);
if (!tokenCheck.ok) {
  console.error("\nADMIN_TOKEN no fue aceptado. No se crearan eventos ni postulaciones de prueba.");
  process.exit(1);
}

for (const event of eventSteps) {
  await request(event.label, "POST", "/api/conversion-events/create", {
    type: event.type,
    eventName: event.type,
    source: "e2e_test",
    medium: "script",
    campaign: "specialist_funnel_e2e",
    page: event.page,
    path: event.page,
    sourceComponent,
    sourceButton: event.sourceButton,
    payload: {
      ...testAttribution,
      eventName: event.type,
      path: event.page,
      page: event.page,
      sourceComponent,
      sourceButton: event.sourceButton,
      step: event.step,
      stepName: event.stepName,
      fieldGroup: event.stepName,
      errorCode: event.type === "specialist_application_step_error" ? "e2e_error" : undefined,
      sessionId: `script_${testRunId}`,
      anonymousId: `script_anon_${testRunId}`,
    },
  });
}

const specialistResult = await request("simular postulacion especialista", "POST", "/api/specialists/apply", specialistLead);

await pause(750);
const eventsResult = await request("consultar eventos admin", "GET", "/api/admin/conversion-events?limit=100", undefined, true);
const specialistsResult = await request("consultar especialistas admin", "GET", "/api/admin/specialists?limit=100", undefined, true);
await request("cargar pagina admin acquisition", "GET", "/admin/crm/acquisition");

const adminEvents = Array.isArray(eventsResult.data?.conversionEvents) ? eventsResult.data.conversionEvents : [];
const matchingEvents = adminEvents.filter((event) => JSON.stringify(event).includes(testRunId));
const matchingTypes = new Set(matchingEvents.map((event) => String(event.type ?? event.eventName ?? "")));
const expectedTypes = eventSteps.map((event) => event.type);
const missingTypes = expectedTypes.filter((type) => !matchingTypes.has(type));

const adminSpecialists = Array.isArray(specialistsResult.data?.specialists) ? specialistsResult.data.specialists : [];
const matchingSpecialists = adminSpecialists.filter((row) => JSON.stringify(row).includes(testRunId) || row.id === specialistResult.id);

console.log("\nResumen funnel E2E");
printSummaryRow("eventos esperados", expectedTypes.length);
printSummaryRow("eventos encontrados", matchingEvents.length);
printSummaryRow("tipos faltantes", missingTypes.length ? missingTypes.join(", ") : "ninguno");
printSummaryRow("postulacion stored", specialistResult.stored ? "true" : "false");
printSummaryRow("postulacion en admin", matchingSpecialists.length ? "true" : "false");
printSummaryRow("clicks Ofrecer", countEvents(matchingEvents, "click_offer_services"));
printSummaryRow("landing fundadores", countEvents(matchingEvents, "founder_landing_view"));
printSummaryRow("registro iniciado", countEvents(matchingEvents, "specialist_application_started"));
printSummaryRow("pasos completados", countEvents(matchingEvents, "specialist_application_step_completed"));
printSummaryRow("oficio no listado", countEvents(matchingEvents, "specialist_custom_trade_requested"));
printSummaryRow("ayuda formalizacion", countEvents(matchingEvents, "specialist_formalization_help_requested"));

const failures = results.filter((result) => !result.ok);
if (missingTypes.length) failures.push({ label: "verificar tipos eventos", error: `missing:${missingTypes.join(",")}` });
if (!matchingSpecialists.length) failures.push({ label: "verificar postulacion admin", error: "specialist_not_found" });

console.log(`\nSpecialist funnel E2E finished with ${failures.length} failing check(s).`);
if (failures.length) process.exitCode = 1;

async function request(label, method, endpoint, body, admin = false) {
  const url = `${baseUrl}${endpoint}`;
  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (admin) {
    headers.Authorization = `Bearer ${adminToken}`;
    headers["x-admin-token"] = adminToken;
  }

  let response;
  let data = {};
  let error = "";
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    data = await response.json().catch(() => ({}));
    error = data.error || (!response.ok ? `http_${response.status}` : "");
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "network_error";
  }

  const ok = Boolean(response?.ok) && (data.ok !== false) && !error;
  const result = {
    label,
    endpoint,
    status: response?.status ?? 0,
    ok,
    stored: Boolean(data.stored),
    id: data.id || data.eventId || "",
    eventId: data.id || data.eventId || "",
    error,
    data,
  };
  results.push(result);
  printResult(result);
  return result;
}

function printResult(result) {
  const id = result.eventId || result.id || "-";
  const error = result.error ? ` | error=${result.error}` : "";
  console.log(
    `${result.label.padEnd(38)} | ${result.endpoint.padEnd(38)} | status=${String(result.status).padEnd(7)} | ok=${String(result.ok).padEnd(5)} | stored=${String(result.stored).padEnd(5)} | eventId=${id}${error}`,
  );
}

function printSummaryRow(label, value) {
  console.log(`${label.padEnd(24)} ${value}`);
}

function countEvents(events, type) {
  return events.filter((event) => String(event.type ?? event.eventName ?? "") === type).length;
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
