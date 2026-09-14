"use client";

import Link from "next/link";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "./AgencyDetail.module.css";

const LABEL = "Request intro";

/**
 * The profile page's primary action: open the match form with this
 * agency pinned.
 *
 * "Request intro" rather than "Contact agency", and it goes to the match
 * form rather than to a mailto. The agency's own contact address is
 * deliberately never published (see `AgencyClaim.contactEmail`), and a
 * founder emailing cold gets a slower answer than a brief that arrives
 * with a budget and a timeline already attached. The form also reaches
 * two more agencies, which is the point of the directory.
 *
 * A client component ONLY because it reports a click. The link works
 * without JavaScript and without this file - it is a plain `<Link>` with
 * an href - so a failed hydration costs the analytics event and nothing
 * else.
 *
 * @param props - Component props.
 * @param props.slug - The agency to pin as one of the three.
 * @param props.name - Its name, for the event payload.
 * @param props.categorySlug - Prefills the match form's category.
 */
export default function RequestIntroButton({
  slug,
  name,
  categorySlug,
}: {
  slug: string;
  name: string;
  categorySlug: string;
}) {
  const { trackEvent } = useAnalytics();

  try {
    const params = new URLSearchParams({ agency: slug });
    if (categorySlug) params.set("category", categorySlug);

    return (
      <Link
        href={`${DIRECTORY_BASE_PATH}/match?${params.toString()}`}
        className={styles.introCta}
        onClick={() => {
          try {
            trackEvent(AnalyticsEvents.REQUEST_INTRO_CLICKED, { slug, name, category: categorySlug });
          } catch {
            // Never block the navigation on a tracking failure.
          }
        }}
      >
        {LABEL}
      </Link>
    );
  } catch {
    return null;
  }
}
