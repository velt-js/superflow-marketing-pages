// Shared agent taxonomy (spec section 3).
//
// Eight categories, each with a default set of four agents. Used by the
// solutions pack cards, the "What your agents catch" section on the home and
// agents pages, and the Sanity `solutionPage` schema's category dropdown.
// Every agent carries a sample finding written as the comment a customer
// would see. React-free so the Sanity studio bundle can import it.

/** The eight shared categories. */
export const AGENT_CATEGORIES = [
  "launch-readiness",
  "links",
  "copy",
  "brand",
  "seo-social",
  "accessibility",
  "layout-devices",
  "compliance",
] as const;

export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

/** Display label per category, in tab order. */
export const AGENT_CATEGORY_LABELS: Readonly<Record<AgentCategory, string>> = {
  "launch-readiness": "Launch readiness",
  links: "Links",
  copy: "Copy",
  brand: "Brand",
  "seo-social": "SEO and social",
  accessibility: "Accessibility",
  "layout-devices": "Layout on devices",
  compliance: "Compliance",
};

/** Sanity dropdown options for the category field. */
export const AGENT_CATEGORY_OPTIONS: readonly { title: string; value: string }[] =
  AGENT_CATEGORIES.map((value) => ({
    title: AGENT_CATEGORY_LABELS[value],
    value,
  }));

/** One library agent: name, what it checks, and its sample finding. */
export interface LibraryAgent {
  name: string;
  checks: string;
  finding: string;
  category: AgentCategory;
}

/**
 * The category library. Compliance agents are vertical-specific and live in
 * each solution page's own data, so the library's compliance entries are the
 * four that read well on the home and agents pages.
 */
export const AGENT_LIBRARY: Readonly<Record<AgentCategory, readonly LibraryAgent[]>> = {
  "launch-readiness": [
    {
      name: "Noindex Check",
      checks: "Finds pages still blocked from search after launch.",
      finding: "noindex is still set on 14 pages. Google can't see the site.",
      category: "launch-readiness",
    },
    {
      name: "Staging Links",
      checks: "Finds links pointing at staging or preview URLs.",
      finding: "The header 'Book now' button links to staging.northwind.com.",
      category: "launch-readiness",
    },
    {
      name: "Tracking Check",
      checks: "Confirms analytics and tag manager fire on every page.",
      finding:
        "GA4 fires on every page except the thank-you page. Conversions won't count.",
      category: "launch-readiness",
    },
    {
      name: "Placeholder Images",
      checks: "Finds stock placeholders and empty image slots.",
      finding: "Team page shows the theme's default headshot in 3 of 6 cards.",
      category: "launch-readiness",
    },
  ],
  links: [
    {
      name: "Broken Links",
      checks: "Follows every link on every page and flags the ones that fail.",
      finding: "Footer 'Careers' link returns 404.",
      category: "links",
    },
    {
      name: "Redirect Chains",
      checks: "Finds URLs that hop through more than one redirect.",
      finding: "/services redirects three times before landing. Cut it to one.",
      category: "links",
    },
    {
      name: "Anchor Targets",
      checks: "Checks every in-page anchor has a matching section.",
      finding: "The '#pricing' button has no matching section on this page.",
      category: "links",
    },
    {
      name: "External Link Health",
      checks: "Checks outbound links still resolve.",
      finding: "Partner logo links to a domain that no longer resolves.",
      category: "links",
    },
  ],
  copy: [
    {
      name: "Lorem Ipsum",
      checks: "Finds placeholder text left in the copy.",
      finding: "About page paragraph 2 is still Lorem ipsum.",
      category: "copy",
    },
    {
      name: "Stale Dates",
      checks: "Finds years, dates and copyright lines that are out of date.",
      finding: "Footer says © 2024.",
      category: "copy",
    },
    {
      name: "Contact Consistency",
      checks: "Checks phone, address and hours match across every page.",
      finding: "Header phone is 555-0100. Footer says 555-0111.",
      category: "copy",
    },
    {
      name: "Spelling and Grammar",
      checks: "Finds typos and grammar slips in headings and body copy.",
      finding: "'effortlesly' in the hero headline. Should be 'effortlessly'.",
      category: "copy",
    },
  ],
  brand: [
    {
      name: "Palette Guard",
      checks: "Checks every color on the page against the brand guide.",
      finding: "Primary button uses #2F80ED. The brand guide allows #1E5BB8.",
      category: "brand",
    },
    {
      name: "Font Guard",
      checks: "Checks headings and body text render in the brand fonts.",
      finding: "H2 renders in Arial. The guide specifies Inter.",
      category: "brand",
    },
    {
      name: "Logo Version",
      checks: "Checks every logo on the site is the current version.",
      finding: "Footer uses the 2023 logo. Header uses the current one.",
      category: "brand",
    },
    {
      name: "Banned Words",
      checks: "Flags words on the client's banned list.",
      finding: "Copy says 'cheap'. The client's word list bans it. Use 'affordable'.",
      category: "brand",
    },
  ],
  "seo-social": [
    {
      name: "Meta Titles",
      checks: "Checks every page has a unique, specific title.",
      finding: "Six pages share the title 'Home'.",
      category: "seo-social",
    },
    {
      name: "OG Image",
      checks: "Checks every page has a share image that renders.",
      finding: "Share preview for /services shows a blank image.",
      category: "seo-social",
    },
    {
      name: "Alt Text",
      checks: "Finds images with no alt text.",
      finding: "11 images on the gallery page have no alt text.",
      category: "seo-social",
    },
    {
      name: "Heading Order",
      checks: "Checks each page has one H1 and headings nest in order.",
      finding: "Two H1s on this page. The second should be an H2.",
      category: "seo-social",
    },
  ],
  accessibility: [
    {
      name: "Contrast",
      checks: "Checks text contrast meets WCAG AA.",
      finding: "Body text is 3.1:1 against the background. AA needs 4.5:1.",
      category: "accessibility",
    },
    {
      name: "Form Labels",
      checks: "Checks every form field has a real label.",
      finding:
        "The email field has a placeholder but no label. Screen readers skip it.",
      category: "accessibility",
    },
    {
      name: "Tap Targets",
      checks: "Checks tap targets on phone are big enough.",
      finding: "Mobile nav links are 28px tall. Minimum is 44px.",
      category: "accessibility",
    },
    {
      name: "Focus Order",
      checks: "Tabs through the page and checks focus lands where it should.",
      finding: "Keyboard focus skips the main CTA.",
      category: "accessibility",
    },
  ],
  "layout-devices": [
    {
      name: "Mobile Overflow",
      checks: "Checks nothing wraps, clips or pushes the CTA down on phone.",
      finding:
        "Hero headline wraps to five lines on iPhone and pushes the CTA below the fold.",
      category: "layout-devices",
    },
    {
      name: "Overlap",
      checks: "Finds elements that cover other elements on any device.",
      finding:
        "The sticky header covers the first line of every section on tablet.",
      category: "layout-devices",
    },
    {
      name: "Stretched Images",
      checks: "Finds images rendered at the wrong aspect ratio.",
      finding: "Hero image is stretched 12% wider than tall on desktop.",
      category: "layout-devices",
    },
    {
      name: "Horizontal Scroll",
      checks: "Finds pages that scroll sideways on phone.",
      finding: "Pricing table forces horizontal scroll on mobile.",
      category: "layout-devices",
    },
  ],
  compliance: [
    {
      name: "Claims Check",
      checks: "Flags wording a regulator or board acts on.",
      finding:
        "Services page says 'painless root canals.' Most state boards treat that as a misleading claim. Suggest 'comfortable'.",
      category: "compliance",
    },
    {
      name: "Consent Notes",
      checks: "Checks before-and-after galleries carry a consent statement.",
      finding:
        "Smile gallery shows 12 patient photos with no consent statement on the page.",
      category: "compliance",
    },
    {
      name: "License Display",
      checks: "Checks the license number appears where the state requires it.",
      finding:
        "License number appears on the homepage but not on the 3 HVAC service pages. Texas requires it on each.",
      category: "compliance",
    },
    {
      name: "Financing Disclosure",
      checks: "Checks every financing offer links to its terms.",
      finding: "'0% financing' appears on 6 pages with no terms link.",
      category: "compliance",
    },
  ],
};

/**
 * Look up a library agent by name, across every category.
 *
 * @param name - The agent name, e.g. "Broken Links".
 * @returns The library entry, or undefined when the name is not in the library.
 */
export function findLibraryAgent(name: string): LibraryAgent | undefined {
  try {
    for (const category of AGENT_CATEGORIES) {
      const match = AGENT_LIBRARY[category].find((agent) => agent.name === name);
      if (match) {
        return match;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * The "Build your own" example shown on the home and agents pages (spec
 * section 5). Static, not interactive.
 */
export const BUILD_YOUR_OWN_EXAMPLE = {
  input: "Every page must show the office phone number in the header.",
  agentName: "Office Phone",
  finding: "The Contact page header is missing the office phone number.",
} as const;

/** The five hero agents on the home page (spec section 5). */
export const HOME_HERO_AGENTS: readonly string[] = [
  "Noindex Check",
  "Broken Links",
  "Palette Guard",
  "Mobile Overflow",
  "Claims Check",
];
