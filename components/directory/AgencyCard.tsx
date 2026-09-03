import Image from "next/image";
import Link from "next/link";

import {
  agencyPath,
  formatAgencyLocation,
  getAwardBreakdown,
  resolveAgencySourceLabel,
} from "@/lib/directory/agencies";
import PartnerBadge from "./PartnerBadge";
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
      <article
        className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] border-2 border-[#f7f7f7] bg-[#f7f7f7] p-6 transition-colors hover:border-[#111] hover:bg-white lg:p-7"
      >
        <Link
          href={agencyPath(agency?.slug ?? "")}
          className="-m-1 flex items-start gap-3 rounded-[12px] p-1 transition-colors hover:bg-black/[0.04]"
        >
          {agency?.logoUrl && (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-white">
              <Image
                src={agency.logoUrl}
                alt=""
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="truncate text-black"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 20,
                  letterSpacing: "-0.03em",
                }}
              >
                {agency?.name ?? "Unnamed agency"}
              </h3>
              <PartnerBadge agency={agency} />
            </div>
            {locationLabel && (
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontSize: 14,
                  color: "rgba(10,10,10,0.55)",
                }}
              >
                {locationLabel}
              </p>
            )}
          </div>
        </Link>

        {agency?.description && (
          <p
            className="line-clamp-2 text-black"
            style={{ fontFamily: "var(--font-urbanist)", fontSize: 14, lineHeight: 1.5 }}
          >
            {agency.description}
          </p>
        )}

        {servicesLine && (
          <p
            className="line-clamp-1"
            style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, color: "rgba(10,10,10,0.5)" }}
          >
            {servicesLine}
          </p>
        )}

        {awardTotal > 0 && (
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-black"
              style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: 16 }}
            >
              {awardTotal}
            </span>
            <span style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, color: "rgba(10,10,10,0.55)" }}>
              award{awardTotal === 1 ? "" : "s"}
              {topAward ? ` · ${topAward.count}x ${topAward.label}` : ""}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/10 pt-4">
          {agency?.teamSize ? (
            <span
              style={{ fontFamily: "var(--font-urbanist)", fontSize: 12, color: "rgba(10,10,10,0.55)" }}
            >
              Team: {agency.teamSize}
            </span>
          ) : (
            <span />
          )}
          <div className="flex min-w-0 shrink-0 flex-col items-end gap-1">
            {agency?.website && (
              <a
                href={agency.website}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-full truncate text-black underline underline-offset-2"
                style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, fontWeight: 600 }}
              >
                {websiteLabel} {EXTERNAL_LINK_GLYPH}
              </a>
            )}
            {agency?.profileUrl && (
              <a
                href={agency.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap underline underline-offset-2"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontSize: 12,
                  color: "rgba(10,10,10,0.55)",
                }}
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
