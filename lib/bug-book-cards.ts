// Shared vocabulary for the Bug Book's generated cards - the per-entry
// quote card and the collection cover card. Keeping crops, gradients,
// and footer copy in one place means a post and a link unfurl always
// look like they came from the same book.

/** Social crops worth having. Square is the safe default. */
export const CARD_FORMATS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
} as const;

export type CardFormatName = keyof typeof CARD_FORMATS;

const DEFAULT_FORMAT: CardFormatName = "square";

/** Resolves a requested crop, falling back rather than erroring. */
export function resolveCardFormat(value: string | null): CardFormatName {
  return value && value in CARD_FORMATS
    ? (value as CardFormatName)
    : DEFAULT_FORMAT;
}

/** Per-vibe washes, matching the cards rendered on /bug-book. */
export const CARD_VIBE_GRADIENTS: Record<string, string> = {
  rage:
    "radial-gradient(120% 120% at 15% 10%, #7b1330 0%, transparent 55%), radial-gradient(120% 130% at 95% 95%, #b8341c 0%, transparent 60%)",
  sass:
    "radial-gradient(120% 120% at 12% 12%, #5b1a7a 0%, transparent 55%), radial-gradient(130% 130% at 95% 90%, #c02a6d 0%, transparent 62%)",
  comedy:
    "radial-gradient(120% 120% at 15% 8%, #3b2296 0%, transparent 55%), radial-gradient(130% 130% at 92% 95%, #9333ea 0%, transparent 60%)",
  story:
    "radial-gradient(120% 120% at 10% 12%, #2f1b6b 0%, transparent 58%), radial-gradient(130% 130% at 96% 92%, #7a1f5c 0%, transparent 60%)",
};

/** The cover card speaks for the whole book, so it blends all four. */
export const CARD_COVER_GRADIENT =
  "radial-gradient(90% 110% at 8% 6%, #3b2296 0%, transparent 55%), radial-gradient(90% 110% at 50% 100%, #c02a6d 0%, transparent 58%), radial-gradient(100% 120% at 98% 10%, #7b1330 0%, transparent 60%)";

export const CARD_GROUND = "#131017";

export const CARD_BRAND = "The Superflow Bug Book";
export const CARD_URL = "usesuperflow.ai/bug-book";
/** Out of context on a feed, this promise has to travel with the quote. */
export const CARD_TRUST = "Names removed. Screenshots redacted.";
