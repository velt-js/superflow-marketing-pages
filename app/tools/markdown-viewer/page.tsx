// Markdown Viewer.
//
// The only tool in the suite with no server behind it at all. No API route, no
// cache, no share page. That is the product: "nothing leaves your browser" is
// a claim you can only make honestly if there is nowhere for it to go.
//
// It is also the read surface for Markdown for Agents. You generate the .md,
// you open it here to check it renders the way you expect.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { MarkdownViewer } from "@/components/tools/markdown/MarkdownViewer";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import type { ToolFaqItem } from "@/components/tools/ToolFaq";

const SLUG = "markdown-viewer";
const PATH = `/tools/${SLUG}`;

const TITLE = "Markdown Viewer";
const SUBHEAD =
  "Open and read any Markdown file. Paste it or drop it in, and it renders as you type. Nothing is uploaded.";
const DESCRIPTION =
  "Free online Markdown viewer and preview. Open .md files, paste Markdown, and read it rendered with tables, code blocks, and an outline. Runs entirely in your browser. No login, no ads, no upload.";

const FAQ: ToolFaqItem[] = [
  {
    question: "How do I open a .md file?",
    answer:
      "Click Open a .md file, or drag the file onto the panel. It is read by your browser and rendered on the spot. You can also paste Markdown straight into the left panel.",
  },
  {
    question: "Is my document uploaded anywhere?",
    answer:
      "No. There is no server behind this tool. The parser and the renderer both run in your browser, so the document never travels anywhere. You can turn off your network connection and the tool still works, which is the simplest way to check that claim for yourself.",
  },
  {
    question: "What Markdown does it support?",
    answer:
      "Headings, bold, italic, strikethrough, inline code, links, images, blockquotes, ordered and unordered lists including nesting, horizontal rules, fenced code blocks, and tables. Bare URLs become clickable without link syntax.",
  },
  {
    question: "Why does a link in my document not work?",
    answer:
      "Links are limited to http, https, mailto, in-page anchors, and site-relative paths. Anything else, including javascript: URLs, renders as plain text instead of a clickable link. A Markdown document can carry a script in a link, and a viewer that follows it would run a stranger's code in your browser.",
  },
  {
    question: "Can I use this to preview a README before pushing it?",
    answer:
      "Yes, and it is one of the more common reasons people reach for it. The rendering follows CommonMark, so what you see here is close to what GitHub will show. Platform-specific extensions like GitHub task lists and alert callouts are not rendered specially.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Two megabytes. Past that the browser starts to stutter while re-rendering on every keystroke, so the tool declines rather than locking up your tab.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Paste or drop",
    body: "Paste Markdown into the left panel, or drop a .md file anywhere on it.",
  },
  {
    title: "It renders as you type",
    body: "The preview updates on every keystroke, with tables, fenced code, and nested lists laid out properly.",
  },
  {
    title: "Nothing is sent anywhere",
    body: "Parsing and rendering both happen in your browser. There is no upload step because there is no server to upload to.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Open and Read .md Files Online`,
  description: DESCRIPTION,
  path: PATH,
});

export default function MarkdownViewerPage() {
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
        id="ld-markdown-viewer-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-markdown-viewer-faq"
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
          heading: "Markdown is how you talk to machines now",
          body: "Superflow agents watch every page of every site you ship, and tell you when the thing an AI reads stops matching the thing you published.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Why most online Markdown viewers upload your file</h3>
            <p>
              Because it is easier. Rendering Markdown on a server means one
              code path and a mature library. It also means your document sits
              in someone&apos;s request log, and for a draft contract, an
              unreleased changelog, or a postmortem with customer names in it,
              that is a worse trade than most people realise they are making.
            </p>
            <p>
              This tool parses and renders in your browser instead. There is no
              API route behind it and no network request that carries the
              document, so the privacy claim is a property of the architecture
              rather than a promise in a policy. Disconnect from the network and
              it still works.
            </p>
            <h3>The security problem nobody mentions</h3>
            <p>
              A Markdown document can contain a link pointing at a script, and a
              viewer that renders it as a normal link will happily run that
              script in your session the moment you click. The usual defence is
              to render to HTML and then sanitise, which works until the
              sanitiser config drifts.
            </p>
            <p>
              This one never produces HTML. The parser emits a token tree and
              the renderer turns those tokens into React elements, so every
              piece of your document reaches the page as escaped text. Links are
              separately limited to http, https, mailto, and anchors. An unsafe
              link renders as plain text rather than something you can click.
            </p>
            <h3>Reading Markdown is becoming the normal case</h3>
            <p>
              Markdown used to be a thing you wrote and then converted. It is
              now the format AI tools read, write, and hand back: model output,
              agent transcripts, generated documentation, the .md copies sites
              publish for answer engines. More of it arrives than gets authored,
              and a fast way to read a file you did not write is worth more than
              another editor.
            </p>
          </>
        }
      >
        <MarkdownViewer />
      </ToolPage>
    </>
  );
}
