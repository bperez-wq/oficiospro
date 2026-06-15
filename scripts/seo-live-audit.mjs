import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
const routesPath = path.join(rootDir, "src", "data", "seoRoutesData.json");

const defaultBaseUrl = "https://www.oficiospro.cl";
const baseUrl = (process.env.SEO_LIVE_AUDIT_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
const sitemapUrl = process.env.SEO_LIVE_AUDIT_SITEMAP_URL || `${baseUrl}/sitemap.xml`;
const source = process.env.SEO_LIVE_AUDIT_SOURCE || "remote";
const limit = Number.parseInt(process.env.SEO_LIVE_AUDIT_LIMIT || "", 10);

const privatePatterns = [
  /\/admin(\/|$)/,
  /\/api(\/|$)/,
  /\/checkout(\/|$)/,
  /\/bolsa(\/|$)/,
  /\/login(\/|$)/,
  /\/dashboard-/,
  /\/agenda-especialista(\/|$)/,
];

const seoPathPatterns = [/^\/servicios\//, /^\/soluciones\//, /^\/trabajos\//, /^\/empresas\/[^/]+$/, /^\/comunidades\//];
const legalPathPatterns = [/^\/terminos\/?$/, /^\/privacidad\/?$/];

const routesData = JSON.parse(fs.readFileSync(routesPath, "utf8"));

function extractUrlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function normalizeUrl(value) {
  const url = new URL(value, baseUrl);
  const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
  return `${url.origin}${pathname}`;
}

function normalizePath(value) {
  const url = new URL(value, baseUrl);
  return url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
}

async function readSitemap() {
  if (source === "local") {
    return fs.readFileSync(sitemapPath, "utf8");
  }

  const response = await fetch(sitemapUrl, { headers: { "user-agent": "OficiosPro SEO live audit" } });
  if (!response.ok) throw new Error(`No se pudo leer sitemap remoto ${sitemapUrl}: ${response.status}`);
  return response.text();
}

async function fetchPage(url) {
  const response = await fetch(url, { headers: { "user-agent": "OficiosPro SEO live audit" } });
  const html = await response.text();
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    html,
  };
}

function getAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1]?.trim() ?? "";
}

function extractTitle(html) {
  return cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
}

function extractMeta(html, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((candidate) => getAttr(candidate, "name").toLowerCase() === name.toLowerCase());
  return tag ? getAttr(tag, "content") : "";
}

function extractCanonical(html) {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((candidate) => getAttr(candidate, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  return tag ? getAttr(tag, "href") : "";
}

function extractH1(html) {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => cleanText(stripTags(match[1])));
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleWordCount(html) {
  const text = cleanText(stripTags(html));
  return text ? text.split(/\s+/).length : 0;
}

function hasCta(html) {
  return /Buscar especialistas|Solicitar|Postular|Crear perfil|Cotizar|Reservar|Hablar con ventas|Solicitar contacto|Crear perfil fundador|Ver busqueda filtrada|Ver búsqueda filtrada|Agregar a la Bolsa/i.test(
    cleanText(stripTags(html)),
  );
}

function hasFaq(html) {
  return /Preguntas frecuentes|FAQPage|<details\b/i.test(html);
}

function hasJsonLd(html) {
  return /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

function isSeoPath(pathname) {
  return seoPathPatterns.some((pattern) => pattern.test(pathname));
}

function isLegalPath(pathname) {
  return legalPathPatterns.some((pattern) => pattern.test(pathname));
}

function requiresFaq(pathname) {
  return isSeoPath(pathname) || pathname === "/faq";
}

function requiresJsonLd(pathname) {
  return isSeoPath(pathname);
}

function requiresCta(pathname) {
  return !isLegalPath(pathname);
}

function contentQualityScore(result) {
  const pathname = normalizePath(result.requestedUrl);
  const wordThreshold = isSeoPath(pathname) ? 450 : isLegalPath(pathname) ? 180 : 300;
  const titleOk = result.title.length >= 20 && result.title.length <= 90;
  const descriptionOk = result.description.length >= 70 && result.description.length <= 180;
  const canonicalOk = Boolean(result.canonical);
  const h1Ok = result.h1.length === 1 && result.h1[0].length >= 12;
  const ctaOk = !requiresCta(pathname) || result.hasCta;
  const faqOk = !requiresFaq(pathname) || result.hasFaq;
  const jsonLdOk = !requiresJsonLd(pathname) || result.hasJsonLd;
  const wordsOk = result.wordCount >= wordThreshold;
  const robotsOk = !/noindex/i.test(result.robots);

  const score = [
    result.ok ? 15 : 0,
    titleOk ? 10 : 0,
    descriptionOk ? 12 : 0,
    canonicalOk ? 10 : 0,
    h1Ok ? 10 : 0,
    ctaOk ? 10 : 0,
    faqOk ? 10 : 0,
    jsonLdOk ? 8 : 0,
    wordsOk ? 15 : Math.round((Math.max(0, result.wordCount) / wordThreshold) * 15),
    robotsOk ? 10 : 0,
  ].reduce((sum, value) => sum + value, 0);

  return Math.min(100, score);
}

function expectedIndexablePaths() {
  const paths = new Set();
  for (const service of routesData.seoServices) {
    if (shouldIndex(service)) paths.add(`/servicios/${service.slug}`);
    for (const localPage of service.localPages ?? []) {
      if (shouldIndex(localPage, service)) paths.add(`/servicios/${service.slug}/${localPage.communeSlug}`);
    }
  }
  for (const problem of routesData.seoProblems) {
    for (const localPage of problem.localPages ?? []) {
      if (shouldIndex(localPage, problem)) paths.add(`/soluciones/${problem.slug}/${localPage.communeSlug}`);
    }
  }
  for (const page of routesData.seoWorkerAcquisitionPages) {
    if (shouldIndex(page)) paths.add(`/trabajos/${page.slug}`);
  }
  for (const segment of routesData.seoBusinessSegments) {
    if (shouldIndex(segment)) paths.add(`/empresas/${segment.slug}`);
  }
  for (const service of routesData.seoCommunityServices) {
    if (shouldIndex(service)) paths.add(`/comunidades/${service.slug}`);
  }
  return paths;
}

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

function classify(result) {
  const pathname = normalizePath(result.requestedUrl);
  const errors = [];
  const warnings = [];
  const requestedNormalized = normalizeUrl(result.requestedUrl);
  const finalNormalized = normalizeUrl(result.finalUrl || result.requestedUrl);

  if (!result.ok) errors.push(`status_${result.status}`);
  if (requestedNormalized !== finalNormalized) warnings.push(`redirect_to_${finalNormalized}`);
  if (privatePatterns.some((pattern) => pattern.test(pathname))) errors.push("private_url_in_sitemap");
  if (/noindex/i.test(result.robots)) errors.push("noindex_in_sitemap");
  if (!result.title) errors.push("missing_title");
  if (!result.description) errors.push("missing_description");
  if (!result.canonical) warnings.push("missing_canonical");
  if (result.canonical && normalizeUrl(result.canonical) !== requestedNormalized) warnings.push(`canonical_mismatch_${normalizeUrl(result.canonical)}`);
  if (result.h1.length !== 1) warnings.push(`h1_count_${result.h1.length}`);
  if (requiresCta(pathname) && !result.hasCta) warnings.push("missing_cta");
  if (requiresFaq(pathname) && !result.hasFaq) warnings.push("missing_faq");
  if (requiresJsonLd(pathname) && !result.hasJsonLd) warnings.push("missing_json_ld");
  if (result.qualityScore < 70) errors.push(`quality_score_${result.qualityScore}`);
  else if (result.qualityScore < 85) warnings.push(`quality_score_${result.qualityScore}`);

  return { errors, warnings };
}

const sitemapXml = await readSitemap();
let urls = extractUrlsFromSitemap(sitemapXml);
if (Number.isFinite(limit) && limit > 0) urls = urls.slice(0, limit);

const sitemapPaths = new Set(urls.map(normalizePath));
const expectedPaths = expectedIndexablePaths();
const missingFromSitemap = [...expectedPaths].filter((routePath) => !sitemapPaths.has(routePath));

const titleMap = new Map();
const descriptionMap = new Map();
const rows = [];

for (const url of urls) {
  const fetched = await fetchPage(url);
  const result = {
    ...fetched,
    title: extractTitle(fetched.html),
    description: extractMeta(fetched.html, "description"),
    canonical: extractCanonical(fetched.html),
    robots: extractMeta(fetched.html, "robots"),
    h1: extractH1(fetched.html),
    hasCta: hasCta(fetched.html),
    hasFaq: hasFaq(fetched.html),
    hasJsonLd: hasJsonLd(fetched.html),
    wordCount: visibleWordCount(fetched.html),
  };
  result.qualityScore = contentQualityScore(result);
  const classification = classify(result);
  result.errors = classification.errors;
  result.warnings = classification.warnings;

  if (result.title) {
    const previous = titleMap.get(result.title);
    if (previous) result.warnings.push(`duplicate_title_with_${previous}`);
    else titleMap.set(result.title, normalizePath(url));
  }
  if (result.description) {
    const previous = descriptionMap.get(result.description);
    if (previous) result.warnings.push(`duplicate_description_with_${previous}`);
    else descriptionMap.set(result.description, normalizePath(url));
  }

  rows.push(result);
}

for (const routePath of missingFromSitemap) {
  rows.push({
    requestedUrl: `${baseUrl}${routePath}`,
    finalUrl: "",
    status: 0,
    ok: false,
    title: "",
    description: "",
    canonical: "",
    robots: "",
    h1: [],
    hasCta: false,
    hasFaq: false,
    hasJsonLd: false,
    wordCount: 0,
    qualityScore: 0,
    errors: ["indexable_absent_from_sitemap"],
    warnings: [],
  });
}

const okRows = rows.filter((row) => row.errors.length === 0 && row.warnings.length === 0);
const warningRows = rows.filter((row) => row.errors.length === 0 && row.warnings.length > 0);
const errorRows = rows.filter((row) => row.errors.length > 0);

console.log(`SEO live audit against ${source === "local" ? "local sitemap" : sitemapUrl}`);
console.log(`Checked ${urls.length} sitemap URL(s). OK=${okRows.length} warning=${warningRows.length} error=${errorRows.length}`);

function printRows(label, list) {
  if (!list.length) return;
  console.log(`\n${label}:`);
  for (const row of list) {
    const routePath = normalizePath(row.requestedUrl);
    const notes = [...row.errors, ...row.warnings].join(", ") || "ok";
    console.log(`- ${routePath} | status=${row.status} | score=${row.qualityScore} | title="${row.title || "-"}" | ${notes}`);
  }
}

printRows("OK", okRows);
printRows("Warnings", warningRows);
printRows("Errors", errorRows);

if (errorRows.length) process.exitCode = 1;
