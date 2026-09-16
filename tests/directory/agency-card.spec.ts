// Browser tests for the agency card's click behaviour on a category grid.
//
// Why this file exists: the card is one click target for the detail page,
// built with a stretched link (`.header::after` covers the card) rather than
// by wrapping the card in an <a> - because the footer still carries the
// agency's own outbound website link, and an anchor inside an anchor is
// invalid HTML. That construction is invisible to `tsc` and to `next build`,
// and it has two failure modes that only show up under a real pointer:
//
//   1. The overlay stops covering the card - a z-index change, a new
//      element with its own stacking context, a card that grows past the
//      overlay - and most of the card silently stops being clickable. That
//      is the state this suite was written for: only the name and logo
//      opened the profile, and every click on the description did nothing.
//   2. The overlay swallows the website link. The agency's own site is the
//      one outbound link the card still carries, and if the overlay wins
//      that click, every link on the grid quietly goes to the same place.

import { test, expect } from "@playwright/test";
import { DIRECTORY_CATEGORIES } from "../../lib/directory/constants";

const CATEGORY_PATH = `/directory/${DIRECTORY_CATEGORIES[0].slug}`;

test.describe("agency card", () => {
  test("clicking the card body opens the agency's detail page", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    const card = page.locator("article").filter({ has: page.locator("h3") }).first();
    await expect(card).toBeVisible();

    // The description sits well away from the name/logo block that used to
    // be the only link, so a pass here means the overlay is really covering
    // the card rather than the header happening to be under the cursor.
    const body = card.locator("p").first();
    await expect(body).toBeVisible();
    await body.click();

    await expect(page).toHaveURL(/\/directory\/agency\/[^/]+$/);
    // A real profile, not a 404 shell.
    await expect(page.locator("h1")).toBeVisible();
  });

  test("the agency's own website link still wins its own click", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    const websiteLink = page
      .locator("article a[target='_blank'][rel*='noopener']")
      .first();
    await expect(websiteLink).toBeVisible();
    const href = await websiteLink.getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);

    // Opens in a new tab, so the grid must still be the page we are on. If
    // the stretched-link overlay had swallowed this, we would be sitting on
    // an agency profile instead.
    await websiteLink.click();
    await expect(page).toHaveURL(new RegExp(`${CATEGORY_PATH}$`));
  });

  test("the card carries no link back to the source directory", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    const card = page.locator("article").filter({ has: page.locator("h3") }).first();
    // Attribution lives on the detail page this card opens, one click away.
    // The figures on the card still name their source in the label itself
    // ("48 Awwwards awards"), so nothing here is an unattributed claim.
    await expect(card.locator("a[href*='awwwards.com']")).toHaveCount(0);
    await expect(card.locator("a[href*='semrush.com']")).toHaveCount(0);
  });

  test("no anchor is nested inside another anchor", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    // The whole reason the card uses an overlay instead of wrapping itself
    // in a link. Browsers recover from nested anchors in incompatible ways,
    // so this must never regress into "just wrap the card".
    const nested = await page.locator("article a a").count();
    expect(nested).toBe(0);
  });
});
