// FeaturePageBody — composition for /preview/features/<slug> pages.
//
// Reuses the 2026 homepage sections (components/home-2026/*) as a shared
// template. Section order mirrors /home-preview exactly. Only the Hero, the
// Problem intro, the Feature Set and the FAQ are per-feature (Sanity-driven);
// every other section renders its hard-coded homepage default.

import Hero from "@/components/home-2026/Hero";
import type { HeroCmsTab } from "@/components/home-2026/HeroWorkflowShowcase";
import SolutionSection from "@/components/home-2026/SolutionSection";
import FeatureSet from "@/components/home-2026/FeatureSet";
import type {
  FeatureSetBlockData,
  FeatureSetMockName,
} from "@/components/home-2026/FeatureSetBlock";
import type { FeatureSetIconName } from "@/components/home-2026/FeatureSetIcons";
import GetStarted, {
  type GetStartedNumberedStep,
} from "@/components/home-2026/GetStarted";
import CostSection from "@/components/home-2026/CostSection";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import TrustSection from "@/components/home-2026/TrustSection";
import SolutionsSection from "@/components/home-2026/SolutionsSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import RelatedCapabilities, {
  type RelatedCapabilityItem,
} from "@/components/feature-2026/RelatedCapabilities";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

/** A tab / "features that help" row within a Feature Set block. */
export interface FeaturePageBlockTab {
  label?: string;
  icon?: string;
  oneLiner?: string;
  loss?: string;
  href?: string;
  listOnly?: boolean;
  collapsesFirstTab?: boolean;
  /**
   * Optional per-tab app-window mock. When set, activating this tab swaps the
   * block's window to this artifact (mirrors {@link FeatureSetTab.mock} on the
   * home-2026 blocks); falls back to the block-level {@link FeaturePageBlock.mock}
   * when omitted.
   */
  mock?: string;
}

/** One Feature Set block as returned by getFeaturePageBySlug. */
export interface FeaturePageBlock {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  accent?: string;
  mock?: string;
  initialTabIndex?: number;
  tabs?: FeaturePageBlockTab[] | null;
}

/** Shape returned by getFeaturePageBySlug (all sections optional). */
export interface FeaturePageDoc {
  _id: string;
  title: string;
  slug: string;
  hero?: {
    headlineLines?: string[] | null;
    subhead?: string | null;
    showcase?: "workflow" | "comments" | "review-agents" | null;
    tabs?: { label?: string | null; icon?: string | null }[] | null;
  } | null;
  solution?: {
    heading?: string | null;
    subheading?: string | null;
    variant?:
      | "checklist"
      | "comments"
      | "memory-guidelines"
      | "ask-ai"
      | "analytics"
      | "client-review"
      | "white-label"
      | "kanban"
      | "review-workflows"
      | "authenticated-pages"
      | "screenshots"
      | "recordings"
      | null;
    /**
     * Optional single-glyph override for the section-header cue (e.g. "brain"
     * for the pink Memory brain). Omit to keep the variant's default glyph pair.
     */
    icon?: string | null;
  } | null;
  featureSet?: {
    headerTitle?: string | null;
    journeyStart?: string | null;
    journeyEnd?: string | null;
    blocks?: FeaturePageBlock[] | null;
  } | null;
  getStarted?: {
    heading?: string | null;
    subheading?: string | null;
    steps?:
      | {
          title?: string | null;
          description?: string | null;
          accent?: string | null;
        }[]
      | null;
  } | null;
  relatedCapabilities?: {
    heading?: string | null;
    boundaryLine?: string | null;
    items?:
      | {
          title?: string | null;
          description?: string | null;
          href?: string | null;
          icon?: string | null;
        }[]
      | null;
  } | null;
  faq?: {
    heading?: string | null;
    items?: FaqItem[] | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}

const DEFAULT_BLOCK_ACCENT = "#433df3";
/** Opacity of the light card wash derived from a block's accent colour. */
const BLOCK_TINT_ALPHA = 0.06;
/** Slug of the comments feature page that gets comment-artifact mock mapping. */
const COMMENTS_PAGE_SLUG = "comments";
/** Slug of the Ask AI feature page that gets Ask AI variant mock mapping. */
const ASK_AI_PAGE_SLUG = "ask-ai";
/** Slug of the Analytics feature page that gets analytics variant mock mapping. */
const ANALYTICS_PAGE_SLUG = "analytics";
/** Slug of the Client Review feature page that gets client-review mock mapping. */
const CLIENT_REVIEW_PAGE_SLUG = "client-review";
/** Slug of the Private Comments page that gets private-comments mock mapping. */
const PRIVATE_COMMENTS_PAGE_SLUG = "private-comments";
/** Slug of the White-label page that gets white-label mock mapping. */
const WHITE_LABEL_PAGE_SLUG = "white-label";
/** Slug of the Kanban Board page that gets kanban mock + solution mapping. */
const KANBAN_BOARD_PAGE_SLUG = "kanban-board";
/** Slug of the Review Workflows page that gets flow mock + solution mapping. */
const REVIEW_WORKFLOWS_PAGE_SLUG = "review-workflows";
/** Slug of the Authenticated Pages page that gets auth mock + solution mapping. */
const AUTHENTICATED_PAGES_PAGE_SLUG = "authenticated-pages";
/** Slug of the Screenshots page that gets screenshot mock + solution mapping. */
const SCREENSHOTS_PAGE_SLUG = "screenshots";
/** Slug of the Recordings page that gets recordings mock + solution mapping. */
const RECORDINGS_PAGE_SLUG = "recordings";
/**
 * "Get Started" heading for feature pages. The shared homepage default is
 * "Get Started in a minute"; the feature-page Figma frame uses this variant.
 */
const GET_STARTED_HEADING = "Get started with Agents in a minute";

/** Comments-page tab labels mapped to the best reusable artifact mock. */
const COMMENTS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "text-comments": "text-comments",
  "text-selection-comments": "text-comments",
  "thread-comments": "thread-comments",
  "thread-replies": "thread-comments",
  mentions: "comment-mentions",
  attachment: "comment-attachment",
  attachments: "comment-attachment",
  "tracking-task-management": "tracking-task-management",
  "statuses-assignment": "tracking-task-management",
  "reactions-and-read-receipts": "reaction-read-receipt",
  "reaction-read-receipt": "reaction-read-receipt",
  "robust-anchor": "robust-anchor",
  "robust-anchors": "robust-anchor",
  "record-walkthrough": "record-walkthrough",
  "element-pinning": "pinned-comments",
  "pinned-comments": "pinned-comments",
  "snapshot-on-every-comment": "auto-screenshot",
  "private-scopes": "private-comments",
  "agent-comments": "review-agents",
};

/**
 * Ask AI-page tab labels mapped to their per-tab Ask AI variant mock. Every tab
 * shows the same chat artifact answering a different question with a different
 * answer body (breakdown bar, ranking, pattern list, signal cards or chart).
 * Applied client-side so the variants render without a Sanity re-seed; the seed
 * script carries the same per-tab mocks for anyone who re-seeds the dataset.
 */
const ASK_AI_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "plain-language-questions": "ask-ai",
  "cited-answers": "ask-ai-cited",
  "per-client-answers": "ask-ai-per-client",
  "copy-versus-bug-mix": "ask-ai-copy-vs-bug",
  "cross-project-patterns": "ask-ai-cross-project",
  "review-load-by-team": "ask-ai-load-by-team",
  "delay-and-churn-signals": "ask-ai-delay-churn",
  "analytics-on-demand": "ask-ai-analytics",
};

/**
 * Analytics-page tab labels mapped to their per-tab Analytics variant mock.
 * Every tab shows the same Analytics window rendering a different view — the
 * curated insight feed, the status-chart Overview, per-client / team / personal
 * rollups, or the pin-dismiss / filter interactions. Applied client-side so the
 * variants render without a Sanity re-seed; the seed script carries the same
 * per-tab mocks for anyone who re-seeds the dataset.
 */
const ANALYTICS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "insights-of-the-week": "analytics-insights",
  "interpretation-included": "analytics-interpretation",
  "one-click-actions": "analytics-act",
  "strategic-overview": "analytics-overview",
  customers: "analytics-customers",
  team: "analytics-team",
  "for-me": "analytics-for-me",
  "pin-or-dismiss": "analytics-pin-dismiss",
  "filters-that-re-curate": "analytics-filters",
};

/**
 * Client Review-page tab labels mapped to their per-tab artifact. The new
 * client-facing phone beats (magic link, cleaned-up, approve) plus two beats
 * that reuse shared artifacts rather than staying bare cross-links: "behind a
 * login" → `behind-login` (a password gate that lifts to the review) and "what
 * they never see" → `private-comments` (the internal-only thread). Other
 * team/board beats (no-account flow, click-the-spot, after-the-yes) fall back
 * to the block's explicit or default mock (guest-mode / pinned-comments /
 * kanban). A mapped beat here always renders as a real tab (see
 * {@link toFeatureSetBlock}), even when pre-reseed CMS data still marks it
 * list-only. Applied client-side so the artifacts render without a Sanity
 * re-seed; the seed script carries the same per-tab mocks.
 */
const CLIENT_REVIEW_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "the-magic-link": "client-review-magic-link",
  "cleaned-up-before-they-look": "client-review-cleaned-up",
  "the-approve-button": "client-review-approve",
  "behind-a-login-too": "behind-login",
  "what-they-never-see": "private-comments",
};

/**
 * Private Comments-page tab labels mapped to their per-tab artifact variant.
 * Each of the seven showcase "lifecycle rail" beats renders the variant-driven
 * {@link PrivateCommentArtifact} scene for that beat — the two private scopes,
 * the two beside-the-client-thread beats, the two client-facing beats and the
 * scope-aware notification. A mapped beat here always renders as a real tab
 * (see {@link toFeatureSetBlock}), even when pre-reseed CMS data still marks it
 * list-only. Applied client-side so the artifacts render without a Sanity
 * re-seed; the seed script carries the same per-tab mocks.
 */
const PRIVATE_COMMENTS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "team-private-threads": "private-team-thread",
  "just-you-comments": "private-just-you",
  "side-by-side-threads": "private-side-by-side",
  "unmistakable-scope-marks": "private-scope-marks",
  "a-clean-client-view": "private-client-view",
  "one-settled-answer": "private-one-answer",
  "scope-aware-notifications": "private-scope-notifications",
};

/**
 * White-label-page tab labels mapped to their per-tab artifact variant. The
 * four showcase beats render the variant-driven {@link WhiteLabelArtifact}: the
 * branded client toolbar, the branded admin portal, the Custom Branding upload
 * panel and an AI finding under the agency's brand. A mapped beat here always
 * renders as a real tab (see {@link toFeatureSetBlock}), even when pre-reseed
 * CMS data still marks it list-only. Applied client-side so the artifacts render
 * without a Sanity re-seed; the seed script carries the same per-tab mocks.
 */
const WHITE_LABEL_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "the-toolbar-your-client-sees": "white-label-toolbar",
  "the-admin-panel-your-team-runs": "white-label-portal",
  "one-upload-every-project": "white-label-settings",
  "agent-findings-under-your-brand": "white-label-agent-findings",
};

/**
 * Kanban-board-page tab labels mapped to their per-tab board artifact. The
 * cross-client board, the filter-to-one-client board and the self-moving board
 * each render the variant-driven {@link KanbanArtifact}; the "Custom statuses"
 * tab keeps the existing dedicated custom-statuses artifact and the "Yours,
 * connected" block reuses the Integrations artifact. Applied client-side so the
 * artifacts render without a Sanity re-seed; the seed script carries the same
 * per-tab mocks.
 */
const KANBAN_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "cross-client-board": "kanban-cross-client",
  "filters-by-client-and-project": "kanban-filters",
  "self-moving-cards": "kanban-self-moving",
};

/**
 * Review Workflows-page tab labels mapped to their per-tab flow-builder scene.
 * Every tab renders the variant-driven {@link ReviewWorkflowArtifact} for that
 * beat — the visual builder, the human+agent sample flow, the push trigger, the
 * transition condition, parallel lanes, escalation, the client gate, the
 * step/flow notifications and the one-flow-per-project rollup. Applied
 * client-side so the scenes render without a Sanity re-seed; the seed script
 * carries the same per-tab mocks for anyone who re-seeds the dataset.
 */
const REVIEW_WORKFLOWS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "visual-builder": "flow-build",
  "human-and-agent-steps": "flow-sample",
  "push-triggered-runs": "flow-push",
  conditions: "flow-condition",
  "parallel-steps": "flow-parallel",
  escalation: "flow-escalation",
  "the-client-gate": "flow-gate",
  "step-and-flow-notifications": "flow-notifications",
  "one-flow-every-project": "flow-one-flow",
};

/**
 * Authenticated Pages-page tab labels mapped to their per-tab auth artifact.
 * The feature beats render the variant-driven {@link AuthenticatedPagesArtifact}:
 * the password / Okta / SSO gate lifting to the in-session reviewed page, the
 * on-site snippet (vs a blocked proxy), the works-behind-every-auth-type matrix,
 * and the client reviewing from inside their own portal. The "Snapshots behind
 * the login" tab keeps its explicit `auto-screenshot` CMS mock (explicit values
 * still win). Applied client-side so the artifacts render without a Sanity
 * re-seed; the seed script carries the same per-tab mocks for anyone who
 * re-seeds the dataset.
 */
const AUTHENTICATED_PAGES_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "review-inside-the-login": "auth-behind-password",
  "credential-free-review": "auth-behind-password",
  "staging-behind-basic-auth": "auth-behind-password",
  "one-snippet-for-it": "auth-on-site",
  "password-okta-sso": "auth-types",
  "one-review-process-everywhere": "auth-types",
  "portals-member-areas-intranets": "auth-client-portal",
  "client-review-on-their-own-portal": "auth-client-portal",
};

/**
 * Screenshots-page tab labels mapped to their per-tab screenshot artifact
 * variant. The feature beats render the variant-driven {@link ScreenshotArtifact}:
 * the comment-time capture (snapshot saved), the no-extension capture, the
 * then-and-now page-changed pair (both the lost-anchor and then-and-now beats),
 * the full-page context capture, the client-visible phone snapshot and the
 * approvals review record. The "Password-protected capture" tab keeps its
 * explicit `behind-login` CMS mock (explicit values still win, mirroring the
 * hero's behind-password reuse). Applied client-side so the artifacts render
 * without a Sanity re-seed; the seed script carries the same per-tab mocks for
 * anyone who re-seeds the dataset.
 */
const SCREENSHOTS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "comment-time-capture": "screenshot-capture",
  "no-browser-extension": "screenshot-no-extension",
  "lost-anchor-fallback": "screenshot-then-and-now",
  "then-and-now-view": "screenshot-then-and-now",
  "client-visible-snapshots": "screenshot-client-view",
  "full-page-context": "screenshot-full-page",
  "approvals-with-context": "screenshot-record",
};

/**
 * Recordings-page tab labels mapped to their per-tab recording artifact variant.
 * The three capture beats render the pinned-comment scene carrying the matching
 * clip (a screen walkthrough, a webcam video card or a voice note); "A pinned
 * comment" leads with the same pinned scene, "No separate app" shows the
 * record-from-the-toolbar composer, "Client playback from the link" the mobile
 * client view and "Recordings in threads" a thread of clips. Applied
 * client-side so the artifacts render without a Sanity re-seed; the seed script
 * carries the same per-tab mocks for anyone who re-seeds the dataset.
 */
const RECORDINGS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "screen-recordings": "recordings-screen",
  "camera-video": "recordings-camera",
  "voice-notes": "recordings-voice",
  "a-pinned-comment": "recordings-pinned",
  "no-separate-app": "recordings-composer",
  "client-playback-from-the-link": "recordings-client",
  "recordings-in-threads": "recordings-thread",
};

/** Base path for feature pages (root-served; related-capability link targets). */
const FEATURE_BASE_PATH = "";

/**
 * Canonical link metadata for each related-capability target — title, href and
 * icon — so the per-page tables below only vary the contextual description.
 * Targets without a feature preview page point elsewhere (Integrations → the
 * integrations hub; Trust → the shared /trust route).
 */
const RELATED_TARGETS: Readonly<
  Record<string, { title: string; href: string; icon: FeatureSetIconName }>
> = {
  "client-review": { title: "Client review", href: `${FEATURE_BASE_PATH}/client-review`, icon: "circle-check" },
  "cross-device-review": { title: "Cross-device review", href: `${FEATURE_BASE_PATH}/cross-device-review`, icon: "devices" },
  "review-workflows": { title: "Review workflows", href: `${FEATURE_BASE_PATH}/review-workflows`, icon: "route" },
  "review-agents": { title: "AI review agents", href: `${FEATURE_BASE_PATH}/ai-review-agents`, icon: "robot" },
  screenshots: { title: "Automatic screenshots", href: `${FEATURE_BASE_PATH}/screenshots`, icon: "camera" },
  "kanban-board": { title: "Kanban board", href: `${FEATURE_BASE_PATH}/kanban-board`, icon: "layout-kanban" },
  "ask-ai": { title: "Ask AI", href: `${FEATURE_BASE_PATH}/ask-ai`, icon: "message-chatbot" },
  memory: { title: "Memory", href: `${FEATURE_BASE_PATH}/memory`, icon: "brain" },
  comments: { title: "Comments", href: `${FEATURE_BASE_PATH}/comments`, icon: "message-circle" },
  "private-comments": { title: "Private comments", href: `${FEATURE_BASE_PATH}/private-comments`, icon: "eye-off" },
  "authenticated-pages": { title: "Authenticated pages", href: `${FEATURE_BASE_PATH}/authenticated-pages`, icon: "lock" },
  "white-label": { title: "White-label", href: `${FEATURE_BASE_PATH}/white-label`, icon: "palette" },
  integrations: { title: "Integrations", href: "/integrations", icon: "plug" },
  trust: { title: "Trust", href: "/security", icon: "checks" },
};

/** One item in {@link RELATED_CAPABILITIES_BY_SLUG}, resolved from a target. */
type RelatedCapabilityDocItem = NonNullable<
  NonNullable<FeaturePageDoc["relatedCapabilities"]>["items"]
>[number];

/**
 * Build a related-capability item from a canonical target plus the referencing
 * page's contextual description. The title may be overridden when a spec names
 * the same target differently.
 *
 * @param targetKey - Key into {@link RELATED_TARGETS}.
 * @param description - The one-line, page-specific description.
 * @param titleOverride - Optional title replacing the target's default.
 * @returns The resolved related-capability item.
 */
function relatedItem(
  targetKey: keyof typeof RELATED_TARGETS,
  description: string,
  titleOverride?: string,
): RelatedCapabilityDocItem {
  try {
    const target = RELATED_TARGETS[targetKey];
    return {
      title: titleOverride ?? target.title,
      description,
      href: target.href,
      icon: target.icon,
    };
  } catch {
    return { title: titleOverride ?? "", description, href: "#" };
  }
}

/**
 * Per-page "Related capabilities" (spec §9), keyed by slug. Applied client-side
 * as a fallback so the section renders without a Sanity re-seed; the seed
 * scripts carry the same content for anyone who re-seeds. An explicit CMS value
 * on the doc always wins. Targets that have no preview page (Website review,
 * Audit trail, Reviewer twins) are omitted per the site's cross-link rules.
 */
const RELATED_CAPABILITIES_BY_SLUG: Readonly<
  Record<string, NonNullable<FeaturePageDoc["relatedCapabilities"]>>
> = {
  "client-review": {
    heading: "Related capabilities",
    boundaryLine:
      "Client review covers the no-account sign-off. Cross-device covers where you review.",
    items: [
      relatedItem("cross-device-review", "The phone your client is already holding."),
      relatedItem("review-workflows", "The client gate is one node in the path you design."),
    ],
  },
  "cross-device-review": {
    heading: "Related capabilities",
    boundaryLine:
      "Cross-device covers where you review. Client review covers the no-account sign-off.",
    items: [
      relatedItem("screenshots", "Captures carry the view they were taken on.", "Screenshots"),
      relatedItem("review-agents", "The checklist that runs against both views."),
    ],
  },
  analytics: {
    heading: "Related capabilities",
    items: [
      relatedItem("ask-ai", "Analytics curates the week; Ask AI answers the question you just thought of."),
      relatedItem("kanban-board", "The board shows today's state; Analytics says what the states add up to."),
      relatedItem("review-agents", "The most common one-click action is adding an agent to catch the pattern next time."),
    ],
  },
  recordings: {
    heading: "Related capabilities",
    items: [
      relatedItem("comments", "The primitive every recording lands as — pinning, threads, statuses."),
      relatedItem("private-comments", "Record for your team only; the client's view never shows it."),
      relatedItem("client-review", "The link your client plays it from, no account."),
    ],
  },
  "review-workflows": {
    heading: "Related capabilities",
    items: [
      relatedItem("kanban-board", "The flow's statuses become the board's columns."),
      relatedItem("review-agents", "The agent runs your flow's machine steps."),
      relatedItem("client-review", "The gate at the end of every flow — the no-account link."),
    ],
  },
  "kanban-board": {
    heading: "Related capabilities",
    items: [
      relatedItem("review-workflows", "Where statuses, gates, and escalation rules get defined."),
      relatedItem("integrations", "The full hub behind the two-way sync, webhooks, and the API."),
      relatedItem("review-agents", "The first pass whose findings move cards before anyone looks."),
    ],
  },
  comments: {
    heading: "Related capabilities",
    items: [
      relatedItem("private-comments", "The threads your client never sees."),
      relatedItem("screenshots", "The proof of the page each comment was left on."),
    ],
  },
  "authenticated-pages": {
    heading: "Related capabilities",
    items: [
      relatedItem("screenshots", "The capture that backs every comment, behind the login included."),
      relatedItem("client-review", "The no-account link; here the client is logged into their own system."),
      relatedItem("trust", "Where credentials, SOC 2, and HIPAA get their full answers."),
    ],
  },
  "white-label": {
    heading: "Related capabilities",
    boundaryLine:
      "White-label covers how Superflow looks. Client review covers how your client gets in.",
    items: [
      relatedItem("client-review", "The sign-off moment this page brands."),
      relatedItem("kanban-board", "One of the admin surfaces that carries your logo."),
      relatedItem("trust", "SSO, SOC 2, and the rest of looking like a serious operation."),
    ],
  },
  screenshots: {
    heading: "Related capabilities",
    items: [
      relatedItem("authenticated-pages", "The full behind-login review story."),
      relatedItem("review-agents", "Agents leave findings as comments on the same pages your team snapshots."),
    ],
  },
  "private-comments": {
    heading: "Related capabilities",
    items: [
      relatedItem("client-review", "The client's half — the magic-link path through the clean view private comments protect."),
      relatedItem("review-agents", "The first pass. Findings land as comments on the same elements your threads sit on."),
    ],
  },
  "ask-ai": {
    heading: "Related capabilities",
    items: [
      relatedItem("memory", "The source of every answer — what you upload and what reviews teach it."),
      relatedItem("review-agents", "The checks that write much of the data."),
    ],
  },
  "ai-review-agents": {
    heading: "Related capabilities",
    items: [
      relatedItem("memory", "The agents get sharper because Memory feeds them each client's brand and past decisions."),
      relatedItem("client-review", "Where the human half lives — the no-account link a client signs off with."),
    ],
  },
  memory: {
    heading: "Related capabilities",
    items: [
      relatedItem("review-agents", "The checks Memory makes client-specific."),
      relatedItem("ask-ai", "The questions Memory makes answerable."),
      relatedItem("client-review", "The approvals that teach Memory what each client accepts."),
    ],
  },
};

/** Comments-page block ids mapped to their initially visible artifact mock. */
const COMMENTS_BLOCK_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "block-comment": "text-comments",
  "comment-that-sticks-to-elements": "text-comments",
  "block-conversations": "thread-comments",
  "rich-conversations-with-all-media-types": "thread-comments",
  "block-seen-settled": "reaction-read-receipt",
  "seen-settled": "reaction-read-receipt",
  "block-single-system": "private-comments",
  "single-system": "private-comments",
};

/**
 * Convert arbitrary labels/ids into the slug shape used by the comments mock
 * lookup tables.
 *
 * @param value - The source label or id.
 * @returns A lowercase hyphenated key.
 */
function toLookupKey(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a tab's comments-page artifact mock, preserving explicit CMS values
 * when the label is not one of the known comments artifacts.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key to use, or undefined when no comments mapping applies.
 */
function getCommentsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return COMMENTS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve the best default mock for a comments-page feature block.
 *
 * @param block - The feature block from Sanity.
 * @returns The block-level mock key, or undefined when no comments mapping applies.
 */
function getCommentsBlockMock(
  block: FeaturePageBlock,
): FeatureSetMockName | undefined {
  const idKey = toLookupKey(block?.id);
  const titleKey = toLookupKey(block?.title);
  return COMMENTS_BLOCK_MOCKS?.[idKey] ?? COMMENTS_BLOCK_MOCKS?.[titleKey];
}

/**
 * Resolve a tab's Ask AI variant mock from its label, preserving explicit CMS
 * values when the label is not one of the known Ask AI variants.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The variant mock key, or undefined when no Ask AI mapping applies.
 */
function getAskAiTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return ASK_AI_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Analytics variant mock from its label, preserving explicit
 * CMS values when the label is not one of the known Analytics variants.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The variant mock key, or undefined when no Analytics mapping applies.
 */
function getAnalyticsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return ANALYTICS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Client Review artifact from its label, preserving explicit
 * CMS values when the label is not one of the mapped client-side beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no client-review mapping applies.
 */
function getClientReviewTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return CLIENT_REVIEW_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Private Comments artifact variant from its label, preserving
 * explicit CMS values when the label is not one of the mapped lifecycle beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no private-comments mapping applies.
 */
function getPrivateCommentsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return PRIVATE_COMMENTS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's White-label artifact variant from its label, preserving
 * explicit CMS values when the label is not one of the mapped showcase beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no white-label mapping applies.
 */
function getWhiteLabelTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return WHITE_LABEL_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Kanban-board artifact from its label, preserving explicit CMS
 * values when the label is not one of the mapped board beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no kanban mapping applies.
 */
function getKanbanTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return KANBAN_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Review Workflows flow-builder scene from its label,
 * preserving explicit CMS values when the label is not one of the mapped beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no review-workflows mapping applies.
 */
function getReviewWorkflowsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return REVIEW_WORKFLOWS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Authenticated Pages artifact from its label, preserving
 * explicit CMS values when the label is not one of the mapped auth beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no authenticated-pages mapping applies.
 */
function getAuthenticatedPagesTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return AUTHENTICATED_PAGES_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Screenshots artifact variant from its label, preserving
 * explicit CMS values when the label is not one of the mapped screenshot beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no screenshots mapping applies.
 */
function getScreenshotsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return SCREENSHOTS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve a tab's Recordings artifact variant from its label, preserving
 * explicit CMS values when the label is not one of the mapped recording beats.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key, or undefined when no recordings mapping applies.
 */
function getRecordingsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return RECORDINGS_TAB_MOCKS?.[labelKey];
}

/**
 * Convert a `#rrggbb` (or `#rgb`) hex colour into an `rgba(r, g, b, alpha)`
 * string for the block's light background wash. Falls back to the accent as
 * given when it isn't a parseable hex value.
 *
 * @param hex - The accent colour, ideally `#rrggbb`.
 * @param alpha - Target opacity in the range 0–1.
 */
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex?.trim().replace(/^#/, "") ?? "";
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return hex;
  }

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Map a Sanity Feature Set block onto the `FeatureSetBlockData` shape the
 * shared home-2026 component expects, deriving the tint from the accent and
 * discarding tabs that have no label.
 *
 * @param block - The CMS block.
 * @param index - Its position in the section (used for a stable fallback id).
 */
function toFeatureSetBlock(
  block: FeaturePageBlock,
  index: number,
  pageSlug?: string,
): FeatureSetBlockData {
  const accent = block?.accent ?? DEFAULT_BLOCK_ACCENT;
  const isCommentsPage = pageSlug === COMMENTS_PAGE_SLUG;
  const isAskAiPage = pageSlug === ASK_AI_PAGE_SLUG;
  const isAnalyticsPage = pageSlug === ANALYTICS_PAGE_SLUG;
  const isClientReviewPage = pageSlug === CLIENT_REVIEW_PAGE_SLUG;
  const isPrivateCommentsPage = pageSlug === PRIVATE_COMMENTS_PAGE_SLUG;
  const isWhiteLabelPage = pageSlug === WHITE_LABEL_PAGE_SLUG;
  const isKanbanBoardPage = pageSlug === KANBAN_BOARD_PAGE_SLUG;
  const isReviewWorkflowsPage = pageSlug === REVIEW_WORKFLOWS_PAGE_SLUG;
  const isAuthenticatedPagesPage = pageSlug === AUTHENTICATED_PAGES_PAGE_SLUG;
  const isScreenshotsPage = pageSlug === SCREENSHOTS_PAGE_SLUG;
  const isRecordingsPage = pageSlug === RECORDINGS_PAGE_SLUG;
  const tabs = (block?.tabs ?? [])
    .filter((tab) => Boolean(tab?.label))
    .map((tab) => {
      // Per-page label→mock lookups let a tab swap to its own artifact without
      // the CMS carrying an explicit mock; explicit CMS values still win.
      const clientReviewMock = isClientReviewPage
        ? getClientReviewTabMock(tab)
        : undefined;
      const privateCommentsMock = isPrivateCommentsPage
        ? getPrivateCommentsTabMock(tab)
        : undefined;
      const whiteLabelMock = isWhiteLabelPage
        ? getWhiteLabelTabMock(tab)
        : undefined;
      const reviewWorkflowsMock = isReviewWorkflowsPage
        ? getReviewWorkflowsTabMock(tab)
        : undefined;
      let resolvedMock: FeatureSetMockName | undefined;
      if (isCommentsPage) {
        resolvedMock = getCommentsTabMock(tab) ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isAskAiPage) {
        resolvedMock = getAskAiTabMock(tab) ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isAnalyticsPage) {
        resolvedMock = getAnalyticsTabMock(tab) ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isClientReviewPage) {
        resolvedMock = clientReviewMock ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isPrivateCommentsPage) {
        resolvedMock = privateCommentsMock ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isWhiteLabelPage) {
        resolvedMock = whiteLabelMock ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isKanbanBoardPage) {
        // Explicit CMS mock (e.g. the "Custom statuses" tab's custom-statuses)
        // wins; otherwise the board beats map to their variant.
        resolvedMock =
          (tab.mock as FeatureSetMockName | undefined) ?? getKanbanTabMock(tab);
      } else if (isReviewWorkflowsPage) {
        // The flow-builder scene owns each beat; a mapped label wins over the
        // pre-reseed CMS mock (e.g. the client-gate tab's old guest-mode).
        resolvedMock =
          reviewWorkflowsMock ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isAuthenticatedPagesPage) {
        // Explicit CMS mock (e.g. the Snapshots tab's auto-screenshot) wins;
        // otherwise each auth beat maps to its variant, replacing the block-level
        // behind-login fallback.
        resolvedMock =
          (tab.mock as FeatureSetMockName | undefined) ??
          getAuthenticatedPagesTabMock(tab);
      } else if (isScreenshotsPage) {
        // Explicit CMS mock (e.g. the password tab's behind-login) wins;
        // otherwise each screenshot beat maps to its variant, replacing the
        // block-level auto-screenshot / versioning fallbacks.
        resolvedMock =
          (tab.mock as FeatureSetMockName | undefined) ??
          getScreenshotsTabMock(tab);
      } else if (isRecordingsPage) {
        // Each recording beat maps to its variant; a mapped label wins over the
        // pre-reseed CMS mock (the seed carries a generic "workflow" fallback).
        resolvedMock =
          getRecordingsTabMock(tab) ??
          (tab.mock as FeatureSetMockName | undefined);
      } else {
        resolvedMock = tab.mock as FeatureSetMockName | undefined;
      }
      // A mapped client-review / private-comments / white-label /
      // review-workflows beat always renders as a real tab with its artifact,
      // even when pre-reseed CMS data still marks it list-only.
      const listOnly =
        clientReviewMock ||
        privateCommentsMock ||
        whiteLabelMock ||
        reviewWorkflowsMock
          ? false
          : (tab.listOnly ?? undefined);
      return {
        label: tab.label as string,
        icon: (tab.icon ?? "grain") as FeatureSetIconName,
        oneLiner: tab.oneLiner ?? "",
        loss: tab.loss ?? "",
        href: tab.href ?? undefined,
        listOnly,
        collapsesFirstTab: tab.collapsesFirstTab ?? undefined,
        mock: resolvedMock,
      };
    });
  const commentsBlockMock = isCommentsPage
    ? getCommentsBlockMock(block)
    : undefined;

  return {
    id: block?.id ?? `feature-block-${index}`,
    accent,
    tint: hexToRgba(accent, BLOCK_TINT_ALPHA),
    icon: (block?.icon ?? "sparkles") as FeatureSetIconName,
    title: block?.title ?? "",
    description: block?.description ?? "",
    tabs,
    initialTabIndex: block?.initialTabIndex ?? undefined,
    mock: (commentsBlockMock ?? block?.mock ?? "workflow") as FeatureSetMockName,
  };
}

/**
 * Turn a hero-tab label into a stable, slug-like id used as the React key and
 * active-tab identifier.
 *
 * @param label - The tab label.
 * @param index - The tab's position (used when the label yields no slug).
 */
function toHeroTabId(label: string, index: number): string {
  const slug = label
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug && slug.length > 0 ? slug : `hero-tab-${index}`;
}

/**
 * Map the CMS `hero.tabs` onto the {@link HeroCmsTab} shape the shared Hero
 * expects, assigning each a stable id and dropping tabs without a label.
 *
 * @param doc - The resolved feature page document.
 * @returns The hero tabs, or `undefined` when the doc supplies none (so the
 *   shared component keeps its showcase-preset behavior).
 */
function toHeroTabs(doc: FeaturePageDoc): HeroCmsTab[] | undefined {
  const rawTabs = doc?.hero?.tabs ?? [];
  const tabs = rawTabs
    .filter((tab) => Boolean(tab?.label))
    .map((tab, index) => ({
      id: toHeroTabId(tab?.label as string, index),
      label: tab?.label as string,
      icon: tab?.icon ?? "grain",
    }));

  return tabs.length > 0 ? tabs : undefined;
}

/**
 * Map the CMS `getStarted.steps` onto the shared component's numbered-step
 * shape, dropping any step without a title.
 *
 * @param doc - The resolved feature page document.
 * @returns The numbered steps, or `undefined` when the doc supplies none (so
 *   the shared component keeps its default behavior).
 */
function toGetStartedSteps(
  doc: FeaturePageDoc,
): GetStartedNumberedStep[] | undefined {
  const rawSteps = doc?.getStarted?.steps ?? [];
  const steps = rawSteps
    .filter((step) => Boolean(step?.title))
    .map((step) => ({
      title: step?.title as string,
      description: step?.description ?? "",
      accent: step?.accent ?? undefined,
    }));

  return steps.length > 0 ? steps : undefined;
}

/**
 * Map the CMS `relatedCapabilities.items` onto the shared component's item
 * shape, dropping any entry without a title or destination.
 *
 * @param doc - The resolved feature page document.
 * @returns The related-capability items, or `undefined` when the doc supplies
 *   none (so the section renders nothing).
 */
function toRelatedCapabilityItems(
  doc: FeaturePageDoc,
): RelatedCapabilityItem[] | undefined {
  const rawItems = doc?.relatedCapabilities?.items ?? [];
  const items = rawItems
    .filter((item) => Boolean(item?.title) && Boolean(item?.href))
    .map((item) => ({
      title: item?.title as string,
      description: item?.description ?? "",
      href: item?.href as string,
      icon: (item?.icon ?? undefined) as FeatureSetIconName | undefined,
    }));

  return items.length > 0 ? items : undefined;
}

interface FeaturePageBodyProps {
  doc: FeaturePageDoc;
}

/**
 * Render a full CMS-driven feature page from a `featurePage` document.
 *
 * @param props - The resolved Sanity document to render.
 */
export default function FeaturePageBody({ doc }: FeaturePageBodyProps) {
  const heroHeadlineLines = doc?.hero?.headlineLines ?? undefined;
  const heroSubhead = doc?.hero?.subhead ?? undefined;
  const heroShowcase = doc?.hero?.showcase ?? undefined;
  const heroTabs = toHeroTabs(doc);

  const solutionHeading = doc?.solution?.heading ?? undefined;
  const solutionSubheading = doc?.solution?.subheading ?? undefined;
  // The Ask AI page uses the "graphs → insight" variant and the Analytics page
  // the "dashboard → curated insight" variant. Force them client-side
  // (mirroring the *_TAB_MOCKS) so they render without a Sanity re-seed; the
  // seed script carries the same variants for anyone who re-seeds the dataset.
  const solutionVariant =
    doc?.slug === ASK_AI_PAGE_SLUG
      ? "ask-ai"
      : doc?.slug === ANALYTICS_PAGE_SLUG
        ? "analytics"
        : doc?.slug === CLIENT_REVIEW_PAGE_SLUG
          ? "client-review"
          : doc?.slug === PRIVATE_COMMENTS_PAGE_SLUG
            ? "private-comments"
              : doc?.slug === WHITE_LABEL_PAGE_SLUG
                ? "white-label"
                : doc?.slug === KANBAN_BOARD_PAGE_SLUG
                  ? "kanban"
                  : doc?.slug === REVIEW_WORKFLOWS_PAGE_SLUG
                    ? "review-workflows"
                    : doc?.slug === AUTHENTICATED_PAGES_PAGE_SLUG
                      ? "authenticated-pages"
                      : doc?.slug === SCREENSHOTS_PAGE_SLUG
                        ? "screenshots"
                        : doc?.slug === RECORDINGS_PAGE_SLUG
                          ? "recordings"
                          : (doc?.solution?.variant ?? undefined);
  const solutionIcon = doc?.solution?.icon ?? undefined;

  const featureBlocks = (doc?.featureSet?.blocks ?? [])
    .filter((block) => Boolean(block?.title))
    .map((block, index) => toFeatureSetBlock(block, index, doc?.slug));

  const getStartedHeading = doc?.getStarted?.heading ?? GET_STARTED_HEADING;
  const getStartedSubheading = doc?.getStarted?.subheading ?? undefined;
  const getStartedSteps = toGetStartedSteps(doc);

  // Prefer the CMS value; fall back to the per-slug defaults so the section
  // renders before a re-seed (mirrors *_TAB_MOCKS / solution variant).
  const relatedSource =
    doc?.relatedCapabilities ??
    (doc?.slug ? RELATED_CAPABILITIES_BY_SLUG[doc.slug] : undefined) ??
    null;
  const relatedItems = toRelatedCapabilityItems({
    ...doc,
    relatedCapabilities: relatedSource,
  });
  const relatedHeading = relatedSource?.heading ?? undefined;
  const relatedBoundaryLine = relatedSource?.boundaryLine ?? undefined;

  const faqItems = doc?.faq?.items ?? undefined;
  const faqHeading = doc?.faq?.heading ?? undefined;

  // Section order mirrors the Figma feature-page frame (node 673:1145):
  // hero → solution → feature set → get started → solutions (industry
  // stamps) → [related capabilities, when supplied] → cost → testimonials →
  // trust → integrations → faq → footer. Note there is NO Problem/clock
  // section (unlike /home-preview), and SolutionsSection sits before
  // CostSection. RelatedCapabilities only renders when the doc supplies items.
  return (
    <main>
      <SiteNav />
      <Hero
        headlineLines={heroHeadlineLines}
        subhead={heroSubhead}
        variant="feature"
        showcase={heroShowcase}
        tabs={heroTabs}
        heroArtifactScope={
          doc?.slug === WHITE_LABEL_PAGE_SLUG ||
          doc?.slug === KANBAN_BOARD_PAGE_SLUG ||
          doc?.slug === REVIEW_WORKFLOWS_PAGE_SLUG ||
          doc?.slug === AUTHENTICATED_PAGES_PAGE_SLUG ||
          doc?.slug === SCREENSHOTS_PAGE_SLUG ||
          doc?.slug === RECORDINGS_PAGE_SLUG
            ? doc.slug
            : undefined
        }
      />
      <SolutionSection
        heading={solutionHeading}
        subheading={solutionSubheading}
        variant={solutionVariant}
        icon={solutionIcon}
      />
      <FeatureSet
        headerTitle={doc?.featureSet?.headerTitle ?? undefined}
        journeyStart={doc?.featureSet?.journeyStart ?? undefined}
        journeyEnd={doc?.featureSet?.journeyEnd ?? undefined}
        blocks={featureBlocks.length > 0 ? featureBlocks : undefined}
      />
      <GetStarted
        heading={getStartedHeading}
        subheading={getStartedSubheading}
        steps={getStartedSteps}
      />
      <SolutionsSection />
      {relatedItems ? (
        <RelatedCapabilities
          heading={relatedHeading}
          items={relatedItems}
          boundaryLine={relatedBoundaryLine}
        />
      ) : null}
      <CostSection />
      <TestimonialsSection />
      <TrustSection />
      <IntegrationsSection />
      <FaqSection heading={faqHeading} items={faqItems} />
      <SiteFooter />
    </main>
  );
}
