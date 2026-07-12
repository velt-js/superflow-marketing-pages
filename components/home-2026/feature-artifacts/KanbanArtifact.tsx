import type { CSSProperties, ReactNode } from "react";
import styles from "./KanbanArtifact.module.css";
import CommentThreadCard from "./CommentThreadCard";
import FakeCursor from "./FakeCursor";

/**
 * Feature/hero artifact — "Kanban".
 *
 * One variant-driven board component. The original built-in board is the
 * `default` variant (unchanged: an "Open" column and an "In Progress" column
 * reusing the shared {@link CommentThreadCard}, with the bottom card dragged
 * across on mount) so every existing use of the `kanban` mock renders exactly
 * as before.
 *
 * The kanban-board feature page adds four board scenes that share one column +
 * card shell:
 *
 *  - `cross-client`   — every client's queue on one board (client-tagged cards
 *                       across Awaiting review / In revision / Ready to ship).
 *  - `self-moving`    — a client approval lands and the matching card moves
 *                       itself from In revision to Ready to ship; the counts
 *                       tick over.
 *  - `filters`        — a cursor taps a client chip in the filter bar and the
 *                       board collapses to that one client.
 *  - `custom-columns` — the board's columns ARE your custom statuses; a new
 *                       status column slides in.
 *
 * All motion is CSS-only, replays whenever the tab remounts, and is gated
 * behind `prefers-reduced-motion` (which holds the settled composition).
 */

/** Which board scene {@link KanbanArtifact} renders. */
export type KanbanVariant =
  | "default"
  | "cross-client"
  | "self-moving"
  | "filters"
  | "custom-columns";

const OPEN_LABEL = "Open";
const IN_PROGRESS_LABEL = "In Progress";
const MENTION = "@Mark";
const GUEST_TEXT = "Client here! Can we change this";
const EMMA_TEXT = "Let\u2019s update the image";
const PRIYA_TEXT = "Logo feels too small";
const DEVON_TEXT = "Can we bump the padding";
const ROMULUS_TEXT = "Can we tone this down";
const AVA_TEXT = "Fixing the hero copy";

// Count badges tick over as the dragged card lands in its new column.
const OPEN_COUNT_FROM = "4";
const OPEN_COUNT_TO = "3";
const PROGRESS_COUNT_FROM = "2";
const PROGRESS_COUNT_TO = "3";

/**
 * Hollow circle marking the "Open" column (Figma tabler-icon-circle).
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The circle `<svg>` element.
 */
function CircleIcon({ size }: { size: number }): ReactNode {
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
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Dashed progress circle marking the "In Progress" column (Figma tabler-icon-progress).
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The progress `<svg>` element.
 */
function ProgressIcon({ size }: { size: number }): ReactNode {
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
        <path d="M9.99953 20.7771C9.12914 20.5797 8.29321 20.2531 7.51953 19.8081M14 3.2229C15.9882 3.67697 17.7632 4.79259 19.0347 6.38711C20.3061 7.98162 20.9984 9.96055 20.9984 11.9999C20.9984 14.0392 20.3061 16.0182 19.0347 17.6127C17.7632 19.2072 15.9882 20.3228 14 20.7769M4.57856 17.093C4.03307 16.3004 3.61876 15.4252 3.35156 14.501M3.125 10.5C3.285 9.55002 3.593 8.65002 4.025 7.82502L4.194 7.52002M6.90625 4.5789C7.8419 3.9348 8.89157 3.47462 9.99925 3.2229" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Arrow pointer cursor (the resting mouse pointer that approaches the card).
 * The Figma drop-shadow filter is dropped here and reapplied in CSS so the
 * three cursor glyphs can coexist without duplicate filter-id collisions.
 *
 * @returns The pointer `<svg>` element.
 */
function CursorArrow(): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 5.41406V17.4141L11 14.4141L13.5 19.4141C13.5 19.4141 14.1763 19.6299 14.5 19.4141C14.8237 19.1983 15.1457 18.7636 15 18.4141C14.3123 16.7636 12.5 13.4141 12.5 13.4141H16L8 5.41406Z"
          fill="#202125"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Open "grab" hand cursor (hovering a draggable card, and again on release).
 *
 * @returns The open-hand `<svg>` element.
 */
function CursorGrab(): ReactNode {
  try {
    const handPath =
      "M8.38196 12.2699C8.28196 11.8999 8.18196 11.4199 7.97196 10.7199C7.76196 10.0199 7.63196 9.85994 7.50196 9.48994C7.37196 9.11994 7.20196 8.76994 7.00196 8.30994C6.81877 7.83999 6.66513 7.35906 6.54196 6.86994C6.45873 6.45774 6.56114 6.0298 6.82196 5.69994C7.18082 5.34976 7.69864 5.21649 8.18196 5.34994C8.56062 5.51553 8.88103 5.79067 9.10196 6.13994C9.397 6.61161 9.63849 7.11472 9.82196 7.63994C10.1037 8.35957 10.3082 9.1071 10.432 9.86994L10.522 10.3199C10.522 10.3199 10.522 9.19994 10.522 9.15994C10.522 8.15994 10.462 7.33994 10.522 6.21994C10.522 6.08994 10.582 5.62994 10.602 5.49994C10.6278 5.0699 10.8841 4.68742 11.272 4.49994C11.7172 4.30015 12.2267 4.30015 12.672 4.49994C13.0706 4.67837 13.3366 5.06395 13.362 5.49994C13.362 5.60994 13.452 6.49994 13.452 6.60994C13.452 7.60994 13.452 8.24994 13.452 8.77994C13.452 9.00994 13.452 10.4099 13.452 10.2499C13.4755 8.9304 13.5891 7.614 13.792 6.30994C13.9105 5.90138 14.1979 5.56295 14.582 5.37994C15.0569 5.19288 15.5964 5.28537 15.982 5.61994C16.2701 5.93623 16.4398 6.34263 16.462 6.76994C16.462 7.17994 16.462 7.66994 16.462 8.01994C16.462 8.88994 16.462 9.33994 16.462 10.1399C16.462 10.1399 16.462 10.4399 16.462 10.3199C16.552 10.0399 16.652 9.77994 16.732 9.57994C16.812 9.37994 16.972 8.96994 17.092 8.71994C17.2141 8.4816 17.351 8.25115 17.502 8.02994C17.6588 7.77567 17.8939 7.57916 18.172 7.46994C18.4224 7.37312 18.7013 7.38109 18.9458 7.49206C19.1903 7.60304 19.3799 7.80768 19.472 8.05994C19.5315 8.42419 19.5315 8.79569 19.472 9.15994C19.4053 9.71937 19.2882 10.2716 19.122 10.8099C18.992 11.2599 18.852 12.0399 18.782 12.4099C18.712 12.7799 18.552 13.7899 18.422 14.2299C18.2295 14.7548 17.9635 15.2498 17.632 15.6999C17.1468 16.2402 16.7456 16.8503 16.442 17.5099C16.3672 17.8378 16.3336 18.1737 16.342 18.5099C16.3404 18.8206 16.3807 19.1301 16.462 19.4299C16.0531 19.4735 15.6408 19.4735 15.232 19.4299C14.842 19.3699 14.362 18.5899 14.232 18.3499C14.1676 18.2211 14.036 18.1396 13.892 18.1396C13.7479 18.1396 13.6163 18.2211 13.552 18.3499C13.322 18.7299 12.842 19.4199 12.502 19.4599C11.832 19.5399 10.452 19.4599 9.36196 19.4599C9.36196 19.4599 9.55196 18.4599 9.13196 18.0999C8.71196 17.7399 8.30196 17.3199 7.99196 17.0399L7.16196 16.1199C6.88196 15.7599 6.53196 15.0299 5.92196 14.1199C5.57196 13.6199 4.92196 13.0299 4.64196 12.5399C4.40689 12.1423 4.33859 11.6678 4.45196 11.2199C4.62177 10.6253 5.21263 10.2544 5.82196 10.3599C6.28546 10.3905 6.72388 10.5814 7.06196 10.8999C7.32967 11.1316 7.58033 11.3822 7.81196 11.6499C7.97196 11.8399 8.01196 11.9299 8.19196 12.1599C8.37196 12.3899 8.49196 12.6199 8.40196 12.2799";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={handPath} fill="white" />
        <path
          d={handPath}
          stroke="#202125"
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.7539 16.4309V12.9791C15.7539 12.7725 15.586 12.605 15.3789 12.605C15.1718 12.605 15.0039 12.7725 15.0039 12.9791V16.4309C15.0039 16.6375 15.1718 16.805 15.3789 16.805C15.586 16.805 15.7539 16.6375 15.7539 16.4309Z"
          fill="#202125"
        />
        <path
          d="M13.7639 16.4307L13.7539 12.9771C13.7533 12.771 13.5849 12.6044 13.3778 12.605C13.1707 12.6056 13.0033 12.7732 13.0039 12.9793L13.0139 16.4328C13.0145 16.639 13.1829 16.8056 13.39 16.805C13.5971 16.8044 13.7645 16.6368 13.7639 16.4307Z"
          fill="#202125"
        />
        <path
          d="M11.0078 12.98L11.0278 16.4246C11.029 16.6332 11.1979 16.8013 11.405 16.8001C11.6121 16.7989 11.779 16.6288 11.7778 16.4202L11.7578 12.9756C11.7566 12.767 11.5877 12.5989 11.3806 12.6001C11.1735 12.6013 11.0066 12.7714 11.0078 12.98Z"
          fill="#202125"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Closed "grabbed" hand cursor (shown while the card is picked up and dragged).
 *
 * @returns The closed-hand `<svg>` element.
 */
function CursorGrabbed(): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M7.99978 7.14995C8.47978 6.96995 9.42978 7.07995 9.67978 7.61995C9.92978 8.15995 10.0798 8.85995 10.0898 8.68995C10.0706 8.17325 10.1143 7.65613 10.2198 7.14995C10.3309 6.82577 10.5856 6.5711 10.9098 6.45995C11.2071 6.36592 11.5228 6.34533 11.8298 6.39995C12.1402 6.46385 12.4151 6.64238 12.5998 6.89995C12.8337 7.48308 12.9657 8.1021 12.9898 8.72995C13.0147 8.19421 13.1053 7.66355 13.2598 7.14995C13.4269 6.9145 13.6709 6.74474 13.9498 6.66995C14.2804 6.60951 14.6192 6.60951 14.9498 6.66995C15.2212 6.76001 15.4585 6.93101 15.6298 7.15995C15.8422 7.6901 15.9704 8.2502 16.0098 8.81995C16.0098 8.95995 16.0798 8.42995 16.2998 8.07995C16.4765 7.55528 17.0451 7.27322 17.5698 7.44995C18.0945 7.62668 18.3765 8.19528 18.1998 8.71995C18.1998 9.36995 18.1998 9.33995 18.1998 9.77995C18.1998 10.22 18.1998 10.61 18.1998 10.98C18.1638 11.5652 18.0835 12.1468 17.9598 12.72C17.7862 13.2273 17.544 13.7084 17.2398 14.15C16.7544 14.69 16.3532 15.3002 16.0498 15.96C15.9758 16.288 15.9422 16.6238 15.9498 16.96C15.9488 17.2706 15.9891 17.58 16.0698 17.88C15.6609 17.9236 15.2486 17.9236 14.8398 17.88C14.4498 17.82 13.9698 17.04 13.8398 16.8C13.7755 16.6711 13.6438 16.5897 13.4998 16.5897C13.3558 16.5897 13.2241 16.6711 13.1598 16.8C12.9398 17.18 12.4498 17.87 12.1598 17.91C11.4898 17.99 10.0998 17.91 9.01978 17.91C9.01978 17.91 9.20978 16.91 8.78978 16.55C8.36978 16.19 7.95978 15.77 7.64978 15.49L6.81978 14.57C6.23447 14.0266 5.80616 13.3358 5.57978 12.57C5.36978 11.63 5.38978 11.18 5.57978 10.8C5.77357 10.4862 6.07617 10.2548 6.42978 10.15C6.72355 10.0967 7.02596 10.1173 7.30978 10.21C7.50605 10.2921 7.67567 10.4271 7.79978 10.6C8.02978 10.91 8.10978 11.06 8.00978 10.72C7.90978 10.38 7.68978 10.13 7.57978 9.71995C7.36563 9.23575 7.23706 8.71808 7.19978 8.18995C7.24076 7.71612 7.5716 7.31751 8.02978 7.18995"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.99978 7.14995C8.47978 6.96995 9.42978 7.07995 9.67978 7.61995C9.92978 8.15995 10.0798 8.85995 10.0898 8.68995C10.0706 8.17325 10.1143 7.65613 10.2198 7.14995C10.3309 6.82577 10.5856 6.5711 10.9098 6.45995C11.2071 6.36592 11.5228 6.34533 11.8298 6.39995C12.1402 6.46385 12.4151 6.64238 12.5998 6.89995C12.8337 7.48308 12.9657 8.1021 12.9898 8.72995C13.0147 8.19421 13.1053 7.66355 13.2598 7.14995C13.4269 6.9145 13.6709 6.74474 13.9498 6.66995C14.2804 6.60951 14.6192 6.60951 14.9498 6.66995C15.2212 6.76001 15.4585 6.93101 15.6298 7.15995C15.8422 7.6901 15.9704 8.2502 16.0098 8.81995C16.0098 8.95995 16.0798 8.42995 16.2998 8.07995C16.4765 7.55528 17.0451 7.27322 17.5698 7.44995C18.0945 7.62668 18.3765 8.19528 18.1998 8.71995C18.1998 9.36995 18.1998 9.33995 18.1998 9.77995C18.1998 10.22 18.1998 10.61 18.1998 10.98C18.1638 11.5652 18.0835 12.1468 17.9598 12.72C17.7862 13.2273 17.544 13.7084 17.2398 14.15C16.7544 14.69 16.3532 15.3002 16.0498 15.96C15.9758 16.288 15.9422 16.6238 15.9498 16.96C15.9488 17.2706 15.9891 17.58 16.0698 17.88C15.6609 17.9236 15.2486 17.9236 14.8398 17.88C14.4498 17.82 13.9698 17.04 13.8398 16.8C13.7755 16.6711 13.6438 16.5897 13.4998 16.5897C13.3558 16.5897 13.2241 16.6711 13.1598 16.8C12.9398 17.18 12.4498 17.87 12.1598 17.91C11.4898 17.99 10.0998 17.91 9.01978 17.91C9.01978 17.91 9.20978 16.91 8.78978 16.55C8.36978 16.19 7.95978 15.77 7.64978 15.49L6.81978 14.57C6.23447 14.0266 5.80616 13.3358 5.57978 12.57C5.36978 11.63 5.38978 11.18 5.57978 10.8C5.77357 10.4862 6.07617 10.2548 6.42978 10.15C6.72355 10.0967 7.02596 10.1173 7.30978 10.21C7.50605 10.2921 7.67567 10.4271 7.79978 10.6C8.02978 10.91 8.10978 11.06 8.00978 10.72C7.90978 10.38 7.68978 10.13 7.57978 9.71995C7.36563 9.23575 7.23706 8.71808 7.19978 8.18995C7.22023 7.70919 7.54035 7.29303 7.99978 7.14995Z"
          stroke="#202125"
          strokeWidth={0.75}
          strokeLinejoin="round"
        />
        <path
          d="M15.75 14.8259V11.3741C15.75 11.1675 15.5821 11 15.375 11C15.1679 11 15 11.1675 15 11.3741V14.8259C15 15.0325 15.1679 15.2 15.375 15.2C15.5821 15.2 15.75 15.0325 15.75 14.8259Z"
          fill="#202125"
        />
        <path
          d="M13.77 14.8246L13.75 11.3711C13.7488 11.165 13.5799 10.9988 13.3728 11C13.1657 11.0012 12.9988 11.1693 13 11.3754L13.02 14.8289C13.0212 15.0351 13.1901 15.2012 13.3972 15.2C13.6043 15.1988 13.7712 15.0307 13.77 14.8246Z"
          fill="#202125"
        />
        <path
          d="M11 11.3799L11.02 14.8245C11.0212 15.0331 11.1901 15.2012 11.3972 15.2C11.6043 15.1988 11.7712 15.0287 11.77 14.8201L11.75 11.3755C11.7488 11.1669 11.5799 10.9988 11.3728 11C11.1657 11.0012 10.9988 11.1713 11 11.3799Z"
          fill="#202125"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The original built-in board — the `default` variant. Kept byte-for-byte so
 * every existing `kanban` mock (homepage, comments, all-devices, …) renders
 * unchanged.
 *
 * @returns The legacy kanban board contents, filling its container.
 */
function LegacyKanbanScene(): ReactNode {
  try {
    return (
      <div className={styles.root} data-artifact="kanban">
        {/* Open column */}
        <div className={`${styles.columnHeader} ${styles.columnOpen}`}>
          <span className={styles.iconOpen}>
            <CircleIcon size={22} />
          </span>
          <h3 className={styles.columnTitle}>{OPEN_LABEL}</h3>
          <span className={styles.count}>
            <span className={styles.countFrom}>{OPEN_COUNT_FROM}</span>
            <span className={styles.countTo}>{OPEN_COUNT_TO}</span>
          </span>
        </div>

        <div className={`${styles.card} ${styles.openA}`}>
          <CommentThreadCard
            flat
            avatarInitial="G"
            avatarTone="orange"
            author="Guest"
            timeAgo="1h"
            bodyText={GUEST_TEXT}
          />
        </div>

        <div className={`${styles.card} ${styles.openB}`}>
          <CommentThreadCard
            flat
            avatarInitial="E"
            avatarTone="gray"
            author="Emma"
            timeAgo="2w"
            edited
            bodyText={EMMA_TEXT}
            mention={MENTION}
          />
        </div>

        <div className={`${styles.card} ${styles.openC}`}>
          <CommentThreadCard
            flat
            avatarInitial="P"
            avatarTone="green"
            author="Priya"
            timeAgo="3h"
            bodyText={PRIYA_TEXT}
          />
        </div>

        {/* In Progress column (bleeds off the right edge) */}
        <div className={`${styles.columnHeader} ${styles.columnProgress}`}>
          <span className={styles.iconProgress}>
            <ProgressIcon size={22} />
          </span>
          <h3 className={styles.columnTitle}>{IN_PROGRESS_LABEL}</h3>
          <span className={styles.count}>
            <span className={styles.countFrom}>{PROGRESS_COUNT_FROM}</span>
            <span className={styles.countTo}>{PROGRESS_COUNT_TO}</span>
          </span>
        </div>

        <div className={`${styles.card} ${styles.progressA}`}>
          <CommentThreadCard
            flat
            avatarInitial="R"
            avatarTone="green"
            author="Romulus"
            timeAgo="2w"
            edited
            bodyText={ROMULUS_TEXT}
            mention={MENTION}
          />
        </div>

        <div className={`${styles.card} ${styles.progressB}`}>
          <CommentThreadCard
            flat
            avatarInitial="A"
            avatarTone="gray"
            author="Ava"
            timeAgo="4h"
            bodyText={AVA_TEXT}
          />
        </div>

        {/* Dragged from the bottom of Open into In Progress on mount. The fake
            cursor lives inside the mover so it travels with the card. */}
        <div className={`${styles.card} ${styles.mover}`}>
          <CommentThreadCard
            flat
            avatarInitial="D"
            avatarTone="orange"
            author="Devon"
            timeAgo="1d"
            bodyText={DEVON_TEXT}
          />
          <span className={styles.cursor} aria-hidden="true">
            <span className={styles.cursorArrow}>
              <CursorArrow />
            </span>
            <span className={styles.cursorGrab}>
              <CursorGrab />
            </span>
            <span className={styles.cursorGrabbed}>
              <CursorGrabbed />
            </span>
          </span>
        </div>

        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/* ============================================================= board shell
   Shared column + card pieces used by the cross-client / self-moving / filters
   / custom-columns scenes. Everything is data-driven so the four scenes are
   thin configurations over one board. */

/** A short client label + its brand tone, shown as a chip on each card. */
interface ClientTag {
  name: string;
  tone: string;
}

/** One board card. */
interface BoardCardData {
  id: string;
  /** The client this work belongs to (drives the "one board, every client" read). */
  client?: ClientTag;
  title: string;
  /** Author/assignee initials shown as a small overlapping avatar stack. */
  avatars?: readonly string[];
  /** Optional muted footer meta (e.g. a comment count or a shipped check). */
  meta?: { icon: ReactNode; text: string };
  /** Marks the card that animates (self-moving arriving/leaving, filter match). */
  motion?: "arriving" | "leaving";
  /** Client key used by the filter scene to collapse non-matching cards. */
  filterKey?: string;
}

/** One board column. */
interface BoardColumnData {
  id: string;
  title: string;
  /** Column status dot colour. */
  tone: string;
  /** Count pill; a two-value tuple ticks `from → to` as a card lands. */
  count: number | readonly [number, number];
  cards: readonly BoardCardData[];
  /** Marks the freshly-added status column (custom-columns scene). */
  isNew?: boolean;
}

/** Small speech-bubble glyph for a card's comment-count meta. */
function MiniCommentIcon(): ReactNode {
  try {
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 9h8M8 13h5M4 4h16v12H8l-4 4z"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Small check glyph for a shipped/approved card's meta. */
function MiniCheckIcon(): ReactNode {
  try {
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12l4 4l10 -10"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Plus glyph for the "Add status" affordance on the custom-columns board. */
function PlusIcon(): ReactNode {
  try {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/** CSS custom property carrying a per-item entrance-stagger delay. */
const STAGGER_VAR = "--kb-delay";

/**
 * Builds the inline style that staggers one card's/column's rise-in.
 *
 * @param delayMs - Milliseconds to wait before this item's entrance.
 * @returns The inline style setting the stagger custom property.
 */
function staggerStyle(delayMs: number): CSSProperties {
  try {
    return { [STAGGER_VAR]: `${delayMs}ms` } as CSSProperties;
  } catch {
    return {};
  }
}

/**
 * A single board card: an optional client chip, the work title, and a footer
 * with an avatar stack + optional meta. Purely presentational.
 *
 * @param root0 - The card props.
 * @param root0.card - The card data to render.
 * @param root0.delayMs - Entrance-stagger delay for this card.
 * @returns The card element, or `null` on failure.
 */
function BoardCard({
  card,
  delayMs,
}: {
  card: BoardCardData;
  delayMs: number;
}): ReactNode {
  try {
    return (
      <div
        className={styles.bcard}
        style={staggerStyle(delayMs)}
        data-motion={card.motion}
        data-filter={card.filterKey}
      >
        {card.client ? (
          <span
            className={styles.clientChip}
            style={{ "--kb-client": card.client.tone } as CSSProperties}
          >
            <span className={styles.clientDot} aria-hidden="true" />
            {card.client.name}
          </span>
        ) : null}
        <p className={styles.bcardTitle}>{card.title}</p>
        <div className={styles.bcardFoot}>
          <span className={styles.avatars} aria-hidden="true">
            {(card.avatars ?? []).map((initials, avatarIndex) => (
              <span
                key={`${card.id}-${initials}-${avatarIndex}`}
                className={styles.avatar}
              >
                {initials}
              </span>
            ))}
          </span>
          {card.meta ? (
            <span className={styles.metaPill}>
              {card.meta.icon}
              {card.meta.text}
            </span>
          ) : null}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * A single board column: a header (status dot + title + count pill) over its
 * stack of cards. The count pill can tick `from → to` as a card lands.
 *
 * @param root0 - The column props.
 * @param root0.column - The column data to render.
 * @param root0.columnIndex - Its position (seeds the entrance stagger).
 * @returns The column element, or `null` on failure.
 */
function BoardColumn({
  column,
  columnIndex,
}: {
  column: BoardColumnData;
  columnIndex: number;
}): ReactNode {
  try {
    const countIsTick = Array.isArray(column.count);
    const [countFrom, countTo] = countIsTick
      ? (column.count as readonly [number, number])
      : [column.count as number, column.count as number];
    return (
      <div
        className={styles.column}
        data-new={column.isNew || undefined}
        style={staggerStyle(120 + columnIndex * 90)}
      >
        <div className={styles.colHead}>
          <span
            className={styles.colDot}
            style={{ background: column.tone }}
            aria-hidden="true"
          />
          <span className={styles.colTitle}>{column.title}</span>
          <span className={styles.colCount}>
            {countIsTick ? (
              <>
                <span className={styles.tickFrom}>{countFrom}</span>
                <span className={styles.tickTo}>{countTo}</span>
              </>
            ) : (
              countFrom
            )}
          </span>
        </div>
        <div className={styles.cards}>
          {column.cards.map((card, cardIndex) => (
            <BoardCard
              key={card.id}
              card={card}
              delayMs={220 + columnIndex * 90 + cardIndex * 70}
            />
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- scene data */

const CLIENT_ACME: ClientTag = { name: "Acme", tone: "#625df5" };
const CLIENT_NORTH: ClientTag = { name: "Northwind", tone: "#12b5a6" };
const CLIENT_VOLT: ClientTag = { name: "Volt", tone: "#e0820a" };
const CLIENT_BLOOM: ClientTag = { name: "Bloom", tone: "#e5389f" };

const TONE_AWAITING = "#625df5";
const TONE_REVISION = "#e2a600";
const TONE_READY = "#109534";

const AVATAR_META = { icon: <MiniCommentIcon />, text: "3" };

/** The cross-client board (also the base other scenes tweak). */
const CROSS_CLIENT_COLUMNS: readonly BoardColumnData[] = [
  {
    id: "awaiting",
    title: "Awaiting review",
    tone: TONE_AWAITING,
    count: 3,
    cards: [
      {
        id: "c1",
        client: CLIENT_ACME,
        title: "Hero headline still says “Launch”",
        avatars: ["DW"],
        meta: { icon: <MiniCommentIcon />, text: "3" },
      },
      {
        id: "c2",
        client: CLIENT_NORTH,
        title: "Pricing table overflows on mobile",
        avatars: ["JS", "MK"],
        meta: { icon: <MiniCommentIcon />, text: "2" },
      },
      {
        id: "c3",
        client: CLIENT_VOLT,
        title: "Logo feels too small in the navbar",
        avatars: ["PR"],
      },
    ],
  },
  {
    id: "revision",
    title: "In revision",
    tone: TONE_REVISION,
    count: 2,
    cards: [
      {
        id: "c4",
        client: CLIENT_BLOOM,
        title: "Tone down the background gradient",
        avatars: ["AV"],
        meta: { icon: <MiniCommentIcon />, text: "1" },
      },
      {
        id: "c5",
        client: CLIENT_ACME,
        title: "Bump the section padding to 96px",
        avatars: ["DW", "EM"],
      },
    ],
  },
  {
    id: "ready",
    title: "Ready to ship",
    tone: TONE_READY,
    count: 2,
    cards: [
      {
        id: "c6",
        client: CLIENT_NORTH,
        title: "Fixed the broken footer links",
        avatars: ["MK"],
        meta: { icon: <MiniCheckIcon />, text: "Done" },
      },
      {
        id: "c7",
        client: CLIENT_VOLT,
        title: "Updated the CTA copy to “Get started”",
        avatars: ["PR"],
      },
    ],
  },
];

/** The self-moving board: two focused columns so the arrival stays on-screen
    even in the left-anchored feature panel. The Bloom card leaves In revision
    and arrives in Ready to ship as a client approval lands; both counts tick. */
const SELF_MOVING_COLUMNS: readonly BoardColumnData[] = [
  {
    id: "revision",
    title: "In revision",
    tone: TONE_REVISION,
    count: [3, 2],
    cards: [
      {
        id: "m1",
        client: CLIENT_BLOOM,
        title: "Tone down the background gradient",
        avatars: ["AV"],
        meta: { icon: <MiniCommentIcon />, text: "1" },
        motion: "leaving",
      },
      { id: "m2", client: CLIENT_ACME, title: "Bump the section padding to 96px", avatars: ["DW", "EM"] },
      { id: "m3", client: CLIENT_VOLT, title: "Logo feels too small in the navbar", avatars: ["PR"] },
    ],
  },
  {
    id: "ready",
    title: "Ready to ship",
    tone: TONE_READY,
    count: [2, 3],
    cards: [
      {
        id: "m4",
        client: CLIENT_BLOOM,
        title: "Tone down the background gradient",
        avatars: ["AV"],
        meta: { icon: <MiniCheckIcon />, text: "Approved" },
        motion: "arriving",
      },
      {
        id: "m5",
        client: CLIENT_NORTH,
        title: "Fixed the broken footer links",
        avatars: ["MK"],
        meta: { icon: <MiniCheckIcon />, text: "Done" },
      },
      { id: "m6", client: CLIENT_VOLT, title: "Updated the CTA copy to “Get started”", avatars: ["PR"] },
    ],
  },
];

/** The filter scene: every card carries the client key its chip filters on. */
const FILTER_TARGET = "acme";
const FILTER_CHIPS: readonly { key: string; label: string }[] = [
  { key: "all", label: "All clients" },
  { key: "acme", label: "Acme" },
  { key: "northwind", label: "Northwind" },
  { key: "volt", label: "Volt" },
  { key: "bloom", label: "Bloom" },
];

/**
 * Tags each card in the cross-client board with a filter key so the filter
 * scene can collapse non-matching cards. The counts tick down to the matching
 * client's tally.
 */
const FILTER_COLUMNS: readonly BoardColumnData[] = CROSS_CLIENT_COLUMNS.map(
  (column) => ({
    ...column,
    count: [
      column.count as number,
      column.cards.filter((card) => card.client?.name === "Acme").length,
    ] as const,
    cards: column.cards.map((card) => ({
      ...card,
      filterKey: card.client?.name.toLowerCase(),
    })),
  }),
);

/** The custom-statuses board: the columns ARE the team's own statuses. */
const CUSTOM_COLUMNS: readonly BoardColumnData[] = [
  {
    id: "backlog",
    title: "Backlog",
    tone: "#8a90a2",
    count: 4,
    cards: [
      { id: "x1", client: CLIENT_ACME, title: "New pricing page", avatars: ["DW"] },
      { id: "x2", client: CLIENT_VOLT, title: "Refresh the blog index", avatars: ["PR"] },
    ],
  },
  {
    id: "designing",
    title: "Designing",
    tone: "#8b5cf6",
    count: 2,
    cards: [
      { id: "x3", client: CLIENT_NORTH, title: "Dashboard empty state", avatars: ["MK", "JS"] },
    ],
  },
  {
    id: "client-review",
    title: "Client review",
    tone: "#2d9aff",
    count: 3,
    cards: [
      {
        id: "x4",
        client: CLIENT_BLOOM,
        title: "Campaign landing page",
        avatars: ["AV"],
        meta: AVATAR_META,
      },
    ],
  },
  {
    id: "approved",
    title: "Approved",
    tone: "#109534",
    count: 2,
    cards: [
      {
        id: "x5",
        client: CLIENT_ACME,
        title: "About page rewrite",
        avatars: ["EM"],
        meta: { icon: <MiniCheckIcon />, text: "Done" },
      },
    ],
  },
  {
    id: "live",
    title: "Live",
    tone: "#12b5a6",
    count: 1,
    isNew: true,
    cards: [
      {
        id: "x6",
        client: CLIENT_NORTH,
        title: "Careers page shipped",
        avatars: ["MK"],
        meta: { icon: <MiniCheckIcon />, text: "Live" },
      },
    ],
  },
];

/** The approval toast that drives the self-moving card. */
const SELF_MOVING_TOAST = "Client approved · moved to Ready to ship";
const CUSTOM_ADD_LABEL = "Add status";

/**
 * The shared board scene. Renders the filter bar (filters scene), the columns,
 * and the self-moving approval toast (self-moving scene) inside one framed
 * board that left-anchors in the feature panel and centres in the hero window.
 *
 * @param root0 - The scene props.
 * @param root0.variant - Which board scene to render.
 * @returns The board scene element, or `null` on failure.
 */
function BoardScene({ variant }: { variant: KanbanVariant }): ReactNode {
  try {
    const columns =
      variant === "self-moving"
        ? SELF_MOVING_COLUMNS
        : variant === "filters"
          ? FILTER_COLUMNS
          : variant === "custom-columns"
            ? CUSTOM_COLUMNS
            : CROSS_CLIENT_COLUMNS;
    return (
      <>
        {variant === "filters" ? (
          <div className={styles.filterBar} style={staggerStyle(60)}>
            <span className={styles.filterLabel} aria-hidden="true">
              Client
            </span>
            {FILTER_CHIPS.map((chip) => (
              <span
                key={chip.key}
                className={styles.filterChip}
                data-target={chip.key === FILTER_TARGET || undefined}
                data-all={chip.key === "all" || undefined}
              >
                {chip.label}
                {chip.key === FILTER_TARGET ? (
                  <FakeCursor className={styles.filterCursor} size={24} />
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        <div className={styles.board}>
          {columns.map((column, columnIndex) => (
            <BoardColumn
              key={column.id}
              column={column}
              columnIndex={columnIndex}
            />
          ))}
          {variant === "custom-columns" ? (
            <span
              className={styles.addStatus}
              style={staggerStyle(120 + columns.length * 90)}
              aria-hidden="true"
            >
              <PlusIcon />
              {CUSTOM_ADD_LABEL}
            </span>
          ) : null}
        </div>

        {variant === "self-moving" ? (
          <div className={styles.moveToast} aria-hidden="true">
            <span className={styles.moveToastIcon}>
              <MiniCheckIcon />
            </span>
            {SELF_MOVING_TOAST}
          </div>
        ) : null}
      </>
    );
  } catch {
    return null;
  }
}

/** Props for {@link KanbanArtifact}. */
export interface KanbanArtifactProps {
  /** Which board scene to render. Defaults to the legacy `default` board. */
  variant?: KanbanVariant;
  /** Hero-window fit — centres the board in the fully-visible hero product window. */
  hero?: boolean;
}

/**
 * Render the Kanban artifact for the given variant. The `default` variant is
 * the original built-in board; every other variant renders the shared
 * cross-client board shell.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function KanbanArtifact({
  variant = "default",
  hero = false,
}: KanbanArtifactProps = {}): ReactNode {
  try {
    if (variant === "default") {
      return <LegacyKanbanScene />;
    }
    return (
      <div
        className={styles.boardRoot}
        data-hero={hero || undefined}
        data-variant={variant}
        data-artifact={`kanban-${variant}`}
      >
        <BoardScene variant={variant} />
        <div className={styles.boardFade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature-panel wrapper — the cross-client board (Block 1 "One board, every
 * client" / hero "The board").
 *
 * @returns The cross-client board artifact.
 */
export function KanbanCrossClientArtifact(): ReactNode {
  return <KanbanArtifact variant="cross-client" />;
}

/**
 * Feature-panel wrapper — the self-moving board (Block 2 "It moves itself" /
 * hero "It moves itself").
 *
 * @returns The self-moving board artifact.
 */
export function KanbanSelfMovingArtifact(): ReactNode {
  return <KanbanArtifact variant="self-moving" />;
}

/**
 * Feature-panel wrapper — the filter-to-one-client board (Block 1 "Filters by
 * client and project" / hero "Filters").
 *
 * @returns The filters board artifact.
 */
export function KanbanFiltersArtifact(): ReactNode {
  return <KanbanArtifact variant="filters" />;
}

/**
 * Feature-panel wrapper — the custom-statuses board (hero "Custom statuses").
 *
 * @returns The custom-columns board artifact.
 */
export function KanbanCustomColumnsArtifact(): ReactNode {
  return <KanbanArtifact variant="custom-columns" />;
}
