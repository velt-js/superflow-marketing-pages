# Comparisons (Comp v/s Comp) → Sanity Import

One-shot migration that pulls Framer's `Comp v/s Comp` collection (10
records, 256 columns) into Sanity as `comparisonPage` documents.

## Files

| File | Purpose |
|---|---|
| `framer-cmp-raw.json` | Output of `parse-csv.mjs` — verbatim CSV → JSON. |
| `framer-cmp-sanity.json` | Output of `transform-to-sanity.mjs` — Sanity-shaped docs with `framerImageUrl` markers for uploads. |
| `parse-csv.mjs` | RFC4180 CSV → raw JSON. Source: `/Users/yoenzhang/Downloads/Comp v_s Comp.csv`. |
| `transform-to-sanity.mjs` | Pure transform. Maps 6 named criteria, 3 pricing tiers, A/B/C/D/E feature groups, Superflow + alternative highlights, 4 reviews, 6 FAQs. |
| `import-to-sanity.mjs` | Walks the JSON tree, uploads every asset (filename extension preserved), createOrReplace docs keyed `cmp-<slug>`. |

## Run

```bash
cd superflow-marketing-pages

# 1. Parse + transform (no token, no network)
node scripts/comparisons-import/parse-csv.mjs
node scripts/comparisons-import/transform-to-sanity.mjs

# 2. Spot-check one
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/comparisons-import/import-to-sanity.mjs

# 3. Full import
SANITY_API_TOKEN=<token> node scripts/comparisons-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor+ on `sckr62cw/production`.

## Notes

- The smaller `Comparisons.csv` is intentionally ignored — its 3 slugs
  are duplicates that already exist in Comp v/s Comp (different
  shape, less complete data).
- YouTube embed URLs are kept as plain strings on
  `namedCriteria[].c1Video` / `c2Video`. The renderer wraps them in
  `<iframe>`. No file upload.
- Feature-table row labels are not in the CSV — they live in
  `lib/comparisons/feature-table-labels.ts`. Until that map is
  filled, the table renders `A.1`, `A.2`, etc. as placeholder labels.
- Idempotent: `createOrReplace` on `cmp-<slug>`. Reruns overwrite.
