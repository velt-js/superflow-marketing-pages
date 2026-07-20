import Image from "next/image";
import styles from "./PersonaIconChip.module.css";

/** Square pixel size used for the glyph inside the chip (roughly half the chip). */
const GLYPH_SIZE_RATIO = 0.5;
/** Font-size ratio used for the single-letter fallback glyph. */
const LETTER_SIZE_RATIO = 0.32;

/** Props for {@link PersonaIconChip}. */
export interface PersonaIconChipProps {
  /** Sibling persona icon URL (a light/white-stroke SVG meant for dark backgrounds). */
  src?: string;
  /** Persona label, used for the single-letter fallback and no other purpose. */
  name: string;
  /** Chip diameter in pixels. */
  size?: number;
}

/**
 * Dark circular chip that keeps a sibling persona's light/white-stroke icon
 * visible when it sits on a light 2026 card. Falls back to the persona's
 * first initial when no icon is supplied.
 *
 * @param props - The icon source, accessible label and chip size.
 */
export default function PersonaIconChip({
  src,
  name,
  size = 48,
}: PersonaIconChipProps) {
  try {
    if (!src) {
      return (
        <span
          className={styles.chip}
          style={{ width: size, height: size, fontSize: Math.round(size * LETTER_SIZE_RATIO) }}
        >
          {name?.slice(0, 1) ?? "?"}
        </span>
      );
    }

    const glyphSize = Math.round(size * GLYPH_SIZE_RATIO);
    return (
      <span className={styles.chip} style={{ width: size, height: size }}>
        <Image
          className={styles.glyph}
          src={src}
          alt=""
          width={glyphSize}
          height={glyphSize}
        />
      </span>
    );
  } catch {
    return null;
  }
}
