// Platform, theme, and app detection.
//
// Two tools consume this. T1 uses the platform to swap in platform-specific
// fix instructions ("In Webflow: Site Settings, SEO tab" beats "add a meta
// tag"), and T5 renders the whole result as its own tool.
//
// Every signal carries a confidence. `detected` means a fingerprint that only
// that platform produces (a `data-wf-site` attribute, a `Shopify.theme`
// object). `likely` means a signal that is strong but shareable (a CDN
// hostname a platform uses but does not own). The UI shows the difference
// rather than flattening both into a confident-sounding guess.

export type Confidence = "detected" | "likely";

/** How the page appears to build its HTML. Drives T1's R2 verdict. */
export type RenderMode = "server" | "client" | "hybrid" | "unknown";

export type DetectedItem = {
  name: string;
  confidence: Confidence;
  /** What we matched on, shown in the UI as the evidence. */
  evidence: string;
  /** Where to read more, when there is an obvious destination. */
  url?: string;
};

export type PlatformId =
  | "shopify"
  | "wordpress"
  | "webflow"
  | "framer"
  | "nextjs"
  | "nuxt"
  | "wix"
  | "squarespace"
  | "gatsby"
  | "astro"
  | "hubspot"
  | "unknown";

export type DetectionResult = {
  platform: PlatformId;
  platformName: string;
  platformConfidence: Confidence | null;
  platformEvidence: string | null;
  /** Theme name and slug, when the platform exposes one. */
  theme: DetectedItem | null;
  /** Apps, plugins, and extensions. */
  apps: DetectedItem[];
  fonts: DetectedItem[];
  analytics: DetectedItem[];
  hosting: DetectedItem[];
  renderMode: RenderMode;
  /**
   * Plain-language note about what this platform means for AI crawlers.
   * Rendered directly as T1's R2 finding.
   */
  crawlerNote: string;
};

type PlatformFingerprint = {
  id: PlatformId;
  name: string;
  /** Ordered: the first match wins and sets the confidence. */
  signals: Array<{
    confidence: Confidence;
    evidence: string;
    test: (context: DetectContext) => boolean;
  }>;
  renderMode: RenderMode;
  crawlerNote: string;
};

type DetectContext = {
  html: string;
  headers: Record<string, string>;
  url: string;
};

/**
 * True when the HTML contains a pattern.
 *
 * @param html - Raw HTML.
 * @param pattern - The pattern to look for.
 */
function has(html: string, pattern: RegExp | string): boolean {
  try {
    return typeof pattern === "string"
      ? html.includes(pattern)
      : pattern.test(html);
  } catch {
    return false;
  }
}

/**
 * The `<meta name="generator">` content, lowercased.
 *
 * @param html - Raw HTML.
 */
function generator(html: string): string {
  try {
    const match =
      /<meta\b[^>]*\bname\s*=\s*["']generator["'][^>]*\bcontent\s*=\s*["']([^"']*)["']/i.exec(
        html,
      ) ??
      /<meta\b[^>]*\bcontent\s*=\s*["']([^"']*)["'][^>]*\bname\s*=\s*["']generator["']/i.exec(
        html,
      );
    return match ? match[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

const PLATFORMS: PlatformFingerprint[] = [
  {
    id: "shopify",
    name: "Shopify",
    renderMode: "server",
    crawlerNote:
      "Shopify themes render on the server, so AI crawlers see your product and page copy without running JavaScript. This is a good starting position.",
    signals: [
      {
        confidence: "detected",
        evidence: "Shopify.theme object in page source",
        test: ({ html }) => has(html, /Shopify\.theme\s*=/),
      },
      {
        confidence: "detected",
        evidence: "X-ShopId response header",
        test: ({ headers }) =>
          "x-shopid" in headers || "x-sorting-hat-shopid" in headers,
      },
      {
        confidence: "likely",
        evidence: "cdn.shopify.com assets",
        test: ({ html }) => has(html, "cdn.shopify.com"),
      },
    ],
  },
  {
    id: "wordpress",
    name: "WordPress",
    renderMode: "server",
    crawlerNote:
      "WordPress renders on the server, so AI crawlers see your content without running JavaScript. The exception is a JavaScript page builder, which can hide content the same way a single-page app does.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("wordpress"),
      },
      {
        confidence: "detected",
        evidence: "/wp-content/ asset paths",
        test: ({ html }) => has(html, "/wp-content/"),
      },
      {
        confidence: "likely",
        evidence: "/wp-json/ API reference",
        test: ({ html }) => has(html, "/wp-json/"),
      },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    renderMode: "server",
    crawlerNote:
      "Webflow publishes static HTML, so AI crawlers see your content without running JavaScript. This is the best starting position of any visual builder.",
    signals: [
      {
        confidence: "detected",
        evidence: "data-wf-site attribute",
        test: ({ html }) => has(html, /data-wf-site\s*=/),
      },
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("webflow"),
      },
      {
        confidence: "likely",
        evidence: "website-files.com assets",
        test: ({ html }) =>
          has(html, "assets.website-files.com") ||
          has(html, "assets-global.website-files.com") ||
          has(html, "cdn.prod.website-files.com"),
      },
    ],
  },
  {
    id: "framer",
    name: "Framer",
    renderMode: "hybrid",
    crawlerNote:
      "Framer sites are JavaScript-heavy. Framer does pre-render pages, but interactive sections and CMS collections often need JavaScript, so parts of the page can be invisible to AI crawlers. Check the readability score below carefully.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("framer"),
      },
      {
        confidence: "detected",
        evidence: "framerusercontent.com assets",
        test: ({ html }) => has(html, "framerusercontent.com"),
      },
      {
        confidence: "likely",
        evidence: "Framer badge markup",
        test: ({ html }) => has(html, /__framer/i),
      },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    renderMode: "hybrid",
    crawlerNote:
      "Next.js can render on the server or in the browser, and the two look identical to a visitor. Client components and client-side data fetching are invisible to AI crawlers. The readability score below tells you which side of the line this page is on.",
    signals: [
      {
        confidence: "detected",
        evidence: "__NEXT_DATA__ payload",
        test: ({ html }) => has(html, "__NEXT_DATA__"),
      },
      {
        confidence: "detected",
        evidence: "/_next/ asset paths",
        test: ({ html }) => has(html, "/_next/"),
      },
      {
        confidence: "likely",
        evidence: "x-nextjs response header",
        test: ({ headers }) =>
          Object.keys(headers).some((key) => key.startsWith("x-nextjs")),
      },
    ],
  },
  {
    id: "nuxt",
    name: "Nuxt",
    renderMode: "hybrid",
    crawlerNote:
      "Nuxt can render on the server or in the browser. Client-only pages are invisible to AI crawlers. The readability score below tells you which this page is.",
    signals: [
      {
        confidence: "detected",
        evidence: "__NUXT__ payload",
        test: ({ html }) => has(html, "__NUXT__"),
      },
      {
        confidence: "likely",
        evidence: "/_nuxt/ asset paths",
        test: ({ html }) => has(html, "/_nuxt/"),
      },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    renderMode: "hybrid",
    crawlerNote:
      "Wix renders a lot of the page in the browser. Some content reaches AI crawlers and some does not, so read the readability score below closely.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("wix"),
      },
      {
        confidence: "likely",
        evidence: "static.wixstatic.com assets",
        test: ({ html }) => has(html, "wixstatic.com"),
      },
    ],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    renderMode: "server",
    crawlerNote:
      "Squarespace renders on the server, so AI crawlers see your content without running JavaScript.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("squarespace"),
      },
      {
        confidence: "likely",
        evidence: "squarespace-cdn.com assets",
        test: ({ html }) =>
          has(html, "squarespace-cdn.com") || has(html, "static1.squarespace.com"),
      },
    ],
  },
  {
    id: "gatsby",
    name: "Gatsby",
    renderMode: "server",
    crawlerNote:
      "Gatsby builds static HTML, so AI crawlers see your content without running JavaScript.",
    signals: [
      {
        confidence: "detected",
        evidence: "___gatsby mount point",
        test: ({ html }) => has(html, "___gatsby"),
      },
    ],
  },
  {
    id: "astro",
    name: "Astro",
    renderMode: "server",
    crawlerNote:
      "Astro ships static HTML by default, so AI crawlers see your content without running JavaScript.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("astro"),
      },
      {
        confidence: "likely",
        evidence: "astro-island elements",
        test: ({ html }) => has(html, "astro-island"),
      },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot CMS",
    renderMode: "server",
    crawlerNote:
      "HubSpot CMS renders on the server, so AI crawlers see your content without running JavaScript.",
    signals: [
      {
        confidence: "detected",
        evidence: "generator meta tag",
        test: ({ html }) => generator(html).includes("hubspot"),
      },
      {
        confidence: "likely",
        evidence: "hs-scripts.com assets",
        test: ({ html }) => has(html, "hs-scripts.com"),
      },
    ],
  },
];

/** Analytics and pixel fingerprints. */
const ANALYTICS: Array<{ name: string; pattern: RegExp; evidence: string }> = [
  { name: "Google Analytics 4", pattern: /gtag\/js\?id=G-|gtag\(\s*['"]config['"]\s*,\s*['"]G-/, evidence: "gtag.js with a G- measurement ID" },
  { name: "Google Tag Manager", pattern: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/, evidence: "gtm.js container" },
  { name: "Segment", pattern: /cdn\.segment\.com\/analytics\.js/, evidence: "Segment analytics.js" },
  { name: "Plausible", pattern: /plausible\.io\/js/, evidence: "Plausible script" },
  { name: "Fathom", pattern: /cdn\.usefathom\.com/, evidence: "Fathom script" },
  { name: "PostHog", pattern: /posthog\.com\/static\/array\.js|posthog\.init/, evidence: "PostHog snippet" },
  { name: "Meta Pixel", pattern: /connect\.facebook\.net\/[^"']*\/fbevents\.js/, evidence: "fbevents.js" },
  { name: "LinkedIn Insight", pattern: /snap\.licdn\.com\/li\.lms-analytics/, evidence: "LinkedIn Insight tag" },
  { name: "Hotjar", pattern: /static\.hotjar\.com/, evidence: "Hotjar script" },
  { name: "Amplitude", pattern: /cdn\.amplitude\.com|amplitude\.getInstance/, evidence: "Amplitude SDK" },
  { name: "Mixpanel", pattern: /cdn\.mxpnl\.com/, evidence: "Mixpanel SDK" },
  { name: "Intercom", pattern: /widget\.intercom\.io/, evidence: "Intercom widget" },
];

/** Font-provider fingerprints. */
const FONTS: Array<{ name: string; pattern: RegExp; evidence: string }> = [
  { name: "Google Fonts", pattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/, evidence: "fonts.googleapis.com link" },
  { name: "Adobe Fonts", pattern: /use\.typekit\.net|p\.typekit\.net/, evidence: "Typekit link" },
  { name: "Font Awesome", pattern: /fontawesome|font-awesome/i, evidence: "Font Awesome stylesheet" },
];

/** Hosting and CDN fingerprints, read from response headers. */
const HOSTING: Array<{ name: string; test: (headers: Record<string, string>) => boolean; evidence: string }> = [
  { name: "Vercel", test: (h) => "x-vercel-id" in h || (h["server"] ?? "").includes("Vercel"), evidence: "x-vercel-id header" },
  { name: "Netlify", test: (h) => "x-nf-request-id" in h || (h["server"] ?? "").includes("Netlify"), evidence: "x-nf-request-id header" },
  { name: "Cloudflare", test: (h) => "cf-ray" in h || (h["server"] ?? "").toLowerCase() === "cloudflare", evidence: "cf-ray header" },
  { name: "Fastly", test: (h) => "x-served-by" in h && (h["x-served-by"] ?? "").includes("cache"), evidence: "x-served-by header" },
  { name: "AWS CloudFront", test: (h) => "x-amz-cf-id" in h, evidence: "x-amz-cf-id header" },
  { name: "GitHub Pages", test: (h) => (h["server"] ?? "").includes("GitHub.com"), evidence: "GitHub.com server header" },
];

/**
 * Reads the Shopify theme name out of the inline `Shopify.theme` object.
 *
 * @param html - Raw HTML.
 */
function shopifyTheme(html: string): DetectedItem | null {
  try {
    const match = /Shopify\.theme\s*=\s*(\{[\s\S]*?\});/.exec(html);
    if (!match) return null;

    // The object is JS, not JSON (unquoted keys, single quotes), so pull the
    // name field directly rather than trying to parse it.
    const nameMatch = /["']?name["']?\s*:\s*["']([^"']+)["']/.exec(match[1]);
    if (!nameMatch) return null;

    return {
      name: nameMatch[1],
      confidence: "detected",
      evidence: "Shopify.theme.name in page source",
    };
  } catch {
    return null;
  }
}

/**
 * Reads the WordPress theme slug out of `/wp-content/themes/{slug}/` asset
 * URLs.
 *
 * @param html - Raw HTML.
 */
function wordpressTheme(html: string): DetectedItem | null {
  try {
    const match = /\/wp-content\/themes\/([a-z0-9_-]+)\//i.exec(html);
    if (!match) return null;
    return {
      name: match[1],
      confidence: "detected",
      evidence: "/wp-content/themes/ asset path",
    };
  } catch {
    return null;
  }
}

/**
 * Collects WordPress plugin slugs from `/wp-content/plugins/{slug}/` URLs.
 *
 * @param html - Raw HTML.
 * @param limit - Maximum plugins to report.
 */
function wordpressPlugins(html: string, limit = 10): DetectedItem[] {
  try {
    const slugs = new Set<string>();
    const pattern = /\/wp-content\/plugins\/([a-z0-9_-]+)\//gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(html)) !== null && slugs.size < limit) {
      slugs.add(match[1].toLowerCase());
    }

    return [...slugs].map((slug) => ({
      name: slug,
      confidence: "detected" as const,
      evidence: "/wp-content/plugins/ asset path",
      url: `https://wordpress.org/plugins/${slug}/`,
    }));
  } catch {
    return [];
  }
}

/**
 * Identifies the platform, theme, apps, fonts, analytics, and hosting behind
 * a page.
 *
 * @param params - The fetched page.
 */
export function detect(params: {
  html: string;
  headers?: Record<string, string>;
  url: string;
}): DetectionResult {
  const html = params.html ?? "";
  const headers = params.headers ?? {};
  const context: DetectContext = { html, headers, url: params.url };

  let platform: PlatformFingerprint | null = null;
  let platformConfidence: Confidence | null = null;
  let platformEvidence: string | null = null;

  try {
    // Two passes so a `detected` match on any platform beats a `likely` match
    // on an earlier one. Without this, a Next.js site on Shopify's CDN could
    // be reported as Shopify.
    for (const wanted of ["detected", "likely"] as const) {
      if (platform !== null) break;
      for (const candidate of PLATFORMS) {
        const signal = candidate.signals.find(
          (item) => item.confidence === wanted && item.test(context),
        );
        if (signal) {
          platform = candidate;
          platformConfidence = signal.confidence;
          platformEvidence = signal.evidence;
          break;
        }
      }
    }
  } catch {
    // Fall through to unknown.
  }

  const theme =
    platform?.id === "shopify"
      ? shopifyTheme(html)
      : platform?.id === "wordpress"
        ? wordpressTheme(html)
        : null;

  const apps = platform?.id === "wordpress" ? wordpressPlugins(html) : [];

  const analytics = ANALYTICS.flatMap((item) =>
    has(html, item.pattern)
      ? [{ name: item.name, confidence: "detected" as const, evidence: item.evidence }]
      : [],
  );

  const fonts = FONTS.flatMap((item) =>
    has(html, item.pattern)
      ? [{ name: item.name, confidence: "detected" as const, evidence: item.evidence }]
      : [],
  );

  const hosting = HOSTING.flatMap((item) =>
    item.test(headers)
      ? [{ name: item.name, confidence: "detected" as const, evidence: item.evidence }]
      : [],
  );

  return {
    platform: platform?.id ?? "unknown",
    platformName: platform?.name ?? "Unknown",
    platformConfidence,
    platformEvidence,
    theme,
    apps,
    fonts,
    analytics,
    hosting,
    renderMode: platform?.renderMode ?? "unknown",
    crawlerNote:
      platform?.crawlerNote ??
      "We could not identify the platform behind this site, so the readability score below is the check to trust. It measures what an AI crawler actually sees, whatever built the page.",
  };
}
