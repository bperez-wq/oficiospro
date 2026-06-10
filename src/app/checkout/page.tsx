"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditExplainer } from "@/components/CreditExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { formatCLP, getPlanById } from "@/data/marketplace";
import { addCartItem } from "@/lib/cart";
import { DEFAULT_REGION_CODE, regionCodeForName, regionNameForCode } from "@/lib/catalog";
import { submitLead } from "@/lib/leadClient";
import {
  addPaymentCredits,
  appendPaymentRecord,
  getClientProfile,
  getMockSession,
  seedMockState,
  setMockSession,
  upsertPaymentSubscription,
} from "@/lib/storage";

type PaymentApiResponse = {
  ok: boolean;
  provider?: "mercadopago";
  type?: "checkout" | "subscription";
  status?: string;
  code?: string;
  message?: string;
  preferenceId?: string;
  preapprovalId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  nextBillingDate?: string | null;
};

const nextBilling = new Date();
nextBilling.setMonth(nextBilling.getMonth() + 1);

const creditPacks = [
  { credits: 20, label: "20 créditos", detail: "Para visitas y reparaciones menores." },
  { credits: 50, label: "50 créditos", detail: "Para mantenciones programadas." },
  { credits: 100, label: "100 créditos", detail: "Bolsa familiar o empresa pequeña." },
];

const paymentContexts = [
  { id: "service_fixed_hold", label: "Servicio fijo", detail: "Reserva con creditos exactos.", credits: 12 },
  { id: "visit_hold", label: "Visita tecnica", detail: "Diagnostico antes de propuesta.", credits: 6 },
  { id: "quote_acceptance_hold", label: "Cotizacion aceptada", detail: "Retencion del total acordado.", credits: 48 },
  { id: "additional_work_hold", label: "Adicional aprobado", detail: "Trabajo adicional autorizado.", credits: 10 },
  { id: "materials_hold", label: "Materiales", detail: "Materiales aprobados por cliente.", credits: 8 },
  { id: "service_hourly_hold", label: "Horas adicionales", detail: "Bloque inicial o extra por hora.", credits: 16 },
];

export default function CheckoutPage() {
  const [planId, setPlanId] = useState("plus");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number | null>(paymentContexts[0].credits);
  const [paymentContext, setPaymentContext] = useState(paymentContexts[0]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    rut: "",
    whatsapp: "",
    region: DEFAULT_REGION_CODE,
    commune: "Las Condes",
  });
  const plan = useMemo(() => getPlanById(planId), [planId]);

  useEffect(() => {
    seedMockState();
    const params = new URLSearchParams(window.location.search);
    const nextPlanId = params.get("plan") ?? "plus";
    const requestedMode = params.get("mode");
    setPlanId(nextPlanId);
    const context = paymentContexts.find((item) => item.id === requestedMode) ?? paymentContexts[0];
    setPaymentContext(context);
    if (requestedMode) setSelectedPack(context.credits);
    const profile = getClientProfile();
    const session = getMockSession();
    setCustomer({
      name: profile?.name ?? session?.name ?? "",
      email: profile?.email ?? session?.email ?? "",
      rut: profile?.rut ?? "",
      whatsapp: profile?.phone ?? "",
      region: regionCodeForName(profile?.region ?? "") || DEFAULT_REGION_CODE,
      commune: profile?.commune ?? "Las Condes",
    });
  }, []);

  async function startPayment(mode: "subscription" | "credits_purchase" = "subscription") {
    if (!customer.region || !customer.commune) {
      setStatus("Selecciona región y comuna para continuar con la activación.");
      return;
    }
    setIsSubmitting(true);
    setStatus("");
    addCartItem({
      type: mode === "subscription" ? "subscription_plan" : "credit_pack",
      title: mode === "subscription" ? plan.name : `${selectedPack ?? paymentContext.credits} creditos`,
      planId: mode === "subscription" ? plan.id : undefined,
      credits: mode === "subscription" ? plan.monthlyCredits : selectedPack ?? paymentContext.credits,
      priceCLP: mode === "subscription" ? plan.priceCLP : (selectedPack ?? paymentContext.credits) * 1000,
    });
    const endpoint = mode === "subscription" ? "/api/payments/create-subscription" : "/api/payments/create-checkout";
    await submitLead({
      leadType: "payment_interest",
      fullName: customer.name || (plan.audience === "empresa" ? "Empresa OficiosPro" : "Cliente OficiosPro"),
      email: customer.email,
      phone: customer.whatsapp,
      service: mode === "subscription" ? plan.name : `${selectedPack ?? paymentContext.credits} créditos · ${paymentContext.label}`,
      regionCode: customer.region,
      regionName: regionNameForCode(customer.region),
      communeName: customer.commune,
      sourceComponent: "CheckoutPage",
      sourceButton: mode === "subscription" ? "Pagar con Mercado Pago" : "Comprar créditos",
      payload: { planId: plan.id, rut: customer.rut, mode, selectedPack, paymentContext: paymentContext.id },
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          userId: customer.email || "cliente-oficiospro",
          name: customer.name,
          email: customer.email,
          rut: customer.rut,
          whatsapp: customer.whatsapp,
          region: regionNameForCode(customer.region),
          commune: customer.commune,
          creditsPack: mode === "credits_purchase" ? selectedPack ?? paymentContext.credits : undefined,
          paymentContext: paymentContext.id,
        }),
      });
      const data = (await response.json()) as PaymentApiResponse;
      const paymentId = data.preapprovalId ?? data.preferenceId ?? `payment-preparing-${Date.now()}`;

      appendPaymentRecord({
        provider: "mercadopago",
        type: mode === "subscription" ? "subscription" : "credits_purchase",
        planId: plan.id,
        planName: mode === "subscription" ? plan.name : `${selectedPack ?? paymentContext.credits} créditos · ${paymentContext.label}`,
        userId: customer.email || "cliente-oficiospro",
        payerEmail: customer.email,
        amountCLP: mode === "subscription" ? plan.priceCLP : (selectedPack ?? paymentContext.credits) * 1000,
        credits: mode === "subscription" ? plan.monthlyCredits : selectedPack ?? paymentContext.credits,
        status: data.ok ? "pending" : "preparing",
        mercadoPagoPreferenceId: data.preferenceId,
        mercadoPagoPreapprovalId: data.preapprovalId,
        initPoint: data.initPoint ?? data.sandboxInitPoint,
      });

      if (mode === "subscription") {
        upsertPaymentSubscription({
          provider: "mercadopago",
          userId: customer.email || "cliente-oficiospro",
          planId: plan.id,
          planName: plan.name,
          amountCLP: plan.priceCLP,
          creditsPerMonth: plan.monthlyCredits,
          status: data.ok ? "pending" : "pending",
          mercadoPagoPreapprovalId: paymentId,
          nextBillingDate: data.nextBillingDate ?? nextBilling.toISOString(),
        });
      }

      setMockSession({
        role: plan.audience === "empresa" ? "company" : "client",
        name: customer.name || (plan.audience === "empresa" ? "Empresa OficiosPro" : "Cliente OficiosPro"),
        email: customer.email,
        planId: plan.id,
        createdAt: new Date().toISOString(),
      });

      if (data.initPoint || data.sandboxInitPoint) {
        window.location.href = data.initPoint ?? data.sandboxInitPoint ?? "/dashboard-cliente";
        return;
      }

      if (mode === "credits_purchase" && (selectedPack || paymentContext.credits)) {
        addPaymentCredits({
          userId: customer.email || "cliente-oficiospro",
          amount: selectedPack ?? paymentContext.credits,
          type: "purchase_credit",
          detail: `${paymentContext.label} en preparación`,
          relatedPaymentId: paymentId,
        });
      }

      setStatus("Pago en preparación. Dejamos tu solicitud registrada y te avisaremos apenas Mercado Pago quede habilitado.");
    } catch {
      setStatus("Pago en preparación. Dejamos tu solicitud registrada para continuar la activación de forma segura.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <article className="panel">
          <p className="eyebrow">Checkout seguro</p>
          <h1 className="text-4xl font-black md:text-5xl">Activa tu suscripción OficiosPro.</h1>
          <p className="mt-4 max-w-2xl font-semibold leading-7 text-muted">
            Confirma tu plan, los datos para comprobante y la renovación mensual. Tu pago será procesado de forma segura por Mercado Pago.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Plan seleccionado" value={plan.name} />
            <SummaryTile label="Precio mensual" value={formatCLP(plan.priceCLP)} />
            <SummaryTile label="Créditos mensuales" value={`${plan.monthlyCredits} créditos`} />
            <SummaryTile label="Próximo cobro" value={nextBilling.toLocaleDateString("es-CL")} />
          </div>

          <div className="mt-8">
            <CreditExplainer
              availableCredits={plan.monthlyCredits}
              monthlyCredits={plan.monthlyCredits}
              baseServiceCredits={paymentContext.credits}
              clubServiceCredits={Math.max(0, paymentContext.credits - 2)}
              compact
            />
          </div>

          <section className="mt-8 grid gap-4 rounded-[24px] border border-line bg-white p-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-line bg-slate-50 p-4">
              <p className="eyebrow">Sin suscripcion</p>
              <h2 className="text-xl font-black">Compra creditos sin renovacion mensual.</h2>
              <p className="mt-2 text-sm font-bold text-muted">Puedes comprar creditos puntuales y pagar precio normal en cada solicitud.</p>
            </article>
            <article className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
              <p className="eyebrow">Con Club Hogar</p>
              <h2 className="text-xl font-black">Conviene si haces 2 solicitudes al mes.</h2>
              <p className="mt-2 text-sm font-bold text-brand-dark">Ahorro: 4 creditos al mes, mas creditos acumulables y beneficios.</p>
            </article>
          </section>

          <div className="mt-8 grid gap-4 rounded-[24px] border border-line bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field">
                Nombre completo
                <input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required />
              </label>
              <label className="field">
                Email de comprobante
                <input value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} type="email" required />
              </label>
              <label className="field">
                RUT para boleta
                <input value={customer.rut} onChange={(event) => setCustomer({ ...customer, rut: event.target.value })} placeholder="12.345.678-9" required />
              </label>
              <label className="field">
                WhatsApp
                <input value={customer.whatsapp} onChange={(event) => setCustomer({ ...customer, whatsapp: event.target.value })} required />
              </label>
              <RegionCommuneSelect
                region={customer.region}
                commune={customer.commune}
                onRegionChange={(region) => setCustomer({ ...customer, region, commune: "" })}
                onCommuneChange={(commune) => setCustomer({ ...customer, commune })}
                communePlaceholder="Busca comuna para comprobante"
                required
              />
            </div>

            <div className="rounded-2xl bg-white p-4 text-sm font-bold text-muted">
              Renovación automática mensual. Los créditos se cargan cada mes y se acumulan hasta {plan.accumulatesMonths} meses.
            </div>

            <button className="btn-primary" type="button" onClick={() => startPayment("subscription")} disabled={isSubmitting}>
              {isSubmitting ? "Conectando con Mercado Pago..." : "Pagar con Mercado Pago"}
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

          <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
            <p className="eyebrow">Tipo de checkout</p>
            <h2 className="text-2xl font-black">Elige qué estás pagando.</h2>
            <p className="mt-2 text-sm font-bold text-muted">El checkout soporta servicio fijo, visita técnica, cotización aceptada, adicionales, materiales y horas.</p>
            <div className="mt-4 grid gap-3">
              {paymentContexts.map((context) => (
                <button
                  key={context.id}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand hover:bg-brand-soft ${
                    paymentContext.id === context.id ? "border-brand bg-brand-soft" : "border-line bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => {
                    setPaymentContext(context);
                    setSelectedPack(context.credits);
                  }}
                >
                  <strong className="block text-lg font-black text-ink">{context.label}</strong>
                  <span className="text-sm font-bold text-muted">{context.detail}</span>
                  <span className="mt-2 block text-sm font-black text-brand">{context.credits} créditos · {formatCLP(context.credits * 1000)}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
            <p className="eyebrow">Créditos adicionales</p>
            <h2 className="text-2xl font-black">Compra una bolsa puntual.</h2>
            <p className="mt-2 text-sm font-bold text-muted">Útil para servicios de mayor alcance o mantenciones acumuladas.</p>
            <div className="mt-4 grid gap-3">
              {creditPacks.map((pack) => (
                <button
                  key={pack.credits}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand hover:bg-brand-soft ${
                    selectedPack === pack.credits ? "border-brand bg-brand-soft" : "border-line bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => setSelectedPack(pack.credits)}
                >
                  <strong className="block text-lg font-black text-ink">{pack.label}</strong>
                  <span className="text-sm font-bold text-muted">{pack.detail}</span>
                  <span className="mt-2 block text-sm font-black text-brand">{formatCLP(pack.credits * 1000)}</span>
                </button>
              ))}
            </div>
            <button className="btn-secondary mt-4 w-full" type="button" disabled={!selectedPack || isSubmitting} onClick={() => startPayment("credits_purchase")}>
              Comprar créditos
            </button>
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
