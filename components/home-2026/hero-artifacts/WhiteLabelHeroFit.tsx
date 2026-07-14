import type { ReactNode } from "react";
import WhiteLabelArtifact from "../feature-artifacts/WhiteLabelArtifact";

/**
 * Hero-window fit wrappers for the White-label feature page hero tabs.
 *
 * Each reuses the same variant-driven {@link WhiteLabelArtifact} the feature
 * section renders (single source of truth), passing its `hero` prop so the
 * scene is centred and trimmed for the fully-visible hero product window. The
 * three hero tabs map to the page's lead beats: the client's view (the branded
 * review toolbar), the admin panel (the branded portal navbar) and the one
 * upload that carries the brand everywhere (the Custom Branding settings panel).
 *
 * These are registered under a page-scoped key rather than the global
 * `HERO_ARTIFACTS` map because the white-label "The client's view" tab slugifies
 * to the same id as the private-comments "The client's view" tab; the scope
 * disambiguates the two without touching either page's CMS labels.
 */

/**
 * Hero "The client's view" tab — the reviewed live site carrying the floating
 * review toolbar, its logo slot now the agency's brand.
 *
 * @returns The branded-toolbar hero scene, or `null` on failure.
 */
export function HeroWhiteLabelToolbarArtifact(): ReactNode {
  try {
    return <WhiteLabelArtifact hero variant="toolbar" />;
  } catch {
    return null;
  }
}

/**
 * Hero "The admin panel" tab — the admin portal navbar carrying the agency
 * wordmark, beside a faint main panel also under the agency brand.
 *
 * @returns The branded-portal hero scene, or `null` on failure.
 */
export function HeroWhiteLabelPortalArtifact(): ReactNode {
  try {
    return <WhiteLabelArtifact hero variant="portal" />;
  } catch {
    return null;
  }
}

/**
 * Hero "One upload" tab — the Custom Branding settings panel: the Toolbar and
 * Admin Portal upload rows the single logo file replaces.
 *
 * @returns The settings-panel hero scene, or `null` on failure.
 */
export function HeroWhiteLabelSettingsArtifact(): ReactNode {
  try {
    return <WhiteLabelArtifact hero variant="settings" />;
  } catch {
    return null;
  }
}
