# Bug Book → Sanity Import

Seeds the 92 curated Bug Book entries (59 `tier: "page"` live + 33
`tier: "bench"` spares) plus 2 illustrative sample reports from
`bug-book-data.json` into Sanity as `bugBookEntry` and `bugBookSample`
documents. The site (`/bug-book`, `/bug-book/[slug]`) renders only
`tier == "page"` docs, so swapping an entry in or out is a one-field
`tier` edit in Studio - no new mining work needed.

## Files

| File | Purpose |
|---|---|
| `bug-book-data.json` | Single source of truth: 92 PII-scrubbed entries mined from real Superflow comment threads, plus a `samples` array of illustrative agent reports. Display copy (headline, hook, thread, whyItMatters, outcome) is edited for voice and legal safety - don't paraphrase it. |
| `export-quote-cards.mjs` | Batch-saves the social quote cards as PNGs (see above). |
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

## Social quote cards

Every live entry renders as a shareable image built from its
`pullQuote`, in the same visual language as the cards on `/bug-book`:

```
/api/bug-book/quote-card?slug=<slug>&format=<square|portrait|story|landscape>
```

`square` (1080x1080) is the default; `portrait` is 1080x1350, `story` is
1080x1920, `landscape` is 1200x630. Unknown formats fall back to square
rather than erroring. Missing slug returns 400, unknown slug 404.

To pull the whole set as PNGs (needs the site running locally, or set
`BASE_URL` to a deployed origin):

```bash
node scripts/bug-book-import/export-quote-cards.mjs
node scripts/bug-book-import/export-quote-cards.mjs --format portrait
node scripts/bug-book-import/export-quote-cards.mjs --vibe sass --out ./cards
BASE_URL=https://usesuperflow.com node scripts/bug-book-import/export-quote-cards.mjs
```

Every card carries "Names removed. Screenshots redacted." Out of context
on a feed, that promise has to travel with the quote - don't strip it.

## Decisions

- **All 92 entries imported**, bench included - content rotation is a
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
