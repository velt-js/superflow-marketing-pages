/**
 * Shared "section artifact" vocabulary for the 2026 use-case / user-persona
 * detail pages.
 *
 * The pages' image sections (solution rows, problem cards, feature rows) can
 * swap their raw CMS bitmap for one of the hand-built product artifacts from
 * `components/home-2026` (see ARTIFACT_UI_COMPONENT_LIST.md). This module is
 * deliberately React-free so both the Sanity schema files (studio bundle) and
 * the rendering components can import it:
 *
 * - `SECTION_ARTIFACT_KEYS` / `SectionArtifactKey` — the curated artifact keys
 *   (a subset of the home-2026 feature-panel mock registry).
 * - `SECTION_ARTIFACT_OPTIONS` — the Sanity dropdown list for the optional
 *   `artifact` field on section items (additive; existing docs are untouched).
 * - `resolveSectionArtifact` — explicit CMS value first, then a keyword match
 *   on the item's copy, so artifacts render without any re-seed and items with
 *   no sensible match keep their CMS image.
 */

/** Curated artifact keys a section item may render (feature-panel mocks). */
export const SECTION_ARTIFACT_KEYS = [
  "pinned-comments",
  "text-comments",
  "thread-comments",
  "tracking-task-management",
  "comment-mentions",
  "reaction-read-receipt",
  "comment-attachment",
  "record-walkthrough",
  "all-devices",
  "kanban",
  "integrations",
  "guest-mode",
  "review-agents",
  "private-comments",
  "auto-screenshot",
  "client-review-approve",
  "versioning",
  "live-site",
  "behind-login",
  "workflows",
  "ask-ai",
  "analytics-insights",
] as const;

/** One of the curated artifact keys. */
export type SectionArtifactKey = (typeof SECTION_ARTIFACT_KEYS)[number];

/** Sentinel Sanity value that forces the CMS image even when copy matches. */
export const SECTION_ARTIFACT_NONE = "none";

/**
 * Dropdown options for the optional Sanity `artifact` field. "None" pins an
 * item to its CMS image; leaving the field empty lets the keyword fallback
 * pick an artifact from the item's copy.
 */
export const SECTION_ARTIFACT_OPTIONS: readonly {
  title: string;
  value: string;
}[] = [
  { title: "None (always use the image)", value: SECTION_ARTIFACT_NONE },
  { title: "Pinned comment on an element", value: "pinned-comments" },
  { title: "Text-selection comment", value: "text-comments" },
  { title: "Threaded comments", value: "thread-comments" },
  { title: "Tracking & task management", value: "tracking-task-management" },
  { title: "@-mentions", value: "comment-mentions" },
  { title: "Reactions & read receipts", value: "reaction-read-receipt" },
  { title: "Comment attachment", value: "comment-attachment" },
  { title: "Record a walkthrough", value: "record-walkthrough" },
  { title: "All devices / phone view", value: "all-devices" },
  { title: "Kanban board", value: "kanban" },
  { title: "Two-way integrations", value: "integrations" },
  { title: "Guest mode (no login)", value: "guest-mode" },
  { title: "AI review agents at work", value: "review-agents" },
  { title: "Private comments", value: "private-comments" },
  { title: "Auto screenshot", value: "auto-screenshot" },
  { title: "Client approves from a link", value: "client-review-approve" },
  { title: "Versioning", value: "versioning" },
  { title: "Live site review", value: "live-site" },
  { title: "Behind-login review", value: "behind-login" },
  { title: "Review workflows", value: "workflows" },
  { title: "Ask AI", value: "ask-ai" },
  { title: "Analytics insights", value: "analytics-insights" },
];

/**
 * Ordered keyword rules for the copy-based fallback. The first rule whose
 * pattern matches the item's combined copy wins, so more specific subjects
 * (recording, devices, boards) sit above the generic comment/feedback rule.
 */
const SECTION_ARTIFACT_KEYWORD_RULES: readonly {
  pattern: RegExp;
  artifact: SectionArtifactKey;
}[] = [
  { pattern: /screenshot/, artifact: "auto-screenshot" },
  { pattern: /record|walkthrough|voice|video/, artifact: "record-walkthrough" },
  { pattern: /device|mobile|phone|browser|responsive/, artifact: "all-devices" },
  // Scattered-channels copy reads as "one thread instead of many places", so
  // it gets the threaded conversation rather than the integrations board.
  { pattern: /channel/, artifact: "thread-comments" },
  {
    pattern: /integration|two.?way|figma|jira|slack|trello|asana|sync/,
    artifact: "integrations",
  },
  { pattern: /kanban|board|backlog|status/, artifact: "kanban" },
  // Before the generic track/task rule so "analytics … track progress" copy
  // gets the analytics dashboard, not the status-tracking thread.
  { pattern: /analytic|insight|report|metric/, artifact: "analytics-insights" },
  { pattern: /track|task/, artifact: "tracking-task-management" },
  { pattern: /\bbug|\bqa\b|quality|test/, artifact: "review-agents" },
  { pattern: /approv|sign.?off/, artifact: "client-review-approve" },
  { pattern: /version/, artifact: "versioning" },
  { pattern: /login|password|\bauth|staging/, artifact: "behind-login" },
  { pattern: /private|internal/, artifact: "private-comments" },
  { pattern: /guest|anonymous|no.account/, artifact: "guest-mode" },
  { pattern: /mention|\btag\b/, artifact: "comment-mentions" },
  { pattern: /workflow/, artifact: "workflows" },
  { pattern: /ask.?ai|\bai\b.*(answer|question)/, artifact: "ask-ai" },
  { pattern: /comment|feedback|annotat|review/, artifact: "pinned-comments" },
];

/**
 * Check whether a raw CMS string is one of the curated artifact keys.
 *
 * @param value - The raw string from Sanity (may be anything).
 * @returns True when the value is a known {@link SectionArtifactKey}.
 */
export function isSectionArtifactKey(
  value?: string | null,
): value is SectionArtifactKey {
  try {
    return Boolean(
      value &&
        (SECTION_ARTIFACT_KEYS as readonly string[]).includes(value),
    );
  } catch {
    return false;
  }
}

/**
 * Resolve which artifact (if any) a section item should render.
 *
 * Order of precedence:
 * 1. An explicit CMS `artifact` value — a known key wins outright, while the
 *    "none" sentinel pins the item to its CMS image.
 * 2. A keyword match on the item's copy (title + description), so existing
 *    documents get artifacts without any data migration.
 * 3. `undefined` — the caller keeps rendering the CMS image.
 *
 * @param explicitArtifact - The optional `artifact` value stored in Sanity.
 * @param copyParts - The item's copy (title, sub-copy, …) used for keywords.
 * @returns The artifact key to render, or `undefined` to keep the image.
 */
export function resolveSectionArtifact(
  explicitArtifact?: string | null,
  ...copyParts: (string | undefined | null)[]
): SectionArtifactKey | undefined {
  try {
    if (explicitArtifact === SECTION_ARTIFACT_NONE) {
      return undefined;
    }
    if (isSectionArtifactKey(explicitArtifact)) {
      return explicitArtifact;
    }

    const combinedCopy = copyParts
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .toLowerCase();
    if (!combinedCopy) {
      return undefined;
    }

    const matchedRule = SECTION_ARTIFACT_KEYWORD_RULES.find((rule) =>
      rule.pattern.test(combinedCopy),
    );
    return matchedRule?.artifact;
  } catch {
    return undefined;
  }
}
