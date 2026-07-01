"use client";

import { ConversionButton } from "@/components/ConversionModal";
import { formatCLP, type SubscriptionPlan } from "@/data/marketplace";
import { addCartItem } from "@/lib/cart";

export function PlanActionCard({ plan, featured = false }: { plan: SubscriptionPlan; featured?: boolean }) {
  return (
    <article className={`rounded-[28px] border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card ${featured ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
      <span className={featured ? "font-black text-white/70" : "font-black text-brand"}>{plan.name}</span>
      <strong className="my-3 block text-3xl font-black">{formatCLP(plan.priceCLP)}/mes</strong>
      <div className={featured ? "rounded-2xl bg-white/10 p-4" : "rounded-2xl bg-brand-soft p-4"}>
        <span className={featured ? "text-sm font-black text-white/70" : "text-sm font-black text-brand-dark"}>Créditos mensuales</span>
        <strong className={`block text-3xl font-black ${featured ? "text-white" : "text-sun-dark"}`}>{plan.monthlyCredits}</strong>
        <span className={featured ? "text-xs font-bold text-white/70" : "text-xs font-bold text-muted"}>Acumulables hasta {plan.accumulatesMonths} meses</span>
      </div>
      <p className={featured ? "mt-4 text-sm font-semibold leading-6 text-white/75" : "mt-4 text-sm font-semibold leading-6 text-muted"}>{plan.description}</p>
      <div className="mt-5 grid gap-2">
        {plan.benefits.map((benefit) => (
          <span key={benefit} className={featured ? "rounded-2xl bg-white/10 p-3 text-sm font-black" : "rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink"}>
            {benefit}
          </span>
        ))}
      </div>
      <div
        onClickCapture={() =>
          addCartItem({
            type: "subscription_plan",
            title: plan.name,
            planId: plan.id,
            credits: plan.monthlyCredits,
            amountCLP: plan.priceCLP,
            priceCLP: plan.priceCLP,
          })
        }
      >
        <ConversionButton
          type={plan.audience === "empresa" ? "plan_empresa" : "plan_hogar"}
          planId={plan.id}
          sourceButton={`Elegir plan ${plan.name}`}
          className={featured ? "btn-secondary mt-6 w-full" : "btn-primary mt-6 w-full"}
        >
          {plan.ctaLabel ?? "Elegir plan"}
        </ConversionButton>
      </div>
    </article>
  );
}
