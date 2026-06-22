"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { businessHealthStatusClasses, businessHealthStatusLabels } from "@/config/businessModelHealthConfig";
import { activeGrowthExperiments, growthExperiments } from "@/data/growthExperiments";
import { adminRequestHeaders, adminSessionToken, hasAdminBrowserSession, initialAdminToken, persistAdminToken } from "@/lib/adminAuth";
import { calculateBusinessHealth, formatBusinessMetric, ratio } from "@/lib/businessHealth/businessHealthCalculator";
import { buildModelRecommendations } from "@/lib/businessHealth/modelRecommendations";
import type { BusinessHealthSnapshot, BusinessHealthStatus } from "@/lib/businessHealth/types";

type AdminRow = Record<string, unknown>;

const tokenStorageKey = "oficiospro.adminBusinessHealthToken";

export function AdminBusinessHealthPage() {
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("Ingresa ADMIN_TOKEN para evaluar salud del modelo con datos reales.");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<AdminRow[]>([]);
  const [specialists, setSpecialists] = useState<AdminRow[]>([]);
  const [opportunities, setOpportunities] = useState<AdminRow[]>([]);
  const [tasks, setTasks] = useState<AdminRow[]>([]);
  const [overview, setOverview] = useState<AdminRow | null>(null);

  useEffect(() => {
    const initial = initialAdminToken(tokenStorageKey);
    setToken(initial);
    setTokenDraft(initial === adminSessionToken ? "" : initial);
    if (initial) void loadHealthData(initial);
  }, []);

  const snapshot = useMemo(() => buildSnapshot({ events, specialists, opportunities, tasks, overview }), [events, specialists, opportunities, tasks, overview]);
  const health = useMemo(() => calculateBusinessHealth(snapshot), [snapshot]);
  const recommendations = useMemo(() => buildModelRecommendations(health, snapshot), [health, snapshot]);
  const experiments = activeGrowthExperiments.length ? activeGrowthExperiments : growthExperiments.slice(0, 4);

  async function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenDraft.trim();
    persistAdminToken(tokenStorageKey, next);
    const active = next || (hasAdminBrowserSession() ? adminSessionToken : "");
    setToken(active);
    setNotice(active ? "Acceso admin activo. Consultando datos reales..." : "Ingresa un token admin valido o inicia sesion como administrador.");
    if (active) await loadHealthData(active);
  }

  async function loadHealthData(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    try {
      const [eventsData, specialistsData, opportunitiesData, tasksData, overviewData] = await Promise.all([
        adminFetch(activeToken, "/api/admin/conversion-events?limit=500"),
        adminFetch(activeToken, "/api/admin/specialists?limit=300"),
        adminFetch(activeToken, "/api/admin/crm/opportunities?limit=300"),
        adminFetch(activeToken, "/api/admin/crm/tasks?limit=300"),
        adminFetch(activeToken, "/api/admin/crm/overview"),
      ]);
      setEvents(arrayFrom(eventsData.conversionEvents));
      setSpecialists(arrayFrom(specialistsData.specialists));
      setOpportunities(arrayFrom(opportunitiesData.opportunities));
      setTasks(arrayFrom(tasksData.tasks));
      setOverview((overviewData.overview as AdminRow) ?? null);
      setNotice("Salud del modelo calculada con datos reales disponibles. Las dimensiones sin muestra suficiente quedan como datos insuficientes.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section grid gap-6">
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Panel interno OficiosPro</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">Salud del modelo</h1>
            <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">
              Evalua oferta, demanda, liquidez, economia y confianza sin inventar datos. Cuando falta evidencia, el sistema marca datos insuficientes.
            </p>
          </div>
          <form className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:min-w-96" onSubmit={saveToken}>
            <label className="field">
              Token admin
              <input value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} type="password" autoComplete="off" placeholder="ADMIN_TOKEN" />
            </label>
            <button className="btn-primary" type="submit">Usar token</button>
            <span className="text-xs font-bold text-muted">El token queda solo durante la sesion del navegador.</span>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link className="rounded-2xl border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:bg-brand-soft" href="/admin/crm">
            CRM
          </Link>
          <Link className="rounded-2xl border border-brand bg-brand-soft px-4 py-2 text-sm font-black text-brand-dark" href="/admin/crm/business-health">
            Salud del modelo
          </Link>
          <Link className="rounded-2xl border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:bg-brand-soft" href="/admin/crm/acquisition">
            Captacion especialistas
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-brand/15 bg-brand-soft p-4 text-sm font-black leading-6 text-brand-dark">
        {notice}
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <DashboardMetricCard label="Estado general" value={businessHealthStatusLabels[health.status]} detail={health.score === null ? "Sin muestra suficiente" : `Score ${health.score}/100`} tone={health.status === "critical" ? "brand" : "light"} />
        <DashboardMetricCard label="Alertas activas" value={String(health.alerts.length)} detail="Riesgos y oportunidades" />
        <DashboardMetricCard label="Datos insuficientes" value={String(health.insufficientSignals.length)} detail="No concluyentes" />
        <DashboardMetricCard label="Eventos leidos" value={String(events.length)} detail="Conversion events" />
        <DashboardMetricCard label="Especialistas leidos" value={String(specialists.length)} detail="D1 admin" />
      </section>

      {!token ? (
        <EmptyState
          eyebrow="Acceso requerido"
          title="Ingresa token admin para consultar datos reales."
          text="La vista no usa datos demo. Si no hay token o muestra suficiente, solo veras estados de falta de datos."
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-5">
        {health.dimensions.map((dimension) => (
          <article key={dimension.id} className={`rounded-[24px] border p-5 shadow-sm ${businessHealthStatusClasses[dimension.status]}`}>
            <span className="text-xs font-black uppercase opacity-75">{businessHealthStatusLabels[dimension.status]}</span>
            <h2 className="mt-2 text-xl font-black">{dimension.label}</h2>
            <p className="mt-2 text-sm font-bold leading-6 opacity-80">{dimension.description}</p>
            <strong className="mt-4 block text-3xl font-black">{dimension.score === null ? "-" : dimension.score}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Alertas activas" eyebrow="Modelo">
          {health.alerts.length ? (
            <div className="grid gap-3">
              {health.alerts.map((alert) => (
                <article key={alert.id} className={`rounded-2xl border p-4 ${businessHealthStatusClasses[alert.status]}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black">{alert.label}</h3>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase">{alert.type}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6">{alert.evidence}</p>
                  <p className="mt-2 text-sm font-bold leading-6 opacity-80">{alert.suggestedAction}</p>
                  {alert.approvalRequired ? <p className="mt-2 text-xs font-black uppercase">Requiere aprobacion de Benjamin</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin alertas concluyentes." text="Si la muestra es baja, revisar primero datos insuficientes antes de declarar el modelo saludable." />
          )}
        </Panel>

        <Panel title="Datos insuficientes" eyebrow="Evidencia">
          {health.insufficientSignals.length ? (
            <div className="max-h-[420px] overflow-auto rounded-2xl border border-line">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Senal</th>
                    <th className="px-3 py-2">Muestra</th>
                    <th className="px-3 py-2">Minimo</th>
                  </tr>
                </thead>
                <tbody>
                  {health.insufficientSignals.map((signal) => (
                    <tr key={signal.id} className="border-t border-line">
                      <td className="px-3 py-2 font-bold text-ink">{signal.metricKey}</td>
                      <td className="px-3 py-2 text-muted">{signal.sampleSize}</td>
                      <td className="px-3 py-2 text-muted">{signal.minimumSampleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Muestras suficientes para los umbrales activos." text="Mantener monitoreo semanal y revisar calidad de fuentes." />
          )}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Recomendaciones priorizadas" eyebrow="Siguiente ciclo">
          <div className="grid gap-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <h3 className="font-black text-ink">{recommendation.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-muted">{recommendation.evidence}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-muted">Experimento: {recommendation.experiment}</p>
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-brand-dark">
                  {recommendation.authorityRequired === "benjamin_approval_required" ? "Aprobacion Benjamin" : "IA puede preparar"}
                </span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Experimentos" eyebrow="Registro">
          <div className="grid gap-3">
            {experiments.map((experiment) => (
              <article key={experiment.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black text-ink">{experiment.title}</h3>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black uppercase text-brand-dark">{experiment.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-muted">{experiment.hypothesis}</p>
                <p className="mt-2 text-xs font-black uppercase text-muted">Metrica: {experiment.primaryMetric}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Ultimo reporte semanal" eyebrow="Archivo">
          <p className="text-sm font-bold leading-6 text-muted">
            Genera el reporte con <code className="rounded bg-slate-100 px-1 py-0.5">node scripts/generate-business-health-report.mjs</code>. El archivo queda en <code className="rounded bg-slate-100 px-1 py-0.5">reports/business-health/YYYY-MM-DD.md</code>.
          </p>
          <button className="btn-secondary mt-4" type="button" disabled={loading} onClick={() => loadHealthData()}>
            {loading ? "Cargando..." : "Actualizar datos"}
          </button>
        </Panel>

        <Panel title="Metrica del proximo ciclo" eyebrow="Kaizen">
          <strong className="block text-3xl font-black text-ink">{health.nextMetric}</strong>
          <p className="mt-3 text-sm font-bold leading-6 text-muted">
            Pregunta obligatoria: Las mejoras de esta semana aumentaron oferta, demanda, liquidez, confianza o economia?
          </p>
          <div className="mt-4 grid gap-2">
            {health.priorities.map((priority) => (
              <p key={priority} className="rounded-2xl border border-line bg-slate-50 p-3 text-sm font-bold leading-6 text-muted">{priority}</p>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function buildSnapshot(input: { events: AdminRow[]; specialists: AdminRow[]; opportunities: AdminRow[]; tasks: AdminRow[]; overview: AdminRow | null }): BusinessHealthSnapshot {
  const eventCount = (names: string[]) => input.events.filter((event) => names.includes(eventName(event))).length;
  const founderLandingViews = eventCount(["founder_landing_view"]);
  const offerServicesClicks = eventCount(["click_offer_services", "founder_cta_click"]);
  const specialistApplicationStarts = eventCount(["specialist_application_started"]);
  const specialistApplicationsCompleted = Math.max(eventCount(["specialist_application_submitted"]), input.specialists.length);
  const onboardingLosses = eventCount(["specialist_application_abandoned", "specialist_application_failed", "specialist_application_step_error"]);
  const publishedSpecialists = input.specialists.filter(isPublishedSpecialist).length;
  const approvedSpecialists = input.specialists.filter(isApprovedSpecialist).length;
  const completeProfiles = input.specialists.filter(hasCompleteProfile).length;
  const searchesPerformed = eventCount(["search_performed", "click_search_specialist"]);
  const requestsSent = Number(input.overview?.newLeads ?? 0) + input.opportunities.filter((row) => ["clientes", "empresas", "comunidades"].includes(String(row.pipeline ?? ""))).length;
  const b2bRequests = input.opportunities.filter((row) => ["empresas", "comunidades", "b2b"].includes(String(row.pipeline ?? "")) || String(row.type ?? "").includes("company")).length;
  const specialistsWithoutRequests = input.specialists.filter((row) => isPublishedSpecialist(row) && Number(row.requestCount ?? row.requestsCount ?? 0) === 0).length;
  const overdueTasks = input.tasks.filter((row) => String(row.status ?? "") !== "done" && isPastDate(row.dueAt)).length;
  const errors = eventCount(["specialist_application_failed", "lead_submit_failed", "checkout_failed", "payment_failed"]);

  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    sources: ["conversion_events", "specialist_applications", "crm_opportunities", "crm_tasks", "crm_overview"],
    metrics: {
      founderLandingViews,
      offerServicesClicks,
      specialistApplicationStarts,
      specialistApplicationsCompleted,
      approvedSpecialists,
      publishedSpecialists,
      coverageByTradeCommune: uniqueCoverage(input.specialists),
      specialistsWithCompleteProfileRate: ratio(completeProfiles, input.specialists.length),
      specialistApplicationSubmitRate: ratio(specialistApplicationsCompleted, founderLandingViews),
      onboardingFrictionRate: ratio(onboardingLosses, specialistApplicationStarts),
      leadQualityRate: ratio(completeProfiles, specialistApplicationsCompleted),
      specialistsPageViews: eventCount(["specialists_page_view", "page_view_especialistas"]),
      searchesPerformed,
      profilesViewed: eventCount(["specialist_profile_view", "profile_view"]),
      specialistsAddedToBag: eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"]),
      quotesStarted: eventCount(["virtual_quote_started", "quote_started"]),
      requestsSent,
      servicesCompleted: Number(input.overview?.completedServices ?? 0),
      bagToRequestRate: ratio(requestsSent, eventCount(["specialist_reservation_added_to_bag", "specialist_quote_added_to_bag"])),
      demandWithoutSupplyCount: Number(input.overview?.supplyGapRequests ?? 0),
      specialistsWithoutRequestsRate: ratio(specialistsWithoutRequests, publishedSpecialists),
      firstResponseMedianHours: undefined,
      searchesWithResultsRate: undefined,
      searchToRequestRate: ratio(requestsSent, searchesPerformed),
      requestToServiceRate: ratio(Number(input.overview?.completedServices ?? 0), requestsSent),
      supplyGapRequests: Number(input.overview?.supplyGapRequests ?? 0),
      gmvCLP: Number(input.overview?.gmvCLP ?? 0),
      platformCommissionNetCLP: Number(input.overview?.platformCommissionNetCLP ?? 0),
      takeRate: ratio(Number(input.overview?.platformCommissionNetCLP ?? 0), Number(input.overview?.gmvCLP ?? 0)),
      variableCostPerOperationCLP: undefined,
      contributionMarginCLP: undefined,
      cacByChannelCLP: undefined,
      recurrenceRate: undefined,
      creditsSold: Number(input.overview?.creditsSold ?? 0),
      creditsUsed: Number(input.overview?.creditsUsed ?? 0),
      clubRevenueCLP: Number(input.overview?.clubRevenueCLP ?? 0),
      businessRevenueCLP: Number(input.overview?.businessRevenueCLP ?? 0),
      unitEconomicsCoverageRate: undefined,
      b2bDemandShare: ratio(b2bRequests, requestsSent),
      validatedProfileRate: ratio(approvedSpecialists, input.specialists.length),
      reviewSlaHours: undefined,
      errorCount: errors,
      complaintsCount: Number(input.overview?.complaintsCount ?? 0),
      cancellationsCount: Number(input.overview?.cancellationsCount ?? 0),
      blockedPaymentsCount: Number(input.overview?.paymentIssues ?? 0),
      pendingDocumentsCount: Number(input.overview?.pendingDocumentsCount ?? 0),
      fraudAlertsCount: Number(input.overview?.fraudAlertsCount ?? 0),
      nps: undefined,
    },
  };
}

async function adminFetch(token: string, endpoint: string) {
  const response = await fetch(endpoint, {
    credentials: "include",
    headers: adminRequestHeaders(token),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.ok === false) throw new Error(String(data.error ?? `http_${response.status}`));
  return data;
}

function arrayFrom(value: unknown): AdminRow[] {
  return Array.isArray(value) ? (value as AdminRow[]) : [];
}

function eventName(row: AdminRow) {
  return String(row.eventName ?? row.name ?? row.type ?? row.event ?? "");
}

function isApprovedSpecialist(row: AdminRow) {
  const status = String(row.status ?? row.applicationStatus ?? "").toLowerCase();
  return ["approved", "aprobado", "published", "publicado", "active", "activo"].includes(status);
}

function isPublishedSpecialist(row: AdminRow) {
  const status = String(row.status ?? row.publicationStatus ?? "").toLowerCase();
  return Boolean(row.publishedAt || row.isPublished || ["published", "publicado", "active", "activo"].includes(status));
}

function hasCompleteProfile(row: AdminRow) {
  const score = Number(row.profileCompletion ?? row.completionScore ?? row.profileCompletionScore ?? 0);
  if (score >= 80) return true;
  return Boolean(row.name && row.phone && row.commune && (row.trade || row.primaryTrade || row.profession));
}

function uniqueCoverage(rows: AdminRow[]) {
  const keys = new Set<string>();
  for (const row of rows) {
    const trade = String(row.trade ?? row.primaryTrade ?? row.profession ?? "");
    const commune = String(row.commune ?? "");
    if (trade && commune) keys.add(`${trade}:${commune}`);
  }
  return keys.size;
}

function isPastDate(value: unknown) {
  if (!value) return false;
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) && date.getTime() < Date.now();
}

function adminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "unauthorized") return "Token admin no autorizado.";
  if (message === "database_not_configured") return "Falta configurar D1 DB.";
  if (message === "crm_tables_not_ready") return "Faltan migraciones CRM.";
  return `No pudimos cargar salud del modelo: ${message}`;
}
