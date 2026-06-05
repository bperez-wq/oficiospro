"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { defaultBookings, services, specialists } from "@/data/mock";
import { calculateServiceEconomics, formatCLP, serviceTypes, type CommercialConfig } from "@/data/marketplace";
import {
  approveAndPublishSpecialist,
  getCommercialConfig,
  getMockSession,
  getPendingSpecialists,
  getPublishedSpecialists,
  getStoredItems,
  rejectPendingSpecialist,
  saveCommercialConfig,
  seedMockState,
  type PendingSpecialistProfile,
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
  }, []);

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
            {(companyRequests.length ? companyRequests : [{ company: "Operadora Demo", plan: "Empresa", status: "Pendiente" }]).map((company, index) => (
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
