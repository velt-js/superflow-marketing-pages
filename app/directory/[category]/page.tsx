// /directory/<category> - a single directory category (e.g. web-design).
//
// Static params come from DIRECTORY_CATEGORIES, so this route only ever
// renders slugs the constants file knows about; anything else 404s via
// notFound(). Agency data comes from lib/directory/data/agencies.json via
// lib/directory/agencies.ts - see app/directory/README.md for how the
// scraper and these pages share that file.
//
// Each card (components/directory/AgencyCard.tsx) links through to that
// agency's own detail page at /directory/agency/<slug> - see
// app/directory/agency/[slug]/page.tsx - which is where the ItemList
// entries below point too.
//
// Header uses CategoryHero (components/directory/CategoryHero.tsx), not
// the shared marketing ListingHero - see that component's doc comment
// for why. The agency grid itself (AgencyGrid -> AgencyExplorer) is
// server-rendered in full; only the search/country/sort controls are
// client-side - see AgencyExplorer's header comment for the SEO contract
// that design keeps.

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import CategoryHero from "@/components/directory/CategoryHero";
import AgencyGrid from "@/components/directory/AgencyGrid";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import {
  agencyPath,
  buildAgencyListStats,
  getAgenciesByCategory,
  getDirectoryCategory,
} from "@/lib/directory/agencies";

// Agencies are read from a bundled JSON file (lib/directory/data/agencies.json),
// refreshed only when the scraper's output is redeployed, not from a live
// fetch at request time. `revalidate` is set to match sibling listing
// routes (e.g. app/checklist/page.tsx) for consistency - it has no effect
// on this route's data freshness today, but keeps this file's shape
// aligned if the source ever moves to a live fetch.
export const revalidate = 60;

interface DirectoryCategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Pre-renders one route per launch category so `next build` emits static
 * HTML for every entry in `DIRECTORY_CATEGORIES` (currently just
 * `web-design`) without a runtime lookup.
 *
 * @returns One params object per known category slug.
 */
export async function generateStaticParams() {
  try {
    return DIRECTORY_CATEGORIES.map((category) => ({ category: category.slug }));
  } catch {
    return [];
  }
}

/**
 * Builds page metadata for a directory category from its constants entry.
 *
 * @param props - Route props containing the requested category slug.
 * @returns Next.js Metadata, or an empty object for an unknown slug.
 */
export async function generateMetadata({
  params,
}: DirectoryCategoryPageProps): Promise<Metadata> {
  try {
    const { category: categorySlug } = await params;
    const category = getDirectoryCategory(categorySlug);
    if (!category) return {};
    return buildPageMetadata({
      title: category.title,
      description: category.metaDescription,
      path: `${DIRECTORY_BASE_PATH}/${category.slug}`,
    });
  } catch {
    return {};
  }
}

/**
 * Renders a single directory category page: hero, agency grid (or its
 * empty state), and the standard site chrome.
 *
 * @param props - Route props containing the requested category slug.
 */
export default async function DirectoryCategoryPage({
  params,
}: DirectoryCategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getDirectoryCategory(categorySlug);
  if (!category) notFound();

  const agencies = getAgenciesByCategory(category.slug);
  const stats = buildAgencyListStats(agencies);
  const path = `${DIRECTORY_BASE_PATH}/${category.slug}`;

  return (
    <main>
      <PageJsonLd
        name={`${category.title} | Superflow`}
        description={category.metaDescription}
        path={path}
        trail={[
          { name: "Directory", url: `${SITE_URL}${DIRECTORY_BASE_PATH}` },
          { name: category.title, url: `${SITE_URL}${path}` },
        ]}
      />
      <JsonLd
        id={`ld-directory-collection-${category.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.heading,
          description: category.metaDescription,
          url: `${SITE_URL}${path}`,
        }}
      />
      {agencies.length > 0 && (
        <JsonLd
          id={`ld-directory-itemlist-${category.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: category.heading,
            url: `${SITE_URL}${path}`,
            numberOfItems: agencies.length,
            itemListElement: agencies.map((agency, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}${agencyPath(agency?.slug ?? "")}`,
              name: agency?.name,
            })),
          }}
        />
      )}

      <Nav />
      <CategoryHero category={category} stats={stats} />
      <AgencyGrid agencies={agencies} />
      <DarkSection withTopCurve />
      <Footer />
      <IntercomButton />
    </main>
  );
}
