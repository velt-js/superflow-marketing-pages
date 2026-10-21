import type { ReactNode } from "react";
import BuildYourOwnCard from "@/components/shared-2026/BuildYourOwnCard";
import type {
  SolutionAgent,
  SolutionBuildYourOwn,
  SolutionPage,
} from "@/lib/solutions/types";
import PackCta from "./PackCta";
import PackFolder from "./PackFolder";
import styles from "./PackSection.module.css";

const HEADING_ID = "solution-pack-heading";
/** Second sentence of the heading: "The Dental Launch Pack. Add it in one click." */
const HEADING_TAIL = "Add it in one click.";

/** Props for {@link PackSection}. */
export interface PackSectionProps {
  /** The page's pack: name, slug, intro, eight agents and the build-your-own card. */
  pack: SolutionPage["pack"];
  /** The page slug, attached to the agent card and CTA analytics events. */
  slug: string;
}

/** What the section renders, prepared from the pack data. */
interface PackView {
  heading: string;
  intro: string;
  packName: string;
  packSlug: string;
  agents: SolutionAgent[];
  buildYourOwn: SolutionBuildYourOwn | null;
}

/**
 * Prepare the pack for rendering: drop agents without a name or finding and
 * the build-your-own card when it is incomplete.
 *
 * @param pack - The page's pack data.
 * @returns The view, or null when there is nothing to show.
 */
function toPackView(pack: SolutionPage["pack"] | null | undefined): PackView | null {
  try {
    if (!pack?.name) {
      return null;
    }
    const agents = (pack.agents ?? []).filter(
      (agent) => Boolean(agent?.name) && Boolean(agent?.finding),
    );
    if (agents.length === 0) {
      return null;
    }
    const byo = pack.buildYourOwn;
    const buildYourOwn =
      byo?.input && byo?.agentName && byo?.finding ? byo : null;
    return {
      heading: `The ${pack.name}. ${HEADING_TAIL}`,
      intro: pack.intro ?? "",
      packName: pack.name,
      packSlug: pack.slug ?? "",
      agents,
      buildYourOwn,
    };
  } catch {
    return null;
  }
}

/**
 * S2, the pack: heading, the intro line, the pack folder (the eight agents
 * listed inside one folder, their sample findings peeking out), the "Build
 * your own" card, and the CTA that adds the pack to a new workspace. All copy
 * comes from page data.
 *
 * @param props - The pack and the page slug.
 * @returns The section, or null when the pack has no agents.
 */
export default function PackSection({ pack, slug }: PackSectionProps): ReactNode {
  const view = toPackView(pack);
  if (!view) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-section="solution-pack"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {view.heading}
          </h2>
          {view.intro ? <p className={styles.subhead}>{view.intro}</p> : null}
        </header>

        <PackFolder packName={view.packName} agents={view.agents} page={slug} />

        {view.buildYourOwn ? (
          <BuildYourOwnCard
            input={view.buildYourOwn.input}
            agentName={view.buildYourOwn.agentName}
            finding={view.buildYourOwn.finding}
            page={slug}
          />
        ) : null}

        <PackCta packName={view.packName} packSlug={view.packSlug} />
      </div>
    </section>
  );
}
