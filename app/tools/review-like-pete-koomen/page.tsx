// Review like Pete Koomen.
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
import { REVIEW_LIKE_PETE_KOOMEN_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_PETE_KOOMEN_CONTENT;

const SLUG = "review-like-pete-koomen";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_PETE_KOOMEN_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_PETE_KOOMEN_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_PETE_KOOMEN_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function PeteKoomenReviewPage() {
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
        id="ld-review-like-pete-koomen-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-pete-koomen-faq"
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
          heading: "The friction you added last sprint is still there",
          body: "Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Most conversion advice is folklore</h3>
            <p>
              Search for how to improve a landing page and you will be told that
              red buttons outperform green ones, that shorter forms always win,
              and that social proof belongs above the fold. Some of this was true
              on somebody else&rsquo;s page in 2013. None of it is a finding
              about yours.
            </p>
            <p>
              What survives is not a list of rules but a habit: count the things
              that can be counted, name the claim the page is making, and work
              out what you would change to find out whether the claim is landing.
              This lens is that habit, applied to one page.
            </p>
            <h3>It will not predict a lift, and that is deliberate</h3>
            <p>
              The tempting feature here is a number — &ldquo;this change is worth
              14% more signups&rdquo;. We will not ship it. The tool sees one
              page. It has no baseline, no traffic, no funnel and no segment
              data, so any percentage would be produced by a language model
              writing something plausible, and a fabricated measurement is
              indistinguishable from a real one once it is in a slide.
            </p>
            <p>
              So it counts what is actually countable: required fields, discrete
              steps to value, competing calls to action, distinct audiences
              addressed in one hero. Those numbers are real, and they are usually
              higher than the team building the page believes.
            </p>
            <h3>The empty dashboard problem</h3>
            <p>
              The most common failure this lens catches is a page that has
              carefully optimised the wrong finish line. Signup is measured,
              celebrated, and treated as the end of the funnel — and the visitor
              arrives at an empty dashboard having still not seen the product do
              anything useful. The Aha moment is further away than the signup
              button, and pages are rarely designed for the distance between the
              two.
            </p>
            <h3>This is a lens, not a person</h3>
            <p>
              Superflow is not affiliated with Y Combinator, and Pete Koomen has
              not reviewed your page or endorsed this tool. This is our
              interpretation of published episodes and essays, cited under every
              result. It does not write as him, and it will not produce a
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
