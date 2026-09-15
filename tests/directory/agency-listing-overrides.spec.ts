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
  });
});
