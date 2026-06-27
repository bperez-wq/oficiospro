import Link from "next/link";
import { defaultCommercialConfig } from "@/data/commercialConfig";
import { creditsToCLPLabel } from "@/lib/credits/creditInfo";
import { CreditsHelpTrigger } from "@/components/credits/CreditsExplainer";

const examples = [
  { service: "Mantención calefont", credits: 25, image: "/assets/oficios/calefont/calefont-revision-01.jpg" },
  { service: "Visita técnica eléctrica", credits: 6, image: "/assets/oficios/electricidad/electricidad-luminaria-01.jpg" },
  { service: "Jardín puesta a punto", credits: 18, image: "/assets/oficios/jardineria/jardineria-pasto-01.jpg" },
];

/**
 * Simulador compacto de créditos: cuánto cuesta un servicio típico y cuánto
 * ahorra un suscriptor Club Hogar. Los valores salen del catálogo/config interna.
 */
export function HomeCreditPreview() {
  const discount = defaultCommercialConfig.subscriberDiscountCredits;
  return (
    <div className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
      <div>
        <p className="eyebrow">Créditos OficiosPro</p>
        <h2 className="text-3xl font-black leading-tight text-ink md:text-4xl">Tu cuenta de mantención, en créditos.</h2>
        <p className="mt-3 max-w-md text-base font-semibold leading-7 text-muted">
          Compra créditos puntuales o suscríbete a Club Hogar y ahorra {discount} créditos en cada solicitud. Se acumulan para cuando los necesites.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/club-hogar" className="btn-primary" data-event="home_credit_preview_plans">
            Ver planes
          </Link>
          <Link href="/checkout" className="btn-secondary" data-event="home_credit_preview_buy">
            Comprar créditos
          </Link>
          <CreditsHelpTrigger className="btn-ghost text-sm font-black text-brand-dark underline-offset-2 hover:underline">
            ¿Cómo funcionan los créditos?
          </CreditsHelpTrigger>
        </div>
      </div>
      <div className="grid gap-3">
        {examples.map((example) => (
          <article key={example.service} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-3 transition duration-200 hover:border-brand/30 hover:bg-white">
            <div className="flex min-w-0 items-center gap-3">
              <img src={example.image} alt={example.service} loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <strong className="block text-base font-black text-ink">{example.service}</strong>
                <span className="text-sm font-bold text-muted">{example.credits} créditos <span className="text-xs">({creditsToCLPLabel(example.credits)})</span></span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              Club Hogar: {Math.max(0, example.credits - discount)} créditos
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px]">ahorras {discount}</span>
            </span>
          </article>
        ))}
        <p className="text-xs font-bold text-muted">Valores referenciales por tipo de servicio. El precio final siempre se confirma antes de retener tus créditos.</p>
      </div>
    </div>
  );
}
