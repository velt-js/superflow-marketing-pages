import type { ComponentType, ReactNode, SVGProps } from "react";
import Image from "next/image";
import styles from "./BuildAgentsArtifact.module.css";

/**
 * Hero tab artifact — "Build Agents".
 * Figma: node 751:1980 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * Static recreation of the "Extracting Agents from Checklist.xlsx" state: a
 * left workspace rail, a centered 52% progress ring + heading, a 2-column grid
 * of fully rendered agent cards ("Spell Check", "Grid Layout"), and rows of
 * skeleton/loading cards that are clipped and faded out at the bottom edge.
 *
 * Every icon below is inlined from the exact Figma vector export (SVG) of its
 * source node so the artifact visually matches the design node 1:1.
 *
 * The root element is the white inner card; the shared `.window` frame in
 * {@link HeroWorkflowShowcase} supplies the surrounding 2px black reveal.
 */

const BRAND_MARK_SRC = "/images/home-2026/hero/superflow-mark.png";

const PERCENT_LABEL = "52%";
const HEADING_TOP = "Extracting Agents from";
const FILE_NAME = "Checklist.xlsx";
const MENU_LABEL = "Card actions";
/** Spell Check card description — exact string from Figma node 751:2502. */
const SPELL_CHECK_DESCRIPTION =
  "Find spelling mistakes before sharing it with your clients.";
/** Grid Layout card description — authored copy (Figma reused a placeholder). */
const GRID_LAYOUT_DESCRIPTION =
  "Automatically align content into a clean, responsive grid.";

/** Fraction (0-1) of the progress ring that renders as a filled green arc. */
const RING_PROGRESS = 0.52;
/** Geometry of the circular progress ring, in SVG user units. */
const RING_RADIUS = 35;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** Number of skeleton/loading cards rendered below the real cards. */
const SKELETON_CARD_COUNT = 4;

/** Tone of a single tile dot; maps to a palette color in {@link GridTile}. */
type DotTone = "strong" | "faint" | "accent";

/**
 * Fill tones for the card's 3x3 grid tile, in row-major order. Mirrors the
 * exact per-dot layout of Figma nodes 751:2490 / 751:2471.
 */
const GRID_DOT_TONES: readonly DotTone[] = [
  "strong",
  "faint",
  "faint",
  "accent",
  "strong",
  "strong",
  "faint",
  "accent",
  "faint",
];

type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. Defaults to 16. */
  size?: number;
};

/**
 * 16x16 rail-icon wrapper matching the Figma export attributes (currentColor
 * stroke, round caps/joins). Individual rail icons supply only their geometry.
 *
 * @param props - Icon props including optional `size`, `strokeWidth`, children.
 * @returns The configured `<svg>` element.
 */
function RailIconSvg({
  size = 16,
  strokeWidth = 1.33333,
  children,
  ...rest
}: IconProps & { strokeWidth?: number | string; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
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
}

/**
 * Home rail icon — exact vector of Figma node 751:2073.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The home rail icon.
 */
function HomeIcon(props: IconProps) {
  return (
    <RailIconSvg {...props}>
      <path d="M2 6.00065L8 1.33398L14 6.00065V13.334C14 13.6876 13.8595 14.0267 13.6095 14.2768C13.3594 14.5268 13.0203 14.6673 12.6667 14.6673H3.33333C2.97971 14.6673 2.64057 14.5268 2.39052 14.2768C2.14048 14.0267 2 13.6876 2 13.334V6.00065Z" />
      <path d="M6 14.6667V8H10V14.6667" />
    </RailIconSvg>
  );
}

/**
 * Bar-chart rail icon — exact vector of Figma node 751:2077.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The chart rail icon.
 */
function ChartIcon(props: IconProps) {
  return (
    <RailIconSvg {...props}>
      <path d="M12 13.3333V6.66663" />
      <path d="M8 13.3333V2.66663" />
      <path d="M4 13.3334V9.33337" />
    </RailIconSvg>
  );
}

/**
 * Lego rail icon (active tab) — exact vector of Figma node 751:2082.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The lego rail icon.
 */
function LegoIcon(props: IconProps) {
  return (
    <RailIconSvg {...props}>
      <path d="M6.33464 7.33333H6.3413M9.66797 7.33333H9.67464M6.33464 10C6.55189 10.2217 6.8112 10.3979 7.09739 10.5181C7.38357 10.6384 7.69088 10.7003 8.0013 10.7003C8.31173 10.7003 8.61903 10.6384 8.90522 10.5181C9.1914 10.3979 9.45072 10.2217 9.66797 10M4.66797 3.33333H5.33464V2H10.668V3.33333H11.3346C11.8651 3.33333 12.3738 3.54405 12.7488 3.91912C13.1239 4.29419 13.3346 4.8029 13.3346 5.33333V11.3333C13.3346 11.8638 13.1239 12.3725 12.7488 12.7475C12.3738 13.1226 11.8651 13.3333 11.3346 13.3333V14H4.66797V13.3333C4.13754 13.3333 3.62883 13.1226 3.25376 12.7475C2.87868 12.3725 2.66797 11.8638 2.66797 11.3333V5.33333C2.66797 4.8029 2.87868 4.29419 3.25376 3.91912C3.62883 3.54405 4.13754 3.33333 4.66797 3.33333Z" />
    </RailIconSvg>
  );
}

/**
 * Double-check rail icon — exact vector of Figma node 751:2138.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The checks rail icon.
 */
function ChecksIcon(props: IconProps) {
  return (
    <RailIconSvg {...props}>
      <path d="M4.66536 7.99996L7.9987 11.3333L14.6654 4.66663M1.33203 7.99996L4.66536 11.3333M7.9987 7.99996L11.332 4.66663" />
    </RailIconSvg>
  );
}

/**
 * User rail icon — exact vector of Figma node 751:2135.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The user rail icon.
 */
function UserIcon(props: IconProps) {
  return (
    <RailIconSvg {...props}>
      <path d="M5.33594 4.66667C5.33594 5.37391 5.61689 6.05219 6.11699 6.55229C6.61708 7.05238 7.29536 7.33333 8.0026 7.33333C8.70985 7.33333 9.38813 7.05238 9.88822 6.55229C10.3883 6.05219 10.6693 5.37391 10.6693 4.66667C10.6693 3.95942 10.3883 3.28115 9.88822 2.78105C9.38813 2.28095 8.70985 2 8.0026 2C7.29536 2 6.61708 2.28095 6.11699 2.78105C5.61689 3.28115 5.33594 3.95942 5.33594 4.66667Z" />
      <path d="M12.7613 14.2966C12.7613 14.2966 12.7923 13.8196 12.5932 13.1661C12.394 12.5126 12.0576 11.9091 11.6065 11.396C11.1554 10.8829 10.6 10.4721 9.97734 10.1909C9.3547 9.90976 8.67921 9.76476 7.99602 9.76563C7.31284 9.7665 6.63772 9.9132 6.01579 10.1959C5.39386 10.4787 4.83946 10.891 4.38966 11.4052C3.93986 11.9194 3.60502 12.5237 3.40753 13.1777C3.21005 13.8317 3.24449 14.3087 3.24449 14.3087" />
    </RailIconSvg>
  );
}

/**
 * Settings gear rail icon — exact vector of Figma node 751:2089.
 *
 * @param props - Icon props forwarded to {@link RailIconSvg}.
 * @returns The settings rail icon.
 */
function SettingsIcon(props: IconProps) {
  return (
    <RailIconSvg strokeWidth={1.11111} {...props}>
      <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" />
      <path d="M6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8Z" />
    </RailIconSvg>
  );
}

/**
 * Spreadsheet/table icon beside "Checklist.xlsx" — exact vector of Figma node
 * 751:2359 (36-unit grid, 2.932 stroke).
 *
 * @param props - Icon props (optional `size`).
 * @returns The table icon.
 */
function TableIcon({ size = 34, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.932}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M4.39453 14.6599H30.7825M14.6565 4.39795V30.7859M4.39453 7.32995C4.39453 6.55233 4.70344 5.80657 5.25329 5.25671C5.80315 4.70686 6.54892 4.39795 7.32653 4.39795H27.8505C28.6281 4.39795 29.3739 4.70686 29.9238 5.25671C30.4736 5.80657 30.7825 6.55233 30.7825 7.32995V27.8539C30.7825 28.6315 30.4736 29.3773 29.9238 29.9272C29.3739 30.477 28.6281 30.7859 27.8505 30.7859H7.32653C6.54892 30.7859 5.80315 30.477 5.25329 29.9272C4.70344 29.3773 4.39453 28.6315 4.39453 27.8539V7.32995Z" />
    </svg>
  );
}

/**
 * Vertical three-dot ("⋮") menu glyph — exact vector of Figma node 751:2504
 * (24-unit grid, 1.92895 stroke).
 *
 * @param props - Icon props (optional `size`).
 * @returns The dots-vertical icon.
 */
function DotsVerticalIcon({ size = 23, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.92895}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M10.6094 11.5738C10.6094 11.8296 10.711 12.0749 10.8919 12.2558C11.0727 12.4367 11.3181 12.5383 11.5738 12.5383C11.8296 12.5383 12.075 12.4367 12.2558 12.2558C12.4367 12.0749 12.5383 11.8296 12.5383 11.5738C12.5383 11.318 12.4367 11.0727 12.2558 10.8918C12.075 10.711 11.8296 10.6093 11.5738 10.6093C11.3181 10.6093 11.0727 10.711 10.8919 10.8918C10.711 11.0727 10.6094 11.318 10.6094 11.5738Z" />
      <path d="M10.6094 18.3251C10.6094 18.5809 10.711 18.8262 10.8919 19.0071C11.0727 19.188 11.3181 19.2896 11.5738 19.2896C11.8296 19.2896 12.075 19.188 12.2558 19.0071C12.4367 18.8262 12.5383 18.5809 12.5383 18.3251C12.5383 18.0693 12.4367 17.824 12.2558 17.6431C12.075 17.4623 11.8296 17.3607 11.5738 17.3607C11.3181 17.3607 11.0727 17.4623 10.8919 17.6431C10.711 17.824 10.6094 18.0693 10.6094 18.3251Z" />
      <path d="M10.6094 4.82251C10.6094 5.0783 10.711 5.32362 10.8919 5.50449C11.0727 5.68536 11.3181 5.78698 11.5738 5.78698C11.8296 5.78698 12.075 5.68536 12.2558 5.50449C12.4367 5.32362 12.5383 5.0783 12.5383 4.82251C12.5383 4.56671 12.4367 4.32139 12.2558 4.14052C12.075 3.95965 11.8296 3.85803 11.5738 3.85803C11.3181 3.85803 11.0727 3.95965 10.8919 4.14052C10.711 4.32139 10.6094 4.56671 10.6094 4.82251Z" />
    </svg>
  );
}

/** A left-rail workspace icon. */
type RailItem = {
  id: string;
  Icon: ComponentType<IconProps>;
  active?: boolean;
};

/** Palette for a card's 3x3 grid tile icon (exact Figma computed colors). */
type GridIconPalette = {
  background: string;
  strong: string;
  faint: string;
  accent: string;
};

/** A fully rendered agent card. */
type AgentCard = {
  id: string;
  title: string;
  description: string;
  palette: GridIconPalette;
};

const RAIL_ITEMS: readonly RailItem[] = [
  { id: "home", Icon: HomeIcon },
  { id: "analytics", Icon: ChartIcon },
  { id: "agents", Icon: LegoIcon, active: true },
  { id: "checks", Icon: ChecksIcon },
  { id: "user", Icon: UserIcon },
  { id: "settings", Icon: SettingsIcon },
];

/**
 * "Spell Check" amber tile palette. Colors are the exact Figma dot fills:
 * base #f7de83 flattened with 60%/30% white overlays, #f7a083 accent, and the
 * 70%-black-over-#f49b64 background.
 */
const SPELL_CHECK_PALETTE: GridIconPalette = {
  background: "#492f1e",
  strong: "#fcf2cd",
  faint: "#f9e8a8",
  accent: "#f7a083",
};

/**
 * "Grid Layout" green tile palette. Colors are the exact Figma dot fills:
 * base #64f48a flattened with 60%/30% white overlays, #64f48a accent, and the
 * 70%-black-over-#64f48a background.
 */
const GRID_LAYOUT_PALETTE: GridIconPalette = {
  background: "#1e4929",
  strong: "#c1fbd0",
  faint: "#93f7ad",
  accent: "#64f48a",
};

const AGENT_CARDS: readonly AgentCard[] = [
  {
    id: "spell-check",
    title: "Spell Check",
    description: SPELL_CHECK_DESCRIPTION,
    palette: SPELL_CHECK_PALETTE,
  },
  {
    id: "grid-layout",
    title: "Grid Layout",
    description: GRID_LAYOUT_DESCRIPTION,
    palette: GRID_LAYOUT_PALETTE,
  },
];

/**
 * Resolve the fill color for a single grid-tile dot from its tone.
 *
 * @param palette - The tile palette.
 * @param tone - The dot tone.
 * @returns The resolved hex color.
 */
function resolveDotColor(palette: GridIconPalette, tone: DotTone): string {
  if (tone === "accent") {
    return palette?.accent;
  }
  if (tone === "faint") {
    return palette?.faint;
  }
  return palette?.strong;
}

/**
 * Render the 3x3 dotted grid tile used as an agent card's leading icon,
 * reproducing Figma nodes 751:2490 / 751:2471.
 *
 * @param palette - The background and dot colors for the tile.
 * @returns The grid tile element.
 */
function GridTile({ palette }: { palette: GridIconPalette }) {
  return (
    <span
      className={styles.gridTile}
      style={{ background: palette?.background }}
      aria-hidden="true"
    >
      {GRID_DOT_TONES.map((tone, index) => (
        <span
          key={`dot-${index}`}
          className={styles.gridDot}
          style={{ background: resolveDotColor(palette, tone) }}
        />
      ))}
    </span>
  );
}

/**
 * Render the circular progress ring with a centered percentage label.
 *
 * @returns The progress ring element.
 */
function ProgressRing() {
  const filledArc = RING_CIRCUMFERENCE * RING_PROGRESS;
  const remainingArc = RING_CIRCUMFERENCE - filledArc;
  return (
    <div className={styles.ring}>
      <svg
        className={styles.ringSvg}
        viewBox="0 0 80 80"
        aria-hidden="true"
        focusable="false"
      >
        <circle className={styles.ringTrack} cx="40" cy="40" r={RING_RADIUS} />
        <circle
          className={styles.ringArc}
          cx="40"
          cy="40"
          r={RING_RADIUS}
          strokeDasharray={`${filledArc} ${remainingArc}`}
        />
      </svg>
      <span className={styles.ringLabel}>{PERCENT_LABEL}</span>
    </div>
  );
}

/**
 * Render a single fully populated agent card.
 *
 * @param card - The agent card content and palette.
 * @returns The card element.
 */
function AgentCardView({ card }: { card: AgentCard }) {
  return (
    <article className={styles.card}>
      <button type="button" className={styles.cardMenu} aria-label={MENU_LABEL}>
        <DotsVerticalIcon size={23} />
      </button>
      <header className={styles.cardHead}>
        <GridTile palette={card?.palette} />
        <h3 className={styles.cardTitle}>{card?.title}</h3>
      </header>
      <p className={styles.cardDescription}>{card?.description}</p>
    </article>
  );
}

/**
 * Render a single skeleton/loading placeholder card.
 *
 * @returns The skeleton card element.
 */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <span className={styles.skeletonMenu} />
      <div className={styles.skeletonHead}>
        <span className={styles.skeletonTile} />
        <span className={styles.skeletonPill} />
      </div>
      <div className={styles.skeletonLines}>
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
      </div>
    </div>
  );
}

/**
 * Render the "Build Agents" hero artifact.
 *
 * @returns The Build Agents window contents.
 */
export default function BuildAgentsArtifact() {
  return (
    <div className={styles.root} data-artifact="build-agents">
      <nav className={styles.rail} aria-label="Workspace navigation">
        <span className={styles.railMarkButton} aria-hidden="true">
          <Image
            className={styles.railMark}
            src={BRAND_MARK_SRC}
            alt=""
            width={18}
            height={17}
          />
        </span>
        {RAIL_ITEMS.map((item) => {
          const RailIcon = item?.Icon;
          return (
            <button
              key={item?.id}
              type="button"
              className={`${styles.railItem} ${
                item?.active ? styles.railItemActive : ""
              }`}
            >
              <RailIcon size={16} />
            </button>
          );
        })}
      </nav>

      <div className={styles.stage}>
        <div className={styles.status}>
          <ProgressRing />
          <div className={styles.heading}>
            <p className={styles.headingTop}>{HEADING_TOP}</p>
            <p className={styles.fileRow}>
              <span className={styles.fileIcon}>
                <TableIcon size={34} />
              </span>
              <span className={styles.fileName}>{FILE_NAME}</span>
            </p>
          </div>
        </div>

        <div className={styles.cards}>
          {AGENT_CARDS.map((card) => (
            <AgentCardView key={card?.id} card={card} />
          ))}
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_unused, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </div>

      <div className={styles.fade} aria-hidden="true" />
    </div>
  );
}
