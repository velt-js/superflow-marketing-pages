# Framer Integrations → Sanity Import

One-shot migration script that imports the Framer Integrations CSV into Sanity
(`integrationPage` documents in project `sckr62cw`, dataset `production`).

## Files

| File | Purpose |
|---|---|
| `integrations-raw.csv` | Source CSV (Slug, Title, ..., steps__N__title/text columns). Re-drop in to refresh. |
| `transform-to-sanity.mjs` | Pure transform: CSV → Sanity-shaped JSON. Produces `integrations-sanity.json`. |
| `import-to-sanity.mjs` | Uploads thumbnail / app logo / installation video / inline step images, then `createOrReplace`s `integrationPage` docs. |

## Run

```bash
cd superflow-marketing-pages

# 1. Transform (no token required, no network)
node scripts/integrations-import/transform-to-sanity.mjs

# 2. Dry-run import (logs only)
DRY_RUN=1 node scripts/integrations-import/import-to-sanity.mjs

# 3. Spot-check with one integration first
SANITY_API_TOKEN=<token> LIMIT=1 node scripts/integrations-import/import-to-sanity.mjs

# 4. Full import
SANITY_API_TOKEN=<token> node scripts/integrations-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor or higher on the production dataset.

## Decisions

- **Idempotent**: `createOrReplace` on `_id = integration-<slug>`. Reruns wipe manual Studio edits.
- **HTML → Portable Text** via `node-html-parser`. Supports `p`, `h1-h4`,
  `ul/ol/li` (Framer's `<li data-preset-tag="p"><p>…</p></li>` wrapper is
  unwrapped), `blockquote`, `img`, `a`, `strong/em/code`, `br`.
- **No framer URLs in the final docs.** Every `framerusercontent.com` URL —
  the hero thumbnail, app logo, installation video, and any inline step
  screenshots — is downloaded by the importer and re-uploaded as a Sanity
  asset. The transform JSON keeps URLs as `framerImageUrl` / `framerXUrl`
  markers; the importer rewrites them to Sanity asset refs.
- **Steps**: `steps__1..6__title/text` collapse into a single `steps[]` array,
  skipping empty slots.
