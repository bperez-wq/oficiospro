import type { EditorialStatus, IndexPolicy } from "@/data/seoRoutes";

export type SeoPageType =
  | "service"
  | "service-local"
  | "problem-local"
  | "worker-acquisition"
  | "business-segment"
  | "community-service"
  | "public-base"
  | "internal";

export type SeoPageContext = {
  pageType: SeoPageType;
  canonicalPath: string;
  editorialStatus: EditorialStatus;
  indexPolicy: IndexPolicy;
  contentScore: number;
  minimumContentScore: number;
  faqCount: number;
  internalLinkCount: number;
  hasUsefulCta: boolean;
  intent?: string;
  hasEnoughSpecialists?: boolean;
  hasEnoughDemand?: boolean;
  hasStrongEditorialContent?: boolean;
  pilotStatus?: "active" | "planned";
  duplicateRisk?: boolean;
};

export type SeoIndexDecision = {
  index: boolean;
  follow: boolean;
  includeInSitemap: boolean;
  canonical: string;
  robots: "index,follow" | "noindex,follow";
  reasons: string[];
};

const localPageTypes = new Set<SeoPageType>(["service-local", "problem-local"]);

export function getSeoIndexPolicy(context: SeoPageContext): SeoIndexDecision {
  const reasons: string[] = [];

  if (context.editorialStatus !== "approved") reasons.push("not_editorially_approved");
  if (context.indexPolicy !== "index") reasons.push("index_policy_noindex");
  if (context.contentScore < context.minimumContentScore) reasons.push("content_score_below_minimum");
  if (!context.hasUsefulCta) reasons.push("missing_useful_cta");
  if (context.faqCount < 2) reasons.push("missing_visible_faqs");
  if (context.internalLinkCount < 2) reasons.push("missing_internal_links");
  if (!context.intent) reasons.push("missing_search_intent");
  if (context.duplicateRisk) reasons.push("duplicate_risk");

  if (localPageTypes.has(context.pageType)) {
    const localEvidence =
      context.hasEnoughSpecialists ||
      context.hasEnoughDemand ||
      context.hasStrongEditorialContent ||
      context.pilotStatus === "active";

    if (!localEvidence) reasons.push("missing_local_evidence");
  }

  if (context.pageType === "internal") reasons.push("internal_route");

  const index = reasons.length === 0;

  return {
    index,
    follow: true,
    includeInSitemap: index,
    canonical: context.canonicalPath,
    robots: index ? "index,follow" : "noindex,follow",
    reasons,
  };
}
