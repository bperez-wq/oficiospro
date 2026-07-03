import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedGuides } from "@/data/seoGuides";
import { noindexMetadata } from "@/lib/seo/noindexMetadata";

// Indice de guias. Se mantiene noindex mientras el hub tenga pocas guias;
// las guias individuales aprobadas si son indexables y entran al sitemap.

export const metadata: Metadata = {
  title: "Guías OficiosPro",
  description: "Guías prácticas para especialistas de oficio y clientes: cómo ofrecer servicios, contratar con confianza y formalizarse.",
  ...noindexMetadata,
};

export default function GuidesIndexPage() {
  const guides = getApprovedGuides();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      <header>
        <p className="eyebrow">Guías OficiosPro</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
          Guías prácticas de oficios
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Contenido claro y sin promesas infladas: cómo ofrecer tus servicios, cómo contratar con
          confianza y cómo formalizar tu trabajo.
        </p>
      </header>

      <ul className="mt-8 space-y-4">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guias/${guide.slug}`}
              className="group block rounded-[28px] border border-line bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand/20 sm:p-6"
            >
              <h2 className="text-lg font-bold text-ink group-hover:text-brand sm:text-xl">{guide.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{guide.metaDescription}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand">Leer guía →</span>
            </Link>
          </li>
        ))}
      </ul>

      {guides.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Pronto publicaremos las primeras guías.</p>
      ) : null}
    </main>
  );
}
