import Image from "next/image";
import styles from "./UseCaseProblemSection.module.css";
import type { UseCaseProblemSection as UseCaseProblemSectionData } from "@/lib/use-case-types";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "use-case-problem-heading";

/** Props for the {@link UseCaseProblemSection} component. */
export interface UseCaseProblemSectionProps {
  /** The doc's `problemSection` object (title1/title2 + up to 3 items). */
  section: UseCaseProblemSectionData;
  /** The doc's `explanationTitle`, rendered as a mono kicker above the heading. */
  explanationTitle?: string;
}

/**
 * Light-theme, 2026-styled restyle of the old dark `UseCaseProblem` section:
 * an optional mono kicker, a serif two-tone heading, and a card grid of the
 * doc's problem items (image + one-line title) using the
 * `RelatedCapabilities` card idiom (white card, hairline border, hover lift).
 *
 * @param props.section - The problem-section copy and items.
 * @param props.explanationTitle - Optional kicker shown above the heading.
 */
export default function UseCaseProblemSection({
  section,
  explanationTitle,
}: UseCaseProblemSectionProps) {
  try {
    const items = section?.items ?? [];
    const hasHeading = Boolean(section?.title1 ?? section?.title2);
    if (items.length === 0 && !hasHeading && !explanationTitle) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="use-case-problem"
        aria-labelledby={hasHeading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          {explanationTitle ? (
            <p className={styles.kicker}>{explanationTitle}</p>
          ) : null}
          {hasHeading ? (
            <h2 id={HEADING_ID} className={styles.heading}>
              {section?.title1}
              {section?.title1 && section?.title2 ? " " : ""}
              {section?.title2 ? (
                <span className={styles.headingMuted}>{section.title2}</span>
              ) : null}
            </h2>
          ) : null}
          {items.length > 0 ? (
            <ul className={styles.grid}>
              {items.map((item, index) => (
                <li key={item?.title ?? index} className={styles.card}>
                  {item?.image ? (
                    <div className={styles.cardImageFrame}>
                      <Image
                        className={styles.cardImage}
                        src={item.image}
                        alt={item?.title ?? ""}
                        fill
                        sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  {item?.title ? (
                    <p className={styles.cardTitle}>{item.title}</p>
                  ) : null}
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
