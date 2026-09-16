// The "Worked with" list is the only place the directory can show a
// visitor the actual work, rather than describing it.
//
// Every client row already carried up to two addresses and rendered
// neither: `domain`, the client's own site - for most rows the live site
// the agency built - and `projectUrl`, the source's page for that project.
// A founder comparing studios wants the first of those, so the name links
// to it, and a row that has only the citation links to that instead.
//
// Two things are worth a test. The choice between the two fields is a
// judgement that reads as arbitrary from the code alone, so it is asserted
// here rather than left to a comment. And the rendering has to survive a
// row with no link at all - 719 of 1,515 rows have neither address - which
// must be plain text and never a dead anchor.

import { test, expect } from "./fixtures";
import { getAgencyClientLink } from "../../lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "../../lib/directory/constants";
import type { AgencyClient } from "../../lib/directory/types";

/** A client row with nothing on it, so each case below states only the
 *  field it is about. */
const ROW: AgencyClient = {
  name: "Example",
  domain: null,
  projectTitle: "Example",
  projectUrl: null,
  notable: false,
};

/** An agency whose clients all carry their own domains, and one of the
 *  four that replied to outreach - see
 *  scripts/agency-corrections/agency-corrections.json. */
const PROFILE_PATH = `${DIRECTORY_BASE_PATH}/agency/malvah`;

test.describe("client links", () => {
  test("the live client site wins over the source's project page", () => {
    // Both present: the site the agency built beats a citation for it.
    expect(
      getAgencyClientLink({
        ...ROW,
        domain: "moooi.com",
        projectUrl: "https://www.awwwards.com/sites/moooi",
      }),
    ).toBe("https://moooi.com/");

    // Only the citation: better than no link at all.
    expect(
      getAgencyClientLink({ ...ROW, projectUrl: "https://www.awwwards.com/sites/moooi" }),
    ).toBe("https://www.awwwards.com/sites/moooi");

    // Neither: the row renders as text, so the answer is null rather than
    // an address guessed from the name.
    expect(getAgencyClientLink(ROW)).toBeNull();
  });

  test("a domain is turned into a URL however it was typed", () => {
    expect(getAgencyClientLink({ ...ROW, domain: "firstlight.healthcare" })).toBe(
      "https://firstlight.healthcare/",
    );
    // A record typed by hand may carry a full URL in the same field.
    expect(getAgencyClientLink({ ...ROW, domain: "https://eu.akris.com/" })).toBe(
      "https://eu.akris.com/",
    );
    // And anything that is not an address at all is no link, not a broken
    // one - `javascript:` included, since this value reaches an href.
    expect(getAgencyClientLink({ ...ROW, domain: "not a domain" })).toBeNull();
    expect(getAgencyClientLink({ ...ROW, domain: "javascript:alert(1)" })).toBeNull();
    expect(getAgencyClientLink({ ...ROW, projectUrl: "javascript:alert(1)" })).toBeNull();
  });

  test("the profile renders those links, and opens them safely", async ({ page }) => {
    await page.goto(PROFILE_PATH);

    const card = page.locator("div").filter({ has: page.getByRole("heading", { name: "Worked with" }) });
    const links = card.locator("li a");
    await expect(links.first()).toBeVisible();

    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => ({
        href: (node as HTMLAnchorElement).href,
        rel: node.getAttribute("rel") ?? "",
        target: node.getAttribute("target") ?? "",
      })),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    for (const link of hrefs) {
      // Off-site by definition: a client link that resolved to our own
      // origin would mean a bare domain was rendered as a relative path.
      expect(link.href).toMatch(/^https?:\/\//);
      expect(link.href).not.toContain("usesuperflow.ai");
      expect(link.href).not.toContain("127.0.0.1");
      // New tab, and no window.opener handed to a site we do not control.
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
    }
  });
});
