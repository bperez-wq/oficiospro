import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedGuides, getGuideBySlug } from "@/data/seoGuides";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqPageSchema, webPageSchema, serializeJsonLd } from "@/lib/seo/schema";

// Ruta de guias SEO controladas.
// Renderiza SOLO guias con editorialStatus "approved" en seoGuidesData.json.
// Las guias draft no generan pagina (dynamicParams = false).

type PageProps = {
  params: Promise<{ slug: string }>;
};

const LINK_LABELS: Record<string, string> = {
  "/registro-especialista": "Registro de especialista",
  "/especialistas-fundadores": "Programa fundador",
  "/formalizacion": "Formalización asistida",
  "/especialistas": "Buscar especialistas",
  "/servicios": "Servicios",
  "/instituciones": "Instituciones",
  "/empresas": "Empresas",
  "/impacto": "Impacto",
  "/faq": "Preguntas frecuentes",
};

function linkLabel(href: string): string {
  return LINK_LABELS[href] ?? href.replace(/^\//, "").replace(/-/g, " ");
}

export function generateStaticParams() {
  return getApprovedGuides().map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  const path = `/guias/${guide.slug}`;
  return buildSeoMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    path,
    keywords: [guide.title, "guías OficiosPro", "oficios Chile"],
    policyContext: {
      pageType: "public-base",
      canonicalPath: path,
      editorialStatus: guide.editorialStatus,
      indexPolicy: guide.editorialStatus === "approved" ? "index" : "noindex",
      contentScore: 85,
      minimumContentScore: 70,
      faqCount: guide.faqs.length,
      internalLinkCount: guide.internalLinks.length,
      hasUsefulCta: true,
      intent: guide.title,
    },
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const path = `/guias/${guide.slug}`;
  const faqSchema = faqPageSchema(guide.faqs);
  const jsonLd = [
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Guías", path: "/guias" },
      { name: guide.title, path },
    ]),
    webPageSchema({ name: guide.title, description: guide.metaDescription, path }),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}

      <nav aria-label="Miga de pan" className="text-xs font-medium text-muted">
        <Link href="/" className="hover:text-brand">
          Inicio
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href="/guias" className="hover:text-brand">
          Guías
        </Link>
      </nav>

      <header className="mt-4">
        <p className="eyebrow">Guías OficiosPro</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{guide.intro}</p>
      </header>

      {guide.disclaimer ? (
        <aside className="mt-6 rounded-[20px] border border-sun/40 bg-sun-soft p-4 text-sm leading-relaxed text-ink">
          <strong>Importante:</strong> {guide.disclaimer}
        </aside>
      ) : null}

      <div className="mt-8 space-y-8">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-base leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            {section.steps && section.steps.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {section.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-[20px] border border-line bg-white p-4 shadow-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink sm:text-base">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-[28px] border border-line bg-brand-mist p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">Preguntas frecuentes</h2>
        <div className="mt-4 space-y-5">
          {guide.faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-base font-semibold text-ink">{faq.question}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted sm:text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[28px] bg-brand-deep p-6 text-center sm:p-8">
        <h2 className="text-xl font-black text-white sm:text-2xl">¿Listo para dar el siguiente paso?</h2>
        <div className="mt-5">
          <Link
            href={guide.ctaTarget}
            className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-deep transition hover:bg-brand-soft focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            {guide.ctaLabel}
          </Link>
        </div>
      </section>

      <nav aria-label="Enlaces relacionados" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">También te puede servir</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {guide.internalLinks.map((href) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted transition hover:border-brand/30 hover:text-brand"
              >
                {linkLabel(href)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
