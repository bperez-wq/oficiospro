"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { communeOptions, serviceTypeOptions } from "@/lib/catalog";

const examples = ["gasfíter", "calefont", "aire acondicionado", "Vitacura", "filtración", "riego tecnificado"];

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
    <div className="mt-8 rounded-[28px] border border-line bg-white p-4 shadow-card">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr_auto] lg:items-end">
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
          options={serviceTypeOptions}
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
        <button className="btn-primary h-12 px-6" type="button" onClick={submit}>
          Buscar especialista
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-muted transition hover:bg-brand-soft hover:text-brand-dark"
            type="button"
            onClick={() => setQuery(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
