import type { Metadata } from "next";
import { getSeoIndexPolicy, type SeoPageContext } from "@/lib/seo/policy";

export const siteUrl = "https://www.oficiospro.cl";
export const siteName = "OficiosPro";

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSeoTitle(title: string) {
  return title.includes("OficiosPro") ? title : `${title} | OficiosPro`;
}

export function buildSeoMetadata({
  title,
  description,
  path,
  image,
  policyContext,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  policyContext: SeoPageContext;
  keywords?: string[];
}): Metadata {
  const decision = getSeoIndexPolicy(policyContext);
  const canonical = absoluteUrl(decision.canonical);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl("/brand/logo-worker-tile.svg");

  return {
    title: buildSeoTitle(title),
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: decision.index,
      follow: decision.follow,
    },
    openGraph: {
      title: buildSeoTitle(title),
      description,
      url: absoluteUrl(path),
      siteName,
      locale: "es_CL",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: buildSeoTitle(title),
      description,
      images: [imageUrl],
    },
  };
}
