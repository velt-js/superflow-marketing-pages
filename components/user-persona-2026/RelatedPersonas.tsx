import Link from "next/link";
import CategoryGlyph from "@/components/shared-2026/CategoryGlyph";
import styles from "./RelatedPersonas.module.css";
import type { PersonaRelatedContent } from "./adapter";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "persona-related-heading";
/** Pixel size of each card's colourful persona glyph. */
const GLYPH_SIZE = 32;

/** Props for {@link RelatedPersonas}. */
export interface RelatedPersonasProps {
  content: PersonaRelatedContent;
}

/**
 * "Related personas" section — a card grid cross-linking sibling
 * `/user-persona/<slug>` pages, in the 2026 `RelatedCapabilities` card idiom.
 * Each card leads with a colourful Tabler glyph resolved from the persona's
 * title (the CMS's flat white-stroke icons needed a dark chip to read on
 * light cards, so they are no longer used).
 *
 * @param props - The resolved heading + sibling persona items.
 */
export default function RelatedPersonas({ content }: RelatedPersonasProps) {
  try {
    const items = content?.items ?? [];
    if (items.length === 0) {
      return null;
    }

    const heading = content?.heading;
    const highlight = content?.highlight;

    return (
      <section
        className={styles.section}
        data-section="related-personas"
        aria-labelledby={HEADING_ID}
      >
        <div className={styles.inner}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {heading}
            {highlight ? (
              <>
                {" "}
                <span className={styles.headingHighlight}>{highlight}</span>
              </>
            ) : null}
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
                    {item?.description ? (
                      <span className={styles.cardDesc}>{item.description}</span>
                    ) : null}
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
