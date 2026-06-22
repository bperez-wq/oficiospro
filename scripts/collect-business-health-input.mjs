import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { businessHealthEndpoints, collectLiveBusinessHealthSnapshot, safeInputSnapshot } from "./business-health-snapshot.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const inputDir = path.join(rootDir, "reports", "business-health", "input");
const defaultOutputPath = path.join(inputDir, "latest.json");
const outputPath = process.env.BUSINESS_HEALTH_OUTPUT ? path.resolve(process.env.BUSINESS_HEALTH_OUTPUT) : defaultOutputPath;
const baseUrl = process.env.BUSINESS_HEALTH_BASE_URL || process.env.APP_BASE_URL || "";
const adminToken = process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || "";

if (!baseUrl || !adminToken) {
  console.error("Missing BUSINESS_HEALTH_BASE_URL/APP_BASE_URL or ADMIN_TOKEN/ADMIN_API_TOKEN.");
  console.error("Example PowerShell:");
  console.error('$env:APP_BASE_URL="https://www.oficiospro.cl"');
  console.error('$env:ADMIN_TOKEN="TOKEN_ADMIN_REAL"');
  console.error("node scripts\\collect-business-health-input.mjs");
  process.exit(1);
}

if (!isInside(rootDir, outputPath)) {
  console.error("BUSINESS_HEALTH_OUTPUT must stay inside the OficiosPro repository.");
  process.exit(1);
}

console.log(`Collecting aggregate business health input from ${new URL(baseUrl).origin}`);
console.log(`Endpoints: ${Object.keys(businessHealthEndpoints).join(", ")}`);
console.log("No admin token, raw rows or personal data will be written.");

const snapshot = safeInputSnapshot(await collectLiveBusinessHealthSnapshot({ baseUrl, adminToken }));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`Business health input written: ${path.relative(rootDir, outputPath)}`);
console.log(`Metrics: ${Object.keys(snapshot.metrics).length}`);
console.log("Next: node scripts\\generate-business-health-report.mjs");

function isInside(parentDir, childPath) {
  const relative = path.relative(parentDir, childPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
