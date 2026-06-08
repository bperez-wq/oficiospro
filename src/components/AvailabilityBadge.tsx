"use client";

import { useEffect, useState } from "react";
import type { Specialist } from "@/data/mock";
import { getAvailabilitySummary, type AvailabilitySummary } from "@/lib/availability";
import { getBookingRequests, getSpecialistAvailabilityProfile } from "@/lib/bookingStorage";

export function AvailabilityBadge({ specialist, compact = false }: { specialist: Specialist; compact?: boolean }) {
  const [summary, setSummary] = useState<AvailabilitySummary | null>(null);

  useEffect(() => {
    const profile = getSpecialistAvailabilityProfile(specialist);
    setSummary(getAvailabilitySummary(profile, getBookingRequests()));
  }, [specialist]);

  const status = summary?.status ?? "limited";
  const label = summary?.label ?? "Disponibilidad referencial";
  const tone =
    status === "available_now"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : status === "available_today"
        ? "bg-brand-soft text-brand-dark ring-brand/15"
        : status === "next_available"
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-slate-50 text-muted ring-line";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ring-1 ${tone}`}>
      <span className={`h-2 w-2 rounded-full ${status === "unavailable" ? "bg-slate-400" : status === "next_available" ? "bg-amber-500" : "bg-emerald-500"}`} />
      {compact ? label : `${label}${summary?.nextSlot ? ` · ${summary.nextSlot.label}` : ""}`}
    </span>
  );
}
