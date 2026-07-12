"use client";

// Fires a pageview to GTM (dataLayer push) and Mixpanel on every client-
// side route change. The third-party snippets in ThirdPartyScripts.tsx
// only capture the INITIAL page load — without this hook, every Next.js
// SPA navigation would silently drop the pageview.
//
// The first effect run is skipped (via a ref) because:
//   - GTM's gtm.js init already pushes the initial container-load event.
//   - Mixpanel's `track_pageview: "full-url"` in init auto-fires the
//     first pageview on full-document load.
// Firing again on mount would double-count.
//
// Must be mounted inside a <Suspense> boundary — useSearchParams() opts
// its tree into dynamic rendering otherwise.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type DataLayerEntry = Record<string, unknown>;
type MixpanelFn = (...args: unknown[]) => void;
type MixpanelClient = {
  track_pageview?: MixpanelFn;
  /** Set to true by Mixpanel only once the real library has loaded (not the stub). */
  __loaded?: boolean;
  /** Present on the real library but not the pre-load stub — a clean "ready" signal. */
  get_distinct_id?: MixpanelFn;
};
type WindowWithAnalytics = Window & {
  dataLayer?: DataLayerEntry[];
  mixpanel?: MixpanelClient;
};

export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipNextRun = useRef(true);

  useEffect(() => {
    if (skipNextRun.current) {
      skipNextRun.current = false;
      return;
    }

    try {
      const query = searchParams?.toString() ?? "";
      const pagePath = query ? `${pathname}?${query}` : pathname;
      const pageLocation =
        typeof window !== "undefined" ? window.location.href : pagePath;
      const pageTitle =
        typeof document !== "undefined" ? document.title : undefined;

      const w = window as WindowWithAnalytics;

      // GTM — push a page_view event so any container tag listening for
      // it (GA4 config, Ads conversions, etc.) fires on SPA navigations.
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: "page_view",
          page_path: pagePath,
          page_location: pageLocation,
          page_title: pageTitle,
        });
      }

      // Mixpanel — manual pageview track for SPA route changes. The init
      // option `track_pageview: "full-url"` only fires on hard loads.
      //
      // Guard against the pre-load stub: it defines `track_pageview` as a
      // function too (so a `typeof` check alone passes), but invoking it before
      // the real lib loads throws internally ("a.push is not a function"). Only
      // call once the real library is loaded — `__loaded`/`get_distinct_id` are
      // present on the real lib but not the stub.
      const mp = w.mixpanel;
      const mixpanelLoaded =
        mp?.__loaded === true || typeof mp?.get_distinct_id === "function";
      if (mixpanelLoaded && typeof mp?.track_pageview === "function") {
        mp.track_pageview();
      }
    } catch (err) {
      console.error("Pageview tracking failed:", err);
    }
  }, [pathname, searchParams]);

  return null;
}
