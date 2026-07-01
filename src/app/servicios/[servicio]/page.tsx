import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { founderRegistrationHref } from "@/data/specialistAcquisition";
import { findSeoCommune, findSeoProblem, findSeoService, seoServices } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { policyContextForBaseRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, itemListSchema, organizationSchema, serviceSchema, websiteSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ servicio: string }>;
};

export function generateStaticParams() {
  return seoServices.filter((service) => service.editorialStatus === "approved").map((service) => ({ servicio: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { servicio } = await params;
  const service = findSeoService(servicio);
  if (!service) return {};

  const path = `/servicios/${service.slug}`;
  return buildSeoMetadata({
    title: service.title,
    description: service.description,
    path,
    image: service.image,
    keywords: [service.shortTitle, service.specialty, "OficiosPro", "especialistas verificados"],
    policyContext: policyContextForBaseRoute({
      route: service,
      pageType: "service",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `servicio ${service.slug}`,
    }),
  });
}

export default async function ServicePage({ params }: PageProps) {
  const { servicio } = await params;
  const service = findSeoService(servicio);
  if (!service) notFound();

  const path = `/servicios/${service.slug}`;
  const specialists = specialistsForSeo({ specialty: service.specialty, categoryId: service.categoryId, limit: 4 });
  const primaryCtaHref = searchHref(service.searchParams);
  const founderHref = founderRegistrationHref({ source: "seo_trabajos", trade: service.slug, campaign: "founder_specialists", landingPage: path });
  const communeLinks = service.popularCommunes
    .map((communeSlug) => findSeoCommune(communeSlug))
    .filter(Boolean)
    .map((commune) => ({
      href: `/servicios/${service.slug}/${commune!.slug}`,
      label: `${service.shortTitle} en ${commune!.name}`,
      description: commune!.demandSignal,
    }));
  const problemLinks =
    service.relatedProblems
      ?.map((problemSlug) => findSeoProblem(problemSlug))
      .filter(Boolean)
      .map((problem) => {
        const firstLocalPage = problem!.localPages[0];
        if (!firstLocalPage) return null;
        return {
          href: `/soluciones/${problem!.slug}/${firstLocalPage.communeSlug}`,
          label: `Resolver ${problem!.shortTitle}`,
          description: "Guia editorial para preparar informacion y solicitar diagnostico.",
        };
      })
      .filter((link): link is { href: string; label: string; description: string } => Boolean(link)) ?? [];

  return (
    <SeoProgrammaticPage
      eyebrow="Servicio verificado"
      title={service.title}
      description={service.description}
      image={service.image}
      imageAlt={service.title}
      badges={["Especialistas verificados", "Pago con creditos", "Cotización con contexto"]}
      primaryCta={{ href: primaryCtaHref, label: "Buscar especialistas" }}
      secondaryCta={{ href: founderHref, label: "Postular como especialista" }}
      includedTitle="Servicios incluidos"
      includedItems={service.includedServices}
      creditRange={service.creditRange}
      guidanceItems={[
        "Describe el problema o servicio que necesitas con fotos y comuna.",
        "Compara especialistas por reputacion, disponibilidad y trabajos completados.",
        "Agrega el perfil a la Bolsa y confirma el alcance antes de pagar con créditos.",
      ]}
      specialists={specialists}
      faqs={service.faqs}
      internalLinks={[
        { href: primaryCtaHref, label: "Ver especialistas filtrados", description: "Mantiene categoria y especialidad aplicadas." },
        { href: founderHref, label: "Postular como especialista", description: "Registro fundador con origen del servicio aplicado." },
        { href: "/especialistas-fundadores", label: "Especialistas Fundadores", description: "Programa para crear perfil profesional sin costo inicial en piloto." },
        { href: "/club-hogar", label: "Club Hogar", description: "Creditos recurrentes para mantenciones y reparaciones." },
        ...communeLinks,
        ...problemLinks,
      ].slice(0, 8)}
      jsonLd={[
        organizationSchema(),
        websiteSchema(),
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
          { name: service.shortTitle, path },
        ]),
        serviceSchema({ name: service.title, description: service.description, path, image: service.image }),
        ...(faqPageSchema(service.faqs) ? [faqPageSchema(service.faqs)!] : []),
        ...(itemListSchema({
          name: `Especialistas para ${service.shortTitle}`,
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
                name: `Especialistas para ${service.shortTitle}`,
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
