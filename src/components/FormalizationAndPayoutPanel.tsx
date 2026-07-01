"use client";

import { useMemo, useState } from "react";
import { chileTaxConfig2026 } from "@/config/taxConfig";
import { formatCLP } from "@/data/marketplace";
import {
  OP_SPA_DOCUMENT_RECEIVER,
  requiredDocumentLabels,
  specialistTaxTypeLabels,
  type SpecialistFormalizationTaxType,
} from "@/data/specialistFormalization";
import {
  calculatePayoutFromTarget,
  commissionRuleFromCommercialConfig,
} from "@/lib/finance/specialistPayoutCalculator";

type Props = {
  variant?: "specialist" | "admin" | "public";
  initialTaxType?: SpecialistFormalizationTaxType;
  initialTargetCLP?: number;
};

export function FormalizationAndPayoutPanel({
  variant = "specialist",
  initialTaxType = "boleta_honorarios",
  initialTargetCLP = 35000,
}: Props) {
  const [taxType, setTaxType] = useState<SpecialistFormalizationTaxType>(initialTaxType);
  const [targetCLP, setTargetCLP] = useState(initialTargetCLP);
  const [accountantReviewed, setAccountantReviewed] = useState(false);
  const [siiValidated, setSiiValidated] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");

  const calculation = useMemo(
    () =>
      calculatePayoutFromTarget({
        specialistTargetAmountCLP: targetCLP,
        taxType,
        commissionRule: commissionRuleFromCommercialConfig(),
        taxConfig: chileTaxConfig2026,
        accountantReviewed,
        siiValidated,
      }),
    [accountantReviewed, siiValidated, targetCLP, taxType],
  );
  const isAdmin = variant === "admin";

  async function copyText(label: string, text: string) {
    if (!text || text.includes("por configurar")) {
      setCopyNotice("Dato pendiente de configurar antes de usar en documentos reales.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(`${label} copiado.`);
    } catch {
      setCopyNotice("No pudimos copiar automaticamente. Revisa el dato en pantalla.");
    }
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-[28px] border border-brand/15 bg-brand-soft p-5 shadow-soft">
        <p className="eyebrow">Formalizacion y cobro</p>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black leading-tight text-ink">
              OficiosPro calcula la liquidacion y bloquea pagos sin documento validado.
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-brand-dark">
              Comisión OficiosPro: 9,5% + IVA. Financia tecnologia, operación, soporte, pago protegido y gestion de plataforma.
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
              Calculo referencial sujeto a validacion contable/SII. El especialista no debe definir impuestos manualmente: declara su situacion y OficiosPro prepara el flujo.
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
              Los documentos tributarios solo deben emitirse cuando exista autorizacion interna de OP SpA. No se permite ceder, factorizar o transferir documentos emitidos a OP SpA sin autorizacion previa y por escrito.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
            <strong className="text-sm font-black text-ink">Regla operacional</strong>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              Si no existe boleta/factura emitida a OP SpA y validada, la liquidacion queda bloqueada. Si no hay storage privado para archivos, el estado es pending_secure_storage.
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            <label className="field">
              Como documentas tus servicios
              <select value={taxType} onChange={(event) => setTaxType(event.target.value as SpecialistFormalizationTaxType)}>
                <option value="boleta_honorarios">{specialistTaxTypeLabels.boleta_honorarios}</option>
                <option value="factura_afecta">{specialistTaxTypeLabels.factura_afecta}</option>
                <option value="factura_exenta">{specialistTaxTypeLabels.factura_exenta}</option>
                <option value="unknown">{specialistTaxTypeLabels.unknown}</option>
              </select>
            </label>
            <label className="field">
              Tarifa esperada por el servicio
              <input
                type="number"
                min="0"
                step="1000"
                value={targetCLP}
                onChange={(event) => setTargetCLP(Number(event.target.value))}
              />
              <span className="text-xs font-bold text-muted">Monto CLP declarado por el especialista. OficiosPro calcula créditos y documento requerido.</span>
            </label>
            {isAdmin ? (
              <div className="grid gap-2 rounded-2xl border border-line bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-bold text-muted">
                  <input type="checkbox" checked={accountantReviewed} onChange={(event) => setAccountantReviewed(event.target.checked)} />
                  Validado por contador
                </label>
                <label className="flex items-center gap-3 text-sm font-bold text-muted">
                  <input type="checkbox" checked={siiValidated} onChange={(event) => setSiiValidated(event.target.checked)} />
                  Capacidad SII validada
                </label>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Documento requerido" value={requiredDocumentLabels[calculation.requiredDocumentType]} />
              <Metric label="Estado payout" value={calculation.payoutAllowed ? "Listo para revision final" : "Bloqueado"} tone={calculation.payoutAllowed ? "ok" : "warning"} />
              <Metric label="Documento especialista" value={formatCLP(calculation.specialistDocumentGrossCLP)} />
              <Metric label="Liquidacion estimada" value={formatCLP(calculation.specialistLiquidPayoutCLP)} />
              <Metric label="Retencion estimada" value={formatCLP(calculation.withholdingAmountCLP)} />
              <Metric label="IVA documento" value={formatCLP(calculation.specialistIvaAmountCLP)} />
              <Metric label="Comisión OficiosPro" value={formatCLP(calculation.platformCommissionGrossCLP)} detail={chileTaxConfig2026.platformCommission.shortLabel} />
              <Metric label="Comisión neta" value={formatCLP(calculation.platformCommissionNetCLP)} />
              <Metric label="IVA comisión" value={formatCLP(calculation.platformCommissionIvaCLP)} />
              <Metric label="Creditos cliente" value={`${calculation.totalCreditsEstimate} créditos`} />
              {isAdmin ? <Metric label="Base de calculo" value={formatCLP(calculation.platformCommissionBaseCLP)} detail={calculation.platformCommissionBaseMode.replace(/_/g, " ")} /> : null}
              {isAdmin ? <Metric label="Regla aplicada" value={calculation.platformCommissionLabel} detail={chileTaxConfig2026.platformCommission.description} /> : null}
            </div>
            {calculation.blockReasons.length ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-black text-amber-900">
                Pendiente de validacion contable/documental: {calculation.blockReasons.map((reason) => reason.replace(/_/g, " ")).join(", ")}.
              </p>
            ) : null}
            <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">
              {calculation.warnings[0]} El precio cliente puede variar segun documento, retencion, materiales, urgencia y validacion final.
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Emitir documento a OP SpA</p>
            <h3 className="text-2xl font-black text-ink">Datos del receptor</h3>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-muted">
              Estos datos deben validarse antes de emitir documentos reales. El especialista debe esperar una autorizacion interna con codigo antes de emitir. Si llega un documento no autorizado, con monto distinto, duplicado o cedido/factorizado sin autorizacion escrita, OficiosPro puede reclamarlo, rechazarlo y bloquear la liquidacion hasta revision contable/legal.
            </p>
          </div>
          <span className="chip bg-slate-100 text-muted">No emite documentos reales</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ReceiverField label="Razon social" value={OP_SPA_DOCUMENT_RECEIVER.legalName} onCopy={copyText} />
          <ReceiverField label="RUT" value={OP_SPA_DOCUMENT_RECEIVER.rut} onCopy={copyText} />
          <ReceiverField label="Email" value={OP_SPA_DOCUMENT_RECEIVER.email} onCopy={copyText} />
          <ReceiverField label="Giro" value={OP_SPA_DOCUMENT_RECEIVER.activity} onCopy={copyText} />
          <ReceiverField label="Direccion" value={OP_SPA_DOCUMENT_RECEIVER.address} onCopy={copyText} className="md:col-span-2" />
        </div>
        {copyNotice ? <p className="mt-4 rounded-2xl bg-brand-soft p-3 text-sm font-black text-brand-dark">{copyNotice}</p> : null}
      </article>
    </section>
  );
}

function Metric({ label, value, detail, tone = "neutral" }: { label: string; value: string; detail?: string; tone?: "neutral" | "ok" | "warning" }) {
  const toneClass = tone === "ok" ? "border-emerald-200 bg-emerald-50" : tone === "warning" ? "border-amber-200 bg-amber-50" : "border-line bg-slate-50";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-sm text-ink">{value}</strong>
      {detail ? <span className="mt-1 block text-xs font-bold leading-5 text-muted">{detail}</span> : null}
    </div>
  );
}

function ReceiverField({
  label,
  value,
  onCopy,
  className = "",
}: {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-slate-50 p-4 ${className}`}>
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <strong className="break-words text-sm text-ink">{value}</strong>
        <button className="btn-secondary min-h-11 px-4 text-sm" type="button" onClick={() => onCopy(label, value)}>
          Copiar
        </button>
      </div>
    </div>
  );
}
