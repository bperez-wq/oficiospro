import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const configPath = path.join(rootDir, "src", "config", "businessModelHealthThresholds.json");
const reportDate = process.env.BUSINESS_HEALTH_DATE || new Date().toISOString().slice(0, 10);
const reportDir = path.join(rootDir, "reports", "business-health");
const outputPath = path.join(reportDir, `${reportDate}.md`);

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const snapshot = loadSnapshot();
const result = calculateBusinessHealth(snapshot, config);
const recommendations = buildRecommendations(result, snapshot);
const report = renderReport(result, snapshot, recommendations);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Business health report generated: ${path.relative(rootDir, outputPath)}`);
console.log(`Global status: ${result.status}`);
console.log(`Alerts: ${result.alerts.length}`);
console.log(`Insufficient signals: ${result.insufficientSignals.length}`);

function loadSnapshot() {
  const explicitInput = process.env.BUSINESS_HEALTH_INPUT;
  const fallbackInput = path.join(rootDir, "reports", "business-health", "input", "latest.json");
  const inputPath = explicitInput ? path.resolve(explicitInput) : fallbackInput;

  if (fs.existsSync(inputPath)) {
    const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    if (parsed.metrics) {
      return {
        generatedAt: new Date().toISOString(),
        windowDays: Number(parsed.windowDays || 7),
        metrics: parsed.metrics,
        sources: parsed.sources || [path.relative(rootDir, inputPath)],
        notes: parsed.notes || [],
      };
    }
    return deriveSnapshotFromExport(parsed, path.relative(rootDir, inputPath));
  }

  const exportFiles = [
    ["conversionEvents", path.join(rootDir, "reports", "business-health", "input", "conversion-events.json")],
    ["specialists", path.join(rootDir, "reports", "business-health", "input", "specialists.json")],
    ["opportunities", path.join(rootDir, "reports", "business-health", "input", "opportunities.json")],
    ["tasks", path.join(rootDir, "reports", "business-health", "input", "tasks.json")],
    ["overview", path.join(rootDir, "reports", "business-health", "input", "overview.json")],
  ];
  const data = {};
  const sources = [];
  for (const [key, filePath] of exportFiles) {
    if (!fs.existsSync(filePath)) continue;
    data[key] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    sources.push(path.relative(rootDir, filePath));
  }
  if (sources.length) return deriveSnapshotFromExport(data, sources.join(", "));

  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    metrics: {},
    sources: [],
    notes: ["No local export was found. All conclusions with missing evidence are marked as insufficient_data."],
  };
}

function deriveSnapshotFromExport(raw, sourceLabel) {
  const events = arrayFrom(raw.conversionEvents || raw.events || raw);
  const specialists = arrayFrom(raw.specialists || raw.specialistApplications);
  const opportunities = arrayFrom(raw.opportunities);
  const tasks = arrayFrom(raw.tasks);
  const overview = raw.overview || {};
  const eventCount = (names) => events.filter((event) => names.includes(eventName(event))).length;
  const founderLandingViews = eventCount(["founder_landing_view"]);
  const specialistApplicationStarts = eventCount(["specialist_application_started"]);
  const specialistApplicationsCompleted = Math.max(eventCount(["specialist_application_submitted"]), specialists.length);
  const onboardingLosses = eventCount(["specialist_application_abandoned", "specialist_application_failed", "specialist_application_step_error"]);
  const publishedSpecialists = specialists.filter(isPublishedSpecialist).length;
  const approvedSpecialists = specialists.filter(isApprovedSpecialist).length;
  const completeProfiles = specialists.filter(hasCompleteProfile).length;
  const searchesPerformed = eventCount(["search_performed", "click_search_specialist"]);
  const requestsSent = number(overview.newLeads) + opportunities.filter((row) => ["clientes", "empresas", "comunidades"].includes(String(row.pipeline || ""))).length;
  const b2bRequests = opportunities.filter((row) => ["empresas", "comunidades", "b2b"].includes(String(row.pipeline || "")) || String(row.type || "").includes("company")).length;
  const specialistsWithoutRequests = specialists.filter((row) => isPublishedSpecialist(row) && number(row.requestCount || row.requestsCount) === 0).length;
  const errors = eventCount(["specialist_application_failed", "lead_submit_failed", "checkout_failed", "payment_failed"]);

  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    sources: [sourceLabel],
    metrics: {
      founderLandingViews,
      offerServicesClicks: eventCount(["click_offer_services", "founder_cta_click"]),
      specialistApplicationStarts,
      specialistApplicationsCompleted,
      approvedSpecialists,
      publishedSpecialists,
      coverageByTradeCommune: uniqueCoverage(specialists),
      specialistsWithCompleteProfileRate: ratio(completeProfiles, specialists.length),
      specialistApplicationSubmitRate: ratio(specialistApplicationsCompleted, founderLandingViews),
      onboardingFrictionRate: ratio(onboardingLosses, specialistApplicationStarts),
      leadQualityRate: ratio(completeProfiles, specialistApplicationsCompleted),
      specialistsPageViews: eventCount(["specialists_page_view", "page_view_especialistas"]),
      searchesPerformed,
      profilesViewed: eventCount(["specialist_profile_view", "profile_view"]),
      specialistsAddedToBag: eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"]),
      quotesStarted: eventCount(["virtual_quote_started", "quote_started"]),
      requestsSent,
      servicesCompleted: number(overview.completedServices),
      bagToRequestRate: ratio(requestsSent, eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"])),
      demandWithoutSupplyCount: number(overview.supplyGapRequests),
      specialistsWithoutRequestsRate: ratio(specialistsWithoutRequests, publishedSpecialists),
      searchToRequestRate: ratio(requestsSent, searchesPerformed),
      requestToServiceRate: ratio(number(overview.completedServices), requestsSent),
      supplyGapRequests: number(overview.supplyGapRequests),
      gmvCLP: number(overview.gmvCLP),
      platformCommissionNetCLP: number(overview.platformCommissionNetCLP),
      takeRate: ratio(number(overview.platformCommissionNetCLP), number(overview.gmvCLP)),
      creditsSold: number(overview.creditsSold),
      creditsUsed: number(overview.creditsUsed),
      clubRevenueCLP: number(overview.clubRevenueCLP),
      businessRevenueCLP: number(overview.businessRevenueCLP),
      b2bDemandShare: ratio(b2bRequests, requestsSent),
      validatedProfileRate: ratio(approvedSpecialists, specialists.length),
      errorCount: errors,
      complaintsCount: number(overview.complaintsCount),
      cancellationsCount: number(overview.cancellationsCount),
      blockedPaymentsCount: number(overview.paymentIssues),
      pendingDocumentsCount: number(overview.pendingDocumentsCount),
      fraudAlertsCount: number(overview.fraudAlertsCount),
    },
  };
}

function calculateBusinessHealth(snapshot, cfg) {
  const dimensions = cfg.dimensions.map((dimension) => calculateDimension(dimension, snapshot, cfg.thresholds));
  const alerts = dimensions.flatMap((dimension) => dimension.alerts);
  const insufficientSignals = dimensions.flatMap((dimension) => dimension.insufficientSignals);
  const measurable = dimensions.filter((dimension) => dimension.status !== "insufficient_data");
  const status = dimensions.every((dimension) => dimension.status === "insufficient_data")
    ? "insufficient_data"
    : worstStatus(measurable.map((dimension) => dimension.status));
  const score = measurable.length ? Math.round(measurable.reduce((sum, dimension) => sum + (dimension.score || 0), 0) / measurable.length) : null;

  return {
    generatedAt: snapshot.generatedAt,
    status,
    score,
    dimensions,
    alerts,
    insufficientSignals,
    priorities: buildPriorities(alerts, insufficientSignals),
    nextMetric: alerts[0]?.metricKey || insufficientSignals[0]?.metricKey || "servicesCompleted",
  };
}

function calculateDimension(dimension, snapshot, thresholds) {
  const dimensionThresholds = thresholds.filter((threshold) => threshold.dimension === dimension.id);
  const alerts = [];
  const insufficientSignals = [];

  for (const threshold of dimensionThresholds) {
    const value = snapshot.metrics[threshold.metricKey];
    const sampleSize = snapshot.metrics[threshold.sampleMetricKey] || 0;
    if (!Number.isFinite(value)) {
      insufficientSignals.push({ id: threshold.id, dimension: threshold.dimension, metricKey: threshold.metricKey, sampleMetricKey: threshold.sampleMetricKey, sampleSize, minimumSampleSize: threshold.minimumSampleSize, reason: "missing_metric" });
      continue;
    }
    if (sampleSize < threshold.minimumSampleSize) {
      insufficientSignals.push({ id: threshold.id, dimension: threshold.dimension, metricKey: threshold.metricKey, sampleMetricKey: threshold.sampleMetricKey, sampleSize, minimumSampleSize: threshold.minimumSampleSize, reason: "sample_too_small" });
      continue;
    }
    const status = thresholdStatus(threshold, Number(value));
    if (status === "healthy") continue;
    alerts.push({
      id: threshold.id,
      type: threshold.type || "risk",
      status: threshold.type === "opportunity" ? "watch" : status,
      dimension: threshold.dimension,
      label: threshold.label,
      metricKey: threshold.metricKey,
      value,
      sampleMetricKey: threshold.sampleMetricKey,
      sampleSize,
      minimumSampleSize: threshold.minimumSampleSize,
      evaluationWindowDays: threshold.evaluationWindowDays,
      suggestedAction: threshold.suggestedAction,
      approvalRequired: Boolean(threshold.approvalRequired),
      evidence: `${threshold.metricKey}=${formatMetric(value, threshold.unit)} con muestra ${sampleSize}`,
    });
  }

  const status = alerts.length
    ? worstStatus(alerts.map((alert) => alert.status))
    : insufficientSignals.length === dimensionThresholds.length
      ? "insufficient_data"
      : insufficientSignals.length
        ? "watch"
        : "healthy";

  return {
    id: dimension.id,
    label: dimension.label,
    description: dimension.description,
    status,
    score: status === "insufficient_data" ? null : ({ healthy: 100, watch: 75, warning: 45, critical: 15 })[status],
    alerts,
    insufficientSignals,
  };
}

function thresholdStatus(threshold, value) {
  if (threshold.direction === "max") {
    if (value >= threshold.criticalThreshold) return "critical";
    if (value >= threshold.warningThreshold) return "warning";
    if (value >= threshold.watchThreshold) return "watch";
    return "healthy";
  }
  if (value <= threshold.criticalThreshold) return "critical";
  if (value <= threshold.warningThreshold) return "warning";
  if (value <= threshold.watchThreshold) return "watch";
  return "healthy";
}

function buildRecommendations(result, snapshot) {
  const alertIds = new Set(result.alerts.map((alert) => alert.id));
  const metric = snapshot.metrics;
  const items = [];
  if (alertIds.has("supply_gap")) items.push(["Captar oferta por oficio/comuna", "Demanda sin cobertura", "Prospeccion referidos, OMIL/CFT, ferreterias y waitlist honesta", "searchesWithResultsRate", "IA puede preparar"]);
  if (alertIds.has("demand_gap")) items.push(["Aumentar demanda cliente", "Oferta publicada sin solicitudes", "Campana SEO/local y CTA Bolsa por rubro", "requestsSent por especialista", "IA puede preparar"]);
  if (alertIds.has("specialist_conversion") || alertIds.has("onboarding_friction")) items.push(["Reducir friccion de postulacion", "Interes sin finalizacion suficiente", "Lead corto + WhatsApp asistido + tarea CRM", "specialistApplicationsCompleted", "IA puede preparar"]);
  if (alertIds.has("unit_economics") || number(metric.contributionMarginCLP) < 0) items.push(["Revisar unit economics", "Costo variable podria superar comision", "Medir 10 servicios y comparar B2B/SaaS/gestionado", "contributionMarginCLP", "Requiere Benjamin"]);
  if (alertIds.has("b2b_first") || number(metric.b2bDemandShare) >= 0.45) items.push(["Probar B2B-first", "B2B pesa mas que hogar", "Piloto empresas/comunidades sin cambiar precios reales", "requestsSent B2B", "Requiere Benjamin"]);
  if (!items.length) items.push(["Completar medicion", "No hay muestra suficiente", "Consolidar CRM, eventos y solicitudes por 7 dias", result.nextMetric, "IA puede preparar"]);
  return items.slice(0, 5).map(([title, evidence, experiment, metricName, authority], index) => ({ id: `rec-${index + 1}`, title, evidence, experiment, metric: metricName, authority }));
}

function renderReport(result, snapshot, recommendations) {
  return `# Business health report - ${reportDate}

## 1. Resumen ejecutivo

Estado global: **${result.status}**
Score: **${result.score === null ? "sin datos suficientes" : `${result.score}/100`}**

Este reporte usa solo datos agregados disponibles. No incluye secretos ni datos personales. Cuando la muestra no alcanza el minimo configurado, el resultado queda como **insufficient_data**.

## 2. Estado global

${result.dimensions.map((dimension) => `- ${dimension.label}: ${dimension.status}${dimension.score === null ? "" : ` (${dimension.score}/100)`}`).join("\n")}

## 3. Oferta

${renderDimension(result, "supply")}

## 4. Demanda

${renderDimension(result, "demand")}

## 5. Liquidez

${renderDimension(result, "liquidity")}

## 6. Economia

${renderDimension(result, "economics")}

## 7. Confianza/operacion

${renderDimension(result, "trust")}

## 8. Alertas

${result.alerts.length ? result.alerts.map((alert) => `- ${alert.status}: ${alert.label}. ${alert.evidence}. Accion: ${alert.suggestedAction}`).join("\n") : "- Sin alertas concluyentes."}

## 9. Datos insuficientes

${result.insufficientSignals.length ? result.insufficientSignals.map((signal) => `- ${signal.metricKey}: muestra ${signal.sampleSize}/${signal.minimumSampleSize} (${signal.reason}).`).join("\n") : "- No hay senales insuficientes para los umbrales activos."}

## 10. Tres prioridades recomendadas

${result.priorities.slice(0, 3).map((priority, index) => `${index + 1}. ${priority}`).join("\n")}

## 11. Experimentos propuestos

${recommendations.map((item, index) => `${index + 1}. ${item.title}: ${item.experiment}. Metrica: ${item.metric}. Autoridad: ${item.authority}.`).join("\n")}

## 12. Decisiones que requieren aprobacion de Benjamin

${result.alerts.some((alert) => alert.approvalRequired) || recommendations.some((item) => item.authority.includes("Benjamin")) ? "- Revisar recomendaciones marcadas con aprobacion Benjamin antes de cambiar precios, comisiones, cobros, legal, tributario o estrategia comercial sensible." : "- No hay decisiones sensibles concluyentes en este reporte."}

## 13. Paquete de trabajo para Codex

- Causa tecnica probable: ${result.nextMetric === "servicesCompleted" ? "seguir instrumentando North Star y CRM" : `mejorar medicion o conversion de ${result.nextMetric}`}.
- Archivos probables: analytics, CRM admin, formularios, docs o scripts segun la alerta.
- Criterios de aceptacion: validate/build pasan, no se toca Worker/D1/pagos sin aprobacion, no se muestran datos demo como reales.
- Tests: npm.cmd run validate, npm.cmd run build y script de reporte.
- Modulos que no debe tocar: Worker, D1, wrangler.toml, Mercado Pago, checkout y contratos salvo aprobacion explicita.

## 14. Paquete de trabajo para Claude

- Paginas: Home, especialistas fundadores, registro especialista, Bolsa o Empresas segun alerta.
- Friccion: revisar pasos con abandono o copy confuso.
- Copy: honesto, sin prometer ingresos.
- Mobile: CTA visible, formularios cortos, estados claros.
- Confianza: explicar verificacion, formalizacion y proceso.
- Modulos que no debe tocar: backend critico, Worker, D1, pagos y CRM sensible.

## 15. Preguntas de auditoria para Grok

- Que benchmark contradice la estrategia actual?
- Hay senales de que B2B deberia priorizarse antes que hogar?
- La propuesta de valor para especialistas es suficientemente concreta?
- Que riesgo operacional aparece si escala el volumen actual?
- Que experimento pequeno invalidaria o confirmaria el modelo?

## 16. Metrica que debe mejorar en el proximo ciclo

**${result.nextMetric}**

## Fuentes

${snapshot.sources?.length ? snapshot.sources.map((source) => `- ${source}`).join("\n") : "- Sin export local. Todavia no medible."}
`;
}

function renderDimension(result, dimensionId) {
  const dimension = result.dimensions.find((item) => item.id === dimensionId);
  if (!dimension) return "Todavia no medible.";
  const alerts = dimension.alerts.map((alert) => `- Alerta ${alert.status}: ${alert.label} (${alert.evidence}).`);
  const missing = dimension.insufficientSignals.slice(0, 5).map((signal) => `- Datos insuficientes: ${signal.metricKey}, muestra ${signal.sampleSize}/${signal.minimumSampleSize}.`);
  return [`Estado: **${dimension.status}**`, ...alerts, ...missing].join("\n");
}

function buildPriorities(alerts, insufficientSignals) {
  if (alerts.length) return alerts.slice(0, 3).map((alert) => `${alert.label}: ${alert.suggestedAction}`);
  if (insufficientSignals.length) return ["Completar medicion semanal antes de sacar conclusiones fuertes.", "Priorizar instrumentacion de oferta, demanda, liquidez, economia y confianza.", "Revisar CRM y conversion events para completar muestras minimas."];
  return ["Mantener ciclo semanal.", "Buscar siguiente cuello de botella medible.", "Comparar oferta, demanda y economia antes de mover el modelo."];
}

function worstStatus(statuses) {
  const rank = { healthy: 0, insufficient_data: 1, watch: 2, warning: 3, critical: 4 };
  return statuses.reduce((worst, status) => (rank[status] > rank[worst] ? status : worst), "healthy");
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : [];
}

function eventName(row) {
  return String(row.eventName || row.name || row.type || row.event || "");
}

function ratio(numerator, denominator) {
  const top = number(numerator);
  const bottom = number(denominator);
  if (!bottom) return undefined;
  return top / bottom;
}

function number(value) {
  const next = Number(value || 0);
  return Number.isFinite(next) ? next : 0;
}

function isApprovedSpecialist(row) {
  const status = String(row.status || row.applicationStatus || "").toLowerCase();
  return ["approved", "aprobado", "published", "publicado", "active", "activo"].includes(status);
}

function isPublishedSpecialist(row) {
  const status = String(row.status || row.publicationStatus || "").toLowerCase();
  return Boolean(row.publishedAt || row.isPublished || ["published", "publicado", "active", "activo"].includes(status));
}

function hasCompleteProfile(row) {
  const score = number(row.profileCompletion || row.completionScore || row.profileCompletionScore);
  if (score >= 80) return true;
  return Boolean(row.name && row.phone && row.commune && (row.trade || row.primaryTrade || row.profession));
}

function uniqueCoverage(rows) {
  const keys = new Set();
  for (const row of rows) {
    const trade = String(row.trade || row.primaryTrade || row.profession || "");
    const commune = String(row.commune || "");
    if (trade && commune) keys.add(`${trade}:${commune}`);
  }
  return keys.size;
}

function formatMetric(value, unit) {
  if (!Number.isFinite(value)) return "sin datos";
  if (unit === "rate") return `${Math.round(value * 1000) / 10}%`;
  if (unit === "clp") return `$${Math.round(value).toLocaleString("es-CL")}`;
  return Math.round(value * 100) / 100;
}
