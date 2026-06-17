import Link from "next/link";
import { AcquisitionPageViewTracker } from "@/components/AcquisitionTrackingLink";
import { PlatformNav } from "@/components/PlatformNav";
import { FounderHero } from "@/components/founders/FounderHero";
import { FounderValueCards } from "@/components/founders/FounderValueCards";
import { FounderTimeline } from "@/components/founders/FounderTimeline";
import { FounderSocialProof } from "@/components/founders/FounderSocialProof";
import { FounderWizard } from "@/components/founders/FounderWizard";
import { FounderFinalCta } from "@/components/founders/FounderFinalCta";
import {
  founderNoPromiseMessages,
  founderReferralHref,
} from "@/data/specialistAcquisition";
import { seoWorkerAcquisitionPages } from "@/data/seoRoutes";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Especialistas Fundadores OficiosPro | Crea tu perfil",
  description: "Programa para especialistas de oficios que quieren crear un perfil fundador, ordenar sus servicios y aparecer por comuna cuando sean aprobados.",
  path: "/especialistas-fundadores",
  keywords: ["especialistas fundadores", "oficios chile", "registro especialista", "perfil profesional oficio"],
});

const founderContext = { source: "campana_local" as const, campaign: "founder_specialists", landingPage: "/especialistas-fundadores" };
const tradeLinks = seoWorkerAcquisitionPages.slice(0, 6);

export default function FounderSpecialistsPage() {
  const registerHref = "/registro-especialista?source=founder_landing&intent=offer_services";
  const referralHref = founderReferralHref();

  return (
    <main className="section grid gap-10">
      <AcquisitionPageViewTracker source="campana_local" context={founderContext} />
      <PlatformNav />

      <FounderHero registerHref={registerHref} context={founderContext} />

      <div id="beneficios">
        <FounderValueCards />
      </div>

      <FounderTimeline />

      <FounderSocialProof />

      <FounderWizard context={founderContext} />

      <section id="referidos" className="rounded-[32px] border border-line bg-white p-7 shadow-soft md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Por oficio y comuna</p>
            <h2 className="text-3xl font-black leading-tight text-ink">Tambien estamos captando por oficios especificos.</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">
              Estas paginas explican que buscamos por rubro y llevan el source correcto al formulario de registro.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tradeLinks.map((page) => (
              <Link key={page.slug} href={`/trabajos/${page.slug}`} className="rounded-2xl border border-line bg-slate-50 p-4 transition hover:border-brand hover:bg-brand-soft">
                <strong className="block text-ink">{page.shortTitle}</strong>
                <span className="mt-1 block text-xs font-bold leading-5 text-muted">{page.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FounderFinalCta registerHref={registerHref} referralHref={referralHref} context={founderContext} />

      <footer className="grid gap-3 border-t border-line pt-6">
        <div className="flex flex-wrap gap-2">
          {founderNoPromiseMessages.map((message) => (
            <span key={message} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
              {message}
            </span>
          ))}
        </div>
        <p className="max-w-3xl text-xs font-semibold leading-5 text-muted">
          La participacion en el programa fundador esta sujeta a revision operativa para mantener el estandar de confianza de OficiosPro.
        </p>
      </footer>
    </main>
  );
}
