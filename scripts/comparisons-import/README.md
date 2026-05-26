# Comparisons → Sanity Import

One-shot migration that pulls Framer's `Comparisons` collection (3
records: markup-vs-pastel, markup-vs-ruttl, pastel-vs-bugherd) into
Sanity as `comparisonPage` documents. Schema and pipeline mirror the
Alternative migration exactly.

## Files

| File | Purpose |
|---|---|
| `framer-cmp-raw.json` | RFC4180 CSV → JSON. |
| `framer-cmp-sanity.json` | Sanity-shaped docs with `framerImageUrl` markers. |
| `parse-csv.mjs` | Source: `/Users/yoenzhang/Downloads/Comparisons.csv`. |
| `transform-to-sanity.mjs` | Same shape as the Alternative transform. |
| `import-to-sanity.mjs` | Walks the tree, uploads every asset, `createOrReplace` keyed `cmp-<slug>`. |

## Run

```bash
cd superflow-marketing-pages

# 1. Parse + transform (no token, no network)
node scripts/comparisons-import/parse-csv.mjs
node scripts/comparisons-import/transform-to-sanity.mjs

# 2. Spot-check
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/comparisons-import/import-to-sanity.mjs

# 3. Full import
SANITY_API_TOKEN=<token> node scripts/comparisons-import/import-to-sanity.mjs
```

## Notes

- The other Framer collection ("Comp v/s Comp", 10 rows) is NOT
  imported here. Only 3 of those 10 slugs are published on the live
  `usesuperflow.com/comparisons/<slug>`, and those 3 overlap with this
  Comparisons.csv. Source-of-truth is therefore Comparisons.csv.
- Renderer = `components/detail/ComparisonDetailPage.tsx` via the
  adapter at `lib/sanity-adapters/comparisons.ts` —
  exactly the same as the Alternative route.
- Idempotent: rerun anytime.
