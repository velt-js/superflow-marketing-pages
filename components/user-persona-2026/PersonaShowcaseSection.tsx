import Image from "next/image";
import styles from "./PersonaShowcaseSection.module.css";
import SectionArtifact from "@/components/shared-2026/SectionArtifact";
import { resolveSectionArtifact } from "@/lib/section-artifacts";
import type { PersonaShowcaseContent } from "./adapter";

/** Stable id linking the section to its heading for a11y. */
const HEADING_ID = "persona-showcase-heading";

/** Height ÷ width of the showcase frame (`.frame`'s 1200 / 700). */
const FRAME_ASPECT = 700 / 1200;

/** Props for {@link PersonaShowcaseSection}. */
export interface PersonaShowcaseSectionProps {
  content: PersonaShowcaseContent;
}

/**
 * "Showcase/solution" section — the persona's `solutionTitle1`/`solutionTitle2`
 * heading above a large framed product image, on a light 2026 section.
 *
 * @param props - The resolved heading + showcase image.
 */
export default function PersonaShowcaseSection({
  content,
}: PersonaShowcaseSectionProps) {
  try {
    const heading = content?.heading;
    const highlight = content?.highlight;
    const image = content?.image;
    const imageAlt = content?.imageAlt ?? "";
    // Prefer a hand-built product artifact (explicit CMS pick or keyword
    // match on the section copy) over the raw Framer bitmap.
    const artifact = resolveSectionArtifact(
      content?.artifact,
      heading,
      highlight,
    );

    if (!heading && !image && !artifact) {
      return null;
    }

    return (
      <section
        className={styles.section}
        data-section="persona-showcase"
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

          {artifact ? (
            <div className={styles.frame}>
              <SectionArtifact artifact={artifact} aspect={FRAME_ASPECT} />
            </div>
          ) : image ? (
            <div className={styles.frame}>
              <Image
                className={styles.frameImage}
                src={image}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 1200px, 100vw"
              />
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
