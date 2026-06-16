"use client";

import { useMemo, useState } from "react";
import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { founderRegistrationHref, type AcquisitionContext } from "@/data/specialistAcquisition";

const trades = [
  { value: "Gasfiteria", label: "Gasfiteria" },
  { value: "Electricidad", label: "Electricidad" },
  { value: "Climatizacion", label: "Climatizacion" },
  { value: "Otro", label: "Otro" },
];

const TOTAL = 3;

export function FounderWizard({ context }: { context: AcquisitionContext }) {
  const [step, setStep] = useState(1);
  const [trade, setTrade] = useState<string | null>(null);
  const [commune, setCommune] = useState("");

  const href = useMemo(
    () =>
      founderRegistrationHref({
        ...context,
        trade: trade ?? undefined,
        commune: commune.trim() || undefined,
      }),
    [context, trade, commune],
  );

  const canContinue = step === 1 ? Boolean(trade) : true;

  return (
    <div className="grid items-center gap-8 rounded-[32px] border border-line bg-white p-7 shadow-soft lg:grid-cols-2 lg:p-10">
      <div>
        <p className="eyebrow">Postulacion guiada</p>
        <h2 className="text-3xl font-black leading-tight text-ink md:text-4xl">Empieza en menos de 2 minutos</h2>
        <p className="mt-4 max-w-md text-base font-semibold leading-7 text-muted">
          Un asistente corto que prepara tu perfil fundador. Al terminar te llevamos al registro con tus datos listos.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="chip-brand">Sin compromiso</span>
          <span className="chip-emerald">Guardado al postular</span>
        </div>
      </div>

      <div className="rounded-card border border-line bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL) * 100}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-xs font-black text-muted">Paso {step} de {TOTAL}</span>
        </div>

        {step === 1 && (
          <div className="mt-5">
            <p className="text-lg font-black text-ink">¿Cual es tu oficio principal?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {trades.map((option) => {
                const selected = trade === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTrade(option.value)}
                    aria-pressed={selected}
                    className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 text-left text-sm font-black transition ${
                      selected ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white text-ink hover:border-brand/40"
                    }`}
                  >
                    {option.label}
                    {selected && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5">
            <p className="text-lg font-black text-ink">¿Donde quieres trabajar?</p>
            <label className="field mt-4">
              Comuna principal
              <input
                type="text"
                value={commune}
                onChange={(event) => setCommune(event.target.value)}
                placeholder="Ej: Maipu, Nunoa, La Florida"
              />
            </label>
            <p className="mt-3 text-xs font-bold leading-5 text-muted">
              Podras agregar mas comunas de cobertura en el registro.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-3 text-lg font-black text-ink">Tu perfil fundador esta listo para revision</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {trade ? `${trade}${commune ? ` · ${commune}` : ""}. ` : ""}Te confirmamos en 48 h, sin costo de entrada.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((value) => value - 1)} className="btn-secondary flex-1">
              Atras
            </button>
          )}
          {step < TOTAL ? (
            <button
              type="button"
              onClick={() => canContinue && setStep((value) => value + 1)}
              disabled={!canContinue}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <AcquisitionTrackingLink
              href={href}
              className="btn-primary flex-1"
              sourceButton="Wizard - Postular ahora"
              sourceComponent="FounderWizard"
              context={{ ...context, trade: trade ?? undefined, commune: commune.trim() || undefined }}
            >
              Postular ahora
            </AcquisitionTrackingLink>
          )}
        </div>
        <p className="mt-3 text-center text-[11px] font-bold text-muted">
          Asistente de postulacion · continua en /registro-especialista
        </p>
      </div>
    </div>
  );
}
