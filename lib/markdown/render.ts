// Renders an AgentDoc as the Markdown document served at /<path>.md.
//
// Plain CommonMark with no front matter, matching lib/tools/content/
// to-markdown.ts: front matter is a generator convention rather than a
// reading one, and half the parsers that will fetch this would surface it as
// literal text at the top of the document.

import type { AgentDoc, AgentDocSection } from "./types";
import { SITE_URL } from "@/app/_seo/schema";
import { MCP_PATH } from "@/lib/tools/api-catalog";
import { cell, clean, cleanMultiline, stripEmDashes } from "./text";

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  try {
    if (path === "/") return SITE_URL;
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  } catch {
    return SITE_URL;
  }
}

/**
 * Markdown URL for a site path.
 *
 * The homepage has no slug to hang a suffix on, so it is published at
 * /index.md; every other page takes its own path plus `.md`.
 */
export function markdownUrl(path: string): string {
  try {
    if (path === "/") return `${SITE_URL}/index.md`;
    return `${absoluteUrl(path)}.md`;
  } catch {
    return `${SITE_URL}/index.md`;
  }
}

/**
 * Drops table columns that are empty in every row.
 *
 * Several CMS fields are optional per document, so a column can be entirely
 * blank on one page and full on the next. An all-empty column is noise in a
 * document whose whole purpose is signal, so it is removed per page rather
 * than per template.
 */
function pruneColumns(table: { headers: string[]; rows: string[][] }): {
  headers: string[];
  rows: string[][];
} {
  try {
    const keep = table.headers.map((_, index) =>
      table.rows.some((row) => clean(row[index])),
    );
    // The first column is the row's label; keeping it even when blank keeps
    // the table rectangular and readable.
    keep[0] = true;
    return {
      headers: table.headers.filter((_, index) => keep[index]),
      rows: table.rows.map((row) => row.filter((_, index) => keep[index])),
    };
  } catch {
    return table;
  }
}

/** Renders one section, or "" when it carries no content. */
function renderSection(section: AgentDocSection): string {
  try {
    const lines: string[] = [];
    // `cleanMultiline`, not `clean`: a body paragraph can be a whole rendered
    // Portable Text document (a blog post's full text), and collapsing its
    // newlines would flatten every heading, list and table in it into one
    // unreadable paragraph.
    const body = (section.body ?? [])
      .map((text) => stripEmDashes(cleanMultiline(text)))
      .filter(Boolean);
    const bullets = (section.bullets ?? []).map((text) => stripEmDashes(clean(text))).filter(Boolean);
    const steps = (section.steps ?? []).map((text) => stripEmDashes(clean(text))).filter(Boolean);
    const table = section.table ? pruneColumns(section.table) : undefined;
    const hasTable = Boolean(table && table.rows.length > 0);

    if (body.length === 0 && bullets.length === 0 && steps.length === 0 && !hasTable) return "";

    lines.push(`## ${stripEmDashes(clean(section.heading))}`, "");

    for (const paragraph of body) {
      lines.push(paragraph, "");
    }

    if (bullets.length > 0) {
      for (const bullet of bullets) lines.push(`- ${bullet}`);
      lines.push("");
    }

    if (steps.length > 0) {
      steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
      lines.push("");
    }

    if (table && hasTable) {
      lines.push(`| ${table.headers.map(cell).join(" | ")} |`);
      lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`);
      for (const row of table.rows) {
        lines.push(`| ${row.map((value) => stripEmDashes(cell(value))).join(" | ")} |`);
      }
      lines.push("");
    }

    return lines.join("\n");
  } catch {
    return "";
  }
}

/**
 * Renders a page's Markdown copy.
 *
 * @param doc - The structured document for one page.
 * @returns A CommonMark document, newline-terminated.
 */
export function renderAgentDoc(doc: AgentDoc): string {
  try {
    const canonical = absoluteUrl(doc.path);
    const lines: string[] = [];

    lines.push(`# ${stripEmDashes(clean(doc.title))}`, "");

    const summary = stripEmDashes(clean(doc.summary));
    if (summary) lines.push(`> ${summary}`, "");

    lines.push(
      `This is the Markdown copy of ${canonical}, published for AI agents and scripts. The HTML page is canonical.`,
      "",
    );

    // Key facts lead. A machine reading this is deciding whether the page is
    // relevant at all, and that decision is made on the facts rather than on
    // the prose underneath them.
    const facts = (doc.facts ?? []).filter((fact) => clean(fact.value));
    const factRows: string[][] = [
      ["Page type", doc.kind],
      ["URL", canonical],
      ...facts.map((fact) => [fact.label, fact.value]),
    ];
    if (doc.updatedAt) factRows.push(["Last updated", doc.updatedAt]);

    lines.push("## Key facts", "");
    lines.push("| Field | Value |");
    lines.push("| --- | --- |");
    for (const [label, value] of factRows) {
      lines.push(`| ${cell(label)} | ${stripEmDashes(cell(value))} |`);
    }
    lines.push("");

    for (const section of doc.sections) {
      const rendered = renderSection(section);
      if (rendered) lines.push(rendered);
    }

    const faq = (doc.faq ?? []).filter((item) => clean(item.question) && clean(item.answer));
    if (faq.length > 0) {
      lines.push("## Questions and answers", "");
      for (const item of faq) {
        lines.push(`### ${stripEmDashes(clean(item.question))}`, "");
        lines.push(stripEmDashes(clean(item.answer)), "");
      }
    }

    const related = (doc.related ?? []).filter((link) => clean(link.title) && clean(link.path));
    if (related.length > 0) {
      lines.push("## Related pages", "");
      lines.push("Each of these also publishes a Markdown copy at its own path plus `.md`.", "");
      for (const link of related) {
        const note = clean(link.note) ? ` - ${stripEmDashes(clean(link.note))}` : "";
        lines.push(`- [${stripEmDashes(clean(link.title))}](${absoluteUrl(link.path)})${note}`);
      }
      lines.push("");
    }

    // The footer is identical on every page on purpose: an agent that lands on
    // one arbitrary page should be one fetch away from the whole site.
    lines.push("## About Superflow", "");
    lines.push(
      "Superflow is a website and creative-asset review tool. Its agents watch every page of a site, report what changed, and route findings to the people who approve them. Teams leave contextual feedback on live sites, staging environments, PDFs, images, videos, and Lottie animations, and comments sync two-way with Asana, ClickUp, Monday, Slack, Webflow, and Google Tag Manager.",
      "",
    );
    lines.push("Machine-readable entry points:", "");
    lines.push(`- Site index: ${SITE_URL}/llms.txt`);
    lines.push(`- Full site content in one fetch: ${SITE_URL}/llms-full.txt`);
    lines.push(`- Free tools, with a Markdown copy of each: ${SITE_URL}/tools.md`);
    lines.push(
      `- MCP server (Streamable HTTP, no account and no API key): ${SITE_URL}${MCP_PATH}`,
    );
    lines.push(`- Agent card: ${SITE_URL}/.well-known/agent-card.json`);
    lines.push("");

    return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  } catch {
    // A page that cannot be rendered is better served as a stub pointing at
    // the canonical HTML than as a 500.
    return `# ${doc.title}\n\nSee ${absoluteUrl(doc.path)}\n`;
  }
}
