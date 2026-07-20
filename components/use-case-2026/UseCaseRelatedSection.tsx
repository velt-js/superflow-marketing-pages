import Image from "next/image";
import Link from "next/link";
import styles from "./UseCaseRelatedSection.module.css";
import type { UseCaseRelatedItem } from "@/lib/use-case-types";

/** Default heading when no other-use-case context requires an override. */
const DEFAULT_HEADING_LEAD = "Other ways in which";
const DEFAULT_HEADING_ACCENT = "Superflow can help";
/** Fallback icon (light stroke, matches the dark chip it's rendered on). */
const DEFAULT_ICON_SRC = "/images/hero/icon-world.svg";
/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "use-case-related-heading";

/** Props for the {@link UseCaseRelatedSection} component. */
export interface UseCaseRelatedSectionProps {
  /** Sibling use-case pages to cross-link. Renders nothing when empty. */
  items: UseCaseRelatedItem[];
}

/**
 * Related use cases — a card grid of sibling use-case pages, styled after the
 * canonical 2026 `RelatedCapabilities` idiom (hairline border, hover lift,
 * serif heading). Each item's icon sits inside a dark chip because the
 * source SVGs ship light/white-stroke, designed for dark backgrounds.
 *
 * @param props.items - The related use-case cross-links to render.
 */
export default function UseCaseRelatedSection({
  items,
}: UseCaseRelatedSectionProps) {
  try {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="use-case-related"
        aria-labelledby={HEADING_ID}
      >
        <div className={styles.inner}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {DEFAULT_HEADING_LEAD}{" "}
            <span className={styles.headingAccent}>
              {DEFAULT_HEADING_ACCENT}
            </span>
          </h2>

          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={item?.href ?? item?.title} className={styles.item}>
                <Link className={styles.card} href={item?.href ?? "#"}>
                  <span className={styles.iconChip} aria-hidden="true">
                    <Image
                      className={styles.icon}
                      src={item?.icon ?? DEFAULT_ICON_SRC}
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                  <span className={styles.cardText}>
                    <span className={styles.cardTitle}>{item?.title}</span>
                    <span className={styles.cardDesc}>
                      {item?.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
