import LiveSiteArtifact from "@/components/home-2026/feature-artifacts/LiveSiteArtifact";

// TEMP verification-only route for the refactored "Live Site" artifact, which
// now renders the shared PinnedCommentScene in its `live` variant (green "Live"
// pill in the chrome + "Static copy · 2w ago" ghost card + live-build comment).
// The first frame plays the entrance live; the second freezes every animation
// at the end of the timeline so the settled scene can be inspected statically.
const FRAME_WIDTH = 720;
const FRAME_HEIGHT = 602;

export default function LiveSitePreviewPage() {
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
          <LiveSiteArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .ls-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="ls-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <LiveSiteArtifact />
        </div>
      </div>
    </div>
  );
}
