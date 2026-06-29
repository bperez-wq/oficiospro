"use client";

import Link from "next/link";
import { useState } from "react";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import { heroServiceTypeOptions, OTHER_SERVICE_VALUE } from "@/lib/catalog";
import { submitLead } from "@/lib/leadClient";
import { trackEvent } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");
  const [otherServiceDescription, setOtherServiceDescription] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const finalQuery = serviceTypeId === OTHER_SERVICE_VALUE && otherServiceDescription.trim() ? otherServiceDescription.trim() : query.trim();

  function buildSpecialistsHref(includeMap = false) {
    const params = new URLSearchParams();
    if (finalQuery) params.set("q", finalQuery);
    if (serviceTypeId && serviceTypeId !== OTHER_SERVICE_VALUE) params.set("tipo", serviceTypeId);
    if (region) params.set("region", region);
    if (commune) params.set("comuna", commune);
    if (includeMap) {
      params.set("mapa", "1");
      params.set("sourceSection", "home_map_icon");
    }
    const queryString = params.toString();
    return queryString ? `/especialistas?${queryString}` : "/especialistas";
  }

  async function submit() {
    if (region && !commune) {
      setLocationStatus(t("heroSearch.chooseCommune"));
      return;
    }
    const destination = buildSpecialistsHref();
    void trackEvent({
      eventName: "click_search_specialist",
      sourceComponent: "HeroSearchPanel",
      sourceButton: "Buscar especialista hero",
      metadata: {
        hasQuery: Boolean(finalQuery),
        queryLength: finalQuery.length,
        serviceTypeId,
        hasRegion: Boolean(region),
        hasCommune: Boolean(commune),
        usedOtherService: serviceTypeId === OTHER_SERVICE_VALUE,
      },
    });
    await submitLead({
      leadType: "customer_request",
      fullName: "Cliente OficiosPro",
      service: finalQuery || serviceTypeId,
      trade: heroTypeOptions.find((item) => item.value === serviceTypeId)?.label ?? serviceTypeId,
      problemDescription: otherServiceDescription || query,
      regionCode: region,
      communeName: commune,
      sourceComponent: "HeroSearchPanel",
      sourceButton: "Buscar especialista hero",
      consentContact: false,
      payload: { serviceTypeId },
    });
    void trackEvent({
      eventName: "search_performed",
      sourceComponent: "HeroSearchPanel",
      metadata: {
        hasQuery: Boolean(finalQuery),
        queryLength: finalQuery.length,
        serviceTypeId,
        region,
        commune,
        destination,
      },
    });
    window.location.href = destination;
  }

  const mapHref = buildSpecialistsHref(true);

  return (
    <div className="relative z-20 mt-8 rounded-[28px] border border-line bg-white/95 p-5 shadow-card backdrop-blur md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-brand via-accent to-sun" />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_0.9fr_0.9fr_auto] lg:items-end lg:gap-5">
        <label className="field">
          {t("heroSearch.need")}
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
              placeholder={t("heroSearch.needPlaceholder")}
            />
          </span>
        </label>
        <SearchableSelect
          label={t("heroSearch.serviceType")}
          value={serviceTypeId}
          options={heroTypeOptions}
          onChange={(value) => {
            setServiceTypeId(value);
            if (value !== OTHER_SERVICE_VALUE) setOtherServiceDescription("");
          }}
          placeholder={t("heroSearch.serviceTypePlaceholder")}
          dropdownClassName="sm:min-w-[380px]"
        />
        <RegionCommuneSelect
          region={region}
          commune={commune}
          onRegionChange={(nextRegion) => {
            setRegion(nextRegion);
            setCommune("");
            setLocationStatus("");
          }}
          onCommuneChange={(nextCommune) => {
            setCommune(nextCommune);
            setLocationStatus("");
          }}
          regionPlaceholder={t("heroSearch.regionPlaceholder")}
          communePlaceholder={t("heroSearch.communePlaceholder")}
        />
        <button className="btn-primary h-12 w-full px-6 lg:w-auto" type="button" onClick={submit}>
          {t("heroSearch.searchCta")}
        </button>
        <Link
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-brand/20 bg-white px-4 text-sm font-black text-brand-dark shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft lg:w-auto"
          href={mapHref}
          aria-label="Buscar especialistas usando mapa"
          onClick={() => {
            void trackEvent({
              eventName: "click_search_map",
              sourceComponent: "HeroSearchPanel",
              sourceButton: "Mapa hero",
              metadata: { hasQuery: Boolean(finalQuery), serviceTypeId, region, commune },
            });
          }}
        >
          <span aria-hidden>🗺️</span>
          {t("heroSearch.map")}
        </Link>
      </div>
      {serviceTypeId === OTHER_SERVICE_VALUE ? (
        <label className="field mt-4">
          {t("heroSearch.describe")}
          <textarea
            value={otherServiceDescription}
            onChange={(event) => setOtherServiceDescription(event.target.value)}
            placeholder={t("heroSearch.describePlaceholder")}
            required
          />
        </label>
      ) : null}
      {locationStatus ? <p className="mt-4 rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">{locationStatus}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wide text-muted">{t("heroSearch.suggestions")}</span>
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
