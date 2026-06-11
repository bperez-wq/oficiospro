"use client";

import Link from "next/link";
import { useMemo } from "react";
import { availabilityDotStyles, levelChipStyles } from "@/components/SpecialistCompactCard";
import { availabilityLabels, type Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";
import { addSpecialistToBagAndProceed, bagActionLabel } from "@/lib/bag";
import { getPrimaryFlexibleService, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getSpecialistLevel, getTrustBadges } from "@/lib/trust";

const shortBadgeLabels: Record<string, string> = {
  "Identidad verificada": "Verificado",
  "Referencias revisadas": "Referencias",
  "Certificacion cargada": "Certificado",
  "Respuesta rapida": "Resp. rápida",
  "Top especialista": "Top",
};

export function SpecialistGridCard({
  specialist,
  matchedService,
  searchIntent,
  highlightedCreditPrice,
  sourceSection = "specialists_explorer_grid",
}: {
  specialist: Specialist;
  matchedService?: FlexibleService | null;
  searchIntent?: string;
  highlightedCreditPrice?: string;
  /** Compatibilidad: ya no abre modal; el CTA agrega a la Bolsa (bag-first). */
  onReserve?: (id: string, service?: FlexibleService | null) => void;
  sourceSection?: string;
}) {
  const primaryService = useMemo(() => getPrimaryFlexibleService(specialist), [specialist]);
  const displayService = matchedService ?? primaryService;
  const level = getSpecialistLevel(specialist);
  const jobs = specialist.trabajosCompletados ?? specialist.jobs;
  const badges = useMemo(() => getTrustBadges(specialist).slice(0, 2), [specialist]);
  const profileHref = `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}&sourceSection=${sourceSection}`;
  const action = bagActionLabel(displayService.pricingMode);
  const hasDistance = typeof specialist.distance === "number" && Number.isFinite(specialist.distance);

  function addToBag() {
    addSpecialistToBagAndProceed({ specialist, service: displayService, sourceSection });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card">
      <div className="relative h-32 overflow-hidden bg-brand-soft">
        <img
          src={specialist.image}
          alt={`${specialist.name}, ${specialist.specialty} en ${specialist.zone}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink/55 to-transparent" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-brand-dark shadow-soft backdrop-blur">
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${availabilityDotStyles[specialist.availability]}`} />
          {availabilityLabels[specialist.availability]}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur">
          ★ {specialist.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="min-w-0">
          <strong className="block truncate text-sm text-ink">{specialist.name}</strong>
          <span className="block truncate text-xs font-bold text-muted">{specialist.specialty}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black">
          <span className={`rounded-full px-2 py-0.5 ${levelChipStyles[level]}`}>{level}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-muted">{jobs} trabajos</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-muted">Resp. {specialist.responseTime}</span>
        </div>

        {badges.length ? (
          <div className="flex flex-wrap gap-1.5 text-[10px] font-black text-emerald-700">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                ✓ {shortBadgeLabels[badge] ?? badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-xl bg-brand-soft/50 px-2.5 py-2">
          <span className="block text-[10px] font-black uppercase text-muted">{searchIntent ? "Servicio relacionado" : "Precio"}</span>
          <strong className="block truncate text-sm font-black text-ink" title={highlightedCreditPrice ?? pricingSummary(displayService)}>
            {highlightedCreditPrice ?? pricingSummary(displayService)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] font-black text-muted">
          <span className="truncate">{specialist.commune ?? specialist.zone}</span>
          {hasDistance ? <span className="shrink-0 text-brand-dark">a {specialist.distance.toFixed(1).replace(".", ",")} km</span> : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            href={profileHref}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-white px-2 text-xs font-black text-brand-dark transition duration-200 hover:border-brand hover:bg-brand-soft active:scale-[0.98]"
            onClick={() =>
              preserveSpecialistIntent({
                specialist,
                service: displayService,
                intendedAction: "solicitar",
                source: "SpecialistGridCard",
                sourceSection,
              })
            }
          >
            Ver perfil
          </Link>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition duration-200 hover:bg-brand-dark active:scale-[0.98]"
            type="button"
            data-event="specialist_grid_add_to_bag"
            onClick={addToBag}
          >
            {action}
          </button>
        </div>
      </div>
    </article>
  );
}
