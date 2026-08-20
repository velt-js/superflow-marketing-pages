// One pure function per tool, each reducing that tool's report to a
// `ShareSnapshot`.
//
// PURE, AND WHY THAT MATTERS
//
// Nothing here reads the cache, the network, or the environment. Every builder
// is a plain function of a report, which is what lets the same code run in
// three places that cannot share anything else:
//
//   the browser  - the tool component has the report in hand and needs the
//                  permalink, the card preview, and the badge snippet without
//                  a round trip;
//   the server   - `generateMetadata` reads the report out of KV and needs the
//                  same headline and the same card URL, or a shared link would
//                  unfurl differently from the page it points at;
//   the badge    - the SVG endpoint re-derives the badge from the current
//                  cached run, so a badge cannot be forged by editing the
//                  query string.
//
// HOUSE RULES FOR THE COPY IN THIS FILE
//
// Every headline and summary is written to be read by somebody who did not run
// the tool, in a Slack channel, next to the link. So: name the host, state the
// finding, no adjectives the report cannot support, and never a claim about
// Superflow. The tools earn the click by being useful, not by advertising.
//
// A builder never invents a number. Where a report has no verdict the tone is
// `neutral` and the badge is null, and that is the honest answer rather than a
// gap to fill.

import type { DetectionResult } from "@/lib/toolkit/detect";
import type { VisibilityReport } from "@/lib/tools/ai-visibility/types";
import type { SocialPreviewReport } from "@/lib/tools/social-preview/report";
import type {
  LlmsTxtReport,
  MarkdownForAgentsReport,
} from "@/lib/tools/free-tools/reports";
import type {
  JsonLdGeneratorReport,
  JsonLdValidatorReport,
} from "@/lib/tools/json-ld/types";
import type { PersonaReviewPayload } from "@/lib/tools/persona-review/types";
import { findTool } from "@/lib/tools/registry";
import type { ShareMetric, ShareSnapshot, ShareTone } from "./types";

/** Longest string any snapshot field carries into a query string. */
const MAX_TEXT = 200;

/**
 * The display name for a slug, from the registry.
 *
 * Falls back to the slug rather than to a guess, so a tool that is not
 * registered shows something traceable instead of an invented name.
 *
 * @param slug - The registry slug.
 */
function toolNameFor(slug: string): string {
  try {
    return findTool(slug)?.name ?? slug;
  } catch {
    return slug;
  }
}

/**
 * The host of a URL, without `www.`.
 *
 * @param url - Any URL, possibly missing its scheme.
 * @returns The bare host, or "" when the value is not a URL at all.
 */
function hostFrom(url: string): string {
  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withScheme).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

/**
 * Trims a string to a length a card and a query string can both carry.
 *
 * Control characters go first: these values reach an SVG badge and an Open
 * Graph card, and a newline in a label is a rendering bug at best.
 *
 * @param value - The raw text.
 * @param maxLength - Characters to keep.
 */
function text(value: string, maxLength = MAX_TEXT): string {
  try {
    return (value ?? "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  } catch {
    return "";
  }
}

/**
 * The tone for a 0 to 100 score.
 *
 * The bands match `colorForScore` in the visibility report view, so the card,
 * the badge, and the page never disagree about whether a number is good.
 *
 * @param score - The score.
 */
function toneForScore(score: number): ShareTone {
  if (score >= 75) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

/**
 * The tone for a pass/warn/fail tally.
 *
 * @param failures - Checks that failed.
 * @param warnings - Checks that warned.
 */
function toneForCounts(failures: number, warnings: number): ShareTone {
  if (failures > 0) return "bad";
  if (warnings > 0) return "warn";
  return "good";
}

/** Keeps at most three metrics, dropping any with an empty half. */
function metrics(entries: ShareMetric[]): ShareMetric[] {
  try {
    return entries
      .filter((entry) => entry.label.length > 0 && entry.value.length > 0)
      .slice(0, 3)
      .map((entry) => ({
        label: text(entry.label, 28),
        value: text(entry.value, 24),
      }));
  } catch {
    return [];
  }
}

/**
 * Pluralises a count with its noun.
 *
 * @param count - The number.
 * @param singular - The singular noun.
 * @param plural - The plural, when it is not `singular + "s"`.
 */
function plural(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

// ─────────────────────────────────────────────────────── AI Visibility

/**
 * The AI Visibility Checker's snapshot: the score is the result, so the card
 * leads with it and the badge is the score itself.
 *
 * @param report - The full visibility report.
 */
export function visibilitySnapshot(report: VisibilityReport): ShareSnapshot {
  const slug = "ai-visibility-checker";
  try {
    const host = report.hostname || hostFrom(report.finalUrl);
    const categories = report.categories ?? [];
    const tone = toneForScore(report.score);

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.finalUrl || report.requestedUrl,
      headline: text(`${host} scores ${report.score}/100 for AI visibility`),
      summary: text(
        `Grade ${report.grade}. See which AI crawlers can reach ${host}, how much of the page needs JavaScript, and what to fix.`,
      ),
      score: report.score,
      grade: report.grade,
      tone,
      metrics: metrics(
        categories.map((category) => ({
          label: category.label,
          value: `${category.points}/${category.maxPoints}`,
        })),
      ),
      preview: null,
      // A score is only worth embedding once it is a good score. Below 75 the
      // honest badge would be an argument against the site carrying it.
      badge:
        report.score >= 75
          ? { label: "AI visible", value: `${report.score}/100`, tone: "good" }
          : null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/**
 * The robots.txt AI Checker's snapshot.
 *
 * Runs on the same report as the visibility checker but must never show the
 * 100-point score: this page only reports on crawler access, and a headline
 * number that a JavaScript check contributed to would mean something the page
 * did not measure. So the score here is the Access category as a percentage of
 * its own points.
 *
 * @param report - The full visibility report.
 */
export function accessSnapshot(report: VisibilityReport): ShareSnapshot {
  const slug = "robots-txt-ai-checker";
  try {
    const host = report.hostname || hostFrom(report.finalUrl);
    const access = (report.categories ?? []).find(
      (category) => category.id === "access",
    );
    const percent =
      access && access.maxPoints > 0
        ? Math.round((access.points / access.maxPoints) * 100)
        : null;

    const findings = report.findings ?? [];
    const botTable = findings.find(
      (finding) => finding.detail?.kind === "bot-table",
    )?.detail;
    const verdicts = botTable?.kind === "bot-table" ? botTable.verdicts : [];
    // Only answer-tier crawlers count toward the verdict. Blocking CCBot or
    // Google-Extended is a deliberate, legitimate choice about training data
    // that the engine itself never scores as a failure, so a badge must not
    // withhold itself over one.
    const answerCrawlers = verdicts.filter(
      (verdict) => verdict.tier === "answer",
    );
    const allowed = answerCrawlers.filter((verdict) => verdict.allowed).length;

    const firewall = findings.find(
      (finding) => finding.detail?.kind === "firewall",
    )?.detail;
    const blockedAtEdge =
      firewall?.kind === "firewall" ? firewall.blocked === true : false;

    const tone: ShareTone = blockedAtEdge
      ? "bad"
      : percent === null
        ? "neutral"
        : toneForScore(percent);

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.finalUrl || report.requestedUrl,
      headline: blockedAtEdge
        ? text(`${host} blocks AI crawlers at the edge`)
        : text(
            answerCrawlers.length > 0
              ? `${host} allows ${allowed} of ${answerCrawlers.length} AI answer crawlers`
              : `AI crawler access for ${host}`,
          ),
      summary: text(
        `Which AI and search crawlers ${host} allows in robots.txt, and whether the CDN in front of it answers them differently.`,
      ),
      score: percent,
      grade: null,
      tone,
      metrics: metrics([
        answerCrawlers.length > 0
          ? {
              label: "Answer crawlers",
              value: `${allowed} of ${answerCrawlers.length}`,
            }
          : { label: "", value: "" },
        {
          label: "Edge firewall",
          value: blockedAtEdge ? "Blocking" : "Not blocking",
        },
        access
          ? {
              label: "Access points",
              value: `${access.points}/${access.maxPoints}`,
            }
          : { label: "", value: "" },
      ]),
      preview: null,
      badge:
        !blockedAtEdge &&
        answerCrawlers.length > 0 &&
        allowed === answerCrawlers.length
          ? { label: "AI crawlers", value: "allowed", tone: "good" }
          : null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

// ────────────────────────────────────────────────────── Social preview

/**
 * The Social Preview Checker's snapshot.
 *
 * This is the tool whose result is itself a picture, so the snapshot carries
 * the page's own card art and the renderer draws that instead of a score. A
 * shared link therefore unfurls as the very thing the tool is reporting on,
 * which is the only card on the site that doubles as its own evidence.
 *
 * @param report - The social preview report.
 */
export function socialPreviewSnapshot(
  report: SocialPreviewReport,
): ShareSnapshot {
  const slug = "social-preview-checker";
  try {
    const host = hostFrom(report.url || report.requestedUrl);
    const summary = report.summary;
    const tone = toneForCounts(summary.failed, summary.warnings);

    // The widest card wins: it is the one most platforms draw and the one a
    // reader recognises. Falling back to the first preview keeps a text-only
    // page reporting its real title rather than nothing.
    const wide =
      report.previews.find((preview) => preview.layout === "large-image") ??
      report.previews.find((preview) => preview.willRenderCard) ??
      report.previews[0];

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.url || report.requestedUrl,
      headline: text(
        summary.failed > 0
          ? `${host} has ${plural(summary.failed, "problem")} in its social preview`
          : `How ${host} looks when you share it`,
      ),
      summary: text(
        `Checked on ${plural(summary.platformsChecked, "platform")}. ${summary.platformsWithImage} show an image, ${summary.warnings} ${summary.warnings === 1 ? "carries" : "carry"} a warning, ${summary.failed} fail.`,
      ),
      score: null,
      grade: null,
      tone,
      metrics: metrics([
        {
          label: "Platforms with image",
          value: `${summary.platformsWithImage} of ${summary.platformsChecked}`,
        },
        { label: "Warnings", value: String(summary.warnings) },
        { label: "Failures", value: String(summary.failed) },
      ]),
      preview: wide
        ? {
            title: text(wide.title.value, 90),
            description: text(wide.description.value, 160),
            imageUrl: text(wide.image.value, 600),
            attribution: text(wide.attribution || host, 60),
            rendersCard: wide.willRenderCard,
          }
        : null,
      // A warning does not withhold the badge: the cards do render, which is
      // what the badge claims. It does colour it amber, so the badge never
      // reads greener than the report it links to.
      badge:
        summary.failed === 0 && summary.platformsWithImage > 0
          ? {
              label: "Social preview",
              value: "ready",
              tone: summary.warnings > 0 ? "warn" : "good",
            }
          : null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

// ─────────────────────────────────────────────────────── Structured data

/**
 * The JSON-LD Validator's snapshot.
 *
 * @param report - The validator report.
 */
export function jsonLdValidatorSnapshot(
  report: JsonLdValidatorReport,
): ShareSnapshot {
  const slug = "json-ld-validator";
  try {
    const host = report.hostname || hostFrom(report.finalUrl);
    const categories = report.categories ?? [];
    const failures = categories.reduce(
      (total, category) => total + category.failCount,
      0,
    );
    const warnings = categories.reduce(
      (total, category) => total + category.warnCount,
      0,
    );
    const types = report.declaredTypes ?? [];

    const tone: ShareTone = report.noStructuredData
      ? "bad"
      : toneForCounts(failures, warnings);

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.finalUrl || report.requestedUrl,
      headline: text(
        report.noStructuredData
          ? `${host} has no structured data`
          : failures > 0
            ? `${host} has ${plural(failures, "structured data error")}`
            : `${host} has valid structured data`,
      ),
      summary: text(
        report.noStructuredData
          ? `No JSON-LD blocks found on ${host}, so search engines and AI answer engines have nothing to read.`
          : `${plural(report.blockCount, "JSON-LD block")}, ${types.length > 0 ? types.slice(0, 3).join(", ") : "no declared types"}. ${failures} errors, ${warnings} warnings.`,
      ),
      score: null,
      grade: null,
      tone,
      metrics: metrics([
        { label: "Blocks", value: String(report.blockCount) },
        {
          label: "Types",
          value: types.length > 0 ? types.slice(0, 2).join(", ") : "None",
        },
        { label: "Errors", value: String(failures) },
      ]),
      preview: null,
      badge:
        !report.noStructuredData && report.blockCount > 0 && failures === 0
          ? { label: "Structured data", value: "valid", tone: "good" }
          : null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/**
 * The JSON-LD Generator's snapshot. The result is a block of markup, so there
 * is no verdict to report and no badge to earn.
 *
 * @param report - The generator report.
 */
export function jsonLdGeneratorSnapshot(
  report: JsonLdGeneratorReport,
): ShareSnapshot {
  const slug = "json-ld-generator";
  try {
    const host = hostFrom(report.url || report.requestedUrl);
    const checks = report.validation?.findings ?? [];
    const passed = checks.filter((check) => check.status === "pass").length;

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.url || report.requestedUrl,
      headline: text(
        report.detectedType
          ? `${report.detectedType} schema for ${host}`
          : `Schema markup for ${host}`,
      ),
      summary: text(
        `Generated from the page itself, then validated against ${plural(checks.length, "check")}. Paste it into ${host} and the block is live.`,
      ),
      score: null,
      grade: null,
      tone: "neutral",
      metrics: metrics([
        { label: "Type", value: report.detectedType || "Unknown" },
        {
          label: "Checks passed",
          value: checks.length > 0 ? `${passed} of ${checks.length}` : "",
        },
        {
          label: "Size",
          value: report.jsonLdString
            ? `${report.jsonLdString.length} chars`
            : "",
        },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

// ──────────────────────────────────────────────────── Generated artefacts

/**
 * The llms.txt Generator's snapshot.
 *
 * @param report - The generator report.
 */
export function llmsTxtSnapshot(report: LlmsTxtReport): ShareSnapshot {
  const slug = "llms-txt-generator";
  try {
    const host = hostFrom(report.url || report.requestedUrl);
    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.url || report.requestedUrl,
      headline: text(`llms.txt for ${report.siteName || host}`),
      summary: text(
        `${plural(report.pagesDiscovered, "page")} discovered, ${report.pagesIncluded} written into llms-full.txt. Spec-correct and ready to host at ${host}/llms.txt.`,
      ),
      score: null,
      grade: null,
      tone: "neutral",
      metrics: metrics([
        { label: "Pages found", value: String(report.pagesDiscovered) },
        { label: "Pages included", value: String(report.pagesIncluded) },
        {
          label: "llms.txt size",
          value: `${Math.max(1, Math.round(report.llmsTxt.length / 1024))} KB`,
        },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/**
 * The Markdown for Agents snapshot.
 *
 * @param report - The conversion report.
 */
export function markdownForAgentsSnapshot(
  report: MarkdownForAgentsReport,
): ShareSnapshot {
  const slug = "markdown-for-agents";
  try {
    const host = hostFrom(report.url || report.requestedUrl);
    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: report.url || report.requestedUrl,
      headline: text(
        report.title ? `${report.title} as Markdown` : `${host} as Markdown`,
      ),
      summary: text(
        `${plural(report.wordCount, "word")} of clean CommonMark, converted from ${host}. The version an AI agent can actually read.`,
      ),
      score: null,
      grade: null,
      tone: "neutral",
      metrics: metrics([
        { label: "Words", value: String(report.wordCount) },
        {
          label: "Size",
          value: `${Math.max(1, Math.round(report.bytes / 1024))} KB`,
        },
        { label: "Truncated", value: report.truncated ? "Yes" : "No" },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/** The fields the Alt Text Generator's share card needs from its report. */
export type AltTextShareInput = {
  url: string;
  requestedUrl?: string;
  counts: {
    found: number;
    analyzed: number;
    missingAlt: number;
    skipped: number;
  };
};

/**
 * The Alt Text Generator's snapshot.
 *
 * Takes the fields it needs rather than the whole report type, which lives in
 * its route module: a lib importing a route to borrow a type would make the
 * dependency point the wrong way for the sake of four fields.
 *
 * @param result - The cached alt text result.
 */
export function altTextSnapshot(result: AltTextShareInput): ShareSnapshot {
  const slug = "alt-text-generator";
  try {
    const host = hostFrom(result.url || result.requestedUrl || "");
    const counts = result.counts;
    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: result.url || result.requestedUrl || "",
      headline: text(
        counts.missingAlt > 0
          ? `${host} has ${plural(counts.missingAlt, "image")} with no alt text`
          : `Alt text for ${host}`,
      ),
      summary: text(
        `${plural(counts.found, "image")} found, ${counts.analyzed} written. Accurate alt text for every image on the page, ready to paste.`,
      ),
      score: null,
      grade: null,
      tone: counts.missingAlt > 0 ? "warn" : "neutral",
      metrics: metrics([
        { label: "Images found", value: String(counts.found) },
        { label: "Missing alt", value: String(counts.missingAlt) },
        { label: "Written", value: String(counts.analyzed) },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/** The fields the Full Page Screenshot's share card needs. */
export type ScreenshotShareInput = {
  url: string;
  requestedUrl?: string;
  width?: number;
  height?: number;
  bytes?: number;
  deviceType?: string;
};

/**
 * The Full Page Screenshot's snapshot.
 *
 * The captured PNG is deliberately NOT used as the card image. It lives behind
 * a signed bucket URL that expires in 24 hours, and a social card that 404s a
 * week after it was posted is worse than one that never had the picture.
 *
 * @param result - The cached screenshot result.
 */
export function screenshotSnapshot(
  result: ScreenshotShareInput,
): ShareSnapshot {
  const slug = "full-page-screenshot";
  try {
    const host = hostFrom(result.url || result.requestedUrl || "");
    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: result.url || result.requestedUrl || "",
      headline: text(`Full page screenshot of ${host}`),
      summary: text(
        `Captured end to end${result.width && result.height ? ` at ${result.width} by ${result.height}` : ""}. No watermark, no extension, no login.`,
      ),
      score: null,
      grade: null,
      tone: "neutral",
      metrics: metrics([
        {
          label: "Size",
          value:
            result.width && result.height
              ? `${result.width} x ${result.height}`
              : "",
        },
        {
          label: "File",
          value: result.bytes
            ? `${Math.max(1, Math.round(result.bytes / 1024))} KB`
            : "",
        },
        { label: "Viewport", value: result.deviceType ?? "" },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

// ─────────────────────────────────────────────────────── Persona reviews

/**
 * A persona review's snapshot, for the five "Review like" tools and the
 * Lookalike Test.
 *
 * The reviewer's own summary is the card's copy, because paraphrasing a Paul
 * Graham review into house voice would remove the only reason anybody shares
 * one. Tone tracks severity, never approval: a review with no high-severity
 * findings is `good`, and none of these tools earns a badge, because "a
 * language model in a persona liked my page" is not a certification.
 *
 * @param slug - Which review tool ran.
 * @param payload - The review the route cached.
 * @param targetUrl - The page reviewed.
 * @param permalinkParams - Extra inputs the run depended on, for the tools
 *   that take more than a URL. The Lookalike Test needs them: its result is a
 *   comparison against a specific pack, and a permalink without them opens a
 *   different comparison.
 */
export function personaReviewSnapshot(
  slug: string,
  payload: PersonaReviewPayload,
  targetUrl: string,
  permalinkParams?: Record<string, string>,
): ShareSnapshot {
  try {
    const host = hostFrom(targetUrl);
    const findings = payload.findings ?? [];
    const high = findings.filter((finding) => finding.severity === "high").length;
    const name = toolNameFor(slug);

    return {
      slug,
      toolName: name,
      hostname: host,
      targetUrl,
      headline: text(`${name}: ${host}`),
      summary: text(payload.summary || `${plural(findings.length, "finding")} on ${host}.`),
      score: null,
      grade: null,
      tone: high > 0 ? "warn" : findings.length > 0 ? "neutral" : "good",
      metrics: metrics([
        { label: "Findings", value: String(findings.length) },
        { label: "High severity", value: String(high) },
      ]),
      preview: null,
      badge: null,
      ...(permalinkParams && Object.keys(permalinkParams).length > 0
        ? { permalinkParams }
        : {}),
    };
  } catch {
    return emptySnapshot(slug);
  }
}

// ────────────────────────────────────────────────────────── Tech stack

/**
 * The Tech Stack Detector's snapshot.
 *
 * @param result - The detection result plus the URL it ran against.
 */
export function techStackSnapshot(
  result: DetectionResult & { url: string; requestedUrl?: string },
): ShareSnapshot {
  const slug = "tech-stack-detector";
  try {
    const host = hostFrom(result.url || result.requestedUrl || "");
    const apps = result.apps ?? [];
    const analytics = result.analytics ?? [];

    return {
      slug,
      toolName: toolNameFor(slug),
      hostname: host,
      targetUrl: result.url || result.requestedUrl || "",
      headline: text(
        result.platformName && result.platform !== "unknown"
          ? `${host} runs on ${result.platformName}`
          : `What ${host} is built with`,
      ),
      summary: text(
        `Platform, theme, apps, fonts, analytics, and hosting behind ${host}, read from the page itself.`,
      ),
      score: null,
      grade: null,
      // A stack is a fact, not a verdict. Nothing here is good or bad news.
      tone: "neutral",
      metrics: metrics([
        {
          label: "Platform",
          value:
            result.platform === "unknown"
              ? "Not detected"
              : result.platformName,
        },
        { label: "Apps", value: apps.length > 0 ? String(apps.length) : "" },
        {
          label: "Analytics",
          value: analytics.length > 0 ? String(analytics.length) : "",
        },
      ]),
      preview: null,
      badge: null,
    };
  } catch {
    return emptySnapshot(slug);
  }
}

/**
 * The snapshot a builder returns when a report it was handed turns out to be
 * unreadable.
 *
 * Every builder is wrapped in a try/catch because all of them run inside
 * `generateMetadata`, where a throw costs the whole page rather than the card.
 * This value renders a plain card naming the tool, which is the correct
 * outcome: a shared link that unfurls modestly beats one that 500s.
 *
 * @param slug - The tool the snapshot was being built for.
 */
function emptySnapshot(slug: string): ShareSnapshot {
  return {
    slug,
    toolName: toolNameFor(slug),
    hostname: "",
    targetUrl: "",
    headline: toolNameFor(slug),
    summary: "Free tool from Superflow. No login, no email.",
    score: null,
    grade: null,
    tone: "neutral",
    metrics: [],
    preview: null,
    badge: null,
  };
}
