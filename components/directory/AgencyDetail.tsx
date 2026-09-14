import Link from "next/link";

import {
  formatAgencyPlace,
  formatAgencyRating,
  getAgencyClients,
  getAwardBreakdown,
  isSuperflowPartner,
  resolveAgencySourceLabel,
} from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import type { EnrichedAgency } from "@/lib/directory/enrich";
import AgencyFastFacts from "./AgencyFastFacts";
import AgencyLogo from "./AgencyLogo";
import PartnerBadge from "./PartnerBadge";
import RequestIntroButton from "./RequestIntroButton";
import VerifiedBadge from "./VerifiedBadge";
import heroStyles from "./DirectoryHero.module.css";
import styles from "./AgencyDetail.module.css";
import type { DirectoryCategory } from "@/lib/directory/types";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Label for the outbound CTA when a website is on record. */
const WEBSITE_CTA_LABEL = "Visit website";

/** Heading for the breadcrumb root, matching the hub page's H1 intent. */
const DIRECTORY_ROOT_LABEL = "Directory";

/** Edge of the logo tile in the hero. */
const LOGO_SIZE = 56;

/** Section headings for the data blocks under the hero. */
const SERVICES_HEADING = "Services";
const AWARDS_HEADING = "Award record";
const CLIENTS_HEADING = "Worked with";
const STARTUP_CLIENTS_HEADING = "Startups";
const INDUSTRIES_HEADING = "Industries";
/** Deliberately NOT "Awards" alone: this list mixes counted award names
 *  with certifications and accreditations (see `Agency.accolades`), so
 *  the heading has to admit that rather than imply a second tally. */
const ACCOLADES_HEADING = "Awards & certifications";
/** The block nobody else publishes, and the most useful one on the page. */
const DECLINES_HEADING = "What they say no to";
/** Pill shown when an agency has told us it is open for work. */
const ACCEPTING_LABEL = "Accepting projects";
const NOT_ACCEPTING_LABEL = "Not taking projects right now";
/** Prefix on the YC offer line. */
const YC_OFFER_LABEL = "YC founder offer";

/**
 * Whether a project title says anything the client name has not already.
 *
 * Plenty of awarded projects are titled after the client and nothing else
 * ("Koenigsegg", "BITKRAFT"), and rendering both halves of the row prints
 * the same words twice - which reads as a rendering bug rather than as
 * the two distinct facts the row is meant to carry. Compared on letters
 * and digits alone so casing and punctuation do not count as a
 * difference.
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
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalize(title) !== normalize(clientName);
  } catch {
    return false;
  }
}

/**
 * Builds the caption under the accolades heading, naming the source and
 * disclaiming that this is a verified or counted claim - unlike the award
 * breakdown, which is a tally from one known scheme.
 *
 * @param sourceLabel - The agency's resolved source label.
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
 * Breadcrumb trail on the hero: Directory -> category -> agency name. A
 * visible companion to the BreadcrumbList JSON-LD the page emits.
 *
 * @param props - Component props.
 * @param props.agencyName - The current agency's name (not a link).
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
 * Full-content body of an agency profile.
 *
 * SECTION ORDER IS THE DESIGN. Top to bottom: who they are and how to
 * reach them, then the four facts that decide whether to reach them at
 * all (budget, timeline, platforms, reply time), then the YC offer, then
 * the agency's own words, then its record, then what it declines. That is
 * the order a founder's questions actually arrive in.
 *
 * What it replaced ran the other way round: a three-stat card counting
 * clients, awards and team size, then a scraped blurb, then the award
 * breakdown. Every one of those describes the agency's past. None of them
 * answers "can I afford this and will they reply".
 *
 * @param props - Component props.
 * @param props.agency - The enriched agency to render.
 * @param props.category - Its primary category, if resolvable, used for
 *                          the breadcrumb and the intro request.
 */
export default function AgencyDetail({
  agency,
  category,
}: {
  agency: EnrichedAgency;
  category: DirectoryCategory | undefined;
}) {
  try {
    const placeLabel = formatAgencyPlace(agency?.location ?? null, agency?.city);
    const awardBreakdown = getAwardBreakdown(agency?.awards);
    const services = agency?.services?.filter((service) => Boolean(service?.trim())) ?? [];
    const industries = agency?.industries?.filter((industry) => Boolean(industry?.trim())) ?? [];
    const accolades = agency?.accolades?.filter((accolade) => Boolean(accolade?.trim())) ?? [];
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const agencyName = agency?.name ?? "Unnamed agency";
    const clients = getAgencyClients(agency);
    const startupClients = agency?.startupClients ?? [];
    const isPartner = isSuperflowPartner(agency);
    const ratingLabel = formatAgencyRating(agency?.rating ?? null);

    // A lone card would otherwise sit in a half-empty two-column row.
    const cardCount =
      (clients.length > 0 || startupClients.length > 0 ? 1 : 0) +
      (services.length > 0 || industries.length > 0 ? 1 : 0) +
      (awardBreakdown.length > 0 || ratingLabel ? 1 : 0) +
      (accolades.length > 0 ? 1 : 0);

    return (
      <>
        <section className={heroStyles.hero} data-section="directory-agency-hero">
          <div className={heroStyles.inner}>
            <Breadcrumb agencyName={agencyName} category={category} />

            <span className={heroStyles.logoChip}>
              <AgencyLogo
                slug={agency?.slug ?? ""}
                name={agencyName}
                sourceLogoUrl={agency?.logoUrl}
                claimLogoUrl={agency?.claim?.logoUrl}
                size={LOGO_SIZE}
              />
            </span>

            <div className={heroStyles.headlineRow}>
              <h1 className={heroStyles.headline}>{agencyName}</h1>
              {agency?.verified && (
                <span className={heroStyles.badgeChip}>
                  <VerifiedBadge />
                </span>
              )}
              {/* PartnerBadge renders nothing for a non-partner, so the
                  chip is guarded rather than left as an empty white disc
                  floating beside the name. */}
              {isPartner && (
                <span className={heroStyles.badgeChip}>
                  <PartnerBadge agency={agency} />
                </span>
              )}
            </div>

            <div className={styles.heroMetaRow}>
              {placeLabel && <span className={heroStyles.subhead}>{placeLabel}</span>}
              {agency?.claimed && (
                <span
                  className={`${styles.statusPill}${
                    agency.acceptingProjects ? "" : ` ${styles.statusPillClosed}`
                  }`}
                >
                  {agency.acceptingProjects ? ACCEPTING_LABEL : NOT_ACCEPTING_LABEL}
                </span>
              )}
            </div>

            <div className={styles.heroActions}>
              <RequestIntroButton
                slug={agency.slug}
                name={agencyName}
                categorySlug={category?.slug ?? agency.primaryCategorySlug ?? ""}
              />
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
            </div>

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
          </div>
        </section>

        <section className={styles.section} data-section="directory-agency-body">
          <div className={styles.inner}>
            <AgencyFastFacts agency={agency} />

            {agency?.ycOffer && (
              <p className={styles.ycOffer}>
                <span className={styles.ycOfferLabel}>{YC_OFFER_LABEL}</span>
                <span className={styles.ycOfferText}>{agency.ycOffer}</span>
              </p>
            )}

            {agency?.description && <p className={styles.lead}>{agency.description}</p>}

            {cardCount > 0 && (
              <div
                className={`${styles.cards}${cardCount === 1 ? ` ${styles.cardsSingle}` : ""}`}
              >
                {(clients.length > 0 || startupClients.length > 0) && (
                  <div className={styles.card}>
                    {startupClients.length > 0 && (
                      <>
                        {/* Startups first, and named as such. A founder
                            scanning a client list for someone their own
                            size should not have to recognise which of
                            forty logos was once a seed-stage company. */}
                        <h2 className={styles.cardTitle}>{STARTUP_CLIENTS_HEADING}</h2>
                        <ul className={styles.chips}>
                          {startupClients.map((client) => (
                            <li key={client} className={styles.chip}>
                              {client}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {clients.length > 0 && (
                      <>
                        <h2
                          className={
                            startupClients.length > 0 ? styles.cardSubtitle : styles.cardTitle
                          }
                        >
                          {CLIENTS_HEADING}
                        </h2>
                        <ul className={styles.clientList}>
                          {clients.map((client) => (
                            <li key={client.name} className={styles.clientRow}>
                              <span className={styles.clientName}>{client.name}</span>
                              {titleAddsDetail(client.name, client.projectTitle) && (
                                <span className={styles.clientProject}>{client.projectTitle}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
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
                    so an agency with no awards renders no empty shell. */}
                {(awardBreakdown.length > 0 || ratingLabel) && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>{AWARDS_HEADING}</h2>
                    {ratingLabel && <p className={styles.cardNote}>{ratingLabel}</p>}
                    {awardBreakdown.length > 0 && (
                      <ul className={styles.awardList}>
                        {awardBreakdown.map((entry) => (
                          <li key={entry.label} className={styles.awardRow}>
                            <span>{entry.label}</span>
                            <span className={styles.awardCount}>{entry.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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

            {agency?.declines && (
              <div className={styles.declines}>
                <h2 className={styles.declinesTitle}>{DECLINES_HEADING}</h2>
                <p className={styles.declinesBody}>{agency.declines}</p>
                <p className={styles.declinesNote}>In the agency&rsquo;s own words.</p>
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
