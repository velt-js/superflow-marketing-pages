// Shared status and grade presentation for the visibility report.
//
// Colours live here rather than in the CSS module because they are needed in
// three places that cannot share a class: the SVG dial stroke, inline styles
// on the status dots, and the OG share card, which renders outside the DOM
// entirely.

import type { CheckStatus, Grade } from "@/lib/tools/ai-visibility/types";

export type StatusStyle = {
  fg: string;
  bg: string;
  label: string;
};

export const STATUS_STYLES: Record<CheckStatus, StatusStyle> = {
  pass: { fg: "#1a8f5f", bg: "#e7f6ef", label: "Pass" },
  warn: { fg: "#a86a00", bg: "#fdf2e0", label: "Warning" },
  fail: { fg: "#c8362f", bg: "#fdeceb", label: "Fail" },
  unknown: { fg: "#5b5b60", bg: "#f0f0f2", label: "Not checked" },
};

/** Grade colours, warm to cool as the score rises. */
export const GRADE_COLORS: Record<Grade, string> = {
  A: "#1a8f5f",
  B: "#4a9d3f",
  C: "#c08a00",
  D: "#d4661f",
  F: "#c8362f",
};

/**
 * The colour for a score, used for the dial stroke and the grade chip.
 *
 * @param score - The 0 to 100 score.
 */
export function colorForScore(score: number): string {
  try {
    if (score >= 90) return GRADE_COLORS.A;
    if (score >= 75) return GRADE_COLORS.B;
    if (score >= 60) return GRADE_COLORS.C;
    if (score >= 40) return GRADE_COLORS.D;
    return GRADE_COLORS.F;
  } catch {
    return GRADE_COLORS.F;
  }
}

/** One-line verdict shown under the hostname. */
export function verdictFor(score: number): string {
  if (score >= 90) {
    return "AI systems can find, read, and cite this page with no trouble.";
  }
  if (score >= 75) {
    return "AI systems can read this page, with a few gaps worth closing.";
  }
  if (score >= 60) {
    return "AI systems can partly read this page. The failures below are costing you visibility.";
  }
  if (score >= 40) {
    return "AI systems are getting a fraction of this page. Start with the failures below.";
  }
  return "AI systems can barely see this page. The failures below are the reason.";
}

/** Order findings so failures come first, then warnings, then the rest. */
export const STATUS_ORDER: Record<CheckStatus, number> = {
  fail: 0,
  warn: 1,
  unknown: 2,
  pass: 3,
};

/** Human label for the effort chip. */
export const EFFORT_LABELS: Record<string, string> = {
  minutes: "Minutes",
  hour: "An hour",
  project: "A project",
};
