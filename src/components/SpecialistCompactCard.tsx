"use client";

import Link from "next/link";
import { availabilityLabels, type Specialist } from "@/data/mock";
import { bookingPrimaryAction, getPrimaryFlexibleService, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getSpecialistLevel } from "@/lib/trust";

const defaultSourceSection = "featured_specialists_strip";

export function SpecialistCompactCard({
  specialist,
  sourceSection = defaultSourceSection,
  onReserve,
}: {
  specialist: Specialist;
  sourceSection?: string;
  onReserve: (specialist: Specialist, serviceId: string) => void;
}) {
  const service = getPrimaryFlexibleService(specialist);
  const level = getSpecialistLevel(specialist);
  const jobs = specialist.trabajosCompletados ?? specialist.jobs;
  const profileHref = `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}&sourceSection=${sourceSection}`;
  const action = bookingPrimaryAction(service).includes("cotizacion") ? "Cotizar" : "Reservar";

  return (
    <article className="group snap-start rounded-[18px] border border-line bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card">
      <div className="flex gap-3">
        <img src={specialist.image} alt={`${specialist.name}, ${specialist.specialty}`} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0">
          <strong className="block truncate text-sm text-ink">{specialist.name}</strong>
          <span className="mt-0.5 block line-clamp-2 text-xs font-bold leading-4 text-muted">{specialist.specialty}</span>
          <span className="mt-1 inline-flex rounded-full bg-gold/15 px-2 py-1 text-[11px] font-black text-gold">Nivel {level}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-ink">Rating {specialist.rating.toFixed(1)}</span>
        <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-muted">{jobs} trabajos</span>
      </div>

      <div className="mt-3 min-h-14">
        <span className="text-[11px] font-black uppercase text-muted">Precio</span>
        <strong className="block line-clamp-2 text-sm leading-5 text-ink">{pricingSummary(service)}</strong>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-black text-muted">
        <span className="truncate">{specialist.commune ?? specialist.zone}</span>
        <span className="shrink-0 text-brand-dark">{availabilityLabels[specialist.availability]}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={profileHref}
          className="inline-flex min-h-9 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition hover:border-brand hover:bg-brand-soft"
          onClick={() =>
            preserveSpecialistIntent({
              specialist,
              service,
              intendedAction: "solicitar",
              source: "SpecialistCompactCard",
              sourceSection,
            })
          }
        >
          Ver perfil
        </Link>
        <button
          className="inline-flex min-h-9 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition hover:bg-brand-dark"
          type="button"
          data-event="specialist_compact_reserve"
          onClick={() => onReserve(specialist, service.id)}
        >
          {action}
        </button>
      </div>
    </article>
  );
}
