// Renders a tool's content as the Markdown document served at
// /tools/<slug>.md.
//
// WHAT AN AGENT ACTUALLY NEEDS
//
// Not the page. The page carries a 500-word essay written to rank, a nav, a
// footer, and a CTA, none of which help a machine decide whether this tool
// solves its problem. What helps is: what it does, how to drive it, what its
// limits are, whether there is an API, and what happens to the data. So the
// .md is a rewrite for a different reader rather than a transcription.
//
// It is deliberately plain CommonMark with no front matter. Front matter is a
// generator convention, not a reading convention, and half the parsers that
// will fetch this would surface it as literal text at the top of the document.

import type { ToolContent } from "./types";
import { SITE_URL } from "@/app/_seo/schema";
import { findTool, relatedTools, toolPath } from "@/lib/tools/registry";

/** Escapes the characters that would break out of a Markdown table cell. */
function cell(value: string): string {
  try {
    return value.replace(/\|/g, "\\|").replace(/\n+/g, " ");
  } catch {
    return value;
  }
}

/**
 * Renders one tool as a Markdown document.
 *
 * @param content - The tool's shared content.
 */
export function toolToMarkdown(content: ToolContent): string {
  try {
    const entry = findTool(content.slug);
    const canonical = `${SITE_URL}${toolPath(content.slug)}`;
    const lines: string[] = [];

    lines.push(`# ${content.title}`, "");
    lines.push(`> ${content.description}`, "");
    lines.push(`This is the Markdown copy of ${canonical}, published for AI agents and scripts.`, "");

    lines.push("## What it does", "");
    lines.push(content.subhead, "");

    if (content.howItWorks.length > 0) {
      lines.push("## How to use it", "");
      content.howItWorks.forEach((step, index) => {
        lines.push(`${index + 1}. **${step.title}.** ${step.body}`);
      });
      lines.push("");
    }

    if (content.facts.length > 0) {
      // A table rather than prose: these are the values a machine is most
      // likely to be looking for, and a table is the one Markdown structure
      // every parser agrees on.
      lines.push("## Facts", "");
      lines.push("| | |", "| --- | --- |");
      for (const fact of content.facts) {
        lines.push(`| ${cell(fact.label)} | ${cell(fact.value)} |`);
      }
      lines.push("");
    }

    if (content.faq.length > 0) {
      lines.push("## Questions", "");
      for (const item of content.faq) {
        lines.push(`### ${item.question}`, "", item.answer, "");
      }
    }

    const related = relatedTools(content.slug, 4).filter((tool) => tool.status === "live");
    if (related.length > 0) {
      lines.push("## Related tools", "");
      for (const tool of related) {
        lines.push(`- [${tool.name}](${SITE_URL}${toolPath(tool.slug)}) — ${tool.tagline}. Markdown copy: ${SITE_URL}${toolPath(tool.slug)}.md`);
      }
      lines.push("");
    }

    lines.push("## About", "");
    lines.push(
      `${content.title} is one of a set of free tools published by Superflow at ${SITE_URL}/tools. None of them require a login, an email address, or payment.`,
      "",
    );
    if (entry) {
      lines.push(`Category: ${entry.category}.`, "");
    }
    lines.push(`Superflow is a website and creative-asset review tool. Its agents watch every page of a site and report what changed. See ${SITE_URL}.`, "");

    return lines.join("\n");
  } catch {
    // A Markdown copy is a convenience surface. Returning a minimal stub beats
    // a 500 on a URL an agent is polling.
    return `# ${content.title}\n\n> ${content.description}\n`;
  }
}
