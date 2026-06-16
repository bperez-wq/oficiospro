import { AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import type { AcquisitionContext } from "@/data/specialistAcquisition";

export function FounderFinalCta({
  registerHref,
  referralHref,
  context,
}: {
  registerHref: string;
  referralHref: string;
  context: AcquisitionContext;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-line bg-white p-8 text-center shadow-soft md:p-12">
      <p className="eyebrow">Programa fundador</p>
      <h2 className="mx-auto max-w-3xl section-title">
        Tu oficio merece verse profesional desde el primer contacto.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">
        Postula al programa fundador y prepara tu perfil para recibir solicitudes cuando el piloto este activo en tu zona.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <AcquisitionTrackingLink
          href={registerHref}
          className="btn-sun"
          sourceButton="CTA final - Postular como fundador"
          sourceComponent="FounderFinalCta"
          context={context}
        >
          Postular como fundador
        </AcquisitionTrackingLink>
        <AcquisitionTrackingLink
          href={referralHref}
          className="btn-secondary"
          sourceButton="CTA final - Compartir con un colega"
          sourceComponent="FounderFinalCta"
          context={{ source: "referido_especialista", campaign: "founder_specialist_referrals" }}
        >
          Compartir con un colega
        </AcquisitionTrackingLink>
      </div>
    </section>
  );
}
