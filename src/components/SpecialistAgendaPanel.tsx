"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityProfile, TimeBlock, Weekday } from "@/data/availability";
import type { Specialist } from "@/data/mock";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { formatDisplayDate, getSlotsForDate, getWeekDates, hasBlockingConflict, weekdayLabels, weekdayOrder } from "@/lib/availability";
import {
  addBlockedSlot,
  getBookingRequests,
  getSpecialistAvailabilityProfile,
  removeBlockedSlot,
  saveAvailabilityProfile,
  type BookingRequest,
} from "@/lib/bookingStorage";

export function SpecialistAgendaPanel({ specialist }: { specialist: Specialist }) {
  const [profile, setProfile] = useState<AvailabilityProfile | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState(getWeekDates()[0]);
  const [blockForm, setBlockForm] = useState({
    date: getWeekDates()[0],
    startTime: "10:00",
    endTime: "12:00",
    reason: "",
  });
  const [newBlocks, setNewBlocks] = useState<Record<string, TimeBlock>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setProfile(getSpecialistAvailabilityProfile(specialist));
    setBookings(getBookingRequests().filter((booking) => booking.specialistId === specialist.id));
  }, [specialist]);

  const selectedSlots = useMemo(() => (profile ? getSlotsForDate(profile, selectedDate, bookings) : []), [bookings, profile, selectedDate]);
  const upcomingBookings = bookings.filter((booking) => booking.status !== "Cancelada").slice(0, 6);

  if (!profile) return null;
  const activeProfile = profile;

  function updateProfile(patch: Partial<AvailabilityProfile>) {
    const next = { ...activeProfile, ...patch };
    setProfile(saveAvailabilityProfile(next));
    setNotice("Agenda actualizada. La disponibilidad pública se recalcula al instante.");
  }

  function updateWeekday(day: Weekday, blocks: TimeBlock[]) {
    updateProfile({ workingHoursByWeekday: { ...activeProfile.workingHoursByWeekday, [day]: blocks } });
  }

  function addWorkingBlock(day: Weekday) {
    const draft = newBlocks[day] ?? { startTime: "09:00", endTime: "13:00" };
    updateWeekday(day, [...(activeProfile.workingHoursByWeekday[day] ?? []), draft]);
    setNewBlocks({ ...newBlocks, [day]: { startTime: "15:00", endTime: "18:00" } });
  }

  function removeWorkingBlock(day: Weekday, index: number) {
    updateWeekday(day, activeProfile.workingHoursByWeekday[day].filter((_, blockIndex) => blockIndex !== index));
  }

  function saveBlock() {
    if (blockForm.endTime <= blockForm.startTime) {
      setNotice("La hora de término debe ser posterior a la hora de inicio.");
      return;
    }
    if (hasBlockingConflict(activeProfile.blockedSlots, blockForm)) {
      setNotice("Ese bloqueo se cruza con otro horario bloqueado.");
      return;
    }
    const next = addBlockedSlot(specialist, blockForm);
    setProfile(next);
    setBookings(getBookingRequests().filter((booking) => booking.specialistId === specialist.id));
    setNotice("Horario bloqueado. Ese bloque ya no aparece disponible para clientes.");
  }

  function removeBlock(blockId: string) {
    const next = removeBlockedSlot(specialist, blockId);
    setProfile(next);
    setNotice("Bloqueo eliminado. La agenda pública se actualizó.");
  }

  return (
    <div className="grid gap-6">
      {notice ? <p className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</p> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <ToggleCard
          title="Disponible ahora"
          text="Muestra una señal visible para solicitudes cercanas."
          checked={activeProfile.instantAvailable}
          onChange={(instantAvailable) => updateProfile({ instantAvailable })}
        />
        <ToggleCard
          title="Atiendo urgencias"
          text="Permite contacto inmediato cuando no hay bloque reservado."
          checked={activeProfile.emergencyAvailable}
          onChange={(emergencyAvailable) => updateProfile({ emergencyAvailable })}
        />
        <article className="panel">
          <p className="eyebrow">Aviso mínimo</p>
          <h3 className="text-2xl font-black">{activeProfile.minNoticeMinutes} min</h3>
          <input
            className="mt-4"
            type="range"
            min="30"
            max="360"
            step="30"
            value={activeProfile.minNoticeMinutes}
            onChange={(event) => updateProfile({ minNoticeMinutes: Number(event.target.value) })}
          />
          <p className="mt-2 text-sm font-bold text-muted">Tiempo mínimo antes de recibir una solicitud.</p>
        </article>
      </section>

      <section className="panel">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Horario semanal</p>
            <h2 className="text-3xl font-black">Bloques de atención</h2>
          </div>
          <label className="field max-w-xs">
            Duración base
            <select value={activeProfile.slotDurationMinutes} onChange={(event) => updateProfile({ slotDurationMinutes: Number(event.target.value) })}>
              <option value={60}>60 minutos</option>
              <option value={75}>75 minutos</option>
              <option value={90}>90 minutos</option>
              <option value={120}>120 minutos</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3">
          {weekdayOrder.map((day) => (
            <article key={day} className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[160px_1fr_auto] lg:items-center">
                <strong>{weekdayLabels[day]}</strong>
                <div className="flex flex-wrap gap-2">
                  {(activeProfile.workingHoursByWeekday[day] ?? []).length ? (
                    activeProfile.workingHoursByWeekday[day].map((block, index) => (
                      <span key={`${block.startTime}-${block.endTime}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-ink">
                        {block.startTime} - {block.endTime}
                        <button className="text-muted hover:text-ink" type="button" onClick={() => removeWorkingBlock(day, index)} aria-label={`Eliminar bloque ${weekdayLabels[day]}`}>
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-bold text-muted">Sin atención visible</span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="time"
                    value={(newBlocks[day] ?? { startTime: "09:00" }).startTime}
                    onChange={(event) => setNewBlocks({ ...newBlocks, [day]: { ...(newBlocks[day] ?? { endTime: "13:00" }), startTime: event.target.value } })}
                  />
                  <input
                    type="time"
                    value={(newBlocks[day] ?? { endTime: "13:00" }).endTime}
                    onChange={(event) => setNewBlocks({ ...newBlocks, [day]: { ...(newBlocks[day] ?? { startTime: "09:00" }), endTime: event.target.value } })}
                  />
                  <button className="btn-secondary" type="button" onClick={() => addWorkingBlock(day)}>
                    Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel">
          <p className="eyebrow">Bloquear horarios</p>
          <h2 className="text-3xl font-black">Marca tiempos ocupados</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="field sm:col-span-2">
              Dia
              <select value={blockForm.date} onChange={(event) => setBlockForm({ ...blockForm, date: event.target.value })}>
                {getWeekDates().map((date) => (
                  <option key={date} value={date}>
                    {formatDisplayDate(date, { weekday: "long", day: "2-digit", month: "long" })}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Inicio
              <input type="time" value={blockForm.startTime} onChange={(event) => setBlockForm({ ...blockForm, startTime: event.target.value })} />
            </label>
            <label className="field">
              Término
              <input type="time" value={blockForm.endTime} onChange={(event) => setBlockForm({ ...blockForm, endTime: event.target.value })} />
            </label>
            <label className="field sm:col-span-2">
              Motivo opcional
              <input value={blockForm.reason} onChange={(event) => setBlockForm({ ...blockForm, reason: event.target.value })} placeholder="Ej: visita ya tomada, traslado o mantención personal" />
            </label>
            <button className="btn-primary sm:col-span-2" type="button" onClick={saveBlock}>
              Guardar bloqueo
            </button>
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Bloqueos activos</p>
          <h2 className="text-3xl font-black">{activeProfile.blockedSlots.length} horarios bloqueados</h2>
          <div className="mt-5 grid gap-3">
            {activeProfile.blockedSlots.length ? (
              activeProfile.blockedSlots.map((block) => (
                <div key={block.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4">
                  <div>
                    <strong>{formatDisplayDate(block.date)} · {block.startTime} - {block.endTime}</strong>
                    <span className="block text-sm font-bold text-muted">{block.reason || "Horario ocupado"}</span>
                  </div>
                  <button className="btn-secondary" type="button" onClick={() => removeBlock(block.id)}>
                    Eliminar
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted">No hay bloqueos esta semana.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <article className="panel">
          <p className="eyebrow">Reservas recibidas</p>
          <h2 className="text-3xl font-black">Próximas solicitudes</h2>
          <div className="mt-5 grid gap-3">
            {upcomingBookings.length ? (
              upcomingBookings.map((booking) => (
                <article key={booking.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong>{booking.service}</strong>
                      <span className="block text-sm font-bold text-muted">
                        {booking.communeName} · {formatDisplayDate(booking.date)} · {booking.startTime || "Contacto"} · {booking.creditsEstimate} créditos
                      </span>
                    </div>
                    <span className="chip bg-brand-soft text-brand-dark">{booking.status}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted">Aún no tienes solicitudes pendientes en esta vista.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Vista previa pública</p>
          <h2 className="text-3xl font-black">Así verá tu disponibilidad el cliente</h2>
          <div className="mt-5 grid gap-4 rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong>{specialist.name}</strong>
                <span className="block text-sm font-bold text-muted">{specialist.specialty} · {specialist.commune ?? specialist.zone}</span>
              </div>
              <AvailabilityBadge specialist={specialist} />
            </div>
            <AvailabilityCalendar profile={activeProfile} bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <TimeSlotPicker slots={selectedSlots} selectedSlot={null} onSelectSlot={() => undefined} />
          </div>
        </article>
      </section>
    </div>
  );
}

function ToggleCard({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <article className="panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{checked ? "Activo" : "Pausado"}</p>
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">{text}</p>
        </div>
        <button
          className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-brand" : "bg-slate-300"}`}
          type="button"
          onClick={() => onChange(!checked)}
          aria-pressed={checked}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? "left-7" : "left-1"}`} />
        </button>
      </div>
    </article>
  );
}
