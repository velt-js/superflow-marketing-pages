# Directory importers

Four standalone Node ESM scripts populate `lib/directory/data/*.json` for
the agency directory. Three are scrapers, each fetching a different public
source; the fourth is a loader that validates a hand-collected dataset rather
than fetching anything. All four write records conforming exactly to the
`Agency` interface in `lib/directory/types.ts`.
Categories and shared string constants live in `lib/directory/constants.ts`;
each script mirrors the ones it needs (see the comment near the top of each
script) rather than importing them, since neither has a TypeScript build
step and there is no module shared between them - each is fully standalone,
including its own copy of small helpers like `slugify`/`getRegistrableDomain`
and its own on-disk cache directory.

| Script | Source | Output | Category |
| --- | --- | --- | --- |
| `scrape-awwwards.mjs` | [Awwwards directory](https://www.awwwards.com/directory/) | `lib/directory/data/agencies.json` | `web-design` |
| `import-semrush.mjs` | [Semrush Agency Partners](https://agencies.semrush.com) | `lib/directory/data/seo-agencies.json` | `seo` |
| `load-branding-json.mjs` | Clutch / DesignRush / D&AD, via a hand-driven browser session (no network access of its own) | `lib/directory/data/branding-agencies.json` | `branding` |
| `import-motion-design-awards.mjs` | [Motion Design Awards](https://www.motiondesignawards.com) | `lib/directory/data/motion-design-agencies.json` | `motion-design` |

## Awwwards directory scraper

Scrapes agency/studio profiles from the [Awwwards directory](https://www.awwwards.com/directory/)
and writes them to `lib/directory/data/agencies.json`.

### Usage

```bash
node scripts/directory-import/scrape-awwwards.mjs             # default: 60 agencies
node scripts/directory-import/scrape-awwwards.mjs --limit 200 # more agencies
node scripts/directory-import/scrape-awwwards.mjs --limit=25  # = form also works
```

The script always overwrites `lib/directory/data/agencies.json` with the full
result of that run (it does not merge with the previous file).

### How it works

Each agency requires two page fetches:

1. **Directory listing pages** (`/directory/`, `/directory/?page=2`, …) — 24
   cards per page. Gives us: name, profile URL, logo, country, website, and
   award counts (Honorable Mentions / Site of the Day / Site of the Month /
   Site of the Year).
2. **The agency's own profile page** (`/<their-slug>/`) — gives us the city
   (the listing only has country), the profile description, and the
   agency's awarded submissions, from which the client list is built (see
   "Client names" below) — no extra fetch needed, since each submission's
   title and client live URL are already embedded in the profile HTML.

The script paginates the listing until it has collected `--limit` agencies
that are unique by **registrable domain** (never by name — many studios share
generic names), then fetches each one's profile page.

Fields the source doesn't expose anywhere we could find (`services`,
`teamSize`) are left as `[]` / `null` rather than guessed at. `nominees` and
`developerAward` are always `0` for the same reason — Awwwards' directory and
profile pages only ever show HM/SOTD/SOTM/SOTY counts. Semrush-only fields
(`rating`, `accolades`, `foundedYear`, `industries`, `budgetLabel`) are always
`null`/`[]` here too — Awwwards is a jury, not a business directory, and
publishes none of them for any profile (see the comment above these fields in
`buildAgencyRecord`).

### Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--limit N` (or `--limit=N`) | `60` | Max number of unique agencies to collect. |

### Rate limits / politeness

These are hardcoded constants at the top of the script, not flags — this is a
one-off/occasional import job, not a production crawler, so they're
intentionally conservative:

- Max **2 concurrent** requests, minimum **1000ms** between request starts.
- Exponential backoff on `429`/`5xx` responses (1s → 2s → 4s), **3 retries**
  max, then the URL is recorded as a failure and the run continues without it.
- A hard cap of **300 real HTTP requests per run** (`HARD_REQUEST_CAP`). Cache
  hits don't count toward it. If it's hit mid-run, the script degrades
  gracefully (stops pagination early, or falls back to listing-only data for
  agencies whose profile fetch didn't happen) rather than crashing — you'll
  still get a valid, if smaller/less-enriched, output file.
- Identifies itself honestly: `User-Agent: SuperflowDirectoryBot/1.0
  (+https://usesuperflow.ai; mihir@velt.dev)`. It does not spoof a browser UA.

### robots.txt

`robots.txt` is fetched and parsed **at runtime**, on every run — the script
does not hardcode "this path is allowed" anywhere. It implements the standard
grouping (`User-agent:` blocks), wildcard (`*`) and end-anchor (`$`) syntax,
and longest-match-wins precedence. If `robots.txt` can't be fetched or
parsed, the script fails closed (treats everything as disallowed) rather than
assuming it's fine to proceed.

At the time of writing, `/directory/` is allowed and `/directory/search/?` is
the only Awwwards path relevant to this script that's disallowed (the script
never hits it — it uses `/directory/?page=N`, not `/directory/search/`).
Profile pages (`/<slug>/`) are also allowed. If Awwwards' robots.txt changes
to disallow either, the script will start skipping those requests and log a
warning rather than needing a code change.

### Cache

Every fetched page is cached on disk at `scripts/directory-import/.cache/`
(gitignored), keyed by a SHA-256 hash of the URL. This means:

- **Re-running the script with the same or a smaller `--limit` makes zero new
  network requests** — everything comes from cache.
- **Iterating on the parsing/selector logic is free** — edit the script and
  re-run; only genuinely new URLs (e.g. a larger `--limit`) hit the network.
- The cache has no expiry. To force a fresh scrape (e.g. to pick up new
  award counts), delete the cache directory first:

  ```bash
  rm -rf scripts/directory-import/.cache
  node scripts/directory-import/scrape-awwwards.mjs --limit 60
  ```

### Client names

Each awarded submission on a profile page (`.js-collectable`, parsed from
its `data-collectable-model-value` JSON) yields a client *candidate*: the
project title, plus the submission's live URL when that URL's registrable
domain looks like the client's own site rather than the agency's (see
`isAgencyOwnDomain`) and isn't a known generic host (`GENERIC_HOST_DOMAINS`
— see "Known limitations" below). Candidates are deduped per agency (by
domain where there is one, otherwise by title) and capped at
`MAX_CLIENT_CANDIDATES` (24) — deliberately higher than the
`MAX_CLIENTS_PER_AGENCY` (12) that actually ship, so that candidates the
normalisation pass rejects cost a candidate slot rather than a display
slot. The final 12 are picked after rejection, and deduped once more by
resolved name (two projects for the same brand are one client).

A candidate's project title alone is not a usable display name — titles
read like "Coca-Cola: Wozzaah" or "20 Years of Xbox Museum" — so every
candidate across the whole run is resolved by a single normalisation pass
before the output file is written:

- Candidates are batched (`CLIENT_NAME_BATCH_SIZE`, 40 per request) and
  sent to Claude (`claude-opus-5`, `effort: "low"`, structured JSON output
  via `output_config`) with a prompt asking for the real organisation name
  behind each project, a `notable` flag (true only for brands a general
  international audience would recognise unprompted), or `null` when the
  candidate isn't a real external client at all (the agency's own
  self-promotional work, a personal portfolio, an unnamed concept piece,
  …). The prompt is deliberately biased toward returning `null` over
  guessing at a brand.
- Results are memoised in the **committed**
  `scripts/directory-import/client-names.json` — unlike `.cache/`, this
  file is checked into git, because it doubles as the one place to
  hand-correct a name. Its keys are built from the same two inputs the
  pass reads (`<client-domain-or-"-">|<verbatim project title>`, e.g.
  `coca-cola.com|Coca-Cola: Wozzaah`), so the same brand seen under two
  different agencies resolves once and reuses the cached answer for both.
- Only candidates missing from the cache are sent to Claude — a re-run
  after a previous scrape makes zero normalisation calls unless new
  candidates showed up. The file is written back key-sorted, so adding one
  entry produces a one-line diff.
- **To hand-correct a name**, edit its entry's `name` (and `notable`, if
  needed) directly in `client-names.json`. **To drop a candidate from the
  directory entirely** — a false positive, a client an agency shouldn't be
  associated with, whatever the reason — set its value to `null` instead
  of deleting the key; deleting it would just cause the same candidate to
  be re-sent to Claude (and possibly re-added) on the next run, while an
  explicit `null` is a permanent, self-documenting rejection.
- **No API key, no problem.** If `@anthropic-ai/sdk` isn't installed, or
  the SDK has no credentials (it reads `ANTHROPIC_API_KEY` from the
  environment), `resolveClientNames` logs a warning and returns no new
  resolutions — every affected candidate falls back to
  `buildFallbackClientName`, a deterministic name derived from the client
  domain's brand label (`coca-cola.com` → "Coca-Cola") or, failing that,
  the project title's leading segment before a `:`/`×`/`|`. The scrape
  still completes and writes a valid `agencies.json`; only the polish of
  those particular names is deferred until the pass can run with
  credentials.

### Known limitations

- **Domain → eTLD+1 extraction** (`getRegistrableDomain` in the script) is a
  small hardcoded list of common two-label ccTLD suffixes (`co.uk`, `com.au`,
  `co.nz`, …), not a full Public Suffix List — no new dependency was added
  for this. It's correct for every domain seen in practice so far (including
  tricky ones like `resn.co.nz`), but an agency on an unlisted ccTLD suffix
  could compute a wrong eTLD+1.
- **`services` and `teamSize`** are always `[]` / `null`. Neither the
  directory cards nor the profile pages expose per-agency service tags or
  team-size buckets in the HTML — only global directory *filter* facets exist
  (`/directory/web-design/`, `/directory/agency-studio/`, etc.), which don't
  tell us which facets a given listed agency actually matches without a much
  larger crawl (fetching every facet page and cross-referencing). Left as a
  possible future enhancement rather than guessed at.
- **`location.countryCode`** comes from a hardcoded country-name → ISO
  3166-1 alpha-2 map covering every country used as an Awwwards directory
  facet at the time of writing. A country name outside that map resolves to
  `null`, not a guess.
- **The client list is recent work, not a complete history.** A profile
  page shows roughly 20-90 of an agency's most recent submissions — however
  many awarded projects it has, that's the ceiling on what `clients` can be
  built from. Older client relationships that predate an agency's visible
  submissions simply aren't recoverable from this source.
- **Platform-hosted client domains are ambiguous by construction.** A live
  URL on a shared host like `squarespace.com` could be the platform's own
  showcase, or a real client's site on a subdomain
  (`brand.squarespace.com`) — no rule can tell those apart from the domain
  alone. `GENERIC_HOST_DOMAINS` (in the script) only lists hosts that are
  *never* a client (`vercel.app`, `webflow.io`, `wixsite.com`, …);
  ambiguous cases like `squarespace.com` are deliberately left off that
  list, and fall to the client-name normalisation pass to accept or reject
  case by case (see "Client names" above).

## Semrush Agency Partners importer

Imports SEO agency profiles from the [Semrush Agency Partners directory](https://agencies.semrush.com)
and writes them to `lib/directory/data/seo-agencies.json`. Unlike the
Awwwards script, this source is a public JSON API, not server-rendered HTML —
there's no DOM to parse and no `jsdom` dependency involved.

### Usage

```bash
node scripts/directory-import/import-semrush.mjs              # default: top 60 (what's shipped)
node scripts/directory-import/import-semrush.mjs --limit 25   # a smaller capped run, e.g. for a quick test
node scripts/directory-import/import-semrush.mjs --limit=25   # = form also works
node scripts/directory-import/import-semrush.mjs --limit all  # the entire qualifying pool, uncapped (~295 agencies)
```

The script always overwrites `lib/directory/data/seo-agencies.json` with the
full result of that run (it does not merge with the previous file).

### How it works

The SEO category is **premium-only**: an agency qualifies only if its
cheapest listed project budget (`Agency.budgetFloorUsd`) is at or above
`SEO_MIN_BUDGET_FLOOR_USD` ($5,000). The full qualifying pool (~295 agencies)
is always computed and ranked, but the **default is the top 60 of it**
(`DEFAULT_LIMIT`) — that's what's actually shipped in
`lib/directory/data/seo-agencies.json`, so running this script with no flags
reproduces the committed file rather than silently regenerating a much
bigger one. Pass `--limit all` for the entire qualifying pool uncapped, or
`--limit N` for any other size.

Two JSON endpoints, used very differently from each other:

1. **The listing** (`GET /api/agencies/?services=<id>&...&pageNumber=<n>`) —
   40 agencies per page. The `services` filter takes **leaf** service ids
   only, OR'ed together via repeated params; passing SEO's own **parent** id
   (`9`) returns zero results — a real trap. The 12 leaf ids under SEO are
   hardcoded in `SEO_LEAF_SERVICES`. This union produces 36 pages / ~1419
   agencies, matching the human-facing `/list/seo/` count (checked as a
   plausibility warning at runtime, not a hard assertion — Semrush is free to
   add/remove agencies or leaf services at any time). Listing items already
   carry a `budgets` array, so the premium filter (below) costs no extra
   requests.
2. **The profile** (`GET /api/agencies/<alias>/`) — the full record: reviews,
   services tree, industries, budgets, offices, founding year, awards/
   certifications, client logos, success stories, and more.

The script does **not** just take the first N listing results and fetch
their profiles. Semrush's own listing order openly mixes in paid placements
(`paidPlacements` in the listing response), so doing that would silently
rank paying agencies highest. Instead:

1. All 36 listing pages are walked first (cheap — no profile fetches yet),
   collecting a slim `{alias, name, rating, reviewCount}` per agency, where
   `rating` is each agency's `score` field (see the `rating` bullet below —
   the same field the final output uses, not `reviews.rating`).
2. Each agency's `budgetFloorUsd` is computed from that same listing response
   and anything below the $5,000 floor is dropped right here — **before**
   ranking and **before** any profile fetch, so a profile is never fetched
   for an agency that can't qualify. This is NOT done via the API's own
   `budgets=` query param: that param means "will accept work in this
   band", not "this is the agency's cheapest band" — tested during
   development, and `budgets=5` (the $10-25k band) still put WebHopers
   Infotech first even though its actual floor is $1,000. See
   `SEO_MIN_BUDGET_FLOOR_USD`'s doc comment for the full story.
3. Every qualifying candidate is ranked by a **shrinkage-adjusted** score:
   `rating * (reviewCount / (reviewCount + 5))` — a lone 5.0-with-1-review
   cannot outrank a well-reviewed 4.8-with-453 this way (see
   `computeRankingScore`'s doc comment for the full reasoning). Agencies with
   no reviews score `0` and sort last, tied-broken by name.
4. The ranked pool is capped to the top `--limit` (default `60` — what's
   shipped; pass `--limit all` for the entire ranked pool uncapped) before
   any profile fetch happens.
5. Built records are deduped by **registrable domain**, keeping the first
   (best-ranked) occurrence — matching the Awwwards script's own "unique by
   registrable domain, never by name" rule. This runs post-fetch, not at the
   listing stage: the listing payload has no `website` field at all, only
   the profile does, so the domain simply isn't knowable any earlier. The
   source needs this imposed on it — Semrush carries two separate listings
   for one real agency (`twotreesppc` / "Two Trees PPC" and `twotreesppc-2`
   / "Two Trees", both `twotreesppc.com`), and `lib/directory/agencies.ts`'s
   `mergeAgencySources` already dedupes by domain at read time, so the loser
   of the pair would sit in this file forever as a record that can never
   render — overstating the file's own count for no benefit. A `null`
   domain is never treated as an identity to match on here, same rule as
   `mergeAgencySources` uses (two agencies with an unresolvable domain are
   not assumed to be the same agency).

Before ranking or any profile fetch happens, the script checks the
qualifying pool's size (not the `--limit`-capped output) against a
plausibility range (250–350, expecting ~295) and **refuses to write the
output file** if it's wildly off — see `QUALIFYING_COUNT_MIN`/`MAX` in the
script. That would mean Semrush's budget-band semantics moved out from
under this importer, and writing a file gated on a broken filter would be
worse than writing nothing. (With `--limit all`, ~295 qualifying becomes
~294 written after duplicate-domain deduping; with the default `--limit 60`,
far fewer duplicates are ever encountered since only the top 60 get fetched
at all — the committed file happens to have none.)

`budgetFloorUsd` is computed a second time after the profile fetch, from the
profile's own `budgets` (not the listing's) — see the `budgetFloorUsd`
bullet below for why, and for what happens on the rare disagreement.

The run summary logs the qualifying pool size, profiles fetched, and records
written, so it's clear how much of the directory passed the floor versus how
much was actually enriched.

### Field mapping notes

A few fields are worth calling out because the mapping isn't a straight
rename:

- **`website`** decodes HTML entities in the raw href BEFORE parsing it as a
  URL, then strips `utm_*` query params. A small number of records (e.g.
  Kova Team, Ironpaper) carry a literal, un-decoded `&amp;` between query
  params instead of a real `&` — almost certainly an href that was
  HTML-escaped once upstream and never unescaped. Left undecoded, the literal
  `&` inside `&amp;` becomes a real param separator, splitting off a bogus
  `amp;utm_medium` key that the `utm_` prefix check doesn't recognise, so the
  tracking param survives. See `normalizeWebsiteUrl`'s doc comment.
- **`budgetFloorUsd`** is the lower bound, in whole USD, of an agency's
  CHEAPEST budget band — a true minimum computed across every band by id
  (`BUDGET_BAND_FLOOR_BY_ID`: 1→$0, 2→$1,000, 3→$2,500, 4→$5,000,
  5→$10,000, 6→$25,000), never `budgets[0]`. Every payload seen happened to
  list bands ascending, but nothing guarantees that, and this number now
  gates the entire SEO category — see `resolveBudgetFloorUsd`. `null` when
  `budgets` is absent/empty, and null does **not** count as qualifying for
  the $5,000+ filter (unknown floor ≠ any floor accepted). Computed
  independently at the listing stage (for filtering) and again from the
  profile's own `budgets` for the written record; if the two ever disagree
  for one agency, the record is dropped post-fetch rather than trusting the
  listing-stage filter alone (see the defensive check in `main()`).
- **`rating`** comes from `agency.score`/`reviews.total`, never from
  `reviews.rating`. This is the opposite of the obvious reading, and was
  wrong in an earlier version of this script — `score` is the number
  Semrush's own profile pages actually render next to the review count
  (`/click-here-digital/` shows "567 reviews · 4.7", and that agency's
  `score` is `4.7`), while `reviews.rating` is a raw sub-aggregate (chiefly
  a Google Maps average) that Semrush computes but does not display as the
  headline rating — for that same agency it's `5`. Publishing `reviews.rating`
  would misstate the figure attributed to the very source `profileUrl` links
  to. `reviews.rating` also clusters hard at exactly 5.0 across the dataset,
  which collapses ranking spread when used for it (see "How it works"
  above) — `score` restores real variation. Null when `score` is
  absent/non-positive or `reviews.total` is `0`. See `resolveRating`'s doc
  comment for the full worked example.
- **`services`** is flattened SEO-group-first, not in raw source order — see
  `flattenServicesSeoFirst`. `agency.services` lists ALL of an agency's
  service lines, not just SEO ones, and the directory card only renders the
  first few entries; without reordering, an SEO-category card could show
  zero SEO services (e.g. "Advertising · Display Ads · PPC" leading for an
  agency whose top billed line item happens to be advertising). This
  reordering is specific to this importer feeding exactly one category and
  is not generic logic to copy into a future multi-category importer.
- **`accolades`** is `agency.awards[].alt` (self-reported award/certification
  labels of mixed provenance) and is deliberately kept separate from the
  zeroed, Awwwards-shaped `awards` tally — see the comment above this field
  in `buildAgencyRecord` and `AgencyAwards`'s doc comment in `types.ts`.
- **`budgetLabel`** renders as "Starting from `<lower bound of the first
  budget band>`", e.g. `[{name:"$5,000 - 10,000"}, ...]` → `"Starting from
  $5,000"`. Only the lower bound of the *first* band is kept; the range and
  any open-ended `+` on the last band are dropped, since a starting-point
  label shouldn't imply a ceiling it never stated. One exception: Semrush's
  lowest band is literally `"$0 - 1,000"`, and "Starting from $0" reads as
  "this agency works for free," which the source doesn't claim — that one
  band is rendered as "Under $1,000" instead, quoting its ceiling rather
  than its (technically true but misleading) floor. See `buildBudgetLabel`.
- **`clients`** comes from `agency.logotypes[].alt`, filtered to drop bare
  image filenames and "Screenshot..." placeholders, matched against
  `agency.successStories` for a `projectTitle` where one mentions the
  client by name. **There is no LLM normalisation pass here**, unlike the
  Awwwards script — Semrush's logo `alt` text is already a clean,
  human-authored brand name ("ASICS", "Under Armour"), not a project title
  that needs a client's identity extracted from it. `domain` and
  `projectUrl` are always `null` (the logo wall carries no per-client link),
  and `notable` is always `false` (no source signal comparable to Awwwards'
  resolved recognisability flag — see `AgencyClient.notable`'s doc comment).
- **`location`** splits an office's comma-joined name ("London, England,
  United Kingdom") on commas: city is the first segment, country is the
  last. A name with no comma at all (just a country) leaves `city` as
  `null` rather than duplicating the country string into it.

### Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--limit N` (or `--limit=N`) | `60` | Caps the ranked, floor-qualifying pool to the top N before fetching profiles. `60` is what's shipped; a smaller value is useful for a quick test run. |
| `--limit all` | — | Takes the entire qualifying pool uncapped (~295 agencies), not a top-N slice. Case-insensitive. |

### Rate limits / politeness

Same delay, concurrency, backoff, and UA as the Awwwards script (occasional
import job, not a production crawler) — one number differs:

- Max **2 concurrent** requests, minimum **1000ms** between request starts.
- Exponential backoff on `429`/`5xx` responses (1s → 2s → 4s), **3 retries**
  max, then the URL is recorded as a failure and the run continues without it.
- A hard cap of **600 real HTTP requests per run** (`HARD_REQUEST_CAP`) —
  raised from the Awwwards script's 300, since `--limit all` fetches a
  profile for the whole qualifying pool (36 listing pages + ~295 profiles is
  already over 300), even though the default run (top 60) uses far fewer.
  Cache hits don't count toward it. If it's hit mid-listing-pagination, the
  script stops paginating early
  and ranks whatever it collected; if it's hit while fetching profiles,
  remaining profile fetches are skipped — either way it degrades gracefully
  rather than crashing.
- Identifies itself honestly: `User-Agent: SuperflowDirectoryBot/1.0
  (+https://usesuperflow.ai; mihir@velt.dev)` — the same bot identity as the
  Awwwards script, since it's the same crawler against a second source, not
  a different actor.

### robots.txt

Fetched and parsed at runtime on every run, same implementation as the
Awwwards script (standard `User-agent:` grouping, `*`/`$` syntax,
longest-match-wins). At the time of writing,
`https://agencies.semrush.com/robots.txt` has **no `User-agent: *` group at
all** — only groups naming other specific bots (`008`, `SiteAuditBot`,
`Semrushbot-SI`, `Yahoo Pipes 2.0`) — so nothing in it matches this bot and
every path defaults to allowed. The runtime fetch/parse still happens on
every run regardless, in case that ever changes; the script does not
hardcode "this API is allowed" anywhere.

### Cache

Every fetched JSON response is cached at
`scripts/directory-import/.cache-semrush/` (gitignored), keyed by a SHA-256
hash of the URL — a **separate directory** from the Awwwards script's
`.cache/`, since these are JSON responses from a different origin, not HTML,
and mixing them would just be confusing to inspect. Same re-run behaviour as
the Awwwards script: a re-run with an equal or smaller `--limit` makes zero
new network requests. To force a fresh import:

```bash
rm -rf scripts/directory-import/.cache-semrush
node scripts/directory-import/import-semrush.mjs --limit 60
```

### Known limitations

- **The listing's pagination param is `pageNumber`, not `page`.** This
  isn't documented anywhere public and was only caught by noticing every
  "page" of results came back identical during development — a `page=N`
  query string is accepted without error but silently has no effect. If a
  future refactor "cleans this up" back to `page`, every page will silently
  become a duplicate of page 1 again with no error to catch it.
- **No LLM normalisation pass**, unlike the Awwwards script's client names
  — see "Field mapping notes" above. This is a deliberate difference, not a
  missing feature: Semrush's client names need no cleanup.
- **`domain` → eTLD+1 extraction** reuses the Awwwards script's
  `KNOWN_TWO_LABEL_SUFFIXES` table verbatim, with the same accuracy caveat
  (not a full Public Suffix List).
- **`clients[].domain` and `clients[].projectUrl` are always `null`.**
  Semrush's client-logo wall is just a name and an image — there's no
  per-client link or site to attribute the way an Awwwards awarded
  submission has one.
- **Only `offices[0]` is used for `location`.** An agency with multiple
  office locations only has its first one represented.
- **The premium filter depends on `BUDGET_BAND_FLOOR_BY_ID` staying accurate.**
  It's a hardcoded id→dollar-amount map (see the constant's own comment), not
  derived from anything Semrush publishes as authoritative. If Semrush ever
  renumbers or re-prices its budget bands, the qualifying-count sanity check
  in `main()` (250–350, expecting ~295) is the tripwire that should catch it
  — a silent id/amount mismatch is exactly the failure mode that check exists
  to surface before a wrong file gets written.

## Branding loader

Validates the browser-sourced branding dataset and writes
`lib/directory/data/branding-agencies.json`.

Unlike its two siblings, **this script makes no network requests at all.**
It has no cache directory, no robots.txt handling and no rate limiting,
because it never fetches anything.

### Why this one is different

The branding category cannot be scraped the way the other two were, and the
reason is worth recording so nobody re-tries the obvious approach:

- **Semrush has the wrong population.** Its branding pool (leaf services
  `30` Brand Strategy, `82` Logo Design, `85` Graphic Design) runs to ~686
  agencies, of which only 53 have a budget floor at or above $10,000 — and
  none of the studios that define this category are in it. Semrush Agency
  Partners is a performance-marketing directory where branding is a
  checkbox, not a population of brand consultancies.
- **Every budget-bearing directory is bot-walled.** Clutch, The Manifest,
  DesignRush, Sortlist and GoodFirms all refuse the honest
  `SuperflowDirectoryBot/1.0` UA that the scrapers identify with
  (Cloudflare challenges and edge 403s). These are precisely the sources
  that publish a minimum project size.
- **Award sources publish no budgets.** D&AD, Transform and Red Dot are
  readable and carry the quality signal, but none of them states what a
  studio charges.

So the records are collected by hand through a browser session and this
script is the gate they pass through. Its governing rule is:

> **Normalise representation, never repair a claim.**

Casing, URL form, whitespace, a derivable slug, a re-summed award total —
those are shapes of the same fact and get fixed silently, with a warning.
A budget, a rating, a `notable` flag, an award tally — those are assertions
about the world, and a wrong one is repaired only by going back to the
source. A record whose assertion is missing or malformed is **rejected**,
never patched to something plausible.

### Usage

```bash
# reads every *.json in scripts/directory-import/inbox/branding/
node scripts/directory-import/load-branding-json.mjs

# explicit batches
node scripts/directory-import/load-branding-json.mjs --input batch-01.json --input batch-02.json

# validate without writing
node scripts/directory-import/load-branding-json.mjs --dry-run
```

The script always overwrites the output file with the full result of that
run (it does not merge with the previous file), so every batch that belongs
in the dataset must be present in the inbox on every run.

### Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--input PATH` (repeatable, `-i`, `--input=PATH`) | every `*.json` in `inbox/branding/` | Batch file(s) to read. |
| `--out PATH` (`-o`, `--out=PATH`) | `lib/directory/data/branding-agencies.json` | Where to write. |
| `--dry-run` | off | Validate and report, write nothing. |
| `--strict` | off | Exit non-zero if any record was rejected. For CI. |

### Input format

`inbox/branding/` is gitignored — the batches are unvalidated intermediates,
and the artefact worth committing is the validated output file.

Batch files are JSON arrays of `Agency`-shaped objects. Parsing is
deliberately **lenient about the wrapper and strict about nothing else**: a
saved chat response often arrives fenced in ` ```json `, prefixed with a
sentence, or wrapped in `{"agencies": [...]}`. Unwrapping those changes no
field of any record, so it is the same class of fix as trimming whitespace.
Everything inside the array is then held to the full contract.

### The admission rule

There are exactly **two routes** into the branding category, and the second
one exists because the $10,000 floor is unsourceable at the top of this
market:

1. **A published floor** at or above `BRANDING_MIN_BUDGET_FLOOR_USD`
   ($10,000). The Clutch/DesignRush route — those directories print a
   minimum project size, so the claim is attributable to `profileUrl`.
2. **Award provenance** — a non-empty `accolades` with `budgetFloorUsd`
   left `null`. The D&AD route. Pentagram, Jones Knowles Ritchie,
   Bulletproof and PORTO ROCHA publish no budget bands anywhere and their
   real floors run far above $10,000; gating on a published number alone
   would admit mid-market shops and exclude exactly the agencies the
   category exists to list.

A record with neither is rejected. **A consequence worth knowing when
reading the data:** a listed agency may have a null `budgetFloorUsd`, so the
constant describes the editorial line the category is curated to, not a
property every record carries.

### Rejections vs warnings

**Rejected** (the whole record is dropped and reported):

- Missing/unparseable `name` or `profileUrl`.
- A `source` outside `clutch` / `designrush` / `dandad` — an unknown source
  has no attribution label, and an entry that cannot say where it came from
  is worse than a missing entry.
- `categories` not containing `branding`.
- A **non-zero `awards` tally.** These sources publish no Awwwards-scheme
  awards, so a non-zero count means someone mapped a D&AD Pencil onto a
  counted field it does not belong in — and `awards.total` is a sort key a
  visitor reads as "Awwwards awards". Zeroing it silently would hide an
  authoring mistake that recurs across a whole batch; failing loudly sends
  it back to `accolades`, where free-text recognitions belong.
- A malformed `rating` — dropping a broken one to `null` would quietly turn
  "we misread the page" into "this agency has no reviews".
- A `budgetFloorUsd` that is neither `null` nor a non-negative whole number.
  `null` ("did not say") and `0` ("takes any budget") are different claims
  and neither may stand in for the other.
- A `budgetLabel` stating a budget while `budgetFloorUsd` is `null` — a
  displayed floor must have a machine-readable one behind it.
- Failing the admission rule above.

**Warned** (record kept, field normalised): a derived `budgetLabel`, a
non-ISO `countryCode` set to null, an unparseable `website`/`logoUrl` set to
null, an implausible `foundedYear` set to null, a missing `scrapedAt` filled
with the run timestamp (safe — it records when *we* collected the record,
not anything the source asserted), a `clients` entry dropped, a `clients`
list truncated to 12, and a `domain` that disagrees with the `website` host.

That last one is worth watching: the website is the more primitive fact so
it wins, but a mismatch usually means two agencies got conflated.

### Dedupe and merge

Records are deduped on **registrable domain**, never on name. A null domain
is never an identity to match on — two agencies whose domain could not be
derived are not the same agency — so every domain-less record survives, the
same rule `mergeAgencySources` applies at read time.

On a collision the higher-priority source wins: **Clutch > DesignRush >
D&AD**. Clutch first because it is the only one of the three that publishes
a minimum project size, and losing that to a D&AD record with no budget
field would drop the agency's floor to `null`.

First-wins applies to every scalar field, exactly like `mergeAgencySources`
— a record's fields and its `profileUrl` must keep describing the same page,
or the attribution link stops backing the data next to it. **`accolades` is
the one exception and is unioned across duplicates.** An award is a fact
about the agency rather than about the directory that listed it, and each
accolade names its own awarding body ("D&AD Wood Pencil 2025"), so it stays
self-attributing wherever it lands. This is what lets a Clutch record —
which carries the budget floor the category gates on — also carry the D&AD
provenance that makes it worth listing.

### Editorial exclusions

`EDITORIALLY_EXCLUDED_DOMAINS` is a domain → reason map of agencies that are
real and correctly reported but should not be listed. A match is reported
separately from a validation failure, because nothing is wrong with the
record — we chose not to list it.

It is an explicit list rather than "just delete the record from the batch",
for the same reason `client-names.json` records a rejected client as an
explicit `null` instead of a missing key: the batches live in a gitignored
inbox and get regenerated by a fresh browser session, so a deleted record
comes back next time with no trace of why it went. An entry here is
permanent and self-documenting.

It is **not** a place to suppress records that fail validation — those are
rejected on their own merits, and fixing them means fixing the data.

Currently one entry: `superunion.com`, defunct since WPP merged Superunion
into Design Bridge and Partners (listed separately, under its own name and
award record). Its site now 404s through a broken redirect, so the record
would give the directory a dead outbound link for an agency nobody can hire.

### Output ordering

The file is sorted by accolade count first, then a shrinkage-adjusted review
score (`value * count / (count + 5)`, matching `computeRankingScore` in
`import-semrush.mjs`), then name. Accolades lead because the category admits
agencies by two different routes and the award route carries the stronger
claim.

The rendered page applies the same ranking, but independently:
`getAgenciesByCategory` re-sorts on read with `compareAgenciesByAccolades`,
so the file's order is a convenience for reading the JSON, not what the page
depends on. See `app/directory/README.md`, "branding ranks on accolades".

### Refusing to write

The script will not write an empty file. Overwriting a good dataset with
`[]` because an inbox was empty or a batch was malformed would silently
empty a live category — the same reasoning behind `import-semrush.mjs`'s
qualifying-count check.

### Known limitations

- **No source verification.** The scrapers can be re-run to check their
  output against the live page; this one cannot. Every field traces back to
  what a browser session reported, and the validation here checks internal
  consistency and plausibility, never truth. `profileUrl` is the only
  recourse — which is why a record missing it is rejected outright.
- **`domain` → eTLD+1 extraction** duplicates the sibling scripts'
  `KNOWN_TWO_LABEL_SUFFIXES` table verbatim, with the same accuracy caveat
  (not a full Public Suffix List).
- **No client-name normalisation pass.** Clutch and D&AD both name clients
  directly, so unlike Awwwards' project titles there is nothing for an LLM
  pass to resolve.
- **`accolades` are unverified self-reported or third-party labels of mixed
  provenance**, exactly as in the Semrush importer — deliberately kept out
  of the counted `awards` tally. See `AgencyAwards` in
  `lib/directory/types.ts`.

## Motion Design Awards importer

Sources the `motion-design` category from
[Motion Design Awards](https://www.motiondesignawards.com), writing
`lib/directory/data/motion-design-agencies.json`.

The third scraper, and the only one whose source is an awards jury with no
commercial data at all. It exists because no business directory carries a
premium motion tier — see the "Motion design" discussion in
`app/directory/README.md` for the sourcing evidence behind that call.

### Usage

```bash
node scripts/directory-import/import-motion-design-awards.mjs
node scripts/directory-import/import-motion-design-awards.mjs --limit=200
node scripts/directory-import/import-motion-design-awards.mjs --limit=all
node scripts/directory-import/import-motion-design-awards.mjs --dry-run
node scripts/directory-import/import-motion-design-awards.mjs --refresh
```

### How it works

The source is a Next.js app, so every server-rendered page embeds its data as
a `__NEXT_DATA__` payload holding a normalised Apollo cache — a flat map of
`"Type:id"` keys cross-referencing each other through `{"__ref": …}`
pointers. No HTML parsing is involved; this is closer to `import-semrush.mjs`
than to the Awwwards scraper.

The crawl is **two-phase**, which is a real departure from the
two-requests-per-agency shape of the other two importers:

1. **Phase 1** walks every project named in `sitemap.projects.xml.gz` (~1,871
   URLs). Each project carries its title, its `awards[]` (`{id, type}` pairs
   such as `{type: "VOTD"}`) and a reference to the credited profile.
   Projects that won nothing are skipped without ever fetching a profile —
   the sitemap lists every published submission, not just winners.
2. **Phase 2** fetches `/profile/<id>` once per distinct award-winning
   profile.

Phase 2 is not an optimisation, it is required. **The Profile object embedded
in a project page is a stripped fragment** (company/city/country/website/
avatar) that carries no `type` field, and `type` is the filter this whole
importer depends on: MDA's leaderboard is roughly half individual
freelancers, and only `type === "STUDIO"` separates them from studios. There
is no way to tell the two apart from a project page alone, and guessing from
the name would put freelancers into a directory that calls itself a list of
agencies.

### Ranking and the `accolades` contract

Every win becomes **one** `accolades` entry naming the award and the project
that took it — `"Video of the Day — Malibu Boats: The M240"`. That is
load-bearing, not cosmetic: `motion-design` is in
`ACCOLADE_RANKED_CATEGORIES`, so `accolades.length` *is* the sort key on both
the server and the client. Collapsing repeats into `"Video of the Day ×31"`
would flatten a 40-award studio to a single point and silently destroy the
ranking.

Award codes are expanded from a label map lifted from MDA's own
`pages/winners/[[...type]]` bundle and cross-checked against the six
`/winners/<code>` routes in `sitemap.static.xml`: HM, VOTD, VOTM, VOTY, DOTY,
SOTY. A code with no confident expansion falls back to a generic string
rather than being guessed at — a wrong award name is a false claim about a
jury's verdict.

Honorable Mentions count the same as any other win, matching how the
`web-design` category sums `honorableMentions` into `awards.total`. This was
checked rather than assumed: HM is 8.9% of the top ten's accolades and ~9.5%
of the shipped set, so the ranking is driven by Video of the Day rather than
by HM volume.

`awards` is written as all zeros. That tally is Awwwards' scheme, and calling
a Video of the Day a "Site of the Day" would misattribute one jury's verdict
to another.

### Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--limit=<n>` | `60` | Publish the top N studios by award count. |
| `--limit=all` | — | Publish every qualifying studio, uncapped. Case-insensitive. |
| `--dry-run` | off | Collect and report without writing the JSON file. |
| `--refresh` | off | Skip cache reads (writes still happen, refreshing the cache). |

### Rate limits / politeness

`MAX_CONCURRENCY = 2`, three retries with exponential backoff from 1s, and
`HARD_REQUEST_CAP = 4000` — sized for the theoretical worst case of 1,871
projects plus 1,871 profiles, well above the ~2,470 a real run uses. Identifies
honestly as `SuperflowDirectoryBot/1.0`; never spoofs a browser UA.

### robots.txt

Fetched and parsed at runtime, failing closed. MDA serves a Cloudflare
content-signals file that is entirely comments — no `Disallow`, and no signal
set to `no` — so nothing is restricted. The projects sitemap is explicitly
published for crawlers, which is what makes the enumeration path the
sanctioned one rather than probing the undocumented GraphQL endpoint behind
the site.

### Cache

`.cache-mda/`, separate from `.cache/` and `.cache-semrush/` so the three
importers can never collide. By far the largest of the three at roughly
640 MB, and gitignored. It is also what makes the crawl resumable: the fetch
helpers check disk before touching the network, so an interrupted run picks
up where it stopped instead of restarting.

### Known limitations

- **No budget, rating, team size, client names or services, ever.** The
  source publishes none of them; the importer writes `null`/`[]` rather than
  synthesising values. The category's copy is written to promise none of
  them either.
- **Only award-winning studios are reachable.** A studio that has never won
  an MDA award is invisible to this importer by construction, so the category
  is a list of award winners rather than a census of the industry.
- **Coverage skews to MDA entrants.** Submitting costs money, so studios that
  don't enter are absent regardless of reputation — several blue-chip names
  (BUCK, ManvsMachine, Framestore) sit in D&AD's index but not here.
- **`type` is trusted as reported.** A studio that registered as an
  individual, or vice versa, is filtered on the source's own label with no
  second opinion.
