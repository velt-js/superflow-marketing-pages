"use client";

// The directory list's grid card.
//
// A client component, unusually for a card that paints nothing interactive
// of its own. The list is one client-controlled surface: search, category,
// country and sort all decide which cards exist, and a server-rendered card
// handed across that boundary is serialized into the RSC payload on top of
// the markup already in the HTML - 983 KB of duplicate payload on a
// 323-card page. Taking a plain `AgencyListItem` instead costs a fifth of
// that, and the server still renders every card into the HTML, because a
// client component server-renders too. See `AgencyListItem` in
// lib/directory/agencies.ts.
//
// It therefore imports NOTHING at runtime from lib/directory/agencies.ts -
// that module's scope imports the agency JSON datasets and the Sanity
// client, and either would ride into the browser bundle with it. Every
// value a card paints arrives as a prop; the only import from there is a
// type, erased at compile time.

import Image from "next/image";
import Link from "next/link";

import { PARTNER_BADGE_DESCRIPTION, PARTNER_BADGE_LABEL } from "@/lib/directory/constants";
import PartnerBadgeMark from "./PartnerBadgeMark";
import styles from "./AgencyCard.module.css";
import type { AgencyListItem } from "@/lib/directory/agencies";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Shown as the website link text when a record has a URL but no parsed
 *  domain, so the link never renders with an empty label. */
const FALLBACK_WEBSITE_LABEL = "Visit site";

/** Rendered in the logo tile when a record carries no logo - 22 of the 323
 *  records don't, D&AD's whole slice among them. */
const FALLBACK_INITIAL = "•";

/** Pixel size the logo tile renders at. */
const LOGO_SIZE = 44;

/**
 * First letter of an agency's name, for the logo tile's fallback.
 *
 * Leading punctuation is skipped so "/nk.studio" reads as "N" rather than
 * as a slash - several studios brand themselves with one.
 *
 * @param name - The agency's display name.
 * @returns A single uppercase character, or a bullet when there is none.
 */
function resolveInitial(name: string | null | undefined): string {
  try {
    const stripped = (name ?? "").replace(/^[^\p{L}\p{N}]+/u, "");
    return stripped.charAt(0).toUpperCase() || FALLBACK_INITIAL;
  } catch {
    return FALLBACK_INITIAL;
  }
}

/**
 * Card for a single agency on the directory list page. Leads with the
 * agency name, its location and the one credential its source published -
 * the description and client chips are supporting detail, deliberately
 * quieter than the name rather than competing with it.
 *
 * The whole card is one click target for the agency's detail page
 * (/directory/agency/<slug>). That is done with a stretched link rather
 * than by wrapping the card in an <a>: the footer still carries the
 * agency's own outbound website link, and an anchor inside an anchor is
 * invalid HTML that browsers recover from unpredictably. `.header::after`
 * in the CSS module covers the card, and `.websiteLink` sits above it.
 * Both halves are covered by tests/directory/agency-card.spec.ts.
 *
 * The card does NOT link back to the source profile - that link lives on
 * the detail page this card opens, one click away - but it always NAMES
 * the source in the footer, so no figure on it is an unattributed claim.
 * See `getAgencyCredential` in lib/directory/agencies.ts.
 *
 * @param props - Component props.
 * @param props.item - The agency's list projection.
 */
export default function AgencyCard({ item }: { item: AgencyListItem }) {
  try {
    const websiteLabel = item?.domain?.trim() || FALLBACK_WEBSITE_LABEL;

    return (
      <article className={styles.card}>
        <Link href={item?.href ?? "#"} className={styles.header}>
          <span className={styles.logo}>
            {item?.logoUrl ? (
              <Image
                className={styles.logoImage}
                src={item.logoUrl}
                alt=""
                width={LOGO_SIZE}
                height={LOGO_SIZE}
              />
            ) : (
              <span className={styles.logoInitial} aria-hidden="true">
                {resolveInitial(item?.name)}
              </span>
            )}
          </span>

          <span className={styles.headerText}>
            <span className={styles.nameRow}>
              <h3 className={styles.name}>{item?.name || "Unnamed agency"}</h3>
              {/* The mark itself, not the server `PartnerBadge` wrapper:
                  that wrapper decides partner status by calling into
                  lib/directory/agencies.ts, which this file must not
                  import. The decision is already made - `isPartner` is a
                  field on the projection the server built. */}
              {item?.isPartner && (
                <PartnerBadgeMark
                  label={PARTNER_BADGE_LABEL}
                  description={PARTNER_BADGE_DESCRIPTION}
                />
              )}
            </span>
            {item?.locationLabel && (
              <span className={styles.location}>{item.locationLabel}</span>
            )}
          </span>

          {item?.credentialPill && <span className={styles.pill}>{item.credentialPill}</span>}
        </Link>

        {item?.description && <p className={styles.description}>{item.description}</p>}

        {item?.clientNames?.length > 0 && (
          <ul className={styles.clients} aria-label="Clients on record">
            {item.clientNames.map((client) => (
              <li key={client} className={styles.client}>
                {client}
              </li>
            ))}
            {item.clientOverflow > 0 && (
              <li className={`${styles.client} ${styles.clientOverflow}`}>
                +{item.clientOverflow}
              </li>
            )}
          </ul>
        )}

        <div className={styles.footer}>
          {/* Names the source directory that published the figure in the
              pill above. The card carries no link back to it, so this line
              is the whole of the attribution. */}
          {item?.credentialMeta ? (
            <span className={styles.meta}>{item.credentialMeta}</span>
          ) : (
            <span />
          )}
          {item?.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
            >
              {websiteLabel} {EXTERNAL_LINK_GLYPH}
            </a>
          )}
        </div>
      </article>
    );
  } catch {
    return null;
  }
}
