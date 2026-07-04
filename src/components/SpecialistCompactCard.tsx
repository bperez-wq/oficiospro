"use client";

import Link from "next/link";
import { SpecialistProfileImage } from "@/components/SpecialistProfileImage";
import { availabilityLabels, type Specialist } from "@/data/mock";
import { addSpecialistToBagAndProceed, bagActionLabel } from "@/lib/bag";
import { getPrimaryFlexibleService, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { DEMO_PROFILE_BADGE, isDemoSpecialist } from "@/lib/specialists/demoProfile";
import { getSpecialistLevel, type SpecialistLevel } from "@/lib/trust";

const defaultSourceSection = "featured_specialists_strip";

export const levelChipStyles: Record<SpecialistLevel, string> = {
  Platino: "bg-violet-100 text-violet-700",
  Oro: "bg-gold/15 text-gold",
  Plata: "bg-slate-100 text-slate-600",
  Bronce: "bg-amber-100 text-amber-700",
  Fundador: "bg-brand-soft text-brand-dark",
};

/* Dots neutros: el enum de disponibilidad no está respaldado por agenda real,
 * así que no se colorea como si fuera estado en vivo. */
export const availabilityDotStyles: Record<Specialist["availability"], string> = {
  now: "bg-slate-300",
  today: "bg-slate-300",
  tomorrow: "bg-slate-300",
};

export function SpecialistCompactCard({
  specialist,
  sourceSection = defaultSourceSection,
}: {
  specialist: Specialist;
  sourceSection?: string;
  /** Compatibilidad: ya no abre modal; el CTA agrega a la Bolsa (bag-first). */
  onReserve?: (specialist: Specialist, serviceId: string) => void;
}) {
  const service = getPrimaryFlexibleService(specialist);
  const level = getSpecialistLevel(specialist);
  const jobs = specialist.trabajosCompletados ?? specialist.jobs;
  const profileHref = `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}&sourceSection=${sourceSection}`;
  const action = bagActionLabel(service.pricingMode);
  const hasDistance = typeof specialist.distance === "number" && Number.isFinite(specialist.distance);
  const distanceLabel = hasDistance ? `a ${specialist.distance.toFixed(1).replace(".", ",")} km` : specialist.commune ?? specialist.zone;

  return (
    <article className="group snap-start rounded-[18px] border border-line bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card">
      <div className="flex gap-3">
        <SpecialistProfileImage
          src={specialist.image}
          name={specialist.name}
          specialty={specialist.specialty}
          serviceTypeId={specialist.serviceTypeId}
          category={specialist.category}
          alt={`${specialist.name}, ${specialist.specialty}`}
          className="h-16 w-16 shrink-0 rounded-2xl"
          imageClassName="transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1.5">
            <strong className="truncate text-sm text-ink">{specialist.name}</strong>
            <span role="img" aria-label={`Calificación ${specialist.rating.toFixed(1).replace(".", ",")} de 5`} className="shrink-0 text-xs font-black text-gold"><span aria-hidden>★</span> {specialist.rating.toFixed(1)}</span>
          </div>
          <span className="mt-0.5 block line-clamp-2 text-xs font-bold leading-4 text-muted">{specialist.specialty}</span>
          <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${levelChipStyles[level]}`}>Nivel {level}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-ink">{jobs} trabajos</span>
        <span className="truncate rounded-xl bg-slate-50 px-2 py-1.5 text-muted">{distanceLabel}</span>
      </div>

      <div className="mt-3 min-h-14">
        <span className="text-[11px] font-black uppercase text-muted">Precio</span>
        <strong className="block line-clamp-2 text-sm leading-5 text-ink">{pricingSummary(service)}</strong>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-black text-muted">
        <span className="truncate">{specialist.commune ?? specialist.zone}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-brand-dark">
          {isDemoSpecialist(specialist) ? null : <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${availabilityDotStyles[specialist.availability]}`} />}
          {isDemoSpecialist(specialist) ? DEMO_PROFILE_BADGE : availabilityLabels[specialist.availability]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={profileHref}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
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
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]"
          type="button"
          data-event="specialist_compact_add_to_bag"
          onClick={() => addSpecialistToBagAndProceed({ specialist, service, sourceSection })}
        >
          {action}
        </button>
      </div>
    </article>
  );
}

export function SpecialistCompactCardSkeleton() {
  return (
    <div aria-hidden className="snap-start rounded-[18px] border border-line bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
        <div className="min-w-0 flex-1">
          <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-2 h-3 w-full animate-pulse rounded-md bg-slate-100" />
          <div className="mt-2 h-5 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-7 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-7 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="mt-3 min-h-14">
        <div className="h-3 w-12 animate-pulse rounded-md bg-slate-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
