// Shared constants for the agency directory. Kept out of types.ts so the
// scraper (plain .mjs, no TS build step) can mirror these values without
// importing types, and the pages can import them directly.

import type { DirectoryCategory } from "./types";

/** Route prefix for every directory page. */
export const DIRECTORY_BASE_PATH = "/directory";

/** Category slug for the web design slice — the launch category. */
export const CATEGORY_WEB_DESIGN = "web-design";

/** Category slug for the SEO slice. */
export const CATEGORY_SEO = "seo";

/**
 * Category slug for the branding / brand identity slice.
 *
 * Deliberately ONE category rather than a `branding` and a `logo-design`
 * pair. Above this category's budget floor nobody sells a standalone logo -
 * it is sold as an identity system - so a separate logo-design category
 * would either duplicate this listing entirely or fill up with the cheap
 * end of the market the floor exists to exclude. The heading and meta
 * description carry the "logo design" phrasing instead.
 */
export const CATEGORY_BRANDING = "branding";

/**
 * Category slug for the motion design / animation slice.
 *
 * `motion-design` rather than `motion`: the bare word is ambiguous (motion
 * capture, motion graphics templates, stock animation) and the two-word
 * form is what the studios themselves and their clients search for.
 *
 * This is the first category with NO budget gate, and that is a property of
 * the market, not an oversight. Nobody publishes minimum project sizes for
 * motion design - every budget-bearing directory (Clutch, DesignRush,
 * Sortlist, GoodFirms, Semrush) either bot-walls automated access or, where
 * reachable, carries general video-production shops rather than motion
 * specialists. Of 50 companies sampled on DesignRush's US motion-graphics
 * listing, two reached its "$50,000 & Up" band. So the category is gated on
 * jury awards instead: see MOTION_DESIGN_PUBLISHED_LIMIT and
 * ACCOLADE_RANKED_CATEGORIES.
 */
export const CATEGORY_MOTION_DESIGN = "motion-design";

/**
 * How many motion design studios are published, out of everyone holding at
 * least one Motion Design Awards win.
 *
 * The single cut for this category, where SEO and branding each have two.
 * There is no qualifying bar to apply first - holding a jury award IS the
 * bar - so the importer ranks every studio by award count and keeps this
 * many. 247 studios hold at least one win, so this is the top ~24% of the
 * pool rather than nearly all of it. 60 matches the other categories, which keeps the page weight in
 * line: the SEO listing at 294 cards ran to 2.8 MB and 7,315 DOM elements,
 * enough to trip Lighthouse's excessive-DOM audit, where 60 cards land
 * around 0.74 MB.
 *
 * Enforced by the importer at collection time, so the pages have no
 * filtering to do. Changing it means re-running the importer; see
 * scripts/directory-import/README.md.
 */
export const MOTION_DESIGN_PUBLISHED_LIMIT = 60;

/**
 * Minimum `Agency.budgetFloorUsd` for a record to belong in the SEO
 * category, in whole US dollars.
 *
 * The category is deliberately a filtered slice, not the whole of its
 * source: the Semrush SEO listing runs to ~1,400 agencies, the bulk of
 * which take sub-$2,500 work, and a directory that lists everyone helps
 * nobody choose. This threshold is the editorial line.
 *
 * It is the first of two cuts. This one is a hard qualifying bar; the
 * importer then ranks what clears it by review score and keeps the top 60
 * (its `DEFAULT_LIMIT`). So the shipped category is "the 60 best-reviewed
 * agencies that take $5,000+ work", not "every agency above $5,000" -
 * roughly 295 clear the bar and 60 are published.
 *
 * A useful side effect of the second cut: every published record has
 * reviews. Around a third of the qualifying pool has none and scores zero
 * under the shrinkage ranking, so the cap excludes them rather than
 * stranding them at the bottom of a listing that claims to be ranked on
 * reviews.
 *
 * Both cuts are enforced by the importer at collection time (an agency
 * below the floor is never fetched, let alone written), so this constant
 * documents and names the rule rather than applying it at render time -
 * the pages have no filtering to do. Changing it means re-running the
 * importer; see scripts/directory-import/README.md.
 */
export const SEO_MIN_BUDGET_FLOOR_USD = 5000;

/**
 * Minimum `Agency.budgetFloorUsd` for a record admitted to the branding
 * category on the budget route, in whole US dollars.
 *
 * Unlike SEO_MIN_BUDGET_FLOOR_USD this is NOT the category's only gate,
 * because at the top of this market the figure is unsourceable. The studios
 * that define branding - Pentagram, Jones Knowles Ritchie, Bulletproof,
 * PORTO ROCHA - publish no budget bands anywhere, and their real floors run
 * far above this number. The only directories that do print a minimum
 * project size are populated by the mid-market, so gating on a published
 * figure alone would admit those shops and exclude precisely the agencies
 * the category exists to list.
 *
 * So there are two routes in, and `decideAdmission` in
 * scripts/directory-import/load-branding-json.mjs is the one place they are
 * applied: a published floor at or above this number, OR award provenance
 * (a non-empty `Agency.accolades`) with `budgetFloorUsd` left null. Null
 * there means "the source did not say", never "free" - see that field's doc
 * comment in ./types.ts.
 *
 * A consequence worth knowing when reading the data: a listed agency may
 * have a null floor, so this constant describes the editorial line the
 * category is curated to, not a property every record carries.
 */
export const BRANDING_MIN_BUDGET_FLOOR_USD = 10000;

/**
 * Path segment for per-agency detail pages: /directory/agency/<slug>.
 *
 * Deliberately flat rather than nested under a category. `Agency.categories`
 * is an array, so an agency listed in two categories would get two URLs
 * under a nested scheme — duplicate content that then needs canonical
 * tags to untangle. One agency, one URL, no canonicals required.
 */
export const DIRECTORY_AGENCY_SEGMENT = "agency";

/**
 * Slugs a category may never use, because they collide with a sibling
 * route under /directory/. Enforced by `assertNoReservedCategorySlug`.
 */
export const RESERVED_CATEGORY_SLUGS: readonly string[] = [
  DIRECTORY_AGENCY_SEGMENT,
];

/** Attribution label rendered next to source links. Awwwards data is
 *  collected from public profile pages, so every record links back. */
export const SOURCE_LABEL_AWWWARDS = "Awwwards";

/** Attribution label for records collected from the Semrush Agency
 *  Partners directory. Spelled out in full rather than as "Semrush": the
 *  link goes to an agency's listing in that directory, not to the Semrush
 *  product, and the difference matters for a claim of provenance. */
export const SOURCE_LABEL_SEMRUSH = "Semrush Agency Partners";

/** Attribution label for records collected from Clutch. */
export const SOURCE_LABEL_CLUTCH = "Clutch";

/** Attribution label for records collected from DesignRush. */
export const SOURCE_LABEL_DESIGNRUSH = "DesignRush";

/** Attribution label for records collected from D&AD. Written out rather
 *  than shortened to "D&AD Awards": the link goes to an agency's page in
 *  D&AD's creative-community directory or its awards archive, and both sit
 *  under the one institution. */
export const SOURCE_LABEL_DANDAD = "D&AD";

/** Attribution label for records collected from Motion Design Awards.
 *  Written in full rather than as "MDA": the abbreviation collides with
 *  motionawards.com, a separate organisation run by Motionographer, and a
 *  provenance label that could point at either body attests to nothing. */
export const SOURCE_LABEL_MOTION_DESIGN_AWARDS = "Motion Design Awards";

/**
 * Name of the partner badge. Says "partner" rather than "verified" on
 * purpose: the badge attests that the agency uses Superflow, which is a
 * specific, checkable claim. A bare "Verified" would imply we vetted the
 * agency's quality or legitimacy, which we have not.
 *
 * The badge itself renders icon-only, so this string is not painted on the
 * page - it is the tooltip heading and part of the mark's `aria-label`.
 * That makes it the only place the claim is ever stated in words, so it
 * matters more here, not less.
 */
export const PARTNER_BADGE_LABEL = "Superflow partner";

/** Tooltip/aria text explaining what the partner badge means, so the
 *  claim is legible to a visitor rather than an unexplained checkmark. */
export const PARTNER_BADGE_DESCRIPTION =
  "This agency uses Superflow to collect client feedback and review work.";

/** Categories exposed at /directory/<slug>. Adding an entry here is all
 *  that is needed for the route, sitemap, and hub grid to pick it up. */
export const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  {
    slug: CATEGORY_WEB_DESIGN,
    title: "Web Design",
    heading: "Web design agencies",
    subheading:
      "Award-winning web design studios, ranked by the work they have shipped. Every profile links back to its source.",
    metaDescription:
      "A directory of award-winning web design agencies and studios, with location, services, team size and award record for each.",
  },
  {
    slug: CATEGORY_SEO,
    title: "SEO",
    heading: "SEO agencies",
    // Copy states the budget floor outright because the listing is filtered
    // on it (see SEO_MIN_BUDGET_FLOOR_USD) - a visitor comparing this
    // against a directory of 1,400 should know why the smaller shops are
    // absent, rather than assuming the list is simply incomplete.
    subheading:
      "SEO and search agencies that take projects from $5,000 up, ranked on their published client reviews. Every profile links back to its source.",
    metaDescription:
      "A directory of SEO agencies taking projects from $5,000, with location, services, team size, client review score and named clients for each.",
  },
  {
    slug: CATEGORY_BRANDING,
    title: "Branding",
    heading: "Branding and logo design agencies",
    // Copy names the floor and the award route together, because the
    // listing is curated on both (see BRANDING_MIN_BUDGET_FLOOR_USD) and a
    // visitor should be able to tell why a studio with no published rate
    // card sits alongside one with a stated minimum.
    subheading:
      "Brand identity and logo design studios that take projects from $10,000 up, or that hold awards for their branding work. Every profile links back to its source.",
    metaDescription:
      "A directory of branding and logo design agencies taking projects from $10,000, with location, services, team size, awards and named clients for each.",
  },
  {
    slug: CATEGORY_MOTION_DESIGN,
    title: "Motion Design",
    // "studios" rather than "agencies", which every other category uses:
    // it is what this industry calls itself, and what its buyers search.
    heading: "Motion design studios",
    // Copy names the award record as the ranking basis and claims nothing
    // else. The other categories advertise services, team size and budget;
    // this source publishes none of the three, and a subheading promising
    // them would be selling a page we cannot render.
    subheading:
      "Motion design and animation studios, ranked by their Motion Design Awards record. Every profile links back to its source.",
    metaDescription:
      "A directory of award-winning motion design and animation studios, with location, award record and a link to each studio's own site.",
  },
];

/**
 * Categories ranked on `Agency.accolades` count rather than on the award
 * tally / review score the shared comparator uses.
 *
 * Scoped to a named list rather than applied everywhere, because accolades
 * mean very different things by source. In the branding category they are
 * D&AD Pencils - a jury's verdict, and the strongest signal that category
 * has, since the studios holding them (Pentagram, Wolff Olins, Jones
 * Knowles Ritchie) have no client reviews anywhere and would otherwise sort
 * below every mid-market shop with a review count. In the SEO category the
 * same field holds self-reported badges ("Top Advertising Company", BBB
 * awards) carried by half the records, where ranking on them would promote
 * the most self-congratulatory agencies over the best-reviewed ones.
 *
 * Read by BOTH sides of the ranking: `getAgenciesByCategory` in
 * ./agencies.ts sorts the server-rendered list, and
 * components/directory/AgencyExplorer.tsx re-sorts the same list on the
 * client. They must agree or the page reorders itself on hydration, which
 * is why this lives here rather than being decided independently in each.
 */
export const ACCOLADE_RANKED_CATEGORIES: readonly string[] = [
  CATEGORY_BRANDING,
  // Motion design for the same reason as branding, one step further: its
  // records carry no review score AND no award tally, because Motion
  // Design Awards is not an Awwwards-scheme source. Every win it publishes
  // is written as one `accolades` entry naming the award and the project
  // that took it, so the array's LENGTH is the studio's award count and
  // ranking on it ranks on award record. This is also why the importer
  // must emit one entry per win rather than one per award type - collapsing
  // "Video of the Day x3" into a single string would quietly flatten the
  // ranking to near-ties, exactly the bug that sorted the SEO category
  // alphabetically on launch.
  CATEGORY_MOTION_DESIGN,
];

/**
 * Reports whether a category ranks on accolade count instead of the
 * default award-total key.
 *
 * Lives HERE rather than in ./agencies.ts on purpose. Both the server sort
 * and the client re-sort have to make the identical choice, and
 * components/directory/AgencyExplorer.tsx is a "use client" file whose only
 * import from ./agencies.ts is type-only - importing a value from that
 * module would pull the whole agencies.json dataset into the client bundle
 * (see `AgencyListItem`'s doc comment). This module imports nothing at
 * runtime, so it is safe to read from both sides.
 *
 * @param categorySlug - The `DirectoryCategory.slug` being rendered.
 * @returns True when this category is ranked on `Agency.accolades`.
 */
export function isAccoladeRankedCategory(categorySlug: string | null | undefined): boolean {
  try {
    if (!categorySlug) return false;
    return ACCOLADE_RANKED_CATEGORIES.includes(categorySlug);
  } catch {
    return false;
  }
}

/**
 * Fails fast when a category slug collides with a reserved sibling route.
 *
 * Called at module scope so a bad category is a build-time error rather
 * than a route that silently shadows /directory/agency/<slug> in
 * production.
 *
 * @throws When any configured category uses a reserved slug.
 */
function assertNoReservedCategorySlug(): void {
  try {
    const collision = DIRECTORY_CATEGORIES.find((category) =>
      RESERVED_CATEGORY_SLUGS.includes(category?.slug),
    );
    if (collision) {
      throw new Error(
        `Directory category "${collision.slug}" collides with a reserved route segment. Reserved: ${RESERVED_CATEGORY_SLUGS.join(", ")}.`,
      );
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

assertNoReservedCategorySlug();
