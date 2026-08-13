// Alt Text Generator.
//
// Server-backed: reading another site's HTML from a visitor's browser is
// blocked by CORS, and the vision model call needs a key that never belongs
// in a browser. The API route at /api/tools/alt-text-generator holds the SSRF
// guard, the per-IP budget, and the 24 hour cache that keeps a shared link
// from paying for the model twice.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { AltTextTool } from "@/components/tools/alt-text/AltTextTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { ALT_TEXT_GENERATOR_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = ALT_TEXT_GENERATOR_CONTENT;

const SLUG = "alt-text-generator";
const PATH = `/tools/${SLUG}`;

const TITLE = ALT_TEXT_GENERATOR_CONTENT.title;
const SUBHEAD = ALT_TEXT_GENERATOR_CONTENT.subhead;
const DESCRIPTION = ALT_TEXT_GENERATOR_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Draft Alt Text For A Whole Page`,
  description: DESCRIPTION,
  path: PATH,
});

export default function AltTextGeneratorPage() {
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
        id="ld-alt-text-generator-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-alt-text-generator-faq"
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
          heading: "Alt text is one of a hundred things that slip.",
          body: "Superflow agents check every page you ship against your own rules, on every change, and tell you what broke before a customer finds it.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Alt text is contextual, which is why this gives you a draft</h3>
            <p>
              Take one photograph of a woman at a whiteboard. On a careers page
              it might be alt=&quot;Engineer sketching a system diagram during a
              design review&quot;. Wrapped in a link to a case study, the alt
              has to describe where the link goes, because that is what a
              screen reader announces when somebody tabs onto it. Sitting above
              a caption that already reads &quot;Our team in the Berlin
              office&quot;, the right answer might be an empty alt, because
              repeating the caption makes the page slower to listen to, not
              richer. Same image, three correct answers, and the difference is
              entirely context that lives outside the image file.
            </p>
            <p>
              A vision model sees the pixels. It does not see whether the image
              is the only content inside a link, what the paragraph beside it
              already said, or which detail in a chart is the one that matters
              to your argument. So this tool is honest about what it produces:
              a strong first draft for every image on a page, delivered in
              seconds instead of an afternoon, which you then read. For a
              product shot or a decorative texture the draft is usually the
              final answer. For a chart, a diagram, or a screenshot carrying
              meaning, the draft is a starting point and you are the one who
              knows what the image is there to say.
            </p>
            <h3>Empty alt is a correct answer, not a missing one</h3>
            <p>
              There are two ways an image can have no alt text and they are
              opposites. An image with no alt attribute at all is an accident:
              screen readers commonly fall back to announcing the file name,
              so a visitor hears &quot;hero underscore v3 final dot jpg&quot;
              read out letter by letter. An image with alt=&quot;&quot; is a
              decision: it tells assistive technology that this image is
              decorative and can be skipped entirely, which is exactly right
              for a background swirl, a spacer, or an icon sitting next to a
              label that already says the same word.
            </p>
            <p>
              Most alt text checkers flatten those two into one number and tell
              you to go fill in the blanks. Follow that advice and you end up
              describing every divider line on the page, which makes the site
              measurably worse to use with a screen reader than it was before
              you started. This tool keeps them apart. Missing alt is flagged
              in red as a bug. Empty alt is reported as what it is, a
              deliberate marker. And when the model judges an image decorative,
              you get &quot;this should stay empty&quot; instead of a sentence
              to paste in, because the most useful thing a tool can do there is
              leave it alone.
            </p>
          </>
        }
      >
        <AltTextTool />
      </ToolPage>
    </>
  );
}
