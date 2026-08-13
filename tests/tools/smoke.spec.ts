// Browser smoke tests for every live free tool.
//
// Why this file exists: the AI Visibility Checker and its robots.txt sibling
// shipped to production broken. `tsc` passed, `next build` passed, and the API
// route answered HTTP 200 with a valid report, because the defect was that the
// backend deletes `findings` from the report while the TypeScript type still
// promised it. The only place that failure was observable was a browser, where
// the report view called `.filter()` on `undefined` and the page rendered
// nothing but "This page couldn't load".
//
// So the rule these tests encode is: a tool is only "live" if a browser has
// driven it end to end and the page raised no uncaught error. Checking the
// endpoint is not checking the tool.
//
// Run against a local server (default) or any deployment:
//   npx playwright test tests/tools
//   TOOLS_BASE_URL=https://usesuperflow.ai npx playwright test tests/tools

import { test, expect, type Page } from "@playwright/test";
import { TOOLS, liveTools, toolPath } from "../../lib/tools/registry";

/**
 * Third-party hosts we neither control nor test. A blocked analytics beacon is
 * not a tool failure, and treating it as one would make the suite noisy enough
 * that people stop reading it.
 */
const THIRD_PARTY = [
  "googletagmanager.com",
  "google-analytics.com",
  "intercom",
  "termly.io",
  "cdn.velt.dev",
  "rewardful",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];

/** True when a console message is about a host we do not own. */
function isThirdParty(text: string): boolean {
  return THIRD_PARTY.some((host) => text.includes(host));
}

/**
 * Attaches error collection to a page.
 *
 * `pageerror` is the signal that matters: it fires for the uncaught exception
 * that trips React's error boundary, which is exactly the production failure
 * this suite exists to catch.
 *
 * @param page - The page to watch.
 * @returns The array errors accumulate into.
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];

  // The signal that matters. This is what fires when a render throws and the
  // error boundary replaces the page.
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  // Resource failures are judged by origin, not by message text. Chromium
  // reports a blocked request as a bare "Failed to load resource:
  // net::ERR_CONNECTION_RESET" with no URL, so filtering the console string
  // cannot tell our own broken asset from a blocked analytics beacon. The
  // request object carries the URL, so this asks the question properly.
  page.on("requestfailed", (request) => {
    try {
      const failedHost = new URL(request.url()).host;
      const ourHost = new URL(page.url()).host;
      if (failedHost !== ourHost) return;
      errors.push(`requestfailed: ${request.url()}`);
    } catch {
      // An unparseable URL is not evidence of a broken tool.
    }
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // Already covered, with a URL, by the requestfailed handler above.
    if (text.startsWith("Failed to load resource")) return;
    if (isThirdParty(text)) return;
    errors.push(`console: ${text.slice(0, 300)}`);
  });

  return errors;
}

test.describe("every live tool page loads clean", () => {
  for (const tool of liveTools()) {
    test(`${tool.slug} renders with no uncaught error`, async ({ page }) => {
      const errors = collectErrors(page);

      const response = await page.goto(toolPath(tool.slug), {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status(), `${tool.slug} HTTP status`).toBe(200);

      // The H1 proves the page template rendered, not just that bytes arrived.
      await expect(page.locator("h1")).toBeVisible();

      // The privacy line is a brief commitment, not a nice-to-have, so its
      // absence is a test failure rather than a copy nit.
      await expect(
        page.getByText(/no login, no email/i).first(),
      ).toBeVisible();

      expect(errors, `${tool.slug} console/page errors`).toEqual([]);
    });
  }
});

test.describe("planned tools are not reachable from the index", () => {
  test("no planned tool is linked", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const planned = TOOLS.filter((tool) => tool.status === "planned");
    for (const tool of planned) {
      // A linked card for an unbuilt tool is a 404 in front of a stranger.
      await expect(
        page.locator(`a[href="${toolPath(tool.slug)}"]`),
        `${tool.slug} must not be linked while planned`,
      ).toHaveCount(0);
    }
  });
});

test.describe("the AI visibility tools survive a real run", () => {
  // These two share an engine and are the pair that shipped broken, so they
  // get a run assertion rather than a load assertion.
  const CASES = [
    { slug: "ai-visibility-checker", heading: /AI Visibility|Visibility/i },
    { slug: "robots-txt-ai-checker", heading: /robots\.txt/i },
  ];

  for (const testCase of CASES) {
    test(`${testCase.slug} renders a report end to end`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = collectErrors(page);

      await page.goto(`${toolPath(testCase.slug)}?url=${encodeURIComponent("https://example.com")}`, {
        waitUntil: "domcontentloaded",
      });

      // The deep link auto-runs, so the report is the thing to wait for. The
      // score dial only exists once a report is in hand.
      await expect(page.getByText("out of 100")).toBeVisible({
        timeout: 90_000,
      });

      // "What we found" is the section that used to throw.
      await expect(
        page.getByRole("heading", { name: "What we found" }),
      ).toBeVisible();

      // The heading alone is a weak assertion: it renders whether or not a
      // single finding survived the trip. A category group heading only exists
      // when findings were actually mapped and grouped, so this is what proves
      // the backend's detached findings were reattached rather than dropped.
      await expect(
        page.getByRole("heading", {
          name: /^(Access|Readability|Structure|Identity)$/,
        }).first(),
      ).toBeVisible();

      expect(errors, `${testCase.slug} errors during run`).toEqual([]);
    });
  }
});
