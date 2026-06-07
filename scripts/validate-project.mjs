import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function assertExists(path) {
  if (!existsSync(join(root, path))) fail(`Missing required file: ${path}`);
}

function assertNotExists(path) {
  if (existsSync(join(root, path))) fail(`Forbidden file exists: ${path}`);
}

function assertContains(path, text) {
  const content = readText(path);
  if (!content.includes(text)) fail(`${path} must contain: ${text}`);
}

function assertRegex(path, regex, label) {
  const content = readText(path);
  if (!regex.test(content)) fail(`${path} must contain ${label}`);
}

assertNotExists("public/_redirects");

assertExists("public/index.html");
assertExists("public/styles.css");
assertExists("public/app.js");
assertExists("wrangler.toml");
assertExists("package.json");

if (existsSync(join(root, "wrangler.toml"))) {
  assertRegex("wrangler.toml", /directory\s*=\s*["']\.\/public["']/, 'assets directory = "./public"');
}

if (existsSync(join(root, "package.json"))) {
  try {
    const packageJson = JSON.parse(readText("package.json"));
    const scripts = packageJson.scripts || {};
    for (const scriptName of ["build", "deploy", "validate"]) {
      if (!scripts[scriptName]) fail(`package.json missing scripts.${scriptName}`);
    }
  } catch (error) {
    fail(`package.json is not valid JSON: ${error.message}`);
  }
}

if (existsSync(join(root, "public/index.html"))) {
  for (const text of [
    "¿Qué necesitas resolver?",
    "Garantía OficiosPro",
    "Club Hogar",
    "Soluciones para empresas",
    "Postular como especialista",
  ]) {
    assertContains("public/index.html", text);
  }
}

if (existsSync(join(root, "public/app.js"))) {
  assertRegex("public/app.js", /const\s+specialists\s*=\s*\[/, "base specialists array");
  assertRegex("public/app.js", /const\s+defaultCategories\s*=\s*\[/, "base defaultCategories array");
  assertRegex("public/app.js", /const\s+defaultServices\s*=\s*\[/, "base defaultServices array");
}

if (failures.length) {
  console.error("Project validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Project validation passed.");
