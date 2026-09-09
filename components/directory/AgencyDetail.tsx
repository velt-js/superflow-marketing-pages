import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  formatAgencyLocation,
  formatAgencyRating,
  getAgencyClients,
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

/** Heading for the breadcrumb root, matching the hub page's H1 intent. */
const DIRECTORY_ROOT_LABEL = "Directory";

/** Pixel size the agency logo renders at inside its white hero chip. */
const LOGO_SIZE = 44;

/** Section headings for the data blocks under the hero. */
const SERVICES_HEADING = "Services";
const AWARDS_HEADING = "Award record";
/** Heading above the client list. Matches the card's wording so a visitor
 *  arriving from the grid recognises the same claim expanded. */
const CLIENTS_HEADING = "Worked with";
/** Heading above the industries list, when the services card also carries
 *  one - see `AgencyDetail`'s services/industries card. */
const INDUSTRIES_HEADING = "Industries";
/** Heading above the accolades list. Deliberately NOT "Awards" alone: this
 *  list mixes counted award names with certifications and accreditations
 *  (see `Agency.accolades` in lib/directory/types.ts), so the heading
 *  itself has to admit that rather than imply a second award tally. */
const ACCOLADES_HEADING = "Awards & certifications";

/**
 * Whether a project title says anything the client name hasn't already.
 *
 * Plenty of awarded projects are titled after the client and nothing else
 * ("Koenigsegg", "BITKRAFT"), and rendering both halves of the row then
 * prints the same words twice - which reads as a rendering bug rather than
 * as the two distinct facts the row is meant to carry. Compared on letters
 * and digits alone so casing and punctuation ("Raymond Weil" vs
 * "Raymond-Weil") don't count as a difference.
 *
 * @param clientName - The resolved client name.
 * @param projectTitle - The awarded project's title.
 * @returns True when the title is worth rendering alongside the name.
 */
function titleAddsDetail(
  clientName: string,
  projectTitle: string | null | undefined,
): boolean {
  try {
    const title = projectTitle?.trim();
    if (!title) return false;
    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalize(title) !== normalize(clientName);
  } catch {
    return false;
  }
}

/** One labelled fact in the hero's white meta card. */
interface AgencyFact {
  label: string;
  value: string;
}

/**
 * Builds the caption under the accolades heading, naming the source
 * profile they came from and explicitly disclaiming that this is a
 * verified or counted claim - unlike `AWARDS_HEADING`'s breakdown, which
 * is a tally from one known scheme. See `Agency.accolades` in
 * lib/directory/types.ts: these mix award names and certifications and
 * are only ever self-reported by the source profile.
 *
 * @param sourceLabel - The agency's resolved source label, e.g.
 *                       "Awwwards" or "Semrush Agency Partners".
 * @returns The caption text.
 */
function buildAccoladesNote(sourceLabel: string): string {
  try {
    return `Self-reported on the agency's ${sourceLabel} profile - a mix of awards and certifications, not independently verified.`;
  } catch {
    return "Self-reported on the agency's source profile - a mix of awards and certifications, not independently verified.";
  }
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
 * Builds the hero meta card's facts, dropping any the record cannot back
 * with a real value.
 *
 * Team size is included only when the source actually recorded one. It used
 * to render unconditionally with a "Not listed" fallback, which meant every
 * page in the directory printed the same empty fact - the scraper populates
 * `teamSize` for nobody today (see scripts/directory-import/README.md's
 * known limitations). The client count took its slot precisely because it
 * is a number that differs per agency and is worth comparing.
 *
 * Rating, founded year, and budget are the same treatment extended to the
 * fields the Semrush source adds: each only renders when the record
 * actually carries it, so an Awwwards profile (which has none of the
 * three) is unaffected.
 *
 * @param agency - The agency being rendered.
 * @param category - Its primary category, if resolvable.
 * @param clientCount - How many distinct clients are on record.
 * @returns The facts to render, in display order.
 */
function buildAgencyFacts(
  agency: Agency,
  category: DirectoryCategory | undefined,
  clientCount: number,
): AgencyFact[] {
  try {
    const awardTotal = agency?.awards?.total ?? 0;
    const ratingLabel = formatAgencyRating(agency?.rating ?? null);
    const facts: AgencyFact[] = [];
    if (clientCount > 0) {
      facts.push({ label: "Clients on record", value: `${clientCount}` });
    }
    if (awardTotal > 0) {
      facts.push({ label: "Total awards", value: `${awardTotal}` });
    }
    if (ratingLabel) {
      facts.push({ label: "Client rating", value: ratingLabel });
    }
    if (agency?.teamSize) {
      facts.push({ label: "Team size", value: agency.teamSize });
    }
    if (agency?.foundedYear) {
      facts.push({ label: "Founded", value: `${agency.foundedYear}` });
    }
    if (agency?.budgetLabel) {
      facts.push({ label: "Typical budget", value: agency.budgetLabel });
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
    const industries =
      agency?.industries?.filter((industry) => Boolean(industry?.trim())) ?? [];
    const accolades =
      agency?.accolades?.filter((accolade) => Boolean(accolade?.trim())) ?? [];
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const agencyName = agency?.name ?? "Unnamed agency";
    const clients = getAgencyClients(agency);
    const facts = buildAgencyFacts(agency, category, clients.length);
    const isPartner = isSuperflowPartner(agency);
    // A lone card would otherwise sit in a half-empty two-column row.
    const cardCount =
      (clients.length > 0 ? 1 : 0) +
      (services.length > 0 || industries.length > 0 ? 1 : 0) +
      (awardBreakdown.length > 0 ? 1 : 0) +
      (accolades.length > 0 ? 1 : 0);

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
                {clients.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{CLIENTS_HEADING}</h2>
                    <ul className={styles.clientList}>
                      {clients.map((client) => (
                        <li key={client.name} className={styles.clientRow}>
                          <span className={styles.clientName}>{client.name}</span>
                          {titleAddsDetail(client.name, client.projectTitle) && (
                            <span className={styles.clientProject}>
                              {client.projectTitle}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(services.length > 0 || industries.length > 0) && (
                  <div className={styles.card}>
                    {services.length > 0 && (
                      <>
                        <h2 className={styles.cardTitle}>{SERVICES_HEADING}</h2>
                        <ul className={styles.chips}>
                          {services.map((service) => (
                            <li key={service} className={styles.chip}>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {industries.length > 0 && (
                      <>
                        <h2
                          className={services.length > 0 ? styles.cardSubtitle : styles.cardTitle}
                        >
                          {INDUSTRIES_HEADING}
                        </h2>
                        <ul className={styles.chips}>
                          {industries.map((industry) => (
                            <li key={industry} className={styles.chip}>
                              {industry}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {/* awardBreakdown is already empty for a zero award total,
                    so an agency with no awards (every Semrush record
                    today) renders no empty "Award record" shell. */}
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

                {accolades.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{ACCOLADES_HEADING}</h2>
                    <p className={styles.accoladesNote}>{buildAccoladesNote(sourceLabel)}</p>
                    <ul className={styles.chips}>
                      {accolades.map((accolade) => (
                        <li key={accolade} className={styles.chip}>
                          {accolade}
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
