// The Social Preview Checker's report shape.
//
// The engine lives in the Superflow product backend and reaches us through
// the deferred runner, which passes its `data` through as `unknown`. These
// types are the marketing site's reading of that contract, and
// `normalizeReport` is the seam: it turns whatever arrived into something the
// card renderer can trust, or into null when the payload is not a report at
// all.
//
// Nothing here invents a value. A field the backend did not send comes back
// empty, and the UI says "not found" rather than guessing. The one place that
// would be tempting is the per-platform character limits behind `truncated`,
// and they are deliberately absent: the engine owns those rules, dates them
// with `requirementsReviewedOn`, and already writes them into the note text.
// A second copy here would drift the first time a platform changed.
//
// Findings do NOT arrive inside `data`. They ride the run envelope alongside
// it, so the API route merges them in and the cache holds one object.

/** Bump when this shape changes, so stale cache entries are ignored. */
export const REPORT_VERSION = 1;

/**
 * One field on one platform's card. `from` names the tag the value came from,
 * which is the thing that tells someone which tag to edit. Empty `value` and
 * empty `from` together mean the platform found nothing to show.
 */
export type PreviewField = {
  value: string;
  /** The tag this came from, e.g. "og:title", "<title>", "meta description". */
  from: string;
  /** True when the platform will cut the value short. */
  truncated: boolean;
  /** Length before any cut, in characters. */
  originalLength: number;
};

/** How a per-platform note reads. `fail` and `warn` are what we surface. */
export type PreviewNoteStatus = "pass" | "warn" | "fail";

export type PreviewNote = {
  id: string;
  status: PreviewNoteStatus;
  message: string;
};

/**
 * The shape the platform renders. `large-image` is the wide card, `thumbnail`
 * is the small square beside the text, `text-only` is no image at all.
 */
export type PreviewLayout = "large-image" | "thumbnail" | "text-only";

export type PlatformPreview = {
  /** Machine id: x, linkedin, facebook, slack, discord, google. */
  platform: string;
  /** Display name, e.g. "X (Twitter)". */
  platformName: string;
  title: PreviewField;
  description: PreviewField;
  image: PreviewField;
  /** The line the platform shows for the source, a domain or a full URL. */
  attribution: string;
  layout: PreviewLayout;
  willRenderCard: boolean;
  notes: PreviewNote[];
};

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

/** One page-level finding with its fix. */
export type SocialPreviewFinding = {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  sourceUrl?: string;
};

export type PreviewSummary = {
  passed: number;
  warnings: number;
  failed: number;
  platformsWithImage: number;
  platformsChecked: number;
};

export type SocialPreviewReport = {
  /** The URL the engine actually read, after redirects. */
  url: string;
  /** The submitted URL after normalization. */
  requestedUrl: string;
  httpStatus: number;
  /** Every tag the page declares, keyed the way the engine names them. */
  tags: Record<string, string>;
  previews: PlatformPreview[];
  summary: PreviewSummary;
  durationMs: number;
  /** The date the platform rules behind this report were last reviewed. */
  requirementsReviewedOn: string;
  /** What the engine looked at, and what it did not. */
  scopeDeclaration: { checked: string[]; notChecked: string[] };
  /** Merged in from the run envelope by the API route. */
  findings: SocialPreviewFinding[];
  totalFindings: number;
};

/** True for a plain object, so property reads below are safe. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Reads a string property, defaulting to empty.
 *
 * @param source - The object to read from.
 * @param key - The property name.
 */
function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

/**
 * Reads a finite number property, defaulting to zero.
 *
 * @param source - The object to read from.
 * @param key - The property name.
 */
function readNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * Reads an array of strings, dropping anything that is not one.
 *
 * @param value - The candidate array.
 */
function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/**
 * Normalizes one field object. A missing field is not an error: a page with
 * no og:image produces exactly this.
 *
 * @param value - The raw field from the backend.
 */
function toField(value: unknown): PreviewField {
  if (!isRecord(value)) {
    return { value: "", from: "", truncated: false, originalLength: 0 };
  }
  return {
    value: readString(value, "value"),
    from: readString(value, "from"),
    truncated: value.truncated === true,
    originalLength: readNumber(value, "originalLength"),
  };
}

/**
 * Normalizes one note. An unrecognised status reads as a warning rather than
 * being dropped, because losing a message the engine wrote is worse than
 * showing it in the wrong colour.
 *
 * @param value - The raw note from the backend.
 */
function toNote(value: unknown, index: number): PreviewNote {
  const source = isRecord(value) ? value : {};
  const status = readString(source, "status");
  return {
    id: readString(source, "id") || `note-${index}`,
    status:
      status === "pass" || status === "fail" || status === "warn"
        ? status
        : "warn",
    message: readString(source, "message"),
  };
}

/**
 * Normalizes one platform preview.
 *
 * @param value - The raw preview from the backend.
 */
function toPreview(value: unknown): PlatformPreview | null {
  if (!isRecord(value)) return null;

  const platform = readString(value, "platform");
  if (platform.length === 0) return null;

  const layout = readString(value, "layout");

  return {
    platform,
    platformName: readString(value, "platformName") || platform,
    title: toField(value.title),
    description: toField(value.description),
    image: toField(value.image),
    attribution: readString(value, "attribution"),
    layout:
      layout === "large-image" || layout === "thumbnail" || layout === "text-only"
        ? layout
        : "text-only",
    willRenderCard: value.willRenderCard !== false,
    notes: Array.isArray(value.notes) ? value.notes.map(toNote) : [],
  };
}

/**
 * Normalizes one page-level finding.
 *
 * @param value - The raw finding from the run envelope.
 */
function toFinding(value: unknown, index: number): SocialPreviewFinding | null {
  if (!isRecord(value)) return null;

  const title = readString(value, "title");
  if (title.length === 0) return null;

  const severity = readString(value, "severity");

  return {
    id: readString(value, "id") || `finding-${index}`,
    title,
    description: readString(value, "description"),
    severity:
      severity === "critical" ||
      severity === "high" ||
      severity === "medium" ||
      severity === "low" ||
      severity === "info"
        ? severity
        : "info",
    ...(readString(value, "sourceUrl")
      ? { sourceUrl: readString(value, "sourceUrl") }
      : {}),
  };
}

/**
 * Turns the backend's terminal payload into a report, or null when it is not
 * one. A payload with no previews is treated as not-a-report: an empty card
 * list is indistinguishable from a broken run, and rendering nothing while
 * claiming success is the one outcome worth refusing.
 *
 * @param data - The terminal `data` from the run.
 * @param findings - The findings from the run envelope, which sit beside
 *   `data` rather than inside it.
 */
export function normalizeReport(
  data: unknown,
  findings: unknown[],
): SocialPreviewReport | null {
  try {
    if (!isRecord(data)) return null;

    const previews = Array.isArray(data.previews)
      ? data.previews
          .map(toPreview)
          .filter((preview): preview is PlatformPreview => preview !== null)
      : [];

    if (previews.length === 0) return null;

    const rawTags = isRecord(data.tags) ? data.tags : {};
    const tags: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawTags)) {
      if (typeof value === "string" && value.length > 0) {
        tags[key] = value;
      }
    }

    const summarySource = isRecord(data.summary) ? data.summary : {};
    const scopeSource = isRecord(data.scopeDeclaration)
      ? data.scopeDeclaration
      : {};

    const normalizedFindings = findings
      .map(toFinding)
      .filter((finding): finding is SocialPreviewFinding => finding !== null);

    return {
      url: readString(data, "url"),
      requestedUrl: readString(data, "requestedUrl"),
      httpStatus: readNumber(data, "httpStatus"),
      tags,
      previews,
      summary: {
        passed: readNumber(summarySource, "passed"),
        warnings: readNumber(summarySource, "warnings"),
        failed: readNumber(summarySource, "failed"),
        platformsWithImage: readNumber(summarySource, "platformsWithImage"),
        platformsChecked:
          readNumber(summarySource, "platformsChecked") || previews.length,
      },
      durationMs: readNumber(data, "durationMs"),
      requirementsReviewedOn: readString(data, "requirementsReviewedOn"),
      scopeDeclaration: {
        checked: readStringArray(scopeSource.checked),
        notChecked: readStringArray(scopeSource.notChecked),
      },
      findings: normalizedFindings,
      totalFindings: readNumber(data, "totalFindings") || normalizedFindings.length,
    };
  } catch {
    return null;
  }
}

/**
 * The real tag name behind each key the engine uses. Shown verbatim so the
 * reader can search their own page source for it.
 */
const TAG_LABELS: Record<string, string> = {
  title: "<title>",
  description: "meta description",
  canonical: "link rel=canonical",
  ogTitle: "og:title",
  ogDescription: "og:description",
  ogImage: "og:image",
  ogImageAlt: "og:image:alt",
  ogUrl: "og:url",
  ogType: "og:type",
  ogSiteName: "og:site_name",
  twitterCard: "twitter:card",
  twitterTitle: "twitter:title",
  twitterDescription: "twitter:description",
  twitterImage: "twitter:image",
  twitterImageAlt: "twitter:image:alt",
  twitterSite: "twitter:site",
  twitterCreator: "twitter:creator",
};

/**
 * The tag name to display for one of the engine's tag keys.
 *
 * A key we have not seen before still gets a sensible name rather than being
 * hidden, because a tag the page declares is worth showing even when this
 * table has not caught up with the engine.
 *
 * @param key - The key as the engine named it, e.g. "ogSiteName".
 */
export function tagLabel(key: string): string {
  try {
    const known = TAG_LABELS[key];
    if (known) return known;

    if (key.startsWith("og") && key.length > 2) {
      return `og:${key.slice(2).replace(/([A-Z])/g, ":$1").toLowerCase().replace(/^:/, "")}`;
    }
    if (key.startsWith("twitter") && key.length > 7) {
      return `twitter:${key.slice(7).replace(/([A-Z])/g, ":$1").toLowerCase().replace(/^:/, "")}`;
    }
    return key;
  } catch {
    return key;
  }
}
