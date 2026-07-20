import type { CSSProperties, ComponentType } from "react";
import styles from "./SectionArtifact.module.css";
import type { SectionArtifactKey } from "@/lib/section-artifacts";
import PinnedCommentsArtifact from "@/components/home-2026/feature-artifacts/PinnedCommentsArtifact";
import AutoScreenshotArtifact from "@/components/home-2026/feature-artifacts/AutoScreenshotArtifact";
import BehindLoginArtifact from "@/components/home-2026/feature-artifacts/BehindLoginArtifact";
import AllDevicesArtifact from "@/components/home-2026/feature-artifacts/AllDevicesArtifact";
import KanbanArtifact from "@/components/home-2026/feature-artifacts/KanbanArtifact";
import WorkflowArtifact from "@/components/home-2026/feature-artifacts/WorkflowArtifact";
import VersioningArtifact from "@/components/home-2026/feature-artifacts/VersioningArtifact";
import LiveSiteArtifact from "@/components/home-2026/feature-artifacts/LiveSiteArtifact";
import RecordWalkthroughArtifact from "@/components/home-2026/feature-artifacts/RecordWalkthroughArtifact";
import AskAiArtifact from "@/components/home-2026/feature-artifacts/AskAiArtifact";
import { AnalyticsInsightsArtifact } from "@/components/home-2026/feature-artifacts/AnalyticsArtifact";
import { ClientReviewApproveArtifact } from "@/components/home-2026/feature-artifacts/ClientReviewArtifact";
import {
  AttachmentCommentsArtifact,
  MentionsCommentsArtifact,
  ReactionReadReceiptArtifact,
  TextCommentsArtifact,
  ThreadCommentsArtifact,
  TrackingTaskManagementArtifact,
} from "@/components/home-2026/feature-artifacts/CommentsFeatureArtifacts";
import {
  ReviewAgentsArtifact,
  PrivateArtifact,
  GuestModeArtifact,
  IntegrationsArtifact,
} from "@/components/home-2026/feature-artifacts/HeroArtifactFit";

/** Fallback height ÷ width ratio when a caller passes a falsy aspect. */
const DEFAULT_ASPECT = 3 / 4;

/**
 * Curated key → component registry. Every entry is a feature-panel mock (the
 * same contract as `MOCKS` in `FeatureSetBlock.tsx`: fills a left-anchored
 * 1204 × 602 white canvas), imported directly so this shared module does not
 * pull the whole feature-set block into the section pages.
 */
const SECTION_ARTIFACTS: Record<SectionArtifactKey, ComponentType> = {
  "pinned-comments": PinnedCommentsArtifact,
  "text-comments": TextCommentsArtifact,
  "thread-comments": ThreadCommentsArtifact,
  "tracking-task-management": TrackingTaskManagementArtifact,
  "comment-mentions": MentionsCommentsArtifact,
  "reaction-read-receipt": ReactionReadReceiptArtifact,
  "comment-attachment": AttachmentCommentsArtifact,
  "record-walkthrough": RecordWalkthroughArtifact,
  "all-devices": AllDevicesArtifact,
  kanban: KanbanArtifact,
  integrations: IntegrationsArtifact,
  "guest-mode": GuestModeArtifact,
  "review-agents": ReviewAgentsArtifact,
  "private-comments": PrivateArtifact,
  "auto-screenshot": AutoScreenshotArtifact,
  "client-review-approve": ClientReviewApproveArtifact,
  versioning: VersioningArtifact,
  "live-site": LiveSiteArtifact,
  "behind-login": BehindLoginArtifact,
  workflows: WorkflowArtifact,
  "ask-ai": AskAiArtifact,
  "analytics-insights": AnalyticsInsightsArtifact,
};

/** CSS custom properties carrying the frame's geometry into the module. */
interface SectionArtifactStyle extends CSSProperties {
  "--sa-aspect": string;
}

/** Props for {@link SectionArtifact}. */
export interface SectionArtifactProps {
  /** Which curated artifact to render (see `lib/section-artifacts.ts`). */
  artifact: SectionArtifactKey;
  /**
   * The host media box's height ÷ width ratio (e.g. `3 / 4` for a 4:3 frame).
   * The artifact canvas is scaled so its height fills the box and its
   * left-anchored content shows, with the right edge cropping away — the same
   * clipping idiom as the home feature panel.
   */
  aspect: number;
}

/**
 * Renders one of the hand-built home-2026 product artifacts inside a section
 * media box (a use-case solution row, persona feature row, or problem card),
 * replacing the blurry Framer bitmap the CMS carries.
 *
 * The artifact draws on its native 1204 × 602 canvas, scaled down with the
 * stepped container-query technique the home hero artifacts use (see
 * `IntegrationsHubHeroArtifact.module.css`), left-anchored and vertically
 * centered so the box crops the canvas's right-edge bleed. Purely decorative:
 * hidden from the accessibility tree and inert to the pointer.
 *
 * @param props - The artifact key and the host box's aspect ratio.
 * @returns The framed artifact, or `null` for unknown keys / failures.
 */
export default function SectionArtifact({
  artifact,
  aspect,
}: SectionArtifactProps) {
  try {
    const ArtifactContent = SECTION_ARTIFACTS[artifact];
    if (!ArtifactContent) {
      return null;
    }

    const frameStyle: SectionArtifactStyle = {
      "--sa-aspect": String(aspect || DEFAULT_ASPECT),
    };

    return (
      <div
        className={styles.frame}
        style={frameStyle}
        data-section-artifact={artifact}
        aria-hidden="true"
      >
        <div className={styles.canvas}>
          <ArtifactContent />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
