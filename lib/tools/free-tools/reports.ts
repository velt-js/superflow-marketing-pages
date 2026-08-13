// Report shapes the Superflow free-tool backend returns, and the guards that
// narrow them.
//
// WHY THESE ARE PARSERS AND NOT CASTS
//
// `runToolViaBackend` hands the terminal report back as `unknown` for every
// tool id except `ai-visibility`. That is the honest thing for it to do: the
// marketing site does not own those contracts, so a cast would be a promise
// this repo cannot keep. These parsers are the seam. Each one requires the
// fields the UI actually renders and returns null otherwise, so a backend
// that changes shape produces a plain error message instead of a page full
// of "undefined".
//
// Both shapes live in one module because they are two halves of the same
// thing: the report envelope the free-tool pipeline produces. Splitting them
// into per-tool folders would fork the same three narrowing helpers twice.

/** Severity tally the pipeline attaches to every report. */
export type SeverityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

/** Fields every free-tool report carries, whatever the tool did. */
type ReportEnvelope = {
  /** The URL the engine ended on, after redirects. */
  url: string;
  /** The submitted URL after the backend normalized it. */
  requestedUrl: string;
  /** How long the engine took, in milliseconds. */
  durationMs: number;
  /** Date the engine's rules were last reviewed, ISO 8601 date. */
  requirementsReviewedOn: string;
  totalFindings: number;
  severityCounts: SeverityCounts;
};

/** `markdown-for-agents`: one page converted to CommonMark. */
export type MarkdownForAgentsReport = ReportEnvelope & {
  /** HTTP status of the page fetch. 0 when the engine was handed the HTML. */
  httpStatus: number;
  /** The page's title, or "" when it had none. */
  title: string;
  /** The page's meta description, or "". */
  description: string;
  /** The converted document. This is the product. */
  markdown: string;
  wordCount: number;
  /** Size of `markdown` in bytes, as the engine measured it. */
  bytes: number;
  /** True when the document hit the engine's output cap and was cut. */
  truncated: boolean;
};

/** `llms-txt-generator`: the two documents the llmstxt.org convention names. */
export type LlmsTxtReport = ReportEnvelope & {
  /** The site's name, taken from the homepage title. */
  siteName: string;
  /** Same-origin URLs the engine found in robots.txt, sitemaps, and links. */
  pagesDiscovered: number;
  /** How many of those were converted into llms-full.txt. */
  pagesIncluded: number;
  /** The index file: H1, summary blockquote, then linked sections. */
  llmsTxt: string;
  /** The same site with every included page's Markdown inlined. */
  llmsFullTxt: string;
  /** True when the site has more pages than the run listed or included. */
  truncated: boolean;
};

/** Reads a string field, defaulting to "" so optional copy never crashes. */
function str(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

/** Reads a finite number field, defaulting to 0. */
function num(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Reads a boolean field, defaulting to false. */
function bool(source: Record<string, unknown>, key: string): boolean {
  return source[key] === true;
}

/** Reads the severity tally, defaulting every band to 0. */
function severity(source: Record<string, unknown>): SeverityCounts {
  const raw = source.severityCounts;
  const counts = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    critical: num(counts, "critical"),
    high: num(counts, "high"),
    medium: num(counts, "medium"),
    low: num(counts, "low"),
    info: num(counts, "info"),
  };
}

/**
 * Narrows the terminal payload to a record, or null when it is not one.
 *
 * @param data - The backend's `data` field, exactly as it arrived.
 */
function asRecord(data: unknown): Record<string, unknown> | null {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : null;
}

/**
 * Reads a `markdown-for-agents` report.
 *
 * `markdown` must be a string for the parse to succeed. Everything else has
 * a sensible default, because a missing word count is a cosmetic problem and
 * a missing document is not a result at all.
 *
 * @param data - The backend's terminal `data`.
 */
export function parseMarkdownForAgentsReport(
  data: unknown,
): MarkdownForAgentsReport | null {
  try {
    const source = asRecord(data);
    if (!source || typeof source.markdown !== "string") {
      return null;
    }
    return {
      url: str(source, "url"),
      requestedUrl: str(source, "requestedUrl"),
      httpStatus: num(source, "httpStatus"),
      title: str(source, "title"),
      description: str(source, "description"),
      markdown: source.markdown,
      wordCount: num(source, "wordCount"),
      bytes: num(source, "bytes"),
      truncated: bool(source, "truncated"),
      durationMs: num(source, "durationMs"),
      requirementsReviewedOn: str(source, "requirementsReviewedOn"),
      totalFindings: num(source, "totalFindings"),
      severityCounts: severity(source),
    };
  } catch {
    return null;
  }
}

/**
 * Reads an `llms-txt-generator` report.
 *
 * `llmsTxt` must be a string. `llmsFullTxt` may legitimately be empty, since
 * a run that discovers pages but converts none still produces a valid index
 * file, and shipping the index alone beats refusing the whole result.
 *
 * @param data - The backend's terminal `data`.
 */
export function parseLlmsTxtReport(data: unknown): LlmsTxtReport | null {
  try {
    const source = asRecord(data);
    if (!source || typeof source.llmsTxt !== "string") {
      return null;
    }
    return {
      url: str(source, "url"),
      requestedUrl: str(source, "requestedUrl"),
      siteName: str(source, "siteName"),
      pagesDiscovered: num(source, "pagesDiscovered"),
      pagesIncluded: num(source, "pagesIncluded"),
      llmsTxt: source.llmsTxt,
      llmsFullTxt: str(source, "llmsFullTxt"),
      truncated: bool(source, "truncated"),
      durationMs: num(source, "durationMs"),
      requirementsReviewedOn: str(source, "requirementsReviewedOn"),
      totalFindings: num(source, "totalFindings"),
      severityCounts: severity(source),
    };
  } catch {
    return null;
  }
}
