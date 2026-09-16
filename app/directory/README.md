# Agency directory (`/directory`)

A programmatic directory of agencies: **one list page** at `/directory`,
filterable by category, country and search, with a full detail page per
agency.

| Category | Filter | Source | Data file | Ranked on | Filtered to |
| --- | --- | --- | --- | --- | --- |
| Web Design | `/directory?category=web-design` | Awwwards | `lib/directory/data/agencies.json` | Award total | — |
| SEO | `/directory?category=seo` | Semrush Agency Partners | `lib/directory/data/seo-agencies.json` | Client review score | Projects from $5,000 |
| Branding | `/directory?category=branding` | Clutch, DesignRush, D&AD | `lib/directory/data/branding-agencies.json` | Accolades, then review score | Projects from $10,000 **or** award provenance |
| Motion Design | `/directory?category=motion-design` | Motion Design Awards | `lib/directory/data/motion-design-agencies.json` | Accolades (= award count) | Top 60 by award count |

Counts at time of writing: 60 web design, 60 SEO, 143 branding, 60 motion
design - 323 agencies on one page.

**A category is a filter, not a destination.** `/directory/<category>` used
to be four separate pages; each now 308s to the list pre-filtered to itself
(`redirects` in `next.config.ts`, built from `DIRECTORY_CATEGORIES` so a new
category cannot leave a retired route 404ing). The reasoning: a visitor
arriving on "web design agencies" who wants a branding studio was being
asked to go back out to a hub and start again, and four pages meant four
search boxes, four country filters and four sets of the same furniture to
keep in step. What they were **not** was four different kinds of content -
every card on all four is the same object from a different source.

Two consequences worth knowing before changing any of this:

- **The four category URLs were indexed and linked.** They are redirects
  now, not deletions, and `/directory` is the canonical for every filtered
  view (`?category=` never mints a second canonical - see
  `generateMetadata` in `app/directory/page.tsx`). That deliberately trades
  four pages each ranking for its own phrase for one page consolidating
  their standing; if that trade turns out badly, the way back is a real
  route per category rendering the same list pre-filtered, not an undo of
  the list itself.
- **One page now carries every agency.** See "Page weight" below - it is
  the constraint that shapes how this page is built.

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

**Corrections an agency sends us do not go in those files.** The importers
would overwrite them on the next run, so they live in Sanity as
`agencyListing` documents and are merged over the scrape at read time — see
"Corrections from the agency (the CMS layer)" below.

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

- `app/directory/page.tsx` — **the list page**, and the only route that
  lists agencies. Renders every agency in the dataset as a card, in the
  directory's default order (`getDirectoryAgencyList`), under the filter
  toolbar described in "List page controls" below. Reads `?category=` to
  decide which category the controls open on, which is what the retired
  category routes redirect into; an unknown value falls back to "all"
  rather than 404ing, because a filter is not a route. Header is
  `components/directory/DirectoryListHero.tsx` (the shared blue-gradient
  2026 hero). Reading `searchParams` makes this route server-rendered on
  demand rather than static - the dataset behind it is memoized for 60s, so
  that costs a render rather than a fetch.
  Agencies render as a card grid (`components/directory/AgencyGrid.tsx` →
  `AgencyExplorer.tsx` → `AgencyCard.tsx`). **The whole card opens the
  agency's detail page**, via a stretched link (`.header::after` covers the
  card) rather than by wrapping the card in an `<a>` — the footer still
  carries the agency's own outbound website link, and an anchor inside an
  anchor is invalid HTML that browsers recover from in their own
  incompatible ways. `.websiteLink` lifts itself above the overlay to keep
  its own click. Both halves are covered by
  `tests/directory/agency-card.spec.ts`, because neither failure mode (a
  dead card body, or an overlay that eats the website link) is visible to
  `tsc` or `next build`. That test clicks by coordinate rather than with
  `locator.click()`, because Playwright's actionability check refuses to
  click an element that another element covers - and the covering overlay
  is the thing under test.
  The card carries **no** link back to the source directory: that
  attribution lives on the detail page one click away. It does always
  **name** the source under its credential ("Awwwards · 91x Site of the
  Day", "Semrush Agency Partners · 108 reviews" - see
  `getAgencyCredential`), so no figure on a card is an unattributed claim.
  Cards are sorted in the directory's default order: Superflow partners
  first, then a round-robin over the per-category rankings (see
  `getDirectoryAgencyList` for why the categories are interleaved rather
  than ranked against each other).
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

- `DirectoryHero.module.css` — the gradient hero shared by the list page and
  an agency profile, as a `.heroList` / `.heroProfile` pair of modifiers:
  the list carries a headline and nothing else, a profile carries a
  breadcrumb, a logo plate, an identity block, two calls to action and the
  white stat strip riding the fade into the page. One file rather than two,
  so the gradient/crop/fade maths cannot drift between them.
- `DirectoryGrid.module.css` — the white list section, the filter toolbar,
  and both empty states. Shared by `AgencyGrid` and `AgencyExplorer` so the
  halves of one visual section can't drift.
- `AgencyCard.module.css` — the list card.
- `AgencyDetail.module.css` — the profile's two-column body and its cards.
- `RelatedAgencies.module.css` — the "more agencies" rows at the foot of a
  profile. Rows rather than a repeat of the card grid: the block follows a
  page of content, and a second grid there read as a second listing page.

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
  the JSON files themselves. Notable exports: `getDirectoryAgencyList` (the
  whole directory in the list page's order - see its own note on why the
  categories are interleaved rather than ranked against each other),
  `getAgenciesByCategory`, `getDirectoryCategory`, `getAgencyBySlug`,
  `getAllAgencySlugs`, `agencyPath` (the single place the detail-page URL
  is assembled), `getRelatedAgencies`, `buildAgencyMetaTitle` /
  `buildAgencyMetaDescription` (per-agency, composed from real fields —
  see below), `buildAgencyOrganizationJsonLd`, `formatAgencyLocation`,
  `getAwardBreakdown`, `getHeadlineAward`, `getAgencyCredential` (the one
  figure a card leads with, plus the line naming who published it),
  `isJuryAccoladeSource`, `formatAgencyRating` / `getAgencyRatingScore` (the
  review-based counterparts, see "Review ranking" below),
  `mergeAgencySources`, `resolveAgencySourceLabel`, `isSuperflowPartner`,
  `buildAgencyListItems` / `AgencyListItem` (the client-safe projection the
  list page renders and filters on), `buildAgencyListStats`
  (agency/country/partner counts behind the hero's subheading), and the
  thin-content gate described next.

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

**The client no longer keeps its own copy of the ranking.** It used to:
`AgencyExplorer` mirrored `compareAgenciesDefaultOrder` and
`compareAgenciesByAccolades` so its "Top ranked" mode could reproduce the
server's order, and a key added on one side and not the other silently
reordered the page on hydration — away from the order the page's own
`ItemList` JSON-LD claimed. The server now stamps each item with its
position (`AgencyListItem.rank`, from `buildAgencyListItems`) and the client
sorts on that number, so there is no second copy to drift from. Filtering to
one category leaves those ranks a subsequence of the same order, which is
exactly that category's own ranking — see `getDirectoryAgencyList`.

`isAccoladeRankedCategory` still lives in `constants.ts` rather than
`agencies.ts`, because `agencies.ts` imports the JSON datasets and taking a
*value* from it in a `"use client"` file would ship the whole directory into
the browser bundle.

## Corrections from the agency (the CMS layer)

Agencies write in. They say the client list is the one Awwwards happens to
have awarded rather than the one they would choose, that the award total
counts one jury out of five, that their minimum project is €15,000, that
they don't take template work. Those corrections have nowhere to live in
the files above: **every importer overwrites its own data file wholesale on
every run**, so a correction typed into `agencies.json` survives until the
next scrape and no further.

So they live in Sanity, as `agencyListing` documents, and are merged onto
the scraped record on the way to the page:

| Piece | Where |
| --- | --- |
| Schema | `sanity/schemas/agencyListing.ts` |
| Query | `getAgencyListingOverrides` in `sanity/lib/queries.ts` |
| Merge | `lib/directory/overrides.ts` |
| Resolved dataset | `getDirectoryAgencies` in `lib/directory/agencies.ts` |
| Seed script | `scripts/agency-listing-import/seed-agency-listings.mjs` |

This is the same reasoning that already keeps the Superflow partner list in
its own file: anything that must outlive a re-scrape cannot be stored in
what the scrape overwrites.

**An empty field is not a correction.** A listing created to fix one wrong
budget leaves the other twenty fields alone. That is what makes it safe to
create one for a single figure without re-entering a whole profile — and it
is why every field in the schema is optional and why nothing in the merge
ever blanks a value.

**`clients` is the one field with two modes.** `replace` drops the scraped
list (an agency that sends the list it wants published is disowning the
other one); `add` appends, deduping against what is already there by
registrable domain and then by name. Both showed up in the first two
listings we were sent.

**Source attribution is never overridden.** `slug`, `source`, `profileUrl`,
`scrapedAt`, `awards` and `rating` are what the named directory published,
and an `agencyListing` document is not that directory. An agency that
disputes its award tally gets an `awardsNote` printed beside it, not a
rewrite of it — see "Accolades vs awards" below for why the two kinds of
claim stay apart. This is also why the CMS cannot **add** an agency: a
record with no source profile to link has nothing to attribute, and the
merge drops a listing whose slug matches nothing.

**Budget minimums are the one field where the CMS carries more structure
than the scrape.** `budgetMinimums` holds a row per floor an agency stated,
in the currency it quoted, and is never converted between currencies — a
rate the agency did not give is a figure the agency did not state. That is
also why `budgetFloorUsd` is left null for an agency that quoted in euros:
the rows carry the real number, and the null reads correctly as "no US
dollar floor on record" rather than as a converted guess. See "Budget:
label vs floor vs stated minimums" below.

**`verifiedAt` is the only thing that puts "Confirmed by the agency" on the
page.** It is the one line on an agency page that is not attributable to a
linked source profile — it says the agency looked at this page and stood
behind it — so it is set only for a correction that came from the agency
itself, never for an in-house edit. `verifiedBy` and `verificationSource`
sit next to it for the editor's benefit and are deliberately **not** in the
GROQ query: they usually name a person at the agency, the site has no use
for them, and a field that is never fetched cannot be published by
accident.

**Sanity being unreachable costs the corrections and nothing else.**
`getDirectoryAgencies` resolves to the scraped dataset on any failure, so
every page still renders everything its named source published. Failing the
build instead would take ~320 working pages off the site to protect a
correction on a handful of them. The resolved dataset is memoized for 60s,
matching the `revalidate` on these routes, so a build renders hundreds of
pages off one fetch.

**The seed script seeds; it does not sync.** `agency-listings.json` is
where a correction is first written down, but once the document exists,
Studio owns it: the script runs `createIfNotExists` and only overwrites the
slugs named in `--replace`. There is no stale-delete pass — a document this
script did not create is not this script's to remove. This is the opposite
of `scripts/bug-book-import/`, where the JSON is the source of truth and a
rerun is meant to win.

## Budget: label vs floor vs stated minimums

Three representations, deliberately not one:

- `budgetLabel` — the display string ("Starting from $5,000", "Under
  $1,000"). What the card footer and the detail page's facts list render.
- `budgetFloorUsd` — the same thing as a number (`5000`), which is what the
  SEO category's threshold is applied against.
- `AgencyListing.budgetMinimums` — what an agency told us directly, as
  `{ scope, amount, currency }` rows. CMS-only; no source directory
  publishes this.

The third exists because the first two cannot carry what agencies actually
say. Malvah quoted **$24,000 for a website and $12,000 for a brand
identity** — two floors for two kinds of work, and the difference is the
whole answer to "can I afford them". One number flattens it; one sentence
makes it unreadable by anything but a human. So the rows stay rows, render
as rows on the detail page, and go into the Markdown copy as a table an
agent can filter.

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

A third, which the CMS layer introduced: **an agency that quotes in another
currency gets a `budgetLabel` and a null `budgetFloorUsd`.** A studio
whose projects start at €15,000 is not a studio whose projects start at
$15,000, and converting at a rate they never quoted would invent precision
the whole two-field split exists to avoid. The label carries the real
figure; the floor stays null, which the rule above already reads as "didn't
say" rather than "free". Only the SEO and branding importers filter on the
floor, and both do so at collection time, so a null costs nothing at read
time.

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

Each agency carries the brands it has shipped work for — surfaced as up to
three name chips plus a "+N" on `components/directory/AgencyCard.tsx`, and
as a full "Worked with" card on `AgencyDetail.tsx` pairing each client with
the project it came from.

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
  collapses it into a one-line summary, which the meta description uses.
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

`components/directory/PartnerBadge.tsx` renders an icon-only,
verified-style tick on an agency profile for any agency
`isSuperflowPartner` matches. It renders nothing for a non-partner, so the
call site uses it unconditionally. The list card renders
`PartnerBadgeMark` directly instead, off the `isPartner` flag the server
already put on its `AgencyListItem` - the card is a client component and
must not import the module `isSuperflowPartner` lives in (see "List page
controls"). The mark is a scalloped burst in `--color-superflow-blue`
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
`AgencyExplorer` avoids with a type-only import (see "List page
controls"). `PartnerBadgeMark` therefore takes plain strings and imports
nothing from `lib/directory/`. `tests/directory/partner-badge.spec.ts`
guards this, and was confirmed to fail when the boundary is moved up.

### Other things to preserve

- **The tap is intercepted.** On the list card the mark sits inside the
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
- `buildAgencyListStats` still counts partners, but nothing renders that
  count today: the list hero's subheading states the agency and country
  totals only, and the agency detail page has no equivalent. The badge and
  its tooltip are the only place the claim appears.

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

## List page controls

`components/directory/AgencyGrid.tsx` projects every agency into an
`AgencyListItem` (see `buildAgencyListItems`) and hands the array to
`components/directory/AgencyExplorer.tsx`, a `"use client"` component that
owns all four pieces of interactive state — search, category, country, sort
— and renders the cards for whichever items survive them.

**Why this is safe for SEO:** a client component server-renders too, and
`AgencyExplorer`'s `useState` defaults are the props the server was given
(empty search, the `?category=` it resolved, "all" countries, "Top ranked"),
so the first-paint HTML — what a crawler or `curl` sees — contains every
agency card and link regardless of client JS. Filtering only happens after a
visitor touches a control. Verify after any change here:

```
curl -s http://localhost:3000/directory \
  | grep -o 'href="/directory/agency/[a-z0-9-]*"' | sort -u | wc -l
```

That count should equal the whole dataset (323 today), not the visible
subset. `tests/directory/directory-list.spec.ts` asserts it, and asserts
that the browser shows the same number of cards with JS running.

**What crosses the client boundary, and what must not.** `AgencyExplorer`
and `AgencyCard` import `AgencyListItem` as a `import type` only (erased at
compile time) and take everything they paint as props. A client component
that instead imported anything *real* from `lib/directory/agencies.ts`
would very likely pull the module's top-level `agencies.json` /
`partners.json` imports into the browser bundle (JSON module imports aren't
reliably tree-shaken), and the Sanity client with them.
`tests/directory/partner-badge.spec.ts` scans every JS response for dataset
markers and fails if that happens. This is also why `AgencyCard` renders
`PartnerBadgeMark` directly rather than the server `PartnerBadge` wrapper:
the wrapper decides partner status by calling `isSuperflowPartner`, and the
decision is already on the projection as `isPartner`.

**Why cards are not passed across as rendered elements.** They used to be:
`AgencyGrid` rendered every `<AgencyCard/>` server-side and passed them to
the explorer in a slug-keyed map. React serializes any element passed into a
client component into the RSC payload, so every card was in the document
twice — as markup and again as payload. At 60 cards per category that was
tolerable; at 323 on one page it was 983 KB, 57% of the document. The
projection carries no field a card does not paint and costs about a fifth of
that. **Do not "simplify" this back into passing rendered cards.**

The control set, in one toolbar row:

- **Search** over `AgencyListItem.searchText` — name, description, location,
  client names, service and industry names, and the category title. So
  searching "nike" surfaces the agencies that built for Nike, "link
  building" surfaces the agencies that sell it, and "motion design" works
  before a visitor reaches for the category select.
- **Category**, with the count of agencies behind each option, derived from
  the data rather than typed into the labels. Selecting one resets the
  country filter (country options are category-scoped, so a stale value
  would show an empty grid with no obvious cause) and writes `?category=`
  into the address bar with `history.replaceState` — so a filtered view is
  linkable and reloadable, and the 308 from a retired category URL lands
  somewhere that still reads as that category. `replaceState` rather than a
  router push: the whole list is already in the DOM, and a navigation would
  refetch several hundred cards to show a subset of what is on screen.
- **Country**, options derived from the active category's records
  (`buildCountryOptions`, never a hardcoded list).
- **Sort** — "Top ranked" (the default; replays `AgencyListItem.rank`, the
  server's own order), "Client rating" (shrinkage-weighted review score, see
  "Review ranking" above) and "Name A-Z" (literal alphabetical, no partner
  boost).

"Client rating" is hidden when nothing in the current category has a rating,
so it never appears on a pure web-design list — a sort mode that can never
reorder anything is a dead control, not a choice. "Top ranked" never gets
the same treatment: it is the SSR default, and a `<select>` whose selected
value has no matching `<option>` renders as an unlabelled blank.

There was a fourth mode, "Partners first". It is gone: partner status is
already the primary key of "Top ranked", so the two modes differed only in
how they broke ties, and with `partners.json` shipping empty it reordered
nothing at all.

A live `aria-live="polite"` count ("Showing 60 of 323 agencies"), a "Clear
filters" action that appears only when something is filtered, and a "no
matches" empty state with a reset action round it out. The controls are
native `<input>`/`<select>`/`<button>` elements; the search field's visible
label is replaced by its icon and placeholder, so it carries a
visually-hidden `<label>` and the selects carry `aria-label`s — an
unlabelled control is not an option.

## Page weight

The list page carries every agency in the directory, and that is the
constraint behind most of the choices above. Measured on the 323-record
dataset:

| | Document | gzip |
| --- | --- | --- |
| Rendered-cards-as-props (the first cut) | 1.73 MB | 389 KB |
| `AgencyListItem` projection (shipped) | 1.26 MB | 204 KB |

Roughly 700 KB of that is the card markup itself, 509 KB the projection in
the RSC payload, and 41 KB the `ItemList` JSON-LD. Before adding a field to
`AgencyListItem`, or a row to the card, remember it is paid 323 times.

The alternative — paging or lazily loading the list — was rejected because
the four category pages are gone: this is now the only page that links to an
agency profile, and a crawler that finds 60 of 323 links leaves 263 profiles
reachable only from the sitemap and from each other's "more agencies"
blocks. If the page has to shrink further, shrink the card, not the list.

## Adding a category

Add one entry to `DIRECTORY_CATEGORIES` in `lib/directory/constants.ts`
(slug, title, heading, subheading, metaDescription) — **not** the reserved
`DIRECTORY_AGENCY_SEGMENT` value, which `assertNoReservedCategorySlug`
rejects at build time. That's it: the list page's category select, the
ranking interleave in `getDirectoryAgencyList`, the Markdown copy, and the
`/directory/<slug>` → `?category=<slug>` redirect in `next.config.ts` all
read off that array, so no page code needs to change. The importer is responsible
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

Both routes follow the site's standard pattern: `buildPageMetadata`
for `<meta>`/OG/Twitter tags, `PageJsonLd` for WebPage + BreadcrumbList,
plus hand-rolled schema alongside it. See `app/alternative/[slug]/page.tsx`
for the reference this was modeled on.

- List page: a hand-rolled `CollectionPage` and an `ItemList` naming every
  agency on it, pointing at the detail pages. The canonical is `/directory`
  for every view, filtered or not — a `?category=` view is one list
  narrowed, not a second document, and the whole point of redirecting the
  four category routes was to consolidate onto one URL rather than mint
  four more.
- A retired category route (`/directory/<slug>`) 308s to
  `/directory?category=<slug>`; its Markdown copy is gone with it, since
  `directoryHubToAgentDoc` covers all four categories in one document (see
  "Machine-readable surface" in the root `AGENTS.md`). `app/sitemap.ts`
  lists `/directory` and the agency profiles — never a redirect.
- Agency detail pages: per-agency `title`/`description` composed from
  name + primary category + location + award total + the agency's own
  description (see `buildAgencyMetaTitle` / `buildAgencyMetaDescription`)
  so no two pages read as a template with the name swapped — plus an
  `Organization` JSON-LD node (`buildAgencyOrganizationJsonLd`) with
  `name`, `url` (the agency's own site, falling back to the source
  profile), `logo`, `description`, `address` (from location), and
  `sameAs` pointing at the source profile. Only fields present on the
  record are emitted — never `null` or an empty string.
