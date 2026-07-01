"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { analytics } from "./analytics-service";

const LOG_PREFIX = "[usePageView]";

/**
 * Auto-tracks an Amplitude page view on every App Router navigation,
 * including the first load. This fires on the initial render too because
 * Amplitude autocapture `pageViews` is disabled (see amplitude-client.ts),
 * so nothing else records the entry page.
 *
 * Must be called from a component mounted inside a `<Suspense>` boundary,
 * since `useSearchParams()` opts its subtree into dynamic rendering.
 *
 * @returns Nothing; runs its tracking as a side effect.
 */
export function usePageView(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const query = searchParams?.toString() ?? "";
      analytics.trackPage(pathname, { search: query ? `?${query}` : "" });
    } catch (error) {
      console.error(`${LOG_PREFIX} trackPage failed:`, error);
    }
  }, [pathname, searchParams]);
}
