"use client";

import { useEffect, useState } from "react";
import { companyDashboard, specialists, type Booking, type CreditTransaction } from "@/data/mock";
import { BookingList, TransactionList } from "@/components/Lists";
import { getBookings, getTransactions, getWallet, seedMockState } from "@/lib/storage";

export function ClientDashboard() {
  const [balance, setBalance] = useState(135);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    seedMockState();
    setBalance(getWallet().balance);
    setBookings(getBookings());
    setTransactions(getTransactions());
  }, []);

  const upcoming = bookings.filter((booking) => booking.status !== "Finalizada");
  const completed = bookings.filter((booking) => booking.status === "Finalizada");
  const favorites = specialists.filter((specialist) => specialist.top).slice(0, 3);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Créditos disponibles" value={balance.toString()} />
        <StatCard label="Reservas próximas" value={upcoming.length.toString()} />
        <StatCard label="Servicios realizados" value={completed.length.toString()} />
        <StatCard label="Técnicos favoritos" value={favorites.length.toString()} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Reservas próximas</h2>
          <BookingList bookings={upcoming} />
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Historial de créditos</h2>
          <TransactionList transactions={transactions} />
        </article>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">Técnicos favoritos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {favorites.map((specialist) => (
            <a key={specialist.id} href={`/especialistas/${specialist.id}`} className="overflow-hidden rounded-2xl border border-line bg-white">
              <img src={specialist.image} alt={specialist.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <strong>{specialist.name}</strong>
                <span className="block text-sm font-bold text-muted">
                  {specialist.specialty} · {specialist.rating.toFixed(1)}/5
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SpecialistDashboard() {
  const specialist = specialists[0];
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    seedMockState();
    setBookings(getBookings().filter((booking) => booking.specialistId === specialist.id));
  }, [specialist.id]);

  const earnedCredits = bookings.reduce((sum, booking) => sum + booking.credits, 0);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="panel">
          <img src={specialist.image} alt={specialist.name} className="mb-5 h-80 w-full rounded-2xl object-cover" />
          <h2 className="text-3xl font-black">{specialist.specialty}</h2>
          <p className="mt-2 text-muted">{specialist.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialist.badges.map((badge) => (
              <span key={badge} className="chip bg-brand-soft text-brand-dark">
                {badge}
              </span>
            ))}
          </div>
        </article>
        <aside className="panel grid gap-3">
          <StatCard label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
          <StatCard label="Trabajos completados" value={specialist.jobs.toString()} />
          <StatCard label="Reservas recibidas" value={bookings.length.toString()} />
          <StatCard label="Créditos ganados" value={earnedCredits.toString()} />
        </aside>
      </section>
      <article className="panel">
        <h2 className="mb-4 text-2xl font-black">Reservas recibidas</h2>
        <BookingList bookings={bookings} />
      </article>
    </div>
  );
}

export function CompanyDashboard() {
  const corporateTransactions = [
    { id: "ctx-001", type: "Carga corporativa", detail: "Plan Empresa mensual", amount: 200, date: "2026-06-01" },
    { id: "ctx-002", type: "Servicio", detail: "Técnico HVAC Quilicura", amount: -55, date: "2026-06-02" },
    { id: "ctx-003", type: "Servicio", detail: "Electricista Vitacura", amount: -42, date: "2026-06-01" },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Créditos corporativos" value={companyDashboard.creditsAvailable.toString()} />
        <StatCard label="Usados este mes" value={companyDashboard.creditsUsed.toString()} />
        <StatCard label="Respuesta promedio" value={companyDashboard.responseTime} />
        <StatCard label="Sucursales activas" value={companyDashboard.activeBranches.toString()} />
      </section>
      <section className="rounded-panel bg-enterprise p-6 text-white shadow-soft">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Factura estimada" value={companyDashboard.monthlyBilling} />
          <Metric label="Próximo cierre" value={companyDashboard.nextInvoiceDate} />
          <Metric label="Servicios abiertos" value="2" />
          <Metric label="Historial del mes" value={companyDashboard.history.length.toString()} />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Servicios solicitados</h2>
          <div className="grid gap-3">
            {companyDashboard.services.map((service) => (
              <article key={`${service.service}-${service.branch}`} className="flex justify-between rounded-2xl border border-line bg-slate-50 p-4">
                <div>
                  <strong>{service.service}</strong>
                  <span className="block text-sm font-bold text-muted">
                    {service.branch} · {service.status}
                  </span>
                </div>
                <strong>{service.credits} créditos</strong>
              </article>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Movimientos de créditos</h2>
          <TransactionList transactions={corporateTransactions} />
        </article>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel">
      <span className="font-bold text-muted">{label}</span>
      <strong className="mt-2 block text-4xl font-black">{value}</strong>
    </article>
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
