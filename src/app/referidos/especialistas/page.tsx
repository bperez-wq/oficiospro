import { AcquisitionPageViewTracker, AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { founderReferralHref } from "@/data/specialistAcquisition";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Referidos de especialistas | OficiosPro",
  description: "Programa no monetario para que especialistas aprobados recomienden a otros trabajadores tecnicos y fortalezcan la red fundadora.",
  path: "/referidos/especialistas",
  keywords: ["referidos especialistas", "oficiospro fundadores", "recomendar especialista"],
});

const referralContext = { source: "referido_especialista" as const, campaign: "founder_specialist_referrals", landingPage: "/referidos/especialistas" };

export default function SpecialistReferralsPage() {
  const referralHref = founderReferralHref();

  return (
    <main className="section grid gap-8">
      <AcquisitionPageViewTracker source="referido_especialista" context={referralContext} />
      <PlatformNav />
      <AppHero
        eyebrow="Referidos de especialistas"
        title="Invita a buenos especialistas a crear su perfil fundador."
        subtitle="El programa registra referidos para la red OficiosPro. Por ahora los beneficios son de visibilidad y reconocimiento; no hay pagos ni comisiones monetarias."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <DashboardMetricCard label="Codigo" value="Referral" detail="Se registra en la postulacion" tone="brand" />
        <DashboardMetricCard label="Beneficio" value="No monetario" detail="Sin comisiones prometidas" />
        <DashboardMetricCard label="Revision" value="Preferente" detail="Segun calidad y cobertura" />
        <DashboardMetricCard label="Badge" value="Fundador" detail="Solo aprobado/publicado" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Como funciona</p>
          <div className="grid gap-3">
            {[
              "El especialista comparte un link con referralCode o referrerSpecialistId.",
              "La postulacion queda con source=referido_especialista.",
              "Operaciones revisa calidad, comuna, oficio y cobertura.",
              "Si el referido se aprueba, aumenta el contador aprobado y puede mejorar reconocimiento visual.",
            ].map((item, index) => (
              <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black leading-6 text-ink">
                {index + 1}. {item}
              </span>
            ))}
          </div>
        </MarketplaceCard>
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Beneficios iniciales</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Badge fundador", "Prioridad visual", "Revision preferente", "Reconocimiento en perfil"].map((item) => (
              <span key={item} className="rounded-2xl bg-brand-soft p-4 text-sm font-black text-brand-dark">{item}</span>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-muted">
            El modelo evita prometer pagos hasta tener reglas legales, tributarias y antifraude definidas.
          </p>
          <div className="mt-6">
            <AcquisitionTrackingLink href={referralHref} className="btn-primary" sourceButton="Crear referido especialista" context={referralContext} eventType="referral_link_clicked">
              Crear link de postulacion
            </AcquisitionTrackingLink>
          </div>
        </MarketplaceCard>
      </section>
    </main>
  );
}
