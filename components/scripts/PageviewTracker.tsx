"use client";

// Fires a pageview to GTM (dataLayer push) and GA4 (gtag) on every client-
// side route change. The third-party snippets in ThirdPartyScripts.tsx
// only capture the INITIAL page load — without this hook, every Next.js
// SPA navigation would silently drop the pageview.
//
// The first effect run is skipped (via a ref) because:
//   - GTM's gtm.js init already pushes the initial container-load event.
//   - gtag's `config` call auto-fires the first page_view on full-document
//     load.
// Firing again on mount would double-count.
//
// Must be mounted inside a <Suspense> boundary — useSearchParams() opts
// its tree into dynamic rendering otherwise.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Standalone GA4 measurement ID (installed via gtag.js in
// ThirdPartyScripts.tsx). Kept in sync with GA_MEASUREMENT_ID there.
const GA_MEASUREMENT_ID = "G-HFXRYF6WF8";

type DataLayerEntry = Record<string, unknown>;
type GtagFn = (...args: unknown[]) => void;
type WindowWithAnalytics = Window & {
  dataLayer?: DataLayerEntry[];
  gtag?: GtagFn;
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

      // GA4 (gtag.js) — standalone property installed directly (not via
      // GTM), so it does not react to the dataLayer push above. Fire an
      // explicit page_view on SPA navigations; gtag's initial config call
      // in ThirdPartyScripts.tsx only covers the first hard load.
      if (typeof w.gtag === "function") {
        w.gtag("event", "page_view", {
          page_path: pagePath,
          page_location: pageLocation,
          page_title: pageTitle,
        });
      }
    } catch (err) {
      console.error("Pageview tracking failed:", err);
    }
  }, [pathname, searchParams]);

  return null;
}
