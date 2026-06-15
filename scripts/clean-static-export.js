const fs = require("fs");
const path = require("path");

const targets = [
  "src/app/sitemap.ts",
  "src/app/sitemap.tsx",
  "src/app/sitemap.js",
  "src/app/sitemap.jsx",
  "src/app/sitemap.xml",
  ".next/server/app/sitemap.xml",
];

for (const target of targets) {
  const fullPath = path.join(process.cwd(), target);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Removed static export blocker: ${target}`);
  }
}
