// Text repairs applied to scraped agency copy at read time.
//
// READ TIME, NOT WRITE TIME, and that is deliberate. The JSON under
// lib/directory/data/ is what a named source directory actually published,
// and every figure on a profile page is attributable back to it. Editing
// the stored blurb would make that attribution a half-truth: the page
// would link to Awwwards for a sentence Awwwards never wrote. Repairing on
// the way out keeps the stored record faithful and the rendered one clean,
// and a bad rule here is one deploy from being reverted rather than one
// re-scrape.
//
// Nothing in this file adds words. Each function only removes or truncates,
// so no output can ever assert something the source did not.

/** Maximum length of a card blurb, before truncation looks for a sentence
 *  boundary to land on. Four lines at the card's width. */
export const CARD_DESCRIPTION_MAX_CHARS = 140;

/**
 * Shortest excerpt a sentence-boundary truncation may leave behind.
 *
 * Without a floor, a blurb opening with a short sentence ("We are Studio
 * X.") truncates to those four words and throws away the paragraph that
 * explained what they do. Below this, the word-boundary fallback is used
 * instead: a clipped sentence reads worse than a short one, but not as
 * badly as a blurb that says nothing.
 *
 * 40, not 60. At 60, "We are a studio in Berlin working across brand and
 * digital." - a complete, perfectly readable 59-character sentence - was
 * rejected in favour of a 140-character clip ending mid-clause. The floor
 * is there to catch four-word stubs, not to insist that every excerpt run
 * to two lines.
 */
const MIN_SENTENCE_TRUNCATION_CHARS = 40;

/** Ellipsis appended when a blurb was cut mid-sentence. A cut that landed
 *  on a sentence boundary gets nothing: it reads as a finished thought,
 *  because it is one. */
const ELLIPSIS = "…";

/**
 * Sentence-ending punctuation this module recognises.
 *
 * `!` and `?` are included because agency blurbs genuinely use them
 * ("Need a site that converts?"). A bare `.` is not enough on its own -
 * see `looksLikeAbbreviation`.
 */
const SENTENCE_END = /[.!?]/;

/**
 * Abbreviations whose trailing period is not a sentence end.
 *
 * Without this, "We build for Inc. 5000 companies" truncates after "Inc"
 * and the blurb claims something different from what it said. Kept to the
 * handful that actually occur in this dataset rather than an exhaustive
 * list, since every entry is a chance to swallow a real sentence break.
 */
const ABBREVIATIONS: readonly string[] = [
  "inc",
  "ltd",
  "llc",
  "co",
  "corp",
  "no",
  "vs",
  "etc",
  "e.g",
  "i.e",
  "mr",
  "mrs",
  "ms",
  "dr",
  "st",
  "sr",
  "jr",
];

/**
 * Contact patterns stripped from scraped blurbs.
 *
 * Source profiles routinely end a description with a business-development
 * line ("Inquiries: hello@studio.com", "New business: +1 555 0100"). On
 * the source's own page that is the point of the profile. Here it is a
 * scraped email address published on a page the agency never wrote, next
 * to a "Request intro" button that does the same job properly - so it
 * reads as a leak rather than as a service.
 *
 * Each entry removes from the start of the match to the end of the string
 * when it sits in the tail of the blurb, or just the matched run when it
 * does not. See `stripContactDetails`.
 */
const CONTACT_LEAD_INS = [
  // "Inquiries:", "For inquiries", "New business enquiries -"
  /(?:^|[\s.!?–—-])(?:for\s+)?(?:new\s+business|business|project|general|all|media|press)?\s*(?:inquir|enquir)\w*\s*[:\-–—]?/i,
  // "Contact us at", "Get in touch:", "Reach out to"
  /(?:^|[\s.!?–—-])(?:please\s+)?(?:contact|get\s+in\s+touch|reach\s+out|drop\s+us\s+a\s+line|write\s+to\s+us|say\s+hello|email\s+us)\b[^.!?]{0,40}?[:\-–—]?\s*(?=\S*@|\+?\d|https?:|www\.)/i,
  // "Email: hello@x.com" with no preamble at all.
  /(?:^|[\s.!?–—-])(?:e-?mail|tel|phone|call)\s*[:\-–—]\s*/i,
] as const;

/** Bare email address, wherever it appears. */
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** Phone number written the way agency blurbs write them. Requires a
 *  leading `+` or a bracketed area code so ordinary numbers in prose
 *  ("50 designers", "since 2004") survive. */
const PHONE_PATTERN = /(?:\+\d[\d\s().-]{7,}\d|\(\d{3}\)\s?\d{3}[\s.-]?\d{4})/g;

/** Bare URL. Only used to decide whether what follows a contact lead-in
 *  is prose or contact detail - URLs are never stripped from the blurb
 *  itself, since plenty of them are the agency naming its own work. */
const URL_PATTERN = /(?:https?:\/\/|www\.)\S+/gi;

/**
 * How much real prose may follow a contact lead-in before the lead-in
 * counts as part of the blurb rather than as a sign-off, in characters.
 *
 * A contact line almost always ENDS a blurb, and when it does, everything
 * after the lead-in is contact detail and goes with it. When the same
 * phrase opens a real sentence ("Get in touch with the team that built
 * Nike's last three campaigns. We are a 40-person studio..."), the words
 * after it are the blurb and only the address inside is removed.
 *
 * Measured on what is left after addresses, numbers and URLs are taken
 * out, rather than on the lead-in's position in the string, because
 * position gets it wrong at both ends: a two-sentence blurb puts its
 * sign-off halfway through, and a long one can open with the phrase.
 */
const MAX_TRAILING_PROSE_CHARS = 24;

/**
 * Collapses whitespace and trims stray punctuation left by a removal.
 *
 * @param value - Text to tidy.
 * @returns The tidied text.
 */
function tidy(value: string): string {
  try {
    return value
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/[\s,;:–—-]+$/g, "")
      .trim();
  } catch {
    return value;
  }
}

/**
 * Drops the fragment a removal left behind.
 *
 * Taking an address out of "...and art. mail: hello@e-t.studio" leaves
 * "...and art. mail:" - a lead-in this module does not recognise, pointing
 * at nothing. Rather than grow the lead-in list until it covers every way
 * an agency can write "here is our email", anything short and clause-like
 * hanging off the end after a removal is dropped.
 *
 * Only ever runs when something was actually removed, so a blurb that
 * genuinely ends in a short sentence is untouched.
 *
 * @param text - The blurb, addresses already removed.
 * @returns The blurb without its dangling tail.
 */
function dropDanglingFragment(text: string): string {
  try {
    let working = text;

    // Pipe-delimited blurbs ("Studio | \u2709\ufe0f | site.com") are left with
    // empty segments where an address used to be.
    if (working.includes("|")) {
      const segments = working
        .split("|")
        .map((segment) => segment.trim())
        .filter((segment) => /[\p{L}\p{N}]/u.test(segment));
      working = segments.join(" | ");
    }

    let cutAt = -1;
    for (let index = 0; index < working.length; index += 1) {
      if (SENTENCE_END.test(working[index]) && !looksLikeAbbreviation(working, index)) {
        cutAt = index;
      }
    }
    if (cutAt < 0) return working;

    const tail = working.slice(cutAt + 1).replace(/[\s:;,\u2013\u2014-]+/g, " ").trim();
    if (tail.length === 0) return working.slice(0, cutAt + 1);
    const wordCount = tail.split(/\s+/).length;
    const isFragment = tail.length <= MAX_TRAILING_PROSE_CHARS && wordCount <= 3;
    return isFragment ? working.slice(0, cutAt + 1) : working;
  } catch {
    return text;
  }
}

/**
 * Removes contact details from a scraped blurb.
 *
 * Returns the input UNCHANGED when it finds nothing to remove, rather
 * than returning a normalised version of it. The normalisation this file
 * does after a removal (collapsing the whitespace a removal left behind)
 * is wrong to apply to untouched copy: a third of these blurbs are in
 * French, where "Une agence : au service de" is correctly spaced and
 * "Une agence: au service de" is not.
 *
 * @param description - The blurb as scraped, possibly null.
 * @returns The blurb with contact details removed, or null when nothing
 *          readable is left (a blurb that was ONLY a contact line becomes
 *          no blurb, which the profile renders as absent rather than as
 *          an empty paragraph).
 */
export function stripContactDetails(description: string | null | undefined): string | null {
  try {
    const source = description?.trim();
    if (!source) return null;

    let working = source;
    let removedSomething = false;

    // Truncate at a trailing contact lead-in, or excise an inline one.
    for (const pattern of CONTACT_LEAD_INS) {
      const match = pattern.exec(working);
      if (!match) continue;
      // Each lead-in pattern opens by consuming the character BEFORE the
      // phrase, so the cut has to step past it or the sentence loses the
      // punctuation that ended it ("We build brands that move" instead of
      // "We build brands that move.").
      const boundaryChar = match[0].slice(0, 1);
      const index = match.index + (/[\s.!?\u2013\u2014-]/.test(boundaryChar) ? 1 : 0);
      const trailingProse = working
        .slice(match.index + match[0].length)
        .replace(EMAIL_PATTERN, " ")
        .replace(PHONE_PATTERN, " ")
        .replace(URL_PATTERN, " ")
        .replace(/\s+/g, " ")
        .trim();
      const isSignOff = trailingProse.length <= MAX_TRAILING_PROSE_CHARS;
      working = isSignOff ? working.slice(0, index) : working.replace(match[0], " ");
      removedSomething = true;
    }

    // Anything still carrying an address or a number goes regardless of
    // how it was introduced - plenty of blurbs just append the address.
    const beforeAddresses = working;
    working = working.replace(EMAIL_PATTERN, " ").replace(PHONE_PATTERN, " ");
    if (working !== beforeAddresses) removedSomething = true;

    if (!removedSomething) return source;

    const cleaned = tidy(dropDanglingFragment(working));
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return description?.trim() || null;
  }
}

/**
 * Whether the period at `index` closes an abbreviation rather than a
 * sentence.
 *
 * @param text - The full string.
 * @param index - Index of the candidate period.
 * @returns True when the period should not be treated as a sentence end.
 */
function looksLikeAbbreviation(text: string, index: number): boolean {
  try {
    if (text[index] !== ".") return false;
    const before = text.slice(0, index).toLowerCase();
    const lastWord = before.split(/[^a-z.]/).pop() ?? "";
    if (ABBREVIATIONS.includes(lastWord)) return true;
    // A single letter before the period is an initial ("J. Smith"), and a
    // digit is a decimal or a version number.
    if (/^[a-z]$/.test(lastWord)) return true;
    if (/\d$/.test(before) && /^\s*\d/.test(text.slice(index + 1))) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Truncates a blurb at the last complete sentence that fits.
 *
 * The card grid previously cut on a character count, which left blurbs
 * ending mid-word ("a full-service studio specialising in bran"). A cut
 * that lands on a sentence boundary reads as an excerpt rather than as
 * damage, and costs at most a line of text.
 *
 * Falls back to a word-boundary cut with an ellipsis when the first
 * sentence is itself longer than the budget, or when landing on the first
 * boundary would leave less than MIN_SENTENCE_TRUNCATION_CHARS.
 *
 * @param description - The blurb, possibly null.
 * @param maxChars - Character budget. Defaults to the card's.
 * @returns The truncated blurb, or null when there was nothing to show.
 */
export function truncateAtSentence(
  description: string | null | undefined,
  maxChars: number = CARD_DESCRIPTION_MAX_CHARS,
): string | null {
  try {
    const source = description?.trim();
    if (!source) return null;
    if (source.length <= maxChars) return source;

    const window = source.slice(0, maxChars + 1);
    let boundary = -1;
    for (let index = 0; index < window.length; index += 1) {
      if (!SENTENCE_END.test(window[index])) continue;
      if (looksLikeAbbreviation(window, index)) continue;
      // A sentence end is only real when followed by a space or the cut.
      const next = window[index + 1];
      if (next !== undefined && !/\s/.test(next)) continue;
      boundary = index;
    }

    if (boundary >= MIN_SENTENCE_TRUNCATION_CHARS) {
      return source.slice(0, boundary + 1).trim();
    }

    // No usable sentence boundary: cut on a word instead, and say so with
    // an ellipsis rather than pretending the sentence ended.
    const wordCut = source.slice(0, maxChars);
    const lastSpace = wordCut.lastIndexOf(" ");
    const cut = lastSpace > MIN_SENTENCE_TRUNCATION_CHARS ? wordCut.slice(0, lastSpace) : wordCut;
    return `${cut.replace(/[\s,;:]+$/, "")}${ELLIPSIS}`;
  } catch {
    return description?.trim() || null;
  }
}

/**
 * Trims free text to a hard character budget, for values an agency typed
 * into the claim form.
 *
 * Unlike `truncateAtSentence` this does not try to be clever: the form
 * enforces the same cap in the browser and the API route rejects anything
 * over it, so reaching this path means a submission bypassed both and the
 * safe response is a plain cut.
 *
 * @param value - The submitted text.
 * @param maxChars - The cap.
 * @returns The trimmed value, or null when empty.
 */
export function clampText(value: string | null | undefined, maxChars: number): string | null {
  try {
    const trimmed = value?.replace(/\s+/g, " ").trim();
    if (!trimmed) return null;
    return trimmed.length <= maxChars ? trimmed : trimmed.slice(0, maxChars).trim();
  } catch {
    return null;
  }
}
