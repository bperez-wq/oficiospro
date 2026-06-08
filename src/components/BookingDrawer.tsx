"use client";

import { useEffect, useMemo, useState } from "react";
import type { Specialist } from "@/data/mock";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { InstantContactPanel } from "@/components/InstantContactPanel";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import type { FlexibleService } from "@/data/flexiblePricing";
import { formatDisplayDate, getAvailabilitySummary, getSlotsForDate, getWeekDates, type TimeSlot } from "@/lib/availability";
import { createBookingRequest, getBookingRequests, getSpecialistAvailabilityProfile, type BookingRequest } from "@/lib/bookingStorage";
import { createQuoteAgreement, usePaymentCredits } from "@/lib/storage";
import { bookingPrimaryAction, creditsForInitialHold, formatDurationRange, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { submitLead } from "@/lib/leadClient";

export function BookingDrawer({
  specialist,
  open,
  onClose,
}: {
  specialist: Specialist;
  open: boolean;
  onClose: () => void;
}) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState(getWeekDates()[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [success, setSuccess] = useState("");
  const services = useMemo(() => (specialist.servicePricing?.length ? specialist.servicePricing : [getPrimaryFlexibleService(specialist)]), [specialist]);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [estimatedHours, setEstimatedHours] = useState(services[0]?.minHours ?? 2);
  const [requestDescription, setRequestDescription] = useState("");
  const [isSubscriber, setIsSubscriber] = useState(false);
  const selectedService = useMemo<FlexibleService>(() => services.find((service) => service.id === selectedServiceId) ?? services[0] ?? getPrimaryFlexibleService(specialist), [selectedServiceId, services, specialist]);
  const profile = useMemo(() => getSpecialistAvailabilityProfile(specialist), [specialist]);
  const slots = useMemo(() => getSlotsForDate(profile, selectedDate, bookings), [bookings, profile, selectedDate]);
  const summary = useMemo(() => getAvailabilitySummary(profile, bookings), [bookings, profile]);

  useEffect(() => {
    if (!open) return;
    const nextBookings = getBookingRequests();
    setBookings(nextBookings);
    const nextSummary = getAvailabilitySummary(profile, nextBookings);
    setSelectedDate(nextSummary.nextSlot?.date ?? getWeekDates()[0]);
    setSelectedSlot(nextSummary.nextSlot ?? null);
    setSuccess("");
    setSelectedServiceId(services[0]?.id ?? "");
    setEstimatedHours(services[0]?.minHours ?? 2);
    setRequestDescription("");
    setIsSubscriber(false);
  }, [open, profile, services]);

  if (!open) return null;

  async function reserve() {
    const needsQuoteOnly = selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" || selectedService.pricingMode === "custom";
    if (needsQuoteOnly && !requestDescription.trim()) {
      setSuccess("Describe el problema o alcance para solicitar una cotizacion clara.");
      return;
    }
    if (!needsQuoteOnly && !selectedSlot) return;
    const heldCredits = creditsForInitialHold(selectedService, estimatedHours, isSubscriber);
    if (needsQuoteOnly) {
      const quote = createQuoteAgreement({
        specialistId: specialist.id,
        specialistName: specialist.name,
        customerName: "Cliente OficiosPro",
        serviceName: selectedService.name,
        commune: specialist.commune ?? specialist.zone,
        status: "quote_requested",
        originalRequest: requestDescription,
        history: ["El cliente solicito cotizacion desde la agenda del especialista."],
      });
      const leadResult = await submitLead({
        leadType: "booking_request",
        fullName: "Cliente OficiosPro",
        service: selectedService.name,
        problemDescription: requestDescription,
        regionName: specialist.region,
        communeName: specialist.commune ?? specialist.zone,
        specialistId: specialist.id,
        specialistName: specialist.name,
        creditsEstimate: selectedService.minCredits,
        sourceComponent: "BookingDrawer",
        sourceButton: "Solicitar cotizacion",
        consentContact: false,
        payload: { quoteId: quote.id, pricingMode: selectedService.pricingMode, servicePricingId: selectedService.id },
      });
      setSuccess(leadResult.ok ? "Cotizacion solicitada. El especialista enviara una propuesta estructurada para revisar." : leadResult.message);
      setRequestDescription("");
      return;
    }
    createBookingRequest({
      specialist,
      date: selectedSlot!.date,
      startTime: selectedSlot!.startTime,
      endTime: selectedSlot!.endTime,
      service: selectedService.name,
      servicePricingId: selectedService.id,
      pricingMode: selectedService.pricingMode,
      creditsEstimate: heldCredits,
      heldCredits,
      estimatedHours: selectedService.pricingMode === "hourly" ? estimatedHours : undefined,
      requestDescription,
      communeName: specialist.commune ?? specialist.zone,
    });
    if (heldCredits > 0) {
      usePaymentCredits({
        amount: heldCredits,
        type: selectedService.pricingMode === "hourly" ? "service_hourly_hold" : selectedService.pricingMode === "visit_then_quote" ? "visit_hold" : "service_fixed_hold",
        detail: `Retencion inicial ${selectedService.name}`,
        relatedServiceRequestId: selectedService.id,
      });
    }
    const leadResult = await submitLead({
      leadType: "booking_request",
      fullName: "Cliente OficiosPro",
      service: selectedService.name,
      problemDescription: requestDescription,
      regionName: specialist.region,
      communeName: specialist.commune ?? specialist.zone,
      specialistId: specialist.id,
      specialistName: specialist.name,
      requestedDate: selectedSlot!.date,
      requestedTime: selectedSlot!.startTime,
      creditsEstimate: heldCredits,
      sourceComponent: "BookingDrawer",
      sourceButton: bookingPrimaryAction(selectedService),
      payload: { pricingMode: selectedService.pricingMode, servicePricingId: selectedService.id, estimatedHours, heldCredits },
      consentContact: false,
    });
    setBookings(getBookingRequests());
    setSuccess(leadResult.ok ? "Horario solicitado. Los creditos iniciales quedan retenidos hasta confirmar el servicio." : leadResult.message);
    setSelectedSlot(null);
  }

  const needsQuoteOnly = selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" || selectedService.pricingMode === "custom";
  const currentHoldCredits = creditsForInitialHold(selectedService, estimatedHours, isSubscriber);

  return (
    <div className="fixed inset-0 z-[110] bg-ink/60 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 md:p-6">
          <div>
            <p className="eyebrow">Disponibilidad referencial</p>
            <h2 className="text-3xl font-black text-ink">{specialist.name}</h2>
            <p className="mt-1 text-sm font-bold text-muted">
              {specialist.specialty} · {specialist.commune ?? specialist.zone} · {pricingSummary(selectedService)}
            </p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={onClose} aria-label="Cerrar agenda">
            ×
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoTile label="Estado" value={summary.label} detail={summary.detail} />
            <InfoTile label="Duración estimada" value={`${profile.slotDurationMinutes} min`} detail={`Aviso mínimo ${profile.minNoticeMinutes} min`} />
            <InfoTile label="Zona" value={specialist.commune ?? specialist.zone} detail={profile.communeCoverage.slice(0, 3).join(", ") || "Cobertura por confirmar"} />
          </div>

          <section className="rounded-[24px] border border-line bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Servicio y precio</p>
                <h3 className="text-2xl font-black">Elige modalidad antes de continuar</h3>
              </div>
              <label className="flex items-center gap-2 rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm font-black text-muted">
                <input type="checkbox" checked={isSubscriber} onChange={(event) => setIsSubscriber(event.target.checked)} />
                Cliente Club Hogar
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand ${selectedService.id === service.id ? "border-brand bg-brand-soft" : "border-line bg-slate-50"}`}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setEstimatedHours(service.minHours ?? 2);
                    setSelectedSlot(null);
                  }}
                >
                  <span className="text-xs font-black uppercase text-brand-dark">{pricingModeLabel(service.pricingMode)}</span>
                  <strong className="mt-1 block text-lg text-ink">{service.name}</strong>
                  <span className="mt-1 block text-sm font-bold text-muted">{pricingSummary(service, isSubscriber)}</span>
                  <span className="mt-1 block text-xs font-bold text-muted">{formatDurationRange(service)}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-brand/15 bg-brand-soft p-4">
              <strong className="block text-ink">{pricingSummary(selectedService, isSubscriber)}</strong>
              <p className="mt-1 text-sm font-bold text-brand-dark">{pricingDetail(selectedService)}</p>
              <p className="mt-1 text-sm font-bold text-brand-dark">Retencion inicial estimada: {currentHoldCredits || "por confirmar"} creditos.</p>
            </div>
            {selectedService.pricingMode === "hourly" ? (
              <label className="field mt-4">
                Horas iniciales a confirmar
                <input type="number" min={selectedService.minHours ?? 1} max={selectedService.maxHours ?? 12} value={estimatedHours} onChange={(event) => setEstimatedHours(Number(event.target.value))} />
                <span className="text-xs font-bold text-muted">Descuento Club Hogar aplica una vez por solicitud, no por cada hora.</span>
              </label>
            ) : null}
            {(needsQuoteOnly || selectedService.pricingMode === "visit_then_quote") ? (
              <label className="field mt-4">
                Descripcion del problema o alcance
                <textarea value={requestDescription} onChange={(event) => setRequestDescription(event.target.value)} placeholder="Describe sintomas, direccion/comuna, urgencia, fotos disponibles o condiciones del lugar." />
              </label>
            ) : null}
          </section>

          {needsQuoteOnly ? (
            <section className="rounded-[24px] border border-line bg-slate-50 p-4">
              <p className="eyebrow">Cotizacion</p>
              <h3 className="text-2xl font-black">Crearemos una solicitud para propuesta.</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-muted">
                No se descuenta un pago final ahora. El especialista enviara una propuesta y podras aceptar, rechazar o pedir ajuste.
              </p>
            </section>
          ) : (
            <>
              <AvailabilityCalendar profile={profile} bookings={bookings} selectedDate={selectedDate} onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }} />

              <section className="rounded-[24px] border border-line bg-slate-50 p-4">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Horarios</p>
                    <h3 className="text-2xl font-black">{formatDisplayDate(selectedDate, { weekday: "long", day: "2-digit", month: "long" })}</h3>
                  </div>
                  <span className="chip bg-white text-brand-dark">Solicitud pendiente de confirmacion</span>
                </div>
                <TimeSlotPicker slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
              </section>
            </>
          )}

          <InstantContactPanel specialist={specialist} />
        </div>

        <div className="border-t border-line bg-white p-5">
          {success ? <p className="mb-3 rounded-2xl border border-brand/20 bg-brand-soft p-3 font-black text-brand-dark">{success}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-muted">
              {needsQuoteOnly
                ? "Enviaremos la solicitud para propuesta y acuerdo."
                : selectedSlot
                  ? `Seleccionado: ${formatDisplayDate(selectedSlot.date)} ${selectedSlot.label}`
                  : "Selecciona un horario disponible para continuar."}
            </p>
            <button className="btn-primary" type="button" data-event={needsQuoteOnly ? "quote_request_submit" : "reserve_time_slot"} disabled={!needsQuoteOnly && !selectedSlot} onClick={reserve}>
              {bookingPrimaryAction(selectedService)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-xl text-ink">{value}</strong>
      <p className="mt-1 text-sm font-bold leading-5 text-muted">{detail}</p>
    </article>
  );
}
