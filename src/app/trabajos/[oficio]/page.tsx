import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcquisitionPageViewTracker } from "@/components/AcquisitionTrackingLink";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { SpecialistAssistantWidget } from "@/components/SpecialistAssistantWidget";
import { founderRegistrationHref } from "@/data/specialistAcquisition";
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
  const acquisitionContext = {
    source: "seo_trabajos" as const,
    trade: page.slug,
    campaign: "founder_specialists",
    landingPage: path,
  };

  return (
    <>
      <AcquisitionPageViewTracker source="seo_trabajos" context={acquisitionContext} />
      <SeoProgrammaticPage
        eyebrow="Especialistas fundadores"
        title={page.title}
        description={page.description}
        image={page.image}
        imageAlt={page.title}
        badges={["Perfil verificado", "Servicios multiples", "Formalizacion asistida", "Sin prometer ingresos"]}
        primaryCta={{ href: founderRegistrationHref(acquisitionContext), label: "Crear perfil fundador" }}
        secondaryCta={{ href: searchHref(page.searchParams), label: "Ver especialistas publicados" }}
        includedTitle="Beneficios operativos"
        includedItems={[
          ...page.benefits,
          `Aparicion por oficio ${page.shortTitle} y comuna cuando el perfil sea aprobado.`,
          "Cotizacion virtual y apoyo para ordenar servicios y precios.",
        ]}
        guidanceTitle="Requisitos de postulacion"
        guidanceItems={[
          ...page.requirements,
          "Aceptar terminos, contacto operativo y revision de antecedentes antes de publicar.",
          "Entender que OficiosPro da visibilidad, pero no garantiza volumen fijo de trabajos.",
        ]}
        specialists={specialists}
        emptySpecialistsText="Aun no hay perfiles publicados para mostrar aqui. Las postulaciones reales se revisan antes de aparecer en la plataforma."
        faqs={page.faqs}
        internalLinks={[
          { href: founderRegistrationHref(acquisitionContext), label: "Registro especialista", description: "Formulario real con source SEO y oficio precargados." },
          { href: "/especialistas-fundadores", label: "Especialistas Fundadores", description: "Conoce el programa fundador completo." },
          { href: "/referidos/especialistas", label: "Referir especialista", description: "Invita a otro trabajador tecnico sin promesas monetarias." },
          { href: searchHref(page.searchParams), label: "Marketplace de especialistas", description: "Mira como se muestran perfiles publicados." },
          { href: "/instituciones", label: "Instituciones", description: "Propuesta para OMIL, SENCE, CFT/IP y organizaciones locales." },
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
      <SpecialistAssistantWidget />
    </>
  );
}
