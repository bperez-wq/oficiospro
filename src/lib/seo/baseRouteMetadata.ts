import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export function buildPublicRouteMetadata({
  title,
  description,
  path,
  image = "/brand/logo-worker-tile.svg",
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  return buildSeoMetadata({
    title,
    description,
    path,
    image,
    keywords,
    policyContext: {
      pageType: "public-base",
      canonicalPath: path,
      editorialStatus: "approved",
      indexPolicy: "index",
      contentScore: 90,
      minimumContentScore: 70,
      faqCount: 2,
      internalLinkCount: 2,
      hasUsefulCta: true,
      intent: `public route ${path}`,
    },
  });
}
