// Content for the robots-txt-ai-checker tool.
//
// Read by both app/tools/robots-txt-ai-checker/page.tsx and the .md copy served at
// /tools/robots-txt-ai-checker.md, so the two can never disagree.
//
// This tool's copy used to live as local constants in its page, which is why
// it had no Markdown copy while every other live tool did. The constants moved
// here unchanged; the page imports them back.

import type { ToolContent } from "./types";

export const ROBOTS_TXT_AI_CHECKER_CONTENT: ToolContent = {
  slug: "robots-txt-ai-checker",
  title: "robots.txt Tester for AI Crawlers",
  subhead: "Test your robots.txt against GPTBot, ClaudeBot, PerplexityBot, Googlebot, and every other crawler that decides whether AI can cite you.",
  description: "Free robots.txt tester built for AI crawlers. See which of GPTBot, ClaudeBot, PerplexityBot, Googlebot and Bingbot you allow, plus a CDN firewall test.",
  howItWorks: [
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
],
  faq: [
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
],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. robots.txt is fetched and parsed, then the page itself is requested with each crawler's real user agent, because a CDN-level block stops a crawler before robots.txt is ever read.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/robots-txt-ai-checker with a JSON body of {"url": "example.com"}. Returns the same report the page shows.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "How long a run takes",
      value:
        "Up to 75 seconds. A slow run answers with { status: \"pending\", runId } instead of a result: call again with just that runId to collect it. Collecting costs no rate-limit slot.",
    },
    {
      label: "Stored data",
      value:
        "The report, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "Every AI and search crawler that matters (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Googlebot, Bingbot and the rest) against the site's robots.txt, reporting which are allowed, which are blocked, and the exact rule that decided each verdict. Plus a live firewall test per crawler.",
    },
    {
      label: "Why the firewall test matters",
      value:
        "robots.txt is a request, not a gate. A CDN rule can return 403 to an AI crawler before robots.txt is read, so a site whose robots.txt says yes can still be invisible. This is the check almost nothing else runs.",
    },
    {
      label: "Related tool",
      value:
        "This is the access-scoped view. Use the AI Visibility Checker for the whole-page verdict, including readability and structure.",
    },
  ],
};
