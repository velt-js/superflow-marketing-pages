import Link from "next/link";
import CategoryGlyph from "@/components/shared-2026/CategoryGlyph";
import styles from "./UseCaseRelatedSection.module.css";
import type { UseCaseRelatedItem } from "@/lib/use-case-types";

/** Default heading when no other-use-case context requires an override. */
const DEFAULT_HEADING_LEAD = "Other ways in which";
const DEFAULT_HEADING_ACCENT = "Superflow can help";
/** Pixel size of each card's colourful category glyph. */
const GLYPH_SIZE = 32;
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
 * serif heading). Each card leads with a colourful Tabler glyph resolved from
 * its title (the CMS's flat white-stroke icons needed a dark chip to read on
 * light cards, so they are no longer used).
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
                  <span className={styles.iconGlyph} aria-hidden="true">
                    <CategoryGlyph label={item?.title} size={GLYPH_SIZE} />
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
