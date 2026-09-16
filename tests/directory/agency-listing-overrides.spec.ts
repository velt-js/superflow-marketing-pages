// Logic tests for the CMS layer over the agency directory.
//
// Why this file exists: the merge in lib/directory/overrides.ts is the only
// place on the site where content we were *told* is combined with content we
// *collected*, and three of its rules are load-bearing promises rather than
// implementation details. None of the three is visible to `tsc`, and none
// would show up as a broken page - they would show up as a directory quietly
// saying something untrue about a real company:
//
//   1. An empty field is not a correction. A listing created to fix one wrong
//      budget must not blank out the twenty fields it left alone. Get this
//      wrong and creating a listing deletes a profile.
//   2. Source attribution is never overridden. `source`, `profileUrl`,
//      `awards` and `rating` are what a named directory published; an agency
//      correcting its own page cannot rewrite what Awwwards counted, only
//      annotate it.
//   3. `verifiedAt` is what puts "Confirmed by the agency" on the page, so it
//      must never appear from an in-house edit.
//
// These run without a browser or a server - they are pure functions of the
// real seed file and the real scraped data, so they also assert that the two
// agencies we have heard from still merge onto records that exist.

import { test, expect } from "@playwright/test";
import agenciesData from "../../lib/directory/data/agencies.json";
import seedData from "../../scripts/agency-listing-import/agency-listings.json";
import {
  applyAgencyListing,
  applyAgencyListings,
  type AgencyListingOverride,
} from "../../lib/directory/overrides";
import { toAgency } from "../../lib/directory/cms";
import type { Agency } from "../../lib/directory/types";

const SCRAPED = agenciesData as Agency[];
const SEED_LISTINGS = seedData.listings as AgencyListingOverride[];

/** One real scraped record to merge against, so the fixtures below cannot
 *  drift from the shape the importers actually write. */
const BASE = SCRAPED.find((agency) => agency.slug === "dgrees") as Agency;

test.describe("agency listing overrides", () => {
  test("an empty listing changes nothing", () => {
    const merged = applyAgencyListing(BASE, { agencySlug: BASE.slug });
    // `listing` is the one addition - it is absent here because the
    // document carried none of the CMS-only fields.
    expect(merged.listing).toBeNull();
    expect({ ...merged, listing: undefined }).toEqual({ ...BASE, listing: undefined });
  });

  test("blank and whitespace fields are not corrections", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      name: "   ",
      description: "",
      services: [],
      accolades: ["  "],
      budgetLabel: null,
    });
    expect(merged.name).toBe(BASE.name);
    expect(merged.description).toBe(BASE.description);
    expect(merged.services).toEqual(BASE.services);
    expect(merged.accolades).toEqual(BASE.accolades);
    expect(merged.budgetLabel).toBe(BASE.budgetLabel);
  });

  test("source attribution survives every override", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      name: "Renamed",
      awardsNote: "We hold far more awards than this.",
      clients: [{ name: "Someone" }],
      clientsMode: "replace",
    });
    expect(merged.slug).toBe(BASE.slug);
    expect(merged.source).toBe(BASE.source);
    expect(merged.profileUrl).toBe(BASE.profileUrl);
    expect(merged.scrapedAt).toBe(BASE.scrapedAt);
    expect(merged.awards).toEqual(BASE.awards);
    expect(merged.rating).toEqual(BASE.rating);
  });

  test("replace drops the scraped client list, add dedupes against it", () => {
    const existing = BASE.clients[0];

    const replaced = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      clientsMode: "replace",
      clients: [{ name: "Only Client" }],
    });
    expect(replaced.clients.map((client) => client.name)).toEqual(["Only Client"]);

    const added = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      clientsMode: "add",
      clients: [
        // Same domain as a scraped entry under a different spelling, and the
        // same name as another - both must collapse, not duplicate.
        { name: "Different Spelling", domain: existing.domain ?? undefined },
        { name: existing.name },
        { name: "Genuinely New" },
      ],
    });
    expect(added.clients.length).toBe(BASE.clients.length + 1);
    expect(added.clients.map((client) => client.name)).toContain("Genuinely New");
  });

  test("a client with no project falls back to its own name, never a stray link", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      clientsMode: "replace",
      clients: [{ name: "Named Directly" }],
    });
    const [client] = merged.clients;
    expect(client.projectTitle).toBe("Named Directly");
    expect(client.projectUrl).toBeNull();
    // "not asserted to be notable" - an agency's own order is the order.
    expect(client.notable).toBe(false);
  });

  test("a budget floor needs a real figure and a currency to count", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      budgetMinimums: [
        { scope: "Website", amount: 24000, currency: "usd" },
        // Half-typed rows are dropped rather than rendered as a floor of
        // zero, which would read as "takes work at any budget" - the
        // opposite claim.
        { scope: "No amount", currency: "USD" },
        { scope: "No currency", amount: 9000 },
        { amount: 500, currency: "USD" },
      ],
    });
    expect(merged.listing?.budgetMinimums).toEqual([
      { scope: "Website", amount: 24000, currency: "USD" },
    ]);
  });

  test("a corrected website brings its domain with it", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      website: "https://www.moved-here.studio/about",
    });
    // The card prints `domain` as the label on the website link and the
    // partner badge joins the CRM list on it, so a stale domain would
    // label the new site with the old host and badge the agency on a
    // domain it has left.
    expect(merged.website).toBe("https://www.moved-here.studio/about");
    expect(merged.domain).toBe("moved-here.studio");

    // No website correction, no domain change.
    const untouched = applyAgencyListing(BASE, { agencySlug: BASE.slug, name: "X" });
    expect(untouched.domain).toBe(BASE.domain);
  });

  test("a partial location correction keeps the rest of the location", () => {
    const merged = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      location: { countryCode: "es" },
    });
    // Fixing one field must not wipe the two the editor left blank -
    // blanking `country` would also drop the agency out of the category
    // page's country filter.
    expect(merged.location?.city).toBe(BASE.location?.city);
    expect(merged.location?.country).toBe(BASE.location?.country);
    expect(merged.location?.countryCode).toBe("ES");

    // A studio that really has moved fills in every box and gets it.
    const moved = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      location: { city: "Lisbon", country: "Portugal", countryCode: "PT" },
    });
    expect(moved.location).toEqual({
      city: "Lisbon",
      country: "Portugal",
      countryCode: "PT",
    });
  });

  test("a listing for an unknown agency is dropped, not appended", () => {
    const merged = applyAgencyListings(SCRAPED, [
      { agencySlug: "not-an-agency", name: "Ghost" },
    ]);
    expect(merged.length).toBe(SCRAPED.length);
    expect(merged.some((agency) => agency.name === "Ghost")).toBe(false);
  });

  test("only a verified listing can claim the agency confirmed it", () => {
    const inHouse = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      budgetLabel: "Projects from $10,000",
    });
    expect(inHouse.listing).toBeNull();

    const confirmed = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      verifiedAt: "2026-09-15",
    });
    expect(confirmed.listing?.verifiedAt).toBe("2026-09-15");
  });

  test("every seeded listing merges onto a record that exists", () => {
    expect(SEED_LISTINGS.length).toBeGreaterThan(0);
    for (const listing of SEED_LISTINGS) {
      const match = SCRAPED.find((agency) => agency.slug === listing.agencySlug);
      expect(match, `no scraped agency for slug "${listing.agencySlug}"`).toBeTruthy();
    }
  });

  test("the seeded corrections land on the pages they were sent for", () => {
    const merged = applyAgencyListings(SCRAPED, SEED_LISTINGS);

    const dgrees = merged.find((agency) => agency.slug === "dgrees");
    // The studio asked for its own list, not the Awwwards-derived one, and
    // asked specifically that Blit Studio be left out of it.
    expect(dgrees?.clients.map((client) => client.name)).not.toContain("Blit Studio");
    expect(dgrees?.clients[0]?.name).toBe("NTT DATA");
    expect(dgrees?.listing?.awardsNote).toContain("80");
    expect(dgrees?.listing?.exclusions.length).toBeGreaterThan(0);
    // Quoted in euros, so the USD floor stays null rather than inventing a
    // conversion - see "Budget: label vs floor" in app/directory/README.md.
    expect(dgrees?.budgetFloorUsd).toBeNull();

    const malvah = merged.find((agency) => agency.slug === "malvah");
    const scrapedMalvah = SCRAPED.find((agency) => agency.slug === "malvah");
    // Seven sent, three of them already on the record.
    expect(malvah?.clients.length).toBe((scrapedMalvah?.clients.length ?? 0) + 4);
    expect(malvah?.budgetFloorUsd).toBe(12000);
    // They rule nothing out, which must render as no section rather than an
    // empty one.
    expect(malvah?.listing?.exclusions).toEqual([]);

    // Both stated floors, in the currency each agency quoted. Dgrees' euros
    // are never converted, and Malvah's two different floors stay two rows.
    expect(dgrees?.listing?.budgetMinimums).toEqual([
      { scope: "Any project", amount: 15000, currency: "EUR" },
    ]);
    expect(malvah?.listing?.budgetMinimums).toEqual([
      { scope: "Website", amount: 24000, currency: "USD" },
      { scope: "Branding", amount: 12000, currency: "USD" },
    ]);
  });
});

// The same three rules have to hold when the record arrives from Sanity
// rather than from the seed file, because `toAgency` re-implements the
// listing block instead of calling `applyAgencyListing` - the CMS document
// already *is* the merged record, so there is nothing to merge onto. Two
// implementations of one promise is exactly the shape that drifts, so the
// budget rule is asserted against both.
test.describe("cms listing parity", () => {
  /** The smallest document `toAgency` will accept, so each test below only
   *  has to state the field it is about. */
  const DOC = { slug: "fixture-studio", name: "Fixture Studio" };

  test("a zero or negative floor is dropped, exactly as a seeded one is", () => {
    const rows = [
      { scope: "Website", amount: 0, currency: "usd" },
      { scope: "Branding", amount: -1, currency: "usd" },
      { scope: "Retainer", amount: 9000, currency: "usd" },
    ];
    const fromCms = toAgency({ ...DOC, listing: { budgetMinimums: rows } });
    const fromSeed = applyAgencyListing(BASE, {
      agencySlug: BASE.slug,
      budgetMinimums: rows,
    });

    // A half-typed row is not a claim to work for nothing, and a negative
    // one is not a claim at all. Only the third row is a figure a buyer
    // could act on.
    const kept = [{ scope: "Retainer", amount: 9000, currency: "USD" }];
    expect(fromCms?.listing?.budgetMinimums).toEqual(kept);
    expect(fromSeed?.listing?.budgetMinimums).toEqual(kept);
  });

  test("a listing holding nothing but a zero floor is no listing at all", () => {
    // Otherwise the profile renders "Engagement terms" over an empty box.
    const rows = [{ scope: "Website", amount: 0, currency: "USD" }];
    expect(toAgency({ ...DOC, listing: { budgetMinimums: rows } })?.listing).toBeNull();
    expect(
      applyAgencyListing(BASE, { agencySlug: BASE.slug, budgetMinimums: rows })?.listing,
    ).toBeNull();
  });

  test("a zero budgetFloorUsd is kept - it is a different field saying a different thing", () => {
    // `budgetFloorUsd` is the directory's own number, where 0 means "takes
    // work at any budget". Only the stated minimums above treat 0 as noise.
    expect(toAgency({ ...DOC, budgetFloorUsd: 0 })?.budgetFloorUsd).toBe(0);
  });
});
