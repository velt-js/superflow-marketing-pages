# Agency directory (`/directory`)

A programmatic directory of agencies, browsable by category, with a full
detail page per agency.

| Category | Route | Source | Data file | Ranked on | Filtered to |
| --- | --- | --- | --- | --- | --- |
| Web Design | `/directory/web-design` | Awwwards | `lib/directory/data/agencies.json` | Award total | — |
| SEO | `/directory/seo` | Semrush Agency Partners | `lib/directory/data/seo-agencies.json` | Client review score | Projects from $5,000 |
| Branding | `/directory/branding` | Clutch, DesignRush, D&AD | `lib/directory/data/branding-agencies.json` | Accolades, then review score | Projects from $10,000 **or** award provenance |
| Motion Design | `/directory/motion-design` | Motion Design Awards | `lib/directory/data/motion-design-agencies.json` | Accolades (= award count) | Top 60 by award count |

Counts at time of writing: 60 web design, 60 SEO, 143 branding, 60 motion
design.

**One data file per writer, merged at read time.** Each script under
`scripts/directory-import/` overwrites its own file wholesale on every run,
so a single shared file would mean each script's run wiped the others'
records. `mergeAgencySources` in `lib/directory/agencies.ts` recombines them
for reading, deduping by registrable `domain` and then by `slug` (earlier
arguments win any collision, so Awwwards beats Semrush beats branding
beats motion design).

Note the rule is one file per **writer**, not one per source directory: the
branding file holds records from three directories because one loader writes
all three.

**The branding category is sourced differently from the other two, and
deliberately so.** It has no scraper. Clutch, DesignRush, Sortlist, The
Manifest and GoodFirms — the only directories that publish a minimum project
size — all refuse the honest bot UA the scrapers identify with, and the
award sources that are readable (D&AD, Transform, Red Dot) publish no
budgets at all. So its records are collected by hand through a browser
session and validated on the way in by
`scripts/directory-import/load-branding-json.mjs`, which is a validation
gate rather than an importer. Its README section is the reference for what
it rejects and why.

**It is also the one category with two admission routes**, because the
$10,000 floor is unsourceable at the top of that market: a published floor
at or above `BRANDING_MIN_BUDGET_FLOOR_USD`, **or** award provenance (a
non-empty `accolades`) with `budgetFloorUsd` left `null`. A branding record
may therefore have a null floor — the constant names the editorial line the
category is curated to, not a property every record carries.

**Motion design has no budget gate at all, and that is a property of the
market rather than a gap to fill later.** Nobody publishes minimum project
sizes for motion design. The directories that publish floors for other
disciplines either bot-wall automated access (Clutch, Sortlist and GoodFirms
return edge 403s — Clutch on `robots.txt` itself) or, where reachable, carry
general video-production shops rather than motion specialists: of 50
companies sampled on DesignRush's US motion-graphics listing, two reached its
"$50,000 & Up" band. Semrush has no motion taxonomy whatsoever — no
Animation, Motion Graphics or Motion Design leaf service exists, only broad
"Video Production" (~380) and "Video Marketing" (~523) buckets whose top
results are digital-marketing generalists. Awwwards has no motion facet
either.

So the category is gated on jury awards instead. Every record holds at least
one Motion Design Awards win, and the published set is the top
`MOTION_DESIGN_PUBLISHED_LIMIT` by award count. **247 studios hold at least
one win**, so the shipped 60 is the top ~24% of the real pool rather than
most of what exists — there is headroom below it if the category is ever
widened (`--limit=all` ships all 247). "Premium" here means craft
reputation, not spend — the studio that set the bar for this category, Buff,
is a 2–10 person shop in Brighton.

**Its records are null-heavy, and that is correct.** Motion Design Awards is
an awards jury, not a business directory: it publishes no services, no team
size, no client names, no ratings and no budgets. The importer writes those
fields as `null`/`[]` rather than synthesising them, and the category's
subheading and meta description deliberately promise none of them.

Websites are the one field that is sometimes absent — 5 of the 60 records
carry a null `website`/`domain`, and those cards render without an outbound
site link. Logos, against expectation, are complete: all 60 resolve a real
image on `storage-01-mda.keyfram.es`. The importer still writes `null` when
it cannot extract one, because the source's avatar field carries a base64
placeholder alongside the real `srcSet`, and a `data:` URI must never reach
`logoUrl`.

**Its award wins live in `accolades`, never in `awards`.** The `awards` tally
is Awwwards' scheme; calling a Video of the Day a "Site of the Day" would be
a false claim about a different jury. Each win is one `accolades` entry
naming the award and the project that took it, so the array's length is the
studio's award count — which is what `ACCOLADE_RANKED_CATEGORIES` then sorts
on.

**A category may be a filtered slice of its source, and the SEO one is —
through two cuts.** Its source lists roughly 1,400 SEO agencies, most of
which take sub-$2,500 work; a directory that lists all of them helps nobody
choose.

1. **A hard qualifying bar** — agencies whose *minimum* project is
   `SEO_MIN_BUDGET_FLOOR_USD` ($5,000) or more. About 295 of the ~1,400
   clear it.
2. **A cap** — those are ranked by review score (see "Review ranking") and
   the top 60 published, matching the web design category's size and the
   importer's `DEFAULT_LIMIT`.

So the category is "the 60 best-reviewed agencies that take $5,000+ work",
not "every agency above $5,000". A useful side effect of the cap: **every
published SEO record has reviews.** Roughly a third of the qualifying pool
has none, scores zero under the shrinkage ranking, and would otherwise sit
at the bottom of a listing that claims to be ranked on reviews.

The threshold lives in `lib/directory/constants.ts`; both cuts are enforced
by the importer at collection time, so a below-threshold agency is never
fetched, let alone written, and the pages themselves have no filtering to
do and cannot drift from the rule. Changing either means re-running the
importer.

The category's own subheading states the floor outright. That is not
optional copy: a visitor comparing this against the full source listing
should be told why the cheaper agencies are missing, rather than being
left to assume the directory is incomplete.

**Categories are ranked on different, non-interchangeable signals**,
because their sources publish different things. Awwwards is an awards jury
and publishes no reviews; Semrush is a business directory and publishes no
award tallies. So `Agency.awards` is all-zeros for every Semrush record and
`Agency.rating` is null for every Awwwards record — both are correct, not
missing data. `compareAgenciesDefaultOrder` reads both keys in sequence, but
they never actually compete inside one category: it is one comparator
serving two disjoint slices, not an attempt to rank an award against a
review. See the `AgencyRating` doc comment in `lib/directory/types.ts` for
why the two are kept structurally apart.

## Routes

- `app/directory/page.tsx` — hub page. Lists every category in
  `DIRECTORY_CATEGORIES`, each with a count of indexed agencies (or a
  "coming soon" label while that category's data is still empty). Built on
  the shared `ListingPage` / `ListingGrid` components (the 2026 set in
  `components/listing-2026/`, same as `/use-case` and `/user-persona`), so
  adding a category needs **no edit here**.
- `app/directory/[category]/page.tsx` — category detail page. Statically
  generated for every slug in `DIRECTORY_CATEGORIES` via
  `generateStaticParams`; any other slug 404s via `notFound()`. Header is
  `components/directory/CategoryHero.tsx` — the shared blue-gradient 2026
  hero, closing on its copy (no stat card — see `.heroNoCard` in
  `DirectoryHero.module.css`). Agencies render
  as a card grid (`components/directory/AgencyGrid.tsx` → `AgencyCard.tsx`,
  each carrying a one-line "Worked with X, Y, Z +N more" summary),
  sorted in the directory's default order: Superflow partners first, then
  total award count descending, then review score descending, then name.
  The two credibility keys are disjoint per category (see the top of this
  file), so in practice web-design sorts on awards and SEO on reviews. Each
  card's body — everything above its footer rule — links through to that
  agency's detail page; only the footer's two outbound links go elsewhere.
  See "Category page controls" below for the search/filter/sort layer on
  top of this grid.
- `app/directory/agency/[slug]/page.tsx` — agency detail page. **Flat**
  route, deliberately not nested under a category — `Agency.categories` is
  an array, so a nested scheme would mint two URLs for an agency in two
  categories. `DIRECTORY_AGENCY_SEGMENT` (`lib/directory/constants.ts`)
  reserves the `agency` slug so a category can never collide with this
  route (enforced at module load by `assertNoReservedCategorySlug`).
  Statically generated for every agency slug in the dataset via
  `generateStaticParams` — dropping N records into `agencies.json`
  produces N pages automatically, no code change. Unknown slug → `notFound()`.
  Renders full content (`components/directory/AgencyDetail.tsx`): a gradient
  hero carrying the breadcrumb, logo, name, location, the prominent outbound
  "Visit website" CTA, the source attribution link and a white facts card
  (clients on record / total awards / category), then white cards below it
  for the description, the "Worked with" client list, services and the
  complete award breakdown, plus a
  data-derived "more agencies" block (`components/directory/RelatedAgencies.tsx`,
  capped at 6 — same country *and* category first, then category alone,
  then country alone) so pages interlink instead of being orphaned behind
  the category listing.

## Design system

These pages are on the 2026 design system, the same one the homepage,
`/integrations` and `/case-study` use — `SiteNav`/`SiteFooter` from
`components/home-2026/`, the blue-gradient hero bitmap, Adamina serif
headlines over Urbanist/Poppins, and the light card idiom (`#fbfbfd` fill,
`#ececf1` hairline, 20px radius, `#433df3` accent). The directory's own
pieces live in four CSS modules under `components/directory/`:

- `DirectoryHero.module.css` — the gradient hero shared by the category page
  and an agency profile, including the white facts card the profile closes
  on (the category page's `.heroNoCard` variant closes on its copy instead).
- `DirectoryGrid.module.css` — the white grid section, the search/country/sort
  control bar, and both empty states. Shared by `AgencyGrid`, `AgencyExplorer`
  and `RelatedAgencies` so the halves of one visual section can't drift.
- `AgencyCard.module.css` — the category-grid card.
- `AgencyDetail.module.css` — the profile's content cards.

**Hover on cards and buttons is gated behind
`@media (hover: hover) and (pointer: fine)`, and must stay that way.** Touch
browsers emulate `:hover` on tap; with the card's `translateY(-2px)` lift
ungated, the card slid out from under the finger between touchstart and
touchend and swallowed the tap — which showed up as the partner badge
refusing to open on a phone. See the note in `AgencyCard.module.css` and the
"partner badge on touch" tests.

## Where the data comes from

- `lib/directory/types.ts` — the shared `Agency` / `DirectoryCategory`
  contract. Treat it as an interface: both the scraper and these pages
  import from it, so a field change means changing both sides together.
- `lib/directory/constants.ts` — `DIRECTORY_CATEGORIES` (the category
  registry), `DIRECTORY_BASE_PATH`, `DIRECTORY_AGENCY_SEGMENT`, and source
  attribution labels.
- `lib/directory/data/agencies.json` — the Awwwards dataset (`web-design`).
  Written by `scripts/directory-import/scrape-awwwards.mjs` (a separate,
  non-TS pipeline), read by `lib/directory/agencies.ts`. Starts as `[]` and
  is expected to hold a few hundred records at runtime; every page and
  helper here is written to degrade to an empty state rather than crash
  when it's empty or when a category has no matches yet.
- `lib/directory/data/seo-agencies.json` — the Semrush dataset (`seo`),
  the top-60 slice of the $5,000+ pool described above. Written by
  `scripts/directory-import/import-semrush.mjs`, same contract, same
  degradation rules. **Kept as its own file on purpose** — see the
  note under the category table at the top of this file, and
  `mergeAgencySources` in `lib/directory/agencies.ts`. Adding a new
  **writer** means adding a new file and a new merge argument, never
  appending into an existing one.
- `lib/directory/data/branding-agencies.json` — the branding dataset
  (`branding`), holding Clutch, DesignRush and D&AD records. Written by
  `scripts/directory-import/load-branding-json.mjs`, which validates a
  hand-collected dataset rather than scraping one — same contract, same
  degradation rules. Ships as `[]` until a browser session has been run;
  the hub card shows "Coming soon" until then.
- `lib/directory/data/motion-design-agencies.json` — the Motion Design Awards
  dataset (`motion-design`). Written by
  `scripts/directory-import/import-motion-design-awards.mjs`. Unlike the
  branding file this one IS scraped, so a re-run needs no browser session.
- `scripts/directory-import/client-names.json` — the memoised brand-name
  resolutions behind the client list (see "Client list" below). Committed on
  purpose: it makes a re-scrape cheap and deterministic, and it is the file
  you hand-edit to correct a mis-resolved brand name.
- `lib/directory/data/partners.json` — the Superflow partner list (see
  "Superflow partner badge" below). Written by hand from a CRM/billing
  export, read by `lib/directory/agencies.ts`. Ships with an empty
  `domains` array; keep it that way until someone has a real export to
  paste in.
- `lib/directory/data/partners.preview.json` — same shape, sample data,
  read **only** when `NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1` (see
  "Previewing the badge" below). Not real customers; never merge it into
  `partners.json`.
- `lib/directory/agencies.ts` — the only module that reads the JSON files
  directly. Pages should go through these helpers rather than importing
  the JSON files themselves. Notable exports: `getAgenciesByCategory`,
  `getAgencyCountByCategory`, `getDirectoryCategory`, `getAgencyBySlug`,
  `getAllAgencySlugs`, `agencyPath` (the single place the detail-page URL
  is assembled), `getRelatedAgencies`, `buildAgencyMetaTitle` /
  `buildAgencyMetaDescription` (per-agency, composed from real fields —
  see below), `buildAgencyOrganizationJsonLd`, `formatAgencyLocation`,
  `getAwardBreakdown`, `formatAgencyRating` / `getAgencyRatingScore` (the
  review-based counterparts, see "Review ranking" below),
  `mergeAgencySources`, `resolveAgencySourceLabel`, `isSuperflowPartner`,
  `buildAgencyListItems` / `AgencyListItem` (the slim, client-safe
  projection behind the category page's controls), and the thin-content
  gate described next.

## Thin-content guard

`shouldIndexAgency(agency)` returns false only when an agency fails **every**
substance signal. Each is independent — clearing any one is enough:

| Signal | Bar |
| --- | --- |
| Description | ~80 characters or more of real prose |
| Awards | at least `MIN_AWARDS_FOR_INDEXING` |
| Named clients | at least `MIN_CLIENTS_FOR_INDEXING` |
| Client reviews | at least `MIN_RATING_REVIEWS_FOR_INDEXING` behind a rating |
| Services | at least `MIN_SERVICES_FOR_INDEXING` listed |

Failing all of them at once is thin content by Google's scaled-content
standards even though the page itself renders correctly — but an agency
with three named clients and no blurb still qualifies on the client list
alone, and a well-reviewed agency with a real service list qualifies on
those. The last two signals were added with the SEO category: a Semrush
record has no awards by construction, so without them a genuine,
well-reviewed agency would have been held back for failing an
Awwwards-shaped test it could never pass. Held-back agencies:

- Still get a full, working detail page (still linked from their category
  and from other agencies' "more agencies" blocks).
- Get `robots: { index: false, follow: true }` via `buildPageMetadata`'s
  `noindex` option in `generateMetadata`.
- Are excluded from `app/sitemap.ts` (`getIndexableAgencySlugs()` is what
  the sitemap maps over, not the full agency list).

`getAgencyIndexingSummary()` returns `{ total, indexable, heldBack }` for
sanity-checking how much of a given scrape actually clears the bar.

## Review ranking

The SEO category has no award tallies to rank on, so it ranks on the review
score its source publishes. Two things about that are deliberate.

**The score is the one Semrush displays, not the raw one it stores.** The
Semrush API exposes both `agency.score` (what the profile page renders as
the agency's rating) and `reviews.rating` (a raw sub-aggregate, largely the
agency's Google Maps average). These disagree: `click-here-digital`'s page
reads "567 reviews · 4.7" while its `reviews.rating` is `5`. We render the
rating right next to an attribution link back to that profile, so
publishing the number the profile does *not* show would contradict our own
citation. `import-semrush.mjs` maps `rating.value` from `score`. Do not
"fix" it to `reviews.rating`.

**A rating is weighted by how many reviews are behind it.**
`getAgencyRatingScore` applies shrinkage rather than sorting on the raw
average:

```
value × reviewCount / (reviewCount + RATING_PRIOR_REVIEWS)   // prior = 5
```

Sorting on the bare average would put a single unverifiable 5.0 review
above a 4.8 averaged over hundreds. The prior blends in five neutral
"phantom" reviews, so a score has to be *earned across volume* to rank.
Agencies with no reviews score 0 and sort last — which is why an agency can
be well known in the field and still not appear: the category is ranked on
published client reviews, and an unreviewed agency has none. That is a
property of the ranking, not a bug in the import.

The same score is the `"Client rating"` sort mode in `AgencyExplorer` and
the third key in `compareAgenciesDefaultOrder`.

### Branding ranks on accolades, not on the award tally

`compareAgenciesDefaultOrder` was written for two categories whose signals
never compete — Awwwards records carry awards and no rating, Semrush records
carry a rating and no awards, so whichever is absent falls through to the
next key. **The branding category breaks that assumption.** Every branding
record has `awards.total === 0` (its award wins live in `accolades`, which
that comparator does not read), so ranking it there fell straight through to
review score — and the D&AD-sourced studios have no reviews anywhere. When
the category was first populated this put Pentagram 126th of 144 and Wolff
Olins 140th, below shops with a dozen reviews and no awards.

So branding sorts with `compareAgenciesByAccolades` instead: partners, then
accolade count descending, then the same review score, then name.

**Motion design is the same problem one step further.** Its records have
`awards.total === 0` *and* no rating at all, so the default comparator would
fall past both keys to the name tiebreaker and render the category
alphabetically — exactly the bug the SEO category shipped with, on a page
whose own heading claims it is ranked. It is in
`ACCOLADE_RANKED_CATEGORIES` for that reason. Its accolades carry one entry
per win, so accolade count *is* award count and the sort is a genuine award
ranking rather than a proxy for one.

**The swap is scoped to named categories, not global** — see
`ACCOLADE_RANKED_CATEGORIES` in `lib/directory/constants.ts`. Accolades mean
different things by source: in branding they are D&AD Pencils, but half the
SEO records carry self-reported badges ("Top Advertising Company", BBB
awards), and ranking on those would promote the most self-congratulatory
agencies over the best-reviewed ones.

**Both sides of the ranking must agree.** The server sorts in
`getAgenciesByCategory`; `AgencyExplorer` re-sorts the same list on the
client for its "Top ranked" mode, so `compareByAccoladeRanking` there is a
mirror of `compareAgenciesByAccolades` here and the two must stay identical
or the page reorders itself on hydration. Both read
`isAccoladeRankedCategory`, which lives in `constants.ts` rather than
`agencies.ts` precisely so the client can import it — `agencies.ts` imports
the JSON datasets, and taking a *value* from it in a `"use client"` file
would ship the whole directory into the browser bundle.

## Budget: label vs floor

Two fields, deliberately not one:

- `budgetLabel` — the display string ("Starting from $5,000", "Under
  $1,000"). What the card footer and the detail page's facts list render.
- `budgetFloorUsd` — the same thing as a number (`5000`), which is what the
  SEO category's threshold is applied against.

Neither derives cleanly from the other. Re-parsing a number out of the
label is brittle the moment a source localises its currency formatting, and
rendering the bare number loses the band phrasing the source actually
chose. So the importer writes both, from the same parse, in one place.

Two traps worth knowing, both real:

- **`null` is not `0`.** Null means the source listed no budget bands at
  all; zero means the agency explicitly accepts work at any budget. A
  filter written as `(floor ?? 0) >= threshold` treats "didn't say" as
  "free", which is how an unqualified agency ends up in a premium listing.
- **The floor comes from the *cheapest* band, taken by `min`, not from
  `budgets[0]`.** Every payload observed so far happens to be ascending,
  but nothing guarantees it, and an unsorted array would yield a wrong
  floor with no visible symptom — the record would just quietly sit in the
  wrong category.

Note also that the source's own `budgets=` API filter answers a different
question — "will this agency accept work in this band" — so it cannot
express "premium only". `import-semrush.mjs` computes the floor
client-side for exactly this reason; see its comment before swapping it
for the server-side filter.

## Accolades vs awards

`Agency.accolades` (Semrush) and `Agency.awards` (Awwwards) are **not** the
same kind of claim and the UI must never present them as interchangeable:

- `awards` is a counted tally from one known scheme with a public jury. It
  can be summed, compared and ranked — which is what the web-design
  category does.
- `accolades` is free text pulled from images the agency uploaded to its
  own profile. The alt text mixes genuine awards ("UK Search Awards") with
  vendor certifications ("Google Search Ads", "ISO Certification"). It is
  self-reported and unverified, so it can only be listed, never counted or
  ranked.

That is why they are separate fields rather than one, why nothing computes
an accolade *count* as a credibility figure, and why the detail page
section is headed "Awards & certifications" and attributed to the source
profile rather than stated in our own voice.

## Client list

Each agency carries the brands it has shipped work for — surfaced as a
one-line "Worked with X, Y, Z +N more" summary on
`components/directory/AgencyCard.tsx`, and as a full "Worked with" card on
`AgencyDetail.tsx` pairing each client with the project it came from.

- **Where it comes from (Awwwards):** `clients: AgencyClient[]`
  (`lib/directory/types.ts`) is populated by
  `scripts/directory-import/scrape-awwwards.mjs` from the awarded
  submissions already listed on the profile page it fetches anyway — each
  submission carries a client's live URL and a project title, so collecting
  clients costs zero extra HTTP requests. There is no "clients" section in
  Awwwards' markup to scrape; the submissions grid *is* the source. See that
  script's "Client extraction" section.
- **Where it comes from (Semrush):** `import-semrush.mjs` reads the client
  logo wall on the profile, whose `alt` text is already a clean brand name
  ("ASICS", "Under Armour", "N Brown"), and pairs each with a matching
  success-story title where one exists. **There is no LLM normalisation
  pass on this path and that is deliberate**, not an omission — the source
  publishes usable names directly, so there is nothing to resolve. `notable`
  stays `false` across every Semrush client for the same reason: false means
  "not asserted to be notable", so a uniformly-false list simply preserves
  the source's own ordering rather than inventing a ranking (see the
  `AgencyClient.notable` doc comment).
- **Why it lives on `Agency`:** unlike Superflow partner status, which is
  deliberately kept out of `Agency` because it comes from an external CRM
  export the scraper must never clobber, the client list is *derived by the
  scraper itself* from the same source data as `awards`. There is no
  external source of truth to protect, so it is written onto the record and
  regenerated on every scrape — the same reasoning that puts `awards` there.
- **Name normalisation:** a raw candidate (project title, plus the client's
  registrable domain when the live URL sits on the client's own site) is
  resolved to a display name and a `notable` flag by a batched call to
  Claude inside the scraper, memoised in the committed
  `scripts/directory-import/client-names.json` so each brand resolves once
  across the whole dataset.
- **Hand-correcting a name:** open `client-names.json`, find the key
  (`<client-domain-or-"-">|<verbatim project title>`), and edit its `name` /
  `notable` fields — or set the value to `null` to drop that client from the
  directory. The next scrape reads the edited file as-is.
- **Notable exports:** `getAgencyClients(agency)` returns the display-ready,
  deduped list (deduped by *name* here, separately from the scraper's
  dedupe-by-domain, since one brand reached under two domains would
  otherwise print twice); `formatAgencyClientSummary(agency, limit?)`
  collapses it into the one-line summary shared by the card and the meta
  description.
- Capped at 12 per agency (`MAX_CLIENTS_PER_AGENCY` in the scraper), stored
  with recognisable brands first.
- **Rendering note:** the detail card hides the project title when it adds
  nothing over the client name (`titleAddsDetail` in `AgencyDetail.tsx`) —
  plenty of awarded projects are titled after the client and nothing else
  ("Koenigsegg"), and printing both halves reads as a rendering bug. Client
  names are deliberately **not** links: the one attribution link in the hero
  covers sourcing without leaking a dozen outbound links per profile.
- Feeds two things documented elsewhere here: the thin-content guard counts
  three or more clients as a substance signal, and `searchText` includes
  client names.

## Superflow partner badge

`components/directory/PartnerBadge.tsx` renders an icon-only, verified-style
tick on both the card and the detail page for any agency `isSuperflowPartner`
matches. It renders nothing for a non-partner, so both call sites use it
unconditionally. The mark is a scalloped burst in `--color-superflow-blue`
with a white tick, sized 18px; the burst path is generated (12 lobes,
Catmull-Rom spline), not hand-drawn — regenerate it rather than nudging
points. Styles are in `PartnerBadge.module.css`.

**The badge paints no words, so the claim lives entirely in the tooltip and
the `aria-label`.** The panel carries `PARTNER_BADGE_LABEL` +
`PARTNER_BADGE_DESCRIPTION` (`lib/directory/constants.ts`); the label
deliberately says "partner", not "verified" — see the constant's own
comment. A verified-style tick is a loaded symbol — most people read it as
"identity verified", which is broader than what it means here — so that
copy is what narrows it, not optional decoration.

### How it opens

| Input | Opens via | Notes |
|---|---|---|
| Mouse hover | CSS `:hover` | Gated to `@media (hover: hover) and (pointer: fine)` |
| Tap / click | `.badgeOpen` class | Component state, set in `PartnerBadgeMark` |
| Enter / Space | `.badgeOpen` class | `role="button"` contract; Space is intercepted so the page doesn't scroll |

Dismisses on outside pointer-down, `Escape`, or the user scrolling
(`wheel` / `touchmove`). Those listeners are bound only while open, so a
page of cards adds no idle listeners.

Scroll dismissal deliberately watches the user's scroll **input** rather
than the `scroll` event: `scroll` also fires for programmatic scrolling,
including the smooth scroll-into-view `.focus()` performs when a keyboard
user tabs to a badge far down the page. That scroll is still in flight when
Enter opens the tooltip, so listening to `scroll` let the badge dismiss the
panel it had just opened.

### The client/server split

`PartnerBadge.tsx` stays a **server** component and `PartnerBadgeMark.tsx`
carries the `"use client"` directive. That boundary placement is
load-bearing: `PartnerBadge` calls `isSuperflowPartner`, a real runtime
import from `lib/directory/agencies.ts`, whose module scope imports
`agencies.json`. Marking *that* component `"use client"` would very likely
pull the whole scraped dataset into the browser bundle — the same trap
`AgencyExplorer` avoids with a type-only import (see "Category page
controls"). `PartnerBadgeMark` therefore takes plain strings and imports
nothing from `lib/directory/`. `tests/directory/partner-badge.spec.ts`
guards this, and was confirmed to fail when the boundary is moved up.

### Other things to preserve

- **The tap is intercepted.** On the card the mark sits inside the
  card-wide `<Link>`, so `PartnerBadgeMark` calls `preventDefault()` +
  `stopPropagation()` — otherwise tapping the badge would navigate to the
  agency page instead of explaining the badge.
- **Hover is gated to fine pointers.** Touch browsers emulate `:hover` on
  tap and leave it stuck on the last-tapped element, which would strand the
  panel open with nothing able to dismiss it.
- **Focus does not auto-open it.** `:focus-visible` draws the outline only.
  Tying the reveal to focus as well would fight the explicit toggle, making
  Enter look inert when it closed a panel focus immediately reopened.
- **On the card it adds a tab stop inside the `<Link>`.** Accepted trade
  for the claim being reachable without a mouse.
- **No `title` attribute.** The native tooltip would open on top of the
  styled one after roughly a second and repeat the same sentence.
- The tooltip is `pointer-events: none`, so it cannot swallow taps meant
  for the card link it overlaps.
- **No visible copy repeats the claim.** The badge's tooltip and
  `aria-label` are the only place a category page states it: the hero's
  stat card, which used to carry an "N Superflow partners" count, is gone,
  and the agency detail page has no equivalent.

### Previewing the badge

Because `partners.json` is empty, the badge renders on nobody by default —
which looks identical to it being broken. To exercise it end to end, run
with the preview flag:

```
NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1 npm run dev
```

`lib/directory/agencies.ts` (`USE_PREVIEW_PARTNERS`) then reads
`lib/directory/data/partners.preview.json` in place of `partners.json`, so
the badge appears and the partners-first sort visibly reorders the grid.
Two things to keep in mind:

- **The sample agencies are not customers.** The badge's tooltip asserts
  that a named agency uses Superflow, so shipping the sample list publicly
  would publish a false claim about a real company. The flag is for local
  dev and preview deploys only. On Vercel a production build ignores it
  regardless (`USE_PREVIEW_PARTNERS` also requires
  `NEXT_PUBLIC_VERCEL_ENV !== "production"`).
- **It is a swap, not a merge.** Once real domains land in
  `partners.json`, the flag hides them and shows only the sample set, so
  drop the flag rather than leaving it on. Delete
  `partners.preview.json` and the `USE_PREVIEW_PARTNERS` branch once the
  real list is populated and the badge no longer needs a stand-in.

### Tests

`tests/directory/partner-badge.spec.ts` (9 tests) covers the domain join,
the accessible name, hover/tap/keyboard opening, dismissal, the sort key,
and the client-bundle boundary. It needs partners to exist, and the flag is
inlined at **build** time, so run:

```
npm run test:directory
```

which builds with the flag and then runs the spec. CI does the same in
`.github/workflows/directory-badge.yml`.

The join is domain-based and lives in `lib/directory/agencies.ts`
(`isSuperflowPartner`), matching `Agency.domain` against
`lib/directory/data/partners.json`'s `domains` array, case-insensitively.
Partner status is **not** stored on `Agency` itself — the scraper
overwrites `agencies.json` wholesale on every run, so anything stored
there would be silently wiped on the next refresh. `partners.json` ships
empty and stays that way until a real CRM export replaces it; until then
every agency is a non-partner and the badge renders on nobody, which is
correct behavior, not a bug.

Partner status is also the primary key of the directory's default sort
(`compareAgenciesDefaultOrder` in `lib/directory/agencies.ts`) — partners
first, then award total descending, then name — so a partner is visible
near the top of every listing without a visitor needing to know to look
for the badge. It is deliberately **not** in the `Organization` JSON-LD:
schema.org has no property that cleanly means "is a customer of this
specific software product" without misusing one (see the comment on
`buildAgencyOrganizationJsonLd`).

## Category page controls

`components/directory/AgencyGrid.tsx` renders every agency's card
server-side, in the directory's default order, then hands two things to
`components/directory/AgencyExplorer.tsx` (a small `"use client"`
component): the pre-rendered `<AgencyCard/>` elements (keyed by
`Agency.slug` in a `cardsBySlug` map, never by array index) and a slim,
serializable `AgencyListItem[]` (see `buildAgencyListItems`) for the
filtering/sorting logic itself.

**Why this split matters for SEO:** `AgencyExplorer`'s `useState` defaults
(empty search, "all" countries, "Top ranked" sort) reproduce exactly what
the server already rendered, so the first-paint HTML — what a crawler or
`curl` sees — always contains every agency card and its link, regardless
of client JS. Filtering/reordering only happens after a visitor actually
interacts with a control. Verify this holds after any change here with:

```
curl -s http://localhost:3000/directory/web-design \
  | grep -o 'href="/directory/agency/[a-z0-9-]*"' | sort -u | wc -l
```

That count should equal the category's total agency count.

**Why `AgencyListItem` instead of passing full `Agency` records:**
`AgencyExplorer` only imports `AgencyListItem` as a `import type` (erased
at compile time, zero runtime cost). If a client component instead
imported anything real from `lib/directory/agencies.ts`, the module's
top-level `agencies.json`/`partners.json` imports would very likely ride
along into the client bundle too (JSON module imports aren't reliably
tree-shaken), doubling the dataset's footprint on top of what is already
server-rendered as HTML. Keep new client-side directory code following
this pattern: type-only imports from `lib/directory/agencies.ts`, plain
data passed in as props from a server component.

The control set: search (name + description + location + client names +
services + industries, via `AgencyListItem.searchText` — so searching a category page for "nike"
surfaces the agencies that built for Nike, not just agencies named that),
a country filter whose options are derived
from the data (`buildCountryOptions`, never a hardcoded list), and four
sort modes — "Top ranked" (the default, and the only mode that reproduces
the SSR order), "Client rating" (shrinkage-weighted review score with no
partner boost, see "Review ranking" above), "Name A-Z" (literal
alphabetical, no partner boost), and "Partners first" (partners first,
then name).

**"Top ranked" (`compareByDirectoryRanking`) must stay a key-for-key
mirror of `compareAgenciesDefaultOrder` in `lib/directory/agencies.ts`.**
The server sorts the list with that comparator; the explorer sorts the
same list again on the client, so a key in one and not the other makes
the page reorder itself on hydration — and leaves the visible order
disagreeing with the `ItemList` JSON-LD, which is built from the server's
order.

This mode used to be "Award total" and ranked on awards alone, which was
a faithful mirror while Awwwards was the only source. The SEO category
broke it: every record there scores 0 on awards, so the mode fell through
to its name tiebreaker and rendered the whole category **alphabetically**,
under a heading promising agencies "ranked on their published client
reviews". Adding the review score as a third key fixed it — one comparator
that ranks web design by awards and SEO by reviews, because the two keys
never compete inside a single category.

"Client rating" is hidden when nothing in the current list has a rating,
so it never appears on a pure web-design category. There is no
"Award total" option to hide symmetrically — "Top ranked" already *is*
award ranking on a web-design category. A live `aria-live="polite"` result
count and a
"no matches" empty state with a reset action round it out. All controls
are native `<input>`/`<select>`/`<button>` elements with paired
`<label htmlFor>`s, so keyboard access and screen readers work without
extra plumbing.

## Adding a category

Add one entry to `DIRECTORY_CATEGORIES` in `lib/directory/constants.ts`
(slug, title, heading, subheading, metaDescription) — **not** the reserved
`DIRECTORY_AGENCY_SEGMENT` value, which `assertNoReservedCategorySlug`
rejects at build time. That's it — the hub page, the category route's
`generateStaticParams`, and the sitemap (`app/sitemap.ts`) all read off
that array, so no page code needs to change. The importer is responsible
for tagging agency records with the new category slug in their
`categories` array.

Adding a category with a **new source** behind it is a bigger change than
adding a slug, and the SEO category is the worked example of it:

1. Add the source to the `AgencySource` union in `lib/directory/types.ts`.
   `SOURCE_LABELS` in `lib/directory/agencies.ts` is typed
   `Record<AgencySource, string>`, so this immediately fails the build until
   you give the source an attribution label — that tripwire is the point.
2. Add its data file under `lib/directory/data/` and pass it to
   `mergeAgencySources`. Never append into an existing source's file: each
   importer overwrites its own file wholesale.
3. Write the importer under `scripts/directory-import/`, with its own cache
   directory (add it to `.gitignore` — the existing entries are exact
   paths, not a pattern) and its own README section.
4. Allowlist the source's logo CDN in `next.config.ts` under
   `images.remotePatterns`, scoped to the path prefix its `logoUrl` values
   actually use. Agency logos are hotlinked from the source profile, and
   `next/image` answers an un-allowlisted host with a **400**, so every
   logo in the new category renders blank — with no build error and no
   server-side warning. It is only visible in the browser console, which
   is how it slipped through once per source so far.
5. Check whether the credibility signal the new source publishes already
   exists on `Agency`. If it does not, add a field rather than forcing it
   into an existing one — `AgencyRating` exists precisely because a review
   average could not honestly be stored as an award tally. Then extend
   `compareAgenciesDefaultOrder`, `shouldIndexAgency` and
   `buildAgencyMetaDescription`, all of which reason about those signals.
6. Backfill the new fields onto every existing record in the other
   sources' data files, and make those importers emit them, so every record
   in `lib/directory/data/` is a complete `Agency` regardless of which
   importer wrote it.

## SEO

All three routes follow the site's standard pattern: `buildPageMetadata`
for `<meta>`/OG/Twitter tags, `PageJsonLd` for WebPage + BreadcrumbList,
plus hand-rolled schema alongside it. See `app/alternative/[slug]/page.tsx`
for the reference this was modeled on.

- Hub + category pages: a hand-rolled `ItemList` (`CollectionPage` too on
  the category page), pointing at the agency detail pages.
- Agency detail pages: per-agency `title`/`description` composed from
  name + primary category + location + award total + the agency's own
  description (see `buildAgencyMetaTitle` / `buildAgencyMetaDescription`)
  so no two pages read as a template with the name swapped — plus an
  `Organization` JSON-LD node (`buildAgencyOrganizationJsonLd`) with
  `name`, `url` (the agency's own site, falling back to the source
  profile), `logo`, `description`, `address` (from location), and
  `sameAs` pointing at the source profile. Only fields present on the
  record are emitted — never `null` or an empty string.
