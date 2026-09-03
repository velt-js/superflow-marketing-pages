// Review like Gustaf Alströmer.
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
import { REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } =
  REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT;

const SLUG = "review-like-gustaf-alstromer";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_GUSTAF_ALSTROMER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function GustafAlstromerReviewPage() {
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
        id="ld-review-like-gustaf-alstromer-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-gustaf-alstromer-faq"
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
          heading: "The page stopped sounding like your customers months ago",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>A growth review with no analytics sounds impossible</h3>
            <p>
              It would be, done the obvious way. Growth is mostly a question
              about traffic, channels and retention, and this tool can see one
              page and no dashboard. A lens that ignored that would produce
              confident sentences about your funnel that were entirely invented.
            </p>
            <p>
              So every test here is rewritten as something the page itself
              evidences. Not &ldquo;what is your retention&rdquo; but &ldquo;does
              anything on this page explain why someone would come back&rdquo;.
              Not &ldquo;which channel works&rdquo; but &ldquo;what channel is
              this page even built for&rdquo;. The questions that genuinely need
              a dashboard are simply absent, and their absence is the point.
            </p>
            <h3>You can tell who has talked to users</h3>
            <p>
              This is the finding people find most uncomfortable and most useful.
              Copy written after ten customer conversations reads differently
              from copy written from a feature list, and the difference is
              visible on the page: the problem appears in the words a user would
              use, a workflow is described accurately, an objection is answered
              before anyone raised it.
            </p>
            <p>
              Pages that skipped the conversations describe the product
              exclusively in the company&rsquo;s own vocabulary, and no amount of
              polish hides it.
            </p>
            <h3>Name one customer</h3>
            <p>
              The central test is simple and almost nobody passes it first time:
              read the page and describe, concretely, one real person it would
              convert — their job, their company, the thing that went wrong this
              week that sent them looking. If you cannot picture that person,
              you cannot go and find ten more of them, and every distribution
              plan built on the page is guesswork.
            </p>
            <h3>This is a lens, not a person</h3>
            <p>
              Superflow is not affiliated with Y Combinator, and Gustaf
              Alströmer has not reviewed your page or endorsed this tool. This
              is our interpretation of talks YC published publicly, cited under
              every result. It does not write as him, and it will not produce a
              quotation.
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
