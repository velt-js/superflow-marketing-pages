import styles from "./ProductHuntBadge.module.css";

// Product Hunt launch badge.
//
// Every value below comes verbatim from the embed snippet Product Hunt
// generates on the post's "Get embed code" panel. They are kept together in
// this one module so a re-launch (new `post_id`, refreshed `t` cache-buster,
// different `theme`) is a single edit, and so both placements — the homepage
// hero and the sitewide floating badge — can never drift apart.

/** Destination post, including the UTM params Product Hunt attributes on. */
const PRODUCT_HUNT_POST_URL =
  "https://www.producthunt.com/products/superflow-webflow-plugin-for-revisions?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-superflow-ai";

/**
 * The badge artwork. Product Hunt renders this SVG on their side and bakes the
 * live rank/vote count into it, so it must stay a remote URL — a local copy
 * would freeze at whatever the counts were on the day it was downloaded.
 */
const PRODUCT_HUNT_BADGE_SRC =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1224615&theme=light&t=1787039424351";

const PRODUCT_HUNT_BADGE_ALT =
  "Superflow AI - AI agents that QA your website before launch | Product Hunt";

/** Intrinsic artwork size; supplied so the browser reserves the box and the badge never shifts layout. */
const BADGE_WIDTH = 250;
const BADGE_HEIGHT = 54;

/** Required on every `target="_blank"` link: severs the opener reference. */
const EXTERNAL_LINK_REL = "noopener noreferrer";

export interface ProductHuntBadgeProps {
  /**
   * Placement treatment:
   *  - "inline" (default): sits in normal flow, sized for the homepage hero's
   *    CTA panel.
   *  - "floating": pinned to the bottom-left of the viewport with a drop
   *    shadow, so it reads as a floating chip over page content.
   */
  variant?: "inline" | "floating";
}

/**
 * Renders the Product Hunt launch badge as an external link to the post.
 *
 * @param props - Optional placement overrides; defaults to the inline variant.
 * @returns The badge anchor, or `null` if rendering throws.
 */
export default function ProductHuntBadge({
  variant = "inline",
}: ProductHuntBadgeProps = {}) {
  try {
    const variantClass =
      variant === "floating" ? styles.floating : styles.inline;

    return (
      <a
        className={`${styles.badge} ${variantClass}`}
        href={PRODUCT_HUNT_POST_URL}
        target="_blank"
        rel={EXTERNAL_LINK_REL}
      >
        {/* A plain <img>, not next/image: the source is a remote SVG whose
            contents change as votes come in, so there is nothing for the
            image optimizer to cache usefully. Matches the raw <img> usage
            already in components/home/TrustedLogos.tsx. */}
        <img
          className={styles.image}
          src={PRODUCT_HUNT_BADGE_SRC}
          alt={PRODUCT_HUNT_BADGE_ALT}
          width={BADGE_WIDTH}
          height={BADGE_HEIGHT}
        />
      </a>
    );
  } catch (err) {
    // Defensive: a launch badge must never be able to take a page down.
    console.error("ProductHuntBadge render failed:", err);
    return null;
  }
}
