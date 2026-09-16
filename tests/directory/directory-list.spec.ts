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
//   3. **The paged list stays crawlable.** One page of cards is in the
//      server HTML and the pager's links are real `<a href>`s, which is
//      what keeps all 323 profiles linked from the one page that lists
//      them. Rendering the grid - or the pager - client-side only would
//      look identical in a browser and leave a crawler with 60 of 323.

import { test, expect } from "@playwright/test";
import {
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
  DIRECTORY_CATEGORY_PARAM,
  DIRECTORY_PAGE_PARAM,
  DIRECTORY_PAGE_SIZE,
} from "../../lib/directory/constants";

const LIST_PATH = DIRECTORY_BASE_PATH;

/** The live result count under the toolbar, in either of its two forms:
 *  "Showing 1-60 of 323 agencies" when the list pages, "Showing 12 of 60
 *  agencies" when everything matching is already on screen. */
const COUNT_LINE = "text=/Showing [\\d-]+ of \\d+ agenc/";

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

  test("the category select narrows the list", async ({ page }) => {
    await page.goto(LIST_PATH);

    /** The "of N" in the count line: how many agencies match right now. */
    const matchCount = async () => {
      const text = await page.locator(COUNT_LINE).first().innerText();
      return Number(text.match(/of (\d+) agenc/)?.[1] ?? 0);
    };

    const before = await matchCount();
    expect(before).toBeGreaterThan(0);

    // Asserted on the count rather than on how many cards are painted: a
    // page of a 323-agency list and a whole 60-agency category can both be
    // 60 cards, so the card count alone would not notice the filter.
    const category = DIRECTORY_CATEGORIES[0];
    await page.getByLabel("Category", { exact: true }).selectOption(category.slug);

    await expect.poll(matchCount).toBeLessThan(before);
    await expect(page.locator("article").first()).toBeVisible();

    // The filter is shareable: the URL says what is on screen.
    await expect(page).toHaveURL(
      new RegExp(`${DIRECTORY_CATEGORY_PARAM}=${category.slug}`),
    );
  });

  test("the first page is in the server HTML, and the pager reaches the rest", async ({
    page,
    request,
  }) => {
    const html = await (await request.get(LIST_PATH)).text();
    const firstPage = agencyHrefs(html);

    // A full page of cards, server-rendered - not a shell for client JS to
    // fill, and not the whole dataset either.
    expect(firstPage.size).toBe(DIRECTORY_PAGE_SIZE);

    // Real links to the other pages, in the HTML, without running any JS.
    const pageLinks = [
      ...new Set(
        (html.match(new RegExp(`href="${LIST_PATH}\\?${DIRECTORY_PAGE_PARAM}=(\\d+)"`, "g")) ?? [])
          .map((match) => Number(match.match(/=(\d+)"$/)?.[1]))
          .filter((value): value is number => Number.isFinite(value)),
      ),
    ];
    expect(pageLinks.length).toBeGreaterThan(0);

    // Following them reaches every agency in the directory: no profile is
    // linked from the sitemap alone.
    const reached = new Set(firstPage);
    for (const pageNumber of pageLinks) {
      const pageHtml = await (
        await request.get(`${LIST_PATH}?${DIRECTORY_PAGE_PARAM}=${pageNumber}`)
      ).text();
      for (const href of agencyHrefs(pageHtml)) reached.add(href);
    }
    expect(reached.size).toBeGreaterThan(DIRECTORY_PAGE_SIZE);
    expect(reached.size).toBeGreaterThan(300);

    // And what the browser shows with JS running is the same page of cards,
    // so the two renderings agree rather than the client re-deriving them.
    await page.goto(LIST_PATH);
    await expect.poll(async () => page.locator("article").count()).toBe(firstPage.size);
  });

  test("a page link shows a different page of agencies", async ({ page }) => {
    await page.goto(LIST_PATH);

    const firstName = await page.locator("article h3").first().innerText();
    await page.getByRole("link", { name: "Page 2", exact: true }).click();

    await expect.poll(async () => page.locator("article h3").first().innerText()).not.toBe(
      firstName,
    );
    // The view is linkable: the URL says which page is on screen.
    await expect(page).toHaveURL(new RegExp(`${DIRECTORY_PAGE_PARAM}=2`));
    await expect(page.locator("text=/Showing 61-\\d+ of \\d+ agenc/")).toBeVisible();
  });
});
