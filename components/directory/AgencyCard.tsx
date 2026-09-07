import Image from "next/image";
import Link from "next/link";

import {
  agencyPath,
  formatAgencyLocation,
  getAwardBreakdown,
  resolveAgencySourceLabel,
} from "@/lib/directory/agencies";
import PartnerBadge from "./PartnerBadge";
import styles from "./AgencyCard.module.css";
import type { Agency } from "@/lib/directory/types";

/** Maximum number of services listed before collapsing into a "+N". */
const MAX_VISIBLE_SERVICES = 4;

/** Separator between service names in the card's single-line summary. */
const SERVICES_SEPARATOR = " · ";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Shown as the website link text when a record has a URL but no parsed
 *  domain, so the link never renders with an empty label. */
const FALLBACK_WEBSITE_LABEL = "Visit site";

/**
 * Resolves the visible label for an agency's own website link. Prefers the
 * bare domain over the full URL: it is shorter, and it tells the visitor
 * where the link goes before they click it.
 *
 * @param agency - The agency record to label.
 * @returns The domain, or a generic fallback when none was parsed.
 */
function resolveWebsiteLabel(agency: Agency | null | undefined): string {
  try {
    const domain = agency?.domain?.trim();
    return domain && domain.length > 0 ? domain : FALLBACK_WEBSITE_LABEL;
  } catch {
    return FALLBACK_WEBSITE_LABEL;
  }
}

/**
 * Splits a service list into the chips to render and an overflow count,
 * so the card stays a predictable height regardless of how many services
 * a source profile lists.
 *
 * @param services - Free-text services as listed on the source profile.
 * @param limit - Maximum chips to show before collapsing the rest.
 * @returns The visible services and how many more were hidden.
 */
function visibleServices(
  services: string[] | null | undefined,
  limit: number,
): { shown: string[]; hiddenCount: number } {
  try {
    const all = services?.filter((service) => Boolean(service?.trim())) ?? [];
    return {
      shown: all.slice(0, limit),
      hiddenCount: Math.max(0, all.length - limit),
    };
  } catch {
    return { shown: [], hiddenCount: 0 };
  }
}

/**
 * Award labels in the order they make the best one-line card headline.
 *
 * Two rejected orderings, recorded so this isn't "fixed" back to either:
 *
 * - By count: Honorable Mentions dominate every breakdown, so this
 *   surfaced "131x Honorable Mention" for a studio that had also won Site
 *   of the Year - leading with its weakest credential.
 * - By prestige (Site of the Year first): technically correct but every
 *   top studio holds one, so every card read "1x Site of the Year" and
 *   the stat stopped distinguishing anyone.
 *
 * Site of the Day leads instead: it is Awwwards' flagship award, the most
 * recognisable to a visitor, and its count varies widely across studios,
 * so it adds information the adjacent total doesn't already convey.
 */
const AWARD_LABELS_BY_HEADLINE_PRIORITY: readonly string[] = [
  "Site of the Day",
  "Site of the Year",
  "Site of the Month",
  "Developer Award",
  "Honorable Mention",
  "Nominee",
];

/**
 * Picks the award that best headlines this agency, for the card's
 * one-line summary. See AWARD_LABELS_BY_HEADLINE_PRIORITY.
 *
 * Falls back to the highest-count entry if no label matches the priority
 * list, so a future source introducing an unknown award type still renders
 * something sensible rather than nothing.
 *
 * @param breakdown - Non-zero award-type entries for one agency.
 * @returns The highest-priority entry, or null for an empty breakdown.
 */
function pickTopAward(
  breakdown: Array<{ label: string; count: number }>,
): { label: string; count: number } | null {
  try {
    if (!breakdown || breakdown.length === 0) return null;
    for (const label of AWARD_LABELS_BY_HEADLINE_PRIORITY) {
      const match = breakdown.find((entry) => entry?.label === label);
      if (match) return match;
    }
    return breakdown.reduce((best, entry) => (entry.count > best.count ? entry : best));
  } catch {
    return null;
  }
}

/**
 * Card for a single agency in a directory category grid. Leads with the
 * agency name (and partner badge, if applicable) - award record and
 * services are supporting detail, deliberately styled to read quieter
 * than the name rather than compete with it.
 *
 * The name/logo header links to the agency's own directory detail page
 * (/directory/agency/<slug>), which holds the full profile - full award
 * breakdown and service list included, this card only summarizes both.
 * The footer carries the two outbound links separately: the agency's own
 * website and an attribution link back to the source profile the record
 * was collected from - both keep working independently of the internal
 * link above.
 *
 * @param props - Component props.
 * @param props.agency - The agency record to render.
 */
export default function AgencyCard({ agency }: { agency: Agency }) {
  try {
    const locationLabel = formatAgencyLocation(agency?.location ?? null);
    const awardBreakdown = getAwardBreakdown(agency?.awards);
    const topAward = pickTopAward(awardBreakdown);
    const { shown: shownServices, hiddenCount } = visibleServices(
      agency?.services,
      MAX_VISIBLE_SERVICES,
    );
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const websiteLabel = resolveWebsiteLabel(agency);
    const awardTotal = agency?.awards?.total ?? 0;
    const servicesLine =
      shownServices.length > 0
        ? shownServices.join(SERVICES_SEPARATOR) + (hiddenCount > 0 ? ` +${hiddenCount} more` : "")
        : null;

    return (
      <article className={styles.card}>
        <Link href={agencyPath(agency?.slug ?? "")} className={styles.header}>
          {agency?.logoUrl && (
            <div className={styles.logo}>
              <Image
                className={styles.logoImage}
                src={agency.logoUrl}
                alt=""
                fill
                sizes="44px"
              />
            </div>
          )}
          <div className={styles.headerText}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{agency?.name ?? "Unnamed agency"}</h3>
              <PartnerBadge agency={agency} />
            </div>
            {locationLabel && <p className={styles.location}>{locationLabel}</p>}
          </div>
        </Link>

        {agency?.description && (
          <p className={styles.description}>{agency.description}</p>
        )}

        {servicesLine && <p className={styles.services}>{servicesLine}</p>}

        {awardTotal > 0 && (
          <p className={styles.awards}>
            <span className={styles.awardCount}>{awardTotal}</span>
            <span className={styles.awardLabel}>
              award{awardTotal === 1 ? "" : "s"}
              {topAward ? ` \u00b7 ${topAward.count}x ${topAward.label}` : ""}
            </span>
          </p>
        )}

        <div className={styles.footer}>
          {agency?.teamSize ? (
            <span className={styles.teamSize}>Team: {agency.teamSize}</span>
          ) : (
            <span />
          )}
          <div className={styles.links}>
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
            {agency?.profileUrl && (
              <a
                href={agency.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                {sourceLabel} {EXTERNAL_LINK_GLYPH}
              </a>
            )}
          </div>
        </div>
      </article>
    );
  } catch {
    return null;
  }
}
