import RecordWalkthroughArtifact from "@/components/home-2026/feature-artifacts/RecordWalkthroughArtifact";

// TEMP verification-only route for the reworked "Record Walkthrough" artifact
// (Figma node 859:1485): countdown pill → recording control bar loop on a
// flat light-mint surface, no green tab / app window.
const FRAME_WIDTH = 720;
const FRAME_HEIGHT = 602;

export default function RecordWalkthroughPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      {/* Hide the Termly consent banner so it can't cover the artifact. */}
      <style>{`#termly-code-snippet-support { display: none !important; }`}</style>
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
        <RecordWalkthroughArtifact />
      </div>
    </div>
  );
}
