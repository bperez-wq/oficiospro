import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "seoRoutesData.json");
const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
const siteUrl = "https://www.oficiospro.cl";

const targetServices = new Set(["gasfiteria", "electricidad", "pintura", "climatizacion", "cerrajeria", "limpieza", "remodelaciones", "carpinteria", "techumbre", "jardineria"]);
const targetCommunes = new Set(["santiago", "providencia", "las-condes", "nunoa", "vitacura", "la-florida", "maipu", "puente-alto", "san-miguel", "penalolen", "lo-barnechea", "independencia", "recoleta", "macul", "la-reina"]);

const routes = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const errors = [];
const warnings = [];
const urls = [];
const titles = new Map();
const descriptions = new Map();

function shouldIndex(route, parent) {
  const minimumContentScore = parent.minimumContentScore ?? 80;
  const faqs = route.faqs ?? parent.faqs ?? [];
  return route.editorialStatus === "approved" && route.indexPolicy === "index" && Number(route.contentScore ?? 0) >= minimumContentScore && faqs.length >= 2;
}

function rememberUnique(map, value, routePath, label) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    errors.push(`${routePath}: missing_${label}`);
    return;
  }
  if (map.has(normalized)) errors.push(`${routePath}: duplicate_${label}_with_${map.get(normalized)}`);
  map.set(normalized, routePath);
}

for (const service of routes.seoServices ?? []) {
  if (!targetServices.has(service.slug)) continue;
  const localByCommune = new Map((service.localPages ?? []).map((page) => [page.communeSlug, page]));

  for (const communeSlug of targetCommunes) {
    const localPage = localByCommune.get(communeSlug);
    const routePath = `/servicios/${service.slug}/${communeSlug}`;
    const canonicalUrl = `${siteUrl}${routePath}`;
    urls.push(canonicalUrl);

    if (!localPage) {
      errors.push(`${routePath}: missing_local_page`);
      continue;
    }

    if (!shouldIndex(localPage, service)) errors.push(`${routePath}: not_indexable_by_policy`);
    if (!sitemap.includes(`<loc>${canonicalUrl}</loc>`)) errors.push(`${routePath}: missing_from_sitemap`);
    if (!localPage.h1) errors.push(`${routePath}: missing_h1`);
    if (!localPage.intro || localPage.intro.length < 120) errors.push(`${routePath}: intro_too_short`);
    if (!localPage.trustText || localPage.trustText.length < 100) errors.push(`${routePath}: trust_text_too_short`);
    if (!localPage.ctaLabel) errors.push(`${routePath}: missing_cta_label`);
    if (!Array.isArray(localPage.localNotes) || localPage.localNotes.length < 2) errors.push(`${routePath}: missing_local_notes`);
    if (!Array.isArray(localPage.faqs) || localPage.faqs.length < 3) errors.push(`${routePath}: missing_local_faqs`);
    if (String(localPage.intro ?? "").includes("Cargando")) errors.push(`${routePath}: loading_text_in_content`);
    if (String(localPage.title ?? "").includes("Cargando")) errors.push(`${routePath}: loading_text_in_title`);

    rememberUnique(titles, localPage.title, routePath, "title");
    rememberUnique(descriptions, localPage.description, routePath, "description");
  }
}

for (const serviceSlug of targetServices) {
  if (!(routes.seoServices ?? []).some((service) => service.slug === serviceSlug)) errors.push(`/servicios/${serviceSlug}: missing_service`);
}

if (!sitemap.includes(`${siteUrl}/servicios`)) warnings.push("/servicios index page is not in sitemap");

console.log(`SEO local landings: ${urls.length} URL(s) expected.`);
console.log("Generated local URLs:");
for (const url of urls) console.log(`- ${url}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.log("\nErrors:");
  for (const error of errors) console.log(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nSEO local landing verification passed.");
}
