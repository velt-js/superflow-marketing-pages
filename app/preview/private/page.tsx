import PrivateCommentArtifact from "@/components/home-2026/hero-artifacts/PrivateCommentArtifact";

// TEMP verification-only route for the hero "Private Comments" artifact.
// First frame plays live (reload / adjust the capture time to see the sequence:
// toggle flips on -> toolbar darkens -> composer gains the private header +
// pill). Second frame freezes everything at the end of the timeline so the
// settled private state can be inspected in a static screenshot.
const FRAME_WIDTH = 1120;
const FRAME_HEIGHT = 600;

export default function PrivatePreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          live (capture-time frame)
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
          <PrivateCommentArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .pv-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="pv-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <PrivateCommentArtifact />
        </div>
      </div>
    </div>
  );
}
