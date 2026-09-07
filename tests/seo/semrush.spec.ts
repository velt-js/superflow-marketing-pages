import { test, expect } from "@playwright/test";
import { JSDOM } from "jsdom";
import audit from "./semrush-20260907.json";

// Validate the original crawl's URLs against a production build. These checks
// inspect HTML delivered to crawlers, not just a hydrated browser DOM.
const paths = [...new Set(Object.values(audit.issues).flat())].filter(
  (path) => path !== "/integrations/api" && path !== "/sitemap.xml",
);
function nodes(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object") return [];
  return [value as Record<string, unknown>, ...Object.values(value).flatMap(nodes)];
}

for (const path of paths) {
  test(`audited HTML: ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const dom = new JSDOM(await response.text());
    const doc = dom.window.document;
    try {
      expect(doc.querySelectorAll('a[href="/integrations/api"], a[href="/website-review"]')).toHaveLength(0);
      if (audit.issues["104"].includes(path)) {
        expect(doc.querySelectorAll("h1")).toHaveLength(1);
      }
      if (audit.issues["102"].includes(path)) {
        expect(doc.title.length).toBeLessThanOrEqual(60);
        expect(doc.title.length).toBeGreaterThan(10);
      }
      if (audit.issues["45"].includes(path)) {
        const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')]
          .flatMap((script) => nodes(JSON.parse(script.textContent || "{}")));
        expect(schemas.some((node) => node["@type"] === "WebPage" || node["@type"] === "ItemList")).toBe(true);
        for (const node of schemas) {
          if (node["@type"] === "SoftwareApplication") {
            expect(node.aggregateRating || node.review).toBeTruthy();
            expect(node.offers).toBeTruthy();
          }
          if (node["@type"] === "Offer") {
            const price = node.price ?? (node.priceSpecification as Record<string, unknown>)?.price;
            expect(price).toBeDefined();
            expect(String(price)).toMatch(/^\d+(\.\d+)?$/);
          }
        }
      }
      if (audit.issues["223"].includes(path)) {
        let previous = 0;
        for (const heading of doc.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
          const level = Number(heading.tagName.slice(1));
          expect(level, heading.textContent || "heading").toBeLessThanOrEqual(previous + 1);
          previous = level;
        }
      }
      if (audit.issues["202"].includes(path)) {
        expect(doc.querySelectorAll('a[rel~="nofollow"]')).toHaveLength(0);
      }
      if (path === "/privacy") {
        for (const href of ["https://stripe.com/privacy", "https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm", "https://www.edoeb.admin.ch/edoeb/en/home.html", "http://www.aboutads.info/choices/"]) {
          const anchor = doc.querySelector(`a[href="${href}"]`);
          expect(anchor?.textContent?.trim()).toBeTruthy();
          expect(anchor?.textContent?.trim()).not.toBe(href);
        }
      }
      if (path === "/seo-checklist-2023") {
        expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
      }
      if (path === "/user-persona/project-managers") {
        expect(doc.querySelector('a[href="/blog/top-13-asana-alternatives-for-project-management-in-startups-and-agencies"]')).not.toBeNull();
      }
    } finally {
      dom.window.close();
    }
  });
}

test("sitemap excludes retired and held URLs; legacy API link redirects", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const path of ["/website-review", "/seo-checklist-2023", "/integrations/figma", "/integrations/api"]) {
    expect(xml).not.toContain(`https://usesuperflow.ai${path}</loc>`);
  }
  const api = await request.get("/integrations/api", { maxRedirects: 0 });
  expect(api.status()).toBe(308);
  expect(api.headers().location).toBe("/docs/rest-apis/projects/create-project");
});

test("review heading and cached testimonial logo render on mobile and desktop", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/video-review");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Impossibly Fast");
    await expect(page.locator("h1")).toBeVisible();
    await page.goto("/pricing");
    const logo = page.getByRole("img", { name: "Wonderist logo", exact: true });
    await logo.scrollIntoViewIfNeeded();
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});
