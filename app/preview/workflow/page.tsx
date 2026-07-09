import WorkflowArtifact from "@/components/home-2026/feature-artifacts/WorkflowArtifact";

// TEMP verification-only route for the "Workflows" ("Client Resolution")
// artifact. The first frame plays the entrance live (reload to replay); the
// second freezes every animation at the end of the timeline so the settled
// flow can be inspected in a static screenshot. Frame matches the real feature
// panel screen (~1200 × 602).
const FRAME_WIDTH = 1200;
const FRAME_HEIGHT = 602;

export default function WorkflowPreviewPage() {
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
          <WorkflowArtifact />
        </div>
      </div>

      <div>
        <p style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>
          settled (end of timeline)
        </p>
        <style>{`
          .wf-freeze-end * {
            animation-play-state: paused !important;
            animation-delay: -10s !important;
          }
        `}</style>
        <div
          className="wf-freeze-end"
          style={{
            position: "relative",
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            overflow: "hidden",
            borderRadius: 14,
            background: "#feffff",
          }}
        >
          <WorkflowArtifact />
        </div>
      </div>
    </div>
  );
}
