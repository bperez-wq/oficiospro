const baseUrl = (process.env.APP_BASE_URL || process.env.PILOT_BASE_URL || "https://www.oficiospro.cl").replace(/\/+$/, "");
const adminToken = process.env.ADMIN_TOKEN || process.env.ADMIN_API_TOKEN || "";

const placeholderTokens = new Set([
  "",
  "TOKEN_ADMIN_REAL",
  "TU_TOKEN_REAL",
  "PEGA_AQUI_EL_TOKEN_REAL",
  "PEGA_AQUI_EL_MISMO_TOKEN_REAL",
]);

function isRealToken(value) {
  return Boolean(value && !placeholderTokens.has(value.trim()) && !value.includes("PEGA_AQUI") && !value.includes("TOKEN_REAL"));
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.admin && isRealToken(adminToken)) {
    headers.set("Authorization", `Bearer ${adminToken}`);
    headers.set("x-admin-token", adminToken);
  }
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    return {
      path,
      status: response.status,
      ok: response.ok && data.ok !== false,
      ms: Date.now() - started,
      data,
      error: data.error || (!response.ok ? `http_${response.status}` : ""),
    };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      ms: Date.now() - started,
      data: {},
      error: error instanceof Error ? error.message : "network_error",
    };
  }
}

function countRows(data, keys) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key].length;
  }
  return "-";
}

function printResult(label, result, keys = []) {
  const count = keys.length ? countRows(result.data, keys) : "-";
  const fields = [
    label.padEnd(30),
    result.path.padEnd(38),
    `status=${String(result.status).padEnd(3)}`,
    `ok=${String(result.ok).padEnd(5)}`,
    `count=${String(count).padEnd(4)}`,
    `ms=${String(result.ms).padEnd(5)}`,
  ];
  if (result.error) fields.push(`error=${result.error}`);
  console.log(fields.join(" | "));
}

console.log(`Backoffice data pipeline check for ${baseUrl}`);
console.log(isRealToken(adminToken) ? "Admin token: configured" : "Admin token: missing or placeholder; admin checks will be unauthorized.");
console.log("");

const checks = [
  ["health", () => request("/api/health"), []],
  ["admin leads", () => request("/api/admin/leads?limit=20", { admin: true }), ["leads"]],
  ["specialist applications", () => request("/api/admin/specialists?limit=20", { admin: true }), ["specialists"]],
  ["crm overview", () => request("/api/admin/crm/overview", { admin: true }), []],
  ["crm work queue", () => request("/api/admin/crm/work-queue?limit=20", { admin: true }), ["queue", "workQueue"]],
  ["crm reports", () => request("/api/admin/crm/reports", { admin: true }), []],
  ["conversion events", () => request("/api/admin/conversion-events?limit=20", { admin: true }), ["conversionEvents"]],
];

let failures = 0;
for (const [label, run, keys] of checks) {
  const result = await run();
  printResult(label, result, keys);
  if (!result.ok) failures += 1;
}

console.log("");
if (failures) {
  console.log(`Backoffice pipeline check finished with ${failures} failing check(s).`);
  process.exitCode = 1;
} else {
  console.log("Backoffice pipeline check passed.");
}
