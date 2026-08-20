// Tech Stack Detector.
//
// Server-backed, unlike the UTM Builder and Markdown Viewer: reading another
// site's HTML from the visitor's browser is blocked by CORS, so the fetch has
// to happen on our side. The API route wraps the shared detection engine in
// lib/toolkit/detect.ts with the toolkit's SSRF guard, rate limit, and cache.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { TechStackTool } from "@/components/tools/tech-stack/TechStackTool";
import { buildToolPageMetadata } from "@/app/_seo/tool-result-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { TECH_STACK_DETECTOR_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = TECH_STACK_DETECTOR_CONTENT;

const SLUG = "tech-stack-detector";
const PATH = `/tools/${SLUG}`;

const TITLE = TECH_STACK_DETECTOR_CONTENT.title;
const SUBHEAD = TECH_STACK_DETECTOR_CONTENT.subhead;
const DESCRIPTION = TECH_STACK_DETECTOR_CONTENT.description;

/**
 * Landing metadata when the page is opened cold, result metadata when the page
 * is opened from a shared link.
 *
 * A URL carrying `?url=` is somebody's shared result, so it gets a title and an
 * Open Graph card built from that run, and it is noindex with the canonical
 * pointing back here so result variants never compete with this page in
 * search. The policy and the cache read both live in `buildToolPageMetadata`.
 *
 * @param props - Route props. `searchParams` is a promise in Next 16.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}): Promise<Metadata> {
  const { url } = await searchParams;
  return buildToolPageMetadata({
    slug: SLUG,
    path: PATH,
    title: `${TITLE}: What Is That Site Built With?`,
    description: DESCRIPTION,
    rawUrl: url,
  });
}

export default function TechStackDetectorPage() {
  return (
    <>
      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path={PATH}
        trail={[
          { name: "Free tools", url: `${SITE_URL}/tools` },
          { name: TITLE, url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd
        id="ld-tech-stack-detector-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-tech-stack-detector-faq"
        data={buildFaqPageSchema(
          FAQ.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        )}
      />

      <ToolPage
        slug={SLUG}
        eyebrow="Free tool, no login"
        h1={TITLE}
        subhead={SUBHEAD}
        howItWorks={HOW_IT_WORKS}
        faq={FAQ}
        footerCta={{
          heading: "You know the stack. Now watch the site.",
          body: "Superflow agents check every page of every site you ship, on every change, against your own QA rules. They tell you when something breaks, changes, or quietly disappears.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>This tool reads what the server sends, on purpose</h3>
            <p>
              We fetch the page once, the way a browser would, and read the
              raw HTML and the response headers. Platforms leave fingerprints
              there. Shopify injects a Shopify.theme object. Webflow stamps a
              data-wf-site attribute. Next.js embeds a __NEXT_DATA__ payload.
              Analytics snippets, font providers, and CDNs leave the same
              kind of trail. Every finding is listed with the exact signal it
              matched, so the result is something you can verify rather than
              something you have to trust.
            </p>
            <p>
              Reading raw HTML has one real limitation, and you should know
              it before trusting any stack detector, including this one. Tech
              injected at runtime can be invisible. The usual culprit is
              Google Tag Manager: the HTML contains one GTM container, and
              the container loads half a dozen other tools after the page
              starts running. Those tools are not in the HTML, so a raw fetch
              cannot see them. When we find GTM we tell you, and that is your
              cue that the visible list may be the floor rather than the
              ceiling.
            </p>
            <h3>Confidence you can check, not confidence we assert</h3>
            <p>
              Every finding carries one of two labels. Detected means the
              signal is a fingerprint only that product produces. Likely
              means the signal is strong but shareable, like assets served
              from a CDN hostname a platform uses but does not own. Most
              detectors flatten those two into one confident list, which is
              how they end up claiming a site runs on a platform it merely
              borrows a CDN from. Keeping the labels separate, with the
              evidence printed next to each item, means the tool never
              overstates what it found. When a site blocks automated
              requests, we say that too, instead of reporting an empty stack
              as if it were a finding.
            </p>
            <h3>When knowing the stack matters</h3>
            <p>
              An agency inheriting a site wants to know what it is walking
              into before the kickoff call: the platform sets the migration
              cost, and the plugin list is a map of past decisions. A sales
              team wants to know whether a prospect runs on the platform
              their product integrates with. A marketer wants to see which
              analytics and pixels a competitor actually runs, not which
              ones they talk about. And checking your own site is worth a
              minute too, because the fingerprints we read are exactly what
              your site tells every visitor, every crawler, and every
              scraper about itself.
            </p>
          </>
        }
      >
        <TechStackTool />
      </ToolPage>
    </>
  );
}
