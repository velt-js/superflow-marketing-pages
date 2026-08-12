// Schema.org helpers for the free tools.
//
// Every tool page gets a SoftwareApplication (via `buildToolAppSchema`) and
// the index gets an ItemList (via `buildToolListSchema`). Those are the two
// shapes search and answer engines actually use for "free X tool" queries:
// the application schema is what can earn a rich result, and the ItemList is
// what lets an engine enumerate the suite rather than treating the index as
// one undifferentiated page.
//
// `offers` with a zero price is not decoration. It is how a machine learns
// the tool is free without parsing marketing copy, and "free" is the whole
// proposition here.

import { SITE_URL } from "./schema";

/** Publisher block, repeated on every tool so each page identifies its owner. */
function publisher() {
  return {
    "@type": "Organization",
    name: "Superflow",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
  };
}

/**
 * SoftwareApplication schema for one tool page.
 *
 * @param params - The tool's name, description, and path.
 */
export function buildToolAppSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  try {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description,
      url: `${SITE_URL}${path}`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      // The signal that matters for a "free tool" query.
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isAccessibleForFree: true,
      publisher: publisher(),
    };
  } catch {
    return {};
  }
}

/**
 * ItemList schema for the tools index.
 *
 * Only tools that actually work are listed. A "coming soon" entry in an
 * ItemList points a crawler at a page that does not exist yet, which is a
 * worse outcome than a shorter list.
 *
 * @param params - The live tools, in display order.
 */
export function buildToolListSchema({
  tools,
}: {
  tools: Array<{ name: string; tagline: string; path: string }>;
}): Record<string, unknown> {
  try {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Free marketing and AI visibility tools",
      description:
        "Free tools for checking whether AI systems can read your site, validating structured data, and handling everyday web work. No login, no email gate, no ads.",
      url: `${SITE_URL}/tools`,
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.tagline,
          url: `${SITE_URL}${tool.path}`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          isAccessibleForFree: true,
        },
      })),
    };
  } catch {
    return {};
  }
}
