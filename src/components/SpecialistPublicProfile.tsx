"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingDrawer } from "@/components/BookingDrawer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard } from "@/components/DesignSystem";
import { SpecialistProfileImage } from "@/components/SpecialistProfileImage";
import { SpecialistProfileAvailability } from "@/components/SpecialistProfileAvailability";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { availabilityLabels, type Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";
import { addSpecialistToBagAndProceed, bagActionLabel } from "@/lib/bag";
import { bookingPrimaryAction, formatDurationRange, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { DEMO_PROFILE_BADGE, DEMO_PROFILE_NOTICE, isDemoSpecialist } from "@/lib/specialists/demoProfile";
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

  if (!loaded) return <ProfileLoadingSkeleton />;

  if (!specialist) {
    return (
      <section className="grid gap-6">
        <section className="rounded-[32px] border border-line bg-white p-8 shadow-soft md:p-10">
          <p className="eyebrow">Perfil no disponible</p>
          <h1 className="mt-3 text-3xl font-black text-ink md:text-4xl">Este perfil ya no está disponible.</h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-muted">
            Puede que el especialista haya pausado su disponibilidad o que el enlace haya cambiado. No te quedes sin ayuda: explora otros especialistas verificados o déjanos tu solicitud y el equipo OficiosPro te orienta.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/especialistas">Ver especialistas verificados</Link>
            <Link className="btn-secondary" href="/especialistas?sourceSection=perfil_no_disponible">Dejar una solicitud</Link>
            <Link className="btn-secondary" href="/contacto">Hablar con el equipo</Link>
          </div>
          <p className="mt-5 text-xs font-bold text-muted">
            Revisamos cada solicitud de forma manual y te contactamos para coordinar el siguiente paso.
          </p>
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
  const isDemo = useMemo(() => isDemoSpecialist(specialist), [specialist]);
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
    {isDemo ? (
      <section className="mb-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-black text-amber-900">{DEMO_PROFILE_BADGE}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">{DEMO_PROFILE_NOTICE}</p>
      </section>
    ) : null}
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
        <div className="relative h-[460px]">
          <SpecialistProfileImage
            src={specialist.image}
            name={specialist.name}
            specialty={specialist.specialty}
            serviceTypeId={specialist.serviceTypeId}
            category={specialist.category}
            alt={specialist.name}
            className="h-full w-full rounded-none"
            fit="contain"
            loading="eager"
          />
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
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-dark">{isDemo ? DEMO_PROFILE_BADGE : availabilityLabels[specialist.availability]}</span>
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
                <h2 className="text-2xl font-black">
                  {reviewStats.verifiedTotal > 0
                    ? `Nivel ${level} con ${reviewStats.verifiedTotal} opiniones verificadas`
                    : `Nivel ${level} · reputación en construcción`}
                </h2>
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
                {reviewStats.punctuality > 0 ? <ReputationMetric label="Puntualidad" value={`${reviewStats.punctuality}/5`} /> : null}
                {reviewStats.quality > 0 ? <ReputationMetric label="Calidad" value={`${reviewStats.quality}/5`} /> : null}
                {reviewStats.communication > 0 ? <ReputationMetric label="Comunicacion" value={`${reviewStats.communication}/5`} /> : null}
                {reviewStats.punctuality > 0 || reviewStats.quality > 0 || reviewStats.communication > 0 ? null : (
                  <p className="text-xs font-bold leading-5 text-muted">Aún no hay evaluaciones detalladas por dimensión.</p>
                )}
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Servicios y créditos</h2>
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
          {!isDemo && (specialist.validation?.references ?? 0) > 0 ? (
            <section>
              <h2 className="text-2xl font-black">Referencias verificadas</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: specialist.validation?.references ?? 0 }).slice(0, 3).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
                    Referencia verificada {index + 1}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <h2 className="text-2xl font-black">Historial de trabajos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {specialist.workHistory.slice(0, 3).map((work) => (
                <article key={`${work.title}-${work.commune}`} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  <img src={work.image} alt={work.title} className="h-32 w-full object-cover" />
                  <div className="p-4">
                    <strong className="text-ink">{work.title}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{work.commune} · {work.credits} créditos · {work.rating}/5</p>
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
            <p className="eyebrow">Protección OficiosPro</p>
            <h2 className="text-2xl font-black">Todo cobro adicional requiere aprobacion del cliente.</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Tus créditos se retienen hasta confirmar avance.", "El especialista es revisado antes de publicarse.", "Puedes calificar despues del servicio.", "Los adicionales requieren aprobacion."].map((item) => (
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
            <span className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">Normal: {creditPair.baseCredits} créditos</span>
            <span className="rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">Club Hogar: {creditPair.clubCredits} créditos</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">{pricingDetail(primaryService)}</p>
          <button className="btn-primary mt-5 w-full" type="button" onClick={() => openBookingForService(primaryService)}>
            Reservar
          </button>
          <ConversionButton type="reserva_especialista" sourceButton="Consultar disponibilidad especialista" specialist={specialist} className="btn-secondary mt-3 w-full">
            Consultar disponibilidad
          </ConversionButton>
          <ShareProfileButton specialist={specialist} />
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
            {specialist.certifications.length ? (
              specialist.certifications.map((item) => <span key={item} className="chip bg-brand-soft text-brand-dark">{item}</span>)
            ) : (
              <p className="text-sm font-bold text-muted">Aún no hay certificaciones cargadas para este perfil.</p>
            )}
          </div>
        </article>
        <article className="panel">
          <h3 className="text-xl font-black">¿Qué significa verificado?</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">Antes de publicar un perfil, el equipo OficiosPro revisa:</p>
          <ul className="mt-3 grid gap-2 text-sm font-bold text-muted">
            <li className="rounded-2xl bg-slate-50 p-3">Identidad y datos de contacto del especialista.</li>
            <li className="rounded-2xl bg-slate-50 p-3">Oficio, servicios y cobertura declarada.</li>
            <li className="rounded-2xl bg-slate-50 p-3">Referencias y certificaciones cuando aplican al oficio.</li>
          </ul>
          <p className="mt-3 text-xs font-semibold leading-5 text-muted">
            La verificación es progresiva: cada trabajo cerrado y evaluado suma reputación real.
            {isDemo ? " Este perfil es referencial y no representa un especialista verificado." : ""}
          </p>
        </article>
        <SpecialistProfileAvailability specialist={specialist} />
        <article className="panel border-brand/15 bg-brand-soft">
          <h3 className="text-xl font-black text-brand-dark">¿Tienes un oficio?</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-brand-dark/80">
            Crea tu perfil profesional como este: sin costo inicial, con revisión humana y reputación acumulable.
          </p>
          <Link
            className="btn-secondary mt-4 w-full"
            href="/registro-especialista?source=specialist_profile&intent=offer_services"
            data-event="click_offer_services"
          >
            Crear mi perfil
          </Link>
        </article>
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

export function ProfileLoadingSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]" aria-busy="true" aria-label="Cargando perfil del especialista">
      <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
        <div className="h-[320px] w-full animate-pulse bg-slate-100 md:h-[460px]" />
        <div className="grid gap-6 p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
          <div className="h-32 animate-pulse rounded-[24px] bg-slate-100" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </article>
      <aside className="grid gap-5 self-start">
        <div className="h-56 animate-pulse rounded-[28px] bg-slate-100" />
        <div className="h-36 animate-pulse rounded-[28px] bg-slate-100" />
        <div className="h-36 animate-pulse rounded-[28px] bg-slate-100" />
      </aside>
    </section>
  );
}

function ShareProfileButton({ specialist }: { specialist: Specialist }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Perfil OficiosPro de ${specialist.name}`, text: `${specialist.name} · ${specialist.specialty} en OficiosPro`, url });
        return;
      } catch {
        /* usuario canceló el share nativo: cae al portapapeles */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia el enlace de este perfil:", url);
    }
  }

  return (
    <button className="btn-secondary mt-3 w-full" type="button" data-event="profile_share" onClick={share}>
      {copied ? "Enlace copiado ✓" : "Compartir este perfil"}
    </button>
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
    ["La visita tiene costo?", "Depende del servicio. Si hay visita técnica, los créditos se informan antes de reservar."],
    ["Que pasa si se necesitan materiales?", "El especialista debe pedir un adicional y tu lo apruebas antes de cualquier cobro."],
    ["Puedo aprobar un adicional antes de pagarlo?", "Si. Todo adicional requiere aprobacion del cliente."],
    ["Como se usan los créditos?", "Se retienen al reservar y se liberan cuando el servicio avanza o queda cerrado."],
    ["Puedo calificar al especialista?", "Si. Despues del servicio completado puedes dejar una opinion verificada."],
    ["Que pasa si el especialista no llega?", "OficiosPro revisa el caso y mantiene los créditos protegidos mientras se resuelve."],
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
