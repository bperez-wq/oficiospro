import { execFileSync } from "node:child_process";

const strict = process.argv.includes("--strict");
const allowedDirty = new Set(
  readListEnv("KAIZEN_ALLOWED_DIRTY")
    .concat(readListEnv("KAIZEN_ALLOWED_STAGED"))
    .map(normalizePath),
);

const branch = git(["branch", "--show-current"]).trim() || "(detached)";
const log = git(["log", "--oneline", "-5"]).trim();
const statusLines = git(["status", "--porcelain=v1"]).split(/\r?\n/).filter(Boolean);
const entries = statusLines.map(parseStatusLine);
const staged = entries.filter((entry) => entry.indexStatus !== " " && entry.indexStatus !== "?");
const dirty = entries.filter((entry) => entry.worktreeStatus !== " " || entry.indexStatus === "?");
const warnings = [];
const errors = [];

for (const entry of entries) {
  const normalized = normalizePath(entry.path);
  const allowed = allowedDirty.has(normalized);

  if (isGeneratedPath(normalized)) {
    pushRisk(entry, allowed, "generated_or_local_artifact", errors);
  }

  if (isAccidentalShellArtifact(normalized)) {
    pushRisk(entry, allowed, "accidental_shell_artifact", errors);
  }

  if (isCriticalPath(normalized)) {
    pushRisk(entry, allowed, "critical_module_changed", warnings);
  }

  if (entry.indexStatus !== " " && entry.indexStatus !== "?" && !allowed) {
    warnings.push(`${entry.path} is staged. Confirm it belongs to the current Kaizen cycle.`);
  }
}

console.log("Kaizen worktree audit");
console.log(`Branch: ${branch}`);
console.log("");
console.log("Last commits:");
console.log(log || "- no commits");
console.log("");
console.log(`Changed files: ${entries.length}`);
console.log(`Staged files: ${staged.length}`);

if (entries.length) {
  console.log("");
  console.log("Worktree:");
  for (const entry of entries) {
    console.log(`- ${entry.rawStatus} ${entry.path}`);
  }
}

printSection("Warnings", warnings);
printSection("Errors", errors);

if (!entries.length) {
  console.log("");
  console.log("OK: clean worktree.");
} else if (!errors.length && !strict) {
  console.log("");
  console.log("OK: audit completed with no blocking errors. Review warnings before staging.");
}

if (strict && (warnings.length || errors.length)) {
  console.error("");
  console.error("Strict mode failed. Set KAIZEN_ALLOWED_DIRTY for intentional files or clean unrelated changes.");
  process.exit(1);
}

if (errors.length) {
  console.error("");
  console.error("Blocking artifacts detected. Do not use git add .");
  if (strict) process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function parseStatusLine(line) {
  const indexStatus = line[0];
  const worktreeStatus = line[1];
  const rawPath = line.slice(3);
  const path = unquoteGitPath(rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath);
  return {
    indexStatus,
    worktreeStatus,
    rawStatus: line.slice(0, 2),
    path,
  };
}

function unquoteGitPath(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) return trimmed;
  try {
    return JSON.parse(trimmed.replace(/\\/g, "\\\\"));
  } catch {
    return trimmed.slice(1, -1);
  }
}

function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/^"\s*|\s*"$/g, "");
}

function readListEnv(name) {
  return String(process.env[name] || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isGeneratedPath(filePath) {
  return (
    filePath === "tsconfig.tsbuildinfo" ||
    filePath.startsWith(".next/") ||
    filePath.startsWith("out/") ||
    filePath.startsWith("work/") ||
    filePath.startsWith("node_modules/") ||
    filePath.endsWith(".tsbuildinfo")
  );
}

function isAccidentalShellArtifact(filePath) {
  const lower = filePath.toLowerCase();
  return lower === "_synctest.txt" || lower === "tatus --short" || lower === "ersbenjaminoficiosprooficiospro";
}

function isCriticalPath(filePath) {
  return (
    filePath === "worker/index.ts" ||
    filePath === "wrangler.toml" ||
    filePath.startsWith("migrations/") ||
    filePath.startsWith("src/lib/payments/") ||
    filePath.includes("mercado")
  );
}

function pushRisk(entry, allowed, code, bucket) {
  if (allowed) return;
  bucket.push(`${entry.path}: ${code}`);
}

function printSection(title, items) {
  console.log("");
  console.log(`${title}:`);
  if (!items.length) {
    console.log("- none");
    return;
  }
  for (const item of items) console.log(`- ${item}`);
}
