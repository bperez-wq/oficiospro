"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { formatCLP } from "@/data/marketplace";
import { isInstitutionalAcquisitionSource, sourceLabel } from "@/data/specialistAcquisition";
import { getTradeCategoryById, getTradeCoverageLabel, tradeCategories, tradeSegmentForCategory, tradeSegmentLabels } from "@/data/tradeTaxonomy";
import { adminRequestHeaders, adminSessionToken, hasAdminBrowserSession, initialAdminToken, persistAdminToken } from "@/lib/adminAuth";

type CrmView = "overview" | "opportunities" | "tasks" | "contacts" | "companies" | "pipeline" | "activity" | "acquisition";
type CrmRow = Record<string, unknown>;
type AcquisitionFilters = {
  source: string;
  trade: string;
  commune: string;
  referral: string;
  founderStatus: string;
  institution: string;
  tradeSegment: string;
  coverageStatus: string;
};

type Overview = {
  newLeads: number;
  pendingSpecialists: number;
  pendingVirtualQuotes: number;
  overdueTasks: number;
  newCompanies: number;
  paymentIssues: number;
  openOpportunities: number;
  opportunitiesByPipeline: CrmRow[];
  savedViews: CrmRow[];
};

const tokenStorageKey = "oficiospro.adminCrmToken";
const crmNav: { href: string; label: string; view: CrmView }[] = [
  { href: "/admin/crm", label: "Dashboard", view: "overview" },
  { href: "/admin/crm/opportunities", label: "Oportunidades", view: "opportunities" },
  { href: "/admin/crm/tasks", label: "Tareas", view: "tasks" },
  { href: "/admin/crm/contacts", label: "Contactos", view: "contacts" },
  { href: "/admin/crm/companies", label: "Empresas", view: "companies" },
  { href: "/admin/crm/pipeline", label: "Pipeline", view: "pipeline" },
  { href: "/admin/crm/acquisition", label: "Captacion especialistas", view: "acquisition" },
  { href: "/admin/crm/activity", label: "Actividad", view: "activity" },
];

export function AdminCrmPage({ view = "overview" }: { view?: CrmView }) {
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("Ingresa ADMIN_TOKEN para cargar datos reales del CRM.");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [opportunities, setOpportunities] = useState<CrmRow[]>([]);
  const [tasks, setTasks] = useState<CrmRow[]>([]);
  const [contacts, setContacts] = useState<CrmRow[]>([]);
  const [companies, setCompanies] = useState<CrmRow[]>([]);
  const [activity, setActivity] = useState<CrmRow[]>([]);
  const [specialistApplications, setSpecialistApplications] = useState<CrmRow[]>([]);
  const [conversionEvents, setConversionEvents] = useState<CrmRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<CrmRow | null>(null);
  const [detailTasks, setDetailTasks] = useState<CrmRow[]>([]);
  const [detailNotes, setDetailNotes] = useState<CrmRow[]>([]);
  const [filters, setFilters] = useState({ pipeline: "", stage: "", status: "", type: "", search: "", assignedTo: "" });
  const [acquisitionFilters, setAcquisitionFilters] = useState({ source: "", trade: "", commune: "", referral: "", founderStatus: "", institution: "", tradeSegment: "", coverageStatus: "" });
  const [newOpportunity, setNewOpportunity] = useState({ title: "", type: "customer_request", pipeline: "clientes", stage: "nuevo", priority: "media" });
  const [newTask, setNewTask] = useState({ title: "", taskType: "followup", priority: "media", assignedTo: "", dueAt: "" });
  const [newNote, setNewNote] = useState("");
  const [showTestData, setShowTestData] = useState(false);

  useEffect(() => {
    const initial = initialAdminToken(tokenStorageKey);
    setToken(initial);
    setTokenDraft(initial === adminSessionToken ? "" : initial);
    if (initial) void loadView(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const activeRows = activeRowsForView(view, { opportunities, tasks, contacts, companies, activity, specialistApplications });
  const selected = activeRows.find((row) => String(row.id ?? "") === selectedId) ?? activeRows[0] ?? null;
  const pipelineGroups = useMemo(() => groupByPipeline(opportunities), [opportunities]);

  async function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenDraft.trim();
    persistAdminToken(tokenStorageKey, next);
    const active = next || (hasAdminBrowserSession() ? adminSessionToken : "");
    setToken(active);
    setNotice(active ? "Acceso admin activo. Cargando CRM..." : "Ingresa un token admin valido o inicia sesion como administrador.");
    if (active) await loadView(active);
  }

  async function loadView(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    try {
      if (view === "overview") {
        const data = await adminFetch(activeToken, "/api/admin/crm/overview");
        setOverview((data.overview as Overview) ?? null);
        await Promise.all([loadOpportunities(activeToken), loadTasks(activeToken)]);
        setNotice("Dashboard CRM cargado desde D1.");
      } else if (view === "opportunities" || view === "pipeline") {
        await loadOpportunities(activeToken);
      } else if (view === "tasks") {
        await loadTasks(activeToken);
      } else if (view === "contacts") {
        await loadContacts(activeToken);
      } else if (view === "companies") {
        const data = await adminFetch(activeToken, "/api/admin/crm/companies?limit=100");
        setCompanies(arrayFrom(data.companies));
        setNotice("Empresas cargadas desde D1.");
      } else if (view === "acquisition") {
        await loadAcquisition(activeToken);
      } else if (view === "activity") {
        const data = await adminFetch(activeToken, "/api/admin/crm/activity?limit=100");
        setActivity(arrayFrom(data.activity));
        setNotice("Actividad cargada desde D1.");
      }
    } catch (error) {
      setNotice(adminErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadOpportunities(activeToken = token) {
    const params = new URLSearchParams({ limit: "100" });
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    const data = await adminFetch(activeToken, `/api/admin/crm/opportunities?${params.toString()}`);
    const next = arrayFrom(data.opportunities);
    setOpportunities(next);
    setSelectedId((current) => (next.some((row) => row.id === current) ? current : String(next[0]?.id ?? "")));
    setNotice(next.length ? `${next.length} oportunidades cargadas.` : "Sin oportunidades reales para estos filtros.");
  }

  async function loadTasks(activeToken = token) {
    const data = await adminFetch(activeToken, "/api/admin/crm/tasks?limit=100");
    setTasks(arrayFrom(data.tasks));
    setNotice("Tareas cargadas desde D1.");
  }

  async function loadAcquisition(activeToken = token) {
    const [specialistsData, opportunitiesData, tasksData, eventsData] = await Promise.all([
      adminFetch(activeToken, "/api/admin/specialists?limit=100"),
      adminFetch(activeToken, "/api/admin/crm/opportunities?pipeline=especialistas&limit=100"),
      adminFetch(activeToken, "/api/admin/crm/tasks?limit=100"),
      adminFetch(activeToken, "/api/admin/conversion-events?limit=300"),
    ]);
    setSpecialistApplications(arrayFrom(specialistsData.specialists));
    setOpportunities(arrayFrom(opportunitiesData.opportunities));
    setTasks(arrayFrom(tasksData.tasks));
    setConversionEvents(arrayFrom(eventsData.conversionEvents));
    setNotice("Captacion de especialistas y eventos de conversion cargados desde D1.");
  }

  async function loadContacts(activeToken = token, includeTestData = showTestData) {
    const params = new URLSearchParams({ limit: "100" });
    if (includeTestData) params.set("showTestData", "true");
    const data = await adminFetch(activeToken, `/api/admin/crm/contacts?${params.toString()}`);
    setContacts(arrayFrom(data.contacts));
    setNotice(includeTestData ? "Contactos cargados incluyendo datos de prueba." : "Contactos reales cargados desde D1. Los datos de prueba estan ocultos.");
  }

  async function sync(source: "sync-leads" | "sync-specialists" | "sync-virtual-quotes") {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminFetch(token, `/api/admin/crm/${source}`, { method: "POST" });
      setNotice(`Sincronizacion lista: ${JSON.stringify(data.synced ?? {})}`);
      await loadView(token);
    } catch (error) {
      setNotice(adminErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function cleanupTestData() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminFetch(token, "/api/admin/crm/cleanup-test-data", { method: "POST", body: { source: "e2e_test", isTest: true } });
      setNotice(`Limpieza lista: ${String(data.total ?? 0)} registros de prueba removidos.`);
      await loadView(token);
    } catch (error) {
      setNotice(adminErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function toggleShowTestData(next: boolean) {
    setShowTestData(next);
    if (view === "contacts" && token) void loadContacts(token, next);
  }

  async function createOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !newOpportunity.title.trim()) return;
    try {
      await adminFetch(token, "/api/admin/crm/opportunities", { method: "POST", body: newOpportunity });
      setNewOpportunity({ title: "", type: "customer_request", pipeline: "clientes", stage: "nuevo", priority: "media" });
      await loadOpportunities(token);
      setNotice("Oportunidad creada.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  async function updateOpportunity(id: string, patch: Record<string, unknown>) {
    if (!token) return;
    try {
      await adminFetch(token, `/api/admin/crm/opportunities/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
      await loadOpportunities(token);
      if (detail?.id === id) await loadDetail(id);
      setNotice("Oportunidad actualizada.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  async function loadDetail(id: string) {
    if (!token || !id) return;
    try {
      const data = await adminFetch(token, `/api/admin/crm/opportunities/${encodeURIComponent(id)}`);
      setDetail((data.opportunity as CrmRow) ?? null);
      setDetailTasks(arrayFrom(data.tasks));
      setDetailNotes(arrayFrom(data.notes));
      setSelectedId(id);
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !newTask.title.trim()) return;
    const opportunityId = String((detail ?? selected)?.id ?? "");
    try {
      await adminFetch(token, "/api/admin/crm/tasks", { method: "POST", body: { ...newTask, opportunityId } });
      setNewTask({ title: "", taskType: "followup", priority: "media", assignedTo: "", dueAt: "" });
      if (opportunityId) await loadDetail(opportunityId);
      await loadTasks(token);
      setNotice("Tarea creada.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  async function completeTask(id: string) {
    if (!token) return;
    try {
      await adminFetch(token, `/api/admin/crm/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: { status: "done" } });
      await loadTasks(token);
      if (detail?.id) await loadDetail(String(detail.id));
      setNotice("Tarea marcada como completada.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entityId = String((detail ?? selected)?.id ?? "");
    if (!token || !entityId || !newNote.trim()) return;
    try {
      await adminFetch(token, "/api/admin/crm/notes", { method: "POST", body: { entityType: "opportunity", entityId, body: newNote } });
      setNewNote("");
      await loadDetail(entityId);
      setNotice("Nota interna creada.");
    } catch (error) {
      setNotice(adminErrorMessage(error));
    }
  }

  function exportCurrentCsv() {
    exportCsv(`crm-${view}-${new Date().toISOString().slice(0, 10)}.csv`, activeRows);
  }

  return (
    <main className="section grid gap-6">
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Panel interno OficiosPro</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">CRM operacional</h1>
            <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">
              Gestiona contactos, oportunidades, tareas, notas, actividad y sincronizacion operacional desde D1.
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
          {crmNav.map((item) => (
            <Link key={item.href} className={`rounded-2xl border px-4 py-2 text-sm font-black transition hover:border-brand hover:bg-brand-soft ${item.view === view ? "border-brand bg-brand-soft text-brand-dark" : "border-line text-muted"}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-brand/15 bg-brand-soft p-4 text-sm font-black leading-6 text-brand-dark">
        {notice}
      </section>

      {view === "overview" ? (
        <OverviewView overview={overview} loading={loading} onRefresh={() => loadView()} onSync={sync} onCleanup={cleanupTestData} />
      ) : null}

      {view === "opportunities" ? (
        <OpportunitiesView
          rows={opportunities}
          selected={selected}
          detail={detail}
          tasks={detailTasks}
          notes={detailNotes}
          filters={filters}
          newOpportunity={newOpportunity}
          newTask={newTask}
          newNote={newNote}
          loading={loading}
          setFilters={setFilters}
          setNewOpportunity={setNewOpportunity}
          setNewTask={setNewTask}
          setNewNote={setNewNote}
          onFilter={() => loadOpportunities()}
          onCreate={createOpportunity}
          onDetail={(id) => loadDetail(id)}
          onUpdate={updateOpportunity}
          onCreateTask={createTask}
          onCompleteTask={completeTask}
          onCreateNote={createNote}
          onExport={exportCurrentCsv}
        />
      ) : null}

      {view === "tasks" ? <RowsView title="Tareas internas" rows={tasks} columns={["id", "title", "taskType", "status", "priority", "assignedTo", "dueAt", "completedAt", "opportunityId"]} onRefresh={() => loadTasks()} onExport={exportCurrentCsv} action={(row) => String(row.status) !== "done" ? <button className="btn-secondary" type="button" onClick={() => completeTask(String(row.id))}>Completar</button> : null} /> : null}
      {view === "contacts" ? (
        <RowsView
          title="Contactos"
          rows={contacts}
          columns={["id", "name", "email", "phone", "contactType", "source", "commune", "region", "status", "isTest"]}
          onRefresh={() => loadContacts()}
          onExport={exportCurrentCsv}
          extraActions={
            <label className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2 text-sm font-black text-muted">
              <input type="checkbox" checked={showTestData} onChange={(event) => toggleShowTestData(event.target.checked)} />
              Mostrar datos de prueba
            </label>
          }
        />
      ) : null}
      {view === "companies" ? <RowsView title="Empresas" rows={companies} columns={["id", "companyName", "rut", "industry", "contactName", "email", "phone", "commune", "region", "status"]} onRefresh={() => loadView()} onExport={exportCurrentCsv} /> : null}
      {view === "pipeline" ? <PipelineView groups={pipelineGroups} onDetail={(id) => loadDetail(id)} /> : null}
      {view === "acquisition" ? (
        <AcquisitionView
          rows={specialistApplications}
          opportunities={opportunities}
          tasks={tasks}
          events={conversionEvents}
          filters={acquisitionFilters}
          setFilters={setAcquisitionFilters}
          loading={loading}
          onRefresh={() => loadAcquisition()}
          onSync={() => sync("sync-specialists")}
        />
      ) : null}
      {view === "activity" ? <RowsView title="Historial de actividad" rows={activity} columns={["id", "entityType", "entityId", "action", "actor", "metadataJson", "createdAt"]} onRefresh={() => loadView()} onExport={exportCurrentCsv} /> : null}
    </main>
  );
}

function OverviewView({
  overview,
  loading,
  onRefresh,
  onSync,
  onCleanup,
}: {
  overview: Overview | null;
  loading: boolean;
  onRefresh: () => void;
  onSync: (source: "sync-leads" | "sync-specialists" | "sync-virtual-quotes") => void;
  onCleanup: () => void;
}) {
  const metrics = [
    { label: "Leads nuevos", value: overview?.newLeads ?? 0, detail: "Pipeline clientes", tone: "brand" as const },
    { label: "Especialistas pendientes", value: overview?.pendingSpecialists ?? 0, detail: "Onboarding" },
    { label: "Cotizaciones pendientes", value: overview?.pendingVirtualQuotes ?? 0, detail: "Diagnostico virtual" },
    { label: "Tareas vencidas", value: overview?.overdueTasks ?? 0, detail: "Requieren accion", tone: overview?.overdueTasks ? ("brand" as const) : ("light" as const) },
    { label: "Empresas nuevas", value: overview?.newCompanies ?? 0, detail: "B2B" },
    { label: "Pagos con problema", value: overview?.paymentIssues ?? 0, detail: "Conciliacion" },
    { label: "Oportunidades abiertas", value: overview?.openOpportunities ?? 0, detail: "Total CRM", tone: "brand" as const },
  ];
  return (
    <section className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        {metrics.map((metric) => <DashboardMetricCard key={metric.label} label={metric.label} value={String(metric.value)} detail={metric.detail} tone={metric.tone} />)}
      </div>
      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Sincronizacion manual</p>
            <h2 className="text-2xl font-black text-ink">Traer datos reales al CRM</h2>
          </div>
          <button className="btn-secondary" type="button" disabled={loading} onClick={onRefresh}>{loading ? "Cargando..." : "Actualizar"}</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <button className="btn-primary" type="button" onClick={() => onSync("sync-leads")}>Sincronizar leads</button>
          <button className="btn-primary" type="button" onClick={() => onSync("sync-specialists")}>Sincronizar especialistas</button>
          <button className="btn-primary" type="button" onClick={() => onSync("sync-virtual-quotes")}>Sincronizar cotizaciones</button>
          <button className="btn-secondary" type="button" disabled={loading} onClick={onCleanup}>Limpiar datos de prueba</button>
        </div>
      </section>
      <RowsView title="Oportunidades por pipeline" rows={overview?.opportunitiesByPipeline ?? []} columns={["pipeline", "count"]} />
    </section>
  );
}

function OpportunitiesView(props: {
  rows: CrmRow[];
  selected: CrmRow | null;
  detail: CrmRow | null;
  tasks: CrmRow[];
  notes: CrmRow[];
  filters: { pipeline: string; stage: string; status: string; type: string; search: string; assignedTo: string };
  newOpportunity: { title: string; type: string; pipeline: string; stage: string; priority: string };
  newTask: { title: string; taskType: string; priority: string; assignedTo: string; dueAt: string };
  newNote: string;
  loading: boolean;
  setFilters: (filters: { pipeline: string; stage: string; status: string; type: string; search: string; assignedTo: string }) => void;
  setNewOpportunity: (value: { title: string; type: string; pipeline: string; stage: string; priority: string }) => void;
  setNewTask: (value: { title: string; taskType: string; priority: string; assignedTo: string; dueAt: string }) => void;
  setNewNote: (value: string) => void;
  onFilter: () => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onDetail: (id: string) => void;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onCreateTask: (event: FormEvent<HTMLFormElement>) => void;
  onCompleteTask: (id: string) => void;
  onCreateNote: (event: FormEvent<HTMLFormElement>) => void;
  onExport: () => void;
}) {
  const selected = props.detail ?? props.selected;
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-5">
        <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-3 lg:grid-cols-6 lg:items-end">
            {(["search", "pipeline", "stage", "status", "type", "assignedTo"] as const).map((field) => (
              <label key={field} className="field">
                {field}
                <input value={props.filters[field]} onChange={(event) => props.setFilters({ ...props.filters, [field]: event.target.value })} />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" type="button" disabled={props.loading} onClick={props.onFilter}>Filtrar</button>
            <button className="btn-secondary" type="button" disabled={!props.rows.length} onClick={props.onExport}>Exportar CSV</button>
          </div>
        </section>
        <form className="rounded-[28px] border border-line bg-white p-5 shadow-soft" onSubmit={props.onCreate}>
          <p className="eyebrow">Nueva oportunidad</p>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <label className="field md:col-span-2">Titulo<input value={props.newOpportunity.title} onChange={(event) => props.setNewOpportunity({ ...props.newOpportunity, title: event.target.value })} /></label>
            <label className="field">Tipo<input value={props.newOpportunity.type} onChange={(event) => props.setNewOpportunity({ ...props.newOpportunity, type: event.target.value })} /></label>
            <label className="field">Pipeline<input value={props.newOpportunity.pipeline} onChange={(event) => props.setNewOpportunity({ ...props.newOpportunity, pipeline: event.target.value })} /></label>
            <label className="field">Stage<input value={props.newOpportunity.stage} onChange={(event) => props.setNewOpportunity({ ...props.newOpportunity, stage: event.target.value })} /></label>
          </div>
          <button className="btn-primary mt-4" type="submit">Crear oportunidad</button>
        </form>
        <RowsView title="Oportunidades" rows={props.rows} columns={["id", "title", "type", "pipeline", "stage", "priority", "assignedTo", "nextActionAt", "status", "estimatedCredits", "estimatedAmountCLP"]} onRowClick={(row) => props.onDetail(String(row.id))} />
      </div>
      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <p className="eyebrow">Detalle oportunidad</p>
        {selected ? (
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-ink">{String(selected.title ?? selected.id)}</h2>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={() => props.onUpdate(String(selected.id), { stage: "contactado" })}>Contactado</button>
              <button className="btn-secondary" type="button" onClick={() => props.onUpdate(String(selected.id), { priority: "alta" })}>Prioridad alta</button>
              <button className="btn-secondary" type="button" onClick={() => props.onUpdate(String(selected.id), { status: "closed", reason: "Cierre manual CRM" })}>Cerrar</button>
            </div>
            <RowsView title="Campos" rows={[selected]} columns={["id", "type", "pipeline", "stage", "priority", "assignedTo", "nextActionAt", "status", "sourceEntityType", "sourceEntityId"]} />
            <form className="rounded-2xl border border-line bg-slate-50 p-4" onSubmit={props.onCreateTask}>
              <p className="font-black text-ink">Crear tarea</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input className="rounded-2xl border border-line px-3 py-2 font-bold" value={props.newTask.title} onChange={(event) => props.setNewTask({ ...props.newTask, title: event.target.value })} placeholder="Titulo tarea" />
                <input className="rounded-2xl border border-line px-3 py-2 font-bold" type="datetime-local" value={props.newTask.dueAt} onChange={(event) => props.setNewTask({ ...props.newTask, dueAt: event.target.value })} />
              </div>
              <button className="btn-primary mt-3" type="submit">Crear tarea</button>
            </form>
            <RowsView title="Tareas" rows={props.tasks} columns={["id", "title", "taskType", "status", "priority", "dueAt"]} action={(row) => String(row.status) !== "done" ? <button className="btn-secondary" type="button" onClick={() => props.onCompleteTask(String(row.id))}>Completar</button> : null} />
            <form className="rounded-2xl border border-line bg-slate-50 p-4" onSubmit={props.onCreateNote}>
              <p className="font-black text-ink">Nota interna</p>
              <textarea className="mt-3 min-h-24 rounded-2xl border border-line px-3 py-2 font-bold" value={props.newNote} onChange={(event) => props.setNewNote(event.target.value)} />
              <button className="btn-primary mt-3" type="submit">Agregar nota</button>
            </form>
            <RowsView title="Notas" rows={props.notes} columns={["createdAt", "author", "body"]} />
          </div>
        ) : (
          <EmptyState title="Sin oportunidad seleccionada." text="Selecciona una oportunidad para ver tareas, notas y acciones rapidas." />
        )}
      </section>
    </section>
  );
}

function PipelineView({ groups, onDetail }: { groups: Record<string, Record<string, CrmRow[]>>; onDetail: (id: string) => void }) {
  const pipelines = Object.entries(groups);
  return (
    <section className="grid gap-6">
      {pipelines.length ? pipelines.map(([pipeline, stages]) => (
        <section key={pipeline} className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
          <h2 className="text-2xl font-black capitalize text-ink">{pipeline.replace(/_/g, " ")}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {Object.entries(stages).map(([stage, rows]) => (
              <div key={stage} className="rounded-2xl border border-line bg-slate-50 p-3">
                <strong className="block text-sm text-ink">{stage}</strong>
                <div className="mt-3 grid gap-2">
                  {rows.map((row) => (
                    <button key={String(row.id)} className="rounded-xl bg-white p-3 text-left text-sm font-bold shadow-sm hover:text-brand-dark" type="button" onClick={() => onDetail(String(row.id))}>
                      {String(row.title ?? row.id)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )) : <EmptyState title="Pipeline sin oportunidades." text="Sincroniza leads, especialistas o cotizaciones para poblar el CRM." />}
    </section>
  );
}

function AcquisitionView({
  rows,
  opportunities,
  tasks,
  events,
  filters,
  setFilters,
  loading,
  onRefresh,
  onSync,
}: {
  rows: CrmRow[];
  opportunities: CrmRow[];
  tasks: CrmRow[];
  events: CrmRow[];
  filters: AcquisitionFilters;
  setFilters: (filters: AcquisitionFilters) => void;
  loading: boolean;
  onRefresh: () => void;
  onSync: () => void;
}) {
  const enrichedRows = rows.map(enrichAcquisitionRow);
  const enrichedEvents = events.map(enrichConversionEvent);
  const filteredRows = enrichedRows.filter((row) => acquisitionRowMatches(row, filters));
  const kpis = [...acquisitionGrowthKpis(enrichedEvents), ...acquisitionKpis(filteredRows, opportunities, tasks)];
  const recentEvents = enrichedEvents.slice(0, 20);
  const topPages = groupCountRows(enrichedEvents.filter((event) => event.isPageView), "path");
  const topCampaigns = groupCountRows(enrichedEvents.filter((event) => event.campaign), "campaign");
  const abandonmentRows = groupCountRows(enrichedEvents.filter((event) => event.eventName === "specialist_application_abandoned"), "maxStepName");
  const assistantEvents = enrichedEvents.filter((event) => {
    const eventName = stringValue(event.eventName);
    return eventName.startsWith("specialist_assistant_") || eventName.startsWith("assistant_");
  });
  const assistantQuestions = assistantEvents.filter((event) => ["specialist_assistant_question_asked", "assistant_question_asked"].includes(stringValue(event.eventName)));
  const assistantEscalations = assistantEvents.filter((event) => ["specialist_assistant_escalated", "assistant_escalated"].includes(stringValue(event.eventName)));
  const assistantAnswers = assistantEvents.filter((event) => ["specialist_assistant_answer_served", "assistant_intent_detected"].includes(stringValue(event.eventName)));
  const assistantTopics = groupCountRows(
    assistantEvents.map((event) => ({ ...event, assistantIntent: event.answerIntent || event.intentGuess || event.reason || "Sin intent" })),
    "assistantIntent",
  );
  const assistantEscalationReasons = groupCountRows(assistantEscalations, "reason");
  const assistantUnansweredRows = assistantEscalations.filter((event) => ["unknown", "low_confidence", "out_of_scope", "tax_legal", "question_limit", "sensitive"].includes(stringValue(event.reason)));
  const exportRows = filteredRows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    acquisitionSource: row.acquisitionSource,
    sourceDetail: row.sourceDetail,
    campaign: row.campaign,
    trade: row.trade,
    tradeSegment: row.tradeSegmentLabel,
    coverageStatus: row.coverageStatus,
    coverageLabel: row.coverageLabel,
    commune: row.commune,
    referralCode: row.referralCode,
    referrerSpecialistId: row.referrerSpecialistId,
    founderStatus: row.founderStatus,
    createdAt: row.createdAt,
    slaStatus: row.slaStatus,
  }));

  return (
    <section className="grid gap-6">
      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Captacion especialistas</p>
            <h2 className="text-2xl font-black text-ink">Embudo organico de especialistas fundadores</h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-muted">
              Usa datos reales de postulaciones D1. No se crean ni muestran registros de relleno.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={() => setFilters({ ...filters, founderStatus: "revision" })}>Ver pendientes</button>
            <button className="btn-secondary" type="button" disabled={loading} onClick={onRefresh}>{loading ? "Cargando..." : "Actualizar"}</button>
            <button className="btn-primary" type="button" disabled={loading} onClick={onSync}>Sincronizar CRM</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {(["source", "trade", "commune", "referral", "founderStatus", "institution", "tradeSegment", "coverageStatus"] as const).map((field) => (
            <label key={field} className="field">
              {filterLabel(field)}
              <input value={filters[field]} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })} />
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((metric) => (
          <DashboardMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <AcquisitionEventFunnel events={enrichedEvents} />
        <AcquisitionFunnel rows={filteredRows} />
        <SourceBreakdown rows={groupCountRows(filteredRows, "acquisitionSource")} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <BarBreakdown title="Paginas mas vistas" rows={topPages} accent="bg-accent" />
        <BarBreakdown title="Campanas UTM" rows={topCampaigns} accent="bg-sun" />
        <BarBreakdown title="Abandono por paso" rows={abandonmentRows} accent="bg-brand" />
        <BarBreakdown title="Temas asistente especialistas" rows={assistantTopics} accent="bg-brand-dark" />
        <BarBreakdown title="Escalaciones asistente" rows={assistantEscalationReasons} accent="bg-accent" />
        <BarBreakdown title="Oficios con mas interes" rows={groupCountRows(filteredRows, "trade")} accent="bg-sun" />
        <BarBreakdown title="Comunas con mas interes" rows={groupCountRows(filteredRows, "commune")} accent="bg-brand" />
        <BarBreakdown title="Capas con mas postulantes" rows={groupCountRows(filteredRows, "tradeSegmentLabel")} accent="bg-ink" />
        <BarBreakdown title="Estado de cobertura" rows={groupCountRows(filteredRows, "coverageLabel")} accent="bg-brand-dark" />
      </div>

      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Asistente especialistas</p>
            <h3 className="text-xl font-black text-ink">Dudas frecuentes y escalaciones</h3>
            <p className="mt-1 text-xs font-bold text-muted">Solo usa eventos sanitizados; no guarda RUT, documentos ni datos privados.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard label="Preguntas" value={String(assistantQuestions.length)} detail="Consultas realizadas" />
          <DashboardMetricCard label="Respuestas" value={String(assistantAnswers.length)} detail="Respuestas servidas" />
          <DashboardMetricCard label="Escalaciones" value={String(assistantEscalations.length)} detail="Derivadas a correo" tone={assistantEscalations.length ? "brand" : "light"} />
          <DashboardMetricCard label="Sin respuesta" value={String(assistantUnansweredRows.length)} detail="Para mejorar base curada" />
        </div>
      </section>

      <RowsView
        title="Eventos recientes"
        rows={recentEvents}
        columns={["id", "eventName", "path", "source", "medium", "campaign", "utmSource", "utmMedium", "utmCampaign", "sourceButton", "createdAt"]}
      />

      <RowsView
        title="Preguntas escaladas del asistente"
        rows={assistantUnansweredRows}
        columns={["questionSanitized", "intentGuess", "reason", "path", "createdAt"]}
      />

      <RowsView
        title="Taxonomia operacional"
        rows={taxonomyRows()}
        columns={["id", "label", "segment", "clientVisibility", "registrationVisibility", "coverageStatus", "requiresCertification", "seoEnabled"]}
      />

      <RowsView
        title="Postulaciones captadas"
        rows={exportRows}
        columns={["id", "name", "email", "phone", "acquisitionSource", "sourceDetail", "campaign", "trade", "tradeSegment", "coverageLabel", "commune", "referralCode", "referrerSpecialistId", "founderStatus", "slaStatus", "createdAt"]}
        onRefresh={onRefresh}
        onExport={() => exportCsv(`crm-captacion-especialistas-${new Date().toISOString().slice(0, 10)}.csv`, exportRows)}
      />
    </section>
  );
}

function AcquisitionEventFunnel({ events }: { events: CrmRow[] }) {
  const stages = [
    { key: "home_view", label: "Home view" },
    { key: "click_offer_services", label: "Click ofrecer servicios" },
    { key: "founder_landing_view", label: "Landing fundadores" },
    { key: "founder_cta_click", label: "CTA landing" },
    { key: "specialist_application_started", label: "Registro iniciado" },
    { key: "specialist_application_submitted", label: "Postulacion enviada" },
  ];
  const count = (key: string) => events.filter((event) => event.eventName === key).length;
  const top = Math.max(1, count("home_view"), count("founder_landing_view"));
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <h3 className="text-lg font-black text-ink">Embudo de conversion real</h3>
      <p className="mt-1 text-xs font-bold text-muted">Eventos guardados en D1 desde Home, landing y registro.</p>
      {events.length ? (
        <div className="mt-4 grid gap-3">
          {stages.map((stage) => {
            const value = count(stage.key);
            const pct = Math.round((value / top) * 100);
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between text-sm font-black text-ink">
                  <span>{stage.label}</span>
                  <span className="text-muted">{value} / {pct}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aun no hay eventos registrados." text="Comparte links con UTM para medir adquisicion." />
      )}
    </section>
  );
}

function AcquisitionFunnel({ rows }: { rows: CrmRow[] }) {
  const stages = [
    { key: "postulante", label: "Postulacion iniciada" },
    { key: "revision", label: "En revision" },
    { key: "aprobado", label: "Aprobado" },
    { key: "publicado", label: "Publicado" },
  ];
  const count = (key: string) => rows.filter((row) => String(row.founderStatus).includes(key)).length;
  const total = Math.max(1, rows.length);
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <h3 className="text-lg font-black text-ink">Embudo fundador</h3>
      <p className="mt-1 text-xs font-bold text-muted">Datos reales de postulaciones filtradas en D1.</p>
      <div className="mt-4 grid gap-3">
        {stages.map((stage) => {
          const value = count(stage.key);
          const pct = Math.round((value / total) * 100);
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between text-sm font-black text-ink">
                <span>{stage.label}</span>
                <span className="text-muted">{value} · {pct}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SourceBreakdown({ rows }: { rows: { value: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <h3 className="text-lg font-black text-ink">Fuentes de captacion</h3>
      {rows.length ? (
        <div className="mt-4 grid gap-3">
          {rows.slice(0, 8).map((row) => (
            <div key={row.value}>
              <div className="flex items-center justify-between text-sm font-black text-ink">
                <span>{sourceLabel(row.value)}</span>
                <span className="text-muted">{row.count}</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand" style={{ width: `${Math.round((row.count / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm font-bold text-muted">Sin datos de fuentes todavia.</p>
      )}
    </section>
  );
}

function BarBreakdown({ title, rows, accent }: { title: string; rows: { value: string; count: number }[]; accent: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <h3 className="text-lg font-black text-ink">{title}</h3>
      {rows.length ? (
        <div className="mt-4 grid gap-2.5">
          {rows.slice(0, 6).map((row) => (
            <div key={row.value} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-bold text-ink">{row.value}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${accent}`} style={{ width: `${Math.round((row.count / max) * 100)}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-black text-muted">{row.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm font-bold text-muted">Sin datos todavia.</p>
      )}
    </section>
  );
}

function RowsView({
  title,
  rows,
  columns,
  onRefresh,
  onExport,
  onRowClick,
  action,
  extraActions,
}: {
  title: string;
  rows: CrmRow[];
  columns: string[];
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: (row: CrmRow) => void;
  action?: (row: CrmRow) => ReactNode;
  extraActions?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          {onRefresh ? <button className="btn-secondary" type="button" onClick={onRefresh}>Actualizar</button> : null}
          {onExport ? <button className="btn-secondary" type="button" disabled={!rows.length} onClick={onExport}>Exportar CSV</button> : null}
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.length ? rows.map((row, index) => (
          <article key={String(row.id ?? index)} className="rounded-2xl border border-line bg-slate-50 p-4 text-left transition hover:border-brand hover:bg-brand-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="block text-ink">{String(row.title ?? row.name ?? row.companyName ?? row.action ?? row.id ?? "Registro")}</strong>
                  {row.isTest ? <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black uppercase text-amber-700">Test</span> : null}
                </div>
                <span className="mt-1 block text-sm font-bold text-muted">{columns.slice(0, 4).map((column) => formatValue(row[column])).join(" / ")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {onRowClick ? <button className="btn-secondary" type="button" onClick={() => onRowClick(row)}>Ver detalle</button> : null}
                {action?.(row)}
              </div>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-black uppercase text-muted">Ver campos</summary>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {columns.map((column) => (
                  <div key={column} className="rounded-xl bg-white p-3">
                    <span className="text-[10px] font-black uppercase text-muted">{column}</span>
                    <strong className="mt-1 block break-words text-xs text-ink">{formatValue(row[column])}</strong>
                  </div>
                ))}
              </div>
            </details>
          </article>
        )) : <EmptyState title="Sin datos reales." text="Cuando existan registros en D1 para esta vista apareceran aqui." />}
      </div>
    </section>
  );
}

async function adminFetch(token: string, endpoint: string, options: { method?: string; body?: unknown } = {}) {
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: adminRequestHeaders(token, options.body ? { "Content-Type": "application/json" } : {}),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || !data.ok) throw new Error(String(data.error ?? `http_${response.status}`));
  return data;
}

function activeRowsForView(view: CrmView, data: { opportunities: CrmRow[]; tasks: CrmRow[]; contacts: CrmRow[]; companies: CrmRow[]; activity: CrmRow[]; specialistApplications: CrmRow[] }) {
  if (view === "tasks") return data.tasks;
  if (view === "contacts") return data.contacts;
  if (view === "companies") return data.companies;
  if (view === "activity") return data.activity;
  if (view === "acquisition") return data.specialistApplications;
  return data.opportunities;
}

function arrayFrom(value: unknown) {
  return Array.isArray(value) ? (value as CrmRow[]) : [];
}

function groupByPipeline(rows: CrmRow[]) {
  return rows.reduce<Record<string, Record<string, CrmRow[]>>>((acc, row) => {
    const pipeline = String(row.pipeline ?? "sin_pipeline");
    const stage = String(row.stage ?? "sin_stage");
    acc[pipeline] = acc[pipeline] ?? {};
    acc[pipeline][stage] = acc[pipeline][stage] ?? [];
    acc[pipeline][stage].push(row);
    return acc;
  }, {});
}

function enrichAcquisitionRow(row: CrmRow): CrmRow {
  const payload = parseJsonRecord(row.payloadJson ?? row.payload_json);
  const acquisition = recordValue(payload.acquisition);
  const founderProgram = recordValue(payload.founderProgram);
  const rawSource = stringValue(acquisition.source ?? payload.source ?? row.source) || "direct";
  const createdAt = stringValue(row.createdAt ?? row.created_at);
  const founderStatus = stringValue(founderProgram.status ?? payload.founderStatus ?? row.status ?? row.publicationStatus) || "fundador_postulante";
  const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || stringValue(payload.fullName ?? row.name) || "Especialista OficiosPro";
  const sourceDetail = stringValue(acquisition.sourceDetail ?? payload.sourceDetail);
  const referralCode = stringValue(acquisition.referralCode ?? payload.referralCode ?? row.referralCode);
  const referrerSpecialistId = stringValue(acquisition.referrerSpecialistId ?? payload.referrerSpecialistId);
  const acquisitionSource = sourceLabel(rawSource);
  const rawTrade = stringValue(acquisition.trade ?? payload.trade ?? payload.primaryTrade ?? row.serviceTypes) || "Sin oficio";
  const tradeId = stringValue(payload.primaryTradeId ?? payload.serviceTypeId ?? row.serviceTypeId);
  const taxonomyCategory = taxonomyCategoryFromValues(tradeId, rawTrade);
  const tradeSegment = stringValue(payload.tradeSegment) || (taxonomyCategory ? tradeSegmentForCategory(taxonomyCategory.id) : "");
  const coverageStatus = stringValue(payload.tradeCoverageStatus) || taxonomyCategory?.coverageStatus || "";
  const coverageLabel = stringValue(payload.tradeCoverageLabel) || (taxonomyCategory ? getTradeCoverageLabel(taxonomyCategory) : "Sin cobertura declarada");

  return {
    ...row,
    name,
    phone: row.whatsapp ?? row.phone,
    acquisitionSource,
    acquisitionSourceRaw: rawSource,
    sourceDetail,
    campaign: stringValue(acquisition.campaign ?? payload.campaign) || "founder_specialists",
    trade: rawTrade,
    tradeSegment,
    tradeSegmentLabel: tradeSegment ? tradeSegmentLabels[tradeSegment as keyof typeof tradeSegmentLabels] ?? tradeSegment : "Sin capa",
    coverageStatus,
    coverageLabel,
    commune: stringValue(acquisition.commune ?? payload.commune ?? payload.communeName ?? row.comuna) || "Sin comuna",
    referralCode,
    referrerSpecialistId,
    founderStatus,
    institution: isInstitutionalAcquisitionSource(rawSource) ? sourceDetail || acquisitionSource : "",
    slaStatus: isFounderSlaOverdue(createdAt, founderStatus) ? "SLA vencido" : "En plazo",
    createdAt,
  };
}

function acquisitionRowMatches(row: CrmRow, filters: AcquisitionFilters) {
  return (
    includesFilter(row.acquisitionSource, filters.source) &&
    includesFilter(row.trade, filters.trade) &&
    includesFilter(row.commune, filters.commune) &&
    includesFilter([row.referralCode, row.referrerSpecialistId].filter(Boolean).join(" "), filters.referral) &&
    includesFilter(row.founderStatus, filters.founderStatus) &&
    includesFilter(row.institution, filters.institution) &&
    includesFilter(row.tradeSegmentLabel, filters.tradeSegment) &&
    includesFilter([row.coverageStatus, row.coverageLabel].filter(Boolean).join(" "), filters.coverageStatus)
  );
}

function acquisitionKpis(rows: CrmRow[], opportunities: CrmRow[], tasks: CrmRow[]) {
  const founderStatus = (status: string) => rows.filter((row) => String(row.founderStatus).includes(status)).length;
  const referrals = rows.filter((row) => Boolean(row.referralCode || row.referrerSpecialistId)).length;
  const institutions = rows.filter((row) => Boolean(row.institution)).length;
  const slaOverdue = rows.filter((row) => row.slaStatus === "SLA vencido").length;
  const openSpecialistOpps = opportunities.filter((row) => String(row.pipeline) === "especialistas" && String(row.status) !== "closed").length;
  const pendingTasks = tasks.filter((row) => String(row.status) !== "done").length;

  return [
    { label: "Postulaciones", value: String(rows.length), detail: "Total filtrado", tone: "brand" as const },
    { label: "En revision", value: String(founderStatus("revision") + founderStatus("postulante")), detail: "Embudo fundador", tone: "light" as const },
    { label: "Aprobados", value: String(founderStatus("aprobado")), detail: "Listos para activar", tone: "light" as const },
    { label: "Publicados", value: String(founderStatus("publicado")), detail: "Badge visible", tone: "light" as const },
    { label: "Referidos", value: String(referrals), detail: "Con codigo o referente", tone: "light" as const },
    { label: "Instituciones", value: String(institutions), detail: "OMIL/SENCE/CFT/IP", tone: "light" as const },
    { label: "SLA pendiente", value: String(slaOverdue), detail: `${openSpecialistOpps} opps / ${pendingTasks} tareas`, tone: slaOverdue ? ("brand" as const) : ("light" as const) },
  ];
}

function acquisitionGrowthKpis(events: CrmRow[]) {
  const visits24h = events.filter((event) => isPageViewEvent(event) && isWithinHours(event.createdAt, 24)).length;
  const visits7d = events.filter((event) => isPageViewEvent(event) && isWithinHours(event.createdAt, 24 * 7)).length;
  const offerClicks = eventCount(events, "click_offer_services");
  const landingViews = eventCount(events, "founder_landing_view");
  const starts = eventCount(events, "specialist_application_started");
  const submits = eventCount(events, "specialist_application_submitted");

  return [
    { label: "Visitas 24h", value: String(visits24h), detail: "Page views medidos", tone: "light" as const },
    { label: "Visitas 7 dias", value: String(visits7d), detail: "Page views medidos", tone: "light" as const },
    { label: "Clicks ofrecer", value: String(offerClicks), detail: "CTA especialista", tone: "brand" as const },
    { label: "Landing fundador", value: String(landingViews), detail: "Visitas /especialistas-fundadores", tone: "light" as const },
    { label: "Inicios registro", value: String(starts), detail: `Landing a inicio ${formatPercent(starts, landingViews)}`, tone: "light" as const },
    { label: "Envios registro", value: String(submits), detail: `Inicio a envio ${formatPercent(submits, starts)}`, tone: submits ? ("brand" as const) : ("light" as const) },
  ];
}

function enrichConversionEvent(row: CrmRow): CrmRow {
  const payload = parseJsonRecord(row.payloadJson ?? row.payload_json);
  const eventName = stringValue(row.eventName ?? row.type ?? payload.eventName ?? payload.type);
  const source = stringValue(row.source ?? payload.source ?? payload.utmSource) || "direct";
  const path = stringValue(row.path ?? row.page ?? payload.path ?? payload.page) || "Sin pagina";
  const createdAt = stringValue(row.createdAt ?? row.created_at ?? payload.timestamp);
  const step = stringValue(payload.maxStepName ?? payload.stepName);

  return {
    ...row,
    eventName,
    path,
    source,
    medium: stringValue(payload.medium ?? payload.utmMedium),
    campaign: stringValue(payload.campaign ?? payload.utmCampaign),
    utmSource: stringValue(payload.utmSource),
    utmMedium: stringValue(payload.utmMedium),
    utmCampaign: stringValue(payload.utmCampaign),
    sourceButton: stringValue(payload.sourceButton),
    sourceComponent: stringValue(payload.sourceComponent),
    anonymousId: stringValue(payload.anonymousId),
    sessionId: stringValue(payload.sessionId),
    maxStepName: step || "Sin paso",
    questionSanitized: stringValue(payload.questionSanitized),
    intentGuess: stringValue(payload.intentGuess),
    answerIntent: stringValue(payload.intent),
    fallbackType: stringValue(payload.fallbackType),
    reason: stringValue(payload.reason),
    isPageView: isPageViewName(eventName),
    createdAt,
  };
}

function eventCount(events: CrmRow[], eventName: string) {
  return events.filter((event) => event.eventName === eventName).length;
}

function isPageViewEvent(event: CrmRow) {
  return event.isPageView === true || isPageViewName(stringValue(event.eventName));
}

function isPageViewName(eventName: string) {
  return ["page_view", "home_view", "founder_landing_view"].includes(eventName);
}

function isWithinHours(value: unknown, hours: number) {
  const created = Date.parse(stringValue(value));
  return Number.isFinite(created) && Date.now() - created <= hours * 60 * 60 * 1000;
}

function formatPercent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function groupCountRows(rows: CrmRow[], field: string) {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const value = stringValue(row[field]) || "Sin dato";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));
}

function taxonomyRows() {
  return tradeCategories.map((category) => ({
    id: category.id,
    label: category.label,
    segment: tradeSegmentLabels[category.segment],
    clientVisibility: category.clientVisibility,
    registrationVisibility: category.registrationVisibility,
    coverageStatus: category.coverageStatus,
    requiresCertification: category.requiresCertification ? "si" : "no",
    seoEnabled: category.seoEnabled ? "si" : "no",
  }));
}

function filterLabel(field: keyof AcquisitionFilters) {
  const labels = {
    source: "Fuente",
    trade: "Oficio",
    commune: "Comuna",
    referral: "Referido",
    founderStatus: "Estado fundador",
    institution: "Institucion",
    tradeSegment: "Capa",
    coverageStatus: "Cobertura",
  };
  return labels[field];
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    return recordValue(JSON.parse(value));
  } catch {
    return {};
  }
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function taxonomyCategoryFromValues(...values: string[]) {
  for (const value of values) {
    const direct = getTradeCategoryById(value);
    if (direct) return direct;
  }
  const normalizedValues = values.map(normalizeCrmToken).filter(Boolean);
  return tradeCategories.find((category) => {
    const tokens = [category.id, category.slug, category.label, category.shortLabel, ...category.relatedServices, ...category.relatedProblems].map(normalizeCrmToken);
    return normalizedValues.some((value) => tokens.some((token) => token === value || token.includes(value) || value.includes(token)));
  });
}

function normalizeCrmToken(value: unknown) {
  return stringValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesFilter(value: unknown, filter: string) {
  if (!filter.trim()) return true;
  return stringValue(value).toLowerCase().includes(filter.trim().toLowerCase());
}

function isFounderSlaOverdue(createdAt: string, status: string) {
  if (!createdAt || ["fundador_aprobado", "fundador_publicado", "approved", "rejected", "rechazado", "published"].includes(status)) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return Date.now() - created > 48 * 60 * 60 * 1000;
}

function exportCsv(filename: string, rows: CrmRow[]) {
  if (!rows.length) return;
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => `"${formatValue(row[header]).replace(/"/g, '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Sin dato";
  if (typeof value === "number" && String(value).length > 3) return value > 999 ? formatCLP(value) : String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function adminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "admin_token_not_configured") return "ADMIN_TOKEN no esta configurado en Cloudflare.";
  if (message === "database_not_configured") return "Falta configurar el binding DB de D1.";
  if (message === "crm_tables_not_ready") return "Falta aplicar la migracion 0005_crm_operations.sql en D1.";
  if (message === "unauthorized") return "Token admin incorrecto.";
  return `Error CRM: ${message}`;
}
