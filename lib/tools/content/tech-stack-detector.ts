// Content for the tech-stack-detector tool.
//
// Read by both app/tools/tech-stack-detector/page.tsx and the .md copy
// served at /tools/tech-stack-detector.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const TECH_STACK_DETECTOR_CONTENT: ToolContent = {
  slug: "tech-stack-detector",
  title: "Tech Stack Detector",
  subhead:
    "Paste a URL and see the platform, theme, plugins, analytics, fonts, and hosting behind it, with the evidence for every claim.",
  description:
    "Free tech stack detector. Find out what any website is built with: platform, theme, plugins, analytics tags, fonts, and hosting. Every finding shows its evidence and confidence. No login, no ads.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We fetch that one page the way a browser would, following redirects and reading the response headers along the way.",
    },
    {
      title: "We match fingerprints",
      body: "The raw HTML and headers are checked against known signals for platforms, themes, plugins, analytics tags, fonts, and hosting.",
    },
    {
      title: "Read the evidence",
      body: "Every finding shows the exact signal it matched and how sure we are. Copy the raw JSON if you want the result in a script.",
    },
  ],
  faq: [
    {
      question: "How does the detection work?",
      answer:
        "We fetch the page once, the same way a browser would, and read the raw HTML and the response headers. Platforms, plugins, analytics tools, and CDNs leave fingerprints in both. A data-wf-site attribute means Webflow. A Shopify.theme object means Shopify. A cf-ray header means Cloudflare. Every finding names the exact signal it matched, so you can check our work.",
    },
    {
      question: "What do detected and likely mean?",
      answer:
        "Detected means the signal is a fingerprint only that product produces, like the __NEXT_DATA__ payload Next.js embeds in every page. Likely means the signal is strong but shareable, like assets served from a CDN hostname a platform uses but does not own. We show the difference instead of flattening both into one confident sounding list.",
    },
    {
      question: "The site definitely uses a tool this page did not find. Why?",
      answer:
        "The most common reason is Google Tag Manager. We read the HTML the server returns, and a tool injected at runtime by GTM or any other script loader is not in that HTML. You will still see GTM itself in the results, which is your cue that more may be loading behind it. The other reason is coverage: we only report fingerprints we can match reliably, so a tool outside our list will not appear.",
    },
    {
      question: "Why does it say the site blocked the request?",
      answer:
        "Some sites sit behind bot protection that answers automated requests with an error, usually HTTP 403. When that happens we say so instead of pretending the site uses nothing. The response headers can still reveal the CDN doing the blocking, and we show that. Trying again later sometimes works, because some protections rate limit rather than block outright.",
    },
    {
      question: "Is it OK to check a site I do not own?",
      answer:
        "The tool makes one ordinary page request, the same as opening the site in a browser. It does not crawl the site, log in, or probe anything beyond that single page and its response headers. Checking a competitor before a pitch or a site you are about to inherit is exactly what it is for.",
    },
    {
      question: "Do you store the URLs I check?",
      answer:
        "We cache each result for 24 hours, keyed on the URL, so repeat checks and shared links load instantly. Nothing is stored beyond that cache. No account, no email, and no history of what you checked.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        'Yes. Send a POST to /api/tools/tech-stack with a JSON body like {"url": "example.com"} and you get the same JSON the page renders, including the evidence strings. The limit is 60 runs per hour per IP. The copy JSON button on any result shows you the exact shape.',
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. One capped fetch of the page you submit, then fingerprint matching on the HTML and headers. Nothing runs in your browser except the form.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/tech-stack with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with an error field, never a bare 500.',
    },
    { label: "Rate limit", value: "60 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The detection result, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What a raw fetch can see",
      value:
        "The HTML the server returns and the response headers. That covers platform, theme, and plugin fingerprints, analytics snippets, font providers, and hosting or CDN signatures.",
    },
    {
      label: "What a raw fetch cannot see",
      value:
        "Anything injected at runtime by JavaScript, most commonly through Google Tag Manager. Pages behind bot protection that refuse automated requests. Anything past the first 5 MB of a very large page.",
    },
    {
      label: "Confidence levels",
      value:
        "Detected means a fingerprint unique to that product. Likely means a strong signal another product could share. Every finding carries its evidence string.",
    },
  ],
};
