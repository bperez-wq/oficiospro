import Link from "next/link";
import { MarketplaceCard } from "@/components/DesignSystem";
import { seoCommunes, seoServices } from "@/data/seoRoutes";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";
import { breadcrumbSchema, organizationSchema, serializeJsonLd, websiteSchema } from "@/lib/seo/schema";

export const metadata = buildPublicRouteMetadata({
  title: "Servicios locales por comuna",
  description: "Explora servicios de OficiosPro por oficio y comuna: gasfiteria, electricidad, pintura, climatizacion, cerrajeria, limpieza y mas.",
  path: "/servicios",
  image: "/assets/oficios/gasfiteria/gasfiteria-trabajo-01.jpg",
  keywords: ["servicios locales", "oficios por comuna", "especialistas verificados"],
});

function isIndexableLocalPage(service: (typeof seoServices)[number], localPage: (typeof seoServices)[number]["localPages"][number]) {
  return localPage.editorialStatus === "approved" && localPage.indexPolicy === "index" && localPage.contentScore >= service.minimumContentScore;
}

export default function ServiciosIndexPage() {
  const serviceCards = seoServices
    .filter((service) => service.editorialStatus === "approved" && service.indexPolicy === "index")
    .map((service) => ({
      service,
      localPages: service.localPages.filter((localPage) => isIndexableLocalPage(service, localPage)),
    }))
    .filter((entry) => entry.localPages.length);

  return (
    <main className="bg-slate-50/60">
      {[organizationSchema(), websiteSchema(), breadcrumbSchema([{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }])].map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-black uppercase tracking-wide text-muted">
          <Link href="/" className="transition hover:text-brand-dark">Inicio</Link>
          <span className="mx-2 text-line">/</span>
          <span className="text-ink">Servicios</span>
        </nav>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">Cobertura local</p>
            <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">Servicios OficiosPro por comuna</h1>
          </div>
          <p className="text-base font-semibold leading-7 text-muted">
            Encuentra landings locales con informacion util, busqueda filtrada y disponibilidad honesta por oficio. Si aun no hay especialista publicado, puedes dejar una solicitud para seguimiento.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 md:px-6 lg:grid-cols-2">
        {serviceCards.map(({ service, localPages }) => (
          <MarketplaceCard key={service.slug}>
            <div className="flex gap-4">
              <img src={service.image} alt={service.title} className="h-24 w-24 rounded-2xl object-cover" />
              <div>
                <p className="eyebrow">{service.shortTitle}</p>
                <h2 className="text-2xl font-black text-ink">{service.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{service.description}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {localPages.map((localPage) => {
                const commune = seoCommunes.find((candidate) => candidate.slug === localPage.communeSlug);
                return (
                  <Link
                    key={`${service.slug}-${localPage.communeSlug}`}
                    href={`/servicios/${service.slug}/${localPage.communeSlug}`}
                    className="rounded-full border border-line bg-white px-3 py-2 text-xs font-black text-brand-dark transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm"
                  >
                    {commune?.name ?? localPage.communeSlug}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/servicios/${service.slug}`} className="btn-secondary">Ver guia del servicio</Link>
              <Link href={`/especialistas?${new URLSearchParams(service.searchParams).toString()}`} className="btn-primary">Buscar especialistas</Link>
            </div>
          </MarketplaceCard>
        ))}
      </section>
    </main>
  );
}
