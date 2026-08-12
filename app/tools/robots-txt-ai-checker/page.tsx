// The robots.txt AI Checker: the same engine as the AI Visibility Checker,
// showing the Access group only, with its own copy and its own keywords.
//
// This is a sibling page, not a doorway. It answers a narrower question
// ("does my robots.txt block AI crawlers") completely, including the firewall
// test that a robots.txt file alone cannot tell you about, and its body copy
// is about robots.txt rather than a trimmed version of the parent page.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { VisibilityTool } from "@/components/tools/ai-visibility/VisibilityTool";
import { readCachedReport } from "@/lib/tools/ai-visibility/cached";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import type { ToolFaqItem } from "@/components/tools/ToolFaq";

const SLUG = "robots-txt-ai-checker";
const PATH = `/tools/${SLUG}`;

const TITLE = "robots.txt Tester for AI Crawlers";
const SUBHEAD =
  "Test your robots.txt against GPTBot, ClaudeBot, PerplexityBot, Googlebot, and every other crawler that decides whether AI can cite you.";
const DESCRIPTION =
  "Free robots.txt tester built for AI crawlers. See which of GPTBot, ClaudeBot, PerplexityBot, Googlebot, and Bingbot your robots.txt allows, plus a firewall test that catches CDN-level blocks. No login.";

const FAQ: ToolFaqItem[] = [
  {
    question: "How do I test if my robots.txt blocks GPTBot?",
    answer:
      "Paste your URL above. We fetch your robots.txt, parse it the way a real crawler does, and evaluate every AI user agent against the exact path you gave us. The results table shows each crawler, whether it is allowed or blocked, and which rule decided it.",
  },
  {
    question: "Why does my robots.txt look fine but AI still cannot read my site?",
    answer:
      "Almost always a firewall. Cloudflare and other CDNs ship one-click toggles that block AI crawlers at the edge, before the request ever reaches your server or your robots.txt. We test for this directly by requesting your page twice, once as a browser and once as GPTBot, and comparing the responses. Nothing in your CMS will show you this.",
  },
  {
    question: "What does Disallow: / actually block?",
    answer:
      "Everything on the site, for whichever user agent group it appears under. The subtlety is that a crawler follows exactly one group, the one whose User-agent token is the longest match for its name. So a Disallow: / under User-agent: * does not apply to GPTBot if there is also a User-agent: GPTBot group anywhere in the file, even an empty one.",
  },
  {
    question: "Does Allow beat Disallow?",
    answer:
      "Only when it is at least as specific. The longest matching path pattern wins regardless of the order the rules appear in, and when an Allow and a Disallow match with equal length, Allow wins. This is why adding Allow: / at the bottom of a file that starts with Disallow: / does unblock the site, and it is the rule most robots.txt checkers get backwards.",
  },
  {
    question: "Should I block AI crawlers in robots.txt?",
    answer:
      "It depends which ones. Blocking CCBot, Google-Extended, or Applebot-Extended keeps your content out of model training and costs you nothing in AI answers. Blocking OAI-SearchBot, ChatGPT-User, PerplexityBot, or Claude-SearchBot removes you from the answers themselves. Our table splits the two so you can make that call deliberately.",
  },
  {
    question: "Where does robots.txt have to live?",
    answer:
      "At the root of the domain, at /robots.txt exactly. Crawlers do not look anywhere else, and a robots.txt in a subdirectory does nothing. Each subdomain needs its own, so blog.example.com is not covered by the file at example.com.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Paste your URL",
    body: "We fetch the robots.txt at your domain root and parse it exactly the way a crawler does.",
  },
  {
    title: "We test every AI crawler",
    body: "Eleven answer engines and six training crawlers, each evaluated against the path you gave us, with the deciding rule shown.",
  },
  {
    title: "We test your firewall too",
    body: "We request your page as GPTBot and compare it to a browser request, because a CDN can block crawlers your robots.txt welcomes.",
  },
];

/**
 * Landing metadata when the page is opened cold, result metadata when it is
 * opened from a shared link. Same policy as the parent tool: results are
 * noindex and canonical back to this page.
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
        title: `${TITLE}: Test GPTBot, ClaudeBot and More`,
        description: DESCRIPTION,
        path: PATH,
      });
    }

    const access = cached.report.categories.find(
      (category) => category.id === "access",
    );
    const blocked = access?.failCount ?? 0;

    return {
      ...buildPageMetadata({
        title:
          blocked > 0
            ? `${cached.report.hostname} is blocking AI crawlers`
            : `${cached.report.hostname} allows AI crawlers`,
        description: `robots.txt and firewall test results for ${cached.report.hostname}.`,
        path: PATH,
        noindex: true,
      }),
      alternates: { canonical: PATH },
    };
  } catch {
    return buildPageMetadata({
      title: `${TITLE}: Test GPTBot, ClaudeBot and More`,
      description: DESCRIPTION,
      path: PATH,
    });
  }
}

export default async function RobotsTxtAiCheckerPage({
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
          { name: "robots.txt AI Checker", url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd
        id="ld-robots-checker-faq"
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
          heading: "One file, one page, one moment in time",
          body: "Superflow agents watch every page of every site you ship and catch the change that broke something, before your client does.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>The two ways a site blocks AI crawlers</h3>
            <p>
              The first is the one everybody knows: a rule in robots.txt. The
              second is the one that catches people out. A CDN can block
              crawlers at the edge, before the request reaches your server. Your
              robots.txt says come in. Cloudflare says no. Nothing in your CMS
              or your SEO plugin reports this, and the only way to find it is to
              send a request as a crawler and see what comes back. That is the
              firewall test on this page.
            </p>
            <p>
              This became common quickly. Cloudflare added a one-click block for
              AI scrapers and a lot of site owners turned it on, reasonably,
              without realising the same switch removes them from ChatGPT and
              Perplexity answers. If you have ever wondered why an AI assistant
              cannot see a site that is plainly public, this is usually why.
            </p>

            <h3>How crawlers actually read robots.txt</h3>
            <p>
              Three rules decide everything, and most checkers implement at
              least one of them wrong.
            </p>
            <p>
              <strong>One group applies, not all of them.</strong> A crawler
              picks the group whose <code>User-agent</code> token is the longest
              match for its own name, and follows only that group. Everything
              under <code>User-agent: *</code> is ignored the moment a more
              specific group for that crawler exists anywhere in the file. This
              is why adding an empty <code>User-agent: GPTBot</code> group
              accidentally unblocks GPTBot from every wildcard rule above it.
            </p>
            <p>
              <strong>The longest match wins, not the first.</strong> Rule order
              is irrelevant. <code>Disallow: /blog/</code> followed by{" "}
              <code>Allow: /blog/public/</code> allows the public folder,
              because that pattern is longer and therefore more specific.
            </p>
            <p>
              <strong>Ties go to Allow.</strong> When an Allow and a Disallow
              match a path with the same specificity, the Allow wins. An empty{" "}
              <code>Disallow:</code> means nothing is disallowed, not that
              everything is.
            </p>

            <h3>Which crawlers are worth allowing</h3>
            <p>
              We split them into two groups because the decision is different
              for each. Answer crawlers, like OAI-SearchBot, ChatGPT-User,
              Claude-SearchBot, PerplexityBot, Googlebot, and Bingbot, decide
              whether an AI system can find you and cite you. Training crawlers,
              like CCBot, Google-Extended, Applebot-Extended, and
              Meta-ExternalAgent, only collect data for model training.
            </p>
            <p>
              Blocking the second group is a legitimate editorial decision that
              costs you nothing in AI answers, and this tool reports it as a
              note rather than an error. Blocking the first group is the thing
              worth knowing about.
            </p>
          </>
        }
      >
        <VisibilityTool
          slug={SLUG}
          focus="access"
          submitLabel="Test my robots.txt"
          initialUrl={url ?? ""}
          initialReport={cached?.report ?? null}
          initialAgeSeconds={cached?.ageSeconds ?? 0}
        />
      </ToolPage>
    </>
  );
}
