"use client";

import { useEffect, useState } from "react";
import { categories, defaultBookings, services } from "@/data/mock";
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

  return (
    <div className="grid gap-6">
      {notice ? <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Usuarios" value={users.length} />
        <Stat label="Especialistas por aprobar" value={specialistRequests.filter((item) => item.status !== "Aprobado").length} />
        <Stat label="Empresas" value={companyRequests.length} />
        <Stat label="Reservas" value={defaultBookings.length} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Aprobar especialistas</h2>
          <div className="grid gap-3">
            {(specialistRequests.length ? specialistRequests : [{ name: "Juan Pérez", specialty: "Gasfíter", commune: "La Reina", status: "Pendiente" }]).map(
              (request, index) => (
                <article key={`${request.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4">
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
              ),
            )}
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
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className="chip bg-brand-soft text-brand-dark">
                {category.name}
              </span>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Servicios</h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <strong>{service.name}</strong>
                <span className="block text-sm font-bold text-muted">{service.baseCredits} créditos base</span>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="panel">
      <span className="font-bold text-muted">{label}</span>
      <strong className="mt-2 block text-4xl font-black">{value}</strong>
    </article>
  );
}
