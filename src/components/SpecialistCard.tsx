"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { BookingDrawer } from "@/components/BookingDrawer";
import { ConversionButton } from "@/components/ConversionModal";
import { InstantContactPanel } from "@/components/InstantContactPanel";
import { SpecialistProfileImage } from "@/components/SpecialistProfileImage";
import { availabilityLabels, type Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";
import { addSpecialistToBagAndProceed } from "@/lib/bag";
import { formatDisplayDate, getAvailabilitySummary, type AvailabilitySummary } from "@/lib/availability";
import { creditsToCLPLabel } from "@/lib/credits/creditInfo";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";
import { getBookingRequests, getSpecialistAvailabilityProfile } from "@/lib/bookingStorage";
import { bookingPrimaryAction, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getServiceCreditPair, getSpecialistLevel, getTrustBadges } from "@/lib/trust";

export function SpecialistCard({
  specialist,
  matchedService,
  searchIntent,
  highlightedCreditPrice,
  onReserve,
}: {
  specialist: Specialist;
  matchedService?: FlexibleService | null;
  searchIntent?: string;
  highlightedCreditPrice?: string;
  onReserve?: (id: string, service?: FlexibleService | null) => void;
}) {
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    specialistId: string | null;
    specialistSnapshot: Specialist | null;
    selectedServiceId: string | null;
    selectedSlot: null;
  }>({
    isOpen: false,
    specialistId: null,
    specialistSnapshot: null,
    selectedServiceId: null,
    selectedSlot: null,
  });
  const [contactOpen, setContactOpen] = useState(false);
  const [summary, setSummary] = useState<AvailabilitySummary | null>(null);
  const profile = useMemo(() => getSpecialistAvailabilityProfile(specialist), [specialist]);
  const primaryService = useMemo(() => getPrimaryFlexibleService(specialist), [specialist]);
  const displayService = matchedService ?? primaryService;
  const trustBadges = useMemo(() => getTrustBadges(specialist), [specialist]);
  const specialistLevel = useMemo(() => getSpecialistLevel(specialist), [specialist]);
  const creditPair = useMemo(() => getServiceCreditPair(displayService, specialist.credits), [displayService, specialist.credits]);
  const coverageStatus =
    specialist.coverageRadiusKm && specialist.distance <= specialist.coverageRadiusKm
      ? "Dentro de tu zona"
      : specialist.coverageRadiusKm
        ? "Fuera de cobertura"
        : "Cobertura por confirmar";

  useEffect(() => {
    setSummary(getAvailabilitySummary(profile, getBookingRequests()));
  }, [profile]);

  const nextSlotLabel = summary?.nextSlot
    ? `${formatDisplayDate(summary.nextSlot.date)} ${summary.nextSlot.label}`
    : "Solicita contacto y revisaremos disponibilidad.";

  const openBookingModal = useCallback(() => {
    preserveSpecialistIntent({ specialist, service: displayService, intendedAction: "reservar", source: "SpecialistCard" });
    /* Bag-first: la selección queda guardada en la Bolsa aunque el usuario cierre el flujo. */
    addSpecialistToBagAndProceed({ specialist, service: displayService, sourceSection: "specialist_card", proceed: "none" });
    setBookingModal({
      isOpen: true,
      specialistId: specialist.id,
      specialistSnapshot: snapshotSpecialist(specialist),
      selectedServiceId: displayService.id,
      selectedSlot: null,
    });
  }, [displayService, specialist]);

  const closeBookingModal = useCallback(() => {
    setBookingModal((current) => ({
      ...current,
      isOpen: false,
      selectedSlot: null,
    }));
  }, []);

  return (
    <article className="group overflow-hidden rounded-card border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1.5 hover:border-brand/30 hover:shadow-lift">
      <div className="relative h-64 overflow-hidden bg-brand-soft">
        <SpecialistProfileImage
          src={specialist.image}
          name={specialist.name}
          specialty={specialist.specialty}
          serviceTypeId={specialist.serviceTypeId}
          category={specialist.category}
          alt={`${specialist.name}, ${specialist.specialty} en ${specialist.zone}`}
          className="h-full w-full rounded-none"
          imageClassName="transition duration-500 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/75 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-brand-dark shadow-soft backdrop-blur">
          {availabilityLabels[specialist.availability]}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-2 text-xs font-black text-white shadow-soft backdrop-blur">
          <span className="text-gold">★</span> {specialist.rating.toFixed(1)}
        </span>
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-lg font-black text-white shadow-lg shadow-brand/30">
            {specialist.initials}
          </span>
          <div className="text-white">
            <strong className="block text-xl">{specialist.name}</strong>
            <span className="text-sm font-bold text-white/80">{specialist.zone}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <AvailabilityBadge specialist={specialist} />

        <div>
          <p className="font-black text-ink">{specialist.specialty}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-muted">{specialist.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric value={`${specialist.rating.toFixed(1)}★`} label="calificación" />
          <Metric value={specialist.jobs.toString()} label="trabajos" />
          <Metric value={specialist.responseTime} label="respuesta" />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="chip bg-gold/15 text-gold">Nivel {specialistLevel}</span>
          {trustBadges.map((badge) => (
            <span key={badge} className={badgeClass(badge)}>
              {badge}
            </span>
          ))}
          <span className="chip-sun">{specialist.recommendation}% recomienda</span>
        </div>

        <div className="rounded-2xl border border-brand/10 bg-gradient-to-br from-brand-soft to-white p-4">
          <span className="text-sm font-black uppercase text-muted">{searchIntent ? "Servicio relacionado" : "Precio desde"}</span>
          <strong className="block text-2xl font-black text-ink">{highlightedCreditPrice ?? pricingSummary(displayService)}</strong>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <span className="rounded-2xl bg-white p-3 text-sm font-black text-ink">
              Normal: {creditPair.baseCredits} créditos <span className="text-xs font-bold text-muted">({creditsToCLPLabel(creditPair.baseCredits)})</span>
            </span>
            <span className="rounded-2xl bg-white p-3 text-sm font-black text-brand-dark">
              Club Hogar: {creditPair.clubCredits} créditos <span className="text-xs font-bold text-muted">({creditsToCLPLabel(creditPair.clubCredits)})</span>
            </span>
          </div>
          <p className="text-sm font-bold text-muted">{pricingModeLabel(displayService.pricingMode)} · {pricingDetail(displayService)}</p>
          <CreditsHelpTrigger className="mt-2 inline-block text-xs font-black text-brand-dark underline underline-offset-2 hover:opacity-80">
            ¿Cómo funcionan los créditos?
          </CreditsHelpTrigger>
          {creditPair.savingsCredits ? <p className="mt-2 text-sm font-black text-brand-dark">Ahorra {creditPair.savingsCredits} créditos por solicitud con Club Hogar.</p> : null}
          {specialist.coverageRadiusKm ? (
            <p className="mt-2 text-sm font-bold text-muted">
              A {specialist.distance} km · {coverageStatus} · radio {specialist.coverageRadiusKm} km
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-slate-50 p-4">
          <span className="text-xs font-black uppercase text-muted">Próximo horario</span>
          <strong className="mt-1 block text-base text-ink">{summary?.detail ?? "Disponibilidad referencial"}</strong>
          <p className="mt-1 text-sm font-bold leading-5 text-muted">{nextSlotLabel}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <span className="text-xs font-black uppercase text-emerald-900">Protección OficiosPro</span>
          <div className="mt-3 grid gap-2 text-sm font-bold leading-5 text-emerald-950">
            <span>Tus créditos se retienen hasta confirmar avance.</span>
            <span>El especialista es revisado antes de publicarse.</span>
            <span>Puedes calificar despues del servicio.</span>
            <span>Los adicionales requieren aprobacion.</span>
          </div>
          <CreditsHelpTrigger className="mt-3 inline-block text-xs font-black text-emerald-900 underline underline-offset-2 hover:opacity-80">
            Que es el pago protegido
          </CreditsHelpTrigger>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
          <Link href={`/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}`} className="btn-secondary flex-1">
            Ver perfil
          </Link>
          <button className="btn-primary flex-1" type="button" data-event="open_specialist_agenda" onClick={openBookingModal}>
            {bookingPrimaryAction(displayService)}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="btn-secondary"
            type="button"
            data-event="open_instant_contact"
            onClick={() => {
              preserveSpecialistIntent({ specialist, service: displayService, intendedAction: "contactar", source: "SpecialistCard" });
              setContactOpen((current) => !current);
            }}
          >
            Contacto inmediato
          </button>
          {onReserve ? (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                preserveSpecialistIntent({ specialist, service: displayService, intendedAction: "solicitar", source: "SpecialistCard" });
                onReserve(specialist.id, displayService);
              }}
            >
              Solicitar servicio
            </button>
          ) : (
            <ConversionButton type="reserva_especialista" sourceButton="Solicitar especialista desde card" specialist={specialist} className="btn-secondary">
              Solicitar servicio
            </ConversionButton>
          )}
        </div>

        {contactOpen ? <InstantContactPanel specialist={specialist} onOpenAgenda={openBookingModal} /> : null}
      </div>

      {bookingModal.specialistSnapshot ? (
        <BookingDrawer
          key={bookingModal.specialistId ?? "booking-drawer"}
          specialist={bookingModal.specialistSnapshot}
          open={bookingModal.isOpen}
          initialSelectedServiceId={bookingModal.selectedServiceId}
          onClose={closeBookingModal}
        />
      ) : null}
    </article>
  );
}

function snapshotSpecialist(specialist: Specialist): Specialist {
  return {
    ...specialist,
    badges: [...(specialist.badges ?? [])],
    gallery: [...(specialist.gallery ?? [])],
    galleryImages: [...(specialist.galleryImages ?? [])],
    certifications: [...(specialist.certifications ?? [])],
    servicesOffered: [...(specialist.servicesOffered ?? [])],
    servicePricing: specialist.servicePricing?.map((service) => ({ ...service })),
    workHistory: (specialist.workHistory ?? []).map((work) => ({ ...work })),
    reviews: (specialist.reviews ?? []).map((review) => ({ ...review })),
    specialties: specialist.specialties ? [...specialist.specialties] : undefined,
    validation: specialist.validation ? { ...specialist.validation } : undefined,
  };
}

function badgeClass(badge: string) {
  if (badge === "Identidad verificada") return "chip-emerald";
  if (badge === "Top especialista") return "chip-sun";
  if (badge === "Certificación cargada") return "chip-accent";
  if (badge === "Respuesta rapida") return "chip-brand";
  return "chip-brand";
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-2xl bg-slate-50 p-3">
      <strong className="block text-sm text-ink md:text-base">{value}</strong>
      <span className="text-[11px] font-black uppercase text-muted">{label}</span>
    </span>
  );
}
