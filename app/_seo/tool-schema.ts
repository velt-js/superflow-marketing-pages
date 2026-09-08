import { SITE_URL, ORG_LOGO_URL } from "./schema";

/** Publisher block, repeated on every tool so each page identifies its owner. */
function publisher() {
  return {
    "@type": "Organization",
    name: "Superflow",
    url: SITE_URL,
    logo: ORG_LOGO_URL,
  };
}

/**
 * WebPage schema for an interactive tool without published app reviews.
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
      "@type": "WebPage",
      name,
      description,
      url: `${SITE_URL}${path}`,
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
          "@type": "WebPage",
          name: tool.name,
          description: tool.tagline,
          url: `${SITE_URL}${tool.path}`,
          isAccessibleForFree: true,
        },
      })),
    };
  } catch {
    return {};
  }
}
