// The shape a persona review returns to the browser.
//
// Deliberately thinner than the backend's finding contract: the free-tools
// envelope already flattens findings, and the UI renders a verdict and a list.
// Fields the page does not show are not carried.

/** One thing the reviewer objected to. */
export type PersonaFinding = {
  /** Short, direct title in the reviewer's voice. */
  title: string;
  /** What is wrong and why this reviewer cares. */
  description: string;
  /** Severity this lens assigns. */
  severity: "high" | "medium" | "low";
  /** The concrete fix — for copy findings, the rewritten sentence itself. */
  suggestion?: string;
  /** The exact text on the page the finding refers to, when there is one. */
  targetText?: string;
};

/** What the route stores in the cache and returns on a hit. */
export type PersonaReviewPayload = {
  /** The reviewer's verdict: the most important thing about this page. */
  summary: string;
  findings: PersonaFinding[];
  totalFindings: number;
};
