// Browser tests for the directory list page — the three things about it
// that no type check or build can see.
//
//   1. **The retired category routes still land somewhere useful.**
//      /directory/<category> was four real pages; it is a 308 onto the one
//      list, pre-filtered to that category. Those URLs are indexed and
//      linked, so a redirect that drops the category (or 404s) is a silent
//      regression in the only thing the redirect was for.
//   2. **The category select actually filters.** It is the control that
//      replaced four pages, and it is client-side: nothing else in the
//      pipeline proves the cards it hides and shows are the right ones.
//   3. **Every agency is in the server HTML.** The list is server-rendered
//      in full and the controls only choose which pre-rendered cards to
//      show, which is what keeps every profile linked from the one page
//      that lists them. Rendering the grid client-side instead would look
//      identical in a browser and leave a crawler with nothing.

import { test, expect } from "@playwright/test";
import {
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
  DIRECTORY_CATEGORY_PARAM,
} from "../../lib/directory/constants";

const LIST_PATH = DIRECTORY_BASE_PATH;

/** Every agency link the server HTML carries, deduped. */
function agencyHrefs(html: string): Set<string> {
  const matches = html.match(/href="\/directory\/agency\/[a-z0-9-]+"/g) ?? [];
  return new Set(matches);
}

test.describe("directory list", () => {
  test("a retired category URL redirects onto the filtered list", async ({ page }) => {
    const category = DIRECTORY_CATEGORIES[0];
    const response = await page.goto(`${LIST_PATH}/${category.slug}`);

    // The category is carried through, not dropped: the redirect exists so
    // a visitor who asked for one category still gets it.
    await expect(page).toHaveURL(
      new RegExp(`${LIST_PATH}\\?${DIRECTORY_CATEGORY_PARAM}=${category.slug}$`),
    );
    // A real list page, not a 404 shell.
    expect(response?.ok()).toBe(true);
    await expect(page.locator("article").first()).toBeVisible();

    // And the page is filtered to it on arrival, server-side - a redirect
    // that lands on the unfiltered list has thrown the category away.
    const select = page.getByLabel("Category", { exact: true });
    await expect(select).toHaveValue(category.slug);
  });

  test("the category select narrows the grid", async ({ page }) => {
    await page.goto(LIST_PATH);

    const cards = page.locator("article");
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);

    const category = DIRECTORY_CATEGORIES[0];
    await page.getByLabel("Category", { exact: true }).selectOption(category.slug);

    await expect.poll(async () => cards.count()).toBeLessThan(total);
    await expect(page.locator("text=/Showing \\d+ of \\d+ agenc/")).toBeVisible();

    // The filter is shareable: the URL says what is on screen.
    await expect(page).toHaveURL(
      new RegExp(`${DIRECTORY_CATEGORY_PARAM}=${category.slug}`),
    );
  });

  test("every agency card is in the server HTML, not painted by client JS", async ({
    page,
    request,
  }) => {
    const html = await (await request.get(LIST_PATH)).text();
    const hrefs = agencyHrefs(html);

    // The dataset runs to a few hundred records; a server render that has
    // quietly started paging or deferring would land far below this.
    expect(hrefs.size).toBeGreaterThan(100);

    // And what the browser shows with JS running is the same set, so the
    // two renderings agree rather than the client re-deriving the list.
    await page.goto(LIST_PATH);
    await expect.poll(async () => page.locator("article").count()).toBe(hrefs.size);
  });
});
