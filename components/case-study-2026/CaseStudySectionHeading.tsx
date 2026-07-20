import styles from "./CaseStudySectionHeading.module.css";

/** Props for {@link CaseStudySectionHeading}. */
export interface CaseStudySectionHeadingProps {
  /** Serif ink headline (single colour — no two-tone split). */
  heading?: string;
  /** Muted support copy under the headline. */
  subtitle?: string;
  /** Optional id for the h2 so sections can aria-labelledby it. */
  headingId?: string;
}

/**
 * Centred section header shared by the 2026 case-study detail sections:
 * a single-colour Adamina serif heading with muted Poppins support copy.
 * Light-theme replacement for `components/case-study/CaseStudySectionHeading`.
 *
 * @param props - Heading/subtitle copy and an optional heading element id.
 */
export default function CaseStudySectionHeading({
  heading,
  subtitle,
  headingId,
}: CaseStudySectionHeadingProps) {
  try {
    if (!heading && !subtitle) {
      return null;
    }

    return (
      <div className={styles.header}>
        {heading ? (
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
        ) : null}
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    );
  } catch {
    return null;
  }
}
