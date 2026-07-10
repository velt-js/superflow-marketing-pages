import type { ReactNode, SVGProps } from "react";
import { MemoryPill } from "../hero-artifacts/MemoryUploadArtifact";
import styles from "./MemoryScopeParts.module.css";

/**
 * Shared building blocks for the two "scoped memory" feature-section artifacts
 * — {@link ../feature-artifacts/MemoryPerClientArtifact} ("Per-client memory")
 * and {@link ../feature-artifacts/MemoryScopedThreeArtifact} ("Scoped three
 * ways"). Both scenes are built from the same three pieces:
 *
 *   - {@link ClientCard} — a rounded lavender pill: a coloured client icon (a
 *     heart, a mood/wink face, …) beside a "Client NN" label.
 *   - {@link MemoryCard} — a thin-bordered white memory card with a lighter
 *     stacked sheet peeking below it; the label + pink brain mark are rendered
 *     by the shared {@link MemoryPill} in its `card` variant, so the brand mark
 *     stays identical to every other Memory surface on the site.
 *   - {@link ClientColumn} — one full column: a {@link ClientCard}, a short
 *     vertical connector, and a {@link MemoryCard} reading "32 Learnings in
 *     Memory".
 *
 * Authored here (no equivalent existed to reuse): the client card + its icon
 * geometry, the stacked memory-card shell, and the column connector. Reused:
 * the {@link MemoryPill} card (label + `BrainGlyph`). All pieces are static and
 * render on the shared white `.panelScreen`, so both artifacts can be server
 * components.
 */

/** Number of learnings shown in a client's memory card. */
export const LEARNING_COUNT = 32;

/** Label for a client's memory card, e.g. "32 Learnings in Memory". */
export const LEARNINGS_LABEL = `${LEARNING_COUNT} Learnings in Memory`;

/** Label for the org-level memory card (scoped-three-ways artifact). */
export const ORG_MEMORY_LABEL = "Organization Memory";

/** Label for the agency-rules file sheet (scoped-three-ways artifact). */
export const AGENCY_RULES_LABEL = "Agency Rules";

/** First client's card label. */
export const CLIENT_ONE_LABEL = "Client 01";

/** Second client's card label. */
export const CLIENT_TWO_LABEL = "Client 02";

/** Brand indigo used for the first client's icon. */
export const CLIENT_ONE_ACCENT = "#433df3";

/** Brand blue used for the second client's icon. */
export const CLIENT_TWO_ACCENT = "#4b6ef5";

/** Vivid pink of the Superflow Memory brain mark inside the memory cards. */
export const MEMORY_PINK = "#ec3fa0";

/** Brain-mark size (px) inside every memory card. */
export const MEMORY_MARK_SIZE = 24;

/** Which client glyph a {@link ClientCard} renders. */
export type ClientIconName = "heart" | "mood-wink";

/**
 * Tabler outline path data for each supported client glyph (24×24 viewBox),
 * inlined so no icon dependency is added (mirrors the repo's other inline
 * Tabler geometry). `mood-wink`'s single-point `h-.01` segment renders as a dot
 * under the round stroke cap.
 */
const CLIENT_ICON_PATHS: Readonly<Record<ClientIconName, readonly string[]>> = {
  heart: [
    "M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572",
  ],
  "mood-wink": [
    "M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18",
    "M9 10h-.01",
    "M14.5 15a3.5 3.5 0 0 1 -5 0",
    "M15.5 8.5l-1.5 1.5l1.5 1.5",
  ],
};

/** Local icon props: an optional pixel size plus native SVG attributes. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Render a client glyph (heart / mood-wink) as a `currentColor`-stroked SVG, so
 * the caller tints it via `color`.
 *
 * @param root0 - Icon props.
 * @param root0.name - Which client glyph to draw.
 * @param root0.size - Rendered width/height in px (defaults to 24).
 * @returns The glyph `<svg>`, or `null` on failure.
 */
export function ClientGlyph({
  name,
  size = 24,
  ...rest
}: IconProps & { name: ClientIconName }): ReactNode {
  try {
    const paths = CLIENT_ICON_PATHS?.[name];
    if (!paths) {
      return null;
    }
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
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/** Props for the {@link ClientCard} rounded lavender pill. */
export interface ClientCardProps {
  /** Which client glyph to show on the left. */
  icon: ClientIconName;
  /** The client label, e.g. "Client 01". */
  label: string;
  /** Icon colour (defaults to {@link CLIENT_ONE_ACCENT}). */
  accent?: string;
  /** Optional extra class on the card. */
  className?: string;
}

/**
 * A client card — a rounded lavender pill carrying a coloured client icon and a
 * "Client NN" label.
 *
 * @param props - {@link ClientCardProps}.
 * @returns The client card element, or `null` on failure.
 */
export function ClientCard({
  icon,
  label,
  accent = CLIENT_ONE_ACCENT,
  className,
}: ClientCardProps): ReactNode {
  try {
    const cardClassName = className
      ? `${styles.clientCard} ${className}`
      : styles.clientCard;
    return (
      <div className={cardClassName}>
        <span className={styles.clientIcon} style={{ color: accent }}>
          <ClientGlyph name={icon} size={24} />
        </span>
        <span className={styles.clientLabel}>{label}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for the {@link MemoryCard} thin-bordered white memory card. */
export interface MemoryCardProps {
  /** The card's label (e.g. "32 Learnings in Memory"). */
  label: string;
  /** Card width in px (defaults to the client-column card width, 292.5px). */
  width?: number;
  /** Optional extra class on the card wrapper. */
  className?: string;
}

/** Default memory-card width (matches a client column). */
const MEMORY_CARD_WIDTH = 292.5;

/**
 * A memory card — a thin-bordered white rounded-rectangle card with a lighter
 * "stacked sheet" peeking below it. The label + pink brain mark are rendered by
 * the shared {@link MemoryPill} `card` variant.
 *
 * @param props - {@link MemoryCardProps}.
 * @returns The memory card element, or `null` on failure.
 */
export function MemoryCard({
  label,
  width = MEMORY_CARD_WIDTH,
  className,
}: MemoryCardProps): ReactNode {
  try {
    const wrapClassName = className
      ? `${styles.memoryCard} ${className}`
      : styles.memoryCard;
    return (
      <div className={wrapClassName} style={{ width }}>
        <span className={styles.memoryStack} aria-hidden="true" />
        <MemoryPill
          card
          markSize={MEMORY_MARK_SIZE}
          label={label}
          className={styles.memoryPill}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for a full {@link ClientColumn}. */
export interface ClientColumnProps {
  /** Which client glyph to show on the client card. */
  icon: ClientIconName;
  /** The client label, e.g. "Client 01". */
  label: string;
  /** Client-icon colour (defaults to {@link CLIENT_ONE_ACCENT}). */
  accent?: string;
  /** Memory-card label (defaults to {@link LEARNINGS_LABEL}). */
  memoryLabel?: string;
  /** Optional extra class on the column. */
  className?: string;
}

/**
 * A client column — the client card, a short vertical connector, and the
 * "N Learnings in Memory" card stacked below. Shared by both scoped-memory
 * artifacts.
 *
 * @param props - {@link ClientColumnProps}.
 * @returns The client-column element, or `null` on failure.
 */
export function ClientColumn({
  icon,
  label,
  accent = CLIENT_ONE_ACCENT,
  memoryLabel = LEARNINGS_LABEL,
  className,
}: ClientColumnProps): ReactNode {
  try {
    const columnClassName = className
      ? `${styles.column} ${className}`
      : styles.column;
    return (
      <div className={columnClassName}>
        <ClientCard icon={icon} label={label} accent={accent} />
        <span className={styles.columnConnector} aria-hidden="true" />
        <MemoryCard label={memoryLabel} />
      </div>
    );
  } catch {
    return null;
  }
}
