import ReviewWorkflowArtifact, {
  type ReviewWorkflowVariant,
} from "@/components/home-2026/feature-artifacts/ReviewWorkflowArtifact";
import SolutionSection from "@/components/home-2026/SolutionSection";

// TEMP verification-only route for the Review Workflows feature-page artifacts.
// Renders each flow-builder scene in the feature panel frame (left-anchored,
// right edge clipped) and, for the five hero tabs, the hero product-window
// frame (fully visible, centred), plus the "in your head → one visual flow"
// Solution illustration. Reload to replay the animations.
const FEATURE_WIDTH = 631;
const FEATURE_HEIGHT = 602;
const HERO_WIDTH = 1180;
const HERO_HEIGHT = 578;

/** Every feature-panel scene (the nine block tabs across the three blocks). */
const FEATURE_VARIANTS: readonly { variant: ReviewWorkflowVariant; label: string }[] = [
  { variant: "build-step", label: "build-step - Visual builder" },
  { variant: "sample-flow", label: "sample-flow - Human and agent steps" },
  { variant: "push-trigger", label: "push-trigger - Push-triggered runs" },
  { variant: "condition", label: "condition - Conditions" },
  { variant: "parallel", label: "parallel - Parallel steps" },
  { variant: "escalation", label: "escalation - Escalation" },
  { variant: "client-gate", label: "client-gate - The client gate" },
  { variant: "notifications", label: "notifications - Step & flow notifications" },
  { variant: "one-flow", label: "one-flow - One flow, every project" },
];

/** The five hero tabs (fully visible, centred). */
const HERO_VARIANTS: readonly { variant: ReviewWorkflowVariant; label: string }[] = [
  { variant: "sample-flow", label: "sample-flow - The sample flow" },
  { variant: "push-trigger", label: "push-trigger - Triggered by a push" },
  { variant: "build-step", label: "build-step - Build a step" },
  { variant: "condition", label: "condition - Set a condition" },
  { variant: "client-gate", label: "client-gate - The client gate" },
];

/**
 * A labelled frame that clips one artifact to a fixed size (mirrors the real
 * feature panel / hero window).
 *
 * @param props.label - The caption above the frame.
 * @param props.width - Frame width in px.
 * @param props.height - Frame height in px.
 * @param props.children - The artifact to render.
 * @returns The framed preview block.
 */
function Frame({
  label,
  width,
  height,
  children,
}: {
  label: string;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ font: "600 12px system-ui", margin: "0 0 6px", color: "#333" }}>
        {label}
      </p>
      <div
        style={{
          position: "relative",
          width,
          height,
          overflow: "hidden",
          borderRadius: 14,
          background: "#feffff",
          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Preview page rendering every Review Workflows artifact.
 *
 * @returns The preview grid.
 */
export default function ReviewWorkflowsArtifactsPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <h2 style={{ font: "700 16px system-ui", margin: "0 0 16px" }}>
        Feature panel (631px visible, left-anchored)
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {FEATURE_VARIANTS.map(({ variant, label }) => (
          <Frame
            key={`feat-${variant}-${label}`}
            label={label}
            width={FEATURE_WIDTH}
            height={FEATURE_HEIGHT}
          >
            <ReviewWorkflowArtifact variant={variant} />
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 16px" }}>
        Hero product window (fully visible, centred)
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {HERO_VARIANTS.map(({ variant, label }) => (
          <Frame
            key={`hero-${variant}`}
            label={label}
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
          >
            <ReviewWorkflowArtifact hero variant={variant} />
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 8px" }}>
        Solution section (variant=&quot;review-workflows&quot;)
      </h2>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        <SolutionSection variant="review-workflows" />
      </div>
    </div>
  );
}
