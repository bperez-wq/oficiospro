import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState, MarketplaceCard } from "@/components/DesignSystem";
import { SpecialistCompactCard } from "@/components/SpecialistCompactCard";
import type { Specialist } from "@/data/mock";
import { serializeJsonLd, type JsonLd } from "@/lib/seo/schema";

type InternalLink = {
  href: string;
  label: string;
  description?: string;
};

type SeoProgrammaticPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  badges?: string[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  includedTitle?: string;
  includedItems?: string[];
  guidanceTitle?: string;
  guidanceItems?: string[];
  warning?: string;
  creditRange?: string;
  specialists?: Specialist[];
  emptySpecialistsText?: string;
  faqs: Array<{ question: string; answer: string }>;
  internalLinks: InternalLink[];
  jsonLd?: JsonLd[];
  acquisitionSlot?: ReactNode;
  closingCta?: {
    title?: string;
    text?: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
};

export function SeoProgrammaticPage({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  badges = [],
  primaryCta,
  secondaryCta,
  includedTitle = "Que puedes resolver",
  includedItems = [],
  guidanceTitle = "Como funciona",
  guidanceItems = [],
  warning,
  creditRange,
  specialists = [],
  emptySpecialistsText = "Estamos sumando especialistas verificados para esta busqueda. Puedes dejar tu solicitud y el equipo OficiosPro revisara disponibilidad.",
  faqs,
  internalLinks,
  jsonLd = [],
  acquisitionSlot,
  closingCta,
}: SeoProgrammaticPageProps) {
  return (
    <main className="bg-slate-50/50">
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(schema),
          }}
        />
      ))}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-muted">{description}</p>

          {badges.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-brand/15 bg-white px-3 py-1.5 text-xs font-black text-brand-dark shadow-sm">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={primaryCta.href} className="btn-primary">
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link href={secondaryCta.href} className="btn-secondary">
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-line bg-white shadow-soft">
          <img src={image} alt={imageAlt} className="h-full min-h-[320px] w-full object-cover" />
        </div>
      </section>

      {acquisitionSlot ? (
        <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          {acquisitionSlot}
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">{includedTitle}</p>
          {includedItems.length ? (
            <ul className="mt-4 grid gap-3">
              {includedItems.map((item) => (
                <li key={item} className="rounded-2xl bg-brand-soft/70 px-4 py-3 text-sm font-black text-ink">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {creditRange ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">{creditRange}</p> : null}
        </MarketplaceCard>

        <MarketplaceCard hover={false}>
          <p className="eyebrow">{guidanceTitle}</p>
          {warning ? <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black leading-6 text-amber-900">{warning}</p> : null}
          <ol className="mt-4 grid gap-3">
            {guidanceItems.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-2xl bg-white text-sm font-bold leading-6 text-muted">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </MarketplaceCard>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Especialistas</p>
            <h2 className="text-3xl font-black text-ink">Perfiles relacionados</h2>
          </div>
          <Link href={primaryCta.href} className="text-sm font-black text-brand-dark hover:text-brand">
            Ver busqueda filtrada
          </Link>
        </div>

        {specialists.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialists.map((specialist) => (
              <SpecialistCompactCard key={specialist.id} specialist={specialist} sourceSection="seo_programmatic_page" />
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow="Cobertura en activacion"
            title="Aun no hay especialistas publicados para esta busqueda"
            text={emptySpecialistsText}
            action={
              <Link href="/contacto" className="btn-primary">
                Solicitar contacto
              </Link>
            }
          />
        )}
      </section>

      {closingCta ? (
        <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <div className="grid gap-5 rounded-[32px] border border-brand/15 bg-brand-soft p-6 text-center md:p-10">
            {closingCta.title ? <h2 className="text-2xl font-black leading-tight text-ink md:text-3xl">{closingCta.title}</h2> : null}
            {closingCta.text ? <p className="mx-auto max-w-2xl text-sm font-bold leading-6 text-brand-dark/80 md:text-base">{closingCta.text}</p> : null}
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={closingCta.primaryHref} className="btn-primary">{closingCta.primaryLabel}</Link>
              {closingCta.secondaryHref && closingCta.secondaryLabel ? (
                <Link href={closingCta.secondaryHref} className="btn-secondary">{closingCta.secondaryLabel}</Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <MarketplaceCard hover={false}>
          <p className="eyebrow">Preguntas frecuentes</p>
          <div className="mt-4 divide-y divide-line">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="cursor-pointer list-none text-base font-black text-ink transition hover:text-brand-dark">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </MarketplaceCard>

        <MarketplaceCard hover={false}>
          <p className="eyebrow">Sigue explorando</p>
          <div className="mt-4 grid gap-3">
            {internalLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-soft"
              >
                <strong className="block text-sm text-ink">{link.label}</strong>
                {link.description ? <span className="mt-1 block text-xs font-bold leading-5 text-muted">{link.description}</span> : null}
              </Link>
            ))}
          </div>
        </MarketplaceCard>
      </section>
    </main>
  );
}
