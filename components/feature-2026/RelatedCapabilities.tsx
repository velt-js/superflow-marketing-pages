import type { ReactNode } from "react";
import styles from "./RelatedCapabilities.module.css";
import {
  FeatureSetIcon,
  type FeatureSetIconName,
} from "@/components/home-2026/FeatureSetIcons";

/** Default section heading when the CMS omits one. */
const DEFAULT_HEADING = "Related capabilities";
/** Mono eyebrow above the heading. */
const KICKER = "Keep exploring";
/** Fallback glyph for an item that omits an explicit icon. */
const DEFAULT_ICON: FeatureSetIconName = "grain";
/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "related-capabilities-heading";

/** One related feature/page the reader can jump to from this section. */
export interface RelatedCapabilityItem {
  /** Card title, e.g. "Cross-device review". */
  title: string;
  /** One-line description of the related capability. */
  description: string;
  /** Destination page. */
  href: string;
  /** Optional {@link FeatureSetIconName}; falls back to {@link DEFAULT_ICON}. */
  icon?: FeatureSetIconName;
}

/** Props for the {@link RelatedCapabilities} section. */
export interface RelatedCapabilitiesProps {
  /** Section heading; defaults to {@link DEFAULT_HEADING}. */
  heading?: string;
  /** The related pages to surface. When empty the section renders nothing. */
  items?: readonly RelatedCapabilityItem[];
  /**
   * Optional boundary line rendered under the cards (no header of its own) —
   * clarifies where this capability's scope ends and a sibling's begins.
   */
  boundaryLine?: string;
}

/**
 * Related capabilities — a small "keep exploring" section of link cards that
 * cross-references sibling feature pages, with an optional scope-boundary line.
 * Feature-page chrome (only rendered when a page supplies `items`), so pages
 * that omit related capabilities are unaffected.
 *
 * @param props - The section heading, the related-page items and an optional
 *   boundary line.
 * @returns The section element, or `null` when no items are supplied.
 */
export default function RelatedCapabilities({
  heading,
  items,
  boundaryLine,
}: RelatedCapabilitiesProps): ReactNode {
  try {
    if (!items || items.length === 0) {
      return null;
    }

    const headingText = heading ?? DEFAULT_HEADING;

    return (
      <section
        className={styles.section}
        data-section="related-capabilities"
        aria-labelledby={HEADING_ID}
      >
        <div className={styles.inner}>
          <p className={styles.kicker}>{KICKER}</p>
          <h2 id={HEADING_ID} className={styles.heading}>
            {headingText}
          </h2>

          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={item?.href ?? item?.title} className={styles.item}>
                <a className={styles.card} href={item?.href ?? "#"}>
                  <span className={styles.icon} aria-hidden="true">
                    <FeatureSetIcon name={item?.icon ?? DEFAULT_ICON} size={24} />
                  </span>
                  <span className={styles.cardText}>
                    <span className={styles.cardTitle}>{item?.title}</span>
                    <span className={styles.cardDesc}>{item?.description}</span>
                  </span>
                  <span className={styles.arrow} aria-hidden="true">
                    <FeatureSetIcon name="arrow-right" size={20} />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {boundaryLine ? (
            <p className={styles.boundary}>{boundaryLine}</p>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
