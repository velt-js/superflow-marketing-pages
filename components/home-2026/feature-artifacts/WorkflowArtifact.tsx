import type { CSSProperties, ReactNode } from "react";
import styles from "./WorkflowArtifact.module.css";

/**
 * Feature-section app-window artifact — "Workflows".
 *
 * A "Client Resolution" automation drawn on a dot-grid canvas: three connected
 * steps — an "On Comment" trigger, a "Slack" gate that waits on the client's
 * reply, and a "Resolve Comment" API action — stacked vertically and joined by
 * dotted connectors. Conveys "multi-step review flows with client gates and
 * escalation rules."
 *
 * On mount (and again whenever the tab is activated, since the panel remounts
 * its content) the header fades in and each step rises in with a small stagger
 * while the connectors draw themselves between the cards.
 */

/* -------------------------------------------------------------- text strings */

const HEADER_TITLE = "Client Resolution";
const TRIGGER_AUTHOR = "Mike";
const TRIGGER_WHEN = "2m";

/** Visual tone applied to a step's icon tile. */
type StepTone = "amber" | "slate" | "indigo";

/** The kind of glyph a step renders inside its icon tile. */
type StepGlyph = "bolt" | "slack" | "api";

/** One step (node) in the workflow flow. */
interface WorkflowStep {
  id: string;
  glyph: StepGlyph;
  tone: StepTone;
  title: string;
  subtitle: string;
}

/** The three steps of the "Client Resolution" flow, top to bottom. */
const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  { id: "on-comment", glyph: "bolt", tone: "amber", title: "On Comment", subtitle: "2 Events" },
  { id: "slack", glyph: "slack", tone: "slate", title: "Slack", subtitle: "On Client reply" },
  { id: "resolve", glyph: "api", tone: "indigo", title: "Resolve Comment", subtitle: "2 Events" },
] as const;

/** Base delay (seconds) before the first step rises in. */
const STEP_STAGGER_BASE = 0.12;
/** Delay increment (seconds) applied to each subsequent step + connector. */
const STEP_STAGGER_STEP = 0.16;

/* ---------------------------------------------------------------- icon glyphs */

/**
 * Filled lightning-bolt glyph used by the "On Comment" trigger tile.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The bolt `<svg>` element, or null on failure.
 */
function BoltGlyph({ size }: { size: number }): ReactNode {
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
      >
        <path d="M13.4 2.3a.75.75 0 0 1 1.32.63L13.3 10h4.95a.75.75 0 0 1 .6 1.2l-8.55 11.4a.75.75 0 0 1-1.34-.57L10.36 14H5.5a.75.75 0 0 1-.6-1.2L13.4 2.3Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The multi-colour Slack logo used by the client-reply gate tile.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The Slack `<svg>` element, or null on failure.
 */
function SlackGlyph({ size }: { size: number }): ReactNode {
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
        <path
          d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
          fill="#e01e5a"
        />
        <path
          d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
          fill="#36c5f0"
        />
        <path
          d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
          fill="#2eb67d"
        />
        <path
          d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
          fill="#ecb22e"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * "API" wordmark used by the resolve-comment action tile.
 *
 * @returns The API label element, or null on failure.
 */
function ApiGlyph(): ReactNode {
  try {
    return <span className={styles.apiWord}>API</span>;
  } catch {
    return null;
  }
}

/**
 * Render the glyph for a step's icon tile.
 *
 * @param root0 - The glyph props.
 * @param root0.glyph - Which glyph to render.
 * @returns The matching glyph element, or null on failure.
 */
function StepIcon({ glyph }: { glyph: StepGlyph }): ReactNode {
  try {
    if (glyph === "bolt") {
      return <BoltGlyph size={28} />;
    }
    if (glyph === "slack") {
      return <SlackGlyph size={30} />;
    }
    return <ApiGlyph />;
  } catch {
    return null;
  }
}

/**
 * A dotted connector with round end-caps that links two adjacent steps.
 *
 * @param root0 - The connector props.
 * @param root0.delay - Entrance delay (seconds) so it draws after the step above.
 * @returns The connector element, or null on failure.
 */
function StepConnector({ delay }: { delay: number }): ReactNode {
  try {
    const connectorStyle: CSSProperties = { animationDelay: `${delay}s` };
    return (
      <span className={styles.connector} style={connectorStyle} aria-hidden="true">
        <span className={styles.connectorDot} />
        <span className={styles.connectorLine} />
        <span className={styles.connectorDot} />
      </span>
    );
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------- export */

/**
 * Render the "Workflows" feature-section artifact.
 *
 * @returns The Client Resolution flow, filling its container.
 */
export default function WorkflowArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="workflows">
        <div className={styles.header}>
          <h3 className={styles.title}>{HEADER_TITLE}</h3>
          <p className={styles.meta}>
            <span className={styles.metaStrong}>{TRIGGER_AUTHOR}</span>
            {" triggered "}
            <span className={styles.metaStrong}>{TRIGGER_WHEN}</span>
            {" ago"}
          </p>
        </div>

        <div className={styles.flow}>
          {WORKFLOW_STEPS.map((step, index) => {
            const stepDelay = STEP_STAGGER_BASE + index * STEP_STAGGER_STEP;
            const stepStyle: CSSProperties = { animationDelay: `${stepDelay}s` };
            // The connector above this step draws midway between the two nodes.
            const connectorDelay = stepDelay - STEP_STAGGER_STEP / 2;
            return (
              <div key={step.id} className={styles.step}>
                {index > 0 ? <StepConnector delay={connectorDelay} /> : null}
                <div className={styles.node} style={stepStyle}>
                  <span className={styles.nodeIcon} data-tone={step.tone}>
                    <StepIcon glyph={step.glyph} />
                  </span>
                  <span className={styles.nodeText}>
                    <span className={styles.nodeTitle}>{step.title}</span>
                    <span className={styles.nodeSub}>{step.subtitle}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
