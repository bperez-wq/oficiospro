import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function fullPath(path) {
  return join(root, path);
}

function readText(path) {
  return readFileSync(fullPath(path), "utf8");
}

function assertExists(path) {
  if (!existsSync(fullPath(path))) fail(`Missing required file: ${path}`);
}

function assertNotExists(path) {
  if (existsSync(fullPath(path))) fail(`Forbidden file exists: ${path}`);
}

function assertContains(path, text) {
  const content = readText(path);
  if (!content.includes(text)) fail(`${path} must contain: ${text}`);
}

function assertAnyContains(paths, text) {
  const found = paths.some((path) => existsSync(fullPath(path)) && readText(path).includes(text));
  if (!found) fail(`Expected one of ${paths.join(", ")} to contain: ${text}`);
}

function assertRegex(path, regex, label) {
  const content = readText(path);
  if (!regex.test(content)) fail(`${path} must contain ${label}`);
}

function countMatches(path, regex) {
  const content = readText(path);
  return [...content.matchAll(regex)].length;
}

assertNotExists("public/_redirects");

assertExists("wrangler.toml");
assertExists("package.json");

let assetDirectory = "";

if (existsSync(fullPath("wrangler.toml"))) {
  const wrangler = readText("wrangler.toml");
  const directoryMatch = wrangler.match(/directory\s*=\s*["']([^"']+)["']/);
  assetDirectory = directoryMatch?.[1] ?? "";

  if (!["./public", "./out"].includes(assetDirectory)) {
    fail('wrangler.toml assets directory must be "./public" or "./out"');
  }
}

let packageJson = null;

if (existsSync(fullPath("package.json"))) {
  try {
    packageJson = JSON.parse(readText("package.json"));
    const scripts = packageJson.scripts || {};
    for (const scriptName of ["build", "deploy", "validate"]) {
      if (!scripts[scriptName]) fail(`package.json missing scripts.${scriptName}`);
    }
  } catch (error) {
    fail(`package.json is not valid JSON: ${error.message}`);
  }
}

if (assetDirectory === "./public") {
  assertExists("public/index.html");
  assertExists("public/styles.css");
  assertExists("public/app.js");
  assertRegex("wrangler.toml", /directory\s*=\s*["']\.\/public["']/, 'assets directory = "./public"');

  for (const text of [
    "¿Qué necesitas resolver?",
    "Garantía OficiosPro",
    "Club Hogar",
    "Soluciones para empresas",
    "Postular como especialista",
  ]) {
    assertContains("public/index.html", text);
  }

  assertRegex("public/app.js", /const\s+specialists\s*=\s*\[/, "base specialists array");
  assertRegex("public/app.js", /const\s+defaultCategories\s*=\s*\[/, "base defaultCategories array");
  assertRegex("public/app.js", /const\s+defaultServices\s*=\s*\[/, "base defaultServices array");
}

if (assetDirectory === "./out") {
  assertNotExists("public/index.html");
  assertExists(".node-version");
  assertExists("next.config.ts");
  assertExists("scripts/clean-static-export.js");
  assertExists("src/app/page.tsx");
  assertExists("src/app/globals.css");
  assertExists("src/components/HeroSearchPanel.tsx");
  assertExists("src/components/RegionCommuneSelect.tsx");
  assertExists("src/data/chileCommunes.ts");
  assertExists("src/data/serviceCatalog.ts");
  assertExists("src/data/marketplace.ts");
  assertExists("src/data/mock.ts");
  assertExists("src/lib/storage.ts");
  assertExists("worker/index.ts");

  assertRegex("wrangler.toml", /directory\s*=\s*["']\.\/out["']/, 'assets directory = "./out"');
  assertRegex("wrangler.toml", /binding\s*=\s*["']ASSETS["']/, "ASSETS binding for Worker static assets");
  assertRegex("next.config.ts", /output\s*:\s*["']export["']/, 'Next static export output = "export"');

  if (packageJson) {
    if (!/\bnext\s+build\b/.test(packageJson.scripts?.build ?? "")) fail('package.json scripts.build must run "next build" for ./out deployments');
    if (!/\bwrangler\s+deploy\b/.test(packageJson.scripts?.deploy ?? "")) fail('package.json scripts.deploy must run "wrangler deploy"');
  }

  for (const text of [
    "¿Qué necesitas resolver?",
    "Garantía OficiosPro",
    "Club Hogar",
    "Soluciones para empresas",
    "Postular como especialista",
  ]) {
    assertAnyContains(["src/app/page.tsx", "src/components/HeroSearchPanel.tsx", "src/components/Footer.tsx"], text);
  }

  assertRegex("src/data/chileCommunes.ts", /export\s+const\s+chileCommunes\s*:/, "chileCommunes dataset");
  assertRegex("src/data/chileCommunes.ts", /export\s+function\s+getRegions\s*\(/, "getRegions helper");
  assertRegex("src/data/chileCommunes.ts", /export\s+function\s+getCommunesByRegion\s*\(/, "getCommunesByRegion helper");
  assertRegex("src/data/chileCommunes.ts", /export\s+function\s+getCommuneByCode\s*\(/, "getCommuneByCode helper");
  if (countMatches("src/data/chileCommunes.ts", /"code"\s*:/g) <= 300) fail("src/data/chileCommunes.ts must keep more than 300 communes available");
  for (const commune of ["Las Condes", "Providencia", "Ñuñoa", "Vitacura", "Santiago", "La Florida", "Maipú", "Valparaíso", "Concepción"]) {
    assertContains("src/data/chileCommunes.ts", commune);
  }
  assertRegex("src/components/RegionCommuneSelect.tsx", /disabled=\{!hasSpecificRegion\}/, "disabled commune select until a specific region is selected");
  assertRegex("src/lib/catalog.ts", /communesForRegion[\s\S]*getCommunesByRegion/, "communesForRegion helper using getCommunesByRegion");

  assertRegex("src/data/serviceCatalog.ts", /export\s+const\s+nationalServiceTypes\s*:/, "national service type catalog");
  assertRegex("src/data/marketplace.ts", /export\s+const\s+serviceTypes\s*:/, "serviceTypes export");
  assertRegex("src/data/marketplace.ts", /export\s+const\s+subscriptionPlans\s*:/, "subscriptionPlans export");
  assertRegex("src/data/marketplace.ts", /export\s+const\s+marketplaceCategories\s*:/, "marketplaceCategories export");
  assertRegex("src/data/marketplace.ts", /export\s+const\s+nationalCoverageStats\s*=/, "nationalCoverageStats export");
  assertRegex("src/data/marketplace.ts", /export\s+const\s+defaultCommercialConfig\s*:/, "defaultCommercialConfig export");

  assertRegex("src/data/mock.ts", /const\s+baseSpecialists\s*:/, "baseSpecialists data");
  assertRegex("src/data/mock.ts", /const\s+generatedSpecialists\s*:/, "generatedSpecialists data");
  assertRegex("src/data/mock.ts", /export\s+const\s+specialists\s*:/, "specialists export");
  assertRegex("src/data/mock.ts", /export\s+const\s+workStories\s*:/, "workStories export");
  assertRegex("src/data/mock.ts", /export\s+const\s+testimonials\s*=/, "testimonials export");
  assertRegex("src/data/mock.ts", /export\s+const\s+defaultBookings\s*:/, "defaultBookings export");
  assertRegex("src/data/mock.ts", /export\s+const\s+defaultTransactions\s*:/, "defaultTransactions export");
  assertRegex("src/data/mock.ts", /export\s+const\s+companyDashboard\s*=/, "companyDashboard export");

  assertRegex("src/lib/storage.ts", /oficiospro\.creditsWallet/, "credits wallet storage");
  assertRegex("src/lib/storage.ts", /oficiospro\.bookings/, "bookings storage");
  assertRegex("src/lib/storage.ts", /oficiospro\.companyRequests/, "company request storage");
  assertRegex("src/lib/storage.ts", /pendingServiceRequests/, "pending service requests storage");
}

if (failures.length) {
  console.error("Project validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Project validation passed.");
