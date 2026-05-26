# User Persona → Sanity Import

Pulls Framer's `User Persona` collection (9 rows × 111 cols) into
Sanity as `userPersonaPage` documents. Schema already deployed; the
pipeline mirrors the Alternative migration.

## Files

| File | Purpose |
|---|---|
| `framer-up-raw.json` | CSV → raw JSON. |
| `framer-up-sanity.json` | Sanity-shaped docs with `framerImageUrl` markers. |
| `parse-csv.mjs` | RFC4180 CSV → raw JSON. |
| `transform-to-sanity.mjs` | Pure transform. Reads `Role` / `Description` / `trust_line` for hero; collapses Framer's `job_one` + `❌  job_two/three` into `jobs[]`; pulls 3 testimonials, 3 features, 3 FAQs, final CTA. |
| `import-to-sanity.mjs` | Asset uploads + `createOrReplace` keyed `up-<slug>`. |

## Run

```bash
cd superflow-marketing-pages

# 1. Parse + transform (no token, no network)
node scripts/user-persona-import/parse-csv.mjs
node scripts/user-persona-import/transform-to-sanity.mjs

# 2. Spot-check
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/user-persona-import/import-to-sanity.mjs

# 3. Full import
SANITY_API_TOKEN=<token> node scripts/user-persona-import/import-to-sanity.mjs
```

## Notes

- Renderer = `components/detail/DetailPage.tsx` via
  `lib/sanity-adapters/user-persona.ts` (same shape that powers
  `/use-case`). Adapter renders jobs[0] as the "problem" section,
  features as the FeatureRow sequence, and links to the other personas
  in the related-ways section.
- Sanity carries the full Framer payload (testimonials, FAQ,
  outcomeOneLiner, finalCta) even though the current renderer doesn't
  display all of it — wire those into DetailPage when ready.
- Framer's "Hidden" flag is honored (`hidden != true` filters from the
  listing). If a slug shows up missing on `/user-persona`, check Studio.
- Idempotent: `createOrReplace` on `up-<slug>`. Reruns overwrite.
