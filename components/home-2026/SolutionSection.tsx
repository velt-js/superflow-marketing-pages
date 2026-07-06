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

/** Copy taken verbatim from Figma node 582:3943. */
const HEADING_TEXT = "Turn your manual QA process into a team of agents.";
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

/**
 * 03 / Solution Section for the 2026 marketing homepage. Presents the QA
 * "checklist to agents to review" story with a decorative blueprint frame.
 */
export default function SolutionSection(): ReactNode {
  return (
    <section className={styles.section} data-section="solution">
      <SolutionSectionReveal>
        <SolutionFrame />
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.headerIcons}>
              <span className={styles.headerIconTable}>
                <TableIcon size={28} />
              </span>
              <span className={styles.headerIconArrow}>
                <ArrowRightIcon size={22} />
              </span>
              <span className={styles.headerIconRobot}>
                <RobotIcon size={28} />
              </span>
            </div>
            <div className={styles.headingGroup}>
              <h2 className={styles.heading}>{HEADING_TEXT}</h2>
              <p className={styles.subheading}>{SUBHEADING_TEXT}</p>
            </div>
          </header>
          <SolutionSectionAgentProvider>
            <div className={styles.flow}>
              <SolutionFileCard />
              <SolutionConnector revealDelayMs={REVEAL_DELAY_CONNECTOR_ONE_MS} />
              <SolutionAgentTeam />
              <SolutionConnector revealDelayMs={REVEAL_DELAY_CONNECTOR_TWO_MS} />
              <SolutionReviewCard />
            </div>
          </SolutionSectionAgentProvider>
        </div>
      </SolutionSectionReveal>
    </section>
  );
}
