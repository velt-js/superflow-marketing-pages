// /directory/edit - request a fresh link to change an existing listing.
//
// The same magic-link round trip as /directory/claim, and deliberately
// the same component: there is no session to resume, so "edit" and
// "claim" are the identical flow with different copy. The confirmation
// email an agency gets after claiming links here, which is what makes
// this page's URL the permanent one - a link in an email from six months
// ago still works, because it asks for a new token rather than carrying
// a stale one.

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
  title: "Edit your agency listing",
  description: "Request a link to update your agency's listing in the Superflow directory.",
  path: `${DIRECTORY_BASE_PATH}/edit`,
  noindex: true,
});

interface EditPageProps {
  searchParams: Promise<{ agency?: string }>;
}

/**
 * Renders the edit-link request page.
 *
 * @param props - Route props carrying the optional `agency` slug.
 */
export default async function EditListingPage({ searchParams }: EditPageProps) {
  const { agency: slug } = await searchParams;
  const agency = slug ? getAgencyBySlug(slug) : undefined;

  return (
    <main>
      <SiteNav />
      <DirectoryFormHero
        kicker="Agency directory"
        heading={agency ? `Edit ${agency.name}` : "Edit your listing"}
        subheading={
          agency
            ? "We will email a fresh link. It works once and expires in 24 hours."
            : "Open your agency's page in the directory to request an edit link."
        }
        backLabel="Directory"
      />

      <section className={styles.section} data-section="directory-edit">
        <div className={styles.inner}>
          {agency ? (
            <ClaimStartForm
              slug={agency.slug}
              agencyName={agency.name}
              expectedDomain={expectedClaimDomain(agency)}
              isEdit
            />
          ) : (
            <div className={styles.card}>
              <p className={styles.intro}>
                We could not tell which listing you mean. Find your agency in the directory and use
                the link on its own page.
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
