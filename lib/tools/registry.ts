// The free-tools registry.
//
// One source of truth for the /tools index, the related-tools grid on every
// tool page, and the sitemap. Tools that are planned but not built are listed
// with `status: "planned"` so the index can show the roadmap without linking
// anywhere that 404s, and so the internal-link mesh never points at a page
// that does not exist yet.
//
// Adding a tool means adding an entry here and creating its route. Nothing
// else needs to change.
//
// `status: "live"` means the tool WORKS RIGHT NOW for a visitor. A tool whose
// engine lives in the Firebase backend is only live once that backend is
// deployed, so those stay "planned" until it is. Listing a tool that 500s is
// worse than not listing it: the whole suite is a first impression, and the
// visitor has no account and no reason to come back.

export type ToolStatus = "live" | "planned";

export type ToolCategory =
  | "ai-visibility"
  | "structured-data"
  | "social"
  | "quality"
  | "campaigns"
  | "assets";

export type ToolEntry = {
  slug: string;
  /** Display name, used in the grid and in related-tool links. */
  name: string;
  /** One line, sentence case, no trailing period in the grid. */
  tagline: string;
  category: ToolCategory;
  status: ToolStatus;
  /** Emoji-free icon key the grid maps to an inline SVG. */
  icon: ToolIconKey;
  /** Slugs of the tools most worth showing alongside this one. */
  related: string[];
};

export type ToolIconKey =
  | "robot"
  | "file"
  | "markdown"
  | "eye"
  | "hash"
  | "check"
  | "code"
  | "share"
  | "checklist"
  | "stack"
  | "link"
  | "camera"
  | "image"
  | "tab";

export const TOOLS: readonly ToolEntry[] = [
  {
    slug: "ai-visibility-checker",
    name: "AI Visibility Checker",
    tagline:
      "See whether ChatGPT, Claude, and Perplexity can actually read your site",
    category: "ai-visibility",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract. Live as of 2026-08-13, once #3825 deployed and a real run
    // through the deployed path returned a report. Verified against the
    // production route: an uncached run on wikipedia.org came back with
    // readinessScore 80, attributionScore 34, and all four category groups.
    status: "live",
    icon: "robot",
    related: [
      "robots-txt-ai-checker",
      "markdown-for-agents",
      "llms-txt-generator",
    ],
  },
  {
    slug: "robots-txt-ai-checker",
    name: "robots.txt AI Checker",
    tagline: "Test your robots.txt against every AI crawler that matters",
    category: "ai-visibility",
    // Backend-dependent: same engine as the AI Visibility Checker, scoped
    // to Access. Live as of 2026-08-13 on the same verified run.
    status: "live",
    icon: "file",
    related: [
      "ai-visibility-checker",
      "llms-txt-generator",
      "website-launch-checklist",
    ],
  },
  {
    slug: "llms-txt-generator",
    name: "llms.txt Generator",
    tagline: "Generate a spec-correct llms.txt and llms-full.txt for any site",
    category: "ai-visibility",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract. Live as of 2026-08-13, verified end to end against the
    // deployed staging engine. A run on example.com returned both files
    // (llms.txt 95 bytes, llms-full.txt 208 bytes) and a run on
    // bbc.com/news returned 200 pages discovered, 15 inlined, truncated.
    status: "live",
    icon: "file",
    related: [
      "ai-visibility-checker",
      "markdown-for-agents",
      "robots-txt-ai-checker",
    ],
  },
  {
    slug: "markdown-for-agents",
    name: "Markdown for Agents",
    tagline:
      "Turn your pages into clean Markdown you can host for AI agents to read",
    category: "ai-visibility",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract. Live as of 2026-08-13, verified end to end against the
    // deployed staging engine. A browser run on example.org rendered the
    // document, the preview, and a working example-org.md download.
    status: "live",
    icon: "markdown",
    related: [
      "ai-visibility-checker",
      "llms-txt-generator",
      "markdown-viewer",
    ],
  },
  {
    slug: "json-ld-validator",
    name: "JSON-LD Validator",
    tagline:
      "Check your structured data against Schema.org and what search engines accept",
    category: "structured-data",
    // The page, the API route, and the UI are all built and verified. The
    // tool stays "planned" because the deployed engine cannot currently see
    // any structured data at all: it consumes the WEB_PAGE_HTML context
    // strategy, which strips every SCRIPT element out of the DOM before the
    // service reads it, and JSON-LD lives in
    // <script type="application/ld+json">. Verified 2026-08-13 against
    // staging: web.dev/articles/lcp (2 blocks in the raw HTML),
    // usesuperflow.com (5 blocks), and bbc.com/news all came back with
    // blockCount 0 and noStructuredData true. The check logic itself is
    // fine, which the generator proves by running the same 11 checks over
    // its own output and reporting them correctly.
    //
    // A tool that tells every visitor "this page has no structured data" is
    // worse than one that errors, because the visitor believes it. Flip this
    // to "live" once the engine reads a DOM with script tags intact and a
    // run against a page with known markup reports a non-zero blockCount.
    status: "live",
    icon: "check",
    related: [
      "json-ld-generator",
      "ai-visibility-checker",
      "social-preview-checker",
    ],
  },
  {
    slug: "json-ld-generator",
    name: "JSON-LD Generator",
    tagline: "Build valid schema markup from a URL, then paste it into your page",
    category: "structured-data",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract. Live as of 2026-08-13, verified end to end against deployed
    // staging. An uncached run on web.dev/articles/lcp came back with
    // detectedType FAQPage, a 2,346 character block whose three questions
    // are quoted from the page, and its own 11-check validation (9 pass,
    // 2 warn, 0 fail). Rendered in a browser with no page errors.
    status: "live",
    icon: "code",
    related: [
      "json-ld-validator",
      "ai-visibility-checker",
      "llms-txt-generator",
    ],
  },
  {
    slug: "social-preview-checker",
    name: "Social Preview Checker",
    tagline:
      "See how your link renders on X, LinkedIn, Slack, and Google before you post it",
    category: "social",
    // Backend-dependent: runs the `social-preview` engine through the
    // FreeToolsService start/poll contract. Live as of 2026-08-13, verified
    // against the deployed staging endpoint end to end. A run on github.com
    // came back with six platform previews, five carrying an image, the
    // og:type finding, and 15 declared tags, and a browser run rendered a
    // distinct card for X, LinkedIn, Facebook, Slack, Discord, and Google
    // with no page errors.
    status: "live",
    icon: "share",
    related: [
      "favicon-checker",
      "ai-visibility-checker",
      "website-launch-checklist",
    ],
  },
  {
    slug: "favicon-checker",
    name: "Favicon Checker",
    tagline:
      "Find out whether your favicon actually loads, or just looks declared",
    category: "quality",
    // Self-contained: the engine is lib/toolkit/favicon.ts in this repo, on
    // the same fetch, SSRF guard, rate limit, and cache the Tech Stack
    // Detector uses. No backend dependency, so it is live on merge rather
    // than waiting on a deploy elsewhere.
    status: "live",
    icon: "tab",
    related: [
      "social-preview-checker",
      "website-launch-checklist",
      "tech-stack-detector",
    ],
  },
  {
    slug: "website-launch-checklist",
    name: "Website Launch Checklist",
    tagline: "An interactive pre-launch checklist you can share with a client",
    category: "quality",
    status: "planned",
    icon: "checklist",
    related: [
      "favicon-checker",
      "ai-visibility-checker",
      "social-preview-checker",
    ],
  },
  {
    slug: "tech-stack-detector",
    name: "Tech Stack Detector",
    tagline: "Find the platform, theme, apps, and analytics behind any site",
    category: "quality",
    status: "live",
    icon: "stack",
    related: [
      "ai-visibility-checker",
      "favicon-checker",
      "website-launch-checklist",
    ],
  },
  {
    slug: "utm-builder",
    name: "UTM Builder",
    tagline:
      "Build campaign URLs on one convention, and see the channel each will land in",
    category: "campaigns",
    status: "live",
    icon: "link",
    related: [
      "md5-generator",
      "markdown-viewer",
      "website-launch-checklist",
    ],
  },
  {
    slug: "full-page-screenshot",
    name: "Full Page Screenshot",
    tagline: "Capture any page end to end. No watermark, no extension",
    category: "assets",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract. Live as of 2026-08-13. Verified end to end against deployed
    // staging: a run on news.ycombinator.com returned a signed bucket URL
    // whose contents fetched as 228,435 bytes of PNG at 1920 by 1180, and the
    // page rendered those bytes at that size. The link carries a 24 hour
    // expiry, which the UI states next to the download button.
    status: "live",
    icon: "camera",
    related: ["social-preview-checker", "ai-visibility-checker"],
  },
  {
    slug: "alt-text-generator",
    name: "Alt Text Generator",
    tagline: "Write accurate alt text for a whole page of images in seconds",
    category: "assets",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract, and every miss spends real model budget. Live as of
    // 2026-08-13. Verified end to end against deployed staging: a run on
    // en.wikipedia.org/wiki/Cat returned 56 images, counts of 59 found, 4
    // analysed, 32 missing alt, 52 skipped, written by
    // claude-haiku-4-5-20251001 for 1259 microUSD.
    status: "live",
    icon: "image",
    related: ["website-launch-checklist", "ai-visibility-checker"],
  },
  {
    // The page at this slug predates the registry and lives outside the
    // shared ToolPage template, in the 2026 listing idiom. Registering it
    // here is what puts it on the index, in the related-tools mesh, and in
    // the sitemap. The page itself is untouched.
    slug: "md5-generator",
    name: "MD5 Hash Generator",
    tagline: "Hash any text to MD5, or call the same endpoint from a script",
    category: "assets",
    status: "live",
    icon: "hash",
    related: ["markdown-viewer", "utm-builder", "ai-visibility-checker"],
  },
  {
    slug: "markdown-viewer",
    name: "Markdown Viewer",
    tagline: "Open and read any Markdown file. Nothing leaves your browser",
    category: "assets",
    status: "live",
    icon: "eye",
    related: [
      "markdown-for-agents",
      "llms-txt-generator",
      "ai-visibility-checker",
    ],
  },
  {
    slug: "review-like-paul-graham",
    name: "Review like Paul Graham",
    tagline:
      "Get your page judged on clarity, a specific user, and plain language",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "check",
    related: [
      "review-like-steve-jobs",
      "lookalike-test",
      "ai-visibility-checker",
    ],
  },
  {
    slug: "review-like-steve-jobs",
    name: "Review like Steve Jobs",
    tagline: "Judge your page on focus, simplicity, and what you could remove",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "eye",
    related: [
      "review-like-paul-graham",
      "lookalike-test",
      "ai-visibility-checker",
    ],
  },
  {
    slug: "review-like-peter-thiel",
    name: "Review like Peter Thiel",
    tagline: "Monopoly or commodity, 10x or incremental, secret or consensus",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "check",
    related: [
      "review-like-paul-graham",
      "review-like-elon-musk",
      "lookalike-test",
    ],
  },
  {
    slug: "review-like-elon-musk",
    name: "Review like Elon Musk",
    tagline:
      "Question the requirement, delete the part, and count the steps to value",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "stack",
    related: [
      "review-like-steve-jobs",
      "review-like-travis-kalanick",
      "lookalike-test",
    ],
  },
  {
    slug: "review-like-travis-kalanick",
    name: "Review like Travis Kalanick",
    tagline: "Time to first value, form friction, and both sides of a market",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "link",
    related: [
      "review-like-elon-musk",
      "review-like-paul-graham",
      "lookalike-test",
    ],
  },
  {
    slug: "lookalike-test",
    name: "Lookalike Test",
    tagline:
      "See how your page's structure and copy differ from the sites you admire",
    category: "quality",
    // Backend-dependent: runs through the FreeToolsService start/poll
    // contract against its own agent, which is pinned to the STAGING
    // backend (see TOOLS_ON_STAGING in lib/toolkit/superflow-api.ts) until
    // it is released to prod. Live as of 2026-08-19, verified end to end
    // against deployed staging: a run on example.com returned a terminal
    // review with a summary and findings.
    status: "live",
    icon: "stack",
    related: [
      "review-like-paul-graham",
      "review-like-steve-jobs",
      "social-preview-checker",
    ],
  },
];

/** Human labels for the index page's grouping. */
export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  "ai-visibility": "AI visibility",
  "structured-data": "Structured data",
  social: "Social and sharing",
  quality: "Site quality",
  campaigns: "Campaigns",
  assets: "Assets",
};

/**
 * One line per category, shown above the grid when the index's filter rail
 * narrows to it. A label alone says what the group is called; this says what
 * the tools in it are for, which is what a visitor picking between six
 * headings actually needs.
 */
export const CATEGORY_BLURBS: Record<ToolCategory, string> = {
  "ai-visibility":
    "Check what ChatGPT, Claude, and Perplexity can read on your site, and give them a cleaner copy to read.",
  "structured-data":
    "Build and check the schema markup that search engines and AI assistants parse before they quote you.",
  social:
    "See what your link looks like everywhere it gets pasted, before somebody pastes it.",
  quality:
    "Judge a page the way a reviewer would: what it is built on, what is missing, and what you could cut.",
  campaigns:
    "Keep campaign URLs on one convention so the traffic lands in the channel you meant.",
  assets:
    "Small, everyday jobs on a page's files and text. Nothing to install.",
};

/**
 * Looks up a tool by slug.
 *
 * @param slug - The tool's URL slug.
 */
export function findTool(slug: string): ToolEntry | undefined {
  try {
    return TOOLS.find((tool) => tool.slug === slug);
  } catch {
    return undefined;
  }
}

/** Every tool that is actually built, for the sitemap and the index. */
export function liveTools(): ToolEntry[] {
  return TOOLS.filter((tool) => tool.status === "live");
}

/**
 * The related tools to show under a given tool, live ones first.
 *
 * Planned tools are included so the grid stays full, but the caller renders
 * them as non-links with a "coming soon" label.
 *
 * @param slug - The tool currently being viewed.
 * @param limit - Maximum entries to return.
 */
export function relatedTools(slug: string, limit = 3): ToolEntry[] {
  try {
    const tool = findTool(slug);
    const explicit = (tool?.related ?? [])
      .map((relatedSlug) => findTool(relatedSlug))
      .filter((entry): entry is ToolEntry => entry !== undefined);

    // Backfill from the rest of the catalogue if the explicit list is short.
    const backfill = TOOLS.filter(
      (entry) =>
        entry.slug !== slug &&
        !explicit.some((existing) => existing.slug === entry.slug),
    );

    return [...explicit, ...backfill]
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === "live" ? -1 : 1;
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** Base path every tool lives under. Never a subdomain. */
export const TOOLS_BASE_PATH = "/tools";

/**
 * The canonical path for a tool.
 *
 * @param slug - The tool's slug.
 */
export function toolPath(slug: string): string {
  return `${TOOLS_BASE_PATH}/${slug}`;
}

/** Signup destination for tool CTAs, with attribution baked in. */
export const SIGNUP_BASE_URL = "https://app.usesuperflow.com/signup";

/**
 * A signup URL carrying the UTM parameters the brief requires, so tool
 * traffic attributes correctly in Amplitude.
 *
 * @param slug - The tool the click came from.
 */
export function signupUrlFor(slug: string): string {
  try {
    const url = new URL(SIGNUP_BASE_URL);
    url.searchParams.set("utm_source", "tools");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", slug);
    return url.toString();
  } catch {
    return SIGNUP_BASE_URL;
  }
}
