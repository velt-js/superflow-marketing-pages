import Image from "next/image";
import styles from "./PersonaProblemSection.module.css";
import type { PersonaProblemContent } from "./adapter";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "persona-problem-heading";

/** Props for {@link PersonaProblemSection}. */
export interface PersonaProblemSectionProps {
  content: PersonaProblemContent;
}

/**
 * "Problem" section — a light-theme restyle of the persona's first job:
 * a serif heading (job title1/title2) above up to three highlight cards
 * (highlightTitle/highlightSubText/highlightImage), using the 2026 card idiom
 * from `components/feature-2026/RelatedCapabilities.tsx`.
 *
 * @param props - The resolved heading + highlight cards.
 */
export default function PersonaProblemSection({
  content,
}: PersonaProblemSectionProps) {
  try {
    const heading = content?.heading;
    const highlight = content?.highlight;
    const cards = content?.cards ?? [];

    if (!heading && cards.length === 0) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="persona-problem"
        aria-labelledby={HEADING_ID}
      >
        <div className={styles.inner}>
          {heading ? (
            <h2 id={HEADING_ID} className={styles.heading}>
              {heading}
              {highlight ? (
                <>
                  {" "}
                  <span className={styles.headingHighlight}>{highlight}</span>
                </>
              ) : null}
            </h2>
          ) : null}

          {cards.length > 0 ? (
            <ul className={styles.grid}>
              {cards.map((card) => (
                <li key={card.title || card.image} className={styles.item}>
                  <article className={styles.card}>
                    <div className={styles.media}>
                      <Image
                        className={styles.mediaImage}
                        src={card.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, 100vw"
                      />
                    </div>
                    <div className={styles.cardText}>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      <p className={styles.cardDesc}>{card.description}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
