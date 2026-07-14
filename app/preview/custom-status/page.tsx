import CustomStatusArtifact from "@/components/home-2026/feature-artifacts/CustomStatusArtifact";

// TEMP verification-only route for the "Custom Statuses" artifact.
// The first frame plays the animation live (reload to replay). The second frame
// freezes every animation at the end of the timeline (a large negative global
// delay + paused play-state) so the settled board — new "In Review" column
// expanded, "In Progress" slid right — can be inspected in a static screenshot.
const FRAME_WIDTH = 631;
const FRAME_HEIGHT = 602;

export default function CustomStatusPreviewPage() {
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
          <CustomStatusArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .cs-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="cs-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <CustomStatusArtifact />
        </div>
      </div>
    </div>
  );
}
