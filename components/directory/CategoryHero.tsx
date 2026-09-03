import type { AgencyListStats } from "@/lib/directory/agencies";
import type { DirectoryCategory } from "@/lib/directory/types";

/** Eyebrow label above the H1, orienting a visitor inside /directory
 *  before they read the category-specific heading. */
const EYEBROW_LABEL = "Agency directory";

/** One number+label pair in the stat row, e.g. "43 agencies". */
function StatItem({ value, label }: { value: number; label: string }) {
  try {
    return (
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-black"
          style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: 20 }}
        >
          {value}
        </span>
        <span style={{ fontFamily: "var(--font-urbanist)", fontSize: 14, color: "rgba(10,10,10,0.55)" }}>
          {label}
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Header for a directory category page. Deliberately its own component
 * rather than reusing the shared marketing `ListingHero`
 * (components/listing/ListingHero.tsx): that component's dark hero,
 * "Photographer"/"Designer" cursor decorations, and generic "Try
 * Superflow for Free" CTA + customer logo bar are built for conversion
 * landing pages, and read as a mismatch on a reference/browse page like
 * this one. A lighter, data-forward header - heading, subheading, and a
 * live stat row - fits a directory better and removes an awkward
 * light-dark-light seam between this section and the white agency grid
 * directly below it.
 *
 * @param props - Component props.
 * @param props.category - The category being rendered.
 * @param props.stats - Agency/country/partner counts for the stat row,
 *                       derived from the data (see `buildAgencyListStats`)
 *                       - never hardcoded.
 */
export default function CategoryHero({
  category,
  stats,
}: {
  category: DirectoryCategory;
  stats: AgencyListStats;
}) {
  try {
    return (
      <section className="bg-white pt-[120px] pb-[48px] lg:pt-[160px] lg:pb-[64px]">
        <div className="container-page">
          <div className="flex max-w-[720px] flex-col gap-4">
            <span
              className="w-fit rounded-[var(--radius-pill)] px-3 py-1"
              style={{
                fontFamily: "var(--font-urbanist)",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(10,10,10,0.6)",
                background: "rgba(10,10,10,0.05)",
              }}
            >
              {EYEBROW_LABEL}
            </span>
            <h1
              className="text-black"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
                fontSize: "clamp(32px, 4.5vw, 48px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              {category?.heading}
            </h1>
            <p style={{ fontFamily: "var(--font-urbanist)", fontSize: 17, lineHeight: 1.6, color: "rgba(10,10,10,0.65)" }}>
              {category?.subheading}
            </p>
          </div>

          {stats?.agencyCount > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-black/10 pt-6">
              <StatItem value={stats.agencyCount} label={stats.agencyCount === 1 ? "agency" : "agencies"} />
              {stats.countryCount > 0 && (
                <StatItem value={stats.countryCount} label={stats.countryCount === 1 ? "country" : "countries"} />
              )}
              {stats.partnerCount > 0 && (
                <StatItem value={stats.partnerCount} label="Superflow partners" />
              )}
            </div>
          )}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
