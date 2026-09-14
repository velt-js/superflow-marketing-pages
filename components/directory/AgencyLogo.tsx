import Image from "next/image";

import { agencyInitials, monogramHue, resolveAgencyLogo } from "@/lib/directory/logos";
import styles from "./AgencyLogo.module.css";

/**
 * Lightness of the monogram tile's background, as an HSL percentage.
 *
 * High enough that dark text on it clears WCAG AA at every hue, which a
 * mid-lightness tile does not - the same saturation at 50% lightness
 * fails on yellow and green while passing on blue, so a per-hue tile
 * would have been readable for some agencies and not others.
 */
const MONOGRAM_BACKGROUND_LIGHTNESS = 92;

/** Saturation of both the tile and its text. Muted: this sits in a grid
 *  of 60 cards and a saturated tile would read as a warning. */
const MONOGRAM_SATURATION = 46;

/** Lightness of the monogram text, dark enough to carry the contrast. */
const MONOGRAM_TEXT_LIGHTNESS = 32;

/**
 * An agency's logo, or a monogram tile when there is no usable image.
 *
 * The monogram is not a placeholder. Roughly a fifth of the directory has
 * no square mark anywhere on its own site (and D&AD publishes none at
 * all), so this is the permanent, intended rendering for those records -
 * initials on a hue derived from the slug, stable across pages and
 * deploys, so a studio without a logo still looks like itself in a grid
 * rather than like a failed image load.
 *
 * Images are NOT run through next/image when they are hotlinked from a
 * source CDN and merely `unoptimized` otherwise: cached logos live on our
 * own origin and optimise normally, and the source avatars are already
 * covered by the `remotePatterns` entries in next.config.ts. A host with
 * no entry would render blank, which is why `resolveAgencyLogo` prefers
 * the local copy whenever one exists.
 *
 * @param props - Component props.
 * @param props.slug - The agency's slug; keys the logo cache and the
 *                      monogram hue.
 * @param props.name - Display name, for the monogram initials.
 * @param props.sourceLogoUrl - The source directory's avatar URL, or null.
 * @param props.claimLogoUrl - A logo set on the claim overlay, if any.
 * @param props.size - Rendered edge in CSS pixels.
 * @param props.className - Extra class on the wrapper, for per-surface
 *                           framing (the profile hero's white chip).
 */
export default function AgencyLogo({
  slug,
  name,
  sourceLogoUrl,
  claimLogoUrl,
  size = 44,
  className,
}: {
  slug: string;
  name: string;
  sourceLogoUrl?: string | null;
  claimLogoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  try {
    const logo = resolveAgencyLogo(slug, sourceLogoUrl, claimLogoUrl);
    const wrapperClass = className ? `${styles.tile} ${className}` : styles.tile;

    if (logo) {
      return (
        <span
          className={wrapperClass}
          style={{ width: size, height: size }}
          data-logo={logo.local ? "cached" : "source"}
        >
          <Image
            className={styles.image}
            src={logo.src}
            // Decorative: the agency name is already rendered next to it
            // as text, and a second copy read out by a screen reader is
            // noise rather than information.
            alt=""
            width={size}
            height={size}
            sizes={`${size}px`}
          />
        </span>
      );
    }

    const hue = monogramHue(slug);
    return (
      <span
        className={`${wrapperClass} ${styles.monogram}`}
        style={{
          width: size,
          height: size,
          background: `hsl(${hue} ${MONOGRAM_SATURATION}% ${MONOGRAM_BACKGROUND_LIGHTNESS}%)`,
          color: `hsl(${hue} ${MONOGRAM_SATURATION}% ${MONOGRAM_TEXT_LIGHTNESS}%)`,
          fontSize: Math.round(size * 0.4),
        }}
        data-logo="monogram"
        aria-hidden="true"
      >
        {agencyInitials(name)}
      </span>
    );
  } catch {
    return null;
  }
}
