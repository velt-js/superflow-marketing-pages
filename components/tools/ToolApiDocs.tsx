import Link from "next/link";
import styles from "./Tools.module.css";
import { CodeBlock } from "./CodeBlock";
import { SITE_URL } from "@/app/_seo/schema";
import {
  MCP_PATH,
  apiForTool,
  curlFor,
  isToolApiAvailable,
} from "@/lib/tools/api-catalog";

/**
 * The "drive this from a script or an agent" block, shown on every tool page
 * whose endpoint is published.
 *
 * WHY IT IS ON THE PAGE AND NOT ONLY IN THE DOCS
 *
 * The person most likely to want the endpoint is the person already using the
 * tool by hand and about to do it for the twentieth URL. Making them find a
 * docs page first is how an API goes unused. So the curl call sits directly
 * under the tool that just answered, with the exact arguments that tool takes.
 *
 * Renders nothing when the tool has no published endpoint, or when the
 * registry does not consider it live: advertising an endpoint for a tool whose
 * engine is not trusted yet would be worse than silence.
 *
 * @param props - The registry slug of the tool being documented.
 */
export function ToolApiDocs({ slug }: { slug: string }) {
  const entry = apiForTool(slug);
  if (!entry || !isToolApiAvailable(entry)) return null;

  const mcpCall = JSON.stringify(
    { name: entry.mcpTool, arguments: entry.sample },
    null,
    2,
  );

  return (
    <section id="api" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.h2}>Use it from a script or an agent</h2>
        <p className={styles.sectionLead}>
          The same run this page does, as an HTTP endpoint and as an MCP tool.
          No account, no API key, no signup. {entry.rateLimit}
          {entry.rateLimit.endsWith(".") ? "" : "."} Allow up to{" "}
          {entry.timeoutSeconds} seconds for an answer.
        </p>

        <div className={styles.apiGrid}>
          <div className={styles.apiCol}>
            <h3 className={styles.apiHeading}>HTTP</h3>
            <CodeBlock
              label={`${entry.method} ${entry.path}`}
              language="bash"
              tool={slug}
              code={curlFor(entry, SITE_URL)}
            />
            <p className={styles.apiNote}>
              Returns <code className={styles.inlineCode}>{entry.returns}</code>
            </p>
          </div>

          <div className={styles.apiCol}>
            <h3 className={styles.apiHeading}>MCP</h3>
            <CodeBlock
              label="Add the server once"
              language="bash"
              tool={slug}
              code={`claude mcp add --transport http superflow ${SITE_URL}${MCP_PATH}`}
            />
            <p className={styles.apiNote}>
              Then ask your agent for this tool by name:{" "}
              <code className={styles.inlineCode}>{entry.mcpTool}</code>.{" "}
              <Link className={styles.apiLink} href="/tools/mcp">
                Setup for Claude Code, Claude Desktop, Cursor, and VS Code
              </Link>
              .
            </p>
            <details className={styles.apiDetails}>
              <summary className={styles.apiSummary}>
                Raw MCP tools/call arguments
              </summary>
              <CodeBlock language="json" tool={slug} code={mcpCall} />
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
