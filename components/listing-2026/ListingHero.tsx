import styles from "./ListingHero.module.css";
import { toInternalHref } from "@/lib/links";

/** Default CTA copy for the listing hero, matching the pre-2026 listing pages. */
const DEFAULT_CTA_TEXT = "Try Superflow for Free";
/** Default CTA destination — Superflow's signup app. */
const DEFAULT_CTA_HREF = "https://app.usesuperflow.com/signup";

/**
 * Props for {@link ListingHero}. Deliberately a subset of the legacy
 * `ListingHeroProps` (heading/subheading/ctaText/ctaHref) so callers that
 * spread a `ListingPageConfig["hero"]` value (see `lib/listing-data.ts`)
 * keep working without changes — the extra legacy fields (`leftBadge`,
 * `rightBadge`, `showLogoBar`) are simply ignored by this component.
 */
export interface ListingHeroProps {
  /** Serif headline shown on the gradient hero. */
  heading: string;
  /** Supporting copy shown under the headline. */
  subheading: string;
  /** CTA button label; defaults to {@link DEFAULT_CTA_TEXT}. */
  ctaText?: string;
  /** CTA button destination; defaults to {@link DEFAULT_CTA_HREF}. */
  ctaHref?: string;
  /** Hides the CTA button — used by pages whose primary action sits right
      below the hero (e.g. /pricing tier cards, /book-demo calendar). */
  hideCta?: boolean;
}

/**
 * Compact 2026-style hero for the `/use-case` and `/user-persona` listing
 * pages. Mirrors the homepage hero's blue gradient bitmap, white Adamina
 * serif headline and Urbanist/Poppins copy, but sized for a short, centered
 * section instead of the tall homepage composition.
 *
 * The gradient bitmap is cropped to a shorter `background-size` than the
 * homepage hero (which stretches it across ~1150px), so a soft white
 * `::after` fade is layered over the section's lower edge to guarantee a
 * smooth transition into the white grid section below — regardless of
 * exactly where the crop lands on the bitmap's own built-in glow.
 *
 * @param props - Headline, subheading and optional CTA overrides.
 */
export default function ListingHero({
  heading,
  subheading,
  ctaText,
  ctaHref,
  hideCta,
}: ListingHeroProps) {
  const resolvedCtaText = ctaText ?? DEFAULT_CTA_TEXT;
  const resolvedCtaHref = ctaHref ?? DEFAULT_CTA_HREF;

  return (
    <section className={styles.hero} data-section="listing-hero">
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.inner}>
        <h1 className={styles.headline}>{heading}</h1>
        <p className={styles.subhead}>{subheading}</p>
        {hideCta ? null : (
          <a className={styles.cta} href={toInternalHref(resolvedCtaHref) ?? "#"}>
            {resolvedCtaText}
          </a>
        )}
      </div>
    </section>
  );
}
