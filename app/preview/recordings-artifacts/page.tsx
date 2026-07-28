import type { ReactNode } from "react";
import {
  RecordingsScreenArtifact,
  RecordingsCameraArtifact,
  RecordingsVoiceArtifact,
  RecordingsPinnedArtifact,
  RecordingsComposerArtifact,
  RecordingsClientArtifact,
  RecordingsThreadArtifact,
} from "@/components/home-2026/feature-artifacts/RecordingsArtifacts";
import {
  HeroRecordingsScreenArtifact,
  HeroRecordingsVoiceArtifact,
  HeroRecordingsCameraArtifact,
  HeroRecordingsPinnedArtifact,
  HeroRecordingsClientArtifact,
} from "@/components/home-2026/hero-artifacts/RecordingsHeroFit";
import SolutionSection from "@/components/home-2026/SolutionSection";

// TEMP verification-only route for the Recordings feature-page artifacts.
// Renders each recording scene in the feature panel frame (left-anchored, right
// edge clipped) and, for the hero tabs, the hero product-window frame (fully
// visible, centred), plus the "record it → pinned as a comment" Solution
// illustration. Reload to replay the animations.
const FEATURE_WIDTH = 631;
const FEATURE_HEIGHT = 602;
const HERO_WIDTH = 1180;
const HERO_HEIGHT = 578;

/** Every feature-panel scene (the tabs across the three blocks). */
const FEATURE_SCENES: readonly {
  id: string;
  label: string;
  render: () => ReactNode;
}[] = [
  {
    id: "feat-screen",
    label: "recordings-screen - Screen recordings",
    render: () => <RecordingsScreenArtifact />,
  },
  {
    id: "feat-camera",
    label: "recordings-camera - Camera video",
    render: () => <RecordingsCameraArtifact />,
  },
  {
    id: "feat-voice",
    label: "recordings-voice - Voice notes",
    render: () => <RecordingsVoiceArtifact />,
  },
  {
    id: "feat-pinned",
    label: "recordings-pinned - A pinned comment",
    render: () => <RecordingsPinnedArtifact />,
  },
  {
    id: "feat-composer",
    label: "recordings-composer - No separate app (record from toolbar)",
    render: () => <RecordingsComposerArtifact />,
  },
  {
    id: "feat-client",
    label: "recordings-client - Client playback from the link",
    render: () => <RecordingsClientArtifact />,
  },
  {
    id: "feat-thread",
    label: "recordings-thread - Recordings in threads",
    render: () => <RecordingsThreadArtifact />,
  },
];

/** The five hero tabs (fully visible, centred). */
const HERO_SCENES: readonly {
  id: string;
  label: string;
  render: () => ReactNode;
}[] = [
  {
    id: "hero-screen",
    label: "Record the screen",
    render: () => <HeroRecordingsScreenArtifact />,
  },
  {
    id: "hero-voice",
    label: "Say it in voice",
    render: () => <HeroRecordingsVoiceArtifact />,
  },
  {
    id: "hero-camera",
    label: "On camera",
    render: () => <HeroRecordingsCameraArtifact />,
  },
  {
    id: "hero-pinned",
    label: "It's a comment",
    render: () => <HeroRecordingsPinnedArtifact />,
  },
  {
    id: "hero-client",
    label: "The client watches",
    render: () => <HeroRecordingsClientArtifact />,
  },
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
  frameId,
  label,
  width,
  height,
  children,
}: {
  frameId: string;
  label: string;
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ font: "600 12px system-ui", margin: "0 0 6px", color: "#333" }}>
        {label}
      </p>
      <div
        id={frameId}
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
 * Preview page rendering every Recordings artifact.
 *
 * @returns The preview grid.
 */
export default function RecordingsArtifactsPreviewPage() {
  return (
    <div style={{ padding: 24, background: "#e7e7ea" }}>
      <h2 style={{ font: "700 16px system-ui", margin: "0 0 16px" }}>
        Feature panel (631px visible, left-anchored)
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {FEATURE_SCENES.map(({ id, label, render }) => (
          <Frame
            key={id}
            frameId={id}
            label={label}
            width={FEATURE_WIDTH}
            height={FEATURE_HEIGHT}
          >
            {render()}
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 16px" }}>
        Hero product window (fully visible, centred)
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {HERO_SCENES.map(({ id, label, render }) => (
          <Frame
            key={id}
            frameId={id}
            label={label}
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
          >
            {render()}
          </Frame>
        ))}
      </div>

      <h2 style={{ font: "700 16px system-ui", margin: "28px 0 8px" }}>
        Solution section (variant=&quot;recordings&quot;)
      </h2>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
        <SolutionSection variant="recordings" />
      </div>
    </div>
  );
}
