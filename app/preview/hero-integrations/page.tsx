import IntegrationsArtifact from "@/components/home-2026/hero-artifacts/IntegrationsArtifact";

// TEMP verification-only route for the hero "2 Way Integrations" artifact.
// First frame plays the animation live (reload to replay). Second frame freezes
// every animation at the end of the timeline so the settled state — board reply
// revealed + synced reply landed on the left — can be inspected in a screenshot.
const FRAME_WIDTH = 1120;
const FRAME_HEIGHT = 600;

export default function HeroIntegrationsPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          live (reload to replay)
        </p>
        <div
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <IntegrationsArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .hi-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="hi-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <IntegrationsArtifact />
        </div>
      </div>
    </div>
  );
}
