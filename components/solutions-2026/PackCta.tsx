"use client";

import type { ReactNode } from "react";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./PackSection.module.css";

/** Query parameter onboarding reads to preselect the pack (spec section 6). */
const PACK_QUERY_KEY = "pack";

/** Props for {@link PackCta}. */
export interface PackCtaProps {
  /** Pack display name, e.g. "Dental Launch Pack". */
  packName: string;
  /** Pack slug, e.g. "dental-launch". Sent as `?pack=` and as the event's `pack`. */
  packSlug: string;
}

/**
 * The pack CTA under the grid: "Add the {pack} to your workspace". Links to
 * signup with `?pack=<slug>` and fires `pack_cta_clicked { pack }`.
 *
 * @param props - The pack name and slug.
 * @returns The CTA row.
 */
export default function PackCta({ packName, packSlug }: PackCtaProps): ReactNode {
  const { trackEvent } = useAnalytics();
  const href = `${SIGNUP_URL}?${PACK_QUERY_KEY}=${encodeURIComponent(packSlug ?? "")}`;

  /** Report the click before the browser follows the link. */
  function handleClick() {
    try {
      trackEvent(AnalyticsEvents.PACK_CTA_CLICKED, { pack: packSlug });
    } catch {
      // Analytics must never block the navigation.
    }
  }

  return (
    <div className={styles.ctaRow}>
      <a
        className={styles.cta}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {`Add the ${packName} to your workspace`}
      </a>
    </div>
  );
}
