// Consent test: proves no non-essential third party is contacted, and no
// non-essential cookie or storage key is set, until the visitor says yes.
//
// Must pass on a preview deployment before a change that touches scripts,
// the consent gate or the banner is merged:
//   CONSENT_BASE_URL=https://<preview>.vercel.app npm run consent:test
//
// What counts as essential is decided in ONE place, ./config.mjs. If this test
// goes red, the fix is almost never to add a host there - it is to route the
// new script through components/consent/ConsentScripts.tsx.
//
// Scenarios, per the consent spec:
//   - no interaction:  every key page, nothing clicked
//   - Reject all:      nothing loads, on that page or the next one
//   - Accept all:      the expected tools do load, and keep loading on the next page
//   - GPC on:          no Marketing tool loads, even after Accept
//   - footer link:     "Cookie settings" reopens the preferences panel

import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { KEY_PAGES, isEssential, isEssentialStorage, isMarketing, isOwned, vendorFor } from "./config.mjs";

const SETTLE_MS = 5_000;
// The Termly banner and preferences panel are rendered by Termly; these are
// the stable parts of its markup.
const BANNER = "[class*='termly-styles-termly-banner']";

type Req = { host: string; url: string };

/** Records every request this page makes to a host we do not own. */
function recordThirdParty(page: Page): Req[] {
  const baseHost = new URL(test.info().project.use.baseURL ?? "http://127.0.0.1").hostname;
  const seen: Req[] = [];
  page.on("request", (req) => {
    let host = "";
    try {
      host = new URL(req.url()).hostname;
    } catch {
      return;
    }
    if (!host || host === baseHost || isOwned(host)) return;
    seen.push({ host, url: req.url() });
  });
  return seen;
}

const describe = (reqs: Req[]) =>
  [...new Set(reqs.map((r) => `${r.host} (${vendorFor(r.host, r.url)?.tool ?? "unknown"}) ${r.url.slice(0, 90)}`))];

const nonEssential = (reqs: Req[]) => describe(reqs.filter((r) => !isEssential(r.host, r.url)));
const marketing = (reqs: Req[]) => describe(reqs.filter((r) => isMarketing(r.host, r.url)));

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

/** Cookies (any domain) and web-storage keys that are not on the allowlist. */
async function nonEssentialState(context: BrowserContext, page: Page) {
  const cookies = (await context.cookies())
    .filter((c) => !isEssentialStorage(c.name) && !isEssential(c.domain.replace(/^\./, "")))
    .map((c) => `cookie ${c.name} @ ${c.domain}`);
  const storage = await page.evaluate(() => {
    const keys = (s: () => Storage) => {
      try {
        return Object.keys(s());
      } catch {
        return [];
      }
    };
    return [...keys(() => localStorage), ...keys(() => sessionStorage)];
  });
  return [...cookies, ...storage.filter((k) => !isEssentialStorage(k)).map((k) => `storage ${k}`)];
}

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "load", timeout: 60_000 });
  await settle(page);
}

async function bannerButton(page: Page, name: RegExp) {
  const button = page.locator(BANNER).getByRole("button", { name });
  await expect(button, "the consent banner should be showing").toBeVisible();
  return button;
}

test.describe("before any choice", () => {
  for (const { name, path } of KEY_PAGES) {
    test(`${name} (${path}) loads nothing non-essential`, async ({ page, context }) => {
      const reqs = recordThirdParty(page);
      await open(page, path);

      expect(nonEssential(reqs), "third parties contacted before consent").toEqual([]);
      expect(await nonEssentialState(context, page), "state set before consent").toEqual([]);

      // /docs is Mintlify's site behind our proxy: it has neither our banner
      // nor our footer, and (asserted above) nothing to consent to.
      if (path === "/docs") return;
      await expect(page.locator(BANNER), "banner shows on first visit").toBeVisible();
      await expect(page.locator("[data-cookie-settings]").first(), "footer has a Cookie settings link").toBeAttached();
    });
  }
});

test("Reject all: nothing loads, on this page or the next", async ({ page, context }) => {
  await open(page, "/");
  const reqs = recordThirdParty(page);
  await (await bannerButton(page, /^decline/i)).click();
  await settle(page);
  await expect(page.locator(BANNER)).toBeHidden();

  await open(page, "/pricing");
  expect(nonEssential(reqs), "third parties contacted after Reject").toEqual([]);
  expect(await nonEssentialState(context, page), "state set after Reject").toEqual([]);
  await expect(page.locator(BANNER), "the choice persists across pages").toBeHidden();
});

test("Accept all: the expected tools load, and keep loading on the next page", async ({ page }) => {
  await open(page, "/");
  const reqs = recordThirdParty(page);
  await (await bannerButton(page, /^accept/i)).click();
  await settle(page);

  const hosts = () => new Set(reqs.map((r) => r.host));
  for (const expected of [
    "www.googletagmanager.com", // gtag.js (GA4 + Ads) and the GTM container
    "static.claydar.com", // Claydar
    "ddwl4m2hdecbv.cloudfront.net", // RB2B
    "r.wdfl.co", // Rewardful
  ]) {
    expect(hosts(), `${expected} after Accept all`).toContain(expected);
  }
  expect(reqs.some((r) => /googletagmanager\.com\/gtm\.js/.test(r.url)), "GTM container after Accept all").toBe(true);
  if (process.env.CONSENT_EXPECT_AMPLITUDE !== "0") {
    expect(
      reqs.some((r) => /amplitude\.com|cdn\.velt\.dev\/am/.test(r.url)),
      "Amplitude after Accept all (set CONSENT_EXPECT_AMPLITUDE=0 for a build without an Amplitude key)",
    ).toBe(true);
  }

  reqs.length = 0;
  await open(page, "/pricing");
  expect(hosts(), "consent persists to the next page").toContain("static.claydar.com");
});

test.describe("with Global Privacy Control on", () => {
  test.use({ extraHTTPHeaders: { "Sec-GPC": "1" } });

  test("no Marketing tool loads, even after Accept", async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true, configurable: true });
    });
    const reqs = recordThirdParty(page);
    await open(page, "/");
    expect(nonEssential(reqs), "third parties contacted before consent").toEqual([]);
    await expect(page.locator(`${BANNER} [data-gpc-notice]`), "the banner says GPC is honoured").toBeVisible();

    await (await bannerButton(page, /^accept/i)).click();
    await settle(page);
    await open(page, "/pricing");

    expect(marketing(reqs), "Marketing tools under GPC").toEqual([]);
    const cookies = (await context.cookies()).map((c) => c.name);
    expect(cookies.filter((n) => /^_gcl_|^_fbp$|^_twpid$|^rewardful/.test(n)), "Marketing cookies under GPC").toEqual([]);
    // Analytics is not covered by GPC, so accepting it still works.
    expect(reqs.some((r) => /googletagmanager\.com\/gtag\/js/.test(r.url)), "Analytics still loads").toBe(true);
  });
});

test("footer Cookie settings link reopens the preferences panel", async ({ page }) => {
  await open(page, "/pricing");
  await (await bannerButton(page, /^decline/i)).click();
  await expect(page.locator(BANNER)).toBeHidden();

  const link = page.locator("[data-cookie-settings]").first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page.getByText(/essential cookies/i).first(), "Termly preferences panel").toBeVisible();
});
