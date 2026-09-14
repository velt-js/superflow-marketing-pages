// Browser tests for the category page's filter bar.
//
// Everything about WHICH agencies a filter should keep is covered by unit
// tests in ./ranking-and-filters.spec.ts. This file covers the three
// things only a browser can tell us, each of which has broken silently
// before or would break silently now:
//
//   1. The SERVER HTML still contains every card. The listing's whole SEO
//      story is that the grid is server-rendered and the controls only
//      hide and reorder what is already there. A refactor that moved the
//      grid behind `useSearchParams` or a Suspense boundary would empty
//      the server HTML while leaving the page looking identical.
//   2. A filtered view is a SHAREABLE URL. Filters are written to the
//      query string so a founder can send "Webflow studios under $25k" to
//      a co-founder; that only works if the URL updates and if reloading
//      it restores the same view.
//   3. The first paint is UNFILTERED. State is hydrated from the URL in an
//      effect precisely so the server and client agree on the first
//      render. A regression here shows up as a hydration error, not as a
//      wrong page.

import { test, expect } from "@playwright/test";

import { DIRECTORY_CATEGORIES } from "../../lib/directory/constants";

const CATEGORY = DIRECTORY_CATEGORIES[0];
const CATEGORY_PATH = `/directory/${CATEGORY.slug}`;

/**
 * Dismisses the cookie banner, which otherwise covers the lower half of
 * the grid and intercepts clicks aimed at controls behind it.
 *
 * @param page - The page to dismiss the banner on.
 */
async function dismissCookieBanner(page: import("@playwright/test").Page): Promise<void> {
  for (const label of ["Accept", "Decline"]) {
    const button = page.getByRole("button", { name: label, exact: true });
    if (await button.count()) {
      await button.first().click({ timeout: 5_000 }).catch(() => {});
      return;
    }
  }
}

test.describe("category filters", () => {
  test("the server HTML carries every card, before any JavaScript runs", async ({ request }) => {
    const response = await request.get(CATEGORY_PATH);
    expect(response.status()).toBe(200);
    const html = await response.text();

    const links = new Set(
      [...html.matchAll(/href="(\/directory\/agency\/[a-z0-9-]+)"/g)].map((match) => match[1]),
    );
    // The listing pages ship 60 agencies each. Asserting a floor rather
    // than an exact count keeps this from failing on a re-scrape, while
    // still catching a grid that emptied itself.
    expect(links.size).toBeGreaterThanOrEqual(50);

    // The controls are server-rendered too, so a crawler sees a complete
    // page rather than an unstyled list waiting for hydration.
    expect(html).toContain("Minimum budget");
    expect(html).toContain("Startup friendly");
  });

  test("a filter writes itself to the URL without adding a history entry", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    await page.getByRole("button", { name: "Webflow", exact: true }).click();
    await expect(page).toHaveURL(/platform=webflow/);

    await page.locator("#directory-budget").selectOption("25000");
    await expect(page).toHaveURL(/budget=25000/);
    await expect(page).toHaveURL(/platform=webflow/);

    // `history.replaceState`, not a push: filtering is a different view of
    // the same page, and a history entry per keystroke would make Back
    // useless.
    await page.goBack();
    await expect(page).not.toHaveURL(new RegExp(CATEGORY.slug));
  });

  test("an unfiltered listing writes no query string at all", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    await page.getByRole("button", { name: "YC offer", exact: true }).click();
    await expect(page).toHaveURL(/yc_offer=1/);

    // Toggling back off clears the param rather than leaving `yc_offer=0`,
    // so a shared URL never carries filters that are not applied.
    await page.getByRole("button", { name: "YC offer", exact: true }).click();
    await expect(page).toHaveURL((url) => !url.search.includes("yc_offer"));
  });

  test("a shared filtered URL restores the same view", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") messages.push(message.text());
    });

    await page.goto(`${CATEGORY_PATH}?budget=25000&platform=webflow&verified=1`);
    await dismissCookieBanner(page);

    await expect(page.locator("#directory-budget")).toHaveValue("25000");
    await expect(page.getByRole("button", { name: "Webflow", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "Verified only", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Filters are applied in an effect AFTER hydration precisely so the
    // server and client agree on the first render. A hydration mismatch
    // here is the symptom of someone reading the URL during render.
    expect(messages.filter((text) => /hydrat/i.test(text))).toHaveLength(0);
  });

  test("a filter that matches nothing offers a way back", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    // No agency has claimed a listing in a fresh build, so "Verified only"
    // empties the grid - which is exactly the state worth testing.
    await page.getByRole("button", { name: "Verified only", exact: true }).click();
    await expect(page.getByText("No agencies match your filters")).toBeVisible();

    await page.getByRole("button", { name: "Reset filters" }).first().click();
    await expect(page.getByText("No agencies match your filters")).toHaveCount(0);
    await expect(page).toHaveURL((url) => url.search === "");
  });

  test("the result count tracks the filtered set", async ({ page }) => {
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);

    const count = page.locator("p[aria-live='polite']");
    const before = await count.textContent();
    expect(before).toMatch(/Showing \d+ of \d+ agencies/);

    await page.locator("#directory-budget").selectOption("10000");
    await expect(count).not.toHaveText(before ?? "");
  });
});
