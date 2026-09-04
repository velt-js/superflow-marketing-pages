// Minimal TrueType metrics reader + greedy line breaker.
//
// The template auto-shrinks long titles until they fit the card, which needs
// real text widths. Satori exposes no measurement API, so we read glyph
// advance widths straight out of the same TTF we hand it: `head` for
// unitsPerEm, `hhea`/`hmtx` for advances, and `cmap` to map characters to
// glyph ids. Only the tables we need are parsed - this is not a general
// font library.

/**
 * Locate the table directory entries of a TrueType/OpenType file.
 *
 * @param {Buffer} fontBytes - Raw font file.
 * @returns {Map<string, {offset: number, length: number}>} Tables keyed by tag.
 */
function readTableDirectory(fontBytes) {
  try {
    const tables = new Map();
    const numTables = fontBytes.readUInt16BE(4);

    for (let index = 0; index < numTables; index += 1) {
      const recordOffset = 12 + index * 16;
      const tag = fontBytes.toString("ascii", recordOffset, recordOffset + 4);
      tables.set(tag, {
        offset: fontBytes.readUInt32BE(recordOffset + 8),
        length: fontBytes.readUInt32BE(recordOffset + 12),
      });
    }

    return tables;
  } catch (error) {
    throw new Error(`Malformed font: could not read table directory (${error?.message ?? error})`);
  }
}

/**
 * Parse a cmap format 4 subtable (BMP character ranges).
 *
 * @param {Buffer} fontBytes - Raw font file.
 * @param {number} subtableOffset - Absolute offset of the subtable.
 * @returns {Map<number, number>} Code point to glyph id.
 */
function parseCmapFormat4(fontBytes, subtableOffset) {
  try {
    const charToGlyph = new Map();
    const segCount = fontBytes.readUInt16BE(subtableOffset + 6) / 2;
    const endCodeBase = subtableOffset + 14;
    const startCodeBase = endCodeBase + segCount * 2 + 2;
    const idDeltaBase = startCodeBase + segCount * 2;
    const idRangeOffsetBase = idDeltaBase + segCount * 2;

    for (let segment = 0; segment < segCount; segment += 1) {
      const endCode = fontBytes.readUInt16BE(endCodeBase + segment * 2);
      const startCode = fontBytes.readUInt16BE(startCodeBase + segment * 2);
      const idDelta = fontBytes.readInt16BE(idDeltaBase + segment * 2);
      const idRangeOffsetPosition = idRangeOffsetBase + segment * 2;
      const idRangeOffset = fontBytes.readUInt16BE(idRangeOffsetPosition);

      if (startCode === 0xffff) {
        continue;
      }

      for (let codePoint = startCode; codePoint <= endCode && codePoint !== 0x10000; codePoint += 1) {
        let glyphId = 0;

        if (idRangeOffset === 0) {
          glyphId = (codePoint + idDelta) & 0xffff;
        } else {
          const glyphIndexPosition =
            idRangeOffsetPosition + idRangeOffset + (codePoint - startCode) * 2;
          if (glyphIndexPosition + 1 >= fontBytes.length) {
            continue;
          }
          const rawGlyphId = fontBytes.readUInt16BE(glyphIndexPosition);
          glyphId = rawGlyphId === 0 ? 0 : (rawGlyphId + idDelta) & 0xffff;
        }

        if (glyphId !== 0) {
          charToGlyph.set(codePoint, glyphId);
        }
      }
    }

    return charToGlyph;
  } catch (error) {
    throw new Error(`Malformed font: bad cmap format 4 (${error?.message ?? error})`);
  }
}

/**
 * Parse a cmap format 12 subtable (full Unicode range groups).
 *
 * @param {Buffer} fontBytes - Raw font file.
 * @param {number} subtableOffset - Absolute offset of the subtable.
 * @returns {Map<number, number>} Code point to glyph id.
 */
function parseCmapFormat12(fontBytes, subtableOffset) {
  try {
    const charToGlyph = new Map();
    const numGroups = fontBytes.readUInt32BE(subtableOffset + 12);

    for (let group = 0; group < numGroups; group += 1) {
      const groupOffset = subtableOffset + 16 + group * 12;
      const startCharCode = fontBytes.readUInt32BE(groupOffset);
      const endCharCode = fontBytes.readUInt32BE(groupOffset + 4);
      const startGlyphId = fontBytes.readUInt32BE(groupOffset + 8);

      // Guard against pathological fonts declaring enormous ranges.
      const cappedEnd = Math.min(endCharCode, startCharCode + 0xffff);
      for (let codePoint = startCharCode; codePoint <= cappedEnd; codePoint += 1) {
        charToGlyph.set(codePoint, startGlyphId + (codePoint - startCharCode));
      }
    }

    return charToGlyph;
  } catch (error) {
    throw new Error(`Malformed font: bad cmap format 12 (${error?.message ?? error})`);
  }
}

/**
 * Build a character-to-glyph map from the best available cmap subtable.
 *
 * @param {Buffer} fontBytes - Raw font file.
 * @param {number} cmapOffset - Absolute offset of the cmap table.
 * @returns {Map<number, number>} Code point to glyph id.
 */
function parseCmap(fontBytes, cmapOffset) {
  try {
    const numSubtables = fontBytes.readUInt16BE(cmapOffset + 2);
    let format4Offset = null;
    let format12Offset = null;

    for (let index = 0; index < numSubtables; index += 1) {
      const recordOffset = cmapOffset + 4 + index * 8;
      const platformId = fontBytes.readUInt16BE(recordOffset);
      const encodingId = fontBytes.readUInt16BE(recordOffset + 2);
      const subtableOffset = cmapOffset + fontBytes.readUInt32BE(recordOffset + 4);
      const format = fontBytes.readUInt16BE(subtableOffset);

      const isUnicode =
        platformId === 0 || (platformId === 3 && (encodingId === 1 || encodingId === 10));
      if (!isUnicode) {
        continue;
      }
      if (format === 12 && format12Offset === null) {
        format12Offset = subtableOffset;
      }
      if (format === 4 && format4Offset === null) {
        format4Offset = subtableOffset;
      }
    }

    if (format12Offset !== null) {
      return parseCmapFormat12(fontBytes, format12Offset);
    }
    if (format4Offset !== null) {
      return parseCmapFormat4(fontBytes, format4Offset);
    }
    throw new Error("no Unicode cmap subtable found");
  } catch (error) {
    throw new Error(`Malformed font: could not read cmap (${error?.message ?? error})`);
  }
}

/**
 * Build a reusable text measurer for one font face.
 *
 * Accepts a `Buffer` or a `Uint8Array`; the table readers use `Buffer`'s
 * big-endian accessors, so a plain view is wrapped without copying. This is
 * why the modules here require the Node runtime rather than edge.
 *
 * @param {Buffer | Uint8Array} rawFontBytes - Raw TTF bytes.
 * @returns {{advanceEm: (text: string) => number}} Measurer whose `advanceEm`
 *   returns the width of `text` in em units (multiply by font size for pixels).
 */
export function createMeasurer(rawFontBytes) {
  try {
    const fontBytes = Buffer.isBuffer(rawFontBytes)
      ? rawFontBytes
      : Buffer.from(rawFontBytes.buffer, rawFontBytes.byteOffset, rawFontBytes.byteLength);
    const tables = readTableDirectory(fontBytes);
    const head = tables.get("head");
    const hhea = tables.get("hhea");
    const hmtx = tables.get("hmtx");
    const cmap = tables.get("cmap");

    if (!head || !hhea || !hmtx || !cmap) {
      throw new Error("font is missing one of head/hhea/hmtx/cmap");
    }

    const unitsPerEm = fontBytes.readUInt16BE(head.offset + 18);
    const numberOfHMetrics = fontBytes.readUInt16BE(hhea.offset + 34);
    const charToGlyph = parseCmap(fontBytes, cmap.offset);

    // Glyphs past numberOfHMetrics all reuse the final advance width.
    const lastAdvance = fontBytes.readUInt16BE(hmtx.offset + (numberOfHMetrics - 1) * 4);
    const notdefAdvance = fontBytes.readUInt16BE(hmtx.offset);
    const advanceCache = new Map();

    /**
     * Advance width of a single code point, in em units.
     *
     * @param {number} codePoint - Unicode code point.
     * @returns {number} Advance width as a fraction of the em square.
     */
    function advanceForCodePoint(codePoint) {
      try {
        const cached = advanceCache.get(codePoint);
        if (cached !== undefined) {
          return cached;
        }

        const glyphId = charToGlyph.get(codePoint);
        let advanceUnits = notdefAdvance;

        if (glyphId !== undefined) {
          advanceUnits =
            glyphId < numberOfHMetrics
              ? fontBytes.readUInt16BE(hmtx.offset + glyphId * 4)
              : lastAdvance;
        }

        const advance = advanceUnits / unitsPerEm;
        advanceCache.set(codePoint, advance);
        return advance;
      } catch {
        // A single unreadable glyph should not abort a whole render.
        return notdefAdvance / unitsPerEm;
      }
    }

    /**
     * Width of a string in em units, ignoring kerning (Satori does too for
     * these faces, and the difference is well under a pixel at card sizes).
     *
     * @param {string} text - Text to measure.
     * @returns {number} Width in em units.
     */
    function advanceEm(text) {
      try {
        let total = 0;
        for (const character of String(text ?? "")) {
          total += advanceForCodePoint(character.codePointAt(0));
        }
        return total;
      } catch {
        return 0;
      }
    }

    return { advanceEm };
  } catch (error) {
    throw new Error(`Could not read font metrics: ${error?.message ?? error}`);
  }
}

/**
 * Rendered pixel width of a run of text at the given type settings.
 *
 * Mirrors how the rasterizer lays text out: every glyph's advance plus one
 * letter-spacing per inter-character gap. Kerning is deliberately not modelled
 * because the rasterizer does not apply it either - see the note in
 * constants.mjs.
 *
 * @param {string} text - Text to measure.
 * @param {{advanceEm: (text: string) => number}} measurer - Face measurer.
 * @param {number} fontSize - Font size in pixels.
 * @param {number} letterSpacing - Letter spacing in pixels (may be negative).
 * @returns {number} Width in pixels.
 */
export function measureText(text, measurer, fontSize, letterSpacing) {
  try {
    const characterCount = [...String(text ?? "")].length;
    return measurer.advanceEm(text) * fontSize + Math.max(0, characterCount - 1) * letterSpacing;
  } catch {
    return 0;
  }
}

/**
 * Greedily fill lines up to a pixel width - the classic first-fit break.
 *
 * @param {string[]} words - Words of a single paragraph.
 * @param {{advanceEm: (text: string) => number}} measurer - Face measurer.
 * @param {number} fontSize - Font size in pixels.
 * @param {number} letterSpacing - Letter spacing in pixels (may be negative).
 * @param {number} maxWidth - Available width in pixels.
 * @returns {string[]} One entry per line.
 */
function greedyWrap(words, measurer, fontSize, letterSpacing, maxWidth) {
  try {
    if (words.length === 0) {
      return [];
    }

    const lines = [];
    let currentLine = words[0];

    for (const word of words.slice(1)) {
      const candidate = `${currentLine} ${word}`;
      if (measureText(candidate, measurer, fontSize, letterSpacing) <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
    return lines;
  } catch (error) {
    throw new Error(`Could not wrap a line: ${error?.message ?? error}`);
  }
}

/**
 * Wrap a paragraph the way CSS `text-wrap: balance` does - even line lengths
 * instead of a full first line and a stranded orphan on the last.
 *
 * Satori does not implement `text-wrap`, so setting the property in the
 * template would do nothing. Because the template does its own line breaking,
 * the behaviour is implemented here instead: greedy-wrap once to learn the
 * natural line count, then binary-search for the narrowest width that still
 * fits in that many lines. That is the standard formulation of balancing -
 * minimise the widest line without spending an extra line.
 *
 * @param {string[]} words - Words of a single paragraph.
 * @param {{advanceEm: (text: string) => number}} measurer - Face measurer.
 * @param {number} fontSize - Font size in pixels.
 * @param {number} letterSpacing - Letter spacing in pixels (may be negative).
 * @param {number} maxWidth - Available width in pixels.
 * @returns {string[]} Balanced lines.
 */
function balanceWrap(words, measurer, fontSize, letterSpacing, maxWidth) {
  try {
    const natural = greedyWrap(words, measurer, fontSize, letterSpacing, maxWidth);

    // Nothing to balance across a single line.
    if (natural.length <= 1) {
      return natural;
    }

    let tooNarrow = 0;
    let wideEnough = maxWidth;

    // ~0.5px precision is well past what the rasterizer can show.
    while (wideEnough - tooNarrow > 0.5) {
      const midpoint = (tooNarrow + wideEnough) / 2;
      const attempt = greedyWrap(words, measurer, fontSize, letterSpacing, midpoint);

      if (attempt.length <= natural.length) {
        wideEnough = midpoint;
      } else {
        tooNarrow = midpoint;
      }
    }

    return greedyWrap(words, measurer, fontSize, letterSpacing, wideEnough);
  } catch (error) {
    throw new Error(`Could not balance a paragraph: ${error?.message ?? error}`);
  }
}

/**
 * Wrap text to a pixel width, honouring any explicit newlines.
 *
 * Each paragraph is balanced independently, so an author-supplied `\n` still
 * breaks exactly where they asked.
 *
 * @param {string} text - Text to wrap.
 * @param {{advanceEm: (text: string) => number}} measurer - Face measurer.
 * @param {number} fontSize - Font size in pixels.
 * @param {number} letterSpacing - Letter spacing in pixels (may be negative).
 * @param {number} maxWidth - Available width in pixels.
 * @param {boolean} [balance=true] - Balance line lengths; false keeps the greedy break.
 * @returns {string[]} One entry per rendered line.
 */
export function wrapText(text, measurer, fontSize, letterSpacing, maxWidth, balance = true) {
  try {
    const lines = [];

    for (const paragraph of String(text ?? "").split("\n")) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);

      if (words.length === 0) {
        continue;
      }

      const wrapped = balance
        ? balanceWrap(words, measurer, fontSize, letterSpacing, maxWidth)
        : greedyWrap(words, measurer, fontSize, letterSpacing, maxWidth);

      lines.push(...wrapped);
    }

    return lines;
  } catch (error) {
    throw new Error(`Could not wrap title text: ${error?.message ?? error}`);
  }
}
