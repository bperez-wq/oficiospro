"use client";

import { useEffect, useMemo, useState } from "react";
import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";
import { formatCLP, getPlanById } from "@/data/marketplace";
import {
  getTransactions,
  saveSubscription,
  saveTransactions,
  saveWallet,
  seedMockState,
  setMockSession,
} from "@/lib/storage";

export default function CheckoutPage() {
  const [planId, setPlanId] = useState("plus");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta terminada en 4242");
  const plan = useMemo(() => getPlanById(planId), [planId]);

  useEffect(() => {
    seedMockState();
    const params = new URLSearchParams(window.location.search);
    setPlanId(params.get("plan") ?? "plus");
  }, []);

  function activate() {
    setMockSession({
      role: plan.audience === "empresa" ? "company" : "client",
      name: plan.audience === "empresa" ? "Empresa OficiosPro" : "Cliente OficiosPro",
      planId: plan.id,
      createdAt: new Date().toISOString(),
    });
    saveSubscription(plan, paymentMethod);
    saveWallet({ balance: plan.monthlyCredits, expiresInMonths: plan.accumulatesMonths });
    saveTransactions([
      {
        id: `tx-sub-${Date.now()}`,
        type: "Suscripción",
        detail: plan.name,
        amount: plan.monthlyCredits,
        date: new Date().toISOString().slice(0, 10),
      },
      ...getTransactions(),
    ]);
    setStatus("Tu suscripción quedó activa con renovación automática mensual.");
    window.setTimeout(() => {
      window.location.href = plan.audience === "empresa" ? "/dashboard-empresa?subscription=active" : "/dashboard-cliente?subscription=active";
    }, 900);
  }

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <article className="panel">
          <p className="eyebrow">Checkout seguro</p>
          <h1 className="text-4xl font-black md:text-5xl">Activa tu suscripción OficiosPro.</h1>
          <p className="mt-4 max-w-2xl font-semibold leading-7 text-muted">
            Confirma tu plan, medio de pago y renovación mensual para activar tus créditos acumulables.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Plan seleccionado" value={plan.name} />
            <SummaryTile label="Precio mensual" value={formatCLP(plan.priceCLP)} />
            <SummaryTile label="Créditos mensuales" value={`${plan.monthlyCredits} créditos`} />
            <SummaryTile label="Vigencia" value={`${plan.accumulatesMonths} meses`} />
          </div>

          <div className="mt-8 grid gap-4 rounded-[24px] border border-line bg-slate-50 p-5">
            <label className="field">
              Medio de pago simulado
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option>Tarjeta terminada en 4242</option>
                <option>Webpay</option>
                <option>Mercado Pago</option>
              </select>
            </label>
            <div className="rounded-2xl bg-white p-4 text-sm font-bold text-muted">
              Renovación automática mensual. Los créditos se cargan cada mes y se acumulan hasta {plan.accumulatesMonths} meses.
            </div>
            <button className="btn-primary" type="button" onClick={activate}>
              Activar suscripción
            </button>
            {status ? <p className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{status}</p> : null}
          </div>
        </article>

        <aside className="grid gap-5 self-start">
          <article className="enterprise-shell p-6">
            <p className="eyebrow text-teal-200">Resumen</p>
            <strong className="block text-4xl font-black">{plan.monthlyCredits}</strong>
            <span className="font-bold text-white/70">créditos disponibles al activar</span>
            <div className="mt-5 grid gap-2">
              {plan.benefits.map((benefit) => (
                <span key={benefit} className="rounded-2xl bg-white/10 p-3 text-sm font-black">
                  {benefit}
                </span>
              ))}
            </div>
          </article>
          <ConversionButton
            type={plan.audience === "empresa" ? "plan_empresa" : "lead_cliente"}
            sourceButton="Cambiar plan checkout"
            className="btn-secondary"
          >
            Cambiar plan
          </ConversionButton>
        </aside>
      </section>
    </main>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <span className="text-sm font-black uppercase text-muted">{label}</span>
      <strong className="mt-2 block text-2xl font-black text-ink">{value}</strong>
    </article>
  );
}
