// PeterThiel persona review page.
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
import { REVIEW_LIKE_PETER_THIEL_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_PETER_THIEL_CONTENT;

const SLUG = "review-like-peter-thiel";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_PETER_THIEL_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_PETER_THIEL_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_PETER_THIEL_CONTENT.description;

/** Rendered under the result so the lens can be checked against its source. */
const SOURCES = [
    {
      title: "Zero to One (2014)",
      url: "https://en.wikipedia.org/wiki/Zero_to_One"
    },
    {
      title: "Competition Is for Losers, Wall Street Journal, 2014",
      url: "https://www.wsj.com/articles/peter-thiel-competition-is-for-losers-1410535536"
    },
    {
      title: "CS183: Startup — Stanford lecture notes, 2012",
      url: "https://blakemasters.com/peter-thiels-cs183-startup"
    }
  ];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function PeterThielReviewPage() {
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
        id="ld-review-like-peter-thiel-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-peter-thiel-faq"
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
          heading: "Positioning drifts every time someone edits a page",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Most pages are arguing for a slice of a market</h3>
            <p>
              Read enough landing pages in one category and they converge. Each
              one is faster, simpler, more collaborative than the last, and each
              one is describing the same market from a slightly different seat
              in it. That is what competing looks like from the outside, and it
              is a bad position to be arguing from, because a reader comparing
              five pages that make the same claim will pick on price.
            </p>
            <p>
              The alternative is not louder copy. It is a page that defines a
              category it is the only member of, which requires believing
              something the rest of the category does not. That belief is the
              thing this review looks for, and its absence is the most common
              finding.
            </p>
            <h3>Percentages do not move people</h3>
            <p>
              Thirty percent faster is a real improvement and almost nobody
              switches for it. Switching costs time, risk and political capital,
              and a margin does not cover them. An order of magnitude does. When
              this review objects to your strongest claim, it is usually not
              because the claim is false — it is because it is too small to act
              on.
            </p>
            <h3>Distribution is missing from almost every page</h3>
            <p>
              Pages describe the product exhaustively and say nothing about how
              anyone is supposed to find it. That silence usually reflects a real
              gap rather than an editorial choice, and it is the more common
              reason good companies fail than the product ever is.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={SLUG}
          actionLabel="Review my page"
          sources={SOURCES}
          showPersonaPicker
        />
      </ToolPage>
    </>
  );
}
