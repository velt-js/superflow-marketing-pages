import type { ReactNode } from "react";
import BrowserChrome from "./BrowserChrome";
import CommentPin from "./CommentPin";
import LegoFaceIcon from "./LegoFaceIcon";
import AgentCommentCard from "./AgentCommentCard";
import FakeCursor from "./FakeCursor";
import styles from "./ValidateFixesArtifact.module.css";

/**
 * Feature-tab artifact — "Validate Fixes".
 *
 * Reuses the shared pinned-comment scene primitives (the {@link BrowserChrome}
 * page bar, the dashed selected element + skeleton content, the teardrop
 * {@link CommentPin} carrying the white {@link LegoFaceIcon} agent glyph, and
 * the {@link AgentCommentCard} finding — the same composition the "Findings" tab
 * uses via `AgentFindingArtifact`), and plays a 3-beat "re-check → fixed →
 * resolved" story on mount:
 *
 * 1. **Checking** — the selected element becomes accent-active (magenta dashed
 *    border + subtle wash) and a "Checking…" label with a spinner appears: the
 *    agent is re-running to verify the fix.
 * 2. **Issue Fixed** — the checking state cross-fades into a green "Issue Fixed"
 *    badge and the element settles to a green success tint.
 * 3. **Resolved** — a {@link FakeCursor} glides onto the finding's green approve
 *    check (the ✓ the {@link AgentCommentCard} footer renders), presses it (a
 *    scale dip + ripple), and the comment card + pin fade/scale away — the agent
 *    confirmed the fix and closed its own finding.
 *
 * The choreography mirrors the cursor-press pattern in the "Run on Demand" hero
 * artifact: a `.cursor` class travels along a keyframe path to the control, dips
 * in scale to "press", and a ripple pops at the hit point. It is CSS-only and
 * deterministic (no client state, so no hydration mismatch); it replays whenever
 * the tab mounts and, under `prefers-reduced-motion: reduce`, rests in the final
 * settled state (Issue Fixed + the comment already resolved/gone, no cursor).
 * Everything is left-anchored at native pixel coordinates so the story sits
 * inside the ~636px slice the panel reveals of the 1204px app window.
 */

const DATA_ARTIFACT = "validate-fixes";

const ADDRESS = "YOUR-SITE.COM";

const CHECKING_LABEL = "Checking\u2026";
const FIXED_LABEL = "Issue Fixed";

/** Agent identity + finding copy shown on the reused agent card. */
const AGENT_NAME = "Link Checker";
const AGENT_TIME = "now";
const FINDING_TITLE = "Broken link in the footer";
const FINDING_DESCRIPTION =
  "The \u201CPricing\u201D link returned a 404 \u2014 re-run to confirm the fix shipped.";

/** Teardrop fill + avatar size of the agent pin (matches the Findings scene). */
const AGENT_PIN_TONE = "#6a5cf6";
const PIN_SIZE = 28;

/** Rendered size (px) of the fake pointer that clicks the approve check. */
const CURSOR_SIZE = 24;

/** Icon size (px) for the "Issue Fixed" badge check glyph. */
const CHECK_ICON_SIZE = 13;

/**
 * Tabler `check` glyph used by the "Issue Fixed" badge, drawn in `currentColor`.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The check `<svg>` element, or `null` on failure.
 */
function CheckIcon({ size }: { size: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12.5L9.5 17L19 7" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Validate Fixes" feature-tab artifact.
 *
 * @returns The re-check → fixed → resolved scene contents, or `null` on failure.
 */
export default function ValidateFixesArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact={DATA_ARTIFACT}>
        <BrowserChrome
          className={styles.chrome}
          address={ADDRESS}
          addressAlign="right"
          showActions={false}
        />

        {/* Skeleton page content behind the finding (bleeds off the right). */}
        <div className={styles.content} aria-hidden="true">
          <span className={styles.contentBlock} />
          <span className={`${styles.contentBlock} ${styles.contentBlockTall}`} />
        </div>

        {/* The selected element being re-validated. Its border + wash animate
            neutral → magenta (checking) → green (fixed). */}
        <div className={styles.element} aria-hidden="true" />

        {/* Status label anchored to the element's top-left: the "Checking…"
            spinner pill cross-fades into the green "Issue Fixed" badge. */}
        <div className={styles.statusTab} aria-hidden="true">
          <span className={`${styles.tabPill} ${styles.checking}`}>
            <span className={styles.spinner} />
            {CHECKING_LABEL}
          </span>
          <span className={`${styles.tabPill} ${styles.fixed}`}>
            <span className={styles.fixedCheck}>
              <CheckIcon size={CHECK_ICON_SIZE} />
            </span>
            {FIXED_LABEL}
          </span>
        </div>

        {/* The pinned agent finding: reused CommentPin + AgentCommentCard. The
            card + pin fade away once the cursor clicks the approve check. */}
        <div className={styles.thread}>
          <CommentPin
            className={styles.pin}
            size={PIN_SIZE}
            tone={AGENT_PIN_TONE}
            glyph={<LegoFaceIcon size={PIN_SIZE} />}
          />

          <div className={styles.cardWrap}>
            <AgentCommentCard
              className={styles.card}
              agentName={AGENT_NAME}
              timeAgo={AGENT_TIME}
              title={FINDING_TITLE}
              description={FINDING_DESCRIPTION}
              avatarVariant="agentDots"
            />
            {/* Ripple pops over the AgentCommentCard's green approve check when
                the cursor presses it. Anchored to the card's bottom-right corner
                (deterministic against the footer's fixed action layout). */}
            <span className={styles.ripple} aria-hidden="true" />
          </div>
        </div>

        {/* Fake pointer that glides onto the approve check and "presses" it. */}
        <FakeCursor className={styles.cursor} size={CURSOR_SIZE} />
      </div>
    );
  } catch {
    return null;
  }
}
