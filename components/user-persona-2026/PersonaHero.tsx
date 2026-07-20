import styles from "./PersonaHero.module.css";
import type { PersonaHeroContent } from "./adapter";

/**
 * Props for {@link PersonaHero}: the resolved hero copy for one persona.
 */
export interface PersonaHeroProps {
  content: PersonaHeroContent;
}

/**
 * Compact 2026-style hero for the persona detail template. Reuses the
 * homepage hero's blue-gradient bitmap and type tokens
 * (`components/home-2026/Hero.module.css`) but renders a single centered
 * column sized for a short section — no showcase artifact, since persona
 * data has no natural product-window mock to show.
 *
 * @param props - The resolved hero copy (heading, subhead, CTA).
 */
export default function PersonaHero({ content }: PersonaHeroProps) {
  try {
    const eyebrow = content?.eyebrow;
    const heading = content?.heading ?? "";
    const subhead = content?.subhead;
    const ctaText = content?.ctaText;
    const ctaHref = content?.ctaHref;

    return (
      <section className={styles.hero} data-section="persona-hero">
        <div className={styles.inner}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.headline}>{heading}</h1>
          {subhead ? <p className={styles.subhead}>{subhead}</p> : null}
          {ctaText && ctaHref ? (
            <a className={styles.cta} href={ctaHref}>
              {ctaText}
            </a>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
