// /directory/match - the founder's entry point.
//
// Reached three ways, and all three prefill something:
//
//   * "Get matched" in the directory hero and every category hero.
//   * `?category=web-design`, from a category page.
//   * `?agency=<slug>&category=<slug>`, from "Request intro" on a
//     profile, which also PINS that agency as one of the three.
//
// `noindex`: a form has nothing to rank for, and the category pages are
// the pages that should.

import type { Metadata } from "next";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import DirectoryFormHero from "@/components/directory/DirectoryFormHero";
import MatchForm from "@/components/directory/MatchForm";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { getAgencyBySlug, getDirectoryCategory } from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "@/components/directory/DirectoryForm.module.css";

export const revalidate = 60;

const HEADING = "Get matched with three agencies";
const SUBHEADING =
  "Tell us what you are building, your budget and your timeline. We send your brief to three studios that fit, and they reply to you directly.";

export const metadata: Metadata = buildPageMetadata({
  title: "Get matched with an agency",
  description:
    "Describe your project and we will send your brief to three agencies that match your budget, timeline and platform.",
  path: `${DIRECTORY_BASE_PATH}/match`,
  noindex: true,
});

interface MatchPageProps {
  searchParams: Promise<{ category?: string; agency?: string }>;
}

/**
 * Renders the match request page.
 *
 * @param props - Route props carrying the optional category and agency.
 */
export default async function MatchPage({ searchParams }: MatchPageProps) {
  const { category: categorySlug, agency: agencySlug } = await searchParams;

  // Both are validated rather than trusted: a hand-edited `?category=`
  // would otherwise prefill a select with a value none of its options
  // carry, which renders as a blank field.
  const category = categorySlug ? getDirectoryCategory(categorySlug) : undefined;
  const pinned = agencySlug ? getAgencyBySlug(agencySlug) : undefined;

  return (
    <main>
      <SiteNav />
      <DirectoryFormHero
        kicker="Agency directory"
        heading={pinned ? `Request an intro to ${pinned.name}` : HEADING}
        subheading={
          pinned
            ? "We will send your brief to them and to two other studios that fit, so you have something to compare."
            : SUBHEADING
        }
        backLabel="Directory"
      />

      <section className={styles.section} data-section="directory-match">
        <div className={styles.inner}>
          <MatchForm
            defaultCategory={category?.slug ?? pinned?.categories?.[0]}
            pinnedAgencySlug={pinned?.slug}
            pinnedAgencyName={pinned?.name}
          />
        </div>
      </section>

      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
