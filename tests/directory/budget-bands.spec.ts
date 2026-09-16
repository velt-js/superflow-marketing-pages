// Stated project floors render as bands, never as the figure.
//
// These are numbers agencies send us about their own pricing, and a
// published exact quote is the number their next prospect opens the
// negotiation at. Bürocratik asked for theirs to come off the page for
// exactly that reason, and the request generalises: what a visitor needs
// is whether they are in the right room, which the band says, and the
// quote is the agency's to give on contact.
//
// Bürocratik's own record goes further than the rendering does - its
// figures are gone from the CMS, not banded on the way out, because this
// dataset is publicly readable and a figure left in it is a figure
// published. That is why the assertion below is on the page AND on what
// the page never says.

import { test, expect } from "./fixtures";
import { formatBudgetBand } from "../../lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "../../lib/directory/constants";

/** An agency that stated two floors in two currencies. */
const BANDED_PROFILE = `${DIRECTORY_BASE_PATH}/agency/malvah`;

/** The agency that asked for its quotes to come off entirely. */
const REMOVED_PROFILE = `${DIRECTORY_BASE_PATH}/agency/burocratik`;

test.describe("budget bands", () => {
  test("a figure becomes the count of its digits", () => {
    expect(formatBudgetBand(12000)).toBe("5 figures");
    expect(formatBudgetBand(24000)).toBe("5 figures");
    // The boundary is where the phrase says it is: 99,999 is still five.
    expect(formatBudgetBand(99999)).toBe("5 figures");
    expect(formatBudgetBand(100000)).toBe("6 figures");
    expect(formatBudgetBand(1000000)).toBe("7 figures");
  });

  test("anything that is not a figure is not a band", () => {
    // A row that cannot be banded is dropped rather than shown exactly,
    // which is the one outcome this change exists to prevent.
    expect(formatBudgetBand(0)).toBeNull();
    expect(formatBudgetBand(-5)).toBeNull();
    expect(formatBudgetBand(Number.NaN)).toBeNull();
    expect(formatBudgetBand(null)).toBeNull();
    expect(formatBudgetBand(undefined)).toBeNull();
  });

  test("the profile prints the band and not the quote", async ({ page }) => {
    await page.goto(BANDED_PROFILE);

    const terms = page.locator("div").filter({ has: page.getByRole("heading", { name: "Working with them" }) }).last();
    // Band AND the currency it was quoted in. Without the currency a euro
    // floor and a dollar floor read identically, and these are never
    // converted - the currency is the half that has to survive banding.
    await expect(terms).toContainText(/\d figures \([A-Z]{3}\)/);

    // The exact quotes behind those bands must not appear anywhere on the
    // page - not in the card, not in the stat strip, not in the payload
    // Next serializes for hydration.
    const html = await page.content();
    for (const quote of ["24,000", "12,000", "$24000", "$12000"]) {
      expect(html, `the page should not print the exact quote ${quote}`).not.toContain(quote);
    }
  });

  test("an agency that withdrew its quotes has none to band", async ({ page, request }) => {
    await page.goto(REMOVED_PROFILE);
    const html = await page.content();
    for (const quote of ["50,000", "100,000", "€50000", "€100000"]) {
      expect(html, `the page should not print the withdrawn quote ${quote}`).not.toContain(quote);
    }

    // And the Markdown copy agrees, because an agent reading it is exactly
    // who would otherwise repeat a number the agency asked us to drop.
    const markdown = await (await request.get(`${REMOVED_PROFILE}.md`)).text();
    expect(markdown).not.toContain("50,000");
    expect(markdown).not.toContain("100,000");
    expect(markdown).toContain("figures");
  });
});
