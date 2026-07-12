"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import styles from "./AuthenticatedPagesArtifact.module.css";
import BrowserChrome from "./BrowserChrome";
import CommentPin from "./CommentPin";
import CommentThreadCard from "./CommentThreadCard";
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
 *                         reveal the reviewed page with a pinned comment + a
 *                         "You're signed in" pill.
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

const SESSION_PILL = "You’re signed in";

/** Shared "passed-through" state shown on every gate's submit control. */
const SIGNED_IN_LABEL = "Signed in ✓";

/** Official Okta mark asset (a blue "O" ring), served raw as an SVG. */
const OKTA_LOGO_SRC = "/images/logos/okta.svg";

/* Pinned-review comment copy (reused across scenes via the shared dialog). */
const REVIEW_AUTHOR = "Milton";
const REVIEW_TIME = "2w";
const REVIEW_INITIAL = "M";
const REVIEW_BODY = "Can we update this image?";
const CLIENT_REVIEW_AUTHOR = "Dana";
const CLIENT_REVIEW_TIME = "1h";
const CLIENT_REVIEW_INITIAL = "D";
const CLIENT_REVIEW_BODY = "Looks great, ready to approve!";

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
const SNIPPET_HEADING = "Installed on your site";
const SNIPPET_CODE = '<script src="https://cdn.superflow.app/embed.js" async></script>';
const SNIPPET_NOTE = "IT-approved · one tag, like an analytics pixel";
const SNIPPET_DONE = "Added once ✓";
const SESSION_BADGE = "Loads in the viewer’s session";
const PROXY_HEADING = "Proxy tool";
const PROXY_ERROR = "403 · Can’t reach your page";
const PROXY_SUB = "not logged in as your user";

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
  | "okta"
  | "code"
  | "arrowRight"
  | "xCircle";

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
  code: [
    "M7 8l-4 4l4 4",
    "M17 8l4 4l-4 4",
    "M14 4l-4 16",
  ],
  arrowRight: ["M5 12h14", "M13 6l6 6l-6 6"],
  xCircle: [
    "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M10 10l4 4m0 -4l-4 4",
  ],
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
  /** Avatar/pin tone. Defaults to Superflow purple. */
  tone?: string;
  /** Card avatar fill tone. Defaults to "gray". */
  avatarTone?: "green" | "orange" | "gray";
  /** Teardrop pin diameter in px. Defaults to 26. */
  pinSize?: number;
}

/**
 * A pinned review comment — the shared {@link CommentPin} teardrop beside the
 * shared {@link CommentThreadCard} dialog. Reused across every scene so the
 * comment popover is the same component the comments page uses (single source
 * of truth), never bespoke markup. Position is owned by the caller's class.
 *
 * @param root0 - The comment content, tone and positioning class.
 * @param root0.className - Positioning class for the group.
 * @param root0.author - Comment author's name.
 * @param root0.timeAgo - Relative timestamp.
 * @param root0.avatarInitial - Avatar initial for the pin + card fallback.
 * @param root0.bodyText - Comment body text.
 * @param root0.tone - Pin teardrop tone.
 * @param root0.avatarTone - Card avatar fill tone.
 * @param root0.pinSize - Pin diameter in px.
 * @returns The pinned review comment group, or `null` on failure.
 */
function ReviewComment({
  className,
  author,
  timeAgo,
  avatarInitial,
  bodyText,
  tone = "#635cf4",
  avatarTone = "gray",
  pinSize = 26,
}: ReviewCommentProps): ReactNode {
  try {
    const groupClass = className
      ? `${styles.reviewGroup} ${className}`
      : styles.reviewGroup;
    return (
      <div className={groupClass}>
        <CommentPin
          className={styles.reviewPin}
          size={pinSize}
          tone={tone}
          hasImage={false}
          character={avatarInitial}
        />
        <CommentThreadCard
          className={styles.reviewCard}
          author={author}
          timeAgo={timeAgo}
          avatarInitial={avatarInitial}
          avatarTone={avatarTone}
          bodyText={bodyText}
        />
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Shared inner-page body (the content behind the auth gate).          *
 * ------------------------------------------------------------------ */

/**
 * The reviewed in-session page: a flat, full-width {@link BrowserChrome} band
 * over a page body (hero band + skeleton copy lines) with a pinned Superflow
 * review comment and a green "You're signed in" pill. Shared by all three
 * "behind-*" gate scenes as the page the login protects.
 *
 * In `hero` mode the chrome + body span the whole hero window edge-to-edge (the
 * comments-hero look); in feature mode the page is the right half of the split
 * with the gate card overlapping its left edge.
 *
 * @param root0 - The component props.
 * @param root0.address - The browser chrome address to display.
 * @param root0.hero - Whether to render the full-width hero page.
 * @returns The reviewed page, or `null` on failure.
 */
function InnerPage({
  address,
  hero = false,
}: {
  address: string;
  hero?: boolean;
}): ReactNode {
  try {
    const pageClass = hero
      ? `${styles.innerPage} ${styles.innerPageHero}`
      : styles.innerPage;
    return (
      <div className={pageClass}>
        <div className={styles.innerChrome}>
          <BrowserChrome address={address} />
        </div>
        <div className={styles.innerBody}>
          <div className={styles.innerHero} />
          <div className={styles.innerLine} />
          <div className={`${styles.innerLine} ${styles.innerLineShort}`} />
          <div className={styles.innerTiles}>
            <div className={styles.innerTile} />
            <div className={styles.innerTile} />
          </div>
          {/* Pinned comment on the revealed page (shared dialog) */}
          <ReviewComment
            className={styles.innerReview}
            author={REVIEW_AUTHOR}
            timeAgo={REVIEW_TIME}
            avatarInitial={REVIEW_INITIAL}
            bodyText={REVIEW_BODY}
          />
        </div>
        <span className={styles.sessionPill}>
          <span className={styles.sessionDot} aria-hidden="true" />
          {SESSION_PILL}
        </span>
      </div>
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Shared "behind login" shell.                                        *
 *                                                                     *
 * A left→right split: the specific login card (front, overlapping)    *
 * beside the reviewed in-session page (right, behind). Both stay       *
 * visible in the settled state, so a viewer instantly sees which login *
 * (password / Okta / SSO) AND that the page behind it is reviewed.    *
 * The gate's submit control carries an idle button that flips to a     *
 * green "Signed in ✓" pill in the settled/reduced-motion end state —  *
 * it reads as "the login you came through," not a wall still blocking. *
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
 * "Signed in ✓" pill. In the settled/reduced-motion end state the "Signed in"
 * pill is what shows, so the card reads as passed-through rather than blocking.
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
 * in-session page. Both persist in the settled state.
 *
 * In FEATURE mode the reviewed page is the right half of a split and the login
 * card overlaps its left edge. In HERO mode the reviewed page fills the window
 * edge-to-edge under a flat full-width {@link BrowserChrome}, and the login card
 * floats centered over it like a sign-in modal over the page it protects.
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
    if (hero) {
      return (
        <div
          className={`${styles.behindRoot} ${styles.behindRootHero}`}
          data-variant={variant}
        >
          <div className={styles.behindHero}>
            <InnerPage address={address} hero />
            <div className={`${styles.gateCard} ${styles.gateCardFloat}`}>{children}</div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.behindRoot} data-variant={variant}>
        <div className={styles.behindSplit}>
          <div className={styles.behindPage}>
            <InnerPage address={address} />
          </div>
          <div className={styles.gateCard}>{children}</div>
        </div>
        <p className={styles.sceneCaption}>{caption}</p>
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
          {/* Pinned comment (shared dialog) */}
          <ReviewComment
            className={styles.portalReview}
            author={CLIENT_REVIEW_AUTHOR}
            timeAgo={CLIENT_REVIEW_TIME}
            avatarInitial={CLIENT_REVIEW_INITIAL}
            bodyText={CLIENT_REVIEW_BODY}
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
 * `on-site-snippet` scene — a snippet card (one-line install) connected by a
 * dashed arrow to an in-session reviewed page card with a green badge, contrasted
 * with a greyed proxy-tool error card that bleeds off the right edge in feature
 * mode. Conveys that Superflow is on the site, not a proxy.
 *
 * @returns The on-site-snippet scene, or `null` on failure.
 */
function OnSiteSnippetScene(): ReactNode {
  try {
    return (
      <div className={styles.snippetRoot}>
        {/* Left: the snippet install card */}
        <div className={styles.snippetCard} style={delayStyle(80)}>
          <span className={styles.snippetHeading}>{SNIPPET_HEADING}</span>
          <div className={styles.snippetCodeBox}>
            <Glyph name="code" size={14} className={styles.snippetCodeIcon} />
            <code className={styles.snippetCode}>{SNIPPET_CODE}</code>
          </div>
          <p className={styles.snippetNote}>{SNIPPET_NOTE}</p>
          <span className={styles.snippetDone}>
            <Glyph name="check" size={13} />
            {SNIPPET_DONE}
          </span>
        </div>

        {/* Dashed connector arrow */}
        <span className={styles.snippetConnector} aria-hidden="true">
          <span className={styles.snippetConnLine} />
          <Glyph name="arrowRight" size={16} className={styles.snippetConnArrow} />
        </span>

        {/* Centre: the in-session page card */}
        <div className={styles.sessionCard} style={delayStyle(280)}>
          <BrowserChrome address={ADDRESS_ACME} showActions={false} compactAddress />
          <div className={styles.sessionBody}>
            <div className={styles.sessionHero} />
            <div className={styles.sessionLine} />
            <div className={`${styles.sessionLine} ${styles.sessionLineShort}`} />
            {/* Pinned comment (shared dialog, scaled to fit the compact card) */}
            <ReviewComment
              className={styles.sessionReview}
              author={REVIEW_AUTHOR}
              timeAgo={REVIEW_TIME}
              avatarInitial={REVIEW_INITIAL}
              bodyText={REVIEW_BODY}
              pinSize={20}
            />
          </div>
          <span className={styles.sessionBadge}>
            <span className={styles.sessionBadgeDot} aria-hidden="true" />
            {SESSION_BADGE}
          </span>
        </div>

        {/* Right: proxy error card (left portion peeks into view in feature mode) */}
        <div className={styles.proxyCard} style={delayStyle(0)}>
          <span className={styles.proxyHeading}>
            <Glyph name="lock" size={13} />
            {PROXY_HEADING}
          </span>
          <div className={styles.proxyErrorBox}>
            <Glyph name="xCircle" size={16} className={styles.proxyErrorIcon} />
            <span className={styles.proxyErrorText}>{PROXY_ERROR}</span>
          </div>
          <span className={styles.proxySub}>{PROXY_SUB}</span>
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
