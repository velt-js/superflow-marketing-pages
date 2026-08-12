// UTM campaign URL building, normalization, and validation.
//
// WHY THIS IS NOT JUST STRING CONCATENATION
//
// Every UTM builder on the web joins five inputs with ampersands. The thing
// that actually breaks campaign reporting is not the joining, it is that
// "Facebook", "facebook", and "FaceBook" become three separate rows in GA4,
// and that a medium GA4 does not recognise drops the whole campaign into
// Unassigned where nobody looks at it. So this module does three jobs:
// normalize values to a convention, tell you which GA4 channel the link will
// land in, and warn about the mistakes that silently cost you the data.
//
// Everything here is pure. No network, no storage, no React. The tool runs
// entirely in the browser, so a campaign URL and whatever is embedded in it
// never reaches a server.

/** How values are cased before they go in the URL. */
export type UtmCaseRule = "lower" | "preserve";

/** What happens to spaces inside a value. */
export type UtmSpaceRule = "underscore" | "hyphen" | "preserve";

/**
 * A team's tagging convention. The point of saving one is that everybody
 * produces the same string for the same placement, which is the difference
 * between one row in a report and four.
 */
export type UtmConvention = {
  caseRule: UtmCaseRule;
  spaceRule: UtmSpaceRule;
  /** Drops accents and punctuation that make report rows hard to match. */
  stripPunctuation: boolean;
};

export const DEFAULT_CONVENTION: UtmConvention = {
  caseRule: "lower",
  spaceRule: "underscore",
  stripPunctuation: true,
};

export const UTM_FIELDS = [
  "source",
  "medium",
  "campaign",
  "id",
  "term",
  "content",
] as const;

export type UtmField = (typeof UTM_FIELDS)[number];

export type UtmParams = Record<UtmField, string>;

export const EMPTY_PARAMS: UtmParams = {
  source: "",
  medium: "",
  campaign: "",
  id: "",
  term: "",
  content: "",
};

/** Query-string name for each field. */
export const UTM_QUERY_KEYS: Record<UtmField, string> = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  id: "utm_id",
  term: "utm_term",
  content: "utm_content",
};

/** Human labels, used for both the form and the issue messages. */
export const UTM_FIELD_LABELS: Record<UtmField, string> = {
  source: "Source",
  medium: "Medium",
  campaign: "Campaign",
  id: "Campaign ID",
  term: "Term",
  content: "Content",
};

export type UtmIssueLevel = "error" | "warning";

export type UtmIssue = {
  /** Stable identifier, so the UI can key on it and tests can assert on it. */
  id: string;
  level: UtmIssueLevel;
  /** The field the issue belongs to, or "url" for the destination. */
  field: UtmField | "url";
  message: string;
};

export type UtmBuildResult = {
  /** The finished URL. Empty when there is nothing to build or it failed. */
  url: string;
  /** The values actually written, after the convention was applied. */
  normalized: UtmParams;
  issues: UtmIssue[];
};

/** Matches a string that already starts with a scheme. */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Accent-combining marks, removed after NFKD decomposition. */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/** Everything punctuation-stripping keeps. */
const SAFE_VALUE_CHARS = /[^a-zA-Z0-9 _\-.]/g;

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Nine or more consecutive digits: a phone number or an account number. */
const LONG_DIGIT_RUN = /\d{9,}/;

/**
 * Long enough that some email platforms and older proxies truncate the link.
 * 2048 is the practical ceiling people hit in the wild.
 */
const MAX_URL_LENGTH = 2048;

/** Mediums people use for links inside their own site, which they should not. */
const INTERNAL_MEDIUMS = new Set([
  "internal",
  "internal_link",
  "internal-link",
  "internallink",
  "intranet",
  "onsite",
  "on_site",
  "on-site",
]);

/**
 * The GA4 default channel group a medium lands in.
 *
 * GA4 decides most channels from utm_medium alone. The paid family is the
 * exception: it needs the source too, because Google splits paid traffic into
 * Search, Social, Video, and Shopping based on which site the source is. The
 * label says so rather than guessing.
 *
 * A null return means GA4 will not recognise the medium and the traffic lands
 * in Unassigned, which is the single most common way a campaign disappears.
 *
 * @param medium - The utm_medium value, raw or normalized.
 */
export function channelForMedium(medium: string): string | null {
  try {
    const value = medium.trim().toLowerCase();
    if (!value) return null;

    if (value === "organic") return "Organic Search";
    if (["email", "e-mail", "e_mail", "e mail"].includes(value)) return "Email";
    if (value === "affiliate") return "Affiliates";
    if (value === "referral") return "Referral";
    if (value === "audio") return "Audio";
    if (value === "sms") return "SMS";
    if (
      [
        "social",
        "social-network",
        "social-media",
        "social_network",
        "social_media",
        "sm",
        "social network",
        "social media",
      ].includes(value)
    ) {
      return "Organic Social";
    }
    if (
      ["display", "banner", "expandable", "interstitial", "cpm"].includes(value)
    ) {
      return "Display";
    }
    if (
      value.endsWith("push") ||
      value.includes("mobile") ||
      value.includes("notification")
    ) {
      return "Mobile Push Notifications";
    }
    // GA4's paid rule, in its own words: medium matching cp*, ppc,
    // retargeting, or paid*. Checked last so "cpm" reaches Display first.
    if (
      value.includes("cp") ||
      value === "ppc" ||
      value === "retargeting" ||
      value.startsWith("paid")
    ) {
      return "Paid. Which paid channel depends on the source.";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Applies a convention to one value.
 *
 * @param raw - What the user typed.
 * @param convention - The team's rules.
 */
export function normalizeValue(raw: string, convention: UtmConvention): string {
  try {
    let value = raw.trim();
    if (!value) return "";

    if (convention.caseRule === "lower") value = value.toLowerCase();

    if (convention.stripPunctuation) {
      // Decompose accents first so "Café" becomes "Cafe" rather than "Caf".
      value = value.normalize("NFKD").replace(COMBINING_MARKS, "");
      value = value.replace(SAFE_VALUE_CHARS, "");
    }

    // Collapse runs of whitespace before the space rule runs, so "spring
    // sale" and "spring  sale" cannot become two different tags.
    value = value.replace(/\s+/g, " ").trim();

    if (convention.spaceRule === "underscore") value = value.replace(/ /g, "_");
    if (convention.spaceRule === "hyphen") value = value.replace(/ /g, "-");

    return value;
  } catch {
    return "";
  }
}

/**
 * Applies the convention to every field.
 *
 * @param params - The raw field values.
 * @param convention - The team's rules.
 */
export function normalizeParams(
  params: UtmParams,
  convention: UtmConvention,
): UtmParams {
  try {
    const out = { ...EMPTY_PARAMS };
    for (const field of UTM_FIELDS) {
      out[field] = normalizeValue(params[field] ?? "", convention);
    }
    return out;
  } catch {
    return { ...EMPTY_PARAMS };
  }
}

/**
 * Collects everything worth telling the user about a finished link.
 *
 * @param params - The parsed URL, the normalized values, and the raw ones.
 */
function collectIssues({
  parsed,
  normalized,
  raw,
  hadExistingUtm,
  finalUrl,
}: {
  parsed: URL;
  normalized: UtmParams;
  /** What the user typed. The personal-data checks read this, not the
      normalized value: stripping punctuation turns an email address into
      something the pattern no longer matches, while the personal data is
      still sitting in the report. */
  raw: UtmParams;
  hadExistingUtm: boolean;
  finalUrl: string;
}): UtmIssue[] {
  const issues: UtmIssue[] = [];

  // The two GA4 needs to attribute anything at all.
  if (!normalized.source) {
    issues.push({
      id: "source-missing",
      level: "error",
      field: "source",
      message:
        "Source is required. Without it the visit is reported as direct traffic.",
    });
  }
  if (!normalized.medium) {
    issues.push({
      id: "medium-missing",
      level: "error",
      field: "medium",
      message:
        "Medium is required. Without it GA4 cannot put the visit in a channel.",
    });
  }
  if (!normalized.campaign) {
    issues.push({
      id: "campaign-missing",
      level: "warning",
      field: "campaign",
      message:
        "No campaign name. The link still tracks, but you will not be able to group it with the rest of the campaign.",
    });
  }

  if (parsed.protocol === "http:") {
    issues.push({
      id: "url-insecure",
      level: "warning",
      field: "url",
      message:
        "The link uses http. Most sites redirect to https, and some redirects drop the query string along with your tags.",
    });
  }

  if (hadExistingUtm) {
    issues.push({
      id: "url-has-utm",
      level: "warning",
      field: "url",
      message:
        "That URL already had campaign tags. They were replaced by the values below.",
    });
  }

  if (parsed.hash) {
    issues.push({
      id: "url-has-fragment",
      level: "warning",
      field: "url",
      message:
        "The link has a # fragment. Tags go before it, which is correct, but check that your site does not route on the fragment and drop the query string.",
    });
  }

  if (normalized.medium) {
    if (INTERNAL_MEDIUMS.has(normalized.medium)) {
      issues.push({
        id: "medium-internal",
        level: "warning",
        field: "medium",
        message:
          "This looks like a link between pages of your own site. Tagging those starts a new session and throws away the source that brought the person in.",
      });
    } else if (normalized.medium === "organic") {
      issues.push({
        id: "medium-organic",
        level: "warning",
        field: "medium",
        message:
          "A medium of organic overwrites real search traffic in your reports. Use cpc for paid search.",
      });
    } else if (channelForMedium(normalized.medium) === null) {
      issues.push({
        id: "medium-unrecognized",
        level: "warning",
        field: "medium",
        message: `GA4 does not recognise "${normalized.medium}", so this traffic lands in Unassigned. Common values are email, cpc, social, referral, affiliate, display, and sms.`,
      });
    }
  }

  // Personal data in a campaign tag is a policy problem, not a style one.
  // Tested against the raw input for the reason given on the parameter.
  for (const field of UTM_FIELDS) {
    // Nothing ships for this field, so there is nothing to warn about.
    if (!normalized[field]) continue;
    const value = raw[field] ?? "";
    if (EMAIL_PATTERN.test(value)) {
      issues.push({
        id: `pii-email-${field}`,
        level: "warning",
        field,
        message: `${UTM_FIELD_LABELS[field]} looks like it contains an email address. Google's terms ban personal data in analytics and they can delete the data.`,
      });
    } else if (LONG_DIGIT_RUN.test(value)) {
      issues.push({
        id: `pii-digits-${field}`,
        level: "warning",
        field,
        message: `${UTM_FIELD_LABELS[field]} contains a long run of digits. If that is a phone number or a customer ID, take it out. Personal data is not allowed in analytics.`,
      });
    }
  }

  // Only worth saying when the user chose to keep what the convention would
  // have fixed. Otherwise it is noise about a problem that no longer exists.
  for (const field of UTM_FIELDS) {
    const value = normalized[field];
    if (!value) continue;
    if (value !== value.toLowerCase()) {
      issues.push({
        id: `case-${field}`,
        level: "warning",
        field,
        message: `${UTM_FIELD_LABELS[field]} has capital letters. Analytics tools treat Facebook and facebook as two different values, so pick one and stay with it.`,
      });
    }
    if (value.includes(" ")) {
      issues.push({
        id: `space-${field}`,
        level: "warning",
        field,
        message: `${UTM_FIELD_LABELS[field]} contains a space. It will work, but the link becomes hard to read and easy to break when someone pastes it.`,
      });
    }
  }

  if (normalized.term && normalized.medium && !normalized.medium.includes("cp")) {
    issues.push({
      id: "term-without-paid",
      level: "warning",
      field: "term",
      message:
        "Term is for paid search keywords. On anything else it is usually left empty and ignored.",
    });
  }

  if (finalUrl.length > MAX_URL_LENGTH) {
    issues.push({
      id: "url-too-long",
      level: "warning",
      field: "url",
      message: `The finished link is ${finalUrl.length} characters. Some email platforms truncate past about ${MAX_URL_LENGTH}.`,
    });
  }

  return issues;
}

/**
 * Builds a campaign URL.
 *
 * Existing utm parameters on the destination are removed and rewritten in a
 * fixed order, so the same inputs always produce the same string. Any other
 * query parameter the URL already carried is left alone.
 *
 * @param options - The destination, the field values, and the convention.
 */
export function buildCampaignUrl({
  url,
  params,
  convention,
}: {
  url: string;
  params: UtmParams;
  convention: UtmConvention;
}): UtmBuildResult {
  try {
    const normalized = normalizeParams(params, convention);
    const trimmed = url.trim();

    if (!trimmed) {
      return { url: "", normalized, issues: [] };
    }

    // People paste "example.com/page" far more often than they type a
    // scheme. Assume https rather than refusing.
    const withScheme = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;

    let parsed: URL;
    try {
      parsed = new URL(withScheme);
    } catch {
      return {
        url: "",
        normalized,
        issues: [
          {
            id: "url-invalid",
            level: "error",
            field: "url",
            message: "That does not look like a web address.",
          },
        ],
      };
    }

    // A copy button that can hand someone a javascript: URL is a hole, not a
    // feature. Same reasoning as the link allowlist in the Markdown Viewer.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return {
        url: "",
        normalized,
        issues: [
          {
            id: "url-scheme",
            level: "error",
            field: "url",
            message:
              "Only http and https links can be tagged. Anything else is not a page a campaign can send someone to.",
          },
        ],
      };
    }

    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return {
        url: "",
        normalized,
        issues: [
          {
            id: "url-no-host",
            level: "error",
            field: "url",
            message: "That address is missing a domain name.",
          },
        ],
      };
    }

    const hadExistingUtm = UTM_FIELDS.some((field) =>
      parsed.searchParams.has(UTM_QUERY_KEYS[field]),
    );

    // Delete first, then set in field order, so output ordering is stable
    // regardless of what the pasted URL happened to carry.
    for (const field of UTM_FIELDS) {
      parsed.searchParams.delete(UTM_QUERY_KEYS[field]);
    }
    for (const field of UTM_FIELDS) {
      const value = normalized[field];
      if (value) parsed.searchParams.set(UTM_QUERY_KEYS[field], value);
    }

    const finalUrl = parsed.toString();

    return {
      url: finalUrl,
      normalized,
      issues: collectIssues({
        parsed,
        normalized,
        raw: params,
        hadExistingUtm,
        finalUrl,
      }),
    };
  } catch {
    return { url: "", normalized: { ...EMPTY_PARAMS }, issues: [] };
  }
}

/**
 * Pulls the campaign tags back out of a URL that already has them.
 *
 * Used for the "load these into the fields" affordance, so somebody auditing
 * a link marketing sent them can see what it was tagged with.
 *
 * @param raw - A URL that may carry utm parameters.
 */
export function parseCampaignUrl(
  raw: string,
): { base: string; params: UtmParams } | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const withScheme = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    const params = { ...EMPTY_PARAMS };
    let found = false;
    for (const field of UTM_FIELDS) {
      const value = parsed.searchParams.get(UTM_QUERY_KEYS[field]);
      if (value !== null) {
        params[field] = value;
        found = true;
      }
      parsed.searchParams.delete(UTM_QUERY_KEYS[field]);
    }

    if (!found) return null;
    return { base: parsed.toString(), params };
  } catch {
    return null;
  }
}

/** One finished link, held in the list under the builder. */
export type SavedLink = {
  /** Stable per-session key for React. Not persisted anywhere. */
  key: string;
  finalUrl: string;
  params: UtmParams;
};

/**
 * Escapes one CSV cell.
 *
 * @param value - The raw cell text.
 */
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/**
 * Renders the saved links as CSV, for pasting into a campaign tracker.
 *
 * @param links - The links currently in the list.
 */
export function buildCsv(links: SavedLink[]): string {
  try {
    const header = [
      "url",
      ...UTM_FIELDS.map((field) => UTM_QUERY_KEYS[field]),
    ].map(csvCell);

    const rows = links.map((link) =>
      [link.finalUrl, ...UTM_FIELDS.map((field) => link.params[field])]
        .map(csvCell)
        .join(","),
    );

    return [header.join(","), ...rows].join("\r\n");
  } catch {
    return "";
  }
}
