#!/usr/bin/env node
// Build a .dxt bundle for Claude Desktop one-click install.
// Output: revroute-mcp-<version>.dxt in repo root.

import { execSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const stagingDir = join(repoRoot, "dxt-build");
const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(repoRoot, "manifest.json"), "utf8"));

if (pkg.version !== manifest.version) {
  console.error(`version mismatch: package.json=${pkg.version} manifest.json=${manifest.version}`);
  process.exit(1);
}

const outFile = join(repoRoot, `revroute-mcp-${pkg.version}.dxt`);

// 1) Clean staging
if (existsSync(stagingDir)) rmSync(stagingDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });

// 2) Copy required files
console.log("Staging files…");
cpSync(join(repoRoot, "dist"), join(stagingDir, "dist"), { recursive: true });
copyFileSync(join(repoRoot, "manifest.json"), join(stagingDir, "manifest.json"));
copyFileSync(join(repoRoot, "icon.png"), join(stagingDir, "icon.png"));
copyFileSync(join(repoRoot, "README.md"), join(stagingDir, "README.md"));
copyFileSync(join(repoRoot, "LICENSE"), join(stagingDir, "LICENSE"));
copyFileSync(join(repoRoot, "CHANGELOG.md"), join(stagingDir, "CHANGELOG.md"));

// 3) Write a slim package.json that lists only runtime deps, so npm install --omit=dev
//    inside the staging dir keeps node_modules small.
const stagingPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  license: pkg.license,
  type: pkg.type,
  main: pkg.main,
  dependencies: pkg.dependencies,
};
writeFileSync(join(stagingDir, "package.json"), `${JSON.stringify(stagingPkg, null, 2)}\n`);

// 4) Install production deps inside staging
console.log("Installing production deps inside dxt-build/…");
execSync("npm install --omit=dev --no-audit --no-fund --silent", {
  cwd: stagingDir,
  stdio: "inherit",
});

// 5) Validate manifest
console.log("Validating manifest…");
try {
  execSync(`npx -y @anthropic-ai/mcpb@latest validate "${join(stagingDir, "manifest.json")}"`, {
    cwd: repoRoot,
    stdio: "inherit",
  });
} catch {
  console.error("manifest validation failed");
  process.exit(1);
}

// 6) Pack
console.log(`Packing -> ${outFile}`);
if (existsSync(outFile)) rmSync(outFile);
execSync(`npx -y @anthropic-ai/mcpb@latest pack "${stagingDir}" "${outFile}"`, {
  cwd: repoRoot,
  stdio: "inherit",
});

// 7) Cleanup staging
rmSync(stagingDir, { recursive: true, force: true });

console.log(`\n✓ ${outFile}`);
