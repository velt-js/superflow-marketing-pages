// On-demand revalidation for Sanity publishes.
//
// Every CMS-backed route is `export const revalidate = 60` and every Markdown
// copy is `revalidate = 3600`, which means a publish is invisible for up to a
// minute (an hour for the copy) AND the first request after that window still
// serves the stale copy - Next regenerates in the background, so the change
// only appears on the request after. That is why a CMS edit checked right
// after publishing reads as "nothing happened".
//
// A Sanity webhook pointed here clears the entry for the affected paths the
// moment a document is published, so the next request renders fresh. The
// time-based windows stay as the backstop for anything this misses.
//
// Setup (both steps are manual, once):
//   1. Set SANITY_REVALIDATE_SECRET in the deployment environment.
//   2. In manage.sanity.io -> API -> Webhooks, add a webhook:
//        URL      https://usesuperflow.ai/api/revalidate
//        Dataset  production
//        Trigger  create, update, delete
//        Filter   !(_id in path("drafts.**"))
//        Projection {"_type": _type, "slug": slug.current}
//        Secret   the same value as SANITY_REVALIDATE_SECRET
//      The default (empty) projection also works - the whole document carries
//      both fields - but sends far more data than this needs.
//
// Verify with:  curl -sI https://usesuperflow.ai/<path>   # x-vercel-cache: MISS

import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// The signature is computed over the raw body, so this handler must never be
// cached or pre-rendered.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Where each Sanity document type is published.
 *
 * `detail` builds the document's own path from its slug; `hubs` are the
 * listing pages that embed its title and therefore go stale with it. A type
 * with more than one `detail` entry is one the routes resolve from more than
 * one collection (both /comparisons and /alternative read the preview
 * documents), and revalidating a path that does not exist is a no-op, so
 * naming both is cheaper than resolving which one applies.
 */
const ROUTES: Record<string, { detail?: ((slug: string) => string)[]; hubs?: string[] }> = {
  blogPost: { detail: [(s) => `/blog/${s}`], hubs: ["/blog"] },
  bugBookEntry: { detail: [(s) => `/bug-book/${s}`], hubs: ["/bug-book"] },
  userPersonaPage: { detail: [(s) => `/user-persona/${s}`], hubs: ["/user-persona"] },
  useCasePage: { detail: [(s) => `/use-case/${s}`], hubs: ["/use-case"] },
  caseStudyPage: { detail: [(s) => `/case-study/${s}`], hubs: ["/case-study"] },
  comparisonPage: { detail: [(s) => `/comparisons/${s}`], hubs: ["/comparisons"] },
  comparisonPreviewVsPage: { detail: [(s) => `/comparisons/${s}`], hubs: ["/comparisons"] },
  comparisonPreviewArbiterPage: { detail: [(s) => `/comparisons/${s}`], hubs: ["/comparisons"] },
  comparisonPreviewAlternativesPage: {
    detail: [(s) => `/alternative/${s}`, (s) => `/comparisons/${s}`],
    hubs: ["/alternative", "/comparisons"],
  },
  alternativePage: { detail: [(s) => `/alternative/${s}`], hubs: ["/alternative"] },
  comparisonPreviewHub: { hubs: ["/comparisons"] },
  integrationPage: { detail: [(s) => `/integrations/${s}`], hubs: ["/integrations"] },
  integrationPreviewPage: { detail: [(s) => `/integrations/${s}`], hubs: ["/integrations"] },
  integrationPreviewHub: { hubs: ["/integrations"] },
  // checklistPage, featurePage and reviewPage all publish at the root slug
  // through app/(features)/[slug].
  checklistPage: { detail: [(s) => `/${s}`], hubs: ["/checklist"] },
  featurePage: { detail: [(s) => `/${s}`] },
  reviewPage: { detail: [(s) => `/${s}`] },
  agency: { detail: [(s) => `/directory/agency/${s}`], hubs: ["/directory"] },
  agencyListing: { detail: [(s) => `/directory/agency/${s}`], hubs: ["/directory"] },
  // An author edit changes the byline on every post they wrote. There is no
  // slug to resolve those from here, so the listing is refreshed and the posts
  // themselves fall back to the 60s window.
  author: { hubs: ["/blog"] },
};

/**
 * Site-wide documents that list or summarise content, so any publish can
 * change them.
 */
const ALWAYS = ["/sitemap.xml", "/llms.txt", "/llms-full.txt"];

/**
 * The Markdown copy of a page, as proxy.ts rewrites it.
 *
 * `/blog/foo.md` and `Accept: text/markdown` both land on `/api/md/blog/foo`,
 * so that is the path whose cache entry has to be cleared. `/tools/*` and
 * `/docs/*` are skipped by the proxy and publish their own copies, so they
 * never appear here.
 *
 * @param path - The HTML page's path.
 * @returns The path its Markdown copy is generated at.
 */
function markdownRoute(path: string): string {
  return `/api/md${path === "/" ? "" : path}`;
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    // Fail closed: without a secret every caller is unauthenticated.
    return NextResponse.json(
      { revalidated: false, message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    return NextResponse.json(
      { revalidated: false, message: "Missing signature" },
      { status: 401 },
    );
  }

  const body = await request.text();
  if (!(await isValidSignature(body, signature, secret))) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid signature" },
      { status: 401 },
    );
  }

  let payload: { _type?: string; slug?: string | { current?: string } };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { revalidated: false, message: "Body is not JSON" },
      { status: 400 },
    );
  }

  const type = payload._type;
  const slug = typeof payload.slug === "string" ? payload.slug : payload.slug?.current;
  const route = type ? ROUTES[type] : undefined;
  if (!route) {
    // An unmapped type is not an error - assets and drafts land here too. Say
    // so plainly so the webhook log shows why nothing was cleared.
    return NextResponse.json({
      revalidated: false,
      message: `No route publishes "${type ?? "(no _type)"}"`,
    });
  }

  const pages = [
    ...(slug ? (route.detail ?? []).map((build) => build(slug)) : []),
    ...(route.hubs ?? []),
  ];
  const paths = [...new Set([...pages, ...pages.map(markdownRoute), ...ALWAYS])];

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, type, slug, paths, now: Date.now() });
}

/**
 * Sanity does not send GET, but a browser or an uptime check will. Answer
 * without revalidating so the endpoint is discoverable without being a way to
 * dump the cache.
 */
export function GET() {
  return NextResponse.json({
    ok: true,
    message: "POST a signed Sanity webhook here. See the comment in this route for setup.",
    configured: Boolean(process.env.SANITY_REVALIDATE_SECRET),
  });
}
