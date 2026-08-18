"use client";

import { usePathname } from "next/navigation";
import ProductHuntBadge from "./ProductHuntBadge";

/**
 * Route prefixes that must never show the floating badge. Neither is a
 * marketing surface: `/studio` is the Sanity CMS admin UI (its layout is a
 * pass-through, so it otherwise inherits everything mounted in the root
 * layout), and `/preview` holds the internal artifact preview pages used to
 * eyeball components in isolation.
 */
const HIDDEN_PATH_PREFIXES = ["/studio", "/preview"] as const;

/**
 * Reports whether the floating badge should be suppressed for a route.
 *
 * @param pathname - The current pathname, as returned by `usePathname`.
 * @returns `true` when the route is on the suppression list.
 */
function isBadgeHiddenForPath(pathname?: string | null): boolean {
  try {
    if (!pathname) return false;

    return HIDDEN_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  } catch (err) {
    // Defensive: on any parsing failure, show the badge rather than crash.
    console.error("ProductHuntFloatingBadge path check failed:", err);
    return false;
  }
}

/**
 * Mounts the floating Product Hunt badge sitewide from the root layout,
 * excluding the admin and preview routes. Client-only because the decision
 * depends on the active pathname; the badge markup itself is static.
 *
 * @returns The floating badge, or `null` on a suppressed route.
 */
export default function ProductHuntFloatingBadge() {
  const pathname = usePathname();

  if (isBadgeHiddenForPath(pathname)) return null;

  return <ProductHuntBadge variant="floating" />;
}
