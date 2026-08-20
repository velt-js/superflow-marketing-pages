// The one shape every shareable tool result is reduced to.
//
// WHY THERE IS A SINGLE SHAPE
//
// Thirteen tools return thirteen unrelated reports. Four things need to read
// all of them: the Open Graph card renderer, the `generateMetadata` on each
// tool page, the "Share this result" block, and the embeddable badge. Wiring
// each of those to each report shape is 52 couplings, and every one of them
// breaks the day the backend renames a field.
//
// So each tool contributes ONE pure function that reduces its report to a
// `ShareSnapshot` (see ./build.ts), and everything downstream reads only that.
// A snapshot is small on purpose: it holds what fits on a card and in a
// sentence, nothing else. It is also serialisable and free of report types, so
// the same value crosses to the client, into a query string, and back out in
// the card renderer without a second contract.
//
// WHAT A SNAPSHOT IS NOT
//
// It is not a summary of the report and it is not an archive of it. Nothing
// here is the source of truth for anything: the report is. A snapshot exists
// only so a result can be shown to somebody who has not run the tool.

/**
 * How a result reads at a glance.
 *
 * `neutral` is not a hedge, it is the honest answer for the tools that
 * produce an artefact rather than a verdict. A generated llms.txt is neither
 * good nor bad news, and colouring it green would be inventing an opinion the
 * engine never formed.
 */
export type ShareTone = "good" | "warn" | "bad" | "neutral";

/** One number on the card. Both halves are already formatted for display. */
export type ShareMetric = {
  /** Two or three words, sentence case, e.g. "Crawlers allowed". */
  label: string;
  /** The value as it should read, e.g. "11 of 14". Never a raw float. */
  value: string;
};

/**
 * The art for the Social Preview Checker's card: the page's own social card,
 * as the platforms will draw it.
 *
 * This is the one tool whose result IS a picture, so its share card renders
 * that picture rather than a score. Everything here comes from the checked
 * page's own tags, which is exactly what makes the card worth sharing: the
 * reader sees the same thing they would see in a Slack unfurl.
 */
export type SharePreviewArt = {
  title: string;
  description: string;
  /** The page's og:image. Remote and untrusted; the renderer re-validates it. */
  imageUrl: string;
  /** The source line a platform shows, usually a domain. */
  attribution: string;
  /** True when at least one platform will draw the wide image card. */
  rendersCard: boolean;
};

/**
 * An earned badge, or null when the result does not earn one.
 *
 * Null is the common case and the important one. A badge says "this site
 * passed", so a run with failures must not produce one: an embeddable badge
 * that reads "AI visible 34/100" is either a lie or a self-own, and offering
 * it would make every other badge on every other site worthless.
 */
export type ShareBadge = {
  /** The claim, left half of the badge. e.g. "AI visible". */
  label: string;
  /** The evidence, right half. e.g. "92/100" or "allowed". */
  value: string;
  /** `good` paints the accent green, `warn` amber. Never `bad`: see above. */
  tone: "good" | "warn";
};

/** Which of the three card layouts a snapshot wants. */
export type ShareCardVariant = "score" | "metrics" | "preview";

/** Everything the share surfaces know about one run of one tool. */
export type ShareSnapshot = {
  /** Registry slug. Drives the permalink, the CTA attribution, analytics. */
  slug: string;
  /** Display name from the registry, e.g. "AI Visibility Checker". */
  toolName: string;
  /** Host of the checked page, for the card's headline. */
  hostname: string;
  /**
   * The URL the run ended on, after redirects. This is what the permalink
   * carries, so opening a shared link re-reads the same cache entry the run
   * wrote rather than starting a second run of a slightly different URL.
   */
  targetUrl: string;
  /** og:title. One line, already carrying the hostname. */
  headline: string;
  /** og:description. One or two sentences, no marketing. */
  summary: string;
  /** 0 to 100, or null for the tools that do not score. */
  score: number | null;
  /** A to F, or null. Only ever set alongside `score`. */
  grade: string | null;
  tone: ShareTone;
  /** Up to three. The card draws them in order and drops any overflow. */
  metrics: ShareMetric[];
  /** Set by the Social Preview Checker alone. */
  preview: SharePreviewArt | null;
  /** Set when the result earns an embeddable badge. Usually null. */
  badge: ShareBadge | null;
  /**
   * Extra query parameters the permalink must carry to reproduce this run.
   *
   * Almost every tool takes a URL and nothing else, so this is almost always
   * absent. The Lookalike Test is the exception: its result depends on which
   * benchmark pack and comparison sites were used, and a permalink carrying
   * only `?url=` would open a different comparison from the one that was
   * shared. Those runs are also cached under a key that includes these values,
   * so the parameters are what makes a shared link land on the same entry.
   */
  permalinkParams?: Record<string, string>;
};

/**
 * The card layout a snapshot should be drawn with.
 *
 * Derived rather than stored so a snapshot cannot carry a variant that
 * contradicts its own fields (a `preview` variant with no preview art draws
 * an empty box, and there is no reason to make that state reachable).
 *
 * @param snapshot - The snapshot about to be rendered.
 * @returns The variant the card renderer should use.
 */
export function cardVariantFor(snapshot: ShareSnapshot): ShareCardVariant {
  try {
    if (snapshot.preview) return "preview";
    if (typeof snapshot.score === "number") return "score";
    return "metrics";
  } catch {
    return "metrics";
  }
}
