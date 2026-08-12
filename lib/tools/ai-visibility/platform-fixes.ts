// Platform-specific fix instructions.
//
// "Add a meta description" is advice. "Site Settings, SEO tab, Description"
// is a fix. The difference is most of the value in the whole report, because
// the audience is agency people working in someone else's CMS.
//
// Keys are `${CheckId}` and values are per-platform steps. A missing entry
// means the generic fix text stands on its own, which is the correct
// behaviour for checks where the platform makes no difference.

import type { PlatformId } from "@/lib/toolkit/detect";
import type { CheckId } from "./types";

type PlatformFixMap = Partial<Record<PlatformId, string>>;

/**
 * How to edit robots.txt on each platform. This is the single most
 * platform-dependent fix in the report: two of the five platforms our
 * audience uses cannot serve a custom robots.txt at all without a proxy.
 */
const ROBOTS_FIXES: PlatformFixMap = {
  webflow:
    "In Webflow: Site Settings, SEO tab, robots.txt. Paste the rules there and republish.",
  wordpress:
    "In WordPress: Yoast or Rank Math both have a robots.txt editor under Tools. Otherwise edit the file at your web root.",
  shopify:
    "In Shopify: Online Store, Themes, Edit code, then robots.txt.liquid. Shopify generates the file, so you add rules through that template.",
  framer:
    "In Framer: Site Settings, General, robots.txt. If your plan does not expose it, put Cloudflare in front of the site and serve robots.txt from a Worker.",
  nextjs:
    "In Next.js: edit app/robots.ts, or put a static robots.txt in public/. Redeploy for it to take effect.",
  nuxt: "In Nuxt: put robots.txt in public/ and redeploy.",
  squarespace:
    "Squarespace does not let you edit robots.txt. Put Cloudflare in front of the site and serve the file from a Worker.",
  wix: "Wix has a robots.txt editor under Marketing and SEO, SEO Tools, Robots.txt Editor.",
};

/** Where the title and meta description live on each platform. */
const META_FIXES: PlatformFixMap = {
  webflow:
    "In Webflow: open the page, Page Settings, SEO Settings. Set Title Tag and Meta Description, then republish.",
  wordpress:
    "In WordPress: Yoast or Rank Math adds a Search Appearance box below the editor. Set the SEO title and meta description there.",
  shopify:
    "In Shopify: the page or product editor, Search engine listing, Edit. Set the page title and description.",
  framer:
    "In Framer: select the page in the canvas, then the Page tab in the right panel, Metadata section.",
  nextjs:
    "In Next.js: export a `metadata` object (or `generateMetadata`) from the page file with `title` and `description`.",
  nuxt: "In Nuxt: call `useSeoMeta({ title, description })` in the page component.",
  squarespace:
    "In Squarespace: Pages, the gear icon on the page, SEO tab.",
  wix: "In Wix: the page menu, SEO Basics, then Title and Description.",
};

/** How to get server-rendered content on each platform. */
const RENDERING_FIXES: PlatformFixMap = {
  nextjs:
    "In Next.js: this content is in a client component or is fetched in the browser. Move it into a server component, or fetch it during the server render, so it is present in the initial HTML.",
  nuxt: "In Nuxt: make sure the page is not `ssr: false`, and fetch data with `useAsyncData` so it renders on the server.",
  framer:
    "In Framer: heavy interactive components and some CMS collections only appear after JavaScript runs. Put the copy that matters, especially headings and the first paragraph, in plain text blocks.",
  wix: "In Wix: Wix renders much of the page in the browser. Keep your key copy in standard text elements rather than in custom-code or animated sections.",
  wordpress:
    "In WordPress: if you use a JavaScript page builder, enable its static or server-rendered output mode so the copy is in the HTML.",
  shopify:
    "In Shopify: Liquid renders on the server, so this usually comes from an app or a custom section that loads content over JavaScript. Move that copy into the Liquid template.",
};

/** Where structured data goes on each platform. */
const SCHEMA_FIXES: PlatformFixMap = {
  webflow:
    "In Webflow: Page Settings, Custom Code, Head Code. Paste the script tag there.",
  wordpress:
    "In WordPress: Yoast and Rank Math both emit Organization and WebSite schema once you fill in the site details under their General settings.",
  shopify:
    "In Shopify: theme.liquid, inside the head tag. Most themes already emit Product schema, so you are usually adding Organization.",
  framer: "In Framer: Site Settings, General, Custom Code, End of head tag.",
  nextjs:
    "In Next.js: render the script tag from your root layout so it appears on every page.",
  nuxt: "In Nuxt: use `useHead` with a script entry of type application/ld+json.",
  squarespace:
    "In Squarespace: Settings, Advanced, Code Injection, Header.",
  wix: "In Wix: Settings, Custom Code, add to the Head.",
};

/** Where to put llms.txt, including the two platforms that cannot. */
const LLMS_TXT_FIXES: PlatformFixMap = {
  nextjs:
    "In Next.js: drop llms.txt and llms-full.txt into public/ and redeploy. They will be served from the site root.",
  nuxt: "In Nuxt: drop both files into public/ and redeploy.",
  wordpress:
    "In WordPress: upload both files to your web root over SFTP, or use a plugin that serves custom root files.",
  webflow:
    "Webflow cannot serve custom .txt files from the site root. Put Cloudflare in front of the site and return the file from a Worker on /llms.txt.",
  framer:
    "Framer cannot serve custom .txt files from the site root. Put Cloudflare in front of the site and return the file from a Worker on /llms.txt.",
  shopify:
    "In Shopify: add the file as a theme asset, then serve it at the root through an app proxy or a Cloudflare Worker. Shopify will not serve it from the root directly.",
  squarespace:
    "Squarespace cannot serve custom .txt files from the site root. Put Cloudflare in front of the site and return the file from a Worker.",
};

/** Where Open Graph tags live on each platform. */
const OG_FIXES: PlatformFixMap = {
  webflow:
    "In Webflow: Page Settings, Open Graph Settings. Set the title, description, and image, then republish.",
  wordpress:
    "In WordPress: Yoast and Rank Math both have a Social tab on each post and page.",
  shopify:
    "In Shopify: theme.liquid controls the og tags. Most themes pull them from the page title and the featured image.",
  framer:
    "In Framer: the Page tab in the right panel, Metadata, Social Image.",
  nextjs:
    "In Next.js: add an `openGraph` block to the page's `metadata` export.",
  nuxt: "In Nuxt: `useSeoMeta({ ogTitle, ogDescription, ogImage })`.",
  squarespace: "In Squarespace: Pages, the gear icon, Social Image.",
  wix: "In Wix: the page menu, SEO Basics, Social Share.",
};

/** All platform fix maps, keyed by check. */
const FIXES_BY_CHECK: Partial<Record<CheckId, PlatformFixMap>> = {
  A1: ROBOTS_FIXES,
  A2: ROBOTS_FIXES,
  A3: LLMS_TXT_FIXES,
  R1: RENDERING_FIXES,
  R3: META_FIXES,
  S2: SCHEMA_FIXES,
  I1: SCHEMA_FIXES,
  I2: OG_FIXES,
};

/**
 * The platform-specific fix for a check, when we know the platform and have
 * something useful to say about it.
 *
 * @param checkId - Which check the fix belongs to.
 * @param platform - The detected platform.
 * @returns The instruction, or undefined to fall back to the generic fix.
 */
export function platformFixFor(
  checkId: CheckId,
  platform: PlatformId,
): string | undefined {
  try {
    if (platform === "unknown") return undefined;
    return FIXES_BY_CHECK[checkId]?.[platform];
  } catch {
    return undefined;
  }
}

/**
 * Platforms that cannot serve arbitrary files from the site root without a
 * proxy in front. T2's install guide branches on this too.
 */
export const CANNOT_SERVE_ROOT_FILES: readonly PlatformId[] = [
  "webflow",
  "framer",
  "squarespace",
];
