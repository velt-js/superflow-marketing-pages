// /calculator FAQ content. Server-safe module (no "use client") so the
// page can build FAQPage JSON-LD from the same array the client
// <FaqSection> renders, matching the /pricing pattern.

import type { FaqItem } from "@/components/home-2026/faq-data";

export const CALCULATOR_FAQ_ITEMS: FaqItem[] = [
  {
    question: "How is the ROI calculated?",
    answer:
      "Assets reviewed per month times QA minutes per asset gives your monthly review hours. Superflow's agents take roughly 70% of that first pass, so those hours go back to your team. Hours back times your hourly billing rate, times twelve, is the yearly billings-recovered figure. Reviewer worth is the same hours expressed as full-time reviewers (160 hours per month).",
  },
  {
    question: "Where does the 70% come from?",
    answer:
      "It is the share of the manual first pass agents take over: checking links, spelling, brand consistency, and layout on every site change, desktop and mobile. Your team still makes every judgment call, which is the remaining share.",
  },
  {
    question: "What counts as an asset?",
    answer:
      "Anything your team checks before a client sees it: a web page, video, PDF, image, or Lottie file. If it goes through review, count it.",
  },
  {
    question: "What does Superflow cost against the recovered billings?",
    answer:
      "Per-seat plans start free, and every plan includes monthly AI credits. Agent scans are priced by scope — 1 credit ($0.40) for a page or asset, 5 for a small site, 10 for a medium one, and 1 for any rescan — and one-time add-on packs start at $10 for 25 credits. A busy agency spends tens of dollars a month on packs while the calculator shows five or six figures recovered per year.",
  },
  {
    question: "Does my whole team need paid seats?",
    answer:
      "No. You pay per team seat only. Guest users, including your clients and external reviewers, are free and unlimited on every plan.",
  },
];
