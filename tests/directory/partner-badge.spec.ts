// Browser tests for the Superflow partner badge on the agency directory.
//
// Why this file exists: the badge is icon-only. It paints no words, so every
// assertion it makes about a real company lives in a tooltip and an
// `aria-label`. Three things can silently break that, and none of them are
// visible to `tsc` or `next build`:
//
//   1. The tooltip never opens on touch. Before it was made tappable, a phone
//      user got an unexplained verified-style tick next to a named agency —
//      a mark most people read as "identity verified".
//   2. The tap navigates instead. On the card the badge sits inside the
//      card-wide <Link>, so a missing preventDefault turns "explain this
//      badge" into "open this agency".
//   3. Making it interactive drags the dataset into the browser. The badge
//      needs `"use client"`, but the partner check imports agencies.json;
//      putting the boundary one component too high ships the whole scrape to
//      every visitor.
//
// PRECONDITION: partners.json ships empty, so the badge renders on nobody
// unless the build set NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1. The flag is
// read at BUILD time (it is a NEXT_PUBLIC_* inline), so setting it only for
// `next start` does nothing. Run:
//
//   npm run test:directory
//
// which builds with the flag and runs this file. Against a deployment, set
// TOOLS_BASE_URL — but note the badge only appears there if that build had
// the flag or partners.json is genuinely populated.

import { test, expect, devices, type Page } from "@playwright/test";
import agenciesData from "../../lib/directory/data/agencies.json";
import partnersData from "../../lib/directory/data/partners.json";
import previewPartnersData from "../../lib/directory/data/partners.preview.json";
import { DIRECTORY_CATEGORIES, PARTNER_BADGE_DESCRIPTION, PARTNER_BADGE_LABEL } from "../../lib/directory/constants";

/**
 * Mirrors `USE_PREVIEW_PARTNERS` in lib/directory/agencies.ts so the
 * expectations here follow whichever list the build actually used. Pass the
 * same flag to the test process as to the build, or the two disagree.
 */
const USE_PREVIEW_PARTNERS = process.env.NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS === "1";

const PARTNER_DOMAINS = new Set(
  (USE_PREVIEW_PARTNERS ? previewPartnersData : partnersData).domains.map((domain) =>
    domain.trim().toLowerCase(),
  ),
);

/** Agencies the page under test should badge, derived from the same data. */
const PARTNER_AGENCIES = agenciesData.filter((agency) =>
  PARTNER_DOMAINS.has(agency.domain?.trim().toLowerCase() ?? ""),
);

/** An agency that must NOT be badged - proves the join, not just the render. */
const NON_PARTNER_AGENCY = agenciesData.find(
  (agency) => !PARTNER_DOMAINS.has(agency.domain?.trim().toLowerCase() ?? ""),
);

const CATEGORY = DIRECTORY_CATEGORIES[0];
const CATEGORY_PATH = `/directory/${CATEGORY.slug}`;

/** Matches the mark by its accessible name, the way a screen reader finds it. */
const BADGE_SELECTOR = `[aria-label^="${PARTNER_BADGE_LABEL}"]`;

/**
 * Fails with an actionable message when the build under test has no partners,
 * rather than letting every assertion below fail as a confusing "not found".
 */
function assertPreconditions(): void {
  expect(
    PARTNER_AGENCIES.length,
    `No agency in agencies.json matches a partner domain, so the badge cannot render. ` +
      `partners.json ships empty by design — run \`npm run test:directory\`, which builds ` +
      `with NEXT_PUBLIC_DIRECTORY_PREVIEW_PARTNERS=1.`,
  ).toBeGreaterThan(0);
}

/**
 * Dismisses the cookie banner, which otherwise covers the lower half of the
 * card grid and intercepts taps aimed at cards behind it.
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

test.describe("partner badge", () => {
  test.beforeEach(async ({ page }) => {
    assertPreconditions();
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);
  });

  test("renders on exactly the partner agencies, and on no one else", async ({ page }) => {
    await expect(page.locator(BADGE_SELECTOR)).toHaveCount(PARTNER_AGENCIES.length);

    // The join is by domain, so a badge on a non-partner is the failure that
    // matters most: it would assert a customer relationship that does not exist.
    if (NON_PARTNER_AGENCY) {
      const nonPartnerCard = page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name: NON_PARTNER_AGENCY.name, exact: true }) });
      await expect(nonPartnerCard.locator(BADGE_SELECTOR)).toHaveCount(0);
    }
  });

  test("states the full claim to assistive tech without needing hover", async ({ page }) => {
    const badge = page.locator(BADGE_SELECTOR).first();

    // A bare tick asserts nothing checkable, so the accessible name has to
    // carry both halves: what the badge is called AND what it attests.
    await expect(badge).toHaveAttribute(
      "aria-label",
      `${PARTNER_BADGE_LABEL}. ${PARTNER_BADGE_DESCRIPTION}`,
    );

    // Icon-only: the label must not be painted next to the agency name.
    // `innerText`, not `textContent` — the tooltip copy is always in the DOM
    // (that is how the accessible name and the reveal both work), so
    // textContent would report it even while it is visually hidden. innerText
    // honours CSS visibility, which is the question being asked here.
    const paintedText = await badge.evaluate((node) => (node as HTMLElement).innerText.trim());
    expect(paintedText, "the badge should paint no text at rest").toBe("");

    await expect(badge.locator('[role="tooltip"]')).toBeHidden();
  });

  test("has no title attribute, which would double the tooltip", async ({ page }) => {
    // A native tooltip opens on top of the styled one after ~1s and repeats
    // the same sentence.
    await expect(page.locator(BADGE_SELECTOR).first()).not.toHaveAttribute("title", /.+/);
  });

  test("opens on hover and closes on Escape", async ({ page }) => {
    const badge = page.locator(BADGE_SELECTOR).first();
    const tooltip = badge.locator('[role="tooltip"]');

    await expect(tooltip).toBeHidden();

    await badge.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(PARTNER_BADGE_DESCRIPTION);

    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
  });

  test("opens on Enter for keyboard users", async ({ page }) => {
    const badge = page.locator(BADGE_SELECTOR).first();
    const tooltip = badge.locator('[role="tooltip"]');

    await badge.focus();
    await expect(badge).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(badge).toHaveAttribute("aria-expanded", "true");
    await expect(tooltip).toBeVisible();
  });

  test("sorts partners ahead of higher-award non-partners", async ({ page }) => {
    // Partner status is the primary sort key, so a partner is near the top
    // without a visitor knowing to look for the badge. Assert the first N
    // cards are the partners rather than trusting the badge alone.
    const headings = page.locator("article h3");
    const leading = await headings.allTextContents();
    const expected = new Set(PARTNER_AGENCIES.map((agency) => agency.name));

    for (const name of leading.slice(0, PARTNER_AGENCIES.length)) {
      expect(expected, `"${name}" sorted above a partner`).toContain(name);
    }
  });
});

/**
 * iPhone emulation minus `defaultBrowserType`. Playwright refuses to switch
 * browser engine inside a `describe` (it would force a new worker), and the
 * config only runs Chromium anyway. What this test needs is the touch part -
 * `hasTouch`, viewport, UA - not WebKit specifically.
 */
const { defaultBrowserType: _unusedBrowserType, ...IPHONE_TOUCH } = devices["iPhone 13"];

test.describe("partner badge on touch", () => {
  test.use(IPHONE_TOUCH);

  test.beforeEach(async ({ page }) => {
    assertPreconditions();
    await page.goto(CATEGORY_PATH);
    await dismissCookieBanner(page);
  });

  test("opens on tap without navigating away", async ({ page }) => {
    const badge = page.locator(BADGE_SELECTOR).first();
    const tooltip = badge.locator('[role="tooltip"]');
    await badge.scrollIntoViewIfNeeded();

    await expect(badge).toHaveAttribute("aria-expanded", "false");

    // Record navigations instead of polling the URL. The badge sits inside the
    // card-wide <Link>, and a regressed build still opens the tooltip *first*
    // and navigates a beat later - so `toHaveURL` passes on its first poll,
    // during the pre-navigation window, and the test proves nothing. This was
    // verified: with preventDefault removed, the URL assertion alone still
    // went green while the page was on its way to /directory/agency/<slug>.
    const navigations: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });

    await badge.tap();

    await expect(badge).toHaveAttribute("aria-expanded", "true");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(PARTNER_BADGE_DESCRIPTION);

    // A settle window, because the assertion is that an event does NOT happen
    // and there is nothing to await. Comfortably longer than the observed
    // regression, which committed its navigation well inside a second.
    await page.waitForTimeout(1_500);

    expect(
      navigations,
      "tapping the badge navigated to the agency page instead of explaining the badge — " +
        "PartnerBadgeMark must preventDefault/stopPropagation inside the card's <Link>",
    ).toEqual([]);
    await expect(page).toHaveURL(new RegExp(`${CATEGORY_PATH}/?$`));
  });

  test("dismisses on a tap elsewhere", async ({ page }) => {
    const badge = page.locator(BADGE_SELECTOR).first();
    const tooltip = badge.locator('[role="tooltip"]');
    await badge.scrollIntoViewIfNeeded();

    await badge.tap();
    await expect(tooltip).toBeVisible();

    await page.locator("h1").first().tap();

    await expect(badge).toHaveAttribute("aria-expanded", "false");
    await expect(tooltip).toBeHidden();
  });
});

test.describe("client bundle", () => {
  test("does not ship the scraped dataset to the browser", async ({ page }) => {
    // The badge is a client component, and the partner check it depends on
    // imports agencies.json. If the "use client" boundary moves up from
    // PartnerBadgeMark to PartnerBadge, the whole scrape rides along — JSON
    // module imports are not reliably tree-shaken.
    //
    // Only JS responses are scanned. Agency data legitimately appears in the
    // HTML document (server-rendered markup and the RSC payload) — that is the
    // point of rendering it. A leak means it is in an executable chunk.
    //
    // Markers are data, not identifiers, so they survive minification: object
    // keys are not renamed and string literals are preserved.
    const MARKERS = ["scrapedAt", "honorableMentions", "siteOfTheMonth"];
    const leaks: string[] = [];

    page.on("response", async (response) => {
      try {
        if (!(response.headers()["content-type"] ?? "").includes("javascript")) return;
        const body = await response.text();
        for (const marker of MARKERS) {
          if (body.includes(marker)) {
            leaks.push(`${marker} in ${new URL(response.url()).pathname}`);
          }
        }
      } catch {
        // Some responses cannot be read back (redirects, aborted requests).
      }
    });

    await page.goto(CATEGORY_PATH, { waitUntil: "networkidle" });

    expect(
      leaks,
      "agencies.json reached the client bundle — check that PartnerBadge.tsx is still a " +
        "server component and only PartnerBadgeMark.tsx carries \"use client\".",
    ).toEqual([]);
  });
});
