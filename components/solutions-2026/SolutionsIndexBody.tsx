import Link from "next/link";
import type { ReactNode } from "react";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import { solutionPath } from "@/lib/solutions/seed";
import type { SolutionKind, SolutionSummary } from "@/lib/solutions/types";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./SolutionsIndexBody.module.css";

/** Index hero copy (spec section 7). */
export const INDEX_HEADING = "Built for the work you already ship.";
export const INDEX_SUBHEAD =
  "A pack of agents for the clients you serve and the jobs you run. Pick one, add it in one click.";
const HERO_CTA_LABEL = "Start free";
const PACK_LABEL = "Pack";
/** How many agent names a card lists. */
const AGENT_NAME_COUNT = 3;

/** The two card groups, in order. */
const GROUPS: readonly { kind: SolutionKind; label: string; id: string }[] = [
  { kind: "agency", label: "By agency", id: "solutions-by-agency" },
  { kind: "job", label: "By job", id: "solutions-by-job" },
];

/** Props for {@link SolutionsIndexBody}. */
export interface SolutionsIndexBodyProps {
  /** Every visible solution page, sorted for display. */
  summaries: readonly SolutionSummary[];
}

/**
 * The first agent names a card shows.
 *
 * @param summary - The page summary.
 * @returns Up to three non-empty names.
 */
function firstAgentNames(summary: SolutionSummary): string[] {
  try {
    return (summary?.agentNames ?? [])
      .filter((name): name is string => typeof name === "string" && name.length > 0)
      .slice(0, AGENT_NAME_COUNT);
  } catch {
    return [];
  }
}

/**
 * The summaries of one kind, in their sorted order.
 *
 * @param summaries - Every summary.
 * @param kind - The group's kind.
 * @returns The matching summaries.
 */
function ofKind(
  summaries: readonly SolutionSummary[],
  kind: SolutionKind,
): SolutionSummary[] {
  try {
    return (summaries ?? []).filter((summary) => summary?.kind === kind);
  } catch {
    return [];
  }
}

/**
 * One index card: the whole card is a link. Title, descriptor, pack name and
 * the first three agent names.
 *
 * @param props - The summary to render.
 * @returns The card.
 */
function SolutionCard({ summary }: { summary: SolutionSummary }): ReactNode {
  const agentNames = firstAgentNames(summary);
  return (
    <li className={styles.cell}>
      <Link className={styles.card} href={solutionPath(summary.slug)}>
        <span className={styles.cardTop}>
          <span className={styles.cardTitle}>{summary.navLabel}</span>
          {summary.navDescriptor ? (
            <span className={styles.cardDesc}>{summary.navDescriptor}</span>
          ) : null}
        </span>
        {summary.packName ? (
          <span className={styles.pack}>
            <span className={styles.packLabel}>{PACK_LABEL}</span>
            <span className={styles.packName}>{summary.packName}</span>
          </span>
        ) : null}
        {agentNames.length > 0 ? (
          <span className={styles.agents}>
            {agentNames.map((name) => (
              <span key={name} className={styles.agent}>
                {name}
              </span>
            ))}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

/**
 * The /solutions index: the compact gradient hero, then the "By agency" and
 * "By job" card groups.
 *
 * @param props - The summaries to list.
 * @returns The page body.
 */
export default function SolutionsIndexBody({
  summaries,
}: SolutionsIndexBodyProps): ReactNode {
  return (
    <main>
      <SiteNav />
      <ListingHero
        heading={INDEX_HEADING}
        subheading={INDEX_SUBHEAD}
        ctaText={HERO_CTA_LABEL}
        ctaHref={SIGNUP_URL}
      />
      <section className={styles.section} data-section="solutions-index">
        <div className={styles.inner}>
          {GROUPS.map((group) => {
            const entries = ofKind(summaries, group.kind);
            if (entries.length === 0) {
              return null;
            }
            return (
              <section
                key={group.kind}
                className={styles.group}
                aria-labelledby={group.id}
              >
                <h2 id={group.id} className={styles.groupHeading}>
                  {group.label}
                </h2>
                <ul className={styles.grid}>
                  {entries.map((summary) => (
                    <SolutionCard key={summary.slug} summary={summary} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
