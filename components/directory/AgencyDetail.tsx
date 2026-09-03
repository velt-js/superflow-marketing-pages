import Image from "next/image";
import Link from "next/link";

import { formatAgencyLocation, getAwardBreakdown, resolveAgencySourceLabel } from "@/lib/directory/agencies";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import PartnerBadge from "./PartnerBadge";
import type { Agency, DirectoryCategory } from "@/lib/directory/types";

/** Trailing glyph on outbound links, marking them as leaving the site. */
const EXTERNAL_LINK_GLYPH = "↗";

/** Label for the primary outbound call-to-action when a website is on
 *  record. */
const WEBSITE_CTA_LABEL = "Visit website";

/** Copy shown in the facts panel when no team size was recorded. */
const UNKNOWN_TEAM_SIZE_LABEL = "Not listed";

/** Heading for the breadcrumb root, matching the hub page's H1 intent. */
const DIRECTORY_ROOT_LABEL = "Directory";

/**
 * Breadcrumb trail rendered above the agency name: Directory -> category
 * (when known) -> agency name. A visible companion to the BreadcrumbList
 * JSON-LD emitted by the page - screen readers and crawlers both get the
 * same hierarchy.
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
      <nav aria-label="Breadcrumb" className="mb-[24px]">
        <ol
          className="flex flex-wrap items-center gap-2"
          style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, color: "rgba(10,10,10,0.55)" }}
        >
          <li>
            <Link href={DIRECTORY_BASE_PATH} className="hover:underline">
              {DIRECTORY_ROOT_LABEL}
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`${DIRECTORY_BASE_PATH}/${category.slug}`} className="hover:underline">
                  {category.title}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="truncate text-black" style={{ maxWidth: 240 }}>
            {agencyName}
          </li>
        </ol>
      </nav>
    );
  } catch {
    return null;
  }
}

/** One row in the facts panel, e.g. "Team size — 11-50". Hidden entirely
 *  by the caller when the underlying value is absent. */
function FactRow({ label, value }: { label: string; value: string }) {
  try {
    return (
      <div className="flex flex-col gap-1">
        <span style={{ fontFamily: "var(--font-urbanist)", fontSize: 12, color: "rgba(10,10,10,0.5)" }}>
          {label}
        </span>
        <span className="text-black" style={{ fontFamily: "var(--font-urbanist)", fontSize: 15, fontWeight: 600 }}>
          {value}
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Full-content body of an agency detail page: breadcrumb, header,
 * description, full award breakdown, services, and a facts/CTA panel
 * with the outbound website and attribution links.
 *
 * Deliberately holds more than `AgencyCard` shows on the category grid -
 * the detail page needs to justify its own existence with real content,
 * not just repeat the card.
 *
 * @param props - Component props.
 * @param props.agency - The agency to render.
 * @param props.category - The agency's primary category, if resolvable,
 *                          used for the breadcrumb and facts panel.
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
    const sourceLabel = resolveAgencySourceLabel(agency?.source);
    const agencyName = agency?.name ?? "Unnamed agency";

    return (
      <section className="bg-white pt-[120px] pb-[64px] lg:pt-[160px] lg:pb-[80px]">
        <div className="container-page">
          <Breadcrumb agencyName={agencyName} category={category} />

          <header className="mb-[40px] flex flex-col gap-4 sm:flex-row sm:items-center">
            {agency?.logoUrl && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border border-black/10 bg-white">
                <Image src={agency.logoUrl} alt="" fill sizes="64px" className="object-contain" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-black"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                  }}
                >
                  {agencyName}
                </h1>
                <PartnerBadge agency={agency} />
              </div>
              {locationLabel && (
                <p style={{ fontFamily: "var(--font-urbanist)", fontSize: 16, color: "rgba(10,10,10,0.6)" }}>
                  {locationLabel}
                </p>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-8">
              {agency?.description && (
                <p
                  className="text-black"
                  style={{ fontFamily: "var(--font-urbanist)", fontSize: 17, lineHeight: 1.7 }}
                >
                  {agency.description}
                </p>
              )}

              {services.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2
                    className="text-black"
                    style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 18 }}
                  >
                    Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center rounded-[var(--radius-pill)] border border-black/10 px-3 py-1.5 text-black"
                        style={{ fontFamily: "var(--font-urbanist)", fontSize: 13 }}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {awardBreakdown.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2
                    className="text-black"
                    style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 18 }}
                  >
                    Award record
                  </h2>
                  <ul className="flex flex-col divide-y divide-black/10 rounded-[var(--radius-card)] border border-black/10">
                    {awardBreakdown.map((entry) => (
                      <li
                        key={entry.label}
                        className="flex items-center justify-between px-4 py-3 text-black"
                        style={{ fontFamily: "var(--font-urbanist)", fontSize: 14 }}
                      >
                        <span>{entry.label}</span>
                        <span style={{ fontWeight: 600 }}>{entry.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="flex h-fit flex-col gap-6 rounded-[var(--radius-card)] border border-black/10 bg-[#f7f7f7] p-6">
              {agency?.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-black px-4 py-3 text-center text-white transition-colors hover:bg-black/85"
                  style={{ fontFamily: "var(--font-poppins)", fontSize: 14, fontWeight: 600 }}
                >
                  {WEBSITE_CTA_LABEL} {EXTERNAL_LINK_GLYPH}
                </a>
              )}

              <div className="flex flex-col gap-4">
                <FactRow label="Team size" value={agency?.teamSize ?? UNKNOWN_TEAM_SIZE_LABEL} />
                {awardTotal > 0 && (
                  <FactRow label="Total awards" value={`${awardTotal}`} />
                )}
                {category && <FactRow label="Category" value={category.title} />}
              </div>

              {agency?.profileUrl && (
                <a
                  href={agency.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline underline-offset-2"
                  style={{ fontFamily: "var(--font-urbanist)", fontSize: 13, fontWeight: 600 }}
                >
                  {sourceLabel} {EXTERNAL_LINK_GLYPH}
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
