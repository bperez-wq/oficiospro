"use client";

import { useEffect, useMemo, useState } from "react";
import { specialists, type Specialist } from "@/data/mock";
import { chileCommunes } from "@/data/chileCommunes";
import { allServiceSpecialties, distanceInKm, getSpecialtiesByServiceType, serviceTypes } from "@/data/marketplace";
import { SpecialistCard } from "@/components/SpecialistCard";
import {
  getBookings,
  getClientProfile,
  getMockSession,
  getPublishedSpecialists,
  getTransactions,
  getWallet,
  saveBookings,
  saveTransactions,
  saveWallet,
  seedMockState,
} from "@/lib/storage";

export function SpecialistsExplorer() {
  const [category, setCategory] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [zone, setZone] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState(4.5);
  const [maxCredits, setMaxCredits] = useState(60);
  const [sort, setSort] = useState("rating");
  const [withinCoverage, setWithinCoverage] = useState(false);
  const [clientLat, setClientLat] = useState(-33.4088);
  const [clientLng, setClientLng] = useState(-70.5673);
  const [approvedSpecialists, setApprovedSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
    setApprovedSpecialists(getPublishedSpecialists());
    const clientProfile = getClientProfile();
    if (clientProfile?.lat && clientProfile?.lng) {
      setClientLat(clientProfile.lat);
      setClientLng(clientProfile.lng);
      setZone(clientProfile.commune);
      setNotice(`Mostrando especialistas cerca de ${clientProfile.commune}. Tu ubicación exacta no se publica.`);
    }
  }, []);

  useEffect(() => {
    setSpecialty("all");
  }, [category]);

  const specialties =
    category === "all"
      ? [...new Set(allServiceSpecialties.map((item) => item.name))].sort()
      : getSpecialtiesByServiceType(category);
  const marketplaceSpecialists = useMemo(() => [...specialists, ...approvedSpecialists], [approvedSpecialists]);
  const zones = [...new Set([...chileCommunes.map((commune) => commune.name), ...marketplaceSpecialists.map((specialist) => specialist.commune ?? specialist.zone)])].sort();

  useEffect(() => {
    const reserveId = new URLSearchParams(window.location.search).get("reserve");
    if (!reserveId || !getMockSession()) return;
    const specialist = marketplaceSpecialists.find((item) => item.id === reserveId);
    if (specialist) setSelectedSpecialist(specialist);
  }, [marketplaceSpecialists]);

  const visible = useMemo(() => {
    const clientLocation = { lat: clientLat, lng: clientLng };

    return marketplaceSpecialists
      .map((item) => ({
        ...item,
        distance: item.geo ? Number(distanceInKm(clientLocation, item.geo).toFixed(1)) : item.distance,
      }))
      .filter((item) => category === "all" || item.serviceTypeId === category)
      .filter((item) => specialty === "all" || item.specialty === specialty || item.specialties?.includes(specialty))
      .filter((item) => zone === "all" || item.zone === zone || item.commune === zone)
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => item.rating >= rating)
      .filter((item) => item.credits <= maxCredits)
      .filter((item) => !withinCoverage || item.distance <= (item.coverageRadiusKm ?? 999))
      .sort((a, b) => {
        if (sort === "credits") return a.credits - b.credits;
        if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
        if (sort === "distance") return a.distance - b.distance;
        return b.rating - a.rating;
      });
  }, [availability, category, clientLat, clientLng, marketplaceSpecialists, maxCredits, rating, sort, specialty, withinCoverage, zone]);

  function reserve(id: string) {
    const specialist = marketplaceSpecialists.find((item) => item.id === id) as Specialist | undefined;
    if (!specialist) return;
    if (!getMockSession()) {
      window.location.href = `/registro-cliente?reserve=${specialist.id}`;
      return;
    }
    setSelectedSpecialist(specialist);
  }

  function confirmReservation() {
    if (!selectedSpecialist) return;

    const wallet = getWallet();
    if (wallet.balance < selectedSpecialist.credits) {
      setNotice(`No tienes créditos suficientes para reservar a ${selectedSpecialist.name}.`);
      return;
    }

    saveWallet({ ...wallet, balance: wallet.balance - selectedSpecialist.credits });
    saveBookings([
      {
        id: `bk-${Date.now()}`,
        specialistId: selectedSpecialist.id,
        specialistName: selectedSpecialist.name,
        service: `Reserva ${selectedSpecialist.specialty}`,
        date: "2026-06-14",
        time: "11:00",
        status: "Confirmada",
        credits: selectedSpecialist.credits,
        commune: selectedSpecialist.zone,
        customer: "Cliente OficiosPro",
        channel: "Club Hogar",
      },
      ...getBookings(),
    ]);
    saveTransactions([
      {
        id: `tx-${Date.now()}`,
        type: "Reserva",
        detail: `Reserva ${selectedSpecialist.specialty}`,
        amount: -selectedSpecialist.credits,
        date: new Date().toISOString().slice(0, 10),
      },
      ...getTransactions(),
    ]);
    setNotice(`Reserva confirmada con ${selectedSpecialist.name}. Se descontaron ${selectedSpecialist.credits} créditos.`);
    setSelectedSpecialist(null);
  }

  return (
    <div className="grid gap-6">
      {notice ? (
        <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark shadow-sm">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-5 rounded-[28px] border border-line bg-white p-5 shadow-soft lg:grid-cols-[290px_1fr]">
        <aside className="grid gap-4 rounded-3xl bg-slate-50 p-5">
          <div>
            <p className="eyebrow">Busca por confianza</p>
            <h2 className="text-2xl font-black">Filtra especialistas</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">Compara reputación, cercanía, disponibilidad y precio en créditos.</p>
          </div>
          <label className="field">
            Tipo de servicio
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todos los tipos</option>
              {serviceTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Especialidad
            <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
              <option value="all">Todas las especialidades</option>
              {specialties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Comuna
            <select value={zone} onChange={(event) => setZone(event.target.value)}>
              <option value="all">Todas las comunas</option>
              {zones.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Disponibilidad
            <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
              <option value="all">Cualquier horario</option>
              <option value="now">Disponible ahora</option>
              <option value="today">Disponible hoy</option>
              <option value="tomorrow">Disponible mañana</option>
            </select>
          </label>
          <label className="field">
            Ordenar por
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="rating">Mejor calificación</option>
              <option value="credits">Menos créditos</option>
              <option value="response">Respuesta rápida</option>
              <option value="distance">Más cercano</option>
            </select>
          </label>
          <label className="field">
            Calificación mínima {rating.toFixed(1)}
            <input min="3.5" max="5" step="0.1" type="range" value={rating} onChange={(event) => setRating(Number(event.target.value))} />
          </label>
          <label className="field">
            Hasta {maxCredits} créditos
            <input min="15" max="80" step="5" type="range" value={maxCredits} onChange={(event) => setMaxCredits(Number(event.target.value))} />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-black text-slate-700">
            <input type="checkbox" checked={withinCoverage} onChange={(event) => setWithinCoverage(event.target.checked)} />
            Solo especialistas que cubren mi ubicación
          </label>
          <div className="grid gap-3 rounded-2xl border border-line bg-white p-4">
            <p className="text-sm font-black text-ink">Ubicación del cliente</p>
            <label className="field">
              Latitud
              <input type="number" step="0.0001" value={clientLat} onChange={(event) => setClientLat(Number(event.target.value))} />
            </label>
            <label className="field">
              Longitud
              <input type="number" step="0.0001" value={clientLng} onChange={(event) => setClientLng(Number(event.target.value))} />
            </label>
            <div className="relative min-h-36 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e8f4f1_25%,#f8fbfa_25%,#f8fbfa_50%,#e8f4f1_50%,#e8f4f1_75%,#f8fbfa_75%)] bg-[length:28px_28px]">
              <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-xs font-black text-white shadow-card">
                Tú
              </span>
            </div>
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Especialistas disponibles</p>
              <h2 className="text-3xl font-black md:text-4xl">Técnicos recomendados</h2>
            </div>
            <strong className="chip bg-brand-soft text-brand-dark">{visible.length} resultados</strong>
          </div>
          <p className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
            Precio en créditos con tarifa dinámica. La distancia se calcula usando latitud/longitud del cliente y especialista; cada perfil tiene radio de cobertura.
          </p>
          <section className="rounded-[24px] border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Especialistas cerca de ti</h3>
                <p className="text-sm font-bold text-muted">Vista de mapa referencial con cobertura y distancia aproximada.</p>
              </div>
              <span className="chip bg-brand-soft text-brand-dark">{visible.slice(0, 5).length} cercanos</span>
            </div>
            <div className="relative mt-4 min-h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#e8f4f1_25%,#f8fbfa_25%,#f8fbfa_50%,#e8f4f1_50%,#e8f4f1_75%,#f8fbfa_75%)] bg-[length:34px_34px]">
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-xs font-black text-white shadow-card">
                Tú
              </span>
              {visible.slice(0, 5).map((specialist, index) => (
                <span
                  key={specialist.id}
                  className="absolute grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-brand text-xs font-black text-white shadow-card"
                  style={{
                    left: `${20 + (index * 14) % 58}%`,
                    top: `${22 + (index * 19) % 52}%`,
                  }}
                  title={`${specialist.name} · ${specialist.distance} km`}
                >
                  {specialist.initials}
                </span>
              ))}
            </div>
          </section>
          <div className="grid gap-5 xl:grid-cols-2">
            {visible.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} onReserve={reserve} />
            ))}
          </div>
        </div>
      </section>
      {selectedSpecialist ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4">
          <article className="w-full max-w-xl rounded-[28px] border border-line bg-white p-6 shadow-card">
            <p className="eyebrow">Confirmar reserva</p>
            <h2 className="text-3xl font-black">{selectedSpecialist.name}</h2>
            <p className="mt-2 font-semibold leading-7 text-muted">
              {selectedSpecialist.specialty} en {selectedSpecialist.zone}. Se descontarán {selectedSpecialist.credits} créditos al confirmar.
            </p>
            <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted">
              <span>Distancia aproximada: {selectedSpecialist.distance} km</span>
              <span>Radio de cobertura: {selectedSpecialist.coverageRadiusKm ?? 0} km</span>
              <span>Pago liberado al finalizar el trabajo.</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary flex-1" type="button" onClick={confirmReservation}>
                Confirmar reserva
              </button>
              <button className="btn-secondary flex-1" type="button" onClick={() => setSelectedSpecialist(null)}>
                Cancelar
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
