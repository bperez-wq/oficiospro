"use client";

import { useMemo, useState } from "react";

import { SearchableSelect } from "@/components/SearchableSelect";
import { SpecialistRegisterModal } from "@/components/SpecialistRegisterModal";
import { communeOptions, registrationServiceTypeOptions, specialtyOptionsForType } from "@/lib/catalog";
import { nationalSpecialties } from "@/data/serviceCatalog";
import { submitConversionEvent } from "@/lib/leadClient";
import { saveSpecialistQuickDraft } from "@/lib/specialistDraft";

// "Anzuelo" / Time To First Value para especialistas.
// Antes de pedir datos, mostramos valor REAL del catalogo (rango de precios de
// referencia, demanda por zona y un simulador que el propio especialista
// controla). No inventamos metricas: los numeros salen de src/data/serviceCatalog.
// Al continuar, guardamos el draft (el formulario lo autocompleta) y registramos
// un evento de conversion para no perder el lead.

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// Marcas diacriticas combinantes U+0300–U+036F (via RegExp para no incrustar bytes).
const diacriticsRegex = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(diacriticsRegex, "")
    .toLowerCase()
    .trim();
}

type TradePricing = {
  minTicket: number;
  maxTicket: number;
  medianTicket: number;
  creditsMin: number;
  creditsMax: number | null;
  demandCities: string[];
  matchedCount: number;
  specific: boolean;
};

function pricingForTrade(serviceTypeId: string): TradePricing | null {
  if (!serviceTypeId) return null;
  const specialtyNames = new Set(specialtyOptionsForType(serviceTypeId, false).map((option) => normalize(option.value)));
  let matched = nationalSpecialties.filter((specialty) => specialtyNames.has(normalize(specialty.name)));
  let specific = matched.length > 0;
  if (!matched.length) {
    const tradeLabel = registrationServiceTypeOptions.find((option) => option.value === serviceTypeId)?.label ?? "";
    const tokens = normalize(tradeLabel)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 4);
    if (tokens.length) {
      matched = nationalSpecialties.filter((specialty) => {
        const haystack = normalize(`${specialty.name} ${specialty.categoryName} ${specialty.subcategory} ${specialty.keywords.join(" ")}`);
        return tokens.some((token) => haystack.includes(token));
      });
      specific = matched.length > 0;
    }
  }
  if (!matched.length) {
    matched = nationalSpecialties;
    specific = false;
  }

  const tickets = matched
    .map((specialty) => [specialty.expectedTicketCLP.min, specialty.expectedTicketCLP.max ?? specialty.expectedTicketCLP.min])
    .flat()
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (!tickets.length) return null;

  const minTicket = tickets[0];
  const maxTicket = tickets[tickets.length - 1];
  const medianTicket = tickets[Math.floor(tickets.length / 2)];
  const creditsMin = Math.min(...matched.map((specialty) => specialty.suggestedCredits.min));
  const creditMaxValues = matched.map((specialty) => specialty.suggestedCredits.max).filter((value): value is number => typeof value === "number");
  const creditsMax = creditMaxValues.length ? Math.max(...creditMaxValues) : null;
  const demandCities = Array.from(new Set(matched.flatMap((specialty) => specialty.suggestedCities)));

  return { minTicket, maxTicket, medianTicket, creditsMin, creditsMax, demandCities, matchedCount: matched.length, specific };
}

export function SpecialistOpportunityTeaser() {
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [commune, setCommune] = useState("");
  const [jobsPerWeek, setJobsPerWeek] = useState(3);

  const tradeLabel = useMemo(
    () => registrationServiceTypeOptions.find((option) => option.value === serviceTypeId)?.label ?? "",
    [serviceTypeId],
  );
  const pricing = useMemo(() => pricingForTrade(serviceTypeId), [serviceTypeId]);
  const ready = Boolean(serviceTypeId && commune && pricing);

  const highDemand = useMemo(() => {
    if (!pricing || !commune) return false;
    return pricing.demandCities.some((city) => normalize(city) === normalize(commune));
  }, [pricing, commune]);

  const monthlyEstimate = pricing ? pricing.medianTicket * jobsPerWeek * 4 : 0;

  // Guarda el borrador (el formulario lo precarga) y registra el lead antes de
  // abrir el popup de inscripcion.
  function prepareRegistration() {
    saveSpecialistQuickDraft({ serviceTypeId, baseCommuneName: commune, fromQuickSpecialist: true });
    submitConversionEvent({
      type: "specialist_opportunity_teaser_cta",
      sourceButton: "Anzuelo registro especialista",
      sourceComponent: "SpecialistOpportunityTeaser",
      data: { serviceTypeId, trade: tradeLabel, commune, jobsPerWeek },
    }).catch(() => {});
  }

  return (
    <section className="animate-gradient relative rounded-[32px] border border-brand/20 bg-gradient-to-br from-brand-soft via-white to-sun-soft/40 p-6 shadow-soft md:p-8">
      <p className="eyebrow text-brand">Descúbrelo en 20 segundos</p>
      <h2 className="mt-1 text-2xl font-black text-ink md:text-3xl">¿Cuánto podrías ganar con tu oficio en tu comuna?</h2>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
        Elige tu oficio y tu comuna. Sin registrarte, sin dar tus datos. Te mostramos precios de referencia reales y tu potencial.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SearchableSelect
          label="Tu oficio"
          value={serviceTypeId}
          options={registrationServiceTypeOptions}
          onChange={setServiceTypeId}
          placeholder="Ej: gasfíter, electricista, jardinero..."
        />
        <SearchableSelect
          label="Tu comuna"
          value={commune}
          options={communeOptions}
          onChange={setCommune}
          placeholder="Busca Ñuñoa, Providencia, Maipú..."
        />
      </div>

      {ready && pricing ? (
        <div className="animate-scale-in mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="hover-lift rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-muted">Precio de referencia</p>
                <p className="mt-1 text-2xl font-black text-ink">
                  {clp.format(pricing.minTicket)} – {clp.format(pricing.maxTicket)}
                </p>
                <p className="mt-1 text-xs font-bold text-muted">
                  {pricing.specific
                    ? `por servicio, según el catálogo OficiosPro para ${tradeLabel.toLowerCase()}.`
                    : "por servicio, rango general de referencia en OficiosPro."}
                </p>
              </div>
              <div className="hover-lift rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-muted">Demanda en {commune}</p>
                <p className={`mt-1 text-2xl font-black ${highDemand ? "text-emerald-600" : "text-brand-dark"}`}>
                  {highDemand ? "Alta" : "Activa"}
                </p>
                <p className="mt-1 text-xs font-bold text-muted">
                  {highDemand
                    ? `${commune} está entre las zonas de mayor demanda para tu oficio.`
                    : `Hay clientes buscando ${tradeLabel.toLowerCase()} en tu zona.`}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand/20 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-black text-ink">Simula tu potencial</p>
                <span className="text-xs font-bold text-muted">Tú defines cuántos trabajos tomas</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={jobsPerWeek}
                onChange={(event) => setJobsPerWeek(Number(event.target.value))}
                className="mt-3 w-full accent-brand"
                aria-label="Trabajos por semana"
              />
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-muted">{jobsPerWeek} trabajos/semana</span>
                <span className="text-2xl font-black text-brand-dark">≈ {clp.format(monthlyEstimate)}/mes</span>
              </div>
              <p className="mt-1 text-xs font-bold text-muted">
                Estimación referencial que tú controlas. No es un ingreso garantizado.
              </p>
            </div>
          </div>

          <div className="grid content-between gap-4 rounded-2xl border border-line bg-white p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-muted">Así te verán los clientes</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-black text-white">
                  {tradeLabel.slice(0, 1).toUpperCase() || "★"}
                </span>
                <div>
                  <strong className="block text-ink">{tradeLabel || "Tu oficio"}</strong>
                  <span className="text-xs font-bold text-muted">{commune} · Especialista fundador</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-black text-muted">
                  <span>Fuerza de tu perfil</span>
                  <span>25%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: "25%" }} />
                </div>
                <p className="mt-1 text-xs font-bold text-muted">Tu perfil parte aquí. Complétalo para destacar y subir de nivel.</p>
              </div>
            </div>
            <SpecialistRegisterModal
              label="Quiero recibir estos clientes →"
              className="btn-primary shine w-full"
              onOpen={prepareRegistration}
            />
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-brand/30 bg-white/60 p-4 text-sm font-bold text-muted">
          👆 Elige tu oficio y tu comuna para ver tu potencial al instante.
        </p>
      )}
    </section>
  );
}
