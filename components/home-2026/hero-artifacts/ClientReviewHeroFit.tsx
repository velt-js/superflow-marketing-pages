import type { ReactNode } from "react";
import styles from "./ClientReviewHeroFit.module.css";
import ClientReviewArtifact from "../feature-artifacts/ClientReviewArtifact";
import AllDevicesArtifact from "../feature-artifacts/AllDevicesArtifact";

/**
 * Hero-window fit wrappers for the Client Review feature page hero tabs.
 *
 * The client-facing beats reuse the same phone-framed {@link ClientReviewArtifact}
 * the feature section renders (single source of truth), with its `hero` prop so
 * the phone is sized for the hero product window. The "Phone view" tab reuses
 * the desktop-plus-phone {@link AllDevicesArtifact} to show the review landing
 * on both screens. The remaining tabs ("No-account flow", "Private threads")
 * map straight to the existing Guest Mode / Private Comment hero artifacts in
 * `HERO_ARTIFACTS`, so they need no wrapper here.
 */

/**
 * Hero "Magic link" tab — a phone message thread with the review link the
 * cursor taps (the page star), fitted to the hero product window.
 *
 * @returns The magic-link client-review hero scene, or `null` on failure.
 */
export function HeroClientReviewMagicLinkArtifact(): ReactNode {
  try {
    return <ClientReviewArtifact hero variant="magic-link" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Phone view" tab — the same review shown on a desktop browser and the
 * phone in front of it (reuses the All Devices artifact).
 *
 * @returns The all-devices hero scene, or `null` on failure.
 */
export function HeroClientReviewPhoneArtifact(): ReactNode {
  try {
    return (
      <div className={styles.phoneFit}>
        <div className={styles.phoneBox}>
          <AllDevicesArtifact />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
