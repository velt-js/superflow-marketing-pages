// Review like Steve Jobs.
//
// FRAMING IS LOAD-BEARING HERE. He published no body of writing, so this lens
// is assembled from the public record and is an interpretation of a documented
// approach to products rather than of the man's own prose. The provenance line
// renders above every result, and the backend carries the same fence
// (`firstPartyCorpus: false`). If one side loses it, pull both.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_STEVE_JOBS_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_STEVE_JOBS_CONTENT;

const SLUG = "review-like-steve-jobs";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_STEVE_JOBS_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_STEVE_JOBS_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_STEVE_JOBS_CONTENT.description;

/**
 * Shown above every result. Not a disclaimer to be trimmed for length: it is
 * the difference between applying documented principles and putting words in a
 * real person's mouth.
 */
const PROVENANCE =
  "This applies the product principles Apple made famous under Steve Jobs, assembled from the public record — keynotes, interviews, and published design copy. It is an interpretation of a body of work, not the person. It does not speak as him, does not claim what he would have said, and does not quote him.";

/** Rendered under the result so the lens can be checked against its source. */
const SOURCES = [
  {
    title: "Apple II brochure, 1977 — “Simplicity is the ultimate sophistication”",
    url: "https://www.apple.com/",
  },
  {
    title: "WWDC 1997 closing Q&A — start with the customer experience",
    url: "https://www.youtube.com/watch?v=oeqPrUmVz-o",
  },
  {
    title: "Apple Special Event, October 2001 — “1,000 songs in your pocket”",
    url: "https://www.youtube.com/watch?v=kN0SVBCJqLs",
  },
  {
    title: "Stanford commencement address, 2005",
    url: "https://news.stanford.edu/2005/06/12/youve-got-find-love-jobs-says/",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function SteveJobsReviewPage() {
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
        id="ld-review-like-steve-jobs-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-steve-jobs-faq"
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
          heading: "Pages accumulate. Nobody is assigned to remove things",
          body: "Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Most pages fail by addition</h3>
            <p>
              Landing pages rarely get worse in one decision. They get worse the
              way a desk gets messy: a section for the new feature, a badge for
              the award, a banner for the webinar, a second button because two
              teams each wanted their own. Every addition was reasonable and
              nobody is ever assigned to take something away.
            </p>
            <p>
              Focus is the discipline of subtraction, and it is the hardest
              thing to do to your own page because you know why each piece is
              there. An outside reader does not, and simply asks what all of
              this is for.
            </p>
            <h3>What it means to say it in human terms</h3>
            <p>
              The famous version is a hard disk described as a thousand songs in
              your pocket. The principle underneath is that a specification is
              an answer to a question the reader did not ask. They do not want
              five gigabytes, ninety-nine point nine nine percent uptime, or
              unlimited seats — those are facts about your system. What they
              want is what those facts do for them, and most pages leave that
              translation as an exercise.
            </p>
            <h3>Why we measure the design rather than look at it</h3>
            <p>
              This review reads the styles your browser actually resolved, not
              just a screenshot. When it says your page renders five heading
              sizes with no system, that is counted from what shipped. A model
              looking at an image can only guess at that, and a guessed
              measurement stated as a finding is worse than no finding, because
              it is indistinguishable from a real one.
            </p>
            <h3>Run it alongside the other lens</h3>
            <p>
              The Paul Graham review asks whether the page is clear, honest and
              built for someone specific. This one asks whether it decided what
              to be. They disagree often, and where they disagree is usually the
              most interesting thing anyone will tell you about your page.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={SLUG}
          actionLabel="Review my page"
          provenance={PROVENANCE}
          sources={SOURCES}
        />
      </ToolPage>
    </>
  );
}
