import Image from "next/image";
import styles from "./UseCaseSolutionSection.module.css";
import type { UseCaseSolutionSection as UseCaseSolutionSectionData } from "@/lib/use-case-types";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "use-case-solution-heading";

/** Props for the {@link UseCaseSolutionSection} component. */
export interface UseCaseSolutionSectionProps {
  /** The doc's `solutionSection` object (title1/title2 + up to 3 items). */
  section: UseCaseSolutionSectionData;
}

/**
 * Light-theme, 2026-styled restyle of the old dark `UseCaseSolution` section:
 * a serif two-tone heading followed by alternating image/copy rows, each
 * image sitting on the shared 2026 card idiom (hairline border, soft shadow).
 *
 * @param props.section - The solution-section copy and items.
 */
export default function UseCaseSolutionSection({
  section,
}: UseCaseSolutionSectionProps) {
  try {
    const items = section?.items ?? [];
    const hasHeading = Boolean(section?.title1 ?? section?.title2);
    if (items.length === 0 && !hasHeading) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="use-case-solution"
        aria-labelledby={hasHeading ? HEADING_ID : undefined}
      >
        <div className={styles.inner}>
          {hasHeading ? (
            <h2 id={HEADING_ID} className={styles.heading}>
              {section?.title1}
              {section?.title1 && section?.title2 ? " " : ""}
              {section?.title2 ? (
                <span className={styles.headingAccent}>{section.title2}</span>
              ) : null}
            </h2>
          ) : null}
          {items.length > 0 ? (
            <div className={styles.rows}>
              {items.map((item, index) => {
                const isReversed = index % 2 === 1;
                const rowClassName = isReversed
                  ? `${styles.row} ${styles.rowReversed}`
                  : styles.row;
                return (
                  <div key={item?.title ?? index} className={rowClassName}>
                    {item?.image ? (
                      <div className={styles.rowMedia}>
                        <Image
                          className={styles.rowImage}
                          src={item.image}
                          alt={item?.title ?? ""}
                          fill
                          sizes="(min-width: 860px) 50vw, 100vw"
                        />
                      </div>
                    ) : null}
                    <div className={styles.rowCopy}>
                      {item?.title ? (
                        <h3 className={styles.rowTitle}>{item.title}</h3>
                      ) : null}
                      {item?.subCopy ? (
                        <p className={styles.rowSubCopy}>{item.subCopy}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
