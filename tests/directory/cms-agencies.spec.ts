// Logic tests for the mapping from Sanity `agency` documents onto the
// `Agency` contract the directory renders (lib/directory/cms.ts).
//
// Why this file exists: that mapping is now the site's primary read path -
// every card, every profile, every Markdown copy and every JSON-LD node is
// built from whatever it returns. A CMS document is whatever an editor last
// saved, so the mapping's job is to be defensive, and the ways it can fail
// are all invisible to `tsc`:
//
//   1. A record with no slug or no name would render as a nameless card
//      linking to /directory/agency/ - a broken page, published.
//   2. `awards.total` is derived, never read. A stored total drifts the
//      moment someone corrects one award count, and the total is what the
//      whole web-design category is ranked on.
//   3. A rating needs its scale. "4.8" with nothing to be out of is not a
//      rating, and printing it beside a link to the source that published
//      it would misquote them.
//   4. A source we cannot name must never be guessed into a directory's
//      name - the label is printed as the citation under the figures.
//   5. `budgetFloorUsd: 0` and a missing floor are different claims:
//      "takes work at any budget" versus "did not say". Collapsing them is
//      how an unqualified agency lands in a premium listing.
//
// These run without a browser, a server or a network: they are pure
// functions of the fixtures below.

import { test, expect } from "@playwright/test";
import { toAgencies, toAgency, type CmsAgencyDocument } from "../../lib/directory/cms";

/** A document with everything a real record carries, to vary from. */
const FULL: CmsAgencyDocument = {
  slug: "example-studio",
  name: "Example Studio",
  website: "https://example.studio/",
  domain: "example.studio",
  profileUrl: "https://www.awwwards.com/example-studio/",
  location: { city: "Berlin", country: "Germany", countryCode: "de" },
  categories: ["web-design"],
  services: ["Web Design", " "],
  industries: ["Ecommerce"],
  teamSize: "11-50",
  logoUrl: "https://example.studio/logo.png",
  description: "  An example studio.  ",
  awards: { siteOfTheDay: 3, honorableMentions: 2 },
  rating: null,
  accolades: ["Awwwards Studio of the Year"],
  foundedYear: 2014,
  budgetLabel: "Starting from $5,000",
  budgetFloorUsd: 5000,
  clients: [
    { name: "Nike", projectTitle: "Nike Air", domain: "NIKE.COM", notable: true },
    { name: "  ", projectTitle: "Dropped" },
  ],
  source: "awwwards",
  scrapedAt: "2026-09-07T18:24:18.522Z",
  listing: null,
};

test.describe("cms agency mapping", () => {
  test("a document with no slug or no name is dropped", () => {
    expect(toAgency({ ...FULL, slug: "   " })).toBeNull();
    expect(toAgency({ ...FULL, name: undefined })).toBeNull();
    // And the list drops it rather than rendering a hole.
    expect(toAgencies([FULL, { ...FULL, slug: "other", name: "" }])).toHaveLength(1);
  });

  test("the award total is recomputed from the parts, never read", () => {
    const agency = toAgency({
      ...FULL,
      // A stale total, as a document edited one field at a time will carry.
      awards: { siteOfTheDay: 3, honorableMentions: 2, nominees: 1 },
    });
    expect(agency?.awards.total).toBe(6);
    // Every award type is present as a number, so the ranking never has to
    // null-guard a field a source does not run.
    expect(agency?.awards.developerAward).toBe(0);
  });

  test("a rating without a scale is not a rating", () => {
    expect(toAgency({ ...FULL, rating: { value: 4.8 } })?.rating).toBeNull();
    expect(toAgency({ ...FULL, rating: { value: 4.8, scale: 0 } })?.rating).toBeNull();
    expect(
      toAgency({ ...FULL, rating: { value: 4.8, scale: 5, reviewCount: 108 } })?.rating,
    ).toEqual({ value: 4.8, scale: 5, reviewCount: 108 });
  });

  test("an unnamed source becomes editorial, never a guessed directory", () => {
    expect(toAgency({ ...FULL, source: undefined })?.source).toBe("editorial");
    expect(toAgency({ ...FULL, source: "some-directory" })?.source).toBe("editorial");
    expect(toAgency({ ...FULL, source: "dandad" })?.source).toBe("dandad");
  });

  test("a budget floor of zero survives, and a missing one stays missing", () => {
    // "Takes work at any budget" and "did not say" are different answers.
    expect(toAgency({ ...FULL, budgetFloorUsd: 0 })?.budgetFloorUsd).toBe(0);
    expect(toAgency({ ...FULL, budgetFloorUsd: null })?.budgetFloorUsd).toBeNull();
  });

  test("an empty agency-supplied block reads as no correction at all", () => {
    expect(toAgency(FULL)?.listing).toBeNull();
    expect(
      toAgency({ ...FULL, listing: { exclusions: [], budgetMinimums: [] } })?.listing,
    ).toBeNull();
    // A floor is three facts or it is not a floor.
    expect(
      toAgency({
        ...FULL,
        listing: { budgetMinimums: [{ scope: "Website", amount: 15000 }] },
      })?.listing,
    ).toBeNull();
    expect(
      toAgency({
        ...FULL,
        listing: {
          verifiedAt: "2026-09-15",
          budgetMinimums: [{ scope: "Website", amount: 15000, currency: "eur" }],
        },
      })?.listing,
    ).toEqual({
      verifiedAt: "2026-09-15",
      awardsNote: null,
      engagementNote: null,
      exclusions: [],
      budgetMinimums: [{ scope: "Website", amount: 15000, currency: "EUR" }],
    });
  });

  test("blank strings and rows are cleaned out rather than rendered", () => {
    const agency = toAgency(FULL);
    expect(agency?.description).toBe("An example studio.");
    expect(agency?.services).toEqual(["Web Design"]);
    // A client row with no name has nothing to render.
    expect(agency?.clients).toHaveLength(1);
    expect(agency?.clients[0]?.domain).toBe("nike.com");
    // Importer-set and carried through, not recomputed - nothing at render
    // time can infer which brands a general audience recognises.
    expect(agency?.clients[0]?.notable).toBe(true);
    expect(toAgency({ ...FULL, clients: [{ name: "Local Co" }] })?.clients[0]?.notable).toBe(
      false,
    );
    expect(agency?.location?.countryCode).toBe("DE");
  });

  test("two documents cannot claim one slug", () => {
    const agencies = toAgencies([FULL, { ...FULL, name: "A Later Duplicate" }]);
    expect(agencies).toHaveLength(1);
    // First wins, matching the order the query returns.
    expect(agencies[0]?.name).toBe("Example Studio");
  });

  test("an editorial record needs no source profile", () => {
    const agency = toAgency({ ...FULL, source: "editorial", profileUrl: null });
    expect(agency?.source).toBe("editorial");
    expect(agency?.profileUrl).toBeNull();
  });
});
