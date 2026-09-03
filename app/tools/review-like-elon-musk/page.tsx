// ElonMusk persona review page.
//
// Generated from scripts/gen-persona-pages.js — the five persona pages differ
// only in their content constant, sources and essay. Edit the generator, or
// edit this file directly; it is checked in and no build step regenerates it.
//
// The provenance line is NOT set here. The persona picker can switch lens
// without leaving the page, so it is derived from the selected persona inside
// ReviewTool — a line fixed to the page would show one persona's framing over
// another persona's review.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_ELON_MUSK_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_ELON_MUSK_CONTENT;

const SLUG = "review-like-elon-musk";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_ELON_MUSK_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_ELON_MUSK_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_ELON_MUSK_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function ElonMuskReviewPage() {
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
        id="ld-review-like-elon-musk-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-elon-musk-faq"
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
          heading: "Pages accumulate. Nobody is assigned to delete",
          body: "Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Optimising a thing that should not exist</h3>
            <p>
              The most expensive mistake in the algorithm is doing step three
              before step two. Someone spends a week improving a section that
              should have been deleted, and because the section is now better,
              nobody questions whether it belongs. Pages accumulate this way: a
              logo strip nobody chose, a testimonial nobody reads, a stat card
              that has been wrong since the quarter it was written.
            </p>
            <p>
              So the first two questions this review asks are not about wording.
              They are: who set this requirement, and what happens if we delete
              it. Most sections cannot answer the first, and a surprising number
              survive the second without anyone noticing.
            </p>
            <h3>A claim you cannot check is not a claim</h3>
            <p>
              &ldquo;Blazing fast&rdquo; is a mood. &ldquo;Cold start under
              200ms at p99&rdquo; is a claim. The second one can be wrong, which
              is exactly what makes it worth reading — a reader can test it,
              and a page willing to be tested is a page worth trusting. Most
              pages carry a dozen adjectives standing where a number was
              available.
            </p>
            <h3>Cycle time is what the reader is actually judging</h3>
            <p>
              Every gate between landing on a page and the product doing
              something is time in the loop. A form field, a verification email,
              a scheduled call. The reader does not experience these as
              qualification steps; they experience them as evidence of how this
              company will treat their time later.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={SLUG}
          actionLabel="Review my page"
          showPersonaPicker
        />
      </ToolPage>
    </>
  );
}
