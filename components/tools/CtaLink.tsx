"use client";

import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { signupUrlFor } from "@/lib/tools/registry";
import styles from "./Tools.module.css";

/**
 * The single contextual CTA a tool result section is allowed.
 *
 * Renders as a plain link, never a modal, and never blocks the result. The
 * href carries the tool's UTM campaign so signups attribute back to the tool
 * that produced them.
 *
 * @param props - The tool slug, link text, and where in the page it sits.
 */
export function CtaLink({
  slug,
  children,
  placement,
  variant = "text",
}: {
  slug: string;
  children: React.ReactNode;
  /** Where on the page this CTA lives, sent as an analytics property. */
  placement: string;
  variant?: "text" | "button";
}) {
  const { trackEvent } = useAnalytics();

  /** Records the click before the browser navigates away. */
  function handleClick() {
    try {
      trackEvent(AnalyticsEvents.CTA_CLICK, { tool: slug, placement });
    } catch {
      // Never let analytics block a navigation.
    }
  }

  return (
    <a
      href={signupUrlFor(slug)}
      onClick={handleClick}
      className={variant === "button" ? styles.primaryButton : undefined}
      rel="noopener"
    >
      {children}
    </a>
  );
}
