// Markdown for Agents.
//
// Server-backed, like the AI Visibility Checker: reading another site's HTML
// from the visitor's browser is blocked by CORS, so the fetch has to happen on
// our side. The API route wraps the shared conversion engine that the
// in-product agent runs, through the free-tools start and poll contract.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { MarkdownForAgentsTool } from "@/components/tools/markdown-for-agents/MarkdownForAgentsTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { MARKDOWN_FOR_AGENTS_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = MARKDOWN_FOR_AGENTS_CONTENT;

const SLUG = "markdown-for-agents";
const PATH = `/tools/${SLUG}`;

const TITLE = MARKDOWN_FOR_AGENTS_CONTENT.title;
const SUBHEAD = MARKDOWN_FOR_AGENTS_CONTENT.subhead;
const DESCRIPTION = MARKDOWN_FOR_AGENTS_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Convert Any Page to Clean Markdown`,
  description: DESCRIPTION,
  path: PATH,
});

export default function MarkdownForAgentsPage() {
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
        id="ld-markdown-for-agents-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-markdown-for-agents-faq"
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
          heading: "Converting the page is the easy half",
          body: "Superflow agents read every page you ship, on every change, and tell you when the content an agent would see breaks, drifts, or quietly disappears.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Most of an HTML page is not content</h3>
            <p>
              Open the source of any marketing page and count what is actually
              words. There is a navigation menu, a cookie banner, a header, a
              footer, three analytics snippets, a chat widget, and several
              hundred lines of layout markup wrapped around a few hundred words
              of writing. A browser hides all of that. A language model reading
              the raw HTML does not.
            </p>
            <p>
              That has two costs. The obvious one is tokens: you pay for the
              markup, every time, in every request. The less obvious one is
              attention. A model given a page where the navigation menu is
              longer than the article has to work out which part you meant, and
              it does not always get that right. Strip the chrome and the
              signal to noise ratio changes completely.
            </p>
            <h3>Publishing a Markdown copy is becoming normal</h3>
            <p>
              The pattern is simple. Serve the same page twice: once as HTML for
              people, once as Markdown for machines, at the same path with a .md
              suffix, linked from the HTML with a rel=alternate tag. Several
              documentation platforms now do this by default. This site does it
              too, and you can check: add .md to the end of this page&apos;s URL
              and you get the machine copy.
            </p>
            <p>
              Nothing obliges an agent to prefer the Markdown, and no
              specification requires you to publish one. What makes it worth
              doing anyway is the cost. It is a build step, not a rewrite, and
              it removes any ambiguity about what your page says for the readers
              least equipped to work it out from markup.
            </p>
            <h3>What the conversion tells you about your own site</h3>
            <p>
              Run your own pages through this and read the output before you do
              anything with it. If it comes back nearly empty, your content is
              being assembled in the browser by JavaScript, and every AI crawler
              that skips JavaScript sees the same emptiness you are looking at.
              If the headings arrive in a strange order, your document outline
              is not the one your design implies. If a table converts to a
              wall of text, its markup is not really a table.
            </p>
            <p>
              None of those are visible when you look at the rendered page,
              because your browser is generous in ways a parser is not. The
              Markdown is what is left when the generosity is removed, which
              makes it a fairly honest report on how machine readable your page
              actually is.
            </p>
          </>
        }
      >
        <MarkdownForAgentsTool />
      </ToolPage>
    </>
  );
}
