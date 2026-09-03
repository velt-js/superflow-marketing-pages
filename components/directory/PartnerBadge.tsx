import { PARTNER_BADGE_DESCRIPTION, PARTNER_BADGE_LABEL } from "@/lib/directory/constants";
import { isSuperflowPartner } from "@/lib/directory/agencies";
import type { Agency } from "@/lib/directory/types";

/**
 * "Superflow partner" pill, shown on both the category card and the
 * detail page for any agency present in lib/directory/data/partners.json
 * (joined by domain - see `isSuperflowPartner`). Renders nothing for a
 * non-partner, so call sites can render it unconditionally without an
 * `isSuperflowPartner(agency) &&` guard at every use.
 *
 * `PARTNER_BADGE_LABEL` reads "Superflow partner", not "Verified" - a
 * deliberate choice made where the constant is defined
 * (lib/directory/constants.ts): it attests a specific, checkable fact
 * (this agency uses Superflow) rather than implying we vetted the
 * agency's quality. Don't reword the label here; change the constant if
 * the copy ever needs to change, so both render sites stay in sync.
 * `title` carries `PARTNER_BADGE_DESCRIPTION` so the claim is legible on
 * hover/to screen readers rather than an unexplained checkmark.
 *
 * @param props - Component props.
 * @param props.agency - The agency to check and, if a partner, badge.
 */
export default function PartnerBadge({ agency }: { agency: Agency }) {
  try {
    if (!isSuperflowPartner(agency)) return null;

    return (
      <span
        className="inline-flex w-fit shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1"
        style={{
          fontFamily: "var(--font-urbanist)",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-superflow-cyan)",
          background: "color-mix(in srgb, var(--color-superflow-cyan) 14%, white)",
          border: "1px solid color-mix(in srgb, var(--color-superflow-cyan) 40%, transparent)",
        }}
        title={PARTNER_BADGE_DESCRIPTION}
        aria-label={`${PARTNER_BADGE_LABEL}. ${PARTNER_BADGE_DESCRIPTION}`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {PARTNER_BADGE_LABEL}
      </span>
    );
  } catch {
    return null;
  }
}
