"use client";

import { useEffect, useMemo, useState } from "react";
import { specialists, type Specialist } from "@/data/mock";
import { SpecialistCard } from "@/components/SpecialistCard";
import { getBookings, getTransactions, getWallet, saveBookings, saveTransactions, saveWallet, seedMockState } from "@/lib/storage";

export function SpecialistsExplorer() {
  const [category, setCategory] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [zone, setZone] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState(4.5);
  const [maxCredits, setMaxCredits] = useState(60);
  const [sort, setSort] = useState("rating");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
  }, []);

  const categories = [...new Set(specialists.map((specialist) => specialist.category))].sort();
  const specialties = [...new Set(specialists.map((specialist) => specialist.specialty))].sort();
  const zones = [...new Set(specialists.map((specialist) => specialist.zone))].sort();

  const visible = useMemo(() => {
    return specialists
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => specialty === "all" || item.specialty === specialty)
      .filter((item) => zone === "all" || item.zone === zone)
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => item.rating >= rating)
      .filter((item) => item.credits <= maxCredits)
      .sort((a, b) => {
        if (sort === "credits") return a.credits - b.credits;
        if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
        if (sort === "distance") return a.distance - b.distance;
        return b.rating - a.rating;
      });
  }, [availability, category, maxCredits, rating, sort, specialty, zone]);

  function reserve(id: string) {
    const specialist = specialists.find((item) => item.id === id) as Specialist | undefined;
    if (!specialist) return;

    const wallet = getWallet();
    if (wallet.balance < specialist.credits) {
      setNotice(`No tienes créditos suficientes para reservar a ${specialist.name}.`);
      return;
    }

    saveWallet({ ...wallet, balance: wallet.balance - specialist.credits });
    saveBookings([
      {
        id: `bk-${Date.now()}`,
        specialistId: specialist.id,
        specialistName: specialist.name,
        service: `Reserva ${specialist.specialty}`,
        date: "2026-06-14",
        time: "11:00",
        status: "Confirmada",
        credits: specialist.credits,
        commune: specialist.zone,
        customer: "Cliente demo",
        channel: "Club Hogar",
      },
      ...getBookings(),
    ]);
    saveTransactions([
      {
        id: `tx-${Date.now()}`,
        type: "Reserva",
        detail: `Reserva ${specialist.specialty}`,
        amount: -specialist.credits,
        date: new Date().toISOString().slice(0, 10),
      },
      ...getTransactions(),
    ]);
    setNotice(`Reserva confirmada con ${specialist.name}. Se descontaron ${specialist.credits} créditos.`);
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
              <option value="all">Todas las categorías</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
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
            Precio en créditos con tarifa dinámica según demanda, horario y disponibilidad. La plataforma libera el pago al finalizar el trabajo.
          </p>
          <div className="grid gap-5 xl:grid-cols-2">
            {visible.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} onReserve={reserve} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
