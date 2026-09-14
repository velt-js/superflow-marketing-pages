// Content for the ai-visibility-checker tool.
//
// Read by both app/tools/ai-visibility-checker/page.tsx and the .md copy served at
// /tools/ai-visibility-checker.md, so the two can never disagree.
//
// This tool's copy used to live as local constants in its page, which is why
// it had no Markdown copy while every other live tool did. The constants moved
// here unchanged; the page imports them back.

import type { ToolContent } from "./types";

export const AI_VISIBILITY_CHECKER_CONTENT: ToolContent = {
  slug: "ai-visibility-checker",
  title: "AI Visibility Checker",
  subhead: "Paste a URL. See whether ChatGPT, Claude, Perplexity, and Google AI can actually reach and read your site, and exactly what to fix.",
  description: "Free AI visibility checker. Test whether ChatGPT, Claude, Perplexity, and Google AI can crawl and read your site. 12 checks, a 0 to 100 score, and platform-specific fixes. No login.",
  howItWorks: [
  {
    title: "Paste any URL",
    body: "No login and no email. We check that page plus your robots.txt, llms.txt, and sitemap.",
  },
  {
    title: "We check it as an AI crawler would",
    body: "We fetch your page twice, once as a browser and once as GPTBot, then render it to measure how much content needs JavaScript.",
  },
  {
    title: "Get a score and the fixes",
    body: "A 0 to 100 score, four category scores, and a fix for every failure with steps for your platform.",
  },
],
  faq: [
  {
    question: "What is an AI visibility score?",
    answer:
      "It is a 0 to 100 measure of how easily AI answer engines can reach, read, understand, and attribute your page. We run 12 checks across four groups: Access (can they reach you), Readability (can they read it), Structure (can they understand it), and Identity (will they cite you correctly). A pass earns full points, a warning earns half.",
  },
  {
    question: "Is this the same as an SEO audit?",
    answer:
      "No. Classic SEO assumes a crawler that renders JavaScript and ranks a list of links. AI answer engines mostly do not run JavaScript, and they quote a passage instead of ranking a page. So this tool checks things an SEO audit skips, like whether your CDN silently blocks GPTBot and how much of your copy disappears without JavaScript.",
  },
  {
    question: "Why does blocking GPTBot matter if I still allow Googlebot?",
    answer:
      "Because they feed different systems. Googlebot feeds Google Search and the AI Overviews built on it. OAI-SearchBot and ChatGPT-User are the only reason ChatGPT can find and cite you. Blocking one does not cover the other. Our results table lists each crawler, who runs it, and exactly what you lose by blocking it.",
  },
  {
    question: "Should I block AI crawlers to protect my content?",
    answer:
      "That is a real choice, and it is why we split the list in two. Training crawlers like CCBot, Google-Extended, and Applebot-Extended only collect data for model training, and blocking them costs you nothing in AI answers. Blocking answer crawlers removes you from the answers themselves. The tool never scores a training-crawler block as a failure.",
  },
  {
    question: "How many H1 tags should a page have?",
    answer:
      "Exactly one. The H1 is the strongest single signal of what a page is about, and more than one means there is no single answer to that question. We also check that heading levels do not skip, because an outline that jumps from H2 to H4 reads as ambiguous structure to anything parsing it as a hierarchy.",
  },
  {
    question: "Do you store the URLs I check?",
    answer:
      "We cache the result for 24 hours so a shared link loads instantly and a re-check is a deliberate click. We do not store your submitted URLs beyond that cache window, we do not require an email, and there is no signup wall on any result.",
  },
],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. The page is fetched twice, once as a browser and once as GPTBot, then rendered so the JavaScript dependency can be measured. robots.txt, llms.txt, and the sitemap are fetched separately.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/ai-visibility with a JSON body of {"url": "example.com"}. Returns the same report the page shows.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "How long a run takes",
      value:
        "Up to 75 seconds, because the page is really fetched and rendered. A slow run answers with { status: \"pending\", runId } instead of a result: call again with just that runId to collect it. Collecting costs no rate-limit slot.",
    },
    {
      label: "Stored data",
      value:
        "The report, cached for 24 hours keyed on the URL, so a shared link loads instantly. Nothing beyond that cache, and no email is required.",
    },
    {
      label: "What it checks",
      value:
        "Twelve checks in four groups. Access: robots.txt rules per AI crawler, a live firewall test that requests the page as GPTBot, llms.txt, and a valid sitemap. Readability: how much copy survives without JavaScript. Structure: heading hierarchy and structured data. Identity: author and publisher signals that decide whether a citation names you correctly.",
    },
    {
      label: "Scoring",
      value:
        "0 to 100 with a grade and a score per category. A pass earns full points, a warning half. A blocked TRAINING crawler (CCBot, Google-Extended, Applebot-Extended) is never scored as a failure: declining to be training data costs nothing in AI answers, and treating it as a fault would push sites into a choice they did not ask for.",
    },
    {
      label: "Related tool",
      value:
        "Use the robots.txt AI Checker when the question is only about crawler access. This tool is the whole-page verdict.",
    },
  ],
};
