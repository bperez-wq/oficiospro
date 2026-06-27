"use client";

import { useEffect, useState } from "react";
import { defaultExternalProviderSource } from "@/lib/externalProviders/sources";
import type { ExternalProviderPreview } from "@/lib/externalProviders/types";
import { getTradeCategoryById } from "@/data/tradeTaxonomy";
import { submitSpecialistRecommendation } from "@/lib/community/recommendations";
import { RecommendSpecialistCard } from "@/components/RecommendSpecialistCard";

type Props = {
  trade: string;
  commune?: string;
  region?: string;
  query?: string;
  lat?: number;
  lng?: number;
  /** How many OficiosPro specialists matched. Section shows on low coverage. */
  ownResultCount: number;
  /** At or below this, OficiosPro coverage is considered low. */
  lowCoverageThreshold?: number;
};

/** Master switch; set NEXT_PUBLIC_COMMUNITY_DISCOVERY_ENABLED="false" to disable. */
function isCommunityDiscoveryEnabled() {
  return process.env.NEXT_PUBLIC_COMMUNITY_DISCOVERY_ENABLED !== "false";
}

export function ExternalProvidersSection({
  trade,
  commune,
  region,
  query,
  lat,
  lng,
  ownResultCount,
  lowCoverageThreshold = 4,
}: Props) {
  const source = defaultExternalProviderSource;
  const [providers, setProviders] = useState<ExternalProviderPreview[]>([]);
  const [attribution, setAttribution] = useState("");
  const [recommended, setRecommended] = useState<Record<string, boolean>>({});

  const tradeLabel = getTradeCategoryById(trade)?.label;
  const lowCoverage = ownResultCount <= lowCoverageThreshold;
  const enabled = isCommunityDiscoveryEnabled() && Boolean(trade) && lowCoverage;

  useEffect(() => {
    let active = true;
    if (!enabled || !source.isEnabled()) {
      setProviders([]);
      return;
    }
    void source
      .search({ trade, commune, region, query, lat, lng, limit: 6 })
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
  }, [enabled, source, trade, commune, region, query, lat, lng]);

  // The recommend card is the heart of the flow, so the section shows on low
  // coverage even if OpenStreetMap returns nothing.
  if (!enabled) return null;

  function recommendListing(provider: ExternalProviderPreview) {
    setRecommended((current) => ({ ...current, [provider.externalPlaceId]: true }));
    void submitSpecialistRecommendation({
      recommendedName: provider.name,
      trade,
      commune,
      region,
      source: "osm",
      externalPlaceId: provider.externalPlaceId,
    });
  }

  return (
    <section className="grid gap-5 rounded-[28px] border border-dashed border-line bg-slate-50/70 p-5 shadow-sm">
      <div>
        <p className="eyebrow">Colaboremos en tu comuna</p>
        <h2 className="text-2xl font-black text-ink">
          Sumemos mas {tradeLabel ? tradeLabel.toLowerCase() : "especialistas"}{commune ? ` en ${commune}` : ""}
        </h2>
        <p className="mt-1 text-sm font-bold leading-6 text-muted">
          Estamos creciendo en tu zona. Si conoces a alguien que hace bien el trabajo, recomiendalo: le damos
          mas oportunidades y reconocemos a quien recomienda.
        </p>
      </div>

      {providers.length > 0 ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black text-ink">Negocios cercanos en tu comuna</h3>
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-black text-muted">
              {attribution || "Datos de OpenStreetMap"}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <article key={provider.externalPlaceId} className="grid gap-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-sm font-black leading-snug text-ink">{provider.name}</strong>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">No verificado</span>
                </div>
                {provider.category ? <span className="text-xs font-bold text-muted">{provider.category}</span> : null}
                {provider.commune ? <span className="text-xs font-bold text-muted">{provider.commune}</span> : null}
                <div className="mt-1 grid gap-2">
                  <a className="btn-secondary justify-center px-3 py-2 text-xs" href={provider.mapsUrl} target="_blank" rel="noopener noreferrer nofollow">
                    Ver en el mapa
                  </a>
                  <button
                    className="btn-primary justify-center px-3 py-2 text-xs"
                    type="button"
                    disabled={recommended[provider.externalPlaceId]}
                    onClick={() => recommendListing(provider)}
                  >
                    {recommended[provider.externalPlaceId] ? "Recomendado" : "Recomendar a OficiosPro"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="text-[11px] font-bold leading-5 text-muted">
            Negocios de datos abiertos de OpenStreetMap, separados del listado de especialistas OficiosPro. No estan
            verificados por OficiosPro.
          </p>
        </div>
      ) : null}

      <RecommendSpecialistCard
        trade={trade}
        tradeLabel={tradeLabel}
        commune={commune}
        region={region}
        source="community"
      />
    </section>
  );
}
