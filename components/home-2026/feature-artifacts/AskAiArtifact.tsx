import type { CSSProperties, ReactNode } from "react";
import styles from "./AskAiArtifact.module.css";

/**
 * Feature-section artifact — "Ask AI".
 * Figma: node 775:2983 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * A chat/conversation UI for the "Ask AI" state: a right-aligned user message
 * bubble ("Tell me common client issues") answered by a left-aligned assistant
 * turn (avatar + response bubble). The assistant's reply holds the mixed-weight
 * "Copy Issues are the most common…" breakdown — a three-segment stacked
 * progress bar (red / amber / purple) and a colour-dotted legend of the
 * percentages — and a rounded "Ask the review history anything…" input bar is
 * pinned at the bottom to complete the chat feel.
 *
 * Laid out at the siblings' native type scale (14–18px) inside the panel's
 * visible 631px frame, so it needs no transform-scale hack; the root fills its
 * container and clips any bleed.
 */

const PROMPT_TEXT = "Tell me common client issues";

/** Heading is split into a bold lead and a regular remainder (per Figma). */
const HEADING_LEAD = "Copy Issues";
const HEADING_REST = " are the most common, Here is a breakdown";

/** Placeholder shown in the chat input bar (echoes the tab's one-liner). */
const INPUT_PLACEHOLDER = "Ask the review history anything…";

/** Breakdown slice labels — three distinct copy-issue categories. */
const LABEL_PLACEHOLDER_TEXT = "Placeholder Text";
const LABEL_INCORRECT_NAMES = "Incorrect Names";
const LABEL_TYPOS_GRAMMAR = "Typos & Grammar";

/** Slice ids, shared between the progress bar and its legend to stay in sync. */
const SLICE_PLACEHOLDER_TEXT = "placeholder-text";
const SLICE_INCORRECT_NAMES = "incorrect-names";
const SLICE_TYPOS_GRAMMAR = "typos-grammar";

/** Exact segment/dot fills from the Figma design. */
const COLOR_RED = "#ff5352";
const COLOR_AMBER = "#f4ad3b";
const COLOR_PURPLE = "#a560ff";

/** Tabler `arrow-up` — the send-button glyph. */
const SEND_PATHS: readonly string[] = [
  "M12 5l0 14",
  "M18 11l-6 -6",
  "M6 11l6 -6",
];

/** A single segment of the stacked progress bar. */
type ProgressSegment = {
  id: string;
  color: string;
  /** Relative flex weight (5 / 3 / 2 reproduces the 50% / 30% / 20% split). */
  flex: number;
};

/** A single legend row: coloured dot, label, and percentage value. */
type LegendRow = {
  id: string;
  color: string;
  label: string;
  value: string;
};

/**
 * Progress-bar segments, left to right. Weights mirror the 50/30/20 breakdown
 * so the bar stays proportional at any bubble width.
 */
const PROGRESS_SEGMENTS: readonly ProgressSegment[] = [
  { id: SLICE_PLACEHOLDER_TEXT, color: COLOR_RED, flex: 5 },
  { id: SLICE_INCORRECT_NAMES, color: COLOR_AMBER, flex: 3 },
  { id: SLICE_TYPOS_GRAMMAR, color: COLOR_PURPLE, flex: 2 },
];

/** Legend rows describing each breakdown slice. */
const LEGEND_ROWS: readonly LegendRow[] = [
  {
    id: SLICE_PLACEHOLDER_TEXT,
    color: COLOR_RED,
    label: LABEL_PLACEHOLDER_TEXT,
    value: "50%",
  },
  {
    id: SLICE_INCORRECT_NAMES,
    color: COLOR_AMBER,
    label: LABEL_INCORRECT_NAMES,
    value: "30%",
  },
  {
    id: SLICE_TYPOS_GRAMMAR,
    color: COLOR_PURPLE,
    label: LABEL_TYPOS_GRAMMAR,
    value: "20%",
  },
];

/**
 * 24×24 Tabler-style stroke icon (currentColor stroke, round caps/joins).
 *
 * @param props - Rendered pixel size and the list of path definitions.
 * @returns The configured stroke `<svg>` element.
 */
function StrokeGlyph({
  size,
  paths,
}: {
  size: number;
  paths: readonly string[];
}): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((definition) => (
        <path key={definition} d={definition} />
      ))}
    </svg>
  );
}

/**
 * Assistant avatar — a glossy blue sphere (Figma group 582:331). Rendered as
 * the clean circular AI avatar beside the assistant's reply. The internal ids
 * are suffixed `_582_331` to stay unique against other inline SVGs on the page.
 *
 * @param props - Rendered pixel size of the sphere.
 * @returns The avatar `<svg>` element.
 */
function AssistantAvatar({ size }: { size: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <g clipPath="url(#clip0_582_331)">
        <rect width="20" height="20" rx="10" fill="#48A8F0" />
        <g filter="url(#filter0_f_582_331)">
          <circle cx="7.5" cy="6.875" r="5.625" fill="#294086" />
        </g>
        <g filter="url(#filter1_f_582_331)">
          <circle cx="15.625" cy="15" r="5" fill="#FEFEFF" />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_f_582_331"
          x="-5.625"
          y="-6.25"
          width="26.25"
          height="26.25"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3.75"
            result="effect1_foregroundBlur_582_331"
          />
        </filter>
        <filter
          id="filter1_f_582_331"
          x="3.125"
          y="2.5"
          width="25"
          height="25"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3.75"
            result="effect1_foregroundBlur_582_331"
          />
        </filter>
        <clipPath id="clip0_582_331">
          <rect width="20" height="20" rx="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Render one segment of the stacked progress bar.
 *
 * @param segment - The segment colour and relative flex weight.
 * @returns The segment element.
 */
function ProgressSegmentView({ segment }: { segment: ProgressSegment }) {
  const segmentStyle: CSSProperties = {
    background: segment?.color,
    flex: `${segment?.flex ?? 1} 1 0`,
  };
  return <span className={styles.segment} style={segmentStyle} />;
}

/**
 * Render one legend row: a coloured dot with its label and percentage value.
 *
 * @param row - The legend row content.
 * @returns The legend row element.
 */
function LegendRowView({ row }: { row: LegendRow }) {
  return (
    <div className={styles.legendRow}>
      <span className={styles.legendLeft}>
        <span
          className={styles.legendDot}
          style={{ background: row?.color }}
          aria-hidden="true"
        />
        <span className={styles.legendLabel}>{row?.label}</span>
      </span>
      <span className={styles.legendValue}>{row?.value}</span>
    </div>
  );
}

/**
 * Render the "Ask AI" feature artifact as a chat conversation.
 *
 * @returns The Ask AI window contents.
 */
export default function AskAiArtifact() {
  return (
    <div className={styles.root} data-artifact="ask-ai">
      <div className={styles.chat}>
        <div className={styles.thread}>
          <div className={styles.userRow}>
            <div className={styles.userBubble}>
              <p className={styles.userText}>{PROMPT_TEXT}</p>
            </div>
          </div>

          <div className={styles.assistantRow}>
            <span className={styles.assistantAvatar} aria-hidden="true">
              <AssistantAvatar size={34} />
            </span>

            <div className={styles.assistantBubble}>
              <p className={styles.heading}>
                <span className={styles.headingLead}>{HEADING_LEAD}</span>
                <span className={styles.headingRest}>{HEADING_REST}</span>
              </p>

              <div className={styles.breakdown}>
                <div className={styles.progressBar} aria-hidden="true">
                  {PROGRESS_SEGMENTS.map((segment) => (
                    <ProgressSegmentView key={segment?.id} segment={segment} />
                  ))}
                </div>

                <div className={styles.legend}>
                  {LEGEND_ROWS.map((row) => (
                    <LegendRowView key={row?.id} row={row} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inputBar}>
          <p className={styles.inputText}>{INPUT_PLACEHOLDER}</p>
          <span className={styles.sendButton} aria-hidden="true">
            <StrokeGlyph size={18} paths={SEND_PATHS} />
          </span>
        </div>
      </div>
    </div>
  );
}
