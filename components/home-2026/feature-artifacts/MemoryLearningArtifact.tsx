import type { ReactNode } from "react";
import AgentCommentCard from "./AgentCommentCard";
import { BrainGlyph } from "../hero-artifacts/MemoryUploadArtifact";
import styles from "./MemoryLearningArtifact.module.css";

/**
 * Feature-section app-window artifact — "Learning from reviews" (memory feature
 * page, `block-in` block, `learning-from-reviews` tab).
 *
 * Tells the "every accept or reject teaches Memory" story in one static frame:
 * two agent findings sit side by side — the left one carrying a soft-red
 * "Rejected" status band, the right one a soft-green "Accepted" band — and their
 * bottoms feed a many-to-one connector (an inverted cup that merges into a
 * single stem) that drops into a pink Memory pill stating the concrete thing
 * Memory just learned.
 *
 * Reuse over re-invention:
 *   - The card body is the shared {@link AgentCommentCard} (four-dot agent mark,
 *     name, "3h", the ⋯ overflow menu, a bold finding title + a 2-line muted
 *     description). Its approve/reject footer actions are turned off here because
 *     the accept/reject verdict is carried by the status band instead.
 *   - The pill's brain mark is the shared pink {@link BrainGlyph} exported from
 *     the "Upload once" hero memory artifact.
 * Only the coloured status band, the merging connector and the pill shell are
 * authored here (no equivalent existed to reuse).
 *
 * The root fills its container (the shared `.panelScreen` white screen), is
 * left-anchored, and lets the "Accepted" card bleed off the right edge exactly
 * as the reference design does. A subtle rise/fade entrance replays whenever the
 * tab mounts and is disabled under `prefers-reduced-motion: reduce`.
 */

/** Root attribute used to locate the artifact for screenshots/registry lookup. */
const DATA_ARTIFACT = "memory-learning";

/** Status band labels for the two review verdicts. */
const REJECTED_LABEL = "Rejected";
const ACCEPTED_LABEL = "Accepted";

/** Left (rejected) finding copy. */
const REJECTED_AGENT_NAME = "Copy Agent";
const REJECTED_TIME = "3h";
const REJECTED_TITLE = "Lowercase the primary CTA";
const REJECTED_DESCRIPTION =
  "Suggested \u201CGet started\u201D over \u201CGET STARTED.\u201D The client kept it capitalized.";

/** Right (accepted) finding copy. */
const ACCEPTED_AGENT_NAME = "Brand Agent";
const ACCEPTED_TIME = "2h";
const ACCEPTED_TITLE = "Switch body copy to sans-serif";
const ACCEPTED_DESCRIPTION =
  "Flagged the serif paragraph on pricing. The client approved the sans-serif swap.";

/** The concrete fact Memory learns from this review, shown in the pill. */
const LEARNED_FACT = "Acme wants primary CTAs capitalized";

/** Which verdict a review card carries, driving its status-band styling. */
type ReviewVerdict = "rejected" | "accepted";

/** Content + verdict for one review card. */
interface ReviewFinding {
  /** Stable key/identifier for the card. */
  id: string;
  /** Whether the finding was accepted or rejected by the client. */
  verdict: ReviewVerdict;
  /** Status-band label ("Rejected" / "Accepted"). */
  statusLabel: string;
  /** Agent that raised the finding. */
  agentName: string;
  /** Relative timestamp shown in the card header. */
  timeAgo: string;
  /** Bold finding title. */
  title: string;
  /** Two-line supporting description. */
  description: string;
}

/** The two findings shown side by side (rejected on the left, accepted right). */
const FINDINGS: readonly ReviewFinding[] = [
  {
    id: "rejected",
    verdict: "rejected",
    statusLabel: REJECTED_LABEL,
    agentName: REJECTED_AGENT_NAME,
    timeAgo: REJECTED_TIME,
    title: REJECTED_TITLE,
    description: REJECTED_DESCRIPTION,
  },
  {
    id: "accepted",
    verdict: "accepted",
    statusLabel: ACCEPTED_LABEL,
    agentName: ACCEPTED_AGENT_NAME,
    timeAgo: ACCEPTED_TIME,
    title: ACCEPTED_TITLE,
    description: ACCEPTED_DESCRIPTION,
  },
];

/**
 * One review finding card: a coloured status band over the shared
 * {@link AgentCommentCard} (with its approve/reject footer suppressed).
 *
 * @param root0 - Card props.
 * @param root0.finding - The finding content + verdict to render.
 * @returns The review card element, or `null` on failure.
 */
function ReviewCard({ finding }: { finding: ReviewFinding }): ReactNode {
  try {
    const bandClass =
      finding?.verdict === "accepted"
        ? `${styles.band} ${styles.bandAccepted}`
        : `${styles.band} ${styles.bandRejected}`;
    const cardClass =
      finding?.verdict === "accepted"
        ? `${styles.reviewCard} ${styles.cardAccepted}`
        : `${styles.reviewCard} ${styles.cardRejected}`;

    return (
      <div className={cardClass}>
        <span className={bandClass}>{finding?.statusLabel}</span>
        <AgentCommentCard
          className={styles.cardInner}
          agentName={finding?.agentName ?? ""}
          timeAgo={finding?.timeAgo ?? ""}
          title={finding?.title ?? ""}
          description={finding?.description ?? ""}
          avatarVariant="agentDots"
          showActions={false}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The many-to-one connector: an inverted cup whose two shoulders meet each
 * card's bottom-centre, merging into a single stem that drops toward the pill.
 * Adapted from the one-to-many `BranchVector` in the "Upload once" memory hero
 * artifact (reversed here so two cards feed one memory).
 *
 * The viewBox width matches the cards row (2 × card + gap) and the shoulder x
 * positions sit under each card centre, so the connector is not stretched and
 * its rounded corners stay crisp.
 *
 * @returns The connector `<svg>` element, or `null` on failure.
 */
function ConnectorVector(): ReactNode {
  try {
    return (
      <svg
        className={styles.connectorSvg}
        viewBox="0 0 748 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Cup: legs rise to each card centre (x=176, x=572), meeting at a
            rounded-corner horizontal bottom. */}
        <path
          d="M176 0 V34 Q176 52 194 52 H554 Q572 52 572 34 V0"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Stem: drops from the cup's centre down to the pill. */}
        <path d="M374 52 V96" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The pink Memory pill stating the concrete fact learned from the review.
 *
 * @returns The pill element, or `null` on failure.
 */
function MemoryPill(): ReactNode {
  try {
    return (
      <span className={styles.pill}>
        <span className={styles.pillMark}>
          <BrainGlyph size={22} />
        </span>
        <span className={styles.pillText}>{LEARNED_FACT}</span>
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Learning from reviews" feature-section artifact.
 *
 * @returns The two-card + connector + memory-pill scene, or `null` on failure.
 */
export default function MemoryLearningArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact={DATA_ARTIFACT}>
        <div className={styles.scene}>
          <div className={styles.cards}>
            {FINDINGS.map((finding) => (
              <ReviewCard key={finding?.id} finding={finding} />
            ))}
          </div>

          <div className={styles.connector}>
            <ConnectorVector />
          </div>

          <div className={styles.pillRow}>
            <MemoryPill />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
