import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { findSeoCommunityService, seoCommunityServices } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { policyContextForBaseRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, itemListSchema, serviceSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ servicio: string }>;
};

export function generateStaticParams() {
  return seoCommunityServices.map((service) => ({ servicio: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { servicio } = await params;
  const service = findSeoCommunityService(servicio);
  if (!service) return {};

  const path = `/comunidades/${service.slug}`;
  return buildSeoMetadata({
    title: service.title,
    description: service.description,
    path,
    image: service.image,
    keywords: [service.shortTitle, "comunidades", "edificios", "OficiosPro"],
    policyContext: policyContextForBaseRoute({
      route: service,
      pageType: "community-service",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `comunidades ${service.slug}`,
    }),
  });
}

export default async function CommunityServicePage({ params }: PageProps) {
  const { servicio } = await params;
  const service = findSeoCommunityService(servicio);
  if (!service) notFound();

  const path = `/comunidades/${service.slug}`;
  const specialists = specialistsForSeo({ specialty: service.specialty, categoryId: service.categoryId, limit: 4 });

  return (
    <SeoProgrammaticPage
      eyebrow="Comunidades y edificios"
      title={service.title}
      description={service.description}
      image={service.image}
      imageAlt={service.title}
      badges={["Administracion", "Mantencion preventiva", "Historial por comunidad"]}
      primaryCta={{ href: "/empresas", label: "Solicitar cuenta comunidad" }}
      secondaryCta={{ href: searchHref(service.searchParams), label: "Buscar especialistas" }}
      includedTitle="Necesidades frecuentes"
      includedItems={service.includedServices}
      guidanceTitle="Como coordinar"
      guidanceItems={[
        "Describe la falla, frecuencia, acceso y prioridad de la comunidad.",
        "Adjunta fotos sin intervenir equipos ni tableros.",
        "Coordina diagnostico, presupuesto y seguimiento desde el flujo actual de OficiosPro.",
      ]}
      specialists={specialists}
      emptySpecialistsText="Si no hay especialistas publicados para este servicio, la administracion puede dejar una solicitud y OficiosPro revisara cobertura real."
      faqs={service.faqs}
      internalLinks={[
        { href: "/empresas", label: "Cuenta para comunidades", description: "Gestiona solicitudes y creditos para edificios." },
        { href: searchHref(service.searchParams), label: "Busqueda relacionada", description: "Especialistas por categoria y servicio." },
        { href: "/contacto", label: "Hablar con operaciones", description: "Para casos urgentes o recurrentes." },
        { href: "/club-hogar", label: "Club Hogar", description: "Alternativa para mantenciones residenciales." },
      ]}
      jsonLd={[
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Comunidades", path: "/empresas" },
          { name: service.shortTitle, path },
        ]),
        serviceSchema({ name: service.title, description: service.description, path, image: service.image }),
        ...(faqPageSchema(service.faqs) ? [faqPageSchema(service.faqs)!] : []),
        ...(itemListSchema({
          name: service.title,
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
                name: service.title,
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
