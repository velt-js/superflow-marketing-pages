import type { ReactNode } from "react";
import ClientMemoryArtifact from "../feature-artifacts/ClientMemoryArtifact";
import AskAiArtifact from "../feature-artifacts/AskAiArtifact";
import PinnedCommentsArtifact from "../feature-artifacts/PinnedCommentsArtifact";
import { fitToHeroWindow } from "./CommentsHeroFit";

/**
 * Hero-window fit wrappers for the memory feature page tabs.
 *
 * Rather than authoring duplicate hero artifacts, memory hero tabs reuse the
 * same artifacts the homepage/feature sections render (single source of truth).
 * These wrappers render a feature artifact with its opt-in `hero` prop, which
 * re-centers and scales the scene to fill the wider hero product window; the
 * artifacts' feature-section usage is left untouched.
 */

/** Agent identity shown on the memory "Proactive suggestions" hero comment. */
const MEMORY_AGENT_NAME = "Superflow Memory";
/**
 * Bold headline of the proactive Memory flag — a concrete, remembered client
 * rule (Acme's "primary CTAs capitalized" preference) surfaced on the page.
 */
const MEMORY_COMMENT_TITLE = "Acme wants CTAs capitalized";
/**
 * Supporting line under the title: how Memory knows and what to do about it,
 * before the asset goes to the client for review.
 */
const MEMORY_COMMENT_DESCRIPTION =
  "Learned from past reviews \u2014 capitalize this button before Acme sees it.";
/** Relative timestamp shown on the proactive Memory flag (it just appeared). */
const MEMORY_COMMENT_TIME = "now";
/** Distinct `data-artifact` hook for the memory proactive-suggestion root. */
const MEMORY_PROACTIVE_ARTIFACT = "memory-proactive";

/**
 * Hero "Learned from reviews" tab — reuses the homepage "memory" feature
 * artifact ({@link ClientMemoryArtifact}: a dashed branch bleeding in from the
 * top that drops a remembered client fact into a white memory card), fitted to
 * the hero product window.
 *
 * @returns The fitted client-memory scene, or `null` on failure.
 */
export function HeroClientMemoryArtifact(): ReactNode {
  try {
    return <ClientMemoryArtifact hero />;
  } catch {
    return null;
  }
}

/**
 * Hero "Powers Ask AI" tab — reuses the homepage "ask-ai" feature artifact
 * ({@link AskAiArtifact}: a chat thread answering "common client issues" with a
 * colour-coded breakdown bar and legend), fitted to the hero product window.
 *
 * @returns The fitted Ask AI chat scene, or `null` on failure.
 */
export function HeroAskAiArtifact(): ReactNode {
  try {
    return <AskAiArtifact hero />;
  } catch {
    return null;
  }
}

/**
 * Hero "Proactive suggestions" tab — reuses the "Pinned Comments" artifact
 * ({@link PinnedCommentsArtifact}: a live website page with a comment pinned to
 * a dashed selected element), fitted to the hero window exactly like
 * `HeroPinAnElementArtifact`. Instead of the human comment, it pins a Superflow
 * Memory agent comment (the shared agent card + four-dot agent mark): a
 * concrete proactive flag grounded in a remembered client rule — Acme's
 * "primary CTAs capitalized" preference — caught before the asset goes for
 * review. Reuses the shared `fitToHeroWindow` frame (browser chrome + floating
 * toolbar), so nothing is duplicated.
 *
 * @returns The fitted proactive-suggestion scene, or `null` on failure.
 */
export function HeroMemoryProactiveArtifact(): ReactNode {
  try {
    return fitToHeroWindow(
      <PinnedCommentsArtifact
        hero
        dataArtifact={MEMORY_PROACTIVE_ARTIFACT}
        agentCard={{
          agentName: MEMORY_AGENT_NAME,
          timeAgo: MEMORY_COMMENT_TIME,
          title: MEMORY_COMMENT_TITLE,
          description: MEMORY_COMMENT_DESCRIPTION,
          avatarVariant: "agentDots",
        }}
      />,
    );
  } catch {
    return null;
  }
}
