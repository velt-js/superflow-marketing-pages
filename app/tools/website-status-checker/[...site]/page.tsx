// The shareable status page: /tools/website-status-checker/<host>/<path...>
//
// Opening this address IS the check. The server runs it before the first
// byte of HTML goes out, so the verdict is in the document itself: a link
// pasted into a chat shows the site's state when it is opened, not when it
// was copied, and it works with JavaScript off.
//
// WHY A NESTED CATCH-ALL
//
// /tools/[...slug] already exists, but it is `dynamicParams = false` and
// serves only the `.md` copies. Next resolves the literal segment
// `website-status-checker` before that catch-all, so this route owns
// everything under it and /tools/website-status-checker.md still reaches
// the Markdown route.
//
// The page is rate limited on the same per-IP budget as the API, because a
// reload here costs exactly what a POST costs. A limited visitor still gets
// the page, with the limiter's message where the verdict would be.

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tools/ToolPage";
import { WebsiteStatusTool } from "@/components/tools/website-status/WebsiteStatusTool";
import {
  STATUS_FOOTER_CTA,
  StatusWhyThisMatters,
} from "@/components/tools/website-status/status-page-copy";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { toolOgImage } from "@/app/_seo/og-images";
import { WEBSITE_STATUS_CHECKER_CONTENT } from "@/lib/tools/content";
import {
  checkSiteStatus,
  labelForUrl,
  statusPagePathFor,
  urlFromStatusSegments,
  type SiteStatusReport,
} from "@/lib/toolkit/site-status";
import { resolveUserUrl } from "@/lib/toolkit/url";
import { applyRateLimit, clientIpFrom } from "@/lib/toolkit/ratelimit";
import styles from "@/components/tools/website-status/WebsiteStatus.module.css";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = WEBSITE_STATUS_CHECKER_CONTENT;

const SLUG = "website-status-checker";

/** Every visit runs a fresh request against the site. Never prerender. */
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ site: string[] }>;
}

/**
 * The normalized, SSRF-checked URL a status page is about, or null when the
 * segments do not name a public website.
 *
 * @param site - The catch-all segments.
 */
async function resolveTarget(site: string[] | undefined): Promise<string | null> {
  try {
    const raw = urlFromStatusSegments(site);
    if (!raw) return null;
    const resolved = await resolveUserUrl(raw);
    return resolved.ok ? resolved.url : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { site } = await params;
  const url = await resolveTarget(site);
  if (!url) return {};
  const label = labelForUrl(url);
  return buildPageMetadata({
    title: `Is ${label} down right now?`,
    description: `Live status check for ${label}. We request the site from our servers when you open this page and report whether it is up, with the HTTP status and response time.`,
    path: statusPagePathFor(url) ?? `/tools/${SLUG}`,
    ogImage: toolOgImage(SLUG),
    // One page per user-supplied URL is an unbounded set of near-identical
    // pages. The tool page carries the SEO; these carry the answer.
    noindex: true,
  });
}

export default async function WebsiteStatusPage({ params }: PageProps) {
  const { site } = await params;
  const url = await resolveTarget(site);
  if (!url) notFound();

  const label = labelForUrl(url);

  // Same budget as the API: a reload here is a run.
  const requestHeaders = await headers();
  const ip = clientIpFrom(new Headers(requestHeaders));
  const decision = await applyRateLimit({ tool: SLUG, ip, tier: "light" });

  let report: SiteStatusReport | undefined;
  if (decision.allowed) {
    report = await checkSiteStatus(url);
  }

  return (
    <ToolPage
      slug={SLUG}
      eyebrow="Live status check"
      h1={`Is ${label} down?`}
      subhead={
        report
          ? "We requested this site from our server as this page loaded. Reload to check again."
          : "We could not run the check right now."
      }
      privacyNote="Free, no login, no email. Nothing stored: every check is a fresh request."
      howItWorks={HOW_IT_WORKS}
      faq={FAQ}
      footerCta={STATUS_FOOTER_CTA}
      whyThisMatters={<StatusWhyThisMatters />}
    >
      {report ? (
        <WebsiteStatusTool initialUrl={label} initialReport={report} />
      ) : (
        <div className={styles.tool}>
          <p className={styles.formError} role="alert">
            {decision.message}
          </p>
        </div>
      )}
    </ToolPage>
  );
}
