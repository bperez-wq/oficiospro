"use client";

import { useEffect, useState } from "react";
import { defaultCommercialConfig, type CommercialPricingConfig } from "@/data/commercialConfig";
import {
  calculateClientCreditsFromSpecialistPayout,
  estimateClientPriceCLP,
  estimatePlatformMarginCLP,
  formatCLP,
  normalizeCLPInput,
} from "@/lib/pricing";

const storageKey = "oficiospro.internalPricingConfig";

type NumericPricingKey = Exclude<keyof CommercialPricingConfig, "freeInitialVisitEnabled" | "categoryMultipliers" | "communeMultipliers" | "certificationRequiredByCategory">;

export function AdminPricingPanel() {
  const [config, setConfig] = useState<CommercialPricingConfig>(defaultCommercialConfig);
  const [samplePayout, setSamplePayout] = useState(25000);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setConfig({ ...defaultCommercialConfig, ...JSON.parse(stored) });
    } catch {
      setConfig(defaultCommercialConfig);
    }
  }, []);

  function save(next: CommercialPricingConfig) {
    setConfig(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function updateNumber(key: NumericPricingKey, value: number) {
    save({ ...config, [key]: value });
  }

  const sample = {
    specialistExpectedPayoutCLP: samplePayout,
    categoryId: "hogar",
    communeName: "Santiago",
    config,
  };
  const calculatedCredits = calculateClientCreditsFromSpecialistPayout(sample);
  const estimatedClientPrice = estimateClientPriceCLP(sample);
  const estimatedMargin = estimatePlatformMarginCLP(sample);

  return (
    <section className="grid gap-5 rounded-[24px] border border-line bg-white p-5">
      <div>
        <p className="eyebrow">Pricing interno</p>
        <h3 className="text-2xl font-black">Configuracion comercial interna</h3>
        <p className="mt-2 text-sm font-bold text-muted">
          El especialista declara CLP. OficiosPro convierte esa tarifa a creditos cliente, margen y payout aprobado desde reglas internas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PricingNumber label="Valor credito cliente CLP" value={config.customerCreditValueCLP} onChange={(value) => updateNumber("customerCreditValueCLP", value)} />
        <PricingNumber label="Fee plataforma %" value={config.platformFeePercent * 100} onChange={(value) => updateNumber("platformFeePercent", value / 100)} />
        <PricingNumber label="Costo pago %" value={config.paymentFeePercent * 100} onChange={(value) => updateNumber("paymentFeePercent", value / 100)} />
        <PricingNumber label="Buffer riesgo %" value={config.riskBufferPercent * 100} onChange={(value) => updateNumber("riskBufferPercent", value / 100)} />
        <PricingNumber label="Fee fijo servicio CLP" value={config.fixedServiceFeeCLP} onChange={(value) => updateNumber("fixedServiceFeeCLP", value)} />
        <PricingNumber label="Multiplicador urgencia" value={config.emergencyMultiplier} step="0.05" onChange={(value) => updateNumber("emergencyMultiplier", value)} />
        <PricingNumber label="Minimo creditos cliente" value={config.minimumClientCredits} onChange={(value) => updateNumber("minimumClientCredits", value)} />
        <PricingNumber label="Redondeo creditos" value={config.creditRoundingStep} onChange={(value) => updateNumber("creditRoundingStep", value)} />
        <PricingNumber label="Payout minimo especialista" value={config.minimumSpecialistPayoutCLP} onChange={(value) => updateNumber("minimumSpecialistPayoutCLP", value)} />
        <PricingNumber label="Payout maximo especialista" value={config.maximumSpecialistPayoutCLP} onChange={(value) => updateNumber("maximumSpecialistPayoutCLP", value)} />
        <PricingNumber label="Creditos visita inicial" value={config.initialVisitCredits} onChange={(value) => updateNumber("initialVisitCredits", value)} />
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-muted">
          <input checked={config.freeInitialVisitEnabled} type="checkbox" onChange={(event) => save({ ...config, freeInitialVisitEnabled: event.target.checked })} />
          Visita inicial gratis habilitada
        </label>
      </div>

      <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-4">
        <label className="field">
          Simular tarifa especialista
          <input type="number" min="0" step="1000" value={samplePayout} onChange={(event) => setSamplePayout(normalizeCLPInput(event.target.value))} />
        </label>
        <Metric label="Tarifa esperada especialista CLP" value={formatCLP(samplePayout)} />
        <Metric label="Creditos cliente calculados" value={`${calculatedCredits} creditos`} />
        <Metric label="Precio cliente CLP estimado interno" value={formatCLP(estimatedClientPrice)} />
        <Metric label="Margen estimado" value={formatCLP(estimatedMargin)} />
      </div>

      <p className="text-xs font-bold text-muted">
        Nota: esta configuracion es una base local para administracion. En produccion, los margenes sensibles deben resolverse en Worker/env antes de publicar precios.
      </p>
    </section>
  );
}

function PricingNumber({ label, value, step = "1", onChange }: { label: string; value: number; step?: string; onChange: (value: number) => void }) {
  return (
    <label className="field">
      {label}
      <input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-2 block text-lg font-black text-ink">{value}</strong>
    </article>
  );
}
