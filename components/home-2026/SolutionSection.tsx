import type { CSSProperties, ReactNode, SVGProps } from "react";
import styles from "./SolutionSection.module.css";
import SolutionSectionAgentPills, {
  SolutionSectionAgentProvider,
  type AgentPill,
} from "./SolutionSectionAgents";
import SolutionSectionReveal from "./SolutionSectionReveal";
import SolutionSectionToast, {
  type ReviewFinding,
} from "./SolutionSectionToast";

/** Copy per the homepage copy spec (home v4.1.8): "manual" cut, since the
    Problem section one scroll up already establishes the manual status quo. */
const HEADING_TEXT = "Turn your QA process into a team of agents.";
const SUBHEADING_TEXT =
  "Built from your checklist. They check, you decide.";
const FILE_NAME_TEXT = "Checklist.xlsx";
const FILE_META_TEXT = "123 Tasks";
const AGENT_TEAM_TEXT = "Agent Team";
const REVIEW_ACTION_TEXT = "Review Agent Work";

/** CSS custom property consumed by the reveal animation delays. */
const REVEAL_DELAY_VAR = "--sol-reveal-delay";

/* Reveal delays (ms) sequencing the diagram left-to-right, overlapping the
   tail of the frame animation (lines finish ~700ms, bolts ~1200ms). */
const REVEAL_DELAY_FILE_CARD_MS = 500;
const REVEAL_DELAY_CONNECTOR_ONE_MS = 780;
const REVEAL_DELAY_TEAM_LABEL_MS = 950;
const REVEAL_DELAY_PILL_BASE_MS = 1030;
const REVEAL_DELAY_PILL_STEP_MS = 90;
const REVEAL_DELAY_CONNECTOR_TWO_MS = 1300;
const REVEAL_DELAY_REVIEW_MS = 1450;

/**
 * Builds the inline style that staggers one element's entrance reveal.
 * @param delayMs Milliseconds to wait after the section reveal triggers.
 */
function revealDelayStyle(delayMs: number): CSSProperties {
  return { [REVEAL_DELAY_VAR]: `${delayMs}ms` } as CSSProperties;
}

/** Shared stroke styling so every inline icon matches the Tabler look. */
const ICON_STROKE_PROPS: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

interface IconProps {
  /** Rendered width/height in pixels (icons are square). */
  size?: number;
}

/**
 * Base wrapper for the inline Tabler-style icons used across the section.
 * @param size Square pixel dimension for the SVG.
 * @param children Path/shape elements drawn on the 24x24 canvas.
 */
function SolutionIcon({
  size = 24,
  children,
}: IconProps & { children: ReactNode }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...ICON_STROKE_PROPS}
    >
      {children}
    </svg>
  );
}

/**
 * Spreadsheet/table glyph, used for the header cue and the source file card.
 * @param size Square pixel dimension for the SVG.
 */
function TableIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
      <path d="M3 10h18" />
      <path d="M10 3v18" />
    </SolutionIcon>
  );
}

/**
 * Right-pointing arrow used between the header glyphs.
 * @param size Square pixel dimension for the SVG.
 */
function ArrowRightIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6l-6 6" />
    </SolutionIcon>
  );
}

/**
 * Robot glyph representing the generated QA agents.
 * @param size Square pixel dimension for the SVG.
 */
function RobotIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-3l-1 -1v-3l1 -1v-1a2 2 0 0 1 2 -2z" />
      <path d="M10 16h4" />
      <path d="M9 11v2" />
      <path d="M15 11v2" />
      <path d="M9 7l-1 -4" />
      <path d="M15 7l1 -4" />
    </SolutionIcon>
  );
}

/**
 * Grain glyph — scattered dots — cueing scattered feedback in the comments
 * variant's header. Stroked dots (inheriting the header's red via currentColor)
 * arranged in the offset pattern from the design.
 * @param size Square pixel dimension for the SVG.
 */
function GrainIcon({ size = 24 }: IconProps): ReactNode {
  const dots: readonly (readonly [number, number])[] = [
    [7.5, 15.833],
    [15.833, 7.5],
    [15.833, 24.167],
    [7.5, 32.5],
    [24.167, 15.833],
    [32.5, 7.5],
    [24.167, 32.5],
    [32.5, 24.167],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.667} />
      ))}
    </svg>
  );
}

/**
 * Speech-bubble glyph representing feedback landing as a comment, used in the
 * comments variant's header.
 * @param size Square pixel dimension for the SVG.
 */
function MessageIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </SolutionIcon>
  );
}

/**
 * The multi-color Slack logo shown in the first feedback card. Uses its own
 * brand fills rather than the shared stroke style.
 * @param size Square pixel dimension for the SVG.
 */
function SlackGlyph({ size = 24 }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 122.8 122.8"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
        fill="#e01e5a"
      />
      <path
        d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
        fill="#36c5f0"
      />
      <path
        d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
        fill="#2eb67d"
      />
      <path
        d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
        fill="#ecb22e"
      />
    </svg>
  );
}

/**
 * Outlined envelope glyph shown in the second feedback card. Inherits its
 * stroke color from the card so the email row reads magenta.
 * @param size Square pixel dimension for the SVG.
 */
function EnvelopeGlyph({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5l8.5 6l8.5 -6" />
    </SolutionIcon>
  );
}

/**
 * Lego-brick glyph flagging the "Agent Team" group.
 * @param size Square pixel dimension for the SVG.
 */
function LegoIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M8 9v-1a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1v1" />
      <path d="M13 9v-1a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1v1" />
    </SolutionIcon>
  );
}

/**
 * Speedometer glyph for the "Performance Check" agent.
 * @param size Square pixel dimension for the SVG.
 */
function SpeedIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M5.636 19.364a9 9 0 1 1 12.728 0" />
      <path d="M16 9l-3 3" />
    </SolutionIcon>
  );
}

/**
 * Chain-link glyph for the "Broken Link Check" agent.
 * @param size Square pixel dimension for the SVG.
 */
function LinkIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M9 15l6 -6" />
      <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
      <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
    </SolutionIcon>
  );
}

/**
 * Pen glyph for the "Grammar Check" agent.
 * @param size Square pixel dimension for the SVG.
 */
function PenIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M14 6l7 7l-4 4" />
      <path d="M5.828 18.172a2.828 2.828 0 0 0 4 0l10.586 -10.586a2 2 0 0 0 0 -2.829l-1.171 -1.171a2 2 0 0 0 -2.829 0l-10.586 10.586a2.828 2.828 0 0 0 0 4z" />
      <path d="M4 20l1.768 -1.768" />
    </SolutionIcon>
  );
}

/**
 * Angle-bracket glyph for the "SEO Best Practices" agent.
 * @param size Square pixel dimension for the SVG.
 */
function CodeIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M7 8l-4 4l4 4" />
      <path d="M17 8l4 4l-4 4" />
      <path d="M14 4l-4 16" />
    </SolutionIcon>
  );
}

/**
 * Warning-triangle glyph shown on the review notification.
 * @param size Square pixel dimension for the SVG.
 */
function AlertTriangleIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M12 9v4" />
      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
      <path d="M12 16h.01" />
    </SolutionIcon>
  );
}

/** Describes a single agent-check pill in the middle column. */
interface AgentCheck {
  id: string;
  label: string;
  className: string;
  icon: ReactNode;
}

const AGENT_CHECKS: AgentCheck[] = [
  {
    id: "performance",
    label: "Performance",
    className: styles.pillPerformance,
    icon: <SpeedIcon size={20} />,
  },
  {
    id: "broken-link",
    label: "Broken Links",
    className: styles.pillLink,
    icon: <LinkIcon size={20} />,
  },
  {
    id: "grammar",
    label: "Grammar and Spelling",
    className: styles.pillGrammar,
    icon: <PenIcon size={20} />,
  },
  {
    id: "seo",
    label: "SEO Basics",
    className: styles.pillSeo,
    icon: <CodeIcon size={20} />,
  },
];

/* Pills prepared for the client component, with entrance delays baked in. */
const AGENT_PILLS: AgentPill[] = AGENT_CHECKS.map((check, checkIndex) => ({
  id: check.id,
  label: check.label,
  accentClassName: check.className,
  icon: check.icon,
  revealStyle: revealDelayStyle(
    REVEAL_DELAY_PILL_BASE_MS + checkIndex * REVEAL_DELAY_PILL_STEP_MS,
  ),
}));

/* Findings cycled by the review toast. Accent colors mirror the matching
   agent pill so each finding reads as that agent's output; agentId links a
   finding to the pill that bounces when it lands. Every finding maps to a
   visible Agent Team pill (no SEO entry — there is no SEO pill). */
const REVIEW_FINDINGS: ReviewFinding[] = [
  {
    id: "performance",
    label: "3 Performance Issues",
    count: 3,
    accentColor: "#ff5744",
    icon: <AlertTriangleIcon size={18} />,
    agentId: "performance",
  },
  {
    id: "broken-links",
    label: "32 Broken Links",
    count: 32,
    accentColor: "#038e31",
    icon: <LinkIcon size={18} />,
    agentId: "broken-link",
  },
  {
    id: "spelling",
    label: "25 Spelling Issues",
    count: 25,
    accentColor: "#3555dd",
    icon: <PenIcon size={18} />,
    agentId: "grammar",
  },
];

/* Header total is derived from the findings so it can't drift from the
   cycling list (3 + 32 + 25 = 60). */
const TOTAL_ISSUES_FOUND = REVIEW_FINDINGS.reduce(
  (runningTotal, finding) => runningTotal + finding.count,
  0,
);
const ISSUES_FOUND_TEXT = `${TOTAL_ISSUES_FOUND} Issues Found`;

/**
 * Dashed, right-pointing connector between the flow stages. Rotates to a
 * vertical orientation on narrow viewports via the CSS module. Reveals with
 * a left-to-right wipe after the given delay.
 * @param revealDelayMs Entrance delay for this connector's wipe animation.
 */
function SolutionConnector({
  revealDelayMs,
}: {
  revealDelayMs: number;
}): ReactNode {
  return (
    <div
      className={`${styles.connector} ${styles.revealConnector}`}
      style={revealDelayStyle(revealDelayMs)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 16" fill="none">
        <line
          x1="0"
          y1="8"
          x2="66"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        <path
          d="M62 3l6 5l-6 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * The source-file card (a checklist spreadsheet) that feeds the agents.
 */
function SolutionFileCard(): ReactNode {
  return (
    <article
      className={`${styles.fileCard} ${styles.revealItem}`}
      style={revealDelayStyle(REVEAL_DELAY_FILE_CARD_MS)}
    >
      <span className={styles.fileCardIcon}>
        <TableIcon size={28} />
      </span>
      <div className={styles.fileCardText}>
        <p className={styles.fileCardTitle}>{FILE_NAME_TEXT}</p>
        <p className={styles.fileCardMeta}>{FILE_META_TEXT}</p>
      </div>
    </article>
  );
}

/**
 * The middle column listing the QA agents spun up from the checklist.
 */
function SolutionAgentTeam(): ReactNode {
  return (
    <div className={styles.agentTeam}>
      <div
        className={`${styles.agentTeamLabel} ${styles.revealItem}`}
        style={revealDelayStyle(REVEAL_DELAY_TEAM_LABEL_MS)}
      >
        <LegoIcon size={18} />
        <span>{AGENT_TEAM_TEXT}</span>
      </div>
      <div className={styles.agentPills}>
        <SolutionSectionAgentPills pills={AGENT_PILLS} />
      </div>
      <span className={styles.agentFade} />
    </div>
  );
}

/**
 * The review column: an issues summary, a cycling toast of agent findings,
 * and the CTA to review the agents' work.
 */
function SolutionReviewCard(): ReactNode {
  return (
    <div
      className={`${styles.reviewCard} ${styles.revealItem}`}
      style={revealDelayStyle(REVEAL_DELAY_REVIEW_MS)}
    >
      <span className={styles.reviewLabel}>{ISSUES_FOUND_TEXT}</span>
      <SolutionSectionToast findings={REVIEW_FINDINGS} />
      <button type="button" className={styles.reviewButton}>
        {REVIEW_ACTION_TEXT}
      </button>
    </div>
  );
}

/**
 * Decorative "blueprint" frame: horizontal rules bleeding the full viewport
 * width, vertical rules bleeding the full section height, and registration
 * "bolt" marks at the four intersections. Its entrance (lines draw, bolts
 * fade in) is driven by the shared reveal class from SolutionSectionReveal.
 * Non-interactive and hidden from assistive tech.
 */
function SolutionFrame(): ReactNode {
  return (
    <div className={styles.frame} aria-hidden="true">
      <span className={`${styles.frameLineHorizontal} ${styles.frameLineTop}`} />
      <span className={`${styles.frameLineHorizontal} ${styles.frameLineBottom}`} />
      <span className={`${styles.frameLineVertical} ${styles.frameLineLeft}`} />
      <span className={`${styles.frameLineVertical} ${styles.frameLineRight}`} />
      <span className={`${styles.corner} ${styles.cornerTopLeft}`} />
      <span className={`${styles.corner} ${styles.cornerTopRight}`} />
      <span className={`${styles.corner} ${styles.cornerBottomLeft}`} />
      <span className={`${styles.corner} ${styles.cornerBottomRight}`} />
    </div>
  );
}

/* Comments-variant fallbacks, used only if the CMS omits the copy. */
const COMMENTS_HEADING_TEXT = "No more scattered feedback on 5 different apps";
const COMMENTS_SUBHEADING_TEXT =
  "Leave feedback where your website or asset lives.";
const COMMENTS_SITE_URL = "your-site.com";
const COMMENTS_MESSAGE_SLACK =
  "Sent you feedback on Email. Also change the CTA to green";
const COMMENTS_MESSAGE_EMAIL = "Here are the changes for the…";

/* Reveal delays (ms) sequencing the comments diagram left-to-right. */
const COMMENTS_REVEAL_BUBBLE_BASE_MS = 500;
const COMMENTS_REVEAL_BUBBLE_STEP_MS = 90;
const COMMENTS_REVEAL_CONNECTOR_MS = 900;
const COMMENTS_REVEAL_BROWSER_MS = 1050;
const COMMENTS_REVEAL_PIN_MS = 1250;

/**
 * Comments variant of the flow diagram: scattered feedback bubbles on the
 * left resolve into a single comment pinned onto the live site (a browser
 * window) on the right. Mirrors the Figma comments feature frame
 * (node 678:3439).
 */
function SolutionCommentsFlow(): ReactNode {
  return (
    <div className={styles.commentsFlow}>
      <div className={styles.commentsBubbles}>
        <div className={styles.bubbleRow}>
          <span
            className={`${styles.appCard} ${styles.revealItem}`}
            style={revealDelayStyle(COMMENTS_REVEAL_BUBBLE_BASE_MS)}
            aria-hidden="true"
          >
            <SlackGlyph size={38} />
            <span className={styles.appCardDot} />
          </span>
          <p
            className={`${styles.messageBubble} ${styles.revealItem}`}
            style={revealDelayStyle(
              COMMENTS_REVEAL_BUBBLE_BASE_MS + COMMENTS_REVEAL_BUBBLE_STEP_MS,
            )}
          >
            {COMMENTS_MESSAGE_SLACK}
          </p>
        </div>
        <div className={`${styles.bubbleRow} ${styles.bubbleRowOffset}`}>
          <p
            className={`${styles.messageBubble} ${styles.revealItem}`}
            style={revealDelayStyle(
              COMMENTS_REVEAL_BUBBLE_BASE_MS +
                COMMENTS_REVEAL_BUBBLE_STEP_MS * 2,
            )}
          >
            {COMMENTS_MESSAGE_EMAIL}
          </p>
          <span
            className={`${styles.appCard} ${styles.appCardEmail} ${styles.revealItem}`}
            style={revealDelayStyle(
              COMMENTS_REVEAL_BUBBLE_BASE_MS +
                COMMENTS_REVEAL_BUBBLE_STEP_MS * 3,
            )}
            aria-hidden="true"
          >
            <EnvelopeGlyph size={30} />
            <span className={styles.appCardDot} />
          </span>
        </div>
      </div>

      <SolutionConnector revealDelayMs={COMMENTS_REVEAL_CONNECTOR_MS} />

      <div
        className={`${styles.browser} ${styles.revealItem}`}
        style={revealDelayStyle(COMMENTS_REVEAL_BROWSER_MS)}
      >
        <div className={styles.browserBar}>
          <span className={styles.browserDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.browserUrl}>{COMMENTS_SITE_URL}</span>
        </div>
        <div className={styles.browserBody}>
          <span className={styles.browserHero} />
          <div className={styles.browserLines}>
            <span className={styles.browserLine} />
            <span className={`${styles.browserLine} ${styles.browserLineMid}`} />
            <span
              className={`${styles.browserLine} ${styles.browserLineShort}`}
            />
          </div>
          <span
            className={`${styles.commentPin} ${styles.revealItem}`}
            style={revealDelayStyle(COMMENTS_REVEAL_PIN_MS)}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Per-page overrides for the Solution section copy. Omit a field to fall back
 * to the homepage default (so /home-preview renders unchanged). Feature pages
 * keep the word "manual" here since they have no Problem section above.
 *
 * `variant` swaps the illustration + header glyphs:
 *  - "checklist" (default): checklist file → agent team → review card.
 *  - "comments": scattered feedback bubbles → a comment pinned on the site.
 */
export interface SolutionSectionProps {
  heading?: string;
  subheading?: string;
  variant?: "checklist" | "comments";
}

/**
 * 03 / Solution Section for the 2026 marketing homepage. Presents the QA
 * "checklist to agents to review" story with a decorative blueprint frame.
 *
 * @param props - Optional per-page copy overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function SolutionSection({
  heading,
  subheading,
  variant = "checklist",
}: SolutionSectionProps = {}): ReactNode {
  const isComments = variant === "comments";
  const headingText =
    heading ?? (isComments ? COMMENTS_HEADING_TEXT : HEADING_TEXT);
  const subheadingText =
    subheading ?? (isComments ? COMMENTS_SUBHEADING_TEXT : SUBHEADING_TEXT);

  return (
    <section className={styles.section} data-section="solution">
      <SolutionSectionReveal>
        <SolutionFrame />
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.headerIcons}>
              {isComments ? (
                <>
                  <span className={styles.headerIconGrain}>
                    <GrainIcon size={28} />
                  </span>
                  <span className={styles.headerIconArrowAccent}>
                    <ArrowRightIcon size={22} />
                  </span>
                  <span className={styles.headerIconMessage}>
                    <MessageIcon size={28} />
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.headerIconTable}>
                    <TableIcon size={28} />
                  </span>
                  <span className={styles.headerIconArrow}>
                    <ArrowRightIcon size={22} />
                  </span>
                  <span className={styles.headerIconRobot}>
                    <RobotIcon size={28} />
                  </span>
                </>
              )}
            </div>
            <div className={styles.headingGroup}>
              <h2 className={styles.heading}>{headingText}</h2>
              <p className={styles.subheading}>{subheadingText}</p>
            </div>
          </header>
          {isComments ? (
            <SolutionCommentsFlow />
          ) : (
            <SolutionSectionAgentProvider>
              <div className={styles.flow}>
                <SolutionFileCard />
                <SolutionConnector
                  revealDelayMs={REVEAL_DELAY_CONNECTOR_ONE_MS}
                />
                <SolutionAgentTeam />
                <SolutionConnector
                  revealDelayMs={REVEAL_DELAY_CONNECTOR_TWO_MS}
                />
                <SolutionReviewCard />
              </div>
            </SolutionSectionAgentProvider>
          )}
        </div>
      </SolutionSectionReveal>
    </section>
  );
}
