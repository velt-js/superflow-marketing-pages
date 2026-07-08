import type { CSSProperties, ReactNode } from "react";
import styles from "./CustomStatusArtifact.module.css";

/**
 * Feature-section app-window artifact — "Custom Statuses".
 *
 * A static recreation of Superflow's "Add Status" dialog: a dimmed settings
 * page behind, with the modal floating over it. The modal carries a Status
 * Name field, the protected "Ongoing" type, a colour field with swatch, a
 * grid of selectable status icons, and a live preview pill with Cancel /
 * Add Status actions. Conveys "built-in review statuses, plus your own custom
 * ones." The modal and icon grid animate in on mount, replaying every time the
 * tab is activated (the panel remounts its content on tab switch).
 */

/* -------------------------------------------------------------- text strings */

const MODAL_TITLE = "Add Status";
const CLOSE_LABEL = "Close";
const NAME_LABEL = "Status Name";
const NAME_PLACEHOLDER = "Enter status name";
const CHAR_COUNTER = "0/20";
const TYPE_LABEL = "Type";
const TYPE_VALUE = "Ongoing";
const TYPE_HINT = "New statuses are created as Ongoing type";
const COLOR_LABEL = "Color";
const ICON_LABEL = "Choose Icon";
const PREVIEW_TITLE = "Status";
const CANCEL_LABEL = "Cancel";
const SUBMIT_LABEL = "Add Status";

/* -------------------------------------------------------------------- colors */

/** Accent shared by the swatch, the selected icon cell and the preview pill. */
const STATUS_COLOR = "#ecb000";
/** Value shown inside the colour text field (matches {@link STATUS_COLOR}). */
const COLOR_VALUE = "#ECB000";
/** Soft tint behind the preview pill and the selected icon cell. */
const STATUS_TINT = "rgba(236, 176, 0, 0.12)";
/** Border colour applied to the selected icon cell. */
const STATUS_BORDER = "rgba(236, 176, 0, 0.45)";

/* --------------------------------------------------- icon geometry (24 × 24) */

/** Tabler `circle` — the "Open" status glyph, selected by default. */
const OPEN_PATHS: readonly string[] = [
  "M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z",
];

/** One selectable status icon in the "Choose Icon" grid. */
interface StatusIcon {
  id: string;
  /** Accessible tooltip/label, mirrored from the source dialog. */
  label: string;
  /** 24×24 stroke path definitions for the glyph. */
  paths: readonly string[];
}

/**
 * The fifteen status icons offered by the dialog, in the exact source order.
 * Each glyph is inlined verbatim from the Superflow app markup so the artifact
 * matches the product one-to-one.
 */
const STATUS_ICONS: readonly StatusIcon[] = [
  { id: "open", label: "Open", paths: OPEN_PATHS },
  {
    id: "in-progress",
    label: "In Progress",
    paths: [...OPEN_PATHS, "M12 7V12L15 15"],
  },
  {
    id: "resolved",
    label: "Resolved",
    paths: [...OPEN_PATHS, "M9 12L11 14L15 10"],
  },
  { id: "approved", label: "Approved", paths: ["M5 12L10 17L20 7"] },
  {
    id: "alert",
    label: "Alert",
    paths: [...OPEN_PATHS, "M12 8V12", "M12 16H12.01"],
  },
  {
    id: "hold",
    label: "Hold",
    paths: [...OPEN_PATHS, "M10 9V15", "M14 9V15"],
  },
  {
    id: "working",
    label: "Working",
    paths: [
      "M14.7 6.3C14.5168 6.48693 14.4141 6.73825 14.4141 7.00001C14.4141 7.26176 14.5168 7.51308 14.7 7.70001L16.3 9.30001C16.4869 9.48324 16.7383 9.58587 17 9.58587C17.2617 9.58587 17.5131 9.48324 17.7 9.30001L21.47 5.53001C21.9728 6.6412 22.1251 7.87924 21.9065 9.07916C21.6878 10.2791 21.1087 11.3838 20.2463 12.2463C19.3838 13.1087 18.2791 13.6878 17.0792 13.9065C15.8792 14.1251 14.6412 13.9728 13.53 13.47L6.62 20.38C6.22218 20.7778 5.68261 21.0013 5.12 21.0013C4.55739 21.0013 4.01783 20.7778 3.62 20.38C3.22218 19.9822 2.99866 19.4426 2.99866 18.88C2.99866 18.3174 3.22218 17.7778 3.62 17.38L10.53 10.47C10.0272 9.35882 9.87493 8.12078 10.0935 6.92086C10.3122 5.72094 10.8913 4.6162 11.7538 3.75377C12.6162 2.89134 13.7209 2.31219 14.9208 2.09355C16.1208 1.87491 17.3588 2.02722 18.47 2.53001L14.71 6.29001L14.7 6.3Z",
    ],
  },
  {
    id: "archived",
    label: "Archived",
    paths: [
      "M4 7H20",
      "M10 11V17",
      "M14 11V17",
      "M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7",
      "M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7",
    ],
  },
  {
    id: "flagged",
    label: "Flagged",
    paths: [
      "M4 21V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H19L16 8L19 13H6C5.46957 13 4.96086 13.2107 4.58579 13.5858C4.21071 13.9609 4 14.4696 4 15",
    ],
  },
  {
    id: "search",
    label: "Search",
    paths: [
      "M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z",
      "M21 21L16.65 16.65",
    ],
  },
  {
    id: "show",
    label: "Show",
    paths: [
      "M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z",
      "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z",
    ],
  },
  {
    id: "alert-triangle",
    label: "Alert Triangle",
    paths: [
      "M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98735 20.2939 2.23672 20.5467 2.53771 20.7238C2.8387 20.9009 3.18082 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z",
      "M12 9V13",
      "M12 17H12.01",
    ],
  },
  {
    id: "favourite",
    label: "Favourite",
    paths: [
      "M17.286 21.09C16.1593 21.0907 14.3967 20.219 11.998 18.475C9.60066 20.2197 7.838 21.0917 6.71 21.091C4.89266 21.091 4.72766 18.8243 6.215 14.291C-0.0443373 9.77433 0.667329 7.516 8.35 7.516H8.426C9.616 3.83867 10.8073 2 12 2C13.19 2 14.3813 3.83867 15.574 7.516H15.65C23.3333 7.516 24.0443 9.774 17.783 14.29C19.2697 18.8247 19.104 21.0913 17.286 21.09Z",
    ],
  },
  {
    id: "ideas",
    label: "Ideas",
    paths: [
      "M3 12H4M12 3V4M20 12H21M5.6 5.6L6.3 6.3M18.4 5.6L17.7 6.3M9.69995 17H14.3M9 16C8.16047 15.3704 7.54033 14.4925 7.22743 13.4908C6.91453 12.4892 6.92473 11.4144 7.25658 10.4189C7.58844 9.4233 8.22512 8.55739 9.07645 7.94379C9.92778 7.33019 10.9506 7 12 7C13.0494 7 14.0722 7.33019 14.9236 7.94379C15.7749 8.55739 16.4116 9.4233 16.7434 10.4189C17.0753 11.4144 17.0855 12.4892 16.7726 13.4908C16.4597 14.4925 15.8395 15.3704 15 16C14.6096 16.3865 14.3156 16.8594 14.1419 17.3806C13.9681 17.9018 13.9195 18.4566 14 19C14 19.5304 13.7893 20.0391 13.4142 20.4142C13.0391 20.7893 12.5304 21 12 21C11.4696 21 10.9609 20.7893 10.5858 20.4142C10.2107 20.0391 10 19.5304 10 19C10.0805 18.4566 10.0319 17.9018 9.85813 17.3806C9.6844 16.8594 9.39043 16.3865 9 16Z",
    ],
  },
  {
    id: "critical",
    label: "Critical",
    paths: ["M6.5 11.5L12.5 17.5M20 4V9L11 16L7 20L4 17L8 13L15 4H20Z"],
  },
];

/** Base delay (seconds) before the icon-grid cells begin staggering in. */
const ICON_STAGGER_BASE = 0.34;
/** Per-cell delay increment (seconds) applied across the grid. */
const ICON_STAGGER_STEP = 0.022;

/* ------------------------------------------------------------ icon primitive */

/** Props shared by the inline stroke-icon primitive. */
interface StrokeIconProps {
  /** Rendered width/height in pixels. */
  size: number;
  /** 24×24 stroke path definitions to render. */
  paths: readonly string[];
}

/**
 * 24×24 stroke-icon wrapper matching the source dialog's export defaults
 * (currentColor stroke, 2px width, round caps/joins).
 *
 * @param props - Size and path list to render.
 * @returns The configured stroke `<svg>` element, or null on failure.
 */
function StrokeIcon({ size, paths }: StrokeIconProps): ReactNode {
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
        {paths?.map((definition) => (
          <path key={definition} d={definition} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * `x` glyph used by the modal's close button.
 *
 * @param root0 - The glyph props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The close `<svg>` element, or null on failure.
 */
function CloseIcon({ size }: { size: number }): ReactNode {
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
        <path d="M18 6L6 18M6 6L18 18" />
      </svg>
    );
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------- export */

/**
 * Render the "Custom Statuses" feature-section artifact.
 *
 * @returns The Add Status dialog contents, filling its container.
 */
export default function CustomStatusArtifact(): ReactNode {
  try {
    const chipStyle: CSSProperties = {
      color: STATUS_COLOR,
      background: STATUS_TINT,
    };
    const activeCellStyle: CSSProperties = {
      color: STATUS_COLOR,
      background: STATUS_TINT,
      borderColor: STATUS_BORDER,
    };

    return (
      <div className={styles.root} data-artifact="custom-statuses">
        {/* Dimmed settings page hinted behind the modal. */}
        <div className={styles.page} aria-hidden="true">
          <span className={styles.ghostTitle} />
          <span className={styles.ghostRow} />
          <span className={styles.ghostRow} />
          <span className={styles.ghostRow} />
        </div>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.modal} role="dialog" aria-label={MODAL_TITLE}>
          <div className={styles.header}>
            <h2 className={styles.title}>{MODAL_TITLE}</h2>
            <button type="button" className={styles.close} aria-label={CLOSE_LABEL}>
              <CloseIcon size={18} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.form}>
              <div className={styles.group}>
                <span className={styles.label}>{NAME_LABEL}</span>
                <div className={styles.input}>
                  <span className={styles.placeholder}>{NAME_PLACEHOLDER}</span>
                </div>
                <span className={styles.counter}>{CHAR_COUNTER}</span>
              </div>

              <div className={styles.group}>
                <span className={styles.label}>{TYPE_LABEL}</span>
                <div className={styles.typeBox}>{TYPE_VALUE}</div>
                <span className={styles.hint}>{TYPE_HINT}</span>
              </div>

              <div className={styles.group}>
                <span className={styles.label}>{COLOR_LABEL}</span>
                <div className={styles.colorInput}>
                  <span className={styles.colorValue}>{COLOR_VALUE}</span>
                  <span
                    className={styles.swatch}
                    style={{ background: STATUS_COLOR }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className={styles.group}>
                <span className={styles.label}>{ICON_LABEL}</span>
                <div className={styles.iconGrid}>
                  {STATUS_ICONS.map((icon, index) => {
                    const isActive = index === 0;
                    const cellClass = isActive
                      ? `${styles.iconCell} ${styles.iconCellActive}`
                      : styles.iconCell;
                    const cellStyle: CSSProperties = {
                      animationDelay: `${ICON_STAGGER_BASE + index * ICON_STAGGER_STEP}s`,
                      ...(isActive ? activeCellStyle : null),
                    };
                    return (
                      <span
                        key={icon?.id}
                        className={cellClass}
                        style={cellStyle}
                        title={icon?.label}
                      >
                        <StrokeIcon size={20} paths={icon?.paths ?? OPEN_PATHS} />
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.preview}>
              <div className={styles.previewBox}>
                <span className={styles.chip} style={chipStyle}>
                  <span className={styles.chipIcon}>
                    <StrokeIcon size={18} paths={OPEN_PATHS} />
                  </span>
                  <span className={styles.chipLabel}>{PREVIEW_TITLE}</span>
                </span>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.btnSecondary}>
                  {CANCEL_LABEL}
                </button>
                <button type="button" className={styles.btnPrimary} disabled>
                  {SUBMIT_LABEL}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
