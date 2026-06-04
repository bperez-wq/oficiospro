"use client";

import { useEffect, useMemo, useState } from "react";
import { specialists, type Specialist } from "@/data/mock";
import { SpecialistCard } from "@/components/SpecialistCard";
import { getBookings, getTransactions, getWallet, saveBookings, saveTransactions, saveWallet, seedMockState } from "@/lib/storage";

export function SpecialistsExplorer() {
  const [specialty, setSpecialty] = useState("all");
  const [zone, setZone] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState(4.5);
  const [sort, setSort] = useState("rating");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
  }, []);

  const specialties = [...new Set(specialists.map((specialist) => specialist.specialty))].sort();
  const zones = [...new Set(specialists.map((specialist) => specialist.zone))].sort();

  const visible = useMemo(() => {
    return specialists
      .filter((item) => specialty === "all" || item.specialty === specialty)
      .filter((item) => zone === "all" || item.zone === zone)
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => item.rating >= rating)
      .sort((a, b) => {
        if (sort === "credits") return a.credits - b.credits;
        if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
        return b.rating - a.rating;
      });
  }, [availability, rating, sort, specialty, zone]);

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
      {notice ? <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

      <section className="panel grid gap-4 md:grid-cols-5 md:items-end">
        <label className="field">
          Especialidad
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
            <option value="all">Todas</option>
            {specialties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Comuna
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            <option value="all">Todas</option>
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
          Orden
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="rating">Mejor calificación</option>
            <option value="credits">Menos créditos</option>
            <option value="response">Respuesta rápida</option>
          </select>
        </label>
        <label className="field">
          Calificación {rating.toFixed(1)}
          <input min="3.5" max="5" step="0.1" type="range" value={rating} onChange={(event) => setRating(Number(event.target.value))} />
        </label>
      </section>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <strong className="chip bg-brand-soft text-brand-dark">{visible.length} especialistas</strong>
        <span className="text-sm font-bold text-muted">Precio en créditos, con tarifa dinámica según demanda y disponibilidad.</span>
      </div>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {visible.map((specialist) => (
          <SpecialistCard key={specialist.id} specialist={specialist} onReserve={reserve} />
        ))}
      </section>
    </div>
  );
}
