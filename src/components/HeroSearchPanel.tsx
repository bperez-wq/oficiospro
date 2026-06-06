"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { communeOptions, heroServiceTypeOptions } from "@/lib/catalog";

// Tags cortos sugeridos. Los dos últimos solo se muestran en desktop (máx 6 desktop / 4 mobile).
const suggestedTags = ["gasfíter", "calefont", "aire acondicionado", "Vitacura", "filtración", "riego"];

export function HeroSearchPanel() {
  const [query, setQuery] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("hogar");
  const [commune, setCommune] = useState("Vitacura");

  function submit() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (serviceTypeId) params.set("tipo", serviceTypeId);
    if (commune) params.set("comuna", commune);
    window.location.href = `/especialistas?${params.toString()}`;
  }

  return (
    <div className="relative z-20 mt-8 rounded-[28px] border border-line bg-white p-5 shadow-card md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_0.9fr_auto] lg:items-end lg:gap-5">
        <label className="field">
          Busca por oficio, problema, comuna o servicio
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: reparar filtración, calefont, contratista de poda"
          />
        </label>
        <SearchableSelect
          label="Tipo de servicio"
          value={serviceTypeId}
          options={heroServiceTypeOptions}
          onChange={setServiceTypeId}
          placeholder="Hogar, empresas, riego..."
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
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-normal text-muted">Sugerencias:</span>
        {suggestedTags.map((tag, index) => (
          <button
            key={tag}
            className={`rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-muted transition hover:bg-brand-soft hover:text-brand-dark ${
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
