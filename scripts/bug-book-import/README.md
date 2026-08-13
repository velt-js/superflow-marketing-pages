# Bug Book → Sanity Import

Seeds the 51 curated Bug Book entries (36 `tier: "page"` live + 15
`tier: "bench"` spares) plus 2 illustrative sample reports from
`bug-book-data.json` into Sanity as `bugBookEntry` and `bugBookSample`
documents. The site (`/bug-book`, `/bug-book/[slug]`) renders only
`tier == "page"` docs, so swapping an entry in or out is a one-field
`tier` edit in Studio - no new mining work needed.

## Files

| File | Purpose |
|---|---|
| `bug-book-data.json` | Single source of truth: 51 PII-scrubbed entries mined from real Superflow comment threads, plus a `samples` array of illustrative agent reports. Display copy (headline, hook, thread, whyItMatters, outcome) is edited for voice and legal safety - don't paraphrase it. |
| `import-to-sanity.mjs` | createOrReplace on `_id = bugBook-<slug>` / `bugBookSample-<slug>`, and deletes any Bug Book doc whose slug left the JSON. Idempotent; reruns wipe manual Studio edits to these docs. |

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

- **All 51 entries imported**, bench included - content rotation is a
  Studio edit, not a code change. Queries filter `tier == "page"`.
- **Culled entries are deleted**, not left behind: the script diffs the
  dataset against the JSON, so a slug dropped during curation stops
  rendering instead of lingering as a stale document.
- **Samples are separate** (`bugBookSample`). They render in their own
  "New agents on the beat" band, never mix into the filtered grid, and
  get no detail route, OG image, or sitemap entry - so "every bug in the
  book is a real catch" stays true.
- **Em dashes** are stripped from editorial copy to match site style, but
  kept verbatim inside `thread[]` - those are quoted customer comments.
- **`curatedRank`** stores the source array order and backs the default
  "Curated" sort on `/bug-book`.
- **Slugs are final** - they're referenced in the private review sheet;
  don't rename.
- The private review file (`bug-book-review.md`) and unscrubbed threads
  are NOT in this repo, by design. Keep it that way.
