import type { ReactNode, SVGProps } from "react";
import styles from "./CustomAgentArtifact.module.css";

/**
 * Feature Set artifact — "Custom Agent".
 *
 * The Superflow custom-agent builder screen: the agent's dotted app-icon tile
 * + name ("SEO Agent") and a three-step wizard rail (Basics → Prompt → Test).
 * Two variants share the same chrome:
 *
 * - `"prompt"` (default) — the **Prompt** step is active: a focused prompt
 *   textarea (with a "Refine" affordance, the draft types in) and the
 *   "Questions" block with its dashed "Add Question" button.
 * - `"test"` — Prompt is complete and the **Test** step is active: a labelled
 *   test case, a code example showcasing the issue under test (commented-out
 *   metadata) and an "Is this Correct?" bar with Yes / No.
 *
 * Renders inside the existing `FeatureSetBlock` white screen (never recreates
 * the browser/tab frame). The screen is 1204×602 and clips the marketing
 * card's right edge, so the scene is left-anchored and the prompt box / code
 * box / answer bar intentionally bleed off the right. CSS-only; a light
 * staggered entrance replays whenever the tab mounts and rests settled under
 * `prefers-reduced-motion`.
 */

const AGENT_NAME = "SEO Agent";
const PROMPT_LABEL = "Prompt";
const PROMPT_DRAFT = "Check for";
const REFINE_LABEL = "Refine";
const QUESTIONS_TITLE = "Questions";
const QUESTIONS_SUBTITLE =
  "Add questions the agent needs answered before running";
const ADD_QUESTION_LABEL = "Add Question";

const TEST_CASE_LABEL = "Test Case #1";
const TEST_CASE_TITLE = "Commented Out Metadata";
const TEST_CASE_QUESTION = "Is this Correct?";
const ANSWER_YES_LABEL = "Yes";
const ANSWER_NO_LABEL = "No";

/**
 * The example rendered inside the Test step's code box — an HTML `<head>` whose
 * `description` and `robots` meta tags have been commented out (the exact issue
 * the "Commented Out Metadata" agent is asked to judge). Flagged lines are
 * tinted to read as the found problem.
 */
const TEST_CASE_CODE: readonly { text: string; flag?: boolean }[] = [
  { text: "<head>" },
  { text: "  <title>Acme - Pricing</title>" },
  {
    text: '  <!-- <meta name="description" content="Fair pricing."> -->',
    flag: true,
  },
  { text: '  <meta property="og:title" content="Acme">' },
  {
    text: '  <!-- <meta name="robots" content="index, follow"> -->',
    flag: true,
  },
  { text: "</head>" },
];

/**
 * Row-major dot fills for the green "SEO Agent" app-icon tile — a 3×3 matrix of
 * green/chartreuse shades on a dark-green tile, mirroring the Superflow product
 * app icon.
 */
const SEO_TILE_DOTS: readonly string[] = [
  "#7fe38f", "#d2dd52", "#aeecbb",
  "#6ed77e", "#dcdf4b", "#bdf2c6",
  "#aeecbb", "#7fe38f", "#b6efc2",
];

/** Which wizard step the screen is on. */
type CustomAgentVariant = "prompt" | "test";

/** Wizard step visual states. */
const STEP_STATE_DONE = "done";
const STEP_STATE_ACTIVE = "active";
const STEP_STATE_UPCOMING = "upcoming";

type StepState =
  | typeof STEP_STATE_DONE
  | typeof STEP_STATE_ACTIVE
  | typeof STEP_STATE_UPCOMING;

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
}: IconProps & {
  strokeWidth?: number | string;
  children: ReactNode;
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
 * Pencil glyph for the completed "Basics" step (Tabler `pencil`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The pencil icon.
 */
function PencilIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.9} {...props}>
      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
      <path d="M13.5 6.5l4 4" />
    </StrokeIcon>
  );
}

/**
 * Paragraph/prompt lines glyph for the "Prompt" step (Tabler `align-justified`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The prompt-lines icon.
 */
function PromptLinesIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={2} {...props}>
      <path d="M4 6l16 0" />
      <path d="M4 12l16 0" />
      <path d="M4 18l11 0" />
    </StrokeIcon>
  );
}

/**
 * Eye-with-check glyph for the "Test" step (Tabler `eye-check`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The eye-check icon.
 */
function EyeCheckIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={1.85} {...props}>
      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
      <path d="M11.11 17.958c-3.209 -.307 -5.91 -2.293 -8.11 -5.958c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6c-.21 .352 -.427 .688 -.647 1.008" />
      <path d="M15 19l2 2l4 -4" />
    </StrokeIcon>
  );
}

/**
 * Four-point sparkle glyph trailing the "Refine" button (Tabler `sparkles`).
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
 * Plus glyph for the dashed "Add Question" button (Tabler `plus`).
 *
 * @param props - Icon props forwarded to {@link StrokeIcon}.
 * @returns The plus icon.
 */
function PlusIcon(props: IconProps): ReactNode {
  return (
    <StrokeIcon strokeWidth={2} {...props}>
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </StrokeIcon>
  );
}

/** One wizard step definition. */
type WizardStep = {
  id: string;
  label: string;
  state: StepState;
  icon: ReactNode;
};

/**
 * Build the three wizard steps for a given variant. In `"prompt"` the Prompt
 * step is active (Test upcoming); in `"test"` the Prompt step is complete and
 * the Test step is active.
 *
 * @param variant - Which step the screen is on.
 * @returns The ordered wizard steps.
 */
function buildWizardSteps(variant: CustomAgentVariant): WizardStep[] {
  try {
    const isTest = variant === "test";
    return [
      {
        id: "basics",
        label: "Basics",
        state: STEP_STATE_DONE,
        icon: <PencilIcon size={18} />,
      },
      {
        id: "prompt",
        label: PROMPT_LABEL,
        state: isTest ? STEP_STATE_DONE : STEP_STATE_ACTIVE,
        icon: <PromptLinesIcon size={18} />,
      },
      {
        id: "test",
        label: "Test",
        state: isTest ? STEP_STATE_ACTIVE : STEP_STATE_UPCOMING,
        icon: <EyeCheckIcon size={18} />,
      },
    ];
  } catch {
    return [];
  }
}

/** Maps a step state onto its circle-modifier class. */
const STEP_STATE_CLASS: Readonly<Record<StepState, string>> = {
  [STEP_STATE_DONE]: styles.stepDone,
  [STEP_STATE_ACTIVE]: styles.stepActive,
  [STEP_STATE_UPCOMING]: styles.stepUpcoming,
};

/**
 * Render the three-step wizard rail with connectors between the circles.
 *
 * @param props - The steps to render.
 * @param props.steps - The ordered wizard steps.
 * @returns The stepper element, or `null` on failure.
 */
function WizardStepper({ steps }: { steps: readonly WizardStep[] }): ReactNode {
  try {
    return (
      <div className={styles.stepper} role="list">
        {steps.map((step, index) => (
          <div className={styles.stepGroup} key={step?.id} role="listitem">
            {index > 0 ? (
              <span className={styles.connector} aria-hidden="true" />
            ) : null}
            <div className={styles.step}>
              <span
                className={`${styles.stepCircle} ${STEP_STATE_CLASS[step?.state]}`}
              >
                {step?.icon}
              </span>
              <span
                className={`${styles.stepLabel} ${
                  step?.state === STEP_STATE_ACTIVE ? styles.stepLabelActive : ""
                } ${step?.state === STEP_STATE_DONE ? styles.stepLabelDone : ""}`}
              >
                {step?.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the Prompt step body: the focused prompt textarea (the draft types in)
 * and the "Questions" block.
 *
 * @returns The prompt-step body, or `null` on failure.
 */
function PromptBody(): ReactNode {
  try {
    return (
      <div className={styles.form}>
        <span className={styles.fieldLabel}>{PROMPT_LABEL}</span>
        <div className={styles.promptBox}>
          <p className={styles.promptText}>
            <span className={styles.typed}>{PROMPT_DRAFT}</span>
            <span className={styles.caret} aria-hidden="true" />
          </p>
          <span className={styles.refineBtn}>
            {REFINE_LABEL}
            <SparkleIcon size={13} />
          </span>
        </div>

        <div className={styles.questions}>
          <h3 className={styles.questionsTitle}>{QUESTIONS_TITLE}</h3>
          <p className={styles.questionsSub}>{QUESTIONS_SUBTITLE}</p>
          <span className={styles.addQuestion}>
            <PlusIcon size={16} />
            {ADD_QUESTION_LABEL}
          </span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Render the Test step body: the labelled test case, the code example (with the
 * commented-out metadata flagged) and the "Is this Correct?" answer bar.
 *
 * @returns The test-step body, or `null` on failure.
 */
function TestCaseBody(): ReactNode {
  try {
    return (
      <div className={styles.testBody}>
        <div className={styles.testHeader}>
          <span className={styles.testCaseNo}>{TEST_CASE_LABEL}</span>
          <span className={styles.testCaseTitle}>{TEST_CASE_TITLE}</span>
        </div>

        <div className={styles.codeBox}>
          {TEST_CASE_CODE.map((line, index) => (
            <span
              key={`code-line-${index}`}
              className={`${styles.codeLine} ${line?.flag ? styles.codeLineFlag : ""}`}
            >
              {line?.text}
            </span>
          ))}
        </div>

        <div className={styles.correctBar}>
          <span className={styles.correctQuestion}>{TEST_CASE_QUESTION}</span>
          <div className={styles.correctActions}>
            <span className={`${styles.answerBtn} ${styles.answerYes}`}>
              {ANSWER_YES_LABEL}
            </span>
            <span className={`${styles.answerBtn} ${styles.answerNo}`}>
              {ANSWER_NO_LABEL}
            </span>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link CustomAgentArtifact}. */
export interface CustomAgentArtifactProps {
  /**
   * Which wizard step the screen shows. `"prompt"` (default) renders the prompt
   * builder; `"test"` renders the test-case reviewer.
   */
  variant?: CustomAgentVariant;
}

/**
 * Render the "Custom Agent" feature artifact.
 *
 * @param props - Optional variant selector.
 * @param props.variant - `"prompt"` (default) or `"test"`.
 * @returns The custom-agent builder contents, or `null` on failure.
 */
export default function CustomAgentArtifact({
  variant = "prompt",
}: CustomAgentArtifactProps = {}): ReactNode {
  try {
    const isTest = variant === "test";
    const steps = buildWizardSteps(variant);
    return (
      <div
        className={styles.root}
        data-artifact={isTest ? "custom-agent-test" : "custom-agent"}
      >
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <span className={styles.appTile} aria-hidden="true">
              {SEO_TILE_DOTS.map((color, index) => (
                <span
                  key={`seo-dot-${index}`}
                  className={styles.appTileDot}
                  style={{ background: color }}
                />
              ))}
            </span>
            <h2 className={styles.title}>{AGENT_NAME}</h2>
          </div>

          <div className={styles.card}>
            <WizardStepper steps={steps} />
            {isTest ? <TestCaseBody /> : <PromptBody />}
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The Test-step variant of {@link CustomAgentArtifact}, registered as its own
 * Feature Set mock (`custom-agent-test`) so a tab can select it directly.
 *
 * @returns The custom-agent artifact on its Test step.
 */
export function CustomAgentTestArtifact(): ReactNode {
  return <CustomAgentArtifact variant="test" />;
}
