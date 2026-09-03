// Review like a YC Partner — the hub for the four partner lenses.
//
// NO ENDPOINT OF ITS OWN. `ToolPage` carries this page's slug (for analytics,
// related tools and the Markdown copy), while `ReviewTool` is handed a PARTNER
// slug, because that is the endpoint the form posts to. They are deliberately
// different strings: a fifth blended "YC partner" agent would average four
// opinionated reviewers into the generic critique the persona prompts exist to
// prevent. See lib/tools/content/review-like-yc-partner.ts.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { REVIEW_LIKE_YC_PARTNER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_YC_PARTNER_CONTENT;

const SLUG = "review-like-yc-partner";
const PATH = `/tools/${SLUG}`;

/** The partner the picker opens on. Also the endpoint the form posts to. */
const DEFAULT_PERSONA_SLUG = "review-like-aaron-epstein";

const TITLE = REVIEW_LIKE_YC_PARTNER_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_YC_PARTNER_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_YC_PARTNER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function YcPartnerReviewPage() {
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
        id="ld-review-like-yc-partner-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-yc-partner-faq"
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
          heading: "A page passes review once, then drifts for six months",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Four reviewers who disagree beat one who does not</h3>
            <p>
              The instinct when building something like this is to blend every
              lens into one — take the four partners, average their advice, and
              ship a single &ldquo;YC review&rdquo;. We tried the thought and
              rejected it, because what makes a review useful is a specific
              opinion applied consistently, and the average of four opinionated
              reviewers is the bland page critique you can already get from any
              free checker.
            </p>
            <p>
              So they stay separate, and they contradict each other. The design
              lens can pass a page that the idea lens fails outright. The
              conversion lens will tell you to cut a section that the
              distribution lens says is the only evidence you have talked to a
              customer. That gap is usually the most useful thing on the page.
            </p>
            <h3>Why these four questions</h3>
            <p>
              A landing page fails in four fairly distinct ways, and most teams
              only check for one of them. It can fail to communicate, so nobody
              understands what you sell. It can communicate perfectly and still
              lose people between the headline and the product. It can convert
              well for a visitor who will never come back, or who was never
              going to be found in the first place. And it can do all three
              competently on top of an idea nobody needed.
            </p>
            <p>
              Each partner lens here is built around one of those failures,
              which is why running two is worth more than running one twice.
            </p>
            <h3>What a lens can and cannot see</h3>
            <p>
              Every test in every lens has to be answerable from the page
              itself. That constraint costs some of the best ideas each of
              these partners has — the growth lens has no access to your
              retention curve, and the idea lens cannot tell you whether your
              market is big enough. Asked to judge those anyway, a reviewer
              invents something that sounds right, and an invented finding is
              worse than a missing one.
            </p>
            <p>
              So the lenses are narrowed to what a page can evidence: the
              segment it names, the steps it costs, the problem it states, the
              claim it makes. Where a question needs a dashboard to answer, it
              is not in the lens, and the review says so rather than guessing.
            </p>
            <h3>These are lenses, not people</h3>
            <p>
              Superflow is not affiliated with Y Combinator, and none of these
              partners has reviewed your page or endorsed this tool. Each lens
              is our interpretation of material the partner or YC published
              publicly — the Design Review series, Startup School talks,
              essays — and every source is cited under the result so you can
              check the interpretation against the original. No lens here
              writes in the first person as anyone, and none of them will
              produce a quotation.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={DEFAULT_PERSONA_SLUG}
          actionLabel="Review my page"
          personaGroup="yc"
        />
      </ToolPage>
    </>
  );
}
