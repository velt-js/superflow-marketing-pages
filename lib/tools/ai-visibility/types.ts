// Types for the AI Visibility Checker (T1).
//
// The report shape is deliberately flat and serializable: it is cached as
// JSON, streamed to the client as it completes, and rendered by a server
// component. Nothing in here may hold a function or a class instance.

import type { BotVerdict } from "@/lib/toolkit/robots";
import type { DetectionResult } from "@/lib/toolkit/detect";
import type { LlmsTxtValidation } from "@/lib/toolkit/llmstxt";
import type { RedirectHop } from "@/lib/toolkit/fetcher";

/**
 * Bump when the report shape changes so cached entries invalidate.
 *
 * 2: added `faviconUrl`.
 */
export const REPORT_VERSION = 2;

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";

/** How much work a fix is, so a reader can triage the list. */
export type Effort = "minutes" | "hour" | "project";

/** The four scoring groups. */
export type CategoryId = "access" | "readability" | "structure" | "identity";

export type CheckId =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "R1"
  | "R2"
  | "R3"
  | "S1"
  | "S2"
  | "S3"
  | "I1"
  | "I2";

export type Finding = {
  id: CheckId;
  category: CategoryId;
  status: CheckStatus;
  /** Short label, e.g. "AI crawlers are blocked in robots.txt". */
  title: string;
  /** One sentence on why it matters. */
  why: string;
  /** What to do about it. Plain instructions. */
  fix: string;
  /** A copyable code block, when the fix is code. */
  fixSnippet?: string;
  /** Language hint for the snippet's syntax highlighting. */
  fixLanguage?: "txt" | "html" | "json";
  /** Platform-specific steps, swapped in when the platform is known. */
  platformFix?: string;
  effort: Effort;
  /** Points earned out of `maxPoints`. */
  points: number;
  maxPoints: number;
  /** Arbitrary per-check payload the UI renders specially (tables, etc). */
  detail?: FindingDetail;
};

/** Per-check structured payloads. Discriminated by `kind`. */
export type FindingDetail =
  | { kind: "bot-table"; verdicts: SerializableBotVerdict[] }
  | {
      kind: "firewall";
      browserStatus: number | null;
      botStatus: number | null;
      blocked: boolean;
    }
  | {
      kind: "js-dependency";
      /** Percent of visible text present without JavaScript, 0 to 100. */
      visibleWithoutJs: number | null;
      rawTextLength: number;
      renderedTextLength: number;
      /** True when this came from a heuristic rather than a real render. */
      heuristic: boolean;
    }
  | { kind: "headings"; h1Count: number; skippedLevels: string[] }
  | { kind: "schema"; types: string[]; parseErrors: string[] }
  | {
      kind: "answer-shape";
      questionHeadings: number;
      hasList: boolean;
      hasTable: boolean;
      hasDates: boolean;
      hasAuthor: boolean;
    }
  | { kind: "llms-txt"; validation: LlmsTxtValidation }
  | { kind: "meta"; title: string | null; description: string | null };

/** A bot verdict flattened for JSON transport. */
export type SerializableBotVerdict = {
  token: string;
  owner: string;
  tier: "answer" | "training";
  allowed: boolean;
  feeds: string;
  consequence: string;
  docsUrl: string;
  note?: string;
  /** The rule that decided it, rendered as `Disallow: /` etc. */
  matchedRule: string | null;
};

export type CategoryScore = {
  id: CategoryId;
  label: string;
  /** One line describing what the category answers. */
  question: string;
  points: number;
  maxPoints: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  /** The single CTA shown under this category's findings. */
  ctaText: string;
};

export type Grade = "A" | "B" | "C" | "D" | "F";

export type VisibilityReport = {
  /** The URL the user submitted. */
  requestedUrl: string;
  /** The URL checks actually ran against, after redirects. */
  finalUrl: string;
  hostname: string;
  /**
   * The site's own favicon, taken from its `<link rel="icon">` or the
   * /favicon.ico convention.
   *
   * Deliberately NOT a third-party favicon service. The obvious shortcut here
   * is Google's s2/favicons endpoint, but that would send the domain of every
   * site anyone checks to Google, on a tool whose headline promise is that we
   * do not store or share what you submit.
   */
  faviconUrl: string | null;
  redirects: RedirectHop[];
  httpStatus: number;
  score: number;
  grade: Grade;
  /**
   * Points that were actually scorable, out of 100. Below 100 when a check
   * could not run: those are excluded from the denominator rather than
   * counted as failures, so a degraded run stays comparable to a full one.
   * The UI discloses this whenever it is not 100.
   */
  scoredOutOf: number;
  categories: CategoryScore[];
  findings: Finding[];
  detection: DetectionResult;
  /** Base64 PNG of the page, when a render service produced one. */
  screenshot: string | null;
  /** Set when some checks could not run. Rendered as a banner, not an error. */
  degraded: DegradedNotice[];
  /** Epoch milliseconds. */
  checkedAt: number;
  durationMs: number;
};

export type DegradedNotice = {
  /** Which checks were affected. */
  checks: CheckId[];
  message: string;
};

/** Category metadata: labels, questions, weights, and CTA copy. */
export const CATEGORY_META: Record<
  CategoryId,
  { label: string; question: string; maxPoints: number; ctaText: string }
> = {
  access: {
    label: "Access",
    question: "Can AI systems reach you?",
    maxPoints: 35,
    ctaText:
      "This checked 1 page, once. Superflow agents check every page, continuously. Run them free.",
  },
  readability: {
    label: "Readability",
    question: "Can they read it?",
    maxPoints: 30,
    ctaText:
      "Agents catch this before your client's customers do. Try Superflow free.",
  },
  structure: {
    label: "Structure",
    question: "Can they understand it?",
    maxPoints: 25,
    ctaText:
      "Turn your own QA rules into agents that never skip a page.",
  },
  identity: {
    label: "Identity",
    question: "Will they cite you correctly?",
    maxPoints: 10,
    ctaText: "See how 20 agents review this whole site in minutes.",
  },
};

/** Points each check contributes. Must sum to 100. */
export const CHECK_POINTS: Record<CheckId, number> = {
  A1: 12,
  A2: 12,
  A3: 7,
  A4: 4,
  R1: 18,
  R2: 7,
  R3: 5,
  S1: 8,
  S2: 9,
  S3: 8,
  I1: 6,
  I2: 4,
};

/** Which category each check belongs to. */
export const CHECK_CATEGORY: Record<CheckId, CategoryId> = {
  A1: "access",
  A2: "access",
  A3: "access",
  A4: "access",
  R1: "readability",
  R2: "readability",
  R3: "readability",
  S1: "structure",
  S2: "structure",
  S3: "structure",
  I1: "identity",
  I2: "identity",
};

/**
 * Converts a status into earned points: a pass earns everything, a warning
 * earns half, a failure earns nothing.
 *
 * `unknown` also earns nothing, but it is reported separately so a
 * degraded run does not read as a failing site.
 *
 * @param status - The check outcome.
 * @param maxPoints - The check's weight.
 */
export function pointsFor(status: CheckStatus, maxPoints: number): number {
  try {
    if (status === "pass") return maxPoints;
    if (status === "warn") return Math.round(maxPoints / 2);
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Letter grade for a score.
 *
 * @param score - The 0 to 100 score.
 */
export function gradeFor(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Flattens a bot verdict for JSON transport. */
export function serializeVerdict(
  verdict: BotVerdict,
  tier: "answer" | "training",
): SerializableBotVerdict {
  return {
    token: verdict.bot.token,
    owner: verdict.bot.owner,
    tier,
    allowed: verdict.allowed,
    feeds: verdict.bot.feeds,
    consequence: verdict.bot.consequence,
    docsUrl: verdict.bot.docsUrl,
    note: verdict.bot.note,
    matchedRule: verdict.matchedRule
      ? `${verdict.matchedRule.type === "allow" ? "Allow" : "Disallow"}: ${verdict.matchedRule.pattern}`
      : null,
  };
}
