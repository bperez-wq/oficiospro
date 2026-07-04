import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcquisitionPageViewTracker } from "@/components/AcquisitionTrackingLink";
import { SeoProgrammaticPage } from "@/components/SeoProgrammaticPage";
import { SpecialistQuickLeadForm } from "@/components/SpecialistQuickLeadForm";
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
    sourceDetail: "seo_jobs",
    trade: page.slug,
    campaign: "founder_specialists",
    utmSource: "seo",
    utmMedium: "organic",
    utmCampaign: "seo_jobs",
    utmContent: page.slug,
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
        badges={["Revision humana antes de publicar", "Servicios multiples", "Formalizacion asistida", "Sin prometer ingresos"]}
        primaryCta={{ href: founderRegistrationHref(acquisitionContext), label: "Ofrecer mis servicios" }}
        secondaryCta={{ href: searchHref(page.searchParams), label: "Ver especialistas publicados" }}
        closingCta={{
          title: `Haz visible tu oficio de ${page.shortTitle}`,
          text: "Crea tu perfil fundador sin costo inicial. Toma unos minutos y el equipo OficiosPro revisa tu postulacion antes de publicar. Puedes postular aunque tu categoria este en formacion.",
          primaryLabel: "Ofrecer mis servicios",
          primaryHref: founderRegistrationHref(acquisitionContext),
          secondaryLabel: "Ver programa fundador",
          secondaryHref: "/especialistas-fundadores",
        }}
        acquisitionSlot={
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <SpecialistQuickLeadForm
              title={`Ofrecer servicios de ${page.shortTitle}`}
              text={`Estamos formando red de ${page.shortTitle} por comuna. Deja tus datos si quieres que operaciones te ayude a crear el perfil.`}
              defaultTrade={page.shortTitle}
              context={acquisitionContext}
              sourceComponent="WorkerAcquisitionPage"
              sourceButton={`Lead rapido ${page.slug}`}
              leadKind="job_page_lead"
            />
            <div className="rounded-[28px] border border-brand/15 bg-brand-soft p-6">
              <p className="eyebrow">Cobertura en formacion</p>
              <h2 className="text-2xl font-black leading-tight text-ink">Buscamos especialistas por comuna.</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-brand-dark/80">
                Puedes postular aunque todavia no tengas todo resuelto. OficiosPro revisa el perfil, oficio, comuna y antecedentes antes de publicar.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Crear perfil", "Dejanos tu contacto", "Formalizacion asistida", "Sin ingresos garantizados"].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-brand-dark">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                {[
                  ["1", "Postulas hoy con lo que tengas listo."],
                  ["2", "Una persona del equipo revisa tu perfil en ~48 h."],
                  ["3", "Tu Pasaporte Profesional se publica por comuna."],
                ].map(([step, text]) => (
                  <div key={step} className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-3 py-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-black text-white">{step}</span>
                    <span className="text-xs font-black text-brand-dark">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        includedTitle="Beneficios operativos"
        includedItems={[
          ...page.benefits,
          `Aparicion por oficio ${page.shortTitle} y comuna cuando el perfil sea aprobado.`,
          "Cotización virtual y apoyo para ordenar servicios y precios.",
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
          { href: "/referidos/especialistas", label: "Referir especialista", description: "Invita a otro trabajador técnico sin promesas monetarias." },
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
    </>
  );
}
