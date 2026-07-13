import type { ComponentType } from "react";
import AgentsAtWorkArtifact from "./AgentsAtWorkArtifact";
import BuildAgentsArtifact from "./BuildAgentsArtifact";
import BuiltInChecksArtifact from "./BuiltInChecksArtifact";
import GuestModeArtifact from "./GuestModeArtifact";
import PrivateCommentArtifact from "./PrivateCommentArtifact";
import IntegrationsArtifact from "./IntegrationsArtifact";
import RunOnDemandArtifact from "./RunOnDemandArtifact";
import MemoryUploadArtifact from "./MemoryUploadArtifact";
import AppliedToNextAssetArtifact from "./AppliedToNextAssetArtifact";
import {
  HeroClientMemoryArtifact,
  HeroAskAiArtifact,
  HeroMemoryProactiveArtifact,
} from "./MemoryHeroFit";
import {
  HeroAskAiPerClientArtifact,
  HeroAskAiCrossProjectArtifact,
  HeroAskAiAnalyticsArtifact,
  HeroAskAiOpsSignalsArtifact,
} from "./AskAiHeroFit";
import {
  HeroAnalyticsInsightsArtifact,
  HeroAnalyticsActArtifact,
  HeroAnalyticsCustomersArtifact,
  HeroAnalyticsTeamArtifact,
  HeroAnalyticsForMeArtifact,
} from "./AnalyticsHeroFit";
import {
  HeroClientReviewMagicLinkArtifact,
  HeroClientReviewPhoneArtifact,
} from "./ClientReviewHeroFit";
import {
  HeroPrivateTeamThreadArtifact,
  HeroPrivateJustYouArtifact,
  HeroPrivateClientViewArtifact,
} from "./PrivateCommentsHeroFit";
import {
  HeroWhiteLabelToolbarArtifact,
  HeroWhiteLabelPortalArtifact,
  HeroWhiteLabelSettingsArtifact,
} from "./WhiteLabelHeroFit";
import {
  HeroKanbanBoardArtifact,
  HeroKanbanSelfMovingArtifact,
  HeroKanbanCustomStatusesArtifact,
  HeroKanbanFiltersArtifact,
} from "./KanbanHeroFit";
import {
  HeroReviewWorkflowSampleArtifact,
  HeroReviewWorkflowPushArtifact,
  HeroReviewWorkflowBuilderArtifact,
  HeroReviewWorkflowConditionArtifact,
  HeroReviewWorkflowGateArtifact,
} from "./ReviewWorkflowHeroFit";
import {
  HeroAuthBehindPasswordArtifact,
  HeroAuthBehindOktaArtifact,
  HeroAuthBehindSsoArtifact,
  HeroAuthClientPortalArtifact,
} from "./AuthenticatedPagesHeroFit";
import {
  HeroScreenshotCaptureArtifact,
  HeroScreenshotThenAndNowArtifact,
  HeroScreenshotBehindPasswordArtifact,
  HeroScreenshotClientViewArtifact,
} from "./ScreenshotsHeroFit";
import {
  HeroCarryTheContextArtifact,
  HeroPinAnElementArtifact,
  HeroSelectTheWordsArtifact,
  HeroThreadItArtifact,
  HeroTrackItArtifact,
} from "./CommentsHeroFit";
import {
  HeroRecordingsScreenArtifact,
  HeroRecordingsVoiceArtifact,
  HeroRecordingsCameraArtifact,
  HeroRecordingsPinnedArtifact,
  HeroRecordingsClientArtifact,
} from "./RecordingsHeroFit";

/**
 * Registry of per-tab hero artifacts, keyed by the tab `id` (see `HOME_TABS`
 * and `COMMENTS_TABS` in {@link HeroWorkflowShowcase}, plus the CMS-derived tab
 * slugs). When the active tab id is present here, its artifact renders inside
 * the shared black window frame; otherwise the showcase falls back to its
 * generic workflow window (used by tab presets whose ids are not in this map).
 *
 * The homepage artifacts each own a bespoke file (+ CSS module); the comments
 * hero tabs instead reuse the feature-section comment artifacts verbatim,
 * fitted to the hero window via `CommentsHeroFit` (single source of truth).
 */
export const HERO_ARTIFACTS: Readonly<Record<string, ComponentType>> = {
  "qa-workflow": AgentsAtWorkArtifact,
  agents: BuildAgentsArtifact,
  "anonymous-login": GuestModeArtifact,
  "private-comment": PrivateCommentArtifact,
  integrations: IntegrationsArtifact,
  // Comments feature page tabs (COMMENTS_TABS ids / CMS "comments" showcase).
  "pin-an-element": HeroPinAnElementArtifact,
  "select-the-words": HeroSelectTheWordsArtifact,
  "thread-it": HeroThreadItArtifact,
  "carry-the-context": HeroCarryTheContextArtifact,
  "track-it": HeroTrackItArtifact,
  // Review Agents feature page tabs (REVIEW_AGENTS_TABS ids / CMS
  // "review-agents" showcase). Reuse existing hero artifacts verbatim, plus the
  // bespoke Built-in checks agents screen and the Run on Demand run screen.
  "build-from-checklist": BuildAgentsArtifact,
  "built-in-checks": BuiltInChecksArtifact,
  "findings-as-comments": AgentsAtWorkArtifact,
  "run-on-demand": RunOnDemandArtifact,
  "human-signs-off": HeroTrackItArtifact,
  // Memory feature page tabs (CMS "memory" hero.tabs slugs). "Learned from
  // reviews" reuses the homepage "memory" feature artifact, "Powers Ask AI"
  // reuses the homepage "ask-ai" feature artifact, and "Proactive suggestions"
  // reuses the "Pinned Comments" artifact with a Superflow Memory agent comment;
  // "Applied to the next asset" and "Upload once" are bespoke windows.
  "upload-once": MemoryUploadArtifact,
  "learned-from-reviews": HeroClientMemoryArtifact,
  "applied-to-the-next-asset": AppliedToNextAssetArtifact,
  "proactive-suggestions": HeroMemoryProactiveArtifact,
  "powers-ask-ai": HeroAskAiArtifact,
  // Ask AI feature page hero tabs (CMS "ask-ai" hero.tabs slugs). Each reuses
  // the variant-driven Ask AI feature artifact fitted to the hero window; the
  // default "Ask the review history" tab reuses the copy-issues breakdown.
  "ask-the-review-history": HeroAskAiArtifact,
  "per-client": HeroAskAiPerClientArtifact,
  "cross-project": HeroAskAiCrossProjectArtifact,
  "analytics-on-demand": HeroAskAiAnalyticsArtifact,
  "ops-signals": HeroAskAiOpsSignalsArtifact,
  // Analytics feature page hero tabs (CMS "analytics" hero.tabs slugs). Each
  // reuses the variant-driven Analytics feature artifact fitted to the hero
  // window; "The week's insights" leads with the curated insight feed (star).
  "the-week-s-insights": HeroAnalyticsInsightsArtifact,
  "act-on-one": HeroAnalyticsActArtifact,
  customers: HeroAnalyticsCustomersArtifact,
  team: HeroAnalyticsTeamArtifact,
  "for-me": HeroAnalyticsForMeArtifact,
  // Client Review feature page hero tabs (CMS "workflow" showcase + hero.tabs
  // slugs). The client-facing beats use the phone-framed Client Review artifact;
  // "Phone view" reuses All Devices; "No-account flow" and "Private threads"
  // reuse the existing Guest Mode / Private Comment hero artifacts.
  "magic-link": HeroClientReviewMagicLinkArtifact,
  "phone-view": HeroClientReviewPhoneArtifact,
  "no-account-flow": GuestModeArtifact,
  "private-threads": PrivateCommentArtifact,
  // Private Comments feature page hero tabs (CMS "private-comments" hero.tabs
  // slugs). Each reuses the variant-driven Private Comment artifact fitted to
  // the hero window: the team-private thread, a just-you note (chip reads
  // "Only you") and the client's clean view where the private thread vanishes.
  "team-private-thread": HeroPrivateTeamThreadArtifact,
  "just-you-notes": HeroPrivateJustYouArtifact,
  "the-client-s-view": HeroPrivateClientViewArtifact,
};

/**
 * Page-scoped hero-artifact overrides, keyed by a page scope then the tab id.
 * A scope's map is consulted before the global {@link HERO_ARTIFACTS} (see
 * {@link HeroWorkflowShowcase}), so a page can bind a bespoke artifact to a tab
 * id that already exists globally.
 *
 * White-label is the first such page: its "The client's view" hero tab
 * slugifies to `the-client-s-view`, the same id the private-comments page's
 * client-view hero already claims globally. Scoping the three white-label hero
 * artifacts here disambiguates them without changing either page's CMS labels.
 */
export const SCOPED_HERO_ARTIFACTS: Readonly<
  Record<string, Readonly<Record<string, ComponentType>>>
> = {
  "white-label": {
    "the-client-s-view": HeroWhiteLabelToolbarArtifact,
    "the-admin-panel": HeroWhiteLabelPortalArtifact,
    "one-upload": HeroWhiteLabelSettingsArtifact,
  },
  // Kanban Board hero tabs. The labels ("The board", "Custom statuses",
  // "Filters", …) slugify to generic ids, so they're scoped to this page rather
  // than registered globally. "Yours, not ours" reuses the Integrations hero
  // artifact (the two-way sync / connected-board story).
  "kanban-board": {
    "the-board": HeroKanbanBoardArtifact,
    "it-moves-itself": HeroKanbanSelfMovingArtifact,
    "custom-statuses": HeroKanbanCustomStatusesArtifact,
    "yours-not-ours": IntegrationsArtifact,
    filters: HeroKanbanFiltersArtifact,
  },
  // Review Workflows hero tabs. The labels ("The sample flow", "Build a step",
  // "Set a condition", …) slugify to generic ids, so they're scoped to this
  // page rather than registered globally. Each reuses the variant-driven
  // ReviewWorkflowArtifact fitted to the hero window.
  "review-workflows": {
    "the-sample-flow": HeroReviewWorkflowSampleArtifact,
    "triggered-by-a-push": HeroReviewWorkflowPushArtifact,
    "build-a-step": HeroReviewWorkflowBuilderArtifact,
    "set-a-condition": HeroReviewWorkflowConditionArtifact,
    "the-client-gate": HeroReviewWorkflowGateArtifact,
  },
  // Authenticated Pages hero tabs. The labels ("Behind a password", "Behind
  // Okta", …) slugify to generic ids, so they're scoped to this page rather than
  // registered globally. Each reuses the variant-driven AuthenticatedPagesArtifact
  // fitted to the hero window.
  "authenticated-pages": {
    "behind-a-password": HeroAuthBehindPasswordArtifact,
    "behind-okta": HeroAuthBehindOktaArtifact,
    "behind-sso": HeroAuthBehindSsoArtifact,
    "the-client-s-own-portal": HeroAuthClientPortalArtifact,
  },
  // Screenshots hero tabs. "Comment, snapshot saved" / "The page changed" /
  // "The client's view" slugify to generic ids (and "the-client-s-view"
  // collides with the private-comments client view claimed globally), so they
  // are scoped to this page. Each reuses the variant-driven ScreenshotArtifact
  // fitted to the hero window; "Behind a password" reuses the Authenticated
  // Pages behind-password gate.
  screenshots: {
    "comment-snapshot-saved": HeroScreenshotCaptureArtifact,
    "the-page-changed": HeroScreenshotThenAndNowArtifact,
    "behind-a-password": HeroScreenshotBehindPasswordArtifact,
    "the-client-s-view": HeroScreenshotClientViewArtifact,
  },
  // Recordings hero tabs. The labels ("Record the screen", "Say it in voice",
  // …) slugify to generic ids, so they're scoped to this page. The four
  // page-based beats reuse the RecordingsArtifacts scenes fitted to the hero
  // window; "The client watches" renders the phone centred (no chrome band).
  recordings: {
    "record-the-screen": HeroRecordingsScreenArtifact,
    "say-it-in-voice": HeroRecordingsVoiceArtifact,
    "on-camera": HeroRecordingsCameraArtifact,
    "it-s-a-comment": HeroRecordingsPinnedArtifact,
    "the-client-watches": HeroRecordingsClientArtifact,
  },
};
