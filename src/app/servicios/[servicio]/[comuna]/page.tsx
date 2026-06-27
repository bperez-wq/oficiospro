import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { findSeoCommune, findSeoService, seoServices } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { localTitle, policyContextForLocalRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, itemListSchema, serviceSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ servicio: string; comuna: string }>;
};

export function generateStaticParams() {
  return seoServices.flatMap((service) =>
    service.localPages.map((localPage) => ({
      servicio: service.slug,
      comuna: localPage.communeSlug,
    })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { servicio, comuna } = await params;
  const service = findSeoService(servicio);
  const commune = findSeoCommune(comuna);
  const localPage = service?.localPages.find((page) => page.communeSlug === comuna);
  if (!service || !commune || !localPage) return {};

  const path = `/servicios/${service.slug}/${commune.slug}`;
  const title = localPage.title ?? localTitle(service.shortTitle, commune);
  const description =
    localPage.description ??
    `${service.description} Cobertura editorial para ${commune.name}, con disponibilidad honesta y busqueda filtrada.`;

  return buildSeoMetadata({
    title,
    description,
    path,
    image: service.image,
    keywords: [service.shortTitle, commune.name, service.specialty],
    policyContext: policyContextForLocalRoute({
      route: service,
      localPage,
      pageType: "service-local",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `${service.slug} en ${commune.slug}`,
    }),
  });
}

export default async function ServiceLocalPage({ params }: PageProps) {
  const { servicio, comuna } = await params;
  const service = findSeoService(servicio);
  const commune = findSeoCommune(comuna);
  const localPage = service?.localPages.find((page) => page.communeSlug === comuna);
  if (!service || !commune || !localPage) notFound();

  const path = `/servicios/${service.slug}/${commune.slug}`;
  const specialists = specialistsForSeo({ specialty: service.specialty, categoryId: service.categoryId, communeSlug: commune.slug, limit: 4 });
  const primaryCtaHref = searchHref({ ...service.searchParams, comuna: commune.slug });
  const nearbyLinks = commune.nearby.slice(0, 4).map((slug) => ({
    href: `/servicios/${service.slug}/${slug}`,
    label: `${service.shortTitle} en ${slug.replace(/-/g, " ")}`,
    description: "Comuna cercana en revision editorial.",
  }));

  return (
    <SeoProgrammaticPage
      eyebrow="Servicio local"
      title={localPage.title ?? localTitle(service.shortTitle, commune)}
      description={
        localPage.description ??
        `${service.description} En ${commune.name} mostramos disponibilidad con criterio editorial: especialistas publicados cuando existen y una alternativa honesta si la cobertura aun esta creciendo.`
      }
      image={service.image}
      imageAlt={`${service.shortTitle} en ${commune.name}`}
      badges={[commune.name, commune.region, localPage.hasEnoughSpecialists ? "Oferta publicada" : "Cobertura en activacion"]}
      primaryCta={{ href: primaryCtaHref, label: "Buscar en especialistas" }}
      secondaryCta={{ href: "/contacto", label: "Solicitar contacto" }}
      closingCta={{
        title: `${service.shortTitle} en ${commune.name}: encuentra o solicita`,
        text: "Compara especialistas publicados o deja tu solicitud y revisamos disponibilidad en tu comuna. Consultar no tiene costo.",
        primaryLabel: "Buscar en especialistas",
        primaryHref: primaryCtaHref,
        secondaryLabel: "Solicitar contacto",
        secondaryHref: "/contacto",
      }}
      includedTitle={`Servicios frecuentes en ${commune.name}`}
      includedItems={service.includedServices}
      creditRange={service.creditRange}
      guidanceItems={[
        `Indica direccion aproximada o sector de ${commune.name} para validar cobertura.`,
        "Adjunta fotos y urgencia para que el especialista entienda el alcance.",
        "Si no hay oferta publicada, OficiosPro puede recibir tu solicitud y revisar disponibilidad.",
      ]}
      specialists={specialists}
      emptySpecialistsText={`Estamos sumando especialistas en ${commune.name} para ${service.shortTitle}. Puedes solicitar contacto y te avisaremos cuando tengamos disponibilidad.`}
      faqs={localPage.faqs ?? service.faqs}
      internalLinks={[
        { href: `/servicios/${service.slug}`, label: `Guia de ${service.shortTitle}`, description: "Pagina nacional del servicio." },
        { href: primaryCtaHref, label: "Busqueda filtrada", description: "Categoria, especialidad y comuna aplicadas." },
        ...nearbyLinks,
        { href: "/registro-especialista", label: "Postular como especialista", description: "Para profesionales con cobertura en la zona." },
      ].slice(0, 8)}
      jsonLd={[
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/especialistas" },
          { name: service.shortTitle, path: `/servicios/${service.slug}` },
          { name: commune.name, path },
        ]),
        serviceSchema({ name: `${service.shortTitle} en ${commune.name}`, description: service.description, path, image: service.image, areaServed: commune.name }),
        ...(faqPageSchema(localPage.faqs ?? service.faqs) ? [faqPageSchema(localPage.faqs ?? service.faqs)!] : []),
        ...(itemListSchema({
          name: `${service.shortTitle} en ${commune.name}`,
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
                name: `${service.shortTitle} en ${commune.name}`,
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
