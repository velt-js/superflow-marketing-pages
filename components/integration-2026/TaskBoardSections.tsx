import type { ComponentType, ReactNode } from "react";
import BlueprintFrame from "@/components/home-2026/BlueprintFrame";
import {
  SuperflowFlowerMark,
  MondayMark,
  AsanaMark,
  ClickUpMark,
} from "./IntegrationBrandMarks";
import styles from "./TaskBoardSections.module.css";

/**
 * Bespoke, hand-authored sections shared by the task-management integration
 * pages (/preview/integrations/monday, /asana, /clickup). Layout and aesthetic
 * were established on the Monday page; copy is per-tool, verbatim from the
 * matching superflow-page-integration-<tool>-v1-1.md build file (Monday
 * vocabulary: items, boards, groups, columns — never "tasks"; Asana/ClickUp
 * speak in tasks). These replace the shared FeatureSet + GetStarted sections
 * on the task-management pages only; every other integration page is
 * untouched.
 *
 * Three sections are exported, each taking a {@link TaskBoardConfig}:
 *  - {@link TaskBoardSyncCrosses} — "What crosses, and which way." (two-way table)
 *  - {@link TaskBoardLinkOnce}    — "Link once. The board flows." (link process)
 *  - {@link TaskBoardUnlocks}     — "What the <tool> sync unlocks" (five wins)
 *
 * Per-tool configs live in {@link TASK_BOARD_CONFIGS}, keyed by page slug.
 */

/* ---------------------------------------------------------------- config */

/** Props shared by every brand-mark glyph a config can reference. */
interface MarkProps {
  size?: number;
  className?: string;
}

/** One "unlock" — a win the sync delivers, plus the cost of not having it. */
export interface TaskBoardUnlockItem {
  id: string;
  title: string;
  description: string;
  without: string;
}

/** Everything tool-specific the three shared sections need to render. */
export interface TaskBoardConfig {
  /** Page slug — used in `data-section` hooks (e.g. "monday-crosses"). */
  slug: string;
  /** Display name of the tool ("Monday", "Asana", "ClickUp"). */
  toolName: string;
  /** The tool's brand mark, matching the hero integration artifacts. */
  Mark: ComponentType<MarkProps>;
  /** Section 2 lede — the two-way table's rendered closing line. */
  crossesLede: string;
  /** Superflow → tool flow statements (left column cards). */
  crossesOut: readonly string[];
  /** Tool → Superflow flow statements (right column cards). */
  crossesIn: readonly string[];
  /** Section 3 display heading (the build file's How-it-works lede). */
  linkHeading: string;
  /** Connect step description. */
  linkConnectDesc: string;
  /** Map step description. */
  linkMapDesc: string;
  /** Work step description. */
  linkWorkDesc: string;
  /** Label inside the Map illustration's select pill. */
  linkMapPillLabel: string;
  /** Section 4 display heading. */
  unlocksHeading: string;
  /** The five wins the sync delivers. */
  unlocks: readonly TaskBoardUnlockItem[];
}

const CROSSES_HEADING = "What crosses, and which way.";
const UNLOCKS_WITHOUT_LABEL = "Without it";
const LINK_WORK_CHIP_LABEL = "2 New Update";
const LINK_WORK_APPROVE_LABEL = "Approve";
const LINK_CONNECT_TITLE = "Connect";
const LINK_MAP_TITLE = "Map";
const LINK_WORK_TITLE = "Work";

/** Copy verbatim from superflow-page-integration-monday-v1-1.md. */
const MONDAY_CONFIG: TaskBoardConfig = {
  slug: "monday",
  toolName: "Monday",
  Mark: MondayMark,
  crossesLede:
    "Superflow writes review state. Monday owns its own item fields. Neither overwrites the other's, and nothing echoes in a loop.",
  crossesOut: [
    "A client sign-off moves the linked item to your mapped done-state.",
    "A reply on the review thread posts to the linked item's updates.",
    "A review's step change moves the item to the mapped column.",
    "A comment can create a linked item, if you turn that on.",
  ],
  crossesIn: [
    "A status change on the board reflects back onto the linked review.",
    "An update on the linked item posts back to the review thread.",
  ],
  linkHeading: "Link once. The board flows.",
  linkConnectDesc: "Authorize Monday from settings.",
  linkMapDesc:
    "Match your Monday columns to Superflow statuses. Your names, not ours.",
  linkWorkDesc: "Reviews run. The board updates itself, both ways.",
  linkMapPillLabel: "Choose Board",
  unlocksHeading: "What the Monday sync unlocks",
  unlocks: [
    {
      id: "self-closing",
      title: "The self-closing item.",
      description:
        "The client approves. The linked item moves to your done-state on its own.",
      without: "The board says open after the client said done.",
    },
    {
      id: "steps-columns",
      title: "Steps as columns.",
      description:
        "The review's current step shows as the item's column, matched to your names.",
      without: "You reconcile two boards by hand.",
    },
    {
      id: "comments-items",
      title: "Comments as items, when you choose",
      description: "A review comment can create a linked item with a back-link.",
      without: "Action items get re-typed into the board.",
    },
    {
      id: "two-way",
      title: "Two-way, no overwrites.",
      description:
        "Board changes reflect back, and each tool writes only its own fields.",
      without: "Sync means overwrite.",
    },
    {
      id: "synced-replies",
      title: "Synced replies.",
      description:
        "Answer on the item or on the review. The thread stays one conversation, in both places.",
      without: "The discussion forks.",
    },
  ],
};

/** Copy verbatim from superflow-page-integration-asana-v1-1.md. */
const ASANA_CONFIG: TaskBoardConfig = {
  slug: "asana",
  toolName: "Asana",
  Mark: AsanaMark,
  crossesLede:
    "Superflow writes review state. Asana owns its own task fields. Neither overwrites the other's, and nothing echoes in a loop.",
  crossesOut: [
    "A client sign-off moves the linked task to your mapped done-state.",
    "A reply on the review thread posts to the linked task's comments.",
    "A review's step change moves the task to the mapped column.",
    "A comment can create a linked task, if you turn that on.",
  ],
  crossesIn: [
    "A status change on the board reflects back onto the linked review.",
    "A comment on the linked task posts back to the review thread.",
  ],
  linkHeading: "Link once. The board follows.",
  linkConnectDesc: "Authorize Asana from settings.",
  linkMapDesc:
    "Match your Asana columns to Superflow statuses. Your names, not ours.",
  linkWorkDesc: "Reviews run. The board updates itself, both ways.",
  linkMapPillLabel: "Choose Project",
  unlocksHeading: "What the Asana sync unlocks",
  unlocks: [
    {
      id: "self-closing",
      title: "The self-closing task.",
      description:
        "The client approves. The linked task moves to your done-state on its own.",
      without: "The board says open after the client said done.",
    },
    {
      id: "steps-columns",
      title: "Steps as columns.",
      description:
        "The review's current step shows as the task's column, matched to your names.",
      without: "You reconcile two boards by hand.",
    },
    {
      id: "comments-tasks",
      title: "Comments as tasks, when you choose",
      description: "A review comment can create a linked task with a back-link.",
      without: "Action items get re-typed into the board.",
    },
    {
      id: "two-way",
      title: "Two-way, no overwrites.",
      description:
        "Board changes reflect back, and each tool writes only its own fields.",
      without: "Sync means overwrite.",
    },
    {
      id: "synced-replies",
      title: "Synced replies.",
      description:
        "Answer on the task or on the review. The thread stays one conversation, in both places.",
      without: "The discussion forks.",
    },
  ],
};

/** Copy verbatim from superflow-page-integration-clickup-v1-1.md. */
const CLICKUP_CONFIG: TaskBoardConfig = {
  slug: "clickup",
  toolName: "ClickUp",
  Mark: ClickUpMark,
  crossesLede:
    "Superflow writes review state. ClickUp owns its own task fields. Neither overwrites the other's, and nothing echoes in a loop.",
  crossesOut: [
    "A client sign-off moves the linked task to your mapped done-status.",
    "A reply on the review thread posts to the linked task's comments.",
    "A review's step change moves the task to the mapped status.",
    "A comment can create a linked task, if you turn that on.",
  ],
  crossesIn: [
    "A status change in ClickUp reflects back onto the linked review.",
    "A comment on the linked task posts back to the review thread.",
  ],
  linkHeading: "Link once. The status follows.",
  linkConnectDesc: "Authorize ClickUp from settings.",
  linkMapDesc:
    "Match your ClickUp statuses to Superflow's. Your names, not ours.",
  linkWorkDesc: "Reviews run. The task updates itself, both ways.",
  linkMapPillLabel: "Choose List",
  unlocksHeading: "What the ClickUp sync unlocks",
  unlocks: [
    {
      id: "self-closing",
      title: "The self-closing task.",
      description:
        "The client approves. The linked task moves to your done-status on its own.",
      without: "The task says open after the client said done.",
    },
    {
      id: "steps-statuses",
      title: "Steps as statuses.",
      description:
        "The review's current step shows as the task's status, matched to your names.",
      without: "You reconcile two tools by hand.",
    },
    {
      id: "comments-tasks",
      title: "Comments as tasks, when you choose",
      description: "A review comment can create a linked task with a back-link.",
      without: "Action items get re-typed into ClickUp.",
    },
    {
      id: "two-way",
      title: "Two-way, no overwrites.",
      description:
        "Status changes reflect back, and each tool writes only its own fields.",
      without: "Sync means overwrite.",
    },
    {
      id: "synced-replies",
      title: "Synced replies.",
      description:
        "Answer on the task or on the review. The thread stays one conversation, in both places.",
      without: "The discussion forks.",
    },
  ],
};

/**
 * The task-management pages that render the bespoke board-sync template,
 * keyed by their `integrationPreviewPage` slug.
 */
export const TASK_BOARD_CONFIGS: Readonly<Record<string, TaskBoardConfig>> = {
  monday: MONDAY_CONFIG,
  asana: ASANA_CONFIG,
  clickup: CLICKUP_CONFIG,
};

/* --------------------------------------------------------------- glyphs */

/** Props shared by the inline line/fill glyphs. */
interface GlyphProps {
  /** Rendered width/height in pixels (glyphs are square unless noted). */
  size?: number;
}

/**
 * Chat-bubble outline glyph (Section 2 header, Superflow side).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ChatBubbleGlyph({ size = 26 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H9l-4 3v-3H5a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Board / kanban glyph (Section 2 header, tool side).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function BoardGlyph({ size = 26 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 4v16" />
        <path d="M15 4v16" />
        <rect x="16.4" y="6.6" width="3.2" height="3.2" rx="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Right-pointing arrow glyph (header icon rows and logo pairs).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ArrowGlyph({ size = 20 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * "Repeat" two-way glyph (Section 3, Connect illustration).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function RepeatGlyph({ size = 30 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
        <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * "Plug" glyph (Section 3, Map illustration).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function PlugGlyph({ size = 22 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054z" />
        <path d="M4 20l3.5 -3.5" />
        <path d="M15 4l-3.5 3.5" />
        <path d="M20 9l-3.5 3.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Chevron-down glyph (Section 3, Map select pill).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ChevronDownGlyph({ size = 20 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6l6 -6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Layout-grid glyph (Section 3, Work "New Update" chip).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function LayoutGridGlyph({ size = 18 }: GlyphProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Green double-check glyph (Section 4 card marker).
 *
 * @param props - Rendered width in pixels (glyph is wider than tall).
 * @returns The inline SVG, or `null` on failure.
 */
function DoubleCheckGlyph({ size = 30 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 30 21"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1.5 11.5l5 5L17 4.5" />
        <path d="M12 16.5l0.5 0.5L28.5 4.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Muted clock glyph (Section 4 "Without it" marker — the state before sync).
 *
 * @param props - Rendered size in pixels.
 * @returns The inline SVG, or `null` on failure.
 */
function ClockGlyph({ size = 16 }: GlyphProps): ReactNode {
  try {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------ Section 2 — What crosses */

/** Props shared by the three config-driven sections. */
interface TaskBoardSectionProps {
  /** The per-tool copy + branding. */
  config: TaskBoardConfig;
}

/**
 * Render one flow column: a Superflow/tool logo pair header over its cards.
 *
 * @param props.config - The per-tool config supplying the brand mark.
 * @param props.direction - `"out"` renders Superflow → tool; `"in"` reverses.
 * @param props.label - Accessible label describing the sync direction.
 * @param props.cards - The flow statements shown as cards.
 * @returns The flow column, or `null` on failure.
 */
function CrossesColumn({
  config,
  direction,
  label,
  cards,
}: {
  config: TaskBoardConfig;
  direction: "out" | "in";
  label: string;
  cards: readonly string[];
}): ReactNode {
  try {
    const ToolMark = config?.Mark;
    const leadingMark =
      direction === "out" ? <SuperflowFlowerMark size={30} /> : <ToolMark size={26} />;
    const trailingMark =
      direction === "out" ? <ToolMark size={26} /> : <SuperflowFlowerMark size={30} />;
    return (
      <div className={styles.crossCol}>
        <div className={styles.crossColHead} role="img" aria-label={label}>
          {leadingMark}
          <span className={styles.crossPairArrow} aria-hidden="true">
            <ArrowGlyph size={18} />
          </span>
          {trailingMark}
        </div>
        <div className={styles.crossCards}>
          {cards.map((card) => (
            <article key={card} className={styles.crossCard}>
              <p className={styles.crossCardText}>{card}</p>
            </article>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Section 2 — "What crosses, and which way." A centered icon pair (comment
 * bubble → board) over a serif heading and lede, then two columns of flow
 * cards showing what syncs Superflow → tool and tool → Superflow. The whole
 * section is wrapped in the shared {@link BlueprintFrame} (the same decorative
 * crosshair/registration-bolt frame the homepage Solution section uses), drawn
 * in on scroll behind the content.
 *
 * @param props.config - The per-tool copy + branding.
 * @returns The section, or `null` on failure.
 */
export function TaskBoardSyncCrosses({ config }: TaskBoardSectionProps): ReactNode {
  try {
    const outLabel = `Superflow to ${config.toolName}`;
    const inLabel = `${config.toolName} to Superflow`;
    return (
      <section
        className={`${styles.section} ${styles.crossesSection}`}
        data-section={`${config.slug}-crosses`}
      >
        <BlueprintFrame />
        <div className={`${styles.inner} ${styles.crossesInner}`}>
          <div className={styles.headCenter}>
            <span className={styles.crossIconRow} aria-hidden="true">
              <span className={styles.crossChat}>
                <ChatBubbleGlyph size={26} />
              </span>
              <span className={styles.crossArrow}>
                <ArrowGlyph size={20} />
              </span>
              <span className={styles.crossBoard}>
                <BoardGlyph size={26} />
              </span>
            </span>
            <h2 className={styles.display}>{CROSSES_HEADING}</h2>
            <p className={styles.lede}>{config.crossesLede}</p>
          </div>

          <div className={styles.crossGrid}>
            <CrossesColumn
              config={config}
              direction="out"
              label={outLabel}
              cards={config.crossesOut}
            />
            <CrossesColumn
              config={config}
              direction="in"
              label={inLabel}
              cards={config.crossesIn}
            />
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------ Section 3 — Link once */

/**
 * Section 3 — "Link once." Three numbered cards (Connect, Map, Work), each
 * with a small illustration mirroring the design reference. Copy per tool.
 *
 * @param props.config - The per-tool copy + branding.
 * @returns The section, or `null` on failure.
 */
export function TaskBoardLinkOnce({ config }: TaskBoardSectionProps): ReactNode {
  try {
    const ToolMark = config?.Mark;
    return (
      <section className={styles.section} data-section={`${config.slug}-linkonce`}>
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{config.linkHeading}</h2>
          </div>

          <div className={styles.linkGrid}>
            <article className={styles.linkCard}>
              <span className={styles.linkNum}>01</span>
              <h3 className={styles.linkTitle}>{LINK_CONNECT_TITLE}</h3>
              <p className={styles.linkDesc}>{config.linkConnectDesc}</p>
              <div className={styles.linkArt} aria-hidden="true">
                <span className={styles.linkStage}>
                  <span className={styles.linkConnectRow}>
                    <span className={styles.linkBubble} />
                    <span className={styles.linkRepeat}>
                      <RepeatGlyph size={28} />
                    </span>
                    <span className={styles.linkToolMark}>
                      <ToolMark size={38} />
                    </span>
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.linkCard}>
              <span className={styles.linkNum}>02</span>
              <h3 className={styles.linkTitle}>{LINK_MAP_TITLE}</h3>
              <p className={styles.linkDesc}>{config.linkMapDesc}</p>
              <div className={styles.linkArt} aria-hidden="true">
                <span className={styles.linkStage}>
                  <span className={styles.linkMapPill}>
                    <span className={styles.linkMapPlug}>
                      <PlugGlyph size={20} />
                    </span>
                    <span className={styles.linkMapText}>{config.linkMapPillLabel}</span>
                    <span className={styles.linkMapChevron}>
                      <ChevronDownGlyph size={20} />
                    </span>
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.linkCard}>
              <span className={styles.linkNum}>03</span>
              <h3 className={styles.linkTitle}>{LINK_WORK_TITLE}</h3>
              <p className={styles.linkDesc}>{config.linkWorkDesc}</p>
              <div className={styles.linkArt} aria-hidden="true">
                <span className={styles.linkStage}>
                  <span className={styles.linkWorkRow}>
                    <span className={styles.linkWorkChip}>
                      <span className={styles.linkWorkGrid}>
                        <LayoutGridGlyph size={18} />
                      </span>
                      {LINK_WORK_CHIP_LABEL}
                    </span>
                    <span className={styles.linkApprove}>{LINK_WORK_APPROVE_LABEL}</span>
                  </span>
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------ Section 4 — Unlocks */

/**
 * Section 4 — "What the <tool> sync unlocks." An editorial numbered list: each
 * row pairs a mono index + serif title on the left with a green "with it" line
 * (double-check + the win) and a muted rose "without it" line (clock + the
 * cost) on the right, separated by hairline rules.
 *
 * @param props.config - The per-tool copy + branding.
 * @returns The section, or `null` on failure.
 */
export function TaskBoardUnlocks({ config }: TaskBoardSectionProps): ReactNode {
  try {
    return (
      <section className={styles.section} data-section={`${config.slug}-unlocks`}>
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{config.unlocksHeading}</h2>
          </div>

          <div className={styles.unlockList}>
            {config.unlocks.map((item, index) => (
              <article key={item.id} className={styles.unlockItem}>
                <div className={styles.unlockLead}>
                  <span className={styles.unlockIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.unlockTitle}>{item.title}</h3>
                </div>
                <div className={styles.unlockLines}>
                  <div className={styles.unlockRow}>
                    <span
                      className={`${styles.unlockMark} ${styles.unlockMarkYes}`}
                      aria-hidden="true"
                    >
                      <DoubleCheckGlyph size={16} />
                    </span>
                    <p className={styles.unlockRowText}>{item.description}</p>
                  </div>
                  <div className={`${styles.unlockRow} ${styles.unlockRowNeg}`}>
                    <span
                      className={`${styles.unlockMark} ${styles.unlockMarkNo}`}
                      aria-hidden="true"
                    >
                      <ClockGlyph size={15} />
                    </span>
                    <p className={styles.unlockRowText}>
                      <span className={styles.unlockNegLabel}>
                        {UNLOCKS_WITHOUT_LABEL}:
                      </span>{" "}
                      {item.without}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
