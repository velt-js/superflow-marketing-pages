// Review like Aaron Epstein.
//
// Server-backed: the lens lives in the product backend as a built-in agent, so
// the free tool and the in-product agent apply the same review. The lens itself
// is a checked-in file distilled from the Design Review episodes rather than a
// live retrieval over them — see the backend's persona.model.ts for why.
//
// The provenance line is NOT set here. The partner picker can switch lens
// without leaving the page, so it is derived from the SELECTED persona inside
// ReviewTool — a line fixed to the page would show this partner's framing over
// another partner's review, which for a lens named after a living person is
// exactly the claim it exists to prevent.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_AARON_EPSTEIN_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_AARON_EPSTEIN_CONTENT;

const SLUG = "review-like-aaron-epstein";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_AARON_EPSTEIN_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_AARON_EPSTEIN_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_AARON_EPSTEIN_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function AaronEpsteinReviewPage() {
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
        id="ld-review-like-aaron-epstein-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-aaron-epstein-faq"
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
          heading: "Every edit is a chance to make the page less clear",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The corpus is the task</h3>
            <p>
              Most review lenses are an act of translation. You take somebody
              who wrote about startups, or products, or physics, and you work
              out what their thinking would imply about a marketing page. The
              translation is where the errors come from.
            </p>
            <p>
              This one needs almost no translation. YC publishes a series in
              which Aaron Epstein loads a real startup&rsquo;s landing page on
              screen and says what is wrong with it, and that is precisely what
              this tool does. The heuristics below are not inferred from a
              general philosophy; they are the recurring objections in a public
              record of the exact task.
            </p>
            <h3>The most expensive mistake is being clever</h3>
            <p>
              Almost every page that fails here fails the same way. Somebody
              wrote a headline they were proud of. It is a metaphor, or a
              coined category, or a pun that rewards you for knowing what the
              company does — and every visitor who does not already know is
              filtered out by the largest text on the page.
            </p>
            <p>
              The fix is rarely subtle and rarely popular internally, which is
              why an outside lens is worth something: it has no attachment to
              the sentence you spent a week on.
            </p>
            <h3>Counting beats opining</h3>
            <p>
              Several of these tests are counts rather than judgements. How many
              things above the fold are styled like the primary button. How many
              scrolls before you see the product do anything. How many slides in
              the carousel nobody will reach. Counts are checkable, they do not
              drift between runs, and they are much harder to argue with in a
              meeting than &ldquo;the hero feels cluttered&rdquo;.
            </p>
            <h3>This is a lens, not a person</h3>
            <p>
              Superflow is not affiliated with Y Combinator, and Aaron Epstein
              has not reviewed your page or endorsed this tool. What follows is
              our interpretation of talks and episodes YC published publicly,
              cited under every result so you can check the interpretation
              against the original. It does not write as him, and it will not
              produce a quotation.
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
