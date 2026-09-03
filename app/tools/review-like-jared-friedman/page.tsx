// Review like Jared Friedman.
//
// Server-backed, same shape as the sibling partner lenses. See the note on
// app/tools/review-like-aaron-epstein/page.tsx for why the provenance line is
// derived inside ReviewTool rather than fixed here.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_JARED_FRIEDMAN_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } =
  REVIEW_LIKE_JARED_FRIEDMAN_CONTENT;

const SLUG = "review-like-jared-friedman";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_JARED_FRIEDMAN_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_JARED_FRIEDMAN_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_JARED_FRIEDMAN_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function JaredFriedmanReviewPage() {
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
        id="ld-review-like-jared-friedman-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-jared-friedman-faq"
        data={buildFaqPageSchema(
          FAQ.map((item) => ({ question: item.question, answer: item.answer })),
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
          heading: "The page is fine. The question is what it is selling",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The lens most likely to disagree with the others</h3>
            <p>
              Three of the four YC lenses here are about how well the page does
              its job. This one asks a question that sits underneath all of
              them: supposing the page is clear, converts well, and has a
              channel — is there a problem at the bottom of it that somebody
              actually has?
            </p>
            <p>
              A page can be beautifully built on top of nothing, and every other
              reviewer on this site will pass it. That is the specific gap this
              lens exists to close.
            </p>
            <h3>What the page says, not whether the idea is good</h3>
            <p>
              This is the tightest constraint on the whole roster and it is worth
              being explicit about. Properly evaluating a startup idea needs the
              market, the founders, the competition and a conversation. This tool
              has a marketing page.
            </p>
            <p>
              So every test judges what the page CLAIMS about the problem, never
              whether the idea will work. &ldquo;This page never states a
              problem&rdquo; is answerable from the page and is a real finding.
              &ldquo;This market is too small&rdquo; is not answerable from the
              page, and a reviewer asked for it anyway would produce something
              confident and made up. You will not see that verdict here, and its
              absence is deliberate rather than an oversight.
            </p>
            <h3>Technology-first pages have a shape</h3>
            <p>
              The most reliable signal in the lens is a headline that names a
              technology with the problem reverse-engineered in the section
              below. Ideas that started from a capability and went looking for a
              use read a particular way, and the useful test is simple: would
              this page still exist, in this form, if the technology it is built
              on had never been invented?
            </p>
            <h3>The competitor is usually the spreadsheet</h3>
            <p>
              Pages routinely write as though their problem is currently
              unsolved. The reader knows perfectly well that they solve it
              today — with a spreadsheet, an agency, a junior employee, or by
              tolerating it. A page that never acknowledges the existing
              alternative loses to it silently, and the team never finds out
              why.
            </p>
            <h3>This is a lens, not a person</h3>
            <p>
              Superflow is not affiliated with Y Combinator, and Jared Friedman
              has not reviewed your page, your idea, or endorsed this tool. This
              is our interpretation of talks and editorial YC published
              publicly, cited under every result. It does not write as him, and
              it will not produce a quotation.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={SLUG}
          actionLabel="Review my page"
          personaGroup="yc"
        />
      </ToolPage>
    </>
  );
}
