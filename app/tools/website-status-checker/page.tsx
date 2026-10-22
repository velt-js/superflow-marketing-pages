// Website Status Checker.
//
// Server-backed, like the Favicon Checker and for the same reason: a browser
// cannot ask another origin whether it is up without hitting CORS, and the
// answer has to come from somewhere other than the visitor's own connection
// anyway. The engine is lib/toolkit/site-status.ts, wrapped by the API route
// with the toolkit's SSRF guard and rate limit. Deliberately no cache.
//
// Every result also has its own page at /tools/website-status-checker/<host>,
// rendered by the sibling [...site] route, which runs the check on load.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { WebsiteStatusTool } from "@/components/tools/website-status/WebsiteStatusTool";
import {
  STATUS_FOOTER_CTA,
  StatusWhyThisMatters,
} from "@/components/tools/website-status/status-page-copy";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { toolOgImage } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { WEBSITE_STATUS_CHECKER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = WEBSITE_STATUS_CHECKER_CONTENT;

const SLUG = "website-status-checker";
const PATH = `/tools/${SLUG}`;

const TITLE = WEBSITE_STATUS_CHECKER_CONTENT.title;
const SUBHEAD = WEBSITE_STATUS_CHECKER_CONTENT.subhead;
const DESCRIPTION = WEBSITE_STATUS_CHECKER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Is This Site Down?`,
  description: DESCRIPTION,
  path: PATH,
  ogImage: toolOgImage(SLUG),
});

export default function WebsiteStatusCheckerPage() {
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
        id="ld-website-status-checker-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-website-status-checker-faq"
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
        privacyNote="Free, no login, no email. Nothing stored: every check is a fresh request."
        howItWorks={HOW_IT_WORKS}
        faq={FAQ}
        footerCta={STATUS_FOOTER_CTA}
        whyThisMatters={<StatusWhyThisMatters />}
      >
        <WebsiteStatusTool />
      </ToolPage>
    </>
  );
}
