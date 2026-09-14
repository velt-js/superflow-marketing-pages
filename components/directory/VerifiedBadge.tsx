import { VERIFIED_BADGE_DESCRIPTION, VERIFIED_BADGE_LABEL } from "@/lib/directory/constants";
import styles from "./VerifiedBadge.module.css";

/**
 * The badge on a listing an agency claimed and domain-verified.
 *
 * Unlike the Superflow partner mark next to it, this one PAINTS ITS
 * LABEL rather than rendering icon-only with a tooltip. Two reasons, and
 * they are the same reason from different directions:
 *
 *   * A bare tick beside a company name is read by most people as
 *     "identity verified by a trusted authority", which is a much bigger
 *     claim than the one being made. The word "Verified" next to a
 *     tooltip that says what was actually checked is narrower than the
 *     tick on its own.
 *   * Founders filter on this. A filter's result has to be visible on the
 *     card without hovering anything, or the filter appears not to work.
 *
 * `title` carries the full claim for a mouse, and `aria-label` for a
 * screen reader. Deliberately NOT interactive - it opens nothing, so it
 * needs no tap target and no keyboard handling, which is what makes it
 * safe to sit inside the card-wide link.
 */
export default function VerifiedBadge() {
  try {
    return (
      <span
        className={styles.badge}
        title={VERIFIED_BADGE_DESCRIPTION}
        aria-label={`${VERIFIED_BADGE_LABEL}. ${VERIFIED_BADGE_DESCRIPTION}`}
      >
        <svg
          className={styles.mark}
          viewBox="0 0 16 16"
          width="12"
          height="12"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M6.4 11.2 3.6 8.4l1-1 1.8 1.8 4.9-4.9 1 1z"
            fill="currentColor"
          />
        </svg>
        {VERIFIED_BADGE_LABEL}
      </span>
    );
  } catch {
    return null;
  }
}
