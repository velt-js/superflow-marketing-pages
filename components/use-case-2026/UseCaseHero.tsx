import styles from "./UseCaseHero.module.css";
import type { UseCaseDoc } from "@/lib/use-case-types";
import { SIGNUP_URL } from "@/lib/use-case-types";

/** Fallback CTA label when the doc omits `hero.heroCtaText`. */
const DEFAULT_CTA_TEXT = "Try Superflow for Free";

/**
 * Build the "Built for ..." role chips from the doc's hero.role1-3 fields,
 * dropping any that are missing.
 *
 * @param hero - The use-case doc's hero object.
 * @returns The non-empty role labels, in order.
 */
function getRoles(hero: UseCaseDoc["hero"]): string[] {
  try {
    return [hero?.role1, hero?.role2, hero?.role3].filter(
      (role): role is string => Boolean(role),
    );
  } catch {
    return [];
  }
}

/**
 * 2026-style use-case detail hero: the blue-gradient bitmap background and
 * white Adamina-serif headline shared with the homepage/feature-page heroes,
 * rebuilt locally (rather than reusing `components/home-2026/Hero`) because
 * that component always renders a workflow-showcase artifact that doesn't
 * suit a use-case page's copy-only content.
 *
 * @param props.doc - The resolved use-case document supplying the hero copy.
 */
export default function UseCaseHero({ doc }: { doc: UseCaseDoc }) {
  const hero = doc?.hero ?? {};
  const ctaText = hero?.heroCtaText ?? DEFAULT_CTA_TEXT;
  const roles = getRoles(hero);

  return (
    <section className={styles.hero} data-section="use-case-hero">
      <div className={styles.inner}>
        {hero?.useCase ? <p className={styles.kicker}>{hero.useCase}</p> : null}
        <h1 className={styles.headline}>{doc?.title}</h1>
        {doc?.description ? (
          <p className={styles.subhead}>{doc.description}</p>
        ) : null}
        {roles.length > 0 ? (
          <ul className={styles.roles}>
            {roles.map((role) => (
              <li key={role} className={styles.roleChip}>
                {role}
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.ctaRow}>
          <a
            className={styles.cta}
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
