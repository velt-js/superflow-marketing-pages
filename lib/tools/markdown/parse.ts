// Markdown parser for the viewer.
//
// WHY THIS IS NOT `marked` PLUS A SANITIZER
//
// The usual shape for this tool is parse to an HTML string, run it through
// DOMPurify, and hand it to `dangerouslySetInnerHTML`. That works right up
// until the sanitizer config drifts or a bypass lands, and then a page whose
// entire promise is "nothing leaves your browser" is executing a stranger's
// script in the visitor's session.
//
// This parser produces a token tree and never produces HTML. The renderer
// turns tokens into React elements, so every piece of user text goes through
// React's own escaping and there is no `dangerouslySetInnerHTML` anywhere in
// the tool. XSS is not sanitized here, it is structurally impossible.
//
// The one exception React does NOT cover is `href`: React renders
// `javascript:alert(1)` in an anchor without complaint. That is fenced by
// `safeHref` below, on an https/http/mailto allowlist, same policy as the
// backend's email templates.
//
// The cost of this choice is coverage: this handles the CommonMark that
// appears in real documents, not every corner of the spec. That is a quality
// tradeoff, not a security one, which is the right way round.

/** A run of inline content inside a block. */
export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "strong"; children: InlineToken[] }
  | { kind: "em"; children: InlineToken[] }
  | { kind: "del"; children: InlineToken[] }
  | { kind: "code"; value: string }
  | { kind: "link"; href: string; children: InlineToken[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "break" };

/** A top-level block. */
export type BlockToken =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineToken[]; slug: string }
  | { kind: "paragraph"; children: InlineToken[] }
  | { kind: "code"; language: string; value: string }
  | { kind: "quote"; blocks: BlockToken[] }
  | { kind: "list"; ordered: boolean; start: number; items: BlockToken[][] }
  | { kind: "table"; head: InlineToken[][]; rows: InlineToken[][][] }
  | { kind: "hr" };

/** One entry in the document outline, for the table of contents. */
export type OutlineEntry = { level: number; text: string; slug: string };

export type ParsedMarkdown = {
  blocks: BlockToken[];
  outline: OutlineEntry[];
  /** Rough word count, for the document stats line. */
  wordCount: number;
};

/** Schemes an anchor may point at. Everything else collapses to "". */
const SAFE_HREF = /^(https?:\/\/|mailto:|#|\/)/i;

/**
 * Returns an href only when it is safe to render.
 *
 * React escapes text but happily renders `javascript:` in an href, so this is
 * the one place the "React makes XSS impossible" argument needs help.
 *
 * @param raw - The URL as written in the document.
 */
export function safeHref(raw: string): string {
  try {
    const trimmed = raw.trim();
    return SAFE_HREF.test(trimmed) ? trimmed : "";
  } catch {
    return "";
  }
}

/**
 * Turns heading text into a URL fragment.
 *
 * @param text - The heading's plain text.
 */
export function slugify(text: string): string {
  try {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
  } catch {
    return "";
  }
}

/** Flattens inline tokens back to plain text, for slugs and the outline. */
export function inlineText(tokens: InlineToken[]): string {
  try {
    return tokens
      .map((token) => {
        if (token.kind === "text" || token.kind === "code") return token.value;
        if (token.kind === "image") return token.alt;
        if (token.kind === "break") return " ";
        return inlineText(token.children);
      })
      .join("");
  } catch {
    return "";
  }
}

/** Ordered so the longest delimiters are tried first. */
const INLINE_RULES: Array<{
  pattern: RegExp;
  build: (match: RegExpExecArray) => InlineToken;
}> = [
  // Code first: its contents are literal, so nothing inside it is parsed.
  { pattern: /^`([^`]+)`/, build: (m) => ({ kind: "code", value: m[1] }) },
  {
    pattern: /^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/,
    build: (m) => ({ kind: "image", src: safeHref(m[2]), alt: m[1] }),
  },
  {
    pattern: /^\[([^\]]*)\]\(([^)\s]+)[^)]*\)/,
    build: (m) => ({ kind: "link", href: safeHref(m[2]), children: parseInline(m[1]) }),
  },
  { pattern: /^\*\*\*([\s\S]+?)\*\*\*/, build: (m) => ({ kind: "strong", children: [{ kind: "em", children: parseInline(m[1]) }] }) },
  { pattern: /^\*\*([\s\S]+?)\*\*/, build: (m) => ({ kind: "strong", children: parseInline(m[1]) }) },
  { pattern: /^__([\s\S]+?)__/, build: (m) => ({ kind: "strong", children: parseInline(m[1]) }) },
  { pattern: /^~~([\s\S]+?)~~/, build: (m) => ({ kind: "del", children: parseInline(m[1]) }) },
  { pattern: /^\*([\s\S]+?)\*/, build: (m) => ({ kind: "em", children: parseInline(m[1]) }) },
  { pattern: /^_([\s\S]+?)_/, build: (m) => ({ kind: "em", children: parseInline(m[1]) }) },
  // A bare URL, so pasted links are clickable without link syntax.
  { pattern: /^(https?:\/\/[^\s<>()]+)/, build: (m) => ({ kind: "link", href: safeHref(m[1]), children: [{ kind: "text", value: m[1] }] }) },
];

/**
 * Parses the inline content of one block.
 *
 * @param source - Raw inline markdown.
 */
export function parseInline(source: string): InlineToken[] {
  try {
    const tokens: InlineToken[] = [];
    let remaining = source;
    let literal = "";

    const flush = () => {
      if (literal.length > 0) {
        tokens.push({ kind: "text", value: literal });
        literal = "";
      }
    };

    while (remaining.length > 0) {
      // A backslash escapes the next character, so `\*` is a literal asterisk.
      if (remaining.startsWith("\\") && remaining.length > 1) {
        literal += remaining[1];
        remaining = remaining.slice(2);
        continue;
      }

      // Two trailing spaces before a newline is a hard break.
      if (remaining.startsWith("  \n")) {
        flush();
        tokens.push({ kind: "break" });
        remaining = remaining.slice(3);
        continue;
      }

      let matched = false;
      for (const rule of INLINE_RULES) {
        const match = rule.pattern.exec(remaining);
        if (match) {
          flush();
          tokens.push(rule.build(match));
          remaining = remaining.slice(match[0].length);
          matched = true;
          break;
        }
      }

      if (!matched) {
        literal += remaining[0];
        remaining = remaining.slice(1);
      }
    }

    flush();
    return tokens;
  } catch {
    return [{ kind: "text", value: source }];
  }
}

/** Splits a table row on unescaped pipes. */
function splitRow(line: string): string[] {
  try {
    return line
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim());
  } catch {
    return [line];
  }
}

/**
 * Parses a Markdown document into blocks.
 *
 * @param source - The whole document.
 */
export function parseMarkdown(source: string): ParsedMarkdown {
  try {
    if (typeof source !== "string") {
      return { blocks: [], outline: [], wordCount: 0 };
    }

    const lines = source.replace(/\r\n?/g, "\n").split("\n");
    const blocks: BlockToken[] = [];
    const outline: OutlineEntry[] = [];
    const usedSlugs = new Set<string>();
    let index = 0;

    /** Makes a heading slug unique, so anchors never collide. */
    const uniqueSlug = (text: string): string => {
      const base = slugify(text) || "section";
      let slug = base;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
      }
      usedSlugs.add(slug);
      return slug;
    };

    while (index < lines.length) {
      const line = lines[index];

      // Blank
      if (line.trim().length === 0) {
        index += 1;
        continue;
      }

      // Fenced code. Everything until the closing fence is literal, which is
      // why this is checked before anything else that could match inside it.
      const fence = /^\s*(`{3,}|~{3,})\s*([\w+-]*)\s*$/.exec(line);
      if (fence) {
        const marker = fence[1][0];
        const body: string[] = [];
        index += 1;
        while (index < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[index])) {
          body.push(lines[index]);
          index += 1;
        }
        index += 1; // closing fence
        blocks.push({ kind: "code", language: fence[2] ?? "", value: body.join("\n") });
        continue;
      }

      // Heading
      const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
      if (heading) {
        const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
        const children = parseInline(heading[2]);
        const text = inlineText(children);
        const slug = uniqueSlug(text);
        blocks.push({ kind: "heading", level, children, slug });
        outline.push({ level, text, slug });
        index += 1;
        continue;
      }

      // Horizontal rule
      if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
        blocks.push({ kind: "hr" });
        index += 1;
        continue;
      }

      // Table: a header row followed by a delimiter row.
      if (line.includes("|") && index + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[index + 1])) {
        const head = splitRow(line).map((cell) => parseInline(cell));
        index += 2;
        const rows: InlineToken[][][] = [];
        while (index < lines.length && lines[index].includes("|") && lines[index].trim().length > 0) {
          rows.push(splitRow(lines[index]).map((cell) => parseInline(cell)));
          index += 1;
        }
        blocks.push({ kind: "table", head, rows });
        continue;
      }

      // Blockquote: collect the run, strip one level of "> ", recurse.
      if (/^\s*>/.test(line)) {
        const body: string[] = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          body.push(lines[index].replace(/^\s*>\s?/, ""));
          index += 1;
        }
        blocks.push({ kind: "quote", blocks: parseMarkdown(body.join("\n")).blocks });
        continue;
      }

      // List. Nested items are handled by recursing on the dedented body, so
      // a sub-list becomes a list block inside its parent item.
      const listMatch = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
      if (listMatch) {
        const ordered = /\d/.test(listMatch[2]);
        const start = ordered ? parseInt(listMatch[2], 10) : 1;
        const baseIndent = listMatch[1].length;
        const items: BlockToken[][] = [];
        let current: string[] = [];

        const commit = () => {
          if (current.length > 0) {
            items.push(parseMarkdown(current.join("\n")).blocks);
            current = [];
          }
        };

        while (index < lines.length) {
          const itemMatch = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[index]);
          const isSameLevelItem = itemMatch && itemMatch[1].length === baseIndent;
          const isContinuation =
            !itemMatch &&
            lines[index].trim().length > 0 &&
            lines[index].search(/\S/) > baseIndent;
          const isNested = itemMatch && itemMatch[1].length > baseIndent;

          if (isSameLevelItem) {
            commit();
            current.push(itemMatch[3]);
          } else if (isContinuation || isNested) {
            current.push(lines[index].slice(baseIndent + 2));
          } else if (lines[index].trim().length === 0) {
            // A blank line inside a list only ends it if the next line is not
            // part of the list, so peek before committing.
            const next = lines[index + 1];
            if (!next || (next.trim().length > 0 && next.search(/\S/) <= baseIndent && !/^(\s*)([-*+]|\d+[.)])\s+/.test(next))) break;
            current.push("");
          } else {
            break;
          }
          index += 1;
        }

        commit();
        blocks.push({ kind: "list", ordered, start, items });
        continue;
      }

      // Paragraph: everything up to a blank line or the start of another block.
      const paragraph: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim().length > 0 &&
        !/^\s*(#{1,6}\s|>|`{3,}|~{3,})/.test(lines[index]) &&
        !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[index])
      ) {
        paragraph.push(lines[index]);
        index += 1;
      }
      if (paragraph.length > 0) {
        blocks.push({ kind: "paragraph", children: parseInline(paragraph.join("\n")) });
      } else {
        index += 1;
      }
    }

    const wordCount = source.trim().length === 0 ? 0 : source.trim().split(/\s+/).length;
    return { blocks, outline, wordCount };
  } catch {
    return { blocks: [], outline: [], wordCount: 0 };
  }
}
