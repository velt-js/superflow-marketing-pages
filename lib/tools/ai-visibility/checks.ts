// The twelve checks behind the AI Visibility Checker.
//
// Each check is a pure function from a `CheckContext` to a `Finding`. They do
// no I/O: the engine gathers everything first, then runs the checks. That
// keeps every check trivially testable and means a slow network call can
// never be hidden inside a scoring rule.
//
// Copy rules for every string that reaches the UI: short sentences, plain
// words, no em dashes. `why` is one sentence. `fix` is instructions.

import { ANSWER_BOTS, TRAINING_BOTS, findBot } from "@/lib/toolkit/bots";
import {
  buildUnblockSnippet,
  evaluateAllBots,
  type RobotsFetchResult,
} from "@/lib/toolkit/robots";
import { buildIdentitySnippet, type SchemaAnalysis } from "@/lib/toolkit/schema";
import { buildLlmsTxtStub, type LlmsTxtValidation } from "@/lib/toolkit/llmstxt";
import { looksLikeClientRenderedShell, type Heading, type MetaTags } from "@/lib/toolkit/html";
import type { DetectionResult } from "@/lib/toolkit/detect";
import type { SitemapResult } from "@/lib/toolkit/sitemap";
import { platformFixFor } from "./platform-fixes";
import {
  CHECK_CATEGORY,
  CHECK_POINTS,
  pointsFor,
  serializeVerdict,
  type CheckId,
  type CheckStatus,
  type Finding,
  type FindingDetail,
} from "./types";

/** Everything the checks need, gathered once by the engine. */
export type CheckContext = {
  requestedUrl: string;
  finalUrl: string;
  origin: string;
  /** Path plus query, which is what robots.txt rules match against. */
  path: string;
  html: string;
  headers: Record<string, string>;
  httpStatus: number;
  meta: MetaTags;
  headings: Heading[];
  schema: SchemaAnalysis;
  detection: DetectionResult;
  robots: RobotsFetchResult;
  sitemap: SitemapResult;
  llmsTxt: LlmsTxtValidation;
  /** Visible text extracted from the raw HTML. */
  rawText: string;
  /** Visible text from the rendered DOM, when a render succeeded. */
  renderedText: string | null;
  /** Why rendering was unavailable, when it was. */
  renderUnavailableReason: string | null;
  firewall: {
    browserStatus: number | null;
    botStatus: number | null;
    blocked: boolean;
  };
};

/**
 * Assembles a finding, filling in the category, weight, and points.
 *
 * @param input - The check's own outputs.
 */
function finding(input: {
  id: CheckId;
  status: CheckStatus;
  title: string;
  why: string;
  fix: string;
  effort: Finding["effort"];
  platform: DetectionResult["platform"];
  fixSnippet?: string;
  fixLanguage?: Finding["fixLanguage"];
  detail?: FindingDetail;
}): Finding {
  const maxPoints = CHECK_POINTS[input.id];
  return {
    id: input.id,
    category: CHECK_CATEGORY[input.id],
    status: input.status,
    title: input.title,
    why: input.why,
    fix: input.fix,
    fixSnippet: input.fixSnippet,
    fixLanguage: input.fixLanguage,
    platformFix:
      input.status === "pass"
        ? undefined
        : platformFixFor(input.id, input.platform),
    effort: input.effort,
    points: pointsFor(input.status, maxPoints),
    maxPoints,
    detail: input.detail,
  };
}

/**
 * A1: does robots.txt let AI crawlers in?
 *
 * A missing robots.txt is a PASS. Absence allows everything, and scoring it
 * as a failure would teach people to add a file they do not need.
 */
export function checkRobotsBotRules(context: CheckContext): Finding {
  try {
    const { robots, path, detection } = context;

    const answerVerdicts = evaluateAllBots(robots.parsed, path, ANSWER_BOTS);
    const trainingVerdicts = evaluateAllBots(robots.parsed, path, TRAINING_BOTS);
    const verdicts = [
      ...answerVerdicts.map((verdict) => serializeVerdict(verdict, "answer")),
      ...trainingVerdicts.map((verdict) => serializeVerdict(verdict, "training")),
    ];
    const detail: FindingDetail = { kind: "bot-table", verdicts };

    if (!robots.found) {
      return finding({
        id: "A1",
        status: "pass",
        title: "No robots.txt, so nothing is blocked",
        why: "When robots.txt is missing, crawlers treat everything as allowed, which is what you want for AI visibility.",
        fix: "Nothing to do. If you add a robots.txt later, make sure it does not disallow the crawlers listed below.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    const blockedAnswer = answerVerdicts.filter((verdict) => !verdict.allowed);
    const blockedTraining = trainingVerdicts.filter(
      (verdict) => !verdict.allowed,
    );

    if (blockedAnswer.length > 0) {
      const tokens = blockedAnswer.map((verdict) => verdict.bot.token);
      const names = tokens.slice(0, 3).join(", ");
      const suffix = tokens.length > 3 ? ` and ${tokens.length - 3} more` : "";

      return finding({
        id: "A1",
        status: "fail",
        title: `robots.txt blocks ${tokens.length} AI ${tokens.length === 1 ? "crawler" : "crawlers"} that answer questions`,
        why: `Blocking ${names}${suffix} removes you from the answers those systems give, not just from their training data.`,
        fix: "Allow the blocked crawlers below. Put the Allow rules above any broader Disallow, because the longest matching rule wins.",
        fixSnippet: buildUnblockSnippet(tokens),
        fixLanguage: "txt",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (blockedTraining.length > 0) {
      const tokens = blockedTraining.map((verdict) => verdict.bot.token);
      return finding({
        id: "A1",
        status: "warn",
        title: `robots.txt blocks ${tokens.length} training ${tokens.length === 1 ? "crawler" : "crawlers"}`,
        why: `You are blocking ${tokens.join(", ")}, which keeps your content out of model training but does not affect whether AI systems can cite you.`,
        fix: "This is a legitimate choice and it costs you nothing in AI answers. Leave it if it was deliberate. If it was not, remove those rules.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "A1",
      status: "pass",
      title: "robots.txt allows every AI crawler we check",
      why: "Every answer engine and every training crawler in our list can read this page.",
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "A1",
      status: "unknown",
      title: "Could not evaluate robots.txt",
      why: "Something went wrong reading the rules, so we are not reporting a result rather than guessing.",
      fix: "Re-run the check. If it keeps happening, your robots.txt may be malformed.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/**
 * A2: the firewall test. Fetch the same URL as a browser and as GPTBot and
 * compare. This is the headline check because it catches the failure nobody
 * can see from inside their own CMS: robots.txt says yes, the CDN says no.
 */
export function checkFirewall(context: CheckContext): Finding {
  try {
    const { firewall, detection } = context;
    const detail: FindingDetail = {
      kind: "firewall",
      browserStatus: firewall.browserStatus,
      botStatus: firewall.botStatus,
      blocked: firewall.blocked,
    };

    if (firewall.browserStatus === null) {
      return finding({
        id: "A2",
        status: "unknown",
        title: "Could not run the firewall test",
        why: "We could not load the page as a browser, so there is nothing to compare the crawler request against.",
        fix: "Re-run the check once the site is responding.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (firewall.blocked) {
      return finding({
        id: "A2",
        status: "fail",
        title: "Your CDN or firewall is silently blocking AI crawlers",
        why: `A browser gets ${firewall.browserStatus} and GPTBot gets ${firewall.botStatus}, so the block is happening at your edge, not in robots.txt.`,
        fix: "In Cloudflare this is usually the AI Scrapers and Crawlers toggle under Security, Bots. Turn it off, or add a WAF exception for the crawlers you want. Other CDNs have an equivalent bot-management rule.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (firewall.botStatus === null) {
      return finding({
        id: "A2",
        status: "warn",
        title: "The crawler request did not complete",
        why: "The request sent as GPTBot timed out or failed while the browser request succeeded, which can mean rate limiting at the edge.",
        fix: "Re-run the check. If it keeps failing only for the crawler user agent, look at your CDN's bot rules.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (firewall.botStatus !== firewall.browserStatus) {
      return finding({
        id: "A2",
        status: "warn",
        title: "AI crawlers get a different response than browsers",
        why: `A browser gets ${firewall.browserStatus} and GPTBot gets ${firewall.botStatus}, which suggests something at the edge treats crawlers differently.`,
        fix: "Check your CDN's bot rules and any redirect logic that branches on user agent.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "A2",
      status: "pass",
      title: "AI crawlers get the same response as browsers",
      why: `Both a browser and GPTBot get ${firewall.browserStatus}, so nothing at your edge is filtering crawlers.`,
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "A2",
      status: "unknown",
      title: "Could not run the firewall test",
      why: "The comparison did not complete, so we are not reporting a result.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** A3: is there a valid llms.txt at the site root? */
export function checkLlmsTxt(context: CheckContext): Finding {
  try {
    const { llmsTxt, detection, meta, origin } = context;
    const detail: FindingDetail = { kind: "llms-txt", validation: llmsTxt };

    const siteName =
      meta.openGraph["site_name"] ??
      context.schema.organizationName ??
      meta.title ??
      new URL(origin).hostname;

    if (!llmsTxt.found) {
      return finding({
        id: "A3",
        status: "fail",
        title: "No llms.txt found",
        why: "llms.txt is the emerging convention for telling AI systems what your site is and which pages matter, in one file they can read cheaply.",
        fix: "Generate one with our llms.txt generator, then put it at the root of your domain.",
        fixSnippet: buildLlmsTxtStub({
          siteName,
          siteUrl: origin,
          description: meta.description ?? undefined,
        }),
        fixLanguage: "txt",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    const failures = llmsTxt.rules.filter((rule) => rule.status === "fail");
    if (failures.length > 0) {
      return finding({
        id: "A3",
        status: "warn",
        title: `llms.txt exists but ${failures.length} ${failures.length === 1 ? "rule fails" : "rules fail"}`,
        why: `The file is there, but ${failures[0].detail.charAt(0).toLowerCase()}${failures[0].detail.slice(1)}`,
        fix: "Fix the failing rules listed below, or regenerate the file with our llms.txt generator.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "A3",
      status: "pass",
      title: "llms.txt is present and valid",
      why: "AI systems can read a clean index of your site in one request.",
      fix: "Nothing to do. Regenerate it when your site structure changes.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "A3",
      status: "unknown",
      title: "Could not check llms.txt",
      why: "The request did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** A4: is there a reachable, valid sitemap? */
export function checkSitemap(context: CheckContext): Finding {
  try {
    const { sitemap, detection } = context;

    if (!sitemap.found) {
      return finding({
        id: "A4",
        status: "fail",
        title: "No sitemap.xml found",
        why: "A sitemap is how crawlers discover pages that are not linked from your homepage.",
        fix: "Publish a sitemap at /sitemap.xml and reference it from robots.txt with a Sitemap: line. Most platforms generate one for you.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    if (!sitemap.validXml) {
      return finding({
        id: "A4",
        status: "fail",
        title: "The sitemap is not valid XML",
        why: `Something is served at ${sitemap.url}, but it is not a sitemap, so crawlers get nothing from it.`,
        fix: "Your host is probably serving the site shell at that path. Publish a real sitemap, or point robots.txt at the correct URL.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    const count = sitemap.isIndex
      ? sitemap.childSitemaps.length
      : sitemap.entries.length;

    return finding({
      id: "A4",
      status: "pass",
      title: sitemap.isIndex
        ? `Sitemap index found with ${count} ${count === 1 ? "sitemap" : "sitemaps"}`
        : `Sitemap found with ${count} ${count === 1 ? "URL" : "URLs"}`,
      why: "Crawlers can discover your pages without relying on internal links alone.",
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
    });
  } catch {
    return finding({
      id: "A4",
      status: "unknown",
      title: "Could not check the sitemap",
      why: "The request did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/**
 * R1: how much of the page needs JavaScript?
 *
 * The scariest and most persuasive finding in the report, so it is also the
 * one where a made-up number would do the most damage. With a render service
 * we report a measured percentage. Without one we report a heuristic verdict
 * and say so, and the check scores as `unknown` rather than inventing points.
 */
export function checkJsDependency(context: CheckContext): Finding {
  try {
    const { rawText, renderedText, detection, renderUnavailableReason } = context;

    if (renderedText === null) {
      const shell = looksLikeClientRenderedShell(context.html);
      const detail: FindingDetail = {
        kind: "js-dependency",
        visibleWithoutJs: null,
        rawTextLength: rawText.length,
        renderedTextLength: 0,
        heuristic: true,
      };

      if (shell) {
        return finding({
          id: "R1",
          status: "unknown",
          title: "This page looks like it needs JavaScript to show anything",
          why: `The HTML contains almost no text (${rawText.length} characters) and mounts into an empty container, which is the signature of a page built entirely in the browser.`,
          fix: "Most AI crawlers do not run JavaScript. Move your headings and body copy into the server-rendered HTML. We could not measure the exact split on this run.",
          effort: "project",
          platform: detection.platform,
          detail,
        });
      }

      return finding({
        id: "R1",
        status: "unknown",
        title: "Could not measure JavaScript dependency",
        why:
          renderUnavailableReason ??
          "We could not render the page in a real browser, so we cannot compare it against the raw HTML.",
        fix: `The raw HTML has ${rawText.length} characters of visible text. If that looks close to the whole page, you are fine. Re-run later for a measured result.`,
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    // Both sides go through the same extractor, so systematic bias cancels.
    const renderedLength = renderedText.length;
    const rawLength = rawText.length;

    // A rendered page shorter than the raw HTML means the render lost
    // content (a consent wall, a failed hydration). Clamp rather than report
    // above 100 percent, which reads as a bug.
    const ratio =
      renderedLength === 0 ? 1 : Math.min(1, rawLength / renderedLength);
    const percent = Math.round(ratio * 100);

    const detail: FindingDetail = {
      kind: "js-dependency",
      visibleWithoutJs: percent,
      rawTextLength: rawLength,
      renderedTextLength: renderedLength,
      heuristic: false,
    };

    if (percent >= 90) {
      return finding({
        id: "R1",
        status: "pass",
        title: `${percent}% of your content is visible without JavaScript`,
        why: "Most AI crawlers do not run JavaScript, and this page does not need it.",
        fix: "Nothing to do.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (percent >= 60) {
      return finding({
        id: "R1",
        status: "warn",
        title: `${100 - percent}% of your content is invisible without JavaScript`,
        why: "Most AI crawlers do not run JavaScript, so that portion of the page never reaches them.",
        fix: "Find what is loading in the browser rather than on the server. Sections fed by client-side data fetching are the usual cause.",
        effort: "hour",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "R1",
      status: "fail",
      title: `${100 - percent}% of your content is invisible without JavaScript`,
      why: "Most AI crawlers do not run JavaScript, so they see a nearly empty page where your visitors see a full one.",
      fix: "Move your content into the server-rendered HTML. This is the single highest-impact change on this report.",
      effort: "project",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "R1",
      status: "unknown",
      title: "Could not measure JavaScript dependency",
      why: "The comparison did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/**
 * R2: the platform verdict.
 *
 * When R1 produced a real measurement, that measurement decides this check
 * too: proof beats a prior about the platform. The platform note is still
 * shown, because it is what makes the fix actionable.
 */
export function checkPlatformVerdict(
  context: CheckContext,
  jsFinding: Finding,
): Finding {
  try {
    const { detection } = context;
    const platformLabel =
      detection.platformConfidence === "likely"
        ? `${detection.platformName} (likely)`
        : detection.platformName;

    const title =
      detection.platform === "unknown"
        ? "Platform not identified"
        : `Built with ${platformLabel}`;

    if (jsFinding.status === "pass") {
      return finding({
        id: "R2",
        status: "pass",
        title,
        why: detection.crawlerNote,
        fix: "Nothing to do.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    if (jsFinding.status === "fail") {
      return finding({
        id: "R2",
        status: "fail",
        title,
        why: detection.crawlerNote,
        fix: "Use the platform steps below to move your content into the server-rendered HTML.",
        effort: "project",
        platform: detection.platform,
      });
    }

    // Warning or unknown: fall back to what the platform implies.
    const status: CheckStatus =
      detection.renderMode === "server"
        ? "pass"
        : detection.renderMode === "client"
          ? "fail"
          : "warn";

    return finding({
      id: "R2",
      status,
      title,
      why: detection.crawlerNote,
      fix:
        status === "pass"
          ? "Nothing to do."
          : "Check which parts of the page appear only after JavaScript runs, then move that copy into the server-rendered HTML.",
      effort: status === "pass" ? "minutes" : "hour",
      platform: detection.platform,
    });
  } catch {
    return finding({
      id: "R2",
      status: "unknown",
      title: "Could not determine the platform",
      why: "Detection did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: "unknown",
    });
  }
}

/** Bounds the title and description lengths are judged against. */
const TITLE_MIN = 15;
const TITLE_MAX = 70;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 165;

/**
 * R3: title and meta description present in the RAW HTML.
 *
 * The raw HTML part matters: a title injected by JavaScript is invisible to
 * the crawlers this tool is about, even though it looks correct in DevTools.
 */
export function checkTitleAndDescription(context: CheckContext): Finding {
  try {
    const { meta, detection } = context;
    const title = meta.title;
    const description = meta.description;
    const detail: FindingDetail = { kind: "meta", title, description };

    const problems: string[] = [];
    if (!title) {
      problems.push("there is no title tag");
    } else if (title.length < TITLE_MIN) {
      problems.push(`the title is only ${title.length} characters`);
    } else if (title.length > TITLE_MAX) {
      problems.push(`the title is ${title.length} characters and will be cut off`);
    }

    if (!description) {
      problems.push("there is no meta description");
    } else if (description.length < DESCRIPTION_MIN) {
      problems.push(`the description is only ${description.length} characters`);
    } else if (description.length > DESCRIPTION_MAX) {
      problems.push(
        `the description is ${description.length} characters and will be cut off`,
      );
    }

    if (!title || !description) {
      return finding({
        id: "R3",
        status: "fail",
        title: !title && !description
          ? "No title or meta description in the HTML"
          : !title
            ? "No title tag in the HTML"
            : "No meta description in the HTML",
        why: "These two lines are what an answer engine quotes when it introduces your page, and they have to be in the HTML, not added later by JavaScript.",
        fix: `Add a title of ${TITLE_MIN} to ${TITLE_MAX} characters and a description of ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} characters.`,
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (problems.length > 0) {
      return finding({
        id: "R3",
        status: "warn",
        title: "Title or description is outside the useful length",
        why: `Both tags are present, but ${problems.join(" and ")}.`,
        fix: `Aim for a title of ${TITLE_MIN} to ${TITLE_MAX} characters and a description of ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX} characters.`,
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "R3",
      status: "pass",
      title: "Title and meta description are in the HTML and well sized",
      why: "An answer engine has a clean summary to quote without running any JavaScript.",
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "R3",
      status: "unknown",
      title: "Could not read the title and description",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** S1: exactly one H1, and no skipped heading levels below it. */
export function checkHeadings(context: CheckContext): Finding {
  try {
    const { headings, detection } = context;
    const h1Count = headings.filter((heading) => heading.level === 1).length;

    const skipped: string[] = [];
    let previous = 0;
    for (const heading of headings) {
      if (previous > 0 && heading.level > previous + 1) {
        skipped.push(`H${previous} to H${heading.level}`);
      }
      previous = heading.level;
    }

    const detail: FindingDetail = {
      kind: "headings",
      h1Count,
      skippedLevels: skipped,
    };

    if (h1Count === 0) {
      return finding({
        id: "S1",
        status: "fail",
        title: "This page has no H1",
        why: "The H1 is the strongest signal of what a page is about, and an answer engine uses it to decide what question the page answers.",
        fix: "Add exactly one H1 that states what the page is about.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (h1Count > 1) {
      return finding({
        id: "S1",
        status: "fail",
        title: `This page has ${h1Count} H1 headings`,
        why: "More than one H1 means there is no single answer to what the page is about.",
        fix: "Keep one H1 and demote the rest to H2.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (skipped.length > 0) {
      return finding({
        id: "S1",
        status: "warn",
        title: "Heading levels skip a step",
        why: `The outline jumps from ${skipped[0]}, which makes the page structure ambiguous to anything reading it as a hierarchy.`,
        fix: "Use heading levels in order. Style them however you like, but do not skip levels to get a smaller font.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "S1",
      status: "pass",
      title: "One H1 and a clean heading outline",
      why: "The page structure reads as a clear hierarchy.",
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "S1",
      status: "unknown",
      title: "Could not read the headings",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** S2: is there valid structured data, and does it establish identity? */
export function checkStructuredData(context: CheckContext): Finding {
  try {
    const { schema, detection, meta, origin } = context;
    const detail: FindingDetail = {
      kind: "schema",
      types: schema.types,
      parseErrors: schema.errors.map(
        (error) => `Block ${error.index + 1}: ${error.message}`,
      ),
    };

    const siteName =
      meta.openGraph["site_name"] ?? meta.title ?? new URL(origin).hostname;
    const snippet = buildIdentitySnippet({ siteName, siteUrl: origin });

    if (schema.errors.length > 0 && schema.blocks.length === 0) {
      return finding({
        id: "S2",
        status: "fail",
        title: "Your structured data does not parse",
        why: `All ${schema.errors.length} JSON-LD ${schema.errors.length === 1 ? "block has" : "blocks have"} a syntax error, so every consumer ignores them silently.`,
        fix: "Fix the JSON syntax. The specific parser errors are listed below.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (schema.blocks.length === 0) {
      return finding({
        id: "S2",
        status: "fail",
        title: "No structured data on this page",
        why: "Structured data is how an answer engine knows the words on your page refer to a specific company, product, or article.",
        fix: "Add Organization and WebSite schema to every page, then add page-type schema like Article or Product where it applies.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "hour",
        platform: detection.platform,
        detail,
      });
    }

    if (schema.errors.length > 0) {
      return finding({
        id: "S2",
        status: "warn",
        title: `${schema.errors.length} structured data ${schema.errors.length === 1 ? "block does" : "blocks do"} not parse`,
        why: "A block with a syntax error is skipped without any warning, so you get none of its benefit.",
        fix: "Fix the JSON syntax in the blocks listed below.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (!schema.hasOrganization && !schema.hasWebSite) {
      return finding({
        id: "S2",
        status: "warn",
        title: "Structured data is present but does not identify you",
        why: `The page declares ${schema.types.slice(0, 3).join(", ")}, but nothing says who publishes it.`,
        fix: "Add Organization and WebSite schema so an answer engine can attribute this content to your company.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    const extra =
      schema.notableTypes.length > 0
        ? ` It also declares ${schema.notableTypes.slice(0, 3).join(", ")}.`
        : "";

    return finding({
      id: "S2",
      status: "pass",
      title: "Valid structured data that identifies the publisher",
      why: `The page declares ${schema.hasOrganization ? "Organization" : "WebSite"} schema and every block parses.${extra}`,
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "S2",
      status: "unknown",
      title: "Could not read the structured data",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** Heading text that reads like a question. */
const QUESTION_PREFIX = /^(what|how|why|when|which|who|where|can|do|does|is|are|should)\b/i;

/**
 * S3: is the content shaped like an answer?
 *
 * Scored proportionally across five signals, because "answer-shaped" is a
 * spectrum and a binary pass or fail would be arbitrary.
 */
export function checkAnswerShape(context: CheckContext): Finding {
  try {
    const { html, headings, schema, detection } = context;

    const questionHeadings = headings.filter(
      (heading) =>
        heading.level > 1 &&
        (QUESTION_PREFIX.test(heading.text) || heading.text.endsWith("?")),
    ).length;

    const hasList = /<(ul|ol)\b/i.test(html);
    const hasTable = /<table\b/i.test(html);
    const hasDates =
      /"date(Published|Modified)"/i.test(html) ||
      /<time\b[^>]*\bdatetime=/i.test(html);
    const hasAuthor =
      /"author"\s*:/i.test(html) ||
      schema.types.some((type) => type.toLowerCase() === "person") ||
      /\brel=["']author["']/i.test(html);

    const detail: FindingDetail = {
      kind: "answer-shape",
      questionHeadings,
      hasList,
      hasTable,
      hasDates,
      hasAuthor,
    };

    const signals = [
      questionHeadings > 0,
      hasList || hasTable,
      hasDates,
      hasAuthor,
    ];
    const met = signals.filter(Boolean).length;

    const missing: string[] = [];
    if (questionHeadings === 0) missing.push("headings phrased as questions");
    if (!hasList && !hasTable) missing.push("a list or table");
    if (!hasDates) missing.push("a published or updated date");
    if (!hasAuthor) missing.push("an author");

    if (met >= 4) {
      return finding({
        id: "S3",
        status: "pass",
        title: "Content is shaped like an answer",
        why: "Question headings, scannable structure, dates, and an author all make a page easy to quote.",
        fix: "Nothing to do.",
        effort: "minutes",
        platform: detection.platform,
        detail,
      });
    }

    if (met >= 2) {
      return finding({
        id: "S3",
        status: "warn",
        title: "Content is partly shaped like an answer",
        why: `Answer engines quote pages that state a question and answer it directly. This page is missing ${missing.join(", ")}.`,
        fix: "Add a heading that asks the question this page answers, then answer it in the first two sentences below that heading.",
        effort: "hour",
        platform: detection.platform,
        detail,
      });
    }

    return finding({
      id: "S3",
      status: "fail",
      title: "Content is not shaped like an answer",
      why: `Answer engines quote pages that ask a question and answer it directly. This page is missing ${missing.join(", ")}.`,
      fix: "Add question-shaped subheadings, answer each one in the first two sentences below it, and publish an author and a last-updated date.",
      effort: "project",
      platform: detection.platform,
      detail,
    });
  } catch {
    return finding({
      id: "S3",
      status: "unknown",
      title: "Could not assess the content shape",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/**
 * I1: does the page establish a consistent brand identity?
 *
 * Checks Organization schema, its `sameAs` profiles, and whether the brand
 * name is consistent across the title, the schema, and og:site_name.
 */
export function checkBrandIdentity(context: CheckContext): Finding {
  try {
    const { schema, meta, detection, origin } = context;

    const siteName = meta.openGraph["site_name"] ?? null;
    const schemaName = schema.organizationName;
    const siteHost = (() => {
      try {
        return new URL(origin).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })();

    const snippet = buildIdentitySnippet({
      siteName: schemaName ?? siteName ?? siteHost,
      siteUrl: origin,
    });

    if (!schema.hasOrganization) {
      return finding({
        id: "I1",
        status: "fail",
        title: "No Organization schema",
        why: "Without it, an answer engine has no structured way to know who publishes this site or how to name you in a citation.",
        fix: "Add Organization schema with your name, URL, logo, and sameAs links to your social profiles.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "minutes",
        platform: detection.platform,
        detail: { kind: "schema", types: schema.types, parseErrors: [] },
      });
    }

    // Compare names loosely: punctuation and case differences are not drift.
    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const names = [schemaName, siteName].filter(
      (name): name is string => typeof name === "string" && name.length > 0,
    );
    const inconsistent =
      names.length > 1 &&
      new Set(names.map(normalize)).size > 1;

    if (schema.sameAs.length === 0 && inconsistent) {
      return finding({
        id: "I1",
        status: "fail",
        title: "Brand identity is incomplete and inconsistent",
        why: `Organization schema has no sameAs profiles, and the name differs between your schema ("${schemaName}") and og:site_name ("${siteName}").`,
        fix: "Use one brand name everywhere, and add sameAs links to your LinkedIn, X, and other official profiles.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    if (schema.sameAs.length === 0) {
      return finding({
        id: "I1",
        status: "warn",
        title: "Organization schema has no sameAs links",
        why: "sameAs links are how an answer engine confirms that your site, your LinkedIn, and your X account are the same company.",
        fix: "Add a sameAs array with your official profile URLs.",
        fixSnippet: snippet,
        fixLanguage: "html",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    if (inconsistent) {
      return finding({
        id: "I1",
        status: "warn",
        title: "Your brand name is not consistent",
        why: `The schema says "${schemaName}" and og:site_name says "${siteName}", which weakens the link between the two.`,
        fix: "Use one brand name in the title, the Organization schema, and og:site_name.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    return finding({
      id: "I1",
      status: "pass",
      title: `Brand identity is clear with ${schema.sameAs.length} linked ${schema.sameAs.length === 1 ? "profile" : "profiles"}`,
      why: "An answer engine can confirm who you are and name you consistently in a citation.",
      fix: "Nothing to do.",
      effort: "minutes",
      platform: detection.platform,
    });
  } catch {
    return finding({
      id: "I1",
      status: "unknown",
      title: "Could not assess brand identity",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/** I2: are the Open Graph tags present? */
export function checkOpenGraph(context: CheckContext): Finding {
  try {
    const { meta, detection } = context;
    const og = meta.openGraph;

    const missing = ["title", "description", "image"].filter(
      (key) => !og[key] || og[key].length === 0,
    );

    if (missing.length === 3) {
      return finding({
        id: "I2",
        status: "fail",
        title: "No Open Graph tags",
        why: "Every link to this page, in a chat answer or a Slack message, renders as a bare URL with no title or image.",
        fix: "Add og:title, og:description, and og:image. Our social preview checker shows you exactly how the result looks on each platform.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    if (missing.length > 0) {
      return finding({
        id: "I2",
        status: "warn",
        title: `Missing ${missing.map((key) => `og:${key}`).join(" and ")}`,
        why: "Partial Open Graph tags produce a partial preview, and og:image is the one people notice.",
        fix: "Add the missing tags. Our social preview checker shows the result on each platform.",
        effort: "minutes",
        platform: detection.platform,
      });
    }

    return finding({
      id: "I2",
      status: "pass",
      title: "Open Graph tags are present",
      why: "Links to this page render with a title, a description, and an image.",
      fix: "Nothing to do. Check how they actually render with our social preview checker.",
      effort: "minutes",
      platform: detection.platform,
    });
  } catch {
    return finding({
      id: "I2",
      status: "unknown",
      title: "Could not read the Open Graph tags",
      why: "Parsing did not complete.",
      fix: "Re-run the check.",
      effort: "minutes",
      platform: context.detection.platform,
    });
  }
}

/**
 * Runs every check in report order.
 *
 * @param context - The gathered page data.
 */
export function runAllChecks(context: CheckContext): Finding[] {
  const jsFinding = checkJsDependency(context);

  return [
    checkRobotsBotRules(context),
    checkFirewall(context),
    checkLlmsTxt(context),
    checkSitemap(context),
    jsFinding,
    checkPlatformVerdict(context, jsFinding),
    checkTitleAndDescription(context),
    checkHeadings(context),
    checkStructuredData(context),
    checkAnswerShape(context),
    checkBrandIdentity(context),
    checkOpenGraph(context),
  ];
}

/** Re-exported so the engine can look up a bot without importing the registry. */
export { findBot };
