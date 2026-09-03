import Link from "next/link";
import type { ReactNode } from "react";
import { isExternalHref, toInternalHref } from "@/lib/links";
import type { SolutionResellSection } from "@/lib/solutions/types";
import styles from "./ResellSection.module.css";

const HEADING_ID = "solution-resell-heading";
/** Where the CTA goes when the page data leaves the href empty. */
const FALLBACK_CTA_HREF = "/book-demo";
const FALLBACK_CTA_LABEL = "Book demo";
/** Matches a dollar figure. The reseller program shows none on the page (spec 4.5). */
const DOLLAR_FIGURE = /\$\s?\d/;

/** Props for {@link ResellSection}. */
export interface ResellSectionProps {
  /** The page's optional "Resell it." section. */
  resell?: SolutionResellSection | null;
}

/** What the section renders, prepared from the page data. */
interface ResellView {
  heading: string;
  lines: string[];
  ctaLabel: string;
  href: string;
  isExternal: boolean;
}

/**
 * Prepare the resell section: drop empty lines and any line carrying a dollar
 * figure (the reseller program is priced on a call), and resolve the CTA.
 *
 * @param resell - The page's resell data.
 * @returns The view, or null when there is nothing to show.
 */
function toResellView(
  resell: SolutionResellSection | null | undefined,
): ResellView | null {
  try {
    if (!resell?.heading) {
      return null;
    }
    const lines = (resell.lines ?? []).filter(
      (line): line is string =>
        typeof line === "string" &&
        line.trim().length > 0 &&
        !DOLLAR_FIGURE.test(line),
    );
    if (lines.length === 0) {
      return null;
    }
    const rawHref = resell.ctaHref || FALLBACK_CTA_HREF;
    return {
      heading: resell.heading,
      lines,
      ctaLabel: resell.ctaLabel || FALLBACK_CTA_LABEL,
      href: toInternalHref(rawHref) ?? FALLBACK_CTA_HREF,
      isExternal: isExternalHref(rawHref),
    };
  } catch {
    return null;
  }
}

/**
 * S3b, "Resell it." (site care only in batch 1): the heading, the lines and a
 * CTA. Renders nothing when the page has no resell section.
 *
 * @param props - The page's resell data.
 * @returns The section, or null.
 */
export default function ResellSection({ resell }: ResellSectionProps): ReactNode {
  const view = toResellView(resell);
  if (!view) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-section="solution-resell"
      aria-labelledby={HEADING_ID}
    >
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <h2 id={HEADING_ID} className={styles.heading}>
              {view.heading}
            </h2>
            <ul className={styles.lines}>
              {view.lines.map((line, index) => (
                <li key={`resell-${index}`} className={styles.line}>
                  <span className={styles.lineIndex} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className={styles.lineText}>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.action}>
            {view.isExternal ? (
              <a
                className={styles.cta}
                href={view.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {view.ctaLabel}
              </a>
            ) : (
              <Link className={styles.cta} href={view.href}>
                {view.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
