// Portable Text -> Markdown.
//
// Sanity stores long-form copy (blog bodies, checklist end notes, integration
// overviews) as Portable Text. The React renderers live in
// components/PortableText.tsx and components/blog-2026/BlogPortableText.tsx;
// this is the same traversal for a reader with no DOM.
//
// Custom block types are kept in step with those two renderers: `code`,
// `image` / `blogBodyImage`, and `table`. An unknown block type degrades to
// its own plain text rather than disappearing, so a new type added in the
// Studio shows up as prose here instead of silently emptying a document.

import { clean, stripEmDashes } from "./text";

/** A Portable Text span, list item, or custom block. Deliberately loose. */
type PtNode = {
  _type?: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  text?: string;
  marks?: string[];
  children?: PtNode[];
  markDefs?: PtMarkDef[];
  // Custom types.
  code?: string;
  language?: string;
  alt?: string;
  caption?: string;
  rows?: { _key?: string; cells?: string[] }[];
};

type PtMarkDef = {
  _key?: string;
  _type?: string;
  href?: string;
};

/** Heading styles mapped to their Markdown prefix. */
const HEADING_PREFIX: Record<string, string> = {
  h1: "##",
  h2: "##",
  h3: "###",
  h4: "####",
  h5: "#####",
  h6: "######",
};

/** Escapes Markdown control characters that would change how text renders. */
function escapeInline(text: string): string {
  try {
    // Only the characters that actually start a construct mid-line. Escaping
    // more than this makes the document harder to read than the problem it
    // solves - an agent reading a stray asterisk loses nothing.
    return text.replace(/([\\`*_[\]])/g, "\\$1");
  } catch {
    return text;
  }
}

/** Renders one span's text with its marks applied. */
function renderSpan(node: PtNode, markDefs: PtMarkDef[]): string {
  try {
    let text = escapeInline(node.text ?? "");
    if (!text) return "";

    const marks = node.marks ?? [];

    if (marks.includes("code")) text = `\`${node.text ?? ""}\``;
    if (marks.includes("strong")) text = `**${text}**`;
    if (marks.includes("em")) text = `_${text}_`;

    // Annotation marks reference markDefs by _key. `link` is the built-in;
    // `linkAnnotation` is this repo's own (sanity/schemas/shared/linkAnnotation).
    for (const mark of marks) {
      const def = markDefs.find((candidate) => candidate._key === mark);
      if (def?.href) {
        text = `[${text}](${def.href})`;
        break;
      }
    }

    return text;
  } catch {
    return node.text ?? "";
  }
}

/** Concatenates a block's children into one inline string. */
function renderChildren(block: PtNode): string {
  try {
    const markDefs = block.markDefs ?? [];
    return (block.children ?? [])
      .map((child) => renderSpan(child, markDefs))
      .join("");
  } catch {
    return "";
  }
}

/** Renders a `table` block as a pipe table, using the first row as headers. */
function renderTable(block: PtNode): string {
  try {
    const rows = (block.rows ?? []).filter((row) => (row.cells ?? []).length > 0);
    if (rows.length === 0) return "";

    const escape = (value: string) => clean(value).replace(/\|/g, "\\|");
    const [header, ...body] = rows;
    const headerCells = (header.cells ?? []).map(escape);
    const width = headerCells.length;

    const lines = [
      `| ${headerCells.join(" | ")} |`,
      `| ${headerCells.map(() => "---").join(" | ")} |`,
    ];
    for (const row of body) {
      const cells = (row.cells ?? []).map(escape);
      // Pad or trim to the header width: a ragged pipe table stops being a
      // table in every parser that reads this.
      while (cells.length < width) cells.push("");
      lines.push(`| ${cells.slice(0, width).join(" | ")} |`);
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}

/**
 * Converts a Portable Text array to Markdown.
 *
 * @param value - The Portable Text blocks, or anything else (returns "").
 * @returns A Markdown string, or "" when there is nothing to render.
 */
export function portableTextToMarkdown(value: unknown): string {
  try {
    if (!Array.isArray(value)) return "";

    const out: string[] = [];

    for (const raw of value as PtNode[]) {
      if (!raw || typeof raw !== "object") continue;

      switch (raw._type) {
        case "code": {
          const code = raw.code ?? "";
          if (!code.trim()) break;
          out.push(`\`\`\`${raw.language ?? ""}\n${code.replace(/\s+$/, "")}\n\`\`\``);
          break;
        }

        case "image":
        case "blogBodyImage": {
          // The image itself is useless to a text reader, but its alt text and
          // caption are content the page relies on, so they are kept as prose.
          const describe = clean(raw.alt) || clean(raw.caption);
          // An alt that is just the uploaded filename describes nothing, and
          // "Figure: hero-v2-final.png" is worse than no line at all.
          const isFilename = /^[\w-]+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(describe);
          if (describe && !isFilename) out.push(`_Figure: ${escapeInline(describe)}_`);
          break;
        }

        case "table": {
          const table = renderTable(raw);
          if (table) out.push(table);
          break;
        }

        case "block":
        case undefined: {
          const text = renderChildren(raw).trim();
          if (!text) break;

          if (raw.listItem) {
            const indent = "  ".repeat(Math.max(0, (raw.level ?? 1) - 1));
            const bullet = raw.listItem === "number" ? "1." : "-";
            out.push(`${indent}${bullet} ${text}`);
            break;
          }

          if (raw.style === "blockquote") {
            out.push(`> ${text}`);
            break;
          }

          const prefix = HEADING_PREFIX[raw.style ?? ""];
          // Portable Text h1 is demoted to h2: the document already has an H1
          // and a second one would read as a second document.
          if (prefix) {
            out.push(`${prefix} ${text}`);
            break;
          }

          out.push(text);
          break;
        }

        default: {
          // Unknown custom type. If it has spans, they are content.
          const text = renderChildren(raw).trim();
          if (text) out.push(text);
          break;
        }
      }
    }

    // List items are joined with a single newline so they stay one list;
    // everything else gets a blank line.
    const joined: string[] = [];
    for (let i = 0; i < out.length; i += 1) {
      joined.push(out[i]);
      const current = out[i];
      const next = out[i + 1];
      if (next === undefined) break;
      const bothList = /^\s*(-|\d+\.)\s/.test(current) && /^\s*(-|\d+\.)\s/.test(next);
      joined.push(bothList ? "\n" : "\n\n");
    }

    return stripEmDashes(joined.join("").trim());
  } catch {
    return "";
  }
}

/**
 * Flattens Portable Text to a single plain-text paragraph.
 *
 * Used where a structured field needs a one-line gloss (a table cell, a
 * summary) and the source happens to be rich text.
 */
export function portableTextToPlain(value: unknown): string {
  try {
    if (!Array.isArray(value)) return "";
    return clean(
      (value as PtNode[])
        .map((block) =>
          (block?.children ?? []).map((child) => child.text ?? "").join(""),
        )
        .join(" "),
    );
  } catch {
    return "";
  }
}
