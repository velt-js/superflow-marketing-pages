import type { ReactNode } from "react";
import type { AgentReviewComment } from "../hero-artifacts/AgentsAtWorkArtifact";
import { ReviewAgentsArtifact } from "./HeroArtifactFit";

/**
 * Feature Set "Agent grounding" tab (memory variant).
 *
 * A thin wrapper over {@link ReviewAgentsArtifact} — the reused "Agents at
 * Work" reviewed-website window — that swaps the generic spell-check / broken
 * link findings for memory-grounded ones. Instead of catching universal
 * mistakes, each agent flags the new asset against what Memory holds for this
 * client (e.g. a remembered rejection of sentence case, a remembered
 * sans-serif preference), which is the point of the Memory page's "Agent
 * grounding" feature.
 *
 * The reviewed-site browser chrome is inherited unchanged from the base
 * artifact; only the dropped-comment copy differs.
 */

/** Agent identities for the memory-grounded review (author + cursor pill). */
const BRAND_AGENT = "Brand Agent";
const COPY_AGENT = "Copy Agent";

/**
 * Memory-grounded findings. Each reads as the agent checking the new asset
 * against a remembered client rule, not a generic check:
 * - the client's remembered sans-serif preference, and
 * - the client's remembered rejection of sentence case (they capitalize).
 */
const HEADING_FONT_FINDING = "Client prefers sans-serif headings";
const SENTENCE_CASE_FINDING = "Sentence case is always rejected";

/**
 * Memory findings in slot order (headline word, then nav link). Two cards keep
 * the scene tight; the hero-media slot is intentionally left empty so no third
 * finding is drawn.
 */
const MEMORY_COMMENTS: ReadonlyArray<AgentReviewComment> = [
  { agentName: BRAND_AGENT, text: HEADING_FONT_FINDING },
  { agentName: COPY_AGENT, text: SENTENCE_CASE_FINDING },
];

/**
 * Render the memory variant of the Review Agents artifact.
 *
 * @returns The reviewed-website window with memory-grounded agent findings.
 */
export default function ReviewAgentsMemoryArtifact(): ReactNode {
  try {
    return <ReviewAgentsArtifact comments={MEMORY_COMMENTS} />;
  } catch {
    return null;
  }
}
