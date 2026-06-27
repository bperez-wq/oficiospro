"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { specialists, type Specialist } from "@/data/mock";
import { categoryImages } from "@/data/visualAssets";
import type { FlexibleService } from "@/data/flexiblePricing";
import { distanceInKm } from "@/data/marketplace";
import { getTradeCategoryById, getTradeCoverageLabel, getTradeSpecialtyBySlugOrLabel, isTradeForming } from "@/data/tradeTaxonomy";
import { useConversionModal } from "@/components/ConversionModal";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SpecialistGridCard } from "@/components/SpecialistGridCard";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ExternalProvidersSection } from "@/components/ExternalProvidersSection";
import {
  getClientProfile,
  getMockSession,
  getPublishedSpecialists,
  seedMockState,
} from "@/lib/storage";
import {
  ALL_COMMUNES_VALUE,
  ALL_REGIONS_VALUE,
  communeRegionCode,
  clientServiceTypeOptions,
  clientSpecialtyOptionsForType,
  normalizePlaceName,
  normalizeSearch,
  regionCodeForName,
  regionNameForCode,
} from "@/lib/catalog";
import { submitConversionEvent } from "@/lib/leadClient";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { getSpecialistLevel, recommendationScore } from "@/lib/trust";
import {
  categoryRoutes,
  findMatchingService,
  matchedServiceSummary,
  matchesRouteCategory,
  matchesRouteSpecialty,
  serviceCreditValue,
  specialistSearchText,
  specialtyRoutes,
  type SpecialistSearchIntent,
} from "@/lib/specialistMatching";

const availabilityOptions = [
  { value: "all", label: "Cualquier horario" },
  { value: "now", label: "Disponible ahora" },
  { value: "today", label: "Disponible hoy" },
  { value: "tomorrow", label: "Disponible mañana" },
];

const sortOptions = [
  { value: "recommended", label: "Recomendados" },
  { value: "rating", label: "Mejor calificacion" },
  { value: "distance", label: "Mas cercanos" },
  { value: "credits", label: "Menor precio en creditos" },
  { value: "response", label: "Respuesta mas rapida" },
  { value: "jobs", label: "Mas trabajos completados" },
];

const levelOptions = [
  { value: "all", label: "Todos los niveles" },
  { value: "Fundador", label: "Fundador" },
  { value: "Bronce", label: "Bronce" },
  { value: "Plata", label: "Plata" },
  { value: "Oro", label: "Oro" },
  { value: "Platino", label: "Platino" },
];

export function SpecialistsExplorer() {
  const { openModal } = useConversionModal();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [region, setRegion] = useState(ALL_REGIONS_VALUE);
  const [zone, setZone] = useState(ALL_COMMUNES_VALUE);
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState(0);
  const [maxCredits, setMaxCredits] = useState(999);
  const [level, setLevel] = useState("all");
  const [quickResponse, setQuickResponse] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [withinCoverage, setWithinCoverage] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryParam, setCategoryParam] = useState("");
  const [specialtyParam, setSpecialtyParam] = useState("");
  const [sourceSection, setSourceSection] = useState("");
  const [clientLat, setClientLat] = useState(-33.4088);
  const [clientLng, setClientLng] = useState(-70.5673);
  const [approvedSpecialists, setApprovedSpecialists] = useState<Specialist[]>([]);
  const [notice, setNotice] = useState("");
  const filterDrawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    seedMockState();
    setApprovedSpecialists(getPublishedSpecialists());
    const clientProfile = getClientProfile();
    if (clientProfile?.lat && clientProfile?.lng) {
      setClientLat(clientProfile.lat);
      setClientLng(clientProfile.lng);
      setNotice(`Ubicación privada disponible para ordenar por cercanía desde ${clientProfile.commune}.`);
    }
    fetch("/api/specialists")
      .then((response) => response.json())
      .then((data: { specialists?: Specialist[] }) => {
        if (!Array.isArray(data.specialists) || !data.specialists.length) return;
        setApprovedSpecialists((current) => {
          const existingIds = new Set(current.map((item) => item.id));
          return [...data.specialists!.filter((item) => !existingIds.has(item.id)), ...current];
        });
      })
      .catch(() => {
        // Keep the static marketplace available while D1 is being configured.
      });
  }, []);

  useEffect(() => {
    const requestedType = searchParams.get("categoria") ?? searchParams.get("tipo");
    const requestedRegion = searchParams.get("region");
    const requestedCommune = searchParams.get("comuna");
    const requestedSpecialty = searchParams.get("especialidad");
    const requestedQuery = searchParams.get("q");
    const requestedAvailability = searchParams.get("disponibilidad");
    const requestedRating = searchParams.get("rating");
    const requestedPrice = searchParams.get("precio");
    const requestedLevel = searchParams.get("nivel");
    const requestedQuickResponse = searchParams.get("respuesta") ?? searchParams.get("respuesta_rapida");

    if (requestedType) {
      setCategoryParam(normalizeRouteParam(requestedType));
      setCategory("all");
    } else {
      setCategoryParam("");
    }

    if (requestedSpecialty && requestedSpecialty !== "todas") {
      const normalizedSpecialty = normalizeRouteParam(requestedSpecialty);
      setSpecialtyParam(normalizedSpecialty);
      window.setTimeout(() => setSpecialty(matchSpecialtyValue(normalizedSpecialty, specialtyFilterOptions)), 0);
    } else {
      setSpecialtyParam("");
      setSpecialty("all");
    }

    setQuery(requestedQuery ?? "");
    setSourceSection(searchParams.get("sourceSection") ?? "");
    if (requestedRegion) setRegion(regionCodeForName(requestedRegion) || requestedRegion);
    if (requestedCommune) {
      const normalizedCommune = normalizePlaceName(requestedCommune);
      setZone(normalizedCommune);
      if (!requestedRegion) setRegion(communeRegionCode(normalizedCommune) || ALL_REGIONS_VALUE);
    }
    if (requestedAvailability && availabilityOptions.some((item) => item.value === requestedAvailability)) setAvailability(requestedAvailability);
    if (requestedRating) setRating(Math.min(5, Math.max(0, Number(requestedRating) || 0)));
    if (requestedPrice) setMaxCredits(Math.max(10, Number(requestedPrice) || 999));
    if (requestedLevel && levelOptions.some((item) => item.value === requestedLevel)) setLevel(requestedLevel);
    setQuickResponse(requestedQuickResponse === "rapida" || requestedQuickResponse === "true");
  }, [searchParamsKey]);

  useEffect(() => {
    setSpecialty("all");
  }, [category]);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    filterDrawerRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  const specialtyOptions =
    category === "all"
      ? []
      : clientSpecialtyOptionsForType(category);
  const typeFilterOptions = [{ value: "all", label: "Todos los tipos" }, ...clientServiceTypeOptions];
  const specialtyFilterOptions = [
    { value: "all", label: "Todas las especialidades" },
    ...specialtyOptions,
  ];
  const marketplaceSpecialists = useMemo(() => [...specialists, ...approvedSpecialists], [approvedSpecialists]);
  const hasLocationContext = Boolean(notice) || (zone && zone !== ALL_COMMUNES_VALUE);
  const resultContext = hasLocationContext
    ? "Ordenados por cercania y reputacion"
    : "Agrega tu comuna para ver especialistas cerca de ti";
  const routeCategory = categoryParam ? categoryRoutes[categoryParam] : null;
  const routeSpecialty = specialtyParam ? specialtyRoutes[specialtyParam] : null;
  const taxonomyCategory = getTradeCategoryById(categoryParam || (category !== "all" ? category : ""));
  const taxonomySpecialty = specialtyParam ? getTradeSpecialtyBySlugOrLabel(specialtyParam, taxonomyCategory?.id) : null;
  const taxonomyCoverage = taxonomySpecialty ?? taxonomyCategory;
  const formingCoverage = taxonomyCoverage ? isTradeForming(taxonomyCoverage) : false;
  const coverageLabel = taxonomyCoverage ? getTradeCoverageLabel(taxonomyCoverage) : "";
  const selectedTypeLabel = typeFilterOptions.find((item) => item.value === category)?.label;
  const contextualTitle = routeCategory?.title ?? (routeSpecialty ? `Especialistas para ${routeSpecialty.label.toLowerCase()}` : categoryParam && category !== "all" && selectedTypeLabel ? `Especialistas en ${selectedTypeLabel.toLowerCase()}` : "Tecnicos recomendados");
  const contextualSubtitle = formingCoverage
    ? `Estamos formando red para este oficio. Puedes dejar una solicitud y priorizaremos cobertura por comuna.`
    : routeCategory?.subtitle ?? (routeSpecialty ? "Filtra por region, comuna, disponibilidad, reputacion y precio en creditos." : resultContext);
  const suggestedChips = routeCategory?.suggestions ?? [];
  const activeSearchIntent = useMemo<SpecialistSearchIntent>(
    () => ({
      categoryParam,
      specialtyParam,
      query,
      explicitCategory: category,
      explicitSpecialty: specialty,
    }),
    [category, categoryParam, query, specialty, specialtyParam],
  );
  const searchIntentLabel = routeSpecialty?.label ?? (query.trim() ? query.trim() : routeCategory?.label ?? "");
  const activeFilters = [
    query ? { label: `Busqueda: ${query}`, clear: () => setQuery("") } : null,
    categoryParam ? { label: `Intencion: ${routeCategory?.label ?? labelFromSlug(categoryParam)}`, clear: () => setCategoryParam("") } : null,
    category !== "all" ? { label: routeCategory?.label ?? `Tipo: ${typeFilterOptions.find((item) => item.value === category)?.label ?? category}`, clear: () => {
      setCategory("all");
    } } : null,
    specialtyParam ? { label: routeSpecialty?.label ?? `Especialidad: ${labelFromSlug(specialtyParam)}`, clear: () => {
      setSpecialtyParam("");
      setSpecialty("all");
    } } : null,
    specialty !== "all" && !specialtyParam ? { label: `Especialidad: ${specialty}`, clear: () => setSpecialty("all") } : null,
    region !== ALL_REGIONS_VALUE ? { label: `Region: ${regionNameForCode(region)}`, clear: () => {
      setRegion(ALL_REGIONS_VALUE);
      setZone(ALL_COMMUNES_VALUE);
    } } : null,
    zone && zone !== ALL_COMMUNES_VALUE ? { label: `Comuna: ${zone}`, clear: () => setZone(ALL_COMMUNES_VALUE) } : null,
    availability !== "all" ? { label: `Disponibilidad: ${availabilityOptions.find((item) => item.value === availability)?.label ?? availability}`, clear: () => setAvailability("all") } : null,
    rating > 0 ? { label: `Calificacion desde ${rating.toFixed(1)}`, clear: () => setRating(0) } : null,
    maxCredits < 999 ? { label: `Hasta ${maxCredits} creditos`, clear: () => setMaxCredits(999) } : null,
    level !== "all" ? { label: `Nivel ${level}`, clear: () => setLevel("all") } : null,
    quickResponse ? { label: "Respuesta rapida", clear: () => setQuickResponse(false) } : null,
    withinCoverage ? { label: "Dentro de cobertura", clear: () => setWithinCoverage(false) } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];
  const hasActiveFilters = activeFilters.length > 0;

  useEffect(() => {
    const reserveId = new URLSearchParams(window.location.search).get("reserve");
    if (!reserveId || !getMockSession()) return;
    const specialist = marketplaceSpecialists.find((item) => item.id === reserveId);
    if (specialist) {
      preserveSpecialistIntent({ specialist, intendedAction: "reservar", source: "Reserva pendiente desde registro" });
      openModal({ type: "reserva_especialista", sourceButton: "Reserva pendiente desde registro", specialist });
    }
  }, [marketplaceSpecialists]);

  const visible = useMemo(() => {
    const clientLocation = { lat: clientLat, lng: clientLng };

    return marketplaceSpecialists
      .map((item) => ({
        ...item,
        distance: item.geo ? Number(distanceInKm(clientLocation, item.geo).toFixed(1)) : item.distance,
      }))
      .filter((item) => {
        if (!query.trim()) return true;
        return specialistSearchText(item).includes(normalizeSearch(query));
      })
      .filter((item) => !categoryParam || matchesRouteCategory(item, categoryParam))
      .filter((item) => category === "all" || specialistHasServiceType(item, category))
      .filter((item) => specialty === "all" || specialistHasSpecialty(item, specialty))
      .filter((item) => matchesRouteSpecialty(item, specialtyParam))
      .filter((item) => region === ALL_REGIONS_VALUE || normalizeSearch(item.region ?? "") === normalizeSearch(regionNameForCode(region)))
      .filter((item) => !zone || zone === ALL_COMMUNES_VALUE || item.zone === zone || item.commune === zone)
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => item.rating >= rating)
      .filter((item) => serviceCreditValue(findMatchingService(item, activeSearchIntent), item.credits) <= maxCredits)
      .filter((item) => level === "all" || getSpecialistLevel(item) === level)
      .filter((item) => !quickResponse || responseMinutes(item.responseTime) <= 60)
      .filter((item) => !withinCoverage || item.distance <= (item.coverageRadiusKm ?? 999))
      .sort((a, b) => {
        if (sort === "credits") return serviceCreditValue(findMatchingService(a, activeSearchIntent), a.credits) - serviceCreditValue(findMatchingService(b, activeSearchIntent), b.credits);
        if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
        if (sort === "distance") return a.distance - b.distance;
        if (sort === "jobs") return (b.trabajosCompletados ?? b.jobs) - (a.trabajosCompletados ?? a.jobs);
        if (sort === "recommended") return recommendationScore(b) - recommendationScore(a);
        return b.rating - a.rating;
      });
  }, [activeSearchIntent, availability, category, categoryParam, clientLat, clientLng, level, marketplaceSpecialists, maxCredits, query, quickResponse, rating, region, sort, specialty, specialtyParam, withinCoverage, zone]);

  const resultMetrics = useMemo(() => {
    const premium = visible.filter((item) => ["Oro", "Platino"].includes(getSpecialistLevel(item))).length;
    const fast = visible.filter((item) => responseMinutes(item.responseTime) <= 60).length;
    const averageRating = visible.length ? (visible.reduce((sum, item) => sum + item.rating, 0) / visible.length).toFixed(1) : "0.0";
    return { premium, fast, averageRating };
  }, [visible]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setSpecialty("all");
    setRegion(ALL_REGIONS_VALUE);
    setZone(ALL_COMMUNES_VALUE);
    setAvailability("all");
    setRating(0);
    setMaxCredits(999);
    setLevel("all");
    setQuickResponse(false);
    setCategoryParam("");
    setSpecialtyParam("");
    setWithinCoverage(false);
    setSort("recommended");
  }

  function reserve(id: string, service?: FlexibleService | null) {
    const specialist = marketplaceSpecialists.find((item) => item.id === id) as Specialist | undefined;
    if (!specialist) return;
    const selectedService = service ?? findMatchingService(specialist, activeSearchIntent);
    preserveSpecialistIntent({ specialist, service: selectedService, intendedAction: "reservar", category: categoryParam || category, specialty: specialtyParam || specialty, commune: zone, source: "SpecialistsExplorer" });
    openModal({ type: "reserva_especialista", sourceButton: "Reservar especialista", specialist });
  }

  function applySuggestedChip(chip: string) {
    setQuery(chip);
    setSpecialtyParam(normalizeRouteParam(chip));
    setSpecialty("all");
  }

  function demandContext(sourceButton: string) {
    return {
      categoria: categoryParam || category,
      especialidad: specialtyParam || specialty,
      region,
      comuna: zone,
      sourceSection: sourceSection || "specialists_empty_state",
      sourceButton,
      searchIntent: searchIntentLabel || routeCategory?.title || routeSpecialty?.label || query,
      timestamp: new Date().toISOString(),
    };
  }

  function recordDemandContext(sourceButton: string) {
    const payload = demandContext(sourceButton);
    try {
      window.sessionStorage.setItem("oficiospro.categoryDemandDraft", JSON.stringify(payload));
    } catch {
      // Demand capture should keep navigating even if session storage is unavailable.
    }
    void submitConversionEvent({
      type: "category_search_no_results",
      source: payload.sourceSection,
      sourceComponent: "SpecialistsExplorer",
      sourceButton,
      payload,
    });
  }

  function captureDemand(sourceButton: string) {
    recordDemandContext(sourceButton);
    openModal({ type: "consulta_general", sourceButton });
  }

  return (
    <div className="grid gap-6">
      {notice ? (
        <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark shadow-sm">
          {notice}
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-accent to-sun" />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="field">
            Búsqueda libre
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Gasfíter, calefont, filtración, Vitacura, riego, frigorista..."
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row lg:pb-1">
            <button className="btn-primary" type="button" onClick={() => setQuery(query.trim())}>
              Aplicar filtros
            </button>
            <button className="btn-secondary" type="button" onClick={clearFilters}>
              Limpiar y ver toda la red
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-muted">
          {hasActiveFilters ? "Puedes combinar búsqueda, comuna, disponibilidad y reputación." : "Mostrando todos los especialistas disponibles"}
        </p>
      </section>

      <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
        <button className="btn-primary" type="button" onClick={() => setFiltersOpen((current) => !current)}>
          {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
        <button className="btn-secondary" type="button" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      {filtersOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar filtros"
          onClick={() => setFiltersOpen(false)}
        />
      ) : null}

      <section className="grid gap-5 rounded-[28px] border border-line bg-white p-5 shadow-soft lg:grid-cols-[240px_1fr]">
        <aside
          ref={filterDrawerRef}
          className={`${filtersOpen ? "fixed inset-x-3 bottom-20 top-20 z-50 grid overflow-y-auto" : "hidden"} gap-3 self-start rounded-3xl bg-slate-50 p-4 shadow-card lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-28 lg:z-auto lg:grid lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:shadow-none`}
          style={filtersOpen ? { maxHeight: "calc(100vh - 10rem)" } : undefined}
          aria-label="Filtros de especialistas"
          role={filtersOpen ? "dialog" : undefined}
          aria-modal={filtersOpen ? true : undefined}
          tabIndex={filtersOpen ? -1 : undefined}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Busca por confianza</p>
              <h2 className="text-2xl font-black">Filtra especialistas</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">Combina comuna, disponibilidad, nivel y creditos.</p>
            </div>
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-sm font-black text-muted lg:hidden"
              aria-label="Cerrar filtros"
              onClick={() => setFiltersOpen(false)}
            >
              X
            </button>
          </div>
          <SearchableSelect
            label="Tipo de servicio"
            value={category}
            options={typeFilterOptions}
            onChange={(nextCategory) => {
              setCategory(nextCategory);
              setCategoryParam("");
              setSpecialtyParam("");
            }}
            placeholder="Busca hogar, empresa, climatización..."
          />
          <SearchableSelect
            label="Especialidad"
            value={specialty}
            options={specialtyFilterOptions}
            onChange={(nextSpecialty) => {
              setSpecialty(nextSpecialty);
              setSpecialtyParam("");
            }}
            placeholder="Busca gasfitería, aire, SEC..."
          />
          <RegionCommuneSelect
            region={region}
            commune={zone}
            onRegionChange={(nextRegion) => {
              setRegion(nextRegion);
              setZone(nextRegion === ALL_REGIONS_VALUE ? ALL_COMMUNES_VALUE : "");
            }}
            onCommuneChange={setZone}
            allowAllRegions
            allRegionLabel="Todas las regiones"
            allCommuneLabel="Todas las comunas"
            communePlaceholder="Busca comuna"
          />
          <SearchableSelect label="Disponibilidad" value={availability} options={availabilityOptions} onChange={setAvailability} />
          <SearchableSelect label="Nivel del especialista" value={level} options={levelOptions} onChange={setLevel} />
          <SearchableSelect label="Ordenar por" value={sort} options={sortOptions} onChange={setSort} />
          <label className="field">
            Calificación mínima {rating > 0 ? rating.toFixed(1) : "sin mínimo"}
            <input min="0" max="5" step="0.1" type="range" value={rating} onChange={(event) => setRating(Number(event.target.value))} />
          </label>
          <label className="field">
            Hasta {maxCredits >= 999 ? "todos los" : maxCredits} créditos
            <input min="10" max="999" step="5" type="range" value={maxCredits} onChange={(event) => setMaxCredits(Number(event.target.value))} />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-black text-slate-700">
            <input type="checkbox" checked={withinCoverage} onChange={(event) => setWithinCoverage(event.target.checked)} />
            Solo especialistas que cubren mi ubicación
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-black text-slate-700">
            <input type="checkbox" checked={quickResponse} onChange={(event) => setQuickResponse(event.target.checked)} />
            Respuesta rapida
          </label>
          <div className="grid gap-2">
            <button className="btn-primary w-full" type="button" onClick={() => setQuery(query.trim())}>
              Ver {visible.length} resultados
            </button>
            <button className="btn-secondary w-full" type="button" onClick={clearFilters}>
              Limpiar y ver toda la red
            </button>
          </div>
        </aside>

        <div id="especialistas-results" className="grid gap-5">
          {categoryImages[categoryParam] || categoryImages[category] ? (
            <div className="relative h-24 overflow-hidden rounded-[24px] border border-line md:h-32">
              <img
                src={categoryImages[categoryParam] ?? categoryImages[category]}
                alt={`Especialista trabajando en ${categoryParam || category}`}
                className="h-full w-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />
              <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-brand-dark shadow-soft backdrop-blur">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                Especialistas verificados en tu búsqueda
              </span>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Especialistas disponibles</p>
              <h2 className="text-3xl font-black md:text-4xl">{contextualTitle}</h2>
              <p className="mt-2 text-sm font-bold text-muted">
                {contextualSubtitle}
              </p>
              {coverageLabel ? (
                <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-black ${formingCoverage ? "bg-amber-50 text-amber-800" : "bg-brand-soft text-brand-dark"}`}>
                  {coverageLabel}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="chip bg-brand-soft text-brand-dark">Mostrando {visible.length} especialistas</strong>
              <button className="rounded-full border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <DashboardMetricCard label="Promedio rating" value={`${resultMetrics.averageRating}/5`} detail="Basado en resultados visibles" />
            <DashboardMetricCard label="Nivel Oro/Platino" value={resultMetrics.premium.toString()} detail="Perfiles con mayor reputacion" tone="brand" />
            <DashboardMetricCard label="Respuesta rapida" value={resultMetrics.fast.toString()} detail="Especialistas con respuesta menor a 1 h" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Perfiles revisados antes de publicarse", "Pago protegido al finalizar", "Red en crecimiento por comuna"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-black text-brand-dark">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                {item}
              </span>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            {hasActiveFilters ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase text-muted">Filtros activos</p>
                  <button type="button" className="text-xs font-black text-brand-dark underline-offset-4 hover:underline" onClick={clearFilters}>
                    Limpiar todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    className="rounded-full border border-line bg-white px-3 py-2 text-sm font-black text-muted transition hover:border-brand hover:text-brand"
                    type="button"
                    onClick={filter.clear}
                  >
                    {filter.label} x
                  </button>
                ))}
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-muted">Explora todos los especialistas verificados disponibles en OficiosPro.</p>
            )}
          </div>
          {suggestedChips.length ? (
            <div className="rounded-2xl border border-brand/10 bg-brand-soft p-4">
              <p className="text-xs font-black uppercase text-brand-dark">Afinar busqueda</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedChips.map((chip) => (
                  <button
                    key={chip}
                    className="rounded-full border border-white/70 bg-white px-3 py-2 text-sm font-black text-brand-dark transition hover:border-brand hover:text-brand"
                    type="button"
                    onClick={() => applySuggestedChip(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.length ? (
              visible.map((specialist) => {
                const matchedService = findMatchingService(specialist, activeSearchIntent);
                return (
                  <SpecialistGridCard
                    key={specialist.id}
                    specialist={specialist}
                    matchedService={matchedService}
                    searchIntent={searchIntentLabel}
                    highlightedCreditPrice={matchedServiceSummary(matchedService, !searchIntentLabel)}
                    onReserve={reserve}
                  />
                );
              })
            ) : (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <EmptyState
                  eyebrow={formingCoverage ? "Cobertura en formacion" : "Piloto por comuna"}
                  title={searchIntentLabel ? `Estamos sumando especialistas de ${searchIntentLabel} en tu zona.` : "Estamos sumando especialistas para este servicio en tu zona."}
                  text="Dejanos tu solicitud y priorizaremos esta cobertura. Si eres especialista de esta zona, tambien puedes crear tu perfil fundador."
                  visual={<span aria-hidden className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-2xl font-black text-brand-dark">OP</span>}
                  action={
                    <>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => captureDemand("Solicitar especialista")}
                  >
                    Solicitar especialista
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => captureDemand("Quiero que me contacten")}
                  >
                    Quiero que me contacten
                  </button>
                  <Link
                    className="btn-secondary"
                    href={`/registro-especialista?categoria=${encodeURIComponent(categoryParam || category)}&especialidad=${encodeURIComponent(specialtyParam || specialty)}&sourceSection=empty_search`}
                    onClick={() => recordDemandContext("Postular como especialista")}
                  >
                    Ofrecer mis servicios
                  </Link>
                  <button className="btn-secondary" type="button" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                    </>
                  }
                />
              </div>
            )}
          </div>
          <ExternalProvidersSection
            trade={categoryParam || (category !== "all" ? category : "") || query}
            commune={zone && zone !== ALL_COMMUNES_VALUE ? zone : undefined}
            region={region !== ALL_REGIONS_VALUE ? regionNameForCode(region) : undefined}
            query={query}
            ownResultCount={visible.length}
          />
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
        </div>
      </section>
      <StickyMobileCTA>
        <button className="btn-secondary min-h-11 flex-1 px-3 text-sm" type="button" onClick={() => setFiltersOpen(true)}>
          Filtros
        </button>
        <a className="btn-primary min-h-11 flex-1 px-3 text-sm" href="#especialistas-results">
          Ver {visible.length} resultados
        </a>
      </StickyMobileCTA>
    </div>
  );
}

function normalizeRouteParam(value: string) {
  return normalizeSearch(decodeURIComponent(value)).replace(/_/g, "-").replace(/\s+/g, "-");
}

function matchSpecialtyValue(specialtyParam: string, options: { value: string; label: string }[]) {
  if (!specialtyParam || specialtyParam === "todas") return "all";
  const route = specialtyRoutes[specialtyParam];
  const exact = options.find((option) => normalizeRouteParam(option.value) === specialtyParam || normalizeRouteParam(option.label) === specialtyParam);
  if (exact) return exact.value;
  const byTerm = route
    ? options.find((option) => route.terms.some((term) => normalizeSearch(`${option.label} ${option.value}`).includes(normalizeSearch(term))))
    : null;
  return byTerm?.value ?? "all";
}

function labelFromSlug(value: string) {
  const label = value.replace(/-/g, " ");
  return label ? label[0].toUpperCase() + label.slice(1) : value;
}

function specialistHasServiceType(specialist: Specialist, serviceTypeId: string) {
  if (specialist.serviceTypeId === serviceTypeId) return true;
  return (specialist.servicePricing ?? []).some((service) => service.active !== false && service.serviceTypeId === serviceTypeId);
}

function specialistHasSpecialty(specialist: Specialist, specialty: string) {
  const normalizedSpecialty = normalizeSearch(specialty);
  if (normalizeSearch(specialist.specialty ?? "") === normalizedSpecialty) return true;
  if ((specialist.specialties ?? []).some((item) => normalizeSearch(item) === normalizedSpecialty)) return true;
  return (specialist.servicePricing ?? []).some((service) =>
    service.active !== false && normalizeSearch(`${service.specialty} ${service.name} ${service.description}`).includes(normalizedSpecialty),
  );
}

function responseMinutes(value: string) {
  const lower = normalizeSearch(value);
  const numeric = Number.parseFloat(lower.replace(",", "."));
  if (!Number.isFinite(numeric)) return 999;
  if (lower.includes("min")) return numeric;
  if (lower.includes("h")) return numeric * 60;
  return numeric;
}
