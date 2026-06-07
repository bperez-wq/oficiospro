"use client";

import { useEffect, useMemo, useState } from "react";
import type { Specialist } from "@/data/mock";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { InstantContactPanel } from "@/components/InstantContactPanel";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { formatDisplayDate, getAvailabilitySummary, getSlotsForDate, getWeekDates, type TimeSlot } from "@/lib/availability";
import { createBookingRequest, getBookingRequests, getSpecialistAvailabilityProfile, type BookingRequest } from "@/lib/bookingStorage";

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
  }, [open, profile]);

  if (!open) return null;

  function reserve() {
    if (!selectedSlot) return;
    createBookingRequest({
      specialist,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      creditsEstimate: specialist.credits,
      communeName: specialist.commune ?? specialist.zone,
    });
    setBookings(getBookingRequests());
    setSuccess("Horario solicitado. El especialista recibirá tu solicitud y podrás confirmar los detalles.");
    setSelectedSlot(null);
  }

  return (
    <div className="fixed inset-0 z-[110] bg-ink/60 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-card">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 md:p-6">
          <div>
            <p className="eyebrow">Disponibilidad referencial</p>
            <h2 className="text-3xl font-black text-ink">{specialist.name}</h2>
            <p className="mt-1 text-sm font-bold text-muted">
              {specialist.specialty} · {specialist.commune ?? specialist.zone} · desde {specialist.credits} créditos
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
              <span className="chip bg-white text-brand-dark">Solicitud pendiente de confirmación</span>
            </div>
            <TimeSlotPicker slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
          </section>

          <InstantContactPanel specialist={specialist} />
        </div>

        <div className="border-t border-line bg-white p-5">
          {success ? <p className="mb-3 rounded-2xl border border-brand/20 bg-brand-soft p-3 font-black text-brand-dark">{success}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-muted">
              {selectedSlot ? `Seleccionado: ${formatDisplayDate(selectedSlot.date)} ${selectedSlot.label}` : "Selecciona un horario disponible para continuar."}
            </p>
            <button className="btn-primary" type="button" data-event="reserve_time_slot" disabled={!selectedSlot} onClick={reserve}>
              Reservar horario
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
