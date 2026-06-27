import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeoLocalServiceRoutes, seoLocalCommunes, seoLocalServices } from "../src/data/seoLocal.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "seoRoutesData.json");

const routesData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function mergeBySlug(existing, incoming) {
  const map = new Map(existing.map((item) => [item.slug, item]));
  for (const item of incoming) map.set(item.slug, item);
  return [...map.values()];
}

const localServiceRoutes = buildSeoLocalServiceRoutes();
const orderedLocalServiceSlugs = new Set(seoLocalServices.map((service) => service.slug));
const otherServices = routesData.seoServices.filter((service) => !orderedLocalServiceSlugs.has(service.slug));

const nextRoutesData = {
  ...routesData,
  seoCommunes: mergeBySlug(routesData.seoCommunes ?? [], seoLocalCommunes),
  seoServices: [...localServiceRoutes, ...otherServices],
};

fs.writeFileSync(dataPath, `${JSON.stringify(nextRoutesData, null, 2)}\n`);

const localPagesCount = localServiceRoutes.reduce((count, service) => count + service.localPages.length, 0);
console.log(`Synced ${localServiceRoutes.length} local SEO services and ${localPagesCount} local pages into ${path.relative(rootDir, dataPath)}.`);
