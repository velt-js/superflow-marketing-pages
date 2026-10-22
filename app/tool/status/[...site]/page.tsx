import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import SiteStatusResultPage from "@/components/site-status/SiteStatusResultPage";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { parseStatusTarget, type StatusTarget } from "@/lib/site-status/target";
import { checkSiteStatus } from "@/lib/site-status/check";

// Every visit runs a fresh request against the target site, so this page
// can never be prerendered or cached.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ site: string[] }>;
}

/**
 * Rebuild the target from the catch-all segments: the first segment is the
 * host, the rest is the path. Returns null for anything that is not a
 * public website address.
 */
function targetFromParams(site: string[] | undefined): StatusTarget | null {
  try {
    if (!site || site.length === 0) return null;
    return parseStatusTarget(site.map((segment) => decodeURIComponent(segment)).join("/"));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { site } = await params;
  const target = targetFromParams(site);
  if (!target) return {};
  return buildPageMetadata({
    title: `Is ${target.label} down right now?`,
    description: `Live status check for ${target.label}: we load the site from our servers when you open this page and report whether it is up, with the HTTP status and response time.`,
    path: `/tool/status/${target.segments.map(encodeURIComponent).join("/")}`,
    // One page per user-supplied URL is an unbounded set of near-identical
    // pages; keep them out of the index and let /tool/status carry the SEO.
    noindex: true,
  });
}

export default async function SiteStatusResultRoute({ params }: PageProps) {
  const { site } = await params;
  const target = targetFromParams(site);
  if (!target) notFound();

  const result = await checkSiteStatus(target);

  return (
    <main>
      <SiteNav />
      <SiteStatusResultPage target={target} result={result} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
