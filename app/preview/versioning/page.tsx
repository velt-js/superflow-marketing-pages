import VersioningArtifact from "@/components/home-2026/feature-artifacts/VersioningArtifact";

// TEMP verification-only route for the refactored "Versioning" artifact, which
// now renders the shared PinnedCommentScene with its `versions` rail on (left
// stacked VERSION buttons, VERSION 4 active) and the default durable-thread
// comment. The first frame plays the entrance live; the second freezes every
// animation at the end of the timeline for a static screenshot.
const FRAME_WIDTH = 900;
const FRAME_HEIGHT = 602;

export default function VersioningPreviewPage() {
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
          <VersioningArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .ver-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="ver-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <VersioningArtifact />
        </div>
      </div>
    </div>
  );
}
