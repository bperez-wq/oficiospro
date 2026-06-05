"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { defaultBookings, services, specialists } from "@/data/mock";
import { calculateServiceEconomics, formatCLP, serviceTypes, type CommercialConfig } from "@/data/marketplace";
import { getCommercialConfig, getStoredItems, saveCommercialConfig, saveStoredItems, seedMockState } from "@/lib/storage";
import { BookingList } from "@/components/Lists";

type SpecialistRequestService = {
  serviceTypeId?: string;
  specialty?: string;
  clientCredits?: number;
  specialistPayoutCLP?: number;
  economics?: {
    incomeCLP: number;
    specialistPayoutCLP: number;
    marginCLP: number;
    minMarginCLP: number;
    status: string;
  };
};

type SpecialistRequest = {
  id?: string;
  name?: string;
  typeServicio?: string;
  specialty?: string;
  commune?: string;
  services?: SpecialistRequestService[];
  references?: unknown[];
  status?: string;
};

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

const fallbackSpecialists: SpecialistRequest[] = [
  {
    id: "fallback-1",
    name: "Juan Pérez",
    typeServicio: "Hogar",
    specialty: "Gasfitería domiciliaria",
    commune: "La Reina",
    status: "pendiente",
    services: [{ serviceTypeId: "hogar", specialty: "Gasfitería domiciliaria", clientCredits: 12, specialistPayoutCLP: 7000 }],
    references: [{}, {}, {}],
  },
  {
    id: "fallback-2",
    name: "Paola Castillo",
    typeServicio: "Jardinería",
    specialty: "Jardinería hogar",
    commune: "Peñalolén",
    status: "pendiente",
    services: [{ serviceTypeId: "jardineria", specialty: "Jardinería hogar", clientCredits: 18, specialistPayoutCLP: 12000 }],
    references: [{}, {}, {}],
  },
];

export function AdminPanel() {
  const [specialistRequests, setSpecialistRequests] = useState<SpecialistRequest[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [config, setConfig] = useState<CommercialConfig | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
    setConfig(getCommercialConfig());
    setSpecialistRequests(getStoredItems<SpecialistRequest>("specialists"));
    setCompanyRequests(getStoredItems<CompanyRequest>("companies"));
    setUsers(getStoredItems<UserRequest>("users"));
  }, []);

  function updateConfig(event: ChangeEvent<HTMLInputElement>) {
    if (!config) return;
    const next = { ...config, [event.target.name]: Number(event.target.value) };
    setConfig(next);
    saveCommercialConfig(next);
    setNotice("Configuración comercial guardada en localStorage.");
  }

  function updateRequestStatus(id: string | undefined, status: "aprobado" | "rechazado") {
    const source = specialistRequests.length ? specialistRequests : fallbackSpecialists;
    const updated = source.map((item) => (item.id === id ? { ...item, status } : item));
    setSpecialistRequests(updated);
    if (specialistRequests.length) saveStoredItems("specialists", updated);
    setNotice(status === "aprobado" ? "Especialista aprobado en el mock admin." : "Especialista rechazado en el mock admin.");
  }

  const requestsToShow = specialistRequests.length ? specialistRequests : fallbackSpecialists;

  return (
    <div className="grid gap-6">
      {notice ? <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

      <section className="enterprise-shell p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <Metric label="Usuarios mock" value={users.length.toString()} />
          <Metric label="Especialistas red" value={specialists.length.toString()} />
          <Metric label="Por aprobar" value={requestsToShow.filter((item) => item.status !== "aprobado").length.toString()} />
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
          {requestsToShow.map((request) => (
            <SpecialistRequestRow
              key={request.id ?? request.name}
              request={request}
              config={config ?? getCommercialConfig()}
              onApprove={() => updateRequestStatus(request.id, "aprobado")}
              onReject={() => updateRequestStatus(request.id, "rechazado")}
            />
          ))}
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
  request: SpecialistRequest;
  config: CommercialConfig;
  onApprove: () => void;
  onReject: () => void;
}) {
  const services = request.services?.length ? request.services : [{ serviceTypeId: "hogar", clientCredits: 12, specialistPayoutCLP: 7000 }];
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
          {request.typeServicio ?? "Tipo por definir"} · {request.commune ?? "Comuna pendiente"} · {services.length} servicios · {request.references?.length ?? 0} referencias
        </span>
        <div className="mt-3 grid gap-2 text-sm font-bold text-muted md:grid-cols-4">
          <span>Especialidad: {request.specialty ?? services[0]?.specialty ?? "Pendiente"}</span>
          <span>Ingreso cliente: {formatCLP(margins[0]?.incomeCLP ?? 0)}</span>
          <span>Pago especialista: {formatCLP(margins[0]?.specialistPayoutCLP ?? 0)}</span>
          <span>Margen estimado: {formatCLP(averageMargin)}</span>
        </div>
      </div>
      <div className="flex gap-2 lg:justify-end">
        <button className="btn-primary flex-1" type="button" onClick={onApprove}>
          Aprobar
        </button>
        <button className="btn-secondary flex-1" type="button" onClick={onReject}>
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
