import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  formatAgencyLocation,
  getAwardBreakdown,
  isSuperflowPartner,
  resolveAgencySourceLabel,
} from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import PartnerBadge from "./PartnerBadge";
import heroStyles from "./DirectoryHero.module.css";
import styles from "./AgencyDetail.module.css";
import type { Agency, DirectoryCategory } from "@/lib/directory/types";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Label for the primary outbound call-to-action when a website is on
 *  record. */
const WEBSITE_CTA_LABEL = "Visit website";

/** Copy shown in the facts card when no team size was recorded. */
const UNKNOWN_TEAM_SIZE_LABEL = "Not listed";

/** Heading for the breadcrumb root, matching the hub page's H1 intent. */
const DIRECTORY_ROOT_LABEL = "Directory";

/** Pixel size the agency logo renders at inside its white hero chip. */
const LOGO_SIZE = 44;

/** Section headings for the two data blocks under the hero. */
const SERVICES_HEADING = "Services";
const AWARDS_HEADING = "Award record";

/** One labelled fact in the hero's white meta card. */
interface AgencyFact {
  label: string;
  value: string;
}

/**
 * Breadcrumb trail rendered on the hero: Directory -> category (when known)
 * -> agency name. A visible companion to the BreadcrumbList JSON-LD emitted
 * by the page - screen readers and crawlers both get the same hierarchy.
 *
 * @param props - Component props.
 * @param props.agencyName - The current agency's display name (current
 *                            page, not a link).
 * @param props.category - The agency's primary category, if resolvable.
 */
function Breadcrumb({
  agencyName,
  category,
}: {
  agencyName: string;
  category: DirectoryCategory | undefined;
}) {
  try {
    return (
      <nav aria-label="Breadcrumb" className={heroStyles.breadcrumb}>
        <ol className={heroStyles.breadcrumbList}>
          <li>
            <Link href={DIRECTORY_BASE_PATH} className={heroStyles.breadcrumbLink}>
              {DIRECTORY_ROOT_LABEL}
            </Link>
          </li>
          {category && (
            <>
              <li className={heroStyles.breadcrumbSeparator} aria-hidden="true">
                /
              </li>
              <li>
                <Link
                  href={`${DIRECTORY_BASE_PATH}/${category.slug}`}
                  className={heroStyles.breadcrumbLink}
                >
                  {category.title}
                </Link>
              </li>
            </>
          )}
          <li className={heroStyles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li className={heroStyles.breadcrumbCurrent}>{agencyName}</li>
        </ol>
      </nav>
    );
  } catch {
    return null;
  }
}

/**
 * Builds the hero meta card's facts. Team size always shows (with an
 * explicit "Not listed" rather than a silent gap, since its absence is
 * itself information on a directory); the award total and category drop out
 * when there is nothing real to print.
 *
 * @param agency - The agency being rendered.
 * @param category - Its primary category, if resolvable.
 * @returns The facts to render, in display order.
 */
function buildAgencyFacts(
  agency: Agency,
  category: DirectoryCategory | undefined,
): AgencyFact[] {
  try {
    const awardTotal = agency?.awards?.total ?? 0;
    const facts: AgencyFact[] = [
      { label: "Team size", value: agency?.teamSize ?? UNKNOWN_TEAM_SIZE_LABEL },
    ];
    if (awardTotal > 0) {
      facts.push({ label: "Total awards", value: `${awardTotal}` });
    }
    if (category?.title) {
      facts.push({ label: "Category", value: category.title });
    }
    return facts;
  } catch {
    return [];
  }
}

/**
 * One labelled fact inside the hero's white meta card.
 *
 * @param props - The fact's label and value.
 */
function AgencyFactItem({ label, value }: AgencyFact) {
  try {
    return (
      <div className={heroStyles.metaItem}>
        <span className={heroStyles.metaLabel}>{label}</span>
        <span className={heroStyles.metaValue}>{value}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Full-content body of an agency detail page, on the 2026 design system:
 * the shared blue-gradient directory hero (breadcrumb, logo chip, name,
 * location, outbound CTA and a white facts card) followed by white cards
 * carrying the agency's blurb, its service list and its full award
 * breakdown.
 *
 * Replaces the flat white header + right-hand sidebar this component used
 * to ship. The sidebar's three facts moved into the hero's meta card and
 * its CTA became the hero's button, which is where every other 2026 detail
 * page (see `components/case-study-2026/CaseStudyHero`) parks the same
 * things - leaving the body free to be just the agency's own content.
 *
 * Deliberately holds more than `AgencyCard` shows on the category grid -
 * the detail page needs to justify its own existence with real content,
 * not just repeat the card.
 *
 * @param props - Component props.
 * @param props.agency - The agency to render.
 * @param props.category - The agency's primary category, if resolvable,
 *                          used for the breadcrumb, facts card and
 *                          hero copy.
 */
export default function AgencyDetail({
  agency,
  category,
}: {
  agency: Agency;
  category: DirectoryCategory | undefined;
}) {
  try {
    const locationLabel = formatAgencyLocation(agency?.location ?? null);
    const awardBreakdown = getAwardBreakdown(agency?.awards);
    const services =
      agency?.services?.filter((service) => Boolean(service?.trim())) ?? [];
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const agencyName = agency?.name ?? "Unnamed agency";
    const facts = buildAgencyFacts(agency, category);
    const isPartner = isSuperflowPartner(agency);
    // A lone card would otherwise sit in a half-empty two-column row.
    const cardCount =
      (services.length > 0 ? 1 : 0) + (awardBreakdown.length > 0 ? 1 : 0);

    return (
      <>
        <section className={heroStyles.hero} data-section="directory-agency-hero">
          <div className={heroStyles.inner}>
            <Breadcrumb agencyName={agencyName} category={category} />

            {agency?.logoUrl && (
              <span className={heroStyles.logoChip}>
                <Image
                  className={heroStyles.logoImage}
                  src={agency.logoUrl}
                  alt=""
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                />
              </span>
            )}

            <div className={heroStyles.headlineRow}>
              <h1 className={heroStyles.headline}>{agencyName}</h1>
              {/* The chip is only rendered for an actual partner - PartnerBadge
                  itself renders nothing otherwise, which would leave an empty
                  white disc floating beside the name. */}
              {isPartner && (
                <span className={heroStyles.badgeChip}>
                  <PartnerBadge agency={agency} />
                </span>
              )}
            </div>

            {locationLabel && <p className={heroStyles.subhead}>{locationLabel}</p>}

            {agency?.website && (
              <a
                className={heroStyles.cta}
                href={agency.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {WEBSITE_CTA_LABEL} {EXTERNAL_LINK_GLYPH}
              </a>
            )}

            {agency?.profileUrl && (
              <a
                className={heroStyles.sourceLink}
                href={agency.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sourceLabel} {EXTERNAL_LINK_GLYPH}
              </a>
            )}

            {facts.length > 0 && (
              <div className={heroStyles.metaCard}>
                {facts.map((fact, index) => (
                  <Fragment key={fact.label}>
                    {index > 0 && (
                      <span className={heroStyles.metaDivider} aria-hidden="true" />
                    )}
                    <AgencyFactItem label={fact.label} value={fact.value} />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.section} data-section="directory-agency-body">
          <div className={styles.inner}>
            {agency?.description && (
              <p className={styles.lead}>{agency.description}</p>
            )}

            {cardCount > 0 && (
              <div
                className={`${styles.cards}${cardCount === 1 ? ` ${styles.cardsSingle}` : ""}`}
              >
                {services.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{SERVICES_HEADING}</h2>
                    <ul className={styles.chips}>
                      {services.map((service) => (
                        <li key={service} className={styles.chip}>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {awardBreakdown.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{AWARDS_HEADING}</h2>
                    <ul className={styles.awardList}>
                      {awardBreakdown.map((entry) => (
                        <li key={entry.label} className={styles.awardRow}>
                          <span>{entry.label}</span>
                          <span className={styles.awardCount}>{entry.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </>
    );
  } catch {
    return null;
  }
}
