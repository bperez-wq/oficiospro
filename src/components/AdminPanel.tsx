"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { defaultBookings, services, specialists } from "@/data/mock";
import { calculateServiceEconomics, formatCLP, serviceTypes, type CommercialConfig } from "@/data/marketplace";
import {
  approveAndPublishSpecialist,
  getConversionEvents,
  getCommercialConfig,
  getEnterpriseLeads,
  getHomeLeads,
  getMockSession,
  getPendingSpecialists,
  getPublishedSpecialists,
  getServiceRequestLeads,
  getSpecialistLeads,
  getStoredItems,
  rejectPendingSpecialist,
  saveCommercialConfig,
  seedMockState,
  updateConversionLeadStatus,
  type ConversionEvent,
  type ConversionLeadKind,
  type ConversionLeadStatus,
  type EnterpriseLead,
  type HomeLead,
  type PendingSpecialistProfile,
  type ServiceRequestLead,
  type SpecialistLead,
} from "@/lib/storage";
import { BookingList } from "@/components/Lists";

type CompanyRequest = {
  id?: string;
  company?: string;
  plan?: string;
  status?: string;
};

type UserRequest = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function AdminPanel() {
  const [specialistRequests, setSpecialistRequests] = useState<PendingSpecialistProfile[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [config, setConfig] = useState<CommercialConfig | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [homeLeads, setHomeLeads] = useState<HomeLead[]>([]);
  const [enterpriseLeads, setEnterpriseLeads] = useState<EnterpriseLead[]>([]);
  const [specialistLeads, setSpecialistLeads] = useState<SpecialistLead[]>([]);
  const [serviceRequestLeads, setServiceRequestLeads] = useState<ServiceRequestLead[]>([]);
  const [conversionEvents, setConversionEvents] = useState<ConversionEvent[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
    setIsAdmin(getMockSession()?.role === "admin");
    setConfig(getCommercialConfig());
    setSpecialistRequests(getPendingSpecialists());
    setPublishedCount(getPublishedSpecialists().length);
    setCompanyRequests(getStoredItems<CompanyRequest>("companies"));
    setUsers(getStoredItems<UserRequest>("users"));
    refreshConversionData();
  }, []);

  function refreshConversionData() {
    setHomeLeads(getHomeLeads());
    setEnterpriseLeads(getEnterpriseLeads());
    setSpecialistLeads(getSpecialistLeads());
    setServiceRequestLeads(getServiceRequestLeads());
    setConversionEvents(getConversionEvents());
  }

  function updateConfig(event: ChangeEvent<HTMLInputElement>) {
    if (!config) return;
    const next = { ...config, [event.target.name]: Number(event.target.value) };
    setConfig(next);
    saveCommercialConfig(next);
    setNotice("Configuración comercial guardada.");
  }

  function approveRequest(id: string | undefined) {
    if (!id) return;
    approveAndPublishSpecialist(id);
    setSpecialistRequests(getPendingSpecialists());
    setPublishedCount(getPublishedSpecialists().length);
    setNotice("Especialista aprobado y publicado en el marketplace.");
  }

  function rejectRequest(id: string | undefined) {
    if (!id) return;
    rejectPendingSpecialist(id);
    setSpecialistRequests(getPendingSpecialists());
    setNotice("Especialista rechazado.");
  }

  function changeLeadStatus(kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) {
    updateConversionLeadStatus(kind, id, status);
    refreshConversionData();
    setNotice(`Lead marcado como ${status}.`);
  }

  if (!isAdmin) {
    return (
      <section className="panel">
        <p className="eyebrow">Acceso administrador</p>
        <h2 className="text-3xl font-black">Inicia sesión para gestionar OficiosPro.</h2>
        <p className="mt-3 font-semibold leading-7 text-muted">El panel administra especialistas, márgenes, créditos y publicación en marketplace.</p>
        <Link className="btn-primary mt-6" href="/login">
          Ir al login
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      {notice ? <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

      <section className="enterprise-shell p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <Metric label="Usuarios" value={users.length.toString()} />
          <Metric label="Especialistas red" value={(specialists.length + publishedCount).toString()} />
          <Metric label="Por aprobar" value={specialistRequests.filter((item) => item.status === "pendiente").length.toString()} />
          <Metric label="Empresas" value={companyRequests.length.toString()} />
          <Metric label="Reservas" value={defaultBookings.length.toString()} />
        </div>
      </section>

      {config ? (
        <section className="panel">
          <div className="mb-5">
            <p className="eyebrow">Configuración comercial</p>
            <h2 className="text-3xl font-black">Motor de créditos y márgenes</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">Estos valores alimentan el registro de especialistas, checkout y revisión admin.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <NumberField label="Valor de 1 crédito CLP" name="creditValueCLP" value={config.creditValueCLP} onChange={updateConfig} />
            <NumberField label="Margen mínimo hogar" name="minHomeMarginCLP" value={config.minHomeMarginCLP} onChange={updateConfig} />
            <NumberField label="Margen mínimo empresa" name="minCompanyMarginCLP" value={config.minCompanyMarginCLP} onChange={updateConfig} />
            <NumberField label="Fee visita hogar" name="homeVisitFeeCLP" value={config.homeVisitFeeCLP} onChange={updateConfig} />
            <NumberField label="Fee visita empresa" name="companyVisitFeeCLP" value={config.companyVisitFeeCLP} onChange={updateConfig} />
            <NumberField label="Vencimiento créditos meses" name="creditExpirationMonths" value={config.creditExpirationMonths} onChange={updateConfig} />
            <NumberField label="Bono referido cliente" name="clientReferralBonusCredits" value={config.clientReferralBonusCredits} onChange={updateConfig} />
          </div>
        </section>
      ) : null}

      <ConversionAdminSection
        homeLeads={homeLeads}
        enterpriseLeads={enterpriseLeads}
        specialistLeads={specialistLeads}
        serviceRequestLeads={serviceRequestLeads}
        conversionEvents={conversionEvents}
        onStatusChange={changeLeadStatus}
      />

      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">Solicitudes de especialistas</h2>
        <div className="grid gap-3">
          {specialistRequests.length ? specialistRequests.map((request) => (
            <SpecialistRequestRow
              key={request.id ?? request.name}
              request={request}
              config={config ?? getCommercialConfig()}
              onApprove={() => approveRequest(request.id)}
              onReject={() => rejectRequest(request.id)}
            />
          )) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted">No hay especialistas pendientes por ahora.</p>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Empresas</h2>
          <div className="grid gap-3">
            {(companyRequests.length ? companyRequests : [{ company: "Empresa piloto", plan: "Empresa", status: "Pendiente" }]).map((company, index) => (
              <article key={`${company.company}-${index}`} className="rounded-2xl border border-line bg-slate-50 p-4">
                <strong>{company.company}</strong>
                <span className="block text-sm font-bold text-muted">
                  {company.plan} · {company.status}
                </span>
              </article>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Tipos de servicio</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceTypes.map((type) => (
              <article key={type.id} className="rounded-2xl bg-slate-50 p-4">
                <strong>{type.name}</strong>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">{type.specialties.length} especialidades configuradas</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Servicios y créditos base</h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <article key={service.id} className="flex items-center justify-between rounded-2xl border border-line bg-slate-50 p-4">
                <strong>{service.name}</strong>
                <span className="font-black text-brand">{service.baseCredits} créditos</span>
              </article>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Validación de referencias y documentos</h2>
          <div className="grid gap-3">
            {specialists.slice(0, 5).map((specialist) => (
              <article key={specialist.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{specialist.name}</strong>
                  <span className="chip bg-brand-soft text-brand-dark">{specialist.rank}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm font-bold text-muted sm:grid-cols-3">
                  <span>RUT: {specialist.validation?.rut}</span>
                  <span>Selfie: {specialist.validation?.selfie}</span>
                  <span>Refs: {specialist.validation?.references}/3</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <article className="panel">
        <h2 className="mb-4 text-2xl font-black">Reservas</h2>
        <BookingList bookings={defaultBookings} />
      </article>
    </div>
  );
}

type AdminLeadRow = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  name: string;
  email: string;
  whatsapp: string;
  commune: string;
  interest: string;
  sourceButton: string;
};

function ConversionAdminSection({
  homeLeads,
  enterpriseLeads,
  specialistLeads,
  serviceRequestLeads,
  conversionEvents,
  onStatusChange,
}: {
  homeLeads: HomeLead[];
  enterpriseLeads: EnterpriseLead[];
  specialistLeads: SpecialistLead[];
  serviceRequestLeads: ServiceRequestLead[];
  conversionEvents: ConversionEvent[];
  onStatusChange: (kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) => void;
}) {
  const mappedHomeLeads: AdminLeadRow[] = homeLeads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    whatsapp: lead.whatsapp,
    commune: lead.commune,
    interest: lead.interest,
    sourceButton: lead.sourceButton,
  }));
  const mappedEnterpriseLeads: AdminLeadRow[] = enterpriseLeads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt,
    status: lead.status,
    name: `${lead.name} · ${lead.company}`,
    email: lead.email,
    whatsapp: lead.whatsapp,
    commune: lead.commune,
    interest: lead.interest,
    sourceButton: lead.sourceButton,
  }));
  const mappedSpecialistLeads: AdminLeadRow[] = specialistLeads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    whatsapp: lead.phone,
    commune: lead.commune,
    interest: `${lead.serviceTypeName} · ${lead.years} años`,
    sourceButton: lead.sourceButton,
  }));
  const mappedServiceRequests: AdminLeadRow[] = serviceRequestLeads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    whatsapp: lead.whatsapp,
    commune: lead.commune,
    interest: lead.interest,
    sourceButton: lead.sourceButton,
  }));

  return (
    <section className="panel">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Leads y conversiones</p>
          <h2 className="text-3xl font-black">Captura comercial de modales</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">Revisa qué botones convierten, qué planes interesan y qué comunas tienen demanda.</p>
        </div>
        <button
          className="btn-secondary"
          type="button"
          onClick={() =>
            exportCsv("oficiospro-conversiones.csv", [
              ...mappedHomeLeads,
              ...mappedEnterpriseLeads,
              ...mappedSpecialistLeads,
              ...mappedServiceRequests,
            ])
          }
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid gap-5">
        <ConversionLeadTable title="Leads Club Hogar" kind="home" leads={mappedHomeLeads} onStatusChange={onStatusChange} />
        <ConversionLeadTable title="Leads Empresas" kind="enterprise" leads={mappedEnterpriseLeads} onStatusChange={onStatusChange} />
        <ConversionLeadTable title="Leads Especialistas" kind="specialist" leads={mappedSpecialistLeads} onStatusChange={onStatusChange} />
        <ConversionLeadTable title="Solicitudes de reserva" kind="serviceRequest" leads={mappedServiceRequests} onStatusChange={onStatusChange} />
        <ConversionEventsTable events={conversionEvents} />
      </div>
    </section>
  );
}

function ConversionLeadTable({
  title,
  kind,
  leads,
  onStatusChange,
}: {
  title: string;
  kind: ConversionLeadKind;
  leads: AdminLeadRow[];
  onStatusChange: (kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) => void;
}) {
  return (
    <article className="rounded-[24px] border border-line bg-slate-50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black">{title}</h3>
        <span className="chip bg-white text-brand-dark">{leads.length} registros</span>
      </div>
      {leads.length ? (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <article key={lead.id} className="grid gap-3 rounded-2xl border border-line bg-white p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{lead.name}</strong>
                  <span className="chip bg-brand-soft text-brand-dark">{lead.status}</span>
                </div>
                <div className="mt-2 grid gap-2 text-sm font-bold text-muted md:grid-cols-4">
                  <span>{formatShortDate(lead.createdAt)}</span>
                  <span>{lead.email}</span>
                  <span>{lead.whatsapp}</span>
                  <span>{lead.commune}</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                  {lead.interest} · Botón: {lead.sourceButton}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {(["Contactado", "Convertido", "Perdido"] as ConversionLeadStatus[]).map((status) => (
                  <button
                    key={status}
                    className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand"
                    type="button"
                    onClick={() => onStatusChange(kind, lead.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-muted">Todavía no hay registros capturados.</p>
      )}
    </article>
  );
}

function ConversionEventsTable({ events }: { events: ConversionEvent[] }) {
  return (
    <article className="rounded-[24px] border border-line bg-slate-50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black">Eventos de conversión</h3>
        <span className="chip bg-white text-brand-dark">{events.length} eventos</span>
      </div>
      {events.length ? (
        <div className="grid gap-3">
          {events.slice(0, 20).map((event) => (
            <article key={event.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{event.type}</strong>
                <span className="text-sm font-bold text-muted">{formatShortDate(event.timestamp)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                {event.sourceButton} · {event.page}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-muted">Todavía no hay eventos de conversión.</p>
      )}
    </article>
  );
}

function exportCsv(filename: string, rows: AdminLeadRow[]) {
  if (typeof window === "undefined") return;
  const headers = ["Fecha", "Nombre", "Email", "WhatsApp", "Comuna", "Interés", "Estado", "Botón"];
  const body = rows.map((row) =>
    [row.createdAt, row.name, row.email, row.whatsapp, row.commune, row.interest, row.status, row.sourceButton]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function SpecialistRequestRow({
  request,
  config,
  onApprove,
  onReject,
}: {
  request: PendingSpecialistProfile;
  config: CommercialConfig;
  onApprove: () => void;
  onReject: () => void;
}) {
  const services: PendingSpecialistProfile["services"] = request.services?.length
    ? request.services
    : [
        {
          serviceTypeId: "hogar",
          specialty: "Gasfitería domiciliaria",
          name: "Servicio declarado",
          description: "",
          clientCredits: 12,
          specialistPayoutCLP: 7000,
          initialVisitFree: true,
          visitCredits: 0,
          duration: "2 horas",
          emergency: false,
        },
      ];
  const references = request.references ?? [];
  const portfolioPhotos = request.portfolioPhotos ?? [];
  const margins = services.map((service) =>
    service.economics ??
    calculateServiceEconomics({
      clientCredits: Number(service.clientCredits ?? 0),
      specialistPayoutCLP: Number(service.specialistPayoutCLP ?? 0),
      serviceTypeId: service.serviceTypeId ?? "hogar",
      config,
    }),
  );
  const averageMargin = margins.length ? Math.round(margins.reduce((sum, item) => sum + item.marginCLP, 0) / margins.length) : 0;
  const hasReview = margins.some((item) => item.status === "Revisar");

  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-slate-50 p-4 lg:grid-cols-[1fr_220px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{request.name}</strong>
          <span className={`chip ${request.status === "aprobado" ? "bg-brand-soft text-brand-dark" : request.status === "rechazado" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>
            {request.status ?? "pendiente"}
          </span>
          <span className={`chip ${hasReview ? "bg-amber-50 text-amber-800" : "bg-brand-soft text-brand-dark"}`}>
            Margen {hasReview ? "Revisar" : "OK"}
          </span>
        </div>
        <span className="mt-1 block text-sm font-bold text-muted">
          {request.typeServicio ?? "Tipo por definir"} · {request.commune ?? "Comuna pendiente"} · {services.length} servicios · {references.length} referencias
        </span>
        <div className="mt-3 grid gap-2 text-sm font-bold text-muted md:grid-cols-4">
          <span>Especialidad: {request.specialty ?? services[0]?.specialty ?? "Pendiente"}</span>
          <span>Ingreso cliente: {formatCLP(margins[0]?.incomeCLP ?? 0)}</span>
          <span>Pago especialista: {formatCLP(margins[0]?.specialistPayoutCLP ?? 0)}</span>
          <span>Margen estimado: {formatCLP(averageMargin)}</span>
        </div>
        <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-muted md:grid-cols-3">
          <span>Foto: {request.profilePhoto ?? "pendiente"}</span>
          <span>Portafolio: {portfolioPhotos.length} fotos</span>
          <span>Lat/Lng: {request.lat?.toFixed(4) ?? "pendiente"}, {request.lng?.toFixed(4) ?? "pendiente"}</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <strong className="text-sm text-ink">Servicios declarados</strong>
            <div className="mt-2 grid gap-2">
              {services.map((service) => (
                <span key={`${service.name}-${service.specialty}`} className="text-sm font-bold text-muted">
                  {service.name || service.specialty}: {service.clientCredits} créditos · paga {formatCLP(service.specialistPayoutCLP ?? 0)}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <strong className="text-sm text-ink">Referencias</strong>
            <div className="mt-2 grid gap-2">
              {references.map((reference) => (
                <span key={`${reference.name}-${reference.phone}`} className="text-sm font-bold text-muted">
                  {reference.name} · {reference.company} · {reference.phone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 lg:justify-end">
        <button className="btn-primary flex-1 disabled:opacity-50" type="button" onClick={onApprove} disabled={request.status === "aprobado"}>
          Aprobar y publicar
        </button>
        <button className="btn-secondary flex-1 disabled:opacity-50" type="button" onClick={onReject} disabled={request.status === "rechazado"}>
          Rechazar
        </button>
      </div>
    </article>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof CommercialConfig;
  value: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="field">
      {label}
      <input name={name} type="number" value={value} onChange={onChange} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white/10 p-5">
      <span className="font-bold text-white/70">{label}</span>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}
