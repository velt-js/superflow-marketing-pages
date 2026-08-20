// Every URL the share surfaces need, and the codec behind the Open Graph card.
//
// WHY THE CARD IS A PURE FUNCTION OF ITS QUERY STRING
//
// `/api/tools/share-card` draws a snapshot that arrives entirely in its own
// URL. Nothing is fetched and nothing is looked up, so a card renders in a few
// milliseconds, caches for a day at the edge, and a crafted URL cannot make
// the endpoint do work against somebody else's site. The one exception is the
// Social Preview Checker's card art, which is a remote image by definition;
// that route re-validates it through the SSRF guard before drawing it.
//
// Encode and decode therefore live in one file. They are two halves of one
// format, and the failure mode when they drift is a card that renders blank
// for everybody with no error anywhere.
//
// THE PERMALINK
//
// A result's permalink is the tool page carrying `?url=`. That is not a
// shortcut around storing results: it is the better address. Every tool
// already writes that URL into the address bar after a run, the 24 hour cache
// makes opening one instant, and after the cache expires the page re-runs the
// check and shows the site as it is TODAY rather than a frozen snapshot from
// whenever the link was posted. A shared score that quietly stops being true
// is worse than one that updates.

import { SITE_URL } from "@/app/_seo/schema";
import { cardVariantFor, type ShareSnapshot, type ShareTone } from "./types";

/** Where the card renderer lives. */
const CARD_PATH = "/api/tools/share-card";

/** Where the badge renderer lives. */
const BADGE_PATH = "/api/tools/badge";

/** Separator between metrics in the `m` parameter. */
const METRIC_SEPARATOR = "|";

/** Separator between a metric's label and its value. */
const METRIC_PAIR = "~";

/** Card art dimensions, fixed by what the platforms crop to. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** Badge dimensions. Fixed so an embed can reserve the box before it loads. */
export const BADGE_WIDTH = 232;
export const BADGE_HEIGHT = 48;

/**
 * The origin to build absolute URLs against.
 *
 * Open Graph tags and embed snippets must be absolute, and both are read by
 * machines that are not on this origin. In the browser the live origin wins so
 * a preview deploy previews itself; on the server there is only `SITE_URL`.
 *
 * @param override - An explicit origin, usually `window.location.origin`.
 */
export function shareOrigin(override?: string): string {
  try {
    if (override && override.length > 0) return override.replace(/\/$/, "");
    return SITE_URL;
  } catch {
    return SITE_URL;
  }
}

/**
 * The permalink for one result.
 *
 * @param snapshot - The result to link to.
 * @param origin - Optional origin override.
 */
export function resultPermalink(
  snapshot: ShareSnapshot,
  origin?: string,
): string {
  try {
    const url = new URL(`${shareOrigin(origin)}/tools/${snapshot.slug}`);
    if (snapshot.targetUrl.length > 0) {
      url.searchParams.set("url", snapshot.targetUrl);
    }
    for (const [key, value] of Object.entries(snapshot.permalinkParams ?? {})) {
      if (key.length > 0 && value.length > 0) url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return `${shareOrigin(origin)}/tools/${snapshot.slug}`;
  }
}

/**
 * The Open Graph card URL for one result.
 *
 * @param snapshot - The result to draw.
 * @param origin - Optional origin override.
 */
export function shareCardUrl(snapshot: ShareSnapshot, origin?: string): string {
  try {
    const url = new URL(`${shareOrigin(origin)}${CARD_PATH}`);
    const params = url.searchParams;

    params.set("v", cardVariantFor(snapshot));
    params.set("t", snapshot.slug);
    if (snapshot.hostname) params.set("h", snapshot.hostname);
    if (snapshot.headline) params.set("hl", snapshot.headline);
    params.set("n", snapshot.tone);

    if (typeof snapshot.score === "number") {
      params.set("s", String(snapshot.score));
    }
    if (snapshot.grade) params.set("g", snapshot.grade);

    if (snapshot.metrics.length > 0) {
      params.set(
        "m",
        snapshot.metrics
          .map((metric) => `${metric.label}${METRIC_PAIR}${metric.value}`)
          .join(METRIC_SEPARATOR),
      );
    }

    if (snapshot.preview) {
      params.set("pt", snapshot.preview.title);
      params.set("pd", snapshot.preview.description);
      params.set("pa", snapshot.preview.attribution);
      if (snapshot.preview.imageUrl) params.set("pi", snapshot.preview.imageUrl);
      params.set("pc", snapshot.preview.rendersCard ? "1" : "0");
    }

    return url.toString();
  } catch {
    // A card that cannot be addressed falls back to the site card rather than
    // to a broken image in somebody's timeline.
    return `${shareOrigin(origin)}/opengraph-image.png`;
  }
}

/**
 * The tools that offer an embeddable badge.
 *
 * A badge is a claim a site owner puts on their own page, so it is only worth
 * offering where the tool produces a verdict somebody would want to display.
 * The generators are absent for that reason: "we generated an llms.txt for
 * this site" is not a property of the site, it is a thing we did once.
 *
 * A tool being on this list does NOT mean a given run earns a badge. That is
 * decided per result by the builder, which returns a null badge for any run
 * with failures.
 */
export const BADGE_TOOLS: ReadonlySet<string> = new Set([
  "ai-visibility-checker",
  "robots-txt-ai-checker",
  "social-preview-checker",
  "json-ld-validator",
]);

/**
 * Whether a tool offers a badge at all.
 *
 * @param slug - The registry slug.
 */
export function offersBadge(slug: string): boolean {
  try {
    return BADGE_TOOLS.has(slug);
  } catch {
    return false;
  }
}

/**
 * What a result has to show before it earns that tool's badge, phrased to
 * complete the sentence "This badge is only offered for ...".
 *
 * These have to match the conditions in ./build.ts exactly. A result told it
 * needs one thing and refused the badge for another is worse than no
 * explanation, because the visitor fixes the wrong thing and comes back.
 */
const BADGE_REQUIREMENT: Readonly<Record<string, string>> = {
  "ai-visibility-checker": "a score of 75 or higher",
  "robots-txt-ai-checker":
    "every AI answer crawler allowed, with no block at the edge",
  "social-preview-checker":
    "no platform failing, and at least one showing an image",
  "json-ld-validator": "structured data on the page with no errors",
};

/**
 * The requirement sentence fragment for a tool's badge.
 *
 * @param slug - The registry slug.
 * @returns The fragment, or a general one for a tool with no entry.
 */
export function badgeRequirement(slug: string): string {
  try {
    return BADGE_REQUIREMENT[slug] ?? "a result with no failures";
  } catch {
    return "a result with no failures";
  }
}

/**
 * The live badge image URL for a site.
 *
 * Carries only the tool and the URL, never the score. The endpoint re-reads
 * the current cached run and draws whatever it actually says, so a site owner
 * cannot edit a better number into the snippet they paste, and the badge on
 * their site updates on its own the next time the check runs.
 *
 * @param params - The tool, the checked URL, and an optional dark variant.
 * @param origin - Optional origin override.
 */
export function badgeImageUrl(
  params: { slug: string; targetUrl: string; theme?: "light" | "dark" },
  origin?: string,
): string {
  try {
    const url = new URL(`${shareOrigin(origin)}${BADGE_PATH}`);
    url.searchParams.set("tool", params.slug);
    url.searchParams.set("url", params.targetUrl);
    if (params.theme === "dark") url.searchParams.set("theme", "dark");
    return url.toString();
  } catch {
    return `${shareOrigin(origin)}${BADGE_PATH}`;
  }
}

/**
 * The alt text a badge must carry wherever it is embedded.
 *
 * Quotes are stripped rather than escaped: this string is interpolated into an
 * HTML attribute in the snippet below, and a badge label has no business
 * containing one.
 *
 * @param snapshot - The result being badged.
 */
export function badgeAltText(snapshot: ShareSnapshot): string {
  try {
    const badge = snapshot.badge;
    const raw = badge
      ? `${badge.label} ${badge.value}, checked by Superflow`
      : `${snapshot.toolName} result from Superflow`;
    return raw.replace(/["<>]/g, "");
  } catch {
    return "Checked by Superflow";
  }
}

/**
 * The HTML snippet a site owner pastes to embed their badge.
 *
 * The badge links back to the live result, which is the deal: the site gets a
 * credential, and anybody who doubts it can click through and see the run.
 * `loading="lazy"` and explicit dimensions keep it off the critical path of
 * the page it lands on, because a badge that costs somebody layout shift will
 * be removed within a week.
 *
 * @param snapshot - The result being badged.
 * @param origin - Optional origin override.
 * @param theme - Which badge variant to embed.
 */
export function badgeEmbedHtml(
  snapshot: ShareSnapshot,
  origin?: string,
  theme: "light" | "dark" = "light",
): string {
  const image = badgeImageUrl(
    { slug: snapshot.slug, targetUrl: snapshot.targetUrl, theme },
    origin,
  );
  const link = resultPermalink(snapshot, origin);
  const alt = badgeAltText(snapshot);

  return [
    `<a href="${link}" target="_blank" rel="noopener">`,
    `  <img src="${image}" alt="${alt}" width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" loading="lazy" />`,
    `</a>`,
  ].join("\n");
}

/**
 * The Markdown snippet, for a README or a docs page.
 *
 * @param snapshot - The result being badged.
 * @param origin - Optional origin override.
 * @param theme - Which badge variant to embed.
 */
export function badgeEmbedMarkdown(
  snapshot: ShareSnapshot,
  origin?: string,
  theme: "light" | "dark" = "light",
): string {
  const image = badgeImageUrl(
    { slug: snapshot.slug, targetUrl: snapshot.targetUrl, theme },
    origin,
  );
  return `[![${badgeAltText(snapshot)}](${image})](${resultPermalink(snapshot, origin)})`;
}

/**
 * The sentence that goes with a shared link.
 *
 * Written in the sharer's voice, not ours: somebody posting their own score is
 * not writing an ad for Superflow, and a prefilled tweet that reads like one
 * gets deleted before it is sent.
 *
 * @param snapshot - The result being shared.
 */
export function shareText(snapshot: ShareSnapshot): string {
  try {
    if (snapshot.headline.length > 0) return snapshot.headline;
    return `${snapshot.toolName} result for ${snapshot.hostname}`;
  } catch {
    return snapshot.toolName;
  }
}

/**
 * X's post composer, prefilled.
 *
 * @param snapshot - The result being shared.
 * @param permalink - The link to include.
 */
export function xShareUrl(snapshot: ShareSnapshot, permalink: string): string {
  try {
    const url = new URL("https://x.com/intent/post");
    url.searchParams.set("text", shareText(snapshot));
    url.searchParams.set("url", permalink);
    return url.toString();
  } catch {
    return "https://x.com";
  }
}

/**
 * LinkedIn's share dialog.
 *
 * LinkedIn takes the URL only and reads the rest from the page's Open Graph
 * tags, which is the whole reason each result needs its own card.
 *
 * @param permalink - The link to share.
 */
export function linkedInShareUrl(permalink: string): string {
  try {
    const url = new URL("https://www.linkedin.com/sharing/share-offsite/");
    url.searchParams.set("url", permalink);
    return url.toString();
  } catch {
    return "https://www.linkedin.com";
  }
}

// ─────────────────────────────────────────────────────────────── decoding

/** What the card renderer gets after the query string is validated. */
export type DecodedCard = {
  variant: "score" | "metrics" | "preview";
  slug: string;
  hostname: string;
  headline: string;
  tone: ShareTone;
  score: number | null;
  grade: string;
  metrics: Array<{ label: string; value: string }>;
  preview: {
    title: string;
    description: string;
    imageUrl: string;
    attribution: string;
    rendersCard: boolean;
  } | null;
};

/**
 * Clamps one parameter to something safe to draw.
 *
 * @param value - The raw parameter.
 * @param maxLength - Characters to keep.
 */
function clean(value: string | null, maxLength: number): string {
  try {
    return (value ?? "")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, maxLength);
  } catch {
    return "";
  }
}

/**
 * Reads a snapshot back out of a card URL.
 *
 * Every field is clamped and every count is bounded, because this input is a
 * query string a stranger can write. Anything unreadable degrades to a default
 * rather than failing the render: the card is the last thing standing between
 * a shared link and a broken image, so it always draws something.
 *
 * @param params - The card request's query parameters.
 */
export function decodeCardParams(params: URLSearchParams): DecodedCard {
  try {
    const rawVariant = clean(params.get("v"), 10);
    const variant =
      rawVariant === "preview" || rawVariant === "metrics" ? rawVariant : "score";

    const rawTone = clean(params.get("n"), 10);
    const tone: ShareTone =
      rawTone === "good" || rawTone === "warn" || rawTone === "bad"
        ? rawTone
        : "neutral";

    // Absence and zero are different answers, and `Number(null)` is 0. Without
    // this the tools that do not score decode as scoring zero, which paints
    // every one of their cards in the failing colour.
    const rawScore = params.get("s");
    const parsedScore =
      rawScore === null || rawScore.trim().length === 0
        ? Number.NaN
        : Number(rawScore);
    const score = Number.isFinite(parsedScore)
      ? Math.max(0, Math.min(100, Math.round(parsedScore)))
      : null;

    const metrics = clean(params.get("m"), 240)
      .split(METRIC_SEPARATOR)
      .map((entry) => {
        const index = entry.indexOf(METRIC_PAIR);
        if (index < 0) return null;
        const label = entry.slice(0, index).trim();
        const value = entry.slice(index + 1).trim();
        if (label.length === 0 || value.length === 0) return null;
        return { label: label.slice(0, 28), value: value.slice(0, 24) };
      })
      .filter((entry): entry is { label: string; value: string } => entry !== null)
      .slice(0, 3);

    const previewTitle = clean(params.get("pt"), 90);
    // Shorter than the snapshot's own 160, because this one is drawn into a
    // fixed-height box: past two lines the mock card grows and pushes the
    // footer off the canvas.
    const previewDescription = clean(params.get("pd"), 120);
    const previewImage = clean(params.get("pi"), 600);
    const previewAttribution = clean(params.get("pa"), 60);
    const hasPreview =
      previewTitle.length > 0 ||
      previewDescription.length > 0 ||
      previewImage.length > 0;

    return {
      variant,
      slug: clean(params.get("t"), 60),
      // `domain` is the parameter this endpoint shipped with, before the card
      // was shared by more than one tool. Cards already posted to X and Slack
      // still carry it, and they still have to render.
      hostname: clean(params.get("h"), 60) || clean(params.get("domain"), 60),
      headline: clean(params.get("hl"), 120),
      tone,
      score,
      grade: clean(params.get("g"), 2).toUpperCase(),
      metrics,
      preview:
        variant === "preview" && hasPreview
          ? {
              title: previewTitle,
              description: previewDescription,
              imageUrl: previewImage,
              attribution: previewAttribution,
              rendersCard: params.get("pc") !== "0",
            }
          : null,
    };
  } catch {
    return {
      variant: "score",
      slug: "",
      hostname: "",
      headline: "",
      tone: "neutral",
      score: null,
      grade: "",
      metrics: [],
      preview: null,
    };
  }
}
