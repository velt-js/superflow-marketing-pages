import type { CSSProperties, ReactNode, SVGProps } from "react";
import styles from "./SolutionSection.module.css";
import {
  BrainGlyph,
  DEFAULT_PDF_TINT,
  PdfFile,
  type PdfFileTint,
} from "./hero-artifacts/MemoryUploadArtifact";
import SolutionSectionAgentPills, {
  SolutionSectionAgentProvider,
  type AgentPill,
} from "./SolutionSectionAgents";
import SolutionSectionReveal from "./SolutionSectionReveal";
import SolutionSectionToast, {
  type ReviewFinding,
} from "./SolutionSectionToast";
import SolutionAskAiInsights from "./SolutionAskAiInsights";

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

/** Unique gradient id for the memory `sheet-brain` cue's arrow stroke. */
const HEADER_ARROW_GRADIENT_ID = "solHeaderArrowGradient";
/**
 * Brand Guideline lavender-blue — reuses the Brand Guideline sheet's tint
 * (`DEFAULT_PDF_TINT.shadow`, #7f95c6) so the memory header cue's sheet glyph
 * and the arrow gradient's left stop match the guidelines graphic below.
 */
const HEADER_SHEET_BLUE = DEFAULT_PDF_TINT.shadow;
/** Memory brand pink (mirrors `--sol-memory-pink`) — the arrow gradient's right stop. */
const HEADER_BRAIN_PINK = "#e5389f";

/**
 * Gradient variant of {@link ArrowRightIcon} used ONLY by the memory page's
 * `sheet-brain` header cue. Its stroke fades from the Brand Guideline sheet's
 * lavender-blue (left) to the Memory brain's pink (right), bridging the two
 * glyphs. Uses a unique gradient id and per-path `url(#…)` stroke, so it never
 * touches the shared gray {@link ArrowRightIcon} used by other cues.
 * @param size Square pixel dimension for the SVG.
 */
function HeaderArrowGradientIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <defs>
        <linearGradient
          id={HEADER_ARROW_GRADIENT_ID}
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={HEADER_SHEET_BLUE} />
          <stop offset="1" stopColor={HEADER_BRAIN_PINK} />
        </linearGradient>
      </defs>
      <path d="M5 12h14" stroke={`url(#${HEADER_ARROW_GRADIENT_ID})`} />
      <path
        d="M13 6l6 6l-6 6"
        stroke={`url(#${HEADER_ARROW_GRADIENT_ID})`}
      />
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
 * Dog-eared document-sheet glyph (Tabler `file-description` geometry) — the
 * "before" mark in the memory page's guidelines → Memory header cue.
 * @param size Square pixel dimension for the SVG.
 */
function SheetIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
      <path d="M9 9l1 0" />
      <path d="M9 13l6 0" />
      <path d="M9 17l6 0" />
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
 * Bar-chart glyph cueing the "graphs" side of the Ask AI variant's header
 * (charts → arrow → message). Two axis rules with three ascending bars.
 * @param size Square pixel dimension for the SVG.
 */
function ChartIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4" />
      <path d="M13 16v-8" />
      <path d="M18 16v-6" />
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

/* Ask AI-variant fallbacks, used only if the CMS omits the copy. */
const ASK_AI_HEADING_TEXT = "See where the rounds go";
const ASK_AI_SUBHEADING_TEXT =
  "Ask plain-language questions across every review — and every answer is grounded in your own data, cited.";
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

/* ---- Memory "guidelines → Memory" variant (memory feature page) ----
   A small stack of tinted guideline sheets on the left feeds — through a
   dashed arrow — the per-client Memory brain on the right, ringed by counts of
   what it now holds. Only the memory page opts into this via
   solution.variant = "memory-guidelines". */

/** Rendered width (px) of each dog-eared guideline sheet. */
const GUIDELINE_SHEET_WIDTH = 118;

/** Rose/pink tint for the "Agency Guidelines" sheet. */
const GUIDELINE_PINK_TINT: PdfFileTint = {
  bodyFrom: "#fef1f8",
  bodyTo: "#fbe0f0",
  stroke: "#f8d9ea",
  foldFrom: "#f6cbe4",
  foldTo: "#efb3d5",
  shadow: "#d98cbb",
};

/** Mint/green tint for the "SEO Guidelines" sheet. */
const GUIDELINE_GREEN_TINT: PdfFileTint = {
  bodyFrom: "#eefaf1",
  bodyTo: "#dcf3e4",
  stroke: "#d0efdb",
  foldFrom: "#c2e9d1",
  foldTo: "#a8dcbd",
  shadow: "#79b892",
};

/** Shared two-line label styling for the guideline sheets. */
const GUIDELINE_LABEL_STYLE: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: 0,
  color: "#1f2430",
  textAlign: "center",
  padding: "0 8px",
};

/** One guideline sheet in the left stack. */
interface GuidelineSheet {
  /** Stable key + id-prefix seed. */
  id: string;
  /** Two-line wordmark overlaid on the sheet. */
  label: ReactNode;
  /** Unique SVG gradient/filter id prefix so sheets never collide. */
  idPrefix: string;
  /** Sheet colour tint. */
  tint: PdfFileTint;
  /** Stagger-position class for this sheet in the stack. */
  className: string;
}

/** The three overlapping guideline sheets, front-to-back via CSS z-index. */
const GUIDELINE_SHEETS: readonly GuidelineSheet[] = [
  {
    id: "brand",
    label: (
      <>
        Brand
        <br />
        Guideline
      </>
    ),
    idPrefix: "solGuideBrand",
    tint: DEFAULT_PDF_TINT,
    className: styles.sheetBrand,
  },
  {
    id: "agency",
    label: (
      <>
        Agency
        <br />
        Guidelines
      </>
    ),
    idPrefix: "solGuideAgency",
    tint: GUIDELINE_PINK_TINT,
    className: styles.sheetAgency,
  },
  {
    id: "seo",
    label: (
      <>
        SEO
        <br />
        Guidelines
      </>
    ),
    idPrefix: "solGuideSeo",
    tint: GUIDELINE_GREEN_TINT,
    className: styles.sheetSeo,
  },
];

/** Count pills that ring the Memory brain (what it now holds). */
const GUIDELINE_AGENCY_RULES_TEXT = "12 Agency Rules";
const GUIDELINE_CLIENT_PROJECTS_TEXT = "24 Client Projects";
const GUIDELINE_SEO_CHECKS_TEXT = "8 SEO Checks";

/* Reveal delays (ms) sequencing the guidelines diagram left-to-right. */
const GUIDELINES_REVEAL_SHEET_BASE_MS = 500;
const GUIDELINES_REVEAL_SHEET_STEP_MS = 110;
const GUIDELINES_REVEAL_CONNECTOR_MS = 900;
const GUIDELINES_REVEAL_BRAIN_MS = 1050;
const GUIDELINES_REVEAL_PILL_BASE_MS = 1150;
const GUIDELINES_REVEAL_PILL_STEP_MS = 90;

/** Pixel size of the pink brain in the center Memory badge. */
const GUIDELINES_BRAIN_SIZE = 38;

/**
 * Memory "guidelines → Memory" variant of the flow diagram (memory feature
 * page): a small stack of tinted, dog-eared guideline sheets on the left feeds
 * — through a dashed arrow — the per-client Memory brain on the right, ringed
 * by counts of what it now holds. Reuses the shared {@link PdfFile} sheet and
 * the pink {@link BrainGlyph}. Entrances use the section's shared `.revealItem`
 * mechanism, so the whole thing stays prefers-reduced-motion safe.
 *
 * @returns The guidelines-flow element, or `null` on failure.
 */
function SolutionGuidelinesFlow(): ReactNode {
  try {
    return (
      <div className={styles.guidelinesFlow}>
        <div className={styles.guidelinesStack}>
          {GUIDELINE_SHEETS.map((sheet, sheetIndex) => (
            <span
              key={sheet.id}
              className={`${sheet.className} ${styles.revealItem}`}
              style={revealDelayStyle(
                GUIDELINES_REVEAL_SHEET_BASE_MS +
                  sheetIndex * GUIDELINES_REVEAL_SHEET_STEP_MS,
              )}
              aria-hidden="true"
            >
              <PdfFile
                label={sheet.label}
                idPrefix={sheet.idPrefix}
                width={GUIDELINE_SHEET_WIDTH}
                tint={sheet.tint}
                labelStyle={GUIDELINE_LABEL_STYLE}
              />
            </span>
          ))}
        </div>

        <SolutionConnector revealDelayMs={GUIDELINES_REVEAL_CONNECTOR_MS} />

        <div className={styles.guidelinesMemory}>
          <span
            className={`${styles.countPill} ${styles.countPillTopLeft} ${styles.revealItem}`}
            style={revealDelayStyle(GUIDELINES_REVEAL_PILL_BASE_MS)}
          >
            {GUIDELINE_AGENCY_RULES_TEXT}
          </span>
          <span
            className={`${styles.countPill} ${styles.countPillTopRight} ${styles.revealItem}`}
            style={revealDelayStyle(
              GUIDELINES_REVEAL_PILL_BASE_MS + GUIDELINES_REVEAL_PILL_STEP_MS,
            )}
          >
            {GUIDELINE_CLIENT_PROJECTS_TEXT}
          </span>
          <span
            className={`${styles.brainBadge} ${styles.revealItem}`}
            style={revealDelayStyle(GUIDELINES_REVEAL_BRAIN_MS)}
            aria-hidden="true"
          >
            <BrainGlyph size={GUIDELINES_BRAIN_SIZE} />
          </span>
          <span
            className={`${styles.countPill} ${styles.countPillBottom} ${styles.revealItem}`}
            style={revealDelayStyle(
              GUIDELINES_REVEAL_PILL_BASE_MS +
                GUIDELINES_REVEAL_PILL_STEP_MS * 2,
            )}
          >
            {GUIDELINE_SEO_CHECKS_TEXT}
          </span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Per-page overrides for the Solution section copy. Omit a field to fall back
 * to the homepage default (so /home-preview renders unchanged). Feature pages
 * keep the word "manual" here since they have no Problem section above.
 *
 * `variant` swaps the illustration + header glyphs:
 *  - "checklist" (default): checklist file → agent team → review card.
 *  - "comments": scattered feedback bubbles → a comment pinned on the site.
 *  - "memory-guidelines": tinted guideline sheets → the Memory brain (memory
 *    page only). Header glyph still comes from the `icon` override.
 *  - "ask-ai": a column of minimal graph tiles → a cycling insight card (Ask AI
 *    page). Header pair defaults to charts → message.
 */
export interface SolutionSectionProps {
  heading?: string;
  subheading?: string;
  variant?: "checklist" | "comments" | "memory-guidelines" | "ask-ai";
  /**
   * Optional named override for the header cue. When set to a known name (see
   * {@link SOLUTION_HEADER_ICONS}) the variant's default before→after glyph
   * pair is replaced by a page-specific cue — e.g. `"sheet-brain"` (document
   * sheet → arrow → pink Memory brain) on the memory feature page. Omit to keep
   * the variant's built-in pair.
   */
  icon?: string;
}

/** Pixel size for the header cue glyphs (matches the table/robot glyphs). */
const HEADER_GLYPH_SIZE = 28;

/**
 * Registry of named header-cue overrides (string → full cue nodes). A page can
 * set `solution.icon` to one of these keys to replace the variant's default
 * before→after pair with a page-specific cue. `sheet-brain` mirrors the memory
 * page's "guidelines → Memory" graphic: a blue document sheet → a blue→pink
 * gradient arrow → the pink Memory brain (reused from the memory artifacts).
 */
const SOLUTION_HEADER_ICONS: Readonly<
  Record<string, (size: number) => ReactNode>
> = {
  "sheet-brain": (size) => (
    <>
      <span className={styles.headerIconSheet}>
        <SheetIcon size={size} />
      </span>
      <span className={styles.headerIconArrow}>
        <HeaderArrowGradientIcon size={22} />
      </span>
      <span className={styles.headerIconBrain}>
        <BrainGlyph size={size} />
      </span>
    </>
  ),
};

/**
 * Render the section-header icon cue. A page may override the variant's default
 * before→after glyph pair with a named cue from {@link SOLUTION_HEADER_ICONS};
 * otherwise the built-in pair for the active variant is shown.
 *
 * @param props.variant The active Solution variant, selecting its default cue.
 * @param props.icon Optional named header-cue override (e.g. "sheet-brain").
 * @returns The header-icon nodes, or `null` on failure.
 */
function SolutionHeaderIcons({
  variant,
  icon,
}: {
  variant: SolutionSectionProps["variant"];
  icon?: string;
}): ReactNode {
  try {
    const override = icon ? SOLUTION_HEADER_ICONS?.[icon] : undefined;
    if (override) {
      return override(HEADER_GLYPH_SIZE);
    }
    if (variant === "ask-ai") {
      return (
        <>
          <span className={styles.headerIconChart}>
            <ChartIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconMessage}>
            <MessageIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "comments") {
      return (
        <>
          <span className={styles.headerIconGrain}>
            <GrainIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrowAccent}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconMessage}>
            <MessageIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    return (
      <>
        <span className={styles.headerIconTable}>
          <TableIcon size={HEADER_GLYPH_SIZE} />
        </span>
        <span className={styles.headerIconArrow}>
          <ArrowRightIcon size={22} />
        </span>
        <span className={styles.headerIconRobot}>
          <RobotIcon size={HEADER_GLYPH_SIZE} />
        </span>
      </>
    );
  } catch {
    return null;
  }
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
  icon,
}: SolutionSectionProps = {}): ReactNode {
  const isComments = variant === "comments";
  const isAskAi = variant === "ask-ai";
  const defaultHeading = isComments
    ? COMMENTS_HEADING_TEXT
    : isAskAi
      ? ASK_AI_HEADING_TEXT
      : HEADING_TEXT;
  const defaultSubheading = isComments
    ? COMMENTS_SUBHEADING_TEXT
    : isAskAi
      ? ASK_AI_SUBHEADING_TEXT
      : SUBHEADING_TEXT;
  const headingText = heading ?? defaultHeading;
  const subheadingText = subheading ?? defaultSubheading;

  return (
    <section className={styles.section} data-section="solution">
      <SolutionSectionReveal>
        <SolutionFrame />
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.headerIcons}>
              <SolutionHeaderIcons variant={variant} icon={icon} />
            </div>
            <div className={styles.headingGroup}>
              <h2 className={styles.heading}>{headingText}</h2>
              <p className={styles.subheading}>{subheadingText}</p>
            </div>
          </header>
          {variant === "ask-ai" ? (
            <SolutionAskAiInsights />
          ) : variant === "comments" ? (
            <SolutionCommentsFlow />
          ) : variant === "memory-guidelines" ? (
            <SolutionGuidelinesFlow />
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
