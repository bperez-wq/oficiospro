"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { BookingDrawer } from "@/components/BookingDrawer";
import { InstantContactPanel } from "@/components/InstantContactPanel";
import type { Specialist } from "@/data/mock";
import { formatDisplayDate, getAvailabilitySummary, type AvailabilitySummary } from "@/lib/availability";
import { getBookingRequests, getSpecialistAvailabilityProfile } from "@/lib/bookingStorage";

export function SpecialistProfileAvailability({ specialist }: { specialist: Specialist }) {
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [summary, setSummary] = useState<AvailabilitySummary | null>(null);
  const profile = useMemo(() => getSpecialistAvailabilityProfile(specialist), [specialist]);

  useEffect(() => {
    setSummary(getAvailabilitySummary(profile, getBookingRequests()));
  }, [profile]);

  const nextSlot = summary?.nextSlot
    ? `${formatDisplayDate(summary.nextSlot.date, { weekday: "long", day: "2-digit", month: "long" })} · ${summary.nextSlot.label}`
    : "Sin horarios visibles esta semana. Solicita contacto y revisaremos disponibilidad.";

  return (
    <article className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Agenda</p>
          <h3 className="text-xl font-black">Disponibilidad referencial</h3>
        </div>
        <AvailabilityBadge specialist={specialist} compact />
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-slate-50 p-4">
        <div>
          <span className="text-xs font-black uppercase text-muted">Estado</span>
          <strong className="mt-1 block text-lg text-ink">{summary?.label ?? "Disponible según agenda"}</strong>
          <p className="mt-1 text-sm font-bold leading-6 text-muted">{summary?.detail ?? nextSlot}</p>
        </div>
        <div>
          <span className="text-xs font-black uppercase text-muted">Próximo bloque</span>
          <p className="mt-1 text-sm font-black leading-6 text-ink">{nextSlot}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button className="btn-primary w-full" type="button" data-event="profile_open_agenda" onClick={() => setAgendaOpen(true)}>
          Ver agenda
        </button>
        <button className="btn-secondary w-full" type="button" data-event="profile_instant_contact" onClick={() => setContactOpen((current) => !current)}>
          Contacto inmediato
        </button>
      </div>

      {contactOpen ? (
        <div className="mt-4">
          <InstantContactPanel specialist={specialist} onOpenAgenda={() => setAgendaOpen(true)} />
        </div>
      ) : null}

      <BookingDrawer specialist={specialist} open={agendaOpen} onClose={() => setAgendaOpen(false)} />
    </article>
  );
}
