// JSON-LD Generator.
//
// Server-backed, and the only tool in the suite that spends money per run: a
// model reads the page and writes the block. The API route wraps the shared
// `json-ld-generator` engine in the product backend, which also runs the
// JSON-LD Validator's checks over its own output before returning it.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { JsonLdGeneratorTool } from "@/components/tools/json-ld-generator/JsonLdGeneratorTool";
import { buildToolPageMetadata } from "@/app/_seo/tool-result-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { JSON_LD_GENERATOR_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = JSON_LD_GENERATOR_CONTENT;

const SLUG = "json-ld-generator";
const PATH = `/tools/${SLUG}`;

const TITLE = JSON_LD_GENERATOR_CONTENT.title;
const SUBHEAD = JSON_LD_GENERATOR_CONTENT.subhead;
const DESCRIPTION = JSON_LD_GENERATOR_CONTENT.description;

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
    title: `${TITLE}: Free Schema Markup Generator`,
    description: DESCRIPTION,
    rawUrl: url,
  });
}

export default function JsonLdGeneratorPage() {
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
        id="ld-json-ld-generator-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-json-ld-generator-faq"
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
          heading: "Adding the markup is the easy part",
          body: "Superflow agents check the structured data on every page you ship, on every change, and tell you when a block breaks, contradicts the page, or quietly disappears.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The risk with generated markup is not that it is wrong</h3>
            <p>
              It is that it is confident. A language model asked to describe a
              product page will produce something that reads like a complete,
              professional block. The dangerous part is the property it had no
              way to know. If your page never states a rating, a model that
              fills in aggregateRating anyway has not made a small mistake. It
              has written a claim about your business that your own page
              contradicts.
            </p>
            <p>
              Search engines treat that as a specific category of problem.
              Structured data that does not match visible page content is a
              spam signal, and the manual action that follows applies to the
              site, not to the one page that carried the bad block. Sites have
              lost every rich result they had over an invented review count
              somebody pasted in from a generator without reading it. The cost
              of the mistake is wildly out of proportion to how easy it is to
              make.
            </p>
            <h3>So the engine is built to leave things out</h3>
            <p>
              The model behind this tool is instructed to describe only what
              the page actually says, and to omit any property it cannot
              support from the text in front of it. A sparser block that is
              true is worth more than a full one that is not. If you generate
              markup here and a property you expected is missing, that is
              usually the tool telling you something useful: the page does not
              state it anywhere a reader could see it either.
            </p>
            <p>
              Then the same checks that power our JSON-LD Validator run over
              the generated block before you ever see it. Generation and
              correctness are different problems, and a model can write
              something fluent that still misses a property Google requires or
              uses a date format that gets discarded on read. Running the
              validator afterwards moves that discovery from months later to
              before you paste.
            </p>
            <h3>Read it before you ship it</h3>
            <p>
              This is the part no tool can do for you. Structured data is a
              claim you are making to search engines and answer engines about
              your own site, in a format your visitors never see. Nobody else
              is going to notice if it is subtly wrong. Read the block, check
              that the type is the one you meant, and check that the
              description says what you would say. It takes a minute, and it is
              the difference between markup you have published and markup you
              have merely pasted.
            </p>
          </>
        }
      >
        <JsonLdGeneratorTool />
      </ToolPage>
    </>
  );
}
