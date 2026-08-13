// Markdown index of the free tools, at /tools.md.
//
// The directory name is literally "tools.md", matching how app/llms.txt and
// app/llms-full.txt are already routed in this app. It sits beside the /tools
// page rather than under it, so the catch-all that serves the per-tool copies
// never sees this path.
//
// Both statuses are listed here, unlike the per-tool .md files. A link to a
// document is a promise the document exists, so only working tools get one.
// But telling an agent what is coming is useful, and it costs a line.

import { NextResponse } from "next/server";
import { SITE_URL } from "@/app/_seo/schema";
import { CATEGORY_LABELS, TOOLS, toolPath, type ToolCategory } from "@/lib/tools/registry";
import { findToolContent } from "@/lib/tools/content";

export const revalidate = 3600;

/** Category display order, matching the /tools page. */
const CATEGORY_ORDER: ToolCategory[] = [
  "ai-visibility",
  "structured-data",
  "social",
  "quality",
  "campaigns",
  "assets",
];

export async function GET(): Promise<NextResponse> {
  try {
    const lines: string[] = [];

    lines.push("# Superflow free tools", "");
    lines.push(
      "> Free tools for checking whether AI systems can read your site, validating structured data, and handling everyday web work. No login, no email gate, no ads.",
      "",
    );
    lines.push(
      `Every working tool below also publishes a Markdown copy of its page at the same path with a .md suffix, for agents and scripts. The human pages are at ${SITE_URL}/tools`,
      "",
    );

    for (const category of CATEGORY_ORDER) {
      const inCategory = TOOLS.filter((tool) => tool.category === category);
      if (inCategory.length === 0) continue;

      lines.push(`## ${CATEGORY_LABELS[category]}`, "");
      for (const tool of inCategory) {
        const url = `${SITE_URL}${toolPath(tool.slug)}`;
        if (tool.status === "live") {
          const hasMarkdown = Boolean(findToolContent(tool.slug));
          const markdownNote = hasMarkdown ? ` Markdown: ${url}.md` : "";
          lines.push(`- [${tool.name}](${url}) — ${tool.tagline}.${markdownNote}`);
        } else {
          // No link: the page does not exist yet, and pointing an agent at a
          // 404 is worse than telling it to come back.
          lines.push(`- ${tool.name} (not published yet) — ${tool.tagline}.`);
        }
      }
      lines.push("");
    }

    lines.push("## About", "");
    lines.push(
      `These tools are published by Superflow, a website and creative-asset review tool whose agents watch every page of a site and report what changed. ${SITE_URL}`,
      "",
    );

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse("# Superflow free tools\n", {
      status: 200,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
}
