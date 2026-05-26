#!/usr/bin/env node
/**
 * Purge user-persona-exclusive assets from Sanity, then delete the docs, so the
 * importer can re-upload everything fresh (Sanity dedups uploads by content
 * hash, so a clean reimport requires deleting first).
 *
 * Safety: only deletes assets referenced by `userPersonaPage` docs AND by no
 * other doc type (set difference). Shared assets (blog/alternative/comparison)
 * are never touched.
 *
 * Order: compute D = (assets used by user-persona) \ (assets used elsewhere),
 * delete the userPersonaPage docs, then delete the assets in D.
 *
 * Usage:
 *   DRY_RUN=1 node scripts/user-persona-import/purge-assets.mjs
 *   SANITY_API_TOKEN=<token> node scripts/user-persona-import/purge-assets.mjs
 *
 * Reads SANITY_API_TOKEN from env or .env.local.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const DRY_RUN = process.env.DRY_RUN === "1";

// Load token from env, falling back to .env.local
let token = process.env.SANITY_API_TOKEN;
if (!token) {
  try {
    const env = readFileSync(resolve(repoRoot, ".env.local"), "utf8");
    const m = env.match(/^SANITY_API_TOKEN=(.*)$/m);
    if (m) token = m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* ignore */
  }
}
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var (or add to .env.local), or DRY_RUN=1.");
  process.exit(1);
}

const client = createClient({
  projectId: "sckr62cw",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

function collectRefs(node, out) {
  if (Array.isArray(node)) {
    for (const v of node) collectRefs(v, out);
  } else if (node && typeof node === "object") {
    if (node.asset && typeof node.asset._ref === "string") out.add(node.asset._ref);
    for (const v of Object.values(node)) collectRefs(v, out);
  }
}

async function main() {
  // 1. Asset IDs referenced anywhere inside userPersonaPage docs.
  const personaDocs = await client.fetch(`*[_type=="userPersonaPage"]`);
  const refSet = new Set();
  for (const doc of personaDocs) collectRefs(doc, refSet);
  const U = [...refSet];
  console.log(`User-persona docs (${personaDocs.length}) reference ${U.length} unique assets.`);

  // 2. Of those, which are also referenced by any NON-user-persona doc?
  const shared = [];
  const deletable = [];
  for (const id of U) {
    const others = await client.fetch(
      `count(*[_type != "userPersonaPage" && references($id)])`,
      { id },
    );
    if (others > 0) shared.push(id);
    else deletable.push(id);
  }

  console.log(`  shared with other doc types (kept): ${shared.length}`);
  console.log(`  user-persona-exclusive (to delete): ${deletable.length}`);
  if (shared.length) console.log("  shared IDs:", shared);

  const personaDocIds = personaDocs.map((d) => d._id);
  console.log(`userPersonaPage docs to delete: ${personaDocIds.length}`);

  if (DRY_RUN) {
    console.log("\n[dry] would delete docs:", personaDocIds);
    console.log(`[dry] would delete ${deletable.length} assets.`);
    return;
  }

  // 3. Delete docs first so the assets become unreferenced.
  for (const id of personaDocIds) {
    await client.delete(id);
    console.log(`  ✓ deleted doc ${id}`);
  }

  // 4. Delete the now-orphaned, user-persona-exclusive assets.
  let ok = 0;
  for (const id of deletable) {
    try {
      await client.delete(id);
      ok++;
    } catch (err) {
      console.warn(`  ! could not delete asset ${id}: ${err.message}`);
    }
  }
  console.log(`Done. Deleted ${personaDocIds.length} docs, ${ok}/${deletable.length} assets.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
