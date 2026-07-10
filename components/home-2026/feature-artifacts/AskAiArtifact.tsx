import type { CSSProperties, ReactNode } from "react";
import styles from "./AskAiArtifact.module.css";
import BrowserChrome from "./BrowserChrome";

/**
 * Feature-section artifact — "Ask AI".
 * Figma: node 775:2983 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * A chat/conversation UI for the "Ask AI" state: a right-aligned user message
 * bubble answered by a left-aligned assistant turn (avatar + response bubble),
 * with a rounded "Ask the review history anything…" input bar pinned at the
 * bottom to complete the chat feel.
 *
 * The chat frame, avatar, input bar and mount choreography are shared; the
 * question, the answer heading, an optional "from <client>" scope pill, the
 * answer body and optional citation chips all change per {@link AskAiVariant}.
 * Five answer-body renderers cover every Ask AI tab: a 100% stacked bar, a set
 * of ranking bars, a recurring-pattern list, severity signal cards and a small
 * generated column chart.
 *
 * Laid out at the siblings' native type scale (14–18px) inside the panel's
 * visible 631px frame, so it needs no transform-scale hack; the root fills its
 * container and clips any bleed.
 */

/** Address shown in the hero browser-chrome bar above the chat. */
const HERO_CHROME_ADDRESS = "SUPERFLOW";

/** Default placeholder shown in the chat input bar. */
const DEFAULT_INPUT_PLACEHOLDER = "Ask the review history anything…";

/** Exact segment/dot fills carried over from the original Figma design. */
const COLOR_RED = "#ff5352";
const COLOR_AMBER = "#f4ad3b";
const COLOR_PURPLE = "#a560ff";
/** Brand indigo + supporting hues for the ranking / chart / signal renderers. */
const COLOR_INDIGO = "#433df3";
const COLOR_BLUE = "#48a8f0";

/** Tabler `arrow-up` — the send-button glyph. */
const SEND_PATHS: readonly string[] = [
  "M12 5l0 14",
  "M18 11l-6 -6",
  "M6 11l6 -6",
];

/** Tabler `world` — the scope-pill glyph (per-client / cross-project scope). */
const GLOBE_PATHS: readonly string[] = [
  "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
  "M3.6 9h16.8",
  "M3.6 15h16.8",
  "M11.5 3a17 17 0 0 0 0 18",
  "M12.5 3a17 17 0 0 1 0 18",
];

/** Tabler `link` — the citation-chip glyph. */
const LINK_PATHS: readonly string[] = [
  "M9 15l6 -6",
  "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464",
  "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463",
];

/* -------------------------------------------------------------- body models */

/** One segment of the 100% stacked answer bar. */
type StackedSegment = {
  id: string;
  color: string;
  /** Relative flex weight (e.g. 5 / 3 / 2 reproduces a 50% / 30% / 20% split). */
  flex: number;
};

/** One legend row beneath a stacked bar: coloured dot, label and percentage. */
type StackedLegendRow = {
  id: string;
  color: string;
  label: string;
  value: string;
};

/** One ranked row: label, proportional bar and its display value. */
type RankingRow = {
  id: string;
  color: string;
  label: string;
  /** Numeric magnitude used to size the bar against the row set's max. */
  value: number;
  /** Right-aligned value text (e.g. "42"). */
  display: string;
};

/** One recurring-pattern row: coloured dot, label and a small meta count. */
type PatternRow = {
  id: string;
  color: string;
  label: string;
  meta: string;
};

/** Severity ramp for a signal card's status dot. */
type SignalSeverity = "high" | "medium" | "low";

/** One signal/alert card: severity dot, title and supporting detail. */
type SignalCard = {
  id: string;
  severity: SignalSeverity;
  title: string;
  detail: string;
};

/** One column of the generated mini bar chart. */
type ChartColumn = {
  id: string;
  label: string;
  value: number;
};

/** Discriminated union of every answer-body shape the artifact can render. */
type AskAiBody =
  | {
      type: "stacked-bar";
      segments: readonly StackedSegment[];
      legend: readonly StackedLegendRow[];
    }
  | { type: "ranking-bars"; rows: readonly RankingRow[] }
  | { type: "pattern-list"; items: readonly PatternRow[] }
  | { type: "signal-cards"; cards: readonly SignalCard[] }
  | { type: "mini-bar-chart"; columns: readonly ChartColumn[] };

/** Full content for a single Ask AI variant (question + grounded answer). */
type VariantContent = {
  /** Right-aligned user question bubble. */
  prompt: string;
  /** Bold lead of the mixed-weight answer heading. */
  headingLead: string;
  /** Regular remainder of the answer heading. */
  headingRest: string;
  /** Optional "from <client>" scope pill shown above the heading. */
  scope?: string;
  /** Chat input placeholder (defaults to {@link DEFAULT_INPUT_PLACEHOLDER}). */
  inputPlaceholder?: string;
  /** The answer body renderer + its data. */
  body: AskAiBody;
  /** Optional citation chips shown beneath the answer body. */
  citations?: readonly string[];
};

/**
 * Every selectable Ask AI variant. The key doubles as the `data-artifact` hook
 * and the Feature Set `MOCKS` registry key, so a tab can select it directly.
 */
export type AskAiVariant =
  | "ask-ai"
  | "ask-ai-cited"
  | "ask-ai-per-client"
  | "ask-ai-copy-vs-bug"
  | "ask-ai-cross-project"
  | "ask-ai-load-by-team"
  | "ask-ai-delay-churn"
  | "ask-ai-ops-signals"
  | "ask-ai-analytics";

/** The default variant — the original "common client issues" breakdown. */
const DEFAULT_VARIANT: AskAiVariant = "ask-ai";

/**
 * Content table for every Ask AI variant. Client names (Acme, Northwind,
 * Globex, Vireo) and team names are consistent fictional agency data so the
 * page reads like one product answering different questions from the same
 * review history.
 */
const VARIANTS: Readonly<Record<AskAiVariant, VariantContent>> = {
  "ask-ai": {
    prompt: "Tell me common client issues",
    headingLead: "Copy Issues",
    headingRest: " are the most common, Here is a breakdown",
    body: {
      type: "stacked-bar",
      segments: [
        { id: "placeholder-text", color: COLOR_RED, flex: 5 },
        { id: "incorrect-names", color: COLOR_AMBER, flex: 3 },
        { id: "typos-grammar", color: COLOR_PURPLE, flex: 2 },
      ],
      legend: [
        { id: "placeholder-text", color: COLOR_RED, label: "Placeholder Text", value: "50%" },
        { id: "incorrect-names", color: COLOR_AMBER, label: "Incorrect Names", value: "30%" },
        { id: "typos-grammar", color: COLOR_PURPLE, label: "Typos & Grammar", value: "20%" },
      ],
    },
  },
  "ask-ai-cited": {
    prompt: "Why did Acme's homepage take 4 rounds?",
    headingLead: "Mostly copy revisions",
    headingRest: " — here's what drove the extra rounds",
    scope: "Acme · Homepage",
    body: {
      type: "stacked-bar",
      segments: [
        { id: "copy-edits", color: COLOR_RED, flex: 55 },
        { id: "brand-tone", color: COLOR_AMBER, flex: 25 },
        { id: "layout", color: COLOR_PURPLE, flex: 20 },
      ],
      legend: [
        { id: "copy-edits", color: COLOR_RED, label: "Copy edits", value: "55%" },
        { id: "brand-tone", color: COLOR_AMBER, label: "Brand tone", value: "25%" },
        { id: "layout", color: COLOR_PURPLE, label: "Layout tweaks", value: "20%" },
      ],
    },
    citations: ["3 comments · Round 2", "2 decisions · Brand review", "Memory · Acme guidelines"],
  },
  "ask-ai-per-client": {
    prompt: "Which clients take the most rounds?",
    headingLead: "Northwind",
    headingRest: " draws the most review right now",
    body: {
      type: "ranking-bars",
      rows: [
        { id: "northwind", color: COLOR_RED, label: "Northwind", value: 42, display: "42" },
        { id: "acme", color: COLOR_AMBER, label: "Acme", value: 31, display: "31" },
        { id: "globex", color: COLOR_PURPLE, label: "Globex", value: 24, display: "24" },
        { id: "vireo", color: COLOR_INDIGO, label: "Vireo", value: 18, display: "18" },
      ],
    },
  },
  "ask-ai-copy-vs-bug": {
    prompt: "Is Acme mostly copy or bugs?",
    headingLead: "Acme is mostly copy",
    headingRest: " — 68% writing, 32% build",
    scope: "Acme",
    body: {
      type: "stacked-bar",
      segments: [
        { id: "copy", color: COLOR_INDIGO, flex: 68 },
        { id: "bugs", color: COLOR_RED, flex: 32 },
      ],
      legend: [
        { id: "copy", color: COLOR_INDIGO, label: "Copy", value: "68%" },
        { id: "bugs", color: COLOR_RED, label: "Bugs", value: "32%" },
      ],
    },
  },
  "ask-ai-cross-project": {
    prompt: "What keeps coming up across every project?",
    headingLead: "Three patterns",
    headingRest: " repeat across your projects",
    body: {
      type: "pattern-list",
      items: [
        { id: "placeholder", color: COLOR_RED, label: "Placeholder text shipped to review", meta: "9 projects" },
        { id: "cta-copy", color: COLOR_AMBER, label: "CTA copy rejected on first pass", meta: "6 projects" },
        { id: "alt-text", color: COLOR_PURPLE, label: "Missing alt text flagged", meta: "5 projects" },
      ],
    },
  },
  "ask-ai-load-by-team": {
    prompt: "Where is review load piling up?",
    headingLead: "The Web team",
    headingRest: " is carrying the most review",
    body: {
      type: "ranking-bars",
      rows: [
        { id: "web", color: COLOR_INDIGO, label: "Web", value: 46, display: "46" },
        { id: "brand", color: COLOR_AMBER, label: "Brand", value: 29, display: "29" },
        { id: "growth", color: COLOR_PURPLE, label: "Growth", value: 17, display: "17" },
      ],
    },
  },
  "ask-ai-delay-churn": {
    prompt: "Any accounts at risk?",
    headingLead: "Two accounts",
    headingRest: " show early churn signals",
    body: {
      type: "signal-cards",
      cards: [
        { id: "globex", severity: "high", title: "Globex", detail: "Rounds climbing 3 → 5 → 7 this month" },
        { id: "vireo", severity: "medium", title: "Vireo", detail: "12 days stalled, no client reply" },
      ],
    },
  },
  "ask-ai-ops-signals": {
    prompt: "What needs my attention today?",
    headingLead: "3 signals",
    headingRest: " across your reviews",
    body: {
      type: "signal-cards",
      cards: [
        { id: "acme-stalled", severity: "high", title: "Acme redesign stalled", detail: "No client reply in 6 days" },
        { id: "globex-spike", severity: "medium", title: "Rejections spiking on Globex", detail: "3× the usual this week" },
        { id: "vireo-sla", severity: "low", title: "Vireo nearing SLA", detail: "2 reviews due in 24h" },
      ],
    },
  },
  "ask-ai-analytics": {
    prompt: "Break my reviews down by month",
    headingLead: "Generated",
    headingRest: " from your last 6 months of reviews",
    body: {
      type: "mini-bar-chart",
      columns: [
        { id: "feb", label: "Feb", value: 12 },
        { id: "mar", label: "Mar", value: 18 },
        { id: "apr", label: "Apr", value: 15 },
        { id: "may", label: "May", value: 22 },
        { id: "jun", label: "Jun", value: 19 },
        { id: "jul", label: "Jul", value: 26 },
      ],
    },
  },
};

/** Maps a signal severity onto its status-dot fill. */
const SEVERITY_COLOR: Readonly<Record<SignalSeverity, string>> = {
  high: COLOR_RED,
  medium: COLOR_AMBER,
  low: COLOR_BLUE,
};

/**
 * 24×24 Tabler-style stroke icon (currentColor stroke, round caps/joins).
 *
 * @param props - Rendered pixel size and the list of path definitions.
 * @returns The configured stroke `<svg>` element, or `null` on failure.
 */
function StrokeGlyph({
  size,
  paths,
}: {
  size: number;
  paths: readonly string[];
}): ReactNode {
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
      >
        {paths.map((definition) => (
          <path key={definition} d={definition} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Assistant avatar — a glossy blue sphere (Figma group 582:331). The internal
 * ids are suffixed `_582_331` to stay unique against other inline SVGs.
 *
 * @param props - Rendered pixel size of the sphere.
 * @returns The avatar `<svg>` element, or `null` on failure.
 */
function AssistantAvatar({ size }: { size: number }): ReactNode {
  try {
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
  } catch {
    return null;
  }
}

/**
 * Render the 100% stacked answer bar with its colour-dotted legend.
 *
 * @param props - The stacked-bar body configuration.
 * @returns The stacked-bar body, or `null` on failure.
 */
function StackedBarBody({
  segments,
  legend,
}: {
  segments: readonly StackedSegment[];
  legend: readonly StackedLegendRow[];
}): ReactNode {
  try {
    return (
      <div className={styles.breakdown}>
        <div className={styles.progressBar} aria-hidden="true">
          {segments?.map((segment) => {
            const segmentStyle: CSSProperties = {
              background: segment?.color,
              flex: `${segment?.flex ?? 1} 1 0`,
            };
            return (
              <span key={segment?.id} className={styles.segment} style={segmentStyle} />
            );
          })}
        </div>

        <div className={styles.legend}>
          {legend?.map((row) => (
            <div key={row?.id} className={styles.legendRow}>
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
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render a set of ranked rows, each a label + proportional bar + value. Bar
 * widths are sized against the largest row so the leader fills the track.
 *
 * @param props - The ranking-bars body configuration.
 * @returns The ranking-bars body, or `null` on failure.
 */
function RankingBarsBody({ rows }: { rows: readonly RankingRow[] }): ReactNode {
  try {
    const maxValue = rows?.reduce(
      (peak, row) => Math.max(peak, row?.value ?? 0),
      0,
    );
    const safeMax = maxValue > 0 ? maxValue : 1;
    return (
      <div className={styles.ranking}>
        {rows?.map((row) => {
          const widthPercent = Math.round(((row?.value ?? 0) / safeMax) * 100);
          return (
            <div key={row?.id} className={styles.rankingRow}>
              <span className={styles.rankingLabel}>{row?.label}</span>
              <span className={styles.rankingTrack} aria-hidden="true">
                <span
                  className={styles.rankingFill}
                  style={{ width: `${widthPercent}%`, background: row?.color }}
                />
              </span>
              <span className={styles.rankingValue}>{row?.display}</span>
            </div>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render a list of recurring patterns, each a coloured dot + label + meta count.
 *
 * @param props - The pattern-list body configuration.
 * @returns The pattern-list body, or `null` on failure.
 */
function PatternListBody({ items }: { items: readonly PatternRow[] }): ReactNode {
  try {
    return (
      <div className={styles.patterns}>
        {items?.map((item) => (
          <div key={item?.id} className={styles.patternRow}>
            <span
              className={styles.patternDot}
              style={{ background: item?.color }}
              aria-hidden="true"
            />
            <span className={styles.patternLabel}>{item?.label}</span>
            <span className={styles.patternMeta}>{item?.meta}</span>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render a stack of severity signal cards (status dot + title + detail).
 *
 * @param props - The signal-cards body configuration.
 * @returns The signal-cards body, or `null` on failure.
 */
function SignalCardsBody({ cards }: { cards: readonly SignalCard[] }): ReactNode {
  try {
    return (
      <div className={styles.signals}>
        {cards?.map((card) => (
          <div key={card?.id} className={styles.signalCard}>
            <span
              className={styles.signalDot}
              style={{ background: SEVERITY_COLOR[card?.severity] ?? COLOR_BLUE }}
              aria-hidden="true"
            />
            <span className={styles.signalText}>
              <span className={styles.signalTitle}>{card?.title}</span>
              <span className={styles.signalDetail}>{card?.detail}</span>
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the generated mini bar chart: proportional columns with month labels.
 *
 * @param props - The mini-bar-chart body configuration.
 * @returns The chart body, or `null` on failure.
 */
function MiniBarChartBody({ columns }: { columns: readonly ChartColumn[] }): ReactNode {
  try {
    const maxValue = columns?.reduce(
      (peak, column) => Math.max(peak, column?.value ?? 0),
      0,
    );
    const safeMax = maxValue > 0 ? maxValue : 1;
    return (
      <div className={styles.chart}>
        <div className={styles.chartCols}>
          {columns?.map((column) => {
            const heightPercent = Math.round(((column?.value ?? 0) / safeMax) * 100);
            const isPeak = (column?.value ?? 0) === maxValue;
            const barClass = isPeak
              ? `${styles.chartBar} ${styles.chartBarPeak}`
              : styles.chartBar;
            return (
              <span key={column?.id} className={styles.chartCol}>
                <span className={styles.chartBarTrack} aria-hidden="true">
                  <span
                    className={barClass}
                    style={{ height: `${heightPercent}%` }}
                  />
                </span>
                <span className={styles.chartColLabel}>{column?.label}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Dispatch to the correct answer-body renderer for a variant's body config.
 *
 * @param props - The resolved body configuration.
 * @returns The rendered body, or `null` when the type is unknown or on failure.
 */
function AnswerBody({ body }: { body: AskAiBody }): ReactNode {
  try {
    if (body?.type === "stacked-bar") {
      return <StackedBarBody segments={body.segments} legend={body.legend} />;
    }
    if (body?.type === "ranking-bars") {
      return <RankingBarsBody rows={body.rows} />;
    }
    if (body?.type === "pattern-list") {
      return <PatternListBody items={body.items} />;
    }
    if (body?.type === "signal-cards") {
      return <SignalCardsBody cards={body.cards} />;
    }
    if (body?.type === "mini-bar-chart") {
      return <MiniBarChartBody columns={body.columns} />;
    }
    return null;
  } catch {
    return null;
  }
}

/** Props for {@link AskAiArtifact}. */
export interface AskAiArtifactProps {
  /**
   * Render for the hero product window rather than the feature-section panel.
   * The feature panel is a narrow, left-anchored 631px visible frame (the chat
   * column hugs the left); the hero window is wider and fully visible, so `hero`
   * centers the chat column and widens it to fill. Defaults to false, leaving
   * the feature-section layout untouched.
   */
  hero?: boolean;
  /**
   * Which question/answer pair to render. Defaults to `"ask-ai"` — the original
   * "common client issues" breakdown — so existing usages are unchanged.
   */
  variant?: AskAiVariant;
}

/**
 * Render the "Ask AI" feature artifact as a chat conversation.
 *
 * @param props - Optional {@link AskAiArtifactProps}; `hero` centers and widens
 *   the chat column for the hero product window, `variant` selects which
 *   question/answer pair to show.
 * @returns The Ask AI window contents, or `null` on failure.
 */
export default function AskAiArtifact({
  hero = false,
  variant = DEFAULT_VARIANT,
}: AskAiArtifactProps = {}): ReactNode {
  try {
    const content = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
    const placeholder = content?.inputPlaceholder ?? DEFAULT_INPUT_PLACEHOLDER;
    const hasScope = Boolean(content?.scope);
    const hasCitations = (content?.citations?.length ?? 0) > 0;

    return (
      <div
        className={styles.root}
        data-artifact={variant}
        data-hero={hero ? "true" : undefined}
      >
        {hero ? (
          <BrowserChrome
            className={styles.heroChrome}
            address={HERO_CHROME_ADDRESS}
          />
        ) : null}
        <div className={styles.chat}>
          <div className={styles.thread}>
            <div className={styles.userRow}>
              <div className={styles.userBubble}>
                <p className={styles.userText}>{content?.prompt}</p>
              </div>
            </div>

            <div className={styles.assistantRow}>
              <span className={styles.assistantAvatar} aria-hidden="true">
                <AssistantAvatar size={34} />
              </span>

              <div className={styles.assistantBubble}>
                {hasScope ? (
                  <span className={styles.scopePill}>
                    <StrokeGlyph size={14} paths={GLOBE_PATHS} />
                    {content?.scope}
                  </span>
                ) : null}

                <p className={styles.heading}>
                  <span className={styles.headingLead}>{content?.headingLead}</span>
                  <span className={styles.headingRest}>{content?.headingRest}</span>
                </p>

                <AnswerBody body={content.body} />

                {hasCitations ? (
                  <div className={styles.citations}>
                    {content?.citations?.map((citation) => (
                      <span key={citation} className={styles.citationChip}>
                        <StrokeGlyph size={12} paths={LINK_PATHS} />
                        {citation}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.inputBar}>
            <p className={styles.inputText}>{placeholder}</p>
            <span className={styles.sendButton} aria-hidden="true">
              <StrokeGlyph size={18} paths={SEND_PATHS} />
            </span>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "Cited answers" variant — a copy-revision breakdown with citation chips that
 * name the comments, decisions and Memory sources behind the answer.
 *
 * @returns The cited-answer Ask AI artifact.
 */
export function AskAiCitedArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-cited" />;
}

/**
 * "Per-client answers" variant — a ranking of which clients draw the most
 * review rounds.
 *
 * @returns The per-client Ask AI artifact.
 */
export function AskAiPerClientArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-per-client" />;
}

/**
 * "Copy-versus-bug mix" variant — a two-segment split of writing vs build work
 * for a single client.
 *
 * @returns The copy-vs-bug Ask AI artifact.
 */
export function AskAiCopyVsBugArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-copy-vs-bug" />;
}

/**
 * "Cross-project patterns" variant — recurring issues that repeat across every
 * project, with per-pattern project counts.
 *
 * @returns The cross-project Ask AI artifact.
 */
export function AskAiCrossProjectArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-cross-project" />;
}

/**
 * "Review load by team" variant — a ranking of where review load piles up
 * across teams.
 *
 * @returns The load-by-team Ask AI artifact.
 */
export function AskAiLoadByTeamArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-load-by-team" />;
}

/**
 * "Delay and churn signals" variant — signal cards flagging accounts with
 * climbing rounds or stalled reviews.
 *
 * @returns The delay-churn Ask AI artifact.
 */
export function AskAiDelayChurnArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-delay-churn" />;
}

/**
 * "Ops signals" variant — a daily digest of signals that need attention across
 * every review.
 *
 * @returns The ops-signals Ask AI artifact.
 */
export function AskAiOpsSignalsArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-ops-signals" />;
}

/**
 * "Analytics on demand" variant — a breakdown generated on the fly from the
 * last six months of reviews, rendered as a small column chart.
 *
 * @returns The analytics Ask AI artifact.
 */
export function AskAiAnalyticsArtifact(): ReactNode {
  return <AskAiArtifact variant="ask-ai-analytics" />;
}
