import { BlogPortableText } from "@/components/blog-2026/BlogPortableText";
import { isExternalHref, toInternalHref } from "@/lib/links";
import type { ChecklistSection as Section } from "@/lib/checklist-types";
import styles from "./ChecklistSection.module.css";

/**
 * Small arrow glyph for the rail's outline CTA (Tabler arrow-up-right idiom:
 * stroke 2, round caps).
 *
 * @returns The inline SVG glyph, or `null` on failure.
 */
function ArrowGlyph() {
  try {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#433df3"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 7l-10 10" />
        <path d="M8 7l9 0l0 9" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Colourful Tabler list-check glyph for the "copy checklist" super tip.
 *
 * @returns The inline SVG glyph, or `null` on failure.
 */
function ListCheckGlyph() {
  try {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#eba113"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
        <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
        <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
        <path d="M11 6l9 0" />
        <path d="M11 12l9 0" />
        <path d="M11 18l9 0" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Colourful Tabler bookmark glyph for the "bookmark this tab" super tip.
 *
 * @returns The inline SVG glyph, or `null` on failure.
 */
function BookmarkGlyph() {
  try {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#17b26a"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-style checklist tips section: a sticky left rail (serif ink heading,
 * muted intro copy, outline CTA and "super tips") beside hairline-separated
 * checklist rows with light checkbox squares. Replaces the dark-idiom
 * `components/checklist/ChecklistSection.tsx`.
 *
 * @param props.section - One entry from the checklist doc's `sections` array.
 * @returns The section, or `null` when it has no content or on failure.
 */
export default function ChecklistSection({ section }: { section: Section }) {
  try {
    // Drop tips with no title — Sanity carries a few empty placeholders
    // (e.g. trailing entries in "Visual Content") that the live site filters
    // out. Description-only tips are never intentional.
    const tips = (section?.tips ?? []).filter((tip) => Boolean(tip?.title));
    if (!section?.title && !section?.description && tips.length === 0) {
      return null;
    }

    const ctaHref = toInternalHref(section?.buttonAction);
    const ctaIsExternal = isExternalHref(section?.buttonAction);

    return (
      <section className={styles.section} data-section="checklist-section">
        <div className={styles.inner}>
          <div className={styles.rail}>
            {section?.title ? (
              <h2 className={styles.heading}>{section.title}</h2>
            ) : null}
            {section?.description ? (
              <div className={styles.description}>
                <BlogPortableText value={section.description} />
              </div>
            ) : null}
            {section?.buttonText && ctaHref ? (
              <a
                className={styles.railCta}
                href={ctaHref}
                target={ctaIsExternal ? "_blank" : undefined}
                rel={ctaIsExternal ? "noopener noreferrer" : undefined}
              >
                {section.buttonText}
                <ArrowGlyph />
              </a>
            ) : null}

            <div className={styles.superTips}>
              <p className={styles.superTipsLabel}>Super Tips</p>
              <div className={styles.superTip}>
                <span className={styles.superTipGlyph}>
                  <ListCheckGlyph />
                </span>
                <span>Copy checklist &amp; create tasks</span>
              </div>
              <div className={styles.superTip}>
                <span className={styles.superTipGlyph}>
                  <BookmarkGlyph />
                </span>
                <span>Bookmark this tab (Ctrl+D)</span>
              </div>
            </div>
          </div>

          <div className={styles.tips}>
            {tips.map((tip, tipIndex) => (
              <div key={tipIndex} className={styles.tip}>
                <span className={styles.checkbox} aria-hidden="true" />
                <div className={styles.tipBody}>
                  {tip?.title ? (
                    <h3 className={styles.tipTitle}>{tip.title}</h3>
                  ) : null}
                  {tip?.description ? (
                    <div className={styles.tipDescription}>
                      <BlogPortableText value={tip.description} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
