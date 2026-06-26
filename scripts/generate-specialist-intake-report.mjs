import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const reportDate = process.env.SPECIALIST_INTAKE_REPORT_DATE || new Date().toISOString().slice(0, 10);
const reportDir = path.join(rootDir, "reports", "specialist-intake");
const outputPath = path.join(reportDir, `${reportDate}.md`);

const snapshot = await loadSnapshot();
const report = buildReport(snapshot);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Specialist intake report generated: ${path.relative(rootDir, outputPath)}`);
console.log(`Source: ${snapshot.sources.join(", ") || "none"}`);
console.log(`Real specialist leads: ${snapshot.metrics.totalSpecialistLeads}`);
console.log(`Open follow-ups: ${snapshot.metrics.openFollowUps}`);
console.log(`Overdue 24h: ${snapshot.metrics.overdue24h}`);

async function loadSnapshot() {
  const explicitInput = process.env.SPECIALIST_INTAKE_INPUT;
  if (explicitInput) {
    const inputPath = path.resolve(explicitInput);
    const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    return deriveSnapshot(parsed, [path.relative(rootDir, inputPath)], ["Local specialist intake input was used."]);
  }

  const baseUrl = process.env.SPECIALIST_INTAKE_BASE_URL || process.env.APP_BASE_URL || process.env.TEST_BASE_URL || "";
  const adminToken = process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || "";
  const wantsLive = process.env.SPECIALIST_INTAKE_SOURCE === "live" || Boolean(baseUrl || adminToken);

  if (wantsLive && (!baseUrl || !adminToken)) {
    if (process.env.SPECIALIST_INTAKE_REQUIRE_LIVE === "true") {
      throw new Error("SPECIALIST_INTAKE_REQUIRE_LIVE requires SPECIALIST_INTAKE_BASE_URL/APP_BASE_URL and ADMIN_TOKEN.");
    }
    return emptySnapshot([
      "Live source was requested but base URL or admin token is missing.",
      "No admin token is printed or stored in the report.",
    ]);
  }

  if (wantsLive) {
    const endpoint = "/api/admin/leads?leadType=specialist_application&limit=100";
    const data = await fetchAdminJson(baseUrl, endpoint, adminToken);
    return deriveSnapshot(data, [`${new URL(baseUrl).origin}${endpoint}`], [
      "Live admin leads were read with ADMIN_TOKEN.",
      "The Worker currently caps /api/admin/leads at 100 rows.",
      "Only anonymized follow-up rows are written; email, phone and names are not persisted.",
    ]);
  }

  return emptySnapshot([
    "No local input or live admin source was provided.",
    "Set APP_BASE_URL and ADMIN_TOKEN, or pass SPECIALIST_INTAKE_INPUT to generate an operational report.",
  ]);
}

async function fetchAdminJson(baseUrl, endpoint, adminToken) {
  const response = await fetch(new URL(endpoint, normalizeBaseUrl(baseUrl)), {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "x-admin-token": adminToken,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(`admin_endpoint_failed:${endpoint}:status_${response.status}:${data.error || "unknown_error"}`);
  }
  return data;
}

function deriveSnapshot(raw, sources, notes) {
  const now = new Date();
  const allLeads = collectionFrom(raw, "leads");
  const testLeads = allLeads.filter(isTestLead);
  const leads = allLeads.filter((lead) => !isTestLead(lead));
  const openLeads = leads.filter((lead) => !isClosedLead(lead));
  const attempts = leads.filter(isSpecialistRegistrationAttempt);
  const openAttempts = attempts.filter((lead) => !isClosedLead(lead));
  const completedApplications = leads.filter((lead) => !isSpecialistRegistrationAttempt(lead) || hasCompletedApplicationSignal(lead));
  const overdue24 = openLeads.filter((lead) => ageHours(lead, now) >= 24);
  const overdue72 = openLeads.filter((lead) => ageHours(lead, now) >= 72);
  const missingUsableContact = openLeads.filter((lead) => !lead.email && !lead.phone);
  const missingPhone = openLeads.filter((lead) => !lead.phone);
  const missingEmail = openLeads.filter((lead) => !lead.email);
  const emailFailures = leads.filter((lead) => !truthy(lead.email_sent ?? lead.emailSent) && Boolean(lead.email_error ?? lead.emailError));
  const firstContactStatuses = new Set(["", "nuevo", "pending", "postulado", "lead_capturado"]);
  const needsFirstContact = openLeads.filter((lead) => firstContactStatuses.has(statusOf(lead)));
  const queue = openLeads
    .slice()
    .sort((a, b) => followUpRank(b, now) - followUpRank(a, now))
    .slice(0, 20)
    .map((lead) => safeQueueRow(lead, now));

  return {
    generatedAt: now.toISOString(),
    sources,
    notes,
    queue,
    byTrade: topGroups(leads, tradeOf),
    byCommune: topGroups(leads, communeOf),
    metrics: {
      totalRowsRead: allLeads.length,
      testRowsExcluded: testLeads.length,
      totalSpecialistLeads: leads.length,
      registrationAttempts: attempts.length,
      openRegistrationAttempts: openAttempts.length,
      completedApplications: completedApplications.length,
      openFollowUps: openLeads.length,
      needsFirstContact: needsFirstContact.length,
      overdue24h: overdue24.length,
      overdue72h: overdue72.length,
      missingUsableContact: missingUsableContact.length,
      missingPhone: missingPhone.length,
      missingEmail: missingEmail.length,
      emailFailures: emailFailures.length,
    },
  };
}

function emptySnapshot(notes) {
  return {
    generatedAt: new Date().toISOString(),
    sources: [],
    notes,
    queue: [],
    byTrade: [],
    byCommune: [],
    metrics: {
      totalRowsRead: 0,
      testRowsExcluded: 0,
      totalSpecialistLeads: 0,
      registrationAttempts: 0,
      openRegistrationAttempts: 0,
      completedApplications: 0,
      openFollowUps: 0,
      needsFirstContact: 0,
      overdue24h: 0,
      overdue72h: 0,
      missingUsableContact: 0,
      missingPhone: 0,
      missingEmail: 0,
      emailFailures: 0,
    },
  };
}

function buildReport(snapshot) {
  const metric = snapshot.metrics;
  return `# Specialist intake operations report - ${reportDate}

## 1. Resumen operativo

Este reporte ayuda a perseguir oportunidades de especialistas sin guardar nombres, telefonos ni emails en Git. Usa datos agregados y una cola anonimizada por ID.

| Metrica | Valor |
| --- | ---: |
| Filas leidas | ${metric.totalRowsRead} |
| Tests excluidos | ${metric.testRowsExcluded} |
| Leads especialista reales | ${metric.totalSpecialistLeads} |
| Intentos capturados | ${metric.registrationAttempts} |
| Intentos abiertos | ${metric.openRegistrationAttempts} |
| Postulaciones completas detectadas | ${metric.completedApplications} |
| Seguimientos abiertos | ${metric.openFollowUps} |
| Requieren primer contacto | ${metric.needsFirstContact} |
| Vencidos 24 h | ${metric.overdue24h} |
| Vencidos 72 h | ${metric.overdue72h} |
| Sin canal usable | ${metric.missingUsableContact} |
| Sin telefono | ${metric.missingPhone} |
| Sin email | ${metric.missingEmail} |
| Fallos de email | ${metric.emailFailures} |

## 2. Cola anonimizada de seguimiento

${snapshot.queue.length ? renderQueue(snapshot.queue) : "- Sin seguimientos abiertos en la fuente consultada."}

## 3. Concentracion por oficio

${renderGroups(snapshot.byTrade)}

## 4. Concentracion por comuna

${renderGroups(snapshot.byCommune)}

## 5. Playbook diario

1. Revisar \`/admin/leads\` filtrando por \`specialist_application\`.
2. Priorizar filas con \`Intento capturado\` y edad mayor a 24 h.
3. Contactar por WhatsApp/telefono si existe telefono; si no, usar email.
4. Cambiar estado despues del contacto: \`contactado\`, \`en_revision\`, \`more_info\`, \`convertido\` o \`perdido\`.
5. Si supera 72 h sin respuesta, marcar proxima accion y decidir rescate o cierre.
6. No contar filas con badge \`Test\` como traccion real.

## 6. Integridad

${snapshot.notes.length ? snapshot.notes.map((note) => `- ${note}`).join("\n") : "- Sin notas adicionales."}

## 7. Fuentes

${snapshot.sources.length ? snapshot.sources.map((source) => `- ${source}`).join("\n") : "- Sin fuente configurada."}
`;
}

function renderQueue(rows) {
  const lines = [
    "| Lead ID | Edad | Estado | Etapa | Oficio | Comuna | Canales | Accion |",
    "| --- | ---: | --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(`| ${row.id} | ${row.ageHours} h | ${row.status} | ${row.stage} | ${row.trade} | ${row.commune} | ${row.contactChannels} | ${row.action} |`);
  }
  return lines.join("\n");
}

function renderGroups(groups) {
  if (!groups.length) return "- Sin datos suficientes.";
  return groups.map((item) => `- ${item.label}: ${item.count}`).join("\n");
}

function safeQueueRow(lead, now) {
  const age = ageHours(lead, now);
  return {
    id: String(lead.id || "sin_id"),
    ageHours: age,
    status: statusOf(lead) || "nuevo",
    stage: isSpecialistRegistrationAttempt(lead) ? "intento" : "postulacion",
    trade: tradeOf(lead),
    commune: communeOf(lead),
    contactChannels: [lead.phone ? "telefono" : "", lead.email ? "email" : ""].filter(Boolean).join("+") || "sin_canal",
    action: recommendedAction(lead, age),
  };
}

function recommendedAction(lead, age) {
  if (!lead.phone && !lead.email) return "revisar_origen";
  if (age >= 72) return "rescate_o_cierre";
  if (age >= 24) return "contacto_urgente";
  if (isSpecialistRegistrationAttempt(lead)) return "primer_contacto_24h";
  return "revision_operativa";
}

function followUpRank(lead, now) {
  const age = ageHours(lead, now);
  const channelScore = lead.phone ? 30 : lead.email ? 15 : -20;
  const attemptScore = isSpecialistRegistrationAttempt(lead) ? 40 : 10;
  const overdueScore = age >= 72 ? 100 : age >= 24 ? 70 : 0;
  return overdueScore + attemptScore + channelScore + Math.min(age, 96);
}

function isSpecialistRegistrationAttempt(row) {
  const payload = leadPayload(row);
  const marker = [
    payloadText(payload, "specialistLeadKind"),
    payloadText(payload, "leadSubtype"),
    payloadText(payload, "draftProfileStatus"),
    payloadText(payload, "founderStatus"),
    row.source_button,
    row.sourceButton,
  ]
    .join(" ")
    .toLowerCase();

  return (
    marker.includes("registration_attempt") ||
    marker.includes("draft_profile") ||
    marker.includes("contact_entered") ||
    marker.includes("lead_capturado") ||
    marker.includes("captura temprana")
  );
}

function hasCompletedApplicationSignal(row) {
  const payload = leadPayload(row);
  const services = Array.isArray(payload.services) ? payload.services : [];
  return services.length > 0 || ["approved", "aprobado", "published", "publicado", "convertido"].includes(statusOf(row));
}

function isClosedLead(row) {
  return ["approved", "aprobado", "published", "publicado", "convertido", "closed", "cerrado", "rejected", "rechazado", "perdido"].includes(statusOf(row));
}

function isTestLead(row) {
  const payload = leadPayload(row);
  const email = String(row.email || "").toLowerCase();
  return payload.isTest === true || payloadText(payload, "source") === "e2e_test" || Boolean(payloadText(payload, "testRunId")) || email.endsWith("@example.com");
}

function leadPayload(row) {
  return parseJsonObject(row.payload_json || row.payloadJson);
}

function payloadText(payload, key) {
  const crm = objectFrom(payload.crm);
  return String(payload[key] || crm[key] || "");
}

function statusOf(row) {
  return String(row.status || "").toLowerCase();
}

function tradeOf(row) {
  return cleanLabel(row.trade || row.service || payloadText(leadPayload(row), "trade") || payloadText(leadPayload(row), "service") || "sin_oficio");
}

function communeOf(row) {
  return cleanLabel(row.commune_name || row.communeName || row.commune || payloadText(leadPayload(row), "communeName") || "sin_comuna");
}

function cleanLabel(value) {
  return String(value || "sin_dato").trim().replace(/\s+/g, " ").slice(0, 80) || "sin_dato";
}

function topGroups(rows, selector) {
  const counts = new Map();
  for (const row of rows) {
    const label = selector(row);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));
}

function ageHours(row, now) {
  const value = row.created_at || row.createdAt || row.created_at_utc || "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.round((now.getTime() - date.getTime()) / 36_000) / 100);
}

function collectionFrom(raw, ...keys) {
  for (const key of keys) {
    const direct = raw?.[key];
    if (Array.isArray(direct)) return direct;
    for (const nestedKey of keys) {
      const nested = direct?.[nestedKey];
      if (Array.isArray(nested)) return nested;
    }
  }
  return Array.isArray(raw) ? raw : [];
}

function parseJsonObject(value) {
  if (!value || typeof value !== "string") return {};
  try {
    return objectFrom(JSON.parse(value));
  } catch {
    return {};
  }
}

function objectFrom(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function truthy(value) {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
