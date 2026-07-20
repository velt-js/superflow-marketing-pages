import Link from "next/link";
import styles from "./RelatedPersonas.module.css";
import PersonaIconChip from "./PersonaIconChip";
import type { PersonaRelatedContent } from "./adapter";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "persona-related-heading";
/** Chip diameter for each sibling persona's icon. */
const CHIP_SIZE = 48;

/** Props for {@link RelatedPersonas}. */
export interface RelatedPersonasProps {
  content: PersonaRelatedContent;
}

/**
 * "Related personas" section — a card grid cross-linking sibling
 * `/user-persona/<slug>` pages, in the 2026 `RelatedCapabilities` card idiom.
 * Sibling icons are light/white-stroke glyphs designed for dark surfaces, so
 * each renders inside a dark {@link PersonaIconChip} to stay legible on the
 * light card.
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
                  <PersonaIconChip
                    src={item?.icon}
                    name={item?.title ?? ""}
                    size={CHIP_SIZE}
                  />
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
