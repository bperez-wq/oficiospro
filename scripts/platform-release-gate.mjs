import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const startedAt = Date.now();

const steps = [
  {
    label: "Kaizen worktree audit",
    command: npmCommand,
    args: ["run", "kaizen:audit"],
  },
  {
    label: "Project validation",
    command: npmCommand,
    args: ["run", "validate"],
  },
  {
    label: "Unit tests",
    command: npmCommand,
    args: ["run", "test:unit"],
  },
  {
    label: "SEO audit",
    command: npmCommand,
    args: ["run", "seo:audit"],
  },
  {
    label: "Pilot readiness offline",
    command: npmCommand,
    args: ["run", "pilot:readiness", "--", "--offline", "--no-report"],
    env: { PILOT_READINESS_NO_REPORT: "1" },
  },
  {
    label: "Production build",
    command: npmCommand,
    args: ["run", "build"],
  },
  {
    label: "Cloudflare assets dry-run",
    command: npmCommand,
    args: ["run", "deploy:dry-run"],
  },
];

console.log("OficiosPro platform release gate");
console.log("This gate validates code, tests, SEO, pilot readiness, build and Cloudflare dry-run.");
console.log("It never deploys production, migrates D1, or writes secrets.");
console.log("");

for (const [index, step] of steps.entries()) {
  const stepStartedAt = Date.now();
  console.log(`\n[${index + 1}/${steps.length}] ${step.label}`);
  console.log(`> ${step.command} ${step.args.join(" ")}`);
  const invocation = buildInvocation(step.command, step.args);

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: { ...process.env, ...(step.env || {}) },
    stdio: "inherit",
    shell: false,
  });

  const durationSeconds = ((Date.now() - stepStartedAt) / 1000).toFixed(1);
  if (result.error) {
    console.error("");
    console.error(`Release gate could not start step ${index + 1}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error("");
    console.error(`Release gate blocked at step ${index + 1}: ${step.label} (${durationSeconds}s).`);
    console.error("Fix the failing check before merge or deploy.");
    process.exit(result.status || 1);
  }

  console.log(`Step passed: ${step.label} (${durationSeconds}s)`);
}

const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log("");
console.log(`Release gate passed in ${totalSeconds}s.`);
console.log("Safe next step: open PR or merge through the normal review flow. Do not deploy without Benjamin approval.");

function buildInvocation(command, args) {
  if (process.platform !== "win32") return { command, args };
  return {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", quoteForCmd([command, ...args])],
  };
}

function quoteForCmd(parts) {
  return parts.map((part) => {
    if (/^[A-Za-z0-9._:\/\\=@-]+$/.test(part)) return part;
    return `"${String(part).replace(/"/g, '\\"')}"`;
  }).join(" ");
}
