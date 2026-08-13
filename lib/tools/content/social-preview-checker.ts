// Content for the social-preview-checker tool.
//
// Read by both app/tools/social-preview-checker/page.tsx and the .md copy
// served at /tools/social-preview-checker.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const SOCIAL_PREVIEW_CHECKER_CONTENT: ToolContent = {
  slug: "social-preview-checker",
  title: "Social Preview Checker",
  subhead:
    "Paste a URL and see the card X, LinkedIn, Facebook, Slack, Discord, and Google will each build from it, with the tag behind every line.",
  description:
    "Free social preview checker. See how your link renders on X, LinkedIn, Facebook, Slack, Discord, and Google before you post it. Shows which tag each line came from, where the text gets cut, and what to fix. No login, no ads.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We fetch that one page the way a browser would and read the tags in its head. No login and no email.",
    },
    {
      title: "We apply each platform's own rules",
      body: "Every platform reads a different set of tags in a different order. We follow each one's order separately, so you get six answers rather than one.",
    },
    {
      title: "See the card, and the tag behind it",
      body: "Each preview shows where its title, description, and image came from, where the text will be cut, and what that platform will do differently.",
    },
  ],
  faq: [
    {
      question: "Why do the previews differ between platforms?",
      answer:
        "Because each platform reads a different set of tags in a different order. X looks for twitter:title before og:title. Slack reads og:image and then falls back to twitter:image. Google reads neither and uses the title tag and the meta description. So the useful question is not whether your tags are present. It is what each platform will actually show, which is what this tool answers.",
    },
    {
      question: "Why does X show a small card instead of a big image?",
      answer:
        "X decides the layout from twitter:card, not from your image. Without twitter:card set to summary_large_image, X uses the small summary layout even when og:image points at a perfect 1200 by 630 picture. It is one line in your head tag and it is the single most common reason a link looks great on LinkedIn and cramped on X.",
    },
    {
      question: "Does Google use Open Graph tags?",
      answer:
        "Not for search snippets. Google builds the snippet from the title tag and the meta description, and often rewrites the description from the page text if it thinks its own version answers the query better. That is why we show a search result alongside the share cards. A page can be perfect when shared and wrong in search, and nothing in a social preview tool that only models share cards would tell you.",
    },
    {
      question: "I fixed my tags and the preview has not changed. Why?",
      answer:
        "Platforms cache what they scraped, often for days. This tool reads your page live, so it shows the new tags straight away, but the platform is still serving its old copy. Facebook and LinkedIn both have a debugger that re-scrapes a URL on demand. For X and Slack the usual fix is to wait, or to add a harmless query string to the URL so it counts as a new link.",
    },
    {
      question: "What size should my og:image be?",
      answer:
        "1200 by 630 pixels is the size that works everywhere. Use an absolute https URL, not a relative path, because platforms fetch it from their own servers and a relative path resolves to nothing. Keep the file under about 5 MB. Every result here shows the real pixel size of the image once it loads, so you can check yours against that.",
    },
    {
      question: "Do you store the URLs I check?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so repeat checks and shared links load instantly. Nothing is stored beyond that cache. No account, no email, and no history of what you checked.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        'Yes. Send a POST to /api/tools/social-preview with a JSON body like {"url": "example.com"} and you get the same JSON the page renders, including the per-platform previews and the source tag for every field. The limit is 10 runs per hour per IP. The copy JSON button on any result shows you the exact shape.',
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. One fetch of the page you submit, then the tags in its head are read and each platform's rules applied. The preview images load in your browser straight from whichever host serves them, so we never store or proxy them.",
    },
    {
      label: "Platforms modelled",
      value:
        "X (Twitter), LinkedIn, Facebook, Slack, Discord, and Google search results. Each is modelled with its own tag order, its own character limits, and its own card layout.",
    },
    {
      label: "Rules last reviewed",
      value:
        "2026-08-12. Every result carries this date, so you can see whether the rules behind it are current before you act on them.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/social-preview with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The report, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "The tags in the head of the one page you submit: the title tag, the meta description, the canonical link, and the Open Graph and Twitter card tags. From those it works out the title, description, image, and layout each platform will use.",
    },
    {
      label: "What it does not check",
      value:
        "Whether the image itself is good, what is inside it, or where the links on the page go. It does not crawl the rest of the site, and it does not log in.",
    },
  ],
};
