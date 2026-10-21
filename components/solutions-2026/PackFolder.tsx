"use client";

// PackFolder: the pack drawn as one folder. The eight agents sit inside the
// folder as a list; three sample findings peek out of the top like papers.
// Hovering or focusing an agent brings its finding to the front paper. The
// list rows carry `data-agent-card` and the finding text (visually hidden),
// so the page tests and screen readers see the same eight findings.

import { useState, type ReactNode } from "react";
import AgentCommentCard from "@/components/home-2026/feature-artifacts/AgentCommentCard";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { SolutionAgent } from "@/lib/solutions/types";
import styles from "./PackFolder.module.css";

/** How many papers peek out of the folder. */
const PAPER_COUNT = 3;
const FINDING_PREFIX = "Sample finding:";
const AGENTS_LABEL = "agents";

/** Props for {@link PackFolder}. */
export interface PackFolderProps {
  /** e.g. "Studio Handoff Agent Pack". */
  packName: string;
  /** The agents in the pack, in display order. */
  agents: readonly SolutionAgent[];
  /** Page slug for analytics. */
  page: string;
}

/**
 * The agents whose findings show as papers: the active one in front, then
 * the next ones behind it, wrapping round the list.
 *
 * @param active - Index of the active agent.
 * @param total - Number of agents.
 * @returns Agent indexes, front paper first.
 */
function paperIndexes(active: number, total: number): number[] {
  const count = Math.min(PAPER_COUNT, total);
  const out: number[] = [];
  for (let depth = 0; depth < count; depth += 1) {
    out.push((active + depth) % total);
  }
  return out;
}

/**
 * Render the pack as a folder with its agents inside.
 *
 * @param props - Pack name, agents and page slug.
 * @returns The folder, or null when there are no agents.
 */
export default function PackFolder({ packName, agents, page }: PackFolderProps): ReactNode {
  const [active, setActive] = useState<number>(0);
  const { trackEvent } = useAnalytics();

  if (!agents || agents.length === 0) {
    return null;
  }

  const safeActive = active < agents.length ? active : 0;
  const papers = paperIndexes(safeActive, agents.length);

  function select(index: number) {
    try {
      setActive(index);
    } catch {
      // Hover state is decoration; never let it throw.
    }
  }

  function handleClick(index: number) {
    select(index);
    try {
      trackEvent(AnalyticsEvents.AGENT_CARD_EXPANDED, { agent: agents[index]?.name, page });
    } catch {
      // Analytics must never block the interaction.
    }
  }

  return (
    <div className={styles.folder}>
      <div className={styles.back} aria-hidden="true" />

      <div className={styles.papers} aria-hidden="true">
        {papers.map((agentIndex, depth) => {
          const agent = agents[agentIndex];
          return (
            <div key={agent.name} className={styles.paper} data-depth={depth}>
              <AgentCommentCard
                className={styles.paperCard}
                agentName={agent.name}
                timeAgo=""
                title={agent.finding}
                description=""
                avatarVariant="agentDots"
                showMenu={false}
                showActions={false}
                interactive={false}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.front}>
        <div className={styles.frontHead}>
          <h3 className={styles.packName}>{packName}</h3>
          <p className={styles.count}>{`${agents.length} ${AGENTS_LABEL}`}</p>
        </div>

        <ul className={styles.list}>
          {agents.map((agent, index) => {
            const isActive = index === safeActive;
            return (
              <li key={`${agent.name}-${index}`} className={styles.item}>
                <button
                  type="button"
                  className={isActive ? `${styles.row} ${styles.rowActive}` : styles.row}
                  data-agent-card={agent.name}
                  aria-pressed={isActive}
                  onMouseEnter={() => select(index)}
                  onFocus={() => select(index)}
                  onClick={() => handleClick(index)}
                >
                  <span className={styles.glyph} aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                  <span className={styles.text}>
                    <span className={styles.name}>{agent.name}</span>
                    {agent.checks ? <span className={styles.checks}>{agent.checks}</span> : null}
                    <span className={styles.srOnly}>{`${FINDING_PREFIX} ${agent.finding}`}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
