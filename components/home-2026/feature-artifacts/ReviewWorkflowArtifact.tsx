"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./ReviewWorkflowArtifact.module.css";
import FakeCursor from "./FakeCursor";

/**
 * Feature/hero artifact — "Review Workflows".
 *
 * The review-workflows story is: arrange your reviewers and AI agents in one
 * visual flow — it starts the moment the site changes, conditions move work
 * forward, and the client gate comes last. One variant-driven component covers
 * every beat over a shared flow-builder canvas (a dot-grid surface carrying a
 * left→right rail of stage nodes joined by connectors):
 *
 *  - `sample-flow`   — the full flow (the star): a push trigger → an AI agent
 *                      pass → a condition → a human review → the client gate.
 *  - `push-trigger`  — a deploy event lands and starts the flow on its own.
 *  - `build-step`    — the visual builder: a palette of step types and a cursor
 *                      dragging a reviewer step into a dashed slot in the canvas.
 *  - `condition`     — a transition's rule editor: "move forward when …".
 *  - `parallel`      — two review lanes run at once; the flow waits for both.
 *  - `escalation`    — a step that sits too long escalates to a senior reviewer.
 *  - `client-gate`   — the last node: the client approves from a no-account link.
 *  - `notifications` — Slack + email fire as a node clears.
 *  - `one-flow`      — one flow applied across every project.
 *
 * All motion is CSS-only, replays whenever the tab remounts, and is gated behind
 * `prefers-reduced-motion` (which holds the settled composition — used for the
 * screenshots). The feature panel is a fixed 1204px window that clips off the
 * right edge, so scenes left-anchor; the hero window is fully visible, so the
 * `hero` prop re-centres and trims each scene.
 */

/** Which review-workflow scene {@link ReviewWorkflowArtifact} renders. */
export type ReviewWorkflowVariant =
  | "sample-flow"
  | "push-trigger"
  | "build-step"
  | "condition"
  | "parallel"
  | "escalation"
  | "client-gate"
  | "notifications"
  | "one-flow";

/* ------------------------------------------------------------- copy strings */

const FLOW_TITLE = "New Website Review";
const FLOW_META_AUTHOR = "Deploy";
const FLOW_META_WHEN = "2m";
const RUNNING_LABEL = "Running";
const SITE_NAME = "acme-client.com";

const TRIGGER_TITLE = "Site changed";
const TRIGGER_SUB = "Deploy pushed";
const AGENTS_TITLE = "AI Agents";
const AGENTS_SUB = "First pass";
const CONDITION_TITLE = "Zero criticals?";
const CONDITION_SUB = "Move forward when";
const REVIEW_TITLE = "Team review";
const REVIEW_SUB = "People own the call";
const GATE_TITLE = "Client gate";
const GATE_SUB = "Approves via link";

const AGENT_CHECKS: readonly string[] = ["Performance", "Grammar", "SEO Basics"];

/* Condition rule editor. */
const CONDITION_HEADING = "Move forward when";
const CONDITION_RULES: readonly { label: string; on: boolean }[] = [
  { label: "0 Critical issues", on: true },
  { label: "All findings resolved", on: true },
  { label: "Owner approved", on: false },
];

/* Build-step palette. */
const PALETTE_HEADING = "Steps";
const PALETTE_ITEMS: readonly { id: string; label: string; glyph: GlyphName }[] = [
  { id: "agent", label: "AI Agent", glyph: "robot" },
  { id: "reviewer", label: "Reviewer", glyph: "users" },
  { id: "condition", label: "Condition", glyph: "circleCheck" },
  { id: "notify", label: "Notify", glyph: "send" },
  { id: "gate", label: "Client gate", glyph: "userCheck" },
];
const DROP_LABEL = "Reviewer";
const DROP_HINT = "Drop step here";

/* Parallel steps. */
const PARALLEL_LABEL = "In parallel \u00b7 waits for both";

/* Escalation. */
const ESCALATION_WAIT = "Waiting 2 days";
const ESCALATION_RULE = "No reply in 2 days";
const ESCALATION_TITLE = "Escalate";
const ESCALATION_SENIOR = "Senior reviewer";
const ESCALATION_SUB = "Auto-reassigned";

/* Notifications. */
const NOTIFY_CLEARED = "Copy review cleared";
const NOTIFY_SLACK_CHANNEL = "#client-acme";
const NOTIFY_SLACK_TEXT = "Copy review cleared \u2014 next: client gate";
const NOTIFY_EMAIL_TO = "Flow complete \u2192 owner";
const NOTIFY_EMAIL_TEXT = "acme-client.com is client-approved";

/* Client gate. */
const GATE_NO_ACCOUNT = "No account";
const GATE_APPROVE_FROM = "Approve";
const GATE_APPROVED = "Approved";
const GATE_APPROVER = "Dana Wells \u00b7 2:14pm";

/* One flow, every project. */
const ONE_FLOW_HEADING = "One flow \u00b7 every project";
const ONE_FLOW_PROJECTS: readonly { id: string; name: string; tone: string; at: number }[] = [
  { id: "acme", name: "Acme", tone: "#625df5", at: 4 },
  { id: "northwind", name: "Northwind", tone: "#12b5a6", at: 3 },
  { id: "volt", name: "Volt", tone: "#e0820a", at: 2 },
];
const ONE_FLOW_STAGE_LABELS: readonly string[] = [
  "Push",
  "Agents",
  "Review",
  "Gate",
];

/* ------------------------------------------------------------------- glyphs */

/** Known inline glyph names used across the flow nodes. */
type GlyphName =
  | "bolt"
  | "gitBranch"
  | "robot"
  | "circleCheck"
  | "users"
  | "userCheck"
  | "clock"
  | "arrowUp"
  | "send"
  | "plus"
  | "mail"
  | "check"
  | "chevronRight";

/** Tabler-derived stroke path sets, keyed by glyph name. */
const GLYPH_PATHS: Readonly<Record<GlyphName, readonly string[]>> = {
  bolt: ["M13 3v7h6l-8 11v-7h-6z"],
  gitBranch: [
    "M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
    "M7 8v8",
    "M9 18h6a2 2 0 0 0 2 -2v-5",
    "M14 14l3 -3l3 3",
  ],
  robot: [
    "M6 8h12a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2z",
    "M12 4v4",
    "M9 13v1",
    "M15 13v1",
    "M10 17h4",
  ],
  circleCheck: [
    "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M9 12l2 2l4 -4",
  ],
  users: [
    "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
    "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2",
    "M16 3.13a4 4 0 0 1 0 7.75",
    "M21 21v-2a4 4 0 0 0 -3 -3.85",
  ],
  userCheck: [
    "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0",
    "M6 21v-2a4 4 0 0 1 4 -4h3.5",
    "M15 19l2 2l4 -4",
  ],
  clock: [
    "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M12 7v5l3 3",
  ],
  arrowUp: ["M12 5v14", "M16 9l-4 -4l-4 4"],
  send: [
    "M10 14l11 -11",
    "M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1z",
  ],
  plus: ["M12 5v14", "M5 12h14"],
  mail: [
    "M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z",
    "M3 7l9 6l9 -6",
  ],
  check: ["M5 12l5 5l9 -9"],
  chevronRight: ["M9 6l6 6l-6 6"],
};

/** Shared props for the inline stroke icons. */
interface GlyphProps {
  /** Which glyph to draw. */
  name: GlyphName;
  /** Rendered width/height in pixels (defaults to 20). */
  size?: number;
  /** Whether the glyph is filled (bolt) rather than stroked. */
  filled?: boolean;
  className?: string;
}

/**
 * Draw one Tabler-style glyph in `currentColor` on the 24-unit grid.
 *
 * @param root0 - Which glyph + sizing/fill/class props.
 * @returns The configured `<svg>` element, or `null` on failure.
 */
function Glyph({ name, size = 20, filled = false, className }: GlyphProps): ReactNode {
  try {
    const paths = GLYPH_PATHS[name] ?? [];
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The multi-colour Slack logo used by the notification card.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The Slack `<svg>` element, or `null` on failure.
 */
function SlackGlyph({ size = 18 }: { size?: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 122.8 122.8"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a" />
        <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0" />
        <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d" />
        <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e" />
      </svg>
    );
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------- node parts */

/** Visual tone applied to a stage node's icon tile + active ring. */
type NodeTone = "amber" | "indigo" | "green" | "blue" | "teal" | "coral";

/** CSS custom property carrying a per-item entrance-stagger delay (ms). */
const DELAY_VAR = "--wf-delay";

/**
 * Build the inline style that staggers one element's entrance.
 *
 * @param delayMs - Milliseconds to wait before this item animates in.
 * @returns The inline style setting the stagger custom property.
 */
function delayStyle(delayMs: number): CSSProperties {
  try {
    return { [DELAY_VAR]: `${delayMs}ms` } as CSSProperties;
  } catch {
    return {};
  }
}

/** Props for {@link StageNode}. */
interface StageNodeProps {
  /** Colour tone for the icon tile + active ring. */
  tone: NodeTone;
  /** Leading glyph drawn in the icon tile. */
  glyph: GlyphName;
  /** Whether the glyph is filled (bolt). */
  glyphFilled?: boolean;
  /** Node title (bold). */
  title: string;
  /** Node subtitle (muted). */
  subtitle?: string;
  /** Marks the node as lit/active (accent ring + tint). */
  active?: boolean;
  /** Entrance-stagger delay in ms. */
  delayMs?: number;
  /** Optional extra class for per-scene positioning/sizing. */
  className?: string;
  /** Optional inner content (agent checks, etc.) below the header. */
  children?: ReactNode;
}

/**
 * A single flow stage node: an icon tile beside a title + subtitle, over an
 * optional body (agent checks, avatars). Purely presentational.
 *
 * @param props - The node config.
 * @returns The node element, or `null` on failure.
 */
function StageNode({
  tone,
  glyph,
  glyphFilled,
  title,
  subtitle,
  active,
  delayMs = 0,
  className,
  children,
}: StageNodeProps): ReactNode {
  try {
    const nodeClass = className ? `${styles.node} ${className}` : styles.node;
    return (
      <div
        className={nodeClass}
        data-tone={tone}
        data-active={active || undefined}
        style={delayStyle(delayMs)}
      >
        <div className={styles.nodeHead}>
          <span className={styles.nodeTile} data-tone={tone} aria-hidden="true">
            <Glyph name={glyph} size={20} filled={glyphFilled} />
          </span>
          <span className={styles.nodeText}>
            <span className={styles.nodeTitle}>{title}</span>
            {subtitle ? <span className={styles.nodeSub}>{subtitle}</span> : null}
          </span>
        </div>
        {children}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A horizontal (or vertical) connector between two nodes: a dashed rail with an
 * arrowhead and an optional travelling "run" pulse dot.
 *
 * @param root0 - The connector props.
 * @param root0.vertical - Draw top→bottom instead of left→right.
 * @param root0.pulse - Whether a run pulse travels along the rail.
 * @param root0.delayMs - Entrance-stagger delay in ms.
 * @param root0.className - Optional extra positioning class.
 * @returns The connector element, or `null` on failure.
 */
function Connector({
  vertical = false,
  pulse = false,
  delayMs = 0,
  className,
  children,
}: {
  vertical?: boolean;
  pulse?: boolean;
  delayMs?: number;
  className?: string;
  /** Optional small label rendered above the rail (e.g. a condition note). */
  children?: ReactNode;
}): ReactNode {
  try {
    const base = vertical ? styles.connVertical : styles.connHorizontal;
    const connClass = className ? `${styles.conn} ${base} ${className}` : `${styles.conn} ${base}`;
    return (
      <span className={connClass} style={delayStyle(delayMs)} aria-hidden="true">
        {children}
        <span className={styles.connLine} />
        <span className={styles.connArrow}>
          <Glyph name="chevronRight" size={14} />
        </span>
        {pulse ? <span className={styles.connPulse} /> : null}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * The flow-builder canvas header: the flow name + trigger meta and a green
 * "Running" pill. Shared by the canvas scenes for a consistent product read.
 *
 * @param root0 - The header props.
 * @param root0.running - Whether the "Running" status pill is shown.
 * @returns The header element, or `null` on failure.
 */
function FlowHeader({ running = true }: { running?: boolean }): ReactNode {
  try {
    return (
      <header className={styles.header}>
        <div className={styles.headTitleWrap}>
          <span className={styles.headMark} aria-hidden="true">
            <Glyph name="gitBranch" size={16} />
          </span>
          <div>
            <h3 className={styles.headTitle}>{FLOW_TITLE}</h3>
            <p className={styles.headMeta}>
              <span className={styles.headMetaStrong}>{FLOW_META_AUTHOR}</span>
              {" triggered "}
              <span className={styles.headMetaStrong}>{FLOW_META_WHEN}</span>
              {" ago"}
            </p>
          </div>
        </div>
        {running ? (
          <span className={styles.runPill}>
            <span className={styles.runDot} aria-hidden="true" />
            {RUNNING_LABEL}
          </span>
        ) : null}
      </header>
    );
  } catch {
    return null;
  }
}

/**
 * The AI-agents node body: a compact list of the checks the agent pass runs,
 * each with a green tick (the first pass already cleared).
 *
 * @returns The agent-check rows, or `null` on failure.
 */
function AgentChecks(): ReactNode {
  try {
    return (
      <div className={styles.agentChecks}>
        {AGENT_CHECKS.map((label) => (
          <span key={label} className={styles.agentCheck}>
            <span className={styles.agentTick} aria-hidden="true">
              <Glyph name="check" size={11} />
            </span>
            {label}
          </span>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A small overlapping avatar stack for the human-review nodes.
 *
 * @param root0 - The avatar props.
 * @param root0.initials - The initials to render, front-to-back.
 * @returns The avatar stack, or `null` on failure.
 */
function AvatarStack({ initials }: { initials: readonly string[] }): ReactNode {
  try {
    return (
      <span className={styles.avatars} aria-hidden="true">
        {initials.map((value, index) => (
          <span key={`${value}-${index}`} className={styles.avatar}>
            {value}
          </span>
        ))}
      </span>
    );
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------- rail primitives */

/** Which node the sample rail lights as "active" (the run is here). */
const RAIL_ACTIVE_INDEX = 2;

/**
 * The full sample flow rail: trigger → agents → condition → review → gate,
 * joined by dashed connectors with a travelling run pulse. Shared base for the
 * `sample-flow` and `push-trigger` scenes.
 *
 * @param root0 - The rail props.
 * @param root0.pulse - Whether the connectors carry a run pulse.
 * @returns The rail element, or `null` on failure.
 */
function SampleRail({ pulse = true }: { pulse?: boolean }): ReactNode {
  try {
    return (
      <div className={styles.rail}>
        <StageNode
          tone="amber"
          glyph="bolt"
          glyphFilled
          title={TRIGGER_TITLE}
          subtitle={TRIGGER_SUB}
          active
          delayMs={120}
        />
        <Connector pulse={pulse} delayMs={220} />
        <StageNode
          tone="indigo"
          glyph="robot"
          title={AGENTS_TITLE}
          subtitle={AGENTS_SUB}
          active
          delayMs={320}
          className={styles.nodeAgents}
        >
          <AgentChecks />
        </StageNode>
        <Connector pulse={pulse} delayMs={420} />
        <StageNode
          tone="green"
          glyph="circleCheck"
          title={CONDITION_TITLE}
          subtitle={CONDITION_SUB}
          active={RAIL_ACTIVE_INDEX >= 2}
          delayMs={520}
        />
        <Connector pulse={pulse} delayMs={620} />
        <StageNode
          tone="blue"
          glyph="users"
          title={REVIEW_TITLE}
          subtitle={REVIEW_SUB}
          delayMs={720}
        >
          <AvatarStack initials={["DW", "EM"]} />
        </StageNode>
        <Connector delayMs={820} />
        <StageNode
          tone="teal"
          glyph="userCheck"
          title={GATE_TITLE}
          subtitle={GATE_SUB}
          delayMs={920}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ scenes */

/**
 * `sample-flow` — the full flow, the page star: humans and agents in one path
 * from the push trigger to the client gate.
 *
 * @returns The sample-flow scene, or `null` on failure.
 */
function SampleFlowScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <SampleRail />
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `push-trigger` — a deploy event lands on the trigger and starts the flow on
 * its own; the incoming push chip drops in and the run pulse fires.
 *
 * @returns The push-trigger scene, or `null` on failure.
 */
function PushTriggerScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.pushEvent} aria-hidden="true">
          <span className={styles.pushIcon}>
            <Glyph name="gitBranch" size={16} />
          </span>
          <span className={styles.pushText}>
            <span className={styles.pushStrong}>New deploy</span>
            {" \u00b7 "}
            {SITE_NAME}
          </span>
          <span className={styles.pushArrow} aria-hidden="true" />
        </div>
        <SampleRail />
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `build-step` — the visual builder: a palette of step types on the left and a
 * canvas where a cursor drags a "Reviewer" step into a dashed slot in the flow.
 *
 * @returns The build-step scene, or `null` on failure.
 */
function BuildStepScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader running={false} />
        <div className={styles.builder}>
          <aside className={styles.palette}>
            <span className={styles.paletteHeading}>{PALETTE_HEADING}</span>
            {PALETTE_ITEMS.map((item) => (
              <span
                key={item.id}
                className={styles.paletteItem}
                data-drag={item.id === "reviewer" || undefined}
              >
                <span className={styles.paletteGlyph} aria-hidden="true">
                  <Glyph name={item.glyph} size={16} />
                </span>
                {item.label}
              </span>
            ))}
          </aside>

          <div className={styles.builderCanvas}>
            <div className={styles.rail}>
              <StageNode
                tone="indigo"
                glyph="robot"
                title={AGENTS_TITLE}
                subtitle={AGENTS_SUB}
                delayMs={280}
                className={styles.nodeSmall}
              />
              <Connector delayMs={360} />
              {/* The dashed drop slot the dragged reviewer step lands in. */}
              <span className={styles.dropSlot} style={delayStyle(440)}>
                <span className={styles.dropGhost} aria-hidden="true">
                  {DROP_HINT}
                </span>
                <span className={styles.dropStep} aria-hidden="true">
                  <span className={styles.dropStepTile}>
                    <Glyph name="users" size={16} />
                  </span>
                  {DROP_LABEL}
                </span>
                <FakeCursor className={styles.dropCursor} size={24} />
              </span>
              <Connector delayMs={520} />
              <StageNode
                tone="teal"
                glyph="userCheck"
                title={GATE_TITLE}
                subtitle={GATE_SUB}
                delayMs={600}
                className={styles.nodeSmall}
              />
            </div>
          </div>
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `condition` — a transition's rule editor: work moves forward only when the
 * listed criteria are met (0 criticals, all findings resolved, approved).
 *
 * @returns The condition scene, or `null` on failure.
 */
function ConditionScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.conditionScene}>
          <div className={styles.rail}>
            <StageNode
              tone="indigo"
              glyph="robot"
              title={AGENTS_TITLE}
              subtitle={AGENTS_SUB}
              delayMs={120}
              className={styles.nodeSmall}
            />
            <Connector delayMs={200} />
            <StageNode
              tone="green"
              glyph="circleCheck"
              title={CONDITION_TITLE}
              subtitle={CONDITION_SUB}
              active
              delayMs={280}
              className={styles.nodeCondition}
            />
            <Connector delayMs={360} />
            <StageNode
              tone="blue"
              glyph="users"
              title={REVIEW_TITLE}
              subtitle={REVIEW_SUB}
              delayMs={440}
              className={styles.nodeSmall}
            >
              <AvatarStack initials={["DW", "EM"]} />
            </StageNode>
          </div>

          <div className={styles.ruleCard} style={delayStyle(560)}>
            <span className={styles.ruleHeading}>{CONDITION_HEADING}</span>
            {CONDITION_RULES.map((rule) => (
              <span
                key={rule.label}
                className={styles.ruleRow}
                data-on={rule.on || undefined}
              >
                <span className={styles.ruleToggle} aria-hidden="true">
                  <span className={styles.ruleKnob} />
                </span>
                {rule.label}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `parallel` — the condition fans out into two review lanes (design + copy)
 * that run at the same time, then join before the client gate.
 *
 * @returns The parallel scene, or `null` on failure.
 */
function ParallelScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.rail}>
          <StageNode
            tone="amber"
            glyph="bolt"
            glyphFilled
            title={TRIGGER_TITLE}
            subtitle={TRIGGER_SUB}
            delayMs={120}
            className={styles.nodeSmall}
          />
          <Connector delayMs={200} />
          <div className={styles.parallelGroup} style={delayStyle(300)}>
            <span className={styles.parallelLabel}>{PARALLEL_LABEL}</span>
            <div className={styles.lanes}>
              <StageNode
                tone="blue"
                glyph="users"
                title="Design review"
                subtitle="Running"
                active
                delayMs={360}
                className={styles.laneNode}
              >
                <AvatarStack initials={["EM"]} />
              </StageNode>
              <StageNode
                tone="indigo"
                glyph="users"
                title="Copy review"
                subtitle="Running"
                active
                delayMs={440}
                className={styles.laneNode}
              >
                <AvatarStack initials={["DW"]} />
              </StageNode>
            </div>
          </div>
          <Connector delayMs={560} />
          <StageNode
            tone="teal"
            glyph="userCheck"
            title={GATE_TITLE}
            subtitle={GATE_SUB}
            delayMs={640}
            className={styles.nodeSmall}
          />
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `escalation` — a review step that sits too long escalates: a waiting timer on
 * the stuck node and an auto-reassignment branch to a senior reviewer.
 *
 * @returns The escalation scene, or `null` on failure.
 */
function EscalationScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.rail}>
          <StageNode
            tone="blue"
            glyph="users"
            title={REVIEW_TITLE}
            subtitle="Assigned to Emma"
            delayMs={120}
            className={styles.nodeStuck}
          >
            <span className={styles.waitBadge}>
              <Glyph name="clock" size={13} />
              {ESCALATION_WAIT}
            </span>
          </StageNode>
          <Connector delayMs={220} className={styles.escConn}>
            <span className={styles.escConnLabel}>{ESCALATION_RULE}</span>
          </Connector>
          <StageNode
            tone="coral"
            glyph="arrowUp"
            title={ESCALATION_TITLE}
            subtitle={ESCALATION_SUB}
            active
            delayMs={520}
            className={styles.escNode}
          >
            <span className={styles.escSenior}>
              <span className={styles.escSeniorAvatar} aria-hidden="true">
                RK
              </span>
              {ESCALATION_SENIOR}
            </span>
          </StageNode>
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `client-gate` — the last node: the team-approved work reaches the client
 * gate, and the client approves from a no-account link (a recorded yes).
 *
 * @returns The client-gate scene, or `null` on failure.
 */
function ClientGateScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.gateScene}>
          <div className={styles.rail}>
            <StageNode
              tone="blue"
              glyph="users"
              title={REVIEW_TITLE}
              subtitle="Approved"
              delayMs={120}
              className={styles.nodeSmall}
            />
            <Connector pulse delayMs={220} />
            <StageNode
              tone="teal"
              glyph="userCheck"
              title={GATE_TITLE}
              subtitle="Last node"
              active
              delayMs={320}
              className={styles.nodeGate}
            />
          </div>

          <div className={styles.approvalCard} style={delayStyle(480)}>
            <div className={styles.approvalBar}>
              <span className={styles.approvalDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={styles.approvalUrl}>{SITE_NAME}</span>
              <span className={styles.approvalNoAccount}>{GATE_NO_ACCOUNT}</span>
            </div>
            <div className={styles.approvalBody}>
              <span className={styles.approvalHero} aria-hidden="true" />
              <span className={styles.approvalLine} aria-hidden="true" />
              <span
                className={`${styles.approvalLine} ${styles.approvalLineShort}`}
                aria-hidden="true"
              />
              <span className={styles.approveBtn}>
                <span className={styles.approveBtnIdle}>{GATE_APPROVE_FROM}</span>
                <span className={styles.approveBtnDone}>
                  <Glyph name="check" size={14} />
                  {GATE_APPROVED}
                </span>
              </span>
              <span className={styles.approvedStamp}>
                <Glyph name="circleCheck" size={13} />
                {GATE_APPROVER}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `notifications` — a node clears and Slack + email fire: the channel hears
 * when a step clears, the owner hears when the whole flow completes.
 *
 * @returns The notifications scene, or `null` on failure.
 */
function NotificationsScene(): ReactNode {
  try {
    return (
      <>
        <FlowHeader />
        <div className={styles.notifyScene}>
          <StageNode
            tone="blue"
            glyph="users"
            title="Copy review"
            subtitle="Cleared"
            active
            delayMs={120}
            className={styles.nodeNotify}
          >
            <span className={styles.clearedMark}>
              <Glyph name="check" size={12} />
              {NOTIFY_CLEARED}
            </span>
          </StageNode>

          <Connector pulse delayMs={220} />

          <div className={styles.notifyCards}>
            <div className={styles.notifyCard} style={delayStyle(420)}>
              <span className={styles.notifyLogo} aria-hidden="true">
                <SlackGlyph size={18} />
              </span>
              <span className={styles.notifyText}>
                <span className={styles.notifyChannel}>{NOTIFY_SLACK_CHANNEL}</span>
                <span className={styles.notifyBody}>{NOTIFY_SLACK_TEXT}</span>
              </span>
            </div>
            <div className={styles.notifyCard} style={delayStyle(560)}>
              <span className={`${styles.notifyLogo} ${styles.notifyLogoMail}`} aria-hidden="true">
                <Glyph name="mail" size={17} />
              </span>
              <span className={styles.notifyText}>
                <span className={styles.notifyChannel}>{NOTIFY_EMAIL_TO}</span>
                <span className={styles.notifyBody}>{NOTIFY_EMAIL_TEXT}</span>
              </span>
            </div>
          </div>
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * `one-flow` — one flow applied across every project: three stacked, identical
 * mini-pipelines (Acme, Northwind, Volt), each at its own point on the path.
 *
 * @returns The one-flow scene, or `null` on failure.
 */
function OneFlowScene(): ReactNode {
  try {
    return (
      <>
        <div className={styles.oneFlowHead}>
          <span className={styles.oneFlowKicker}>{ONE_FLOW_HEADING}</span>
        </div>
        <div className={styles.oneFlowRows}>
          {ONE_FLOW_PROJECTS.map((project, projectIndex) => (
            <div
              key={project.id}
              className={styles.miniRow}
              style={
                {
                  "--wf-client": project.tone,
                  [DELAY_VAR]: `${160 + projectIndex * 120}ms`,
                } as CSSProperties
              }
            >
              <span className={styles.miniClient}>
                <span className={styles.miniDot} aria-hidden="true" />
                {project.name}
              </span>
              <div className={styles.miniStages}>
                {ONE_FLOW_STAGE_LABELS.map((label, stageIndex) => (
                  <span key={label} className={styles.miniStageWrap}>
                    <span
                      className={styles.miniStage}
                      data-done={stageIndex < project.at || undefined}
                    >
                      {label}
                    </span>
                    {stageIndex < ONE_FLOW_STAGE_LABELS.length - 1 ? (
                      <span
                        className={styles.miniConn}
                        data-done={stageIndex < project.at - 1 || undefined}
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  } catch {
    return null;
  }
}

/**
 * Resolve which scene body to render for a review-workflow variant.
 *
 * @param variant - The requested scene variant.
 * @returns The scene node for the variant.
 */
function renderScene(variant: ReviewWorkflowVariant): ReactNode {
  try {
    switch (variant) {
      case "push-trigger":
        return <PushTriggerScene />;
      case "build-step":
        return <BuildStepScene />;
      case "condition":
        return <ConditionScene />;
      case "parallel":
        return <ParallelScene />;
      case "escalation":
        return <EscalationScene />;
      case "client-gate":
        return <ClientGateScene />;
      case "notifications":
        return <NotificationsScene />;
      case "one-flow":
        return <OneFlowScene />;
      default:
        return <SampleFlowScene />;
    }
  } catch {
    return null;
  }
}

/** Props for {@link ReviewWorkflowArtifact}. */
export interface ReviewWorkflowArtifactProps {
  /** Which scene to render. Defaults to `sample-flow`. */
  variant?: ReviewWorkflowVariant;
  /** Hero-window fit (centres + trims the scene for the hero product window). */
  hero?: boolean;
}

/**
 * Render the Review Workflows artifact for the given variant.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function ReviewWorkflowArtifact({
  variant = "sample-flow",
  hero = false,
}: ReviewWorkflowArtifactProps = {}): ReactNode {
  try {
    return (
      <div
        className={styles.root}
        data-artifact={`review-workflow-${variant}`}
        data-variant={variant}
        data-hero={hero || undefined}
      >
        <div className={styles.canvas}>{renderScene(variant)}</div>
        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature-panel wrapper — the full sample flow (hero "The sample flow" / block
 * "Human and agent steps").
 * @returns The sample-flow artifact.
 */
export function ReviewWorkflowSampleArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="sample-flow" />;
}

/**
 * Feature-panel wrapper — the push-triggered run (hero "Triggered by a push" /
 * block "Push-triggered runs").
 * @returns The push-trigger artifact.
 */
export function ReviewWorkflowPushArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="push-trigger" />;
}

/**
 * Feature-panel wrapper — the visual builder (hero "Build a step" / block
 * "Visual builder").
 * @returns The build-step artifact.
 */
export function ReviewWorkflowBuilderArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="build-step" />;
}

/**
 * Feature-panel wrapper — the condition rule editor (hero "Set a condition" /
 * block "Conditions").
 * @returns The condition artifact.
 */
export function ReviewWorkflowConditionArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="condition" />;
}

/**
 * Feature-panel wrapper — the parallel review lanes (block "Parallel steps").
 * @returns The parallel artifact.
 */
export function ReviewWorkflowParallelArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="parallel" />;
}

/**
 * Feature-panel wrapper — the escalation branch (block "Escalation").
 * @returns The escalation artifact.
 */
export function ReviewWorkflowEscalationArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="escalation" />;
}

/**
 * Feature-panel wrapper — the client gate (hero "The client gate" / block
 * "The client gate").
 * @returns The client-gate artifact.
 */
export function ReviewWorkflowGateArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="client-gate" />;
}

/**
 * Feature-panel wrapper — step & flow notifications (block "Step and flow
 * notifications").
 * @returns The notifications artifact.
 */
export function ReviewWorkflowNotificationsArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="notifications" />;
}

/**
 * Feature-panel wrapper — one flow across every project (block "One flow,
 * every project").
 * @returns The one-flow artifact.
 */
export function ReviewWorkflowOneFlowArtifact(): ReactNode {
  return <ReviewWorkflowArtifact variant="one-flow" />;
}
