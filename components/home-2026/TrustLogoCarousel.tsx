import Image from "next/image";
import styles from "./TrustLogoCarousel.module.css";

/** A customer/partner logo shown in the trust strip. */
type TrustLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Real customer logos. Every source PNG is a white mark on a transparent
 * background, so the strip renders them in one muted gray (see `.logoImage`).
 * A new logo must follow the same rule, or it shows up as a colored or solid
 * block instead of a gray mark.
 */
export const TRUST_LOGOS: readonly TrustLogo[] = [
  { src: "/images/home-2026/hero/logos/cox.png", alt: "Cox Automotive", width: 74, height: 24 },
  { src: "/images/home-2026/hero/logos/stagwell.png", alt: "Stagwell", width: 139, height: 26 },
  { src: "/images/home-2026/hero/logos/gmh.png", alt: "GMH", width: 152, height: 28 },
  { src: "/images/home-2026/hero/logos/harris-poll.png", alt: "The Harris Poll", width: 150, height: 26 },
  { src: "/images/home-2026/hero/logos/finsweet.png", alt: "Finsweet", width: 75, height: 23 },
  { src: "/images/home-2026/hero/logos/gale.png", alt: "GALE", width: 96, height: 26 },
  { src: "/images/home-2026/hero/logos/uservoice.png", alt: "UserVoice", width: 127, height: 26 },
  { src: "/images/home-2026/hero/logos/redshark.png", alt: "Redshark", width: 82, height: 25 },
  { src: "/images/home-2026/hero/logos/phenyx.png", alt: "Phenyx", width: 140, height: 25 },
  { src: "/images/home-2026/hero/logos/zanger.png", alt: "Zanger", width: 85, height: 26 },
  { src: "/images/home-2026/hero/logos/children.png", alt: "Children's Defense Fund", width: 78, height: 28 },
];

/**
 * The trust logos rendered twice, back to back, so the marquee track can scroll
 * one full set and loop seamlessly (the animation translates by exactly half
 * the track). The second set is a visual clone hidden from assistive tech.
 */
const CAROUSEL_LOGOS: readonly TrustLogo[] = [...TRUST_LOGOS, ...TRUST_LOGOS];

/**
 * Single-line scrolling strip of customer logos. Shared by the homepage hero
 * and the `/case-study` customers page so both always show the same set.
 */
export default function TrustLogoCarousel() {
  return (
    <div className={styles.logoCarousel}>
      <div className={styles.logoTrack}>
        {CAROUSEL_LOGOS.map((logo, index) => {
          const isClone = index >= TRUST_LOGOS.length;
          return (
            <span
              key={`${logo?.src}-${index}`}
              className={styles.logoItem}
              aria-hidden={isClone || undefined}
            >
              <Image
                className={styles.logoImage}
                src={logo?.src}
                alt={isClone ? "" : logo?.alt}
                width={logo?.width}
                height={logo?.height}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
