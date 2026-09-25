// Shared config for the consent audit (Phase 1) and the consent test (Phase 3).
//
// This file is the ONE place that decides what counts as essential. Anything a
// page talks to that is not matched here is non-essential and, once the fix
// lands, must not be contacted before the visitor opts in.
//
// Keep ESSENTIAL_HOSTS short. Every entry is a claim that the host is needed to
// render or operate the site and sets no tracking state - adding a host to make
// a red test green defeats the purpose of the test.

/** Hosts we own or operate. Requests to these are never counted as third-party. */
export const OWNED_HOSTS = [
  "usesuperflow.ai",
  "usesuperflow.com", // app., drive., demo. - the product and its asset hosts
  "superflow.app",
];

/**
 * Third-party hosts that are essential: the page cannot render or function
 * without them and they do not track. Suffix-matched, so "sanity.io" covers
 * cdn.sanity.io.
 */
export const ESSENTIAL_HOSTS = [
  // CMS image CDN (next/image may pass these through untouched).
  "cdn.sanity.io",
  // Directory logos hotlinked through next/image (see next.config.ts).
  "assets.awwwards.com",
  "static.semrush.com",
  "img.shgstatic.com",
  "media.designrush.com",
  "storage-01-mda.keyfram.es",
  // Docs are reverse-proxied from Mintlify under /docs.
  "mintlify.dev",
  "mintlify.app",
  "mintlify.com",
  "mintcdn.com",
  "d3gk2c5xim1je2.cloudfront.net", // Mintlify's icon CDN (Font Awesome SVGs)
  // Consent vendor. It has to load for the banner to exist at all.
  "termly.io",
];

/**
 * Known vendors, for labelling. Suffix-matched against the request host. The
 * category here is the one the tool SHOULD have under the consent model
 * (Necessary / Analytics / Marketing / Functional-on-demand), not what it has
 * today.
 */
export const VENDORS = [
  { host: "termly.io", tool: "Termly (consent banner)", category: "Necessary" },
  { host: "googletagmanager.com", tool: "Google tag / GTM loader", category: "Analytics + Marketing" },
  { host: "google-analytics.com", tool: "Google Analytics 4", category: "Analytics" },
  { host: "analytics.google.com", tool: "Google Analytics 4", category: "Analytics" },
  { host: "googleadservices.com", tool: "Google Ads", category: "Marketing" },
  { host: "googlesyndication.com", tool: "Google Ads", category: "Marketing" },
  { host: "doubleclick.net", tool: "Google Ads / DoubleClick", category: "Marketing" },
  { host: "google.com", tool: "Google Ads (ccm / pagead)", category: "Marketing" },
  { host: "ddwl4m2hdecbv.cloudfront.net", tool: "RB2B (visitor deanonymizer)", category: "Marketing" },
  { host: "reb2b.com", tool: "RB2B (visitor deanonymizer)", category: "Marketing" },
  { host: "b2bjsstore.s3.us-west-2.amazonaws.com", tool: "RB2B (visitor deanonymizer)", category: "Marketing" },
  { host: "claydar.com", tool: "Claydar / Clay web intent (visitor deanonymizer)", category: "Marketing" },
  { host: "clay.com", tool: "Claydar / Clay web intent (visitor deanonymizer)", category: "Marketing" },
  { host: "redditstatic.com", tool: "Reddit pixel", category: "Marketing (to be removed)" },
  { host: "reddit.com", tool: "Reddit pixel", category: "Marketing (to be removed)" },
  { host: "licdn.com", tool: "LinkedIn Insight", category: "Marketing" },
  { host: "linkedin.com", tool: "LinkedIn Insight", category: "Marketing" },
  { host: "facebook.net", tool: "Meta pixel", category: "Marketing" },
  { host: "facebook.com", tool: "Meta pixel", category: "Marketing" },
  { host: "ads-twitter.com", tool: "X pixel", category: "Marketing" },
  { host: "t.co", tool: "X pixel", category: "Marketing" },
  { host: "twitter.com", tool: "X pixel", category: "Marketing" },
  { host: "amplitude.com", tool: "Amplitude (analytics + session replay)", category: "Analytics" },
  { host: "wdfl.co", tool: "Rewardful (affiliate attribution)", category: "Marketing" },
  { host: "getrewardful.com", tool: "Rewardful (affiliate attribution)", category: "Marketing" },
  { host: "intercom.io", tool: "Intercom (chat)", category: "Functional (load on click)" },
  { host: "intercomcdn.com", tool: "Intercom (chat)", category: "Functional (load on click)" },
  { host: "intercomassets.com", tool: "Intercom (chat)", category: "Functional (load on click)" },
  { host: "velt.dev", tool: "Superflow toolbar (own product, served from Velt)", category: "Functional (decision needed)" },
  { host: "snippyly-sdk-prod.cloudfunctions.net", tool: "Superflow toolbar backend", category: "Functional (decision needed)" },
  { host: "firebaseio.com", tool: "Superflow toolbar backend (Firebase)", category: "Functional (decision needed)" },
  { host: "fonts.googleapis.com", tool: "Google Fonts (requested by the Superflow toolbar / Tally)", category: "Functional (self-host or gate)" },
  { host: "fonts.gstatic.com", tool: "Google Fonts (requested by the Superflow toolbar / Tally)", category: "Functional (self-host or gate)" },
  { host: "googleapis.com", tool: "Google APIs (toolbar Firebase)", category: "Functional (decision needed)" },
  { host: "calendly.com", tool: "Calendly embed", category: "Functional (click-to-load)" },
  { host: "sentry.io", tool: "Sentry (loaded inside the Tally iframe)", category: "Functional (click-to-load)" },
  { host: "tally.so", tool: "Tally form embed", category: "Functional (click-to-load)" },
  { host: "youtube.com", tool: "YouTube embed", category: "Functional (nocookie / click-to-load)" },
  { host: "ytimg.com", tool: "YouTube embed", category: "Functional (nocookie / click-to-load)" },
  { host: "hotjar.com", tool: "Hotjar", category: "Analytics" },
  { host: "clarity.ms", tool: "Microsoft Clarity", category: "Analytics" },
  { host: "posthog.com", tool: "PostHog", category: "Analytics" },
  { host: "segment.com", tool: "Segment", category: "Analytics" },
  { host: "segment.io", tool: "Segment", category: "Analytics" },
];

/**
 * Path-level rules, checked before VENDORS, for hosts that serve more than one
 * tool. cdn.velt.dev serves the Superflow toolbar AND reverse-proxies
 * Amplitude (events at /am, session-replay config at /am-sr-c, replay uploads
 * at /am-sr-t), so the host alone cannot say which tool a request belongs to.
 */
export const URL_RULES = [
  { pattern: /^https:\/\/cdn\.velt\.dev\/am(-|\/|\?|$)/, tool: "Amplitude (analytics + session replay)", category: "Analytics" },
];

/**
 * Pages the audit and the test visit. Paths only - the base URL comes from
 * CONSENT_BASE_URL so the same list runs against production and a preview.
 */
export const KEY_PAGES = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "blog post", path: "/blog/bugherd-alternatives-comparison" },
  { name: "feature page", path: "/video-review" },
  { name: "solutions (use case)", path: "/use-case/client-feedback" },
  { name: "tools hub", path: "/tools" },
  { name: "tool page", path: "/tools/utm-builder" },
  { name: "directory", path: "/directory" },
  { name: "book demo (Calendly)", path: "/book-demo" },
  { name: "survey (Tally)", path: "/state-of-agency-tools" },
  { name: "docs (Mintlify proxy)", path: "/docs" },
];

/** True when `host` is `domain` or a subdomain of it. */
export function hostMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function isOwned(host) {
  return OWNED_HOSTS.some((d) => hostMatches(host, d));
}

export function isEssential(host) {
  return isOwned(host) || ESSENTIAL_HOSTS.some((d) => hostMatches(host, d));
}

/**
 * The tool a request belongs to. URL rules first, then the most specific host
 * match, so "googleadservices.com" beats "google.com".
 */
export function vendorFor(host, url = "") {
  const rule = URL_RULES.find((r) => r.pattern.test(url));
  if (rule) return rule;
  const hits = VENDORS.filter((v) => hostMatches(host, v.host));
  hits.sort((a, b) => b.host.length - a.host.length);
  return hits[0] ?? null;
}
