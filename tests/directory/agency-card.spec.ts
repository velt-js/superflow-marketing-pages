// Browser tests for the agency card's click behaviour on the directory list.
//
// Why this file exists: the card is one click target for the detail page,
// built with a stretched link (`.header::after` covers the card) rather than
// by wrapping the card in an <a> - because the footer still carries the
// agency's own outbound website link, and an anchor inside an anchor is
// invalid HTML. That construction is invisible to `tsc` and to `next build`,
// and it has two failure modes that only show up under a real pointer:
//
//   1. The overlay stops covering the card - a z-index change, a new
//      element with its own stacking context, a card that grows past the
//      overlay - and most of the card silently stops being clickable. That
//      is the state this suite was written for: only the name and logo
//      opened the profile, and every click on the description did nothing.
//   2. The overlay swallows the website link. The agency's own site is the
//      one outbound link the card still carries, and if the overlay wins
//      that click, every link on the grid quietly goes to the same place.

import { test, expect } from "./fixtures";
import { DIRECTORY_BASE_PATH } from "../../lib/directory/constants";

/** The one page that lists agencies. The four category routes it replaced
 *  now 308 here - see the redirect test in directory-list.spec.ts. */
const LIST_PATH = DIRECTORY_BASE_PATH;

test("the consent banner's script is refused, not merely absent", async ({ page }) => {
  // The block in ./fixtures.ts matches one host. If Termly ever moves,
  // the banner comes back and covers the cards again - and the only
  // symptom would be this suite failing on CI and passing everywhere
  // else, which is the exact trap it was written to close. So assert the
  // request was actually intercepted rather than trusting silence: an
  // abort raises `requestfailed`, before the network, so this is the same
  // answer on a runner with the CDN reachable and in a sandbox without
  // it. If <Script id="termly"> is ever removed from
  // components/scripts/ThirdPartyScripts.tsx, delete this test and the
  // block with it.
  const refused: string[] = [];
  page.on("requestfailed", (request) => {
    if (request.url().includes("termly.io")) refused.push(request.url());
  });

  await page.goto(LIST_PATH);
  await expect
    .poll(() => refused.length, {
      message: "the consent banner script was never requested - has its host changed?",
    })
    .toBeGreaterThan(0);
});

test.describe("agency card", () => {
  test.beforeEach(async ({ page }) => {
    // The consent banner would cover the first row of cards on CI; the
    // `test` imported above blocks it. See ./fixtures.ts - this test
    // shipped broken without that.
    await page.goto(LIST_PATH);
  });

  test("clicking the card body opens the agency's detail page", async ({ page }) => {
    const card = page.locator("article").filter({ has: page.locator("h3") }).first();
    await expect(card).toBeVisible();

    // The description sits well away from the name/logo block that used to
    // be the only link, so a pass here means the overlay is really covering
    // the card rather than the header happening to be under the cursor.
    const body = card.locator("p").first();
    await expect(body).toBeVisible();

    // Clicked by coordinate rather than with `body.click()`. Playwright's
    // actionability check refuses to click an element another element sits
    // on top of - and the stretched-link overlay sitting on top of this one
    // is the entire thing being tested, so the guard fires on a correct
    // build. A real mouse click at the description's own coordinates is
    // what a visitor does, and the browser routes it to whatever is
    // actually on top: the overlay on a working build, the inert <p> on a
    // broken one, which leaves the URL where it was and fails below.
    //
    // Checked before clicking, because "the URL did not change" is a
    // terrible description of "something is covering the card". This names
    // whatever is actually on top.
    const onTop = await body.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return {
        opensProfile: Boolean(hit?.closest("a[href^='/directory/agency/']")),
        describe: hit ? `${hit.tagName.toLowerCase()}.${hit.className}`.slice(0, 120) : "nothing",
      };
    });
    expect(
      onTop.opensProfile,
      `the card's stretched link should be on top of its description, but ${onTop.describe} is`,
    ).toBe(true);

    const box = await body.boundingBox();
    expect(box, "the description should have a layout box to click").not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);

    await expect(page).toHaveURL(/\/directory\/agency\/[^/]+$/);
    // A real profile, not a 404 shell.
    await expect(page.locator("h1")).toBeVisible();
  });

  test("the agency's own website link still wins its own click", async ({ page }) => {
    const websiteLink = page
      .locator("article a[target='_blank'][rel*='noopener']")
      .first();
    await expect(websiteLink).toBeVisible();
    const href = await websiteLink.getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);

    // Opens in a new tab, so the grid must still be the page we are on. If
    // the stretched-link overlay had swallowed this, we would be sitting on
    // an agency profile instead.
    await websiteLink.click();
    await expect(page).toHaveURL(new RegExp(`${LIST_PATH}/?$`));
  });

  test("the card carries no link back to the source directory", async ({ page }) => {
    const card = page.locator("article").filter({ has: page.locator("h3") }).first();
    // Attribution lives on the detail page this card opens, one click away.
    // The figures on the card still name their source in the label itself
    // ("48 Awwwards awards"), so nothing here is an unattributed claim.
    await expect(card.locator("a[href*='awwwards.com']")).toHaveCount(0);
    await expect(card.locator("a[href*='semrush.com']")).toHaveCount(0);
  });

  test("no anchor is nested inside another anchor", async ({ page }) => {
    // The whole reason the card uses an overlay instead of wrapping itself
    // in a link. Browsers recover from nested anchors in incompatible ways,
    // so this must never regress into "just wrap the card".
    const nested = await page.locator("article a a").count();
    expect(nested).toBe(0);
  });
});
