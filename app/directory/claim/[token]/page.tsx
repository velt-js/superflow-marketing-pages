// /directory/claim/<token> - step two of the claim flow.
//
// The token in the URL is the entire authorisation for this page: it was
// minted in step one against one agency slug and one verified email, and
// it is read here to decide both WHICH listing is editable and whether it
// is editable at all.
//
// `force-dynamic` because the token is checked against KV on every
// request. A cached render of this page would either serve a stale
// "expired" state to a valid link or, far worse, serve the enrich form
// for one agency's token to whoever asked next.
//
// The three refusals are given three different pages, because they are
// three different situations and only one of them is a problem:
//
//   * expired  - the link aged out. Offer a new one.
//   * used     - the claim already went through. Say so and link to the
//                live profile; an agency clicking its own link twice has
//                done nothing wrong and should not see an error.
//   * missing  - the token is not one of ours, or the store lost it.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ClaimEnrichForm from "@/components/directory/ClaimEnrichForm";
import DirectoryFormHero from "@/components/directory/DirectoryFormHero";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { agencyPath, getAgencyBySlug } from "@/lib/directory/agencies";
import { readClaimToken, type TokenRejection } from "@/lib/directory/claim-tokens";
import { getClaim } from "@/lib/directory/claims";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import { stripContactDetails } from "@/lib/directory/text";
import styles from "@/components/directory/DirectoryForm.module.css";

/** Checked against a live store on every request - see the header. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Update your agency listing",
  description: "Set your agency's budget, timeline, platforms and reply time.",
  path: `${DIRECTORY_BASE_PATH}/claim`,
  noindex: true,
});

interface ClaimTokenPageProps {
  params: Promise<{ token: string }>;
}

/** Copy for each way a token can be refused. */
const REJECTION_COPY: Record<TokenRejection, { heading: string; body: string }> = {
  expired: {
    heading: "That link has expired",
    body: "Claim links last 24 hours. Request a new one and we will email it straight over.",
  },
  used: {
    heading: "That link has already been used",
    body: "Your listing is saved. Request a new link whenever you want to change it.",
  },
  missing: {
    heading: "That link is not valid",
    body: "It may have been truncated by an email client. Request a new one and we will send it again.",
  },
};

/**
 * Renders the enrich form behind a valid token, or the right explanation
 * behind an invalid one.
 *
 * @param props - Route props carrying the token.
 */
export default async function ClaimTokenPage({ params }: ClaimTokenPageProps) {
  const { token } = await params;
  const lookup = await readClaimToken(token);

  if (!lookup.ok) {
    const copy = REJECTION_COPY[lookup.reason];
    return (
      <main>
        <SiteNav />
        <DirectoryFormHero heading={copy.heading} subheading={copy.body} backLabel="Directory" />
        <section className={styles.section} data-section="directory-claim-token-error">
          <div className={styles.inner}>
            <div className={styles.card}>
              <p className={styles.intro}>
                Open your agency&rsquo;s page in the directory and use the &ldquo;Claim your
                listing&rdquo; link, or the link in the email we sent you.
              </p>
              <div className={styles.actions}>
                <Link href={DIRECTORY_BASE_PATH} className={styles.submit}>
                  Browse the directory
                </Link>
              </div>
            </div>
          </div>
        </section>
        <SiteFooter />
        <IntercomButton />
      </main>
    );
  }

  const agency = getAgencyBySlug(lookup.token.agencySlug);
  // A token whose agency has left the dataset (a re-scrape dropped it).
  // Rare, and a 404 is honest: there is no listing to edit.
  if (!agency) notFound();

  const claim = await getClaim(agency.slug);

  return (
    <main>
      <SiteNav />
      <DirectoryFormHero
        kicker="Agency directory"
        heading={agency.name}
        subheading="Tell founders what a project costs, how long it takes, and what you build on."
        backLabel="Your listing"
        backHref={agencyPath(agency.slug)}
      />

      <section className={styles.section} data-section="directory-claim-enrich">
        <div className={styles.inner}>
          <ClaimEnrichForm
            token={lookup.token.token}
            slug={agency.slug}
            agencyName={agency.name}
            claim={claim}
            // The scraped blurb is repaired before it is offered as a
            // prefill - see lib/directory/text.ts. Handing an agency back
            // its own contact line to re-approve would be odd.
            scrapedDescription={stripContactDetails(agency.description)}
            scrapedServices={agency.services ?? []}
            claimEmail={lookup.token.email}
          />
        </div>
      </section>

      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
