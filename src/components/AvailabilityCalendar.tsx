"use client";

import type { AvailabilityProfile } from "@/data/availability";
import { formatDisplayDate, getSlotsForDate, getWeekDates } from "@/lib/availability";
import type { BookingRequest } from "@/lib/bookingStorage";

export function AvailabilityCalendar({
  profile,
  bookings,
  selectedDate,
  onSelectDate,
}: {
  profile: AvailabilityProfile;
  bookings: BookingRequest[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const week = getWeekDates();

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Agenda semanal</p>
          <h3 className="text-2xl font-black">Elige un día disponible</h3>
        </div>
        <span className="chip bg-brand-soft text-brand-dark">America/Santiago</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {week.map((dateKey) => {
          const slots = getSlotsForDate(profile, dateKey, bookings);
          const availableCount = slots.filter((slot) => slot.available).length;
          const active = dateKey === selectedDate;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-brand/40 ${
                active ? "border-brand bg-brand-soft shadow-soft" : "border-line bg-white"
              }`}
            >
              <span className="block text-xs font-black uppercase text-muted">{formatDisplayDate(dateKey, { weekday: "short" })}</span>
              <strong className="mt-1 block text-lg text-ink">{formatDisplayDate(dateKey, { day: "2-digit", month: "short" })}</strong>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${availableCount ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-muted"}`}>
                {availableCount ? `${availableCount} horarios` : "Sin horarios"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
