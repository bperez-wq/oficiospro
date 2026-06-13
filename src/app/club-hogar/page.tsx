import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { CreditExplainer } from "@/components/CreditExplainer";
import { ConversionButton } from "@/components/ConversionModal";
import { DashboardMetricCard, VisualRail } from "@/components/DesignSystem";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { TransactionList } from "@/components/Lists";
import { PlanActionCard } from "@/components/PlanActionCard";
import { VisualFaqAccordion } from "@/components/VisualFaqAccordion";
import { defaultCommercialConfig } from "@/data/commercialConfig";
import { defaultTransactions, workStories } from "@/data/mock";
import { formatCLP, subscriptionPlans } from "@/data/marketplace";
import { shouldShowDemoData } from "@/lib/demoData";

const comparisonExamples: [string, number, string][] = [
  ["Mantención calefont", 25, "/assets/oficios/calefont/calefont-mantencion-01.jpg"],
  ["Filtración (gasfitería)", 18, "/assets/oficios/gasfiteria/gasfiteria-red-exterior-01.jpg"],
  ["Revisión eléctrica", 12, "/assets/oficios/electricidad/electricidad-luminaria-01.jpg"],
  ["Jardín puesta a punto", 18, "/assets/oficios/jardineria/jardineria-plantacion-01.jpg"],
];

const clubFaq = [
  {
    question: "¿Qué pasa si no uso mis créditos este mes?",
    answer: "Se acumulan según el plan vigente y quedan disponibles como saldo para próximas mantenciones, sujetos a los términos de vigencia y uso.",
  },
  {
    question: "¿Puedo comprar créditos sin suscribirme?",
    answer: "Sí. Puedes comprar bolsas puntuales de créditos en el checkout y usarlas igual que un suscriptor, pero sin el descuento de 2 créditos por solicitud.",
  },
  {
    question: "¿Cómo funciona el descuento de 2 créditos?",
    answer: "En cada solicitud elegible (servicios fijos, visitas y solicitudes base) los suscriptores Club Hogar pagan 2 créditos menos que el precio normal.",
  },
  {
    question: "¿Qué pasa con mis créditos al reservar?",
    answer: "Quedan retenidos como pago protegido: solo se liberan al especialista cuando confirmas el avance o cierre del trabajo.",
  },
  {
    question: "¿Puedo cancelar la suscripción?",
    answer: "Sí, la renovación es mensual y puedes pausar o cancelar. Tus créditos ya cargados siguen las condiciones de vigencia del plan.",
  },
];

export default function ClubHogarPage() {
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");
  const featuredPlan = clientPlans.find((plan) => plan.id === "plus") ?? clientPlans[0];
  const visibleTransactions = shouldShowDemoData() ? defaultTransactions : [];

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Club Hogar"
        title="Tus créditos son saldo disponible para mantenciones reales."
        subtitle="Acumula créditos para servicios del hogar, reténlos al reservar y libera el pago cuando el trabajo queda cerrado con respaldo."
      >
        <ConversionButton type="consulta_general" sourceButton="Usar créditos Club Hogar" className="btn-primary">
          Usar créditos
        </ConversionButton>
        <ConversionButton type="lead_cliente" sourceButton="Crear cuenta Club Hogar" className="btn-secondary">
          Crear cuenta
        </ConversionButton>
      </AppHero>

      <VisualRail
        eyebrow="Uso cotidiano"
        title="Créditos listos para resolver sin volver a cotizar desde cero."
        text="La experiencia se entiende como saldo, retención protegida y respaldo de cada servicio cerrado."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardMetricCard label="Carga mensual" value={`${featuredPlan.monthlyCredits} cr`} detail={featuredPlan.name} tone="brand" />
          <DashboardMetricCard label="Acumulación" value="Acumulables" detail="Según plan vigente" />
          <DashboardMetricCard label="Ahorro Club" value="2 cr" detail="Por solicitud elegible" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <img src="/assets/oficios/calefont/calefont-mantencion-01.jpg" alt="Especialista revisando un calefont a domicilio" loading="lazy" className="h-44 w-full object-cover" />
        </div>
      </VisualRail>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <span className="chip bg-slate-100 text-muted">Sin suscripción</span>
          <h2 className="mt-3 text-2xl font-black text-ink">Compra créditos puntuales</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">Pagas precio normal en cada solicitud. Útil para arreglos esporádicos.</p>
          <div className="mt-4 grid gap-2">
            {comparisonExamples.map(([service, credits, image]) => (
              <div key={service} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-black">
                <span className="flex min-w-0 items-center gap-2.5 text-ink">
                  <img src={image} alt={service} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  <span className="truncate">{service}</span>
                </span>
                <span className="shrink-0 text-muted">{credits} cr</span>
              </div>
            ))}
          </div>
          <Link href="/checkout" className="btn-secondary mt-5 w-full" data-event="club_buy_credits">
            Comprar créditos
          </Link>
        </article>
        <article className="rounded-[28px] border-2 border-brand bg-gradient-to-b from-brand-soft/60 to-white p-6 shadow-card">
          <span className="chip bg-brand text-white">Con Club Hogar</span>
          <h2 className="mt-3 text-2xl font-black text-ink">Ahorra {defaultCommercialConfig.subscriberDiscountCredits} créditos en cada solicitud</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">Carga mensual acumulable + descuento por solicitud + atención prioritaria.</p>
          <div className="mt-4 grid gap-2">
            {comparisonExamples.map(([service, credits, image]) => (
              <div key={service} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-black shadow-sm">
                <span className="flex min-w-0 items-center gap-2.5 text-ink">
                  <img src={image} alt={service} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  <span className="truncate">{service}</span>
                </span>
                <span className="shrink-0 text-brand-dark">
                  {Number(credits) - defaultCommercialConfig.subscriberDiscountCredits} cr
                  <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">−{defaultCommercialConfig.subscriberDiscountCredits}</span>
                </span>
              </div>
            ))}
          </div>
          <ConversionButton type="lead_cliente" sourceButton="Elegir plan comparador Club Hogar" className="btn-primary mt-5 w-full">
            Elegir plan
          </ConversionButton>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3" id="planes">
        {clientPlans.map((plan) => (
          <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "plus"} />
        ))}
      </section>

      <CreditExplainer
        availableCredits={featuredPlan.monthlyCredits}
        monthlyCredits={featuredPlan.monthlyCredits}
        baseServiceCredits={12}
        clubServiceCredits={10}
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel">
          <p className="eyebrow">Simulador visual</p>
          <h2 className="text-3xl font-black">Con {featuredPlan.name}, acumulas {featuredPlan.monthlyCredits} créditos cada mes.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">
            Por {formatCLP(featuredPlan.priceCLP)}/mes cargas saldo disponible en créditos para planificar visitas, diagnósticos y mantenciones sin partir desde cero cada vez.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["1 mes", featuredPlan.monthlyCredits],
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
            Renovación automática mensual. Los créditos quedan sujetos a términos de vigencia, uso, retención y devolución.
          </p>
        </article>
        <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
          <img src="/assets/oficios/gasfiteria/gasfiteria-griferia-01.jpg" alt="Gasfíter reparando la grifería del baño" loading="lazy" className="h-72 w-full object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-black">Lo que incluye Club Hogar</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Créditos acumulables según plan vigente", "Saldo disponible para servicios", "Créditos retenidos hasta cerrar el servicio", "Pago protegido", "Historial de uso", "Garantía OficiosPro"].map((item) => (
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
          <p className="mb-5 text-sm font-bold leading-6 text-muted">
            El historial separa cargas, usos, retenciones y devoluciones para que el saldo se entienda antes y después de cada servicio.
          </p>
          <TransactionList transactions={visibleTransactions} />
        </article>
      </section>

      <section>
        <div className="mb-6 max-w-3xl">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 className="text-3xl font-black text-ink">Lo que más se pregunta sobre créditos.</h2>
        </div>
        <VisualFaqAccordion items={clubFaq} />
      </section>

      <StickyMobileCTA>
        <a className="btn-primary min-h-11 flex-1 px-3 text-sm" href="#planes">
          Elegir plan
        </a>
        <Link className="btn-secondary min-h-11 flex-1 px-3 text-sm" href="/checkout">
          Comprar créditos
        </Link>
      </StickyMobileCTA>
    </main>
  );
}
