// Shared content for a tool, consumed by both its page and its .md copy.
//
// WHY THIS EXISTS
//
// Every tool page already held its FAQ and how-it-works steps as local
// constants. Serving a Markdown copy of the page meant either reading those
// constants or writing them out a second time, and a second copy would drift
// the first time somebody edited an answer. So the data moved here and both
// surfaces read it.
//
// The long "why this matters" essay deliberately does NOT live here. It is
// written for a human reader and an agent does not need 500 words of prose to
// use a tool. The .md copy carries what a machine actually needs: what the
// tool does, how to call it, its limits, and the questions people ask.

export type ToolHowItWorksStep = {
  title: string;
  body: string;
};

export type ToolFaqEntry = {
  question: string;
  answer: string;
};

/**
 * One fact worth stating plainly for a machine reader: a rate limit, an API
 * endpoint, whether anything is stored. These are the things an agent would
 * otherwise have to infer from marketing prose, and infer wrongly.
 */
export type ToolFact = {
  label: string;
  value: string;
};

export type ToolContent = {
  /** Must match the registry slug. */
  slug: string;
  /** The H1, and the Markdown document's title. */
  title: string;
  /** One line under the H1. */
  subhead: string;
  /** Meta description, and the Markdown summary line. */
  description: string;
  howItWorks: ToolHowItWorksStep[];
  faq: ToolFaqEntry[];
  facts: ToolFact[];
};
