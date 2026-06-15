"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { adminRequestHeaders, adminSessionToken, hasAdminBrowserSession, initialAdminToken, persistAdminToken } from "@/lib/adminAuth";

type AdminRow = Record<string, unknown>;

type AdminAction = {
  label: string;
  path: (row: AdminRow) => string;
  body?: (row: AdminRow) => Record<string, unknown>;
  tone?: "primary" | "secondary" | "danger";
};

type Props = {
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  responseKey: string;
  columns: string[];
  actions?: AdminAction[];
  allowStatusFilter?: boolean;
};

const tokenStorageKey = "oficiospro.adminOpsToken";

export function AdminOperationalTablePage({ title, eyebrow, description, endpoint, responseKey, columns, actions = [], allowStatusFilter = true }: Props) {
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notice, setNotice] = useState("Ingresa ADMIN_TOKEN para consultar datos reales.");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = initialAdminToken(tokenStorageKey);
    setToken(initial);
    setTokenDraft(initial === adminSessionToken ? "" : initial);
    if (initial) void loadRows(initial, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = rows[selectedIndex] ?? rows[0] ?? null;
  const metrics = useMemo(
    () => [
      { label: "Registros", value: rows.length.toString(), detail: "Respuesta actual", tone: "brand" as const },
      { label: "Pendientes", value: rows.filter((row) => String(row.status ?? row.publicationStatus ?? "").includes("pending")).length.toString(), detail: "Requieren gestion" },
      { label: "Activos", value: rows.filter((row) => ["approved", "published", "active"].includes(String(row.status ?? row.publicationStatus ?? ""))).length.toString(), detail: "Operativos" },
    ],
    [rows],
  );

  function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = tokenDraft.trim();
    persistAdminToken(tokenStorageKey, next);
    const active = next || (hasAdminBrowserSession() ? adminSessionToken : "");
    setToken(active);
    setNotice(active ? "Acceso admin activo. Consultando..." : "Ingresa ADMIN_TOKEN o inicia sesion como administrador.");
    if (active) void loadRows(active, 0);
  }

  async function loadRows(activeToken = token, nextOffset = offset) {
    if (!activeToken) return;
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", offset: String(nextOffset) });
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, { credentials: "include", headers: adminRequestHeaders(activeToken) });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok || !data.ok) {
        setRows([]);
        setNotice(adminNotice(String(data.error ?? `http_${response.status}`)));
        return;
      }
      const nextRows = Array.isArray(data[responseKey]) ? (data[responseKey] as AdminRow[]) : [];
      setRows(nextRows);
      setSelectedIndex(0);
      setOffset(nextOffset);
      setNotice(nextRows.length ? `${nextRows.length} registros cargados desde D1.` : "Sin datos reales para los filtros actuales.");
    } catch {
      setRows([]);
      setNotice(`No pudimos conectar con ${endpoint}. Revisa deploy, D1 o ADMIN_TOKEN.`);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: AdminAction, row: AdminRow) {
    if (!token) return;
    setNotice("Actualizando registro...");
    try {
      const body = action.body?.(row);
      const response = await fetch(action.path(row), {
        method: "POST",
        credentials: "include",
        headers: adminRequestHeaders(token, body ? { "Content-Type": "application/json" } : {}),
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setNotice(adminNotice(data.error ?? `http_${response.status}`));
        return;
      }
      setNotice("Registro actualizado. Refrescando datos...");
      await loadRows(token, offset);
    } catch {
      setNotice("No pudimos ejecutar la accion. Intenta nuevamente.");
    }
  }

  function exportCsv() {
    const csv = toCsv(rows, columns);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${responseKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="section grid gap-6">
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">{description}</p>
          </div>
          <form className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:min-w-96" onSubmit={saveToken}>
            <label className="field">
              Token admin
              <input value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} type="password" autoComplete="off" placeholder="ADMIN_TOKEN" />
            </label>
            <button className="btn-primary" type="submit">
              Usar token
            </button>
            <span className="text-xs font-bold text-muted">El token se guarda solo en sessionStorage.</span>
          </form>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
        ))}
      </section>

      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto_auto] lg:items-end">
          <label className="field">
            Buscar
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Nombre, email, id o servicio" />
          </label>
          {allowStatusFilter ? (
            <label className="field">
              Estado
              <input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="pending, published..." />
            </label>
          ) : null}
          <button className="btn-secondary" type="button" disabled={!token || loading} onClick={() => loadRows(token, 0)}>
            {loading ? "Cargando..." : "Filtrar"}
          </button>
          <button className="btn-secondary" type="button" disabled={!token || offset === 0 || loading} onClick={() => loadRows(token, Math.max(0, offset - 50))}>
            Anterior
          </button>
          <button className="btn-primary" type="button" disabled={!token || loading} onClick={() => loadRows(token, offset + 50)}>
            Siguiente
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">{notice}</p>
          <button className="btn-secondary" type="button" disabled={!rows.length} onClick={exportCsv}>
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid max-h-[760px] gap-3 overflow-y-auto rounded-[28px] border border-line bg-white p-4 shadow-soft">
          {rows.length ? (
            rows.map((row, index) => (
              <button
                key={String(row.id ?? index)}
                className={`grid gap-2 rounded-2xl border p-4 text-left transition hover:border-brand ${index === selectedIndex ? "border-brand bg-brand-soft" : "border-line bg-slate-50"}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
              >
                <strong className="text-ink">{rowTitle(row)}</strong>
                <span className="text-sm font-bold text-muted">{rowSubtitle(row)}</span>
                <span className="text-xs font-black uppercase text-muted">{String(row.createdAt ?? row.created_at ?? row.updatedAt ?? "")}</span>
              </button>
            ))
          ) : (
            <EmptyState title="Sin datos reales cargados." text="Cuando D1 tenga registros para esta vista apareceran aqui. Si esperabas datos, revisa migraciones, binding DB y filtros." />
          )}
        </div>

        <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
          <p className="eyebrow">Detalle</p>
          {selected ? (
            <>
              <h2 className="text-2xl font-black text-ink">{rowTitle(selected)}</h2>
              {actions.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <button key={action.label} className={action.tone === "danger" ? "rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 hover:bg-rose-50" : action.tone === "primary" ? "btn-primary" : "btn-secondary"} type="button" onClick={() => runAction(action, selected)}>
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 grid gap-3">
                {columns.map((column) => (
                  <Info key={column} label={friendlyColumnLabel(column)} value={selected[column]} />
                ))}
              </div>
              <details className="mt-4 rounded-2xl border border-line bg-slate-50 p-4">
                <summary className="cursor-pointer font-black text-ink">Payload completo</summary>
                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs font-semibold text-muted">{JSON.stringify(selected, null, 2)}</pre>
              </details>
            </>
          ) : (
            <EmptyState title="Selecciona un registro." text="El detalle operacional aparecera aqui cuando cargues datos reales desde D1." />
          )}
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block break-words text-sm text-ink">{formatValue(value)}</strong>
    </div>
  );
}

function friendlyColumnLabel(column: string) {
  const labels: Record<string, string> = {
    platformMarginCLP: "Comision OficiosPro CLP",
    platformMarginCredits: "Comision OficiosPro creditos",
  };
  return labels[column] ?? column;
}

function rowTitle(row: AdminRow) {
  return String(row.displayName ?? row.firstName ?? row.name ?? row.companyName ?? row.id ?? "Registro sin nombre");
}

function rowSubtitle(row: AdminRow) {
  return [row.status, row.publicationStatus, row.email, row.userId, row.serviceName, row.type, row.provider].filter(Boolean).map(String).join(" · ") || "Sin resumen";
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Sin dato";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toCsv(rows: AdminRow[], columns: string[]) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => `"${formatValue(row[column]).replace(/"/g, '""')}"`).join(","));
  return lines.join("\n");
}

function adminNotice(error: string) {
  if (error === "admin_token_not_configured") return "ADMIN_TOKEN no esta configurado en Cloudflare.";
  if (error === "database_not_configured") return "D1 DB no esta configurada o falta binding DB.";
  if (error === "operational_tables_not_ready") return "Falta aplicar la migracion operacional 0003 en D1.";
  if (error === "unauthorized") return "Token incorrecto.";
  return `Error admin: ${error}`;
}
