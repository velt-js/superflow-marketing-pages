// llms.txt Generator.
//
// Server-backed: this reads robots.txt, sitemaps, and a set of pages on the
// submitted site, none of which a browser is allowed to fetch cross origin.
// The API route wraps the shared generator engine that the in-product agent
// runs, through the free-tools start and poll contract.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { LlmsTxtTool } from "@/components/tools/llms-txt/LlmsTxtTool";
import { buildToolPageMetadata } from "@/app/_seo/tool-result-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { LLMS_TXT_GENERATOR_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = LLMS_TXT_GENERATOR_CONTENT;

const SLUG = "llms-txt-generator";
const PATH = `/tools/${SLUG}`;

const TITLE = LLMS_TXT_GENERATOR_CONTENT.title;
const SUBHEAD = LLMS_TXT_GENERATOR_CONTENT.subhead;
const DESCRIPTION = LLMS_TXT_GENERATOR_CONTENT.description;

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
    title: `${TITLE}: Build llms.txt and llms-full.txt Free`,
    description: DESCRIPTION,
    rawUrl: url,
  });
}

export default function LlmsTxtGeneratorPage() {
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
        id="ld-llms-txt-generator-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-llms-txt-generator-faq"
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
          heading: "The file is a snapshot. Your site is not.",
          body: "Superflow agents watch every page you ship and tell you when the content changes, so the picture an AI has of your site does not quietly go stale.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>What llms.txt actually is</h3>
            <p>
              It is a proposal, published at llmstxt.org, for a plain text file
              at your site root that tells a language model what your site
              contains. The format is deliberately small: one H1 with the site
              name, a blockquote summary, then H2 sections of Markdown links. A
              companion file, llms-full.txt, inlines the page content so a model
              can read the site without fetching anything.
            </p>
            <p>
              The idea it borrows from is robots.txt, which everyone
              understands. The difference matters though. robots.txt is honoured
              by every major crawler because search engines agreed to honour it
              over twenty five years. llms.txt has no such agreement behind it.
            </p>
            <h3>Be honest about what it does not do</h3>
            <p>
              No major AI provider has publicly committed to reading llms.txt.
              Publishing one does not get you into training data, does not get
              you cited in an answer, and does not rank you anywhere. Anyone
              selling it as an AI SEO technique is well ahead of the evidence.
              Some documentation platforms and AI coding tools do look for the
              file, which is a real if narrow audience.
            </p>
            <p>
              The honest case for publishing one is cheapness against odds, not
              certainty. The file takes minutes to produce and cannot harm you:
              it does not change how your site renders, does not affect search,
              and does not expose anything that is not already public. If the
              convention gains adoption you already have one. If it does not,
              you spent five minutes. That is a reasonable bet, and it is a
              different claim from the one usually made about it.
            </p>
            <h3>Why this generator does not use a model</h3>
            <p>
              Writing an index of your own site is a mechanical job. The titles
              are already your titles. The sections are already your URL paths.
              The content is already your content. Putting a language model in
              the middle of that would add cost, add latency, and add the one
              thing a site index must not have: variation between runs, and the
              possibility of a sentence about your site that nobody at your
              company wrote.
            </p>
            <p>
              So there is no model here. The output is a deterministic transform
              of your own inventory, which means two runs over an unchanged site
              produce the same bytes, and every line in the file traces back to
              something your site already said. Read it before you publish it,
              reorder the sections so the pages you care about come first, and
              delete anything that is noise. It is your file.
            </p>
          </>
        }
      >
        <LlmsTxtTool />
      </ToolPage>
    </>
  );
}
