"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingDrawer } from "@/components/BookingDrawer";
import { availabilityLabels, type Specialist } from "@/data/mock";
import { bookingPrimaryAction, getPrimaryFlexibleService, pricingSummary } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getSpecialistLevel, getTrustBadges, recommendationScore, type SpecialistLevel } from "@/lib/trust";

const sourceSection = "featured_specialists_strip";
const levelWeight: Record<SpecialistLevel, number> = {
  Fundador: 0,
  Bronce: 1,
  Plata: 2,
  Oro: 3,
  Platino: 4,
};

export function FeaturedSpecialistsStrip({ specialists }: { specialists: Specialist[] }) {
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const featuredSpecialists = useMemo(
    () =>
      [...specialists]
        .sort((a, b) => {
          const aLevel = levelWeight[getSpecialistLevel(a)];
          const bLevel = levelWeight[getSpecialistLevel(b)];
          if (bLevel !== aLevel) return bLevel - aLevel;
          if (b.rating !== a.rating) return b.rating - a.rating;
          const bJobs = b.trabajosCompletados ?? b.jobs;
          const aJobs = a.trabajosCompletados ?? a.jobs;
          if (bJobs !== aJobs) return bJobs - aJobs;
          const bQuick = getTrustBadges(b).includes("Respuesta rapida") ? 1 : 0;
          const aQuick = getTrustBadges(a).includes("Respuesta rapida") ? 1 : 0;
          if (bQuick !== aQuick) return bQuick - aQuick;
          return recommendationScore(b) - recommendationScore(a);
        })
        .slice(0, 8),
    [specialists],
  );

  function openBooking(specialist: Specialist) {
    const service = getPrimaryFlexibleService(specialist);
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
            <p className="eyebrow mb-1">Especialistas destacados</p>
            <h2 className="text-xl font-black text-ink md:text-2xl">Reserva rápido con perfiles mejor evaluados.</h2>
          </div>
          <Link href="/especialistas?sourceSection=featured_specialists_strip" className="hidden text-sm font-black text-brand-dark hover:text-brand md:inline-flex">
            Ver todos
          </Link>
        </div>

        <div className="no-scrollbar grid auto-cols-[78%] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:auto-cols-[42%] md:auto-cols-[30%] lg:auto-cols-[185px] xl:auto-cols-[172px]">
          {featuredSpecialists.map((specialist) => {
            const service = getPrimaryFlexibleService(specialist);
            const level = getSpecialistLevel(specialist);
            const jobs = specialist.trabajosCompletados ?? specialist.jobs;
            const profileHref = `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}&sourceSection=${sourceSection}`;
            const action = bookingPrimaryAction(service).includes("cotizacion") ? "Cotizar" : "Reservar";

            return (
              <article key={specialist.id} className="group snap-start rounded-[18px] border border-line bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card">
                <div className="flex gap-3">
                  <img src={specialist.image} alt={`${specialist.name}, ${specialist.specialty}`} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-ink">{specialist.name}</strong>
                    <span className="mt-0.5 block line-clamp-2 text-xs font-bold leading-4 text-muted">{specialist.specialty}</span>
                    <span className="mt-1 inline-flex rounded-full bg-gold/15 px-2 py-1 text-[11px] font-black text-gold">Nivel {level}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black">
                  <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-ink">★ {specialist.rating.toFixed(1)}</span>
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
                        source: "FeaturedSpecialistsStrip",
                        sourceSection,
                      })
                    }
                  >
                    Ver perfil
                  </Link>
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-xl bg-brand px-2 text-xs font-black text-white transition hover:bg-brand-dark"
                    type="button"
                    data-event="featured_specialist_reserve"
                    onClick={() => openBooking(specialist)}
                  >
                    {action}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
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
