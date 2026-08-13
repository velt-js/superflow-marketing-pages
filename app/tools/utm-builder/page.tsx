// UTM Builder.
//
// Client-side, like the Markdown Viewer and MD5. A campaign URL leaks more
// than people expect (unannounced launches, unsigned partners, private
// landing pages), and joining five strings does not need a server.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { UtmBuilder } from "@/components/tools/utm/UtmBuilder";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { UTM_BUILDER_CONTENT } from "@/lib/tools/content";

const { faq: FAQ, howItWorks: HOW_IT_WORKS } = UTM_BUILDER_CONTENT;

const SLUG = "utm-builder";
const PATH = `/tools/${SLUG}`;

const TITLE = "UTM Builder";
const SUBHEAD =
  "Build campaign URLs that follow one convention, and see which GA4 channel each link will land in before you send it.";
const DESCRIPTION =
  "Free UTM builder and campaign URL generator. Enforces a tagging convention across your team, shows the GA4 channel each link lands in, warns about the mistakes that break reporting, and builds links in bulk. Runs in your browser. No login, no ads.";



export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Campaign URL Generator`,
  description: DESCRIPTION,
  path: PATH,
});

export default function UtmBuilderPage() {
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
        id="ld-utm-builder-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-utm-builder-faq"
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
          heading: "Tagging the link is the easy half",
          body: "Superflow agents watch every page your campaigns point at, and tell you when the landing page changes, breaks, or quietly stops matching the ad.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Campaign reports break from consistency, not syntax</h3>
            <p>
              Every UTM builder joins five inputs with ampersands, and none of
              them get that wrong. What goes wrong is that one person types
              Facebook, another types facebook, and a third types FB. Analytics
              tools compare those as literal strings, so one campaign becomes
              three rows and every number is a third of what it should be.
            </p>
            <p>
              Nothing alerts you. The report looks fine. You find it months
              later while trying to work out why a channel underperformed, and
              by then the history cannot be fixed because the values are already
              written into collected data. This tool applies one convention to
              every value, shows you the tag it produced, and remembers the
              rules so the next person gets the same result.
            </p>
            <h3>The medium decides where your traffic goes</h3>
            <p>
              GA4 sorts traffic into channel groups, and for most of them the
              decision comes down to utm_medium matching a value Google
              recognises. Use email and you land in Email. Use newsletter and
              you land in Unassigned, which is a bucket nobody opens. The
              campaign ran, the clicks arrived, and the report says nothing
              happened.
            </p>
            <p>
              That rule is documented but almost never surfaced where you are
              actually typing. Here the channel appears under the medium field
              as you type it, so you find out while you can still change it
              instead of at the end of the quarter.
            </p>
            <h3>Two mistakes worth knowing about</h3>
            <p>
              The first is tagging internal links. A UTM on a link between two
              pages of your own site starts a fresh session and replaces the
              original source, so a visitor who came from a paid ad and clicked
              a tagged nav link is credited to the nav link. Paid spend
              disappears into internal traffic.
            </p>
            <p>
              The second is personal data. Putting an email address or a
              customer ID in utm_content is common in lifecycle email, and it
              breaks Google&apos;s terms. They can delete the data, and the
              deletion is not selective. This tool flags both before you send
              the link.
            </p>
          </>
        }
      >
        <UtmBuilder />
      </ToolPage>
    </>
  );
}
