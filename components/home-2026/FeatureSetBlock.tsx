"use client";

import { useState, type CSSProperties } from "react";
import styles from "./FeatureSet.module.css";
import { FeatureSetIcon, type FeatureSetIconName } from "./FeatureSetIcons";
import { FeatureSetWorkflowMock } from "./FeatureSetMocks";
import ClientMemoryArtifact from "./feature-artifacts/ClientMemoryArtifact";
import MemoryLearningArtifact from "./feature-artifacts/MemoryLearningArtifact";
import MemoryUploadScanArtifact from "./feature-artifacts/MemoryUploadScanArtifact";
import MemoryPerClientArtifact from "./feature-artifacts/MemoryPerClientArtifact";
import MemoryScopedThreeArtifact from "./feature-artifacts/MemoryScopedThreeArtifact";
import AskAiArtifact, {
  AskAiCitedArtifact,
  AskAiPerClientArtifact,
  AskAiCopyVsBugArtifact,
  AskAiCrossProjectArtifact,
  AskAiLoadByTeamArtifact,
  AskAiDelayChurnArtifact,
  AskAiOpsSignalsArtifact,
  AskAiAnalyticsArtifact,
} from "./feature-artifacts/AskAiArtifact";
import {
  AnalyticsOverviewArtifact,
  AnalyticsInsightsArtifact,
  AnalyticsActArtifact,
  AnalyticsInterpretationArtifact,
  AnalyticsCustomersArtifact,
  AnalyticsTeamArtifact,
  AnalyticsForMeArtifact,
  AnalyticsPinDismissArtifact,
  AnalyticsFiltersArtifact,
} from "./feature-artifacts/AnalyticsArtifact";
import {
  ClientReviewMagicLinkArtifact,
  ClientReviewCleanedUpArtifact,
  ClientReviewApproveArtifact,
} from "./feature-artifacts/ClientReviewArtifact";
import {
  PrivateTeamThreadArtifact,
  PrivateJustYouArtifact,
  PrivateClientViewArtifact,
  PrivateSideBySideArtifact,
  PrivateScopeMarksArtifact,
  PrivateOneAnswerArtifact,
  PrivateScopeNotificationsArtifact,
} from "./hero-artifacts/PrivateCommentArtifact";
import {
  WhiteLabelSettingsArtifact,
  WhiteLabelToolbarArtifact,
  WhiteLabelPortalArtifact,
  WhiteLabelAgentFindingsArtifact,
} from "./feature-artifacts/WhiteLabelArtifact";
import {
  AuthBehindPasswordArtifact,
  AuthBehindOktaArtifact,
  AuthBehindSsoArtifact,
  AuthClientPortalArtifact,
  AuthOnSiteArtifact,
  AuthTypesArtifact,
} from "./feature-artifacts/AuthenticatedPagesArtifact";
import PinnedCommentsArtifact from "./feature-artifacts/PinnedCommentsArtifact";
import AutoScreenshotArtifact from "./feature-artifacts/AutoScreenshotArtifact";
import {
  ScreenshotCaptureArtifact,
  ScreenshotNoExtensionArtifact,
  ScreenshotThenAndNowArtifact,
  ScreenshotFullPageArtifact,
  ScreenshotClientViewArtifact,
  ScreenshotRecordArtifact,
} from "./feature-artifacts/ScreenshotArtifact";
import BehindLoginArtifact from "./feature-artifacts/BehindLoginArtifact";
import AllDevicesArtifact from "./feature-artifacts/AllDevicesArtifact";
import WebhooksArtifact from "./feature-artifacts/WebhooksArtifact";
import KanbanArtifact, {
  KanbanCrossClientArtifact,
  KanbanSelfMovingArtifact,
  KanbanFiltersArtifact,
  KanbanCustomColumnsArtifact,
} from "./feature-artifacts/KanbanArtifact";
import CustomStatusArtifact from "./feature-artifacts/CustomStatusArtifact";
import WorkflowArtifact from "./feature-artifacts/WorkflowArtifact";
import {
  ReviewWorkflowSampleArtifact,
  ReviewWorkflowPushArtifact,
  ReviewWorkflowBuilderArtifact,
  ReviewWorkflowConditionArtifact,
  ReviewWorkflowParallelArtifact,
  ReviewWorkflowEscalationArtifact,
  ReviewWorkflowGateArtifact,
  ReviewWorkflowNotificationsArtifact,
  ReviewWorkflowOneFlowArtifact,
} from "./feature-artifacts/ReviewWorkflowArtifact";
import VersioningArtifact from "./feature-artifacts/VersioningArtifact";
import LiveSiteArtifact from "./feature-artifacts/LiveSiteArtifact";
import RecordWalkthroughArtifact from "./feature-artifacts/RecordWalkthroughArtifact";
import {
  RecordingsScreenArtifact,
  RecordingsCameraArtifact,
  RecordingsVoiceArtifact,
  RecordingsPinnedArtifact,
  RecordingsComposerArtifact,
  RecordingsClientArtifact,
  RecordingsThreadArtifact,
} from "./feature-artifacts/RecordingsArtifacts";
import AgentFindingArtifact from "./feature-artifacts/AgentFindingArtifact";
import ReviewAgentsMemoryArtifact from "./feature-artifacts/ReviewAgentsMemoryArtifact";
import ValidateFixesArtifact from "./feature-artifacts/ValidateFixesArtifact";
import CustomAgentArtifact, {
  CustomAgentTestArtifact,
} from "./feature-artifacts/CustomAgentArtifact";
import {
  AttachmentCommentsArtifact,
  MentionsCommentsArtifact,
  ReactionReadReceiptArtifact,
  RobustAnchorArtifact,
  TextCommentsArtifact,
  ThreadCommentsArtifact,
  TrackingTaskManagementArtifact,
} from "./feature-artifacts/CommentsFeatureArtifacts";
// Feature tabs with a hero-section equivalent reuse the hero artifact verbatim
// (sized to the feature panel) instead of a standalone feature duplicate.
import {
  ReviewAgentsArtifact,
  RunOnDemandArtifact,
  BuiltInChecksArtifact,
  PrivateArtifact,
  GuestModeArtifact,
  IntegrationsArtifact,
  AppliedNextAssetArtifact,
} from "./feature-artifacts/HeroArtifactFit";

const FEATURES_LABEL = "Features that help";

/** App-window mock variants available to a block, keyed by config name. */
const MOCKS = {
  workflow: FeatureSetWorkflowMock,
  "review-agents": ReviewAgentsArtifact,
  "review-agents-memory": ReviewAgentsMemoryArtifact,
  "run-on-demand": RunOnDemandArtifact,
  "built-in-checks": BuiltInChecksArtifact,
  "custom-agent": CustomAgentArtifact,
  "custom-agent-test": CustomAgentTestArtifact,
  "client-memory": ClientMemoryArtifact,
  "memory-learning": MemoryLearningArtifact,
  "memory-upload-scan": MemoryUploadScanArtifact,
  "memory-per-client": MemoryPerClientArtifact,
  "memory-scoped-three": MemoryScopedThreeArtifact,
  "applied-next-asset": AppliedNextAssetArtifact,
  "ask-ai": AskAiArtifact,
  "ask-ai-cited": AskAiCitedArtifact,
  "ask-ai-per-client": AskAiPerClientArtifact,
  "ask-ai-copy-vs-bug": AskAiCopyVsBugArtifact,
  "ask-ai-cross-project": AskAiCrossProjectArtifact,
  "ask-ai-load-by-team": AskAiLoadByTeamArtifact,
  "ask-ai-delay-churn": AskAiDelayChurnArtifact,
  "ask-ai-ops-signals": AskAiOpsSignalsArtifact,
  "ask-ai-analytics": AskAiAnalyticsArtifact,
  "analytics-overview": AnalyticsOverviewArtifact,
  "analytics-insights": AnalyticsInsightsArtifact,
  "analytics-act": AnalyticsActArtifact,
  "analytics-interpretation": AnalyticsInterpretationArtifact,
  "analytics-customers": AnalyticsCustomersArtifact,
  "analytics-team": AnalyticsTeamArtifact,
  "analytics-for-me": AnalyticsForMeArtifact,
  "analytics-pin-dismiss": AnalyticsPinDismissArtifact,
  "analytics-filters": AnalyticsFiltersArtifact,
  "client-review-magic-link": ClientReviewMagicLinkArtifact,
  "client-review-cleaned-up": ClientReviewCleanedUpArtifact,
  "client-review-approve": ClientReviewApproveArtifact,
  "pinned-comments": PinnedCommentsArtifact,
  "agent-finding": AgentFindingArtifact,
  "validate-fixes": ValidateFixesArtifact,
  "auto-screenshot": AutoScreenshotArtifact,
  "screenshot-capture": ScreenshotCaptureArtifact,
  "screenshot-no-extension": ScreenshotNoExtensionArtifact,
  "screenshot-then-and-now": ScreenshotThenAndNowArtifact,
  "screenshot-full-page": ScreenshotFullPageArtifact,
  "screenshot-client-view": ScreenshotClientViewArtifact,
  "screenshot-record": ScreenshotRecordArtifact,
  "private-comments": PrivateArtifact,
  "private-team-thread": PrivateTeamThreadArtifact,
  "private-just-you": PrivateJustYouArtifact,
  "private-client-view": PrivateClientViewArtifact,
  "private-side-by-side": PrivateSideBySideArtifact,
  "private-scope-marks": PrivateScopeMarksArtifact,
  "private-one-answer": PrivateOneAnswerArtifact,
  "private-scope-notifications": PrivateScopeNotificationsArtifact,
  "white-label-settings": WhiteLabelSettingsArtifact,
  "white-label-toolbar": WhiteLabelToolbarArtifact,
  "white-label-portal": WhiteLabelPortalArtifact,
  "white-label-agent-findings": WhiteLabelAgentFindingsArtifact,
  "guest-mode": GuestModeArtifact,
  "behind-login": BehindLoginArtifact,
  "auth-behind-password": AuthBehindPasswordArtifact,
  "auth-behind-okta": AuthBehindOktaArtifact,
  "auth-behind-sso": AuthBehindSsoArtifact,
  "auth-client-portal": AuthClientPortalArtifact,
  "auth-on-site": AuthOnSiteArtifact,
  "auth-types": AuthTypesArtifact,
  "all-devices": AllDevicesArtifact,
  webhooks: WebhooksArtifact,
  kanban: KanbanArtifact,
  "kanban-cross-client": KanbanCrossClientArtifact,
  "kanban-self-moving": KanbanSelfMovingArtifact,
  "kanban-filters": KanbanFiltersArtifact,
  "kanban-custom-columns": KanbanCustomColumnsArtifact,
  integrations: IntegrationsArtifact,
  "custom-statuses": CustomStatusArtifact,
  workflows: WorkflowArtifact,
  "flow-sample": ReviewWorkflowSampleArtifact,
  "flow-push": ReviewWorkflowPushArtifact,
  "flow-build": ReviewWorkflowBuilderArtifact,
  "flow-condition": ReviewWorkflowConditionArtifact,
  "flow-parallel": ReviewWorkflowParallelArtifact,
  "flow-escalation": ReviewWorkflowEscalationArtifact,
  "flow-gate": ReviewWorkflowGateArtifact,
  "flow-notifications": ReviewWorkflowNotificationsArtifact,
  "flow-one-flow": ReviewWorkflowOneFlowArtifact,
  versioning: VersioningArtifact,
  "live-site": LiveSiteArtifact,
  "record-walkthrough": RecordWalkthroughArtifact,
  "recordings-screen": RecordingsScreenArtifact,
  "recordings-camera": RecordingsCameraArtifact,
  "recordings-voice": RecordingsVoiceArtifact,
  "recordings-pinned": RecordingsPinnedArtifact,
  "recordings-composer": RecordingsComposerArtifact,
  "recordings-client": RecordingsClientArtifact,
  "recordings-thread": RecordingsThreadArtifact,
  "text-comments": TextCommentsArtifact,
  "thread-comments": ThreadCommentsArtifact,
  "tracking-task-management": TrackingTaskManagementArtifact,
  "robust-anchor": RobustAnchorArtifact,
  "comment-attachment": AttachmentCommentsArtifact,
  "comment-mentions": MentionsCommentsArtifact,
  "reaction-read-receipt": ReactionReadReceiptArtifact,
} as const;

/** Name of an app-window mock a block can show inside its white screen. */
export type FeatureSetMockName = keyof typeof MOCKS;

/** A selectable tab on a block's app window. */
export interface FeatureSetTab {
  label: string;
  icon: FeatureSetIconName;
  /** Primary statement line shown in the window header for this view. */
  oneLiner: string;
  /** "Without it…" line naming what you lose without this view. */
  loss: string;
  /**
   * Which app-window mock to render inside the white screen when this tab is
   * active. When omitted, the block-level {@link FeatureSetBlockData.mock} is
   * used, so blocks that share one mock across every tab need not set this.
   */
  mock?: FeatureSetMockName;
  /** Destination for the "Features that help" arrow link (defaults to "#"). */
  href?: string;
  /**
   * When true, the entry appears in the "Features that help" list only — it
   * gets no window tab and does not swap the app window on hover (it is just a
   * link to its own page).
   */
  listOnly?: boolean;
  /**
   * When true, activating this tab collapses the first tab down to icon-only
   * (its label is hidden) to make room in the strip.
   */
  collapsesFirstTab?: boolean;
}

/** Fallback destination when a tab has no dedicated feature page yet. */
const FEATURE_LINK_FALLBACK = "#";

/** Config describing one feature block. */
export interface FeatureSetBlockData {
  id: string;
  /** Brand accent colour (hex); the window frame is this mixed 30% into black. */
  accent: string;
  /** Very light background wash (rgba) layered over the card gradient. */
  tint: string;
  icon: FeatureSetIconName;
  title: string;
  description: string;
  /**
   * All window tabs in order; the first is active by default. These also power
   * the "Features that help" list on the left — hovering a row activates the
   * matching tab, and its arrow links through to that feature's page.
   */
  tabs: FeatureSetTab[];
  /** Index of the initially active tab (defaults to 0). */
  initialTabIndex?: number;
  /** Which app-window mock to render inside the white screen. */
  mock: FeatureSetMockName;
}

interface FeatureSetBlockProps {
  data: FeatureSetBlockData;
}

/** CSS custom properties carrying the per-block accent + tint into the module. */
interface FeatureSetBlockStyle extends CSSProperties {
  "--feature-accent": string;
  "--feature-tint": string;
}

/**
 * Renders one feature block: a text column (icon, heading, description and a
 * "features that help" list) beside a browser-style tabbed app window. The
 * dark active tab merges seamlessly into the window frame; when a non-first
 * tab is selected it sits raised between the light tabs with concave flares
 * on both sides, and the window's top-left corner rounds itself since the
 * active tab no longer occupies it. Tabs are clickable (visual state only —
 * the window mock is shared across tabs). Every per-block variation flows
 * through the config object, so each block is one instance of this component.
 *
 * @param props - The block configuration to render.
 */
export default function FeatureSetBlock({ data }: FeatureSetBlockProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(data?.initialTabIndex ?? 0);

  const blockStyle: FeatureSetBlockStyle = {
    "--feature-accent": data?.accent,
    "--feature-tint": data?.tint,
  };

  const activeTab = data?.tabs?.[activeTabIndex];

  // Prefer the active tab's own mock (so a single block can show a different
  // artifact per tab); fall back to the block-level mock, then the workflow.
  const activeMockName = activeTab?.mock ?? data?.mock;
  const MockContent = MOCKS[activeMockName] ?? FeatureSetWorkflowMock;

  // The active tab can ask the first tab to shrink to icon-only (e.g. Live),
  // freeing horizontal room in the strip.
  const collapseFirstTab = Boolean(activeTab?.collapsesFirstTab);

  const windowClass =
    activeTabIndex === 0
      ? styles.panelWindow
      : `${styles.panelWindow} ${styles.panelWindowRounded}`;

  return (
    <article className={styles.block} style={blockStyle}>
      <div className={styles.blockText}>
        <span className={styles.blockIcon}>
          <FeatureSetIcon name={data?.icon} size={48} />
        </span>
        <h3 className={styles.blockTitle}>{data?.title}</h3>
        <p className={styles.blockDescription}>{data?.description}</p>

        <div className={styles.blockFeatures}>
          <p className={styles.blockFeaturesLabel}>{FEATURES_LABEL}</p>
          <ul className={styles.blockFeatureList}>
            {data?.tabs?.map((tab, tabIndex) => {
              const isActive = !tab.listOnly && tabIndex === activeTabIndex;
              const linkClass = isActive
                ? `${styles.featureLink} ${styles.featureLinkActive}`
                : styles.featureLink;
              // List-only entries don't own a window view, so hovering them
              // shouldn't swap the panel — they're just links.
              const activateTab = tab.listOnly
                ? undefined
                : () => setActiveTabIndex(tabIndex);

              return (
                <li key={tab.label} className={styles.blockFeatureItem}>
                  <a
                    className={linkClass}
                    href={tab.href ?? FEATURE_LINK_FALLBACK}
                    onMouseEnter={activateTab}
                    onFocus={activateTab}
                  >
                    <span className={styles.featureIcon}>
                      <FeatureSetIcon name={tab.icon} size={18} />
                    </span>
                    <span className={styles.featureLabel}>{tab.label}</span>
                    <span className={styles.featureArrow} aria-hidden="true">
                      <FeatureSetIcon name="arrow-right" size={18} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTabs} role="tablist">
          {data?.tabs?.map((tab, tabIndex) => {
            if (tab.listOnly) {
              return null;
            }
            const isActive = tabIndex === activeTabIndex;
            // First tab drops its label when the active tab requests the room.
            const iconOnly = collapseFirstTab && tabIndex === 0 && !isActive;
            const activeClass =
              tabIndex === 0
                ? styles.panelTabActive
                : `${styles.panelTabActive} ${styles.panelTabActiveRaised}`;
            const inactiveClass = iconOnly
              ? `${styles.panelTab} ${styles.panelTabIconOnly}`
              : styles.panelTab;

            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                // Always expose the name: the visible label span is hidden on
                // inactive tabs (desktop `iconOnly` first tab and every inactive
                // tab on mobile), so the button keeps its accessible name here.
                aria-label={tab.label}
                title={iconOnly ? tab.label : undefined}
                className={isActive ? activeClass : inactiveClass}
                onClick={() => setActiveTabIndex(tabIndex)}
                onMouseEnter={() => setActiveTabIndex(tabIndex)}
                onFocus={() => setActiveTabIndex(tabIndex)}
              >
                {isActive ? (
                  <span className={styles.panelTabActiveIcon}>
                    <FeatureSetIcon name={tab.icon} size={16} />
                  </span>
                ) : (
                  <FeatureSetIcon name={tab.icon} size={16} />
                )}
                {iconOnly ? null : (
                  <span className={styles.panelTabLabel}>{tab.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={windowClass}>
          <div className={styles.panelCaption}>
            {/* Keyed by tab so the line remounts and its entrance replays. */}
            <p
              key={activeTab?.label}
              className={`${styles.panelOneLiner} ${styles.panelSwapIn}`}
            >
              {activeTab?.oneLiner}
            </p>
            {/* Loss line hidden for now; re-enable to show the "Without it…" copy.
            <p className={styles.panelLoss}>{activeTab?.loss}</p>
            */}
          </div>
          <div className={styles.panelScreen}>
            <div
              key={activeTabIndex}
              className={`${styles.panelScreenInner} ${styles.panelSwapIn}`}
            >
              <MockContent />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
