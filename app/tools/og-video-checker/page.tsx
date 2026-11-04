// Open Graph Video Checker.
//
// Server-backed, like the Favicon Checker and for the same reason: CORS stops
// a browser from reading another site's HTML, and it stops it from reading
// the status and first bytes of another origin's video. Both fetches happen on
// our side. The engine is lib/toolkit/og-video.ts, wrapped by the API route
// with the toolkit's SSRF guard, rate limit, and cache.
//
// The one thing that runs in the visitor's browser is the player, which loads
// the video straight from the site being checked.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { OgVideoTool } from "@/components/tools/og-video/OgVideoTool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { toolOgImage } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { OG_VIDEO_CHECKER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = OG_VIDEO_CHECKER_CONTENT;

const SLUG = "og-video-checker";
const PATH = `/tools/${SLUG}`;

const TITLE = OG_VIDEO_CHECKER_CONTENT.title;
const SUBHEAD = OG_VIDEO_CHECKER_CONTENT.subhead;
const DESCRIPTION = OG_VIDEO_CHECKER_CONTENT.description;

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Does Your og:video Play?`,
  description: DESCRIPTION,
  path: PATH,
  ogImage: toolOgImage(SLUG),
});

export default function OgVideoCheckerPage() {
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
        id="ld-og-video-checker-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-og-video-checker-faq"
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
          heading: "It plays today. Will it play after the next deploy?",
          body: "Superflow agents watch your live pages and tell you when a tag changes, a file stops loading, or a CDN rule quietly stops answering range requests.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The tag is the easy half</h3>
            <p>
              og:video is one line of markup, and every CMS and framework will
              write it for you. That is why checking for the tag tells you so
              little. The tag keeps saying the same thing after the file it
              points at has moved, after a redesign routes every unknown path to
              the app shell, and after somebody moves the videos behind a
              server that sends the whole file when asked for a piece. In each
              case the markup is perfect and the shared link is a still image.
            </p>
            <p>
              So this tool fetches the video. Not all of it: the first 512 KB,
              which is where a file says what it is. An MP4 starts with an ftyp
              box, a WebM with an EBML header, an HLS playlist with #EXTM3U, and
              an HTML page in a video costume with a doctype. We read that,
              rather than the file name or the Content-Type, and every check on
              the result is about a file we looked at.
            </p>
            <h3>Three readers, three sets of tags</h3>
            <p>
              The part people miss is that og:video is only read by some of the
              places a link gets shared. Facebook, LinkedIn, Discord, Slack and
              most chat apps read Open Graph. X does not read og:video at all:
              it plays video in a card only from twitter:card set to player and
              a twitter:player page. Google reads neither, and finds video from
              a VideoObject in the page&apos;s structured data. A page can do
              one of these perfectly and be a still image on the other two.
            </p>
            <h3>The failures that only show up on a phone</h3>
            <p>
              Two problems make up most of &quot;it works on my machine&quot;
              with video previews. The first is byte ranges. Safari asks for a
              video in pieces and will not play an MP4 from a server that
              answers with the whole thing, so a video that plays in Chrome on
              your laptop is a black box on every iPhone. We send the same kind
              of request and tell you what came back.
            </p>
            <p>
              The second is where the MP4 keeps its index. Exported the default
              way, many tools write it at the end, which means a player has to
              download the whole file before it can show a frame. On a fast
              office connection nobody notices. On a phone, the preview spins
              until the viewer scrolls past. The fix is one ffmpeg flag and no
              re-encode, and the check tells you whether you need it.
            </p>
            <h3>No new spec, same old copy-paste</h3>
            <p>
              The og:video spec on ogp.me has not had a new release. Its
              example still declares application/x-shockwave-flash, a format
              that stopped running at the end of 2020, and that line still turns
              up in production head tags because it was copied from there. The
              spec did not need to change for the platforms around it to stop
              forgiving it.
            </p>
          </>
        }
      >
        <OgVideoTool />
      </ToolPage>
    </>
  );
}
