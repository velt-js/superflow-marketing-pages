// Stated project floors are published as the agency quoted them.
//
// The figure is the most useful thing a profile carries - it is the
// question a visitor opens an agency page with, and the one the source
// directories almost never answer - so the directory shows it. What it
// does NOT do is decide on an agency's behalf that its pricing should be
// public: an agency that asks for its quotes to come off gets them off.
//
// That opt-out is data, not a flag. The figures are REMOVED from the
// record rather than hidden at render, because this dataset is publicly
// readable and a figure left in it is a figure published however the page
// chooses to draw it. The band goes in `budgetLabel` in their place, which
// is why the second test below asserts on absence rather than on a
// rendering rule.

import { test, expect } from "./fixtures";
import { DIRECTORY_BASE_PATH } from "../../lib/directory/constants";

/** An agency that stated two floors and did not ask us to hide them. */
const PUBLISHED_PROFILE = `${DIRECTORY_BASE_PATH}/agency/malvah`;

/** The one agency that asked for its quotes to come off. */
const WITHHELD_PROFILE = `${DIRECTORY_BASE_PATH}/agency/burocratik`;

test.describe("budget figures", () => {
  test("a stated floor is printed as quoted, currency and all", async ({ page, request }) => {
    await page.goto(PUBLISHED_PROFILE);

    const terms = page
      .locator("div")
      .filter({ has: page.getByRole("heading", { name: "Working with them" }) })
      .last();
    // Symbol included: these are never converted, so which currency a
    // floor is in is half of what the number means.
    await expect(terms).toContainText(/[$£€]\d{1,3}(,\d{3})+/);

    // And the Markdown copy carries the figure as data, for an agent
    // filtering on cost rather than reading the page.
    const markdown = await (await request.get(`${PUBLISHED_PROFILE}.md`)).text();
    expect(markdown).toMatch(/Minimum project size/);
    expect(markdown).toMatch(/\b\d{4,6}\b/);
  });

  test("an agency that withdrew its quotes has no figure anywhere", async ({ page, request }) => {
    await page.goto(WITHHELD_PROFILE);
    const html = await page.content();

    // Not "not rendered" - not present. The withdrawn figures are gone
    // from the record, so they cannot reach the HTML, the payload Next
    // serializes for hydration, or anything reading the CMS directly.
    for (const quote of ["50,000", "100,000", "€50000", "€100000"]) {
      expect(html, `the page should not carry the withdrawn quote ${quote}`).not.toContain(quote);
    }
    // What it says instead is the band they agreed to.
    expect(html).toContain("figures");

    const markdown = await (await request.get(`${WITHHELD_PROFILE}.md`)).text();
    expect(markdown).not.toContain("50,000");
    expect(markdown).not.toContain("100,000");
    // No "Minimum project size" table either: there are no rows to build
    // one from, which is the opt-out working rather than a missing render.
    expect(markdown).not.toMatch(/\| Any project \|/);
  });
});
