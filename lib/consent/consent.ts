// Consent model for the marketing site.
//
// Opt-in for every visitor, everywhere: nothing non-essential runs until the
// visitor accepts its category in the Termly banner. Termly only records the
// choice - it runs with autoBlock=off - and components/consent/ConsentScripts
// is the single gate that turns that choice into loaded (or not loaded)
// scripts. Do not add a tracker anywhere else; add it to ConsentScripts under
// the right category, or it fires before consent.
//
// Our three categories map onto Termly's fixed set:
//   Necessary  -> "essential" (always on)
//   Analytics  -> "analytics"
//   Marketing  -> "advertising"
// Termly's "performance", "social_networking" and "unclassified" switches are
// not used by anything on this site.

export type ConsentCategory = "analytics" | "marketing";
export type Grants = Record<ConsentCategory, boolean>;

export const NO_GRANTS: Grants = { analytics: false, marketing: false };

/** The subset of Termly's browser API this site uses. */
export type TermlyConsentState = Partial<Record<"essential" | "analytics" | "advertising" | "performance" | "social_networking", boolean>>;
export type TermlyApi = {
  getConsentState?: () => TermlyConsentState | null | undefined;
  on?: (event: string, cb: (payload: { consentState?: TermlyConsentState }) => void) => void;
  off?: (event: string, cb: (payload: { consentState?: TermlyConsentState }) => void) => void;
};
export type ConsentWindow = Window & {
  Termly?: TermlyApi;
  displayPreferenceModal?: () => void;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * True when the browser sends Global Privacy Control. GPC is an instruction
 * not to sell or share the visitor's data, which is what every Marketing tool
 * here does, so it keeps Marketing off whatever the banner says.
 */
export function hasGpc(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/** Turns Termly's consent state into ours, applying GPC. Missing means denied. */
export function grantsFrom(state: TermlyConsentState | null | undefined, gpc: boolean): Grants {
  return {
    analytics: state?.analytics === true,
    marketing: state?.advertising === true && !gpc,
  };
}

/** Google Consent Mode v2 signals for a set of grants. */
export function consentModeSignals(grants: Grants) {
  const marketing = grants.marketing ? "granted" : "denied";
  return {
    analytics_storage: grants.analytics ? "granted" : "denied",
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}

/**
 * First-party state each category's tools leave behind, removed when the
 * visitor withdraws that category. Patterns are matched against cookie names
 * and web-storage keys. Third-party cookies (facebook.com, linkedin.com, ...)
 * cannot be deleted from this origin; those tools simply never load again.
 */
export const CATEGORY_STORAGE: Record<ConsentCategory, RegExp[]> = {
  analytics: [
    /^_ga($|_)/, // Google Analytics 4
    /^AMP_/, // Amplitude, incl. session replay
  ],
  marketing: [
    /^_gcl_/, // Google Ads click ids
    /^_fbp$/, /^_fbc$/, /^lastExternalReferrer/, // Meta pixel
    /^_twpid$/, /^_twsid$/, // X pixel
    /^li_/, // LinkedIn Insight
    /^rewardful/, // Rewardful
    /^claydar_/, /^radar_sn_/, // Claydar
    /^__test__$/, /^reb2b/, // RB2B
  ],
};

/** Deletes the first-party cookies and storage keys a category's tools set. */
export function clearCategory(category: ConsentCategory): void {
  const patterns = CATEGORY_STORAGE[category];
  const matches = (name: string) => patterns.some((p) => p.test(name));
  try {
    const host = location.hostname;
    const parts = host.split(".");
    // Cookies may be set on the host or on any parent domain up to the
    // registrable one; expire every variant. Setting one on a public suffix
    // is silently ignored, so over-trying is harmless.
    const domains = ["", ...parts.slice(0, -1).map((_, i) => `; domain=.${parts.slice(i).join(".")}`)];
    for (const pair of document.cookie.split(";")) {
      const name = pair.split("=")[0]?.trim();
      if (!name || !matches(name)) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  } catch {
    // Cookie access can throw in sandboxed frames; nothing to clear there.
  }
  for (const store of [() => localStorage, () => sessionStorage]) {
    try {
      const s = store();
      for (const key of Object.keys(s)) if (matches(key)) s.removeItem(key);
    } catch {
      // Storage can be unavailable (private mode, blocked site data).
    }
  }
}
