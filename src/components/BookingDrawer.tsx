"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { Specialist } from "@/data/mock";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { InstantContactPanel } from "@/components/InstantContactPanel";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import type { FlexibleService } from "@/data/flexiblePricing";
import { formatDisplayDate, getAvailabilitySummary, getSlotsForDate, getWeekDates, type TimeSlot } from "@/lib/availability";
import { createBookingRequest, getBookingRequests, getSpecialistAvailabilityProfile, type BookingRequest } from "@/lib/bookingStorage";
import { createQuoteAgreement, getMockSession, getPaymentCreditWallet, usePaymentCredits } from "@/lib/storage";
import { bookingPrimaryAction, creditsForInitialHold, formatDurationRange, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { submitLead } from "@/lib/leadClient";
import { addCartItem } from "@/lib/cart";

export function BookingDrawer({
  specialist,
  open,
  onClose,
  initialSelectedServiceId,
  sourceSection,
}: {
  specialist: Specialist;
  open: boolean;
  onClose: () => void;
  initialSelectedServiceId?: string | null;
  sourceSection?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState(getWeekDates()[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const services = useMemo(() => {
    const activeServices = specialist.servicePricing?.filter((service) => service.active !== false);
    return activeServices?.length ? activeServices : [getPrimaryFlexibleService(specialist)];
  }, [specialist]);
  const initialService = useMemo(
    () => services.find((service) => service.id === initialSelectedServiceId) ?? services[0],
    [initialSelectedServiceId, services],
  );
  const [selectedServiceId, setSelectedServiceId] = useState(initialService?.id ?? "");
  const [estimatedHours, setEstimatedHours] = useState(initialService?.minHours ?? 2);
  const [requestDescription, setRequestDescription] = useState("");
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [customer, setCustomer] = useState({
    names: "",
    lastName: "",
    email: "",
    whatsapp: "",
    rut: "",
    commune: specialist.commune ?? specialist.zone,
  });
  const selectedService = useMemo<FlexibleService>(() => services.find((service) => service.id === selectedServiceId) ?? services[0] ?? getPrimaryFlexibleService(specialist), [selectedServiceId, services, specialist]);
  const profile = useMemo(() => getSpecialistAvailabilityProfile(specialist), [specialist]);
  const slots = useMemo(() => getSlotsForDate(profile, selectedDate, bookings), [bookings, profile, selectedDate]);
  const summary = useMemo(() => getAvailabilitySummary(profile, bookings), [bookings, profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, open]);

  useEffect(() => {
    if (!open) return;
    const nextBookings = getBookingRequests();
    setBookings(nextBookings);
    const nextSummary = getAvailabilitySummary(profile, nextBookings);
    setSelectedDate(nextSummary.nextSlot?.date ?? getWeekDates()[0]);
    setSelectedSlot(nextSummary.nextSlot ?? null);
    setSuccess("");
    setSelectedServiceId(initialService?.id ?? "");
    setEstimatedHours(initialService?.minHours ?? 2);
    setRequestDescription("");
    setIsSubscriber(false);
    const session = getMockSession();
    setHasSession(Boolean(session));
    setCustomer({
      names: session?.name?.split(" ").slice(0, 1).join(" ") ?? "",
      lastName: session?.name?.split(" ").slice(1).join(" ") ?? "",
      email: session?.email ?? "",
      whatsapp: "",
      rut: "",
      commune: specialist.commune ?? specialist.zone,
    });
    setSubmitting(false);
  }, [initialService, open, profile]);

  if (!open || !mounted) return null;

  async function reserve() {
    if (submitting) return;
    preserveSpecialistIntent({ specialist, service: selectedService, intendedAction: "reservar", source: "BookingDrawer", sourceSection });
    if (!hasSession) {
      const initialCredits = creditsForInitialHold(selectedService, estimatedHours, isSubscriber);
      addCartItem({
        type: selectedService.pricingMode === "visit_then_quote" ? "visit" : selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" ? "quote_request" : "service_request",
        title: selectedService.name,
        credits: initialCredits,
        amountCLP: initialCredits * 1000,
        specialistId: specialist.id,
        specialistName: specialist.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        pricingMode: selectedService.pricingMode,
      });
    }
    const needsQuoteOnly = selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" || selectedService.pricingMode === "custom";
    if (needsQuoteOnly && !requestDescription.trim()) {
      setSuccess("Describe el problema o alcance para solicitar una cotizacion clara.");
      return;
    }
    if (!needsQuoteOnly && !selectedSlot) return;
    if (!hasSession && !customerReady(customer)) {
      setSuccess("Completa tus datos minimos para continuar sin perder la reserva.");
      return;
    }
    setSubmitting(true);
    try {
      const heldCredits = creditsForInitialHold(selectedService, estimatedHours, isSubscriber);
      const customerName = hasSession ? getMockSession()?.name ?? "Cliente OficiosPro" : `${customer.names} ${customer.lastName}`.trim();
      if (needsQuoteOnly) {
        const quote = createQuoteAgreement({
          specialistId: specialist.id,
          specialistName: specialist.name,
          customerName,
          serviceName: selectedService.name,
          commune: specialist.commune ?? specialist.zone,
          status: "quote_requested",
          originalRequest: requestDescription,
          history: ["El cliente solicito cotizacion desde la agenda del especialista."],
        });
        const leadResult = await submitLead({
          leadType: "booking_request",
          fullName: customerName,
          email: customer.email,
          phone: customer.whatsapp,
          service: selectedService.name,
          problemDescription: requestDescription,
          regionName: specialist.region,
          communeName: specialist.commune ?? specialist.zone,
          specialistId: specialist.id,
          specialistName: specialist.name,
          creditsEstimate: selectedService.minCredits,
          sourceComponent: sourceSection ?? "BookingDrawer",
          sourceButton: "Solicitar cotizacion",
          consentContact: false,
          payload: { quoteId: quote.id, pricingMode: selectedService.pricingMode, servicePricingId: selectedService.id, rut: customer.rut, sourceSection },
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
        fullName: customerName,
        email: customer.email,
        phone: customer.whatsapp,
        service: selectedService.name,
        problemDescription: requestDescription,
        regionName: specialist.region,
        communeName: specialist.commune ?? specialist.zone,
        specialistId: specialist.id,
        specialistName: specialist.name,
        requestedDate: selectedSlot!.date,
        requestedTime: selectedSlot!.startTime,
        creditsEstimate: heldCredits,
        sourceComponent: sourceSection ?? "BookingDrawer",
        sourceButton: bookingPrimaryAction(selectedService),
        payload: { pricingMode: selectedService.pricingMode, servicePricingId: selectedService.id, estimatedHours, heldCredits, rut: customer.rut, sourceSection },
        consentContact: false,
      });
      setBookings(getBookingRequests());
      setSuccess(leadResult.ok ? "Horario solicitado. Los creditos iniciales quedan retenidos hasta confirmar el servicio." : leadResult.message);
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  }

  const needsQuoteOnly = selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" || selectedService.pricingMode === "custom";
  const currentHoldCredits = creditsForInitialHold(selectedService, estimatedHours, isSubscriber);
  const wallet = getPaymentCreditWallet();
  const missingCredits = Math.max(0, currentHoldCredits - wallet.currentBalance);

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] bg-ink/60 p-3 backdrop-blur-sm md:p-6" onMouseDown={closeFromBackdrop}>
      <div
        ref={dialogRef}
        className="ml-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-drawer-title"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 md:p-6">
          <div>
            <p className="eyebrow">Disponibilidad referencial</p>
            <h2 id="booking-drawer-title" className="text-3xl font-black text-ink">{specialist.name}</h2>
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

          <div className="grid gap-3 md:grid-cols-3">
            <StepTile number="1" title="Que necesitas" detail="Servicio, comuna, comentario y urgencia." active />
            <StepTile number="2" title="Creditos" detail="Precio normal, Club Hogar y saldo disponible." active />
            <StepTile number="3" title="Confirmacion" detail="Fecha tentativa y creditos a retener." active={Boolean(selectedSlot) || needsQuoteOnly} />
          </div>

          {!hasSession ? (
            <section className="rounded-[24px] border border-line bg-slate-50 p-4">
              <p className="eyebrow">Continua sin perder la reserva</p>
              <h3 className="text-2xl font-black">Datos minimos de contacto</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="field">
                  Nombres
                  <input value={customer.names} onChange={(event) => setCustomer({ ...customer, names: event.target.value })} />
                </label>
                <label className="field">
                  Apellidos
                  <input value={customer.lastName} onChange={(event) => setCustomer({ ...customer, lastName: event.target.value })} />
                </label>
                <label className="field">
                  Email
                  <input type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
                </label>
                <label className="field">
                  WhatsApp
                  <input value={customer.whatsapp} onChange={(event) => setCustomer({ ...customer, whatsapp: event.target.value })} />
                </label>
                <label className="field">
                  RUT
                  <input value={customer.rut} onChange={(event) => setCustomer({ ...customer, rut: event.target.value })} />
                </label>
                <label className="field">
                  Comuna
                  <input value={customer.commune} onChange={(event) => setCustomer({ ...customer, commune: event.target.value })} />
                </label>
              </div>
            </section>
          ) : null}

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
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-black uppercase text-muted">Sin suscripcion</p>
                <h4 className="mt-1 text-lg font-black">Compra creditos cuando los necesitas</h4>
                <p className="mt-2 text-sm font-bold text-muted">Pagas precio normal en creditos y no tienes renovacion mensual.</p>
              </article>
              <article className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
                <p className="text-xs font-black uppercase text-brand-dark">Con Club Hogar</p>
                <h4 className="mt-1 text-lg font-black">Ahorras 2 creditos por solicitud</h4>
                <p className="mt-2 text-sm font-bold text-brand-dark">Recibes creditos mensuales, los acumulas y accedes a beneficios.</p>
              </article>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoTile label="Disponibles" value={`${wallet.currentBalance} creditos`} detail="Saldo actual para reservar o comprar servicios." />
              <InfoTile label="A retener" value={`${currentHoldCredits || 0} creditos`} detail="Quedan protegidos hasta confirmar avance." />
              <InfoTile label="Faltantes" value={`${missingCredits} creditos`} detail={missingCredits ? "Puedes comprar creditos o activar Club Hogar." : "Tienes saldo suficiente para continuar."} />
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

          <section className="rounded-[24px] border border-line bg-white p-4 shadow-sm">
            <p className="eyebrow">Confirmacion</p>
            <h3 className="text-2xl font-black">Resumen antes de enviar</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <InfoTile label="Especialista" value={specialist.name} detail={specialist.specialty} />
              <InfoTile label="Servicio" value={selectedService.name} detail={pricingModeLabel(selectedService.pricingMode)} />
              <InfoTile label="Fecha tentativa" value={needsQuoteOnly ? "Por coordinar" : selectedSlot?.label ?? "Selecciona horario"} detail={needsQuoteOnly ? "Propuesta posterior" : formatDisplayDate(selectedDate)} />
              <InfoTile label="Creditos" value={`${currentHoldCredits || 0}`} detail="Retencion inicial protegida." />
            </div>
            <div className="mt-4 grid gap-2 text-sm font-black text-muted sm:grid-cols-3">
              {["Solicitud creada", "Creditos retenidos", "Pendiente aceptacion especialista", "Aceptado", "Completado", "Calificado"].map((status) => (
                <span key={status} className="rounded-2xl bg-slate-50 p-3">{status}</span>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-950">
              Todo adicional requiere tu aprobacion antes de cobrarse.
            </p>
          </section>

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
            <button className="btn-primary" type="button" data-event={needsQuoteOnly ? "quote_request_submit" : "reserve_time_slot"} disabled={submitting || (!needsQuoteOnly && !selectedSlot)} onClick={reserve}>
              {submitting ? "Enviando..." : bookingPrimaryAction(selectedService)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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

function StepTile({ number, title, detail, active }: { number: string; title: string; detail: string; active: boolean }) {
  return (
    <article className={`rounded-2xl border p-4 ${active ? "border-brand/20 bg-brand-soft" : "border-line bg-slate-50"}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black ${active ? "bg-brand text-white" : "bg-white text-muted"}`}>
        {number}
      </span>
      <strong className="mt-3 block text-ink">{title}</strong>
      <p className="mt-1 text-sm font-bold leading-5 text-muted">{detail}</p>
    </article>
  );
}

function customerReady(customer: { names: string; lastName: string; email: string; whatsapp: string; rut: string; commune: string }) {
  return Boolean(
    customer.names.trim() &&
      customer.lastName.trim() &&
      customer.email.trim() &&
      customer.whatsapp.trim() &&
      customer.rut.trim() &&
      customer.commune.trim(),
  );
}
