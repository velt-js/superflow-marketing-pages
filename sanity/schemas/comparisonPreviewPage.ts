import { defineType, defineField } from "sanity";

// comparisonPreviewPage — drives the new /preview/comparison pages. Three NEW
// document types, one per comparison class from the July 2026 templates:
//
//   comparisonPreviewVsPage           /preview/comparison/superflow-vs-<x>
//   comparisonPreviewArbiterPage      /preview/comparison/<x>-vs-<y>
//   comparisonPreviewAlternativesPage /preview/comparison/<x>-alternative
//
// plus a single comparisonPreviewHub document for /preview/comparison.
//
// These are intentionally NEW types: the legacy `comparisonPage` and
// `alternativePage` documents (app/comparisons, app/alternative) are left
// completely untouched, exactly like integrationPreviewPage did for
// integrations. Content rules baked into the templates (unverified renders as
// a plain hyphen, no em dashes, eight canonical buyer labels in fixed order)
// are enforced editorially by the import pipeline, not by schema validation.

/**
 * The eight canonical buyer labels (RG ruling, July 2026). Same labels, same
 * order on every page of every class. Kept here so schema descriptions,
 * the import script, and verifier agents share one source of truth.
 */
export const COMPARISON_BUYER_LABELS: readonly string[] = [
  "Who checks the site",
  "How the client says yes",
  "Where you review",
  "What stays private",
  "What gets captured",
  "What it remembers",
  "How it fits your stack",
  "What it costs",
];

// ---- Shared sub-objects ----

export const comparisonPreviewFaqItem = defineType({
  name: "comparisonPreviewFaqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description: "Two sentences or fewer, per the template rules.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "question", subtitle: "answer" } },
});

export const comparisonPreviewLink = defineType({
  name: "comparisonPreviewLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Href",
      description:
        "Internal path (/comparisons/…) or absolute URL. Preview-only pages may point at future live paths.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const comparisonPreviewScorecardRow = defineType({
  name: "comparisonPreviewScorecardRow",
  title: "Scorecard row",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Buyer label",
      description:
        "One of the eight canonical buyer labels, in canonical order: " +
        COMPARISON_BUYER_LABELS.join(" · "),
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "leftCell",
      title: "Left column cell",
      description:
        'Words in cells. Unverified renders as a plain hyphen "-", never an assumed no.',
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rightCell",
      title: "Right column cell",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "leftCell" } },
});

export const comparisonPreviewDimension = defineType({
  name: "comparisonPreviewDimension",
  title: "Dimension",
  type: "object",
  fields: [
    defineField({
      name: "number",
      title: "Number (01–08)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Buyer label",
      description:
        "Canonical buyer label for this dimension (see scorecard row description).",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "framing",
      title: "Framing line",
      type: "string",
    }),
    defineField({
      name: "leftFacts",
      title: "Left card facts",
      description: "Two or three plain facts. One idea per line.",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "rightFacts",
      title: "Right card facts",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "leftVerified",
      title: "Left card verification note",
      description: 'e.g. "verified July 2026" or "verified July 2026 except where dashed".',
      type: "string",
    }),
    defineField({
      name: "rightVerified",
      title: "Right card verification note",
      type: "string",
    }),
    defineField({
      name: "verdict",
      title: "Verdict line",
      description: "Names a winner or says even. No scores, no trash-talk.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "verdict" } },
});

export const comparisonPreviewCriterion = defineType({
  name: "comparisonPreviewCriterion",
  title: "Judging criterion",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Buyer label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "line",
      title: "One-line explanation",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "line" } },
});

export const comparisonPreviewEntry = defineType({
  name: "comparisonPreviewEntry",
  title: "Alternatives entry",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Tool name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bestFor",
      title: "Best for",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "standout",
      title: "Standout",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "limits",
      title: "Limits",
      description:
        'Verified limits only. Unverified claims render as "Not yet verified."',
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "vsAnchor",
      title: "Vs the anchor competitor",
      description:
        "One delta line against the page's anchor competitor (never Superflow).",
      type: "text",
      rows: 2,
    }),
  ],
  preview: { select: { title: "name", subtitle: "bestFor" } },
});

// ---- comparisonPreviewVsPage (/preview/comparison/superflow-vs-<x>) ----

export const comparisonPreviewVsPage = defineType({
  name: "comparisonPreviewVsPage",
  title: "Comparison Preview — Superflow vs X",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "body", title: "Dimensions and scorecard" },
    { name: "close", title: "Pricing, switching, close" },
    { name: "faq", title: "FAQ and related" },
    { name: "seo", title: "SEO and sources" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "Superflow vs BugHerd".',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Served at /preview/comparison/<slug>.",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "competitorName",
      title: "Competitor name",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "grantedNoun",
      title: "Granted noun",
      description:
        'What the competitor credibly is, e.g. "QA tool", "feedback tool". Feeds the H1 construction.',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kicker",
      title: "Kicker (eyebrow)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "headline",
      title: "H1",
      description: '"{X} is a {noun}. Superflow is a {noun} + a team."',
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondary",
      title: "Secondary line",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "prevents",
      title: "Prevents lines",
      type: "array",
      of: [{ type: "string" }],
      group: "hero",
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "qualifier",
      title: "Qualifier",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroCaption",
      title: "Hero visual caption",
      description: 'e.g. "It\'s like BugHerd hired a QA team."',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      description:
        "Left cards are Superflow, right cards are the competitor. Canonical order, render only where true.",
      type: "array",
      of: [{ type: "comparisonPreviewDimension" }],
      group: "body",
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "scorecardKicker",
      title: "Scorecard kicker line",
      description: 'e.g. "BugHerd is a board. Superflow is a team."',
      type: "string",
      group: "body",
    }),
    defineField({
      name: "scorecard",
      title: "Scorecard (exactly eight rows)",
      description:
        "Left column is the competitor, right column is Superflow (matches the rendered table).",
      type: "array",
      of: [{ type: "comparisonPreviewScorecardRow" }],
      group: "body",
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "pricingCompetitor",
      title: "Competitor pricing (verified, dated)",
      type: "text",
      rows: 3,
      group: "close",
    }),
    defineField({
      name: "pricingSuperflow",
      title: "Superflow pricing",
      description:
        'Gated until the pricing ruling lands; store the gate note, e.g. "See /pricing."',
      type: "text",
      rows: 2,
      group: "close",
    }),
    defineField({
      name: "switchingLines",
      title: "Switching lines",
      type: "array",
      of: [{ type: "string" }],
      group: "close",
    }),
    defineField({
      name: "honestCloseStrengths",
      title: "Honest close: what the competitor gets right",
      type: "text",
      rows: 4,
      group: "close",
    }),
    defineField({
      name: "stayLine",
      title: "Stay line",
      description: '"If {condition}, {X} is a fine tool. Stay."',
      type: "string",
      group: "close",
    }),
    defineField({
      name: "fieldLink",
      title: "Wider-field link (the sibling listicle)",
      type: "comparisonPreviewLink",
      group: "close",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [{ type: "comparisonPreviewFaqItem" }],
      group: "faq",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "related",
      title: "Related links",
      type: "array",
      of: [{ type: "comparisonPreviewLink" }],
      group: "faq",
    }),
    defineField({
      name: "factsCheckedAt",
      title: "Facts checked",
      description: 'e.g. "July 2026".',
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "sourceUrls",
      title: "Source URLs",
      description: "Vendor pages every rendered claim was checked against.",
      type: "array",
      of: [{ type: "url" }],
      group: "seo",
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

// ---- comparisonPreviewArbiterPage (/preview/comparison/<x>-vs-<y>) ----

export const comparisonPreviewArbiterPage = defineType({
  name: "comparisonPreviewArbiterPage",
  title: "Comparison Preview — X vs Y",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero and short answer" },
    { name: "body", title: "Dimensions and scorecard" },
    { name: "close", title: "Pricing and third option" },
    { name: "faq", title: "FAQ and related" },
    { name: "seo", title: "SEO and sources" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "BugHerd vs Marker.io".',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "toolLeftName",
      title: "Left tool name (X)",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "toolRightName",
      title: "Right tool name (Y)",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kicker",
      title: "Kicker (eyebrow)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "headline",
      title: "H1",
      description: '"{X} vs {Y}: which fits your agency?"',
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      description: "One line on what each tool is, then the pair's real fork.",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "disclosure",
      title: "Disclosure (always renders)",
      type: "text",
      rows: 2,
      group: "hero",
      initialValue:
        "We make Superflow, a third option in this space. It appears once, at the end, clearly marked. Everything above it is a straight comparison.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateline",
      title: "Dateline",
      description: 'e.g. "Facts checked July 2026, from bugherd.com and marker.io."',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "shortAnswerPickLeft",
      title: "Short answer: pick left tool if…",
      type: "text",
      rows: 2,
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortAnswerPickRight",
      title: "Short answer: pick right tool if…",
      type: "text",
      rows: 2,
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortAnswerShared",
      title: "Short answer: the shared premise",
      description: 'e.g. "Both assume a person finds every mistake."',
      type: "text",
      rows: 2,
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      description: "Left cards are tool X, right cards are tool Y. Canonical order.",
      type: "array",
      of: [{ type: "comparisonPreviewDimension" }],
      group: "body",
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "scorecard",
      title: "Scorecard (exactly eight rows)",
      description: "Left column is tool X, right column is tool Y.",
      type: "array",
      of: [{ type: "comparisonPreviewScorecardRow" }],
      group: "body",
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "pricingNote",
      title: "Pricing, side by side",
      description: "The agency-shaped pricing comparison paragraph, both sides dated.",
      type: "text",
      rows: 4,
      group: "close",
    }),
    defineField({
      name: "thirdOptionBody",
      title: "The third option (the only Superflow module)",
      type: "text",
      rows: 4,
      group: "close",
    }),
    defineField({
      name: "thirdOptionLinks",
      title: "Third option links",
      type: "array",
      of: [{ type: "comparisonPreviewLink" }],
      group: "close",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [{ type: "comparisonPreviewFaqItem" }],
      group: "faq",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "related",
      title: "Related links",
      type: "array",
      of: [{ type: "comparisonPreviewLink" }],
      group: "faq",
    }),
    defineField({
      name: "factsCheckedAt",
      title: "Facts checked",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "sourceUrls",
      title: "Source URLs",
      type: "array",
      of: [{ type: "url" }],
      group: "seo",
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

// ---- comparisonPreviewAlternativesPage (/preview/comparison/<x>-alternative) ----

export const comparisonPreviewAlternativesPage = defineType({
  name: "comparisonPreviewAlternativesPage",
  title: "Comparison Preview — Alternatives listicle",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero and criteria" },
    { name: "entries", title: "Entries" },
    { name: "faq", title: "FAQ and related" },
    { name: "seo", title: "SEO and sources" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "The 5 best BugHerd alternatives for agencies (2026)".',
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: 'e.g. "bugherd-alternative".',
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "anchorName",
      title: "Anchor competitor name",
      description: "Every entry's delta line compares against this tool, never Superflow.",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kicker",
      title: "Kicker (eyebrow)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "dateline",
      title: "Dateline",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "criteria",
      title: "How we judged (eight criteria)",
      type: "array",
      of: [{ type: "comparisonPreviewCriterion" }],
      group: "hero",
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "superflowHeadline",
      title: "Superflow entry headline",
      description: '"{X} is a {noun}. Superflow is a {noun} + a team."',
      type: "string",
      group: "entries",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "superflowBody",
      title: "Superflow entry body",
      type: "text",
      rows: 3,
      group: "entries",
    }),
    defineField({
      name: "superflowBestFor",
      title: "Superflow entry: best for",
      type: "string",
      group: "entries",
    }),
    defineField({
      name: "superflowScorecard",
      title: "Superflow scorecard vs anchor (exactly eight rows)",
      description: "Left column is the anchor competitor, right column is Superflow.",
      type: "array",
      of: [{ type: "comparisonPreviewScorecardRow" }],
      group: "entries",
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "superflowHonestLimit",
      title: "Superflow entry: honest limit",
      description: 'e.g. "no built-in Jira sync today."',
      type: "string",
      group: "entries",
    }),
    defineField({
      name: "superflowLinks",
      title: "Superflow entry links",
      type: "array",
      of: [{ type: "comparisonPreviewLink" }],
      group: "entries",
    }),
    defineField({
      name: "entries",
      title: "Honest entries (3–4 real players)",
      type: "array",
      of: [{ type: "comparisonPreviewEntry" }],
      group: "entries",
      validation: (rule) => rule.required().min(3),
    }),
    defineField({
      name: "stayHeading",
      title: "Stay entry heading",
      description: 'e.g. "The sixth option, stay on BugHerd".',
      type: "string",
      group: "entries",
    }),
    defineField({
      name: "stayBody",
      title: "Stay entry body",
      type: "text",
      rows: 3,
      group: "entries",
    }),
    defineField({
      name: "stayLine",
      title: "Stay line",
      type: "string",
      group: "entries",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [{ type: "comparisonPreviewFaqItem" }],
      group: "faq",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "related",
      title: "Related links",
      type: "array",
      of: [{ type: "comparisonPreviewLink" }],
      group: "faq",
    }),
    defineField({
      name: "finalCtaHeadline",
      title: "Final CTA headline",
      description: "Echoes the Superflow entry headline.",
      type: "string",
      group: "faq",
    }),
    defineField({
      name: "factsCheckedAt",
      title: "Facts checked",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "sourceUrls",
      title: "Source URLs",
      type: "array",
      of: [{ type: "url" }],
      group: "seo",
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

// ---- comparisonPreviewHub (the /preview/comparison hub) ----

export const comparisonPreviewHub = defineType({
  name: "comparisonPreviewHub",
  title: "Comparison Preview Hub",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kicker",
      title: "Kicker (eyebrow)",
      type: "string",
    }),
    defineField({
      name: "headline",
      title: "H1",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subhead",
      title: "Subheading",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "metaTitle", title: "Meta Title", type: "string" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
    }),
  ],
  preview: { select: { title: "title" } },
});
