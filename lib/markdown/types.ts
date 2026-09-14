// The shape every Markdown copy is built from.
//
// WHY A STRUCTURED DOCUMENT AND NOT A STRING
//
// The .md served at /<path>.md is not a transcription of the page. A marketing
// page carries a nav, a footer, three CTAs, and 500 words written to rank, none
// of which help a machine decide whether Superflow solves its problem. What
// helps is: what this is, the facts that distinguish it, how to start, and
// where to go next. So every page type resolves to this shape first and the
// renderer turns it into Markdown, which means the section order, the
// provenance line, and the machine-endpoint footer are identical across ~650
// pages instead of being re-invented per template.
//
// This mirrors the reasoning already applied by hand to the tool pages in
// lib/tools/content/to-markdown.ts.

/** A run of related content under one H2. */
export type AgentDocSection = {
  /** H2 text, sentence case, no trailing punctuation. */
  heading: string;
  /** Markdown paragraphs. Joined with a blank line between them. */
  body?: string[];
  /** Rendered as a `-` list, after `body`. */
  bullets?: string[];
  /**
   * Rendered as a numbered list, after `bullets`. Pass the step text only -
   * the numbering is applied here, so a builder never hand-writes "1." into a
   * string that then gets wrapped in a bullet.
   */
  steps?: string[];
  /** Rendered as a pipe table, after `bullets`. Cells are escaped. */
  table?: { headers: string[]; rows: string[][] };
};

/** One question and its answer. Rendered as `### Question` + prose. */
export type AgentDocFaq = {
  question: string;
  answer: string;
};

/** A link to another page on the site, with its Markdown copy implied. */
export type AgentDocLink = {
  title: string;
  /** Path under SITE_URL, with a leading slash. */
  path: string;
  /** Optional one-line gloss, rendered after an em-less dash. */
  note?: string;
};

/**
 * One page, reduced to what an agent needs.
 */
export type AgentDoc = {
  /** Page title with no brand suffix. Becomes the H1. */
  title: string;
  /** One or two sentences. Becomes the blockquote under the H1. */
  summary: string;
  /** Path under SITE_URL, with a leading slash. "/" for the homepage. */
  path: string;
  /**
   * What kind of page this is - "Feature page", "Blog post", "Comparison".
   * Rendered into the key-facts table so an agent can tell a product page
   * from an opinion piece without parsing the prose.
   */
  kind: string;
  /** Distinguishing facts, rendered as a two-column table above the prose. */
  facts?: { label: string; value: string }[];
  sections: AgentDocSection[];
  faq?: AgentDocFaq[];
  related?: AgentDocLink[];
  /** ISO 8601 timestamp of the last content change, when the source has one. */
  updatedAt?: string;
};
