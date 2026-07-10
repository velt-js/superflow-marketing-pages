import CustomAgentArtifact from "@/components/home-2026/feature-artifacts/CustomAgentArtifact";

// TEMP verification-only route for the "Custom Agent" feature artifact.
// Each variant is shown at the full 1204×602 panel canvas (so the whole builder
// including the right-edge bleed can be inspected) and clipped to the ~631px
// the marketing card actually reveals (what a visitor sees on
// /preview/features/review-agents — the Custom Agent + Test Cases tabs).
const FULL_WIDTH = 1204;
const VISIBLE_WIDTH = 631;
const FRAME_HEIGHT = 602;

type Variant = "prompt" | "test";

function Frame({
  label,
  width,
  variant,
}: {
  label: string;
  width: number;
  variant: Variant;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>{label}</p>
      <div
        style={{
          position: "relative",
          width,
          height: FRAME_HEIGHT,
          overflow: "hidden",
          borderRadius: 14,
          background: "#feffff",
        }}
      >
        <CustomAgentArtifact variant={variant} />
      </div>
    </div>
  );
}

export default function CustomAgentPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <Frame label="prompt — full canvas (1204×602)" width={FULL_WIDTH} variant="prompt" />
      <Frame
        label="prompt — visible in card (~631px, right edge clipped)"
        width={VISIBLE_WIDTH}
        variant="prompt"
      />
      <Frame label="test — full canvas (1204×602)" width={FULL_WIDTH} variant="test" />
      <Frame
        label="test — visible in card (~631px, right edge clipped)"
        width={VISIBLE_WIDTH}
        variant="test"
      />
    </div>
  );
}
