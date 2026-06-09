"use client";

import { useEffect, useMemo, useState } from "react";
import { specialists, type Specialist } from "@/data/mock";
import { distanceInKm, getSpecialtiesByServiceType } from "@/data/marketplace";
import { useConversionModal } from "@/components/ConversionModal";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SpecialistCard } from "@/components/SpecialistCard";
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
  normalizePlaceName,
  normalizeSearch,
  regionCodeForName,
  regionNameForCode,
  serviceTypeOptions,
} from "@/lib/catalog";

const availabilityOptions = [
  { value: "all", label: "Cualquier horario" },
  { value: "now", label: "Disponible ahora" },
  { value: "today", label: "Disponible hoy" },
  { value: "tomorrow", label: "Disponible mañana" },
];

const sortOptions = [
  { value: "rating", label: "Mejor calificación" },
  { value: "credits", label: "Menos créditos" },
  { value: "response", label: "Respuesta rápida" },
  { value: "distance", label: "Más cercano" },
];

export function SpecialistsExplorer() {
  const { openModal } = useConversionModal();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [region, setRegion] = useState(ALL_REGIONS_VALUE);
  const [zone, setZone] = useState(ALL_COMMUNES_VALUE);
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState(0);
  const [maxCredits, setMaxCredits] = useState(999);
  const [sort, setSort] = useState("rating");
  const [withinCoverage, setWithinCoverage] = useState(false);
  const [clientLat, setClientLat] = useState(-33.4088);
  const [clientLng, setClientLng] = useState(-70.5673);
  const [approvedSpecialists, setApprovedSpecialists] = useState<Specialist[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedMockState();
    setApprovedSpecialists(getPublishedSpecialists());
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("tipo");
    const requestedRegion = params.get("region");
    const requestedCommune = params.get("comuna");
    const requestedSpecialty = params.get("especialidad");
    const requestedQuery = params.get("q");
    if (requestedType) setCategory(requestedType);
    if (requestedRegion) setRegion(regionCodeForName(requestedRegion) || requestedRegion);
    if (requestedCommune) {
      const normalizedCommune = normalizePlaceName(requestedCommune);
      setZone(normalizedCommune);
      if (!requestedRegion) setRegion(communeRegionCode(normalizedCommune) || ALL_REGIONS_VALUE);
    }
    if (requestedSpecialty) window.setTimeout(() => setSpecialty(requestedSpecialty), 0);
    if (requestedQuery) setQuery(requestedQuery);
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
    setSpecialty("all");
  }, [category]);

  const specialties =
    category === "all"
      ? []
      : getSpecialtiesByServiceType(category);
  const typeFilterOptions = [{ value: "all", label: "Todos los tipos" }, ...serviceTypeOptions];
  const specialtyFilterOptions = [
    { value: "all", label: "Todas las especialidades" },
    ...specialties.map((item) => ({ value: item, label: item })),
  ];
  const marketplaceSpecialists = useMemo(() => [...specialists, ...approvedSpecialists], [approvedSpecialists]);
  const activeFilters = [
    query ? `Búsqueda: ${query}` : "",
    category !== "all" ? `Tipo: ${typeFilterOptions.find((item) => item.value === category)?.label ?? category}` : "",
    specialty !== "all" ? `Especialidad: ${specialty}` : "",
    region !== ALL_REGIONS_VALUE ? `Región: ${regionNameForCode(region)}` : "",
    zone && zone !== ALL_COMMUNES_VALUE ? `Comuna: ${zone}` : "",
    availability !== "all" ? `Disponibilidad: ${availability}` : "",
    rating > 0 ? `Calificación desde ${rating.toFixed(1)}` : "",
    maxCredits < 999 ? `Hasta ${maxCredits} créditos` : "",
    withinCoverage ? "Dentro de cobertura" : "",
  ].filter(Boolean);
  const hasActiveFilters = activeFilters.length > 0;

  useEffect(() => {
    const reserveId = new URLSearchParams(window.location.search).get("reserve");
    if (!reserveId || !getMockSession()) return;
    const specialist = marketplaceSpecialists.find((item) => item.id === reserveId);
    if (specialist) openModal({ type: "reserva_especialista", sourceButton: "Reserva pendiente desde registro", specialist });
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
        const haystack = normalizeSearch(
          [
            item.name,
            item.specialty,
            item.serviceType,
            item.category,
            item.commune,
            item.zone,
            item.description,
            ...(item.specialties ?? []),
            ...(item.servicesOffered ?? []),
            ...(item.badges ?? []),
          ].join(" "),
        );
        return haystack.includes(normalizeSearch(query));
      })
      .filter((item) => category === "all" || item.serviceTypeId === category)
      .filter((item) => specialty === "all" || item.specialty === specialty || item.specialties?.includes(specialty))
      .filter((item) => region === ALL_REGIONS_VALUE || normalizeSearch(item.region ?? "") === normalizeSearch(regionNameForCode(region)))
      .filter((item) => !zone || zone === ALL_COMMUNES_VALUE || item.zone === zone || item.commune === zone)
      .filter((item) => availability === "all" || item.availability === availability)
      .filter((item) => item.rating >= rating)
      .filter((item) => item.credits <= maxCredits)
      .filter((item) => !withinCoverage || item.distance <= (item.coverageRadiusKm ?? 999))
      .sort((a, b) => {
        if (sort === "credits") return a.credits - b.credits;
        if (sort === "response") return Number.parseFloat(a.responseTime) - Number.parseFloat(b.responseTime);
        if (sort === "distance") return a.distance - b.distance;
        return b.rating - a.rating;
      });
  }, [availability, category, clientLat, clientLng, marketplaceSpecialists, maxCredits, query, rating, region, sort, specialty, withinCoverage, zone]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setSpecialty("all");
    setRegion(ALL_REGIONS_VALUE);
    setZone(ALL_COMMUNES_VALUE);
    setAvailability("all");
    setRating(0);
    setMaxCredits(999);
    setWithinCoverage(false);
    setSort("rating");
  }

  function reserve(id: string) {
    const specialist = marketplaceSpecialists.find((item) => item.id === id) as Specialist | undefined;
    if (!specialist) return;
    openModal({ type: "reserva_especialista", sourceButton: "Reservar especialista", specialist });
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
              Buscar
            </button>
            <button className="btn-secondary" type="button" onClick={clearFilters}>
              Ver todos
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-muted">
          {hasActiveFilters ? "Puedes combinar búsqueda, comuna, disponibilidad y reputación." : "Mostrando todos los especialistas disponibles"}
        </p>
      </section>

      <section className="grid gap-5 rounded-[28px] border border-line bg-white p-5 shadow-soft lg:grid-cols-[290px_1fr]">
        <aside className="grid gap-4 rounded-3xl bg-slate-50 p-5">
          <div>
            <p className="eyebrow">Busca por confianza</p>
            <h2 className="text-2xl font-black">Filtra especialistas</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">Todos los filtros son opcionales. Puedes explorar la red completa o buscar por problema.</p>
          </div>
          <SearchableSelect
            label="Tipo de servicio"
            value={category}
            options={typeFilterOptions}
            onChange={(nextCategory) => setCategory(nextCategory)}
            placeholder="Busca hogar, empresa, climatización..."
          />
          <SearchableSelect
            label="Especialidad"
            value={specialty}
            options={specialtyFilterOptions}
            onChange={setSpecialty}
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
          <div className="grid gap-2">
            <button className="btn-primary w-full" type="button" onClick={clearFilters}>
              Ver todos
            </button>
            <button className="btn-secondary w-full" type="button" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Especialistas disponibles</p>
              <h2 className="text-3xl font-black md:text-4xl">Técnicos recomendados</h2>
              <p className="mt-2 text-sm font-bold text-muted">
                {hasActiveFilters ? "Resultados según los filtros activos." : "Mostrando todos los especialistas disponibles"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="chip bg-brand-soft text-brand-dark">{visible.length} resultados</strong>
              <button className="rounded-full border border-line px-4 py-2 text-sm font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          </div>
          <p className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
            {hasActiveFilters
              ? `Filtros activos: ${activeFilters.join(" · ")}`
              : "Explora todos los especialistas verificados disponibles en OficiosPro."}
          </p>
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
          <div className="grid gap-5 xl:grid-cols-2">
            {visible.length ? (
              visible.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} onReserve={reserve} />
              ))
            ) : (
              <div className="rounded-[24px] border border-line bg-slate-50 p-6 xl:col-span-2">
                <h3 className="text-2xl font-black">No encontramos especialistas con esos filtros.</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-muted">
                  Puedes limpiar filtros para volver a ver toda la red o solicitar un servicio especial para que OficiosPro lo revise.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="btn-secondary" type="button" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => openModal({ type: "consulta_general", sourceButton: "Solicitar servicio especial" })}
                  >
                    Solicitar servicio especial
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
