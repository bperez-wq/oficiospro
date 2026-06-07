"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { communeOptions, heroServiceTypeOptions, OTHER_SERVICE_VALUE } from "@/lib/catalog";

const suggestedTags = ["gasfíter", "calefont", "aire acondicionado", "Vitacura", "filtración", "riego"];
const heroTypeOptions = [
  ...heroServiceTypeOptions,
  {
    value: OTHER_SERVICE_VALUE,
    label: "Otro / No encontré mi servicio",
    meta: "Describe la necesidad y la revisamos como demanda no cubierta.",
  },
];

export function HeroSearchPanel() {
  const [query, setQuery] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [commune, setCommune] = useState("");
  const [otherServiceDescription, setOtherServiceDescription] = useState("");

  function submit() {
    const params = new URLSearchParams();
    const finalQuery = serviceTypeId === OTHER_SERVICE_VALUE && otherServiceDescription.trim() ? otherServiceDescription.trim() : query.trim();
    if (finalQuery) params.set("q", finalQuery);
    if (serviceTypeId && serviceTypeId !== OTHER_SERVICE_VALUE) params.set("tipo", serviceTypeId);
    if (commune) params.set("comuna", commune);
    const queryString = params.toString();
    window.location.href = queryString ? `/especialistas?${queryString}` : "/especialistas";
  }

  return (
    <div className="relative z-20 mt-8 rounded-[28px] border border-line bg-white/95 p-5 shadow-card backdrop-blur md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-brand via-accent to-sun" />
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_0.9fr_auto] lg:items-end lg:gap-5">
        <label className="field">
          ¿Qué necesitas resolver?
          <span className="relative block">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="!pl-11"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej: reparar calefont, filtración, riego, aire acondicionado"
            />
          </span>
        </label>
        <SearchableSelect
          label="Tipo de servicio"
          value={serviceTypeId}
          options={heroTypeOptions}
          onChange={(value) => {
            setServiceTypeId(value);
            if (value !== OTHER_SERVICE_VALUE) setOtherServiceDescription("");
          }}
          placeholder="Hogar, empresas, riego..."
          dropdownClassName="sm:min-w-[380px]"
        />
        <SearchableSelect
          label="Comuna"
          value={commune}
          options={communeOptions}
          onChange={setCommune}
          placeholder="Vitacura, Curicó, Talca..."
        />
        <button className="btn-primary h-12 w-full px-6 lg:w-auto" type="button" onClick={submit}>
          Buscar especialista
        </button>
      </div>
      {serviceTypeId === OTHER_SERVICE_VALUE ? (
        <label className="field mt-4">
          Describe qué necesitas
          <textarea
            value={otherServiceDescription}
            onChange={(event) => setOtherServiceDescription(event.target.value)}
            placeholder="Cuéntanos el servicio que no encontraste para revisar cobertura y disponibilidad."
            required
          />
        </label>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Sugerencias:</span>
        {suggestedTags.map((tag, index) => (
          <button
            key={tag}
            className={`rounded-full border border-line bg-white px-3.5 py-2 text-xs font-black text-brand-dark shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft ${
              index >= 4 ? "hidden sm:inline-flex" : "inline-flex"
            }`}
            type="button"
            onClick={() => setQuery(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
