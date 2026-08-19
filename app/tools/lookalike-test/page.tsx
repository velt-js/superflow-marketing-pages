// Lookalike Test.
//
// Server-backed: both the benchmark and the comparison live in the product
// backend as a built-in agent. The benchmark arrives one of two ways — a
// curated pack measured offline, or a live fingerprint of sites the visitor
// names — and the tool is explicit about which it used, because the live
// fingerprint reads raw HTML and cannot see a rendered page.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { ReviewTool } from "@/components/tools/review/ReviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { LOOKALIKE_TEST_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = LOOKALIKE_TEST_CONTENT;

const SLUG = "lookalike-test";
const PATH = `/tools/${SLUG}`;

const TITLE = LOOKALIKE_TEST_CONTENT.title;
const SUBHEAD = LOOKALIKE_TEST_CONTENT.subhead;
const DESCRIPTION = LOOKALIKE_TEST_CONTENT.description;

const PROVENANCE =
  "Your page is measured in full — text, markup, a screenshot, and the styles your browser resolved. Sites you name are read from their raw HTML, so their structure and copy are measured and their colours and type scale are not. The review will not compare against anything it did not measure.";

/**
 * The two extra inputs. Both optional: with neither, the backend falls back to
 * its default pack rather than refusing, so the form works as a bare URL box.
 */
const EXTRA_FIELDS = [
  {
    name: "compareUrls",
    label: "Sites to compare against",
    placeholder: "linear.app, stripe.com",
    hint: "Up to three, comma separated. Leave empty to use a curated benchmark.",
  },
  {
    name: "packId",
    label: "Or a benchmark pack",
    placeholder: "developer-tools",
    hint: "developer-tools or saas-marketing. Ignored when you name sites above.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Website Design Comparison`,
  description: DESCRIPTION,
  path: PATH,
});

export default function LookalikeTestPage() {
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
        id="ld-lookalike-test-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-lookalike-test-faq"
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
          heading: "The gap reopens every time someone ships a section",
          body: "Superflow agents review every page you ship against the standards your team holds, and leave what they find as comments on the page itself.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>&ldquo;Make it look like theirs&rdquo; is not a brief</h3>
            <p>
              Everyone has a site they admire, and almost nobody can say what
              they admire about it. The instinct is to name the visible things —
              the colours, the typeface, the gradient — which are the parts that
              transfer worst. Copy those and you get a page that looks derivative
              and still does not work, because what made the original work was
              never its palette.
            </p>
            <p>
              What actually transfers is structural. How many things the page
              claims to be. How long the hero runs before it stops. Whether one
              button is obviously the one to press. How many sections there are
              before the page ends. Those are countable, which means the
              difference between your page and theirs can be stated as a number
              rather than a feeling.
            </p>
            <h3>A difference, not a score</h3>
            <p>
              This tool does not grade you. A score would invite you to optimise
              it, and some of your differences are deliberate. What you get is
              the list with both numbers on it — your hero is sixty-one words,
              the benchmark runs twenty-one to thirty-eight — so you can decide
              which gaps you meant and which ones happened to you.
            </p>
            <h3>What we refuse to tell you</h3>
            <p>
              Every benchmark separates the patterns that transfer from the
              identity that does not, and the review is instructed never to
              recommend adopting a reference site&apos;s palette, typefaces,
              illustration style, or copy voice. If the honest read is that your
              own visual identity is stronger than the benchmark&apos;s, it will
              say so. A tool that turns every page into the same page is worse
              than no tool.
            </p>
            <h3>Being honest about what we measured</h3>
            <p>
              When you name a site, we read its markup rather than rendering it.
              That is enough to count its sections, its navigation, its hero
              length and its buttons, and it is not enough to see its colours or
              its type scale. Those fields come back marked{" "}
              <em>not measured</em>, and the review is forbidden from comparing
              against them. Curated packs were measured with a browser in
              advance, so they carry more. Either way, the side being reviewed —
              yours — is always measured properly.
            </p>
          </>
        }
      >
        <ReviewTool
          slug={SLUG}
          actionLabel="Compare my page"
          provenance={PROVENANCE}
          extraFields={EXTRA_FIELDS}
        />
      </ToolPage>
    </>
  );
}
