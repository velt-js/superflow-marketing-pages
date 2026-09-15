import type { ReactNode } from "react";
import fsStyles from "@/components/home-2026/FeatureSet.module.css";
import { CLIENT_APPROVES_BLOCK } from "@/components/home-2026/FeatureSet";
import FeatureSetStack from "@/components/home-2026/FeatureSetStack";
import styles from "./ClientSignOffSection.module.css";

const HEADING_ID = "solution-client-signoff-heading";
const HEADING = "How the client signs off.";

/** Props for {@link ClientSignOffSection}. */
export interface ClientSignOffSectionProps {
  /** One line from page data, e.g. how the practice owner approves. */
  clientLine?: string | null;
}

/**
 * S4, how the client signs off: the page's one-line intro, then the home
 * page's "Your Client Approves From a Link. Even Behind SSO." block rendered
 * unchanged inside the same section chrome the home Feature Set uses.
 *
 * @param props - The page's client line.
 * @returns The section.
 */
export default function ClientSignOffSection({
  clientLine,
}: ClientSignOffSectionProps): ReactNode {
  const intro = typeof clientLine === "string" ? clientLine.trim() : "";

  return (
    <section
      className={fsStyles.section}
      data-section="solution-client-signoff"
      aria-labelledby={HEADING_ID}
    >
      <div className={fsStyles.inner}>
        <header className={`${fsStyles.header} ${styles.header}`}>
          <h2 id={HEADING_ID} className={fsStyles.headerTitle}>
            {HEADING}
          </h2>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </header>
        <FeatureSetStack blocks={[CLIENT_APPROVES_BLOCK]} />
      </div>
    </section>
  );
}
