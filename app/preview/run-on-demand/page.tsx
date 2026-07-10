import RunOnDemandArtifact from "@/components/home-2026/hero-artifacts/RunOnDemandArtifact";

// TEMP verification-only route for the hero "Run on Demand" artifact.
// First frame plays the entrance live (reload to replay); the second freezes
// every animation past the end of the timeline so the settled state can be
// inspected in a screenshot. The wrapper mimics the shared hero window: a 2px
// black reveal around the 578px artifact frame.
const FRAME_WIDTH = 1160;
const FRAME_HEIGHT = 578;

/**
 * Render the standalone verification page for {@link RunOnDemandArtifact}.
 *
 * @returns The preview page element.
 */
export default function RunOnDemandPreviewPage() {
  const windowStyle = {
    background: "#000000",
    borderRadius: 16,
    padding: 2,
    width: FRAME_WIDTH,
  } as const;
  const frameStyle = {
    position: "relative",
    height: FRAME_HEIGHT,
    overflow: "hidden",
    borderRadius: 16,
    background: "#feffff",
  } as const;

  return (
    <div style={{ padding: 24, background: "#eae7f5" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          live (reload to replay)
        </p>
        <div style={windowStyle}>
          <div style={frameStyle}>
            <RunOnDemandArtifact />
          </div>
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .rod-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div style={windowStyle}>
          <div className="rod-freeze-end" style={frameStyle}>
            <RunOnDemandArtifact />
          </div>
        </div>
      </div>
    </div>
  );
}
