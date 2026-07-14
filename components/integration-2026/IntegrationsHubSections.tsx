import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import KanbanArtifact from "@/components/home-2026/feature-artifacts/KanbanArtifact";
import BlueprintFrame from "@/components/home-2026/BlueprintFrame";
import TrustSection from "@/components/home-2026/TrustSection";
import styles from "./IntegrationsHubSections.module.css";

/**
 * Bespoke, hand-authored sections for the /preview/integrations hub. Content is
 * the system of record (superflow-page-integrations-list.md); every tool name
 * lives in the HTML as text (never only in a logo), so search and AI assistants
 * resolve "superflow {tool} integration" to this page.
 */

/* --------------------------------------------------------- shared consts */

/** Base path for integration detail pages (preview route). */
const BASE_PATH = "/preview/integrations";
/** Feature page for the push/deploy triggers and flow-fired notifications. */
const REVIEW_WORKFLOWS_HREF = "/preview/features/review-workflows";
/** Feature page for the built-in board the PM sync mirrors. */
const KANBAN_HREF = "/preview/features/kanban-board";
/** Primary "start" CTA target (matches SiteNav's Get Started anchor). */
const START_HREF = "#get-started";
/** Primary CTA label reused across the page. */
const START_LABEL = "Start free";

/* --------------------------------------------------------- Brand marks */

/** Static descriptor for a tool's brand mark. */
interface BrandInfo {
  name: string;
  /** Tile background color (ignored for marks that ship their own SVG). */
  color?: string;
  /** Monogram shown on the tile when no bespoke glyph is drawn. */
  initial?: string;
}

/** Brand metadata keyed by connector id. */
const BRANDS: Readonly<Record<string, BrandInfo>> = {
  slack: { name: "Slack" },
  monday: { name: "Monday" },
  asana: { name: "Asana", color: "#F06A6A" },
  clickup: { name: "ClickUp", color: "#7B68EE" },
  webflow: { name: "Webflow", color: "#146EF5", initial: "W" },
  wordpress: { name: "WordPress", color: "#1D6A98", initial: "W" },
  "google-tag-manager": { name: "Google Tag Manager", color: "#246FDB", initial: "G" },
  github: { name: "GitHub", color: "#181717", initial: "G" },
  vercel: { name: "Vercel", color: "#000000" },
  webhooks: { name: "Webhooks", color: "#6366F1" },
  "rest-api": { name: "REST API", color: "#0F172A", initial: "{ }" },
  email: { name: "Email", color: "#EA4A45" },
  whatsapp: { name: "WhatsApp", color: "#25D366" },
  framer: { name: "Framer", color: "#1E1E1F" },
  shopify: { name: "Shopify", color: "#95BF47" },
  trello: { name: "Trello", color: "#0079BF" },
  jira: { name: "Jira", color: "#2684FF" },
};

/** Public directory holding the downloaded full-color brand SVGs. */
const LOGO_DIR = "/images/logos";

/** Connector slugs that ship a real, downloaded brand SVG in {@link LOGO_DIR}. */
const LOGO_SLUGS = [
  "slack",
  "asana",
  "monday",
  "clickup",
  "whatsapp",
  "framer",
  "wordpress",
  "webflow",
  "shopify",
  "trello",
  "jira",
] as const;

/** Map of connector slug → its downloaded brand SVG path. */
const LOGO_SRC: Readonly<Record<string, string>> = Object.fromEntries(
  LOGO_SLUGS.map((slug) => [slug, `${LOGO_DIR}/${slug}.svg`]),
);

/**
 * Render a downloaded full-color brand SVG at a fixed square size. The asset is
 * served unoptimized (mirroring the repo's Okta mark) so the SVG stays crisp.
 *
 * @param props - The connector id and rendered square size (px).
 * @returns The logo image, or `null` when the id has no downloaded asset.
 */
function BrandImage({ id, size }: { id: string; size: number }): ReactNode {
  try {
    const source = LOGO_SRC[id];
    if (!source) {
      return null;
    }
    return (
      <Image
        src={source}
        alt={BRANDS[id]?.name ?? id}
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  } catch {
    return null;
  }
}

/** Rendering mode for {@link BrandMark}. */
type BrandMarkVariant = "tile" | "plain";

/** Props accepted by {@link BrandMark}. */
interface BrandMarkProps {
  id: string;
  size?: number;
  /** `tile` = brand-color square (matrix); `plain` = bare true-color logo. */
  variant?: BrandMarkVariant;
}

/** Official Tabler "webhook" glyph path data (Web Hooks connector). */
const WEBHOOK_GLYPH_PATHS = [
  "M4.876 13.61a4 4 0 1 0 6.124 3.39h6",
  "M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5",
  "M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5",
] as const;

/** Indigo stroke for the webhook glyph, consistent with the grid palette. */
const WEBHOOK_GLYPH_COLOR = "#4B57E6";

/** Hand-drawn glyph for the generic connectors that have no brand logo. */
function GenericGlyph({ id, size }: { id: string; size: number }): ReactNode {
  try {
    if (id === "webhooks") {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={WEBHOOK_GLYPH_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {WEBHOOK_GLYPH_PATHS.map((pathData) => (
            <path key={pathData} d={pathData} />
          ))}
        </svg>
      );
    }
    if (id === "rest-api") {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EE5D8A"
            d="M7 18a4 4 0 0 1-.53-7.97 5.5 5.5 0 0 1 10.65-1.2A3.75 3.75 0 0 1 17 18H7z"
          />
        </svg>
      );
    }
    if (id === "email") {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="#ffffff" stroke="#EA4A45" strokeWidth={1.8} />
          <path d="M4 8l8 5.5L20 8" fill="none" stroke="#EA4A45" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <span className={styles.brandPlainFallback}>
        {BRANDS[id]?.initial ?? BRANDS[id]?.name?.charAt(0) ?? "•"}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render a tool's bare mark on a transparent background (no tile). Branded tools
 * use their downloaded full-color SVG; the generic connectors (webhooks, REST
 * API, email) keep their hand-drawn glyphs. Used by the integrations grid, the
 * problem scene, and the how-it-works Connect artifact.
 *
 * @param props - The connector id and rendered square size (px).
 * @returns The bare mark, or `null` on failure.
 */
function BrandPlainMark({ id, size }: { id: string; size: number }): ReactNode {
  try {
    const dimension: CSSProperties = { width: size, height: size };
    const glyph: ReactNode = LOGO_SRC[id] ? (
      <BrandImage id={id} size={size} />
    ) : (
      <GenericGlyph id={id} size={size} />
    );

    return (
      <span className={styles.brandPlain} style={dimension} aria-hidden="true">
        {glyph}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render a tool's brand mark. The `tile` variant (capability matrix) centers the
 * mark on a clean white rounded tile, so every real full-color logo reads
 * correctly and the treatment is uniform. The `plain` variant (integrations
 * grid, problem scene, how-it-works) renders the bare mark on a transparent
 * background with no tile box.
 *
 * @param props - The connector id, rendered tile size (px) and variant.
 * @returns The brand mark, or `null` on failure.
 */
export function BrandMark({ id, size = 44, variant = "tile" }: BrandMarkProps): ReactNode {
  try {
    if (variant === "plain") {
      return <BrandPlainMark id={id} size={size} />;
    }

    const dimension: CSSProperties = { width: size, height: size };
    const markSize = Math.round(size * 0.6);

    return (
      <span className={styles.brandTile} style={dimension} aria-hidden="true">
        <BrandPlainMark id={id} size={markSize} />
      </span>
    );
  } catch {
    return null;
  }
}

/* --------------------------------------------------------- shared glyphs */

/** Right-pointing arrow used in cards and flow rows. */
function ArrowGlyph({ size = 18 }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Two-way swap arrows glyph (matrix "Two-way", how-it-works Connect). */
function SwapGlyph({ size = 22, stroke = "currentColor" }: { size?: number; stroke?: string }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v-3a3 3 0 0 1 3 -3h13" />
        <path d="M17 3l3 3l-3 3" />
        <path d="M20 12v3a3 3 0 0 1 -3 3h-13" />
        <path d="M7 21l-3 -3l3 -3" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Chat-bubble glyph (problem kicker). */
function ChatGlyph({ size = 22, stroke = "currentColor" }: { size?: number; stroke?: string }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Reddish 3x3 registration dot grid (problem kicker). */
function DotsGridGlyph({ size = 22 }: { size?: number }): ReactNode {
  try {
    const coords: readonly number[] = [4, 12, 20];
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#b0453c" aria-hidden="true">
        {coords.map((cy) =>
          coords.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.1} />),
        )}
      </svg>
    );
  } catch {
    return null;
  }
}

/** Dashed right-arrow connector (problem scene). */
function DashedArrowGlyph(): ReactNode {
  try {
    return (
      <svg width={74} height={16} viewBox="0 0 74 16" fill="none" aria-hidden="true">
        <line x1="0" y1="8" x2="58" y2="8" stroke="currentColor" strokeWidth={1.6} strokeDasharray="5 5" strokeLinecap="round" />
        <path d="M56 3l6 5-6 5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Tabler "repeat" glyph (how-it-works Connect artifact). */
function RepeatGlyph({ size = 30 }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
        <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Tabler "plug" glyph (how-it-works Map artifact). */
function PlugGlyph({ size = 20 }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

/** Chevron-down glyph (how-it-works Map artifact). */
function ChevronDownGlyph({ size = 20 }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6l6 -6" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Tabler "layout-grid" glyph (outline, how-it-works Work artifact). */
function LayoutGridGlyph({ size = 19 }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/* ============================================================ Problem */

const PROBLEM_HEADING = "Your reviews stall where nobody looks.";
const PROBLEM_SUBHEAD =
  "Slack gets the comment. The board gets the status. The task closes when the client approves. State flows both ways, so nothing gets pasted between tools by hand.";
const PROBLEM_SLACK_MESSAGE = "Sent you feedback on Email. Also change the CTA to green";
const PROBLEM_EMAIL_MESSAGE = "Here are the changes for the\u2026";

/**
 * Problem section — framed by the shared blueprint frame (crossing rule-lines +
 * registration bolts, the same component the homepage Solution section uses):
 * hand-passed Slack/Email messages on the left flow, via a dashed arrow, into
 * the real Superflow Kanban board on the right.
 *
 * @returns The problem section, or `null` on failure.
 */
export function IntegrationsProblem(): ReactNode {
  try {
    return (
      <section
        className={`${styles.section} ${styles.problemSection}`}
        data-section="int-problem"
      >
        <BlueprintFrame />
        <div className={`${styles.inner} ${styles.problemInner}`}>
          <div className={styles.problemHead}>
            <span className={styles.problemIconRow} aria-hidden="true">
              <span className={styles.problemDots}>
                <DotsGridGlyph size={22} />
              </span>
              <span className={styles.problemArrowGlyph}>
                <ArrowGlyph size={20} />
              </span>
              <span className={styles.problemChat}>
                <ChatGlyph size={22} stroke="currentColor" />
              </span>
            </span>
            <h2 className={styles.display}>{PROBLEM_HEADING}</h2>
            <p className={styles.problemSubhead}>{PROBLEM_SUBHEAD}</p>
          </div>

          <div className={styles.problemStage}>
            <div className={styles.problemMsgCol}>
              <div className={styles.msgRow}>
                <span className={styles.msgLogo}>
                  <BrandMark id="slack" variant="plain" size={30} />
                  <span className={styles.msgDot} aria-hidden="true" />
                </span>
                <p className={`${styles.msgBubble} ${styles.msgBubbleStrong}`}>
                  {PROBLEM_SLACK_MESSAGE}
                </p>
              </div>
              <div className={`${styles.msgRow} ${styles.msgRowEmail}`}>
                <p className={`${styles.msgBubble} ${styles.msgBubbleLight}`}>
                  {PROBLEM_EMAIL_MESSAGE}
                </p>
                <span className={styles.msgLogo}>
                  <BrandMark id="email" variant="plain" size={26} />
                  <span className={styles.msgDot} aria-hidden="true" />
                </span>
              </div>
            </div>

            <span className={styles.problemArrow} aria-hidden="true">
              <DashedArrowGlyph />
            </span>

            <div className={styles.problemBoard}>
              <div className={styles.problemBoardStage}>
                <KanbanArtifact />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ====================================================== Integrations grid */

const GRID_HEADING = "Works with your existing tools";
const GRID_NOTE_LINE_ONE = "12 integrations verified,";
const GRID_NOTE_LINE_TWO = "two-way where it counts";

/**
 * Rendered size (px) of a grid tool's brand mark. The grid uses the bare
 * `plain` variant (no tile box), so the logo sits a touch larger than the
 * 26px mark the old white tile wrapped.
 */
const GRID_TOOL_MARK_SIZE = 32;

/** Colored family-icon glyph names. */
type FamilyIconName = "code" | "send" | "bolt" | "list";

/** A single tool cell (brand logo + real text name) in the grid. */
interface GridTool {
  id: string;
  name: string;
  href?: string;
}

/** A family group: colored icon tile, name, and its tool cells. */
interface GridFamily {
  key: string;
  name: string;
  icon: FamilyIconName;
  iconBg: string;
  iconFg: string;
  cols: number;
  tools: readonly GridTool[];
}

const FAMILY_DEVELOPER: GridFamily = {
  key: "developer",
  name: "Developer",
  icon: "code",
  iconBg: "#7C5CFC",
  iconFg: "#ffffff",
  cols: 2,
  tools: [
    { id: "webhooks", name: "Web Hooks", href: `${BASE_PATH}/webhooks` },
    { id: "rest-api", name: "REST API", href: `${BASE_PATH}/rest-api` },
  ],
};

const FAMILY_DELIVERY: GridFamily = {
  key: "delivery",
  name: "Delivery",
  icon: "send",
  iconBg: "#17B26A",
  iconFg: "#ffffff",
  cols: 3,
  tools: [
    { id: "slack", name: "Slack", href: `${BASE_PATH}/slack` },
    { id: "email", name: "Email" },
    { id: "whatsapp", name: "WhatsApp" },
  ],
};

const FAMILY_INSTALLATION: GridFamily = {
  key: "installation",
  name: "Installation",
  icon: "bolt",
  iconBg: "#F97316",
  iconFg: "#ffffff",
  cols: 2,
  tools: [
    { id: "framer", name: "Framer" },
    { id: "wordpress", name: "WordPress", href: `${BASE_PATH}/wordpress` },
    { id: "webflow", name: "Webflow", href: `${BASE_PATH}/webflow` },
    { id: "shopify", name: "Shopify" },
  ],
};

const FAMILY_TASK: GridFamily = {
  key: "task-management",
  name: "Task Management",
  icon: "list",
  iconBg: "#F5C518",
  iconFg: "#1E1E1F",
  cols: 3,
  tools: [
    { id: "asana", name: "Asana", href: `${BASE_PATH}/asana` },
    { id: "trello", name: "Trello" },
    { id: "monday", name: "Monday.com", href: `${BASE_PATH}/monday` },
    { id: "clickup", name: "ClickUp", href: `${BASE_PATH}/clickup` },
    { id: "jira", name: "Jira" },
  ],
};

/** Left column families (Developer over Installation). */
const GRID_LEFT_COLUMN: readonly GridFamily[] = [FAMILY_DEVELOPER, FAMILY_INSTALLATION];
/** Right column families (Delivery over Task Management). */
const GRID_RIGHT_COLUMN: readonly GridFamily[] = [FAMILY_DELIVERY, FAMILY_TASK];

/**
 * Render a family's colored icon tile.
 *
 * @param props - The glyph name plus tile background and glyph colors.
 * @returns The icon tile, or `null` on failure.
 */
function FamilyIcon({
  icon,
  background,
  foreground,
}: {
  icon: FamilyIconName;
  background: string;
  foreground: string;
}): ReactNode {
  try {
    let glyph: ReactNode = null;
    if (icon === "code") {
      glyph = (
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={foreground} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 8l-3.5 4 3.5 4" />
          <path d="M15 8l3.5 4-3.5 4" />
        </svg>
      );
    } else if (icon === "send") {
      glyph = (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={foreground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 14l11 -11" />
          <path d="M21 3l-6.5 18a.55.55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55.55 0 0 1 0 -1z" />
        </svg>
      );
    } else if (icon === "bolt") {
      glyph = (
        <svg width={16} height={16} viewBox="0 0 24 24" fill={foreground} aria-hidden="true">
          <path d="M13 3v7h6l-8 11v-7H5l8-11z" />
        </svg>
      );
    } else {
      glyph = (
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6h11M9 12h11M9 18h11" stroke={foreground} strokeWidth={2} strokeLinecap="round" />
          <rect x="3.5" y="4.6" width="2.6" height="2.6" rx="0.6" fill={foreground} />
          <rect x="3.5" y="10.7" width="2.6" height="2.6" rx="0.6" fill={foreground} />
          <rect x="3.5" y="16.8" width="2.6" height="2.6" rx="0.6" fill={foreground} />
        </svg>
      );
    }
    return (
      <span className={styles.famIcon} style={{ background }}>
        {glyph}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * Render one tool cell — the brand logo beside its real-text name. Links to the
 * connector's detail page when a href is supplied, otherwise renders a span.
 *
 * @param props - The tool to render.
 * @returns The tool cell, or `null` on failure.
 */
function ToolCell({ tool }: { tool: GridTool }): ReactNode {
  try {
    const content = (
      <>
        <BrandMark id={tool.id} variant="plain" size={GRID_TOOL_MARK_SIZE} />
        <span className={styles.toolName}>{tool.name}</span>
      </>
    );
    if (tool.href) {
      return (
        <a className={styles.toolCell} href={tool.href}>
          {content}
        </a>
      );
    }
    return <span className={styles.toolCell}>{content}</span>;
  } catch {
    return null;
  }
}

/**
 * Render a family group (icon + name header over its tool-cell grid). Trailing
 * empty cells pad the last row so the interior grid lines stay even.
 *
 * @param props - The family to render.
 * @returns The family block, or `null` on failure.
 */
function GridFamilyBlock({ family }: { family: GridFamily }): ReactNode {
  try {
    const rowCount = Math.ceil(family.tools.length / family.cols);
    const emptyCount = rowCount * family.cols - family.tools.length;
    const emptyCells = Array.from({ length: emptyCount }, (_unused, index) => index);
    return (
      <div className={styles.famGroup}>
        <div className={styles.famHeader}>
          <FamilyIcon icon={family.icon} background={family.iconBg} foreground={family.iconFg} />
          <span className={styles.famName}>{family.name}</span>
        </div>
        <div
          className={styles.famTools}
          style={{ gridTemplateColumns: `repeat(${family.cols}, 1fr)` }}
        >
          {family.tools.map((tool) => (
            <ToolCell key={tool.id} tool={tool} />
          ))}
          {emptyCells.map((cellIndex) => (
            <span key={`empty-${cellIndex}`} className={styles.toolCellEmpty} aria-hidden="true" />
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * "Works with your existing tools" grid — two columns of family groups, every
 * tool named in text beside its logo so the page indexes each connector.
 *
 * @returns The integrations grid section, or `null` on failure.
 */
export function IntegrationsGrid(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="int-grid">
        <div className={styles.inner}>
          <div className={styles.gridCard}>
            <div className={styles.gridHeader}>
              <h2 className={styles.gridHeading}>{GRID_HEADING}</h2>
              <p className={styles.gridNote}>
                {GRID_NOTE_LINE_ONE}
                <br />
                {GRID_NOTE_LINE_TWO}
              </p>
            </div>

            <div className={styles.gridBody}>
              <div className={styles.gridColumn}>
                {GRID_LEFT_COLUMN.map((family) => (
                  <GridFamilyBlock key={family.key} family={family} />
                ))}
              </div>
              <div className={styles.gridColumn}>
                {GRID_RIGHT_COLUMN.map((family) => (
                  <GridFamilyBlock key={family.key} family={family} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ========================================================= How it works */

const HOW_LEDE = "Connect once. The review travels.";
const HOW_CTA_TEXT = "Connect Slack before your next review.";
const HOW_CTA_MICRO = "no credit card.";
const HOW_MAP_PILL_LABEL = "Choose Board / Channel";
const HOW_WORK_CHIP_LABEL = "Project Completed";
const HOW_WORK_APPROVE_LABEL = "Approve";

/**
 * How-it-works section — three numbered steps (Connect, Map, Work) whose bottom
 * mini-artifacts mirror Figma node 958:2802, plus a "connect Slack" CTA banner.
 *
 * @returns The how-it-works section, or `null` on failure.
 */
export function IntegrationsHowItWorks(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="int-howitworks">
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{HOW_LEDE}</h2>
          </div>

          <div className={styles.howGrid}>
            <article className={styles.howCard}>
              <span className={styles.howNum}>01</span>
              <h3 className={styles.howTitle}>Connect</h3>
              <p className={styles.howDesc}>
                Pick the tool in settings and authorize. No code, no developer.
              </p>
              <div className={styles.howArt} aria-hidden="true">
                <span className={styles.howPanel} />
                <span className={styles.howFade} />
                <span className={styles.howConnectRow}>
                  <span className={styles.howBubble} />
                  <span className={styles.howRepeat}>
                    <RepeatGlyph size={32} />
                  </span>
                  <span className={styles.howMonday}>
                    <BrandMark id="monday" variant="plain" size={46} />
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.howCard}>
              <span className={styles.howNum}>02</span>
              <h3 className={styles.howTitle}>Map</h3>
              <p className={styles.howDesc}>
                Choose the channel or board, and match your statuses to ours.
              </p>
              <div className={styles.howArt} aria-hidden="true">
                <span className={styles.howMapPanel} />
                <span className={styles.howMapPill}>
                  <span className={styles.howMapPlug}>
                    <PlugGlyph size={24} />
                  </span>
                  <span className={styles.howMapText}>{HOW_MAP_PILL_LABEL}</span>
                  <span className={styles.howMapChevron}>
                    <ChevronDownGlyph size={24} />
                  </span>
                </span>
              </div>
            </article>

            <article className={styles.howCard}>
              <span className={styles.howNum}>03</span>
              <h3 className={styles.howTitle}>Work</h3>
              <p className={styles.howDesc}>
                Comments, statuses, and sign-offs flow both ways while you stay in your tools.
              </p>
              <div className={styles.howArt} aria-hidden="true">
                <span className={styles.howWorkPanelBack} />
                <span className={styles.howWorkPanelFront} />
                <span className={styles.howWorkChip}>
                  <span className={styles.howWorkGrid}>
                    <LayoutGridGlyph size={19} />
                  </span>
                  {HOW_WORK_CHIP_LABEL}
                </span>
                <span className={styles.howApprove}>{HOW_WORK_APPROVE_LABEL}</span>
                <span className={styles.howFade} />
              </div>
            </article>
          </div>

          <div className={styles.ctaBanner}>
            <p className={styles.ctaBannerText}>{HOW_CTA_TEXT}</p>
            <div className={styles.ctaBannerActions}>
              <span className={styles.ctaMicro}>{HOW_CTA_MICRO}</span>
              <a className={styles.btnPrimary} href={START_HREF}>{START_LABEL}</a>
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ============================================================= Matrix */

const MATRIX_HEADING = "What works with each tool today.";
const MATRIX_COLUMNS: readonly string[] = [
  "Tool",
  "Updates in",
  "Act from the tool",
  "Sign-off",
  "Statuses",
  "Replies",
  "Comments create tasks",
];
const TWO_WAY = "__two_way__";
const NOT_APPLICABLE = "n/a";

/** A capability-matrix row: connector id/name + one value per column. */
interface MatrixRow {
  id: string;
  cells: readonly string[];
}

const MATRIX_ROWS: readonly MatrixRow[] = [
  {
    id: "slack",
    cells: ["Yes, the moment a client comments", "Yes, from the message", "Posts to your channel", NOT_APPLICABLE, "Yes, in threads", NOT_APPLICABLE],
  },
  {
    id: "asana",
    cells: ["Yes", "Yes, from the board", "Closes the task", TWO_WAY, "Yes", "Optional"],
  },
  {
    id: "monday",
    cells: ["Yes", "Yes, from the board", "Closes the item", TWO_WAY, "Yes", "Optional"],
  },
  {
    id: "clickup",
    cells: ["Yes", "Yes, from the board", "Closes the task", TWO_WAY, "Yes", "Optional"],
  },
];

/**
 * Render a single matrix cell value, styling the two-way and n/a sentinels.
 *
 * @param props - The raw cell value.
 * @returns The formatted cell content.
 */
function MatrixCell({ value }: { value: string }): ReactNode {
  try {
    if (value === TWO_WAY) {
      return (
        <span className={styles.matrixTwoWay}>
          <SwapGlyph size={18} />
          Two-way
        </span>
      );
    }
    if (value === NOT_APPLICABLE) {
      return <span className={styles.matrixNa}>n/a</span>;
    }
    return <span>{value}</span>;
  } catch {
    return null;
  }
}

/**
 * Capability matrix — what each shipped connector does today. Registry-fed in
 * production; hand-authored here from the system-of-record table.
 *
 * @returns The matrix section, or `null` on failure.
 */
export function IntegrationsMatrix(): ReactNode {
  try {
    return (
      <section className={`${styles.section} ${styles.sectionSoft}`} data-section="int-matrix">
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{MATRIX_HEADING}</h2>
          </div>

          <div className={styles.matrixScroll}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  {MATRIX_COLUMNS.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className={styles.matrixTool}>
                        <BrandMark id={row.id} size={40} />
                        {BRANDS[row.id]?.name}
                      </span>
                    </td>
                    {row.cells.map((cell, index) => (
                      <td key={MATRIX_COLUMNS[index + 1]}>
                        <MatrixCell value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.matrixCaption}>
            Every cell is registry-fed and states today&apos;s truth. GitHub and Vercel are
            triggers (see <a href={REVIEW_WORKFLOWS_HREF}>review workflows</a>); installs live
            in the integrations grid above; webhooks and the REST API cover anything the matrix
            doesn&apos;t. A new connector adds a row the day it ships.
          </p>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ============================================================ Related */

/** Serif display heading, split so "the rest of Superflow." sits on its own line. */
const RELATED_HEADING_LINE_ONE = "Where integrations meet";
const RELATED_HEADING_LINE_TWO = "the rest of Superflow.";
/** Subhead below the heading (formerly the bottom boundary line). */
const RELATED_SUBHEAD = "Kanban covers our board. Integrations cover yours.";

const RELATED_REVIEW_TITLE = "Review Workflow";
const RELATED_REVIEW_DESC =
  "The push and deploy triggers, and where Slack notifications fire from a flow.";
const RELATED_KANBAN_TITLE = "Kanban Board";
const RELATED_KANBAN_DESC = "The built-in board the PM sync mirrors.";

/**
 * Icon accent colors — exact strokes from Figma node 972:6971
 * (`tabler-icon-schema` purple, `tabler-icon-layout-kanban` orange).
 */
const RELATED_REVIEW_ICON_COLOR = "#c760e1";
const RELATED_KANBAN_ICON_COLOR = "#e16e34";

/** Icon box size (px) — matches the 32px Tabler glyphs in Figma node 972:6971. */
const RELATED_ICON_SIZE = 32;

/** Tabler glyph key for a related card. */
type RelatedIconName = "schema" | "kanban";

/** One related-capability card: accent glyph, title, copy, and destination. */
interface RelatedCard {
  title: string;
  description: string;
  href: string;
  icon: RelatedIconName;
  iconColor: string;
}

const RELATED_CARDS: readonly RelatedCard[] = [
  {
    title: RELATED_REVIEW_TITLE,
    description: RELATED_REVIEW_DESC,
    href: REVIEW_WORKFLOWS_HREF,
    icon: "schema",
    iconColor: RELATED_REVIEW_ICON_COLOR,
  },
  {
    title: RELATED_KANBAN_TITLE,
    description: RELATED_KANBAN_DESC,
    href: KANBAN_HREF,
    icon: "kanban",
    iconColor: RELATED_KANBAN_ICON_COLOR,
  },
];

/** Tabler "schema" glyph (related: Review Workflow). Matches Figma node 972:6992. */
function SchemaGlyph({ size = RELATED_ICON_SIZE }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 2h5v4h-5l0 -4" />
        <path d="M15 10h5v4h-5l0 -4" />
        <path d="M5 18h5v4h-5l0 -4" />
        <path d="M5 10h5v4h-5l0 -4" />
        <path d="M10 12h5" />
        <path d="M7.5 6v4" />
        <path d="M7.5 14v4" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Tabler "layout-kanban" glyph (related: Kanban Board). Matches Figma node 972:6979. */
function LayoutKanbanGlyph({ size = RELATED_ICON_SIZE }: { size?: number }): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l6 0" />
        <path d="M14 4l6 0" />
        <path d="M4 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -8" />
        <path d="M14 10a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render a related card's accent glyph.
 *
 * @param props - The Tabler glyph key to draw.
 * @returns The glyph, or `null` on failure.
 */
function RelatedIcon({ icon }: { icon: RelatedIconName }): ReactNode {
  try {
    if (icon === "schema") {
      return <SchemaGlyph size={RELATED_ICON_SIZE} />;
    }
    return <LayoutKanbanGlyph size={RELATED_ICON_SIZE} />;
  } catch {
    return null;
  }
}

/**
 * Related capabilities — a centered two-line serif heading with a muted subhead,
 * over a 2-up grid of bordered cards (accent Tabler glyph, bold title, muted
 * copy) linking to the Review Workflows and Kanban Board pages.
 *
 * @returns The related section, or `null` on failure.
 */
export function IntegrationsRelated(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="int-related">
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>
              {RELATED_HEADING_LINE_ONE}
              <br />
              {RELATED_HEADING_LINE_TWO}
            </h2>
            <p className={styles.lede}>{RELATED_SUBHEAD}</p>
          </div>

          <div className={styles.relatedGrid}>
            {RELATED_CARDS.map((card) => (
              <a key={card.title} className={styles.relatedCard} href={card.href}>
                <span
                  className={styles.relatedIcon}
                  style={{ color: card.iconColor }}
                  aria-hidden="true"
                >
                  <RelatedIcon icon={card.icon} />
                </span>
                <span className={styles.relatedName}>{card.title}</span>
                <p className={styles.relatedDesc}>{card.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

/* ===================================================== Capability cards */

/**
 * Trust / assurance section — reuses the homepage's real {@link TrustSection}
 * ("AI-first, with a human on every decision." over the four pillars: human in
 * the loop, white-label, compliance, access) rather than a rebuilt card grid,
 * so the copy, icons and CTAs stay in lockstep with the homepage.
 *
 * @returns The trust section, or `null` on failure.
 */
export function IntegrationsTrustStrip(): ReactNode {
  try {
    return <TrustSection />;
  } catch {
    return null;
  }
}
