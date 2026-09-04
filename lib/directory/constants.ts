// Shared constants for the agency directory. Kept out of types.ts so the
// scraper (plain .mjs, no TS build step) can mirror these values without
// importing types, and the pages can import them directly.

import type { DirectoryCategory } from "./types";

/** Route prefix for every directory page. */
export const DIRECTORY_BASE_PATH = "/directory";

/** Category slug for the web design slice — the launch category. */
export const CATEGORY_WEB_DESIGN = "web-design";

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
];

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
