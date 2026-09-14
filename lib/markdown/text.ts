// Text normalisation shared by every Markdown builder.
//
// CMS copy is written for a rendered page, so it arrives with typographic
// punctuation, hard line breaks used as layout, and the occasional stray
// pipe. None of that survives a Markdown table or a plain-text reader
// intact, so it is normalised once here rather than at each call site.

/** Collapses whitespace and trims. Returns "" for nullish input. */
export function clean(value: unknown): string {
  try {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Same as `clean`, but keeps paragraph breaks.
 *
 * Sanity `text` fields use blank lines as paragraph separators, and flattening
 * them would run two thoughts together into one sentence.
 */
export function cleanMultiline(value: unknown): string {
  try {
    if (typeof value !== "string") return "";
    return value
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();
  } catch {
    return "";
  }
}

/**
 * Site style bans em dashes in rendered copy, and the same rule applies to the
 * Markdown copies so the two never disagree. Matches `stripEmDashes` in
 * app/_seo/page-metadata.ts.
 */
export function stripEmDashes(value: string): string {
  try {
    return value.replace(/\s*—\s*/g, " - ");
  } catch {
    return value;
  }
}

/** Escapes the characters that would break out of a Markdown table cell. */
export function cell(value: unknown): string {
  try {
    return clean(value).replace(/\|/g, "\\|");
  } catch {
    return "";
  }
}

/**
 * Turns a slug into a display title: "ai-review-agents" -> "Ai Review Agents".
 *
 * Deliberately dumb, and only used where the source has no title of its own.
 */
export function titleFromSlug(slug: string): string {
  try {
    return slug
      .split("-")
      .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1) : part))
      .join(" ");
  } catch {
    return slug;
  }
}

/**
 * Joins headline fragments into one sentence.
 *
 * Several templates store a headline as an array of lines because the design
 * breaks it across rows. That is a layout decision, not a content one, so the
 * lines are rejoined with spaces for a reader that has no layout.
 */
export function joinLines(lines: unknown): string {
  try {
    if (typeof lines === "string") return clean(lines);
    if (!Array.isArray(lines)) return "";
    return clean(lines.filter((line) => typeof line === "string").join(" "));
  } catch {
    return "";
  }
}

/** First non-empty string from the arguments, cleaned. Returns "" if none. */
export function firstOf(...values: unknown[]): string {
  try {
    for (const value of values) {
      const text = clean(value);
      if (text) return text;
    }
    return "";
  } catch {
    return "";
  }
}

/** Formats an ISO timestamp as YYYY-MM-DD, or "" if it is not parseable. */
export function isoDate(value: unknown): string {
  try {
    if (typeof value !== "string" || !value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
