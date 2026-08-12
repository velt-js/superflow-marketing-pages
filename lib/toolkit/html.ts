// Lightweight HTML extraction for the check engine.
//
// Deliberately regex-based rather than DOM-based. These tools run in
// serverless request handlers where a full parser (jsdom, ~10MB and slow to
// instantiate) would dominate the latency budget for extractions this shallow.
// The backend's own `og-image-meta-parser.util.ts` makes the same call.
//
// The one place this approach is genuinely weaker is visible-text extraction,
// so that function is written defensively: it strips the non-rendered
// containers first, then tags, then decodes entities. It is used for a ratio
// comparison (raw vs rendered), where both sides run through the same
// function and systematic bias cancels out.

/** Elements whose text content is never rendered to the user. */
const NON_RENDERED_ELEMENTS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "head",
] as const;

/** The handful of named entities common enough to matter in page text. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "-",
  ndash: "-",
  hellip: "...",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
};

export type MetaTags = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  /** All `og:*` properties, keyed without the `og:` prefix. */
  openGraph: Record<string, string>;
  /** All `twitter:*` properties, keyed without the `twitter:` prefix. */
  twitter: Record<string, string>;
  /** The `content` of `<meta name="robots">`, lowercased. */
  robots: string | null;
  /** Resolved absolute favicon URL, when one is declared. */
  favicon: string | null;
  lang: string | null;
};

export type Heading = {
  level: number;
  text: string;
};

/**
 * Decodes the HTML entities that actually appear in page copy.
 *
 * @param value - Raw text possibly containing entities.
 */
export function decodeEntities(value: string): string {
  try {
    return (value ?? "")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      )
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&([a-z]+);/gi, (match, name) => {
        const decoded = NAMED_ENTITIES[String(name).toLowerCase()];
        return decoded ?? match;
      });
  } catch {
    return value ?? "";
  }
}

/**
 * Strips HTML comments and every element whose contents are not rendered.
 *
 * @param html - Raw HTML.
 */
function stripNonRendered(html: string): string {
  try {
    let output = (html ?? "").replace(/<!--[\s\S]*?-->/g, "");
    for (const tag of NON_RENDERED_ELEMENTS) {
      output = output.replace(
        new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"),
        " ",
      );
      // Unclosed variants: drop from the open tag to end of document rather
      // than leaking script source into the text ratio.
      output = output.replace(
        new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*$`, "i"),
        " ",
      );
    }
    return output;
  } catch {
    return html ?? "";
  }
}

/**
 * Extracts the visible text of a document: no markup, no script or style
 * contents, entities decoded, whitespace collapsed.
 *
 * Used on BOTH the raw HTML and the rendered DOM so the two are measured the
 * same way (check R1).
 *
 * @param html - Raw HTML or serialized rendered DOM.
 */
export function extractVisibleText(html: string): string {
  try {
    const withoutHidden = stripNonRendered(html);
    // Block-level boundaries become spaces so adjacent words are not fused
    // into one token, which would understate the text length.
    const withBreaks = withoutHidden
      .replace(/<(br|hr)\b[^>]*>/gi, " ")
      .replace(/<\/(p|div|section|article|li|tr|h[1-6]|header|footer|nav)>/gi, " ");
    const textOnly = withBreaks.replace(/<[^>]+>/g, " ");
    return decodeEntities(textOnly).replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Reads an attribute off a single tag's attribute string.
 *
 * @param tag - The full tag source, e.g. `<meta name="x" content="y">`.
 * @param attribute - The attribute name to read.
 */
function attr(tag: string, attribute: string): string | null {
  try {
    const quoted = new RegExp(
      `\\b${attribute}\\s*=\\s*("([^"]*)"|'([^']*)')`,
      "i",
    ).exec(tag);
    if (quoted) {
      return decodeEntities(quoted[2] ?? quoted[3] ?? "").trim();
    }
    const bare = new RegExp(`\\b${attribute}\\s*=\\s*([^\\s>]+)`, "i").exec(tag);
    return bare ? decodeEntities(bare[1]).trim() : null;
  } catch {
    return null;
  }
}

/**
 * Every `<meta>` tag in the document, as raw tag strings.
 *
 * @param html - Raw HTML.
 */
function metaTags(html: string): string[] {
  try {
    return (html ?? "").match(/<meta\b[^>]*>/gi) ?? [];
  } catch {
    return [];
  }
}

/**
 * Parses the document's title, description, canonical, social tags, robots
 * directive, favicon, and language.
 *
 * @param html - Raw HTML.
 * @param baseUrl - Absolute URL of the page, used to resolve relative hrefs.
 */
export function parseMeta(html: string, baseUrl: string): MetaTags {
  const openGraph: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  let description: string | null = null;
  let robots: string | null = null;

  try {
    for (const tag of metaTags(html)) {
      const content = attr(tag, "content");
      if (content === null || content.length === 0) continue;

      // og:* uses `property`, twitter:* uses `name`, but plenty of sites use
      // the other one. Accept either for both.
      const key = (attr(tag, "property") ?? attr(tag, "name") ?? "").toLowerCase();
      if (key.length === 0) continue;

      if (key === "description") {
        description ??= content;
        continue;
      }
      if (key === "robots") {
        robots ??= content.toLowerCase();
        continue;
      }
      if (key.startsWith("og:")) {
        // First occurrence wins, matching how consumers read these.
        openGraph[key.slice(3)] ??= content;
        continue;
      }
      if (key.startsWith("twitter:")) {
        twitter[key.slice(8)] ??= content;
      }
    }
  } catch {
    // Keep whatever was collected.
  }

  return {
    title: parseTitle(html),
    description,
    canonical: parseLinkHref(html, "canonical", baseUrl),
    openGraph,
    twitter,
    robots,
    favicon:
      parseLinkHref(html, "icon", baseUrl) ??
      parseLinkHref(html, "shortcut icon", baseUrl),
    lang: parseHtmlLang(html),
  };
}

/**
 * The document title, or null when absent or empty.
 *
 * @param html - Raw HTML.
 */
export function parseTitle(html: string): string | null {
  try {
    const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html ?? "");
    if (!match) return null;
    const text = decodeEntities(match[1]).replace(/\s+/g, " ").trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * The `lang` attribute on `<html>`.
 *
 * @param html - Raw HTML.
 */
function parseHtmlLang(html: string): string | null {
  try {
    const match = /<html\b[^>]*>/i.exec(html ?? "");
    return match ? attr(match[0], "lang") : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the href of the first `<link>` carrying a given rel value.
 *
 * @param html - Raw HTML.
 * @param rel - The rel token to look for.
 * @param baseUrl - Base for resolving relative hrefs.
 */
export function parseLinkHref(
  html: string,
  rel: string,
  baseUrl: string,
): string | null {
  try {
    const links = (html ?? "").match(/<link\b[^>]*>/gi) ?? [];
    const needle = rel.toLowerCase();
    for (const link of links) {
      const relValue = (attr(link, "rel") ?? "").toLowerCase();
      // `rel` is a space-separated token list.
      const tokens = relValue.split(/\s+/).filter(Boolean);
      const matches =
        tokens.includes(needle) || relValue === needle;
      if (!matches) continue;

      const href = attr(link, "href");
      if (!href) continue;
      try {
        return new URL(href, baseUrl).toString();
      } catch {
        return href;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Every heading in document order, with its level and text.
 *
 * @param html - Raw HTML.
 */
export function parseHeadings(html: string): Heading[] {
  try {
    const headings: Heading[] = [];
    const pattern = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
    const source = stripNonRendered(html);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(source)) !== null) {
      const text = decodeEntities(match[2].replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim();
      headings.push({ level: Number(match[1]), text });
    }
    return headings;
  } catch {
    return [];
  }
}

export type ParsedImage = {
  src: string;
  /** null when the attribute is absent entirely, "" when present but empty. */
  alt: string | null;
  width: number | null;
  height: number | null;
};

/**
 * Every `<img>` in the document with its src, alt, and declared dimensions.
 *
 * @param html - Raw HTML.
 * @param baseUrl - Base for resolving relative srcs.
 */
export function parseImages(html: string, baseUrl: string): ParsedImage[] {
  try {
    const tags = (html ?? "").match(/<img\b[^>]*>/gi) ?? [];
    return tags.flatMap((tag) => {
      const rawSrc = attr(tag, "src") ?? attr(tag, "data-src");
      if (!rawSrc) return [];

      let src = rawSrc;
      try {
        src = new URL(rawSrc, baseUrl).toString();
      } catch {
        // Keep the raw value; a data: URI or a malformed src is still worth
        // reporting to the caller.
      }

      const width = Number(attr(tag, "width"));
      const height = Number(attr(tag, "height"));

      return [
        {
          src,
          alt: attr(tag, "alt"),
          width: Number.isFinite(width) && width > 0 ? width : null,
          height: Number.isFinite(height) && height > 0 ? height : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * True when the document looks like a client-rendered shell: a near-empty
 * body with a known mount point and script tags.
 *
 * Used as a fallback signal for check R1 when no render service is
 * configured. It is a heuristic and is labelled as one in the UI, never
 * reported as a measured percentage.
 *
 * @param html - Raw HTML.
 */
export function looksLikeClientRenderedShell(html: string): boolean {
  try {
    const text = extractVisibleText(html);
    if (text.length > 600) return false;

    const hasMountPoint =
      /<div\b[^>]*\bid\s*=\s*["'](root|app|__next|__nuxt|main)["']/i.test(html);
    const scriptCount = (html.match(/<script\b/gi) ?? []).length;

    return hasMountPoint && scriptCount > 0;
  } catch {
    return false;
  }
}
