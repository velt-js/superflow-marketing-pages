# Awwwards directory scraper

Scrapes agency/studio profiles from the [Awwwards directory](https://www.awwwards.com/directory/)
and writes them to `lib/directory/data/agencies.json`, conforming exactly to the
`Agency` interface in `lib/directory/types.ts`. Categories and shared string
constants live in `lib/directory/constants.ts`; this script mirrors the ones it
needs (see the comment at the top of the script) rather than importing them,
since it's a plain Node ESM script with no TypeScript build step.

## Usage

```bash
node scripts/directory-import/scrape-awwwards.mjs             # default: 60 agencies
node scripts/directory-import/scrape-awwwards.mjs --limit 200 # more agencies
node scripts/directory-import/scrape-awwwards.mjs --limit=25  # = form also works
```

The script always overwrites `lib/directory/data/agencies.json` with the full
result of that run (it does not merge with the previous file).

## How it works

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
profile pages only ever show HM/SOTD/SOTM/SOTY counts.

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `--limit N` (or `--limit=N`) | `60` | Max number of unique agencies to collect. |

## Rate limits / politeness

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

## robots.txt

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

## Cache

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

## Client names

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

## Known limitations

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
