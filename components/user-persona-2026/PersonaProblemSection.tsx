import Image from "next/image";
import styles from "./PersonaProblemSection.module.css";
import SectionArtifact from "@/components/shared-2026/SectionArtifact";
import { resolveSectionArtifact } from "@/lib/section-artifacts";
import type { PersonaProblemContent } from "./adapter";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "persona-problem-heading";

/** Height ÷ width of the card media box (`.media`'s 4 / 3 aspect-ratio). */
const CARD_MEDIA_ASPECT = 3 / 4;

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
              {cards.map((card) => {
                // Prefer a hand-built product artifact (explicit CMS pick or
                // keyword match on the copy) over the raw Framer bitmap.
                const artifact = resolveSectionArtifact(
                  card?.artifact,
                  card?.title,
                  card?.description,
                );
                return (
                  <li key={card.title || card.image} className={styles.item}>
                    <article className={styles.card}>
                      <div className={styles.media}>
                        {artifact ? (
                          <SectionArtifact
                            artifact={artifact}
                            aspect={CARD_MEDIA_ASPECT}
                          />
                        ) : (
                          <Image
                            className={styles.mediaImage}
                            src={card.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 320px, 100vw"
                          />
                        )}
                      </div>
                      <div className={styles.cardText}>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        <p className={styles.cardDesc}>{card.description}</p>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
