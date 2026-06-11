"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingDrawer } from "@/components/BookingDrawer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard } from "@/components/DesignSystem";
import { SpecialistProfileAvailability } from "@/components/SpecialistProfileAvailability";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { availabilityLabels, type Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";
import { addSpecialistToBagAndProceed, bagActionLabel } from "@/lib/bag";
import { bookingPrimaryAction, formatDurationRange, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getSpecialistBySlugOrId, seedMockState } from "@/lib/storage";
import { getReviewStats, getServiceCreditPair, getSpecialistLevel, getSpecialistReviews, getTrustBadges } from "@/lib/trust";

type LookupDiagnostics = {
  searched: string;
  sources: string[];
  availableCount: number;
};

export function SpecialistProfileFromQuery() {
  const params = useSearchParams();
  return <SpecialistPublicProfile id={params.get("id") ?? ""} />;
}

export function SpecialistPublicProfile({ id, initialSpecialist = null }: { id: string; initialSpecialist?: Specialist | null }) {
  const [specialist, setSpecialist] = useState<Specialist | null>(initialSpecialist);
  const [loaded, setLoaded] = useState(Boolean(initialSpecialist));
  const [diagnostics, setDiagnostics] = useState<LookupDiagnostics>({ searched: id, sources: [], availableCount: 0 });

  useEffect(() => {
    const pathId = window.location.pathname.split("/").filter(Boolean).at(-1) ?? id;
    const requestedId = id || pathId;
    if (initialSpecialist && (initialSpecialist.id === requestedId || initialSpecialist.slug === requestedId || initialSpecialist.id === pathId || initialSpecialist.slug === pathId)) return;
    let cancelled = false;
    seedMockState();

    async function load() {
      const remoteSpecialists = await fetch("/api/specialists")
        .then((response) => response.json())
        .then((data: { specialists?: Specialist[] }) => (Array.isArray(data.specialists) ? data.specialists : []))
        .catch(() => [] as Specialist[]);
      const result = getSpecialistBySlugOrId(requestedId, remoteSpecialists);
      if (cancelled) return;
      setSpecialist(result.specialist);
      setDiagnostics(result.diagnostics);
      setLoaded(true);
      if (!result.specialist) {
        console.warn("OficiosPro specialist lookup failed", result.diagnostics);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, initialSpecialist]);

  if (!loaded) return <section>Cargando perfil...</section>;

  if (!specialist) {
    return (
      <section className="grid gap-6">
        <section className="rounded-[32px] border border-line bg-white p-8 shadow-soft">
          <p className="eyebrow">Perfil no encontrado</p>
          <h1 className="mt-3 text-4xl font-black text-ink">No encontramos este especialista.</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/especialistas">Volver a especialistas</Link>
            <Link className="btn-secondary" href="/especialistas">Ver todos los especialistas</Link>
            <Link className="btn-primary" href="/contacto">Solicitar ayuda</Link>
          </div>
        </section>
      </section>
    );
  }

  return <SpecialistProfileView specialist={specialist} />;
}

export function SpecialistProfileView({ specialist }: { specialist: Specialist }) {
  const primaryService = useMemo(() => getPrimaryFlexibleService(specialist), [specialist]);
  const services = useMemo(() => {
    const activeServices = specialist.servicePricing?.filter((service) => service.active !== false) ?? [];
    return activeServices.length ? activeServices : [primaryService];
  }, [primaryService, specialist.servicePricing]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(primaryService.id);
  const specialistReviews = useMemo(() => getSpecialistReviews(specialist), [specialist]);
  const reviewStats = useMemo(() => getReviewStats(specialistReviews), [specialistReviews]);
  const level = useMemo(() => getSpecialistLevel(specialist), [specialist]);
  const trustBadges = useMemo(() => getTrustBadges(specialist), [specialist]);
  const creditPair = useMemo(() => getServiceCreditPair(primaryService, specialist.credits), [primaryService, specialist.credits]);
  const relatedHelp = useMemo(
    () => Array.from(new Set([...(specialist.servicesOffered ?? []), ...(specialist.specialties ?? []), ...services.map((service) => service.name), ...services.map((service) => service.specialty)].filter(Boolean))),
    [services, specialist.servicesOffered, specialist.specialties],
  );

  function openBookingForService(service: FlexibleService) {
    preserveSpecialistIntent({ specialist, service, intendedAction: "reservar", source: "SpecialistPublicProfile" });
    setSelectedServiceId(service.id);
    setBookingOpen(true);
  }

  return (
    <>
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
        <div className="relative h-[460px]">
          <img src={specialist.image} alt={specialist.name} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-6 text-white">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-xl font-black text-white shadow-lg">{specialist.initials}</span>
                <div>
                  <p className="font-black text-white/80">{specialist.name}</p>
                  <h2 className="text-3xl font-black">{specialist.specialty}</h2>
                  <p className="font-bold text-white/80">{specialist.commune ?? specialist.zone}</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-dark">{availabilityLabels[specialist.availability]}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <DashboardMetricCard label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
            <DashboardMetricCard label="Trabajos" value={(specialist.trabajosCompletados ?? specialist.jobs).toString()} />
            <DashboardMetricCard label="Respuesta" value={specialist.responseTime} />
            <DashboardMetricCard label="Precio desde" value={`${specialist.precioDesdeCreditos ?? specialist.credits} créditos`} tone="brand" />
          </div>
          <section className="rounded-[24px] border border-brand/15 bg-brand-soft p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">Reputacion destacada</p>
                <h2 className="text-2xl font-black">Nivel {level} con {reviewStats.verifiedTotal} opiniones verificadas</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-brand-dark">
                  Ranking basado en trabajos completados, respuesta, referencias y calificaciones de clientes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trustBadges.map((badge) => (
                    <span key={badge} className="chip bg-white text-brand-dark">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="grid min-w-64 gap-2 rounded-2xl bg-white p-4">
                <ReputationMetric label="General" value={`${reviewStats.average || specialist.rating.toFixed(1)}/5`} />
                <ReputationMetric label="Puntualidad" value={`${reviewStats.punctuality || specialist.rating.toFixed(1)}/5`} />
                <ReputationMetric label="Calidad" value={`${reviewStats.quality || specialist.rating.toFixed(1)}/5`} />
                <ReputationMetric label="Comunicacion" value={`${reviewStats.communication || specialist.rating.toFixed(1)}/5`} />
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Servicios y creditos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <article key={service.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink">{service.name}</strong>
                    <span className="chip bg-white text-brand-dark">{pricingModeLabel(service.pricingMode)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">{service.description}</p>
                  <strong className="mt-3 block text-lg font-black text-ink">{pricingSummary(service)}</strong>
                  <p className="mt-1 text-sm font-bold text-muted">{formatDurationRange(service)}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{pricingDetail(service)}</p>
                  <button className="btn-primary mt-4 w-full" type="button" onClick={() => openBookingForService(service)}>
                    Solicitar este servicio
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Tambien puede ayudarte con</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedHelp.map((item) => (
                <span key={item} className="chip bg-brand-soft text-brand-dark">{item}</span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Referencias verificadas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: Math.max(1, specialist.validation?.references ?? 0) }).slice(0, 3).map((_, index) => (
                <div key={index} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
                  Referencia verificada {index + 1}
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Historial de trabajos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {specialist.workHistory.slice(0, 3).map((work) => (
                <article key={`${work.title}-${work.commune}`} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  <img src={work.image} alt={work.title} className="h-32 w-full object-cover" />
                  <div className="p-4">
                    <strong className="text-ink">{work.title}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{work.commune} · {work.credits} creditos · {work.rating}/5</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Portafolio y especialidades</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="grid gap-3 sm:grid-cols-3">
                {(specialist.galleryImages.length ? specialist.galleryImages : specialist.gallery).slice(0, 3).map((image) => (
                  <img key={image} src={image} alt={`Trabajo de ${specialist.name}`} className="h-36 w-full rounded-2xl object-cover" />
                ))}
              </div>
              <div className="rounded-2xl border border-line bg-slate-50 p-4">
                <h3 className="text-lg font-black">Especialidades</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(specialist.specialties?.length ? specialist.specialties : specialist.servicesOffered).map((item) => (
                    <span key={item} className="chip bg-white text-brand-dark">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
              <p className="eyebrow">Reviews</p>
              <h2 className="text-2xl font-black">{reviewStats.total} comentarios de clientes</h2>
              <div className="mt-4 grid gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <DistributionBar key={rating} rating={rating} count={reviewStats.distribution[rating as 1 | 2 | 3 | 4 | 5]} total={reviewStats.total} />
                ))}
              </div>
            </article>
            <article className="grid gap-3">
              {specialistReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{review.customerName}</strong>
                    <span className="chip bg-white text-brand-dark">{review.ratingGeneral}/5</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">{review.serviceName} · {review.comuna} · {review.date}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{review.comment}</p>
                  {review.verifiedService ? <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">Opinion verificada</span> : null}
                </div>
              ))}
            </article>
          </section>
          <section className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
            <p className="eyebrow">Proteccion OficiosPro</p>
            <h2 className="text-2xl font-black">Todo cobro adicional requiere aprobacion del cliente.</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Tus creditos se retienen hasta confirmar avance.", "El especialista es revisado antes de publicarse.", "Puedes calificar despues del servicio.", "Los adicionales requieren aprobacion."].map((item) => (
                <span key={item} className="rounded-2xl bg-white p-4 text-sm font-black text-emerald-950">{item}</span>
              ))}
            </div>
          </section>
          <SpecialistFaq />
        </div>
      </article>
      <aside className="grid gap-5 self-start lg:sticky lg:top-28">
        <article className="panel">
          <span className="font-bold text-muted">Precio desde</span>
          <strong className="block text-4xl font-black">{pricingSummary(primaryService)}</strong>
          <div className="mt-4 grid gap-2">
            <span className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">Normal: {creditPair.baseCredits} creditos</span>
            <span className="rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">Club Hogar: {creditPair.clubCredits} creditos</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">{pricingDetail(primaryService)}</p>
          <button className="btn-primary mt-5 w-full" type="button" onClick={() => openBookingForService(primaryService)}>
            Reservar
          </button>
          <ConversionButton type="reserva_especialista" sourceButton="Consultar disponibilidad especialista" specialist={specialist} className="btn-secondary mt-3 w-full">
            Consultar disponibilidad
          </ConversionButton>
        </article>
        <article className="panel">
          <h3 className="text-xl font-black">Cobertura</h3>
          <div className="mt-4 grid gap-2 text-sm font-bold text-muted">
            <span className="rounded-2xl bg-slate-50 p-3">Comuna base: {specialist.commune ?? specialist.zone}</span>
            <span className="rounded-2xl bg-slate-50 p-3">Radio aproximado: {specialist.coverageRadiusKm ?? 0} km</span>
          </div>
        </article>
        <article className="panel">
          <h3 className="text-xl font-black">Certificaciones</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(specialist.certifications.length ? specialist.certifications : ["Validación OficiosPro"]).map((item) => <span key={item} className="chip bg-brand-soft text-brand-dark">{item}</span>)}
          </div>
        </article>
        <SpecialistProfileAvailability specialist={specialist} />
      </aside>
    </section>
    <BookingDrawer
      specialist={specialist}
      open={bookingOpen}
      initialSelectedServiceId={selectedServiceId}
      onClose={() => setBookingOpen(false)}
    />
    <StickyMobileCTA>
      <button className="btn-primary min-h-11 flex-1 px-3 text-sm" type="button" onClick={() => openBookingForService(primaryService)}>
        {bagActionLabel(primaryService.pricingMode)}
      </button>
      <button
        className="btn-secondary min-h-11 flex-1 px-3 text-sm"
        type="button"
        data-event="profile_add_to_bag"
        onClick={() => addSpecialistToBagAndProceed({ specialist, service: primaryService, sourceSection: "specialist_profile", proceed: "page" })}
      >
        Agregar a Bolsa
      </button>
    </StickyMobileCTA>
    </>
  );
}

function ReputationMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-black text-muted">{label}</span>
      <strong className="text-ink">{value}</strong>
    </div>
  );
}

function DistributionBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const width = total ? `${Math.round((count / total) * 100)}%` : "0%";
  return (
    <div className="grid grid-cols-[70px_1fr_36px] items-center gap-3 text-sm font-black text-muted">
      <span>{rating} estrellas</span>
      <span className="h-3 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-brand" style={{ width }} />
      </span>
      <span className="text-right">{count}</span>
    </div>
  );
}

function SpecialistFaq() {
  const faqs = [
    ["La visita tiene costo?", "Depende del servicio. Si hay visita tecnica, los creditos se informan antes de reservar."],
    ["Que pasa si se necesitan materiales?", "El especialista debe pedir un adicional y tu lo apruebas antes de cualquier cobro."],
    ["Puedo aprobar un adicional antes de pagarlo?", "Si. Todo adicional requiere aprobacion del cliente."],
    ["Como se usan los creditos?", "Se retienen al reservar y se liberan cuando el servicio avanza o queda cerrado."],
    ["Puedo calificar al especialista?", "Si. Despues del servicio completado puedes dejar una opinion verificada."],
    ["Que pasa si el especialista no llega?", "OficiosPro revisa el caso y mantiene los creditos protegidos mientras se resuelve."],
  ];

  return (
    <section className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <p className="eyebrow">Preguntas frecuentes</p>
      <h2 className="text-2xl font-black">Antes de reservar</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <article key={question} className="rounded-2xl border border-line bg-slate-50 p-4">
            <strong className="text-ink">{question}</strong>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
