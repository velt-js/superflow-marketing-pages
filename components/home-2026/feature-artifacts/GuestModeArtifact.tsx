import type { ReactNode } from "react";
import styles from "./GuestModeArtifact.module.css";
import HeroGuestModeArtifact from "../hero-artifacts/GuestModeArtifact";

/**
 * Feature-section app-window artifact — "Guest Mode".
 *
 * Reuses the hero tab's Guest Mode artifact verbatim (the guest browser-window
 * mock: chrome bar, dashed selection + skeleton page, floating guest comment
 * composer, "You are a guest / Login" pill and the Superflow toolbar), so the
 * feature block and the hero stay pixel-in-sync from a single source. It is
 * wrapped in a left-shifting frame ({@link styles.shift}) because the panel
 * window bleeds off the card's right edge — the shift left-anchors the centred
 * elements so they stay readable inside the visible panel.
 *
 * @returns The Guest Mode window contents, filling its container.
 */
export default function GuestModeArtifact(): ReactNode {
  try {
    return (
      <div className={styles.shift}>
        <HeroGuestModeArtifact />
      </div>
    );
  } catch {
    return null;
  }
}
