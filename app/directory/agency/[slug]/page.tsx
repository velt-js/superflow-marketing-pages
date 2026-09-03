// /directory/agency/<slug> - a single agency's full profile.
//
// Deliberately flat (not nested under a category): Agency.categories is an
// array, so a nested URL scheme would mint two URLs for an agency listed
// in two categories. One agency, one canonical URL - see
// DIRECTORY_AGENCY_SEGMENT in lib/directory/constants.ts for the rationale
// this route follows.
//
// generateStaticParams and the sitemap both derive their slugs from
// lib/directory/data/agencies.json via lib/directory/agencies.ts, so
// dropping new records into that file produces new pages here with no
// code change. Records that fail `shouldIndexAgency` (thin content - no
// real description, or zero recorded awards) still render a full page,
// they just carry `robots: { index: false, follow: true }` and are left
// out of the sitemap. See app/directory/README.md.

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import AgencyDetail from "@/components/directory/AgencyDetail";
import RelatedAgencies from "@/components/directory/RelatedAgencies";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import {
  agencyPath,
  buildAgencyMetaDescription,
  buildAgencyMetaTitle,
  buildAgencyOrganizationJsonLd,
  getAgencyBySlug,
  getAllAgencySlugs,
  getDirectoryCategory,
  getRelatedAgencies,
  shouldIndexAgency,
} from "@/lib/directory/agencies";

// Agencies are read from a bundled JSON file (lib/directory/data/agencies.json),
// refreshed only when the scraper's output is redeployed, not from a live
// fetch at request time. `revalidate` is set to match sibling listing
// routes (e.g. app/checklist/page.tsx, app/directory/[category]/page.tsx)
// for consistency - see the longer note on those routes.
export const revalidate = 60;

interface AgencyDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renders one route per agency in the dataset, so `next build` emits
 * static HTML for every record without a runtime lookup. Reads straight
 * off `lib/directory/data/agencies.json` via `getAllAgencySlugs` - a
 * larger scrape produces more routes automatically.
 *
 * @returns One params object per known agency slug.
 */
export async function generateStaticParams() {
  try {
    return getAllAgencySlugs().map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

/**
 * Builds page metadata for a single agency, composed from that agency's
 * own fields (name, category, location, description, award total) so no
 * two agency pages share a title or description. Agencies that fail the
 * thin-content gate (`shouldIndexAgency`) still get metadata, but with
 * `noindex` set.
 *
 * @param props - Route props containing the requested agency slug.
 * @returns Next.js Metadata, or an empty object for an unknown slug.
 */
export async function generateMetadata({
  params,
}: AgencyDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const agency = getAgencyBySlug(slug);
    if (!agency) return {};
    return buildPageMetadata({
      title: buildAgencyMetaTitle(agency),
      description: buildAgencyMetaDescription(agency),
      path: agencyPath(agency.slug),
      noindex: !shouldIndexAgency(agency),
    });
  } catch {
    return {};
  }
}

/**
 * Renders a single agency's detail page: breadcrumb-aware JSON-LD,
 * Organization schema, full profile content, and a data-derived
 * "more agencies" interlinking block.
 *
 * @param props - Route props containing the requested agency slug.
 */
export default async function AgencyDetailPage({ params }: AgencyDetailPageProps) {
  const { slug } = await params;
  const agency = getAgencyBySlug(slug);
  if (!agency) notFound();

  const path = agencyPath(agency.slug);
  const primaryCategorySlug = agency.categories?.[0];
  const primaryCategory = primaryCategorySlug ? getDirectoryCategory(primaryCategorySlug) : undefined;
  const relatedBlock = getRelatedAgencies(agency);
  const organizationSchema = buildAgencyOrganizationJsonLd(agency);
  const description = buildAgencyMetaDescription(agency);

  const trail = [
    { name: "Directory", url: `${SITE_URL}${DIRECTORY_BASE_PATH}` },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.title,
            url: `${SITE_URL}${DIRECTORY_BASE_PATH}/${primaryCategory.slug}`,
          },
        ]
      : []),
    { name: agency.name, url: `${SITE_URL}${path}` },
  ];

  return (
    <main>
      <PageJsonLd
        name={`${agency.name} | Superflow`}
        description={description}
        path={path}
        trail={trail}
      />
      {organizationSchema && (
        <JsonLd id={`ld-agency-organization-${agency.slug}`} data={organizationSchema} />
      )}

      <Nav />
      <AgencyDetail agency={agency} category={primaryCategory} />
      <RelatedAgencies block={relatedBlock} />
      <DarkSection withTopCurve />
      <Footer />
      <IntercomButton />
    </main>
  );
}
