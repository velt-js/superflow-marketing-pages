// Shapes returned by the two JSON-LD engines in the Superflow backend.
//
// These are transcribed from real terminal responses, not from a spec. Both
// tools run through the same `anonymoushandler` start/poll contract, and the
// terminal poll carries two things: the report (`data`) and a flat findings
// array on the envelope.
//
// The two engines report their checks differently, and the difference matters:
//
//   json-ld-generator  keeps its checks nested under `validation.findings`,
//                      where each entry is a full check: category, status,
//                      why, fix, and sometimes a snippet.
//   json-ld-validator  has the same checks internally, but the free-tools
//                      layer lifts the report's top-level `findings` onto the
//                      envelope and flattens them on the way. What arrives is
//                      the annotation shape (title, description, severity),
//                      only for checks that failed or warned, with `why` and
//                      `fix` already concatenated into `description`.
//
// So the validator's category roll-up comes from `categories` (which counts
// passes too) and the issue list comes from the envelope. `normalizeChecks`
// below turns either shape into one, so the components render one thing.

/** The four questions every check belongs to. Order is the render order. */
export const JSON_LD_CATEGORY_IDS = [
  "syntax",
  "eligibility",
  "values",
  "coherence",
] as const;

export type JsonLdCategoryId = (typeof JSON_LD_CATEGORY_IDS)[number];

export type JsonLdCheckStatus = "pass" | "warn" | "fail";

export type JsonLdSeverity = "critical" | "high" | "medium" | "low" | "info";

/** Per-category roll-up. Present on both engines' reports. */
export type JsonLdCategoryScore = {
  id: JsonLdCategoryId;
  /** "Syntax", "Eligibility", "Values", "Coherence". */
  label: string;
  /** The plain-words question the category answers. */
  question: string;
  passCount: number;
  warnCount: number;
  failCount: number;
};

/**
 * One check, in the full shape. This is what the generator returns for its
 * own output, and what `normalizeChecks` produces for the validator.
 */
export type JsonLdCheck = {
  /** Stable check id: S1, S2, S3, E1, V1 to V4, C1 to C3. */
  id: string;
  category: JsonLdCategoryId;
  status: JsonLdCheckStatus;
  title: string;
  /** Why the check exists, in the engine's own words. */
  why: string;
  /** What to do about it. "Nothing to do." when the check passed. */
  fix: string;
  /** A paste-ready fragment, on the checks that can offer one. */
  fixSnippet?: string;
  /** "minutes" | "hour" | "project". */
  effort?: string;
};

/** Per-type rich-result verdict: what Google wants against what the page has. */
export type JsonLdTypeEligibility = {
  /** The schema.org type, e.g. "Article". */
  type: string;
  /** True when nothing required is missing. */
  eligible: boolean;
  /** Required properties this page does not have. */
  missingRequired: string[];
  /** Recommended properties this page does not have. */
  missingRecommended: string[];
  /** True when Google documents a rich result for this type. */
  googleSupported: boolean;
};

/** What the engine says it did and did not look at. */
export type JsonLdScopeDeclaration = {
  checked: string[];
  notChecked: string[];
};

/** The json-ld-validator report, exactly as the backend returns it. */
export type JsonLdValidatorReport = {
  requestedUrl: string;
  finalUrl: string;
  hostname: string;
  httpStatus: number;
  /** How many <script type="application/ld+json"> blocks were read. */
  blockCount: number;
  /** How many of those did not parse as JSON. */
  invalidBlockCount: number;
  /** Every @type declared across every block, de-duplicated. */
  declaredTypes: string[];
  eligibility: JsonLdTypeEligibility[];
  categories: JsonLdCategoryScore[];
  noStructuredData: boolean;
  durationMs: number;
  totalFindings: number;
  severityCounts: Partial<Record<JsonLdSeverity, number>>;
  scopeDeclaration?: JsonLdScopeDeclaration;
  /** Present when the page could not be read at all. */
  error?: string;
  /** Present only if the backend stops lifting checks onto the envelope. */
  findings?: JsonLdCheck[];
};

/** The json-ld-generator report, exactly as the backend returns it. */
export type JsonLdGeneratorReport = {
  /** The URL the generator actually read, after redirects. */
  url: string;
  requestedUrl: string;
  httpStatus: number;
  /** The schema.org type the model chose for the page, e.g. "FAQPage". */
  detectedType: string;
  /** The generated block as an object. */
  jsonLd: Record<string, unknown>;
  /** The same block, pretty printed. This is what the visitor copies. */
  jsonLdString: string;
  /** The engine's own validation of what it just generated. */
  validation: {
    findings: JsonLdCheck[];
    /** True when no check failed. Warnings do not clear it to false. */
    passed: boolean;
  };
  /** The model that wrote it, e.g. "claude-opus-5". */
  model: string;
  /** What this run cost, in millionths of a US dollar. */
  costMicroUsd: number;
  durationMs: number;
  totalFindings: number;
  severityCounts: Partial<Record<JsonLdSeverity, number>>;
  scopeDeclaration?: JsonLdScopeDeclaration;
  error?: string;
};

/**
 * The flattened finding shape the free-tools envelope carries. Only failed
 * and warned checks appear; `description` is the check's `why` and `fix`
 * joined with a space.
 */
export type JsonLdEnvelopeFinding = {
  id: string;
  title: string;
  description: string;
  severity: JsonLdSeverity;
  sourceUrl?: string;
};

/** Category id from a check id: S1 is syntax, C3 is coherence, and so on. */
const CATEGORY_BY_PREFIX: Record<string, JsonLdCategoryId> = {
  S: "syntax",
  E: "eligibility",
  V: "values",
  C: "coherence",
};

/** Severities that mean the check failed rather than warned. */
const FAILING_SEVERITIES = new Set<JsonLdSeverity>(["critical", "high"]);

/**
 * The category a check belongs to, read from its id prefix.
 *
 * Envelope findings carry a composite id (`C1-https://example.com`), so the
 * prefix is taken from the first character rather than by splitting.
 *
 * @param id - The check id, composite or not.
 */
function categoryFromId(id: string): JsonLdCategoryId {
  try {
    return CATEGORY_BY_PREFIX[id.charAt(0).toUpperCase()] ?? "syntax";
  } catch {
    return "syntax";
  }
}

/**
 * Turns the envelope's flattened findings into full checks.
 *
 * Two fields cannot be recovered and are not invented: the pass/warn/fail
 * split is derived from severity, and `why` and `fix` arrive already joined,
 * so the whole string is put in `fix`. That is the field the UI renders as
 * the thing to do about it, and the joined text reads correctly there.
 *
 * @param findings - The envelope's findings array.
 */
export function normalizeChecks(findings: JsonLdEnvelopeFinding[]): JsonLdCheck[] {
  try {
    return findings.map((finding) => ({
      id: finding.id,
      category: categoryFromId(finding.id),
      status: FAILING_SEVERITIES.has(finding.severity)
        ? ("fail" as const)
        : ("warn" as const),
      title: finding.title,
      why: "",
      fix: finding.description,
    }));
  } catch {
    return [];
  }
}

/**
 * The checks to render for a validator run.
 *
 * Prefers the report's own `findings` when the backend leaves them there,
 * because those carry the pass/warn/fail split and the separate `why` and
 * `fix`. Falls back to normalizing the envelope, which is what happens today.
 *
 * @param params - The report and the envelope's findings array.
 */
export function checksForValidatorReport({
  report,
  envelopeFindings,
}: {
  report: JsonLdValidatorReport;
  envelopeFindings: JsonLdEnvelopeFinding[];
}): JsonLdCheck[] {
  try {
    if (Array.isArray(report.findings) && report.findings.length > 0) {
      return report.findings;
    }
    return normalizeChecks(envelopeFindings);
  } catch {
    return [];
  }
}

/** Groups checks by category, preserving the canonical category order. */
export function groupChecksByCategory(
  checks: JsonLdCheck[],
): Record<JsonLdCategoryId, JsonLdCheck[]> {
  const grouped: Record<JsonLdCategoryId, JsonLdCheck[]> = {
    syntax: [],
    eligibility: [],
    values: [],
    coherence: [],
  };
  try {
    for (const check of checks) {
      const bucket = grouped[check.category] ?? grouped.syntax;
      bucket.push(check);
    }
    return grouped;
  } catch {
    return grouped;
  }
}
