#!/usr/bin/env node
/**
 * Copy-rule gate for the solutions work (spec section 9).
 *
 * Fails when any em dash / en dash, or any of the banned phrases, appears in
 * the files that carry new copy. Runs before `next build` (see package.json
 * "prebuild") so a build with a rule violation fails.
 *
 * Scope is the new and edited copy files plus the solutionPage CMS schema and
 * query file, not the whole repo: older code comments elsewhere still use em
 * dashes and that is not copy. Regex literals in the scanned files spell the
 * dashes as \u2014 and \u2013 escapes so they pass.
 *
 *   node scripts/check-copy-rules.mjs
 *   node scripts/check-copy-rules.mjs path/to/file ...   # override the file set
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Files and directories that carry new copy. Directories are walked. */
const DEFAULT_TARGETS = [
  "content/solutions",
  "components/solutions-2026",
  "components/home-2026/AgentsCatchSection.tsx",
  "components/home-2026/AgentsCatchSection.module.css",
  "lib/solutions",
  "app/solutions",
  "sanity/schemas/solutionPage.ts",
  "sanity/lib/queries.ts",
  "HANDOFF-app.md",
];

const DASHES = /[\u2014\u2013]/;
const BANNED = [
  "one per row",
  "per row",
  "one per line",
  "website monitoring",
  "seamless",
  "verification",
];

/**
 * Recursively list files under a path (or the path itself for a file).
 * @param {string} target
 * @returns {Promise<string[]>}
 */
async function listFiles(target) {
  const absolute = path.resolve(root, target);
  try {
    const info = await stat(absolute);
    if (info.isFile()) {
      return [absolute];
    }
    const entries = await readdir(absolute, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => listFiles(path.join(absolute, entry.name))),
    );
    return nested.flat();
  } catch {
    return [];
  }
}

async function main() {
  const targets = process.argv.slice(2);
  const files = (
    await Promise.all((targets.length ? targets : DEFAULT_TARGETS).map(listFiles))
  ).flat();

  let failures = 0;
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      const problems = [];
      if (DASHES.test(line)) {
        problems.push("em dash or en dash");
      }
      const lower = line.toLowerCase();
      for (const phrase of BANNED) {
        if (lower.includes(phrase)) {
          problems.push(`banned phrase "${phrase}"`);
        }
      }
      for (const problem of problems) {
        failures += 1;
        console.error(`${path.relative(root, file)}:${index + 1}: ${problem}`);
      }
    });
  }

  if (failures > 0) {
    console.error(`\nCopy rules: ${failures} problem(s) found.`);
    process.exit(1);
  }
  console.log(`Copy rules: ${files.length} file(s) clean.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
