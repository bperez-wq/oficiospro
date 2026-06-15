import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "seoRoutesData.json");
const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
const routes = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const issues = [];
const warnings = [];
const indexable = [];
const noindex = [];
const seenCopy = new Map();
const qualityRows = [];

function shouldIndex(route, parent) {
  const minimumContentScore = route.minimumContentScore ?? parent?.minimumContentScore ?? 80;
  const faqs = route.faqs ?? parent?.faqs ?? [];
  return (
    route.editorialStatus === "approved" &&
    route.indexPolicy === "index" &&
    Number(route.contentScore ?? 0) >= minimumContentScore &&
    faqs.length >= 2
  );
}

function contentQualityScore({ route, parent, ctaCount, internalLinks }) {
  const minimumContentScore = route.minimumContentScore ?? parent?.minimumContentScore ?? 80;
  const faqs = route.faqs ?? parent?.faqs ?? [];
  const title = route.title ?? parent?.title ?? "";
  const description = route.description ?? parent?.description ?? "";
  const hasSpecificBlock = Boolean(
    route.includedServices?.length ||
      parent?.includedServices?.length ||
      route.steps?.length ||
      parent?.steps?.length ||
      route.benefits?.length ||
      parent?.benefits?.length ||
      route.requirements?.length ||
      parent?.requirements?.length,
  );

  const contentRatio = Math.min(1, Number(route.contentScore ?? 0) / minimumContentScore);
  const score = [
    Math.round(contentRatio * 25),
    title.length >= 20 && description.length >= 70 ? 15 : 0,
    faqs.length >= 2 ? 15 : 0,
    ctaCount > 0 ? 15 : 0,
    internalLinks >= 2 ? 10 : 0,
    route.editorialStatus === "approved" && route.indexPolicy === "index" ? 10 : 0,
    hasSpecificBlock ? 10 : 0,
  ].reduce((sum, value) => sum + value, 0);

  return Math.min(100, score);
}

function auditRoute({ path: routePath, route, parent, ctaCount = 1, internalLinks = 2 }) {
  const faqs = route.faqs ?? parent?.faqs ?? [];
  const minimumContentScore = route.minimumContentScore ?? parent?.minimumContentScore ?? 80;
  const copyKey = `${route.title ?? parent?.title ?? routePath}::${route.description ?? parent?.description ?? ""}`.toLowerCase();
  const intendsIndex = route.editorialStatus === "approved" && route.indexPolicy === "index";
  const qualityScore = contentQualityScore({ route, parent, ctaCount, internalLinks });
  qualityRows.push({ path: routePath, qualityScore });

  if (!routePath.startsWith("/")) issues.push(`[canonical] ${routePath} no parte con /`);
  if (routePath.includes("?")) issues.push(`[sitemap] ${routePath} usa query params`);
  if (intendsIndex && qualityScore < 70) issues.push(`[quality] ${routePath} tiene contentQualityScore ${qualityScore}`);
  if (!faqs.length) (intendsIndex ? issues : warnings).push(`[faq] ${routePath} no tiene FAQ visible`);
  if (ctaCount <= 0) (intendsIndex ? issues : warnings).push(`[cta] ${routePath} no tiene CTA util`);
  if (internalLinks < 2) (intendsIndex ? issues : warnings).push(`[links] ${routePath} tiene pocos enlaces internos`);
  if ((route.contentScore ?? 0) < minimumContentScore && intendsIndex) {
    issues.push(`[content] ${routePath} quiere indexar con contentScore bajo`);
  }
  if (seenCopy.has(copyKey) && intendsIndex) {
    issues.push(`[duplicate] ${routePath} comparte title/description con ${seenCopy.get(copyKey)}`);
  }
  seenCopy.set(copyKey, routePath);

  if (shouldIndex(route, parent)) indexable.push(routePath);
  else noindex.push(routePath);
}

for (const service of routes.seoServices) {
  auditRoute({ path: `/servicios/${service.slug}`, route: service, ctaCount: 2, internalLinks: 4 });
  for (const localPage of service.localPages ?? []) {
    auditRoute({
      path: `/servicios/${service.slug}/${localPage.communeSlug}`,
      route: { ...localPage, title: `${service.shortTitle} ${localPage.communeSlug}`, description: service.description },
      parent: service,
      ctaCount: 2,
      internalLinks: 4,
    });
  }
}

for (const problem of routes.seoProblems) {
  for (const localPage of problem.localPages ?? []) {
    auditRoute({
      path: `/soluciones/${problem.slug}/${localPage.communeSlug}`,
      route: { ...localPage, title: `${problem.shortTitle} ${localPage.communeSlug}`, description: problem.description },
      parent: problem,
      ctaCount: 2,
      internalLinks: 4,
    });
  }
}

for (const page of routes.seoWorkerAcquisitionPages) {
  auditRoute({ path: `/trabajos/${page.slug}`, route: page, ctaCount: 2, internalLinks: 4 });
}

for (const segment of routes.seoBusinessSegments) {
  auditRoute({ path: `/empresas/${segment.slug}`, route: segment, ctaCount: 2, internalLinks: 4 });
}

for (const service of routes.seoCommunityServices) {
  auditRoute({ path: `/comunidades/${service.slug}`, route: service, ctaCount: 2, internalLinks: 4 });
}

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const routePath of noindex) {
    if (sitemap.includes(`https://www.oficiospro.cl${routePath}`)) {
      issues.push(`[sitemap] ${routePath} aparece en sitemap aunque no debe indexar`);
    }
  }
}

console.log(`SEO audit: ${indexable.length} indexable, ${noindex.length} noindex/draft.`);
console.log("Indexable routes:");
for (const routePath of indexable) {
  const quality = qualityRows.find((row) => row.path === routePath)?.qualityScore ?? 0;
  console.log(`- ${routePath} | contentQualityScore=${quality}`);
}

if (noindex.length) {
  console.log("\nNoindex/draft routes:");
  for (const routePath of noindex) console.log(`- ${routePath}`);
}

if (issues.length) {
  console.log("\nSEO audit warnings:");
  for (const issue of issues) console.log(`- ${issue}`);
  process.exitCode = 1;
} else {
  if (warnings.length) {
    console.log("\nSEO audit non-blocking notes:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
  console.log("\nSEO audit passed without blocking issues.");
}
