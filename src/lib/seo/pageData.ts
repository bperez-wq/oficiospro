import { type SeoBaseRoute, type SeoCommune, type SeoLocalPage, type SeoSearchParams, buildEspecialistasHref } from "@/data/seoRoutes";
import { specialists, type Specialist } from "@/data/mock";
import { recommendationScore } from "@/lib/trust";
import type { SeoPageContext, SeoPageType } from "@/lib/seo/policy";

export function normalizeForSeo(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function searchHref(searchParams: SeoSearchParams) {
  return buildEspecialistasHref(searchParams);
}

export function specialistsForSeo({
  specialty,
  categoryId,
  communeSlug,
  limit = 4,
}: {
  specialty: string;
  categoryId?: string;
  communeSlug?: string;
  limit?: number;
}) {
  const specialtyKey = normalizeForSeo(specialty);
  const categoryKey = normalizeForSeo(categoryId ?? "");
  const communeKey = communeSlug ? normalizeForSeo(communeSlug) : "";

  return specialists
    .filter((specialist) => isPublishedSpecialist(specialist))
    .filter((specialist) => {
      const searchable = [
        specialist.specialty,
        specialist.category,
        specialist.serviceTypeId,
        specialist.serviceType,
        ...(specialist.specialties ?? []),
        ...specialist.servicesOffered,
      ]
        .map((value) => normalizeForSeo(value ?? ""))
        .join(" ");

      const serviceMatch =
        searchable.includes(specialtyKey) ||
        (specialtyKey === "calefont" && searchable.includes("gasfiteria")) ||
        (specialtyKey === "refrigeracion-comercial" && searchable.includes("climatizacion")) ||
        (specialtyKey === "mantencion-oficinas" && Boolean(searchable.match(/electricidad|climatizacion|pintura|gasfiteria/))) ||
        (categoryKey && searchable.includes(categoryKey));

      if (!serviceMatch) return false;
      if (!communeKey) return true;

      const specialistCommune = normalizeForSeo(specialist.commune ?? specialist.zone);
      return specialistCommune === communeKey;
    })
    .sort((left, right) => recommendationScore(right) - recommendationScore(left))
    .slice(0, limit);
}

export function isPublishedSpecialist(specialist: Specialist) {
  const status = specialist.publicationStatus ?? specialist.status ?? "published";
  return !["pending_review", "unpublished", "suspended", "rejected", "deleted"].includes(status);
}

export function policyContextForBaseRoute({
  route,
  pageType,
  canonicalPath,
  internalLinkCount,
  intent,
}: {
  route: SeoBaseRoute;
  pageType: SeoPageType;
  canonicalPath: string;
  internalLinkCount: number;
  intent: string;
}): SeoPageContext {
  return {
    pageType,
    canonicalPath,
    editorialStatus: route.editorialStatus,
    indexPolicy: route.indexPolicy,
    contentScore: route.contentScore,
    minimumContentScore: route.minimumContentScore,
    faqCount: route.faqs.length,
    internalLinkCount,
    hasUsefulCta: true,
    intent,
  };
}

export function policyContextForLocalRoute({
  route,
  localPage,
  pageType,
  canonicalPath,
  internalLinkCount,
  intent,
}: {
  route: SeoBaseRoute;
  localPage: SeoLocalPage;
  pageType: "service-local" | "problem-local";
  canonicalPath: string;
  internalLinkCount: number;
  intent: string;
}): SeoPageContext {
  return {
    pageType,
    canonicalPath,
    editorialStatus: localPage.editorialStatus,
    indexPolicy: localPage.indexPolicy,
    contentScore: localPage.contentScore,
    minimumContentScore: route.minimumContentScore,
    faqCount: (localPage.faqs ?? route.faqs).length,
    internalLinkCount,
    hasUsefulCta: true,
    intent,
    hasEnoughSpecialists: localPage.hasEnoughSpecialists,
    hasEnoughDemand: localPage.hasEnoughDemand,
    hasStrongEditorialContent: localPage.contentScore >= route.minimumContentScore + 5,
    pilotStatus: localPage.pilotStatus,
  };
}

export function localTitle(baseTitle: string, commune: SeoCommune) {
  return `${baseTitle} en ${commune.name}`;
}

export function nearbyCommuneLinks(commune: SeoCommune, basePath: string) {
  return commune.nearby.map((slug) => ({
    slug,
    label: slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    href: `${basePath}/${slug}`,
  }));
}
