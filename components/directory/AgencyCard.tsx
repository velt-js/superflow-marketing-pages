import Link from "next/link";

import {
  agencyPath,
  formatAgencyClientSummary,
  formatAgencyPlace,
} from "@/lib/directory/agencies";
import { platformLabel } from "@/lib/directory/claim-fields";
import type { EnrichedAgency } from "@/lib/directory/enrich";
import { truncateAtSentence } from "@/lib/directory/text";
import AgencyLogo from "./AgencyLogo";
import PartnerBadge from "./PartnerBadge";
import VerifiedBadge from "./VerifiedBadge";
import styles from "./AgencyCard.module.css";

/** Maximum platforms shown before collapsing into a "+N". */
const MAX_VISIBLE_PLATFORMS = 3;

/** Trailing glyph on the outbound link, marking it as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Leading label on the card's client line. Phrased as a claim about past
 *  work, not a capability, because that is what a visitor scanning a grid
 *  is comparing. */
const CLIENTS_LINE_LABEL = "Worked with ";

/** Shown as the website link text when a record has a URL but no parsed
 *  domain, so the link never renders with an empty label. */
const FALLBACK_WEBSITE_LABEL = "Visit site";

/** Edge of the logo tile on a card. */
const LOGO_SIZE = 44;

/**
 * Resolves the visible label for an agency's own website link. Prefers
 * the bare domain over the full URL: it is shorter, and it tells the
 * visitor where the link goes before they click it.
 *
 * @param agency - The agency record to label.
 * @returns The domain, or a generic fallback when none was parsed.
 */
function resolveWebsiteLabel(agency: EnrichedAgency | null | undefined): string {
  try {
    const domain = agency?.domain?.trim();
    return domain && domain.length > 0 ? domain : FALLBACK_WEBSITE_LABEL;
  } catch {
    return FALLBACK_WEBSITE_LABEL;
  }
}

/**
 * Builds the card's one-line signal row: budget, timeline, reply time.
 *
 * Only facts the agency actually stated. Unlike the profile's fast-facts
 * row, a card does NOT print "Not stated" four times - a grid of sixty
 * cards each saying nothing four ways is unreadable, and the profile is
 * where the absence is worth naming.
 *
 * @param agency - The enriched agency.
 * @returns The parts to join, possibly empty.
 */
function buildSignalParts(agency: EnrichedAgency): string[] {
  try {
    const parts: string[] = [];
    if (typeof agency.minBudgetUsd === "number") {
      parts.push(`From $${agency.minBudgetUsd.toLocaleString("en-US")}`);
    }
    if (agency.typicalTimelineWeeks) {
      parts.push(`~${agency.typicalTimelineWeeks} wk`);
    }
    if (agency.responseSlaDays) {
      parts.push(`Replies in ${agency.responseSlaDays}d`);
    }
    return parts;
  } catch {
    return [];
  }
}

/**
 * Card for a single agency in a directory category grid.
 *
 * Leads with the agency name and the two badges that qualify it
 * (Verified, Superflow partner), then the facts a founder filters on.
 * Award record moved below those: it is supporting detail on a page
 * whose visitor is choosing who to email this week.
 *
 * THE WHOLE CARD OPENS THE PROFILE, via a stretched link rather than by
 * wrapping the card in an `<a>`. The anchor is the agency name, and
 * `.nameLink::after` in the stylesheet covers the card's full area - so
 * the link's accessible name is exactly "Locomotive" rather than the
 * card's entire contents read aloud, and the card still contains other
 * interactive elements, which nesting them inside an anchor would make
 * invalid HTML. Anything that has to stay clickable (the website link,
 * the partner badge) sits above that overlay on `z-index: 1`.
 *
 * THE SOURCE ATTRIBUTION LINK IS DELIBERATELY NOT HERE. It lives on the
 * profile page instead (see `AgencyDetail`), which is where the record's
 * provenance belongs and where there is room to label it. On a card it
 * competed with the agency's own website link for the same corner, and
 * a grid of sixty cards each carrying two outbound links sent visitors
 * off-site before they had compared anything.
 *
 * @param props - Component props.
 * @param props.agency - The enriched agency record to render.
 */
export default function AgencyCard({ agency }: { agency: EnrichedAgency }) {
  try {
    const placeLabel = formatAgencyPlace(agency?.location ?? null, agency?.city);
    const clientSummary = formatAgencyClientSummary(agency);
    const websiteLabel = resolveWebsiteLabel(agency);
    const awardTotal = agency?.awardTotal ?? 0;
    const description = truncateAtSentence(agency?.description);
    const signals = buildSignalParts(agency);
    const platforms = (agency?.platforms ?? []).slice(0, MAX_VISIBLE_PLATFORMS);
    const hiddenPlatforms = Math.max(0, (agency?.platforms ?? []).length - platforms.length);

    return (
      <article className={styles.card} data-claimed={agency?.claimed ? "true" : "false"}>
        <div className={styles.header}>
          <AgencyLogo
            slug={agency?.slug ?? ""}
            name={agency?.name ?? ""}
            sourceLogoUrl={agency?.logoUrl}
            claimLogoUrl={agency?.claim?.logoUrl}
            size={LOGO_SIZE}
          />
          <div className={styles.headerText}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>
                <Link href={agencyPath(agency?.slug ?? "")} className={styles.nameLink}>
                  {agency?.name ?? "Unnamed agency"}
                </Link>
              </h3>
              {/* Siblings of the link, not children of it: the badges
                  make their own claims and belong outside the link's
                  accessible name. They carry `z-index` so the stretched
                  overlay does not swallow the partner badge's tap. */}
              {agency?.verified && <VerifiedBadge />}
              <PartnerBadge agency={agency} />
            </div>
            {placeLabel && <p className={styles.location}>{placeLabel}</p>}
          </div>
        </div>

        {/* Badges that qualify the listing rather than the agency. Both
            are claims a founder is filtering on, so they sit above the
            blurb rather than in the footer. */}
        {(agency?.ycOffer || agency?.startupFriendly || agency?.acceptingProjects === false) && (
          <div className={styles.tags}>
            {agency.ycOffer && <span className={`${styles.tag} ${styles.tagYc}`}>YC offer</span>}
            {agency.startupFriendly && <span className={styles.tag}>Startup friendly</span>}
            {agency.acceptingProjects === false && (
              <span className={`${styles.tag} ${styles.tagClosed}`}>Not taking projects</span>
            )}
          </div>
        )}

        {description && <p className={styles.description}>{description}</p>}

        {signals.length > 0 && (
          <p className={styles.signals}>
            {signals.map((signal, index) => (
              <span key={signal} className={styles.signal}>
                {index > 0 && <span className={styles.signalDot} aria-hidden="true" />}
                {signal}
              </span>
            ))}
          </p>
        )}

        {platforms.length > 0 && (
          <ul className={styles.platforms}>
            {platforms.map((platform) => (
              <li key={platform} className={styles.platform}>
                {platformLabel(platform)}
              </li>
            ))}
            {hiddenPlatforms > 0 && (
              <li className={`${styles.platform} ${styles.platformMore}`}>+{hiddenPlatforms}</li>
            )}
          </ul>
        )}

        {clientSummary && (
          <p className={styles.clients}>
            <span className={styles.clientsLabel}>{CLIENTS_LINE_LABEL}</span>
            <span className={styles.clientsNames}>{clientSummary}</span>
          </p>
        )}

        <div className={styles.footer}>
          {awardTotal > 0 ? (
            <span className={styles.awards}>
              <span className={styles.awardCount}>{awardTotal}</span> award
              {awardTotal === 1 ? "" : "s"}
            </span>
          ) : agency?.rating && agency.rating.reviewCount > 0 ? (
            <span className={styles.awards}>
              <span className={styles.awardCount}>
                {agency.rating.value}/{agency.rating.scale}
              </span>{" "}
              · {agency.rating.reviewCount} review{agency.rating.reviewCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span />
          )}
          {agency?.website && (
            <a
              href={agency.website}
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
