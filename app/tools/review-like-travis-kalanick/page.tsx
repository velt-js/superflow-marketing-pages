// TravisKalanick persona review page.
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
import { REVIEW_LIKE_TRAVIS_KALANICK_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = REVIEW_LIKE_TRAVIS_KALANICK_CONTENT;

const SLUG = "review-like-travis-kalanick";
const PATH = `/tools/${SLUG}`;

const TITLE = REVIEW_LIKE_TRAVIS_KALANICK_CONTENT.title;
const SUBHEAD = REVIEW_LIKE_TRAVIS_KALANICK_CONTENT.subhead;
const DESCRIPTION = REVIEW_LIKE_TRAVIS_KALANICK_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Landing Page Review`,
  description: DESCRIPTION,
  path: PATH,
});

export default function TravisKalanickReviewPage() {
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
        id="ld-review-like-travis-kalanick-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-review-like-travis-kalanick-faq"
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
          heading: "Friction gets added one field at a time",
          body: "Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The gap between wanting and having</h3>
            <p>
              The original insight behind the product this lens comes from was
              not a business model. It was a duration: press a button, a car
              appears. Everything else followed from making that gap as close to
              zero as it could get, and most of the engineering was about
              removing things from the middle of it.
            </p>
            <p>
              Software pages have the same gap and rarely measure it. Between a
              visitor deciding they are interested and the product doing
              anything for them there is usually a form, sometimes a call,
              occasionally a week. Nobody on the team experiences that gap,
              because everybody on the team already has an account.
            </p>
            <h3>Every field is asked before trust exists</h3>
            <p>
              A signup form asking for company size and a phone number is asking
              a stranger to pay a cost for a benefit they have not seen yet.
              Sometimes that is the right trade. Usually the field is there
              because sales asked for it, and nobody measured what it cost at
              the top of the funnel.
            </p>
            <h3>What this lens deliberately does not do</h3>
            <p>
              This is a narrow lens on purpose. It looks at time-to-value,
              friction, and how a two-sided market gets started — the parts of
              the early product approach that are documented and genuinely
              useful. It has no view on how that company was run, and it will
              not recommend dark patterns, hidden pricing, or manufactured
              urgency. Removing friction is not the same as removing honesty,
              and the second one costs you the customer a month later.
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
