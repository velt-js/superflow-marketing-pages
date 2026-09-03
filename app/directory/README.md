# Agency directory (`/directory`)

A programmatic directory of agencies, browsable by category, with a full
detail page per agency. Launch category: Web Design (`/directory/web-design`).

## Routes

- `app/directory/page.tsx` — hub page. Lists every category in
  `DIRECTORY_CATEGORIES`, each with a count of indexed agencies (or a
  "coming soon" label while that category's data is still empty). Built on
  the shared `ListingPage` / `ListingGrid` components, so adding a category
  needs **no edit here**.
- `app/directory/[category]/page.tsx` — category detail page. Statically
  generated for every slug in `DIRECTORY_CATEGORIES` via
  `generateStaticParams`; any other slug 404s via `notFound()`. Header is
  `components/directory/CategoryHero.tsx` (not the shared `ListingHero` —
  see that component's doc comment for why). Agencies render as a card
  grid (`components/directory/AgencyGrid.tsx` → `AgencyCard.tsx`), sorted
  in the directory's default order: Superflow partners first, then total
  award count descending, then name. Each card links through to that
  agency's detail page. See "Category page controls" below for the
  search/filter/sort layer on top of this grid.
- `app/directory/agency/[slug]/page.tsx` — agency detail page. **Flat**
  route, deliberately not nested under a category — `Agency.categories` is
  an array, so a nested scheme would mint two URLs for an agency in two
  categories. `DIRECTORY_AGENCY_SEGMENT` (`lib/directory/constants.ts`)
  reserves the `agency` slug so a category can never collide with this
  route (enforced at module load by `assertNoReservedCategorySlug`).
  Statically generated for every agency slug in the dataset via
  `generateStaticParams` — dropping N records into `agencies.json`
  produces N pages automatically, no code change. Unknown slug → `notFound()`.
  Renders full content (`components/directory/AgencyDetail.tsx`): breadcrumb,
  description, complete award breakdown, services, team size, a prominent
  outbound "Visit website" CTA, the source attribution link, plus a
  data-derived "more agencies" block (`components/directory/RelatedAgencies.tsx`,
  capped at 6 — same country first, falling back to same category) so pages
  interlink instead of being orphaned behind the category listing.

## Where the data comes from

- `lib/directory/types.ts` — the shared `Agency` / `DirectoryCategory`
  contract. Treat it as an interface: both the scraper and these pages
  import from it, so a field change means changing both sides together.
- `lib/directory/constants.ts` — `DIRECTORY_CATEGORIES` (the category
  registry), `DIRECTORY_BASE_PATH`, `DIRECTORY_AGENCY_SEGMENT`, and source
  attribution labels.
- `lib/directory/data/agencies.json` — the scraped dataset. Written by
  `scripts/directory-import/*` (a separate, non-TS pipeline), read by
  `lib/directory/agencies.ts`. Starts as `[]` and is expected to hold a few
  hundred records at runtime; every page and helper here is written to
  degrade to an empty state rather than crash when it's empty or when a
  category has no matches yet.
- `lib/directory/data/partners.json` — the Superflow partner list (see
  "Superflow partner badge" below). Written by hand from a CRM/billing
  export, read by `lib/directory/agencies.ts`. Ships with an empty
  `domains` array; keep it that way until someone has a real export to
  paste in.
- `lib/directory/agencies.ts` — the only module that reads the JSON files
  directly. Pages should go through these helpers rather than importing
  the JSON files themselves. Notable exports: `getAgenciesByCategory`,
  `getAgencyCountByCategory`, `getDirectoryCategory`, `getAgencyBySlug`,
  `getAllAgencySlugs`, `agencyPath` (the single place the detail-page URL
  is assembled), `getRelatedAgencies`, `buildAgencyMetaTitle` /
  `buildAgencyMetaDescription` (per-agency, composed from real fields —
  see below), `buildAgencyOrganizationJsonLd`, `formatAgencyLocation`,
  `getAwardBreakdown`, `resolveAgencySourceLabel`, `isSuperflowPartner`,
  `buildAgencyListItems` / `AgencyListItem` (the slim, client-safe
  projection behind the category page's controls), `buildAgencyListStats`
  (agency/country/partner counts for `CategoryHero`), and the thin-content
  gate described next.

## Thin-content guard

`shouldIndexAgency(agency)` returns false when an agency has no
description, a description under ~80 characters, or zero total awards —
that combination is thin content by Google's scaled-content standards even
though the page itself renders correctly. Held-back agencies:

- Still get a full, working detail page (still linked from their category
  and from other agencies' "more agencies" blocks).
- Get `robots: { index: false, follow: true }` via `buildPageMetadata`'s
  `noindex` option in `generateMetadata`.
- Are excluded from `app/sitemap.ts` (`getIndexableAgencySlugs()` is what
  the sitemap maps over, not the full agency list).

`getAgencyIndexingSummary()` returns `{ total, indexable, heldBack }` for
sanity-checking how much of a given scrape actually clears the bar.

## Superflow partner badge

`components/directory/PartnerBadge.tsx` renders a "Superflow partner" pill
(`PARTNER_BADGE_LABEL` / `PARTNER_BADGE_DESCRIPTION`, `lib/directory/constants.ts`)
on both the card and the detail page for any agency `isSuperflowPartner`
matches. The label deliberately says "partner", not "verified" — see the
constant's own comment. It renders nothing for a non-partner, so both call
sites use it unconditionally.

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
(empty search, "all" countries, "Award total" sort) reproduce exactly what
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

The control set: search (name + description + location, via
`AgencyListItem.searchText`), a country filter whose options are derived
from the data (`buildCountryOptions`, never a hardcoded list), and three
sort modes — "Award total" (partners first, default, matches the SSR
order), "Name A-Z" (literal alphabetical, no partner boost), and
"Partners first" (partners first, then name — distinct from "Award total"
in its secondary key). A live `aria-live="polite"` result count and a
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
that array, so no page code needs to change. The scraper is responsible
for tagging agency records with the new category slug in their
`categories` array.

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
