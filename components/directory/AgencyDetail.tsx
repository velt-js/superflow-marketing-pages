import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  formatAgencyLocation,
  getAgencyClients,
  getAwardBreakdown,
  getHeadlineAward,
  isJuryAccoladeSource,
  isSuperflowPartner,
  resolveAgencySourceLabel,
  resolveAwardTallyLabel,
} from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH, directoryCategoryPath } from "@/lib/directory/constants";
import PartnerBadge from "./PartnerBadge";
import heroStyles from "./DirectoryHero.module.css";
import styles from "./AgencyDetail.module.css";
import type { Agency, DirectoryCategory } from "@/lib/directory/types";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Label for the primary outbound call-to-action when a website is on
 *  record. */
const WEBSITE_CTA_LABEL = "Visit website";

/** Prefix on the attribution link beside the CTA. Says "Source:" outright
 *  rather than printing a bare directory name, so the link reads as
 *  provenance rather than as a second thing to go and do. */
const SOURCE_LINK_PREFIX = "Source:";

/** Heading for the breadcrumb root, matching the list page's H1 intent. */
const DIRECTORY_ROOT_LABEL = "Directory";

/** Pixel size the agency logo renders at inside its white hero plate. */
const LOGO_SIZE = 52;

/** Rendered on the logo plate when a record carries no logo. */
const FALLBACK_INITIAL = "•";

/** Section headings for the data blocks under the hero. */
const SERVICES_HEADING = "Services";
const AWARDS_HEADING = "Award record";
/** Heading above the client list. Matches the card's wording so a visitor
 *  arriving from the list recognises the same claim expanded. */
const CLIENTS_HEADING = "Worked with";
/** Heading above the industries list, when the services card also carries
 *  one - see the services/industries card below. */
const INDUSTRIES_HEADING = "Industries";
/** Heading above a self-reported accolade list. Deliberately NOT "Awards"
 *  alone: that list mixes award names with certifications (see
 *  `Agency.accolades` in lib/directory/types.ts), so the heading itself has
 *  to admit that rather than imply a second award tally. A jury's
 *  accolades render under AWARDS_HEADING instead - see
 *  `isJuryAccoladeSource`. */
const ACCOLADES_HEADING = "Awards & certifications";
/** Heading above the engagement note and the list of work an agency turns
 *  down. Both come from the agency rather than from a source profile - see
 *  `AgencyListing` in lib/directory/types.ts. */
const TERMS_HEADING = "Working with them";
/** Sub-heading above the exclusions list inside that card. */
const EXCLUSIONS_HEADING = "Doesn't take on";
/** Sub-heading above the stated project-size floors inside that card. */
const BUDGET_MINIMUMS_HEADING = "Minimum project";
/** Stat cells a profile's hero strip will show before it stops. Five fits
 *  the 880px card without the cells collapsing into unreadable columns;
 *  past that the strip stops being scannable, which is the only thing it
 *  is for. */
const MAX_HERO_STATS = 5;

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
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalize(title) !== normalize(clientName);
  } catch {
    return false;
  }
}

/** One labelled figure in the hero's white stat strip. */
interface AgencyStat {
  label: string;
  value: string;
  /** True when the value is a phrase rather than a figure, so it renders a
   *  size down instead of wrapping out of its cell. */
  isText?: boolean;
}

/**
 * Builds the caption under a self-reported accolade list, naming the
 * profile it came from and disclaiming that it is a counted or verified
 * claim - unlike the award breakdown, which is a tally from one known
 * scheme.
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
 * Builds the caption above a jury's award list, where each entry is one
 * win the jury itself published.
 *
 * The opposite claim from `buildAccoladesNote`, and they must not be
 * swapped: a D&AD Pencil list captioned "self-reported" is wrong about the
 * jury. See `isJuryAccoladeSource`.
 *
 * @param sourceLabel - The agency's resolved source label.
 * @returns The caption text.
 */
function buildJuryAccoladesNote(sourceLabel: string): string {
  try {
    return `Every entry is one win, as published by ${sourceLabel}.`;
  } catch {
    return "Every entry is one win, as published by the awarding jury.";
  }
}

/**
 * Builds the caption beside the client list, naming where the names came
 * from. Awwwards is called out separately because its client list is
 * derived from the projects it awarded rather than from anything the
 * agency wrote - which is a stronger claim, and a checkable one.
 *
 * @param agency - The agency being rendered.
 * @param sourceLabel - Its resolved source label.
 * @returns The caption text.
 */
function buildClientsNote(agency: Agency | null | undefined, sourceLabel: string): string {
  try {
    if (agency?.source === "awwwards") return `From the projects ${sourceLabel} has awarded.`;
    return `As listed on the agency's ${sourceLabel} profile.`;
  } catch {
    return "As listed on the agency's source profile.";
  }
}

/**
 * Builds the caption above the award tally, naming the jury that counted
 * it.
 *
 * Rendered only alongside an agency's own note about its wider record (see
 * `AgencyListing.awardsNote`), which is the one place on the page where two
 * different claims about awards sit in the same card and a reader could
 * take the second for the first's source.
 *
 * @param sourceLabel - The agency's resolved source label.
 * @returns The caption text.
 */
function buildAwardTallyNote(sourceLabel: string): string {
  try {
    return `The counts below are the tally ${sourceLabel} publishes.`;
  } catch {
    return "The counts below are the tally the source directory publishes.";
  }
}

/**
 * Formats one stated project-size floor, e.g. "€15,000".
 *
 * Formatted in the currency the agency quoted, never converted into one
 * shared currency: a rate they did not give is a figure they did not
 * state. Falls back to "CODE 15000" if `Intl` rejects the code, which is
 * still readable and still honest about which currency it is.
 *
 * @param amount - The figure, unformatted.
 * @param currency - Three-letter ISO currency code.
 * @returns The formatted amount.
 */
function formatBudgetAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Builds the line stating that the agency itself confirmed this page.
 *
 * Every other claim on an agency page is attributable to the source
 * profile linked from the hero. This one is not - it says the agency
 * looked at the page and stood behind it - so it names the date and reads
 * as a statement about provenance rather than as an endorsement.
 *
 * @param verifiedAt - ISO-8601 date the agency confirmed the details.
 * @returns The line, or null when the date is missing or unparseable (an
 *          in-house edit is not a verification and renders nothing).
 */
function buildVerifiedNote(verifiedAt: string | null | undefined): string | null {
  try {
    const raw = verifiedAt?.trim();
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    const formatted = parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return `Confirmed by the agency on ${formatted}.`;
  } catch {
    return null;
  }
}

/**
 * Breadcrumb trail rendered on the hero: Directory -> category (when known)
 * -> agency name. A visible companion to the BreadcrumbList JSON-LD emitted
 * by the page - screen readers and crawlers both get the same hierarchy.
 *
 * The category step points at the list filtered to that category
 * (`/directory?category=<slug>`), which is what the retired
 * `/directory/<slug>` route now redirects to - see `directoryCategoryPath`.
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
                  href={directoryCategoryPath(category.slug)}
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
 * Builds the hero stat strip, dropping any figure the record cannot back
 * with a real value and stopping at `MAX_HERO_STATS`.
 *
 * Ordered by how much the figure distinguishes this agency from the next
 * one: the credential its source ranks on first, then how much work is on
 * record behind it, then the practical facts (budget, size, age) a visitor
 * needs before making contact. Nothing renders a "Not listed" placeholder -
 * a strip of empty facts is worse than a shorter strip.
 *
 * Team size and founded year are last because the scraper populates them
 * for almost nobody outside the Semrush slice.
 *
 * @param agency - The agency being rendered.
 * @param clientCount - How many distinct clients are on record.
 * @returns The stats to render, in display order.
 */
function buildAgencyStats(agency: Agency, clientCount: number): AgencyStat[] {
  try {
    const stats: AgencyStat[] = [];
    const awardTotal = agency?.awards?.total ?? 0;
    const headlineAward = getHeadlineAward(agency);
    const accoladeCount = agency?.accolades?.length ?? 0;
    const rating = agency?.rating ?? null;

    if (awardTotal > 0) {
      stats.push({
        label: resolveAwardTallyLabel(agency?.source, awardTotal),
        value: `${awardTotal}`,
      });
      if (headlineAward) {
        stats.push({ label: headlineAward.label, value: `${headlineAward.count}` });
      }
    } else if (accoladeCount > 0 && isJuryAccoladeSource(agency?.source)) {
      // A jury source keeps its wins in `accolades`, one entry per win, so
      // the length IS the award count - see `isJuryAccoladeSource`.
      stats.push({
        label: resolveAwardTallyLabel(agency?.source, accoladeCount),
        value: `${accoladeCount}`,
      });
    }

    if (rating) {
      stats.push({ label: "Client rating", value: `${rating.value}/${rating.scale}` });
      if (rating.reviewCount > 0) {
        stats.push({
          label: rating.reviewCount === 1 ? "Review" : "Reviews",
          value: `${rating.reviewCount}`,
        });
      }
    }

    if (clientCount > 0) {
      stats.push({ label: "Clients on record", value: `${clientCount}` });
    }
    if (agency?.budgetLabel) {
      stats.push({ label: "Typical budget", value: agency.budgetLabel, isText: true });
    }
    if (agency?.teamSize) {
      stats.push({ label: "Team size", value: agency.teamSize, isText: true });
    }
    if (agency?.foundedYear) {
      stats.push({ label: "Founded", value: `${agency.foundedYear}` });
    }

    return stats.slice(0, MAX_HERO_STATS);
  } catch {
    return [];
  }
}

/** One labelled figure inside the hero's white stat strip. */
function AgencyStatItem({ label, value, isText }: AgencyStat) {
  try {
    return (
      <div className={heroStyles.metaItem}>
        <span
          className={`${heroStyles.metaValue}${isText ? ` ${heroStyles.metaValueText}` : ""}`}
        >
          {value}
        </span>
        <span className={heroStyles.metaLabel}>{label}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * One row of the award breakdown: the award's name and count over a bar
 * showing what share of the agency's total it is.
 *
 * The bar is the point of the card. A list of "15 / 33 / 1" is three
 * numbers a reader has to hold in their head to compare; the bars say at a
 * glance that this studio's record is mostly Honorable Mentions, or mostly
 * Sites of the Day, which is the difference between two studios with the
 * same total.
 *
 * @param props - Component props.
 * @param props.label - The award's name.
 * @param props.count - How many the agency holds.
 * @param props.share - That count as a fraction of the agency's total.
 * @param props.isLeading - Whether this is the agency's biggest award type,
 *                           which paints in full accent rather than tinted.
 */
function AwardBar({
  label,
  count,
  share,
  isLeading,
}: {
  label: string;
  count: number;
  share: number;
  isLeading: boolean;
}) {
  try {
    // Clamped so a malformed tally (a type counted above the total) cannot
    // paint a bar wider than its track, and so a 1-of-227 award still
    // leaves a visible mark rather than a hairline.
    const width = Math.max(2, Math.min(100, Math.round(share * 100)));
    return (
      <div className={styles.awardBarRow}>
        <div className={styles.awardBarHead}>
          <span className={styles.awardBarLabel}>{label}</span>
          <span className={styles.awardBarCount}>{count}</span>
        </div>
        <div className={styles.awardBarTrack}>
          <div
            className={`${styles.awardBarFill}${isLeading ? "" : ` ${styles.awardBarFillQuiet}`}`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Full-content body of an agency detail page, on the 2026 design system:
 * the shared blue-gradient directory hero (breadcrumb, logo plate, name,
 * location, the agency's own blurb, an outbound CTA, the source
 * attribution and a stat strip) followed by white cards carrying the
 * agency's clients, award record, services and terms.
 *
 * The blurb moved onto the gradient and the facts became a stat strip so
 * the page answers "who are they, what have they won, what do they cost"
 * above the fold, in the order a visitor comparing two agencies asks it.
 * The body below is then only the detail that answer sits on.
 *
 * Deliberately holds more than `AgencyCard` shows on the list - the detail
 * page needs to justify its own existence with real content, not just
 * repeat the card.
 *
 * @param props - Component props.
 * @param props.agency - The agency to render.
 * @param props.category - The agency's primary category, if resolvable,
 *                          used for the breadcrumb and the identity line.
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
    const awardTotal = agency?.awards?.total ?? 0;
    const services = agency?.services?.filter((service) => Boolean(service?.trim())) ?? [];
    const industries = agency?.industries?.filter((industry) => Boolean(industry?.trim())) ?? [];
    const accolades = agency?.accolades?.filter((accolade) => Boolean(accolade?.trim())) ?? [];
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const agencyName = agency?.name ?? "Unnamed agency";
    const clients = getAgencyClients(agency);
    const stats = buildAgencyStats(agency, clients.length);
    const isPartner = isSuperflowPartner(agency);
    const juryAccolades = isJuryAccoladeSource(agency?.source);
    // Everything the agency told us directly, absent for all but the
    // handful of records an agency has written in about.
    const listing = agency?.listing ?? null;
    const awardsNote = listing?.awardsNote?.trim() || null;
    const engagementNote = listing?.engagementNote?.trim() || null;
    const exclusions = listing?.exclusions?.filter((exclusion) => Boolean(exclusion?.trim())) ?? [];
    const budgetMinimums = listing?.budgetMinimums ?? [];
    const verifiedNote = buildVerifiedNote(listing?.verifiedAt);
    const hasTerms =
      Boolean(engagementNote) || exclusions.length > 0 || budgetMinimums.length > 0;
    const identityMeta = [locationLabel, category?.title].filter(Boolean).join(" · ");

    // Each card is paired with a rough measure of how tall it runs, so the
    // longest one takes the wide column. Without it the wide column held
    // whatever came first in the source order, which on a D&AD studio meant
    // 12 client rows on the left and 34 award chips squeezed into the
    // narrow rail beside them, each wrapping to three lines.
    const cards: Array<{ node: ReactNode; weight: number }> = [];

    const clientsCard = clients.length > 0 && (
      <div className={styles.card} key="clients">
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{CLIENTS_HEADING}</h2>
          <span className={styles.cardNote}>{buildClientsNote(agency, sourceLabel)}</span>
        </div>
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
      </div>
    );

    // awardBreakdown is already empty for a zero award total, so an agency
    // with no counted awards renders no empty "Award record" shell.
    const awardsCard = awardBreakdown.length > 0 && (
      <div className={styles.card} key="awards">
        <h2 className={styles.cardTitle}>{AWARDS_HEADING}</h2>
        {/* Only named when the agency has added a note of its own below
            the tally - otherwise the hero's source link is already the one
            attribution on the page. */}
        {awardsNote && <p className={styles.cardNote}>{buildAwardTallyNote(sourceLabel)}</p>}
        <div className={styles.awardBars}>
          {awardBreakdown.map((entry, index) => (
            <AwardBar
              key={entry.label}
              label={entry.label}
              count={entry.count}
              share={awardTotal > 0 ? entry.count / awardTotal : 0}
              isLeading={index === 0}
            />
          ))}
        </div>
        <p className={styles.cardCaption}>
          {awardTotal} {resolveAwardTallyLabel(agency?.source, awardTotal).toLowerCase()} in total
          {agency?.profileUrl ? (
            <>
              {", as tallied on the agency's "}
              <a
                href={agency.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardCaptionLink}
              >
                {sourceLabel} profile
              </a>
              .
            </>
          ) : (
            "."
          )}
        </p>
        {awardsNote && <p className={styles.cardNote}>{awardsNote}</p>}
      </div>
    );

    const accoladesCard = accolades.length > 0 && (
      <div className={styles.card} key="accolades">
        <h2 className={styles.cardTitle}>
          {juryAccolades ? AWARDS_HEADING : ACCOLADES_HEADING}
        </h2>
        <p className={styles.cardNote}>
          {juryAccolades
            ? buildJuryAccoladesNote(sourceLabel)
            : buildAccoladesNote(sourceLabel)}
        </p>
        <ul className={styles.chips}>
          {accolades.map((accolade) => (
            <li key={accolade} className={styles.chip}>
              {accolade}
            </li>
          ))}
        </ul>
      </div>
    );

    const servicesCard = (services.length > 0 || industries.length > 0) && (
      <div className={styles.card} key="services">
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
            <h2 className={services.length > 0 ? styles.cardSubtitle : styles.cardTitle}>
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
    );

    // Only ever present for an agency that has written in - no source
    // directory publishes either of these, which is why an empty
    // exclusions list renders no card rather than an empty one. An agency
    // that rules nothing out has said something real, and saying it under
    // a "Doesn't take on" heading would invert it.
    const termsCard = hasTerms && (
      <div className={styles.card} key="terms">
        <h2 className={styles.cardTitle}>{TERMS_HEADING}</h2>
        {/* Floors lead the card. "What does it cost to start" is the
            question a visitor opens an agency profile with, and it is the
            one the source directories almost never answer. */}
        {budgetMinimums.length > 0 && (
          <>
            <h3 className={styles.cardSubtitle}>{BUDGET_MINIMUMS_HEADING}</h3>
            <ul className={styles.factList}>
              {budgetMinimums.map((minimum) => (
                <li key={minimum.scope} className={styles.factRow}>
                  <span>{minimum.scope}</span>
                  <span className={styles.factValue}>
                    {formatBudgetAmount(minimum.amount, minimum.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {engagementNote && <p className={styles.cardBody}>{engagementNote}</p>}
        {exclusions.length > 0 && (
          <>
            <h3 className={styles.cardSubtitle}>{EXCLUSIONS_HEADING}</h3>
            <ul className={styles.chips}>
              {exclusions.map((exclusion) => (
                <li key={exclusion} className={styles.chip}>
                  {exclusion}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );

    if (clientsCard) cards.push({ node: clientsCard, weight: clients.length });
    // A bar is a label, a count and a track, so it runs about twice a list
    // row's height.
    if (awardsCard) cards.push({ node: awardsCard, weight: awardBreakdown.length * 2 });
    if (accoladesCard) cards.push({ node: accoladesCard, weight: accolades.length });
    // Chips pack two or three to a row, so a service list is shorter than
    // its item count suggests.
    if (servicesCard) {
      cards.push({ node: servicesCard, weight: Math.ceil((services.length + industries.length) / 2) });
    }
    if (termsCard) {
      cards.push({
        node: termsCard,
        weight: budgetMinimums.length + exclusions.length + (engagementNote ? 3 : 0),
      });
    }

    // Strictly greater, so a tie leaves the earlier card in front - which
    // keeps the client list, first in this order, leading a profile whose
    // cards are all the same length.
    const primaryIndex = cards.reduce(
      (best, card, index) => (card.weight > cards[best].weight ? index : best),
      0,
    );
    const primaryCard = cards[primaryIndex]?.node ?? null;
    const asideCards = cards.filter((_, index) => index !== primaryIndex).map((card) => card.node);

    return (
      <>
        <section
          className={`${heroStyles.hero} ${heroStyles.heroProfile}`}
          data-section="directory-agency-hero"
        >
          <div className={heroStyles.inner}>
            <Breadcrumb agencyName={agencyName} category={category} />

            <div className={heroStyles.identity}>
              <span className={heroStyles.logoPlate}>
                {agency?.logoUrl ? (
                  <Image
                    className={heroStyles.logoImage}
                    src={agency.logoUrl}
                    alt=""
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                  />
                ) : (
                  <span className={heroStyles.logoInitial} aria-hidden="true">
                    {agencyName.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0).toUpperCase() ||
                      FALLBACK_INITIAL}
                  </span>
                )}
              </span>

              <div className={heroStyles.identityText}>
                <div className={heroStyles.identityNameRow}>
                  <h1 className={`${heroStyles.headline} ${heroStyles.headlineProfile}`}>
                    {agencyName}
                  </h1>
                  {/* The chip is only rendered for an actual partner -
                      PartnerBadge itself renders nothing otherwise, which
                      would leave an empty white disc beside the name. */}
                  {isPartner && (
                    <span className={heroStyles.badgeChip}>
                      <PartnerBadge agency={agency} />
                    </span>
                  )}
                </div>
                {identityMeta && (
                  <p className={heroStyles.identityMeta}>
                    <svg
                      className={heroStyles.identityMetaIcon}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {identityMeta}
                  </p>
                )}
              </div>
            </div>

            {agency?.description && <p className={heroStyles.subhead}>{agency.description}</p>}

            {(agency?.website || agency?.profileUrl) && (
              <div className={heroStyles.actions}>
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
                    {SOURCE_LINK_PREFIX} {sourceLabel} {EXTERNAL_LINK_GLYPH}
                  </a>
                )}
              </div>
            )}

            {stats.length > 0 && (
              <div
                className={`${heroStyles.metaCard}${stats.length <= 2 ? ` ${heroStyles.metaCardCompact}` : ""}`}
              >
                {stats.map((stat, index) => (
                  <Fragment key={stat.label}>
                    {index > 0 && (
                      <span className={heroStyles.metaDivider} aria-hidden="true" />
                    )}
                    <AgencyStatItem {...stat} />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.section} data-section="directory-agency-body">
          <div className={styles.inner}>
            {verifiedNote && <p className={styles.verified}>{verifiedNote}</p>}

            {cards.length > 0 && (
              <div
                className={`${styles.columns}${cards.length === 1 ? ` ${styles.columnsSingle}` : ""}`}
              >
                <div className={styles.primaryColumn}>{primaryCard}</div>
                {asideCards.length > 0 && (
                  <div className={styles.asideColumn}>{asideCards}</div>
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
