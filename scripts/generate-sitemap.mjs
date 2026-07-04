import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "seoRoutesData.json");
const guidesDataPath = path.join(rootDir, "src", "data", "seoGuidesData.json");
const outputPath = path.join(rootDir, "public", "sitemap.xml");
const siteUrl = "https://www.oficiospro.cl";

const routes = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const guidesData = JSON.parse(fs.readFileSync(guidesDataPath, "utf8"));

const publicBaseRoutes = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/especialistas", priority: 0.9, changefreq: "weekly" },
  { path: "/servicios", priority: 0.86, changefreq: "weekly" },
  { path: "/club-hogar", priority: 0.78, changefreq: "monthly" },
  { path: "/empresas", priority: 0.78, changefreq: "monthly" },
  { path: "/comunidades", priority: 0.72, changefreq: "monthly" },
  { path: "/registro-especialista", priority: 0.74, changefreq: "monthly" },
  { path: "/especialistas-fundadores", priority: 0.72, changefreq: "monthly" },
  { path: "/instituciones", priority: 0.58, changefreq: "monthly" },
  { path: "/referidos/especialistas", priority: 0.46, changefreq: "monthly" },
  { path: "/contacto", priority: 0.62, changefreq: "monthly" },
  { path: "/faq", priority: 0.55, changefreq: "monthly" },
  { path: "/soporte", priority: 0.52, changefreq: "monthly" },
  { path: "/impacto", priority: 0.5, changefreq: "monthly" },
  { path: "/piloto", priority: 0.5, changefreq: "monthly" },
  { path: "/terminos", priority: 0.25, changefreq: "yearly" },
  { path: "/privacidad", priority: 0.25, changefreq: "yearly" },
];

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

function pushUrl(urls, { path: routePath, priority = 0.5, lastmod, changefreq = "monthly" }) {
  if (!routePath.startsWith("/")) throw new Error(`Route must start with /: ${routePath}`);
  if (routePath.includes("?")) throw new Error(`Query param routes are not allowed in sitemap: ${routePath}`);
  if (urls.some((url) => url.path === routePath)) return;
  urls.push({ path: routePath, priority, lastmod, changefreq });
}

const urls = [];
publicBaseRoutes.forEach((route) => pushUrl(urls, route));

for (const service of routes.seoServices) {
  if (shouldIndex(service)) {
    pushUrl(urls, {
      path: `/servicios/${service.slug}`,
      priority: service.priority,
      lastmod: service.lastReviewedAt,
      changefreq: "monthly",
    });
  }

  for (const localPage of service.localPages ?? []) {
    if (!shouldIndex(localPage, service)) continue;
    pushUrl(urls, {
      path: `/servicios/${service.slug}/${localPage.communeSlug}`,
      priority: Math.max(0.45, service.priority - 0.08),
      lastmod: service.lastReviewedAt,
      changefreq: "monthly",
    });
  }
}

for (const problem of routes.seoProblems) {
  for (const localPage of problem.localPages ?? []) {
    if (!shouldIndex(localPage, problem)) continue;
    pushUrl(urls, {
      path: `/soluciones/${problem.slug}/${localPage.communeSlug}`,
      priority: problem.priority,
      lastmod: problem.lastReviewedAt,
      changefreq: "monthly",
    });
  }
}

for (const page of routes.seoWorkerAcquisitionPages) {
  if (!shouldIndex(page)) continue;
  pushUrl(urls, {
    path: `/trabajos/${page.slug}`,
    priority: page.priority,
    lastmod: page.lastReviewedAt,
    changefreq: "monthly",
  });
}

for (const segment of routes.seoBusinessSegments) {
  if (!shouldIndex(segment)) continue;
  pushUrl(urls, {
    path: `/empresas/${segment.slug}`,
    priority: segment.priority,
    lastmod: segment.lastReviewedAt,
    changefreq: "monthly",
  });
}

// Guias editoriales (/guias/[slug]): solo approved con revision humana registrada.
for (const guide of guidesData.guides ?? []) {
  if (guide.editorialStatus !== "approved" || !guide.reviewedBy || !guide.reviewedAt) continue;
  pushUrl(urls, {
    path: `/guias/${guide.slug}`,
    priority: 0.55,
    lastmod: guide.lastUpdatedAt,
    changefreq: "monthly",
  });
}

for (const service of routes.seoCommunityServices) {
  if (!shouldIndex(service)) continue;
  pushUrl(urls, {
    path: `/comunidades/${service.slug}`,
    priority: service.priority,
    lastmod: service.lastReviewedAt,
    changefreq: "monthly",
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const lines = [
      "  <url>",
      `    <loc>${escapeXml(`${siteUrl}${url.path}`)}</loc>`,
    ];
    if (url.lastmod) lines.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
    lines.push(
      `    <changefreq>${escapeXml(url.changefreq)}</changefreq>`,
      `    <priority>${Number(url.priority).toFixed(2)}</priority>`,
      "  </url>",
    );
    return lines.join("\n");
  })
  .join("\n")}
</urlset>
`;

fs.writeFileSync(outputPath, xml);
console.log(`Generated ${path.relative(rootDir, outputPath)} with ${urls.length} URLs.`);
