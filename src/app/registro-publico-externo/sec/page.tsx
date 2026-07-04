import { ExternalCertifiedSpecialistCard } from "@/components/ExternalCertifiedSpecialistCard";
import { MarketplaceCard } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { Reveal } from "@/components/Reveal";
import {
  externalCertifiedSpecialistPolicy,
  externalCertifiedSpecialistsPrototype,
} from "@/data/externalCertifiedSpecialists";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata = buildSeoMetadata({
  title: "Registro publico externo SEC",
  description:
    "Prototipo no indexable para modelar referencias publicas externas de especialistas certificados, sin datos personales de contacto.",
  path: "/registro-publico-externo/sec",
  keywords: ["registro publico SEC", "instaladores SEC", "especialistas certificados"],
  policyContext: {
    pageType: "internal",
    canonicalPath: "/registro-publico-externo/sec",
    editorialStatus: "draft",
    indexPolicy: "noindex",
    contentScore: 30,
    minimumContentScore: 70,
    faqCount: 0,
    internalLinkCount: 0,
    hasUsefulCta: true,
    intent: "external public registry prototype",
  },
});

export default function SecExternalPublicRegistryPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Prototipo no indexable</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">
              Registro publico externo de instaladores SEC
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-muted md:text-lg">
              Esta primera version prueba como OficiosPro podria mostrar referencias de especialistas certificados en
              fuentes publicas, sin publicar datos personales de contacto y sin presentarlos como perfiles activos.
            </p>
          </div>
          <MarketplaceCard hover={false} className="border-amber-200 bg-amber-50">
            <p className="text-xs font-black uppercase text-amber-950">Uso prudente</p>
            <p className="mt-2 text-sm font-bold leading-6 text-amber-950">
              Los registros visibles son ficticios y estan marcados como prototipo. La carga masiva de una base publica
              requiere revision legal, criterios de minimizacion de datos y mecanismo de actualizacion o retiro.
            </p>
          </MarketplaceCard>
        </div>
      </section>

      <Reveal>
        <section className="grid gap-4 md:grid-cols-3">
          <MarketplaceCard hover={false}>
            <p className="eyebrow">Campos permitidos</p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              Nombre, certificacion o especialidad, comuna y region. No se publica email, telefono, direccion exacta ni
              RUT completo.
            </p>
          </MarketplaceCard>
          <MarketplaceCard hover={false}>
            <p className="eyebrow">Estado inicial</p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              Todo registro parte como "Aun no activo en OficiosPro" y no habilita cotizar, reservar ni contacto directo.
            </p>
          </MarketplaceCard>
          <MarketplaceCard hover={false}>
            <p className="eyebrow">Control del especialista</p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              Cada ficha debe ofrecer "Soy este especialista" y "Solicitar actualizacion o retiro" antes de cualquier
              operacion masiva.
            </p>
          </MarketplaceCard>
        </section>
      </Reveal>

      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Casos ficticios</p>
            <h2 className="text-3xl font-black text-ink">Prototipo con instaladores SEC referenciales</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase text-muted">
            {externalCertifiedSpecialistsPrototype.length} registros de prueba
          </span>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {externalCertifiedSpecialistsPrototype.map((specialist) => (
            <ExternalCertifiedSpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-slate-950 p-6 text-white shadow-soft md:p-8">
        <p className="eyebrow text-white/70">Antes de cargar datos reales</p>
        <h2 className="text-3xl font-black">Requiere revision legal y operacional</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            "Confirmar base legal y reglas de uso de cada fuente publica.",
            "Definir proceso de validacion en fuente oficial y evidencia de actualizacion.",
            "Implementar flujo de activacion con consentimiento del especialista.",
            "Mantener noindex hasta aprobar calidad, privacidad y utilidad para usuarios.",
          ].map((item) => (
            <p key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold leading-6">
              {item}
            </p>
          ))}
        </div>
        <p className="mt-5 text-xs font-bold text-white/60">
          Politica activa: {externalCertifiedSpecialistPolicy.initialRegistry}, noindex=
          {externalCertifiedSpecialistPolicy.pageIsNoIndex ? "true" : "false"}, revision legal=
          {externalCertifiedSpecialistPolicy.massiveImportRequiresLegalReview ? "required" : "not_required"}.
        </p>
      </section>
    </main>
  );
}
