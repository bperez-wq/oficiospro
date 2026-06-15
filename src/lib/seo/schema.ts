import { absoluteUrl, siteName, siteUrl } from "@/lib/seo/metadata";

export type JsonLd = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl("/brand/logo-worker-tile.svg"),
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/especialistas?buscar={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  image,
  provider = siteName,
  areaServed = "Chile",
}: {
  name: string;
  description: string;
  path: string;
  image?: string;
  provider?: string;
  areaServed?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    image: image ? absoluteUrl(image) : undefined,
    provider: {
      "@type": "Organization",
      name: provider,
      url: siteUrl,
    },
    areaServed,
  };
}

export function faqPageSchema(faqs: FaqItem[]): JsonLd | null {
  if (!faqs.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function itemListSchema({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string; description?: string; image?: string }>;
}): JsonLd | null {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: item.name,
        url: absoluteUrl(item.path),
        description: item.description,
        image: item.image ? absoluteUrl(item.image) : undefined,
      },
    })),
  };
}

export function profilePageSchema({
  name,
  description,
  path,
  image,
}: {
  name: string;
  description: string;
  path: string;
  image?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "Person",
      name,
      description,
      image: image ? absoluteUrl(image) : undefined,
    },
  };
}

export function serializeJsonLd(schema: JsonLd) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
