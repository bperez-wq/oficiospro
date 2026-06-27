import routesData from "./seoRoutesData.json";

export type EditorialStatus = "draft" | "approved" | "noindex" | "archived";
export type IndexPolicy = "index" | "noindex";

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoSearchParams = Record<string, string>;

export type SeoCommune = {
  slug: string;
  name: string;
  region: string;
  nearby: string[];
  demandSignal: string;
};

export type SeoLocalPage = {
  communeSlug: string;
  regionSlug?: string;
  title?: string;
  description?: string;
  h1?: string;
  intro?: string;
  trustText?: string;
  ctaLabel?: string;
  editorialStatus: EditorialStatus;
  indexPolicy: IndexPolicy;
  contentScore: number;
  hasEnoughSpecialists?: boolean;
  hasEnoughDemand?: boolean;
  pilotStatus?: "active" | "planned";
  localNotes?: string[];
  faqs?: SeoFaq[];
};

export type SeoBaseRoute = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  categoryId: string;
  specialty: string;
  synonyms?: string[];
  searchParams: SeoSearchParams;
  relatedProblems?: string[];
  faqs: SeoFaq[];
  minimumContentScore: number;
  contentScore: number;
  indexPolicy: IndexPolicy;
  priority: number;
  image: string;
  lastReviewedAt: string;
  editorialStatus: EditorialStatus;
};

export type SeoServiceRoute = SeoBaseRoute & {
  includedServices: string[];
  creditRange: string;
  popularCommunes: string[];
  localPages: SeoLocalPage[];
};

export type SeoProblemRoute = SeoBaseRoute & {
  serviceSlug: string;
  warning: string;
  steps: string[];
  localPages: SeoLocalPage[];
};

export type SeoWorkerAcquisitionRoute = SeoBaseRoute & {
  benefits: string[];
  requirements: string[];
};

export type SeoSegmentRoute = SeoBaseRoute & {
  includedServices: string[];
};

type SeoRoutesData = {
  seoCommunes: SeoCommune[];
  seoServices: SeoServiceRoute[];
  seoProblems: SeoProblemRoute[];
  seoWorkerAcquisitionPages: SeoWorkerAcquisitionRoute[];
  seoBusinessSegments: SeoSegmentRoute[];
  seoCommunityServices: SeoSegmentRoute[];
};

const typedRoutes = routesData as unknown as SeoRoutesData;

export const seoCommunes = typedRoutes.seoCommunes;
export const seoServices = typedRoutes.seoServices;
export const seoProblems = typedRoutes.seoProblems;
export const seoWorkerAcquisitionPages = typedRoutes.seoWorkerAcquisitionPages;
export const seoBusinessSegments = typedRoutes.seoBusinessSegments;
export const seoCommunityServices = typedRoutes.seoCommunityServices;

export function findSeoService(slug: string) {
  return seoServices.find((service) => service.slug === slug);
}

export function findSeoProblem(slug: string) {
  return seoProblems.find((problem) => problem.slug === slug);
}

export function findSeoCommune(slug: string) {
  return seoCommunes.find((commune) => commune.slug === slug);
}

export function findSeoWorkerPage(slug: string) {
  return seoWorkerAcquisitionPages.find((page) => page.slug === slug);
}

export function findSeoBusinessSegment(slug: string) {
  return seoBusinessSegments.find((segment) => segment.slug === slug);
}

export function findSeoCommunityService(slug: string) {
  return seoCommunityServices.find((service) => service.slug === slug);
}

export function isEditoriallyApproved(route: { editorialStatus: EditorialStatus; indexPolicy: IndexPolicy }) {
  return route.editorialStatus === "approved" && route.indexPolicy === "index";
}

export function hasMinimumSeoContent(route: { contentScore: number; minimumContentScore: number; faqs?: SeoFaq[] }) {
  return route.contentScore >= route.minimumContentScore && Boolean(route.faqs?.length);
}

export function buildEspecialistasHref(searchParams: SeoSearchParams) {
  const params = new URLSearchParams(searchParams);
  return `/especialistas?${params.toString()}`;
}

export function routeLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
