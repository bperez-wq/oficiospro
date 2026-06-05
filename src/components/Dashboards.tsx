"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { companyDashboard, specialists, type Booking, type CreditTransaction } from "@/data/mock";
import { BookingList, TransactionList } from "@/components/Lists";
import {
  getBookings,
  getReferralState,
  getSubscription,
  getTransactions,
  getWallet,
  seedMockState,
  simulateAcceptedClientReferral,
  simulateAcceptedSpecialistReferral,
  type MockSubscription,
  type ReferralState,
} from "@/lib/storage";

export function ClientDashboard() {
  const [balance, setBalance] = useState(135);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [subscription, setSubscription] = useState<MockSubscription | null>(null);
  const [referrals, setReferrals] = useState<ReferralState | null>(null);

  useEffect(() => {
    seedMockState();
    setBalance(getWallet().balance);
    setBookings(getBookings());
    setTransactions(getTransactions());
    setSubscription(getSubscription());
    setReferrals(getReferralState());
  }, []);

  const upcoming = bookings.filter((booking) => booking.status !== "Finalizada");
  const completed = bookings.filter((booking) => booking.status === "Finalizada");
  const favorites = specialists.filter((specialist) => specialist.top).slice(0, 3);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="enterprise-shell p-6">
          <p className="eyebrow text-teal-200">Club Hogar</p>
          <h2 className="text-4xl font-black">{balance} créditos disponibles</h2>
          <p className="mt-3 font-semibold leading-7 text-white/75">Tus créditos se acumulan hasta 24 meses y se descuentan al reservar especialistas.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricDark label="Próximas" value={upcoming.length.toString()} />
            <MetricDark label="Realizados" value={completed.length.toString()} />
            <MetricDark label="Favoritos" value={favorites.length.toString()} />
          </div>
        </article>
        <article className="panel">
          <h2 className="text-2xl font-black">Acciones rápidas</h2>
          <div className="mt-5 grid gap-3">
            <Link className="btn-primary" href="/especialistas">
              Reservar especialista
            </Link>
            <Link className="btn-secondary" href="/club-hogar">
              Ver planes Club Hogar
            </Link>
            <Link className="btn-ghost" href="/registro-cliente">
              Actualizar datos
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <p className="eyebrow">Suscripción</p>
          <h2 className="text-2xl font-black">{subscription ? subscription.planName : "Sin plan activo"}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            {subscription
              ? `Renovación ${subscription.renewal}, ${subscription.monthlyCredits} créditos mensuales y vigencia de ${subscription.accumulatesMonths} meses.`
              : "Contrata Club Hogar para activar créditos mensuales y pago protegido."}
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">Mis referidos</p>
          <h2 className="text-2xl font-black">{referrals?.clientCode ?? "OP-CLIENTE-10"}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            Invitaciones aceptadas: {referrals?.clientInvitations ?? 0}. Créditos ganados: {referrals?.clientCreditsEarned ?? 0}.
          </p>
          <button
            className="btn-secondary mt-4"
            type="button"
            onClick={() => {
              setReferrals(simulateAcceptedClientReferral());
              setBalance(getWallet().balance);
              setTransactions(getTransactions());
            }}
          >
            Simular amigo registrado
          </button>
        </article>
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
            <Link key={specialist.id} href={`/especialistas/${specialist.id}`} className="overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-card">
              <img src={specialist.image} alt={specialist.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <strong>{specialist.name}</strong>
                <span className="block text-sm font-bold text-muted">
                  {specialist.specialty} · {specialist.rating.toFixed(1)}/5 · {specialist.credits} créditos
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SpecialistDashboard() {
  const specialist = specialists[0];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [referrals, setReferrals] = useState<ReferralState | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    seedMockState();
    setBookings(getBookings().filter((booking) => booking.specialistId === specialist.id));
    setReferrals(getReferralState());
    setSubmittedNotice(new URLSearchParams(window.location.search).get("submitted") === "1");
  }, [specialist.id]);

  const earnedCredits = bookings.reduce((sum, booking) => sum + booking.credits, 0);

  return (
    <div className="grid gap-6">
      {submittedNotice ? (
        <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">
          Tu perfil fue enviado para revisión.
        </div>
      ) : null}
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
          <img src={specialist.image} alt={specialist.name} className="h-80 w-full object-cover" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Perfil público</p>
                <h2 className="text-3xl font-black">{specialist.name}</h2>
                <p className="font-semibold text-muted">{specialist.specialty} en {specialist.zone}</p>
              </div>
              <span className="chip bg-brand-soft text-brand-dark">Verificación activa</span>
            </div>
            <p className="mt-4 font-semibold leading-7 text-muted">{specialist.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {specialist.badges.map((badge) => (
                <span key={badge} className="chip bg-brand-soft text-brand-dark">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </article>
        <aside className="grid gap-4">
          <StatCard label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
          <StatCard label="Trabajos completados" value={specialist.jobs.toString()} />
          <StatCard label="Reservas recibidas" value={bookings.length.toString()} />
          <StatCard label="Créditos ganados" value={earnedCredits.toString()} />
        </aside>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Reservas recibidas</h2>
          <BookingList bookings={bookings} />
        </article>
        <article className="panel">
          <h2 className="text-2xl font-black">Estado de reputación</h2>
          <div className="mt-5 grid gap-3">
            {["Perfil con foto destacada", "Certificaciones visibles", "Galería de trabajos", "Comentarios verificados"].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>
      <section className="panel">
        <p className="eyebrow">Mis referidos especialista</p>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-black">{referrals?.specialistCode ?? "OP-FUNDADOR"}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Invitaciones aprobadas: {referrals?.specialistInvitations ?? 0}. Beneficio: {referrals?.specialistBenefit ?? "Badge Fundador o créditos de reputación"}.
            </p>
          </div>
          <button className="btn-secondary" type="button" onClick={() => setReferrals(simulateAcceptedSpecialistReferral())}>
            Simular referido aprobado
          </button>
        </div>
      </section>
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
      <section className="enterprise-shell p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricDark label="Créditos corporativos" value={companyDashboard.creditsAvailable.toString()} />
          <MetricDark label="Usados este mes" value={companyDashboard.creditsUsed.toString()} />
          <MetricDark label="Respuesta promedio" value={companyDashboard.responseTime} />
          <MetricDark label="Sucursales activas" value={companyDashboard.activeBranches.toString()} />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <StatCard label="Gasto mensual mock" value={companyDashboard.monthlyBilling} />
        <StatCard label="Solicitudes abiertas" value={companyDashboard.openRequests.toString()} />
        <StatCard label="Proveedores frecuentes" value={companyDashboard.suppliers.toString()} />
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
      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">Sucursales</h2>
        <div className="grid gap-3 md:grid-cols-5">
          {companyDashboard.branches.map((branch) => (
            <span key={branch} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
              {branch}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel card-hover">
      <span className="font-bold text-muted">{label}</span>
      <strong className="mt-2 block text-4xl font-black">{value}</strong>
    </article>
  );
}

function MetricDark({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white/10 p-5">
      <span className="font-bold text-white/70">{label}</span>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}
