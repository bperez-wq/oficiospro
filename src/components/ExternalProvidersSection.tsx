"use client";

import { useEffect, useState } from "react";
import { defaultExternalProviderSource } from "@/lib/externalProviders/sources";
import type { ExternalProviderPreview } from "@/lib/externalProviders/types";
import { submitConversionEvent } from "@/lib/leadClient";

type Props = {
  trade: string;
  commune?: string;
  region?: string;
  query?: string;
  lat?: number;
  lng?: number;
  /** How many OficiosPro specialists matched. Section only shows on low coverage. */
  ownResultCount: number;
  /** Below this, OficiosPro coverage is considered low. */
  lowCoverageThreshold?: number;
};

export function ExternalProvidersSection({
  trade,
  commune,
  region,
  query,
  lat,
  lng,
  ownResultCount,
  lowCoverageThreshold = 3,
}: Props) {
  const source = defaultExternalProviderSource;
  const [providers, setProviders] = useState<ExternalProviderPreview[]>([]);
  const [attribution, setAttribution] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const shouldQuery = source.isEnabled() && Boolean(trade) && ownResultCount <= lowCoverageThreshold;

  useEffect(() => {
    let active = true;
    if (!shouldQuery) {
      setProviders([]);
      return;
    }
    void source
      .search({ trade, commune, region, query, lat, lng, limit: 4 })
      .then((result) => {
        if (!active) return;
        if (result.status === "ok") {
          setProviders(result.providers);
          setAttribution(result.attribution);
        } else {
          setProviders([]);
        }
      });
    return () => {
      active = false;
    };
  }, [shouldQuery, source, trade, commune, region, query, lat, lng]);

  // Inert by default: nothing renders unless enabled + low coverage + results.
  if (!shouldQuery || providers.length === 0) return null;

  function invite(provider: ExternalProviderPreview) {
    setInvited((current) => ({ ...current, [provider.externalPlaceId]: true }));
    void submitConversionEvent({
      type: "external_provider_invite",
      source: "external_discovery",
      sourceComponent: "ExternalProvidersSection",
      sourceButton: "Invitar a OficiosPro",
      payload: {
        externalPlaceId: provider.externalPlaceId,
        externalSource: provider.source,
        trade,
        commune: commune ?? "",
        region: region ?? "",
        searchQuery: query ?? "",
      },
    });
  }

  return (
    <section className="rounded-[28px] border border-dashed border-line bg-slate-50/70 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow">Empresas locales relacionadas</p>
          <h2 className="text-2xl font-black text-ink">Resultados externos en Google Maps</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-muted">
            Mostramos negocios cercanos mientras sumamos especialistas OficiosPro en tu zona. No estan verificados por OficiosPro.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-black text-muted">{attribution || "Datos de Google Maps"}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((provider) => (
          <article key={provider.externalPlaceId} className="grid gap-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <strong className="text-sm font-black leading-snug text-ink">{provider.name}</strong>
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">No verificado</span>
            </div>
            {provider.category ? <span className="text-xs font-bold text-muted">{provider.category}</span> : null}
            <span className="text-xs font-bold text-muted">
              {[provider.commune, provider.region].filter(Boolean).join(" - ") || "Zona referencial"}
            </span>
            {provider.rating ? (
              <span className="text-xs font-black text-brand-dark">
                {provider.rating.toFixed(1)} en Google{provider.userRatingsTotal ? ` (${provider.userRatingsTotal})` : ""}
              </span>
            ) : null}
            <div className="mt-1 grid gap-2">
              <a className="btn-secondary justify-center px-3 py-2 text-xs" href={provider.mapsUrl} target="_blank" rel="noopener noreferrer nofollow">
                Abrir en Google Maps
              </a>
              <button
                className="btn-primary justify-center px-3 py-2 text-xs"
                type="button"
                disabled={invited[provider.externalPlaceId]}
                onClick={() => invite(provider)}
              >
                {invited[provider.externalPlaceId] ? "Sugerencia enviada" : "Invitar a OficiosPro"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-bold leading-5 text-muted">
        Resultados de terceros via Google Maps, separados del ranking de especialistas OficiosPro. OficiosPro no garantiza su disponibilidad ni los respalda.
      </p>
    </section>
  );
}
