import ScreenshotArtifact, {
  type ScreenshotVariant,
} from "@/components/home-2026/feature-artifacts/ScreenshotArtifact";
import AuthenticatedPagesArtifact from "@/components/home-2026/feature-artifacts/AuthenticatedPagesArtifact";
import SolutionSection from "@/components/home-2026/SolutionSection";

// TEMP verification-only route for the Screenshots feature-page artifacts.
// Renders each screenshot scene in the feature panel frame (left-anchored, right
// edge clipped) and, for the hero tabs, the hero product-window frame (fully
// visible, centred) — the fourth hero tab reuses the Authenticated Pages
// behind-password gate — plus the "comment captures the page → snapshot outlives
// it" Solution illustration. Reload to replay the animations.
const FEATURE_WIDTH = 631;
const FEATURE_HEIGHT = 602;
const HERO_WIDTH = 1180;
const HERO_HEIGHT = 578;

/** Every feature-panel scene (the tabs across the four blocks). */
const FEATURE_VARIANTS: readonly { variant: ScreenshotVariant; label: string }[] = [
  { variant: "capture", label: "capture - Comment-time capture" },
  { variant: "no-extension", label: "no-extension - No browser extension" },
  { variant: "then-and-now", label: "then-and-now - Page changed / lost anchor" },
  { variant: "full-page", label: "full-page - Full-page context" },
  { variant: "client-view", label: "client-view - Client-visible snapshot" },
  { variant: "record", label: "record - Approvals with context" },
];

/** The screenshot-driven hero tabs (fully visible, centred). */
const HERO_VARIANTS: readonly { variant: ScreenshotVariant; label: string }[] = [
  { variant: "capture", label: "capture - Comment, snapshot saved" },
  { variant: "then-and-now", label: "then-and-now - The page changed" },
  { variant: "client-view", label: "client-view - The client's view" },
];

/**
 * A labelled frame that clips one artifact to a fixed size (mirrors the real
 * feature panel / hero window).
 *
 * @param props - The frame props.
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
 * Preview page rendering every Screenshots artifact.
 *
 * @returns The preview grid.
 */
export default function ScreenshotsArtifactsPreviewPage() {
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
            <ScreenshotArtifact variant={variant} />
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
            <ScreenshotArtifact hero variant={variant} />
          </Frame>
        ))}
        <Frame
          key="hero-behind-password"
          label="behind-password (reused) - Behind a password"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
        >
          <AuthenticatedPagesArtifact hero variant="behind-password" />
        </Frame>
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 8px" }}>
        Solution section (variant=&quot;screenshots&quot;)
      </h2>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        <SolutionSection variant="screenshots" />
      </div>
    </div>
  );
}
