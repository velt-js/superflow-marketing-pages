// The public API and MCP catalogue for the free tools.
//
// WHY THIS EXISTS
//
// Every free tool already has an HTTP endpoint, because the browser UI has to
// call something. What it did not have was a written contract: the endpoints
// were an implementation detail of the pages, documented only in a comment at
// the top of each route and in a `facts` row on some of the tool pages.
//
// This file promotes those endpoints to a product surface. One entry per tool
// describes the endpoint, the arguments, what comes back, and the limits, and
// four things read it:
//
//   1. `app/api/mcp/route.ts`, which serves the same tools over MCP so an
//      agent can call them without anybody writing glue.
//   2. `components/tools/ToolApiDocs.tsx`, the "use it from your terminal or
//      your agent" block on every tool page.
//   3. `app/tools/mcp/page.tsx`, the human documentation page.
//   4. `lib/tools/content/to-markdown.ts`, so the .md copy an agent fetches
//      carries the same contract the page shows a human.
//
// Adding a tool to the API and to MCP therefore means adding one entry here.
//
// AVAILABILITY IS NOT DECLARED HERE
//
// An entry describes an endpoint; whether visitors are told about it is the
// registry's call (`status: "live"`). A tool whose engine is not trustworthy
// yet keeps its entry, stays out of `availableToolApis()`, and so is absent
// from the MCP tool list and from every docs surface until the registry flips
// it. That keeps one definition of "this works" for the whole site.

import { findTool } from "@/lib/tools/registry";

/**
 * The subset of JSON Schema the MCP `inputSchema` field needs. Hand-written
 * rather than generated: these schemas are read by models deciding whether to
 * call a tool, so the descriptions matter more than the types.
 */
export type ToolInputSchema = {
  type: "object";
  properties: Record<string, ToolInputProperty>;
  required?: string[];
  additionalProperties: false;
};

export type ToolInputProperty = {
  type: "string" | "boolean" | "number";
  description: string;
  enum?: string[];
  default?: string | boolean | number;
};

export type ToolApiEntry = {
  /** Registry slug. Ties the endpoint to its page, its status, its docs. */
  slug: string;
  /** MCP tool name. Verb first, snake case, stable — clients bind to it. */
  mcpTool: string;
  /** Human name, matching the registry entry. */
  title: string;
  /**
   * Written for a model choosing between tools, not for a marketing page:
   * what it does, what it returns, and when it is the wrong tool.
   */
  description: string;
  method: "POST";
  /** Path on this site. Always absolute, always starts with a slash. */
  path: string;
  inputSchema: ToolInputSchema;
  /** Example arguments, used verbatim in the curl and MCP snippets. */
  sample: Record<string, string | boolean>;
  /** One line on the response shape, for the docs table. */
  returns: string;
  /** Plain words, e.g. "10 runs per hour per IP". */
  rateLimit: string;
  /**
   * Worst-case wall clock for ONE request. Callers set timeouts from this.
   *
   * It is not how long a run takes: the slowest backend-run tools go on for two
   * to three minutes, well past what a serverless request may hold open, and
   * answer with a `runId` to collect instead. This is how long a caller should
   * be willing to wait for any single answer, finished or pending.
   */
  timeoutSeconds: number;
};

/** The argument every URL-driven tool takes. Identical across the suite. */
const URL_SCHEMA: ToolInputSchema = {
  type: "object",
  properties: {
    url: {
      type: "string",
      description:
        "The page to run against. A bare domain like example.com is fine; https is assumed. Must be a public URL: anything behind a login, on a private network, or on localhost is refused.",
    },
    refresh: {
      type: "boolean",
      description:
        "Skip the 24 hour cache and run again. Costs a rate-limit slot even when a cached result exists, so leave it off unless the page has changed.",
      default: false,
    },
  },
  required: ["url"],
  additionalProperties: false,
};

/**
 * The arguments a BACKEND-RUN tool takes: the URL ones, plus a run handle.
 *
 * These runs are dispatched into the product backend and take from half a
 * minute to three minutes. A request that cannot wait that long answers with
 * `{ status: "pending", runId }` instead, and the caller collects the result by
 * sending that `runId` back to the same tool. See lib/toolkit/deferred-run.ts.
 */
const RUN_SCHEMA: ToolInputSchema = {
  type: "object",
  properties: {
    ...URL_SCHEMA.properties,
    runId: {
      type: "string",
      description:
        "Collect a run that answered with `{ status: \"pending\", runId }` instead of a result. Send the runId back on its own, with no url, and the same tool returns the finished result once the run is done. Costs no rate-limit slot.",
    },
  },
  // `url` stays out of `required` here: a call that carries a runId is
  // collecting a run that already named its URL, and demanding it again would
  // make the second half of the contract impossible to satisfy.
  required: [],
  additionalProperties: false,
};

/** The heavy tier every engine-backed tool sits on. */
const HEAVY_LIMIT = "10 runs per hour per IP";

export const TOOL_APIS: readonly ToolApiEntry[] = [
  {
    slug: "ai-visibility-checker",
    mcpTool: "check_ai_visibility",
    title: "AI Visibility Checker",
    description:
      "Check whether AI assistants (ChatGPT, Claude, Perplexity, Google AI) can reach, read, and cite a web page. Runs the full suite: robots.txt rules per AI crawler, a live firewall test that requests the page as GPTBot, JavaScript dependency, llms.txt, headings, structured data, and author identity. Returns a score out of 100 with a grade, a score per category, and a finding per check with why it matters and how to fix it. Use this for a whole-page verdict; use check_robots_txt_for_ai when the question is only about crawler access.",
    method: "POST",
    path: "/api/tools/ai-visibility",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { score, grade, scoredOutOf, categories[], findings[] with why and fix, detection }, cached, ageSeconds }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "robots-txt-ai-checker",
    mcpTool: "check_robots_txt_for_ai",
    title: "robots.txt AI Checker",
    description:
      "Test a site's robots.txt against every AI crawler that matters (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Googlebot, Bingbot and the rest) and report which are allowed, which are blocked, and which rule decided it. Also runs a firewall test, because CDN-level blocks stop crawlers before robots.txt is ever read. This is the access-scoped view of check_ai_visibility.",
    method: "POST",
    path: "/api/tools/robots-txt-ai-checker",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { accessScore, crawlers[] with the rule that decided each verdict, firewall, findings[] }, cached, ageSeconds }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "llms-txt-generator",
    mcpTool: "generate_llms_txt",
    title: "llms.txt Generator",
    description:
      "Generate llms.txt and llms-full.txt for a site, following the llmstxt.org convention. Inventories the site from its robots.txt, sitemaps, and homepage links, then writes an index file and a full file with page content inlined. Deterministic: no model is involved, so two runs over an unchanged site produce the same bytes. Returns the file contents ready to write to disk.",
    method: "POST",
    path: "/api/tools/llms-txt-generator",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { siteName, llmsTxt, llmsFullTxt, pagesDiscovered, pagesIncluded, truncated }, cached, ageSeconds }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "markdown-for-agents",
    mcpTool: "page_to_markdown",
    title: "Markdown for Agents",
    description:
      "Fetch one web page and convert it to clean CommonMark, with the navigation, cookie banners, and boilerplate stripped out. Use this to read a page as text an agent can reason over, or to publish a .md copy of a page alongside the HTML.",
    method: "POST",
    path: "/api/tools/markdown-for-agents",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { markdown, title, description, wordCount, bytes, truncated, httpStatus }, cached, ageSeconds }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "json-ld-generator",
    mcpTool: "generate_json_ld",
    title: "JSON-LD Generator",
    description:
      "Read a page and write a schema.org JSON-LD block for it, then validate that block against the same checks a validator would run. The markup is model-written from the page's own content and should be reviewed before it is published. Returns the block ready to paste into a <script type=\"application/ld+json\"> tag.",
    method: "POST",
    path: "/api/tools/json-ld-generator",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { detectedType, jsonLd, jsonLdString, validation: { findings[], passed }, model } }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "json-ld-validator",
    mcpTool: "validate_json_ld",
    title: "JSON-LD Validator",
    description:
      "Read the structured data already on a page and check it against Schema.org and what search engines actually accept. Reports every JSON-LD block found, the type of each, and the errors and warnings per block.",
    method: "POST",
    path: "/api/tools/json-ld-validator",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { blockCount, invalidBlockCount, declaredTypes[], eligibility[], categories[], findings[] } }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "social-preview-checker",
    mcpTool: "check_social_preview",
    title: "Social Preview Checker",
    description:
      "Read a page's Open Graph and Twitter card tags and report how the link will render on X, LinkedIn, Facebook, Slack, Discord, and Google. Returns a per-platform preview (title, description, image) plus the findings for tags that are missing, truncated, or the wrong size.",
    method: "POST",
    path: "/api/tools/social-preview",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ ok, report: { previews[] per platform, tags, summary, findings[] }, cached, ageSeconds }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 75,
  },
  {
    slug: "tech-stack-detector",
    mcpTool: "detect_tech_stack",
    title: "Tech Stack Detector",
    description:
      "Identify the platform, framework, CMS, ecommerce apps, analytics, CDN, and hosting behind a site by fingerprinting one page's HTML and response headers. One fetch, no rendering and no crawl, so it answers in about a second. A site behind bot protection is reported as blocked rather than as empty.",
    method: "POST",
    path: "/api/tools/tech-stack",
    inputSchema: URL_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ platformName, theme, apps[], fonts[], analytics[], hosting[], renderMode, url, status, fetchedAt }",
    rateLimit: "60 runs per hour per IP",
    timeoutSeconds: 30,
  },
  {
    slug: "favicon-checker",
    mcpTool: "check_favicon",
    title: "Favicon Checker",
    description:
      "Check whether a site's favicon actually works. Reads every icon declaration in the page head, then fetches each one, the web app manifest, and the implicit /favicon.ico, and identifies the real format and pixel dimensions from each file's header bytes. Catches the failures a status-code check misses: a catch-all route answering an icon path with HTML at HTTP 200, a sizes attribute that disagrees with the file, an icon served over http on an https page. Use this when a favicon is missing or blurry; use check_social_preview for the image that appears when a link is shared.",
    method: "POST",
    path: "/api/tools/favicon-checker",
    inputSchema: URL_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ hasWorkingFavicon, tabIcon, icons[] with format, dimensions, bytes and problem, manifest, themeColor, checks[] with id, status and fix, counts }",
    rateLimit: "60 runs per hour per IP",
    timeoutSeconds: 30,
  },
  {
    slug: "full-page-screenshot",
    mcpTool: "capture_full_page_screenshot",
    title: "Full Page Screenshot",
    description:
      "Capture a full-height PNG of a page in a real headless browser, scrolling first so lazy-loaded content renders. Returns a signed link to the image that expires in about 24 hours; download the bytes if you need to keep them. No watermark and no height cap. Cannot capture anything behind a login.",
    method: "POST",
    path: "/api/tools/full-page-screenshot",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns: "{ imageUrl, expiresAt, bytes, width, height, deviceType }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 90,
  },
  {
    slug: "alt-text-generator",
    mcpTool: "generate_alt_text",
    title: "Alt Text Generator",
    description:
      "Find every image on a page and draft alt text for the ones that need it, using a vision model that actually looks at the image. Lists every image with the alt it has today, the suggested alt, whether it looks decorative, and why any image was skipped. Up to 10 images per run go to the model. The suggestions are drafts for a human to review.",
    method: "POST",
    path: "/api/tools/alt-text-generator",
    inputSchema: RUN_SCHEMA,
    sample: { url: "example.com" },
    returns:
      "{ images[] with src, hadAlt, currentAlt, suggestedAlt, isDecorative, skippedReason; counts; model }",
    rateLimit: HEAVY_LIMIT,
    timeoutSeconds: 90,
  },
  {
    slug: "utm-builder",
    mcpTool: "build_utm_url",
    title: "UTM Builder",
    description:
      "Build a campaign URL with utm parameters, normalised to one tagging convention, and report which GA4 default channel group the link will land in. Warns about the mistakes that silently break reporting: an unrecognised medium that drops traffic into Unassigned, casing that splits one source into several report rows, PII in a campaign name. Pure string work: nothing is fetched and nothing is stored.",
    method: "POST",
    path: "/api/tools/utm-builder",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "The destination page. Existing utm parameters on it are rewritten; any other query parameter is left alone.",
        },
        source: {
          type: "string",
          description: "utm_source. Where the traffic comes from, e.g. newsletter.",
        },
        medium: {
          type: "string",
          description:
            "utm_medium. How it gets there, e.g. email, cpc, social. This is the field GA4 reads to pick a channel.",
        },
        campaign: {
          type: "string",
          description: "utm_campaign. The campaign name, e.g. spring_launch.",
        },
        id: { type: "string", description: "utm_id. Optional campaign ID." },
        term: { type: "string", description: "utm_term. Optional paid keyword." },
        content: {
          type: "string",
          description: "utm_content. Optional variant, e.g. header_link.",
        },
        caseRule: {
          type: "string",
          description:
            "How values are cased before they go in the URL. Default lower, which is what keeps one source from becoming three report rows.",
          enum: ["lower", "preserve"],
          default: "lower",
        },
        spaceRule: {
          type: "string",
          description: "What happens to spaces inside a value.",
          enum: ["underscore", "hyphen", "preserve"],
          default: "underscore",
        },
        stripPunctuation: {
          type: "boolean",
          description:
            "Drop accents and punctuation that make report rows hard to match.",
          default: true,
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    sample: {
      url: "example.com/pricing",
      source: "newsletter",
      medium: "email",
      campaign: "spring launch",
    },
    returns:
      "{ url, normalized, channel, issues[] with level, field and message }",
    rateLimit: "None. The work is local and costs nothing.",
    timeoutSeconds: 10,
  },
  {
    slug: "md5-generator",
    mcpTool: "hash_md5",
    title: "MD5 Hash Generator",
    description:
      "Hash text to an MD5 hex digest. Useful for checksums, cache keys, dedupe keys, and Gravatar-style identifiers. MD5 is broken for anything security-related: never use it for passwords or to verify authenticity.",
    method: "POST",
    path: "/api/tools/md5",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to hash. Up to 1 MB of UTF-8.",
        },
      },
      required: ["text"],
      additionalProperties: false,
    },
    sample: { text: "hello" },
    returns: "{ md5, algorithm, bytes }",
    rateLimit: "None. The work is local and costs nothing.",
    timeoutSeconds: 10,
  },
];

/** Where the MCP server is mounted. */
export const MCP_PATH = "/api/mcp";

/** Server identity, reported in the MCP `initialize` handshake. */
export const MCP_SERVER_NAME = "superflow-free-tools";
export const MCP_SERVER_VERSION = "1.0.0";

/**
 * The MCP protocol revision this server speaks. A client that asks for a
 * different one gets this back and decides for itself whether to continue,
 * which is what the spec asks a server to do.
 */
export const MCP_PROTOCOL_VERSION = "2025-06-18";

/**
 * Looks up the API entry for a tool.
 *
 * @param slug - The tool's registry slug.
 */
export function apiForTool(slug: string): ToolApiEntry | undefined {
  try {
    return TOOL_APIS.find((entry) => entry.slug === slug);
  } catch {
    return undefined;
  }
}

/**
 * Looks up an API entry by its MCP tool name.
 *
 * @param name - The name an MCP client called.
 */
export function apiForMcpTool(name: string): ToolApiEntry | undefined {
  try {
    return TOOL_APIS.find((entry) => entry.mcpTool === name);
  } catch {
    return undefined;
  }
}

/**
 * The endpoints that are actually usable right now: an entry whose registry
 * tool is live. This is what MCP advertises and what the docs list.
 */
export function availableToolApis(): ToolApiEntry[] {
  try {
    return TOOL_APIS.filter((entry) => findTool(entry.slug)?.status === "live");
  } catch {
    return [];
  }
}

/**
 * True when this endpoint may be advertised and called.
 *
 * @param entry - The catalogue entry.
 */
export function isToolApiAvailable(entry: ToolApiEntry): boolean {
  try {
    return findTool(entry.slug)?.status === "live";
  } catch {
    return false;
  }
}

/**
 * A copy-pasteable curl call for one endpoint.
 *
 * @param entry - The catalogue entry.
 * @param origin - Absolute site origin, e.g. https://usesuperflow.ai.
 */
export function curlFor(entry: ToolApiEntry, origin: string): string {
  try {
    const body = JSON.stringify(entry.sample);
    return [
      `curl -sS ${origin}${entry.path} \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -d '${body}'`,
    ].join("\n");
  } catch {
    return `curl -sS ${origin}${entry.path}`;
  }
}

/** One MCP tool definition, as `tools/list` returns it. */
export type McpToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: ToolInputSchema;
};

/**
 * The MCP tool list, built from the live entries.
 *
 * The rate limit and the timeout are appended to the description rather than
 * left in prose on a page the model will never read: an agent that knows a
 * call can take 60 seconds waits for it instead of retrying three times and
 * burning the hourly budget.
 */
export function mcpToolDefinitions(): McpToolDefinition[] {
  try {
    return availableToolApis().map((entry) => ({
      name: entry.mcpTool,
      title: entry.title,
      description: [
        entry.description,
        "",
        `Returns ${entry.returns}. Limit: ${entry.rateLimit}. Allow up to ${entry.timeoutSeconds}s for a response. Free, no account, no API key.`,
        // Only the backend-run tools can answer with a handle, and a model
        // that is not told what to do with one will treat it as a failure and
        // start the whole run again.
        ...(entry.inputSchema === RUN_SCHEMA
          ? [
              "",
              'Pass `url` to start a run. A slow run answers with `{ status: "pending", runId }` instead of a result: call this same tool again with just that `runId` to collect it, as many times as it takes. Collecting costs no rate-limit slot.',
            ]
          : []),
      ].join("\n"),
      inputSchema: entry.inputSchema,
    }));
  } catch {
    return [];
  }
}
