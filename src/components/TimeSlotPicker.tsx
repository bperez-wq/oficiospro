"use client";

import type { TimeSlot } from "@/lib/availability";

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
}: {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}) {
  const available = slots.filter((slot) => slot.available);

  if (!available.length) {
    return (
      <div className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
        Sin horarios visibles esta semana. Solicita contacto y revisaremos disponibilidad.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-black uppercase text-muted">Horarios disponibles</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {available.map((slot) => {
          const active = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime;
          return (
            <button
              key={`${slot.date}-${slot.startTime}`}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand/40 ${
                active ? "border-brand bg-brand-soft text-brand-dark shadow-soft" : "border-line bg-white text-ink"
              }`}
            >
              <strong className="block text-sm">{slot.label}</strong>
              <span className="text-xs font-bold text-muted">Disponible según agenda</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
