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

type NumericPricingKey = Exclude<
  keyof CommercialPricingConfig,
  "freeInitialVisitEnabled" | "subscriberDiscountAppliesTo" | "categoryMultipliers" | "communeMultipliers" | "certificationRequiredByCategory"
>;

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

  function updateCategoryMultiplier(categoryId: string, value: number) {
    save({ ...config, categoryMultipliers: { ...config.categoryMultipliers, [categoryId]: value } });
  }

  function updateCommuneMultiplier(communeName: string, value: number) {
    save({ ...config, communeMultipliers: { ...config.communeMultipliers, [communeName]: value } });
  }

  function updateCertificationRequirement(categoryId: string, required: boolean) {
    save({ ...config, certificationRequiredByCategory: { ...config.certificationRequiredByCategory, [categoryId]: required } });
  }

  const sample = {
    specialistExpectedPayoutCLP: samplePayout,
    categoryId: "hogar",
    communeName: "Santiago",
    config,
  };
  const calculatedCredits = calculateClientCreditsFromSpecialistPayout(sample);
  const estimatedClientPrice = estimateClientPriceCLP(sample);
  const estimatedCommission = estimatePlatformMarginCLP(sample);

  return (
    <section className="grid gap-5 rounded-[24px] border border-line bg-white p-5">
      <div>
        <p className="eyebrow">Pricing interno</p>
        <h3 className="text-2xl font-black">Configuracion comercial interna</h3>
        <p className="mt-2 text-sm font-bold text-muted">
          El especialista declara CLP. OficiosPro convierte esa tarifa a creditos cliente usando Comision OficiosPro 9,5% + IVA. Los planes y packs mantienen precios comerciales independientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PricingNumber label="Valor credito cliente CLP" value={config.customerCreditValueCLP} onChange={(value) => updateNumber("customerCreditValueCLP", value)} />
        <PricingNumber label="Comision referencia %" value={config.platformFeePercent * 100} onChange={(value) => updateNumber("platformFeePercent", value / 100)} />
        <PricingNumber label="Costo pago legacy %" value={config.paymentFeePercent * 100} onChange={(value) => updateNumber("paymentFeePercent", value / 100)} />
        <PricingNumber label="Buffer riesgo legacy %" value={config.riskBufferPercent * 100} onChange={(value) => updateNumber("riskBufferPercent", value / 100)} />
        <PricingNumber label="Fee fijo legacy CLP" value={config.fixedServiceFeeCLP} onChange={(value) => updateNumber("fixedServiceFeeCLP", value)} />
        <PricingNumber label="Multiplicador urgencia" value={config.emergencyMultiplier} step="0.05" onChange={(value) => updateNumber("emergencyMultiplier", value)} />
        <PricingNumber label="Minimo creditos cliente" value={config.minimumClientCredits} onChange={(value) => updateNumber("minimumClientCredits", value)} />
        <PricingNumber label="Redondeo creditos" value={config.creditRoundingStep} onChange={(value) => updateNumber("creditRoundingStep", value)} />
        <PricingNumber label="Payout minimo especialista" value={config.minimumSpecialistPayoutCLP} onChange={(value) => updateNumber("minimumSpecialistPayoutCLP", value)} />
        <PricingNumber label="Payout maximo especialista" value={config.maximumSpecialistPayoutCLP} onChange={(value) => updateNumber("maximumSpecialistPayoutCLP", value)} />
        <PricingNumber label="Comision minima hogar futura" value={config.minimumHomeMarginCLP} onChange={(value) => updateNumber("minimumHomeMarginCLP", value)} />
        <PricingNumber label="Comision minima empresa futura" value={config.minimumCompanyMarginCLP} onChange={(value) => updateNumber("minimumCompanyMarginCLP", value)} />
        <PricingNumber label="Comision minima agricola futura" value={config.minimumAgriculturalMarginCLP} onChange={(value) => updateNumber("minimumAgriculturalMarginCLP", value)} />
        <PricingNumber label="Comision minima industrial futura" value={config.minimumIndustrialMarginCLP} onChange={(value) => updateNumber("minimumIndustrialMarginCLP", value)} />
        <PricingNumber label="Descuento suscriptor por solicitud" value={config.subscriberDiscountCredits} onChange={(value) => updateNumber("subscriberDiscountCredits", value)} />
        <PricingNumber label="Creditos visita inicial" value={config.initialVisitCredits} onChange={(value) => updateNumber("initialVisitCredits", value)} />
        <PricingNumber label="Fee visita inicial creditos" value={config.initialVisitFeeCredits} onChange={(value) => updateNumber("initialVisitFeeCredits", value)} />
        <PricingNumber label="Comision materiales %" value={config.materialCommissionPercent * 100} onChange={(value) => updateNumber("materialCommissionPercent", value / 100)} />
        <PricingNumber label="Comision adicional mano de obra %" value={config.additionalLaborCommissionPercent * 100} onChange={(value) => updateNumber("additionalLaborCommissionPercent", value / 100)} />
        <PricingNumber label="Vencimiento cotizacion dias" value={config.quoteExpirationDays} onChange={(value) => updateNumber("quoteExpirationDays", value)} />
        <PricingNumber label="Maximo adicionales por solicitud" value={config.maxAdditionalsPerRequest} onChange={(value) => updateNumber("maxAdditionalsPerRequest", value)} />
        <PricingNumber label="Revision admin si total > creditos" value={config.adminApprovalCreditThreshold} onChange={(value) => updateNumber("adminApprovalCreditThreshold", value)} />
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-muted">
          <input checked={config.freeInitialVisitEnabled} type="checkbox" onChange={(event) => save({ ...config, freeInitialVisitEnabled: event.target.checked })} />
          Visita inicial gratis habilitada
        </label>
        {(["fixed", "visit", "baseRequest", "additionals"] as const).map((key) => (
          <label key={key} className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-muted">
            <input
              checked={config.subscriberDiscountAppliesTo[key]}
              type="checkbox"
              onChange={(event) => save({ ...config, subscriberDiscountAppliesTo: { ...config.subscriberDiscountAppliesTo, [key]: event.target.checked } })}
            />
            Descuento aplica a {key}
          </label>
        ))}
      </div>

      <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-4">
        <label className="field">
          Simular tarifa especialista
          <input type="number" min="0" step="1000" value={samplePayout} onChange={(event) => setSamplePayout(normalizeCLPInput(event.target.value))} />
        </label>
        <Metric label="Tarifa esperada especialista CLP" value={formatCLP(samplePayout)} />
        <Metric label="Creditos cliente calculados" value={`${calculatedCredits} creditos`} />
        <Metric label="Precio cliente CLP estimado interno" value={formatCLP(estimatedClientPrice)} />
        <Metric label="Comision OficiosPro estimada" value={formatCLP(estimatedCommission)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InternalRuleEditor
          title="Multiplicadores por categoria"
          description="Ajusta recargos internos por tipo de servicio antes de publicar creditos cliente."
          entries={config.categoryMultipliers}
          valueLabel="Multiplicador"
          onNumberChange={updateCategoryMultiplier}
        />
        <InternalRuleEditor
          title="Multiplicadores por comuna"
          description="Ajusta reglas comerciales por cobertura, desplazamiento o densidad operacional."
          entries={config.communeMultipliers}
          valueLabel="Multiplicador"
          onNumberChange={updateCommuneMultiplier}
        />
        <CertificationRuleEditor
          title="Certificacion requerida por categoria"
          description="Define que categorias requieren respaldo antes de activar servicios."
          entries={config.certificationRequiredByCategory}
          onToggle={updateCertificationRequirement}
        />
      </div>

      <p className="text-xs font-bold text-muted">
        Nota: esta configuracion es una base local para administracion. En produccion, la comision vigente para servicios debe venir de taxConfig/Worker y mantenerse en 9,5% + IVA hasta nueva version validada.
      </p>
    </section>
  );
}

function InternalRuleEditor({
  title,
  description,
  entries,
  valueLabel,
  onNumberChange,
}: {
  title: string;
  description: string;
  entries: Record<string, number>;
  valueLabel: string;
  onNumberChange: (key: string, value: number) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4">
      <div>
        <h4 className="text-lg font-black text-ink">{title}</h4>
        <p className="mt-1 text-xs font-bold text-muted">{description}</p>
      </div>
      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
        {Object.entries(entries).map(([key, value]) => (
          <label key={key} className="grid gap-2 rounded-xl bg-white p-3 text-sm font-black text-muted">
            <span>{key}</span>
            <span className="sr-only">{valueLabel}</span>
            <input type="number" min="0" step="0.01" value={value} onChange={(event) => onNumberChange(key, Number(event.target.value))} />
          </label>
        ))}
      </div>
    </div>
  );
}

function CertificationRuleEditor({
  title,
  description,
  entries,
  onToggle,
}: {
  title: string;
  description: string;
  entries: Record<string, boolean>;
  onToggle: (key: string, required: boolean) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4">
      <div>
        <h4 className="text-lg font-black text-ink">{title}</h4>
        <p className="mt-1 text-xs font-bold text-muted">{description}</p>
      </div>
      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
        {Object.entries(entries).map(([key, required]) => (
          <label key={key} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm font-black text-muted">
            <span>{key}</span>
            <input type="checkbox" checked={required} onChange={(event) => onToggle(key, event.target.checked)} />
          </label>
        ))}
      </div>
    </div>
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
