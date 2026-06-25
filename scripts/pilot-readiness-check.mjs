import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const reportDate = process.env.PILOT_READINESS_DATE || new Date().toISOString().slice(0, 10);
const reportDir = path.join(rootDir, "reports", "pilot-readiness");
const outputPath = path.join(reportDir, `${reportDate}.md`);
const baseUrl = (process.env.PILOT_BASE_URL || process.env.APP_BASE_URL || process.env.TEST_BASE_URL || "https://www.oficiospro.cl").replace(/\/$/, "");
const adminTokenCheck = validateAdminToken(process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || "");
const adminToken = adminTokenCheck.ok ? adminTokenCheck.value : "";
const offline = process.argv.includes("--offline") || process.env.PILOT_READINESS_OFFLINE === "1";
const readinessRunId = runId();
const writeTestsEnabled = process.env.PILOT_READINESS_WRITE_TESTS === "1";

const publicChecks = [
  { label: "Home", path: "/", expect: "html", critical: true },
  { label: "Especialistas", path: "/especialistas", expect: "html", critical: true },
  { label: "Registro especialista", path: "/registro-especialista", expect: "html", critical: true },
  { label: "Especialistas fundadores", path: "/especialistas-fundadores", expect: "html", critical: true },
  { label: "Bolsa", path: "/bolsa", expect: "html", critical: true },
  { label: "Club Hogar", path: "/club-hogar", expect: "html", critical: false },
  { label: "Empresas", path: "/empresas", expect: "html", critical: false },
  { label: "Sitemap", path: "/sitemap.xml", expect: "xml", critical: true },
  { label: "Robots", path: "/robots.txt", expect: "text", critical: true },
];

const adminChecks = [
  { label: "Admin leads", path: "/api/admin/leads?limit=1", critical: true },
  { label: "CRM overview", path: "/api/admin/crm/overview", critical: true },
  { label: "CRM opportunities", path: "/api/admin/crm/opportunities?limit=1", critical: false },
  { label: "CRM tasks", path: "/api/admin/crm/tasks?limit=1", critical: false },
  { label: "Conversion events", path: "/api/admin/conversion-events?limit=1", critical: false },
];

const writeChecks = [
  {
    label: "Lead capture",
    path: "/api/leads",
    critical: true,
    body: {
      leadType: "customer_request",
      fullName: "Juan Perez",
      email: "juan.perez@example.com",
      phone: "+56 9 1234 5678",
      service: "Gasfiteria",
      problemDescription: "Pilot readiness check sin datos reales sensibles.",
      regionCode: "13",
      regionName: "Region Metropolitana",
      communeName: "Nunoa",
      source: "e2e_test",
      sourceComponent: "scripts/pilot-readiness-check.mjs",
      sourceButton: "pilot_readiness_check",
      isTest: true,
      payload: { source: "e2e_test", scenario: "pilot_readiness_check", isTest: true, testRunId: readinessRunId },
    },
  },
];

const results = [];

console.log(`Pilot readiness check for ${baseUrl}`);
console.log(offline ? "Offline mode: no network requests will be made." : "Live mode: public endpoints will be requested.");
console.log(adminToken ? "Admin token: configured for read-only admin checks." : `Admin token: ${adminTokenCheck.reason}; admin checks will be skipped.`);
console.log("");

if (offline) {
  for (const check of [...publicChecks, ...adminChecks, ...writeChecks]) {
    results.push({ group: groupFor(check), label: check.label, path: check.path, status: "offline", ok: true, critical: check.critical, note: "offline_check_skipped" });
  }
} else {
  for (const check of publicChecks) {
    results.push(await checkPublic(check));
  }

  if (adminToken) {
    for (const check of adminChecks) {
      results.push(await checkAdmin(check));
    }
  } else {
    for (const check of adminChecks) {
      results.push(skippedAdminResult(check, adminTokenCheck.reason));
    }
  }

  for (const check of writeChecks) {
    if (writeTestsEnabled && adminToken) {
      results.push(await checkWrite(check));
      results.push(await cleanupWriteTests());
    } else if (writeTestsEnabled && !adminToken) {
      results.push({ group: "write", label: check.label, path: check.path, status: "skipped", ok: false, critical: false, note: "real_admin_token_required_for_cleanup" });
    } else {
      results.push({ group: "write", label: check.label, path: check.path, status: "skipped", ok: true, critical: check.critical, note: "set PILOT_READINESS_WRITE_TESTS=1 to run marked e2e write test" });
    }
  }
}

const summary = summarize(results);
const report = renderReport(results, summary);
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Report: ${path.relative(rootDir, outputPath)}`);
console.log(`OK: ${summary.ok}`);
console.log(`Warnings: ${summary.warnings}`);
console.log(`Errors: ${summary.errors}`);

if (summary.errors) process.exit(1);

async function checkPublic(check) {
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}${check.path}`, { headers: { Accept: acceptHeader(check.expect) } });
    const text = await response.text().catch(() => "");
    const ok = response.ok && contentLooksValid(text, check.expect);
    return {
      group: "public",
      label: check.label,
      path: check.path,
      status: response.status,
      ok,
      critical: check.critical,
      durationMs: Date.now() - started,
      note: ok ? "" : invalidPublicNote(response, text, check.expect),
    };
  } catch (error) {
    return failureResult("public", check, error);
  }
}

async function checkAdmin(check) {
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "x-admin-token": adminToken,
      },
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && data.ok !== false;
    return {
      group: "admin",
      label: check.label,
      path: check.path,
      status: response.status,
      ok,
      critical: check.critical,
      durationMs: Date.now() - started,
      note: ok ? rowCountNote(data) : data.error || "admin_check_failed",
    };
  } catch (error) {
    return failureResult("admin", check, error);
  }
}

async function checkWrite(check) {
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.body),
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && data.ok !== false && data.stored !== false;
    return {
      group: "write",
      label: check.label,
      path: check.path,
      status: response.status,
      ok,
      critical: check.critical,
      durationMs: Date.now() - started,
      note: ok ? `stored=${Boolean(data.stored)} id=${data.id || "-"}` : data.error || "write_check_failed",
    };
  } catch (error) {
    return failureResult("write", check, error);
  }
}

async function cleanupWriteTests() {
  const started = Date.now();
  const path = "/api/admin/crm/cleanup-test-data";
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "x-admin-token": adminToken,
      },
      body: JSON.stringify({ source: "e2e_test", isTest: true, testRunId: readinessRunId }),
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && data.ok !== false;
    return {
      group: "cleanup",
      label: "Cleanup test data",
      path,
      status: response.status,
      ok,
      critical: false,
      durationMs: Date.now() - started,
      note: ok ? "test_data_cleanup_requested" : data.error || "cleanup_failed",
    };
  } catch (error) {
    return failureResult("cleanup", { label: "Cleanup test data", path, critical: false }, error);
  }
}

function renderReport(items, summary) {
  return `# Pilot readiness check - ${reportDate}

## 1. Summary

Base URL: ${baseUrl}

| Result | Count |
| --- | ---: |
| OK | ${summary.ok} |
| Warnings | ${summary.warnings} |
| Errors | ${summary.errors} |
| Skipped | ${summary.skipped} |

## 2. Checks

| Group | Check | Path | Status | Result | Duration | Note |
| --- | --- | --- | ---: | --- | ---: | --- |
${items.map((item) => `| ${item.group} | ${item.label} | \`${item.path}\` | ${item.status} | ${item.ok ? "ok" : item.critical ? "error" : "warning"} | ${item.durationMs ?? "-"} ms | ${escapeCell(item.note || "-")} |`).join("\n")}

## 3. Release Gate

${summary.errors ? "- BLOCKED: critical checks failed." : "- PASS: no critical check failed."}

## 4. Notes

- No secrets are written to this report.
- Write checks are disabled by default. Enable only when you intentionally want marked e2e data: \`PILOT_READINESS_WRITE_TESTS=1\`. A real admin token is required so the script can request cleanup after the write test.
- Admin checks require a real \`ADMIN_TOKEN\` or \`ADMIN_API_TOKEN\`. Placeholder values such as \`TU_TOKEN_REAL\` are skipped and reported as warnings.
- This script does not deploy, migrate D1, change payments, or modify production data unless write checks are explicitly enabled.
`;
}

function summarize(items) {
  return {
    ok: items.filter((item) => item.ok && item.status !== "skipped" && item.status !== "offline").length,
    warnings: items.filter((item) => !item.ok && !item.critical).length,
    errors: items.filter((item) => !item.ok && item.critical).length,
    skipped: items.filter((item) => item.status === "skipped" || item.status === "offline").length,
  };
}

function failureResult(group, check, error) {
  return {
    group,
    label: check.label,
    path: check.path,
    status: "network",
    ok: false,
    critical: check.critical,
    note: error instanceof Error ? error.message : "network_error",
  };
}

function skippedAdminResult(check, reason) {
  return {
    group: "admin",
    label: check.label,
    path: check.path,
    status: "skipped",
    ok: false,
    critical: false,
    note: `admin_check_skipped:${reason}`,
  };
}

function validateAdminToken(value) {
  const token = String(value || "").trim();
  if (!token) return { ok: false, value: "", reason: "missing" };

  const normalized = token.toLowerCase();
  const placeholderSignals = [
    "tu_token",
    "token_real",
    "valor_real",
    "pega_",
    "admin_token",
    "admin_api_token",
    "cambia_esta",
    "example",
    "xxxx",
  ];

  if (placeholderSignals.some((signal) => normalized.includes(signal))) {
    return { ok: false, value: "", reason: "placeholder_detected" };
  }

  return { ok: true, value: token, reason: "configured" };
}

function acceptHeader(expect) {
  if (expect === "xml") return "application/xml,text/xml,*/*";
  if (expect === "text") return "text/plain,*/*";
  return "text/html,*/*";
}

function contentLooksValid(text, expect) {
  if (!text) return false;
  if (expect === "xml") return text.includes("<urlset") || text.includes("<sitemapindex");
  if (expect === "text") return text.toLowerCase().includes("user-agent");
  return text.includes("<html") || text.includes("<!DOCTYPE html");
}

function invalidPublicNote(response, text, expect) {
  if (!response.ok) return `http_${response.status}`;
  if (!text) return "empty_response";
  return `unexpected_${expect}_content`;
}

function rowCountNote(data) {
  const key = Object.keys(data).find((item) => Array.isArray(data[item]));
  if (!key) return "ok";
  return `${key}=${data[key].length}`;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function groupFor(check) {
  if (adminChecks.includes(check)) return "admin";
  if (writeChecks.includes(check)) return "write";
  return "public";
}

function runId() {
  return `pilot_readiness_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;
}
