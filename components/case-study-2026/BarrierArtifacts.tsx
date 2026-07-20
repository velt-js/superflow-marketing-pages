import styles from "./BarrierArtifacts.module.css";

/**
 * Hand-built, light-theme artifacts for the case-study "barriers" cards.
 *
 * The CMS ships dark-theme illustrations (white copy on transparent
 * backgrounds) that wash out inside the light 2026 card frames, so the
 * cards whose captions match a known barrier render one of these decorative
 * mocks instead; unmatched cards fall back to the CMS image.
 */

/** The artifacts available for barrier cards. */
export type BarrierArtifactKey = "screenshots" | "owner";

/**
 * Ordered caption-keyword rules mapping a barrier caption to an artifact.
 */
const BARRIER_RULES: readonly { pattern: RegExp; artifact: BarrierArtifactKey }[] = [
  { pattern: /screenshot|message/, artifact: "screenshots" },
  { pattern: /owner|assign/, artifact: "owner" },
];

/**
 * Resolve the artifact for a barrier caption via keyword rules.
 *
 * @param caption - The barrier card's caption copy.
 * @returns The matching artifact key, or `undefined` to use the CMS image.
 */
export function resolveBarrierArtifact(
  caption?: string | null,
): BarrierArtifactKey | undefined {
  try {
    const normalizedCaption = (caption ?? "").toLowerCase();
    if (!normalizedCaption) {
      return undefined;
    }
    const matchedRule = BARRIER_RULES.find((rule) =>
      rule.pattern.test(normalizedCaption),
    );
    return matchedRule?.artifact;
  } catch {
    return undefined;
  }
}

/**
 * "Lots of screenshots and messages" — two overlapping screenshot windows
 * with a chat bubble and ⌘C / ⌘V keycaps, capturing the copy-paste chaos.
 */
function ScreenshotsArtifact() {
  try {
    return (
      <div className={styles.stage} aria-hidden="true">
        <div className={`${styles.shot} ${styles.shotBack}`}>
          <div className={styles.shotBar}>
            <span className={styles.shotDot} />
            <span className={styles.shotDot} />
            <span className={styles.shotDot} />
          </div>
          <div className={styles.shotBody}>
            <span className={styles.shotBlock} />
            <span className={`${styles.shotBlock} ${styles.shotBlockShort}`} />
          </div>
        </div>
        <div className={`${styles.shot} ${styles.shotFront}`}>
          <div className={styles.shotBar}>
            <span className={styles.shotDot} />
            <span className={styles.shotDot} />
            <span className={styles.shotDot} />
          </div>
          <div className={styles.shotBody}>
            <span className={styles.shotBlock} />
            <span className={`${styles.shotBlock} ${styles.shotBlockShort}`} />
          </div>
        </div>
        <span className={styles.chatChip}>screenshot_final_v2.png</span>
        <span className={styles.keyRow}>
          <span className={styles.keycap}>&#8984;C</span>
          <span className={styles.keycap}>&#8984;V</span>
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "No clear owner" — a task card whose assignee is an empty dashed avatar
 * with a question mark, plus an "Unassigned" status pill.
 */
function OwnerArtifact() {
  try {
    return (
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.taskCard}>
          <div className={styles.taskHeader}>
            <span className={styles.taskTitle}>Fix button copy</span>
            <span className={styles.taskPill}>Unassigned</span>
          </div>
          <span className={styles.taskLine} />
          <span className={`${styles.taskLine} ${styles.taskLineShort}`} />
          <div className={styles.taskMeta}>
            <span className={styles.taskMetaLabel}>Assigned to</span>
            <span className={styles.taskAvatar}>?</span>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link BarrierArtifact}. */
export interface BarrierArtifactProps {
  /** Which barrier artifact to render. */
  artifact: BarrierArtifactKey;
}

/**
 * Renders the requested barrier artifact. Decorative only — hidden from the
 * accessibility tree by the artifact stages themselves.
 *
 * @param props.artifact - The resolved artifact key.
 */
export default function BarrierArtifact({ artifact }: BarrierArtifactProps) {
  try {
    if (artifact === "screenshots") {
      return <ScreenshotsArtifact />;
    }
    if (artifact === "owner") {
      return <OwnerArtifact />;
    }
    return null;
  } catch {
    return null;
  }
}
