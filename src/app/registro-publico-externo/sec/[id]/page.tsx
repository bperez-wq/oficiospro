import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalCertifiedSpecialistCard } from "@/components/ExternalCertifiedSpecialistCard";
import { MarketplaceCard } from "@/components/DesignSystem";
import { PlatformNav } from "@/components/PlatformNav";
import { externalCertifiedProfessionalsPrototype } from "@/data/externalCertifiedSpecialists";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return externalCertifiedProfessionalsPrototype.map((specialist) => ({ id: specialist.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const specialist = externalCertifiedProfessionalsPrototype.find((item) => item.id === id);
  if (!specialist) return {};
  return {
    title: `${specialist.displayName} | Ficha informativa no reclamada`,
    description: "Ficha noindex de referencia publica externa SEC, sin datos de contacto ni acciones comerciales.",
    robots: "noindex,nofollow,noarchive",
    alternates: {
      canonical: `https://www.oficiospro.cl/registro-publico-externo/sec/${specialist.id}`,
    },
  };
}

export default async function ExternalCertifiedSpecialistDetailPage({ params }: PageProps) {
  const { id } = await params;
  const specialist = externalCertifiedProfessionalsPrototype.find((item) => item.id === id);
  if (!specialist) notFound();

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft md:p-8">
        <p className="eyebrow">Noindex · fuente publica externa</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">
          Ficha informativa no reclamada
        </h1>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-muted">
          Esta pagina existe para modelar el flujo conservador de referencias publicas. No es un perfil activo y no permite contacto, cotizacion ni reserva.
        </p>
      </section>

      <ExternalCertifiedSpecialistCard specialist={specialist} />

      <MarketplaceCard hover={false} className="border-sky-100 bg-sky-50">
        <p className="eyebrow">Revision y derechos</p>
        <p className="mt-2 text-sm font-bold leading-6 text-sky-950">
          Si eres la persona titular o representante autorizado, puedes pedir activacion, rectificacion, supresion, oposicion o bloqueo temporal mientras el equipo revisa el caso.
        </p>
        <div className="mt-4">
          <Link href="/privacidad/solicitudes" className="rounded-full bg-brand px-4 py-3 text-sm font-black text-white shadow-soft">
            Ir a solicitudes de privacidad
          </Link>
        </div>
      </MarketplaceCard>
    </main>
  );
}
