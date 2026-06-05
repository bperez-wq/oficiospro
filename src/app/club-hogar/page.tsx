import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { TransactionList } from "@/components/Lists";
import { PlanActionCard } from "@/components/PlanActionCard";
import { defaultTransactions, workStories } from "@/data/mock";
import { subscriptionPlans } from "@/data/marketplace";

export default function ClubHogarPage() {
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Club Hogar"
        title="Créditos acumulables para resolver tu casa cuando lo necesites."
        subtitle="Una suscripción de tranquilidad para familias: acumula créditos hasta 24 meses, reserva especialistas verificados y libera el pago solo al finalizar el trabajo."
      >
        <Link className="btn-primary" href="/especialistas">
          Usar créditos
        </Link>
        <Link className="btn-secondary" href="/registro-cliente">
          Crear cuenta
        </Link>
      </AppHero>

      <section className="grid gap-5 md:grid-cols-3">
        {clientPlans.map((plan) => (
          <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "plus"} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel">
          <p className="eyebrow">Simulador visual</p>
          <h2 className="text-3xl font-black">Si pagas $35.000/mes, acumulas 35 créditos.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">
            En 3 meses tienes 105 créditos disponibles para gasfitería, electricidad, jardín o climatización.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {["35 créditos", "70 créditos", "105 créditos"].map((item, index) => (
              <div key={item} className="rounded-2xl bg-brand-soft p-5">
                <span className="font-black text-muted">Mes {index + 1}</span>
                <strong className="block text-2xl font-black">{item}</strong>
              </div>
            ))}
          </div>
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
          <p className="eyebrow">Historial demo</p>
          <h2 className="mb-5 text-3xl font-black">Movimientos de créditos</h2>
          <TransactionList transactions={defaultTransactions} />
        </article>
      </section>
    </main>
  );
}
