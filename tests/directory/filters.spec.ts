// Browser tests for the category page's filter bar.
//
// Everything about WHICH agencies a filter should keep is covered by unit
// tests in ./ranking-and-filters.spec.ts. This file covers what only a
// browser can tell us, and each of these has broken silently before or
// would break silently now:
//
//   1. The SERVER HTML still contains every card. The listing's whole SEO
//      story is that the grid is server-rendered and the controls only
//      hide and reorder what is already there. A refactor that moved the
//      grid behind `useSearchParams` or a Suspense boundary would empty
//      the server HTML while leaving the page looking identical.
//   2. A filter with NO DATA BEHIND IT is not rendered at all. The claim
//      layer ships empty, so on a fresh build no agency states a budget,
//      a platform or a reply time - and a "Webflow" pill on a page where
//      nobody has said what they build on is a trap, not a filter.
//   3. A filtered view is a SHAREABLE URL, including the case where the
//      link names a filter this listing has no data for. The control has
//      to appear anyway, switched on, or the visitor gets an empty grid
//      with no visible cause.
//   4. The first paint is UNFILTERED. State is hydrated from the URL in
//      an effect precisely so server and client agree on the first
//      render. A regression there shows up as a hydration error, not as a
//      wrong page.
//
// PRECONDITION: these assume a build whose claim layer has no claims for
// this category, which is what `lib/directory/data/claims.json` ships.
// Once real claims land, the "hidden" assertions below become assertions
// that the controls are SHOWN - see `hasClaimBackedData`.

import { test, expect, type Page } from "@playwright/test";

import { DIRECTORY_CATEGORIES } from "../../lib/directory/constants";
import { getCategoryAgenciesSync } from "../../lib/directory/listing";

const CATEGORY = DIRECTORY_CATEGORIES[0];
const CATEGORY_PATH = `/directory/${CATEGORY.slug}`;

/**
 * Whether this category has any claim-backed data at all, read from the
 * same committed claim layer the build used.
 *
 * Derived rather than hardcoded so this file keeps telling the truth
 * after the first agency claims a listing: the controls appear, and the
 * tests that assert they are hidden skip themselves instead of failing on
 * a change that is the whole point of the feature.
 */
const backing = (() => {
  try {
    const agencies = getCategoryAgenciesSync(CATEGORY.slug);
    return {
      budget: agencies.some((agency) => typeof agency.minBudgetUsd === "number"),
      platforms: agencies.some((agency) => agency.platforms.length > 0),
      verified: agencies.some((agency) => agency.verified),
    };
  } catch {
    return { budget: true, platforms: true, verified: true };
  }
})();

/**
 * Dismisses the cookie banner, which otherwise covers the lower half of
 * the grid and intercepts clicks aimed at controls behind it.
 *
 * @param page - The page to dismiss the banner on.
 */
async function dismissCookieBanner(page: Page): Promise<void> {
  for (const label of ["Accept", "Decline"]) {
    const button = page.getByRole("button", { name: label, exact: true });
    if (await button.count()) {
      await button.first().click({ timeout: 5_000 }).catch(() => {});
      return;
    }
  }
}

test.describe("the YC founders strip", () => {
  test("is not rendered while no agency has an offer", async ({ request }) => {
    const response = await request.get("/directory");
    expect(response.status()).toBe(200);
    const html = await response.text();

    // Its heading is a factual claim - "Agencies on this list offer YC
    // companies a deal" - and with an empty claim layer that is false.
    // It shipped briefly with a softer fallback line instead, which kept
    // a promotional panel on the page whose whole content was an
    // admission that the promotion did not exist yet.
    const hasOffers = getCategoryAgenciesSync(CATEGORY.slug).some((agency) =>
      Boolean(agency.ycOffer),
    );
    if (hasOffers) {
      expect(html).toContain("directory-yc-strip");
      return;
    }
    expect(html).not.toContain("directory-yc-strip");
    expect(html).not.toContain("For YC founders");
  });
});

test.describe("category filters", () => {
  test("the server HTML carries every card, before any JavaScript runs", async ({ request }) => {
    const response = await request.get(CATEGORY_PATH);
    expect(response.status()).toBe(200);
    const html = await response.text();

    const links = new Set(
      [...html.matchAll(/href="(\/directory\/agency\/[a-z0-9-]+)"/g)].map((match) => match[1]),
    );
    // The listing pages ship 60 agencies each. A floor rather than an
    // exact count, so a re-scrape does not fail this, while a grid that
    // emptied itself still does.
    expect(links.size).toBeGreaterThanOrEqual(50);

    // The controls that always have data are server-rendered too, so a
    // crawler sees a complete page rather than an unstyled list waiting
    // for hydration.
    expect(html).toContain("Search agencies");
    expect(html).toContain("Sort by");
  });

  test("filters with no data behind them are not rendered", async ({ page }) => {
    test.skip(
      backing.budget || backing.platforms || backing.verified,
      "this category now has claim-backed data, so these controls should be visible",
    );

    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    // No agency has stated a budget, a platform, or claimed a listing, so
    // every one of these could only ever return an empty grid.
    await expect(page.locator("#directory-budget")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Webflow", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Startup friendly", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "YC offer", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Verified only", exact: true })).toHaveCount(0);

    // The two sort modes over the same empty fields go with them.
    const sort = page.locator("#directory-sort");
    await expect(sort.locator('option[value="lowest-budget"]')).toHaveCount(0);
    await expect(sort.locator('option[value="fastest-reply"]')).toHaveCount(0);

    // What survives is everything the scraped data can still answer.
    await expect(page.locator("#directory-country")).toHaveCount(1);
    await expect(sort.locator('option[value="recommended"]')).toHaveCount(1);
    await expect(sort.locator('option[value="most-awarded"]')).toHaveCount(1);
  });

  test("a shared link for an unbacked filter still renders its control", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") messages.push(message.text());
    });

    await page.goto(`${CATEGORY_PATH}?budget=25000&platform=webflow&verified=1`);
    await dismissCookieBanner(page);

    // Hiding these would leave a visitor with an empty grid, no visible
    // cause and nothing to click.
    await expect(page.locator("#directory-budget")).toHaveValue("25000");
    await expect(page.getByRole("button", { name: "Webflow", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "Verified only", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // ...and the way out is visible.
    await expect(page.getByRole("button", { name: "Reset filters" }).first()).toBeVisible();

    // Filters are applied in an effect AFTER hydration precisely so the
    // server and client agree on the first render. A hydration mismatch
    // here is the symptom of someone reading the URL during render.
    expect(messages.filter((text) => /hydrat/i.test(text))).toHaveLength(0);
  });

  test("a filter writes itself to the URL without adding a history entry", async ({ page }) => {
    // Entered through the URL so the control is present regardless of
    // what this build's claim layer holds.
    await page.goto(`${CATEGORY_PATH}?platform=webflow`);
    await dismissCookieBanner(page);

    const framer = page.getByRole("button", { name: "Framer", exact: true });
    await framer.click();
    await expect(page).toHaveURL(/platform=webflow%2Cframer|platform=webflow,framer/);

    // `history.replaceState`, not a push: filtering is a different view
    // of the same page, and a history entry per click makes Back useless.
    await page.goBack();
    await expect(page).not.toHaveURL(new RegExp(CATEGORY.slug));
  });

  test("clearing a filter removes its param rather than zeroing it", async ({ page }) => {
    await page.goto(`${CATEGORY_PATH}?yc_offer=1`);
    await dismissCookieBanner(page);

    const toggle = page.getByRole("button", { name: "YC offer", exact: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    // A shared URL should never carry filters that are not applied.
    await expect(page).toHaveURL((url) => !url.search.includes("yc_offer"));
  });

  test("a filter that matches nothing offers a way back", async ({ page }) => {
    await page.goto(`${CATEGORY_PATH}?verified=1`);
    await dismissCookieBanner(page);

    test.skip(backing.verified, "this category now has verified listings, so the grid is not empty");

    await expect(page.getByText("No agencies match your filters")).toBeVisible();

    await page.getByRole("button", { name: "Reset filters" }).first().click();
    await expect(page.getByText("No agencies match your filters")).toHaveCount(0);
    await expect(page).toHaveURL((url) => url.search === "");
  });

  test("the control bar fills its row and never overflows", async ({ page }) => {
    // The bar carries between three and nine controls. It laid out
    // scattered for a while because a leftover `@media (min-width: 640px)`
    // rule from the original three-field design flipped `.controls` to
    // `flex-direction: row`, so the control row, the pill row and the
    // count line were laid side by side on one wrapping line instead of
    // stacking. Nothing about that was visible in a screenshot of the
    // markup - only in the geometry.
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(CATEGORY_PATH);
      await dismissCookieBanner(page);

      const search = (await page.locator("#directory-search").boundingBox())!;
      const sort = (await page.locator("#directory-sort").boundingBox())!;
      const count = (await page.locator("p[aria-live='polite']").boundingBox())!;

      // The count is always on its own line, below the controls.
      expect(count.y, `count shares a line with the controls at ${width}px`).toBeGreaterThan(
        sort.y,
      );

      // Above phone width the fields share one line, search widest.
      if (width >= 1024) {
        expect(sort.y, `controls wrapped at ${width}px`).toBe(search.y);
        expect(search.width).toBeGreaterThan(sort.width);
      }

      // And nothing ever pushes the page sideways.
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    }
  });

  test("clicking anywhere on a card opens that agency's profile", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    const card = page.locator("article").first();
    const slug = await card.locator("a[href^='/directory/agency/']").getAttribute("href");
    const box = (await card.boundingBox())!;

    // Mid-card, well away from the name and off the website link: this is
    // the stretched-link overlay, not the anchor text.
    //
    // The locator's own click, NOT `page.mouse.click` at those absolute
    // coordinates. The grid sits below a tall hero, so at the default
    // viewport height the first card is off-screen and a raw mouse click
    // at its page coordinates lands on nothing at all. This scrolls the
    // card into view first and clicks relative to its own box.
    await card.click({ position: { x: box.width * 0.5, y: box.height * 0.55 } });
    await page.waitForURL(/\/directory\/agency\//, { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe(slug);
  });

  test("a card carries no source attribution link", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    // Provenance lives on the profile page, where there is room to label
    // it. On a card it competed with the agency's own website link for the
    // same corner and sent visitors off-site before they compared
    // anything. The profile keeps it - asserted below.
    const card = page.locator("article").first();
    await expect(card.locator("a[href*='awwwards.com']")).toHaveCount(0);

    const profile = await card.locator("a[href^='/directory/agency/']").getAttribute("href");
    await page.goto(profile!);
    await expect(page.locator("a[href*='awwwards.com']").first()).toBeVisible();
  });

  test("the result count tracks the filtered set", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    const count = page.locator("p[aria-live='polite']");
    await expect(count).toHaveText(/Showing \d+ of \d+ agencies/);
    const before = await count.textContent();

    // Search is the one control that is always available, because it
    // reads scraped copy rather than claim-backed fields.
    await page.locator("#directory-search").fill("zzzzznotanagency");
    await expect(count).not.toHaveText(before ?? "");
    await expect(count).toHaveText(/Showing 0 of \d+ agencies/);
  });
});
