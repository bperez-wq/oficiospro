"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingDrawer } from "@/components/BookingDrawer";
import { SpecialistCompactCard, SpecialistCompactCardSkeleton } from "@/components/SpecialistCompactCard";
import type { Specialist } from "@/data/mock";
import { getPrimaryFlexibleService } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { recommendationScore } from "@/lib/trust";

const sourceSection = "featured_specialists_strip";
const FEATURED_LIMIT = 8;
const SKELETON_COUNT = 6;
const PROXIMITY_MAX_BONUS_KM = 12;

/** Score de destacados: reputación global + bonus de cercanía.
 *  Si el especialista no tiene `distance` válida, se usa solo recommendationScore(). */
function featuredScore(specialist: Specialist) {
  const hasDistance = typeof specialist.distance === "number" && Number.isFinite(specialist.distance);
  const proximityBonus = hasDistance ? Math.max(0, PROXIMITY_MAX_BONUS_KM - specialist.distance) : 0;
  return recommendationScore(specialist) + proximityBonus;
}

export function FeaturedSpecialistsStrip({ specialists }: { specialists?: Specialist[] }) {
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const loading = !specialists;
  const featuredSpecialists = useMemo(
    () =>
      [...(specialists ?? [])]
        .sort((a, b) => {
          const scoreDiff = featuredScore(b) - featuredScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.trabajosCompletados ?? b.jobs) - (a.trabajosCompletados ?? a.jobs);
        })
        .slice(0, FEATURED_LIMIT),
    [specialists],
  );

  function openBooking(specialist: Specialist, serviceId?: string) {
    const service = serviceId
      ? specialist.servicePricing?.find((item) => item.id === serviceId) ?? getPrimaryFlexibleService(specialist)
      : getPrimaryFlexibleService(specialist);
    preserveSpecialistIntent({
      specialist,
      service,
      intendedAction: "reservar",
      source: "FeaturedSpecialistsStrip",
      sourceSection,
    });
    setSelectedSpecialist(specialist);
    setSelectedServiceId(service.id);
  }

  return (
    <section className="border-b border-line bg-white/92 py-5 shadow-sm">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1 flex items-center gap-2">
              Especialistas destacados
              {featuredSpecialists.length > 0 ? (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-black normal-case tracking-normal text-brand-dark">
                  Top {featuredSpecialists.length}
                </span>
              ) : null}
            </p>
            <h2 className="text-xl font-black text-ink md:text-2xl">Reserva rápido con perfiles mejor evaluados.</h2>
          </div>
          <Link
            href="/especialistas?sourceSection=featured_specialists_strip"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-black text-brand-dark transition hover:text-brand"
          >
            Ver todos
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="no-scrollbar grid auto-cols-[78%] grid-flow-col gap-3.5 overflow-x-auto pb-2 sm:auto-cols-[42%] md:auto-cols-[30%] lg:auto-cols-[185px] xl:auto-cols-[172px]">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <SpecialistCompactCardSkeleton key={index} />
            ))}
          </div>
        ) : featuredSpecialists.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-line bg-slate-50/70 p-8 text-center">
            <p className="text-base font-black text-ink">Aún no hay especialistas destacados.</p>
            <p className="mt-1 text-sm font-semibold text-muted">Explora el directorio completo para encontrar el oficio que necesitas.</p>
            <Link href="/especialistas?sourceSection=featured_specialists_strip_empty" className="btn-secondary mt-5">
              Explorar especialistas
            </Link>
          </div>
        ) : (
          <div className="relative -mx-5">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-white to-transparent lg:block" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-white to-transparent lg:block" />
            <div className="no-scrollbar grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-3.5 overflow-x-auto scroll-smooth scroll-px-5 overscroll-x-contain px-5 pb-2 sm:auto-cols-[42%] md:auto-cols-[30%] lg:auto-cols-[185px] xl:auto-cols-[172px]">
              {featuredSpecialists.map((specialist) => (
                <SpecialistCompactCard key={specialist.id} specialist={specialist} sourceSection={sourceSection} onReserve={openBooking} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedSpecialist ? (
        <BookingDrawer
          specialist={selectedSpecialist}
          open={Boolean(selectedSpecialist)}
          initialSelectedServiceId={selectedServiceId}
          sourceSection={sourceSection}
          onClose={() => setSelectedSpecialist(null)}
        />
      ) : null}
    </section>
  );
}
