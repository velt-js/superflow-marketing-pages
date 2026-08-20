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
import { buildToolPageMetadata } from "@/app/_seo/tool-result-metadata";
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

/** Rendered under the result so the lens can be checked against its source. */
const SOURCES = [
    {
      title: "Starbase tour with Everyday Astronaut, 2021 — the five-step algorithm",
      url: "https://www.youtube.com/watch?v=t705r8ICkRw"
    },
    {
      title: "TED interview on first-principles reasoning",
      url: "https://www.ted.com/talks/elon_musk_the_future_we_re_building_and_boring"
    }
  ];

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
    title: `${TITLE}: Free Landing Page Review`,
    description: DESCRIPTION,
    rawUrl: url,
  });
}

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
          sources={SOURCES}
          showPersonaPicker
        />
      </ToolPage>
    </>
  );
}
