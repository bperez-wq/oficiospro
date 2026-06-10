"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditExplainer } from "@/components/CreditExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, EmptyState } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { formatCLP, getPlanById } from "@/data/marketplace";
import { addCartItem, getCartItems, onCartChange, type OficiosProCartItem } from "@/lib/cart";
import { DEFAULT_REGION_CODE, regionCodeForName, regionNameForCode } from "@/lib/catalog";
import { submitLead } from "@/lib/leadClient";
import { cartTotals, itemAmountCLP } from "@/lib/payments/cart";
import { creditPacks as globalCreditPacks, defaultPaymentProvider, findCreditPack, oficiosProMerchant, paymentProviders } from "@/lib/payments/paymentProvider";
import type { PaymentIntent, PaymentProvider } from "@/lib/payments/types";
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
  provider?: "mercadopago" | PaymentProvider;
  type?: "checkout" | "subscription";
  status?: string;
  code?: string;
  message?: string;
  paymentIntent?: PaymentIntent;
  preferenceId?: string;
  preapprovalId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  nextBillingDate?: string | null;
};

const nextBilling = new Date();
nextBilling.setMonth(nextBilling.getMonth() + 1);

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
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(defaultPaymentProvider);
  const [cartItems, setCartItems] = useState<OficiosProCartItem[]>([]);
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
  const cartSummary = useMemo(() => cartTotals(cartItems), [cartItems]);
  const selectedCreditPack = findCreditPack(selectedPack);
  const hasCartItems = cartItems.length > 0;
  const checkoutCredits = cartSummary.credits || selectedCreditPack?.credits || plan.monthlyCredits;
  const checkoutAmountCLP = cartSummary.amountCLP || selectedCreditPack?.amountCLP || plan.priceCLP;
  const activeProvider = paymentProviders.find((provider) => provider.id === selectedProvider) ?? paymentProviders[0];

  useEffect(() => {
    seedMockState();
    const params = new URLSearchParams(window.location.search);
    const nextPlanId = params.get("plan") ?? "plus";
    const requestedMode = params.get("mode");
    const requestedPack = findCreditPack(params.get("creditPack") ?? params.get("creditPackId"));
    const requestedProvider = params.get("provider") as PaymentProvider | null;
    setPlanId(nextPlanId);
    const context = paymentContexts.find((item) => item.id === requestedMode) ?? paymentContexts[0];
    setPaymentContext(context);
    if (requestedPack) setSelectedPack(requestedPack.credits);
    if (requestedProvider && paymentProviders.some((provider) => provider.id === requestedProvider)) setSelectedProvider(requestedProvider);
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

  useEffect(() => {
    function refreshCart() {
      setCartItems(getCartItems());
    }
    refreshCart();
    return onCartChange(refreshCart);
  }, []);

  async function startPayment(mode: "subscription" | "credits_purchase" = "subscription") {
    if (!customer.region || !customer.commune) {
      setStatus("Selecciona región y comuna para continuar con la activación.");
      return;
    }
    if (!getMockSession() && !customer.email) {
      setStatus("Ingresa tu email para crear o recuperar tu cuenta antes de confirmar el checkout.");
      return;
    }
    if (selectedProvider !== "mercado_pago") {
      setStatus("Transbank preparado, pendiente credenciales. Por ahora puedes continuar con Mercado Pago.");
      return;
    }
    if (mode === "credits_purchase" && !selectedCreditPack) {
      setStatus("Selecciona una bolsa de creditos para continuar.");
      return;
    }
    setIsSubmitting(true);
    setStatus("");
    const catalogPack = mode === "credits_purchase" ? selectedCreditPack : null;
    const creditsToBuy = catalogPack?.credits ?? plan.monthlyCredits;
    const amountToPay = catalogPack?.amountCLP ?? plan.priceCLP;
    addCartItem({
      type: mode === "subscription" ? "subscription_plan" : "credit_pack",
      title: mode === "subscription" ? plan.name : `${creditsToBuy} creditos`,
      planId: mode === "subscription" ? plan.id : undefined,
      credits: mode === "subscription" ? plan.monthlyCredits : creditsToBuy,
      amountCLP: mode === "subscription" ? plan.priceCLP : amountToPay,
      priceCLP: mode === "subscription" ? plan.priceCLP : amountToPay,
    });
    const endpoint = mode === "subscription" ? "/api/payments/create-subscription" : "/api/payments/create-checkout";
    await submitLead({
      leadType: "payment_interest",
      fullName: customer.name || (plan.audience === "empresa" ? "Empresa OficiosPro" : "Cliente OficiosPro"),
      email: customer.email,
      phone: customer.whatsapp,
      service: mode === "subscription" ? plan.name : `${creditsToBuy} créditos · ${paymentContext.label}`,
      regionCode: customer.region,
      regionName: regionNameForCode(customer.region),
      communeName: customer.commune,
      sourceComponent: "CheckoutPage",
      sourceButton: mode === "subscription" ? "Pagar con Mercado Pago" : "Comprar créditos",
      payload: { planId: plan.id, rut: customer.rut, mode, selectedPack: creditsToBuy, paymentContext: paymentContext.id, provider: selectedProvider },
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
          provider: selectedProvider,
          creditPackId: mode === "credits_purchase" ? catalogPack?.id : undefined,
          creditsPack: mode === "credits_purchase" ? creditsToBuy : undefined,
          paymentContext: paymentContext.id,
          cart: cartItems.map((item) => ({ id: item.id, type: item.type, planId: item.planId, serviceId: item.serviceId, pricingMode: item.pricingMode })),
        }),
      });
      const data = (await response.json()) as PaymentApiResponse;
      const paymentId = data.paymentIntent?.id ?? data.preapprovalId ?? data.preferenceId ?? `payment-preparing-${Date.now()}`;

      appendPaymentRecord({
        provider: "mercado_pago",
        type: mode === "subscription" ? "subscription" : "credits_purchase",
        planId: plan.id,
        planName: mode === "subscription" ? plan.name : `${creditsToBuy} créditos · ${paymentContext.label}`,
        userId: customer.email || "cliente-oficiospro",
        payerEmail: customer.email,
        amountCLP: data.paymentIntent?.amountCLP ?? (mode === "subscription" ? plan.priceCLP : amountToPay),
        credits: data.paymentIntent?.credits ?? (mode === "subscription" ? plan.monthlyCredits : creditsToBuy),
        status: data.ok ? "pending" : "preparing",
        mercadoPagoPreferenceId: data.preferenceId,
        mercadoPagoPreapprovalId: data.preapprovalId,
        initPoint: data.initPoint ?? data.sandboxInitPoint,
      });

      if (mode === "subscription") {
        upsertPaymentSubscription({
          provider: "mercado_pago",
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

      if (mode === "credits_purchase" && creditsToBuy) {
        addPaymentCredits({
          userId: customer.email || "cliente-oficiospro",
          amount: creditsToBuy,
          type: "purchase_credit",
          detail: `${paymentContext.label} en preparación`,
          relatedPaymentId: paymentId,
        });
      }

      setStatus("Pago en preparación. Dejamos tu solicitud registrada y te avisaremos apenas el proveedor confirme.");
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
          <h1 className="text-4xl font-black md:text-5xl">Checkout global OficiosPro.</h1>
          <p className="mt-4 max-w-2xl font-semibold leading-7 text-muted">
            Confirma creditos, plan o solicitud de servicio. Tu pago sera procesado por el proveedor seleccionado y conciliado contra el ledger de creditos.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DashboardMetricCard label="Plan seleccionado" value={plan.name} />
            <DashboardMetricCard label="Precio mensual" value={formatCLP(plan.priceCLP)} />
            <DashboardMetricCard label="Creditos checkout" value={`${checkoutCredits} creditos`} tone="brand" />
            <DashboardMetricCard label="Total CLP visible" value={formatCLP(checkoutAmountCLP)} />
          </div>

          <section className="mt-8 rounded-[24px] border border-line bg-white p-5">
            <p className="eyebrow">Carrito global</p>
            <h2 className="text-2xl font-black">{hasCartItems ? "Resumen de compra" : "Compra directa"}</h2>
            <div className="mt-4 grid gap-3">
              {hasCartItems ? (
                cartItems.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{item.title}</strong>
                      <span className="chip bg-white text-brand-dark">{item.credits ?? 0} creditos</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-muted">
                      {[item.serviceName, item.specialistName, item.pricingMode].filter(Boolean).join(" - ") || "Item listo para pago"}
                    </p>
                    <p className="mt-2 text-sm font-black text-brand-dark">{itemAmountCLP(item) ? formatCLP(itemAmountCLP(item)) : "Monto por confirmar"}</p>
                  </article>
                ))
              ) : (
                <EmptyState eyebrow="Checkout" title="Compra directa disponible" text="Puedes activar un plan o comprar creditos puntuales desde este checkout." />
              )}
            </div>
          </section>

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
            <div className="rounded-2xl bg-white p-4 text-sm font-bold text-muted">
              Comercio: {oficiosProMerchant.tradeName} · RUT {oficiosProMerchant.rut}. Al continuar aceptas los terminos de compra, uso de creditos y conciliacion contra proveedor de pago.
            </div>

            <button className="btn-primary" type="button" onClick={() => startPayment("subscription")} disabled={isSubmitting}>
              {isSubmitting ? "Conectando con proveedor..." : `Pagar con ${activeProvider.label}`}
            </button>
            {status ? <p className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{status}</p> : null}
          </div>
        </article>

        <aside className="grid gap-5 self-start">
          <article className="enterprise-shell p-6">
            <p className="eyebrow text-teal-200">Resumen</p>
            <strong className="block text-4xl font-black">{checkoutCredits}</strong>
            <span className="font-bold text-white/70">créditos en este checkout</span>
            <div className="mt-5 grid gap-2">
              {plan.benefits.map((benefit) => (
                <span key={benefit} className="rounded-2xl bg-white/10 p-3 text-sm font-black">
                  {benefit}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
            <p className="eyebrow">Proveedor de pago</p>
            <h2 className="text-2xl font-black">Selecciona proveedor.</h2>
            <div className="mt-4 grid gap-3">
              {paymentProviders.map((provider) => (
                <button
                  key={provider.id}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand hover:bg-brand-soft ${
                    selectedProvider === provider.id ? "border-brand bg-brand-soft" : "border-line bg-slate-50"
                  } ${provider.enabled ? "" : "opacity-75"}`}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <strong className="block text-lg font-black text-ink">{provider.label}</strong>
                  <span className="text-sm font-bold text-muted">{provider.detail}</span>
                </button>
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
              {globalCreditPacks.map((pack) => (
                <button
                  key={pack.id}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand hover:bg-brand-soft ${
                    selectedPack === pack.credits ? "border-brand bg-brand-soft" : "border-line bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => setSelectedPack(pack.credits)}
                >
                  <strong className="block text-lg font-black text-ink">{pack.title}</strong>
                  <span className="text-sm font-bold text-muted">{pack.description}</span>
                  <span className="mt-2 block text-sm font-black text-brand">{formatCLP(pack.amountCLP)}</span>
                </button>
              ))}
            </div>
            <button className="btn-secondary mt-4 w-full" type="button" disabled={!selectedCreditPack || isSubmitting} onClick={() => startPayment("credits_purchase")}>
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
