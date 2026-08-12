// The AI Visibility Checker engine.
//
// Gathers everything about a page in as few round trips as possible, then
// runs the twelve pure checks over the result. Network work is parallelised
// aggressively because the whole tool has a ~15 second budget and most of it
// is waiting.
//
// The engine never throws. A site that is down, slow, or hostile produces a
// report that says so, because a blank page with a stack trace is the one
// outcome that loses the visitor for good.

import { fetchUrl, probeStatus, type RedirectHop } from "@/lib/toolkit/fetcher";
import { resolveUserUrl, originOf, URL_REJECTION_MESSAGES } from "@/lib/toolkit/url";
import {
  BROWSER_USER_AGENT,
  GPTBOT_USER_AGENT,
} from "@/lib/toolkit/bots";
import { fetchRobots } from "@/lib/toolkit/robots";
import { discoverSitemap } from "@/lib/toolkit/sitemap";
import { validateLlmsTxt } from "@/lib/toolkit/llmstxt";
import { analyzeSchema } from "@/lib/toolkit/schema";
import { detect } from "@/lib/toolkit/detect";
import {
  extractVisibleText,
  parseHeadings,
  parseMeta,
} from "@/lib/toolkit/html";
import { isRenderConfigured, renderPage } from "@/lib/toolkit/render";
import { runAllChecks, type CheckContext } from "./checks";
import {
  CATEGORY_META,
  gradeFor,
  REPORT_VERSION,
  type CategoryId,
  type CategoryScore,
  type CheckId,
  type DegradedNotice,
  type Finding,
  type VisibilityReport,
} from "./types";

export { REPORT_VERSION };

/** Ceiling on the whole run, so a slow site cannot hold a request open. */
const TOTAL_BUDGET_MS = 25_000;

export type EngineFailure = {
  ok: false;
  /** Machine-readable so the UI can branch. */
  code:
    | "invalid-url"
    | "unreachable"
    | "http-error"
    | "not-html";
  /** Copy the UI shows. Never blank, never a stack trace. */
  message: string;
  /** Present when we got a response. */
  status?: number;
  finalUrl?: string;
};

export type EngineSuccess = { ok: true; report: VisibilityReport };

export type EngineResult = EngineSuccess | EngineFailure;

/**
 * Turns the findings into per-category scores.
 *
 * @param findings - Every finding from the run.
 */
function summarizeCategories(findings: Finding[]): CategoryScore[] {
  const ids: CategoryId[] = ["access", "readability", "structure", "identity"];

  return ids.map((id) => {
    const own = findings.filter((item) => item.category === id);
    const meta = CATEGORY_META[id];

    // Unknown checks are excluded from the denominator rather than counted as
    // zero. A check we could not run is not evidence of a problem, and
    // scoring it as one would punish a site for our render service being
    // unavailable.
    const scorable = own.filter((item) => item.status !== "unknown");

    return {
      id,
      label: meta.label,
      question: meta.question,
      points: own.reduce((total, item) => total + item.points, 0),
      maxPoints: scorable.reduce((total, item) => total + item.maxPoints, 0),
      passCount: own.filter((item) => item.status === "pass").length,
      warnCount: own.filter((item) => item.status === "warn").length,
      failCount: own.filter((item) => item.status === "fail").length,
      ctaText: meta.ctaText,
    };
  });
}

/**
 * Runs the full check suite against a URL.
 *
 * @param rawUrl - Whatever the user submitted.
 */
export async function runVisibilityCheck(
  rawUrl: string,
): Promise<EngineResult> {
  const startedAt = Date.now();

  try {
    // ── Validate and SSRF-check ──────────────────────────────────────────
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) {
      return {
        ok: false,
        code: "invalid-url",
        message: URL_REJECTION_MESSAGES[resolved.reason],
      };
    }

    const submittedUrl = resolved.url;

    // ── Fetch the page as a browser ──────────────────────────────────────
    const pageResult = await fetchUrl({
      url: submittedUrl,
      userAgent: BROWSER_USER_AGENT,
      timeoutMs: 12_000,
    });

    if (!pageResult.ok) {
      const message =
        pageResult.reason === "timeout"
          ? "The site took too long to respond. It may be slow or temporarily down."
          : pageResult.reason === "too-many-redirects"
            ? "The site redirected too many times, so we stopped following it."
            : pageResult.reason === "redirect-blocked"
              ? "The site redirected to an address that is not reachable from the public internet."
              : "We could not reach that site. Check the URL and try again.";

      return {
        ok: false,
        code: "unreachable",
        message,
        finalUrl: pageResult.finalUrl,
      };
    }

    if (pageResult.status >= 400) {
      // A 403, 406, or 429 to us is usually bot protection reacting to a
      // datacenter IP, not a broken page. Saying "your URL returned 403, so
      // AI crawlers see nothing either" would be a guess stated as a fact:
      // the site may well serve real crawlers fine. Name what we observed
      // and what it usually means, and stop there.
      const isBotBlock =
        pageResult.status === 403 ||
        pageResult.status === 406 ||
        pageResult.status === 429;

      return {
        ok: false,
        code: "http-error",
        message: isBotBlock
          ? `The site returned ${pageResult.status} to our request. That is usually bot protection blocking traffic from datacenter networks. It does not necessarily mean AI crawlers are blocked, but we cannot read the page to check.`
          : `That URL returned ${pageResult.status}, so there is nothing for an AI crawler to read either. Check the URL and try again.`,
        status: pageResult.status,
        finalUrl: pageResult.finalUrl,
      };
    }

    const contentType = pageResult.headers["content-type"] ?? "";
    const isHtml =
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml") ||
      /<html\b/i.test(pageResult.body);

    if (!isHtml) {
      return {
        ok: false,
        code: "not-html",
        message: `That URL returns ${contentType || "a non-HTML file"}, not a web page. Try a page URL instead.`,
        status: pageResult.status,
        finalUrl: pageResult.finalUrl,
      };
    }

    const finalUrl = pageResult.finalUrl;
    const origin = originOf(finalUrl);
    const html = pageResult.body;

    // ── Everything else, in parallel ─────────────────────────────────────
    // These are independent, so the run costs roughly the slowest one rather
    // than the sum. `allSettled` because one failure must not lose the rest.
    const [robotsSettled, llmsSettled, firewallSettled, renderSettled] =
      await Promise.allSettled([
        fetchRobots(finalUrl),
        validateLlmsTxt(finalUrl),
        probeStatus(finalUrl, GPTBOT_USER_AGENT, 10_000),
        isRenderConfigured()
          ? renderPage({ url: finalUrl, screenshot: true, waitMs: 2000 })
          : Promise.resolve(null),
      ]);

    const robots =
      robotsSettled.status === "fulfilled"
        ? robotsSettled.value
        : {
            found: false,
            status: null,
            url: `${origin}robots.txt`,
            raw: "",
            parsed: { groups: [], sitemaps: [], unknownDirectives: [] },
          };

    const llmsTxt =
      llmsSettled.status === "fulfilled"
        ? llmsSettled.value
        : await validateLlmsTxt(finalUrl);

    // Sitemap discovery needs robots.txt first, so it runs after the batch.
    const sitemap = await discoverSitemap({
      siteUrl: finalUrl,
      robotsSitemaps: robots.parsed.sitemaps,
    });

    const firewall = (() => {
      try {
        if (firewallSettled.status !== "fulfilled") {
          return {
            browserStatus: pageResult.status,
            botStatus: null,
            blocked: false,
          };
        }
        const probe = firewallSettled.value;
        return {
          browserStatus: pageResult.status,
          botStatus: probe.status,
          // A block is only a block when the browser got through. If both
          // fail, the site is down, and that is a different finding.
          blocked:
            pageResult.status === 200 &&
            probe.status !== null &&
            (probe.status === 403 ||
              probe.status === 406 ||
              probe.status === 429 ||
              probe.status >= 500),
        };
      } catch {
        return {
          browserStatus: pageResult.status,
          botStatus: null,
          blocked: false,
        };
      }
    })();

    const render =
      renderSettled.status === "fulfilled" ? renderSettled.value : null;

    // ── Parse ────────────────────────────────────────────────────────────
    const meta = parseMeta(html, finalUrl);
    const headings = parseHeadings(html);
    const schema = analyzeSchema(html);
    const detection = detect({
      html,
      headers: pageResult.headers,
      url: finalUrl,
    });
    const rawText = extractVisibleText(html);

    const renderedText = render?.ok ? render.text : null;
    const renderUnavailableReason = render
      ? render.ok
        ? null
        : render.message
      : "Rendering is not enabled on this deployment, so we could not compare the page against a real browser.";

    const path = (() => {
      try {
        const parsed = new URL(finalUrl);
        return `${parsed.pathname}${parsed.search}`;
      } catch {
        return "/";
      }
    })();

    const context: CheckContext = {
      requestedUrl: submittedUrl,
      finalUrl,
      origin,
      path,
      html,
      headers: pageResult.headers,
      httpStatus: pageResult.status,
      meta,
      headings,
      schema,
      detection,
      robots,
      sitemap,
      llmsTxt,
      rawText,
      renderedText,
      renderUnavailableReason,
      firewall,
    };

    // ── Score ────────────────────────────────────────────────────────────
    const findings = runAllChecks(context);
    const categories = summarizeCategories(findings);

    const earned = findings.reduce((total, item) => total + item.points, 0);
    const available = findings
      .filter((item) => item.status !== "unknown")
      .reduce((total, item) => total + item.maxPoints, 0);

    // Normalised so a degraded run is still comparable to a complete one.
    const score =
      available === 0 ? 0 : Math.round((earned / available) * 100);

    const degraded: DegradedNotice[] = [];
    const unknownChecks = findings
      .filter((item) => item.status === "unknown")
      .map((item) => item.id as CheckId);

    if (unknownChecks.length > 0) {
      degraded.push({
        checks: unknownChecks,
        message:
          renderUnavailableReason ??
          "Some checks could not run on this attempt. The score is calculated from the checks that did.",
      });
    }

    if (pageResult.truncated) {
      degraded.push({
        checks: ["R1", "S1", "S2", "S3"],
        message:
          "This page is larger than 5MB, so we read the first 5MB only. Structure checks may be incomplete.",
      });
    }

    const report: VisibilityReport = {
      requestedUrl: submittedUrl,
      finalUrl,
      hostname: (() => {
        try {
          return new URL(finalUrl).hostname;
        } catch {
          return resolved.hostname;
        }
      })(),
      // Declared icon when the page has one, otherwise the /favicon.ico
      // convention. A 404 renders as nothing, which is the right outcome:
      // the alternative is leaking every checked domain to a third-party
      // favicon service.
      faviconUrl: meta.favicon ?? `${origin}favicon.ico`,
      redirects: pageResult.redirects as RedirectHop[],
      httpStatus: pageResult.status,
      score,
      grade: gradeFor(score),
      scoredOutOf: available,
      categories,
      findings,
      detection,
      screenshot: render?.ok ? render.screenshot : null,
      degraded,
      checkedAt: Date.now(),
      durationMs: Date.now() - startedAt,
    };

    return { ok: true, report };
  } catch {
    return {
      ok: false,
      code: "unreachable",
      message:
        "Something went wrong running the check. Try again in a moment.",
    };
  } finally {
    // A soft budget: we do not abort mid-run, but an overrun is worth
    // knowing about when tuning timeouts.
    const elapsed = Date.now() - startedAt;
    if (elapsed > TOTAL_BUDGET_MS && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[ai-visibility] run took ${elapsed}ms, over budget`);
    }
  }
}
