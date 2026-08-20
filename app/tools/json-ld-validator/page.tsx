// JSON-LD Validator.
//
// Server-backed, like the AI Visibility Checker: the check needs the rendered
// DOM, and a browser cannot open somebody else's page and read it. The API
// route wraps the shared `json-ld-validator` engine in the product backend, so
// the free tool and the in-product agent run the same checks.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { JsonLdValidatorTool } from "@/components/tools/json-ld-validator/JsonLdValidatorTool";
import { buildToolPageMetadata } from "@/app/_seo/tool-result-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { JSON_LD_VALIDATOR_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = JSON_LD_VALIDATOR_CONTENT;

const SLUG = "json-ld-validator";
const PATH = `/tools/${SLUG}`;

const TITLE = JSON_LD_VALIDATOR_CONTENT.title;
const SUBHEAD = JSON_LD_VALIDATOR_CONTENT.subhead;
const DESCRIPTION = JSON_LD_VALIDATOR_CONTENT.description;

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
    title: `${TITLE}: Free Structured Data Checker`,
    description: DESCRIPTION,
    rawUrl: url,
  });
}

export default function JsonLdValidatorPage() {
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
        id="ld-json-ld-validator-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-json-ld-validator-faq"
        data={buildFaqPageSchema(
          FAQ.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
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
          heading: "Markup drifts every time someone edits a template",
          body: "Superflow agents check the structured data on every page you ship, on every change, and tell you the moment a block breaks or quietly disappears.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The two tools everyone uses answer half the question</h3>
            <p>
              Google&apos;s Rich Results Test answers exactly one thing: will
              this page get a rich result in Google search. It is authoritative
              on that, and it is silent on everything else. It will not tell you
              about a type Google has no rich result for, which is most of
              schema.org. It will not tell you that your markup describes a
              different product than your page does. It reports on the feature,
              not on the data.
            </p>
            <p>
              The schema.org validator answers the other half: is this legal
              vocabulary. Real types, real properties, correct nesting. It is
              the right tool for that and it is honest about its scope. But
              legality is a low bar. Two blocks can each be perfectly valid and
              still say different things about the same entity, and the
              validator has no reason to care, because it looks at one block at
              a time.
            </p>
            <h3>Nobody checks whether the page agrees with itself</h3>
            <p>
              That gap is where the expensive failures live. A page carries a
              Product block from the theme and another from a reviews app, and
              the two disagree about the price. An @id reference points at an
              Organization that was defined on a template that no longer
              renders, so the publisher field resolves to nothing. A recipe
              names a cook time in one block and a different one in another.
              Every one of those pages passes both standard validators. A
              consumer reading them has to pick a value, and the choice is not
              yours.
            </p>
            <p>
              This tool groups every check into four questions and shows you
              all four. Does it parse. Will it earn a rich result. Are the
              values in a format that survives. Do the blocks agree with each
              other. The first two are what the existing tools cover. The last
              two are why this one exists.
            </p>
            <h3>It reads the page a search engine reads</h3>
            <p>
              A large share of real structured data is not in the HTML the
              server sends. It is injected afterwards by a tag manager or an
              SEO plugin. A validator that only fetches the raw HTML will tell
              those sites they have no structured data at all, which is both
              wrong and alarming. We open the page in a browser first, because
              Googlebot runs JavaScript and that is the version that counts.
            </p>
            <p>
              The same reasoning cuts the other way for social previews, where
              the crawlers do not run JavaScript and checking the rendered DOM
              would flatter a broken page. Different consumers, different
              inputs. Knowing which one a tool used is part of knowing what its
              answer means.
            </p>
          </>
        }
      >
        <JsonLdValidatorTool />
      </ToolPage>
    </>
  );
}
