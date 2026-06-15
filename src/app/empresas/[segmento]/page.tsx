import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { findSeoBusinessSegment, seoBusinessSegments } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { policyContextForBaseRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, itemListSchema, serviceSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ segmento: string }>;
};

export function generateStaticParams() {
  return seoBusinessSegments.map((segment) => ({ segmento: segment.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segmento } = await params;
  const segment = findSeoBusinessSegment(segmento);
  if (!segment) return {};

  const path = `/empresas/${segment.slug}`;
  return buildSeoMetadata({
    title: segment.title,
    description: segment.description,
    path,
    image: segment.image,
    keywords: [segment.shortTitle, "servicios tecnicos empresas", "OficiosPro empresas"],
    policyContext: policyContextForBaseRoute({
      route: segment,
      pageType: "business-segment",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `empresas ${segment.slug}`,
    }),
  });
}

export default async function BusinessSegmentPage({ params }: PageProps) {
  const { segmento } = await params;
  const segment = findSeoBusinessSegment(segmento);
  if (!segment) notFound();

  const path = `/empresas/${segment.slug}`;
  const specialists = specialistsForSeo({ specialty: segment.specialty, categoryId: segment.categoryId, limit: 4 });

  return (
    <SeoProgrammaticPage
      eyebrow="Empresas"
      title={segment.title}
      description={segment.description}
      image={segment.image}
      imageAlt={segment.title}
      badges={["Creditos empresa", "Historial de solicitudes", "Operacion verificable"]}
      primaryCta={{ href: "/empresas", label: "Solicitar cuenta empresa" }}
      secondaryCta={{ href: searchHref(segment.searchParams), label: "Buscar especialistas" }}
      includedTitle="Casos cubiertos"
      includedItems={segment.includedServices}
      guidanceTitle="Operacion recomendada"
      guidanceItems={[
        "Centraliza solicitudes por sede, rubro o urgencia operacional.",
        "Usa creditos empresa para ordenar presupuestos, reservas y pagos.",
        "Revisa trazabilidad de trabajos, estados y especialistas relacionados.",
      ]}
      specialists={specialists}
      emptySpecialistsText="La cobertura empresa se activa con solicitudes reales y especialistas revisados. Puedes hablar con ventas para ordenar el caso de uso."
      faqs={segment.faqs}
      internalLinks={[
        { href: "/empresas", label: "Club Empresas", description: "Pagina principal para cuentas empresa." },
        { href: searchHref(segment.searchParams), label: "Busqueda relacionada", description: "Especialistas vinculados a este segmento." },
        { href: "/contacto", label: "Hablar con ventas", description: "Contacto operativo para empresas y administradores." },
        { href: "/impacto", label: "Impacto OficiosPro", description: "Modelo de reputacion, confianza y formalizacion." },
      ]}
      jsonLd={[
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Empresas", path: "/empresas" },
          { name: segment.shortTitle, path },
        ]),
        serviceSchema({ name: segment.title, description: segment.description, path, image: segment.image }),
        ...(faqPageSchema(segment.faqs) ? [faqPageSchema(segment.faqs)!] : []),
        ...(itemListSchema({
          name: segment.title,
          path,
          items: specialists.map((specialist) => ({
            name: specialist.name,
            description: specialist.specialty,
            image: specialist.image,
            path: `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}`,
          })),
        })
          ? [
              itemListSchema({
                name: segment.title,
                path,
                items: specialists.map((specialist) => ({
                  name: specialist.name,
                  description: specialist.specialty,
                  image: specialist.image,
                  path: `/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}`,
                })),
              })!,
            ]
          : []),
      ]}
    />
  );
}
