// llms.txt parsing and validation.
//
// The spec (llmstxt.org) is small and mostly conventional, which means most
// files in the wild are almost-right rather than broken. The validator is
// therefore rule-by-rule with a named failure for each: "your file is
// invalid" helps nobody, "every link on line 12 onward is relative, and
// crawlers resolve those against their own host" is a fix.
//
// Shared by T1 check A3 (does this site have a valid llms.txt) and T2's
// checker tab (validate an existing file).

import { fetchUrl } from "./fetcher";
import { SUPERFLOW_USER_AGENT } from "./bots";
import { originOf } from "./url";

/** Size above which we warn. Large files get truncated by consumers. */
const SIZE_WARN_BYTES = 500 * 1024;

export type LlmsTxtRuleId =
  | "reachable"
  | "served-from-root"
  | "content-type"
  | "not-html"
  | "single-h1"
  | "summary-blockquote"
  | "has-sections"
  | "entries-are-links"
  | "urls-absolute"
  | "urls-same-host"
  | "no-raw-html"
  | "size";

export type RuleStatus = "pass" | "warn" | "fail";

export type LlmsTxtRuleResult = {
  id: LlmsTxtRuleId;
  status: RuleStatus;
  title: string;
  /** One sentence explaining the result. Rendered verbatim. */
  detail: string;
};

export type LlmsTxtEntry = {
  section: string;
  title: string;
  url: string;
  description: string | null;
  /** 1-based line number, so the UI can point at the problem. */
  line: number;
};

export type LlmsTxtDocument = {
  /** The `# Heading` title. */
  siteName: string | null;
  /** The `> summary` blockquote, joined into one paragraph. */
  summary: string | null;
  /** `## Section` names in document order. */
  sections: string[];
  entries: LlmsTxtEntry[];
};

export type LlmsTxtValidation = {
  url: string;
  found: boolean;
  status: number | null;
  raw: string;
  bytes: number;
  document: LlmsTxtDocument;
  rules: LlmsTxtRuleResult[];
  /** True when no rule failed. Warnings do not invalidate a file. */
  valid: boolean;
};

/** Matches a markdown list entry: `- [Title](url): description`. */
const ENTRY_PATTERN = /^\s*[-*]\s+\[([^\]]*)\]\(([^)\s]+)\)\s*(?::\s*(.*))?$/;

/**
 * Parses llms.txt text into its structural parts.
 *
 * @param text - The raw file contents.
 */
export function parseLlmsTxt(text: string): LlmsTxtDocument {
  const document: LlmsTxtDocument = {
    siteName: null,
    summary: null,
    sections: [],
    entries: [],
  };

  try {
    const lines = (text ?? "").split(/\r?\n/);
    const summaryLines: string[] = [];
    let currentSection = "";

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;

      if (document.siteName === null && /^#\s+/.test(trimmed)) {
        document.siteName = trimmed.replace(/^#\s+/, "").trim();
        return;
      }

      if (/^>\s?/.test(trimmed)) {
        summaryLines.push(trimmed.replace(/^>\s?/, "").trim());
        return;
      }

      if (/^##\s+/.test(trimmed)) {
        currentSection = trimmed.replace(/^##\s+/, "").trim();
        document.sections.push(currentSection);
        return;
      }

      const entry = ENTRY_PATTERN.exec(trimmed);
      if (entry) {
        document.entries.push({
          section: currentSection,
          title: entry[1].trim(),
          url: entry[2].trim(),
          description: entry[3]?.trim() || null,
          line: index + 1,
        });
      }
    });

    if (summaryLines.length > 0) {
      document.summary = summaryLines.join(" ").trim();
    }
  } catch {
    // Return whatever parsed.
  }

  return document;
}

/**
 * Counts top-level `#` headings, which the spec allows exactly one of.
 *
 * @param text - The raw file contents.
 */
function countH1(text: string): number {
  try {
    return (text ?? "")
      .split(/\r?\n/)
      .filter((line) => /^#\s+\S/.test(line.trim())).length;
  } catch {
    return 0;
  }
}

/**
 * Applies every validation rule to a fetched file.
 *
 * @param params - The fetch outcome and the site it belongs to.
 */
function buildRules(params: {
  found: boolean;
  status: number | null;
  raw: string;
  bytes: number;
  contentType: string;
  requestedUrl: string;
  finalUrl: string;
  siteOrigin: string;
  document: LlmsTxtDocument;
}): LlmsTxtRuleResult[] {
  const {
    found,
    status,
    raw,
    bytes,
    contentType,
    finalUrl,
    siteOrigin,
    document,
  } = params;

  const rules: LlmsTxtRuleResult[] = [];

  rules.push({
    id: "reachable",
    status: found ? "pass" : "fail",
    title: "File is reachable",
    detail: found
      ? "The file returned 200."
      : status === null
        ? "We could not reach the file at all."
        : `The file returned ${status}.`,
  });

  if (!found) {
    // Every other rule is unanswerable without content. Stop here rather than
    // stacking nine identical failures on one root cause.
    return rules;
  }

  const servedFromRoot = (() => {
    try {
      return new URL(finalUrl).pathname === "/llms.txt";
    } catch {
      return false;
    }
  })();

  rules.push({
    id: "served-from-root",
    status: servedFromRoot ? "pass" : "fail",
    title: "Served from the site root",
    detail: servedFromRoot
      ? "The file is at /llms.txt, where crawlers look for it."
      : "Crawlers only look at /llms.txt. A file in a subdirectory is never found.",
  });

  const isTextual =
    contentType.includes("text/plain") ||
    contentType.includes("text/markdown") ||
    contentType.length === 0;
  rules.push({
    id: "content-type",
    status: isTextual ? "pass" : "warn",
    title: "Served as text",
    detail: isTextual
      ? "The content type is text, which is what consumers expect."
      : `The content type is "${contentType}". Serve it as text/plain so consumers do not skip it.`,
  });

  const looksHtml = /^\s*<(!doctype|html)\b/i.test(raw);
  rules.push({
    id: "not-html",
    status: looksHtml ? "fail" : "pass",
    title: "Not an HTML page",
    detail: looksHtml
      ? "This returned an HTML page, not a text file. The host is serving your site shell at this path."
      : "The response is a text file, not an HTML page.",
  });

  const h1Count = countH1(raw);
  rules.push({
    id: "single-h1",
    status: h1Count === 1 ? "pass" : "fail",
    title: "Starts with a single H1",
    detail:
      h1Count === 1
        ? `The file opens with "# ${document.siteName ?? ""}".`
        : h1Count === 0
          ? "The file has no `# Title` heading. The spec requires exactly one."
          : `The file has ${h1Count} top-level headings. The spec allows exactly one.`,
  });

  rules.push({
    id: "summary-blockquote",
    status: document.summary ? "pass" : "warn",
    title: "Has a summary blockquote",
    detail: document.summary
      ? "The file includes a `>` summary line describing the site."
      : "Add a `> one paragraph summary` line under the title so a model knows what the site is.",
  });

  rules.push({
    id: "has-sections",
    status: document.sections.length > 0 ? "pass" : "warn",
    title: "Uses section headings",
    detail:
      document.sections.length > 0
        ? `Found ${document.sections.length} sections: ${document.sections.slice(0, 5).join(", ")}.`
        : "Group your links under `## Section` headings so a model can tell docs from blog posts.",
  });

  rules.push({
    id: "entries-are-links",
    status: document.entries.length > 0 ? "pass" : "fail",
    title: "Contains markdown link entries",
    detail:
      document.entries.length > 0
        ? `Found ${document.entries.length} link entries.`
        : "No `- [Title](url): description` entries found. The file lists nothing for a model to read.",
  });

  const relative = document.entries.filter(
    (entry) => !/^https?:\/\//i.test(entry.url),
  );
  rules.push({
    id: "urls-absolute",
    status: relative.length === 0 ? "pass" : "fail",
    title: "All URLs are absolute",
    detail:
      relative.length === 0
        ? "Every entry uses a full https URL."
        : `${relative.length} ${relative.length === 1 ? "entry uses a relative URL" : "entries use relative URLs"}, starting at line ${relative[0].line}. Consumers resolve those against their own host, not yours.`,
  });

  const offHost = document.entries.filter((entry) => {
    try {
      if (!/^https?:\/\//i.test(entry.url)) return false;
      return new URL(entry.url).origin !== new URL(siteOrigin).origin;
    } catch {
      return false;
    }
  });
  rules.push({
    id: "urls-same-host",
    status: offHost.length === 0 ? "pass" : "warn",
    title: "URLs point at this site",
    detail:
      offHost.length === 0
        ? "Every entry points at this domain."
        : `${offHost.length} ${offHost.length === 1 ? "entry points" : "entries point"} at another domain, starting at line ${offHost[0].line}. That is allowed, but it is usually a copy and paste mistake.`,
  });

  const hasRawHtml = /<(div|span|script|p|a|img|br)\b/i.test(raw);
  rules.push({
    id: "no-raw-html",
    status: hasRawHtml ? "warn" : "pass",
    title: "No raw HTML",
    detail: hasRawHtml
      ? "The file contains HTML tags. llms.txt is markdown, and tags add noise a model has to work around."
      : "The file is clean markdown.",
  });

  rules.push({
    id: "size",
    status: bytes > SIZE_WARN_BYTES ? "warn" : "pass",
    title: "Reasonable file size",
    detail:
      bytes > SIZE_WARN_BYTES
        ? `The file is ${Math.round(bytes / 1024)}KB. Move the long-form content into llms-full.txt and keep this one an index.`
        : `The file is ${Math.max(1, Math.round(bytes / 1024))}KB.`,
  });

  return rules;
}

/**
 * Fetches and validates the llms.txt for a site.
 *
 * @param siteUrl - Any URL on the site.
 */
export async function validateLlmsTxt(
  siteUrl: string,
): Promise<LlmsTxtValidation> {
  const origin = originOf(siteUrl);
  const llmsUrl = `${origin}llms.txt`;
  const emptyDocument: LlmsTxtDocument = {
    siteName: null,
    summary: null,
    sections: [],
    entries: [],
  };

  try {
    const result = await fetchUrl({
      url: llmsUrl,
      userAgent: SUPERFLOW_USER_AGENT,
      maxBytes: 2 * 1024 * 1024,
      timeoutMs: 8000,
    });

    if (!result.ok || result.status !== 200) {
      const status = result.ok ? result.status : null;
      return {
        url: llmsUrl,
        found: false,
        status,
        raw: "",
        bytes: 0,
        document: emptyDocument,
        rules: buildRules({
          found: false,
          status,
          raw: "",
          bytes: 0,
          contentType: "",
          requestedUrl: llmsUrl,
          finalUrl: llmsUrl,
          siteOrigin: origin,
          document: emptyDocument,
        }),
        valid: false,
      };
    }

    const document = parseLlmsTxt(result.body);
    const rules = buildRules({
      found: true,
      status: result.status,
      raw: result.body,
      bytes: result.bytes,
      contentType: result.headers["content-type"] ?? "",
      requestedUrl: llmsUrl,
      finalUrl: result.finalUrl,
      siteOrigin: origin,
      document,
    });

    return {
      url: llmsUrl,
      found: true,
      status: result.status,
      raw: result.body,
      bytes: result.bytes,
      document,
      rules,
      valid: rules.every((rule) => rule.status !== "fail"),
    };
  } catch {
    return {
      url: llmsUrl,
      found: false,
      status: null,
      raw: "",
      bytes: 0,
      document: emptyDocument,
      rules: buildRules({
        found: false,
        status: null,
        raw: "",
        bytes: 0,
        contentType: "",
        requestedUrl: llmsUrl,
        finalUrl: llmsUrl,
        siteOrigin: origin,
        document: emptyDocument,
      }),
      valid: false,
    };
  }
}

/**
 * A minimal valid llms.txt stub, offered as a copyable starting point when
 * check A3 fails.
 *
 * @param params - Site details to seed the stub with.
 */
export function buildLlmsTxtStub(params: {
  siteName: string;
  siteUrl: string;
  description?: string;
}): string {
  try {
    const { siteName, siteUrl, description } = params;
    const origin = originOf(siteUrl).replace(/\/$/, "");
    return [
      `# ${siteName}`,
      "",
      `> ${description ?? "One paragraph describing what this site is and who it is for."}`,
      "",
      "## Docs",
      "",
      `- [Getting started](${origin}/docs): How to set up and start using the product.`,
      "",
      "## Company",
      "",
      `- [About](${origin}/about): What the company does and who is behind it.`,
      `- [Pricing](${origin}/pricing): Plans and what each one includes.`,
      "",
    ].join("\n");
  } catch {
    return "";
  }
}
