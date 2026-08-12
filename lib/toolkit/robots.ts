// robots.txt fetching, parsing, and per-bot evaluation.
//
// Implements the matching rules crawlers actually use (RFC 9309, which is
// what Google, OpenAI, and Anthropic all follow):
//
//   - Group selection: the group whose `User-agent` token is the LONGEST
//     match for the crawler wins. `*` is the fallback, never a merge. A
//     crawler obeys exactly one group.
//   - Rule selection: within that group, the LONGEST matching path pattern
//     wins, regardless of the order rules appear in.
//   - Ties go to Allow. This is why `Disallow: /` plus `Allow: /` is an
//     allow, and it is the single most common thing a naive parser gets
//     backwards.
//   - `*` matches any run of characters, `$` anchors to end of path.
//   - An empty `Disallow:` value means "allow everything" and must not be
//     treated as a zero-length prefix match on everything.
//
// Getting this wrong in either direction is a credibility problem: telling an
// agency their site blocks ChatGPT when it does not is worse than saying
// nothing at all.

import { fetchUrl } from "./fetcher";
import { ALL_BOTS, SUPERFLOW_USER_AGENT, type BotDefinition } from "./bots";
import { originOf } from "./url";

export type RobotsRule = {
  type: "allow" | "disallow";
  /** The raw pattern as written in the file. */
  pattern: string;
};

export type RobotsGroup = {
  /** Lowercased user-agent tokens this group applies to. */
  agents: string[];
  rules: RobotsRule[];
  /** `Crawl-delay` if present, in seconds. */
  crawlDelay?: number;
};

export type ParsedRobots = {
  groups: RobotsGroup[];
  /** Absolute sitemap URLs declared with `Sitemap:`. */
  sitemaps: string[];
  /** Lines we could not classify, kept for diagnostics. */
  unknownDirectives: string[];
};

export type RobotsFetchResult = {
  /** True when robots.txt returned 200 with content. */
  found: boolean;
  /** The HTTP status, or null when the request failed outright. */
  status: number | null;
  url: string;
  raw: string;
  parsed: ParsedRobots;
};

export type BotVerdict = {
  bot: BotDefinition;
  allowed: boolean;
  /** The rule that decided it, or null when nothing matched (default allow). */
  matchedRule: RobotsRule | null;
  /** The user-agent token of the group that applied, or null for none. */
  matchedGroup: string | null;
};

/** Directives that take a path pattern. */
const PATH_DIRECTIVES = new Set(["allow", "disallow"]);

/**
 * Parses robots.txt text into groups, sitemaps, and leftovers.
 *
 * @param text - The raw file contents.
 */
export function parseRobots(text: string): ParsedRobots {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  const unknownDirectives: string[] = [];

  try {
    let current: RobotsGroup | null = null;
    // Consecutive `User-agent` lines share one group. Once a rule appears,
    // the next `User-agent` starts a fresh group.
    let acceptingAgents = false;

    for (const rawLine of (text ?? "").split(/\r?\n/)) {
      // Comments run to end of line and may follow a value.
      const line = rawLine.split("#")[0].trim();
      if (line.length === 0) continue;

      const separator = line.indexOf(":");
      if (separator === -1) {
        unknownDirectives.push(line);
        continue;
      }

      const field = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();

      if (field === "user-agent") {
        if (!acceptingAgents || current === null) {
          current = { agents: [], rules: [] };
          groups.push(current);
          acceptingAgents = true;
        }
        if (value.length > 0) {
          current.agents.push(value.toLowerCase());
        }
        continue;
      }

      if (field === "sitemap") {
        // Sitemap is a top-level directive, not part of any group.
        if (value.length > 0) sitemaps.push(value);
        continue;
      }

      if (PATH_DIRECTIVES.has(field)) {
        if (current === null) {
          // Rules before any `User-agent` line are not addressed to anyone.
          // Crawlers ignore them; so do we, but keep them for diagnostics.
          unknownDirectives.push(line);
          continue;
        }
        acceptingAgents = false;
        current.rules.push({
          type: field === "allow" ? "allow" : "disallow",
          pattern: value,
        });
        continue;
      }

      if (field === "crawl-delay") {
        if (current !== null) {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) current.crawlDelay = parsed;
          acceptingAgents = false;
        }
        continue;
      }

      unknownDirectives.push(line);
    }
  } catch {
    // Fall through with whatever parsed cleanly. A malformed robots.txt is a
    // finding, not a crash.
  }

  return { groups, sitemaps, unknownDirectives };
}

/**
 * Compiles a robots path pattern into a regex.
 *
 * `*` becomes `.*`, a trailing `$` anchors the match, and every other regex
 * metacharacter is escaped so a literal `.` or `?` in a path cannot widen the
 * pattern.
 *
 * @param pattern - The raw pattern from an Allow/Disallow line.
 */
function compilePattern(pattern: string): RegExp {
  try {
    let body = pattern;
    let anchorEnd = false;

    if (body.endsWith("$")) {
      body = body.slice(0, -1);
      anchorEnd = true;
    }

    const escaped = body
      .split("*")
      .map((segment) => segment.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");

    return new RegExp(`^${escaped}${anchorEnd ? "$" : ""}`);
  } catch {
    // An uncompilable pattern matches nothing rather than everything.
    return /(?!)/;
  }
}

/**
 * Effective length of a pattern for specificity comparison. The `$` anchor is
 * not a matched character, so it does not count toward length.
 *
 * @param pattern - The raw pattern.
 */
function specificity(pattern: string): number {
  return pattern.endsWith("$") ? pattern.length - 1 : pattern.length;
}

/**
 * Picks the single group that applies to a crawler: the longest `User-agent`
 * token that is a prefix of the crawler's name, falling back to `*`.
 *
 * Crawlers match on their product token case-insensitively, and a robots.txt
 * that says `User-agent: Google` does apply to `Googlebot`.
 *
 * @param parsed - The parsed file.
 * @param botToken - The crawler's product token, e.g. "GPTBot".
 */
export function selectGroup(
  parsed: ParsedRobots,
  botToken: string,
): { group: RobotsGroup | null; matchedAgent: string | null } {
  try {
    const needle = (botToken ?? "").toLowerCase();
    let best: { group: RobotsGroup; agent: string } | null = null;
    let wildcard: { group: RobotsGroup; agent: string } | null = null;

    for (const group of parsed.groups) {
      for (const agent of group.agents) {
        if (agent === "*") {
          // First wildcard group wins; later duplicates are ignored the same
          // way crawlers ignore them.
          if (wildcard === null) wildcard = { group, agent };
          continue;
        }
        if (needle.startsWith(agent)) {
          if (best === null || agent.length > best.agent.length) {
            best = { group, agent };
          }
        }
      }
    }

    const chosen = best ?? wildcard;
    return chosen
      ? { group: chosen.group, matchedAgent: chosen.agent }
      : { group: null, matchedAgent: null };
  } catch {
    return { group: null, matchedAgent: null };
  }
}

/**
 * Decides whether a group allows a path.
 *
 * Longest matching pattern wins; Allow wins ties; no match means allowed.
 *
 * @param group - The group that applies to the crawler.
 * @param path - The URL path (with query string, if any).
 */
export function evaluatePath(
  group: RobotsGroup | null,
  path: string,
): { allowed: boolean; matchedRule: RobotsRule | null } {
  try {
    if (group === null) {
      return { allowed: true, matchedRule: null };
    }

    let winner: RobotsRule | null = null;
    let winnerLength = -1;

    for (const rule of group.rules) {
      // `Disallow:` with an empty value means "nothing is disallowed". It is
      // not a zero-length pattern that matches every path.
      if (rule.pattern.length === 0) {
        continue;
      }
      if (!compilePattern(rule.pattern).test(path)) {
        continue;
      }

      const length = specificity(rule.pattern);
      if (length > winnerLength) {
        winner = rule;
        winnerLength = length;
        continue;
      }
      // Equal specificity: Allow beats Disallow.
      if (length === winnerLength && rule.type === "allow") {
        winner = rule;
      }
    }

    if (winner === null) {
      return { allowed: true, matchedRule: null };
    }
    return { allowed: winner.type === "allow", matchedRule: winner };
  } catch {
    // Never claim a site is blocked because our parser tripped.
    return { allowed: true, matchedRule: null };
  }
}

/**
 * Evaluates every bot in the registry against a path.
 *
 * @param parsed - The parsed robots.txt.
 * @param path - The path to test, e.g. "/pricing".
 * @param bots - Defaults to the full registry.
 */
export function evaluateAllBots(
  parsed: ParsedRobots,
  path: string,
  bots: readonly BotDefinition[] = ALL_BOTS,
): BotVerdict[] {
  return bots.map((bot) => {
    const { group, matchedAgent } = selectGroup(parsed, bot.token);
    const { allowed, matchedRule } = evaluatePath(group, path);
    return { bot, allowed, matchedRule, matchedGroup: matchedAgent };
  });
}

/**
 * Fetches and parses the robots.txt at a site root.
 *
 * A missing robots.txt is not an error: absence means everything is allowed,
 * and `found: false` with empty groups produces exactly that verdict.
 *
 * @param siteUrl - Any URL on the site.
 */
export async function fetchRobots(siteUrl: string): Promise<RobotsFetchResult> {
  const origin = originOf(siteUrl);
  const robotsUrl = `${origin}robots.txt`;
  const empty: ParsedRobots = {
    groups: [],
    sitemaps: [],
    unknownDirectives: [],
  };

  try {
    const result = await fetchUrl({
      url: robotsUrl,
      userAgent: SUPERFLOW_USER_AGENT,
      // robots.txt is small by definition. A multi-megabyte one is broken.
      maxBytes: 512 * 1024,
      timeoutMs: 8000,
    });

    if (!result.ok) {
      return {
        found: false,
        status: null,
        url: robotsUrl,
        raw: "",
        parsed: empty,
      };
    }

    if (result.status !== 200) {
      return {
        found: false,
        status: result.status,
        url: robotsUrl,
        raw: "",
        parsed: empty,
      };
    }

    // Some hosts answer /robots.txt with the SPA shell. An HTML document is
    // not a robots.txt, and parsing it would invent rules that do not exist.
    const contentType = result.headers["content-type"] ?? "";
    const looksLikeHtml =
      contentType.includes("text/html") ||
      /^\s*<(!doctype|html)\b/i.test(result.body);
    if (looksLikeHtml) {
      return {
        found: false,
        status: result.status,
        url: robotsUrl,
        raw: "",
        parsed: empty,
      };
    }

    return {
      found: true,
      status: result.status,
      url: robotsUrl,
      raw: result.body,
      parsed: parseRobots(result.body),
    };
  } catch {
    return { found: false, status: null, url: robotsUrl, raw: "", parsed: empty };
  }
}

/**
 * Builds a corrected robots.txt block that unblocks every answer-tier bot,
 * offered as a copyable fix when check A1 fails.
 *
 * @param blockedTokens - The answer-tier tokens currently blocked.
 */
export function buildUnblockSnippet(blockedTokens: string[]): string {
  try {
    if (blockedTokens.length === 0) return "";
    const lines = blockedTokens.flatMap((token) => [
      `User-agent: ${token}`,
      "Allow: /",
      "",
    ]);
    return [
      "# Let AI answer engines read the site.",
      "# Add this ABOVE any broader Disallow rules.",
      "",
      ...lines,
    ]
      .join("\n")
      .trimEnd();
  } catch {
    return "";
  }
}
