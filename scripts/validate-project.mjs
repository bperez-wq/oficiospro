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

function assertPricingMath() {
  const config = {
    customerCreditValueCLP: 1000,
    platformFeePercent: 0.18,
    paymentFeePercent: 0.035,
    riskBufferPercent: 0.04,
    fixedServiceFeeCLP: 2500,
    emergencyMultiplier: 1.35,
    minimumClientCredits: 12,
    creditRoundingStep: 2,
  };
  const roundCredits = (credits, step) => Math.ceil(credits / step) * step;
  const calculateCredits = (payout, emergency = false) => {
    const estimated =
      payout +
      payout * (config.platformFeePercent + config.paymentFeePercent + config.riskBufferPercent) +
      config.fixedServiceFeeCLP;
    const adjusted = emergency ? estimated * config.emergencyMultiplier : estimated;
    return Math.max(config.minimumClientCredits, roundCredits(adjusted / config.customerCreditValueCLP, config.creditRoundingStep));
  };
  const baseCredits = calculateCredits(10000);
  const emergencyCredits = calculateCredits(10000, true);
  const margin = baseCredits * config.customerCreditValueCLP - 10000;

  if (baseCredits <= 0) fail("Pricing validation: $10.000 CLP must produce credits greater than 0");
  if (baseCredits < config.minimumClientCredits) fail("Pricing validation: credits must respect minimumClientCredits");
  if (baseCredits % config.creditRoundingStep !== 0) fail("Pricing validation: credits must round by creditRoundingStep");
  if (emergencyCredits <= baseCredits) fail("Pricing validation: emergency must increase credits");
  if (!Number.isFinite(margin)) fail("Pricing validation: estimated margin must be calculable");
}

function assertNoPublicInternalPricingLeak() {
  const publicPaths = [
    "src/app/page.tsx",
    "src/components/SpecialistCard.tsx",
    "src/components/SpecialistsExplorer.tsx",
    "src/app/especialistas/[id]/page.tsx",
  ];
  const forbidden = [
    "specialistExpectedPayoutCLP",
    "specialistApprovedPayoutCLP",
    "Payout especialista",
    "Tarifa esperada especialista CLP",
    "platformFeePercent",
    "paymentFeePercent",
    "riskBufferPercent",
    "customerCreditValueCLP",
  ];
  for (const path of publicPaths) {
    if (!existsSync(fullPath(path))) continue;
    const content = readText(path);
    for (const text of forbidden) {
      if (content.includes(text)) fail(`Public pricing leak: ${path} must not expose ${text}`);
    }
  }
}

assertNotExists("public/_redirects");
assertPricingMath();

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
  assertExists("src/components/AvailabilityBadge.tsx");
  assertExists("src/components/AvailabilityCalendar.tsx");
  assertExists("src/components/BookingDrawer.tsx");
  assertExists("src/components/InstantContactPanel.tsx");
  assertExists("src/components/SpecialistAgendaPanel.tsx");
  assertExists("src/components/TimeSlotPicker.tsx");
  assertExists("src/data/chileCommunes.ts");
  assertExists("src/data/availability.ts");
  assertExists("src/data/serviceCatalog.ts");
  assertExists("src/data/marketplace.ts");
  assertExists("src/data/mock.ts");
  assertExists("src/lib/availability.ts");
  assertExists("src/lib/bookingStorage.ts");
  assertExists("src/lib/storage.ts");
  assertExists("src/app/agenda-especialista/page.tsx");
  assertExists("src/app/contacto/page.tsx");
  assertExists("src/app/terminos/page.tsx");
  assertExists("src/app/privacidad/page.tsx");
  assertExists("src/app/faq/page.tsx");
  assertExists("worker/index.ts");
  assertExists("migrations/0001_leads.sql");
  assertExists("src/lib/leads.ts");
  assertExists("src/lib/leadClient.ts");
  assertExists("src/data/commercialConfig.ts");
  assertExists("src/data/flexiblePricing.ts");
  assertExists("src/lib/pricing.ts");
  assertExists("src/lib/flexiblePricing.ts");
  assertExists("src/components/AdminPricingPanel.tsx");
  assertExists("src/components/PostulationToast.tsx");
  assertExists("docs/leads-and-email.md");

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

  assertRegex("src/data/availability.ts", /export\s+const\s+availabilityProfiles\s*:/, "availabilityProfiles export");
  assertRegex("src/data/availability.ts", /blockedSlots\s*:/, "blocked slots data");
  assertRegex("src/lib/availability.ts", /export\s+function\s+getSlotsForDate\s*\(/, "getSlotsForDate helper");
  assertRegex("src/lib/availability.ts", /export\s+function\s+getAvailabilitySummary\s*\(/, "getAvailabilitySummary helper");
  assertRegex("src/lib/bookingStorage.ts", /oficiospro\.bookingRequests/, "local booking request storage");
  assertRegex("src/lib/bookingStorage.ts", /export\s+function\s+addBlockedSlot\s*\(/, "addBlockedSlot helper");
  assertRegex("src/lib/bookingStorage.ts", /export\s+function\s+createBookingRequest\s*\(/, "createBookingRequest helper");
  assertContains("src/components/BookingDrawer.tsx", "Horario solicitado. Los creditos iniciales quedan retenidos hasta confirmar el servicio.");
  assertContains("src/components/TimeSlotPicker.tsx", "Sin horarios visibles esta semana. Solicita contacto y revisaremos disponibilidad.");
  assertContains("src/app/agenda-especialista/page.tsx", "Mi agenda OficiosPro");
  assertContains("src/app/page.tsx", "Ver cómo funcionará mi agenda");
  assertContains("migrations/0001_leads.sql", "CREATE TABLE IF NOT EXISTS lead_submissions");
  for (const endpoint of ["/api/leads", "/api/jobs/request", "/api/specialists/apply", "/api/companies/request", "/api/bookings/request", "/api/contact", "/api/admin/leads"]) {
    assertContains("worker/index.ts", endpoint);
  }
  assertContains("worker/index.ts", "database_not_configured");
  assertContains("worker/index.ts", "RESEND_API_KEY");
  assertContains("src/lib/leadClient.ts", "fetch(endpoint");
  assertContains("src/components/ConversionModal.tsx", "submitLead");
  assertContains("src/components/HeroSearchPanel.tsx", "submitLead");
  assertContains("src/components/BookingDrawer.tsx", "submitLead");
  assertContains("src/app/checkout/page.tsx", "payment_interest");
  assertContains("src/app/contacto/page.tsx", "bperez@oficiospro.cl");
  assertContains("src/components/Footer.tsx", "bperez@oficiospro.cl");
  assertContains("docs/leads-and-email.md", "LEADS_TO_EMAIL=bperez@oficiospro.cl");
  assertContains("src/components/Forms.tsx", "Tarifa esperada por servicio");
  assertContains("src/components/Forms.tsx", "No tengo certificaciones formales");
  assertContains("src/components/Forms.tsx", "Enviando...");
  assertContains("src/components/Forms.tsx", "specialist_application_submit");
  assertContains("src/components/Forms.tsx", "/?postulacion=recibida");
  assertContains("src/components/PostulationToast.tsx", "Postulación recibida");
  assertContains("src/data/commercialConfig.ts", "customerCreditValueCLP");
  assertContains("src/data/commercialConfig.ts", "certificationRequiredByCategory");
  assertContains("src/data/commercialConfig.ts", "subscriberDiscountCredits");
  assertContains("src/data/flexiblePricing.ts", "quote_required");
  assertContains("src/data/flexiblePricing.ts", "visit_then_quote");
  assertContains("src/data/flexiblePricing.ts", "defaultQuoteAgreements");
  assertContains("src/data/flexiblePricing.ts", "defaultAdditionalRequests");
  assertContains("src/lib/flexiblePricing.ts", "pricingSummary");
  assertContains("src/lib/flexiblePricing.ts", "creditsForInitialHold");
  assertContains("src/components/BookingDrawer.tsx", "quote_request_submit");
  assertContains("src/components/BookingDrawer.tsx", "Cotizacion solicitada");
  assertContains("src/components/Dashboards.tsx", "Cotizaciones y acuerdos");
  assertContains("src/components/Dashboards.tsx", "Propuestas y adicionales");
  assertContains("src/components/AdminPanel.tsx", "Tarifas, cotizaciones y negociación");
  assertContains("src/app/checkout/page.tsx", "quote_acceptance_hold");
  assertContains("src/app/checkout/page.tsx", "additional_work_hold");
  assertContains("src/components/AdminPricingPanel.tsx", "Multiplicadores por categoria");
  assertContains("src/components/AdminPricingPanel.tsx", "Multiplicadores por comuna");
  assertContains("src/components/AdminPricingPanel.tsx", "Certificacion requerida por categoria");
  assertNoPublicInternalPricingLeak();
  for (const fn of [
    "formatCLP",
    "normalizeCLPInput",
    "calculateClientCreditsFromSpecialistPayout",
    "estimateClientPriceCLP",
    "estimatePlatformMarginCLP",
    "applyEmergencyMultiplier",
    "roundCredits",
    "getCertificationRequirement",
  ]) {
    assertRegex("src/lib/pricing.ts", new RegExp(`export\\s+function\\s+${fn}\\s*\\(`), `${fn} pricing helper`);
  }
  assertContains("src/components/AdminPricingPanel.tsx", "Configuracion comercial interna");
  assertContains("src/components/AdminPanel.tsx", "Créditos cliente calculados");
  assertContains("worker/index.ts", "Nueva postulación de especialista en OficiosPro");
  assertContains("worker/index.ts", "calculatedClientCredits");
  if (readText("src/components/Forms.tsx").includes("Precio cliente en créditos")) {
    fail("Specialist form must not let specialists choose client credits");
  }
  if (readText("src/components/Forms.tsx").includes("Monto que cobra especialista CLP")) {
    fail("Specialist form must use 'Tarifa esperada por servicio' instead of old CLP label");
  }
  if (readText("src/components/ConversionModal.tsx").includes("Ej: Benjam") || readText("src/components/Forms.tsx").includes("Ej: Benjam")) {
    fail("Founder name must not be used as a default example placeholder");
  }
  if (readText("src/components/ConversionModal.tsx").includes("Pérez Peric") || readText("src/components/Forms.tsx").includes("Pérez Peric")) {
    fail("Founder surname must not be used as a default example placeholder");
  }

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
