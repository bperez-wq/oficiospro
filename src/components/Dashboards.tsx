"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditExplainer } from "@/components/CreditExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { SpecialistProfileImage } from "@/components/SpecialistProfileImage";
import { companyDashboard, specialists, type Booking, type CreditTransaction, type Specialist } from "@/data/mock";
import { additionalTypeLabels, quoteStatusLabels, type AdditionalRequest, type QuoteAgreement } from "@/data/flexiblePricing";
import { BookingList, TransactionList } from "@/components/Lists";
import {
  getAdditionalRequests,
  getBookings,
  getClientProfile,
  getMockSession,
  getPaymentCreditTransactions,
  getPaymentCreditWallet,
  getQuoteAgreements,
  getReferralState,
  getSubscription,
  getTransactions,
  getWallet,
  getPublishedSpecialists,
  seedMockState,
  simulateAcceptedClientReferral,
  simulateAcceptedSpecialistReferral,
  updateAdditionalRequestStatus,
  updateQuoteAgreementStatus,
  type ClientProfile,
  type PaymentCreditWallet,
  type MockSubscription,
  type ReferralState,
} from "@/lib/storage";
import { distanceInKm } from "@/data/marketplace";
import { additionalNeedsPayment, quoteTotalCredits } from "@/lib/flexiblePricing";
import { canAccess } from "@/lib/security";
import { shouldShowDemoData } from "@/lib/demoData";
import {
  addVirtualQuoteOffer,
  getVirtualQuoteRequests,
  updateVirtualQuoteStatus,
  virtualQuoteStatusLabels,
  virtualQuoteUrgencyLabels,
  type VirtualQuoteRequest,
} from "@/lib/virtualQuotes";

export function ClientDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [balance, setBalance] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [subscription, setSubscription] = useState<MockSubscription | null>(null);
  const [referrals, setReferrals] = useState<ReferralState | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [publishedSpecialists, setPublishedSpecialists] = useState<Specialist[]>([]);
  const [paymentWallet, setPaymentWallet] = useState<PaymentCreditWallet | null>(null);
  const [quoteAgreements, setQuoteAgreements] = useState<QuoteAgreement[]>([]);
  const [additionalRequests, setAdditionalRequests] = useState<AdditionalRequest[]>([]);

  useEffect(() => {
    const session = getMockSession();
    if (!canAccess(session?.role, "customer_dashboard", "read")) {
      setAuthorized(false);
      return;
    }
    setAuthorized(true);
    seedMockState();
    const paymentWallet = getPaymentCreditWallet();
    const paymentTransactions = getPaymentCreditTransactions();
    setBalance(paymentWallet.currentBalance || getWallet().balance);
    setPaymentWallet(paymentWallet);
    setBookings(getBookings());
    setTransactions(
      paymentTransactions.length
        ? paymentTransactions.map((transaction) => ({
            id: transaction.id,
            type: transaction.type,
            detail: transaction.detail,
            amount: transaction.amount,
            date: transaction.createdAt.slice(0, 10),
          }))
        : getTransactions(),
    );
    setSubscription(getSubscription());
    setReferrals(getReferralState());
    setClientProfile(getClientProfile());
    setPublishedSpecialists(getPublishedSpecialists());
    setQuoteAgreements(getQuoteAgreements());
    setAdditionalRequests(getAdditionalRequests());
  }, []);

  if (authorized === false) return <RoleGuardMessage />;
  if (authorized === null) return <RoleGuardMessage checking />;

  const demoDataEnabled = shouldShowDemoData();
  const upcoming = bookings.filter((booking) => booking.status !== "Finalizada");
  const completed = bookings.filter((booking) => booking.status === "Finalizada");
  const favorites = demoDataEnabled ? specialists.filter((specialist) => specialist.top).slice(0, 3) : [];
  const clientLocation =
    clientProfile?.lat !== null && clientProfile?.lat !== undefined && clientProfile?.lng !== null && clientProfile?.lng !== undefined
      ? { lat: clientProfile.lat, lng: clientProfile.lng }
      : null;
  const nearbySpecialists = [...(demoDataEnabled ? specialists : []), ...publishedSpecialists]
    .map((specialist) => ({
      ...specialist,
      distance:
        clientLocation && specialist.geo
          ? Number(distanceInKm(clientLocation, specialist.geo).toFixed(1))
          : specialist.distance,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  function changeQuote(id: string, status: QuoteAgreement["status"], message: string) {
    updateQuoteAgreementStatus(id, status, message);
    setQuoteAgreements(getQuoteAgreements());
  }

  function changeAdditional(id: string, status: AdditionalRequest["status"], message: string) {
    updateAdditionalRequestStatus(id, status, message);
    setAdditionalRequests(getAdditionalRequests());
  }

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
            <ConversionButton type="consulta_general" sourceButton="Reservar especialista dashboard cliente" className="btn-primary">
              Reservar especialista
            </ConversionButton>
            <ConversionButton type="lead_cliente" sourceButton="Ver planes Club Hogar dashboard" className="btn-secondary">
              Ver planes Club Hogar
            </ConversionButton>
            <Link className="btn-ghost" href="/registro-cliente">
              Actualizar datos
            </Link>
          </div>
        </article>
      </section>

      <CreditExplainer
        availableCredits={paymentWallet?.currentBalance ?? balance}
        heldCredits={paymentWallet?.heldCredits ?? 0}
        expiringCredits={paymentWallet?.expiringCreditsTotal ?? 0}
        monthlyCredits={subscription?.monthlyCredits ?? 35}
        compact
      />

      <section className="panel">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Propuesta y acuerdo</p>
            <h2 className="text-2xl font-black">Cotizaciones y acuerdos</h2>
          </div>
          <Link className="btn-secondary" href="/checkout?mode=credits_purchase">
            Comprar créditos
          </Link>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <StatCard label="Disponibles" value={`${paymentWallet?.currentBalance ?? balance}`} />
          <StatCard label="Retenidos" value={`${paymentWallet?.heldCredits ?? 0}`} />
          <StatCard label="Por vencer" value={`${paymentWallet?.expiringCreditsTotal ?? 0}`} />
          <StatCard label="En cotización/adicional" value={`${(paymentWallet?.quoteHeldCredits ?? 0) + (paymentWallet?.additionalHeldCredits ?? 0)}`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            {quoteAgreements.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{quote.serviceName}</strong>
                  <span className="chip bg-white text-brand-dark">{quoteStatusLabels[quote.status]}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{quote.specialistName} · {quote.commune}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{quote.proposal?.description ?? quote.originalRequest}</p>
                {quote.proposal ? <strong className="mt-2 block text-ink">Total propuesta: {quoteTotalCredits(quote)} créditos</strong> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "accepted", "Propuesta aceptada. Se retendrán los créditos.")}>
                    Aceptar propuesta
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "rejected", "Propuesta rechazada.")}>
                    Rechazar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "customer_counteroffer", "El cliente pidió ajuste.")}>
                    Pedir ajuste
                  </button>
                </div>
              </article>
            ))}
            {!quoteAgreements.length ? (
              <EmptyState
                eyebrow="Piloto sin actividad"
                title="Aun no tienes cotizaciones activas."
                text="Cuando solicites un especialista o aceptes una propuesta, el seguimiento aparecera aqui."
                action={<Link className="btn-secondary" href="/especialistas">Buscar especialistas</Link>}
              />
            ) : null}
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="eyebrow">Adicionales por aprobar</p>
              <h3 className="text-xl font-black text-emerald-950">Este adicional no se cobrara sin tu aprobacion.</h3>
            </div>
            {additionalRequests.map((additional) => {
              const needsPayment = additionalNeedsPayment(additional, paymentWallet?.currentBalance ?? balance);
              return (
                <article key={additional.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{additionalTypeLabels[additional.type]}</strong>
                    <span className="chip bg-brand-soft text-brand-dark">{additional.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">{additional.specialistName} · {additional.requestedCredits} créditos</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{additional.description}. El cobro adicional requiere tu aprobacion.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <MiniMetric label="Motivo" value={additional.reason} />
                    <MiniMetric label="Comprobante" value={additional.photoName ?? additional.receiptName ?? "Opcional"} />
                  </div>
                  {needsPayment ? <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-black text-amber-900">Saldo insuficiente: compra créditos, activa Club Hogar o paga la diferencia.</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "approved", "Adicional aprobado por cliente.")}>
                      Aprobar adicional
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "rejected", "Adicional rechazado por cliente.")}>
                      Rechazar
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "clarification_requested", "Cliente pidió aclaración.")}>
                      Pedir aclaración
                    </button>
                  </div>
                </article>
              );
            })}
            {!additionalRequests.length ? (
              <EmptyState
                eyebrow="Sin adicionales"
                title="No hay cobros extra por aprobar."
                text="En el piloto, cualquier adicional quedara visible aqui antes de que se retengan mas creditos."
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Reputacion</p>
            <h2 className="text-2xl font-black">Servicios por calificar</h2>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">{completed.length} completados</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {completed.length ? completed.slice(0, 4).map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-line bg-slate-50 p-4">
              <strong>{booking.service}</strong>
              <p className="mt-1 text-sm font-bold text-muted">{booking.specialistName} · {booking.commune} · {booking.date}</p>
              <button className="btn-secondary mt-3" type="button">
                Calificar servicio
              </button>
            </article>
          )) : (
            <div className="md:col-span-2">
              <EmptyState
                eyebrow="Sin actividad"
                title="Aun no tienes servicios por calificar."
                text="Cuando completes un servicio, podras calificarlo y ayudar a construir reputacion verificada."
              />
            </div>
          )}
        </div>
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
          {demoDataEnabled ? (
            <button
              className="btn-secondary mt-4"
              type="button"
              onClick={() => {
                setReferrals(simulateAcceptedClientReferral());
                setBalance(getWallet().balance);
                setTransactions(getTransactions());
              }}
            >
              Registrar referido aceptado
            </button>
          ) : null}
        </article>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">Especialistas cerca de ti</h2>
        <p className="mb-5 text-sm font-semibold leading-6 text-muted">
          Usamos tu comuna y coordenadas privadas para ordenar resultados. Tu dirección exacta no se publica.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {nearbySpecialists.map((specialist) => (
            <Link key={specialist.id} href="/especialistas" className="rounded-2xl border border-line bg-slate-50 p-4 transition hover:-translate-y-1 hover:shadow-card">
              <strong>{specialist.name}</strong>
              <span className="block text-sm font-bold text-muted">
                {specialist.specialty} · {specialist.zone} · {specialist.distance} km
              </span>
            </Link>
          ))}
          {!nearbySpecialists.length ? (
            <div className="md:col-span-3">
              <EmptyState eyebrow="Sin especialistas reales" title="Aun no hay especialistas cercanos guardados." text="Cuando se publiquen perfiles reales, apareceran aqui ordenados por comuna y distancia." />
            </div>
          ) : null}
        </div>
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
              <SpecialistProfileImage
                src={specialist.image}
                name={specialist.name}
                specialty={specialist.specialty}
                serviceTypeId={specialist.serviceTypeId}
                category={specialist.category}
                alt={specialist.name}
                className="h-44 w-full rounded-none"
              />
              <div className="p-4">
                <strong>{specialist.name}</strong>
                <span className="block text-sm font-bold text-muted">
                  {specialist.specialty} · {specialist.rating.toFixed(1)}/5 · {specialist.credits} créditos
                </span>
              </div>
            </Link>
          ))}
          {!favorites.length ? (
            <div className="md:col-span-3">
              <EmptyState eyebrow="Sin favoritos reales" title="Aun no hay tecnicos favoritos." text="Tus favoritos apareceran aqui cuando guardes especialistas reales." />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function SpecialistDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const demoDataEnabled = shouldShowDemoData();
  const specialist = demoDataEnabled ? specialists[0] : null;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [referrals, setReferrals] = useState<ReferralState | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [quotes, setQuotes] = useState<QuoteAgreement[]>([]);
  const [additionals, setAdditionals] = useState<AdditionalRequest[]>([]);
  const [virtualQuotes, setVirtualQuotes] = useState<VirtualQuoteRequest[]>([]);

  useEffect(() => {
    const session = getMockSession();
    if (!canAccess(session?.role, "specialist_dashboard", "read")) {
      setAuthorized(false);
      return;
    }
    setAuthorized(true);
    seedMockState();
    setBookings(specialist ? getBookings().filter((booking) => booking.specialistId === specialist.id) : []);
    setReferrals(getReferralState());
    setQuotes(getQuoteAgreements());
    setAdditionals(getAdditionalRequests());
    setVirtualQuotes(getVirtualQuoteRequests());
    setSubmittedNotice(new URLSearchParams(window.location.search).get("submitted") === "1");
  }, [specialist]);

  if (authorized === false) return <RoleGuardMessage />;
  if (authorized === null) return <RoleGuardMessage checking />;
  if (!specialist) {
    return (
      <EmptyState
        eyebrow="Sin perfil real"
        title="Aun no hay perfil especialista activo para esta sesion."
        text="Las reservas y cotizaciones apareceran aqui cuando el especialista tenga un perfil real publicado."
      />
    );
  }

  const earnedCredits = bookings.reduce((sum, booking) => sum + booking.credits, 0);

  function sendProposal(id: string) {
    updateQuoteAgreementStatus(id, "proposal_sent", "El especialista envió una propuesta.");
    setQuotes(getQuoteAgreements());
  }

  function requestPlatformReview(id: string) {
    updateQuoteAgreementStatus(id, "platform_review", "OficiosPro está revisando esta propuesta.");
    setQuotes(getQuoteAgreements());
  }

  function sendAdditional(id: string) {
    updateAdditionalRequestStatus(id, "pending_customer_approval", "El especialista solicitó adicional pendiente de aprobación.");
    setAdditionals(getAdditionalRequests());
  }

  function askVirtualInfo(id: string) {
    updateVirtualQuoteStatus(id, "necesita_mas_info", "El especialista pidio mas informacion antes de cotizar.");
    setVirtualQuotes(getVirtualQuoteRequests());
  }

  function sendVirtualOffer(id: string) {
    addVirtualQuoteOffer(id, {
      pricingMode: "range",
      minCredits: 18,
      maxCredits: 36,
      estimatedDuration: "Media jornada",
      materialsExcluded: "Materiales y repuestos se confirman antes de ejecutar.",
      conditions: "Cotizacion basada en los antecedentes enviados. Puede ajustarse si aparece una condicion no visible en fotos.",
      comment: "Puedo resolverlo con diagnostico virtual. Si apruebas, coordinamos horario para ejecutar.",
    });
    setVirtualQuotes(getVirtualQuoteRequests());
  }

  function recommendVirtualVisit(id: string) {
    addVirtualQuoteOffer(id, {
      pricingMode: "visit_then_quote",
      minCredits: 0,
      maxCredits: 0,
      estimatedDuration: "45 minutos",
      requiresVisit: true,
      conditions: "El caso requiere revisar en terreno antes de comprometer precio cerrado.",
      comment: "Recomiendo una visita tecnica para evitar cotizar con informacion incompleta.",
    });
    setVirtualQuotes(getVirtualQuoteRequests());
  }

  return (
    <div className="grid gap-6">
      {submittedNotice ? (
        <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">
          Tu perfil fue enviado para revisión.
        </div>
      ) : null}
      <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-6">
        <p className="eyebrow">Propósito del especialista</p>
        <h2 className="text-3xl font-black">Tu oficio merece visibilidad, confianza y mejores oportunidades.</h2>
        <p className="mt-3 max-w-3xl font-semibold leading-7 text-brand-dark">
          Cada trabajo bien hecho construye tu reputación. Mantén tu perfil actualizado, suma referencias y muestra evidencia real para destacar como especialista verificado.
        </p>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
          <SpecialistProfileImage
            src={specialist.image}
            name={specialist.name}
            specialty={specialist.specialty}
            serviceTypeId={specialist.serviceTypeId}
            category={specialist.category}
            alt={specialist.name}
            className="h-80 w-full rounded-none"
            fit="contain"
          />
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
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Diagnostico virtual</p>
            <h2 className="text-2xl font-black">Cotizaciones virtuales pendientes</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Revisa antecedentes enviados por clientes, pide mas informacion o propone creditos antes de una visita presencial.
            </p>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">{virtualQuotes.length} solicitudes</span>
        </div>
        {virtualQuotes.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {virtualQuotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <strong className="text-ink">{quote.serviceName ?? quote.problemTitle}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{quote.customerName ?? "Cliente OficiosPro"} · {quote.commune}</p>
                  </div>
                  <span className="chip bg-white text-brand-dark">{virtualQuoteStatusLabels[quote.status]}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">{quote.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <MiniMetric label="Urgencia" value={virtualQuoteUrgencyLabels[quote.urgency]} />
                  <MiniMetric label="Referencias" value={`${quote.attachmentCount}`} />
                  <MiniMetric label="Propuesta" value={quote.offer ? "Enviada" : "Pendiente"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => askVirtualInfo(quote.id)}>
                    Pedir mas info
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => recommendVirtualVisit(quote.id)}>
                    Recomendar visita
                  </button>
                  <button className="btn-primary" type="button" onClick={() => sendVirtualOffer(quote.id)}>
                    Enviar propuesta
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow="Sin diagnosticos virtuales"
            title="Aun no hay cotizaciones virtuales pendientes."
            text="Cuando un cliente envie fotos o antecedentes desde la bolsa, apareceran aqui para responder antes de agendar visita."
          />
        )}
      </section>
      <section className="panel">
        <div className="mb-5">
          <p className="eyebrow">Propuesta y acuerdo</p>
          <h2 className="text-2xl font-black">Propuestas y adicionales</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">
            Usa un flujo estructurado: propuesta, contraoferta, revisión OficiosPro y aprobación del cliente antes de cobrar adicionales.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            {quotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{quote.serviceName}</strong>
                  <span className="chip bg-white text-brand-dark">{quoteStatusLabels[quote.status]}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{quote.customerName} · {quote.commune}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{quote.proposal?.description ?? quote.originalRequest}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <MiniMetric label="Total cliente" value={`${quoteTotalCredits(quote) || "por definir"} cr`} />
                  <MiniMetric label="Pago estimado" value={`${quote.proposal?.specialistPayoutCredits ?? "pendiente"} cr`} />
                  <MiniMetric label="Margen" value={`${quote.proposal?.platformMarginCredits ?? "pendiente"} cr`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => sendProposal(quote.id)}>
                    Enviar propuesta
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => requestPlatformReview(quote.id)}>
                    Pedir revisión OficiosPro
                  </button>
                </div>
              </article>
            ))}
            {!quotes.length ? (
              <EmptyState
                eyebrow="Piloto sin solicitudes"
                title="Aun no tienes propuestas pendientes."
                text="Cuando llegue una solicitud real del piloto, podras preparar propuesta, pedir revision OficiosPro o marcar adicionales desde aqui."
              />
            ) : null}
          </div>
          <div className="grid gap-3">
            <article className="rounded-2xl border border-brand/15 bg-brand-soft p-4">
              <p className="eyebrow">Solicitar adicional</p>
              <h3 className="text-xl font-black">Todo adicional queda pendiente de aprobacion del cliente.</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="field">
                  Tipo
                  <select defaultValue="materials">
                    <option value="materials">Materiales</option>
                    <option value="additional_labor">Mano de obra adicional</option>
                    <option value="spare_parts">Repuesto</option>
                    <option value="additional_hours">Horas extra</option>
                    <option value="other">Otro</option>
                  </select>
                </label>
                <label className="field">
                  Creditos solicitados
                  <input type="number" defaultValue={10} min={2} step={2} />
                </label>
                <label className="field sm:col-span-2">
                  Descripcion y motivo
                  <textarea placeholder="Explica que cambia, por que se necesita y que evidencia adjuntas." />
                </label>
                <label className="field sm:col-span-2">
                  Foto opcional
                  <input type="text" placeholder="Nombre o link del comprobante" />
                </label>
              </div>
            </article>
            {additionals.map((additional) => (
              <article key={additional.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{additionalTypeLabels[additional.type]}</strong>
                  <span className="chip bg-brand-soft text-brand-dark">{additional.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{additional.customerName} · {additional.requestedCredits} créditos</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{additional.reason}</p>
                <button className="btn-secondary mt-3" type="button" onClick={() => sendAdditional(additional.id)}>
                  Solicitar adicional
                </button>
              </article>
            ))}
            {!additionals.length ? (
              <EmptyState
                eyebrow="Sin adicionales"
                title="No hay adicionales solicitados."
                text="Usa esta seccion cuando un trabajo requiera materiales, horas o repuestos aprobados por el cliente."
              />
            ) : null}
          </div>
        </div>
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
          {demoDataEnabled ? (
            <button className="btn-secondary" type="button" onClick={() => setReferrals(simulateAcceptedSpecialistReferral())}>
              Marcar referido aprobado
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function CompanyDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const demoDataEnabled = shouldShowDemoData();
  const corporateTransactions = demoDataEnabled ? [
    { id: "ctx-001", type: "Carga corporativa", detail: "Plan Empresa mensual", amount: 200, date: "2026-06-01" },
    { id: "ctx-002", type: "Servicio", detail: "Técnico HVAC Quilicura", amount: -55, date: "2026-06-02" },
    { id: "ctx-003", type: "Servicio", detail: "Electricista Vitacura", amount: -42, date: "2026-06-01" },
  ] : [];
  const companyMetrics = demoDataEnabled
    ? companyDashboard
    : {
        creditsAvailable: 0,
        creditsUsed: 0,
        responseTime: "Sin datos",
        activeBranches: 0,
        monthlyBilling: "$0",
        suppliers: 0,
        openRequests: 0,
        services: [],
        branches: [],
      };

  useEffect(() => {
    const session = getMockSession();
    setAuthorized(canAccess(session?.role, "company_dashboard", "read"));
  }, []);

  if (authorized === false) return <RoleGuardMessage />;
  if (authorized === null) return <RoleGuardMessage checking />;

  return (
    <div className="grid gap-6">
      <section className="enterprise-shell p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricDark label="Créditos corporativos" value={companyMetrics.creditsAvailable.toString()} />
          <MetricDark label="Usados este mes" value={companyMetrics.creditsUsed.toString()} />
          <MetricDark label="Respuesta promedio" value={companyMetrics.responseTime} />
          <MetricDark label="Sucursales activas" value={companyMetrics.activeBranches.toString()} />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <StatCard label="Gasto mensual" value={companyMetrics.monthlyBilling} />
        <StatCard label="Solicitudes abiertas" value={companyMetrics.openRequests.toString()} />
        <StatCard label="Proveedores frecuentes" value={companyMetrics.suppliers.toString()} />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">Servicios solicitados</h2>
          <div className="grid gap-3">
            {companyMetrics.services.map((service) => (
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
            {!companyMetrics.services.length ? (
              <EmptyState
                eyebrow="Sin actividad"
                title="Aun no hay servicios corporativos."
                text="Las solicitudes de empresas piloto apareceran aqui cuando el equipo active la cuenta y cargue sus mantenciones."
              />
            ) : null}
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
          {companyMetrics.branches.map((branch) => (
            <span key={branch} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
              {branch}
            </span>
          ))}
          {!companyMetrics.branches.length ? (
            <div className="md:col-span-5">
              <EmptyState eyebrow="Sin sucursales" title="Aun no hay sedes cargadas." text="Durante el piloto, OficiosPro puede ayudarte a ordenar sedes y centros de costo antes de activar solicitudes recurrentes." />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <DashboardMetricCard label={label} value={value} />;
}

function MetricDark({ label, value }: { label: string; value: string }) {
  return <DashboardMetricCard label={label} value={value} tone="dark" />;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <DashboardMetricCard label={label} value={value} compact />;
}

function RoleGuardMessage({ checking = false }: { checking?: boolean }) {
  return (
    <section className="panel">
      <p className="eyebrow">Acceso protegido</p>
      <h2 className="text-3xl font-black">{checking ? "Validando sesión..." : "No autorizado"}</h2>
      <p className="mt-3 font-semibold leading-7 text-muted">
        {checking ? "Estamos revisando el rol de tu sesión." : "Inicia sesión con el rol correcto para ver este dashboard."}
      </p>
      {!checking ? (
        <Link className="btn-primary mt-6" href="/login">
          Ir al login
        </Link>
      ) : null}
    </section>
  );
}
