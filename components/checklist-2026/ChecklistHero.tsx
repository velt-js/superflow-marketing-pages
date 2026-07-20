import CategoryGlyph from "@/components/shared-2026/CategoryGlyph";
import { toInternalHref } from "@/lib/links";
import type { ChecklistDoc } from "@/lib/checklist-types";
import styles from "./ChecklistHero.module.css";

/** Fallback CTA destination when the doc omits `hero.primaryCtaLink`. */
const SIGNUP_FALLBACK = "https://app.usesuperflow.com/signup";
/** Fallback CTA label when the doc omits `hero.primaryCtaText`. */
const DEFAULT_CTA_TEXT = "Get Google Doc";
/** Widths (in %) of the decorative skeleton lines inside the doc card. */
const SKELETON_LINE_WIDTHS = [88, 72, 84, 64, 78] as const;

/**
 * 2026-style checklist detail hero: the blue-gradient bitmap background and
 * white Adamina-serif headline shared with the use-case/persona heroes, with
 * the checklist's doc-download CTA presented as a light floating card over
 * the hero's white fade (replacing the old dark CTA card).
 *
 * @param props.doc - The resolved `checklistPage` Sanity document.
 * @returns The hero section, or `null` on failure.
 */
export default function ChecklistHero({ doc }: { doc: ChecklistDoc }) {
  try {
    const hero = doc?.hero ?? {};
    const ctaText = hero?.primaryCtaText || DEFAULT_CTA_TEXT;
    const ctaHref = toInternalHref(hero?.primaryCtaLink) ?? SIGNUP_FALLBACK;
    const docName = hero?.docName || doc?.title;

    return (
      <section className={styles.hero} data-section="checklist-hero">
        <div className={styles.inner}>
          <p className={styles.kicker}>Checklist</p>
          <h1 className={styles.headline}>{doc?.title}</h1>
          {doc?.description ? (
            <p className={styles.subhead}>{doc.description}</p>
          ) : null}

          <div className={styles.docCard}>
            <div className={styles.docCardRow}>
              <div className={styles.docCardMeta}>
                <span className={styles.docCardGlyph} aria-hidden="true">
                  <CategoryGlyph label="checklist" size={30} />
                </span>
                <div>
                  <p className={styles.docCardName}>{docName}</p>
                  <p className={styles.docCardByline}>by Superflow Team</p>
                </div>
              </div>
              <a
                className={styles.docCardCta}
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaText}
              </a>
            </div>
            <div className={styles.docCardLines} aria-hidden="true">
              {SKELETON_LINE_WIDTHS.map((lineWidth) => (
                <span
                  key={lineWidth}
                  className={styles.docCardLine}
                  style={{ width: `${lineWidth}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
