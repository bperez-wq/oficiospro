import Link from "next/link";
import { AcquisitionPageViewTracker, AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { DashboardMetricCard, MarketplaceCard } from "@/components/DesignSystem";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { institutionalRegistrationHref } from "@/data/specialistAcquisition";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Instituciones y alianzas | OficiosPro",
  description: "Propuesta de colaboracion para municipalidades, OMIL, SENCE, CFT/IP, liceos tecnicos y organizaciones de empleabilidad.",
  path: "/instituciones",
  keywords: ["OMIL oficios", "alianzas empleabilidad", "especialistas tecnicos", "formalizacion oficios"],
});

export default function InstitutionsPage() {
  const context = { source: "omil" as const, campaign: "institutional_partnerships", landingPage: "/instituciones" };

  return (
    <main className="section grid gap-8">
      <AcquisitionPageViewTracker source="omil" context={context} />
      <PlatformNav />
      <AppHero
        eyebrow="Instituciones y alianzas"
        title="Un canal serio para visibilizar especialistas tecnicos locales."
        subtitle="OficiosPro puede colaborar con instituciones de empleabilidad, formacion y desarrollo local mediante derivacion, talleres de perfil digital y reportes agregados por comuna/oficio."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <DashboardMetricCard label="Foco" value="Oficios" detail="Perfiles y reputacion" tone="brand" />
        <DashboardMetricCard label="Piloto" value="Controlado" detail="Sin prometer empleo" />
        <DashboardMetricCard label="Datos" value="Agregados" detail="Comuna y oficio" />
        <DashboardMetricCard label="Apoyo" value="Digital" detail="Perfil y formalizacion" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Problema</p>
          <h2 className="text-3xl font-black leading-tight text-ink">Muchos trabajadores tecnicos tienen experiencia, pero baja visibilidad digital.</h2>
          <p className="mt-4 font-semibold leading-7 text-muted">
            La informalidad, la falta de perfil verificable y la dificultad para conectar con demanda local hacen mas dificil que buenos especialistas sean encontrados.
          </p>
        </MarketplaceCard>
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Solucion en piloto</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Canal de inscripcion para especialistas fundadores.",
              "Perfil profesional con oficio, comuna, servicios y evidencia.",
              "Formalizacion asistida y trazabilidad operacional.",
              "Reportes agregados por comuna/oficio cuando exista volumen.",
              "Derivacion ordenada sin prometer empleo garantizado.",
              "Talleres de perfil digital y preparacion comercial.",
            ].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black leading-6 text-ink">
                {item}
              </span>
            ))}
          </div>
        </MarketplaceCard>
      </section>

      <section className="rounded-[32px] border border-brand/15 bg-brand-soft p-6 md:p-8">
        <p className="eyebrow">Como colaborar</p>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {["Difusion", "Derivacion", "Charlas", "Talleres", "Formalizacion"].map((item) => (
            <span key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-brand-dark shadow-sm">{item}</span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/contacto?source=omil&campaign=institutional_partnerships">
            Solicitar reunion
          </Link>
          <Link className="btn-secondary" href="/contacto?source=instituciones&campaign=institutional_partnerships">
            Proponer alianza
          </Link>
          <AcquisitionTrackingLink href={institutionalRegistrationHref("omil")} className="btn-secondary" sourceButton="Derivar especialistas instituciones" context={context} eventType="institution_lead_submitted">
            Derivar especialistas
          </AcquisitionTrackingLink>
        </div>
        <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-brand-dark">
          Esta pagina no declara convenios vigentes. Presenta una propuesta de colaboracion para pilotos y conversaciones institucionales.
        </p>
      </section>
    </main>
  );
}

