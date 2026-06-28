"use client";

import { useMemo, useState } from "react";

const monthOptions = [1, 3, 6, 12];

export function CreditExplainer({
  availableCredits = 35,
  heldCredits = 0,
  expiringCredits = 0,
  monthlyCredits = 35,
  baseServiceCredits = 12,
  clubServiceCredits = 10,
  title = "Como funcionan tus creditos",
  compact = false,
}: {
  availableCredits?: number;
  heldCredits?: number;
  expiringCredits?: number;
  monthlyCredits?: number;
  baseServiceCredits?: number;
  clubServiceCredits?: number;
  title?: string;
  compact?: boolean;
}) {
  const [months, setMonths] = useState(3);
  const savingsPerRequest = Math.max(0, baseServiceCredits - clubServiceCredits);
  const accumulated = useMemo(() => monthlyCredits * months, [monthlyCredits, months]);
  const sampleRequests = Math.max(1, Math.floor(accumulated / Math.max(1, clubServiceCredits)));

  return (
    <section className={`rounded-[28px] border border-line bg-white shadow-soft ${compact ? "p-4" : "p-5"}`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <div>
          <p className="eyebrow">Creditos protegidos</p>
          <h2 className={`${compact ? "text-2xl" : "text-3xl"} font-black text-ink`}>{title}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            Tus creditos funcionan como una cuenta de ahorro para mantenciones. Se acumulan mes a mes, puedes usarlos en distintos servicios y vencen a 24 meses.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <CreditMetric label="Disponibles" value={availableCredits} />
            <CreditMetric label="Retenidos" value={heldCredits} />
            <CreditMetric label="Por vencer" value={expiringCredits} />
          </div>
        </div>

        <article className="rounded-2xl border border-brand/15 bg-brand-soft p-4">
          <span className="text-xs font-black uppercase text-brand-dark">Ejemplo de uso</span>
          <h3 className="mt-2 text-xl font-black text-ink">Gasfiteria base</h3>
          <div className="mt-4 grid gap-2">
            <Row label="Sin suscripcion" value={`${baseServiceCredits} creditos`} />
            <Row label="Club Hogar" value={`${clubServiceCredits} creditos`} />
            <Row label="Ahorro por solicitud" value={`${savingsPerRequest} creditos`} strong />
          </div>
          <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm font-black text-brand-dark">
            Los adicionales tambien se pueden pagar con creditos, siempre previa aprobacion.
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-black uppercase text-muted">Simulador</span>
            <h3 className="text-xl font-black text-ink">Plan Basico: {monthlyCredits} creditos mensuales</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {monthOptions.map((option) => (
              <button
                key={option}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${months === option ? "bg-brand text-white" : "border border-line bg-white text-muted hover:border-brand hover:text-brand"}`}
                type="button"
                onClick={() => setMonths(option)}
              >
                {option} mes{option > 1 ? "es" : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <CreditMetric label="Acumulas" value={accumulated} />
          <CreditMetric label="Servicios ejemplo" value={sampleRequests} suffix="" />
          <CreditMetric label="Ahorro potencial" value={sampleRequests * savingsPerRequest} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-6 text-muted">
          Los créditos se retienen al reservar y quedan protegidos: si el trabajo no se completa, no se liberan al especialista y revisamos el caso.
        </p>
        <a className="shrink-0 text-sm font-black text-brand-dark underline-offset-4 hover:underline" href="/faq">
          Ver preguntas de créditos
        </a>
      </div>
    </section>
  );
}

function CreditMetric({ label, value, suffix = "creditos" }: { label: string; value: number; suffix?: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-2xl font-black text-ink">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </strong>
    </article>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3 text-sm">
      <span className="font-bold text-muted">{label}</span>
      <strong className={strong ? "text-brand-dark" : "text-ink"}>{value}</strong>
    </div>
  );
}
