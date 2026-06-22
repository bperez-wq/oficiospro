"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { businessHealthStatusClasses, businessHealthStatusLabels } from "@/config/businessModelHealthConfig";
import { growthExperiments } from "@/data/growthExperiments";
import { adminRequestHeaders, adminSessionToken, hasAdminBrowserSession, initialAdminToken, persistAdminToken } from "@/lib/adminAuth";
import { calculateBusinessHealth, ratio } from "@/lib/businessHealth/businessHealthCalculator";
import { buildModelRecommendations } from "@/lib/businessHealth/modelRecommendations";
import type {
  BusinessHealthAlert,
  BusinessHealthDimensionResult,
  BusinessHealthResult,
  BusinessHealthSnapshot,
  BusinessHealthStatus,
  GrowthExperiment,
  GrowthExperimentStatus,
  ModelRecommendation,
} from "@/lib/businessHealth/types";

type AdminRow = Record<string, unknown>;

const tokenStorageKey = "oficiospro.adminBusinessHealthToken";

const STATUS_META: Record<BusinessHealthStatus, { icon: string; tag: string; help: string }> = {
  healthy: { icon: "OK", tag: "Saludable", help: "En el rango objetivo" },
  watch: { icon: "~", tag: "En observación", help: "Vigilar de cerca" },
  warning: { icon: "!", tag: "Atención", help: "Bajo lo esperado" },
  critical: { icon: "X", tag: "Crítico", help: "Riesgo para el modelo" },
  insufficient_data: { icon: "?", tag: "Datos insuficientes", help: "Aún no se puede concluir" },
};

const EXPERIMENT_STATUS_ORDER: GrowthExperimentStatus[] = ["running", "approved", "proposed", "completed", "stopped"];
const EXPERIMENT_STATUS_LABEL: Record<GrowthExperimentStatus, string> = {
  proposed: "Propuestos",
  approved: "Aprobados",
  running: "En curso",
  completed: "Completados",
  stopped: "Detenidos",
};

const AI_ROLES: { key: GrowthExperiment["owner"]; title: string; scope: string[] }[] = [
  { key: "ChatGPT", title: "ChatGPT", scope: ["Síntesis de hallazgos", "Priorización", "Decisiones pendientes"] },
  { key: "Codex", title: "Codex", scope: ["Implementación técnica", "Archivos permitidos", "Criterios de aceptación", "Validaciones"] },
  { key: "Claude", title: "Claude", scope: ["UX y jerarquía visual", "Copy", "Mobile", "Conversión"] },
  { key: "Grok", title: "Grok", scope: ["Benchmark", "Auditoría crítica", "Riesgos externos"] },
];

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

  const dimsWithData = health.dimensions.filter((dimension) => dimension.status !== "insufficient_data").length;
  const totalDims = health.dimensions.length;
  const topRecommendation = recommendations[0] ?? null;
  const approvals = useMemo(() => collectApprovals(health, recommendations, growthExperiments), [health, recommendations]);

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
      {/* NAV + TOKEN */}
      <section className="rounded-[24px] border border-line bg-white p-4 shadow-soft md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap gap-2" aria-label="Navegacion CRM">
            <Link className="rounded-2xl border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:bg-brand-soft" href="/admin/crm">CRM</Link>
            <Link className="rounded-2xl border border-brand bg-brand-soft px-4 py-2 text-sm font-black text-brand-dark" href="/admin/crm/business-health" aria-current="page">Salud del modelo</Link>
            <Link className="rounded-2xl border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:bg-brand-soft" href="/admin/crm/acquisition">Captacion</Link>
          </nav>
          <form className="flex flex-wrap items-end gap-2" onSubmit={saveToken}>
            <label className="field min-w-44">
              <span className="sr-only">Token admin</span>
              <input value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} type="password" autoComplete="off" placeholder="ADMIN_TOKEN" />
            </label>
            <button className="btn-primary" type="submit">Usar token</button>
          </form>
        </div>
      </section>

      {/* CABECERA EJECUTIVA */}
      <section className={`rounded-[32px] border p-6 shadow-soft md:p-8 ${businessHealthStatusClasses[health.status]}`}>
        <p className="text-xs font-black uppercase tracking-wide opacity-70">Salud del modelo - OficiosPro</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-2xl font-black" aria-hidden>{STATUS_META[health.status].icon}</span>
              <div>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">{STATUS_META[health.status].tag}</h1>
                <p className="text-sm font-black opacity-75">{businessHealthStatusLabels[health.status]} - {STATUS_META[health.status].help}</p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 opacity-80">
              {health.status === "insufficient_data"
                ? "Todavía no hay datos suficientes para evaluar el modelo con confianza. Revisa abajo qué falta medir."
                : "Resumen ejecutivo del estado de oferta, demanda, liquidez, economía y confianza. No se inventan datos: lo no medible queda marcado."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeaderStat label="Score global" value={health.score === null ? "-" : `${health.score}/100`} hint="0-100" />
            <HeaderStat label="Confianza de datos" value={`${dimsWithData}/${totalDims}`} hint="dimensiones con muestra" />
            <HeaderStat label="Ventana" value={`${snapshot.windowDays} días`} hint={formatDateTime(health.generatedAt)} />
            <HeaderStat label="Alertas activas" value={String(health.alerts.length)} hint={`${health.insufficientSignals.length} señales sin dato`} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl bg-white/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide opacity-70">Acción recomendada principal</p>
            <p className="mt-1 text-base font-black text-ink">{topRecommendation ? topRecommendation.title : "Sin acción crítica priorizada por ahora."}</p>
            {topRecommendation ? <p className="mt-1 text-sm font-bold leading-6 text-muted">{topRecommendation.evidence}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" type="button" disabled={loading} onClick={() => loadHealthData()}>{loading ? "Cargando..." : "Revisar datos"}</button>
            <Link className="btn-secondary" href="#reporte">Último reporte</Link>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-brand/15 bg-brand-soft px-4 py-3 text-sm font-bold leading-6 text-brand-dark">{notice}</section>

      {!token ? (
        <EmptyState
          eyebrow="Acceso requerido"
          title="Ingresa el token admin para consultar datos reales."
          text="Esta vista no usa datos demo. Sin token o sin muestra suficiente, solo verás estados de falta de datos."
        />
      ) : null}

      {/* INSUFFICIENT DATA */}
      {health.status === "insufficient_data" ? <InsufficientDataPanel health={health} snapshot={snapshot} /> : null}

      {/* DIMENSIONES */}
      <section className="grid gap-4">
        <SectionTitle eyebrow="Dimensiones del modelo" title="Cómo está cada parte" hint="Estado, qué sabemos y qué falta por medir." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {health.dimensions.map((dimension) => (
            <DimensionCard key={dimension.id} dimension={dimension} />
          ))}
        </div>
      </section>

      {/* QUE DEBEMOS HACER AHORA */}
      <section className="grid gap-4">
        <SectionTitle eyebrow="Próxima acción" title="Qué debemos hacer ahora" hint="Máximo tres prioridades, ordenadas por el sistema." />
        {recommendations.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <PriorityCard key={recommendation.id} order={index + 1} recommendation={recommendation} />
            ))}
          </div>
        ) : (
          <EmptyState title="Sin prioridades concluyentes todavía." text="Cuando haya más evidencia, el sistema propondrá hasta tres acciones ordenadas por impacto y riesgo." />
        )}
      </section>

      {/* APROBACIONES */}
      <section className="grid gap-4">
        <SectionTitle eyebrow="Gobernanza" title="Decisiones que requieren aprobación" hint="Precios, comisión, pagos, legal, alianzas o lanzamientos." />
        {approvals.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {approvals.map((item) => (
              <article key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-amber-900">{item.label}</h3>
                  <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black uppercase text-amber-800">{item.source}</span>
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-900/80">{item.detail}</p>
                <p className="mt-2 text-xs font-black uppercase text-amber-800">Requiere aprobación de Benjamín</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-black text-emerald-800">
            No hay decisiones críticas esperando aprobación.
          </div>
        )}
      </section>

      {/* EXPERIMENTOS */}
      <ExperimentsSection experiments={growthExperiments} />

      {/* HANDOFF IA */}
      <section className="grid gap-4">
        <SectionTitle eyebrow="Orquestación IA" title="Paquetes de trabajo IA" hint="Alcance de cada IA. El bloque copiable se arma con los datos actuales del panel, no inventa tareas." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {AI_ROLES.map((role) => (
            <AiHandoffCard key={role.title} role={role} block={buildHandoffBlock(role.key, health, recommendations, growthExperiments)} />
          ))}
        </div>
      </section>

      {/* REPORTE + METRICA */}
      <section id="reporte" className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Último reporte semanal" eyebrow="Archivo">
          <p className="text-sm font-bold leading-6 text-muted">
            Genera el reporte con <code className="rounded bg-slate-100 px-1 py-0.5">node scripts/generate-business-health-report.mjs</code>. Queda en <code className="rounded bg-slate-100 px-1 py-0.5">reports/business-health/YYYY-MM-DD.md</code>.
          </p>
          <button className="btn-secondary mt-4" type="button" disabled={loading} onClick={() => loadHealthData()}>
            {loading ? "Cargando..." : "Actualizar datos"}
          </button>
        </Panel>

        <Panel title="Métrica del próximo ciclo" eyebrow="Kaizen">
          <strong className="block text-2xl font-black text-ink">{health.nextMetric}</strong>
          <p className="mt-3 text-sm font-bold leading-6 text-muted">
            Pregunta obligatoria: ¿las mejoras de esta semana aumentaron oferta, demanda, liquidez, confianza o economía?
          </p>
          {health.priorities.length ? (
            <div className="mt-4 grid gap-2">
              {health.priorities.map((priority) => (
                <p key={priority} className="rounded-2xl border border-line bg-slate-50 p-3 text-sm font-bold leading-6 text-muted">{priority}</p>
              ))}
            </div>
          ) : null}
        </Panel>
      </section>
    </main>
  );
}

/* ---------- Presentational helpers ---------- */

function SectionTitle({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="text-2xl font-black text-ink md:text-3xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm font-bold leading-6 text-muted">{hint}</p> : null}
    </div>
  );
}

function HeaderStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] font-bold leading-4 opacity-70">{hint}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: BusinessHealthStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${businessHealthStatusClasses[status]}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.tag}
    </span>
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

function DimensionCard({ dimension }: { dimension: BusinessHealthDimensionResult }) {
  const measured = Object.values(dimension.metrics).filter((value) => value !== undefined && value !== null).length;
  const topAlert = dimension.alerts[0];
  return (
    <article className="grid gap-3 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-black text-ink">{dimension.label}</h3>
        <StatusBadge status={dimension.status} />
      </div>
      <p className="text-sm font-bold leading-6 text-muted">{dimension.description}</p>
      <div className="flex items-center gap-3">
        <strong className="text-3xl font-black text-ink">{dimension.score === null ? "-" : dimension.score}</strong>
        <span className="text-xs font-bold leading-4 text-muted">
          {measured} métrica{measured === 1 ? "" : "s"} con dato
          {dimension.insufficientSignals.length ? ` - ${dimension.insufficientSignals.length} por medir` : ""}
        </span>
      </div>
      {topAlert ? (
        <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold leading-6 text-ink">
          <span className="text-xs font-black uppercase text-muted">Acción: </span>{topAlert.suggestedAction}
        </p>
      ) : null}
      {dimension.insufficientSignals.length ? (
        <details className="rounded-xl border border-dashed border-line bg-slate-50/70 p-3">
          <summary className="cursor-pointer text-xs font-black uppercase text-muted">Qué falta medir</summary>
          <ul className="mt-2 grid gap-1">
            {dimension.insufficientSignals.slice(0, 6).map((signal) => (
              <li key={signal.id} className="text-xs font-bold leading-5 text-muted">
                {signal.metricKey} - {signal.reason === "missing_metric" ? "sin dato" : `muestra ${signal.sampleSize}/${signal.minimumSampleSize}`}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}

function InsufficientDataPanel({ health, snapshot }: { health: BusinessHealthResult; snapshot: BusinessHealthSnapshot }) {
  const signals = health.insufficientSignals;
  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl font-black text-slate-500" aria-hidden>?</span>
        <div>
          <h2 className="text-xl font-black text-ink">Todavía no hay datos suficientes</h2>
          <p className="text-sm font-bold text-muted">No es un error: el modelo necesita más muestra antes de concluir.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <InfoBlock title="Qué falta medir">
          {signals.length ? (
            <ul className="grid gap-1.5">
              {signals.slice(0, 8).map((signal) => (
                <li key={signal.id} className="text-sm font-bold leading-5 text-ink">
                  {signal.metricKey}
                  <span className="block text-xs font-bold text-muted">
                    {signal.reason === "missing_metric" ? "Sin dato disponible" : `Muestra ${signal.sampleSize} / mínimo ${signal.minimumSampleSize}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-bold text-muted">Sin señales pendientes registradas.</p>
          )}
        </InfoBlock>
        <InfoBlock title="De dónde deberían provenir">
          <ul className="grid gap-1.5 text-sm font-bold leading-5 text-ink">
            {(snapshot.sources ?? ["conversion_events", "specialist_applications", "crm"]).map((source) => (
              <li key={source}>{sourceLabelEs(source)}</li>
            ))}
          </ul>
        </InfoBlock>
        <InfoBlock title="Qué acción habilita la medición">
          <ul className="grid gap-1.5 text-sm font-bold leading-5 text-ink">
            <li>Generar tráfico real con links <code className="rounded bg-white px-1">?source=</code> (Claude / Operaciones).</li>
            <li>Impulsar postulaciones de especialistas reales (Operaciones).</li>
            <li>Confirmar que D1 y los endpoints CRM devuelven datos (Codex).</li>
          </ul>
        </InfoBlock>
      </div>
      <p className="mt-4 text-xs font-bold text-muted">No se muestran cifras estimadas: cada dimensión sin muestra queda marcada como datos insuficientes.</p>
    </section>
  );
}

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-muted">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PriorityCard({ order, recommendation }: { order: number; recommendation: ModelRecommendation }) {
  const needsApproval = recommendation.authorityRequired === "benjamin_approval_required";
  return (
    <article className="grid gap-3 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-white">{order}</span>
        <h3 className="text-lg font-black leading-tight text-ink">{recommendation.title}</h3>
      </div>
      <DataRow label="Evidencia" value={recommendation.evidence} />
      <DataRow label="Métrica afectada" value={recommendation.metric} />
      <DataRow label="Acción" value={`${recommendation.experiment} - ${recommendation.durationDays} días`} />
      {recommendation.risk ? <DataRow label="Riesgo" value={recommendation.risk} /> : null}
      <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black uppercase ${needsApproval ? "bg-amber-50 text-amber-800" : "bg-brand-soft text-brand-dark"}`}>
        {needsApproval ? "Requiere aprobación Benjamín" : "IA puede preparar"}
      </span>
    </article>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm font-bold leading-6 text-muted">
      <span className="text-xs font-black uppercase text-ink/70">{label}: </span>
      {value}
    </p>
  );
}

function ExperimentsSection({ experiments }: { experiments: GrowthExperiment[] }) {
  return (
    <section className="grid gap-4">
      <SectionTitle eyebrow="Registro" title="Experimentos" hint="Agrupados por estado. Sin experimentos reales no se muestran métricas ficticias." />
      {experiments.length ? (
        <>
          <div className="flex flex-wrap gap-2">
            {EXPERIMENT_STATUS_ORDER.map((status) => {
              const count = experiments.filter((experiment) => experiment.status === status).length;
              return (
                <span key={status} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-black text-ink">
                  {EXPERIMENT_STATUS_LABEL[status]} <span className="text-muted">{count}</span>
                </span>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...experiments]
              .sort((a, b) => EXPERIMENT_STATUS_ORDER.indexOf(a.status) - EXPERIMENT_STATUS_ORDER.indexOf(b.status))
              .map((experiment) => (
                <ExperimentCard key={experiment.id} experiment={experiment} />
              ))}
          </div>
        </>
      ) : (
        <EmptyState title="Sin experimentos registrados." text="Cuando se proponga un experimento aparecerá aquí con hipótesis, métrica, guardrails y responsable." />
      )}
    </section>
  );
}

function ExperimentCard({ experiment }: { experiment: GrowthExperiment }) {
  return (
    <article className="grid gap-3 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-black leading-tight text-ink">{experiment.title}</h3>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black uppercase text-brand-dark">{EXPERIMENT_STATUS_LABEL[experiment.status]}</span>
      </div>
      <p className="text-sm font-bold leading-6 text-muted">{experiment.hypothesis}</p>
      <div className="grid gap-1.5">
        <DataRow label="Segmento" value={experiment.segment} />
        <DataRow label="Métrica" value={experiment.primaryMetric} />
        {experiment.baseline ? <DataRow label="Baseline" value={experiment.baseline} /> : null}
        <DataRow label="Objetivo" value={experiment.target} />
        {experiment.guardrailMetrics.length ? <DataRow label="Guardrails" value={experiment.guardrailMetrics.join(", ")} /> : null}
        <DataRow label="Responsable" value={experiment.owner} />
        {experiment.result ? <DataRow label="Resultado" value={experiment.result} /> : null}
        {experiment.learning ? <DataRow label="Aprendizaje" value={experiment.learning} /> : null}
        {experiment.decision ? <DataRow label="Decisión" value={experiment.decision} /> : null}
      </div>
      {experiment.approvalRequired ? (
        <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amber-800">Requiere aprobación</span>
      ) : null}
    </article>
  );
}

function AiHandoffCard({ role, block }: { role: { title: string; scope: string[] }; block: string }) {
  return (
    <article className="grid gap-3 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-ink">{role.title}</h3>
      <ul className="grid gap-1">
        {role.scope.map((item) => (
          <li key={item} className="text-sm font-bold leading-5 text-muted">- {item}</li>
        ))}
      </ul>
      <CopyButton text={block} />
    </article>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary w-full justify-center text-sm"
      onClick={() => {
        try {
          void navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copiado" : "Copiar bloque"}
    </button>
  );
}

/* ---------- Pure helpers ---------- */

type ApprovalItem = { id: string; label: string; detail: string; source: string };

function collectApprovals(health: BusinessHealthResult, recommendations: ModelRecommendation[], experiments: GrowthExperiment[]): ApprovalItem[] {
  const items: ApprovalItem[] = [];
  health.alerts.filter((alert) => alert.approvalRequired).forEach((alert) => {
    items.push({ id: `alert-${alert.id}`, label: alert.label, detail: alert.suggestedAction, source: "Alerta" });
  });
  recommendations.filter((recommendation) => recommendation.authorityRequired === "benjamin_approval_required").forEach((recommendation) => {
    items.push({ id: `rec-${recommendation.id}`, label: recommendation.title, detail: recommendation.evidence, source: "Recomendación" });
  });
  experiments.filter((experiment) => experiment.approvalRequired && experiment.status !== "completed" && experiment.status !== "stopped").forEach((experiment) => {
    items.push({ id: `exp-${experiment.id}`, label: experiment.title, detail: experiment.hypothesis, source: "Experimento" });
  });
  return items;
}

function buildHandoffBlock(roleKey: GrowthExperiment["owner"], health: BusinessHealthResult, recommendations: ModelRecommendation[], experiments: GrowthExperiment[]) {
  const lines: string[] = [];
  lines.push(`# Handoff ${roleKey} - Salud del modelo OficiosPro`);
  lines.push(`Estado global: ${businessHealthStatusLabels[health.status]}${health.score === null ? "" : ` (score ${health.score}/100)`}`);
  if (health.priorities.length) {
    lines.push("");
    lines.push("## Prioridades del modelo");
    health.priorities.forEach((priority, index) => lines.push(`${index + 1}. ${priority}`));
  }
  const ownedExperiments = experiments.filter((experiment) => experiment.owner === roleKey);
  if (ownedExperiments.length) {
    lines.push("");
    lines.push("## Experimentos asignados");
    ownedExperiments.forEach((experiment) => lines.push(`- [${experiment.status}] ${experiment.title} - métrica: ${experiment.primaryMetric}`));
  }
  if (roleKey === "ChatGPT" || roleKey === "Codex") {
    const relevant = recommendations.filter((recommendation) => (roleKey === "ChatGPT" ? true : recommendation.authorityRequired === "ai_can_prepare"));
    if (relevant.length) {
      lines.push("");
      lines.push("## Recomendaciones");
      relevant.forEach((recommendation) => lines.push(`- ${recommendation.title} -> ${recommendation.experiment}`));
    }
  }
  lines.push("");
  lines.push("(Bloque generado desde los datos actuales del panel. No reemplaza el reporte semanal ni inventa tareas nuevas.)");
  return lines.join("\n");
}

function sourceLabelEs(source: string) {
  const map: Record<string, string> = {
    conversion_events: "Eventos de conversión (tráfico, UTM, embudo)",
    specialist_applications: "Postulaciones de especialistas (registro)",
    crm_opportunities: "Oportunidades CRM",
    crm_tasks: "Tareas CRM",
    crm_overview: "Resumen CRM / D1",
    crm: "CRM / D1",
  };
  return map[source] ?? source;
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

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "-";
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

function adminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "unauthorized") return "Token admin no autorizado.";
  if (message === "database_not_configured") return "Falta configurar D1 DB.";
  if (message === "crm_tables_not_ready") return "Faltan migraciones CRM.";
  return `No pudimos cargar salud del modelo: ${message}`;
}
