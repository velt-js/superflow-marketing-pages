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
  description, complete award breakdown, a "Worked with" client list (see
  "Client list" below), services, team size, a prominent outbound "Visit
  website" CTA, the source attribution link, plus a data-derived "more
  agencies" block (`components/directory/RelatedAgencies.tsx`, capped at 6 —
  same country first, falling back to same category) so pages interlink
  instead of being orphaned behind the category listing.

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
- `lib/directory/data/partners.preview.json` — same shape, sample data,
  read **only** when `NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1` (see
  "Previewing the badge" below). Not real customers; never merge it into
  `partners.json`.
- `lib/directory/agencies.ts` — the only module that reads the JSON files
  directly. Pages should go through these helpers rather than importing
  the JSON files themselves. Notable exports: `getAgenciesByCategory`,
  `getAgencyCountByCategory`, `getDirectoryCategory`, `getAgencyBySlug`,
  `getAllAgencySlugs`, `agencyPath` (the single place the detail-page URL
  is assembled), `getRelatedAgencies`, `getAgencyClients` /
  `formatAgencyClientSummary` (the client list — see "Client list" below),
  `buildAgencyMetaTitle` / `buildAgencyMetaDescription` (per-agency,
  composed from real fields — see below), `buildAgencyOrganizationJsonLd`,
  `formatAgencyLocation`, `getAwardBreakdown`, `resolveAgencySourceLabel`,
  `isSuperflowPartner`, `buildAgencyListItems` / `AgencyListItem` (the
  slim, client-safe projection behind the category page's controls),
  `buildAgencyListStats` (agency/country/partner counts for
  `CategoryHero`), and the thin-content gate described next.

## Thin-content guard

`shouldIndexAgency(agency)` returns false only when an agency has no
description (or one under ~80 characters), a negligible award record, *and*
fewer than three named clients — three independent signals of substance, so
a page needs only one of them to clear the bar. A studio with 150+ awards
behind a four-word tagline still qualifies on awards alone; an agency with
three named clients but no blurb still qualifies on the client list alone.
That all three being absent at once is thin content by Google's
scaled-content standards, even though the page itself renders correctly.
Held-back agencies:

- Still get a full, working detail page (still linked from their category
  and from other agencies' "more agencies" blocks).
- Get `robots: { index: false, follow: true }` via `buildPageMetadata`'s
  `noindex` option in `generateMetadata`.
- Are excluded from `app/sitemap.ts` (`getIndexableAgencySlugs()` is what
  the sitemap maps over, not the full agency list).

`getAgencyIndexingSummary()` returns `{ total, indexable, heldBack }` for
sanity-checking how much of a given scrape actually clears the bar.

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

Dismisses on outside pointer-down, `Escape`, or scroll. Those listeners are
bound only while open, so a page of cards adds no idle listeners.

### The client/server split

`PartnerBadge.tsx` stays a **server** component and `PartnerBadgeMark.tsx`
carries the `"use client"` directive. That boundary placement is
load-bearing: `PartnerBadge` calls `isSuperflowPartner`, a real runtime
import from `lib/directory/agencies.ts`, whose module scope imports
`agencies.json`. Marking *that* component `"use client"` would very likely
pull the whole scraped dataset into the browser bundle — the same trap
`AgencyExplorer` avoids with a type-only import (see "Category page
controls"). `PartnerBadgeMark` therefore takes plain strings and imports
nothing from `lib/directory/`.

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
- The category hero's "N Superflow partners" stat (`buildAgencyListStats` →
  `CategoryHero`) is the only place the phrase appears as visible text on a
  category page; the agency detail page has no equivalent.

The join is domain-based and lives in `lib/directory/agencies.ts`
(`isSuperflowPartner`), matching `Agency.domain` against
`lib/directory/data/partners.json`'s `domains` array, case-insensitively.
Partner status is **not** stored on `Agency` itself — the scraper
overwrites `agencies.json` wholesale on every run, so anything stored
there would be silently wiped on the next refresh. `partners.json` ships
empty and stays that way until a real CRM export replaces it; until then
every agency is a non-partner and the badge renders on nobody, which is
correct behavior, not a bug.

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
  `NEXT_PUBLIC_VERCEL_ENV !== "production"`); on any other host, leaving
  the variable unset is the only thing keeping it out.
- **It is a swap, not a merge.** Once real domains land in
  `partners.json`, the flag hides them and shows only the sample set, so
  drop the flag rather than leaving it on. Delete
  `partners.preview.json` and the `USE_PREVIEW_PARTNERS` branch once the
  real list is populated and the badge no longer needs a stand-in.

Partner status is also the primary key of the directory's default sort
(`compareAgenciesDefaultOrder` in `lib/directory/agencies.ts`) — partners
first, then award total descending, then name — so a partner is visible
near the top of every listing without a visitor needing to know to look
for the badge. It is deliberately **not** in the `Organization` JSON-LD:
schema.org has no property that cleanly means "is a customer of this
specific software product" without misusing one (see the comment on
`buildAgencyOrganizationJsonLd`).

## Client list

Each agency can carry a list of brands it has built awarded work for —
"Worked with Coca-Cola, Nike…" — surfaced as a one-line summary on
`components/directory/AgencyCard.tsx` ("Worked with X, Y, Z +N more")
and as a full "Worked with" section on `AgencyDetail.tsx` that pairs each
client name with the project title it was derived from.

- **Where it comes from:** `clients: AgencyClient[]` (`lib/directory/types.ts`)
  is populated by `scripts/directory-import/scrape-awwwards.mjs` from the
  awarded submissions already listed on the profile page it fetches anyway —
  each submission carries a client's live URL and a project title, so
  collecting clients costs zero extra HTTP requests. See that script's
  "Client extraction" section for how a submission becomes a candidate, and
  its README for the full pipeline.
- **Why it lives on `Agency`:** unlike Superflow partner status just above,
  which is intentionally kept out of `Agency` because it comes from an
  external CRM export that the scraper must never clobber, the client list
  is *derived by the scraper itself* from the same source data as `awards`.
  There is no external source of truth to protect, so it's written directly
  onto the record and regenerated on every scrape — the same reasoning that
  puts `awards` there rather than in a side file.
- **Name normalisation:** a raw candidate — a project title, plus a client
  registrable domain when the live URL sits on the client's own site — is
  resolved to a display name and a `notable` flag by a batched call to
  Claude (`claude-opus-5`, low effort, structured JSON output) inside the
  scraper, memoised in the committed `scripts/directory-import/client-names.json`
  so the same brand is only ever resolved once across the whole dataset.
- **Hand-correcting a name:** open `client-names.json`, find the key for the
  mis-resolved entry (`<client-domain-or-"-">|<verbatim project title>`, e.g.
  `coca-cola.com|Coca-Cola: Wozzaah`), and edit its `name` / `notable`
  fields, or set the whole value to `null` to drop that client from the
  directory entirely. The next scrape run reads the edited file as-is — see
  the "Client names" section of `scripts/directory-import/README.md` for
  the fallback behaviour when no API key is configured.
- **Notable exports:** `getAgencyClients(agency)` returns the display-ready,
  deduped client list (`lib/directory/agencies.ts` dedupes by name here,
  separately from the scraper's dedupe-by-domain, since one brand reached
  under two domains would otherwise print twice); `formatAgencyClientSummary(agency, limit?)`
  collapses it into the one-line "Nike, Spotify, Xbox +4 more" summary shared
  by the card and the meta description.
- Capped at 12 per agency (`MAX_CLIENTS_PER_AGENCY` in the scraper), stored
  with recognisable brands first.
- Feeds two other things documented elsewhere in this file: the
  thin-content guard treats three or more clients as a third independent
  substance signal (see above), and `AgencyListItem.searchText` includes
  client names, so searching a category page for a brand ("nike") surfaces
  agencies that worked for it, not just agencies named that (see "Category
  page controls" below).

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

The control set: search (name + description + location + client names,
via `AgencyListItem.searchText` — so searching "nike" surfaces agencies
that worked for Nike, not just agencies named that), a country filter
whose options are derived from the data (`buildCountryOptions`, never a
hardcoded list), and three sort modes — "Award total" (partners first,
default, matches the SSR order), "Name A-Z" (literal alphabetical, no
partner boost), and "Partners first" (partners first, then name —
distinct from "Award total" in its secondary key). A live
`aria-live="polite"` result count and a
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
  description + a "Work for X, Y and Z." clause naming its clients when it
  has any (see `buildAgencyMetaTitle` / `buildAgencyMetaDescription`, and
  `formatAgencyClientSummary` for that clause) so no two pages read as a
  template with the name swapped — plus an `Organization` JSON-LD node
  (`buildAgencyOrganizationJsonLd`) with `name`, `url` (the agency's own
  site, falling back to the source profile), `logo`, `description`,
  `address` (from location), and `sameAs` pointing at the source profile.
  Only fields present on the record are emitted — never `null` or an empty
  string. Clients are deliberately **not** in this JSON-LD, for the same
  reason Superflow-partner status isn't (see "Superflow partner badge"
  above): schema.org's `Organization` type has no property that cleanly
  means "built a website for this company", and stretching an adjacent one
  to fit is worse than omitting the relationship. The client names are
  already in the page's visible copy, which is what the structured data
  would have been restating.
