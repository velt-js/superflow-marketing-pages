import type { CSSProperties, ReactNode, SVGProps } from "react";
import styles from "./SolutionSection.module.css";
import BlueprintFrame from "./BlueprintFrame";
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
import SolutionAnalyticsInsights from "./SolutionAnalyticsInsights";
import ReviewToolbar from "./feature-artifacts/ReviewToolbar";

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
 * Sparkles glyph cueing the "curated insight" side of the Analytics variant's
 * header (dashboard → arrow → sparkles). A large four-point star with a small
 * companion spark.
 * @param size Square pixel dimension for the SVG.
 */
function SparklesIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M18 15l.7 1.8L20.5 17.5l-1.8.7L18 20l-.7-1.8L15.5 17.5l1.8-.7z" />
    </SolutionIcon>
  );
}

/**
 * Check-in-shield glyph cueing the "approved" end of the Client Review variant's
 * header (magic link → arrow → approved).
 * @param size Square pixel dimension for the SVG.
 */
function ShieldCheckIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M12 3l7 3v5c0 4.5 -3 7 -7 8c-4 -1 -7 -3.5 -7 -8v-5z" />
      <path d="M9.5 11.5l1.8 1.8l3.2 -3.3" />
    </SolutionIcon>
  );
}

/**
 * Open-padlock glyph cueing the "private scope" start of the Private Comments
 * variant's header (private → arrow → the client sees a clean view).
 * @param size Square pixel dimension for the SVG.
 */
function LockOpenIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0" />
      <path d="M12 15v2.5" />
    </SolutionIcon>
  );
}

/**
 * Eye glyph cueing the "client sees a clean view" end of the Private Comments
 * variant's header.
 * @param size Square pixel dimension for the SVG.
 */
function EyeIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M12 5c-5 0 -8.5 4 -9.5 7c1 3 4.5 7 9.5 7s8.5 -4 9.5 -7c-1 -3 -4.5 -7 -9.5 -7z" />
      <path d="M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
    </SolutionIcon>
  );
}

/**
 * Plain check glyph for the Private Comments variant's "One settled answer"
 * marker beneath the client-visible reply.
 * @param size Square pixel dimension for the SVG.
 */
function CheckLineIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M5 12.5l4 4l10 -10" />
    </SolutionIcon>
  );
}

/**
 * Upload glyph — the "one logo upload" start of the White-label variant's
 * header (upload → arrow → your brand on both surfaces).
 * @param size Square pixel dimension for the SVG.
 */
function UploadIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
      <path d="M7 9l5 -5l5 5" />
      <path d="M12 4v12" />
    </SolutionIcon>
  );
}

/**
 * App-window glyph — the "your brand on every surface" end of the White-label
 * variant's header.
 * @param size Square pixel dimension for the SVG.
 */
function WindowIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 6.5h.01" />
    </SolutionIcon>
  );
}

/**
 * Camera glyph — the "comment captures the page" start of the Screenshots
 * variant's header cue.
 * @param size Square pixel dimension for the SVG.
 */
function CameraIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
      <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </SolutionIcon>
  );
}

/**
 * Archive/history glyph — the "snapshot outlives the page" end of the
 * Screenshots variant's header cue (a stacked, kept snapshot).
 * @param size Square pixel dimension for the SVG.
 */
function ArchiveIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="4" width="18" height="4" rx="2" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10" />
      <path d="M10 12h4" />
    </SolutionIcon>
  );
}

/**
 * The Superflow flower mark (exact Figma vectors) — the "before" brand shown as
 * the logo the White-label upload replaces.
 * @param size Square pixel dimension for the SVG.
 */
function SolutionSuperflowMark({ size = 24 }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M13.4316 3.51909C12.6958 3.20466 11.8819 3.11989 11.0969 3.2759C10.312 3.43192 9.59255 3.82142 9.03308 4.3933C8.46157 4.95285 8.07233 5.67168 7.91623 6.45582C7.76014 7.23996 7.84447 8.05291 8.15818 8.7884C8.45708 9.52946 8.97285 10.1631 9.63803 10.6065C10.3032 11.05 11.0868 11.2825 11.8864 11.2736H15.9223V7.24436C15.9311 6.44498 15.698 5.66158 15.2535 4.99684C14.8091 4.33209 14.1741 3.81701 13.4316 3.51909Z"
        fill="#FFCD2E"
      />
      <path
        d="M28.1321 8.52565C27.188 7.58307 25.9855 6.94115 24.6765 6.68096C23.3675 6.42076 22.0107 6.55396 20.7774 7.06372C19.5441 7.57348 18.4896 8.43695 17.7471 9.54511C17.0046 10.6533 16.6073 11.9564 16.6055 13.29V20.0329H23.3675C24.706 20.0471 26.0176 19.657 27.1306 18.9139C28.2436 18.1707 29.1061 17.1091 29.6052 15.868C30.1269 14.638 30.2654 13.2795 30.0027 11.9697C29.7399 10.6599 29.088 9.45962 28.1321 8.52565Z"
        fill="#FF7162"
      />
      <path
        d="M24.3715 23.2142C24.0727 22.4723 23.5569 21.8378 22.8914 21.3935C22.226 20.9492 21.4419 20.7158 20.6416 20.7238H16.6057V24.7565C16.5973 25.5561 16.8307 26.3395 17.2754 27.0042C17.7201 27.6689 18.3554 28.184 19.098 28.4818C19.5949 28.6906 20.1283 28.7986 20.6674 28.7995C21.3289 28.7928 21.9788 28.6243 22.5601 28.3085C23.1414 27.9928 23.6365 27.5396 24.0019 26.9885C24.3674 26.4374 24.5922 25.8053 24.6566 25.1473C24.721 24.4893 24.6231 23.8256 24.3715 23.2142Z"
        fill="#0DCF82"
      />
      <path
        d="M2.93155 16.1289C2.40623 17.3593 2.26498 18.7195 2.52629 20.0315C2.7876 21.3434 3.43928 22.5459 4.39601 23.4816C5.01327 24.11 5.74925 24.6096 6.56125 24.9516C7.37325 25.2936 8.24513 25.4712 9.12631 25.4739C10.0283 25.4719 10.9209 25.2915 11.7527 24.9432C12.995 24.4447 14.0576 23.5829 14.8013 22.4708C15.5451 21.3586 15.9353 20.0479 15.921 18.7104V11.9606H9.16929C7.83035 11.9467 6.51844 12.3373 5.4054 13.081C4.29236 13.8248 3.4301 14.8872 2.93155 16.1289Z"
        fill="#625DF5"
      />
    </svg>
  );
}

/**
 * The agency ("after") brand mark — a solid teal rounded-square tile with the
 * agency monogram, unmistakably distinct from the multi-color Superflow flower.
 * @param size Square pixel dimension for the SVG.
 */
function SolutionClientMark({ size = 24 }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="solWlClientMark"
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#12B5A6" />
          <stop offset="1" stopColor="#0E7C6E" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#solWlClientMark)" />
      <path
        d="M16 9.5l4.6 12h-2.5l-0.9 -2.5h-4.4l-0.9 2.5h-2.5z M13.6 16.8h4.8l-2.4 -4.6z"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
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

/* Comments-variant fallbacks, used only if the CMS omits the copy. */
const COMMENTS_HEADING_TEXT = "No more scattered feedback on 5 different apps";
const COMMENTS_SUBHEADING_TEXT =
  "Leave feedback where your website or asset lives.";

/* Ask AI-variant fallbacks, used only if the CMS omits the copy. */
const ASK_AI_HEADING_TEXT = "See where the rounds go";
const ASK_AI_SUBHEADING_TEXT =
  "Ask plain-language questions across every review - and every answer is grounded in your own data, cited.";

/* Analytics-variant fallbacks, used only if the CMS omits the copy. */
const ANALYTICS_HEADING_TEXT = "The week, already read";
const ANALYTICS_SUBHEADING_TEXT =
  "Analytics leads with insights - three to five a week, each with the pattern, what it means, and a one-click action.";

/* Client Review-variant fallbacks, used only if the CMS omits the copy. */
const CLIENT_REVIEW_HEADING_TEXT = "One click to yes. No account.";
const CLIENT_REVIEW_SUBHEADING_TEXT =
  "A magic link opens the live page - the client sees work AI and your team already cleaned up, then approves right there.";

/* Screenshots-variant fallbacks, used only if the CMS omits the copy. */
const SCREENSHOTS_HEADING_TEXT = "Proof that outlives the page";
const SCREENSHOTS_SUBHEADING_TEXT =
  "Every comment captures the page as the reviewer saw it \u2014 so the fix never starts from a guess.";

/* Private Comments-variant fallbacks, used only if the CMS omits the copy. */
const PRIVATE_HEADING_TEXT = "Your side of the review.";
const PRIVATE_SUBHEADING_TEXT =
  "Debate in a thread beside the client's - then the client's view shows one settled answer, never the debate.";
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

/* ---- Client Review "magic link → live page → Approve" variant ----
   A phone carrying the review link (left) feeds — through the dashed arrow — the
   live page the client sees (right): no-account chrome, cleaned-up content and a
   recorded approval. Only the client-review page opts into this via
   solution.variant = "client-review". */

const CLIENT_REVIEW_SENDER = "Acme Studio";
const CLIENT_REVIEW_SITE_URL = "acme-studio.com";
const CLIENT_REVIEW_MESSAGE = "Your homepage is ready to review";
const CLIENT_REVIEW_NO_ACCOUNT = "No account";
const CLIENT_REVIEW_APPROVED = "Approved · Dana Wells";

/* Reveal delays (ms) sequencing the client-review diagram left-to-right. */
const CLIENT_REVIEW_REVEAL_PHONE_MS = 500;
const CLIENT_REVIEW_REVEAL_CONNECTOR_MS = 900;
const CLIENT_REVIEW_REVEAL_LIVE_MS = 1050;
const CLIENT_REVIEW_REVEAL_APPROVE_MS = 1350;

/**
 * Client Review variant of the flow diagram (client-review feature page): a
 * phone carrying the review link on the left resolves — through the dashed
 * arrow — into the live page the client sees on the right, ending in a recorded
 * approval. Entrances use the section's shared `.revealItem` mechanism, so the
 * whole thing stays prefers-reduced-motion safe.
 *
 * @returns The client-review-flow element, or `null` on failure.
 */
function SolutionClientReviewFlow(): ReactNode {
  try {
    return (
      <div className={styles.clientReviewFlow}>
        <div
          className={`${styles.crPhone} ${styles.revealItem}`}
          style={revealDelayStyle(CLIENT_REVIEW_REVEAL_PHONE_MS)}
          aria-hidden="true"
        >
          <span className={styles.crPhoneNotch} />
          <div className={styles.crPhoneScreen}>
            <span className={styles.crMsgHead}>{CLIENT_REVIEW_SENDER}</span>
            <p className={styles.crBubble}>{CLIENT_REVIEW_MESSAGE}</p>
            <span className={styles.crLinkChip}>
              <LinkIcon size={15} />
              {CLIENT_REVIEW_SITE_URL}
            </span>
          </div>
        </div>

        <SolutionConnector revealDelayMs={CLIENT_REVIEW_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.crLive} ${styles.revealItem}`}
          style={revealDelayStyle(CLIENT_REVIEW_REVEAL_LIVE_MS)}
        >
          <div className={styles.crLiveBar}>
            <span className={styles.crLiveDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.crUrlBar}>
              <LinkIcon size={12} />
              {CLIENT_REVIEW_SITE_URL}
            </span>
            <span className={styles.crNoAccount}>{CLIENT_REVIEW_NO_ACCOUNT}</span>
          </div>
          <div className={styles.crLiveBody} aria-hidden="true">
            <span className={styles.crLiveHero} />
            <span className={styles.crLiveLine} />
            <span className={`${styles.crLiveLine} ${styles.crLiveLineShort}`} />
          </div>
          <span
            className={`${styles.crApprove} ${styles.revealItem}`}
            style={revealDelayStyle(CLIENT_REVIEW_REVEAL_APPROVE_MS)}
          >
            <ShieldCheckIcon size={16} />
            {CLIENT_REVIEW_APPROVED}
          </span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Private Comments "two threads → toggle → client view" variant ----
   Left: one reviewed element carrying two threads — a marked-private team debate
   and the client thread's settled reply. Through the dashed arrow: the client's
   view, where the private thread has vanished, leaving one clean thread and the
   one settled answer. Only the private-comments page opts into this via
   solution.variant = "private-comments". */

const PRIVATE_SITE_URL = "your-site.com";
const PRIVATE_TEAM_SCOPE = "Only your Team";
const PRIVATE_VISIBLE_TO = "Visible to";
const PRIVATE_DEBATE_A = "Client chose this in March.";
const PRIVATE_DEBATE_B = "Escalating to the brand lead, then updating.";
const PRIVATE_CLIENT_REPLY = "Updated to your brand orange.";
const PRIVATE_CLIENT_VISIBLE = "Client-visible";
const PRIVATE_CLIENT_VIEW_LABEL = "Client view";
const PRIVATE_SETTLED_LABEL = "One settled answer";

/* Reveal delays (ms) sequencing the private-comments diagram left-to-right. */
const PRIVATE_REVEAL_ELEMENT_MS = 500;
const PRIVATE_REVEAL_CONNECTOR_MS = 900;
const PRIVATE_REVEAL_CLIENT_MS = 1050;
const PRIVATE_REVEAL_SETTLED_MS = 1350;

/**
 * Private Comments variant of the flow diagram (private-comments feature page):
 * one reviewed element carrying a marked-private team debate above the client
 * thread's settled reply on the left resolves — through the dashed arrow — into
 * the client's view on the right, where the private thread has vanished, leaving
 * one clean thread and an Approve cue. Entrances use the section's shared
 * `.revealItem` mechanism, so the whole thing stays prefers-reduced-motion safe.
 *
 * @returns The private-comments-flow element, or `null` on failure.
 */
function SolutionPrivateFlow(): ReactNode {
  try {
    return (
      <div className={styles.privateFlow}>
        <div
          className={`${styles.pcElement} ${styles.revealItem}`}
          style={revealDelayStyle(PRIVATE_REVEAL_ELEMENT_MS)}
        >
          <div className={styles.pcBar}>
            <span className={styles.pcDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.pcUrl}>{PRIVATE_SITE_URL}</span>
          </div>
          <div className={styles.pcBody}>
            <div className={styles.pcThreadPrivate}>
              <span className={styles.pcScopeChip}>
                <LockOpenIcon size={15} />
                <span className={styles.pcScopeLabel}>{PRIVATE_VISIBLE_TO}</span>
                <span className={styles.pcScopePill}>{PRIVATE_TEAM_SCOPE}</span>
              </span>
              <p className={styles.pcMsg}>{PRIVATE_DEBATE_A}</p>
              <p className={styles.pcMsg}>{PRIVATE_DEBATE_B}</p>
            </div>
            <div className={styles.pcThreadClient}>
              <span className={styles.pcClientTag}>
                <EyeIcon size={13} />
                {PRIVATE_CLIENT_VISIBLE}
              </span>
              <p className={styles.pcMsg}>{PRIVATE_CLIENT_REPLY}</p>
            </div>
          </div>
        </div>

        <SolutionConnector revealDelayMs={PRIVATE_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.pcClient} ${styles.revealItem}`}
          style={revealDelayStyle(PRIVATE_REVEAL_CLIENT_MS)}
        >
          <div className={styles.pcBar}>
            <span className={styles.pcDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.pcViewChip}>{PRIVATE_CLIENT_VIEW_LABEL}</span>
          </div>
          <div className={styles.pcClientBody}>
            <div className={styles.pcThreadClient}>
              <span className={styles.pcClientTag}>
                <EyeIcon size={13} />
                {PRIVATE_CLIENT_VISIBLE}
              </span>
              <p className={styles.pcMsg}>{PRIVATE_CLIENT_REPLY}</p>
              <span
                className={`${styles.pcSettled} ${styles.revealItem}`}
                style={revealDelayStyle(PRIVATE_REVEAL_SETTLED_MS)}
              >
                <CheckLineIcon size={15} />
                {PRIVATE_SETTLED_LABEL}
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

/* ---- White-label "one upload → toolbar + portal branded" variant ----
   Left: one logo file uploaded (the agency's mark). Through the dashed arrow:
   the two surfaces the brand lands on — the client-facing review toolbar and
   the internal admin portal navbar — both now carrying the agency's mark, with
   the Superflow mark it replaced shown faded on the upload card. Only the
   white-label page opts into this via solution.variant = "white-label". */

const WHITE_LABEL_HEADING_TEXT = "Your brand, everywhere they look.";
const WHITE_LABEL_SUBHEADING_TEXT =
  "Upload your logo once - the review toolbar your client sees and the admin panel your team runs both carry it.";
const WHITE_LABEL_UPLOAD_TITLE = "acme-logo.svg";
const WHITE_LABEL_UPLOAD_META = "One upload";
const WHITE_LABEL_REPLACES_LABEL = "replaces";
const WHITE_LABEL_CLIENT_NAME = "Acme Studio";
const WHITE_LABEL_TOOLBAR_LABEL = "Client toolbar";
const WHITE_LABEL_PORTAL_LABEL = "Admin portal";

/* Reveal delays (ms) sequencing the white-label diagram left-to-right. */
const WHITE_LABEL_REVEAL_UPLOAD_MS = 500;
const WHITE_LABEL_REVEAL_CONNECTOR_MS = 900;
const WHITE_LABEL_REVEAL_TOOLBAR_MS = 1050;
const WHITE_LABEL_REVEAL_PORTAL_MS = 1300;

/**
 * White-label variant of the flow diagram (white-label feature page): a single
 * logo upload on the left (the agency's mark replacing the faded Superflow one)
 * resolves — through the dashed arrow — into the two surfaces that now wear it:
 * the client-facing review toolbar and the internal admin portal navbar.
 * Entrances use the section's shared `.revealItem` mechanism, so the whole thing
 * stays prefers-reduced-motion safe.
 *
 * @returns The white-label-flow element, or `null` on failure.
 */
function SolutionWhiteLabelFlow(): ReactNode {
  try {
    return (
      <div className={styles.whiteLabelFlow}>
        <div
          className={`${styles.wlUpload} ${styles.revealItem}`}
          style={revealDelayStyle(WHITE_LABEL_REVEAL_UPLOAD_MS)}
        >
          <span className={styles.wlUploadIcon} aria-hidden="true">
            <UploadIcon size={22} />
          </span>
          <div className={styles.wlUploadMarks} aria-hidden="true">
            <span className={styles.wlUploadOld}>
              <SolutionSuperflowMark size={26} />
            </span>
            <span className={styles.wlUploadReplaces}>
              {WHITE_LABEL_REPLACES_LABEL}
            </span>
            <span className={styles.wlUploadNew}>
              <SolutionClientMark size={30} />
            </span>
          </div>
          <div className={styles.wlUploadText}>
            <span className={styles.wlUploadTitle}>{WHITE_LABEL_UPLOAD_TITLE}</span>
            <span className={styles.wlUploadMeta}>{WHITE_LABEL_UPLOAD_META}</span>
          </div>
        </div>

        <SolutionConnector revealDelayMs={WHITE_LABEL_REVEAL_CONNECTOR_MS} />

        <div className={styles.wlSurfaces}>
          <div
            className={`${styles.wlToolbar} ${styles.revealItem}`}
            style={revealDelayStyle(WHITE_LABEL_REVEAL_TOOLBAR_MS)}
          >
            <div className={styles.wlToolbarClip}>
              <div className={styles.wlToolbarInner}>
                <ReviewToolbar
                  brandMark={<SolutionClientMark size={26} />}
                />
              </div>
            </div>
            <span className={styles.wlToolbarCaption}>
              {WHITE_LABEL_TOOLBAR_LABEL}
            </span>
          </div>

          <div
            className={`${styles.wlPortal} ${styles.revealItem}`}
            style={revealDelayStyle(WHITE_LABEL_REVEAL_PORTAL_MS)}
          >
            <div className={styles.wlPortalTop}>
              <span className={styles.wlPortalLockup}>
                <SolutionClientMark size={20} />
                <span className={styles.wlPortalName}>{WHITE_LABEL_CLIENT_NAME}</span>
              </span>
              <span className={styles.wlSurfaceTag}>{WHITE_LABEL_PORTAL_LABEL}</span>
            </div>
            <span className={styles.wlPortalLine} aria-hidden="true" />
            <span
              className={`${styles.wlPortalLine} ${styles.wlPortalLineShort}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Kanban "review activity → the board updates itself" variant ----
   Left: a compact review-activity feed (a resolved thread, an agent finding, a
   client approval). Through the dashed arrow: one board where each event has
   already landed as a card in the right column, the Approved column lighting up
   as the approval arrives. Only the kanban-board page opts into this via
   solution.variant = "kanban". */

const KANBAN_HEADING_TEXT = "The pipeline, finally visible.";
const KANBAN_SUBHEADING_TEXT =
  "Every review, across every client, on one board that updates itself from review activity - no dragging.";
const KANBAN_ACTIVITY_LABEL = "Review activity";
const KANBAN_EVENT_RESOLVED = "Thread resolved";
const KANBAN_EVENT_FINDING = "Agent found 3 issues";
const KANBAN_EVENT_APPROVED = "Client approved";
const KANBAN_COL_OPEN = "Open";
const KANBAN_COL_REVIEW = "In review";
const KANBAN_COL_APPROVED = "Approved";

/* Reveal delays (ms) sequencing the kanban diagram left-to-right. */
const KANBAN_REVEAL_ACTIVITY_MS = 500;
const KANBAN_REVEAL_EVENT_STEP_MS = 90;
const KANBAN_REVEAL_CONNECTOR_MS = 950;
const KANBAN_REVEAL_BOARD_MS = 1100;
const KANBAN_REVEAL_LAND_MS = 1400;

/**
 * Activity/pulse glyph — the "review activity" start of the kanban variant's
 * header (activity → arrow → board).
 * @param size Square pixel dimension for the SVG.
 */
function ActivityIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M3 12h4l3 8l4 -16l3 8h4" />
    </SolutionIcon>
  );
}

/**
 * Kanban-columns glyph — the "one board" end of the kanban variant's header.
 * @param size Square pixel dimension for the SVG.
 */
function BoardColumnsIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </SolutionIcon>
  );
}

/** One row in the kanban activity feed: a toned icon + its label. */
interface KanbanEvent {
  id: string;
  label: string;
  icon: ReactNode;
  tone: string;
}

const KANBAN_EVENTS: readonly KanbanEvent[] = [
  {
    id: "resolved",
    label: KANBAN_EVENT_RESOLVED,
    icon: <CheckLineIcon size={16} />,
    tone: "#109534",
  },
  {
    id: "finding",
    label: KANBAN_EVENT_FINDING,
    icon: <RobotIcon size={16} />,
    tone: "#433df3",
  },
  {
    id: "approved",
    label: KANBAN_EVENT_APPROVED,
    icon: <ShieldCheckIcon size={16} />,
    tone: "#e0820a",
  },
];

/**
 * Kanban variant of the flow diagram (kanban-board feature page): a compact
 * review-activity feed on the left resolves — through the dashed arrow — into
 * one board on the right where each event has landed as a card, the Approved
 * column lighting up as the approval arrives. Entrances use the section's shared
 * `.revealItem` mechanism, so the whole thing stays prefers-reduced-motion safe.
 *
 * @returns The kanban-flow element, or `null` on failure.
 */
function SolutionKanbanFlow(): ReactNode {
  try {
    return (
      <div className={styles.kanbanFlow}>
        <div className={styles.kbActivity}>
          <span
            className={`${styles.kbActivityLabel} ${styles.revealItem}`}
            style={revealDelayStyle(KANBAN_REVEAL_ACTIVITY_MS)}
          >
            {KANBAN_ACTIVITY_LABEL}
          </span>
          <ul className={styles.kbEvents}>
            {KANBAN_EVENTS.map((event, eventIndex) => (
              <li
                key={event.id}
                className={`${styles.kbEvent} ${styles.revealItem}`}
                style={revealDelayStyle(
                  KANBAN_REVEAL_ACTIVITY_MS +
                    (eventIndex + 1) * KANBAN_REVEAL_EVENT_STEP_MS,
                )}
              >
                <span
                  className={styles.kbEventIcon}
                  style={{ color: event.tone }}
                  aria-hidden="true"
                >
                  {event.icon}
                </span>
                <span className={styles.kbEventText}>{event.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <SolutionConnector revealDelayMs={KANBAN_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.kbBoard} ${styles.revealItem}`}
          style={revealDelayStyle(KANBAN_REVEAL_BOARD_MS)}
        >
          <div className={styles.kbCol}>
            <span className={styles.kbColHead}>
              <span className={styles.kbDot} style={{ background: "#625df5" }} />
              {KANBAN_COL_OPEN}
            </span>
            <span className={styles.kbCard} />
            <span className={styles.kbCard} />
          </div>
          <div className={styles.kbCol}>
            <span className={styles.kbColHead}>
              <span className={styles.kbDot} style={{ background: "#e2a600" }} />
              {KANBAN_COL_REVIEW}
            </span>
            <span className={styles.kbCard} />
          </div>
          <div className={`${styles.kbCol} ${styles.kbColDone}`}>
            <span className={styles.kbColHead}>
              <span className={styles.kbDot} style={{ background: "#109534" }} />
              {KANBAN_COL_APPROVED}
            </span>
            <span
              className={`${styles.kbCard} ${styles.kbCardLand} ${styles.revealItem}`}
              style={revealDelayStyle(KANBAN_REVEAL_LAND_MS)}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Review Workflows "in your head → one visual flow" variant ----
   Left: the process as it lives today — a loose stack of slightly-rotated step
   notes ("in your head"). Through the dashed arrow: one ordered visual flow - 
   push → AI agents → team review → client gate — as tidy toned node rows. Only
   the review-workflows page opts into this via solution.variant =
   "review-workflows". */

const REVIEW_WF_HEADING_TEXT = "The process, out of your head.";
const REVIEW_WF_SUBHEADING_TEXT =
  "Put your reviewers and AI agents in one visual flow - conditions move work forward, and the client gate comes last.";

/** Authenticated Pages variant heading/subheading defaults (CMS overrides at runtime). */
const AUTH_HEADING_TEXT = "Both halves of the work, reviewed";
const AUTH_SUBHEADING_TEXT =
  "Superflow installs on the site itself, so review runs behind passwords, Okta, and SSO - wherever the viewer is logged in.";

/** Recordings variant heading/subheading defaults (CMS overrides at runtime). */
const RECORDINGS_HEADING_TEXT = "Some feedback is faster said than typed.";
const RECORDINGS_SUBHEADING_TEXT =
  "Record your screen, camera, or voice right where you review - and it lands as a pinned comment your team can watch in context.";
const REVIEW_WF_MESSY_LABEL = "In your head";
const REVIEW_WF_FLOW_LABEL = "One visual flow";

/** The loose, unordered steps the process lives as before the flow. */
const REVIEW_WF_LOOSE_STEPS: readonly string[] = [
  "Run the checks?",
  "Ask Dana to review",
  "Wait… then chase",
  "Send to the client",
];

/**
 * Lightning-bolt glyph — the push trigger that starts the flow.
 * @param size Square pixel dimension for the SVG.
 */
function BoltIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
    </SolutionIcon>
  );
}

/**
 * Two-people glyph — the human review step.
 * @param size Square pixel dimension for the SVG.
 */
function UsersIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
    </SolutionIcon>
  );
}

/**
 * Person-with-check glyph — the client gate (the recorded approval).
 * @param size Square pixel dimension for the SVG.
 */
function UserCheckIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" />
      <path d="M15 19l2 2l4 -4" />
    </SolutionIcon>
  );
}

/**
 * Route/flow glyph — two steps merging into one path — the "after" side of the
 * review-workflows header cue.
 * @param size Square pixel dimension for the SVG.
 */
function RouteIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <path d="M5 6m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0" />
      <path d="M5 18m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0" />
      <path d="M18 12m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0" />
      <path d="M7.3 7.1l8 3.7" />
      <path d="M7.3 16.9l8 -3.7" />
    </SolutionIcon>
  );
}

/** One ordered node row in the review-workflows flow. */
interface ReviewWfNode {
  id: string;
  label: string;
  icon: ReactNode;
  tone: string;
}

const REVIEW_WF_NODES: readonly ReviewWfNode[] = [
  { id: "push", label: "Push trigger", icon: <BoltIcon size={18} />, tone: "#e0820a" },
  { id: "agents", label: "AI agents", icon: <RobotIcon size={18} />, tone: "#433df3" },
  { id: "review", label: "Team review", icon: <UsersIcon size={18} />, tone: "#2f6bf5" },
  { id: "gate", label: "Client gate", icon: <UserCheckIcon size={18} />, tone: "#0f9d8e" },
];

/* Reveal delays (ms) sequencing the review-workflows diagram left-to-right. */
const REVIEW_WF_REVEAL_MESSY_MS = 500;
const REVIEW_WF_REVEAL_STEP_MS = 80;
const REVIEW_WF_REVEAL_CONNECTOR_MS = 950;
const REVIEW_WF_REVEAL_FLOW_MS = 1100;
const REVIEW_WF_REVEAL_NODE_BASE_MS = 1250;
const REVIEW_WF_REVEAL_NODE_STEP_MS = 90;

/**
 * Review Workflows variant of the flow diagram (review-workflows feature page):
 * the process as loose, unordered step notes ("in your head") on the left
 * resolves — through the dashed arrow — into one ordered visual flow on the
 * right (push → AI agents → team review → client gate). Entrances use the
 * section's shared `.revealItem` mechanism, so the whole thing stays
 * prefers-reduced-motion safe.
 *
 * @returns The review-workflows-flow element, or `null` on failure.
 */
function SolutionReviewWorkflowFlow(): ReactNode {
  try {
    return (
      <div className={styles.reviewWfFlow}>
        <div
          className={`${styles.rwfMessy} ${styles.revealItem}`}
          style={revealDelayStyle(REVIEW_WF_REVEAL_MESSY_MS)}
        >
          <span className={styles.rwfMessyLabel}>{REVIEW_WF_MESSY_LABEL}</span>
          <div className={styles.rwfChips}>
            {REVIEW_WF_LOOSE_STEPS.map((step, stepIndex) => (
              <span
                key={step}
                className={`${styles.rwfChip} ${styles.revealItem}`}
                style={revealDelayStyle(
                  REVIEW_WF_REVEAL_MESSY_MS +
                    (stepIndex + 1) * REVIEW_WF_REVEAL_STEP_MS,
                )}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <SolutionConnector revealDelayMs={REVIEW_WF_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.rwfFlow} ${styles.revealItem}`}
          style={revealDelayStyle(REVIEW_WF_REVEAL_FLOW_MS)}
        >
          <span className={styles.rwfFlowLabel}>{REVIEW_WF_FLOW_LABEL}</span>
          <ul className={styles.rwfNodes}>
            {REVIEW_WF_NODES.map((node, nodeIndex) => (
              <li
                key={node.id}
                className={`${styles.rwfNode} ${styles.revealItem}`}
                style={revealDelayStyle(
                  REVIEW_WF_REVEAL_NODE_BASE_MS +
                    nodeIndex * REVIEW_WF_REVEAL_NODE_STEP_MS,
                )}
              >
                <span
                  className={styles.rwfNodeIcon}
                  style={{ color: node.tone }}
                  aria-hidden="true"
                >
                  {node.icon}
                </span>
                <span className={styles.rwfNodeLabel}>{node.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Authenticated Pages "behind the login → reviewed in place" variant ----
   Left: a compact auth-gate card (padlock + auth-method chips). Through the
   dashed arrow: a small browser card with a Superflow comment pin and an
   "In the viewer's session" green pill. Only the authenticated-pages feature
   page opts into this via solution.variant = "authenticated-pages". */

/** Auth-gate card label. */
const AUTH_GATE_LABEL = "Behind the login";
/** Auth methods shown as toned chips in the gate card. */
const AUTH_METHODS: readonly string[] = ["Password", "Okta", "SSO / SAML"];
/** Browser page label. */
const AUTH_PAGE_LABEL = "Reviewed in place";
/** Green session pill copy. */
const AUTH_SESSION_PILL = "In the viewer's session";
/** Placeholder URL shown in the auth-page browser bar. */
const AUTH_SITE_URL = "your-site.com";

/* Reveal delays (ms) sequencing the authenticated-pages diagram left-to-right. */
const AUTH_REVEAL_GATE_MS = 500;
const AUTH_REVEAL_METHOD_STEP_MS = 80;
const AUTH_REVEAL_CONNECTOR_MS = 950;
const AUTH_REVEAL_PAGE_MS = 1100;
const AUTH_REVEAL_PIN_MS = 1350;

/**
 * Closed padlock glyph for the authenticated-pages gate card.
 * @param size Square pixel dimension for the SVG.
 */
function LockClosedIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15v2.5" />
    </SolutionIcon>
  );
}

/**
 * Video-camera glyph for the recordings variant (header cue + "Camera" capture
 * option): a rounded frame with a lens notch on the right.
 * @param size Square pixel dimension for the SVG.
 */
function VideoCamIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="7" width="12" height="10" rx="2.5" />
      <path d="M15 10.5 20.5 7v10L15 13.5" />
    </SolutionIcon>
  );
}

/**
 * Microphone glyph for the recordings variant's "Voice" capture option.
 * @param size Square pixel dimension for the SVG.
 */
function MicIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
    </SolutionIcon>
  );
}

/**
 * Screen-share glyph for the recordings variant's "Screen" capture option: a
 * monitor with an up arrow signalling a live capture.
 * @param size Square pixel dimension for the SVG.
 */
function ScreenShareIcon({ size }: IconProps): ReactNode {
  return (
    <SolutionIcon size={size}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 9.5v4.5M12 9.5 9.75 11.75M12 9.5l2.25 2.25" />
    </SolutionIcon>
  );
}

/**
 * Filled play triangle for the pinned recording clip in the recordings flow.
 * Unlike the stroke-only {@link SolutionIcon} glyphs this is a solid mark so it
 * reads as a real play button on the tinted clip chip.
 * @param size Square pixel dimension for the SVG.
 */
function PlayTriangleIcon({ size }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

/**
 * Authenticated Pages variant of the flow diagram (authenticated-pages feature
 * page): a compact auth-gate card on the left (padlock + Password / Okta /
 * SSO-SAML chips) resolves — through the dashed arrow — into a small browser
 * card on the right carrying a Superflow comment pin and a green
 * "In the viewer's session" pill. Entrances use the section's shared
 * `.revealItem` mechanism, so the whole thing stays prefers-reduced-motion safe.
 *
 * @returns The authenticated-pages-flow element, or `null` on failure.
 */
function SolutionAuthenticatedFlow(): ReactNode {
  try {
    return (
      <div className={styles.authFlow}>
        <div
          className={`${styles.authGate} ${styles.revealItem}`}
          style={revealDelayStyle(AUTH_REVEAL_GATE_MS)}
        >
          <span className={styles.authGateIcon} aria-hidden="true">
            <LockClosedIcon size={22} />
          </span>
          <ul className={styles.authMethods}>
            {AUTH_METHODS.map((method, methodIndex) => (
              <li
                key={method}
                className={`${styles.authMethod} ${styles.revealItem}`}
                style={revealDelayStyle(
                  AUTH_REVEAL_GATE_MS +
                    (methodIndex + 1) * AUTH_REVEAL_METHOD_STEP_MS,
                )}
              >
                {method}
              </li>
            ))}
          </ul>
          <span className={styles.authGateLabel}>{AUTH_GATE_LABEL}</span>
        </div>

        <SolutionConnector revealDelayMs={AUTH_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.authPage} ${styles.revealItem}`}
          style={revealDelayStyle(AUTH_REVEAL_PAGE_MS)}
        >
          <div className={styles.authPageBar}>
            <span className={styles.authPageDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.authPageUrl}>{AUTH_SITE_URL}</span>
          </div>
          <div className={styles.authPageBody} aria-hidden="true">
            <span className={styles.authPageHero} />
            <div className={styles.authPageLines}>
              <span className={styles.authPageLine} />
              <span className={`${styles.authPageLine} ${styles.authPageLineShort}`} />
            </div>
            <span
              className={`${styles.authPin} ${styles.revealItem}`}
              style={revealDelayStyle(AUTH_REVEAL_PIN_MS)}
              aria-hidden="true"
            />
          </div>
          <span
            className={`${styles.authSessionPill} ${styles.revealItem}`}
            style={revealDelayStyle(AUTH_REVEAL_PIN_MS)}
          >
            <CheckLineIcon size={13} />
            {AUTH_SESSION_PILL}
          </span>
          <span className={styles.authPageLabel}>{AUTH_PAGE_LABEL}</span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Recordings "capture it → pinned as a comment" variant ----
   Left: a compact capture card (a "Record" label over Screen / Camera / Voice
   option rows, each tinted by capture kind). Through the dashed arrow: a small
   browser card carrying a tinted recording clip (play triangle + duration) and
   a green "Pinned as a comment" pill. Only the recordings feature page opts into
   this via solution.variant = "recordings". Borders + soft lift, no heavy
   shadows — matches the other flow diagrams. */

/** Capture-card label. */
const RECORDINGS_CAPTURE_LABEL = "Record";
/** Browser page label. */
const RECORDINGS_PAGE_LABEL = "Pinned in place";
/** Green pill copy shown once the clip lands on the page. */
const RECORDINGS_PINNED_PILL = "Pinned as a comment";
/** Duration shown on the pinned recording clip. */
const RECORDINGS_CLIP_TIME = "00:40";
/** Placeholder URL shown in the recordings browser bar. */
const RECORDINGS_SITE_URL = "your-site.com";

/**
 * Capture options shown in the recordings capture card. Each pairs a glyph with
 * a capture-kind tint so the three ways to record (screen / camera / voice) read
 * at a glance.
 */
const RECORDINGS_OPTIONS: readonly {
  id: string;
  label: string;
  tone: string;
  icon: (size: number) => ReactNode;
}[] = [
  {
    id: "screen",
    label: "Screen",
    tone: "#433df3",
    icon: (size) => <ScreenShareIcon size={size} />,
  },
  {
    id: "camera",
    label: "Camera",
    tone: "#c026d3",
    icon: (size) => <VideoCamIcon size={size} />,
  },
  {
    id: "voice",
    label: "Voice",
    tone: "#0d9f4f",
    icon: (size) => <MicIcon size={size} />,
  },
];

/* Reveal delays (ms) sequencing the recordings diagram left-to-right. */
const RECORDINGS_REVEAL_CAPTURE_MS = 500;
const RECORDINGS_REVEAL_OPTION_STEP_MS = 90;
const RECORDINGS_REVEAL_CONNECTOR_MS = 950;
const RECORDINGS_REVEAL_PAGE_MS = 1100;
const RECORDINGS_REVEAL_CLIP_MS = 1350;

/**
 * Recordings variant of the flow diagram (recordings feature page): a compact
 * capture card on the left (a "Record" label over Screen / Camera / Voice option
 * rows) resolves — through the dashed arrow — into a small browser card on the
 * right carrying a tinted recording clip (play triangle + duration) and a green
 * "Pinned as a comment" pill. Entrances use the section's shared `.revealItem`
 * mechanism, so the whole thing stays prefers-reduced-motion safe.
 *
 * @returns The recordings-flow element, or `null` on failure.
 */
function SolutionRecordingsFlow(): ReactNode {
  try {
    return (
      <div className={styles.recordingsFlow}>
        <div
          className={`${styles.recCapture} ${styles.revealItem}`}
          style={revealDelayStyle(RECORDINGS_REVEAL_CAPTURE_MS)}
        >
          <span className={styles.recCaptureLabel}>
            <span className={styles.recCaptureDot} aria-hidden="true" />
            {RECORDINGS_CAPTURE_LABEL}
          </span>
          <ul className={styles.recOptions}>
            {RECORDINGS_OPTIONS.map((option, optionIndex) => (
              <li
                key={option.id}
                className={`${styles.recOption} ${styles.revealItem}`}
                style={revealDelayStyle(
                  RECORDINGS_REVEAL_CAPTURE_MS +
                    (optionIndex + 1) * RECORDINGS_REVEAL_OPTION_STEP_MS,
                )}
              >
                <span
                  className={styles.recOptionIcon}
                  style={{ color: option.tone }}
                  aria-hidden="true"
                >
                  {option.icon(18)}
                </span>
                <span className={styles.recOptionText}>{option.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <SolutionConnector revealDelayMs={RECORDINGS_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.recPage} ${styles.revealItem}`}
          style={revealDelayStyle(RECORDINGS_REVEAL_PAGE_MS)}
        >
          <div className={styles.browserBar}>
            <span className={styles.browserDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.browserUrl}>{RECORDINGS_SITE_URL}</span>
          </div>
          <div className={styles.browserBody} aria-hidden="true">
            <div className={styles.recVideo}>
              <span
                className={`${styles.recVideoPlay} ${styles.revealItem}`}
                style={revealDelayStyle(RECORDINGS_REVEAL_CLIP_MS)}
              >
                <PlayTriangleIcon size={16} />
              </span>
              <span
                className={`${styles.recVideoTime} ${styles.revealItem}`}
                style={revealDelayStyle(RECORDINGS_REVEAL_CLIP_MS)}
              >
                {RECORDINGS_CLIP_TIME}
              </span>
            </div>
            <div className={styles.browserLines}>
              <span className={styles.browserLine} />
              <span className={`${styles.browserLine} ${styles.browserLineMid}`} />
              <span
                className={`${styles.browserLine} ${styles.browserLineShort}`}
              />
            </div>
            <span
              className={`${styles.recPin} ${styles.revealItem}`}
              style={revealDelayStyle(RECORDINGS_REVEAL_CLIP_MS)}
            />
          </div>
          <span
            className={`${styles.recPinnedPill} ${styles.revealItem}`}
            style={revealDelayStyle(RECORDINGS_REVEAL_CLIP_MS)}
          >
            <CheckLineIcon size={13} />
            {RECORDINGS_PINNED_PILL}
          </span>
          <span className={styles.recPageLabel}>{RECORDINGS_PAGE_LABEL}</span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ---- Screenshots "comment captures the page → snapshot outlives it" variant ----
   Left: a compact captured-page card (browser mini + comment pin + a green
   camera "Snapshot saved" pill). Through the dashed arrow: a then/now stack - 
   a faint "Live · changed" card (its anchor lost) behind the solid saved
   snapshot with a green "As reviewed" marker. Only the screenshots feature
   page opts into this via solution.variant = "screenshots". Borders only, no
   drop shadows. */

/** Captured-page column label. */
const SHOT_CAPTURE_LABEL = "Comment captures the page";
/** Green "snapshot saved" pill copy. */
const SHOT_SAVED_PILL = "Snapshot saved";
/** Then/now stack label. */
const SHOT_STACK_LABEL = "The snapshot outlives it";
/** Faint "live, changed" card tag. */
const SHOT_LIVE_TAG = "Live \u00b7 changed";
/** Green "as reviewed" marker on the saved snapshot. */
const SHOT_AS_REVIEWED = "As reviewed";
/** Placeholder URL shown in the captured-page browser bar. */
const SHOT_SITE_URL = "your-site.com";

/* Reveal delays (ms) sequencing the screenshots diagram left-to-right. */
const SHOT_REVEAL_CAPTURE_MS = 500;
const SHOT_REVEAL_CONNECTOR_MS = 950;
const SHOT_REVEAL_STACK_MS = 1100;
const SHOT_REVEAL_MARKER_MS = 1350;

/**
 * Screenshots variant of the flow diagram (screenshots feature page): a compact
 * captured-page card on the left (browser mini + comment pin + a green camera
 * "Snapshot saved" pill) resolves — through the dashed arrow — into a then/now
 * stack on the right: a faint "Live · changed" card (its anchor lost) behind
 * the solid saved snapshot carrying a green "As reviewed" marker. Entrances use
 * the section's shared `.revealItem` mechanism, so it stays
 * prefers-reduced-motion safe.
 *
 * @returns The screenshots-flow element, or `null` on failure.
 */
function SolutionScreenshotsFlow(): ReactNode {
  try {
    return (
      <div className={styles.shotFlow}>
        <div
          className={`${styles.shotCapture} ${styles.revealItem}`}
          style={revealDelayStyle(SHOT_REVEAL_CAPTURE_MS)}
        >
          <div className={styles.shotCard}>
            <div className={styles.shotCardBar} aria-hidden="true">
              <span className={styles.shotCardDots}>
                <span />
                <span />
                <span />
              </span>
              <span className={styles.shotCardUrl}>{SHOT_SITE_URL}</span>
            </div>
            <div className={styles.shotCardBody} aria-hidden="true">
              <span className={styles.shotCardMedia} />
              <span className={styles.shotCardLines}>
                <span className={styles.shotCardLine} />
                <span className={`${styles.shotCardLine} ${styles.shotCardLineShort}`} />
              </span>
              <span className={styles.shotCardPin} />
            </div>
          </div>
          <span className={styles.shotSavedPill}>
            <CameraIcon size={14} />
            {SHOT_SAVED_PILL}
          </span>
          <span className={styles.shotColLabel}>{SHOT_CAPTURE_LABEL}</span>
        </div>

        <SolutionConnector revealDelayMs={SHOT_REVEAL_CONNECTOR_MS} />

        <div
          className={`${styles.shotStack} ${styles.revealItem}`}
          style={revealDelayStyle(SHOT_REVEAL_STACK_MS)}
        >
          <div className={styles.shotStackInner}>
            <div className={styles.shotLive} aria-hidden="true">
              <span className={styles.shotLiveTag}>{SHOT_LIVE_TAG}</span>
              <span className={styles.shotLiveGhost} />
            </div>
            <div className={styles.shotSnap}>
              <span className={styles.shotSnapMedia} aria-hidden="true" />
              <span className={styles.shotSnapLines} aria-hidden="true">
                <span className={styles.shotSnapLine} />
                <span className={`${styles.shotSnapLine} ${styles.shotSnapLineShort}`} />
              </span>
              <span className={styles.shotSnapPin} aria-hidden="true" />
              <span
                className={`${styles.shotMarker} ${styles.revealItem}`}
                style={revealDelayStyle(SHOT_REVEAL_MARKER_MS)}
              >
                <CameraIcon size={13} />
                {SHOT_AS_REVIEWED}
              </span>
            </div>
          </div>
          <span className={styles.shotColLabel}>{SHOT_STACK_LABEL}</span>
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
  variant?:
    | "checklist"
    | "comments"
    | "memory-guidelines"
    | "ask-ai"
    | "analytics"
    | "client-review"
    | "private-comments"
    | "white-label"
    | "kanban"
    | "review-workflows"
    | "authenticated-pages"
    | "screenshots"
    | "recordings";
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
    if (variant === "analytics") {
      return (
        <>
          <span className={styles.headerIconChart}>
            <ChartIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconSparkles}>
            <SparklesIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "client-review") {
      return (
        <>
          <span className={styles.headerIconLink}>
            <LinkIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconCheck}>
            <ShieldCheckIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "private-comments") {
      return (
        <>
          <span className={styles.headerIconLock}>
            <LockOpenIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconEye}>
            <EyeIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "white-label") {
      return (
        <>
          <span className={styles.headerIconUpload}>
            <UploadIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconWindow}>
            <WindowIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "kanban") {
      return (
        <>
          <span className={styles.headerIconActivity}>
            <ActivityIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconBoard}>
            <BoardColumnsIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "review-workflows") {
      return (
        <>
          <span className={styles.headerIconScatter}>
            <GrainIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconRoute}>
            <RouteIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "authenticated-pages") {
      return (
        <>
          <span className={styles.headerIconLock}>
            <LockOpenIcon size={HEADER_GLYPH_SIZE} />
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
    if (variant === "screenshots") {
      return (
        <>
          <span className={styles.headerIconCamera}>
            <CameraIcon size={HEADER_GLYPH_SIZE} />
          </span>
          <span className={styles.headerIconArrow}>
            <ArrowRightIcon size={22} />
          </span>
          <span className={styles.headerIconArchive}>
            <ArchiveIcon size={HEADER_GLYPH_SIZE} />
          </span>
        </>
      );
    }
    if (variant === "recordings") {
      return (
        <>
          <span className={styles.headerIconVideo}>
            <VideoCamIcon size={HEADER_GLYPH_SIZE} />
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
  const isAnalytics = variant === "analytics";
  const isClientReview = variant === "client-review";
  const isPrivate = variant === "private-comments";
  const isWhiteLabel = variant === "white-label";
  const isKanban = variant === "kanban";
  const isReviewWorkflows = variant === "review-workflows";
  const isAuthenticated = variant === "authenticated-pages";
  const isScreenshots = variant === "screenshots";
  const isRecordings = variant === "recordings";
  const defaultHeading = isComments
    ? COMMENTS_HEADING_TEXT
    : isAskAi
      ? ASK_AI_HEADING_TEXT
      : isAnalytics
        ? ANALYTICS_HEADING_TEXT
        : isClientReview
          ? CLIENT_REVIEW_HEADING_TEXT
          : isPrivate
            ? PRIVATE_HEADING_TEXT
            : isWhiteLabel
              ? WHITE_LABEL_HEADING_TEXT
              : isKanban
                ? KANBAN_HEADING_TEXT
                : isReviewWorkflows
                  ? REVIEW_WF_HEADING_TEXT
                  : isAuthenticated
                    ? AUTH_HEADING_TEXT
                    : isScreenshots
                      ? SCREENSHOTS_HEADING_TEXT
                      : isRecordings
                        ? RECORDINGS_HEADING_TEXT
                        : HEADING_TEXT;
  const defaultSubheading = isComments
    ? COMMENTS_SUBHEADING_TEXT
    : isAskAi
      ? ASK_AI_SUBHEADING_TEXT
      : isAnalytics
        ? ANALYTICS_SUBHEADING_TEXT
        : isClientReview
          ? CLIENT_REVIEW_SUBHEADING_TEXT
          : isPrivate
            ? PRIVATE_SUBHEADING_TEXT
            : isWhiteLabel
              ? WHITE_LABEL_SUBHEADING_TEXT
              : isKanban
                ? KANBAN_SUBHEADING_TEXT
                : isReviewWorkflows
                  ? REVIEW_WF_SUBHEADING_TEXT
                  : isAuthenticated
                    ? AUTH_SUBHEADING_TEXT
                    : isScreenshots
                      ? SCREENSHOTS_SUBHEADING_TEXT
                      : isRecordings
                        ? RECORDINGS_SUBHEADING_TEXT
                        : SUBHEADING_TEXT;
  const headingText = heading ?? defaultHeading;
  const subheadingText = subheading ?? defaultSubheading;

  return (
    <section className={styles.section} data-section="solution">
      <SolutionSectionReveal>
        <BlueprintFrame />
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
          {variant === "analytics" ? (
            <SolutionAnalyticsInsights />
          ) : variant === "client-review" ? (
            <SolutionClientReviewFlow />
          ) : variant === "private-comments" ? (
            <SolutionPrivateFlow />
          ) : variant === "white-label" ? (
            <SolutionWhiteLabelFlow />
          ) : variant === "kanban" ? (
            <SolutionKanbanFlow />
          ) : variant === "review-workflows" ? (
            <SolutionReviewWorkflowFlow />
          ) : variant === "authenticated-pages" ? (
            <SolutionAuthenticatedFlow />
          ) : variant === "screenshots" ? (
            <SolutionScreenshotsFlow />
          ) : variant === "recordings" ? (
            <SolutionRecordingsFlow />
          ) : variant === "ask-ai" ? (
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
