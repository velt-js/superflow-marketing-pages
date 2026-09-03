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
   (the listing only has country) and the profile description.

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
