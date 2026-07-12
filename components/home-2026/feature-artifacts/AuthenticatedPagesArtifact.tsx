"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import styles from "./AuthenticatedPagesArtifact.module.css";
import BrowserChrome from "./BrowserChrome";
import CommentPin from "./CommentPin";
import CommentThreadCard, { type AvatarTone } from "./CommentThreadCard";
import PinnedCommentScene from "./PinnedCommentScene";
import FakeCursor from "./FakeCursor";

/**
 * Feature/hero artifact — "Authenticated Pages".
 *
 * The authenticated-pages story is: Superflow installs ON the customer's own
 * site via a one-line code snippet (not a proxy), so the review tool loads
 * inside the viewer's own logged-in session — behind passwords, Okta, SSO/SAML,
 * or any identity provider. Feedback lands in a portal only the agency/team can
 * see; clients review via guest mode or their own portal. Screenshots capture
 * from the DOM inside the live session.
 *
 * One variant-driven component covers every beat:
 *
 *  - `behind-password`  — a padlock gate types a masked password then lifts to
 *                         reveal the reviewed page with a pinned comment (the
 *                         shared PinnedCommentScene).
 *  - `behind-okta`      — an Okta-style sign-in card with a prefilled email and
 *                         a FakeCursor pressing "Sign In" before the gate lifts.
 *  - `behind-sso`       — a generic SSO/SAML card with a shield glyph and a
 *                         FakeCursor pressing "Continue with SSO".
 *  - `client-portal`    — the client's own portal (Northwind): a signed-in chip,
 *                         a dashboard body and an Approve button a FakeCursor
 *                         presses → flips to "Approved · Dana Wells".
 *  - `on-site-snippet`  — a snippet card + dashed connector → the in-session
 *                         reviewed page, contrasted with a greyed "Proxy tool"
 *                         error card.
 *  - `auth-types`       — four login-method rows, each with a green "Review
 *                         works ✓" pill landing in a staggered entrance.
 *
 * All motion is CSS-only and is gated behind `prefers-reduced-motion`; the
 * settled state (gate already lifted, approve already recorded, pills already
 * landed) is what renders when motion is reduced, so screenshots always capture
 * the finished composition.
 */

/** Which authenticated-pages scene to render. */
export type AuthenticatedPagesVariant =
  | "behind-password"
  | "behind-okta"
  | "behind-sso"
  | "client-portal"
  | "on-site-snippet"
  | "auth-types";

/* ------------------------------------------------------------------ *
 * Copy-string constants (per the repo's repeated-string rule).        *
 * ------------------------------------------------------------------ */

const ADDRESS_ACME = "app.acme-portal.com";
const ADDRESS_OKTA = "acme.okta.com";
const ADDRESS_SSO = "sso.acme-corp.com";
const ADDRESS_NORTHWIND = "portal.northwind.com";

/** Shared "passed-through" state shown on every gate's submit control. */
const SIGNED_IN_LABEL = "Signed in ✓";

/** Official Okta mark asset (a blue "O" ring), served raw as an SVG. */
const OKTA_LOGO_SRC = "/images/logos/okta.svg";

/* Pinned-review comment copy (reused across scenes via the shared dialog). The
   dialog is the exact same rich CommentThreadCard the comments feature page
   uses — status header, photo avatar, "@mention" chip and a reply row. */
/** Header status label shown on the pinned dialog (mirrors the comments page). */
const REVIEW_STATUS = "Open";
/** Reply-count row shown at the foot of the pinned dialog. */
const REVIEW_REPLY_LABEL = "1 Reply";

const REVIEW_AUTHOR = "Milton";
const REVIEW_TIME = "2w";
const REVIEW_BODY = "Can we update this image?";
const REVIEW_MENTION = "@Sara";

const CLIENT_REVIEW_AUTHOR = "Dana";
const CLIENT_REVIEW_TIME = "1h";
const CLIENT_REVIEW_INITIAL = "D";
const CLIENT_REVIEW_BODY = "Looks great, ready to approve!";
const CLIENT_REVIEW_MENTION = "@Alex";

/* behind-password */
const PASSWORD_HEADING = "Enter password";
const PASSWORD_MASK = "••••••••••";
const PASSWORD_BTN = "Unlock";
const PASSWORD_CAPTION = "Review runs inside your session.";

/* behind-okta */
const OKTA_HEADING = "Sign in";
const OKTA_SUBDOMAIN = "acme.okta.com";
const OKTA_EMAIL = "dana@acme.com";
const OKTA_BTN = "Sign In";
const OKTA_CAPTION = "Behind Okta — review still runs.";

/* behind-sso */
const SSO_HEADING = "Single sign-on";
const SSO_SUB = "Continue with your identity provider";
const SSO_BTN = "Continue with SSO";
const SSO_CAPTION = "SSO and SAML included.";

/* client-portal */
const NORTHWIND_BRAND = "Northwind";
const NORTHWIND_CHIP = "Signed in as Dana · Northwind";
const NORTHWIND_NO_ACCOUNT = "No Superflow account";
const APPROVE_LABEL = "Approve";
const APPROVED_LABEL = "Approved · Dana Wells";
const CLIENT_CAPTION = "Your client reviews from inside their own system.";

/* on-site-snippet */
const SNIPPET_FILE_TAB = "index.html";
const SNIPPET_SRC = "https://cdn.superflow.app/embed.js";
/** Address shown in the browser chrome of the "snippet is live" window. */
const SNIPPET_SITE_ADDRESS = "YOUR-SITE.COM";

/* auth-types */
const AUTH_TYPES_HEADING = "If they can log in, review works there.";
const AUTH_WORKS_LABEL = "Review works ✓";

/** One row in the auth-types list. */
interface AuthTypeRow {
  /** Unique key. */
  id: string;
  /** Human-readable label for the auth method. */
  label: string;
  /** Which glyph to show. */
  glyph: AuthGlyph;
  /** Entrance-stagger delay in ms. */
  delayMs: number;
}

const AUTH_TYPE_ROWS: readonly AuthTypeRow[] = [
  { id: "password", label: "Password-protected", glyph: "key",    delayMs: 80  },
  { id: "okta",     label: "Okta",               glyph: "okta",   delayMs: 200 },
  { id: "sso",      label: "SSO / SAML",          glyph: "shield", delayMs: 320 },
  { id: "basic",    label: "Staging · basic auth", glyph: "lock", delayMs: 440 },
];

/* ------------------------------------------------------------------ *
 * Inline glyph helpers.                                               *
 * ------------------------------------------------------------------ */

/** Known inline glyph names used in this artifact. */
type AuthGlyph =
  | "lock"
  | "key"
  | "shield"
  | "check"
  | "okta";

/** Tabler-derived stroke path sets, keyed by glyph name. */
const GLYPH_PATHS: Readonly<Record<Exclude<AuthGlyph, "okta">, readonly string[]>> = {
  lock: [
    "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6",
    "M8 11v-4a4 4 0 1 1 8 0v4",
  ],
  key: [
    "M16.555 3.843l3.602 3.602a1 1 0 0 1 0 1.414l-2.906 2.906a1 1 0 0 1 -1.414 0l-.56 -.56l-2.338 2.338l.56 .56a1 1 0 0 1 0 1.414l-2.906 2.906a1 1 0 0 1 -1.414 0l-3.602 -3.602a1 1 0 0 1 0 -1.414l2.906 -2.906a1 1 0 0 1 1.414 0l.56 .56l2.338 -2.338l-.56 -.56a1 1 0 0 1 0 -1.414l2.906 -2.906a1 1 0 0 1 1.414 0z",
  ],
  shield: [
    "M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3",
  ],
  check: ["M5 12l5 5l9 -9"],
};

/** Props for the inline stroke glyph. */
interface GlyphProps {
  /** Which glyph to draw. */
  name: Exclude<AuthGlyph, "okta">;
  /** Rendered width/height in pixels (defaults to 20). */
  size?: number;
  /** Optional class applied to the svg. */
  className?: string;
}

/**
 * Draw one Tabler-style glyph in `currentColor` on the 24-unit grid.
 *
 * @param root0 - Which glyph + sizing/class props.
 * @param root0.name - The glyph name to look up.
 * @param root0.size - Rendered width/height in pixels.
 * @param root0.className - Optional class on the svg.
 * @returns The configured `<svg>` element, or `null` on failure.
 */
function Glyph({ name, size = 20, className }: GlyphProps): ReactNode {
  try {
    const paths = GLYPH_PATHS[name] ?? [];
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
        className={className}
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

/**
 * The official Okta mark (a blue "O" ring) served from the downloaded asset.
 * Rendered raw (unoptimized) since it is an SVG.
 *
 * @param root0 - Sizing props.
 * @param root0.size - Rendered width/height in pixels.
 * @returns The Okta logo `<Image>`, or `null` on failure.
 */
function OktaMark({ size = 28 }: { size?: number }): ReactNode {
  try {
    return (
      <Image
        src={OKTA_LOGO_SRC}
        alt="Okta"
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
      />
    );
  } catch {
    return null;
  }
}

/**
 * Build the inline style that staggers one element's entrance.
 *
 * @param delayMs - Milliseconds to wait before this item animates in.
 * @returns The inline style setting the stagger custom property.
 */
function delayStyle(delayMs: number): CSSProperties {
  try {
    return { "--ap-delay": `${delayMs}ms` } as CSSProperties;
  } catch {
    return {};
  }
}

/** Props for {@link ReviewComment}. */
interface ReviewCommentProps {
  /** Positioning class for the group (absolute placement + z-index). */
  className?: string;
  /** Comment author's name. */
  author: string;
  /** Relative timestamp shown after the author. */
  timeAgo: string;
  /** Avatar initial used by both the pin and the card's fallback avatar. */
  avatarInitial: string;
  /** The comment body text. */
  bodyText: string;
  /** Optional purple "@mention" chip appended to the body. */
  mention?: string;
  /**
   * Photo avatar source for both the teardrop pin and the card header. When
   * omitted the pin/card fall back to the {@link avatarInitial} on a tone disc.
   */
  avatarSrc?: string;
  /** Pin teardrop tone. Defaults to Superflow purple. */
  tone?: string;
  /** Card avatar fill tone (initial fallback). Defaults to "gray". */
  avatarTone?: AvatarTone;
  /** Teardrop pin diameter in px. Defaults to 28 (matches the comments page). */
  pinSize?: number;
  /**
   * Header status label. Defaults to "Open" so the dialog matches the comments
   * page; pass an empty string to drop the whole action header.
   */
  status?: string;
  /** Whether the header flag pill is shown. Defaults to true. */
  showFlag?: boolean;
  /** Whether the header resolve check is shown. Defaults to true. */
  resolvable?: boolean;
  /** Reply-row label. Defaults to "1 Reply"; pass "" to hide the row. */
  replyLabel?: string;
  /** Whether the muted "(EDITED)" tag is shown. Defaults to true. */
  edited?: boolean;
}

/**
 * A pinned review comment — the shared {@link CommentPin} teardrop anchored to
 * the corner of the shared {@link CommentThreadCard} dialog. This is the exact
 * same rich popover the comments feature page renders (status header, photo
 * avatar, author row, "@mention" body and reply row), so the authenticated-pages
 * artifact reuses the single source of truth rather than a stripped-down card.
 * Position is owned by the caller's class.
 *
 * @param root0 - The comment content, avatar, header toggles and positioning class.
 * @param root0.className - Positioning class for the group.
 * @param root0.author - Comment author's name.
 * @param root0.timeAgo - Relative timestamp.
 * @param root0.avatarInitial - Avatar initial for the pin + card fallback.
 * @param root0.bodyText - Comment body text.
 * @param root0.mention - Optional purple "@mention" chip.
 * @param root0.avatarSrc - Optional photo avatar for the pin + card header.
 * @param root0.tone - Pin teardrop tone.
 * @param root0.avatarTone - Card avatar fill tone.
 * @param root0.pinSize - Pin diameter in px.
 * @param root0.status - Header status label ("" drops the header).
 * @param root0.showFlag - Whether the header flag pill is shown.
 * @param root0.resolvable - Whether the header resolve check is shown.
 * @param root0.replyLabel - Reply-row label ("" hides the row).
 * @param root0.edited - Whether the "(EDITED)" tag is shown.
 * @returns The pinned review comment group, or `null` on failure.
 */
function ReviewComment({
  className,
  author,
  timeAgo,
  avatarInitial,
  bodyText,
  mention,
  avatarSrc,
  tone = "#635cf4",
  avatarTone = "gray",
  pinSize = 28,
  status = REVIEW_STATUS,
  showFlag = true,
  resolvable = true,
  replyLabel = REVIEW_REPLY_LABEL,
  edited = true,
}: ReviewCommentProps): ReactNode {
  try {
    const groupClass = className
      ? `${styles.reviewGroup} ${className}`
      : styles.reviewGroup;
    return (
      <div className={groupClass}>
        {avatarSrc ? (
          <CommentPin
            className={styles.reviewPin}
            size={pinSize}
            avatarSrc={avatarSrc}
          />
        ) : (
          <CommentPin
            className={styles.reviewPin}
            size={pinSize}
            tone={tone}
            hasImage={false}
            character={avatarInitial}
          />
        )}
        <CommentThreadCard
          className={styles.reviewCard}
          avatarSrc={avatarSrc}
          author={author}
          timeAgo={timeAgo}
          edited={edited}
          avatarInitial={avatarInitial}
          avatarTone={avatarTone}
          bodyText={bodyText}
          mention={mention}
          status={status || undefined}
          showFlag={showFlag}
          resolvable={resolvable}
          replyLabel={replyLabel || undefined}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Shared "behind login" shell.                                        *
 *                                                                     *
 * The reviewed in-session page sits edge-to-edge behind the specific   *
 * login card (password / Okta / SSO), which floats in front like a     *
 * sign-in modal. On load the gate's field types / cursor presses, the  *
 * submit button flips to a green "Signed in ✓" pill, and then the      *
 * modal LIFTS AWAY — its job done — to reveal the reviewed page and its *
 * pinned comment. The settled / reduced-motion end state is the        *
 * gate-gone, page-revealed state (see the module's choreography block).*
 * ------------------------------------------------------------------ */

/** Props for {@link SignedInControl}. */
interface SignedInControlProps {
  /** The idle submit label (e.g. "Unlock", "Sign In"). */
  idleLabel: string;
  /** Optional extra class on the idle button (e.g. the Okta blue variant). */
  idleClassName?: string;
  /** Whether a FakeCursor presses the button in the entrance animation. */
  withCursor?: boolean;
}

/**
 * The gate's submit control: an idle button that flips to a green
 * "Signed in ✓" pill mid-sequence, confirming the viewer is through the login
 * for a beat before the whole modal lifts away.
 *
 * @param root0 - The idle label, optional idle-button class and cursor flag.
 * @param root0.idleLabel - The idle submit label.
 * @param root0.idleClassName - Optional extra class on the idle button.
 * @param root0.withCursor - Whether a FakeCursor presses the button.
 * @returns The submit control, or `null` on failure.
 */
function SignedInControl({
  idleLabel,
  idleClassName,
  withCursor = false,
}: SignedInControlProps): ReactNode {
  try {
    const idleClass = idleClassName
      ? `${styles.gateBtn} ${idleClassName}`
      : styles.gateBtn;
    return (
      <div className={styles.gateBtnWrap}>
        <button className={idleClass} type="button">{idleLabel}</button>
        <span className={styles.gateSignedIn}>{SIGNED_IN_LABEL}</span>
        {withCursor ? <FakeCursor className={styles.gateCursor} size={22} /> : null}
      </div>
    );
  } catch {
    return null;
  }
}

/** Props for {@link BehindScene}. */
interface BehindSceneProps {
  /** The variant hook (drives the per-variant animation timings in CSS). */
  variant: "behind-password" | "behind-okta" | "behind-sso";
  /** The browser-chrome address shown on the reviewed page. */
  address: string;
  /** The caption beneath the composition. */
  caption: string;
  /** Whether the hero-window fit is active (full-width flat browser). */
  hero?: boolean;
  /** The login-card contents (unique per scene). */
  children: ReactNode;
}

/**
 * The shared behind-login shell: a login card (front) over the reviewed
 * in-session page. The gate lifts away after "sign-in", so the settled state
 * is the revealed page with its pinned comment.
 *
 * In both FEATURE and HERO mode the reviewed page (the shared PinnedCommentScene)
 * fills the surface, and the login card sits centred over it like a sign-in modal
 * — centred within the visible ~630px region in the feature panel (whose 1204px
 * window clips off the right) and in the full window in hero — then lifts away
 * once the viewer is through, revealing the pinned comment.
 *
 * @param root0 - The variant, page address, caption, hero flag and card body.
 * @param root0.variant - The variant hook driving animation timings.
 * @param root0.address - The reviewed-page chrome address.
 * @param root0.caption - The caption beneath the composition.
 * @param root0.hero - Whether the hero-window fit is active.
 * @param root0.children - The login-card contents.
 * @returns The behind-login scene, or `null` on failure.
 */
function BehindScene({
  variant,
  address,
  caption,
  hero = false,
  children,
}: BehindSceneProps): ReactNode {
  try {
    const rootClass = hero
      ? `${styles.behindRoot} ${styles.behindRootHero}`
      : styles.behindRoot;
    // The revealed page + pinned comment are the SHARED PinnedCommentScene — the
    // exact surface + dialog the comments page and the client-review "Behind a
    // login too" tab use — so the copy stays the reviewer's ("Milton" · @Sara).
    const revealedPage = hero ? (
      // Hero: the shared scene rides a zoomed-out canvas beneath a full-width
      // chrome band (its own panel chrome is suppressed via `hero`), matching
      // the comments hero fit.
      <div className={styles.behindHeroFit}>
        <div className={styles.behindCanvas}>
          <PinnedCommentScene
            dataArtifact={`auth-${variant}-site`}
            hero
            author={REVIEW_AUTHOR}
            timeAgo={REVIEW_TIME}
            bodyText={REVIEW_BODY}
            mention={REVIEW_MENTION}
          />
        </div>
        <div className={styles.behindHeroChrome}>
          <BrowserChrome address={address} />
        </div>
      </div>
    ) : (
      // Feature: the shared scene fills the panel with its own chrome (the URL
      // is centred so this login's real domain stays readable in the frame).
      <div className={styles.behindSite}>
        <PinnedCommentScene
          dataArtifact={`auth-${variant}-site`}
          address={address}
          addressAlign="center"
          author={REVIEW_AUTHOR}
          timeAgo={REVIEW_TIME}
          bodyText={REVIEW_BODY}
          mention={REVIEW_MENTION}
        />
      </div>
    );
    return (
      <div className={rootClass} data-variant={variant}>
        <div className={styles.behindStack}>
          {revealedPage}
          {/* The login "page" (this variant's gate) sits over the reviewed page
              and lifts away once signed in, revealing it. The card centres in
              the left-anchored `.gateFrame` (the visible ~630px of the clipped
              panel window) rather than the full 1204px, so it never drifts to
              the visible edge — as in BehindLoginArtifact. */}
          <div className={styles.behindGate}>
            <div className={styles.gateFrame}>
              <div className={styles.gateCard}>{children}</div>
            </div>
          </div>
        </div>
        {hero ? null : <p className={styles.sceneCaption}>{caption}</p>}
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 1: behind-password                                            *
 * ------------------------------------------------------------------ */

/**
 * `behind-password` scene — a padlock login card (masked field) sits in front
 * of the reviewed page; its "Unlock" button flips to "Signed in ✓". Conveys
 * that Superflow review works on any password-protected page without a proxy.
 *
 * @param root0 - The component props.
 * @param root0.hero - Whether the hero-window fit is active.
 * @returns The behind-password scene, or `null` on failure.
 */
function BehindPasswordScene({ hero = false }: { hero?: boolean }): ReactNode {
  try {
    return (
      <BehindScene
        variant="behind-password"
        address={ADDRESS_ACME}
        caption={PASSWORD_CAPTION}
        hero={hero}
      >
        <span className={styles.gateIconWrap}>
          <Glyph name="lock" size={22} className={styles.gateIcon} />
        </span>
        <h3 className={styles.gateHeading}>{PASSWORD_HEADING}</h3>
        <div className={styles.passwordField}>
          <span className={styles.passwordReveal}>
            <span className={styles.passwordDots}>{PASSWORD_MASK}</span>
          </span>
          <span className={styles.passwordCaret} aria-hidden="true" />
        </div>
        <SignedInControl idleLabel={PASSWORD_BTN} />
      </BehindScene>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 2: behind-okta                                                *
 * ------------------------------------------------------------------ */

/**
 * `behind-okta` scene — an Okta-style login card (the official Okta mark +
 * prefilled email + blue button) in front of the reviewed page; a FakeCursor
 * presses "Sign In" which flips to "Signed in ✓".
 *
 * @param root0 - The component props.
 * @param root0.hero - Whether the hero-window fit is active.
 * @returns The behind-okta scene, or `null` on failure.
 */
function BehindOktaScene({ hero = false }: { hero?: boolean }): ReactNode {
  try {
    return (
      <BehindScene
        variant="behind-okta"
        address={ADDRESS_OKTA}
        caption={OKTA_CAPTION}
        hero={hero}
      >
        <span className={styles.gateMarkWrap}>
          <OktaMark size={34} />
        </span>
        <h3 className={styles.gateHeading}>{OKTA_HEADING}</h3>
        <p className={styles.gateSub}>{OKTA_SUBDOMAIN}</p>
        <div className={styles.emailField}>
          <span className={styles.emailValue}>{OKTA_EMAIL}</span>
        </div>
        <SignedInControl idleLabel={OKTA_BTN} idleClassName={styles.gateBtnOkta} withCursor />
      </BehindScene>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 3: behind-sso                                                 *
 * ------------------------------------------------------------------ */

/**
 * `behind-sso` scene — a generic SSO/SAML login card (shield glyph + "Continue
 * with SSO") in front of the reviewed page; a FakeCursor presses the button
 * which flips to "Signed in ✓".
 *
 * @param root0 - The component props.
 * @param root0.hero - Whether the hero-window fit is active.
 * @returns The behind-sso scene, or `null` on failure.
 */
function BehindSsoScene({ hero = false }: { hero?: boolean }): ReactNode {
  try {
    return (
      <BehindScene
        variant="behind-sso"
        address={ADDRESS_SSO}
        caption={SSO_CAPTION}
        hero={hero}
      >
        <span className={styles.gateIconWrap}>
          <Glyph name="shield" size={22} className={styles.gateIcon} />
        </span>
        <h3 className={styles.gateHeading}>{SSO_HEADING}</h3>
        <p className={styles.gateSub}>{SSO_SUB}</p>
        <SignedInControl idleLabel={SSO_BTN} withCursor />
      </BehindScene>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 4: client-portal                                              *
 * ------------------------------------------------------------------ */

/**
 * `client-portal` scene — the client's own portal (Northwind) built on a flat,
 * full-width {@link BrowserChrome} wireframe (address `portal.northwind.com`):
 * slim in-page "Signed in as Dana · Northwind" / "No Superflow account" pills, a
 * dashboard body, a pinned Superflow comment (shared dialog) and an Approve
 * button a FakeCursor presses → flips to "Approved · Dana Wells".
 *
 * @param root0 - The component props.
 * @param root0.hero - Whether the hero-window fit is active (full-width page).
 * @returns The client-portal scene, or `null` on failure.
 */
function ClientPortalScene({ hero = false }: { hero?: boolean }): ReactNode {
  try {
    const windowClass = hero
      ? `${styles.portalWindow} ${styles.portalWindowHero}`
      : styles.portalWindow;
    return (
      <div className={styles.portalRoot}>
        <div className={windowClass}>
          <div className={styles.portalChrome}>
            <BrowserChrome address={ADDRESS_NORTHWIND} />
          </div>
          <div className={styles.portalBody}>
            <div className={styles.portalBar}>
              <span className={styles.portalBrand}>{NORTHWIND_BRAND}</span>
              <span className={styles.portalSignedInChip}>{NORTHWIND_CHIP}</span>
              <span className={styles.portalNoAccountChip}>{NORTHWIND_NO_ACCOUNT}</span>
            </div>
            <div className={styles.portalDashHero} />
            <div className={styles.portalDashLine} />
            <div className={`${styles.portalDashLine} ${styles.portalDashLineShort}`} />
            <div className={styles.portalDashTiles}>
              <div className={styles.portalDashTile} />
              <div className={styles.portalDashTile} />
              <div className={styles.portalDashTile} />
            </div>
          </div>
          {/* Pinned comment — the same rich dialog the comments page uses (full
              status header: Open pill + flag + resolve), from the client's side
              with a green initial avatar. */}
          <ReviewComment
            className={styles.portalReview}
            author={CLIENT_REVIEW_AUTHOR}
            timeAgo={CLIENT_REVIEW_TIME}
            avatarInitial={CLIENT_REVIEW_INITIAL}
            bodyText={CLIENT_REVIEW_BODY}
            mention={CLIENT_REVIEW_MENTION}
            avatarTone="green"
          />
          {/* Approve action bar */}
          <div className={styles.portalActionBar}>
            <div className={styles.approveBtnWrap}>
              <span className={styles.approveBtnIdle}>{APPROVE_LABEL}</span>
              <span className={styles.approveBtnDone}>
                <Glyph name="check" size={13} />
                {APPROVED_LABEL}
              </span>
              <FakeCursor className={styles.approveCursor} size={22} />
            </div>
          </div>
        </div>
        {hero ? null : <p className={styles.sceneCaption}>{CLIENT_CAPTION}</p>}
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 5: on-site-snippet                                            *
 * ------------------------------------------------------------------ */

/**
 * `on-site-snippet` scene — a vertical two-beat story matching the Figma design:
 * step one is just the one-line embed snippet (an `index.html` tab over a
 * syntax-highlighted `<script>` card, nothing else); step two is the site with
 * the snippet live — a browser window ({@link SNIPPET_SITE_ADDRESS}) whose page
 * carries a dropped review pin. Conveys that Superflow runs on the real site,
 * loaded by a single tag.
 *
 * @returns The on-site-snippet scene, or `null` on failure.
 */
function OnSiteSnippetScene(): ReactNode {
  try {
    return (
      <div className={styles.snippetRoot}>
        {/* Step 1: just the embed snippet — an index.html tab over the one-line
            <script> tag, syntax-highlighted (tag coral, attributes teal). */}
        <div className={styles.snippetStep} style={delayStyle(80)}>
          <span className={styles.snippetFileTab}>{SNIPPET_FILE_TAB}</span>
          <div className={styles.snippetCodeCard}>
            <code className={styles.snippetCodeText}>
              &lt;<span className={styles.codeTag}>script</span>{" "}
              <span className={styles.codeAttr}>src</span>=&quot;{SNIPPET_SRC}&quot;{" "}
              <span className={styles.codeAttr}>async</span>&gt;&lt;/
              <span className={styles.codeTag}>script</span>&gt;
            </code>
          </div>
        </div>

        {/* Step 2: the site, now with the snippet live — a browser window whose
            page carries a dropped review pin. */}
        <div className={styles.siteWindow} style={delayStyle(280)}>
          <div className={styles.siteChrome}>
            <span className={styles.siteDots} aria-hidden="true">
              <span className={`${styles.siteDot} ${styles.siteDotRed}`} />
              <span className={`${styles.siteDot} ${styles.siteDotAmber}`} />
              <span className={`${styles.siteDot} ${styles.siteDotGreen}`} />
            </span>
            <span className={styles.siteAddress}>{SNIPPET_SITE_ADDRESS}</span>
          </div>
          <div className={styles.siteBody}>
            <div className={styles.siteHero} aria-hidden="true" />
            <div className={styles.siteLines} aria-hidden="true">
              <span className={`${styles.siteLine} ${styles.siteLineTall}`} />
              <span className={styles.siteLine} />
              <span className={`${styles.siteLine} ${styles.siteLineShort}`} />
            </div>
            <span className={styles.snippetPin} aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene 6: auth-types                                                 *
 * ------------------------------------------------------------------ */

/**
 * Render the glyph for a given auth-type row (the "okta" glyph is the official
 * Okta mark asset; everything else is a Tabler path glyph).
 *
 * @param root0 - The glyph name and size.
 * @param root0.glyph - Which glyph to render.
 * @param root0.size - Rendered width/height in px.
 * @returns The glyph element, or `null` on failure.
 */
function AuthTypeGlyph({ glyph, size = 18 }: { glyph: AuthGlyph; size?: number }): ReactNode {
  try {
    if (glyph === "okta") {
      return <OktaMark size={size} />;
    }
    return <Glyph name={glyph} size={size} />;
  } catch {
    return null;
  }
}

/**
 * `auth-types` scene — a white card listing four login methods, each with a
 * green "Review works ✓" pill that lands in a staggered entrance. Conveys that
 * any standard identity gate is supported.
 *
 * @returns The auth-types scene, or `null` on failure.
 */
function AuthTypesScene(): ReactNode {
  try {
    return (
      <div className={styles.authTypesRoot}>
        <div className={styles.authTypesCard}>
          <h3 className={styles.authTypesHeading}>{AUTH_TYPES_HEADING}</h3>
          <div className={styles.authTypesList}>
            {AUTH_TYPE_ROWS.map((row) => (
              <div
                key={row.id}
                className={styles.authTypesRow}
                style={delayStyle(row.delayMs)}
              >
                <span className={styles.authTypesGlyph} aria-hidden="true">
                  <AuthTypeGlyph glyph={row.glyph} size={18} />
                </span>
                <span className={styles.authTypesLabel}>{row.label}</span>
                <span className={styles.authWorksPill}>
                  <Glyph name="check" size={12} className={styles.authWorksCheck} />
                  {AUTH_WORKS_LABEL}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Right: a faint page thumbnail with a pinned comment (bleeds in feature mode) */}
        <div className={styles.authTypesThumbnail} aria-hidden="true">
          <div className={styles.thumbChrome} />
          <div className={styles.thumbBody}>
            <div className={styles.thumbHero} />
            <div className={styles.thumbLine} />
            <div className={`${styles.thumbLine} ${styles.thumbLineShort}`} />
          </div>
          <div className={styles.thumbPinGroup}>
            <CommentPin
              className={styles.thumbPin}
              size={22}
              tone="#635cf4"
              hasImage={false}
              character="M"
            />
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Scene router.                                                        *
 * ------------------------------------------------------------------ */

/**
 * Resolve which scene body to render for an authenticated-pages variant.
 *
 * @param variant - The requested scene variant.
 * @param hero - Whether the hero-window fit is active (full-width browser).
 * @returns The scene node for the variant, or `null` on failure.
 */
function renderAuthScene(variant: AuthenticatedPagesVariant, hero: boolean): ReactNode {
  try {
    switch (variant) {
      case "behind-okta":
        return <BehindOktaScene hero={hero} />;
      case "behind-sso":
        return <BehindSsoScene hero={hero} />;
      case "client-portal":
        return <ClientPortalScene hero={hero} />;
      case "on-site-snippet":
        return <OnSiteSnippetScene />;
      case "auth-types":
        return <AuthTypesScene />;
      default:
        return <BehindPasswordScene hero={hero} />;
    }
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Root component.                                                      *
 * ------------------------------------------------------------------ */

/** Props for {@link AuthenticatedPagesArtifact}. */
export interface AuthenticatedPagesArtifactProps {
  /** Which scene to render. Defaults to `behind-password`. */
  variant?: AuthenticatedPagesVariant;
  /** Hero-window fit (centres the scene + trims height for the hero frame). */
  hero?: boolean;
}

/**
 * Render the Authenticated Pages artifact for the given variant.
 *
 * @param props - The variant + hero-fit flag.
 * @returns The artifact, or `null` on failure.
 */
export default function AuthenticatedPagesArtifact({
  variant = "behind-password",
  hero = false,
}: AuthenticatedPagesArtifactProps = {}): ReactNode {
  try {
    return (
      <div
        className={`${styles.sceneRoot}${hero ? ` ${styles.hero}` : ""}`}
        data-artifact={`auth-${variant}`}
        data-variant={variant}
        {...(hero ? { "data-hero": "" } : {})}
      >
        <div className={styles.stage}>{renderAuthScene(variant, hero)}</div>
        <div className={styles.fade} aria-hidden="true" />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Zero-prop wrapper exports (one per variant for the feature registry).*
 * ------------------------------------------------------------------ */

/**
 * Feature-panel wrapper — the password gate scene.
 * @returns The behind-password artifact.
 */
export function AuthBehindPasswordArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="behind-password" />;
}

/**
 * Feature-panel wrapper — the Okta gate scene.
 * @returns The behind-okta artifact.
 */
export function AuthBehindOktaArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="behind-okta" />;
}

/**
 * Feature-panel wrapper — the SSO/SAML gate scene.
 * @returns The behind-sso artifact.
 */
export function AuthBehindSsoArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="behind-sso" />;
}

/**
 * Feature-panel wrapper — the client portal (Northwind) scene.
 * @returns The client-portal artifact.
 */
export function AuthClientPortalArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="client-portal" />;
}

/**
 * Feature-panel wrapper — the on-site snippet vs. proxy contrast scene.
 * @returns The on-site-snippet artifact.
 */
export function AuthOnSiteArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="on-site-snippet" />;
}

/**
 * Feature-panel wrapper — the four auth-type "Review works ✓" rows.
 * @returns The auth-types artifact.
 */
export function AuthTypesArtifact(): ReactNode {
  return <AuthenticatedPagesArtifact variant="auth-types" />;
}
