import Image from "next/image";
import styles from "./PersonaFeatureRows.module.css";
import type { PersonaFeatureRow } from "./adapter";

/** Props for {@link PersonaFeatureRows}. */
export interface PersonaFeatureRowsProps {
  rows: PersonaFeatureRow[];
}

/**
 * Feature-rows section — `doc.features` rendered as alternating image/text
 * rows on a light 2026 section, each row's image swapping sides so the eye
 * zig-zags down the page.
 *
 * @param props - The resolved feature rows.
 */
export default function PersonaFeatureRows({ rows }: PersonaFeatureRowsProps) {
  try {
    if (!rows || rows.length === 0) {
      return null;
    }

    return (
      <section className={styles.section} data-section="persona-features">
        <div className={styles.inner}>
          {rows.map((row, index) => {
            const isReversed = index % 2 === 1;
            const rowClassName = isReversed
              ? `${styles.row} ${styles.rowReversed}`
              : styles.row;

            return (
              <article key={row.title || row.image} className={rowClassName}>
                <div className={styles.text}>
                  <h3 className={styles.title}>{row.title}</h3>
                  <p className={styles.description}>{row.description}</p>
                </div>
                <div className={styles.media}>
                  <Image
                    className={styles.mediaImage}
                    src={row.image}
                    alt={row.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 560px, 100vw"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
