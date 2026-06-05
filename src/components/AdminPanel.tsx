"use client";

import { useEffect, useState } from "react";
import { categories, defaultBookings, services, specialists } from "@/data/mock";
import { getStoredItems } from "@/lib/storage";
import { BookingList } from "@/components/Lists";

type SpecialistRequest = {
  id?: string;
  name?: string;
  specialty?: string;
  commune?: string;
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

export function AdminPanel() {
  const [specialistRequests, setSpecialistRequests] = useState<SpecialistRequest[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSpecialistRequests(getStoredItems<SpecialistRequest>("specialists"));
    setCompanyRequests(getStoredItems<CompanyRequest>("companies"));
    setUsers(getStoredItems<UserRequest>("users"));
  }, []);

  function approve(index: number) {
    setSpecialistRequests((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, status: "Aprobado" } : item)));
    setNotice("Especialista aprobado en el mock admin.");
  }

  const fallbackSpecialists = [
    { name: "Juan Pérez", specialty: "Gasfíter", commune: "La Reina", status: "Pendiente" },
    { name: "Paola Castillo", specialty: "Jardinera", commune: "Peñalolén", status: "Pendiente" },
  ];

  return (
    <div className="grid gap-6">
      {notice ? <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

      <section className="enterprise-shell p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <Metric label="Usuarios mock" value={users.length.toString()} />
          <Metric label="Especialistas red" value={specialists.length.toString()} />
          <Metric label="Por aprobar" value={specialistRequests.filter((item) => item.status !== "Aprobado").length.toString()} />
          <Metric label="Empresas" value={companyRequests.length.toString()} />
          <Metric label="Reservas" value={defaultBookings.length.toString()} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Aprobar especialistas</h2>
          <div className="grid gap-3">
            {(specialistRequests.length ? specialistRequests : fallbackSpecialists).map((request, index) => (
              <article key={`${request.name}-${index}`} className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div>
                  <strong>{request.name}</strong>
                  <span className="block text-sm font-bold text-muted">
                    {request.specialty} · {request.commune} · {request.status}
                  </span>
                </div>
                <button className="btn-primary" type="button" onClick={() => approve(index)}>
                  Aprobar
                </button>
              </article>
            ))}
          </div>
        </article>
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
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Categorías</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <article key={category.id} className="rounded-2xl bg-slate-50 p-4">
                <strong>{category.name}</strong>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">{category.description}</p>
              </article>
            ))}
          </div>
        </article>
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
      </section>

      <article className="panel">
        <h2 className="mb-4 text-2xl font-black">Reservas</h2>
        <BookingList bookings={defaultBookings} />
      </article>
    </div>
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
