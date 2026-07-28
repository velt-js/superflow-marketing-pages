"use client";

import type { ReactNode } from "react";
import styles from "./ClientReviewArtifact.module.css";
import FakeCursor from "./FakeCursor";

/**
 * Feature/hero artifact — "Client Review".
 *
 * The client's side of a Superflow review, rendered inside a phone (the whole
 * pitch is "from their phone"). One variant-driven component covers the three
 * client-facing beats that had no artifact before:
 *
 *  - `magic-link`  — a message thread with a "review & approve" link the client
 *                    taps. No app, no account; the link opens the live page.
 *  - `cleaned-up`  — the live page the client actually sees: AI + the team
 *                    reviewed first, so the punch list is already resolved.
 *  - `approve`     — the live page's client bar with one green Approve button;
 *                    a tap flips it to "Approved" and records a timestamped,
 *                    name-stamped yes.
 *
 * The team/board beats (no-account browser, click-the-spot, private threads,
 * after-the-yes Kanban) reuse the existing desktop artifacts instead, giving
 * the page a deliberate "client on a phone / team on desktop" duality.
 *
 * All motion is gated behind `prefers-reduced-motion`; the settled state (link
 * highlighted, approval recorded) is what renders when motion is reduced.
 */

/** Which client-review scene to render inside the phone. */
export type ClientReviewVariant = "magic-link" | "cleaned-up" | "approve";

/** Illustrative mock content (not real metrics — matches the page's copy). */
const SITE_URL = "acme-studio.com";
const SENDER_NAME = "Acme Studio";
const CLIENT_NAME = "Dana Wells";
const APPROVE_STAMP = "Jul 11, 2:14 PM";
const MESSAGE_TEXT = "Hi Dana - the new homepage is ready for your review.";
const LINK_TITLE = "Review & approve";
const LINK_SUB = "No login - opens on your phone";
const RESOLVED_TEXT = "AI + your team reviewed first";
const RESOLVED_SUB = "12 findings resolved before you looked";
const APPROVE_LABEL = "Approve";
const APPROVED_LABEL = "Approved";

/** A locally-drawn stroked icon on the 24×24 Tabler grid. */
function StrokeGlyph({
  size = 18,
  paths,
}: {
  size?: number;
  paths: readonly string[];
}): ReactNode {
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
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

const LINK_PATHS = [
  "M9 15l6 -6",
  "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464",
  "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463",
] as const;
const CHECK_PATHS = ["M5 12l5 5l10 -10"] as const;
const SHIELD_CHECK_PATHS = [
  "M12 3l7 3v5c0 4.5 -3 7 -7 8c-4 -1 -7 -3.5 -7 -8v-5z",
  "M9.5 11.5l1.8 1.8l3.2 -3.3",
] as const;
const CHEVRON_LEFT_PATHS = ["M15 6l-6 6l6 6"] as const;

/**
 * The phone shell (dark bezel, white screen, status bar). Every variant paints
 * its scene into the screen.
 *
 * @param props.children The screen contents.
 * @param props.tone Optional status-bar/notch tint hook via `data-tone`.
 * @returns The phone element, or `null` on failure.
 */
function Phone({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: string;
}): ReactNode {
  try {
    return (
      <div className={styles.phone} data-tone={tone}>
        <span className={styles.phoneNotch} aria-hidden="true" />
        <div className={styles.phoneScreen}>{children}</div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * The polished live page the client sees — a crisp hero, a couple of content
 * rows, and a small product tile. Shared by the cleaned-up and approve scenes.
 *
 * @returns The live-page body element.
 */
function LivePage(): ReactNode {
  return (
    <div className={styles.live} aria-hidden="true">
      <div className={styles.liveTopbar}>
        <span className={styles.liveDot} />
        <span className={styles.liveUrl}>{SITE_URL}</span>
      </div>
      <div className={styles.liveHero} />
      <div className={styles.liveHeadline} />
      <div className={styles.liveLines}>
        <span className={styles.liveLine} />
        <span className={`${styles.liveLine} ${styles.liveLineShort}`} />
      </div>
      <div className={styles.liveTiles}>
        <span className={styles.liveTile} />
        <span className={styles.liveTile} />
      </div>
    </div>
  );
}

/**
 * `magic-link` scene — a message thread with the review link the client taps.
 * A neutral green messaging header (email / SMS / WhatsApp all land the same
 * link) over an incoming bubble and a rich link card; the cursor presses it.
 *
 * @returns The magic-link scene.
 */
function MagicLinkBody(): ReactNode {
  return (
    <div className={styles.msg}>
      <div className={styles.msgView}>
        <div className={styles.msgHead}>
          <span className={styles.msgBack} aria-hidden="true">
            <StrokeGlyph size={16} paths={CHEVRON_LEFT_PATHS} />
          </span>
          <span className={styles.msgAvatar} aria-hidden="true">
            {SENDER_NAME.charAt(0)}
          </span>
          <span className={styles.msgName}>{SENDER_NAME}</span>
        </div>

        <div className={styles.msgThread}>
          <p className={styles.msgBubble}>{MESSAGE_TEXT}</p>

          <div className={styles.linkCard}>
            <div className={styles.linkThumb} aria-hidden="true">
              <span className={styles.linkThumbHero} />
              <span className={styles.linkThumbLine} />
            </div>
            <div className={styles.linkBody}>
              <span className={styles.linkUrl}>
                <StrokeGlyph size={13} paths={LINK_PATHS} />
                {SITE_URL}
              </span>
              <span className={styles.linkTitle}>{LINK_TITLE}</span>
              <span className={styles.linkSub}>{LINK_SUB}</span>
            </div>
            <FakeCursor className={styles.msgCursor} size={26} />
          </div>
        </div>
      </div>

      {/* The tapped link opens the live page, sliding up over the thread. */}
      <div className={styles.msgSite} aria-hidden="true">
        <LivePage />
      </div>
    </div>
  );
}

/**
 * `cleaned-up` scene — the live page, with a banner making the invisible work
 * visible: AI and the team reviewed first, so the client never sees the punch
 * list.
 *
 * @returns The cleaned-up scene.
 */
function CleanedUpBody(): ReactNode {
  return (
    <div className={styles.cleaned}>
      <LivePage />
      <div className={styles.cleanBanner}>
        <span className={styles.cleanIcon} aria-hidden="true">
          <StrokeGlyph size={18} paths={SHIELD_CHECK_PATHS} />
        </span>
        <div className={styles.cleanText}>
          <span className={styles.cleanTitle}>{RESOLVED_TEXT}</span>
          <span className={styles.cleanSub}>{RESOLVED_SUB}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * `approve` scene — the live page with the client bar's one green Approve
 * button. On mount the cursor presses it; the button flips to "Approved" and a
 * recorded, timestamped, name-stamped confirmation rises.
 *
 * @returns The approve scene.
 */
function ApproveBody(): ReactNode {
  return (
    <div className={styles.approve}>
      <LivePage />

      <div className={styles.approveToast}>
        <span className={styles.approveToastIcon} aria-hidden="true">
          <StrokeGlyph size={15} paths={CHECK_PATHS} />
        </span>
        <span className={styles.approveToastText}>
          {APPROVED_LABEL} by {CLIENT_NAME} · {APPROVE_STAMP}
        </span>
      </div>

      <div className={styles.clientBar}>
        <span className={styles.clientBrand} aria-hidden="true">
          {SENDER_NAME.charAt(0)}
        </span>
        <span className={styles.approveBtn}>
          <span className={styles.approveDefault}>{APPROVE_LABEL}</span>
          <span className={styles.approveDone}>
            <StrokeGlyph size={16} paths={CHECK_PATHS} />
            {APPROVED_LABEL}
          </span>
          <FakeCursor className={styles.approveCursor} size={26} />
        </span>
      </div>
    </div>
  );
}

/** Props for {@link ClientReviewArtifact}. */
export interface ClientReviewArtifactProps {
  /** Which scene to render. Defaults to `magic-link`. */
  variant?: ClientReviewVariant;
  /** Hero-window fit (slightly larger phone + padding). */
  hero?: boolean;
}

/**
 * Render the phone-framed Client Review artifact for the given variant.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function ClientReviewArtifact({
  variant = "magic-link",
  hero = false,
}: ClientReviewArtifactProps = {}): ReactNode {
  try {
    const body =
      variant === "approve" ? (
        <ApproveBody />
      ) : variant === "cleaned-up" ? (
        <CleanedUpBody />
      ) : (
        <MagicLinkBody />
      );
    const tone = variant === "magic-link" ? "message" : "live";
    return (
      <div
        className={styles.root}
        data-hero={hero || undefined}
        data-variant={variant}
      >
        <div className={styles.stage}>
          <Phone tone={tone}>{body}</Phone>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Feature-panel wrapper — the magic-link scene (Block 1 / hero "Magic link").
 * @returns The magic-link artifact.
 */
export function ClientReviewMagicLinkArtifact(): ReactNode {
  return <ClientReviewArtifact variant="magic-link" />;
}

/**
 * Feature-panel wrapper — the cleaned-up live page (Block 2).
 * @returns The cleaned-up artifact.
 */
export function ClientReviewCleanedUpArtifact(): ReactNode {
  return <ClientReviewArtifact variant="cleaned-up" />;
}

/**
 * Feature-panel wrapper — the Approve → recorded yes (Block 3).
 * @returns The approve artifact.
 */
export function ClientReviewApproveArtifact(): ReactNode {
  return <ClientReviewArtifact variant="approve" />;
}
