import Image from "next/image";
import styles from "./PersonaFeatureRows.module.css";
import SectionArtifact from "@/components/shared-2026/SectionArtifact";
import { resolveSectionArtifact } from "@/lib/section-artifacts";
import type { PersonaFeatureRow } from "./adapter";

/** Height ÷ width of the row media box (`.media`'s 560 / 360 aspect-ratio). */
const ROW_MEDIA_ASPECT = 360 / 560;

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
            // Prefer a hand-built product artifact (explicit CMS pick or
            // keyword match on the copy) over the raw Framer bitmap.
            const artifact = resolveSectionArtifact(
              row?.artifact,
              row?.title,
              row?.description,
            );

            return (
              <article key={row.title || row.image} className={rowClassName}>
                <div className={styles.text}>
                  <h3 className={styles.title}>{row.title}</h3>
                  <p className={styles.description}>{row.description}</p>
                </div>
                <div className={styles.media}>
                  {artifact ? (
                    <SectionArtifact
                      artifact={artifact}
                      aspect={ROW_MEDIA_ASPECT}
                    />
                  ) : (
                    <Image
                      className={styles.mediaImage}
                      src={row.image}
                      alt={row.imageAlt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                    />
                  )}
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
