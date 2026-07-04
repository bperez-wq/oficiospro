"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditExplainer } from "@/components/CreditExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { FormalizationAndPayoutPanel } from "@/components/FormalizationAndPayoutPanel";
import { SpecialistPassportChecklist } from "@/components/SpecialistPassportChecklist";
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
  const { t } = useI18n();
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
          <p className="eyebrow text-teal-200">{t("dashboard.client.clubEyebrow")}</p>
          <h2 className="text-4xl font-black">{balance} {t("dashboard.client.creditsAvailable")}</h2>
          <p className="mt-3 font-semibold leading-7 text-white/75">{t("dashboard.client.creditsIntro")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricDark label={t("dashboard.client.metricUpcoming")} value={upcoming.length.toString()} />
            <MetricDark label={t("dashboard.client.metricCompleted")} value={completed.length.toString()} />
            <MetricDark label={t("dashboard.client.metricFavorites")} value={favorites.length.toString()} />
          </div>
        </article>
        <article className="panel">
          <h2 className="text-2xl font-black">{t("dashboard.client.quickActions")}</h2>
          <div className="mt-5 grid gap-3">
            <ConversionButton type="consulta_general" sourceButton="Reservar especialista dashboard cliente" className="btn-primary">
              {t("dashboard.client.reserveSpecialist")}
            </ConversionButton>
            <ConversionButton type="lead_cliente" sourceButton="Ver planes Club Hogar dashboard" className="btn-secondary">
              {t("dashboard.client.viewPlans")}
            </ConversionButton>
            <Link className="btn-ghost" href="/registro-cliente">
              {t("dashboard.client.updateData")}
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
            <p className="eyebrow">{t("dashboard.client.quotesEyebrow")}</p>
            <h2 className="text-2xl font-black">{t("dashboard.client.quotesTitle")}</h2>
          </div>
          <Link className="btn-secondary" href="/checkout?mode=credits_purchase">
            {t("dashboard.client.buyCredits")}
          </Link>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <StatCard label={t("dashboard.client.statAvailable")} value={`${paymentWallet?.currentBalance ?? balance}`} />
          <StatCard label={t("dashboard.client.statHeld")} value={`${paymentWallet?.heldCredits ?? 0}`} />
          <StatCard label={t("dashboard.client.statExpiring")} value={`${paymentWallet?.expiringCreditsTotal ?? 0}`} />
          <StatCard label={t("dashboard.client.statInQuote")} value={`${(paymentWallet?.quoteHeldCredits ?? 0) + (paymentWallet?.additionalHeldCredits ?? 0)}`} />
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
                {quote.proposal ? <strong className="mt-2 block text-ink">{t("dashboard.client.totalProposal")} {quoteTotalCredits(quote)} {t("dashboard.common.credits")}</strong> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "accepted", t("dashboard.client.acceptMsg"))}>
                    {t("dashboard.client.acceptProposal")}
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "rejected", t("dashboard.client.rejectMsg"))}>
                    {t("dashboard.client.reject")}
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => changeQuote(quote.id, "customer_counteroffer", t("dashboard.client.adjustMsg"))}>
                    {t("dashboard.client.requestAdjust")}
                  </button>
                </div>
              </article>
            ))}
            {!quoteAgreements.length ? (
              <EmptyState
                eyebrow={t("dashboard.client.emptyQuotesEyebrow")}
                title={t("dashboard.client.emptyQuotesTitle")}
                text={t("dashboard.client.emptyQuotesText")}
                action={<Link className="btn-secondary" href="/especialistas">{t("dashboard.client.searchSpecialists")}</Link>}
              />
            ) : null}
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="eyebrow">{t("dashboard.client.additionalsEyebrow")}</p>
              <h3 className="text-xl font-black text-emerald-950">{t("dashboard.client.additionalsTitle")}</h3>
            </div>
            {additionalRequests.map((additional) => {
              const needsPayment = additionalNeedsPayment(additional, paymentWallet?.currentBalance ?? balance);
              return (
                <article key={additional.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{additionalTypeLabels[additional.type]}</strong>
                    <span className="chip bg-brand-soft text-brand-dark">{additional.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">{additional.specialistName} · {additional.requestedCredits} {t("dashboard.common.credits")}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{additional.description}. {t("dashboard.client.additionalChargeSuffix")}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <MiniMetric label={t("dashboard.client.miniReason")} value={additional.reason} />
                    <MiniMetric label={t("dashboard.client.miniReceipt")} value={additional.photoName ?? additional.receiptName ?? t("dashboard.client.optional")} />
                  </div>
                  {needsPayment ? <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-black text-amber-900">{t("dashboard.client.insufficientBalance")}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "approved", t("dashboard.client.approveMsg"))}>
                      {t("dashboard.client.approveAdditional")}
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "rejected", t("dashboard.client.rejectAddMsg"))}>
                      {t("dashboard.client.reject")}
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => changeAdditional(additional.id, "clarification_requested", t("dashboard.client.clarifyMsg"))}>
                      {t("dashboard.client.requestClarification")}
                    </button>
                  </div>
                </article>
              );
            })}
            {!additionalRequests.length ? (
              <EmptyState
                eyebrow={t("dashboard.client.emptyAddEyebrow")}
                title={t("dashboard.client.emptyAddTitle")}
                text={t("dashboard.client.emptyAddText")}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t("dashboard.client.reputationEyebrow")}</p>
            <h2 className="text-2xl font-black">{t("dashboard.client.toRateTitle")}</h2>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">{completed.length} {t("dashboard.client.completedChip")}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {completed.length ? completed.slice(0, 4).map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-line bg-slate-50 p-4">
              <strong>{booking.service}</strong>
              <p className="mt-1 text-sm font-bold text-muted">{booking.specialistName} · {booking.commune} · {booking.date}</p>
              <button className="btn-secondary mt-3" type="button">
                {t("dashboard.client.rateService")}
              </button>
            </article>
          )) : (
            <div className="md:col-span-2">
              <EmptyState
                eyebrow={t("dashboard.client.emptyRateEyebrow")}
                title={t("dashboard.client.emptyRateTitle")}
                text={t("dashboard.client.emptyRateText")}
              />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <p className="eyebrow">{t("dashboard.client.subscriptionEyebrow")}</p>
          <h2 className="text-2xl font-black">{subscription ? subscription.planName : t("dashboard.client.noPlan")}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            {subscription
              ? t("dashboard.client.subscriptionActive")
                  .replace("{renewal}", subscription.renewal)
                  .replace("{credits}", String(subscription.monthlyCredits))
                  .replace("{months}", String(subscription.accumulatesMonths))
              : t("dashboard.client.subscriptionCta")}
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">{t("dashboard.client.referralsEyebrow")}</p>
          <h2 className="text-2xl font-black">{referrals?.clientCode ?? "OP-CLIENTE-10"}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            {t("dashboard.client.referralsAccepted")
              .replace("{invitations}", String(referrals?.clientInvitations ?? 0))
              .replace("{earned}", String(referrals?.clientCreditsEarned ?? 0))}
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
              {t("dashboard.client.registerReferral")}
            </button>
          ) : null}
        </article>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">{t("dashboard.client.nearbyTitle")}</h2>
        <p className="mb-5 text-sm font-semibold leading-6 text-muted">
          {t("dashboard.client.nearbyIntro")}
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
              <EmptyState eyebrow={t("dashboard.client.emptyNearbyEyebrow")} title={t("dashboard.client.emptyNearbyTitle")} text={t("dashboard.client.emptyNearbyText")} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">{t("dashboard.client.upcomingTitle")}</h2>
          <BookingList bookings={upcoming} />
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">{t("dashboard.client.creditHistoryTitle")}</h2>
          <TransactionList transactions={transactions} />
        </article>
      </section>

      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">{t("dashboard.client.favTitle")}</h2>
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
                  {specialist.specialty} · {specialist.rating.toFixed(1)}/5 · {specialist.credits} {t("dashboard.common.credits")}
                </span>
              </div>
            </Link>
          ))}
          {!favorites.length ? (
            <div className="md:col-span-3">
              <EmptyState eyebrow={t("dashboard.client.emptyFavEyebrow")} title={t("dashboard.client.emptyFavTitle")} text={t("dashboard.client.emptyFavText")} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function SpecialistDashboard() {
  const { t, tList } = useI18n();
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
    // Sin datos demo igual mostramos el Pasaporte: un postulante real con su
    // postulación guardada en este dispositivo ve su avance y qué falta.
    return (
      <div className="grid gap-6">
        {submittedNotice ? (
          <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">
            {t("dashboard.specialist.profileSubmitted")}
          </div>
        ) : null}
        <SpecialistPassportChecklist />
        <EmptyState
          eyebrow={t("dashboard.specialist.noProfileEyebrow")}
          title={t("dashboard.specialist.noProfileTitle")}
          text={t("dashboard.specialist.noProfileText")}
        />
      </div>
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
      conditions: "Cotización basada en los antecedentes enviados. Puede ajustarse si aparece una condicion no visible en fotos.",
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
      comment: "Recomiendo una visita técnica para evitar cotizar con informacion incompleta.",
    });
    setVirtualQuotes(getVirtualQuoteRequests());
  }

  return (
    <div className="grid gap-6">
      {submittedNotice ? (
        <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">
          {t("dashboard.specialist.profileSubmitted")}
        </div>
      ) : null}
      <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-6">
        <p className="eyebrow">{t("dashboard.specialist.purposeEyebrow")}</p>
        <h2 className="text-3xl font-black">{t("dashboard.specialist.purposeTitle")}</h2>
        <p className="mt-3 max-w-3xl font-semibold leading-7 text-brand-dark">
          {t("dashboard.specialist.purposeText")}
        </p>
      </section>
      <SpecialistPassportChecklist />
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
                <p className="eyebrow">{t("dashboard.specialist.publicProfile")}</p>
                <h2 className="text-3xl font-black">{specialist.name}</h2>
                <p className="font-semibold text-muted">{specialist.specialty} {t("dashboard.specialist.in")} {specialist.zone}</p>
              </div>
              <span className="chip bg-brand-soft text-brand-dark">{t("dashboard.specialist.verificationActive")}</span>
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
          <StatCard label={t("dashboard.specialist.ratingLabel")} value={`${specialist.rating.toFixed(1)}/5`} />
          <StatCard label={t("dashboard.specialist.jobsCompleted")} value={specialist.jobs.toString()} />
          <StatCard label={t("dashboard.specialist.bookingsReceived")} value={bookings.length.toString()} />
          <StatCard label={t("dashboard.specialist.creditsEarned")} value={earnedCredits.toString()} />
        </aside>
      </section>
      <FormalizationAndPayoutPanel variant="specialist" />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">{t("dashboard.specialist.bookingsReceived")}</h2>
          <BookingList bookings={bookings} />
        </article>
        <article className="panel">
          <h2 className="text-2xl font-black">{t("dashboard.specialist.reputationStatusTitle")}</h2>
          <div className="mt-5 grid gap-3">
            {tList("dashboard.specialist.reputationItems").map((item) => (
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
            <p className="eyebrow">{t("dashboard.specialist.virtualEyebrow")}</p>
            <h2 className="text-2xl font-black">{t("dashboard.specialist.virtualTitle")}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              {t("dashboard.specialist.virtualIntro")}
            </p>
          </div>
          <span className="chip bg-brand-soft text-brand-dark">{virtualQuotes.length} {t("dashboard.specialist.requestsChip")}</span>
        </div>
        {virtualQuotes.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {virtualQuotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <strong className="text-ink">{quote.serviceName ?? quote.problemTitle}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{quote.customerName ?? t("dashboard.specialist.clientFallback")} · {quote.commune}</p>
                  </div>
                  <span className="chip bg-white text-brand-dark">{virtualQuoteStatusLabels[quote.status]}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">{quote.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <MiniMetric label={t("dashboard.specialist.miniUrgency")} value={virtualQuoteUrgencyLabels[quote.urgency]} />
                  <MiniMetric label={t("dashboard.specialist.miniReferences")} value={`${quote.attachmentCount}`} />
                  <MiniMetric label={t("dashboard.specialist.miniProposal")} value={quote.offer ? t("dashboard.specialist.sent") : t("dashboard.specialist.pending")} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => askVirtualInfo(quote.id)}>
                    {t("dashboard.specialist.askMoreInfo")}
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => recommendVirtualVisit(quote.id)}>
                    {t("dashboard.specialist.recommendVisit")}
                  </button>
                  <button className="btn-primary" type="button" onClick={() => sendVirtualOffer(quote.id)}>
                    {t("dashboard.specialist.sendProposal")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow={t("dashboard.specialist.emptyVirtualEyebrow")}
            title={t("dashboard.specialist.emptyVirtualTitle")}
            text={t("dashboard.specialist.emptyVirtualText")}
          />
        )}
      </section>
      <section className="panel">
        <div className="mb-5">
          <p className="eyebrow">{t("dashboard.specialist.proposalsEyebrow")}</p>
          <h2 className="text-2xl font-black">{t("dashboard.specialist.proposalsTitle")}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">
            {t("dashboard.specialist.proposalsIntro")}
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
                  <MiniMetric label={t("dashboard.specialist.miniTotalClient")} value={`${quoteTotalCredits(quote) || t("dashboard.specialist.toDefine")} cr`} />
                  <MiniMetric label={t("dashboard.specialist.miniEstimatedPay")} value={`${quote.proposal?.specialistPayoutCredits ?? t("dashboard.specialist.pendingShort")} cr`} />
                  <MiniMetric label={t("dashboard.specialist.miniCommission")} value={`${quote.proposal?.platformMarginCredits ?? t("dashboard.specialist.pendingShort")} cr`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => sendProposal(quote.id)}>
                    {t("dashboard.specialist.sendProposal")}
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => requestPlatformReview(quote.id)}>
                    {t("dashboard.specialist.requestReview")}
                  </button>
                </div>
              </article>
            ))}
            {!quotes.length ? (
              <EmptyState
                eyebrow={t("dashboard.specialist.emptyProposalsEyebrow")}
                title={t("dashboard.specialist.emptyProposalsTitle")}
                text={t("dashboard.specialist.emptyProposalsText")}
              />
            ) : null}
          </div>
          <div className="grid gap-3">
            <article className="rounded-2xl border border-brand/15 bg-brand-soft p-4">
              <p className="eyebrow">{t("dashboard.specialist.requestAdditionalEyebrow")}</p>
              <h3 className="text-xl font-black">{t("dashboard.specialist.requestAdditionalTitle")}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="field">
                  {t("dashboard.specialist.typeLabel")}
                  <select defaultValue="materials">
                    <option value="materials">{t("dashboard.specialist.typeMaterials")}</option>
                    <option value="additional_labor">{t("dashboard.specialist.typeLabor")}</option>
                    <option value="spare_parts">{t("dashboard.specialist.typeSpare")}</option>
                    <option value="additional_hours">{t("dashboard.specialist.typeHours")}</option>
                    <option value="other">{t("dashboard.specialist.typeOther")}</option>
                  </select>
                </label>
                <label className="field">
                  {t("dashboard.specialist.requestedCredits")}
                  <input type="number" defaultValue={10} min={2} step={2} />
                </label>
                <label className="field sm:col-span-2">
                  {t("dashboard.specialist.descAndReason")}
                  <textarea placeholder={t("dashboard.specialist.descPlaceholder")} />
                </label>
                <label className="field sm:col-span-2">
                  {t("dashboard.specialist.optionalPhoto")}
                  <input type="text" placeholder={t("dashboard.specialist.optionalPhotoPh")} />
                </label>
              </div>
            </article>
            {additionals.map((additional) => (
              <article key={additional.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{additionalTypeLabels[additional.type]}</strong>
                  <span className="chip bg-brand-soft text-brand-dark">{additional.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{additional.customerName} · {additional.requestedCredits} {t("dashboard.common.credits")}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{additional.reason}</p>
                <button className="btn-secondary mt-3" type="button" onClick={() => sendAdditional(additional.id)}>
                  {t("dashboard.specialist.requestAdditional")}
                </button>
              </article>
            ))}
            {!additionals.length ? (
              <EmptyState
                eyebrow={t("dashboard.client.emptyAddEyebrow")}
                title={t("dashboard.specialist.emptyAddSpecTitle")}
                text={t("dashboard.specialist.emptyAddSpecText")}
              />
            ) : null}
          </div>
        </div>
      </section>
      <section className="panel">
        <p className="eyebrow">{t("dashboard.specialist.referralsSpecEyebrow")}</p>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-black">{referrals?.specialistCode ?? "OP-FUNDADOR"}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              {t("dashboard.specialist.approvedInvitations")
                .replace("{invitations}", String(referrals?.specialistInvitations ?? 0))
                .replace("{benefit}", referrals?.specialistBenefit ?? t("dashboard.specialist.defaultBenefit"))}
            </p>
          </div>
          {demoDataEnabled ? (
            <button className="btn-secondary" type="button" onClick={() => setReferrals(simulateAcceptedSpecialistReferral())}>
              {t("dashboard.specialist.markReferralApproved")}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function CompanyDashboard() {
  const { t } = useI18n();
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
        responseTime: t("dashboard.company.noData"),
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
          <MetricDark label={t("dashboard.company.metricCorpCredits")} value={companyMetrics.creditsAvailable.toString()} />
          <MetricDark label={t("dashboard.company.metricUsedMonth")} value={companyMetrics.creditsUsed.toString()} />
          <MetricDark label={t("dashboard.company.metricAvgResponse")} value={companyMetrics.responseTime} />
          <MetricDark label={t("dashboard.company.metricActiveBranches")} value={companyMetrics.activeBranches.toString()} />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <StatCard label={t("dashboard.company.statMonthlySpend")} value={companyMetrics.monthlyBilling} />
        <StatCard label={t("dashboard.company.statOpenRequests")} value={companyMetrics.openRequests.toString()} />
        <StatCard label={t("dashboard.company.statSuppliers")} value={companyMetrics.suppliers.toString()} />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">{t("dashboard.company.requestedServicesTitle")}</h2>
          <div className="grid gap-3">
            {companyMetrics.services.map((service) => (
              <article key={`${service.service}-${service.branch}`} className="flex justify-between rounded-2xl border border-line bg-slate-50 p-4">
                <div>
                  <strong>{service.service}</strong>
                  <span className="block text-sm font-bold text-muted">
                    {service.branch} · {service.status}
                  </span>
                </div>
                <strong>{service.credits} {t("dashboard.common.credits")}</strong>
              </article>
            ))}
            {!companyMetrics.services.length ? (
              <EmptyState
                eyebrow={t("dashboard.company.emptyServicesEyebrow")}
                title={t("dashboard.company.emptyServicesTitle")}
                text={t("dashboard.company.emptyServicesText")}
              />
            ) : null}
          </div>
        </article>
        <article className="panel">
          <h2 className="mb-4 text-2xl font-black">{t("dashboard.company.creditMovementsTitle")}</h2>
          <TransactionList transactions={corporateTransactions} />
        </article>
      </section>
      <section className="panel">
        <h2 className="mb-4 text-2xl font-black">{t("dashboard.company.branchesTitle")}</h2>
        <div className="grid gap-3 md:grid-cols-5">
          {companyMetrics.branches.map((branch) => (
            <span key={branch} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
              {branch}
            </span>
          ))}
          {!companyMetrics.branches.length ? (
            <div className="md:col-span-5">
              <EmptyState eyebrow={t("dashboard.company.emptyBranchesEyebrow")} title={t("dashboard.company.emptyBranchesTitle")} text={t("dashboard.company.emptyBranchesText")} />
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
  const { t } = useI18n();
  return (
    <section className="panel">
      <p className="eyebrow">{t("dashboard.guard.eyebrow")}</p>
      <h2 className="text-3xl font-black">{checking ? t("dashboard.guard.validating") : t("dashboard.guard.unauthorized")}</h2>
      <p className="mt-3 font-semibold leading-7 text-muted">
        {checking ? t("dashboard.guard.checkingText") : t("dashboard.guard.unauthorizedText")}
      </p>
      {!checking ? (
        <Link className="btn-primary mt-6" href="/login">
          {t("dashboard.guard.goLogin")}
        </Link>
      ) : null}
    </section>
  );
}
