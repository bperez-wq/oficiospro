import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { findSeoWorkerPage, seoWorkerAcquisitionPages } from "@/data/seoRoutes";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { policyContextForBaseRoute, searchHref, specialistsForSeo } from "@/lib/seo/pageData";
import { breadcrumbSchema, faqPageSchema, serviceSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ oficio: string }>;
};

export function generateStaticParams() {
  return seoWorkerAcquisitionPages.map((page) => ({ oficio: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { oficio } = await params;
  const page = findSeoWorkerPage(oficio);
  if (!page) return {};

  const path = `/trabajos/${page.slug}`;
  return buildSeoMetadata({
    title: page.title,
    description: page.description,
    path,
    image: page.image,
    keywords: [page.shortTitle, "trabajos oficios", "postular especialista", "OficiosPro"],
    policyContext: policyContextForBaseRoute({
      route: page,
      pageType: "worker-acquisition",
      canonicalPath: path,
      internalLinkCount: 4,
      intent: `captacion ${page.slug}`,
    }),
  });
}

export default async function WorkerAcquisitionPage({ params }: PageProps) {
  const { oficio } = await params;
  const page = findSeoWorkerPage(oficio);
  if (!page) notFound();

  const path = `/trabajos/${page.slug}`;
  const specialists = specialistsForSeo({ specialty: page.specialty, categoryId: page.categoryId, limit: 4 });

  return (
    <SeoProgrammaticPage
      eyebrow="Especialistas fundadores"
      title={page.title}
      description={page.description}
      image={page.image}
      imageAlt={page.title}
      badges={["Perfil verificado", "Servicios multiples", "Sin prometer ingresos"]}
      primaryCta={{ href: "/registro-especialista", label: "Crear perfil fundador" }}
      secondaryCta={{ href: searchHref(page.searchParams), label: "Ver especialistas publicados" }}
      includedTitle="Beneficios operativos"
      includedItems={page.benefits}
      guidanceTitle="Requisitos de postulacion"
      guidanceItems={page.requirements}
      specialists={specialists}
      emptySpecialistsText="Aun no hay perfiles publicados para mostrar aqui. Las postulaciones reales se revisan antes de aparecer en la plataforma."
      faqs={page.faqs}
      internalLinks={[
        { href: "/registro-especialista", label: "Registro especialista", description: "Formulario real para crear perfil." },
        { href: searchHref(page.searchParams), label: "Marketplace de especialistas", description: "Mira como se muestran perfiles publicados." },
        { href: "/soporte", label: "Soporte", description: "Dudas sobre validacion, documentos y uso de la plataforma." },
        { href: "/terminos", label: "Terminos", description: "Condiciones generales de OficiosPro." },
      ]}
      jsonLd={[
        breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Trabajos", path: "/registro-especialista" },
          { name: page.shortTitle, path },
        ]),
        serviceSchema({ name: page.title, description: page.description, path, image: page.image }),
        ...(faqPageSchema(page.faqs) ? [faqPageSchema(page.faqs)!] : []),
      ]}
    />
  );
}
