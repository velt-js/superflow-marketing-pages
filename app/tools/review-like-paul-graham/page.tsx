// Review like Paul Graham.
//
// Server-backed: the lens lives in the product backend as a built-in agent, so
// the free tool and the in-product agent apply the same review. The lens itself
// is a checked-in file distilled from the essays rather than a live retrieval
// over them — see the backend's persona.model.ts for why.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_PAUL_GRAHAM_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_PAUL_GRAHAM_CONTENT;

const SLUG = "review-like-paul-graham";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_PAUL_GRAHAM_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_PAUL_GRAHAM_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_PAUL_GRAHAM_CONTENT.description;

/** Shown above every result. The lens is his essays; the reviewer is not him. */
const PROVENANCE =
  "This is a review lens distilled from Paul Graham's published essays — the recurring tests he applies, written down and applied to your page. It is not him, it does not speak as him, and it does not quote him.";

/** Rendered under the result so the lens can be checked against its source. */
const SOURCES = [
  { title: "Startups in 13 Sentences", url: "https://www.paulgraham.com/13sentences.html" },
  { title: "Write Like You Talk", url: "https://www.paulgraham.com/talk.html" },
  { title: "Write Simply", url: "https://www.paulgraham.com/simply.html" },
  { title: "Writing, Briefly", url: "https://www.paulgraham.com/writing44.html" },
  { title: "Taste for Makers", url: "https://www.paulgraham.com/taste.html" },
  { title: "Schlep Blindness", url: "https://www.paulgraham.com/schlep.html" },
  { title: "The 18 Mistakes That Kill Startups", url: "https://www.paulgraham.com/startupmistakes.html" },
  { title: "Be Good", url: "https://www.paulgraham.com/good.html" },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function PaulGrahamReviewPage() {
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
        id="ld-review-like-paul-graham-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-paul-graham-faq"
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
          heading: "Clarity drifts every time someone edits a page",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Every page checker answers a question nobody asked</h3>
            <p>
              You can already find out whether your contrast ratios pass, your
              meta description is the right length, and your images have alt
              text. Those tools are correct and they are useful, and not one of
              them will tell you the thing that is actually wrong with most
              landing pages, which is that a stranger cannot tell what the
              product is.
            </p>
            <p>
              That failure is invisible to automated checks because nothing
              about it is malformed. The markup is valid. The page loads fast.
              It just does not say anything. What catches it is a reader with
              opinions, and the most useful opinions about startup pages have
              been written down in public for twenty years.
            </p>
            <h3>Why a lens, and not a scraper</h3>
            <p>
              The obvious way to build this is to scrape the essays and search
              them at run time for whatever seems related to your page. We
              deliberately did not. Searching a corpus finds passages about your{" "}
              <em>topic</em> — point it at a pricing page and it returns the
              essay about pricing. What makes the review feel like the lens is
              not the topic, it is the recurring tests: does this say what it
              is, is it for someone specific, could I try it, would you say
              this sentence out loud.
            </p>
            <p>
              Those tests are stable and there are only a handful of them, so
              they are written down in a file, distilled from the essays and
              cited back to them. That also means the same page gets the same
              verdict tomorrow, which a retrieval-backed version could not
              promise.
            </p>
            <h3>Some of the best ideas are missing on purpose</h3>
            <p>
              &ldquo;Pick good cofounders&rdquo; is the first item on his own
              list of thirteen. It is not in this tool, because a landing page
              cannot show evidence for it, and a reviewer asked to judge it from
              a landing page will invent something that sounds right. Every test
              in the lens has to be answerable from what is actually on your
              page. That constraint costs a few famous ideas and it is what
              makes the findings trustworthy.
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
