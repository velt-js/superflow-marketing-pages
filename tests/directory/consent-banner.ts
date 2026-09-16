// Dismissing the consent banner before driving the directory pages.
//
// The site loads Termly's consent UI (see components/scripts/ThirdPartyScripts.tsx).
// On a fresh browser profile it renders a bar pinned across the bottom of the
// viewport, over whatever the page put there - on /directory at 1280x720 that
// is the first row of agency cards.
//
// It is invisible in a sandbox that cannot reach Termly's CDN and present on
// CI, which is the worst shape a test dependency can have: a suite that
// passes on the machine you are fixing it on and fails on the one that
// gates the merge. That is exactly how the card-body click test shipped
// broken - the click landed on the banner, the page did not navigate, and
// the only clue was "expected /directory/agency/..., received /directory".
//
// So every spec here that clicks something dismisses it first.

import type { Page } from "@playwright/test";

/** Buttons Termly offers, in the order we would rather press them. Either
 *  dismisses the bar; neither is under test. */
const DISMISS_LABELS = ["Accept", "Decline"];

/**
 * Dismisses the consent banner if it is showing.
 *
 * A no-op when it is absent, which is the normal case locally - so a spec
 * can call this unconditionally rather than branching on an environment it
 * cannot see.
 *
 * @param page - The page to dismiss the banner on.
 */
export async function dismissConsentBanner(page: Page): Promise<void> {
  for (const label of DISMISS_LABELS) {
    const button = page.getByRole("button", { name: label, exact: true });
    if (await button.count()) {
      await button
        .first()
        .click({ timeout: 5_000 })
        .catch(() => {});
      return;
    }
  }
}
