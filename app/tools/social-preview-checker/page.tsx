// Social Preview Checker.
//
// Server-backed, like the Tech Stack Detector: reading another site's head
// tags from the visitor's browser is blocked by CORS, so the fetch happens on
// our side. The engine itself lives in the Superflow product backend, and the
// API route at /api/tools/social-preview is the seam.
//
// The one thing rendered in the visitor's browser is the preview images. They
// load straight from whichever host serves them, which is also why a broken
// og:image shows up here as a placeholder with words on it.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { SocialPreviewTool } from "@/components/tools/social-preview/SocialPreviewTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { SOCIAL_PREVIEW_CHECKER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = SOCIAL_PREVIEW_CHECKER_CONTENT;

const SLUG = "social-preview-checker";
const PATH = `/tools/${SLUG}`;

const TITLE = SOCIAL_PREVIEW_CHECKER_CONTENT.title;
const SUBHEAD = SOCIAL_PREVIEW_CHECKER_CONTENT.subhead;
const DESCRIPTION = SOCIAL_PREVIEW_CHECKER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: See Your Link Before You Post It`,
  description: DESCRIPTION,
  path: PATH,
});

export default function SocialPreviewCheckerPage() {
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
        id="ld-social-preview-checker-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-social-preview-checker-faq"
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
          heading: "The card is fine today. Will it be fine next deploy?",
          body: "Superflow agents watch your live pages and tell you when a tag changes, an image stops loading, or a title quietly grows past the length a platform will show.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Presence is not the question</h3>
            <p>
              Most preview checkers answer one question: are the tags there.
              That is the wrong question, because no platform reads all of them
              and no two read them in the same order. X looks for twitter:title
              first and falls back to og:title. Slack takes og:image, then
              twitter:image. LinkedIn reads og:description and then the meta
              description. Facebook cuts a title at about 88 characters. Google
              cuts one at about 60.
            </p>
            <p>
              So a page can carry a complete set of tags and still show six
              different things. The only useful answer is per platform: this is
              your headline on X, this is where it gets cut, and this is the tag
              it came from. That last part is what makes it fixable. Knowing
              your title is wrong helps less than knowing it came from
              twitter:title.
            </p>
            <h3>The twitter:card trap</h3>
            <p>
              Here is the most common version of the problem. You add a good
              1200 by 630 og:image. It looks right on LinkedIn and right in
              Slack. On X it renders as a small square thumbnail beside two
              lines of text, and it looks like an afterthought.
            </p>
            <p>
              Nothing is broken. X decides the layout from twitter:card, not
              from your image. Without twitter:card set to summary_large_image,
              X uses the small card no matter how good the picture is. It is one
              line in your head tag, and it is invisible to any check that only
              asks whether an image tag exists.
            </p>
            <h3>Google does not read Open Graph</h3>
            <p>
              The other half people miss is that Google does not use Open Graph
              for search snippets at all. It reads the title tag and the meta
              description. Teams that set og:title carefully and leave the title
              tag as whatever the CMS generated end up with a link that looks
              polished when shared and wrong in search results, which is where
              far more people will see it.
            </p>
            <p>
              That is why a search result sits alongside the share cards here.
              They are different systems reading different tags, and checking
              one tells you nothing about the other.
            </p>
            <h3>Check it before you post, not after</h3>
            <p>
              Platforms cache what they scraped. Once a bad card is out, editing
              your tags does not fix the post that is already live. Facebook and
              LinkedIn will re-scrape a URL on request. X and Slack mostly will
              not. So the check that counts is the one you run before you hit
              post, not the one you run after somebody replies to say the image
              is missing.
            </p>
          </>
        }
      >
        <SocialPreviewTool />
      </ToolPage>
    </>
  );
}
