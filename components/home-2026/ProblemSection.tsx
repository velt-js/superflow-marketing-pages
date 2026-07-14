import Image from "next/image";
import { Fragment, type ReactElement } from "react";
import styles from "./ProblemSection.module.css";
import ProblemSectionClock, {
  type ProblemSectionHeadline,
} from "./ProblemSectionClock";

/** Custom "Fully Automated" mark exported from Figma node 582:3925 (gradient stroke). */
const FULLY_AUTOMATED_ICON_SRC = "/images/home-2026/problem/fully-automated.svg";

/** Exact copy taken from the Figma "02 / Problem Section" node (582:3592). */
const COPY = {
  callout: "If a senior person still checks every site by hand, Superflow is for you.",
  youAreHere: "You are here",
  comeHere: "Come here with Superflow",
} as const;

const HEADING_ID = "problem-heading";

/**
 * Per-page overrides for the Problem section. Omit any field to fall back to
 * the homepage default (so /home-preview renders unchanged).
 */
export interface ProblemSectionProps {
  headline?: ProblemSectionHeadline;
  callout?: string;
}

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, inherit colour via currentColor)                 */
/* ------------------------------------------------------------------ */

interface IconProps {
  className?: string;
}

const ICON_BASE_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Hammer glyph for the "All manual" stage. */
function HammerIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} {...ICON_BASE_PROPS}>
      <path d="M11.4 10L4 17.4a2.1 2.1 0 0 0 3 3l7.4-7.4" />
      <path d="M18.1 15.3l2.6-2.6a1 1 0 0 0 0-1.4l-7.6-7.6a1 1 0 0 0-1.4 0L9.1 6.3a1 1 0 0 0 0 1.4l7.6 7.6a1 1 0 0 0 1.4 0z" />
    </svg>
  );
}

/** Winking smiley for the "Human-in-the-loop" stage. */
function WinkIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} {...ICON_BASE_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01" />
      <path d="M14.5 10h3" />
      <path d="M9 14.5a4 4 0 0 0 6 0" />
    </svg>
  );
}

/** Interlocking-brick glyph for the "AI-Assisted" stage. */
function LegoIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} {...ICON_BASE_PROPS}>
      <rect x="4" y="10" width="16" height="9" rx="1.5" />
      <path d="M8.5 10V8a1 1 0 0 1 1-1 1 1 0 0 1 1 1v2" />
      <path d="M13.5 10V8a1 1 0 0 1 1-1 1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/** Custom gradient glyph for the "Fully Automated" stage, exported from Figma. */
function FullyAutomatedIcon({ className }: IconProps): ReactElement {
  return (
    <Image
      className={className}
      src={FULLY_AUTOMATED_ICON_SRC}
      alt=""
      width={20}
      height={20}
    />
  );
}

/** Chevron pointing to the next stage in the maturity timeline. */
function ChevronRightIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} {...ICON_BASE_PROPS}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** Info glyph for the closing callout pill. */
function InfoIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} {...ICON_BASE_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  );
}

/** Small upward-pointing nub that ties a timeline marker to its stage pill. */
function MarkerPointer({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 17 8" fill="currentColor" aria-hidden focusable={false}>
      <path d="M8.5 0L17 8H0z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline model                                                      */
/* ------------------------------------------------------------------ */

type StageVariant = "red" | "blue" | "green" | "outline";

interface TimelineMarker {
  text: string;
  variant: "red" | "green";
}

interface TimelineStage {
  id: string;
  label: string;
  variant: StageVariant;
  Icon: (props: IconProps) => ReactElement;
  marker?: TimelineMarker;
}

const PILL_VARIANT_CLASS: Record<StageVariant, string> = {
  red: styles.pillRed,
  blue: styles.pillBlue,
  green: styles.pillGreen,
  outline: styles.pillOutline,
};

const MARKER_VARIANT_CLASS: Record<TimelineMarker["variant"], string> = {
  red: styles.markerRed,
  green: styles.markerGreen,
};

const TIMELINE_STAGES: TimelineStage[] = [
  {
    id: "all-manual",
    label: "All manual",
    variant: "red",
    Icon: HammerIcon,
    marker: { text: COPY.youAreHere, variant: "red" },
  },
  {
    id: "human-in-the-loop",
    label: "Human-in-the-loop",
    variant: "blue",
    Icon: WinkIcon,
  },
  {
    id: "ai-assisted",
    label: "AI-Assisted",
    variant: "green",
    Icon: LegoIcon,
    marker: { text: COPY.comeHere, variant: "green" },
  },
  {
    id: "fully-automated",
    label: "Fully Automated",
    variant: "outline",
    Icon: FullyAutomatedIcon,
  },
];

const TICKS_PER_BLOCK = 4;

/** A short run of ruler ticks, optionally capped with a taller accent tick. */
function TickBlock({ withAccent = false }: { withAccent?: boolean }): ReactElement {
  return (
    <span className={styles.tickBlock} aria-hidden="true">
      {Array.from({ length: TICKS_PER_BLOCK }, (_unused, index) => (
        <span key={index} className={styles.tick} />
      ))}
      {withAccent ? <span className={styles.tickTall} /> : null}
    </span>
  );
}

/** Ruler decoration shown at the far edges of the timeline. */
function EdgeTicks(): ReactElement {
  return (
    <span className={styles.edgeTicks} aria-hidden="true">
      <TickBlock withAccent />
      <TickBlock withAccent />
    </span>
  );
}

/** Ruler ticks + directional chevron placed between two adjacent stages. */
function StageSeparator(): ReactElement {
  return (
    <span className={styles.separator} aria-hidden="true">
      <TickBlock />
      <ChevronRightIcon className={styles.chevron} />
      <TickBlock />
    </span>
  );
}

/** A single maturity-stage pill with its optional "you are here" style marker. */
function Stage({ stage }: { stage: TimelineStage }): ReactElement {
  const { Icon } = stage;
  return (
    <span className={styles.stage}>
      <span className={`${styles.pill} ${PILL_VARIANT_CLASS[stage.variant]}`}>
        <Icon className={styles.pillIcon} />
        {stage.label}
      </span>
      {stage.marker ? (
        <span className={`${styles.marker} ${MARKER_VARIANT_CLASS[stage.marker.variant]}`}>
          <MarkerPointer className={styles.markerPointer} />
          <span className={styles.markerLabel}>{stage.marker.text}</span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * 02 / Problem Section — 2026 homepage redesign.
 *
 * A hero statement (a serif money-loss headline sitting inside a faded clock
 * gauge) followed by a "manual → fully automated" maturity timeline and a
 * closing qualifier callout. The clock-gauge hero is a client subcomponent
 * that scrubs a scroll-driven intro animation; the timeline + callout below
 * stay server-rendered and static.
 *
 * @param props - Optional per-page copy overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function ProblemSection({
  headline,
  callout,
}: ProblemSectionProps = {}): ReactElement {
  const calloutText = callout ?? COPY.callout;

  return (
    <section className={styles.problem} data-section="problem" aria-labelledby={HEADING_ID}>
      <ProblemSectionClock headingId={HEADING_ID} headline={headline} />

      <div className={styles.timeline}>
        <EdgeTicks />
        {TIMELINE_STAGES.map((stage, index) => (
          <Fragment key={stage.id}>
            {index > 0 ? <StageSeparator /> : null}
            <Stage stage={stage} />
          </Fragment>
        ))}
        <EdgeTicks />
      </div>

      <div className={styles.callout}>
        <InfoIcon className={styles.calloutIcon} />
        <p className={styles.calloutText}>{calloutText}</p>
      </div>
    </section>
  );
}
