import type { CSSProperties, ReactNode, SVGProps } from "react";
import styles from "./WebhooksArtifact.module.css";

/**
 * Feature-tab artifact — "Webhooks".
 *
 * Stripped down to the single core idea: a deploy fires a review automatically,
 * with no manual work. A subtle dot-grid canvas (the same dot treatment as the
 * generic "workflow" mock) sits behind one glanceable cause → effect flow: a
 * "Deploy" event node on the left, a purple arrow that a
 * pulse travels along (the webhook firing), and a "Review started · 6 agents
 * running" node on the right whose small purple dots pulse to show the agents
 * are working. Two nodes, one arrow, lots of whitespace.
 *
 * Consistent with the sibling artifacts' house style ({@link ../hero-artifacts/RunOnDemandArtifact},
 * {@link RecordWalkthroughArtifact}): white card, `var(--hero-font-ui, …)` font,
 * subtle borders and one cohesive purple accent (the agents' brand purple,
 * #6d5cf5) used sparingly (only on the arrow and the review node, plus the
 * agent dots). Every glyph is inlined Tabler geometry drawn
 * in `currentColor`. The composition is CSS-only and replays whenever the tab
 * mounts; reduced motion rests in the settled state (both nodes shown, no
 * traveling pulse). Everything is left-anchored so nothing bleeds past the
 * ~636px slice the feature panel reveals of the wide app window.
 */

const DATA_ARTIFACT = "webhooks";

const TRIGGER_TITLE = "Deploy";
const TRIGGER_META = "prod \u00b7 main@a1b2c3";

const REVIEW_TITLE = "Review started";
const AGENTS_RUNNING_LABEL = "6 agents running";

/** Number of pulsing "agent" dots shown under the review node. */
const AGENT_DOT_COUNT = 3;

type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. Defaults to 16. */
  size?: number;
};

/**
 * Shared stroked-glyph wrapper drawing outlined Tabler icons in `currentColor`
 * with rounded caps/joins on a 24-unit grid.
 *
 * @param root0 - Icon props including optional `size`, `strokeWidth`, children.
 * @returns The configured `<svg>` element, or `null` on failure.
 */
function StrokeIcon({
  size = 16,
  strokeWidth = 1.8,
  children,
  ...rest
}: IconProps & { strokeWidth?: number | string; children: ReactNode }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {children}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Rocket glyph marking the "Deploy" trigger node (Tabler `rocket`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The rocket icon.
 */
function RocketIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.8} {...props}>
      <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
      <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
      <path d="M15 9a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
    </StrokeIcon>
  );
}

/**
 * Sparkles glyph marking the "Review started" node — the AI agents kicking off
 * (Tabler `sparkles`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The sparkles icon.
 */
function SparklesIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z" />
      <path d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z" />
      <path d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
    </StrokeIcon>
  );
}

/**
 * Render the "Webhooks" feature-tab artifact — a minimal deploy → review flow.
 *
 * @returns The cause → effect scene contents, or `null` on failure.
 */
export default function WebhooksArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact={DATA_ARTIFACT}>
        <div className={styles.flow}>
          <div className={`${styles.node} ${styles.nodeTrigger}`}>
            <span className={`${styles.nodeIcon} ${styles.triggerIcon}`} aria-hidden="true">
              <RocketIcon size={20} />
            </span>
            <div className={styles.nodeText}>
              <span className={styles.nodeTitle}>{TRIGGER_TITLE}</span>
              <span className={styles.triggerMeta}>{TRIGGER_META}</span>
            </div>
          </div>

          <div className={styles.arrow} aria-hidden="true">
            <span className={styles.arrowLine} />
            <span className={styles.arrowPulse} />
            <span className={styles.arrowHead} />
          </div>

          <div className={`${styles.node} ${styles.nodeReview}`}>
            <span className={`${styles.nodeIcon} ${styles.reviewIcon}`} aria-hidden="true">
              <SparklesIcon size={20} />
            </span>
            <div className={styles.nodeText}>
              <span className={`${styles.nodeTitle} ${styles.reviewTitle}`}>
                {REVIEW_TITLE}
              </span>
              <span className={styles.reviewAgents}>
                <span className={styles.reviewDots}>
                  {Array.from({ length: AGENT_DOT_COUNT }, (_unused, dotIndex) => (
                    <span
                      key={`agent-dot-${dotIndex}`}
                      className={styles.reviewDot}
                      style={{ "--dot-index": dotIndex } as CSSProperties}
                    />
                  ))}
                </span>
                {AGENTS_RUNNING_LABEL}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
