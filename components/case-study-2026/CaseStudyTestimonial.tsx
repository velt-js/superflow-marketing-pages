import Image from "next/image";
import type { CaseStudyTestimonialData } from "@/lib/case-study-data";
import styles from "./CaseStudyTestimonial.module.css";

/**
 * 2026-styled case-study testimonial: one centred light card with the
 * customer's serif headline quote, muted quote body and avatar/name/role
 * footer. Replaces the old dashed-border pull quote with floating cursor
 * badges (`components/case-study/CaseStudyTestimonial`); the legacy `badges`
 * decoration has no light-theme equivalent and is intentionally dropped.
 *
 * @param props - The doc's testimonial copy (same shape the old dark section
 *   consumed).
 */
export default function CaseStudyTestimonial(props: CaseStudyTestimonialData) {
  try {
    const hasQuote = Boolean(props?.headline || props?.quote);
    if (!hasQuote) {
      return null;
    }

    return (
      <section className={styles.section} data-section="case-study-testimonial">
        <figure className={styles.card}>
          <blockquote className={styles.quoteBlock}>
            {props?.headline ? (
              <p className={styles.headline}>{`\u201C${props.headline}\u201D`}</p>
            ) : null}
            {props?.quote ? <p className={styles.quote}>{props.quote}</p> : null}
          </blockquote>
          {props?.authorName ? (
            <figcaption className={styles.author}>
              {props?.avatar ? (
                <span className={styles.avatar}>
                  <Image
                    className={styles.avatarImage}
                    src={props.avatar}
                    alt={props.authorName}
                    fill
                    sizes="48px"
                  />
                </span>
              ) : null}
              <span className={styles.authorText}>
                <span className={styles.authorName}>{props.authorName}</span>
                {props?.authorRole ? (
                  <span className={styles.authorRole}>{props.authorRole}</span>
                ) : null}
              </span>
            </figcaption>
          ) : null}
        </figure>
      </section>
    );
  } catch {
    return null;
  }
}
