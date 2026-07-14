import type { CSSProperties, ReactNode, SVGProps } from "react";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import styles from "./BuiltInChecksArtifact.module.css";

/**
 * Hero tab artifact — "Built-in checks".
 *
 * The Superflow Agents management screen: the shared browser window frames a
 * two-pane app — a text sidebar of agent groups on the left and a two-column
 * grid of ready-made QA agent cards on the right (Spell Check, Broken Links,
 * Grammar Check, PII Detection, Profanity Filter, Sensitive Data). Each card
 * carries the Superflow dotted "app icon" tile, a title + description, a
 * last-run/usage meta row and quick run controls, mirroring the product's
 * library of built-in checks.
 *
 * Composed to match the sibling hero artifacts: the root is the white inner
 * card (the shared `.window` frame in {@link ../HeroWorkflowShowcase} supplies
 * the surrounding 2px black reveal), the browser chrome comes from the shared
 * {@link BrowserChrome}, and every icon is inlined Tabler geometry. The scene
 * is CSS-only and replays a light entrance whenever the tab mounts; reduced
 * motion rests in the settled state.
 */

const ADDRESS = "SUPERFLOW AGENTS";
const HEADING = "Default";
const SEARCH_PLACEHOLDER = "Search agents...";
const IMPORT_LABEL = "Import";
const NEW_AGENT_LABEL = "New Agent";
const CREATE_GROUP_LABEL = "Create Group";
const MENU_LABEL = "Card actions";
const RUN_LABEL = "Run agent";
const HISTORY_LABEL = "Run history";

/** Repeated meta strings for agents that have never run. */
const LABEL_NEVER = "Never";
const USAGE_NONE = "Used 0 times";

/** Number of dots per row/column in a card's square "app icon" grid tile. */
const TILE_GRID_SIZE = 3;
/** Total dots in a tile — the 3×3 matrix has 9 cells. */
const TILE_DOT_COUNT = TILE_GRID_SIZE * TILE_GRID_SIZE;

type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered width/height in pixels. Defaults to 16. */
  size?: number;
};

/**
 * Shared stroked-glyph wrapper drawing outlined Tabler icons in `currentColor`
 * with rounded caps/joins on a 24-unit grid.
 *
 * @param props - Icon props including optional `size`, `strokeWidth`, children.
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
 * Magnifier glyph for the sidebar search field (Tabler `search`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The search icon.
 */
function SearchIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M21 21l-6 -6" />
    </StrokeIcon>
  );
}

/**
 * Plus glyph for the "Create Group" row (Tabler `plus`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The plus icon.
 */
function PlusIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </StrokeIcon>
  );
}

/**
 * Refresh / last-run glyph in a card's meta row (Tabler `refresh`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The refresh icon.
 */
function RefreshIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.9} {...props}>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </StrokeIcon>
  );
}

/**
 * Four-point sparkle for the usage meta ("Used N times") (Tabler `sparkle`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The sparkle icon.
 */
function SparkleIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <path d="M12 3c0 4.97 4.03 9 9 9c-4.97 0 -9 4.03 -9 9c0 -4.97 -4.03 -9 -9 -9c4.97 0 9 -4.03 9 -9z" />
    </StrokeIcon>
  );
}

/**
 * Clock-with-arrow run-history glyph (Tabler `history`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The history icon.
 */
function HistoryIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.8} {...props}>
      <path d="M12 8l0 4l2 2" />
      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
    </StrokeIcon>
  );
}

/**
 * Vertical three-dot ("⋮") card menu glyph (Tabler `dots-vertical`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The dots-vertical icon.
 */
function DotsVerticalIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={2} {...props}>
      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </StrokeIcon>
  );
}

/**
 * Solid play triangle inside the card's black run button.
 *
 * @param props - Icon props (optional `size`).
 * @returns The play glyph.
 */
function PlayIcon({ size = 12, ...rest }: IconProps): ReactNode {
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
      <path d="M7 4.5v15a1 1 0 0 0 1.53 .85l12 -7.5a1 1 0 0 0 0 -1.7l-12 -7.5a1 1 0 0 0 -1.53 .85z" />
    </svg>
  );
}

/**
 * Palette for a card's {@link TILE_GRID_SIZE}×{@link TILE_GRID_SIZE} "app icon"
 * tile. `background` is a saturated hue and `dots` holds one fill per cell
 * (row-major) drawn from shades of that same hue — mirroring the Superflow
 * app-icon style.
 */
type TilePalette = {
  background: string;
  /** Row-major dot fills; length must equal {@link TILE_DOT_COUNT}. */
  dots: readonly string[];
};

/** A ready-made agent card. */
type AgentCard = {
  id: string;
  title: string;
  description: string;
  lastRun: string;
  usage: string;
  palette: TilePalette;
};

/** A left-sidebar group entry. */
type SidebarGroup = {
  id: string;
  label: string;
  active?: boolean;
};

const GREEN_TILE: TilePalette = {
  background: "#1f7a3a",
  dots: [
    "#7ee6a1", "#43c46e", "#a7f0c0",
    "#43c46e", "#25a457", "#7ee6a1",
    "#a7f0c0", "#7ee6a1", "#43c46e",
  ],
};

const BROWN_TILE: TilePalette = {
  background: "#7a3b1f",
  dots: [
    "#f0b48a", "#e08a4e", "#f7d0ac",
    "#e08a4e", "#c96f2f", "#f0b48a",
    "#f7d0ac", "#f0b48a", "#e08a4e",
  ],
};

const MAGENTA_TILE: TilePalette = {
  background: "#7a1f5e",
  dots: [
    "#f0a7d8", "#e04ea6", "#f7c6e6",
    "#e04ea6", "#c92f88", "#f0a7d8",
    "#f7c6e6", "#f0a7d8", "#e04ea6",
  ],
};

const TEAL_TILE: TilePalette = {
  background: "#1f6e7a",
  dots: [
    "#7ee0e6", "#43bcc4", "#a7f0f0",
    "#43bcc4", "#25a0a8", "#7ee0e6",
    "#a7f0f0", "#7ee0e6", "#43bcc4",
  ],
};

const BLUE_TILE: TilePalette = {
  background: "#1f3f7a",
  dots: [
    "#a7c0f0", "#4e7ae0", "#c6d8f7",
    "#4e7ae0", "#2f5cc9", "#a7c0f0",
    "#c6d8f7", "#a7c0f0", "#4e7ae0",
  ],
};

const SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  { id: "all", label: "All Agents" },
  { id: "pre-launch", label: "Pre Launch Check" },
  { id: "copy-qa-lower", label: "copy qa" },
  { id: "legal", label: "Legal" },
  { id: "brand", label: "Brand Checks" },
  { id: "copy-qa", label: "Copy QA" },
  { id: "design", label: "Design Checks" },
  { id: "seo", label: "SEO" },
  { id: "default", label: "Default", active: true },
];

const AGENT_CARDS: readonly AgentCard[] = [
  {
    id: "spell-check",
    title: "Spell Check",
    description: "Finds spelling mistakes and typos in your content.",
    lastRun: "26m ago",
    usage: "Used 24 times",
    palette: GREEN_TILE,
  },
  {
    id: "broken-links",
    title: "Broken Links",
    description: "Finds and validates all broken links on the page.",
    lastRun: "10d ago",
    usage: "Used 12 times",
    palette: GREEN_TILE,
  },
  {
    id: "grammar-check",
    title: "Grammar Check",
    description: "Finds grammatical errors in page copy and headings.",
    lastRun: "26m ago",
    usage: "Used 11 times",
    palette: BROWN_TILE,
  },
  {
    id: "pii-detection",
    title: "PII Detection",
    description: "Detects personally identifiable information on the page.",
    lastRun: LABEL_NEVER,
    usage: USAGE_NONE,
    palette: MAGENTA_TILE,
  },
  {
    id: "profanity-filter",
    title: "Profanity Filter",
    description: "Detects profane, vulgar, or offensive language.",
    lastRun: LABEL_NEVER,
    usage: USAGE_NONE,
    palette: TEAL_TILE,
  },
  {
    id: "sensitive-data",
    title: "Sensitive Data",
    description: "Detects exposed sensitive business data, tokens, and secrets.",
    lastRun: LABEL_NEVER,
    usage: USAGE_NONE,
    palette: BLUE_TILE,
  },
];

/**
 * Render a card's {@link TILE_GRID_SIZE}×{@link TILE_GRID_SIZE} dotted "app
 * icon" tile from its {@link TilePalette}. The fills are fixed and hardcoded so
 * the output is deterministic (identical on server and client).
 *
 * @param palette - The background color and row-major dot fills for the tile.
 * @returns The tile element, or `null` on failure.
 */
function TileIcon({ palette }: { palette: TilePalette }): ReactNode {
  try {
    const dots = palette?.dots?.slice(0, TILE_DOT_COUNT) ?? [];
    return (
      <span
        className={styles.tile}
        style={{ background: palette?.background }}
        aria-hidden="true"
      >
        {dots.map((color, index) => (
          <span
            key={`dot-${index}`}
            className={styles.tileDot}
            style={{ background: color }}
          />
        ))}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render a single ready-made agent card: the dotted tile, title + truncated
 * description, the last-run/usage meta row and the run history + play controls.
 *
 * @param card - The agent card content and palette.
 * @param index - Zero-based position, used to stagger the entrance animation.
 * @returns The card element, or `null` on failure.
 */
function AgentCardView({ card, index }: { card: AgentCard; index: number }): ReactNode {
  try {
    return (
      <article className={styles.card} style={{ "--card-index": index } as CSSProperties}>
        <button type="button" className={styles.cardMenu} aria-label={MENU_LABEL}>
          <DotsVerticalIcon size={16} />
        </button>
        <div className={styles.cardTop}>
          <TileIcon palette={card?.palette} />
          <div className={styles.cardText}>
            <h3 className={styles.cardTitle}>{card?.title}</h3>
            <p className={styles.cardDesc}>{card?.description}</p>
          </div>
        </div>
        <div className={styles.cardFoot}>
          <div className={styles.footMeta}>
            <span className={styles.metaItem}>
              <span className={`${styles.metaIcon} ${styles.metaIconRun}`}>
                <RefreshIcon size={13} />
              </span>
              {card?.lastRun}
            </span>
            <span className={styles.metaItem}>
              <span className={`${styles.metaIcon} ${styles.metaIconUsage}`}>
                <SparkleIcon size={13} />
              </span>
              {card?.usage}
            </span>
          </div>
          <div className={styles.footActions}>
            <button type="button" className={styles.historyBtn} aria-label={HISTORY_LABEL}>
              <HistoryIcon size={16} />
            </button>
            <button type="button" className={styles.playBtn} aria-label={RUN_LABEL}>
              <PlayIcon size={10} />
            </button>
          </div>
        </div>
      </article>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Built-in checks" hero artifact.
 *
 * @returns The Superflow Agents window contents, or `null` on failure.
 */
export default function BuiltInChecksArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="built-in-checks">
        <div className={styles.chromeWrap}>
          <BrowserChrome className={styles.chrome} address={ADDRESS} />
        </div>

        <div className={styles.viewport}>
          <aside className={styles.sidebar} aria-label="Agent groups">
            <div className={styles.search} aria-hidden="true">
              <span className={styles.searchIcon}>
                <SearchIcon size={14} />
              </span>
              <span className={styles.searchText}>{SEARCH_PLACEHOLDER}</span>
            </div>
            <nav className={styles.nav}>
              {SIDEBAR_GROUPS.map((group, index) => (
                <span
                  key={group?.id}
                  className={`${styles.navItem} ${group?.active ? styles.navItemActive : ""}`}
                  style={{ "--nav-index": index } as CSSProperties}
                >
                  {group?.active ? <span className={styles.navDot} aria-hidden="true" /> : null}
                  {group?.label}
                </span>
              ))}
              <span
                className={`${styles.navItem} ${styles.createGroup}`}
                style={{ "--nav-index": SIDEBAR_GROUPS.length } as CSSProperties}
              >
                <span className={styles.createIcon}>
                  <PlusIcon size={14} />
                </span>
                {CREATE_GROUP_LABEL}
              </span>
            </nav>
          </aside>

          <section className={styles.main}>
            <header className={styles.mainHeader}>
              <h2 className={styles.heading}>{HEADING}</h2>
              <div className={styles.headerActions}>
                <span className={`${styles.btn} ${styles.btnImport}`}>{IMPORT_LABEL}</span>
                <span className={`${styles.btn} ${styles.btnNew}`}>{NEW_AGENT_LABEL}</span>
              </div>
            </header>

            <div className={styles.cards}>
              {AGENT_CARDS.map((card, index) => (
                <AgentCardView key={card?.id} card={card} index={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
