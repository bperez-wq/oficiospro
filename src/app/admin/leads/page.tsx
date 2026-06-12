"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { ALL_COMMUNES_VALUE, ALL_REGIONS_VALUE, regionNameForCode } from "@/lib/catalog";
import { estimatePlatformMarginCLP, formatCLP as formatPricingCLP } from "@/lib/pricing";

type AdminLead = {
  id: string;
  created_at?: string;
  createdAt?: string;
  lead_type?: string;
  leadType?: string;
  status?: string;
  priority?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  companyName?: string;
  applicant_type?: string;
  applicantType?: string;
  service?: string;
  trade?: string;
  problem_description?: string;
  problemDescription?: string;
  urgency?: string;
  region_code?: string;
  regionCode?: string;
  region_name?: string;
  regionName?: string;
  commune_code?: string;
  communeCode?: string;
  commune_name?: string;
  communeName?: string;
  specialist_name?: string;
  specialistName?: string;
  source_component?: string;
  sourceComponent?: string;
  source_button?: string;
  sourceButton?: string;
  payload_json?: string;
  payloadJson?: string;
  email_sent?: number | boolean;
  emailSent?: number | boolean;
  email_error?: string;
  emailError?: string;
};

const tokenStorageKey = "oficiospro.adminLeadToken";
const leadTypes = [
  ["", "Todos los tipos"],
  ["customer_request", "Solicitud cliente"],
  ["booking_request", "Reserva/agenda"],
  ["contact_message", "Contacto"],
  ["company_request", "Empresa"],
  ["specialist_application", "Postulación especialista"],
  ["club_hogar_interest", "Club Hogar"],
  ["payment_interest", "Pago/checkout"],
];
const statusOptions = ["nuevo", "pending", "postulado", "contactado", "en_revision", "approved", "rejected", "more_info", "convertido", "perdido", "cerrado"];

export default function AdminLeadsPage() {
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState(ALL_REGIONS_VALUE);
  const [communeFilter, setCommuneFilter] = useState(ALL_COMMUNES_VALUE);
  const [notice, setNotice] = useState("Ingresa el token interno para consultar leads.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(tokenStorageKey) ?? "";
    setToken(stored);
    setTokenDraft(stored);
  }, []);

  useEffect(() => {
    if (token) void loadLeads(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, typeFilter, regionFilter, communeFilter]);

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null, [leads, selectedId]);
  const leadKpis = useMemo(() => buildLeadKpis(leads), [leads]);

  async function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextToken = tokenDraft.trim();
    window.sessionStorage.setItem(tokenStorageKey, nextToken);
    setToken(nextToken);
    setNotice(nextToken ? "Token guardado en esta sesión. Cargando leads..." : "Ingresa un token admin válido.");
  }

  function clearToken() {
    window.sessionStorage.removeItem(tokenStorageKey);
    setToken("");
    setTokenDraft("");
    setLeads([]);
    setSelectedId("");
    setNotice("Token eliminado de esta sesión.");
  }

  async function loadLeads(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setNotice("Consultando leads...");
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("leadType", typeFilter);
    if (regionFilter && regionFilter !== ALL_REGIONS_VALUE) params.set("regionCode", regionFilter);
    if (communeFilter && communeFilter !== ALL_COMMUNES_VALUE) params.set("communeName", communeFilter);

    try {
      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; leads?: AdminLead[]; error?: string };
      if (!response.ok || !data.ok) {
        setNotice(adminErrorMessage(data.error ?? `http_${response.status}`));
        setLeads([]);
        setSelectedId("");
        return;
      }
      const nextLeads = data.leads ?? [];
      setLeads(nextLeads);
      setSelectedId((current) => (nextLeads.some((lead) => lead.id === current) ? current : nextLeads[0]?.id ?? ""));
      setNotice(nextLeads.length ? `${nextLeads.length} leads cargados desde D1.` : "No hay leads para los filtros seleccionados.");
    } catch {
      setNotice("No pudimos conectar con /api/admin/leads. Revisa dominio, deploy o conexión.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(leadId: string, status: string) {
    if (!token) return;
    setNotice("Actualizando estado...");
    try {
      const response = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setNotice(adminErrorMessage(data.error ?? `http_${response.status}`));
        return;
      }
      setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
      setNotice(`Lead ${leadId} actualizado a ${status}.`);
    } catch {
      setNotice("No pudimos actualizar el estado. Intenta nuevamente.");
    }
  }

  async function updateSpecialistApplication(leadId: string, action: "approve" | "reject" | "request-more-info") {
    if (!token) return;
    setNotice("Actualizando postulación...");
    try {
      const response = await fetch(`/api/admin/specialist-applications/${encodeURIComponent(leadId)}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string };
      if (!response.ok || !data.ok) {
        setNotice(adminErrorMessage(data.error ?? `http_${response.status}`));
        return;
      }
      const nextStatus = data.status ?? (action === "approve" ? "approved" : action === "reject" ? "rejected" : "more_info");
      setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead)));
      setNotice(`Postulación actualizada a ${nextStatus}.`);
    } catch {
      setNotice("No pudimos actualizar la postulación. Intenta nuevamente.");
    }
  }

  function exportCsv() {
    const rows = leads.map((lead) => ({
      id: lead.id,
      createdAt: getLeadValue(lead, "created_at", "createdAt"),
      type: getLeadValue(lead, "lead_type", "leadType"),
      status: lead.status ?? "",
      name: getLeadValue(lead, "full_name", "fullName"),
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: getLeadValue(lead, "company_name", "companyName"),
      region: getLeadValue(lead, "region_name", "regionName"),
      commune: getLeadValue(lead, "commune_name", "communeName"),
      service: lead.service ?? lead.trade ?? "",
      source: [getLeadValue(lead, "source_component", "sourceComponent"), getLeadValue(lead, "source_button", "sourceButton")].filter(Boolean).join(" / "),
      emailSent: String(leadFlag(lead, "email_sent", "emailSent")),
    }));
    const csv = toCsv(rows);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `oficiospro-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="section grid gap-6">
      <section className="surface-grid rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Panel interno OficiosPro</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">Leads operativos</h1>
            <p className="mt-3 max-w-3xl font-semibold leading-7 text-muted">
              Revisa solicitudes capturadas por D1, filtra por tipo, estado, región y comuna, cambia estado y exporta una base CSV.
            </p>
          </div>
          <form className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:min-w-96" onSubmit={saveToken}>
            <label className="field">
              Token admin
              <input value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} type="password" autoComplete="off" placeholder="ADMIN_TOKEN" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary flex-1" type="submit">
                Usar token
              </button>
              <button className="btn-secondary flex-1" type="button" onClick={clearToken}>
                Limpiar
              </button>
            </div>
            <span className="text-xs font-bold text-muted">El token se guarda solo en sessionStorage de este navegador.</span>
          </form>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {leadKpis.map((metric) => (
          <DashboardMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
        ))}
      </section>

      <section className="rounded-[24px] border border-brand/15 bg-brand-soft p-4 text-sm font-bold leading-6 text-brand-dark">
        <strong className="block text-base text-ink">Usa esta vista como fuente real del piloto.</strong>
        Revisa nuevos leads todos los dias, cambia estados despues de contactar y exporta CSV para seguimiento operacional. No hay datos de relleno en esta vista.
      </section>

      <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1.2fr_auto_auto] lg:items-end">
          <label className="field">
            Tipo
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {leadTypes.map(([value, label]) => (
                <option key={value || "all"} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Estado
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <RegionCommuneSelect
              region={regionFilter}
              commune={communeFilter}
              onRegionChange={(region) => {
                setRegionFilter(region);
                setCommuneFilter(ALL_COMMUNES_VALUE);
              }}
              onCommuneChange={setCommuneFilter}
              allowAllRegions
              allRegionLabel="Todas las regiones"
              allCommuneLabel="Todas las comunas"
              communePlaceholder="Filtrar por comuna"
            />
          </div>
          <button className="btn-secondary" type="button" disabled={!token || loading} onClick={() => loadLeads()}>
            {loading ? "Cargando..." : "Actualizar"}
          </button>
          <button className="btn-primary" type="button" disabled={!leads.length} onClick={exportCsv}>
            Exportar CSV
          </button>
        </div>
        <p className="mt-4 rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">{notice}</p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid max-h-[720px] gap-3 overflow-y-auto rounded-[28px] border border-line bg-white p-4 shadow-soft">
          {leads.length ? (
            leads.map((lead) => (
              <button
                key={lead.id}
                className={`grid gap-2 rounded-2xl border p-4 text-left transition hover:border-brand ${selectedLead?.id === lead.id ? "border-brand bg-brand-soft" : "border-line bg-slate-50"}`}
                type="button"
                onClick={() => setSelectedId(lead.id)}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-ink">{getLeadValue(lead, "full_name", "fullName") || getLeadValue(lead, "company_name", "companyName") || "Lead sin nombre"}</strong>
                  <span className="chip bg-white text-brand-dark">{getLeadValue(lead, "lead_type", "leadType")}</span>
                  <span className={`chip ${statusBadgeClass(lead.status)}`}>{lead.status ?? "nuevo"}</span>
                </span>
                <span className="text-sm font-bold text-muted">
                  {[lead.email, lead.phone, getLeadValue(lead, "commune_name", "communeName"), lead.service ?? lead.trade].filter(Boolean).join(" · ")}
                </span>
                <span className="text-xs font-black uppercase text-muted">{formatDate(getLeadValue(lead, "created_at", "createdAt"))}</span>
              </button>
            ))
          ) : (
            <EmptyState
              eyebrow="Sin datos"
              title="Sin leads cargados."
              text="Cuando D1 reciba formularios reales apareceran aqui. Si esperabas datos, revisa ADMIN_TOKEN, binding DB, migracion y filtros activos."
              className="border-dashed"
            />
          )}
        </div>

        <LeadDetail lead={selectedLead} onStatus={updateStatus} onSpecialistAction={updateSpecialistApplication} />
      </section>
    </main>
  );
}

function LeadDetail({
  lead,
  onStatus,
  onSpecialistAction,
}: {
  lead: AdminLead | null;
  onStatus: (id: string, status: string) => void;
  onSpecialistAction: (id: string, action: "approve" | "reject" | "request-more-info") => void;
}) {
  const payload = parsePayload(getLeadValue(lead, "payload_json", "payloadJson"));
  const pricingRows = internalPricingRows(payload);

  if (!lead) {
    return <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">Selecciona un lead para ver detalle.</section>;
  }

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Detalle</p>
          <h2 className="text-3xl font-black text-ink">{getLeadValue(lead, "full_name", "fullName") || getLeadValue(lead, "company_name", "companyName") || lead.id}</h2>
          <p className="mt-2 text-sm font-bold text-muted">{lead.id}</p>
        </div>
        <label className="field min-w-56">
          Estado
          <select value={lead.status ?? "nuevo"} onChange={(event) => onStatus(lead.id, event.target.value)}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Info label="Tipo" value={getLeadValue(lead, "lead_type", "leadType")} />
        <Info label="Prioridad" value={lead.priority} />
        <Info label="Email" value={lead.email} />
        <Info label="Teléfono" value={lead.phone} />
        <Info label="Empresa" value={getLeadValue(lead, "company_name", "companyName")} />
        <Info label="Servicio/oficio" value={lead.service ?? lead.trade} />
        <Info label="Región" value={getLeadValue(lead, "region_name", "regionName") || regionNameForCode(getLeadValue(lead, "region_code", "regionCode"))} />
        <Info label="Comuna" value={getLeadValue(lead, "commune_name", "communeName") || getLeadValue(lead, "commune_code", "communeCode")} />
        <Info label="Especialista" value={getLeadValue(lead, "specialist_name", "specialistName")} />
        <Info label="Email enviado" value={String(leadFlag(lead, "email_sent", "emailSent"))} />
      </div>

      <div className="mt-5 grid gap-4">
        {getLeadValue(lead, "lead_type", "leadType") === "specialist_application" ? (
          <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-slate-50 p-4">
            <button className="btn-primary" type="button" onClick={() => onSpecialistAction(lead.id, "approve")}>
              Aprobar
            </button>
            <button className="btn-secondary" type="button" onClick={() => onSpecialistAction(lead.id, "request-more-info")}>
              Solicitar más información
            </button>
            <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={() => onSpecialistAction(lead.id, "reject")}>
              Rechazar
            </button>
          </div>
        ) : null}
        <Info label="Descripción" value={getLeadValue(lead, "problem_description", "problemDescription")} large />
        <Info label="Fuente" value={[getLeadValue(lead, "source_component", "sourceComponent"), getLeadValue(lead, "source_button", "sourceButton")].filter(Boolean).join(" / ")} large />
        {getLeadValue(lead, "email_error", "emailError") ? <Info label="Error email" value={getLeadValue(lead, "email_error", "emailError")} large /> : null}
        {pricingRows.length ? (
          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            <p className="eyebrow">Pricing interno</p>
            <div className="mt-3 grid gap-3">
              {pricingRows.map((row, index) => (
                <div key={`${row.serviceName}-${index}`} className="rounded-2xl border border-line bg-white p-4">
                  <strong className="block text-ink">{row.serviceName || `Servicio ${index + 1}`}</strong>
                  <div className="mt-3 grid gap-2 text-sm font-bold text-muted sm:grid-cols-2">
                    <span>Tarifa especialista: {formatPricingCLP(row.specialistExpectedPayoutCLP)}</span>
                    <span>Créditos cliente: {row.clientCredits || "por revisar"}</span>
                    <span>Precio cliente estimado: {row.estimatedClientPriceCLP ? formatPricingCLP(row.estimatedClientPriceCLP) : "por revisar"}</span>
                    <span>Margen estimado interno: {row.estimatedMarginCLP ? formatPricingCLP(row.estimatedMarginCLP) : "por revisar"}</span>
                    <span>Estado pricing: {row.pricingStatus || "pending_review"}</span>
                    <span>Emergencia: {row.emergencyAvailable ? "sí" : "no"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <details className="rounded-2xl border border-line bg-slate-50 p-4">
          <summary className="cursor-pointer font-black text-ink">Payload</summary>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs font-semibold text-muted">{JSON.stringify(payload, null, 2)}</pre>
        </details>
      </div>
    </section>
  );
}

function Info({ label, value, large = false }: { label: string; value?: string; large?: boolean }) {
  return (
    <div className={`rounded-2xl border border-line bg-slate-50 p-4 ${large ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block break-words text-sm text-ink">{value || "Sin dato"}</strong>
    </div>
  );
}

function buildLeadKpis(leads: AdminLead[]) {
  const newStatuses = new Set(["nuevo", "pending", "postulado"]);
  const reviewStatuses = new Set(["nuevo", "pending", "postulado", "en_revision", "more_info"]);
  const newLeads = leads.filter((lead) => newStatuses.has((lead.status ?? "nuevo").toLowerCase())).length;
  const specialistPending = leads.filter((lead) => getLeadValue(lead, "lead_type", "leadType") === "specialist_application" && reviewStatuses.has((lead.status ?? "nuevo").toLowerCase())).length;
  const companies = leads.filter((lead) => getLeadValue(lead, "lead_type", "leadType") === "company_request").length;
  const serviceRequests = leads.filter((lead) => ["customer_request", "booking_request", "contact_message"].includes(getLeadValue(lead, "lead_type", "leadType"))).length;
  const failedEmails = leads.filter((lead) => !leadFlag(lead, "email_sent", "emailSent") && Boolean(getLeadValue(lead, "email_error", "emailError"))).length;

  return [
    { label: "Leads nuevos", value: newLeads.toString(), detail: "Pendientes de primera gestion", tone: "brand" as const },
    { label: "Postulantes", value: specialistPending.toString(), detail: "Especialistas por revisar", tone: "light" as const },
    { label: "Empresas", value: companies.toString(), detail: "Cuentas B2B interesadas", tone: "light" as const },
    { label: "Solicitudes", value: serviceRequests.toString(), detail: "Clientes y reservas", tone: "light" as const },
    { label: "Emails fallidos", value: failedEmails.toString(), detail: "Requieren revision", tone: failedEmails ? ("brand" as const) : ("light" as const) },
  ];
}

function statusBadgeClass(status?: string) {
  const normalized = (status ?? "nuevo").toLowerCase();
  if (["approved", "convertido", "cerrado"].includes(normalized)) return "bg-emerald-50 text-emerald-700";
  if (["rejected", "perdido"].includes(normalized)) return "bg-rose-50 text-rose-700";
  if (["contactado", "en_revision", "more_info"].includes(normalized)) return "bg-amber-50 text-amber-800";
  return "bg-white text-brand-dark";
}

function getLeadValue(lead: AdminLead | null | undefined, snake: keyof AdminLead, camel: keyof AdminLead) {
  if (!lead) return "";
  const value = lead[snake] ?? lead[camel] ?? "";
  return String(value ?? "");
}

function leadFlag(lead: AdminLead, snake: keyof AdminLead, camel: keyof AdminLead) {
  const value = lead[snake] ?? lead[camel];
  return value === true || value === 1 || value === "1";
}

function parsePayload(value: string) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return { raw: value };
  }
}

type InternalPricingRow = {
  serviceName: string;
  specialistExpectedPayoutCLP: number;
  clientCredits: number;
  estimatedClientPriceCLP: number;
  estimatedMarginCLP: number;
  pricingStatus: string;
  emergencyAvailable: boolean;
};

function internalPricingRows(payload: Record<string, unknown>): InternalPricingRow[] {
  const services = Array.isArray(payload.services) ? payload.services : [];
  return services
    .map((item) => {
      const service = asRecord(item);
      const specialistExpectedPayoutCLP = numberValue(service.specialistExpectedPayoutCLP ?? service.specialistPayoutCLP);
      const clientCredits =
        [
          numberValue(service.calculatedClientCredits),
          numberValue(service.clientCredits),
          numberValue(service.fixedCredits),
          numberValue(service.hourlyCredits),
          numberValue(service.minCredits),
          numberValue(service.visitCredits),
        ].find((value) => value > 0) ?? 0;
      const estimatedClientPriceCLP = numberValue(service.estimatedClientPriceCLP) || (clientCredits ? clientCredits * 1000 : 0);
      const estimatedMarginCLP =
        estimatedClientPriceCLP && specialistExpectedPayoutCLP
          ? estimatedClientPriceCLP - specialistExpectedPayoutCLP
          : specialistExpectedPayoutCLP
            ? estimatePlatformMarginCLP({
                specialistExpectedPayoutCLP,
                categoryId: textValue(service.serviceTypeId),
                serviceId: textValue(service.serviceTypeId),
                emergency: Boolean(service.emergencyAvailable),
              })
            : 0;

      return {
        serviceName: textValue(service.serviceName) || textValue(service.name),
        specialistExpectedPayoutCLP,
        clientCredits,
        estimatedClientPriceCLP,
        estimatedMarginCLP,
        pricingStatus: textValue(service.pricingStatus),
        emergencyAvailable: Boolean(service.emergencyAvailable),
      };
    })
    .filter((row) => row.specialistExpectedPayoutCLP || row.clientCredits || row.estimatedClientPriceCLP);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function adminErrorMessage(error: string) {
  if (error === "admin_token_not_configured") return "ADMIN_TOKEN no está configurado en Cloudflare.";
  if (error === "database_not_configured") return "D1 DB no está configurada o falta el binding DB.";
  if (error === "unauthorized") return "Token incorrecto. Revisa ADMIN_TOKEN.";
  return `Error admin: ${error}`;
}

function formatDate(value: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

function toCsv(rows: Record<string, string>[]) {
  const headers = Object.keys(rows[0] ?? { id: "" });
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header] ?? "")).join(","));
  }
  return lines.join("\n");
}

function csvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
