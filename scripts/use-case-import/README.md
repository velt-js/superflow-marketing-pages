# Framer Use Case → Sanity Import

One-shot migration script that imports the Framer Use Case CSV into Sanity
(`useCasePage` documents in project `sckr62cw`, dataset `production`).

## Files

| File | Purpose |
|---|---|
| `use-case-raw.csv` | Source CSV. |
| `transform-to-sanity.mjs` | Pure transform: CSV → Sanity-shaped JSON. Produces `use-case-sanity.json`. |
| `import-to-sanity.mjs` | Uploads thumbnail / icon / problem / solution / testimonial images, then `createOrReplace`s `useCasePage` docs. |

## Run

```bash
cd superflow-marketing-pages

# 1. Transform (no token required, no network)
node scripts/use-case-import/transform-to-sanity.mjs

# 2. Dry-run import (logs only)
DRY_RUN=1 node scripts/use-case-import/import-to-sanity.mjs

# 3. Spot-check with one use case first
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/use-case-import/import-to-sanity.mjs

# 4. Full import
SANITY_API_TOKEN=<token> node scripts/use-case-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor or higher on the production dataset.

## Decisions

- **Idempotent**: `createOrReplace` on `_id = use-case-<slug>`. Reruns wipe manual Studio edits.
- **No framer URLs in the final docs.** Every `framerusercontent.com` URL —
  the thumbnail, icon, and every problem / solution / testimonial image —
  is downloaded by the importer and re-uploaded as a Sanity asset. The
  transform JSON keeps URLs as `framerImageUrl` / `framerXUrl` markers;
  the importer rewrites them to Sanity asset refs.
- **Repeating slots collapse**:
  - `problem__one|two|three__title|image` → `problemSection.items[]` (≤ 3)
  - `solution__one|two|three__title|sub_copy|image` → `solutionSection.items[]` (≤ 3)
  - `testimonial__1|2|3__…` → `testimonials[]` (≤ 3)
  - `FAQ__1|2|3__question|answer` → `faq[]` (≤ 3)
- **Header quirk**: the source CSV header reads ` Footer CTA Title` (leading
  space). The transform reads it via that exact key, falling back to the
  trimmed form.
