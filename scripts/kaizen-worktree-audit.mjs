import { execFileSync } from "node:child_process";

const requireClean = process.argv.includes("--require-clean") || process.env.KAIZEN_REQUIRE_CLEAN === "1";

const generatedOrLocalArtifacts = [
  /^node_modules\//,
  /^\.next\//,
  /^out\//,
  /^work\//,
  /^\.turbo\//,
  /^tsconfig\.tsbuildinfo$/,
  /^public\/_redirects$/,
];

const accidentalShellArtifacts = [
  /^_synctest\.txt$/,
  /^tatus --short$/,
  /^ersBenjaminoficiosprooficiospro$/,
  /^git$/,
  /^npm$/,
  /^node$/,
];

const branch = git(["branch", "--show-current"]).trim() || "(sin branch)";
const lastCommits = git(["log", "--oneline", "-5"]).trim();
const porcelain = git(["status", "--short"]).split(/\r?\n/).filter(Boolean);
const staged = git(["diff", "--cached", "--name-only"]).split(/\r?\n/).filter(Boolean);
const meaningfulChanges = porcelain.filter(meaningfulStatusLine);

const warnings = [];
const errors = [];

for (const line of porcelain) {
  const file = statusPath(line);
  if (!file) continue;
  const normalized = normalizePath(file);
  if (matchesAny(normalized, generatedOrLocalArtifacts)) errors.push(`${file}: generated_or_local_artifact`);
  if (matchesAny(normalized, accidentalShellArtifacts)) errors.push(`${file}: accidental_shell_artifact`);
}

for (const file of staged) {
  const normalized = normalizePath(file);
  if (matchesAny(normalized, generatedOrLocalArtifacts)) errors.push(`${file}: staged_generated_or_local_artifact`);
  if (matchesAny(normalized, accidentalShellArtifacts)) errors.push(`${file}: staged_accidental_shell_artifact`);
}

if (branch === "main") warnings.push("Estas en main. Para cambios Kaizen normalmente usa una rama feature.");
if (porcelain.length > 20) warnings.push(`Worktree con ${porcelain.length} archivos cambiados. Revisa scope antes de commit.`);
if (staged.length && staged.length > 12) warnings.push(`Hay ${staged.length} archivos staged. Confirma que no sea un git add accidental.`);
if (requireClean && meaningfulChanges.length) {
  errors.push(`require_clean: hay ${meaningfulChanges.length} cambio(s) reales sin cerrar`);
}

console.log("Kaizen worktree audit");
console.log(`Branch: ${branch}`);
console.log(`Require clean: ${requireClean ? "yes" : "no"}`);
console.log("");
console.log("Last commits:");
console.log(lastCommits || "- sin commits");
console.log("");
console.log(`Changed files: ${porcelain.length}`);
console.log(`Meaningful changed files: ${meaningfulChanges.length}`);
console.log(`Staged files: ${staged.length}`);
console.log("");
console.log("Worktree:");
console.log(porcelain.length ? porcelain.map((line) => `- ${line}`).join("\n") : "- limpio");
console.log("");
console.log("Warnings:");
console.log(warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- none");
console.log("");
console.log("Errors:");
console.log(errors.length ? errors.map((item) => `- ${item}`).join("\n") : "- none");

if (errors.length) {
  console.error("");
  console.error("Blocking artifacts detected. Do not use git add .");
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function gitQuiet(args) {
  try {
    execFileSync("git", args, { encoding: "utf8", stdio: "ignore" });
    return true;
  } catch (error) {
    if (typeof error?.status === "number") return false;
    throw error;
  }
}

function meaningfulStatusLine(line) {
  const status = line.slice(0, 2);
  const file = statusPath(line);
  if (!file) return false;
  if (status === "??") return true;
  if (/[ADRCTU]/.test(status)) return true;
  if (status[0] !== " " && !gitQuiet(["diff", "--cached", "--quiet", "--", file])) return true;
  if (status[1] !== " " && !gitQuiet(["diff", "--quiet", "--", file])) return true;
  return false;
}

function statusPath(line) {
  const raw = line.slice(3).trim();
  if (!raw) return "";
  const renamed = raw.split(" -> ").pop() || raw;
  return renamed.replace(/^"|"$/g, "");
}

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}
