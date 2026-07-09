import type { ReactNode } from "react";
import styles from "./HeroArtifactFit.module.css";
import HeroAgentsAtWorkArtifact from "../hero-artifacts/AgentsAtWorkArtifact";
import HeroPrivateCommentArtifact from "../hero-artifacts/PrivateCommentArtifact";
import HeroGuestModeArtifact from "../hero-artifacts/GuestModeArtifact";
import HeroIntegrationsArtifact from "../hero-artifacts/IntegrationsArtifact";

/**
 * Feature Set fit wrappers that reuse the hero-section artifacts.
 *
 * Rather than maintaining duplicate feature-artifact components, the matching
 * Feature Set tabs import the equivalent hero artifact and render it inside a
 * wrapper that fills the feature panel (`.panelScreen`, 1200×602). The hero
 * artifacts are fluid (width:100%) so at the panel's native 1200px width they
 * render pixel-identically to the hero; the wrapper carries the panel height and,
 * for compositions whose key UI would otherwise sit under the panel window's
 * right-edge bleed, shifts them left so it stays readable in the visible frame.
 */

/** Wrapper class that fills the panel and clips the right/bottom bleed. */
const FIT_CLASS = styles.fit;

/**
 * Feature Set "AI Review Agents" tab — reuses the hero "Agents at Work"
 * artifact (the reviewed-website window with agent cursors dropping comments).
 * It is a full-width website mock, so it fills the panel directly and lets its
 * right edge bleed like a browser window (no shift needed).
 *
 * @returns The reused hero artifact sized to the feature panel.
 */
export function ReviewAgentsArtifact(): ReactNode {
  try {
    return (
      <div className={FIT_CLASS}>
        <HeroAgentsAtWorkArtifact />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature Set "Private" tab — reuses the hero "Private Comments" artifact (the
 * team-only composer, dashed selection, "Private Mode Enabled" pill and dark
 * toolbar). Its centred pill + toolbar are shifted left so they stay inside the
 * visible panel frame past the right-edge bleed.
 *
 * @returns The reused hero artifact sized + left-anchored to the feature panel.
 */
export function PrivateArtifact(): ReactNode {
  try {
    return (
      <div className={`${FIT_CLASS} ${styles.shiftPrivate}`}>
        <HeroPrivateCommentArtifact />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature Set "Guest Mode" tab — reuses the hero "Guest Mode" artifact (the
 * guest browser window with its floating composer, "You are a guest" pill and
 * toolbar). Its centred UI is shifted left to stay readable past the panel's
 * right-edge bleed.
 *
 * @returns The reused hero artifact sized + left-anchored to the feature panel.
 */
export function GuestModeArtifact(): ReactNode {
  try {
    return (
      <div className={`${FIT_CLASS} ${styles.shiftGuest}`}>
        <HeroGuestModeArtifact />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature Set "Integrations" tab — reuses the hero "Integrations" artifact (the
 * two-way-sync composer linked by a curved connector to a Kanban board whose
 * integration-logo row bleeds off the right edge). The composer is already
 * left-anchored and the board is designed to bleed right; a small left shift
 * pulls the integration-logo row into the visible panel while keeping the
 * two-way-sync comment fully in view.
 *
 * @returns The reused hero artifact sized + nudged into the feature panel.
 */
export function IntegrationsArtifact(): ReactNode {
  try {
    return (
      <div className={`${FIT_CLASS} ${styles.shiftInteg}`}>
        <HeroIntegrationsArtifact />
      </div>
    );
  } catch {
    return null;
  }
}
