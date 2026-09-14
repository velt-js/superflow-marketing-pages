// /directory/claim - step one of the claim flow.
//
// Two entry points reach this page and both matter:
//
//   1. The "Claim this listing" link under the fast-facts row on every
//      unclaimed profile.
//   2. `/directory/claim?agency=<slug>`, which is the `{{claim_url}}`
//      merge field in the outbound campaign. That is the link in email 3
//      and the reply we send to any agency that answers with a budget, so
//      the ?agency form has to keep working exactly as written.
//
// Without a slug the page still renders, listing nothing and asking the
// visitor to find their agency - a bare /directory/claim is a link
// somebody typed or truncated, not an error to 404 on.
//
// `noindex`: there is nothing here for a search engine, and a claim form
// ranking for an agency's own name would be a strange thing to own.

import type { Metadata } from "next";
import Link from "next/link";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ClaimStartForm from "@/components/directory/ClaimStartForm";
import DirectoryFormHero from "@/components/directory/DirectoryFormHero";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { agencyPath, getAgencyBySlug } from "@/lib/directory/agencies";
import { expectedClaimDomain } from "@/lib/directory/claim-validation";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "@/components/directory/DirectoryForm.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Claim your agency listing",
  description:
    "Claim your agency's listing in the Superflow directory and set your minimum budget, timeline, platforms and reply time.",
  path: `${DIRECTORY_BASE_PATH}/claim`,
  noindex: true,
});

interface ClaimPageProps {
  searchParams: Promise<{ agency?: string }>;
}

/**
 * Renders the claim entry page.
 *
 * @param props - Route props carrying the optional `agency` slug.
 */
export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const { agency: slug } = await searchParams;
  const agency = slug ? getAgencyBySlug(slug) : undefined;

  return (
    <main>
      <SiteNav />
      <DirectoryFormHero
        kicker="Agency directory"
        heading={agency ? `Claim ${agency.name}` : "Claim your listing"}
        subheading={
          agency
            ? "Set your budget, timeline and platforms. Founders filter on all three."
            : "Find your agency in the directory and claim its listing from its own page."
        }
        backLabel="Directory"
      />

      <section className={styles.section} data-section="directory-claim">
        <div className={styles.inner}>
          {agency ? (
            <ClaimStartForm
              slug={agency.slug}
              agencyName={agency.name}
              expectedDomain={expectedClaimDomain(agency)}
            />
          ) : (
            <div className={styles.card}>
              <p className={styles.intro}>
                We could not tell which agency you mean. Open your agency&rsquo;s page in the
                directory and use the &ldquo;Claim your listing&rdquo; link under its facts row -
                that carries the right listing through.
              </p>
              <div className={styles.actions}>
                <Link href={DIRECTORY_BASE_PATH} className={styles.submit}>
                  Browse the directory
                </Link>
              </div>
            </div>
          )}

          {agency && (
            <p className={styles.hint} style={{ marginTop: 16 }}>
              Your listing today:{" "}
              <Link href={agencyPath(agency.slug)} className={styles.secondaryAction}>
                {agency.name}
              </Link>
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
