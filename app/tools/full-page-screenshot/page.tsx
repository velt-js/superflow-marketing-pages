// Full Page Screenshot.
//
// Server-backed: a headless browser is not something a marketing site runs in
// a visitor's tab, so the capture happens in the product backend and this
// page is the front end for it. The API route at
// /api/tools/full-page-screenshot holds the SSRF guard, the per-IP budget,
// and the one hour result cache.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ScreenshotTool } from "@/components/tools/screenshot/ScreenshotTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { FULL_PAGE_SCREENSHOT_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = FULL_PAGE_SCREENSHOT_CONTENT;

const SLUG = "full-page-screenshot";
const PATH = `/tools/${SLUG}`;

const TITLE = FULL_PAGE_SCREENSHOT_CONTENT.title;
const SUBHEAD = FULL_PAGE_SCREENSHOT_CONTENT.subhead;
const DESCRIPTION = FULL_PAGE_SCREENSHOT_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Capture A Whole Page As One PNG`,
  description: DESCRIPTION,
  path: PATH,
});

export default function FullPageScreenshotPage() {
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
        id="ld-full-page-screenshot-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-full-page-screenshot-faq"
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
          heading: "One capture is a moment. Watching is a habit.",
          body: "Superflow agents open your pages on a schedule, capture what they see, and tell you when a layout breaks, an image stops loading, or a section quietly disappears.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Free screenshot tools usually cost you something</h3>
            <p>
              Search for a full page screenshot tool and most of what you find
              takes payment in a currency other than money. A watermark in the
              corner, so the image is unusable in a client deck. A height cap
              that quietly cuts your landing page off at 8,000 pixels. An
              email gate before the download. A browser extension that wants
              permission to read every site you visit, forever, in exchange for
              a button you press twice a month. None of that is about the cost
              of taking a screenshot. It is about the cost of building an
              audience out of people who needed one.
            </p>
            <p>
              This tool has none of those. You paste a URL and you get a PNG.
              The one thing it does ask of you is attention to a single fact:
              the link to that image expires in about a day, because the file
              lives in our storage bucket and we do not keep strangers' page
              captures forever. Download the file and it is yours. Leave the
              link in a document and it will be dead by next week. We say that
              next to the download button rather than in a footnote, because a
              screenshot that vanishes from a client proposal is a worse
              outcome than a watermark.
            </p>
            <h3>Why a naive capture comes back mostly blank</h3>
            <p>
              Capturing a whole page sounds like it should be one instruction
              to a browser, and it used to be. Then lazy loading became the
              default. Images below the fold now ship as empty placeholders
              that only fetch when they scroll into view, sections animate
              themselves in on an intersection observer, and half the page does
              not exist until somebody looks at it. Point a naive capture tool
              at a modern marketing site and you get the hero, then thousands
              of pixels of grey boxes and blank space where the content is
              supposed to be.
            </p>
            <p>
              Getting it right means driving the browser the way a person would.
              Load the page, scroll all the way to the bottom, give the images
              that this triggers a moment to arrive, wait for the network to go
              quiet, then capture the full height in one pass. That is why this
              takes a few seconds rather than being instant, and it is the
              difference between a screenshot of a page and a screenshot of a
              page's loading state.
            </p>
            <h3>What people actually use these for</h3>
            <p>
              Design review, mostly. A full page capture is the only way to put
              the whole flow in front of somebody who is not going to click
              through it. Then there is the archive case: proving what a page
              said on a given day, before a price changed or a claim was
              edited. Competitive research runs on it too, because a folder of
              full page captures shows how a rival's messaging moved over a
              quarter in a way no notes ever do. And the quiet one is
              regression: capturing your own pages before and after a release,
              and putting the two side by side to see what moved that nobody
              meant to move.
            </p>
          </>
        }
      >
        <ScreenshotTool />
      </ToolPage>
    </>
  );
}
