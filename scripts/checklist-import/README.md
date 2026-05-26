# Framer Checklist → Sanity Import

One-shot migration script that imports the Framer Checklist CSV into Sanity
(`checklistPage` documents in project `sckr62cw`, dataset `production`).

## Files

| File | Purpose |
|---|---|
| `checklist-raw.csv` | Source CSV (exported from Framer). |
| `transform-to-sanity.mjs` | Pure transform: CSV → Sanity-shaped JSON. Produces `checklist-sanity.json`. Converts `<p>…</p>` HTML to Portable Text via jsdom. |
| `import-to-sanity.mjs` | Uploads thumbnail + main image, then `createOrReplace`s `checklistPage` docs. |

## Run

```bash
cd superflow-marketing-pages

# 1. Transform (no token required, no network)
node scripts/checklist-import/transform-to-sanity.mjs

# 2. Dry-run import (logs only)
DRY_RUN=1 node scripts/checklist-import/import-to-sanity.mjs

# 3. Full import (token from .env.local)
export $(grep -v '^#' .env.local | xargs)
SANITY_API_TOKEN=$SANITY_API_TOKEN node scripts/checklist-import/import-to-sanity.mjs
```

## Decisions

- **Idempotent**: `createOrReplace` on `_id = checklist-<slug>`. Reruns wipe manual Studio edits.
- **No framer URLs in the final docs.** Thumbnail and Main image are downloaded by the importer and re-uploaded as Sanity assets.
- **Repeating slots collapse**:
  - `checklist__1..12__{title,description,button text,button action,t1..t10}` → `sections[].tips[]`
  - `suggested__1..3__{name,bg_color}` → `suggestedChecklists[]`
- **HTML → Portable Text** using the same walker as `scripts/blog-import/transform-to-sanity.mjs`. Empty-filler blocks (`<p><br></p>`) are skipped.
- The end-note section comes from `quote__sub text` + `quote__sub_text__description` columns (Framer reused the quote slot).
- Testimonials in the CSV are **ignored** — the live page uses the homepage `CustomerLoveCarousel`, not per-checklist testimonials.
