// The `test` every directory spec uses, with the consent banner kept off
// the page.
//
// The site loads Termly's consent UI (see
// components/scripts/ThirdPartyScripts.tsx). On a fresh browser profile it
// renders a bar pinned across the bottom of the viewport, over whatever the
// page put there - on /directory at 1280x720 that is the first row of
// agency cards.
//
// It is invisible in a sandbox that cannot reach Termly's CDN and present
// on CI, which is the worst shape a test dependency can have: a suite that
// passes on the machine you are fixing it on and fails on the one that
// gates the merge. That is exactly how the card-body click test shipped
// broken - the click landed on the banner, the page did not navigate, and
// the only clue was "expected /directory/agency/..., received /directory".
//
// WHY BLOCKED RATHER THAN DISMISSED: the script is `afterInteractive`, so
// it can inject the bar at any point after `page.goto()` resolves. Asking
// whether a dismiss button is on the page is therefore a snapshot of one
// moment, and a banner that lands a second later - a slow CDN, a cold
// cache, a loaded CI runner - walks straight past it and covers the cards
// again. Refusing the request has no such window, and it makes a local run
// and a CI run the same run, which is the only version of this fix that
// stays fixed.
//
// Nothing here is under test: consent is Termly's UI, not ours. If the bar
// ever does appear - a new host, a bundled build - the hit test in
// agency-card.spec.ts names whatever is covering the card, rather than
// leaving "the URL did not change" as the only clue.

import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/** Where `<Script id="termly">` loads from. */
const TERMLY_URL = /^https?:\/\/app\.termly\.io\//;

/**
 * Refuses the consent banner's script for one page.
 *
 * Exported for a spec that builds its own page or context; every test
 * taking the `page` fixture below already has it.
 *
 * @param page - The page to install the block on. Must be called before
 *               the navigation that would load the script.
 */
export async function blockConsentBanner(page: Page): Promise<void> {
  await page.route(TERMLY_URL, (route) => route.abort());
}

/** Playwright's `test`, with the banner blocked on the `page` fixture.
 *  Overriding `page` rather than adding an auto fixture keeps the
 *  request-only tests in directory-list.spec.ts from opening a browser
 *  page they never use. */
export const test = base.extend({
  // Playwright calls the second argument `use`; named `runTest` here
  // because the React lint rules read a bare `use(...)` as the React hook
  // and reject it for being called outside a component.
  page: async ({ page }, runTest) => {
    await blockConsentBanner(page);
    await runTest(page);
  },
});

export { expect };
