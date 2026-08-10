// The card layout itself: a scaled, auto-fitting reproduction of the Figma
// meta-image template (node 1112:1014).
//
// Written with React.createElement rather than JSX so the generator stays a
// plain `node scripts/...` script with no build step. Satori requires an
// explicit `display: flex` on any element with children, hence the repetition.
//
// Shared by the build script and the `/api/og` route handler, so this module
// must stay free of Node-only APIs - no filesystem, no `process.cwd()`.
// Callers pass the font metrics and the logo in.

import React from "react";
import {
  BASE_WIDTH,
  BRAND_FONT_SIZE,
  BRAND_NAME,
  COLOR_BRAND,
  COLOR_FOOTER,
  COLOR_TITLE,
  FONT_FAMILY,
  FONT_WEIGHT_BOLD,
  FONT_WEIGHT_REGULAR,
  FOOTER_BOTTOM,
  FOOTER_FONT_SIZE,
  GRADIENT,
  HEADER_TOP,
  LOGO_GAP,
  LOGO_HEIGHT,
  TITLE_FONT_SIZE_MAX,
  TITLE_FONT_SIZE_MIN,
  TITLE_FONT_SIZE_STEP,
  TITLE_LINE_HEIGHT,
  TITLE_MAX_WIDTH,
  TITLE_TRACKING_EM,
} from "./constants.mjs";
import { wrapText } from "./measure.mjs";

/** Breathing room kept between the title block and the header/footer, in base px. */
const TITLE_VERTICAL_MARGIN = 24;

/**
 * Pick the largest title size that fits both the line budget and the vertical
 * space between the header and the footer.
 *
 * @param {object} input - Fit inputs.
 * @param {string} input.title - Title text.
 * @param {{advanceEm: (text: string) => number}} input.measurer - Bold-face measurer.
 * @param {number} input.scale - Canvas scale relative to the Figma frame.
 * @param {number} input.availableHeight - Vertical space for the title, in px.
 * @param {number} input.maxLines - Maximum wrapped lines.
 * @param {number | null} input.fontSizeOverride - Fixed size in base px, or null to auto-fit.
 * @param {boolean} input.balance - Even out line lengths (`text-wrap: balance`).
 * @returns {{fontSize: number, lines: string[], letterSpacing: number}} Chosen type settings.
 */
export function fitTitle(input) {
  try {
    const { title, measurer, scale, availableHeight, maxLines, fontSizeOverride, balance } = input;
    const maxWidth = TITLE_MAX_WIDTH * scale;

    /**
     * Wrap the title at one candidate size.
     *
     * @param {number} fontSize - Candidate font size in px.
     * @returns {{fontSize: number, lines: string[], letterSpacing: number}} Wrapped result.
     */
    function wrapAt(fontSize) {
      try {
        const letterSpacing = TITLE_TRACKING_EM * fontSize;
        return {
          fontSize,
          letterSpacing,
          lines: wrapText(title, measurer, fontSize, letterSpacing, maxWidth, balance),
        };
      } catch (error) {
        throw new Error(`Could not wrap title: ${error?.message ?? error}`);
      }
    }

    if (fontSizeOverride) {
      return wrapAt(fontSizeOverride * scale);
    }

    const minSize = TITLE_FONT_SIZE_MIN * scale;
    const step = TITLE_FONT_SIZE_STEP * scale;
    let candidate = TITLE_FONT_SIZE_MAX * scale;
    let attempt = wrapAt(candidate);

    while (candidate > minSize) {
      const blockHeight = attempt.lines.length * attempt.fontSize * TITLE_LINE_HEIGHT;
      if (attempt.lines.length <= maxLines && blockHeight <= availableHeight) {
        return attempt;
      }
      candidate -= step;
      attempt = wrapAt(candidate);
    }

    // Floor reached: render at the minimum rather than shrinking to illegibility.
    return attempt;
  } catch (error) {
    throw new Error(`Could not fit the title: ${error?.message ?? error}`);
  }
}

/**
 * Build the card element tree for one meta image.
 *
 * @param {object} input - Card inputs.
 * @param {string} input.title - Headline text. `\n` forces a line break.
 * @param {string} input.footer - Muted domain line at the bottom.
 * @param {number} input.width - Output width in px.
 * @param {number} input.height - Output height in px.
 * @param {{advanceEm: (text: string) => number}} input.measurer - Bold-face measurer.
 * @param {{dataUri: string, aspectRatio: number}} input.logo - Prepared logo.
 * @param {number} input.maxLines - Maximum title lines before shrinking.
 * @param {number | null} input.fontSizeOverride - Fixed title size in base px, or null.
 * @param {boolean} input.balance - Even out line lengths (`text-wrap: balance`).
 * @returns {{element: React.ReactElement, fontSize: number, lines: string[]}} Tree plus
 *   the type decisions, so the caller can report them.
 */
export function buildCard(input) {
  try {
    const { title, footer, width, height, measurer, logo, maxLines, fontSizeOverride, balance } =
      input;
    const scale = width / BASE_WIDTH;

    const headerTop = HEADER_TOP * scale;
    const logoHeight = LOGO_HEIGHT * scale;
    const footerBottom = FOOTER_BOTTOM * scale;
    const footerFontSize = FOOTER_FONT_SIZE * scale;
    const brandFontSize = BRAND_FONT_SIZE * scale;

    // The headline is centred on the canvas centre, as in the comp - not on the
    // midpoint between header and footer, which would sit a few px low. The
    // budget is therefore the largest band centred on that line that still
    // clears both the header and the footer.
    const headerBlock = headerTop + Math.max(logoHeight, brandFontSize);
    const footerBlock = footerBottom + footerFontSize * 1.5;
    const margin = TITLE_VERTICAL_MARGIN * scale;
    const centerY = height / 2;
    const halfBand = Math.min(
      centerY - (headerBlock + margin),
      height - footerBlock - margin - centerY,
    );
    const availableHeight = Math.max(1, halfBand * 2);

    const fitted = fitTitle({
      title,
      measurer,
      scale,
      availableHeight,
      maxLines,
      fontSizeOverride,
      balance,
    });

    const header = React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: `${LOGO_GAP * scale}px`,
          paddingTop: `${headerTop}px`,
        },
      },
      React.createElement("img", {
        src: logo.dataUri,
        width: Math.round(logoHeight * logo.aspectRatio),
        height: Math.round(logoHeight),
        style: {
          width: `${Math.round(logoHeight * logo.aspectRatio)}px`,
          height: `${Math.round(logoHeight)}px`,
        },
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            fontFamily: FONT_FAMILY,
            fontWeight: FONT_WEIGHT_BOLD,
            fontSize: `${brandFontSize}px`,
            lineHeight: `${brandFontSize}px`,
            color: COLOR_BRAND,
          },
        },
        BRAND_NAME,
      ),
    );

    // Each wrapped line is its own element so the rendered break points are the
    // ones the fitter measured, rather than whatever the rasterizer would
    // decide on its own.
    const titleBlock = React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          alignItems: "center",
          justifyContent: "center",
        },
      },
      ...fitted.lines.map((line, lineIndex) =>
        React.createElement(
          "div",
          {
            key: `title-line-${lineIndex}`,
            style: {
              display: "flex",
              fontFamily: FONT_FAMILY,
              fontWeight: FONT_WEIGHT_BOLD,
              fontSize: `${fitted.fontSize}px`,
              lineHeight: `${fitted.fontSize * TITLE_LINE_HEIGHT}px`,
              letterSpacing: `${fitted.letterSpacing}px`,
              color: COLOR_TITLE,
              textAlign: "center",
            },
          },
          line,
        ),
      ),
    );

    const footerBlockElement = React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          paddingBottom: `${footerBottom}px`,
          fontFamily: FONT_FAMILY,
          fontWeight: FONT_WEIGHT_REGULAR,
          fontSize: `${footerFontSize}px`,
          lineHeight: `${footerFontSize * 1.5}px`,
          color: COLOR_FOOTER,
        },
      },
      footer,
    );

    // Header and footer sit in flow at the two ends; the headline floats above
    // them, centred on the canvas.
    const element = React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: GRADIENT,
        },
      },
      header,
      footerBlockElement,
      titleBlock,
    );

    return { element, fontSize: fitted.fontSize, lines: fitted.lines };
  } catch (error) {
    throw new Error(`Could not build the card: ${error?.message ?? error}`);
  }
}
