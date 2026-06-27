import { RecommendSpecialistCard } from "@/components/RecommendSpecialistCard";

/**
 * Home section that gives the community recommendation flow real prominence and
 * communicates the referral reward: bring good specialists and earn 1 credit when
 * they are incorporated. Reusable; the card content works on web and mobile.
 */
export function CommunityReferralBanner() {
  return (
    <section id="recomienda-gana" className="mx-auto grid max-w-7xl scroll-mt-24 gap-6 px-5 lg:grid-cols-[1fr_1fr]">
      <div className="grid content-center gap-4 rounded-[32px] border border-line bg-gradient-to-br from-brand-soft via-white to-emerald-50 p-6 lg:p-10">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          Recomienda y gana
        </span>
        <h2 className="text-3xl font-black leading-tight text-ink md:text-4xl">
          Trae buenos especialistas y gana 1 crédito por cada uno.
        </h2>
        <p className="max-w-md text-base font-semibold leading-7 text-muted">
          La comunidad hace crecer OficiosPro. Si conoces a un maestro que hace bien el trabajo, recomiéndalo
          o ayúdalo a crear su perfil. Cuando se incorpore a la plataforma, te acreditamos 1 crédito.
        </p>
        <ol className="grid gap-2 text-sm font-bold text-ink">
          <li>1. Recomienda a un especialista de confianza.</li>
          <li>2. Lo contactamos y lo ayudamos a sumarse y verificarse.</li>
          <li>3. Cuando queda incorporado, ganas 1 crédito ($1.000) en tu cuenta.</li>
        </ol>
        <p className="text-xs font-bold leading-5 text-muted">
          El crédito se acredita al incorporarse el especialista, para premiar recomendaciones reales.
        </p>
      </div>
      <RecommendSpecialistCard source="community" />
    </section>
  );
}
