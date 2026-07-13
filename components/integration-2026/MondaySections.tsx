import type { ReactNode } from "react";
import BlueprintFrame from "@/components/home-2026/BlueprintFrame";
import { SuperflowFlowerMark, MondayMark } from "./IntegrationBrandMarks";
import styles from "./MondaySections.module.css";

/**
 * Bespoke, hand-authored sections for the Monday integration page
 * (/preview/integrations/monday). Copy is verbatim from
 * superflow-page-integration-monday-v1-1.md (vocabulary: items, boards, groups,
 * columns — never "tasks"). These replace the shared FeatureSet + GetStarted
 * sections on the Monday page only; every other integration page is untouched.
 *
 * Three sections are exported:
 *  - {@link MondaySyncCrosses}  — "What crosses, and which way." (two-way table)
 *  - {@link MondayLinkOnce}     — "Link once. The board flows." (link process)
 *  - {@link MondayUnlocks}      — "What the Monday sync unlocks" (five wins)
 */

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
 * Board / kanban glyph (Section 2 header, Monday side).
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
 * Chevron-down glyph (Section 3, Map "Choose Board" select pill).
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

const CROSSES_HEADING = "What crosses, and which way.";
const CROSSES_LEDE =
  "Superflow writes review state. Monday owns its own item fields. Neither overwrites the other's, and nothing echoes in a loop.";
const CROSSES_OUT_LABEL = "Superflow to Monday";
const CROSSES_IN_LABEL = "Monday to Superflow";

/** Superflow → Monday flows (left column). */
const CROSSES_OUT: readonly string[] = [
  "A client sign-off moves the linked item to your mapped done-state.",
  "A reply on the review thread posts to the linked item's updates.",
  "A review's step change moves the item to the mapped column.",
  "A comment can create a linked item, if you turn that on.",
];

/** Monday → Superflow flows (right column). */
const CROSSES_IN: readonly string[] = [
  "A status change on the board reflects back onto the linked review.",
  "An update on the linked item posts back to the review thread.",
];

/**
 * Render one flow column: a Superflow/Monday logo pair header over its cards.
 *
 * @param props.direction - `"out"` renders Superflow → Monday; `"in"` reverses.
 * @param props.label - Accessible label describing the sync direction.
 * @param props.cards - The flow statements shown as cards.
 * @returns The flow column, or `null` on failure.
 */
function CrossesColumn({
  direction,
  label,
  cards,
}: {
  direction: "out" | "in";
  label: string;
  cards: readonly string[];
}): ReactNode {
  try {
    const leadingMark =
      direction === "out" ? <SuperflowFlowerMark size={30} /> : <MondayMark size={26} />;
    const trailingMark =
      direction === "out" ? <MondayMark size={26} /> : <SuperflowFlowerMark size={30} />;
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
 * cards showing what syncs Superflow → Monday and Monday → Superflow. The whole
 * section is wrapped in the shared {@link BlueprintFrame} (the same decorative
 * crosshair/registration-bolt frame the homepage Solution section uses), drawn
 * in on scroll behind the content.
 *
 * @returns The section, or `null` on failure.
 */
export function MondaySyncCrosses(): ReactNode {
  try {
    return (
      <section
        className={`${styles.section} ${styles.crossesSection}`}
        data-section="monday-crosses"
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
            <p className={styles.lede}>{CROSSES_LEDE}</p>
          </div>

          <div className={styles.crossGrid}>
            <CrossesColumn direction="out" label={CROSSES_OUT_LABEL} cards={CROSSES_OUT} />
            <CrossesColumn direction="in" label={CROSSES_IN_LABEL} cards={CROSSES_IN} />
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------ Section 3 — Link once */

const LINK_HEADING = "Link once. The board flows.";
const LINK_MAP_PILL_LABEL = "Choose Board";
const LINK_WORK_CHIP_LABEL = "2 New Update";
const LINK_WORK_APPROVE_LABEL = "Approve";

/**
 * Section 3 — "Link once. The board flows." Three numbered cards (Connect, Map,
 * Work), each with a small illustration mirroring the design reference.
 *
 * @returns The section, or `null` on failure.
 */
export function MondayLinkOnce(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="monday-linkonce">
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{LINK_HEADING}</h2>
          </div>

          <div className={styles.linkGrid}>
            <article className={styles.linkCard}>
              <span className={styles.linkNum}>01</span>
              <h3 className={styles.linkTitle}>Connect</h3>
              <p className={styles.linkDesc}>Authorize Monday from settings.</p>
              <div className={styles.linkArt} aria-hidden="true">
                <span className={styles.linkStage}>
                  <span className={styles.linkConnectRow}>
                    <span className={styles.linkBubble} />
                    <span className={styles.linkRepeat}>
                      <RepeatGlyph size={28} />
                    </span>
                    <span className={styles.linkMonday}>
                      <MondayMark size={38} />
                    </span>
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.linkCard}>
              <span className={styles.linkNum}>02</span>
              <h3 className={styles.linkTitle}>Map</h3>
              <p className={styles.linkDesc}>
                Match your Monday columns to Superflow statuses. Your names, not ours.
              </p>
              <div className={styles.linkArt} aria-hidden="true">
                <span className={styles.linkStage}>
                  <span className={styles.linkMapPill}>
                    <span className={styles.linkMapPlug}>
                      <PlugGlyph size={20} />
                    </span>
                    <span className={styles.linkMapText}>{LINK_MAP_PILL_LABEL}</span>
                    <span className={styles.linkMapChevron}>
                      <ChevronDownGlyph size={20} />
                    </span>
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.linkCard}>
              <span className={styles.linkNum}>03</span>
              <h3 className={styles.linkTitle}>Work</h3>
              <p className={styles.linkDesc}>
                Reviews run. The board updates itself, both ways.
              </p>
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

const UNLOCKS_HEADING = "What the Monday sync unlocks";
const UNLOCKS_WITHOUT_LABEL = "Without it";

/** One "unlock" — a win the sync delivers, plus the cost of not having it. */
interface UnlockItem {
  id: string;
  title: string;
  description: string;
  without: string;
}

const UNLOCKS: readonly UnlockItem[] = [
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
];

/**
 * Section 4 — "What the Monday sync unlocks." Five green cards, each with a
 * double-check marker, a serif title, a description, and a muted "Without it"
 * footer line (the fifth card spans the full width).
 *
 * @returns The section, or `null` on failure.
 */
export function MondayUnlocks(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="monday-unlocks">
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{UNLOCKS_HEADING}</h2>
          </div>

          <div className={styles.unlockGrid}>
            {UNLOCKS.map((item) => (
              <article key={item.id} className={styles.unlockCard}>
                <span className={styles.unlockCheck} aria-hidden="true">
                  <DoubleCheckGlyph size={30} />
                </span>
                <h3 className={styles.unlockTitle}>{item.title}</h3>
                <p className={styles.unlockDesc}>{item.description}</p>
                <div className={styles.unlockWithout}>
                  <span className={styles.unlockWithoutLabel}>
                    <span className={styles.unlockWithoutIcon}>
                      <ClockGlyph size={15} />
                    </span>
                    {UNLOCKS_WITHOUT_LABEL}
                  </span>
                  <p className={styles.unlockWithoutText}>{item.without}</p>
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
