"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingDrawer } from "@/components/BookingDrawer";
import { SpecialistCompactCard } from "@/components/SpecialistCompactCard";
import type { Specialist } from "@/data/mock";
import { getPrimaryFlexibleService } from "@/lib/flexiblePricing";
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
            <p className="eyebrow mb-1">Especialistas destacados</p>
            <h2 className="text-xl font-black text-ink md:text-2xl">Reserva rápido con perfiles mejor evaluados.</h2>
          </div>
          <Link href="/especialistas?sourceSection=featured_specialists_strip" className="hidden text-sm font-black text-brand-dark hover:text-brand md:inline-flex">
            Ver todos
          </Link>
        </div>

        <div className="no-scrollbar grid auto-cols-[78%] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:auto-cols-[42%] md:auto-cols-[30%] lg:auto-cols-[185px] xl:auto-cols-[172px]">
          {featuredSpecialists.map((specialist) => (
            <SpecialistCompactCard key={specialist.id} specialist={specialist} sourceSection={sourceSection} onReserve={openBooking} />
          ))}
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
