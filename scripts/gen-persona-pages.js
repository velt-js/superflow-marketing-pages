// One-off generator for the three additional persona pages.
//
// The five persona pages differ only in their content constant, their sources
// list, and their "why this matters" essay. The first two are mechanical, so
// they are generated here rather than hand-copied five times; the essay is
// written per persona and lives in ESSAYS below.
//
// Kept in scripts/ rather than deleted so the next persona is a data entry
// rather than a copy-paste of 140 lines.

const fs = require('fs');
const path = require('path');

const ESSAYS = {
  'review-like-peter-thiel': `
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
            </p>`,

  'review-like-elon-musk': `
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
            </p>`,

  'review-like-travis-kalanick': `
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
            </p>`,
};

const SOURCES = {
  'review-like-peter-thiel': [
    { title: 'Zero to One (2014)', url: 'https://en.wikipedia.org/wiki/Zero_to_One' },
    {
      title: 'Competition Is for Losers, Wall Street Journal, 2014',
      url: 'https://www.wsj.com/articles/peter-thiel-competition-is-for-losers-1410535536',
    },
    {
      title: 'CS183: Startup — Stanford lecture notes, 2012',
      url: 'https://blakemasters.com/peter-thiels-cs183-startup',
    },
  ],
  'review-like-elon-musk': [
    {
      title: 'Starbase tour with Everyday Astronaut, 2021 — the five-step algorithm',
      url: 'https://www.youtube.com/watch?v=t705r8ICkRw',
    },
    {
      title: 'TED interview on first-principles reasoning',
      url: 'https://www.ted.com/talks/elon_musk_the_future_we_re_building_and_boring',
    },
  ],
  'review-like-travis-kalanick': [
    {
      title: 'Early Uber product history and the launch playbook (public reporting)',
      url: 'https://en.wikipedia.org/wiki/Uber',
    },
    {
      title: 'TED talk on the original product insight',
      url: 'https://www.ted.com/talks/travis_kalanick_uber_s_plan_to_get_more_people_into_fewer_cars',
    },
  ],
};

const CONSTANTS = {
  'review-like-peter-thiel': 'REVIEW_LIKE_PETER_THIEL_CONTENT',
  'review-like-elon-musk': 'REVIEW_LIKE_ELON_MUSK_CONTENT',
  'review-like-travis-kalanick': 'REVIEW_LIKE_TRAVIS_KALANICK_CONTENT',
};

const COMPONENTS = {
  'review-like-peter-thiel': 'PeterThielReviewPage',
  'review-like-elon-musk': 'ElonMuskReviewPage',
  'review-like-travis-kalanick': 'TravisKalanickReviewPage',
};

const FOOTER = {
  'review-like-peter-thiel': {
    heading: 'Positioning drifts every time someone edits a page',
    body: 'Superflow agents review the pages you ship on every change, against the standards your team actually holds, and leave the findings as comments on the page itself.',
  },
  'review-like-elon-musk': {
    heading: 'Pages accumulate. Nobody is assigned to delete',
    body: 'Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.',
  },
  'review-like-travis-kalanick': {
    heading: 'Friction gets added one field at a time',
    body: 'Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.',
  },
};

for (const slug of Object.keys(ESSAYS)) {
  const constant = CONSTANTS[slug];
  const component = COMPONENTS[slug];
  const sources = SOURCES[slug];
  const footer = FOOTER[slug];
  const idBase = slug.replace(/[^a-z]/g, '-');

  const file = `// ${component.replace('ReviewPage', '')} persona review page.
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
import { ${constant} } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = ${constant};

const SLUG = "${slug}";
const PATH = \`/tools/\${SLUG}\`;

const TITLE = ${constant}.title;
const SUBHEAD = ${constant}.subhead;
const DESCRIPTION = ${constant}.description;

/** Rendered under the result so the lens can be checked against its source. */
const SOURCES = ${JSON.stringify(sources, null, 2).replace(/"([a-z]+)":/g, '$1:').split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n')};

export const metadata: Metadata = buildPageMetadata({
  title: \`\${TITLE}: Free Landing Page Review\`,
  description: DESCRIPTION,
  path: PATH,
});

export default function ${component}() {
  return (
    <>
      <PageJsonLd
        name={\`\${TITLE} | Superflow\`}
        description={DESCRIPTION}
        path={PATH}
        trail={[
          { name: "Free tools", url: \`\${SITE_URL}/tools\` },
          { name: TITLE, url: \`\${SITE_URL}\${PATH}\` },
        ]}
      />
      <JsonLd
        id="ld-${idBase}-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-${idBase}-faq"
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
          heading: ${JSON.stringify(footer.heading)},
          body: ${JSON.stringify(footer.body)},
          linkText: "Start free",
        }}
        whyThisMatters={
          <>${ESSAYS[slug]}
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
`;

  const dir = path.join('app', 'tools', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), file);
  console.log('wrote', path.join(dir, 'page.tsx'));
}
