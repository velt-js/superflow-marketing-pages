// Single entry point for building a social card, shared by the build script
// (`scripts/og-image/generate-og.mjs`) and the runtime route (`/api/og`).
//
// Returns the element tree rather than an `ImageResponse` so this module stays
// free of the `next/og` import: the two callers resolve that specifier
// differently (Node needs the `.js` extension, the bundler does not), and
// there is no reason to make a pure layout module care.

import {
  DEFAULT_BALANCE,
  DEFAULT_FOOTER,
  DEFAULT_HEIGHT,
  DEFAULT_MAX_LINES,
  DEFAULT_WIDTH,
} from "./constants.mjs";
import { getLogo } from "./logo.mjs";
import { createMeasurer } from "./measure.mjs";
import { buildCard } from "./template.mjs";

/**
 * Build the card element tree for a headline.
 *
 * @param {object} input - Card inputs.
 * @param {string} input.title - Headline. `\n` forces a line break.
 * @param {Buffer} input.boldFontData - Bold face bytes, used for measuring.
 * @param {string} [input.footer] - Muted domain line.
 * @param {number} [input.width] - Output width in px.
 * @param {number} [input.height] - Output height in px.
 * @param {number} [input.maxLines] - Wrapped lines before the type shrinks.
 * @param {number | null} [input.fontSizeOverride] - Fixed title size in base px.
 * @param {boolean} [input.balance] - Even out line lengths.
 * @returns {{element: import("react").ReactElement, fontSize: number, lines: string[],
 *   width: number, height: number}} Element tree plus the type decisions.
 */
export function createCard(input) {
  try {
    const {
      title,
      boldFontData,
      footer = DEFAULT_FOOTER,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      maxLines = DEFAULT_MAX_LINES,
      fontSizeOverride = null,
      balance = DEFAULT_BALANCE,
    } = input;

    if (!title || typeof title !== "string") {
      throw new Error("a non-empty `title` is required");
    }
    if (!boldFontData) {
      throw new Error("`boldFontData` is required to measure the headline");
    }

    const built = buildCard({
      title,
      footer,
      width,
      height,
      measurer: createMeasurer(boldFontData),
      logo: getLogo(),
      maxLines,
      fontSizeOverride,
      balance,
    });

    return { ...built, width, height };
  } catch (error) {
    throw new Error(`Could not create the card: ${error?.message ?? error}`);
  }
}
