#!/usr/bin/env node
/**
 * Seed default cursors onto every reviewPage feature card. Mirrors the
 * home-page defaults so /lottie-files-review etc. show the floating
 * collaborator cursors that match the Figma comp.
 *
 * Safe to re-run — overwrites the cursors array on every card.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-card-cursors.mjs
 *   DRY_RUN=1 node scripts/seed-feature-card-cursors.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = DRY_RUN
  ? null
  : createClient({
      projectId: "sckr62cw",
      dataset: "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const CURSORS_BY_INDEX = [
  // Slot 0 — Review pixels
  [
    { side: "left", label: "Designer", color: "#4dd5ff", topPct: 25 },
    { side: "right", label: "Photographer", color: "#3772ff", textColor: "#fff", topPct: 55 },
  ],
  // Slot 1 — Manage, prioritize
  [
    { side: "left", label: "Manager", color: "#ff62a4", textColor: "#fff", topPct: 50 },
    { side: "right", label: "Team Lead", color: "#ffcd2e", topPct: 25 },
  ],
  // Slot 2 — Get approvals
  [
    { side: "left", label: "Client", color: "#b1ff4d", topPct: 20 },
    { side: "right", label: "Designer", color: "#ff62a4", topPct: 60 },
  ],
  // Slot 3 — Sync with tools
  [
    { side: "left", label: "Manager", color: "#ff9e2c", topPct: 30 },
    { side: "right", label: "Team Lead", color: "#ffcd2e", topPct: 60 },
  ],
];

function cursorWithKey(cur, cardIndex, cursorIndex) {
  return {
    _key: `cursor-${cardIndex}-${cursorIndex}-${cur.side}`,
    ...cur,
  };
}

async function main() {
  console.log("Fetching reviewPage docs…");
  const docs = DRY_RUN
    ? [{ _id: "DRY_RUN", featureCards: { cards: Array(4).fill({}) } }]
    : await client.fetch(`*[_type == "reviewPage"]{ _id, featureCards }`);
  console.log(`  fetched ${docs.length} doc(s)`);

  for (const doc of docs) {
    if (!doc.featureCards?.cards?.length) {
      console.log(`- ${doc._id}: no cards, skipping`);
      continue;
    }
    const cards = doc.featureCards.cards;
    const patchedCards = cards.map((card, i) => {
      const defaults = CURSORS_BY_INDEX[i] ?? CURSORS_BY_INDEX[CURSORS_BY_INDEX.length - 1];
      return {
        ...card,
        cursors: defaults.map((cur, j) => cursorWithKey(cur, i, j)),
      };
    });

    if (DRY_RUN) {
      console.log(`- ${doc._id}: would patch ${cards.length} cards with cursors`);
      continue;
    }
    await client
      .patch(doc._id)
      .set({ "featureCards.cards": patchedCards })
      .commit();
    console.log(`✓ Patched ${doc._id}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
