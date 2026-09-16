import Image from "next/image";
import Link from "next/link";

import {
  agencyPath,
  formatAgencyLocation,
  getAgencyCredential,
} from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "./RelatedAgencies.module.css";
import type { RelatedAgenciesBlock } from "@/lib/directory/agencies";
import type { Agency } from "@/lib/directory/types";

/** Link back to the list, under the related rows. */
const BACK_LABEL = "← Back to the directory";

/** Pixel size the logo renders at inside its tile. */
const LOGO_SIZE = 44;

/** Rendered in the logo tile when a record carries no logo. */
const FALLBACK_INITIAL = "•";

/**
 * One related agency, as a full-width row.
 *
 * A row rather than a card: this block sits under a page of cards and
 * repeating the card grid here made the bottom of a profile look like a
 * second listing page. A row reads as "more of these, over there", which
 * is what the block is for.
 *
 * The whole row is one link and carries no second destination inside it,
 * so unlike the list card it can simply be an `<a>` - no stretched-link
 * overlay to keep working.
 *
 * @param props - Component props.
 * @param props.agency - The related agency to render.
 */
function RelatedAgencyRow({ agency }: { agency: Agency }) {
  try {
    const locationLabel = formatAgencyLocation(agency?.location ?? null);
    const credential = getAgencyCredential(agency);
    const initial =
      (agency?.name ?? "").replace(/^[^\p{L}\p{N}]+/u, "").charAt(0).toUpperCase() ||
      FALLBACK_INITIAL;

    return (
      <Link href={agencyPath(agency?.slug ?? "")} className={styles.row}>
        <span className={styles.logo}>
          {agency?.logoUrl ? (
            <Image
              className={styles.logoImage}
              src={agency.logoUrl}
              alt=""
              width={LOGO_SIZE}
              height={LOGO_SIZE}
            />
          ) : (
            <span className={styles.logoInitial} aria-hidden="true">
              {initial}
            </span>
          )}
        </span>

        <span className={styles.identity}>
          <span className={styles.name}>{agency?.name ?? "Unnamed agency"}</span>
          {locationLabel && <span className={styles.location}>{locationLabel}</span>}
        </span>

        {agency?.description && (
          <span className={styles.description}>{agency.description}</span>
        )}

        {credential.pill && (
          <span className={styles.credential}>
            <span className={styles.credentialValue}>{credential.pill}</span>
            {credential.meta && (
              <span className={styles.credentialMeta}>{credential.meta}</span>
            )}
          </span>
        )}
      </Link>
    );
  } catch {
    return null;
  }
}

/**
 * Internal-link block at the bottom of an agency profile, so every profile
 * is reachable from more than one path (the list plus this block) instead
 * of being an orphan a crawler only finds once.
 *
 * Renders nothing when the block has no agencies - which happens for a
 * record with no country-mates and no category-mates - but still renders
 * the way back to the list, because a profile with no exit is the one page
 * a visitor can only leave with the back button.
 *
 * @param props - Component props.
 * @param props.block - The heading + agencies computed by
 *                       `getRelatedAgencies`.
 */
export default function RelatedAgencies({ block }: { block: RelatedAgenciesBlock }) {
  try {
    const agencies = block?.agencies ?? [];

    return (
      <section className={styles.section} data-section="directory-related-agencies">
        <div className={styles.inner}>
          {agencies.length > 0 && (
            <>
              <h2 className={styles.heading}>{block.heading}</h2>
              <ul className={styles.list}>
                {agencies.map((agency) => (
                  <li key={agency?.slug ?? agency?.profileUrl} className={styles.item}>
                    <RelatedAgencyRow agency={agency} />
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className={styles.back}>
            <Link href={DIRECTORY_BASE_PATH} className={styles.backLink}>
              {BACK_LABEL}
            </Link>
          </p>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
