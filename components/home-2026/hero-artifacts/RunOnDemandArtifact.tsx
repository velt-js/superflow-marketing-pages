import type { ReactNode, SVGProps } from "react";
import BrowserChrome from "../feature-artifacts/BrowserChrome";
import AgentCommentCard from "../feature-artifacts/AgentCommentCard";
import CommentPin from "../feature-artifacts/CommentPin";
import LegoFaceIcon from "../feature-artifacts/LegoFaceIcon";
import FakeCursor from "../feature-artifacts/FakeCursor";
import styles from "./RunOnDemandArtifact.module.css";

/**
 * Hero tab artifact — "Run on Demand".
 *
 * The Superflow Agents run screen: the shared browser window frames a two-pane
 * app — a scrollable list of ready-made QA agents on the left (each with the
 * dotted "app icon" tile, title/description, last-run + usage meta and a run
 * play button) and the reviewed page on the right (a media placeholder +
 * skeleton copy). A fake pointer glides onto the Grammar Check agent's play
 * button and "presses" it, then travels across to the page where a warm
 * highlight, a comment marker and the shared {@link AgentCommentCard} finding
 * (approve / reject) drop in — reproducing "run an agent on demand and its
 * finding lands as a comment".
 *
 * Composed to match the sibling hero artifacts: the root is the white inner
 * card (the shared `.window` frame in {@link ../HeroWorkflowShowcase} supplies
 * the surrounding 2px black reveal), the browser chrome comes from the shared
 * {@link BrowserChrome} and the finding card from the shared
 * {@link AgentCommentCard}. The scene is CSS-only and replays whenever the tab
 * mounts; reduced motion rests in the settled state (finding dropped, pointer
 * gone).
 */

const ADDRESS = "YOUR-SITE.COM";
const MENU_LABEL = "Card actions";
const RUN_LABEL = "Run agent";
const HISTORY_LABEL = "Run history";

/** Id of the agent the pointer runs (the choreography targets this card). */
const TARGET_AGENT_ID = "grammar-check";

/** Repeated meta strings for agents that have never run. */
const LABEL_NEVER = "Never";
const USAGE_NONE = "Used 0 times";

/** Number of dots per row/column in a card's square "app icon" grid tile. */
const TILE_GRID_SIZE = 3;
/** Total dots in a tile — the 3×3 matrix has 9 cells. */
const TILE_DOT_COUNT = TILE_GRID_SIZE * TILE_GRID_SIZE;

/** Content for the dropped agent finding (Grammar Check, matching the run). */
const FINDING_AGENT = "Grammar Check";
const FINDING_TIME = "now";
const FINDING_TITLE = "Subject–verb agreement";
const FINDING_DESC =
  "\u201CThe team are shipping\u201D reads as plural. Use \u201CThe team is shipping\u201D in the hero subheading.";

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

/** A ready-made agent shown in the left run list. */
type AgentCard = {
  id: string;
  title: string;
  description: string;
  lastRun: string;
  usage: string;
  palette: TilePalette;
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
    id: TARGET_AGENT_ID,
    title: "Grammar Check",
    description: "Finds grammatical errors in page copy and headings.",
    lastRun: "26m ago",
    usage: "Used 11 times",
    palette: BROWN_TILE,
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
    id: "lorem-ipsum",
    title: "Lorem Ipsum",
    description: "Detects placeholder, dummy, or temporary text.",
    lastRun: "10d ago",
    usage: "Used 6 times",
    palette: BLUE_TILE,
  },
];

/** Number of skeleton copy lines drawn on the reviewed page body. */
const PAGE_LINE_COUNT = 5;

/** Zero-based indices of the shorter (ragged) skeleton copy lines. */
const SHORT_LINE_INDEXES: ReadonlySet<number> = new Set([1, 4]);

/**
 * Render a card's {@link TILE_GRID_SIZE}×{@link TILE_GRID_SIZE} dotted "app
 * icon" tile from its {@link TilePalette}. The fills are fixed and hardcoded so
 * the output is deterministic (identical on server and client).
 *
 * @param root0 - The tile props.
 * @param root0.palette - The background color and row-major dot fills.
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
 * Render a single agent card in the left run list: the dotted tile, title +
 * truncated description, the last-run/usage meta row and the run-history + play
 * controls. The `active` card also renders the pressed-play ripple.
 *
 * @param root0 - The card props.
 * @param root0.card - The agent card content and palette.
 * @param root0.active - Whether this is the card the pointer runs.
 * @returns The card element, or `null` on failure.
 */
function AgentCardView({
  card,
  active,
}: {
  card: AgentCard;
  active: boolean;
}): ReactNode {
  try {
    const cardClassName = active ? `${styles.card} ${styles.cardActive}` : styles.card;
    const playClassName = active ? `${styles.playBtn} ${styles.playBtnActive}` : styles.playBtn;
    return (
      <article className={cardClassName}>
        <button type="button" className={styles.cardMenu} aria-label={MENU_LABEL}>
          <DotsVerticalIcon size={20} />
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
                <RefreshIcon size={15} />
              </span>
              {card?.lastRun}
            </span>
            <span className={styles.metaItem}>
              <span className={`${styles.metaIcon} ${styles.metaIconUsage}`}>
                <SparkleIcon size={15} />
              </span>
              {card?.usage}
            </span>
          </div>
          <div className={styles.footActions}>
            <button type="button" className={styles.historyBtn} aria-label={HISTORY_LABEL}>
              <HistoryIcon size={19} />
            </button>
            <span className={styles.playWrap}>
              <button type="button" className={playClassName} aria-label={RUN_LABEL}>
                <PlayIcon size={12} />
              </button>
              {active ? <span className={styles.playRipple} aria-hidden="true" /> : null}
            </span>
          </div>
        </div>
      </article>
    );
  } catch {
    return null;
  }
}

/**
 * Render the reviewed-page body: a media placeholder followed by skeleton copy
 * lines. Sits behind the finding overlay (highlight + marker + comment card).
 *
 * @returns The page-body element, or `null` on failure.
 */
function PageBody(): ReactNode {
  try {
    return (
      <div className={styles.page} aria-hidden="true">
        <div className={styles.media} />
        <div className={styles.lines}>
          {Array.from({ length: PAGE_LINE_COUNT }, (_unused, index) => (
            <span
              key={`line-${index}`}
              className={
                SHORT_LINE_INDEXES.has(index)
                  ? `${styles.line} ${styles.lineShort}`
                  : styles.line
              }
            />
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Run on Demand" hero artifact.
 *
 * @returns The agents run screen contents, or `null` on failure.
 */
export default function RunOnDemandArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="run-on-demand">
        <div className={styles.chromeWrap}>
          <BrowserChrome className={styles.chrome} address={ADDRESS} />
        </div>

        <div className={styles.viewport}>
          <aside className={styles.sidebar} aria-label="QA agents">
            <div className={styles.agentList}>
              {AGENT_CARDS.map((card) => (
                <AgentCardView
                  key={card?.id}
                  card={card}
                  active={card?.id === TARGET_AGENT_ID}
                />
              ))}
            </div>
          </aside>

          <section className={styles.surface}>
            <PageBody />

            <span className={styles.highlight} aria-hidden="true" />
            <CommentPin
              className={styles.pinMarker}
              tone="#6a5cf6"
              size={19}
              glyph={<LegoFaceIcon size={19} />}
            />
            <div className={styles.findingCard}>
              <AgentCommentCard
                agentName={FINDING_AGENT}
                timeAgo={FINDING_TIME}
                title={FINDING_TITLE}
                description={FINDING_DESC}
                avatarVariant="agentDots"
              />
            </div>
          </section>

          <FakeCursor className={styles.cursor} size={24} />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
