// /pricing FAQ content: short plain-text answers from the pricing v8 spec
// (section 5, "FAQ"), with the per-site Care price read from
// ./site-agents-data.ts. Like the comparison table, the answers name only
// what the product has today; see components/pricing/pricing-data.ts.
// Kept in a server-safe module (no "use client") so the page can build the
// FAQPage JSON-LD from the same array the client <FaqSection> renders: one
// source of truth for both.

import type { FaqItem } from "@/components/home-2026/faq-data";
import { TIERS } from "@/components/pricing/pricing-data";
import { CARE_SITES_INCLUDED, SITE_AGENTS_PRICE_USD } from "./site-agents-data";

/** "Growth is $24 ($29 monthly) and Scale is $32 ($39 monthly)". */
const YEARLY_PRICES = TIERS.filter((tier) => !tier.customPrice && tier.monthlyPrice !== "0")
  .map((tier) => `${tier.name} is $${tier.annualPrice} ($${tier.monthlyPrice} monthly)`)
  .join(" and ");

export const PRICING_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Who needs a seat?",
    answer:
      "Only the people who run the work. Guests, clients and developers working in Asana, ClickUp or Monday are free.",
  },
  {
    question: "What is the difference between Watch and Care?",
    answer:
      `Every site is on Watch for free: uptime, Site Score and the top 2 issues. Care is $${SITE_AGENTS_PRICE_USD} per site a month and shows every issue, with diffs, verified fixes and a monthly client report.`,
  },
  {
    question: "How many Care sites are included?",
    answer:
      `Growth includes ${CARE_SITES_INCLUDED.growth} and Scale includes ${CARE_SITES_INCLUDED.scale}. Each extra site is $${SITE_AGENTS_PRICE_USD} a month.`,
  },
  {
    question: "Can I move a site between Watch and Care?",
    answer: "Yes. Watch to Care is instant. Care to Watch takes effect at the end of your billing cycle.",
  },
  {
    question: "Are there usage limits?",
    answer: "No. Growth covers sites up to 250 pages and Scale up to 500, raised on request.",
  },
  {
    question: "What counts as a site?",
    answer: "One domain with its www, staging and preview addresses. PDFs, videos and images are not sites.",
  },
  {
    question: "Is yearly billing cheaper?",
    answer: `Yes, two months free. Per seat per month, ${YEARLY_PRICES}.`,
  },
  {
    question: "How secure is Superflow?",
    answer: "SOC 2 Type II, audited every year, with data encrypted in transit and at rest.",
  },
];
