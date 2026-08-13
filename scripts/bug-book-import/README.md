# Bug Book → Sanity Import

Seeds the 54 curated Bug Book entries (34 `tier: "page"` live + 20
`tier: "bench"` spares) from `bug-book-data.json` into Sanity as
`bugBookEntry` documents. The site (`/bug-book`, `/bug-book/[slug]`)
renders only `tier == "page"` docs, so swapping an entry in or out is a
one-field `tier` edit in Studio — no new mining work needed.

## Files

| File | Purpose |
|---|---|
| `bug-book-data.json` | Single source of truth: 54 PII-scrubbed entries mined from real Superflow comment threads. Display copy (headline, hook, thread, whyItMatters, outcome) is edited for voice and legal safety — don't paraphrase it. |
| `import-to-sanity.mjs` | createOrReplace on `_id = bugBook-<slug>`. Idempotent; reruns wipe manual Studio edits to these docs. |

## Run

```bash
cd superflow-marketing-pages

# Dry run (no token, logs only)
DRY_RUN=1 node scripts/bug-book-import/import-to-sanity.mjs

# Import
SANITY_API_TOKEN=<token> node scripts/bug-book-import/import-to-sanity.mjs
```

`SANITY_API_TOKEN` needs Editor or higher on the production dataset.

## Decisions

- **All 54 entries imported**, bench included — content rotation is a
  Studio edit, not a code change. Queries filter `tier == "page"`.
- **`curatedRank`** stores the source array order and backs the default
  "Curated" sort on `/bug-book`.
- **Slugs are final** — they're referenced in the private review sheet;
  don't rename.
- The private review file (`bug-book-review.md`) and unscrubbed threads
  are NOT in this repo, by design. Keep it that way.
