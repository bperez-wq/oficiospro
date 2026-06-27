"use client";

import { useState, type FormEvent } from "react";
import { submitSpecialistRecommendation } from "@/lib/community/recommendations";

type Props = {
  trade?: string;
  tradeLabel?: string;
  commune?: string;
  region?: string;
  /** Prefill when recommending a specific business (e.g. from a map listing). */
  defaultName?: string;
  externalPlaceId?: string;
  source?: "community" | "osm" | "google_places";
};

const inputClass = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand";

export function RecommendSpecialistCard({
  trade,
  tradeLabel,
  commune,
  region,
  defaultName = "",
  externalPlaceId,
  source = "community",
}: Props) {
  const [name, setName] = useState(defaultName);
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState("");
  const [recommenderContact, setRecommenderContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const oficio = tradeLabel || trade || "especialista";
  const zona = commune ? ` en ${commune}` : "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || state === "sending") return;
    setState("sending");
    const result = await submitSpecialistRecommendation({
      recommendedName: name,
      trade,
      commune,
      region,
      recommendedContact: contact,
      reason,
      recommenderContact,
      source,
      externalPlaceId,
    });
    setState(result.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft/60 p-5 text-center">
        <p className="text-sm font-black text-brand-dark">Gracias por recomendar</p>
        <p className="mt-1 text-sm font-bold leading-6 text-ink">
          Vamos a contactar a {name.trim()} para sumarlo a OficiosPro. Damos prioridad a quienes hacen buen
          trabajo y reconocemos a quienes recomiendan.
        </p>
        <button className="btn-secondary mt-3 px-4 py-2 text-xs" type="button" onClick={() => { setName(""); setContact(""); setReason(""); setRecommenderContact(""); setState("idle"); }}>
          Recomendar a otro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div>
        <p className="eyebrow">Suma a tu maestro de confianza</p>
        <h3 className="text-lg font-black text-ink">Recomienda un buen {oficio}{zona}</h3>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Si conoces a alguien que hace bien el trabajo, recomiendalo. Lo invitamos a OficiosPro y le damos mas
          oportunidades de trabajo.
        </p>
      </div>

      <label className="grid gap-1 text-xs font-black text-muted">
        Nombre del especialista o empresa *
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juan Perez / Gasfiteria Sur" required />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-black text-muted">
          Contacto del especialista (opcional)
          <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telefono, WhatsApp o correo" />
        </label>
        <label className="grid gap-1 text-xs font-black text-muted">
          Tu contacto para reconocerte (opcional)
          <input className={inputClass} value={recommenderContact} onChange={(e) => setRecommenderContact(e.target.value)} placeholder="Para avisarte y premiarte" />
        </label>
      </div>

      <label className="grid gap-1 text-xs font-black text-muted">
        Por que lo recomiendas (opcional)
        <textarea className={`${inputClass} min-h-16 resize-y`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Cumplido, ordenado, buen precio, buen trato..." />
      </label>

      {state === "error" ? (
        <p className="text-xs font-bold text-red-600">No pudimos enviar la recomendacion. Intenta de nuevo en un momento.</p>
      ) : null}

      <button className="btn-primary justify-center px-4 py-2.5 text-sm" type="submit" disabled={state === "sending" || !name.trim()}>
        {state === "sending" ? "Enviando..." : "Recomendar a OficiosPro"}
      </button>
      <p className="text-[11px] font-bold leading-5 text-muted">
        Tu recomendacion ayuda a que mas especialistas tengan oportunidades. Solo la usamos para invitarlos y, si
        dejaste tu contacto, para reconocerte.
      </p>
    </form>
  );
}
