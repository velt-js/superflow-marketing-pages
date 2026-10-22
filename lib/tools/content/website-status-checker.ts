// Content for the website-status-checker tool.
//
// Read by both app/tools/website-status-checker/page.tsx and the .md copy
// served at /tools/website-status-checker.md, so the two can never disagree.

import type { ToolContent } from "./types";

export const WEBSITE_STATUS_CHECKER_CONTENT: ToolContent = {
  slug: "website-status-checker",
  title: "Website Status Checker",
  subhead:
    "Is it down, or is it just you? Enter a URL and we load it from our servers right now and tell you whether the site is up.",
  description:
    "Free website status checker. Enter any URL and we request it live from our servers and report whether the site is up or down, with the HTTP status and response time.",
  howItWorks: [
    {
      title: "Enter any address",
      body: "A bare domain or a full URL with a path. We check the exact page you give us, so a broken checkout page shows as down even when the homepage is fine.",
    },
    {
      title: "We request it live",
      body: "Our server loads the page the moment you ask, following redirects the way a browser would. Nothing is cached: an answer from this morning is the wrong answer during an outage.",
    },
    {
      title: "Get a clear answer",
      body: "Up or down in the largest type on the page, with the HTTP status, the response time, where any redirect landed, and the exact time of the check. The result has its own link you can send to whoever needs to see it.",
    },
  ],
  faq: [
    {
      question: "What counts as up, and what counts as down?",
      answer:
        "Up means the server answered with any HTTP status below 500. That includes a 403 or a 404: bot protection and a missing page are not outages, the server is clearly there, and we show the status so you can judge. Down means a 5xx server error, no answer within 10 seconds, a refused connection, a domain that does not resolve, or a redirect chain that never landed.",
    },
    {
      question: "The site is down for me but you say it is up. Why?",
      answer:
        "Then it is probably just you, or just your network. We check from our own servers, so a problem on your Wi-Fi, your DNS resolver, a corporate proxy, or a browser extension does not reach us. Try the page from your phone on mobile data, or clear your DNS cache. If the site works for us and not for you, the fix is on your side of the connection.",
    },
    {
      question: "You say it is down but I can open it. Why?",
      answer:
        "A few things can make one request fail while another succeeds. The site may be geo-blocking or rate limiting our server's region. It may be mid-deploy and flapping. It may sit behind a firewall that blocks requests it does not recognise. Run the check again: if the verdict changes between runs, the site is unstable rather than down.",
    },
    {
      question: "Do you check http as well as https?",
      answer:
        "We try https first, because that is what a browser does. If the https connection is refused outright, we try http once. A timeout is not retried, because a host that is there and slow will not be faster on http.",
    },
    {
      question: "Does this monitor my site over time?",
      answer:
        "No. One check from one location is a snapshot, not a monitor. It answers the question you have right now. If you want to be told when your site goes down without asking, you want a monitoring service that checks on a schedule from several places and alerts you.",
    },
    {
      question: "Can I share the result?",
      answer:
        "Yes. Every result has its own address, /tools/website-status-checker/ followed by the host and path, and opening that address runs a fresh check. Send it to a colleague and they see the current state, not the state when you looked.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        'Yes. Send a POST to /api/tools/website-status-checker with a JSON body like {"url": "example.com"} and you get the same JSON the page renders: the verdict, the HTTP status, the response time, and the final URL. The limit is 60 runs per hour per IP.',
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    {
      label: "Where it runs",
      value:
        "On our server. One GET request to the URL you submit, following up to 5 redirects. Only the response headers are read; the page body is discarded after the first kilobyte.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/website-status-checker with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with an error field, never a bare 500.',
    },
    { label: "Rate limit", value: "60 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "Nothing. Results are not cached; every check is a fresh request. There is no history of what was checked.",
    },
    {
      label: "Verdict rule",
      value:
        "Up: any HTTP status below 500. Down: a 5xx response, no response within 10 seconds, a refused connection, an unresolvable domain, or a redirect chain that never landed.",
    },
    {
      label: "Limits",
      value:
        "One check from one location. Not a monitor: it does not repeat, record, or alert. Private, loopback, and link-local addresses are refused, and so is any redirect onto one.",
    },
  ],
};
