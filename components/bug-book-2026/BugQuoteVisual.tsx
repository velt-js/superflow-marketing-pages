import styles from "./BugQuoteVisual.module.css";

// The card's visual. Spur's cards open with an illustrated gradient
// thumbnail; ours opens with the actual line somebody typed, set on the
// same kind of gradient. The words ARE the artwork - a generated
// illustration would be decoration, while the quote is the product.
// Gradients vary by vibe so a grid of these has rhythm without turning
// into clipart.

/** Deep purple-red washes, one per vibe, over a near-black base. */
const VIBE_GRADIENTS: Record<string, string> = {
  rage:
    "radial-gradient(120% 120% at 15% 10%, #7b1330 0%, transparent 55%), radial-gradient(120% 130% at 95% 95%, #b8341c 0%, transparent 60%)",
  sass:
    "radial-gradient(120% 120% at 12% 12%, #5b1a7a 0%, transparent 55%), radial-gradient(130% 130% at 95% 90%, #c02a6d 0%, transparent 62%)",
  comedy:
    "radial-gradient(120% 120% at 15% 8%, #3b2296 0%, transparent 55%), radial-gradient(130% 130% at 92% 95%, #9333ea 0%, transparent 60%)",
  story:
    "radial-gradient(120% 120% at 10% 12%, #2f1b6b 0%, transparent 58%), radial-gradient(130% 130% at 96% 92%, #7a1f5c 0%, transparent 60%)",
};

const FALLBACK_GRADIENT = VIBE_GRADIENTS.story;

/** Longer quotes step down a size so they still fit the panel. */
function quoteSizeClass(length: number): string {
  if (length <= 46) return styles.quoteXl;
  if (length <= 90) return styles.quoteLg;
  if (length <= 150) return styles.quoteMd;
  return styles.quoteSm;
}

export default function BugQuoteVisual({
  quote,
  vibe,
  attribution,
}: {
  quote: string;
  vibe?: string;
  /** Speaker or agent name, shown small under the quote. */
  attribution?: string;
}) {
  return (
    <div
      className={styles.panel}
      style={{ backgroundImage: VIBE_GRADIENTS[vibe ?? ""] ?? FALLBACK_GRADIENT }}
    >
      <svg
        className={styles.mark}
        viewBox="0 0 32 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.4 0v9.6c0 6.9-3.9 12.3-10.4 14.4L1 20.4c3.9-1.5 6-3.9 6.3-7.2H0V0h13.4Zm18.6 0v9.6c0 6.9-3.9 12.3-10.4 14.4l-2-3.6c3.9-1.5 6-3.9 6.3-7.2h-7.3V0H32Z" />
      </svg>
      <p className={`${styles.quote} ${quoteSizeClass(quote.length)}`}>
        {quote}
      </p>
      {attribution ? (
        <p className={styles.attribution}>{attribution}</p>
      ) : null}
    </div>
  );
}
