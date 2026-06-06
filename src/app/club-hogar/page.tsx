import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ConversionButton } from "@/components/ConversionModal";
import { TransactionList } from "@/components/Lists";
import { PlanActionCard } from "@/components/PlanActionCard";
import { defaultTransactions, workStories } from "@/data/mock";
import { formatCLP, subscriptionPlans } from "@/data/marketplace";

export default function ClubHogarPage() {
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");
  const featuredPlan = clientPlans.find((plan) => plan.id === "plus") ?? clientPlans[0];

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Club Hogar"
        title="Tus créditos son tu cuenta de ahorro para mantenciones."
        subtitle="Acumula créditos hasta 24 meses, reserva especialistas verificados y libera el pago solo al finalizar el trabajo."
      >
        <ConversionButton type="consulta_general" sourceButton="Usar créditos Club Hogar" className="btn-primary">
          Usar créditos
        </ConversionButton>
        <ConversionButton type="lead_cliente" sourceButton="Crear cuenta Club Hogar" className="btn-secondary">
          Crear cuenta
        </ConversionButton>
      </AppHero>

      <section className="grid gap-5 md:grid-cols-3">
        {clientPlans.map((plan) => (
          <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "plus"} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel">
          <p className="eyebrow">Simulador visual</p>
          <h2 className="text-3xl font-black">Con {featuredPlan.name}, acumulas {featuredPlan.monthlyCredits} créditos cada mes.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">
            Por {formatCLP(featuredPlan.priceCLP)}/mes puedes planificar visitas, diagnósticos y mantenciones sin partir desde cero cada vez.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["3 meses", featuredPlan.monthlyCredits * 3],
              ["6 meses", featuredPlan.monthlyCredits * 6],
              ["12 meses", featuredPlan.monthlyCredits * 12],
            ].map(([label, credits]) => (
              <div key={label} className="rounded-2xl bg-brand-soft p-5">
                <span className="font-black text-muted">{label}</span>
                <strong className="block text-2xl font-black">{credits} créditos</strong>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-sun-soft p-4 text-sm font-black text-sun-dark">
            Renovación automática mensual. Los créditos vencen a los 24 meses.
          </p>
        </article>
        <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
          <img src="/assets/work-bathroom.webp" alt="Especialista reparando un baño en un hogar" className="h-72 w-full object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-black">Lo que incluye Club Hogar</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Créditos acumulables hasta 24 meses", "Técnicos verificados", "Garantía OficiosPro", "Pago liberado al finalizar", "Historial de servicios", "Atención prioritaria"].map((item) => (
                <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="panel">
          <p className="eyebrow">Casos de uso</p>
          <h2 className="mb-5 text-3xl font-black">Problemas reales que puedes resolver con créditos.</h2>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[
              ["6-12 cr", "Ajustes simples y revisiones menores"],
              ["18-30 cr", "Visitas, diagnósticos y reparaciones frecuentes"],
              ["40-60 cr", "Mantenciones completas o servicios técnicos"],
            ].map(([credits, text]) => (
              <span key={credits} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-ink">
                {credits}
                <small className="mt-1 block text-xs font-bold text-muted">{text}</small>
              </span>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workStories.map((work) => (
              <article key={work.title} className="flex gap-4 rounded-2xl border border-line bg-slate-50 p-3">
                <img src={work.image} alt={work.title} className="h-20 w-24 rounded-xl object-cover" />
                <div>
                  <strong>{work.title}</strong>
                  <span className="block text-sm font-bold text-muted">
                    {work.commune} · {work.credits} créditos
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>
        <article className="panel">
          <p className="eyebrow">Historial de créditos</p>
          <h2 className="mb-5 text-3xl font-black">Movimientos de créditos</h2>
          <TransactionList transactions={defaultTransactions} />
        </article>
      </section>
    </main>
  );
}
