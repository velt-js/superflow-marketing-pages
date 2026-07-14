import type { ReactNode } from "react";
import KanbanArtifact from "../feature-artifacts/KanbanArtifact";

/**
 * Hero-window fit wrappers for the Kanban Board feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link KanbanArtifact} the feature
 * section renders (single source of truth), passing its `hero` prop so the
 * board centres in the fully-visible hero product window. The five hero tabs
 * map to the page's beats: the cross-client board, the self-moving board, the
 * custom-status columns and the filter-to-one-client board (the fifth tab,
 * "Yours, not ours", reuses the existing Integrations hero artifact).
 *
 * These are registered under a page-scoped key (`kanban-board`) rather than the
 * global `HERO_ARTIFACTS` map because the tab labels ("Custom statuses",
 * "Filters", "The board", …) slugify to generic ids that could collide with
 * other pages; the scope keeps them contained to this page.
 */

/**
 * Hero "The board" tab — every client's queue on one cross-client board.
 *
 * @returns The cross-client board hero scene, or `null` on failure.
 */
export function HeroKanbanBoardArtifact(): ReactNode {
  try {
    return <KanbanArtifact hero variant="cross-client" />;
  } catch {
    return null;
  }
}

/**
 * Hero "It moves itself" tab — a client approval lands and the card moves
 * itself from In revision to Ready to ship.
 *
 * @returns The self-moving board hero scene, or `null` on failure.
 */
export function HeroKanbanSelfMovingArtifact(): ReactNode {
  try {
    return <KanbanArtifact hero variant="self-moving" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Custom statuses" tab — the board's columns are the team's own statuses,
 * with a fresh status column sliding in.
 *
 * @returns The custom-columns board hero scene, or `null` on failure.
 */
export function HeroKanbanCustomStatusesArtifact(): ReactNode {
  try {
    return <KanbanArtifact hero variant="custom-columns" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Filters" tab — a cursor taps a client chip and the board collapses to
 * that one client.
 *
 * @returns The filters board hero scene, or `null` on failure.
 */
export function HeroKanbanFiltersArtifact(): ReactNode {
  try {
    return <KanbanArtifact hero variant="filters" />;
  } catch {
    return null;
  }
}
