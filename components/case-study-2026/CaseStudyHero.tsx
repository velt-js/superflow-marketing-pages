import { Fragment } from "react";
import Image from "next/image";
import type { CaseStudyHeroData } from "@/lib/case-study-data";
import styles from "./CaseStudyHero.module.css";

/** Mono kicker shown above the headline. */
const KICKER_TEXT = "Customer Story";
/** Pixel size the company logo renders at inside its white chip. */
const LOGO_SIZE = 44;

/** Props for {@link CaseStudyHero}. */
export interface CaseStudyHeroProps {
  /** The case study's hero copy + meta facts (same shape the old dark hero
      consumed, so `app/case-study/[slug]/page.tsx` needs no re-mapping). */
  hero: CaseStudyHeroData;
  /** Optional company logo URL, shown in a white chip above the headline. */
  logo?: string;
}

/**
 * One labelled fact inside the hero's white meta card (e.g. "Industry —
 * SaaS").
 *
 * @param props.label - Uppercase mono label.
 * @param props.value - The fact itself, in semibold ink.
 */
function CaseStudyHeroMetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  try {
    return (
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>{label}</span>
        <span className={styles.metaValue}>{value}</span>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * 2026-style case-study detail hero: the shared blue-gradient bitmap and
 * white Adamina serif headline (see `components/use-case-2026/UseCaseHero`),
 * led by the customer's logo chip and closed by a white meta card (industry /
 * teams involved / company size) riding the fade into the white page. Light
 * replacement for the old dark `components/case-study/CaseStudyHero`.
 *
 * @param props.hero - Hero copy and meta facts.
 * @param props.logo - Optional company logo URL.
 */
export default function CaseStudyHero({ hero, logo }: CaseStudyHeroProps) {
  try {
    const meta = hero?.meta;
    const metaEntries = [
      { label: "Industry", value: meta?.industry },
      { label: "Teams involved", value: meta?.teamsInvolved },
      { label: "Company size", value: meta?.companySize },
    ].filter((entry) => Boolean(entry.value));

    return (
      <section className={styles.hero} data-section="case-study-hero">
        <div className={styles.inner}>
          {logo ? (
            <span className={styles.logoChip}>
              <Image
                className={styles.logoImage}
                src={logo}
                alt=""
                width={LOGO_SIZE}
                height={LOGO_SIZE}
              />
            </span>
          ) : null}
          <p className={styles.kicker}>{KICKER_TEXT}</p>
          <h1 className={styles.headline}>{hero?.heading}</h1>
          {hero?.subtitle ? (
            <p className={styles.subhead}>{hero.subtitle}</p>
          ) : null}
          {metaEntries.length > 0 ? (
            <div className={styles.metaCard}>
              {metaEntries.map((entry, index) => (
                <Fragment key={entry.label}>
                  {index > 0 ? (
                    <span className={styles.metaDivider} aria-hidden="true" />
                  ) : null}
                  <CaseStudyHeroMetaItem
                    label={entry.label}
                    value={entry.value ?? ""}
                  />
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
