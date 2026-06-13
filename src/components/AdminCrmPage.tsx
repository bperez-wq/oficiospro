"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { formatCLP } from "@/data/marketplace";

type CrmView = "overview" | "opportunities" | "tasks" | "contacts" | "companies" | "pipeline" | "activity";
type CrmRow = Record<string, unknown>;

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
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<CrmRow | null>(null);
  const [detailTasks, setDetailTasks] = useState<CrmRow[]>([]);
  const [detailNotes, setDetailNotes] = useState<CrmRow[]>([]);
  const [filters, setFilters] = useState({ pipeline: "", stage: "", status: "", type: "", search: "", assignedTo: "" });
  const [newOpportunity, setNewOpportunity] = useState({ title: "", type: "customer_request", pipeline: "clientes", stage: "nuevo", priority: "media" });
  const [newTask, setNewTask] = useState({ title: "", taskType: "followup", priority: "media", assignedTo: "", dueAt: "" });
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const stored = window.sessionStorage.getItem(tokenStorageKey) ?? "";
    setToken(stored);
    setTokenDraft(stored);
    if (stored) void loadView(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const activeRows = activeRowsForView(view, { opportunities, tasks, contacts, companies, activity });
  const selected = activeRows.find((row) => String(row.id ?? "") === selectedId) ?? activeRows[0] ?? null;
  const pipelineGroups = useMemo(() => groupByPipeline(opportunities), [opportunities]);

  async function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenDraft.trim();
    window.sessionStorage.setItem(tokenStorageKey, next);
    setToken(next);
    setNotice(next ? "Token guardado para esta sesion. Cargando CRM..." : "Ingresa un token admin valido.");
    if (next) await loadView(next);
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
        const data = await adminFetch(activeToken, "/api/admin/crm/contacts?limit=100");
        setContacts(arrayFrom(data.contacts));
        setNotice("Contactos cargados desde D1.");
      } else if (view === "companies") {
        const data = await adminFetch(activeToken, "/api/admin/crm/companies?limit=100");
        setCompanies(arrayFrom(data.companies));
        setNotice("Empresas cargadas desde D1.");
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
        <OverviewView overview={overview} loading={loading} onRefresh={() => loadView()} onSync={sync} />
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
      {view === "contacts" ? <RowsView title="Contactos" rows={contacts} columns={["id", "name", "email", "phone", "contactType", "source", "commune", "region", "status"]} onRefresh={() => loadView()} onExport={exportCurrentCsv} /> : null}
      {view === "companies" ? <RowsView title="Empresas" rows={companies} columns={["id", "companyName", "rut", "industry", "contactName", "email", "phone", "commune", "region", "status"]} onRefresh={() => loadView()} onExport={exportCurrentCsv} /> : null}
      {view === "pipeline" ? <PipelineView groups={pipelineGroups} onDetail={(id) => loadDetail(id)} /> : null}
      {view === "activity" ? <RowsView title="Historial de actividad" rows={activity} columns={["id", "entityType", "entityId", "action", "actor", "metadataJson", "createdAt"]} onRefresh={() => loadView()} onExport={exportCurrentCsv} /> : null}
    </main>
  );
}

function OverviewView({ overview, loading, onRefresh, onSync }: { overview: Overview | null; loading: boolean; onRefresh: () => void; onSync: (source: "sync-leads" | "sync-specialists" | "sync-virtual-quotes") => void }) {
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
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button className="btn-primary" type="button" onClick={() => onSync("sync-leads")}>Sincronizar leads</button>
          <button className="btn-primary" type="button" onClick={() => onSync("sync-specialists")}>Sincronizar especialistas</button>
          <button className="btn-primary" type="button" onClick={() => onSync("sync-virtual-quotes")}>Sincronizar cotizaciones</button>
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

function RowsView({ title, rows, columns, onRefresh, onExport, onRowClick, action }: { title: string; rows: CrmRow[]; columns: string[]; onRefresh?: () => void; onExport?: () => void; onRowClick?: (row: CrmRow) => void; action?: (row: CrmRow) => ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {onRefresh ? <button className="btn-secondary" type="button" onClick={onRefresh}>Actualizar</button> : null}
          {onExport ? <button className="btn-secondary" type="button" disabled={!rows.length} onClick={onExport}>Exportar CSV</button> : null}
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.length ? rows.map((row, index) => (
          <article key={String(row.id ?? index)} className="rounded-2xl border border-line bg-slate-50 p-4 text-left transition hover:border-brand hover:bg-brand-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <strong className="block text-ink">{String(row.title ?? row.name ?? row.companyName ?? row.action ?? row.id ?? "Registro")}</strong>
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
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || !data.ok) throw new Error(String(data.error ?? `http_${response.status}`));
  return data;
}

function activeRowsForView(view: CrmView, data: { opportunities: CrmRow[]; tasks: CrmRow[]; contacts: CrmRow[]; companies: CrmRow[]; activity: CrmRow[] }) {
  if (view === "tasks") return data.tasks;
  if (view === "contacts") return data.contacts;
  if (view === "companies") return data.companies;
  if (view === "activity") return data.activity;
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
