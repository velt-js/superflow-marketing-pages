// JSON-LD extraction and validation.
//
// Structured data is how an answer engine knows that "Superflow" the string
// on the page is Superflow the organization, with these social profiles and
// this logo. A page can be perfectly readable and still be uncitable because
// nothing on it establishes identity.
//
// Parse errors matter as much as absence: a JSON-LD block with a trailing
// comma is silently ignored by every consumer, so the site owner believes
// they have structured data when they have none. We report the exact block
// and the parser's message.

/** Schema types that establish site or brand identity. */
export const IDENTITY_TYPES = ["Organization", "WebSite"] as const;

/** Schema types worth calling out when present, in reporting order. */
export const NOTABLE_TYPES = [
  "Article",
  "BlogPosting",
  "NewsArticle",
  "Product",
  "FAQPage",
  "HowTo",
  "SoftwareApplication",
  "BreadcrumbList",
  "LocalBusiness",
  "Person",
  "Event",
  "Recipe",
  "VideoObject",
] as const;

export type JsonLdBlock = {
  /** Zero-based index of the `<script type="application/ld+json">` block. */
  index: number;
  raw: string;
  parsed: unknown;
};

export type JsonLdParseError = {
  index: number;
  message: string;
  /** First ~200 chars of the offending block, for the UI to show. */
  excerpt: string;
};

export type SchemaAnalysis = {
  blocks: JsonLdBlock[];
  errors: JsonLdParseError[];
  /** Every `@type` found anywhere in the graph, deduped. */
  types: string[];
  hasOrganization: boolean;
  hasWebSite: boolean;
  /** Notable non-identity types present, in NOTABLE_TYPES order. */
  notableTypes: string[];
  /** The Organization node, when one was found. */
  organization: Record<string, unknown> | null;
  /** `sameAs` URLs from the Organization node. */
  sameAs: string[];
  /** `name` from the Organization node. */
  organizationName: string | null;
};

/**
 * Pulls every JSON-LD block out of a document and parses it.
 *
 * @param html - Raw HTML.
 */
export function extractJsonLd(html: string): {
  blocks: JsonLdBlock[];
  errors: JsonLdParseError[];
} {
  const blocks: JsonLdBlock[] = [];
  const errors: JsonLdParseError[] = [];

  try {
    const pattern =
      /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html ?? "")) !== null) {
      const raw = match[1].trim();
      if (raw.length === 0) {
        index += 1;
        continue;
      }

      try {
        blocks.push({ index, raw, parsed: JSON.parse(raw) });
      } catch (error) {
        errors.push({
          index,
          message:
            error instanceof Error ? error.message : "Could not parse JSON.",
          excerpt: raw.slice(0, 200),
        });
      }
      index += 1;
    }
  } catch {
    // Return whatever was collected before the failure.
  }

  return { blocks, errors };
}

/**
 * Walks a parsed JSON-LD value and yields every node that carries an
 * `@type`, flattening `@graph` containers and arrays.
 *
 * @param value - Any parsed JSON-LD value.
 */
function* walkNodes(value: unknown): Generator<Record<string, unknown>> {
  try {
    if (Array.isArray(value)) {
      for (const item of value) yield* walkNodes(item);
      return;
    }
    if (value === null || typeof value !== "object") {
      return;
    }

    const node = value as Record<string, unknown>;
    if ("@type" in node) {
      yield node;
    }

    const graph = node["@graph"];
    if (graph !== undefined) {
      yield* walkNodes(graph);
    }

    // Nested entities (publisher, author, mainEntity, itemListElement) carry
    // their own @type and count toward what the page declares.
    for (const [key, child] of Object.entries(node)) {
      if (key === "@graph" || key === "@type" || key === "@context") continue;
      if (child !== null && typeof child === "object") {
        yield* walkNodes(child);
      }
    }
  } catch {
    // Stop walking this branch.
  }
}

/**
 * Normalizes an `@type` value, which may be a string or an array, into a
 * string array.
 *
 * @param value - The raw `@type` value.
 */
function typeNames(value: unknown): string[] {
  try {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * True when a schema type is or extends Organization. Sites legitimately
 * declare narrower types (Corporation, LocalBusiness, OnlineBusiness), and
 * treating those as "no Organization schema" is a false failure.
 *
 * @param type - The type name.
 */
function isOrganizationType(type: string): boolean {
  const normalized = type.toLowerCase();
  return (
    normalized === "organization" ||
    normalized === "corporation" ||
    normalized === "onlinebusiness" ||
    normalized === "localbusiness" ||
    normalized === "ngo" ||
    normalized === "educationalorganization" ||
    normalized.endsWith("business")
  );
}

/**
 * Extracts and analyses all structured data on a page.
 *
 * @param html - Raw HTML.
 */
export function analyzeSchema(html: string): SchemaAnalysis {
  const { blocks, errors } = extractJsonLd(html);
  const types = new Set<string>();
  let organization: Record<string, unknown> | null = null;

  try {
    for (const block of blocks) {
      for (const node of walkNodes(block.parsed)) {
        const names = typeNames(node["@type"]);
        for (const name of names) {
          types.add(name);
          if (organization === null && isOrganizationType(name)) {
            organization = node;
          }
        }
      }
    }
  } catch {
    // Keep partial results.
  }

  const typeList = [...types];
  const lowered = new Set(typeList.map((type) => type.toLowerCase()));

  const sameAs = (() => {
    try {
      const raw = organization?.["sameAs"];
      if (typeof raw === "string") return [raw];
      if (Array.isArray(raw)) {
        return raw.filter((item): item is string => typeof item === "string");
      }
      return [];
    } catch {
      return [];
    }
  })();

  const organizationName = (() => {
    try {
      const raw = organization?.["name"];
      return typeof raw === "string" && raw.trim().length > 0
        ? raw.trim()
        : null;
    } catch {
      return null;
    }
  })();

  return {
    blocks,
    errors,
    types: typeList,
    hasOrganization: organization !== null,
    hasWebSite: lowered.has("website"),
    notableTypes: NOTABLE_TYPES.filter((type) =>
      lowered.has(type.toLowerCase()),
    ),
    organization,
    sameAs,
    organizationName,
  };
}

/**
 * A minimal, valid Organization + WebSite JSON-LD starter, offered as a
 * copyable fix when check S2 fails.
 *
 * @param params - Site details to bake into the snippet.
 */
export function buildIdentitySnippet(params: {
  siteName: string;
  siteUrl: string;
  logoUrl?: string;
}): string {
  try {
    const { siteName, siteUrl, logoUrl } = params;
    const organization: Record<string, unknown> = {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: siteName,
      url: siteUrl,
      sameAs: [
        "https://www.linkedin.com/company/YOUR-COMPANY",
        "https://x.com/YOUR-HANDLE",
      ],
    };
    if (logoUrl) {
      organization.logo = { "@type": "ImageObject", url: logoUrl };
    }

    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebSite",
          "@id": `${siteUrl}#website`,
          name: siteName,
          url: siteUrl,
          publisher: { "@id": `${siteUrl}#organization` },
        },
      ],
    };

    return `<script type="application/ld+json">\n${JSON.stringify(
      graph,
      null,
      2,
    )}\n</script>`;
  } catch {
    return "";
  }
}
