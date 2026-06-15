import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { findSeoCommune, findSeoProblem, findSeoService, seoProblems } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { localTitle, policyContextForLocalRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, itemListSchema, serviceSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ problema: string; comuna: string }>;
};

export function generateStaticParams() {
  return seoProblems.flatMap((problem) =>
    problem.localPages.map((localPage) => ({
      problema: problem.slug,
      comuna: localPage.communeSlug,
    })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { problema, comuna } = await params;
  const problem = findSeoProblem(problema);
  const commune = findSeoCommune(comuna);
  const localPage = problem?.localPages.find((page) => page.communeSlug === comuna);
  if (!problem || !commune || !localPage) return {};

  const path = `/soluciones/${problem.slug}/${commune.slug}`;
  const title = localPage.title ?? localTitle(problem.shortTitle, commune);

  return buildSeoMetadata({
    title,
    description: `${problem.description} Orientacion para ${commune.name} con solicitud filtrada a especialistas relacionados.`,
    path,
    image: problem.image,
    keywords: [problem.shortTitle, commune.name, problem.specialty],
    policyContext: policyContextForLocalRoute({
      route: problem,
      localPage,
      pageType: "problem-local",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `${problem.slug} en ${commune.slug}`,
    }),
  });
}

export default async function ProblemLocalPage({ params }: PageProps) {
  const { problema, comuna } = await params;
  const problem = findSeoProblem(problema);
  const commune = findSeoCommune(comuna);
  const localPage = problem?.localPages.find((page) => page.communeSlug === comuna);
  if (!problem || !commune || !localPage) notFound();

  const service = findSeoService(problem.serviceSlug);
  const path = `/soluciones/${problem.slug}/${commune.slug}`;
  const specialists = specialistsForSeo({ specialty: problem.specialty, categoryId: problem.categoryId, communeSlug: commune.slug, limit: 4 });
  const primaryCtaHref = searchHref({ ...problem.searchParams, comuna: commune.slug });
  const faqs = localPage.faqs ?? problem.faqs;

  return (
    <SeoProgrammaticPage
      eyebrow="Solucion local"
      title={localPage.title ?? localTitle(problem.shortTitle, commune)}
      description={`${problem.description} En ${commune.name}, la recomendacion es preparar contexto, evitar intervenciones riesgosas y solicitar diagnostico profesional cuando corresponda.`}
      image={problem.image}
      imageAlt={`${problem.shortTitle} en ${commune.name}`}
      badges={[commune.name, service?.shortTitle ?? problem.specialty, "Diagnostico profesional"]}
      primaryCta={{ href: primaryCtaHref, label: "Solicitar diagnostico" }}
      secondaryCta={service ? { href: `/servicios/${service.slug}`, label: `Ver ${service.shortTitle}` } : undefined}
      includedTitle="Informacion que conviene preparar"
      includedItems={problem.steps}
      warning={problem.warning}
      guidanceTitle="Cuando contactar a un especialista"
      guidanceItems={[
        "Cuando el problema avanza, afecta seguridad o requiere revisar instalaciones.",
        "Cuando no tienes claridad del origen y necesitas diagnostico antes de comprar materiales.",
        "Cuando hay riesgo electrico, gas, humedad activa o dano a terceros.",
      ]}
      specialists={specialists}
      emptySpecialistsText={`Estamos revisando cobertura para ${problem.shortTitle} en ${commune.name}. Puedes dejar tu solicitud y priorizaremos disponibilidad real.`}
      faqs={faqs}
      internalLinks={[
        { href: primaryCtaHref, label: "Busqueda filtrada", description: "Especialidad y comuna aplicadas." },
        ...(service ? [{ href: `/servicios/${service.slug}`, label: `Servicio de ${service.shortTitle}`, description: "Guia nacional del servicio relacionado." }] : []),
        { href: "/contacto", label: "Solicitar contacto", description: "Para casos con contexto adicional o cobertura en revision." },
        { href: "/registro-especialista", label: "Soy especialista", description: "Postula si cubres este tipo de problema." },
      ]}
      jsonLd={[
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Soluciones", path: "/especialistas" },
          { name: problem.shortTitle, path },
        ]),
        serviceSchema({ name: `${problem.shortTitle} en ${commune.name}`, description: problem.description, path, image: problem.image, areaServed: commune.name }),
        ...(faqPageSchema(faqs) ? [faqPageSchema(faqs)!] : []),
        ...(itemListSchema({
          name: `${problem.shortTitle} en ${commune.name}`,
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
                name: `${problem.shortTitle} en ${commune.name}`,
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
