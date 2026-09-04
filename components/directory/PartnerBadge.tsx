import { PARTNER_BADGE_DESCRIPTION, PARTNER_BADGE_LABEL } from "@/lib/directory/constants";
import { isSuperflowPartner } from "@/lib/directory/agencies";
import type { Agency } from "@/lib/directory/types";
import PartnerBadgeMark from "./PartnerBadgeMark";

/**
 * Superflow partner mark, shown on both the category card and the detail
 * page for any agency present in lib/directory/data/partners.json (joined
 * by domain - see `isSuperflowPartner`). Renders nothing for a non-partner,
 * so call sites can render it unconditionally without an
 * `isSuperflowPartner(agency) &&` guard at every use.
 *
 * This half stays a **server** component on purpose: it is the only half
 * that touches `lib/directory/agencies.ts`, whose module scope imports
 * `agencies.json`. Keeping the `"use client"` boundary down in
 * `PartnerBadgeMark` keeps the scraped dataset out of the browser bundle -
 * see that component's doc comment and app/directory/README.md.
 *
 * The mark is deliberately icon-only, with the claim carried by a tooltip
 * (hover, tap, or Enter/Space) rather than a visible label. That puts real
 * weight on the tooltip and on `aria-label`: a bare tick asserts nothing a
 * reader can check, and a verified-style mark is widely read as "identity
 * verified" rather than the narrower thing it means here (this agency uses
 * Superflow).
 *
 * Copy lives in lib/directory/constants.ts; change it there, not here, so
 * both render sites stay in sync.
 *
 * @param props - Component props.
 * @param props.agency - The agency to check and, if a partner, badge.
 */
export default function PartnerBadge({ agency }: { agency: Agency }) {
  try {
    if (!isSuperflowPartner(agency)) return null;

    return (
      <PartnerBadgeMark
        label={PARTNER_BADGE_LABEL}
        description={PARTNER_BADGE_DESCRIPTION}
      />
    );
  } catch {
    return null;
  }
}
