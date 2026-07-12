import type { ReactNode } from "react";
import AuthenticatedPagesArtifact from "../feature-artifacts/AuthenticatedPagesArtifact";

/**
 * Hero-window fit wrappers for the Authenticated Pages feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link AuthenticatedPagesArtifact} the
 * feature section renders (single source of truth), passing its `hero` prop so
 * the composition is re-centred and enlarged for the fully-visible hero product
 * window. The four hero tabs walk the page's lead beats: review behind a
 * password, behind Okta, behind SSO/SAML, and the client reviewing from inside
 * their own portal (no Superflow account).
 *
 * These are registered under the page-scoped `authenticated-pages` key rather
 * than the global `HERO_ARTIFACTS` map because the labels slugify to generic ids
 * (e.g. "behind-a-password") that other pages could also claim; the scope keeps
 * them bound to this page without touching its CMS labels.
 */

/**
 * Hero "Behind a password" tab — a password gate types itself in and lifts to
 * reveal the reviewed page running inside the viewer's own session.
 *
 * @returns The behind-password hero scene, or `null` on failure.
 */
export function HeroAuthBehindPasswordArtifact(): ReactNode {
  try {
    return <AuthenticatedPagesArtifact hero variant="behind-password" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Behind Okta" tab — an Okta sign-in card the viewer is already logged in
 * through, lifting to reveal the reviewed in-session page.
 *
 * @returns The behind-okta hero scene, or `null` on failure.
 */
export function HeroAuthBehindOktaArtifact(): ReactNode {
  try {
    return <AuthenticatedPagesArtifact hero variant="behind-okta" />;
  } catch {
    return null;
  }
}

/**
 * Hero "Behind SSO" tab — a single sign-on / SAML gate that lifts to reveal the
 * reviewed in-session page.
 *
 * @returns The behind-sso hero scene, or `null` on failure.
 */
export function HeroAuthBehindSsoArtifact(): ReactNode {
  try {
    return <AuthenticatedPagesArtifact hero variant="behind-sso" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The client's own portal" tab — the client reviews their gated dashboard
 * logged into their own system and approves, with no Superflow account.
 *
 * @returns The client-portal hero scene, or `null` on failure.
 */
export function HeroAuthClientPortalArtifact(): ReactNode {
  try {
    return <AuthenticatedPagesArtifact hero variant="client-portal" />;
  } catch {
    return null;
  }
}
