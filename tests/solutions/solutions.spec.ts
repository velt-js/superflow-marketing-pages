// Browser checks for the /solutions pages and the home / agents page changes
// that shipped with them (solutions spec, section 9 acceptance criteria).
//
// These encode the rules a grep cannot: the copy rules apply to what a visitor
// reads, so they are checked on rendered text; the 375px rule is about real
// layout, so it is measured in a browser. Run against the local production
// build (default) or any deployment:
//
//   npx playwright test tests/solutions
//   TOOLS_BASE_URL=https://usesuperflow.ai npx playwright test tests/solutions

import { test, expect, type Page } from "@playwright/test";
import { SOLUTION_SEED, solutionPath } from "../../lib/solutions/seed";
import { HOME_HERO_AGENTS } from "../../lib/solutions/agent-library";

/** Every batch-1 solutions route plus the index. */
const SOLUTION_ROUTES = ["/solutions", ...SOLUTION_SEED.map((page) => solutionPath(page.slug))];

/** Phone viewport the spec names (375px wide). */
const PHONE_VIEWPORT = { width: 375, height: 812 };

/** Rendered copy must never contain these (case-insensitive). */
const BANNED_IN_BODY = ["one per row", "per row", "one per line", "seamless", "verification"];

/** Old routes that must 301 to their new homes. */
const REDIRECTS: Array<[string, string]> = [
  ["/use-case/uat-qa-testing", "/solutions/pre-launch-qa"],
  ["/use-case/client-feedback", "/client-review"],
  ["/use-case/bug-reporting", "/solutions/pre-launch-qa"],
  ["/use-case/conversion-optimization", "/solutions"],
  ["/use-case/ux-ui-optimization", "/solutions"],
  ["/user-persona/qa-teams", "/solutions/pre-launch-qa"],
  ["/user-persona/project-managers", "/solutions/site-care"],
  ["/user-persona/founders", "/"],
  ["/user-persona/developers", "/solutions/website-migration-qa"],
  ["/user-persona/product-companies", "/"],
  ["/user-persona/marketing-agencies", "/solutions"],
  ["/user-persona/designers", "/solutions/pre-launch-qa"],
  ["/user-persona/product-managers", "/"],
  ["/user-persona/marketers", "/solutions"],
];

/**
 * The visible text of the page body outside the site chrome. The Product nav
 * still carries a "Website Monitoring" link to the existing URL, which the
 * spec allows, so header, nav and footer are excluded from the copy checks.
 *
 * @param page - The Playwright page.
 * @returns The trimmed inner text of the body minus header/nav/footer.
 */
async function bodyCopy(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("header, nav, footer, script, style, noscript").forEach((node) => {
      node.remove();
    });
    return (clone.innerText || clone.textContent || "").trim();
  });
}

/**
 * Width the document would scroll to, versus the viewport. Equal means no
 * horizontal scroll.
 *
 * @param page - The Playwright page.
 * @returns Both widths.
 */
async function scrollWidths(page: Page): Promise<{ document: number; viewport: number }> {
  return page.evaluate(() => ({
    document: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
    viewport: document.documentElement.clientWidth,
  }));
}

test.describe("solutions pages", () => {
  for (const route of SOLUTION_ROUTES) {
    test(`${route} renders, follows the copy rules and fits a phone`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should render`).toBe(200);

      // Exactly one H1.
      await expect(page.locator("h1")).toHaveCount(1);

      const copy = await bodyCopy(page);
      expect(copy, "em dash or en dash in rendered copy").not.toMatch(/[—–]/);
      const lower = copy.toLowerCase();
      for (const phrase of BANNED_IN_BODY) {
        expect(lower, `banned phrase "${phrase}" in rendered copy`).not.toContain(phrase);
      }
      expect(lower, '"website monitoring" in body copy').not.toContain("website monitoring");

      // Structured data the spec asks for.
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      const joined = jsonLd.join("\n");
      expect(joined).toContain('"BreadcrumbList"');
      if (route !== "/solutions") {
        expect(joined).toContain('"FAQPage"');
        expect(joined).toContain('"SoftwareApplication"');
      } else {
        expect(joined).toContain('"ItemList"');
      }

      // 375px: no horizontal scroll.
      await page.setViewportSize(PHONE_VIEWPORT);
      await page.waitForTimeout(300);
      const widths = await scrollWidths(page);
      expect(widths.document, "page scrolls sideways at 375px").toBeLessThanOrEqual(widths.viewport);
    });
  }

  for (const solution of SOLUTION_SEED) {
    test(`${solution.slug}: every agent card carries a finding and the pack CTA preselects the pack`, async ({ page }) => {
      await page.goto(solutionPath(solution.slug));

      // Eight pack cards plus the "Build your own" result card.
      const cards = page.locator("[data-agent-card]");
      await expect(cards).toHaveCount(solution.pack.agents.length + 1);
      for (const agent of solution.pack.agents) {
        const card = page.locator(`[data-agent-card="${agent.name}"]`);
        await expect(card).toHaveCount(1);
        await expect(card).toContainText(agent.finding);
      }

      // The pack CTA carries the pack slug for onboarding.
      const cta = page.locator(`a[href*="?pack=${solution.pack.slug}"]`);
      await expect(cta.first()).toBeVisible();

      // Body copy links to the two feature pages the spec names.
      await expect(page.locator('main a[href="/ai-review-agents"]').first()).toBeAttached();
      await expect(page.locator('main a[href="/client-review"]').first()).toBeAttached();

      // Two related solutions.
      const related = page.locator('[data-section="related-solutions"] a[href^="/solutions/"]');
      await expect(related).toHaveCount(2);
    });
  }

  test("the index lists all six batch-1 pages", async ({ page }) => {
    await page.goto("/solutions");
    for (const solution of SOLUTION_SEED) {
      await expect(page.locator(`a[href="${solutionPath(solution.slug)}"]`).first()).toBeVisible();
    }
  });
});

test.describe("home and agents page", () => {
  test("home: hero lists the five agents, the catch section is live, cards link out", async ({ page }) => {
    await page.goto("/");
    for (const agentName of HOME_HERO_AGENTS) {
      await expect(page.getByText(agentName, { exact: true }).first()).toBeAttached();
    }
    await expect(page.getByRole("heading", { name: "What your agents catch." })).toBeVisible();
    await expect(page.locator('a[href="/solutions/dental-marketing-agencies"]').first()).toBeAttached();
    await expect(page.locator('a[href="/solutions/site-care"]').first()).toBeAttached();
    await expect(page.locator('a[href="/solutions/website-migration-qa"]').first()).toBeAttached();

    await page.setViewportSize(PHONE_VIEWPORT);
    await page.waitForTimeout(300);
    const widths = await scrollWidths(page);
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  });

  test("agents page: catch section replaces the weak example cards", async ({ page }) => {
    await page.goto("/ai-review-agents");
    await expect(page.getByRole("heading", { name: "What your agents catch." })).toBeVisible();
    const copy = await bodyCopy(page);
    for (const weak of ["Profanity Filter", "Grid Layout", "Grammar Check"]) {
      expect(copy, `weak example "${weak}" still on the agents page`).not.toContain(weak);
    }
    expect(copy).toContain("Noindex Check");
    expect(copy).toContain("Palette Guard");
  });
});

test.describe("site chrome", () => {
  test("nav has a Solutions menu with both columns", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /^Solutions/ });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByText("By agency").first()).toBeVisible();
    await expect(page.getByText("By job").first()).toBeVisible();
    for (const solution of SOLUTION_SEED) {
      await expect(page.locator(`a[href="${solutionPath(solution.slug)}"]`).first()).toBeVisible();
    }
  });

  test("footer has a Solutions column and no Use Cases or User Persona column", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "Solutions" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Use Cases" })).toHaveCount(0);
    await expect(footer.getByRole("heading", { name: "User Persona" })).toHaveCount(0);
    await expect(footer.locator('a[href="/solutions"]')).toHaveCount(1);
  });

  test("old use-case and persona URLs 301 to their new homes", async ({ request }) => {
    for (const [from, to] of REDIRECTS) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), `${from} should 301`).toBe(301);
      const location = response.headers()["location"] ?? "";
      expect(location.replace(/^https?:\/\/[^/]+/, "") || "/", `${from} should land on ${to}`).toBe(to);
    }
  });

  test("sitemap lists the solutions pages and none of the retired ones", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).toContain("/solutions</loc>");
    for (const solution of SOLUTION_SEED) {
      expect(xml).toContain(`${solutionPath(solution.slug)}</loc>`);
    }
    expect(xml).not.toContain("/use-case");
    expect(xml).not.toContain("/user-persona");
  });
});
