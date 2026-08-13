// The MCP and API documentation page.
//
// One page for the whole surface, rather than a docs section: there are a
// dozen endpoints, they all take a URL, and they all behave the same way, so
// splitting that across pages would be filing rather than explaining. Every
// table on this page is generated from lib/tools/api-catalog.ts, which is the
// same source the MCP server itself answers `tools/list` from — so the page
// cannot document a tool the server does not serve, or miss one it does.
//
// Not registered in lib/tools/registry.ts on purpose. That registry is the
// list of free tools, and this is documentation about them, not a tool. It is
// listed in the sitemap directly.

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import styles from "@/components/tools/Tools.module.css";
import { CodeBlock } from "@/components/tools/CodeBlock";
import { ToolFaq, type ToolFaqItem } from "@/components/tools/ToolFaq";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import {
  MCP_PATH,
  availableToolApis,
  curlFor,
} from "@/lib/tools/api-catalog";
import { toolPath } from "@/lib/tools/registry";

const PATH = "/tools/mcp";
const TITLE = "MCP Server and API for the Free Tools";
const DESCRIPTION =
  "Superflow's free website tools as an MCP server and a plain HTTP API. Check AI visibility, robots.txt, structured data, social previews, and tech stacks from Claude Code, Cursor, or curl. No account, no API key.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

const ENDPOINT = `${SITE_URL}${MCP_PATH}`;

/** Per-client setup. Every one of these is the whole install, not a step 1. */
const SETUP: Array<{ client: string; label: string; language: string; code: string; note?: string }> = [
  {
    client: "Claude Code",
    label: "Run once, in any project",
    language: "bash",
    code: `claude mcp add --transport http superflow ${ENDPOINT}`,
    note: "Add --scope user to make it available in every project rather than this one.",
  },
  {
    client: "Claude Desktop",
    label: "claude_desktop_config.json",
    language: "json",
    code: `{
  "mcpServers": {
    "superflow": {
      "type": "http",
      "url": "${ENDPOINT}"
    }
  }
}`,
    note: "Settings → Developer → Edit Config, then restart the app.",
  },
  {
    client: "Cursor",
    label: "~/.cursor/mcp.json, or .cursor/mcp.json in a project",
    language: "json",
    code: `{
  "mcpServers": {
    "superflow": {
      "url": "${ENDPOINT}"
    }
  }
}`,
  },
  {
    client: "VS Code",
    label: "Run once",
    language: "bash",
    code: `code --add-mcp '{"name":"superflow","type":"http","url":"${ENDPOINT}"}'`,
  },
  {
    client: "Anything older",
    label: "Bridge a stdio-only client onto the HTTP endpoint",
    language: "json",
    code: `{
  "mcpServers": {
    "superflow": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${ENDPOINT}"]
    }
  }
}`,
    note: "Only needed for clients that predate the Streamable HTTP transport.",
  },
];

const FAQ: ToolFaqItem[] = [
  {
    question: "Do I need an API key or an account?",
    answer:
      "No. There is no signup, no key, and no OAuth step. The endpoint is open and the tools are free. What limits use is a per-IP rate limit, not a credential.",
  },
  {
    question: "What are the rate limits?",
    answer:
      "Ten runs per hour per IP for the tools that fetch, render, or call a model, and sixty per hour for the Tech Stack Detector, which only fetches one page. The UTM builder and the MD5 endpoint have no limit because they do no work beyond string handling. Results are cached for 24 hours per URL, and a cached answer does not spend a slot, so asking about a URL somebody already checked is free.",
  },
  {
    question: "How long does a call take?",
    answer:
      "Between about a second for the Tech Stack Detector and up to a minute for the checks that render a page or call a model. Each tool tells your client its own ceiling in its description, so set your timeout from that rather than assuming a normal HTTP call.",
  },
  {
    question: "What do you store?",
    answer:
      "The result of a run, cached against the URL for 24 hours, and nothing else. No account, no history, no log of who asked. Screenshots are the one exception: the PNG lives in our bucket behind a link that expires in about a day.",
  },
  {
    question: "Can I use this in a product?",
    answer:
      "For yourself, your team, and your clients' sites, yes. What the rate limit is there to prevent is somebody reselling the endpoint as their own tool, or pointing a crawler at it. If you need volume beyond the hourly limits, get in touch rather than working around them.",
  },
  {
    question: "Why is a tool missing from the list?",
    answer:
      "The list on this page is generated from the same catalogue the MCP server answers with, and a tool only appears once its engine is verified working, so a tool we do not yet trust is absent rather than quietly wrong. One tool has no endpoint at all by design: the Markdown Viewer runs entirely in your browser, so nothing you open in it ever reaches a server.",
  },
];

export default function ToolsMcpPage() {
  const tools = availableToolApis();
  const sample = tools[0];

  return (
    <div className={styles.page}>
      <SiteNav solidAtTop />

      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path={PATH}
        trail={[
          { name: "Free tools", url: `${SITE_URL}/tools` },
          { name: "MCP and API", url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd id="ld-tools-mcp-faq" data={buildFaqPageSchema(FAQ)} />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Free forever</span>
          <h1 className={styles.h1}>MCP server and API for the free tools</h1>
          <p className={styles.subhead}>
            Every tool on{" "}
            <Link className={styles.privacyLink} href="/tools">
              /tools
            </Link>{" "}
            is also an MCP tool and an HTTP endpoint. Point your agent at one
            URL and it can check AI visibility, read robots.txt the way a
            crawler does, write schema markup, preview a share card, or draft
            alt text, on any site, without you writing a line of glue.
          </p>
          <p className={styles.privacyLine}>
            No account, no API key, no OAuth. {tools.length} tools. We do not
            store the URLs you send or the results beyond a 24 hour cache.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>The endpoint</h2>
          <p className={styles.sectionLead}>
            One URL, Streamable HTTP transport, no authentication. Add it to
            any MCP client.
          </p>
          <CodeBlock
            label="MCP endpoint"
            language="http"
            tool="tools-mcp"
            code={ENDPOINT}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Add it to your client</h2>
          <p className={styles.sectionLead}>
            Pick your client. Each of these is the entire setup.
          </p>
          {SETUP.map((entry) => (
            <div key={entry.client} className={styles.apiDetails}>
              <h3 className={styles.apiHeading}>{entry.client}</h3>
              <CodeBlock
                label={entry.label}
                language={entry.language}
                tool="tools-mcp"
                code={entry.code}
              />
              {entry.note ? (
                <p className={styles.apiNote}>{entry.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>The tools</h2>
          <p className={styles.sectionLead}>
            What your agent sees after connecting. Every tool takes a URL,
            except the two that take text.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">MCP tool</th>
                  <th scope="col" className={styles.tableMain}>
                    What it does
                  </th>
                  <th scope="col" className={styles.tableAside}>
                    Arguments
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((entry) => (
                  <tr key={entry.mcpTool}>
                    <td className={styles.tableCode}>{entry.mcpTool}</td>
                    <td className={styles.tableMain}>
                      <Link
                        className={styles.apiLink}
                        href={toolPath(entry.slug)}
                      >
                        {entry.title}
                      </Link>
                      . {entry.description.split(". ")[0]}.
                    </td>
                    <td className={styles.tableCodeWrap}>
                      {Object.entries(entry.inputSchema.properties)
                        .map(([key]) =>
                          entry.inputSchema.required?.includes(key)
                            ? key
                            : `${key}?`,
                        )
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>The HTTP API</h2>
          <p className={styles.sectionLead}>
            The same tools without MCP. Every endpoint takes a JSON body with a
            URL and answers with JSON. Add{" "}
            <code className={styles.inlineCode}>&quot;refresh&quot;: true</code>{" "}
            to skip the 24 hour cache and run again.
          </p>

          {sample ? (
            <CodeBlock
              label="Example"
              language="bash"
              tool="tools-mcp"
              code={curlFor(sample, SITE_URL)}
            />
          ) : null}

          <div className={`${styles.tableWrap} ${styles.sectionSpacer}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Endpoint</th>
                  <th scope="col" className={styles.tableMain}>
                    Returns
                  </th>
                  <th scope="col">Limit</th>
                  <th scope="col">Allow</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((entry) => (
                  <tr key={entry.path}>
                    <td className={styles.tableCode}>
                      {entry.method} {entry.path}
                    </td>
                    <td className={`${styles.tableCodeWrap} ${styles.tableMain}`}>
                      {entry.returns}
                    </td>
                    <td>{entry.rateLimit}</td>
                    <td>{entry.timeoutSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${styles.prose} ${styles.proseBlock}`}>
            <h3>Failures</h3>
            <p>
              A failed run is still JSON. Depending on the endpoint it comes
              back either as{" "}
              <code className={styles.inlineCode}>
                {"{ ok: false, code, message }"}
              </code>{" "}
              with a 4xx, or as HTTP 200 carrying an{" "}
              <code className={styles.inlineCode}>error</code> field and an{" "}
              <code className={styles.inlineCode}>errorCode</code>. Both carry a{" "}
              <code className={styles.inlineCode}>message</code> written for a
              human to read as-is. There is never a stack trace and never an
              empty 500. Over MCP both shapes surface as a tool error, so an
              agent does not have to know which endpoint uses which.
            </p>
            <p>
              The codes worth branching on are{" "}
              <code className={styles.inlineCode}>invalid-url</code> (including
              anything private, local, or not on the public internet),{" "}
              <code className={styles.inlineCode}>rate-limited</code> (carries{" "}
              <code className={styles.inlineCode}>retryAfterSeconds</code>),{" "}
              <code className={styles.inlineCode}>blocked</code> (bot
              protection answered instead of the site), and{" "}
              <code className={styles.inlineCode}>budget-exhausted</code> (the
              monthly model spend on the two AI-backed tools, which fails
              closed rather than inventing an answer).
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Common questions</h2>
          <ToolFaq items={FAQ} />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
