import type { CSSProperties, ReactNode, SVGProps } from "react";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import styles from "./AppliedToNextAssetArtifact.module.css";

/**
 * Hero tab artifact — "Applied to the next asset" (memory feature page, tab id
 * `applied-to-the-next-asset`).
 *
 * A static browser window showing how remembered behavior is applied to new
 * work: three dog-eared project "sheets" sit in a row (Project 1 / 2 / 3), and
 * under each one Memory reports what it has learned. Projects 1 and 2 each show
 * a compact "N New Behaviors Learned" pill (the pink Superflow Memory brain +
 * count); Project 3 shows a full "Superflow Memory" card recalling a concrete
 * remembered fact ("Client prefers sans-serif fonts").
 *
 * The dog-eared sheet reuses the same gradient/fold geometry as the "Upload
 * once" artifact's PDF file, and the memory card mirrors that artifact's
 * "Superflow Memory" card, so the Memory story reads consistently across tabs.
 * The sheet SVG is rendered three times, so each instance is given a unique
 * gradient/filter id prefix to avoid `url(#id)` collisions on the page.
 *
 * The root is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal. The
 * scene is essentially static — a subtle staggered rise-in plays on mount and
 * is disabled under `prefers-reduced-motion: reduce`.
 */

const ADDRESS = "YOUR-SITE.COM";
const MEMORY_SOURCE = "Superflow Memory";
const MEMORY_TIME = "3h";
const MEMORY_FACT = "Client prefers sans-serif fonts";
const PROJECT_ONE_LABEL = "Project 1";
const PROJECT_TWO_LABEL = "Project 2";
const PROJECT_THREE_LABEL = "Project 3";
const PILL_TEXT_ONE = "3 New Behaviors Learned";
const PILL_TEXT_TWO = "4 New Behaviors Learned";

/** Tabler `brain` glyph geometry (24×24), inlined so no icon dep is added. */
const BRAIN_PATHS: readonly string[] = [
  "M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8",
  "M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8",
  "M17.5 16a3.5 3.5 0 0 0 0 -7h-.5",
  "M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0",
  "M6.5 16a3.5 3.5 0 0 1 0 -7h.5",
  "M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10",
];

/** Local icon props: an optional pixel size plus native SVG attributes. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Superflow Memory brand glyph — the pink Tabler `brain` mark carried by the
 * learned-behaviour pills and the memory card. Geometry matches the "Upload
 * once" artifact so the brand mark stays identical across memory tabs.
 *
 * @param props - Optional `size` (defaults to 20) and SVG attributes.
 * @returns The brain `<svg>`, or `null` on failure.
 */
function BrainGlyph({ size = 20, ...rest }: IconProps): ReactNode {
  try {
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
        {...rest}
      >
        {BRAIN_PATHS.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Horizontal three-dot overflow glyph on the memory card header.
 *
 * @param props - Optional `size` (defaults to 18) and SVG attributes.
 * @returns The dots `<svg>`, or `null` on failure.
 */
function DotsIcon({ size = 18, ...rest }: IconProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * A dog-eared project "sheet" — the soft, folded-corner sheet reused from the
 * "Upload once" artifact's PDF file, relabelled with the project name. The
 * sheet body and its folded top-right corner are drawn as one inline SVG; the
 * project label is overlaid so it uses the site font.
 *
 * @param root0 - Sheet props.
 * @param root0.label - The centered project label (e.g. "Project 1").
 * @param root0.idPrefix - Unique prefix for this sheet's gradient/filter ids,
 *   so rendering the sheet multiple times never collides on `url(#id)`.
 * @returns The sheet element, or `null` on failure.
 */
function FileSheet({
  label,
  idPrefix,
}: {
  label: string;
  idPrefix: string;
}): ReactNode {
  try {
    const bodyId = `${idPrefix}-body`;
    const foldId = `${idPrefix}-fold`;
    const shadowId = `${idPrefix}-fold-shadow`;
    return (
      <div className={styles.sheet} aria-hidden="true">
        <svg
          className={styles.sheetSvg}
          viewBox="0 0 190 202"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={bodyId}
              x1="95"
              y1="0"
              x2="95"
              y2="202"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f5f8ff" />
              <stop offset="1" stopColor="#e6edff" />
            </linearGradient>
            <linearGradient
              id={foldId}
              x1="138"
              y1="0"
              x2="178"
              y2="52"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#d3ddf2" />
              <stop offset="1" stopColor="#bacce6" />
            </linearGradient>
            <filter id={shadowId} x="-50%" y="-50%" width="200%" height="220%">
              <feDropShadow
                dx="-2"
                dy="3"
                stdDeviation="3"
                floodColor="#7f95c6"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <path
            d="M26 0 H138 L190 52 V176 A26 26 0 0 1 164 202 H26 A26 26 0 0 1 0 176 V26 A26 26 0 0 1 26 0 Z"
            fill={`url(#${bodyId})`}
            stroke="#e4eaf8"
            strokeWidth="1"
          />
          <path
            d="M26 2 H130"
            stroke="#ffffff"
            strokeOpacity="0.8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M138 8 L138 52 L190 52 L144 6 Q138 0 138 8 Z"
            fill={`url(#${foldId})`}
            filter={`url(#${shadowId})`}
          />
        </svg>
        <span className={styles.sheetLabel}>{label}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A compact "N New Behaviors Learned" pill — the pink Superflow Memory brain
 * mark beside the learned-behavior count. Shown under Projects 1 and 2.
 *
 * @param root0 - Pill props.
 * @param root0.text - The pill label (e.g. "3 New Behaviors Learned").
 * @returns The pill element, or `null` on failure.
 */
function LearnedPill({ text }: { text: string }): ReactNode {
  try {
    return (
      <div className={styles.pill}>
        <span className={styles.pillMark}>
          <BrainGlyph size={22} />
        </span>
        <span className={styles.pillText}>{text}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The "Superflow Memory" card recalling one concrete remembered fact — the
 * brand header (mark, source, time, overflow) above the remembered fact.
 * Mirrors the memory card from the "Upload once" artifact. Shown under
 * Project 3.
 *
 * @returns The card element, or `null` on failure.
 */
function MemoryCard(): ReactNode {
  try {
    return (
      <article className={styles.card}>
        <header className={styles.cardHead}>
          <span className={styles.cardMark}>
            <BrainGlyph size={20} />
          </span>
          <span className={styles.cardSource}>{MEMORY_SOURCE}</span>
          <span className={styles.cardTime}>{MEMORY_TIME}</span>
          <span className={styles.cardMenu}>
            <DotsIcon size={18} />
          </span>
        </header>
        <p className={styles.cardFact}>{MEMORY_FACT}</p>
      </article>
    );
  } catch {
    return null;
  }
}

/** The learned-behaviour surface shown under a project sheet. */
type ProjectOverlay =
  | { kind: "pill"; text: string }
  | { kind: "card" };

/** A single project column: a sheet plus its learned-behaviour overlay. */
type ProjectItem = {
  id: string;
  label: string;
  overlay: ProjectOverlay;
};

/**
 * The three project columns, left to right. Projects 1 and 2 report a learned
 * count in a pill; Project 3 recalls a concrete fact in a full memory card.
 */
const PROJECTS: readonly ProjectItem[] = [
  {
    id: "project-1",
    label: PROJECT_ONE_LABEL,
    overlay: { kind: "pill", text: PILL_TEXT_ONE },
  },
  {
    id: "project-2",
    label: PROJECT_TWO_LABEL,
    overlay: { kind: "pill", text: PILL_TEXT_TWO },
  },
  {
    id: "project-3",
    label: PROJECT_THREE_LABEL,
    overlay: { kind: "card" },
  },
];

/**
 * Render a project's learned-behaviour overlay — either the compact pill or the
 * full memory card, depending on the overlay kind.
 *
 * @param root0 - Overlay props.
 * @param root0.overlay - The overlay descriptor for this project.
 * @returns The pill or card element, or `null` on failure.
 */
function ProjectOverlayView({
  overlay,
}: {
  overlay: ProjectOverlay;
}): ReactNode {
  try {
    if (overlay?.kind === "pill") {
      return <LearnedPill text={overlay?.text} />;
    }
    return <MemoryCard />;
  } catch {
    return null;
  }
}

/**
 * Render one project column: the dog-eared sheet with the learned-behaviour
 * overlay pulled up to overlap its lower edge.
 *
 * @param root0 - Column props.
 * @param root0.project - The project descriptor (label + overlay).
 * @param root0.index - Zero-based position, forwarded as `--col` for the
 *   staggered rise-in.
 * @returns The column element, or `null` on failure.
 */
function ProjectColumn({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}): ReactNode {
  try {
    return (
      <div
        className={styles.project}
        style={{ "--col": index } as CSSProperties}
      >
        <FileSheet label={project?.label} idPrefix={project?.id} />
        <ProjectOverlayView overlay={project?.overlay} />
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link AppliedToNextAssetArtifact}. */
export interface AppliedToNextAssetArtifactProps {
  /**
   * Whether to render the top {@link BrowserChrome} bar above the scene. The
   * hero product window frames the artifact with chrome, so this defaults to
   * `true` and the existing hero usage is unchanged. The Feature Set panel
   * renders the bare sheets/pills/card on its own white screen, so it passes
   * `false`; that also drops the top offset the chrome bar left behind and
   * left-anchors the scene so a fit wrapper can scale it into the panel frame.
   */
  showChrome?: boolean;
}

/**
 * Render the "Applied to the next asset" memory artifact: a row of three
 * project sheets, each reporting what Memory has learned and applied, optionally
 * framed by the shared browser chrome.
 *
 * @param props - Optional {@link AppliedToNextAssetArtifactProps}; set
 *   `showChrome` to `false` to drop the chrome bar for the Feature Set panel.
 * @returns The window contents, or `null` on failure.
 */
export default function AppliedToNextAssetArtifact({
  showChrome = true,
}: AppliedToNextAssetArtifactProps = {}): ReactNode {
  try {
    const rootClass = showChrome
      ? styles.root
      : `${styles.root} ${styles.noChrome}`;
    return (
      <div
        className={rootClass}
        data-artifact="applied-next-asset"
        data-chrome={showChrome ? undefined : "false"}
      >
        {showChrome ? (
          <BrowserChrome className={styles.heroChrome} address={ADDRESS} />
        ) : null}
        <div className={styles.stage}>
          <div className={styles.projects}>
            {PROJECTS.map((project, index) => (
              <ProjectColumn key={project?.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
