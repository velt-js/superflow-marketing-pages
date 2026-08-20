// Favicon Checker.
//
// Server-backed, like the Tech Stack Detector and for the same reason: CORS
// stops a browser from reading another site's HTML, and it also stops it from
// reading the status and bytes of another origin's icon. Both fetches have to
// happen on our side. The engine is lib/toolkit/favicon.ts, wrapped by the
// API route with the toolkit's SSRF guard, rate limit, and cache.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { FaviconTool } from "@/components/tools/favicon/FaviconTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { FAVICON_CHECKER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = FAVICON_CHECKER_CONTENT;

const SLUG = "favicon-checker";
const PATH = `/tools/${SLUG}`;

const TITLE = FAVICON_CHECKER_CONTENT.title;
const SUBHEAD = FAVICON_CHECKER_CONTENT.subhead;
const DESCRIPTION = FAVICON_CHECKER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Does Your Favicon Actually Load?`,
  description: DESCRIPTION,
  path: PATH,
});

export default function FaviconCheckerPage() {
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
        id="ld-favicon-checker-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-favicon-checker-faq"
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
          heading: "The favicon is the small thing you found. There are others.",
          body: "Superflow agents check every page of every site you ship, on every change, against your own QA rules. They tell you when something breaks, changes, or quietly disappears, including the details nobody thinks to look at twice.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Every other favicon checker reads the HTML. That is the bug.</h3>
            <p>
              A favicon has a declaration and it has a file, and the two fail
              independently. Almost every tool that claims to check favicons
              looks at the declaration: it fetches the page, finds a link tag
              with rel=icon, and reports a pass. That test is satisfied by
              markup alone, which means it passes on a very large number of
              sites whose tabs are blank, because the file the declaration
              points at was never deployed, was deleted in a redesign, or was
              never at that path to begin with. The declaration is the part
              that is easy to get right and the part that keeps working after
              the file stops.
            </p>
            <p>
              So this tool does the boring thing instead. It reads the
              declarations, and then it fetches each one, along with the web
              app manifest and the implicit /favicon.ico that browsers try when
              nothing is declared. Every claim on the result page is about a
              file we actually pulled down and looked at.
            </p>
            <h3>Why we read the bytes instead of the content type</h3>
            <p>
              Fetching is not sufficient either, and the reason is the most
              common favicon failure in modern web apps. A single-page app
              typically has a catch-all route that returns the app shell for
              any path the router does not recognise. When the icon file is
              missing, a request for /favicon.ico therefore does not 404. It
              returns HTTP 200 with a complete HTML document, and depending on
              the host it may even carry an image content type. A checker that
              reads the status code sees 200 and reports success. A checker
              that reads the content type sees image/x-icon and reports
              success. The browser reads the bytes, finds a doctype where it
              expected an icon header, and shows the blank page glyph.
            </p>
            <p>
              The only source that cannot be wrong about what a file is, is the
              file. So we identify the format from the first bytes of every
              response: the PNG signature, the ICO directory header, the SVG
              root element, the doctype of an HTML page in a costume. The same
              bytes give us the real pixel dimensions, out of the PNG IHDR
              chunk and out of the ICO directory, which is how we can tell you
              that the link declaring sizes=&quot;180x180&quot; is pointing at
              a 57x57 file that iOS has been upscaling for two years.
            </p>
            <h3>The small thing everyone sees and nobody checks</h3>
            <p>
              A favicon is a rounding error in a site&apos;s design budget and
              it appears in every tab, every bookmark, every history entry,
              every browser&apos;s new tab grid, and every home screen somebody
              saves the site to. It is the only piece of your brand that is on
              screen while somebody is reading something else. A missing one
              does not break anything, which is exactly why it survives so long:
              nothing fails, no error is logged, no test goes red, and the
              generic page glyph sits next to your competitors&apos; logos for
              months. It usually gets found by accident, by somebody who
              happened to look at their own tab bar.
            </p>
            <p>
              That pattern is worth noticing, because the favicon is not the
              only thing shaped like it. The failures that survive longest are
              the ones with no failure signal: the Open Graph image that stopped
              resolving, the icon that returns HTML, the meta description that
              got truncated in a template change. Nobody is watching, so nobody
              knows.
            </p>
          </>
        }
      >
        <FaviconTool />
      </ToolPage>
    </>
  );
}
