# Framer Case Study → Sanity Import

One-shot migration script that imports the Framer Case Study CSV into Sanity
(`caseStudyPage` documents in project `sckr62cw`, dataset `production`).

## Files

| File | Purpose |
|---|---|
| `case-study-raw.csv` | Source CSV. |
| `transform-to-sanity.mjs` | Pure transform: CSV → Sanity-shaped JSON. Produces `case-study-sanity.json`. |
| `import-to-sanity.mjs` | Uploads thumbnail / logo / problem images / solution videos / testimonial avatar, then `createOrReplace`s `caseStudyPage` docs. |

## Run

```bash
cd superflow-marketing-pages

# 1. Transform (no token required, no network)
node scripts/case-study-import/transform-to-sanity.mjs

# 2. Dry-run import (logs only)
DRY_RUN=1 node scripts/case-study-import/import-to-sanity.mjs

# 3. Spot-check with one case study first
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/case-study-import/import-to-sanity.mjs

# 4. Full import
SANITY_API_TOKEN=<token> node scripts/case-study-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor or higher on the production dataset.

## Decisions

- **Idempotent**: `createOrReplace` on `_id = case-study-<slug>`. Reruns wipe manual Studio edits.
- **No framer URLs in the final docs.** Every `framerusercontent.com` URL —
  thumbnail, customer logo, 3 problem images, 3 solution mp4 videos, and
  the testimonial avatar — is downloaded by the importer and re-uploaded
  as a Sanity asset. The transform JSON keeps URLs as `framerXUrl` /
  `framerImageUrl` / `framerVideoUrl` markers; the importer rewrites them
  to Sanity asset refs.
- **Repeating slots collapse**:
  - `problem__1|2|3__image|image:alt|text` → `problemSection.items[]` (≤ 3)
  - `solution__1|2|3__tag|title|sub_text|video` → `solutionSection.items[]` (≤ 3)
  - `results__1|2|3__value|text` → `resultsSection.items[]` (≤ 3)
  - `FAQ__1..6__question|answer` → `faq[]` (≤ 6)
- **Separator columns**: the CSV has `"---"` header cells between sections;
  the transform ignores them by addressing fields via their unique header
  names.
