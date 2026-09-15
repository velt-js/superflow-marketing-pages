import Link from "next/link";
import type { ReactNode } from "react";
import BuildYourOwnCard from "@/components/shared-2026/BuildYourOwnCard";
import { BUILD_YOUR_OWN_EXAMPLE } from "@/lib/solutions/agent-library";
import AgentsCatchTabs from "./AgentsCatchTabs";
import styles from "./AgentsCatchSection.module.css";

/** Section copy (spec section 5). */
const HEADING = "What your agents catch.";
const SUBHEAD =
  "Findings, not reports. Each one lands as a comment on the exact element.";
const HEADING_ID = "agents-catch-heading";

/** The "See the pack for your work" row. */
const PACKS_LABEL = "See the pack for your work";

/** One link in the packs row. */
interface PackLink {
  label: string;
  href: string;
}

/** Three packs, in the order the spec lists them. */
const PACK_LINKS: readonly PackLink[] = [
  { label: "Dental", href: "/solutions/dental-marketing-agencies" },
  { label: "Home services", href: "/solutions/home-services-marketing" },
  { label: "Pre-launch QA", href: "/solutions/pre-launch-qa" },
];

/** Props for {@link AgentsCatchSection}. */
export interface AgentsCatchSectionProps {
  /**
   * Where the section renders, forwarded to every card's analytics event as
   * `page`: "home" on the home page, "ai-review-agents" on the agents page.
   */
  page: string;
}

/**
 * "What your agents catch." The shared section on the home page and the
 * agents page (spec section 5): a heading and subhead, a tab strip across the
 * eight agent categories with four library agents each (every one rendered
 * with its sample finding as a pinned comment), one wide "Build your own"
 * card, and a row of three links to the packs.
 *
 * Only the tab strip needs state, so it lives in the client child
 * {@link AgentsCatchTabs}; everything else here is server rendered.
 *
 * @param props - The page the section renders on.
 * @returns The section element.
 */
export default function AgentsCatchSection({
  page,
}: AgentsCatchSectionProps): ReactNode {
  return (
    <section
      className={styles.section}
      data-section="agents-catch"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {HEADING}
          </h2>
          <p className={styles.subhead}>{SUBHEAD}</p>
        </header>

        <AgentsCatchTabs page={page} />

        <BuildYourOwnCard
          input={BUILD_YOUR_OWN_EXAMPLE.input}
          agentName={BUILD_YOUR_OWN_EXAMPLE.agentName}
          finding={BUILD_YOUR_OWN_EXAMPLE.finding}
          page={page}
        />

        <nav className={styles.packs} aria-label={PACKS_LABEL}>
          <p className={styles.packsLabel}>{PACKS_LABEL}</p>
          <ul className={styles.packList}>
            {PACK_LINKS.map((pack) => (
              <li key={pack.href}>
                <Link href={pack.href} className={styles.packLink}>
                  {pack.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
