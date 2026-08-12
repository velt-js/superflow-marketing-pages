import Link from "next/link";
import styles from "./Tools.module.css";
import { ToolIcon } from "./ToolIcon";
import { relatedTools, toolPath, type ToolEntry } from "@/lib/tools/registry";

/**
 * A single tool card. Live tools link; planned ones render as a static card
 * with a "coming soon" label so the grid stays full without creating a dead
 * internal link.
 *
 * @param props - The tool to render.
 */
export function ToolCard({ tool }: { tool: ToolEntry }) {
  const body = (
    <>
      <span className={styles.toolCardIcon}>
        <ToolIcon name={tool.icon} />
      </span>
      <p className={styles.toolCardName}>{tool.name}</p>
      <p className={styles.toolCardTagline}>{tool.tagline}</p>
      {tool.status === "planned" ? (
        <span className={styles.comingSoon}>Coming soon</span>
      ) : null}
    </>
  );

  if (tool.status !== "live") {
    return (
      <div className={`${styles.toolCard} ${styles.toolCardPlanned}`}>
        {body}
      </div>
    );
  }

  return (
    <Link className={styles.toolCard} href={toolPath(tool.slug)}>
      {body}
    </Link>
  );
}

/**
 * The related-tools grid rendered at the bottom of every tool page. This is
 * the internal-link mesh the brief calls for, so it is a real navigational
 * element rather than a footer afterthought.
 *
 * @param props - The current tool's slug.
 */
export function RelatedTools({ slug }: { slug: string }) {
  const tools = relatedTools(slug, 3);
  if (tools.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.h2}>More free tools</h2>
        <p className={styles.sectionLead}>
          No login, no email, no ads. Same as this one.
        </p>
        <div className={styles.toolGrid}>
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
