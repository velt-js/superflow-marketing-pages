import type { ReactNode } from "react";
import styles from "./BehindLoginArtifact.module.css";
import PinnedCommentScene from "./PinnedCommentScene";

/**
 * Feature-section app-window artifact — "Behind Login".
 *
 * Plays a short story: a password gate types itself in ("Enter Password" +
 * masked value), then the gate lifts to reveal the now-accessible site with a
 * Superflow comment pinned to it — reusing the shared {@link PinnedCommentScene}
 * for the revealed page. Conveys "comment on dashboards, portals, and any page
 * that needs an account." The whole sequence is CSS-driven so it replays every
 * time the tab is activated (the panel remounts its content on tab switch).
 */

const HEADING = "Enter Password";
const PASSWORD_MASK = "************";

/**
 * Padlock glyph with three keyhole dots shown above the password field.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The lock `<svg>` element.
 */
function PasswordLockIcon({ size = 26 }: { size?: number }): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
        <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
        <circle cx="9" cy="16" r="0.65" fill="currentColor" stroke="none" />
        <circle cx="12" cy="16" r="0.65" fill="currentColor" stroke="none" />
        <circle cx="15" cy="16" r="0.65" fill="currentColor" stroke="none" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Render the "Behind Login" feature-section artifact.
 *
 * @returns The Behind Login window contents, filling its container.
 */
export default function BehindLoginArtifact(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="behind-login">
        <div className={styles.site}>
          <PinnedCommentScene dataArtifact="behind-login-site" />
        </div>

        <div className={styles.login}>
          <div className={styles.gate}>
            <div className={styles.lockRow}>
              <span className={styles.lockIcon}>
                <PasswordLockIcon size={20} />
              </span>
              <span className={styles.heading}>{HEADING}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldReveal}>
                <span className={styles.dots}>{PASSWORD_MASK}</span>
              </span>
              <span className={styles.caret} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
