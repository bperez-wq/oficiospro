"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConversionButton } from "@/components/ConversionModal";
import { SpecialistProfileAvailability } from "@/components/SpecialistProfileAvailability";
import { availabilityLabels, specialists, type Specialist } from "@/data/mock";
import { bookingPrimaryAction, formatDurationRange, getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import { getPublishedSpecialists, seedMockState } from "@/lib/storage";

export function SpecialistPublicProfile({ id, initialSpecialist = null }: { id: string; initialSpecialist?: Specialist | null }) {
  const [specialist, setSpecialist] = useState<Specialist | null>(initialSpecialist);
  const [loaded, setLoaded] = useState(Boolean(initialSpecialist));

  useEffect(() => {
    const pathId = window.location.pathname.split("/").filter(Boolean).at(-1) ?? id;
    if (initialSpecialist && (initialSpecialist.id === pathId || initialSpecialist.slug === pathId)) return;
    seedMockState();
    const all = [...specialists, ...getPublishedSpecialists()];
    setSpecialist(all.find((item) => item.id === pathId || item.slug === pathId || item.id === id || item.slug === id) ?? null);
    setLoaded(true);
  }, [id, initialSpecialist]);

  if (!loaded) return <section>Cargando perfil...</section>;

  if (!specialist) {
    return (
      <section className="grid gap-6">
        <section className="rounded-[32px] border border-line bg-white p-8 shadow-soft">
          <p className="eyebrow">Perfil no encontrado</p>
          <h1 className="mt-3 text-4xl font-black text-ink">No encontramos este especialista.</h1>
          <Link className="btn-secondary mt-6 inline-flex" href="/especialistas">
            Volver a especialistas
          </Link>
        </section>
      </section>
    );
  }

  return <SpecialistProfileView specialist={specialist} />;
}

export function SpecialistProfileView({ specialist }: { specialist: Specialist }) {
  const primaryService = useMemo(() => getPrimaryFlexibleService(specialist), [specialist]);
  const services = specialist.servicePricing?.length ? specialist.servicePricing : [primaryService];

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
        <div className="relative h-[460px]">
          <img src={specialist.image} alt={specialist.name} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-6 text-white">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-xl font-black text-white shadow-lg">{specialist.initials}</span>
                <div>
                  <h2 className="text-3xl font-black">{specialist.specialty}</h2>
                  <p className="font-bold text-white/80">{specialist.commune ?? specialist.zone}</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-dark">{availabilityLabels[specialist.availability]}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <SmallStat label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
            <SmallStat label="Trabajos" value={(specialist.trabajosCompletados ?? specialist.jobs).toString()} />
            <SmallStat label="Respuesta" value={specialist.responseTime} />
            <SmallStat label="Precio desde" value={`${specialist.precioDesdeCreditos ?? specialist.credits} créditos`} />
          </div>
          <section>
            <h2 className="text-2xl font-black">Servicios ofrecidos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <article key={service.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink">{service.name}</strong>
                    <span className="chip bg-white text-brand-dark">{pricingModeLabel(service.pricingMode)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">{service.description}</p>
                  <strong className="mt-3 block text-lg font-black text-ink">{pricingSummary(service)}</strong>
                  <p className="mt-1 text-sm font-bold text-muted">{formatDurationRange(service)}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{pricingDetail(service)}</p>
                </article>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-black">Referencias verificadas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: Math.max(1, specialist.validation?.references ?? 0) }).slice(0, 3).map((_, index) => (
                <div key={index} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
                  Referencia verificada {index + 1}
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
      <aside className="grid gap-5 self-start lg:sticky lg:top-28">
        <article className="panel">
          <span className="font-bold text-muted">Precio desde</span>
          <strong className="block text-4xl font-black">{pricingSummary(primaryService)}</strong>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">{pricingDetail(primaryService)}</p>
          <ConversionButton type="reserva_especialista" sourceButton="Reservar desde perfil" specialist={specialist} className="btn-primary mt-5 w-full">
            Reservar
          </ConversionButton>
          <ConversionButton type="reserva_especialista" sourceButton="Consultar disponibilidad especialista" specialist={specialist} className="btn-secondary mt-3 w-full">
            Consultar disponibilidad
          </ConversionButton>
        </article>
        <article className="panel">
          <h3 className="text-xl font-black">Cobertura</h3>
          <div className="mt-4 grid gap-2 text-sm font-bold text-muted">
            <span className="rounded-2xl bg-slate-50 p-3">Comuna base: {specialist.commune ?? specialist.zone}</span>
            <span className="rounded-2xl bg-slate-50 p-3">Radio aproximado: {specialist.coverageRadiusKm ?? 0} km</span>
          </div>
        </article>
        <article className="panel">
          <h3 className="text-xl font-black">Certificaciones</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(specialist.certifications.length ? specialist.certifications : ["Validación OficiosPro"]).map((item) => <span key={item} className="chip bg-brand-soft text-brand-dark">{item}</span>)}
          </div>
        </article>
        <SpecialistProfileAvailability specialist={specialist} />
      </aside>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <strong className="block text-xl font-black">{value}</strong>
      <span className="text-sm font-bold text-muted">{label}</span>
    </article>
  );
}
