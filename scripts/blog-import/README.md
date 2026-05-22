# Framer Blog → Sanity Import

One-shot migration script that pulls the 25 Framer blog posts out of the
`usesuperflow.com` project and writes them as `blogPost` documents in
Sanity (project `sckr62cw`, dataset `production`).

## Files

| File | Purpose |
|---|---|
| `framer-blog-raw.json` | Baked dump of all 25 records from the unframer MCP. Re-extract by running `getCMSItems` against collection `rbw_egHj7` and merging pages. |
| `framer-field-map.json` | `{fieldId: humanName}` lookup for the Blog collection (extracted from `getCMSCollections`). |
| `transform-to-sanity.mjs` | Pure transform: raw → Sanity-shaped JSON. Produces `framer-blog-sanity.json`. |
| `import-to-sanity.mjs` | Uploads assets, creates `author` + `blogPost` docs via `createOrReplace`. |

## Run

```bash
cd superflow-marketing-pages

# 1. Transform (no token required, no network)
node scripts/blog-import/transform-to-sanity.mjs

# 2. Dry-run import (logs only)
DRY_RUN=1 node scripts/blog-import/import-to-sanity.mjs

# 3. Spot-check with one post first
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/blog-import/import-to-sanity.mjs

# 4. Full import
SANITY_API_TOKEN=<token> node scripts/blog-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor or higher on the production dataset.

## Decisions

- **Idempotent**: `createOrReplace` on `_id = blog-<slug>` / `author-<slug>`.
  Reruns wipe manual Studio edits.
- **Category map**: `Guides → guide`, `Comparison Blog → comparison`,
  `Product Updatae → product-update`. All other Framer categories
  (Listicle, Competition, Guest post, Integrations, Use Case, Feature
  Release) fall back to `guide`.
- **Authors**: one `author` doc per unique `Author Name`. Avatar uploaded
  from `Author Image`. Posts reference via the doc.
- **Body**: intro + each non-empty section (20 slots) concatenated as
  HTML, then converted to Portable Text via `jsdom`. `<img>` →
  `blogBodyImage`. `<a>` → `link` annotation. Quotes / note text / CTA
  text are appended as block-level elements after each section.
- **FAQ schema**: collected from `FAQ__1..5__question/answer` pairs and
  emitted as JSON-LD into the `faqSchema` field.

## Re-extracting from Framer

The raw dump is baked into the repo so re-runs don't require MCP
access. To pick up Framer edits, re-run `getCMSItems` (collectionId
`rbw_egHj7`) in batches of 5 and merge — see commit history for the
combine script. The unframer plugin must be open in the Framer project
during extraction.
