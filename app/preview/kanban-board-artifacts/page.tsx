import KanbanArtifact, {
  type KanbanVariant,
} from "@/components/home-2026/feature-artifacts/KanbanArtifact";
import SolutionSection from "@/components/home-2026/SolutionSection";

// TEMP verification-only route for the Kanban Board feature-page artifacts.
// Renders each board variant in the feature panel frame (left-anchored, right
// edge clipped) and the hero product-window frame (fully visible, centred),
// plus the "review activity → the board updates itself" Solution illustration.
// Reload to replay the animations.
const FEATURE_WIDTH = 631;
const FEATURE_HEIGHT = 602;
const HERO_WIDTH = 1180;
const HERO_HEIGHT = 578;

const VARIANTS: readonly { variant: KanbanVariant; label: string }[] = [
  { variant: "cross-client", label: "cross-client - The board" },
  { variant: "self-moving", label: "self-moving - It moves itself" },
  { variant: "custom-columns", label: "custom-columns - Custom statuses" },
  { variant: "filters", label: "filters - Filters" },
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
 * Preview page rendering every Kanban Board artifact.
 *
 * @returns The preview grid.
 */
export default function KanbanBoardArtifactsPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <h2 style={{ font: "700 16px system-ui", margin: "0 0 16px" }}>
        Feature panel (631px visible, left-anchored)
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {VARIANTS.map(({ variant, label }) => (
          <Frame
            key={`feat-${variant}`}
            label={label}
            width={FEATURE_WIDTH}
            height={FEATURE_HEIGHT}
          >
            <KanbanArtifact variant={variant} />
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 16px" }}>
        Hero product window (fully visible, centred)
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {VARIANTS.map(({ variant, label }) => (
          <Frame
            key={`hero-${variant}`}
            label={label}
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
          >
            <KanbanArtifact hero variant={variant} />
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 8px" }}>
        Solution section (variant=&quot;kanban&quot;)
      </h2>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        <SolutionSection variant="kanban" />
      </div>
    </div>
  );
}
