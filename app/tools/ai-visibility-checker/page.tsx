import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { AI_VISIBILITY_CHECKER_CONTENT } from "@/lib/tools/content/ai-visibility-checker";
import { VisibilityTool } from "@/components/tools/ai-visibility/VisibilityTool";
import { readCachedReport } from "@/lib/tools/ai-visibility/cached";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { toolOgImage } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

// Copy lives in lib/tools/content so the page and the Markdown copy served at
// /tools/ai-visibility-checker.md read the same words. The FAQ is also the
// source for this page's FAQPage schema below, so all three stay in step.
const {
  title: TITLE,
  subhead: SUBHEAD,
  description: DESCRIPTION,
  faq: FAQ,
  howItWorks: HOW_IT_WORKS,
} = AI_VISIBILITY_CHECKER_CONTENT;

const SLUG = "ai-visibility-checker";
const PATH = `/tools/${SLUG}`;

/**
 * Metadata is different for the landing page and for a shared result.
 *
 * The landing page is indexable and targets the tool keywords. A URL carrying
 * `?url=` is somebody's shared report: it gets a score-specific title and Open
 * Graph card, and it is noindex, with the canonical pointing back at the bare
 * landing page so the score variants never compete with it in search.
 *
 * @param props - Route props. `searchParams` is a promise in Next 16.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}): Promise<Metadata> {
  try {
    const { url } = await searchParams;
    const cached = await readCachedReport(url);

    if (!cached) {
      return buildPageMetadata({
        title: `${TITLE}: Can AI Find Your Site?`,
        description: DESCRIPTION,
        path: PATH,
        ogImage: toolOgImage(SLUG),
      });
    }

    const { report } = cached;
    const cardUrl = new URL(`${SITE_URL}/api/tools/share-card`);
    cardUrl.searchParams.set("domain", report.hostname);
    cardUrl.searchParams.set("score", String(report.score));
    cardUrl.searchParams.set("grade", report.grade);

    return {
      ...buildPageMetadata({
        title: `${report.hostname} scores ${report.score}/100 for AI visibility`,
        description: `Grade ${report.grade}. See which AI crawlers can reach ${report.hostname}, how much of the page needs JavaScript, and what to fix.`,
        path: PATH,
        ogImage: cardUrl.toString(),
        noindex: true,
      }),
      // The canonical stays on the bare tool page: a result URL is a view of
      // that page, not a separate document worth indexing.
      alternates: { canonical: PATH },
    };
  } catch {
    return buildPageMetadata({
      title: `${TITLE}: Can AI Find Your Site?`,
      description: DESCRIPTION,
      path: PATH,
      ogImage: toolOgImage(SLUG),
    });
  }
}

export default async function AiVisibilityCheckerPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const cached = await readCachedReport(url);

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
        id="ld-ai-visibility-faq"
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
          heading: "This checked one page, once",
          body: "Superflow agents check every page of every site you ship, on every change, against your own QA rules. Your team approves, then your client signs off. No client login required.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Why AI visibility is not the same as SEO</h3>
            <p>
              For twenty years the job was to rank a page. An answer engine
              does something different. It reads your page, decides whether it
              answers the question in front of it, and quotes a passage back
              with a link. Ranking well is no longer the same as being quoted.
            </p>
            <p>
              Two differences matter most. The first is JavaScript. Googlebot
              renders it. Most AI crawlers do not. A site that scores well in
              every SEO tool can be almost invisible to ChatGPT, because the
              copy arrives in the browser rather than in the HTML. That is what
              the readability check measures, and it is the single most common
              reason a good-looking site scores badly here.
            </p>
            <p>
              The second is access. Everyone knows to check robots.txt. Almost
              nobody checks whether the CDN in front of the site is quietly
              returning 403 to AI crawlers. Cloudflare shipped a one-click
              toggle to block AI scrapers and a lot of people turned it on
              without realising it also removes them from AI answers. Your
              robots.txt says yes. Your edge says no. Nothing in your CMS
              tells you.
            </p>

            <h3>What we check, and why each one is on the list</h3>
            <p>
              <strong>Access, 35 points.</strong> Whether AI systems can reach
              you at all. We evaluate every crawler in our registry against
              your robots.txt, then fetch your page as GPTBot and compare the
              response to what a browser gets. We also check for llms.txt and a
              valid sitemap.
            </p>
            <p>
              <strong>Readability, 30 points.</strong> Whether they can read
              what they reach. We render your page in a real browser and
              compare it against the raw HTML to work out how much of your
              content only exists after JavaScript runs. We also check that
              your title and meta description are in the HTML rather than
              injected later.
            </p>
            <p>
              <strong>Structure, 25 points.</strong> Whether they can
              understand it. One H1, an outline that does not skip levels,
              structured data that actually parses, and content shaped like an
              answer rather than a brochure.
            </p>
            <p>
              <strong>Identity, 10 points.</strong> Whether they will cite you
              correctly. Organization schema, links to your official profiles,
              and a brand name that is consistent across your title, your
              schema, and your Open Graph tags.
            </p>

            <h3>Blocking AI crawlers is a real choice</h3>
            <p>
              Plenty of publishers block AI crawlers on purpose, and that is
              legitimate. It is also why we split the list in two. Blocking
              CCBot, Google-Extended, or Applebot-Extended keeps your writing
              out of training data and costs you nothing in AI answers. We
              report that as a warning with an explanation, never as a failure.
              Blocking OAI-SearchBot or PerplexityBot is different: those are
              the crawlers that decide whether you can be cited at all.
            </p>
          </>
        }
      >
        <VisibilityTool
          initialUrl={url ?? ""}
          initialReport={cached?.report ?? null}
          initialAgeSeconds={cached?.ageSeconds ?? 0}
        />
      </ToolPage>
    </>
  );
}
